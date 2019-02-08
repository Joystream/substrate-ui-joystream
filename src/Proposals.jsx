import React from 'react';
import {Input, Button, Table, Icon, List, Label, Header, Segment} from 'semantic-ui-react';
import {calls, runtime, bytesToHex, pretty} from 'oo7-substrate';
import {Bond} from 'oo7';
import {ReactiveComponent, If, Rdiv, Rspan, Pretty} from 'oo7-react';
import Identicon from 'polkadot-identicon'
import {FileUploadBond} from './FileUploadBond.jsx';
import {strToHex, vecu8ToStr, nonEmptyStr, parseNumStr, myAccount, myAddress} from './utils';

function decodeEnum(e) {
	return e.option
}

function decodeProposal(proposal) {
	if (proposal) {
		proposal.proposer = shortAddr('0x' + bytesToHex(proposal.proposer))
		proposal.name = vecu8ToStr(proposal.name)
		proposal.description = vecu8ToStr(proposal.description)
		proposal.status = decodeEnum(proposal.status)
	}
	return proposal
}

function decodeVote(vote) {
	let res = {}
	console.log({ vote })
	if (vote) {
		let [ acc, kind ] = vote
		res = {
			voter: shortAddr('0x' + bytesToHex(acc)),
			kind: decodeEnum(kind),
		}
	}
	return res
}

class Votes extends ReactiveComponent {

	constructor() {
		super([], {
			votes: () => runtime.proposals
				.votesByProposal(this.props.proposalId)
				.map(votes => votes.map(decodeVote)),
		});
	}

	renderVoteKind(kind) {
		let icon = ''
		let color = ''
		let text = ''
		if (kind === 'Approve') {
			icon = 'check'
			color = 'green'
			text = 'Approved'
		} else if (kind === 'Reject') {
			icon = 'times'
			color = 'orange'
			text = 'Rejected'
		} else if (kind === 'Slash') {
			icon = 'times'
			color = 'red'
			text = 'Slashed'
		} else if (kind === 'Abstention') {
			icon = 'exclamation'
			color = ''
			text = 'Abstained'
		}
		let style = { margin: '0 .5rem', textAlign: 'center', border: 0 }
		return <i className={`ui basic ${color} label`} style={style}>
			<i className={`${icon} icon`}></i>{text}
		</i>
	}

	readyRender() {
		let { votes } = this.state
		// console.log({ votes })
		return <div className="ui list">{
			votes.map((vote, i) =>
				<div className="item" style={{ padding: '.25rem' }}>
					{i + 1})
					{this.renderVoteKind(vote.kind)}
					by <code>{vote.voter}</code>
				</div>
			)
		}</div>
	}
}

export class NewProposal extends ReactiveComponent {

	constructor() {
		super([], {})
		this.state = {
			stake: '',
			name: '',
			description: '',
			wasmCode: null,
			isWasmCodeValid: false,
			isFormValid: false,
		}
		this.wasmCode = new Bond;
		this.wasmCode.then(wasmCode => {
			// console.log({ wasmCode })
			let isWasmCodeValid = wasmCode && wasmCode.length > 0
			this.setState({ wasmCode, isWasmCodeValid }, this.validate)
		})
	}

	validate() {
		// console.log('Validate called, state:', this.state)
		let { stake, name, description, isWasmCodeValid } = this.state
		this.setState({
			isFormValid:
				nonEmptyStr(name)
				&& nonEmptyStr(description)
				&& parseNumStr(stake) > 0
				&& isWasmCodeValid
		})
	}

	onInputChange(inputs) {
		console.log('input updated:', inputs)
		this.setState(inputs, this.validate)
	}

	submitProposal(e) {
		e.preventDefault()

		let { stake, name, description, wasmCode } = this.state
		let call = calls.proposals.createProposal(
			parseInt(stake), strToHex(name), strToHex(description), wasmCode);

		post({ sender: myAccount(), call }).tie(console.log)

		// TODO show good UX feedback when proposal successfully created.
		// TODO clear form on successful creation
	}

	readyRender() {
		return <form className="ui form" onSubmit={e => this.submitProposal(e)}>
			<div className="fields">
				<div className="eleven wide field">
					<label>Proposal name:</label>
					<input type="text" name="name"
						onChange={e => this.onInputChange({ name: e.target.value })} />
				</div>
				<div className="five wide field">
					<label>Your stake:</label>
					<input type="text" name="stake" placeholder="e.g. 123"
						onChange={e => this.onInputChange({ stake: e.target.value })} />
				</div>
			</div>
			<div className="field">
				<label>Full description:</label>
				<textarea rows="3" name="description"
					placeholder="Provide full description of your proposal: new features, improvements, bug fixes etc."
					onChange={e => this.onInputChange({ description: e.target.value })} />
			</div>
			<div className="field">
				<FileUploadBond bond={this.wasmCode} content='Select WASM code of new runtime' />
			</div>
			<button className="ui large blue button" type="submit"
				disabled={!this.state.isFormValid}>Submit proposal</button>
		</form>
	}
}

class Proposal extends ReactiveComponent {

	constructor() {
		super([], {
			proposal: () => runtime.proposals
				.proposals(this.props.id)
				.map(decodeProposal),
		});
	}

	submitVote(voteKind) {
		let { id } = this.props
		let vote = { option: voteKind, _type: "VoteKind" }
		let call = calls.proposals.voteOnProposal(id, vote)

		post({ sender: myAccount(), call }).tie(console.log)

		// TODO show good UX feedback when vote submitted successfully.
		// TODO hide voting buttons
	}

	renderStatus(kind) {
		let icon = ''
		let color = ''
		if (kind === 'Pending') {
			icon = 'bullhorn'
			color = 'blue'
		} else if (kind === 'Approved') {
			icon = 'check'
			color = 'green'
		} else if (kind === 'Rejected') {
			icon = 'times'
			color = 'orange'
		} else if (kind === 'Slashed') {
			icon = 'times'
			color = 'red'
		} else if (kind === 'Cancelled') {
			icon = 'trash alternate'
			color = 'grey'
		} else if (kind === 'Expired') {
			icon = 'history'
			color = 'grey'
		}
		return <i className={`ui basic ${color} label`}>
			<i className={`${icon} icon`}></i>{kind}
		</i>
	}

	readyRender() {
		let { proposal } = this.state
		console.log({ proposal })
		return <div className="item">
			<div className="content">
				{/* <div className="header">Proposal #{proposal.id}</div> */}
				<h3 className="header">
					<span style={{marginRight: '1rem'}}>{proposal.name}</span>
					{this.renderStatus(proposal.status)}
					<div className="ui basic label">ID:<div className="detail">{proposal.id}</div></div>
					<div className="ui basic label">Votes:<div className="detail">TODO</div></div>
				</h3>
				<div className="description">
					<div style={{marginTop: '.5rem', fontSize: '1.1rem'}}>{proposal.description}</div>
					<div>
						Proposed by <b><code style={{ margin: '0 .25rem' }}>{proposal.proposer}</code></b> at block # <b>{proposal.proposed_at.toString()}</b>
					</div>
					<div>
						<h4 className="header">Your vote:</h4>

						<div><em>TODO don't show voting buttons if you are not a councilor</em></div>

						<button className="ui green button"
							onClick={e => this.submitVote('Approve')}>
							<i className="ui check icon"></i>Approve</button>

						<button className="ui orange button"
							onClick={e => this.submitVote('Reject')}>
							<i className="ui times icon"></i>Reject</button>

						<button className="ui red button"
							onClick={e => this.submitVote('Slash')}>
							<i className="ui times icon"></i>Slash</button>

						<button className="ui grey button"
							onClick={e => this.submitVote('Abstention')}>
							<i className="ui exclamation icon"></i>Abstain</button>
					</div>
					<div>
						<h4 className="header">Progress:</h4>
						<div>TODO show how many approval votes out of quorum recived so far.</div>
						<div>TODO Expires in N blocks</div>
					</div>
					<div>
						<h4 className="header">Casted council votes:</h4>
						<Votes proposalId={proposal.id} />
					</div>
				</div>
			</div>
		</div>
	}
}

export class Proposals extends ReactiveComponent {

	constructor() {
		super([], {
			loaded: false,
			ids: [],
			count: () => runtime.proposals.proposalCount
				.then(count => {
					let ids = []
					for (let i = 1; count && i <= count; i++) {
						ids.push(i)
					}
					let updates = { ids }
					if (!this.state.loaded) {
						updates.loaded = true
					}
					this.setState(updates)
				}),
		});
	}

	readyRender() {
		let { loaded, ids } = this.state
		if (!loaded) return <em>Checking for proposals...</em>
		else if (ids.length === 0) return <Segment><em>No proposals created yet</em></Segment>
		else if (ids.length > 0)
			return <div>{ids.map(id =>
				<Segment><Proposal id={id} /></Segment>)
			}</div>
	}
}

// TODO move next code to Election.jsx

function decodeElectionStage(stage) {
	let res = {}
	console.log('Election stage:', stage)
	if (stage) {
		let { option, value } = stage
		res = {
			kind: option,
			endsAt: value.valueOf(),
		}
	}
	console.log('Election stage (decoded):', res)
	return res
}

export class Election extends ReactiveComponent {

	constructor() {
		super([], {
			loaded: false,
			ids: [],
			stage: () => runtime.election.stage
				.map(decodeElectionStage),
			round: () => runtime.election.round,
			height: () => chain.height,
			applicants: () => runtime.election.applicants.map(ids => {
				return ids.map(id => {
					console.log('Applicant id:', id)
					return runtime.indices.ss58Encode(id).map(addr => {
						console.log('Applicant addr:', addr)
						runtime.election.applicantStakes(id).then(stake => {
							console.log('Applicant stake:', stake)
							let { stakes } = this.state
							stakes[addr] = stake
							this.setState({ stakes })
						})
						return secretStore().find(addr) || {
							account: id,
							address: addr,
						}
					})
				})
			}),
		})
		this.state = {
			stakes: {}, // applicants' stakes
			stake: '',
			isFormValid: false,
		}
		this.announceCandidacy = this.announceCandidacy.bind(this)
		this.voteFor = this.voteFor.bind(this)
	}

	onInputChange(inputs) {
		console.log('Input updated:', inputs)
		this.setState(inputs, this.validate)
	}

	validate() {
		// console.log('Validate called, state:', this.state)
		let { stake } = this.state
		this.setState({
			isFormValid: parseNumStr(stake) > 0
		})
	}

	announceCandidacy() {
		if (!this.isAnnouncingStage()) {
			console.log('Can announce a candidacy only during announcing stage')
			return
		}

		if (!myAccount()) {
			console.log('You are not logged in')
			return
		}

		let { stake } = this.state
		post({
			sender: myAccount(),
			call: calls.election.announceCandidacy(parseInt(stake))
		}).tie(console.log)
	}

	renderStage() {
		let { stage, height } = this.state
		return !stage ? null : <div>
			<div><b>Stage:</b> {stage.kind}</div>
			<div><b>Block left:</b> {stage.endsAt - height}</div>
		</div>
	}

	isAnnouncingStage() {
		return this.isStage('Announcing')
	}

	isVotingStage() {
		return this.isStage('Voting')
	}

	isRevealingStage() {
		return this.isStage('Revealing')
	}

	isStage() {
		let { stage } = this.state
		return stage && stage.kind === 'Announcing'
	}

	renderAnnounceCandidacy() {
		return !this.isAnnouncingStage() ? null : <div style={{marginTop: '1rem'}}>
			My stake: <Input action={
				<button className="ui large blue button"
					type='submit'
					disabled={!this.state.isFormValid}
					onClick={this.announceCandidacy}>Announce my candidacy</button>
				}
				onChange={e => this.onInputChange({ stake: e.target.value })}
				placeholder='My stake, ex: 123'
  			/>
		</div>
	}

	voteFor(candidateId) {
		// TODO impl
		console.log('Not implemented yet')
	}

	renderApplicantsTable() {
		let { applicants, stakes } = this.state
		// TODO sort applicants by stake desc
		return <Table celled selectable compact>
		<Table.Header>
		  <Table.Row>
			<Table.HeaderCell>#</Table.HeaderCell>
			<Table.HeaderCell>Account id.</Table.HeaderCell>
			<Table.HeaderCell>New stake</Table.HeaderCell>
			<Table.HeaderCell>Reused stake</Table.HeaderCell>
			<Table.HeaderCell style={{width: '1%'}}>Actions</Table.HeaderCell>
		  </Table.Row>
		</Table.Header>

		<Table.Body>
			{applicants.map((x, i) => {
				let stake = stakes[x.address]
				console.log('stake of', x.address, '=', stake)
				return !stake ? null : <Table.Row>
					<Table.Cell>{i+1}</Table.Cell>
					<Table.Cell>
						<span className='ui avatar image' style={{minWidth: '36px'}}>
							<Identicon account={x.account} />
						</span>
						{ x.name && <b>{x.name} </b>}
						{x.address}
					</Table.Cell>
					<Table.Cell>{pretty(stake.new)}</Table.Cell>
					<Table.Cell>{pretty(stake.transferred)}</Table.Cell>
					<Table.Cell>
						<Input action={
							<Button size='small' onClick={() => this.voteFor(x.account)}>Vote</Button>
							}
							onChange={e => this.onInputChange({ stake: e.target.value })}
							placeholder='My stake, ex: 123'
						/>
					</Table.Cell>
				</Table.Row>
			})}
		</Table.Body>
		</Table>
	}

	readyRender() {
		let { round, applicants } = this.state
		return <div>
			{this.renderStage()}
			<div><b>Round:</b> {round}</div>
			<div>{this.renderAnnounceCandidacy()}</div>
			<h3>Applicants ({applicants.length})</h3>
			{this.renderApplicantsTable()}
		</div>
	}
}
