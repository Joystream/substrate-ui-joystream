import React from 'react';
import {calls, runtime, ss58Encode, bytesToHex} from 'oo7-substrate';
import {ReactiveComponent, If, Rdiv, Rspan, Pretty} from 'oo7-react';
import {strToHex, hexToStr} from './utils';

function decodeEnum(e) {
	return e.option
}

function vecu8ToStr(vecu8) {
	return hexToStr(bytesToHex(vecu8))
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
		if (kind === 'Approve') { 
			icon = 'check'
			color = 'green' 
		} else if (kind === 'Reject') { 
			icon = 'times'
			color = 'orange' 
		} else if (kind === 'Slash') { 
			icon = 'times'
			color = 'red' 
		} else if (kind === 'Abstention') { 
			icon = 'exclamation'
			color = '' 
		}
		let style = { marginRight: '.5rem', width: '7rem', textAlign: 'center' }
		return <i className={`ui ${color} label`} style={style}>
			<i className={`${icon} icon`}></i>
			{kind}
		</i>
	}

	readyRender() {
		let { votes } = this.state
		// console.log({ votes })
		return <div className="ui ordered list">{
			votes.map(vote => 
				<div className="item" style={{ padding: '.25rem' }}>
					{this.renderVoteKind(vote.kind)}
					by <code>{vote.voter}</code>
				</div>
			)
		}</div>
	}	
}

class Proposal extends ReactiveComponent {
	
	constructor() { 
        super([], {
			proposal: () => runtime.proposals.proposals(this.props.id).map(decodeProposal),
		});
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
		return <i className={`ui ${color} label`}>
			<i className={`${icon} icon`}></i>
			{kind}
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
					<div className="ui label">ID:<div className="detail">{proposal.id}</div></div>
					<div className="ui label">Votes:<div className="detail">TODO</div></div>
				</h3>
				<div className="description">
					<p style={{marginTop: '.5rem', fontSize: '1.1rem'}}>{proposal.description}</p>
					<p>
						Proposed by <b><code style={{ margin: '0 .25rem' }}>{proposal.proposer}</code></b> at block # <b>{proposal.proposed_at.toString()}</b>
					</p>
					<p>Council votes: <Votes proposalId={proposal.id} /></p>
				</div>
			</div>
		</div>
	}
}

export class Proposals extends ReactiveComponent {

	constructor() { 
        super([], {
			count: () => runtime.proposals.nextProposalId,
		});
	}

	render() {
		return <div>
			{/* <div>Proposal count: {this.state.count}</div> */}
			<div className="ui relaxed divided list">
				{ /* TODO iterate over all proposals here */ }
				<Proposal id={2}/>
			</div> 
		</div>
	}
}
