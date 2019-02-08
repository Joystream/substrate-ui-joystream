import React from 'react';
import {List, Icon, Button, Label, Popup, Menu, Modal, Dropdown, Header} from 'semantic-ui-react';
import {ReactiveComponent, Pretty, If} from 'oo7-react';
import {runtime, secretStore, pretty} from 'oo7-substrate';
import Identicon from 'polkadot-identicon';
import {myAccount, myAddress} from './utils';
import {addDemoAccountsToWallet, removeDemoAccountsFromWallet, askAliceForTokens} from './demo'

export class SecretItem extends ReactiveComponent {
	constructor () {
		super()

		this.state = {
			display: null
		}
	}

	render () {
		let that = this
		let toggle = () => {
			let display = that.state.display
			switch (display) {
				case null:
					display = 'seed'
					break
				case 'seed':
					if (Math.random() < 0.1) {
						display = 'phrase'
						break
					}
				default:
					display = null
			}
			that.setState({ display })
		}
		return this.state.display === 'phrase'
			? <Label
				basic
				icon='privacy'
				onClick={toggle}
				content='Seed phrase'
				detail={this.props.phrase}
			/>
			: this.state.display === 'seed'
			? <Label
				basic
				icon='key'
				onClick={toggle}
				content='Validator seed'
				detail={'0x' + bytesToHex(this.props.seed)}
			/>
			: <Popup trigger={<Icon
				circular
				name='eye slash'
				onClick={toggle}
			/>} content='Click to uncover seed/secret' />
	}
}

export class WalletList extends ReactiveComponent {
	constructor () {
		super([], {
			secretStore: secretStore(),
			shortForm: secretStore().map(ss => {
				let r = {}
				ss.keys.forEach(key => r[key.name] = runtime.indices.ss58Encode(runtime.indices.tryIndex(key.account)))
				return r
			})
		})
	}

	readyRender () {
		return <List divided verticalAlign='bottom' style={{padding: '0 0 4px 4px', overflow: 'auto', maxHeight: '20em'}}>{
			this.state.secretStore.keys.map(key =>
				<List.Item key={key.name}>
					<List.Content floated='right'>
						<SecretItem phrase={key.phrase} seed={key.seed}/>
						<Button size='small' onClick={() => secretStore().forget(key)}>Delete</Button>
					</List.Content>
					<span className='ui avatar image' style={{minWidth: '36px'}}>
						<Identicon account={key.account} />
					</span>
					<List.Content>
						<List.Header>{key.name}</List.Header>
						<List.Description>
							{this.state.shortForm[key.name]}
						</List.Description>
					</List.Content>
				</List.Item>
			)
		}</List>
	}
}

export class MenuWallet extends ReactiveComponent {

	constructor() {
		super([], {
			secretStore: secretStore(),
			details: secretStore().map(ss => {
				let r = {}
				ss.keys.forEach(key => {
					r[key.name] = {
						shortForm: runtime.indices.ss58Encode(
						runtime.indices.tryIndex(key.account)),
						balance: runtime.balances.balance(key.account),
					}
				})
				return r
			}),
		})
		this.state = {
			// balances: {},
			selected: null,
			modalOpen: false,
		}
		this.selectAccount = this.selectAccount.bind(this)
		this.openModal = this.openModal.bind(this)
		this.closeModal = this.closeModal.bind(this)
	}

	openModal() {
		this.setState({ modalOpen: true })
	}

	closeModal() {
		this.setState({ modalOpen: false })
	}

	selectAccount(account) {
		console.log('Select an account:', account)

		// TODO use Redux or React's Context
		window.ME = account
		this.setState({ selected: account })

		this.closeModal()
	}

	renderModalWallet() {
		return <Modal closeIcon open={this.state.modalOpen}
			onOpen={this.openModal} onClose={this.closeModal}>
		<Modal.Header style={{ backgroundColor: '#f5f5f5' }}>
			<Header>
				<Button floated='right' inverted color='red' onClick={removeDemoAccountsFromWallet}>Forget demo accounts</Button>

				<Button floated='right' inverted color='green' onClick={addDemoAccountsToWallet}>Import demo accounts</Button>

				<Icon name='key' />
				<Header.Content>
					Wallet
					<Header.Subheader>Manage your secret keys</Header.Subheader>
				</Header.Content>
			</Header>
		</Modal.Header>
		<Modal.Content scrolling style={{ padding: 0 }}>
		  <Modal.Description>
			{this.renderAccountList()}
		  </Modal.Description>
		</Modal.Content>
	  </Modal>
	}

	renderWalletButton({ inverted }) {
		return <Button basic inverted={inverted} size='small' onClick={this.openModal}>Wallet</Button>
	}

	renderAccountList() {
		let accounts = this.state.secretStore.keys
		return <List divided selection verticalAlign='bottom' style={{padding: '0 0 4px 4px', overflow: 'auto'}}>
			{accounts.map(account =>
				this.renderAccountItem({ account, showSelect: true, showDelete: true })
			)}
		</List>
	}

	isSelectedAccount(otherAddr) {
		return myAddress() === otherAddr
	}

	renderAccountItem({ account, inverted, showSelect, showDelete, showWallet }) {
		let details = this.state.details[account.name]
		let isMe = this.isSelectedAccount(account.address)
		// console.log('Account details:', details)
		return !details ? null : <List.Item key={account.name} style={{backgroundColor: showSelect && isMe ? '#fff8e1' : ''}}>
			<List.Content floated='right'>
				<SecretItem phrase={account.phrase} seed={account.seed}/>

				{ showSelect && (isMe ? <b style={{padding: '5px 10px'}}>Selected</b> :
				<Button basic inverted={inverted} size='small'
				onClick={() => this.selectAccount(account)}>Select</Button>) }

				{ <Button basic inverted={inverted} size='small'
				onClick={() => askAliceForTokens(account.address, 2500)}>Give tokens</Button> }

				{ showDelete && <Button basic inverted={inverted} size='small'
				onClick={() => secretStore().forget(account)}>Delete</Button> }

				{ showWallet && this.renderWalletButton({ inverted })}
			</List.Content>
			<span className='ui avatar image' style={{minWidth: '36px'}}>
				<Identicon account={account.account} />
			</span>
			<List.Content>
				<List.Header>
					{account.name}
				</List.Header>
				<List.Description>
					{details.shortForm}
					<div>Balance: {pretty(details.balance)}</div>
				</List.Description>
			</List.Content>
		</List.Item>
	}

	renderSelectedAccount() {
		let { selected } = this.state
		return !selected ?
			<div>
				<em style={{ marginRight: '.5rem' }}>Select an account from</em>
				{this.renderWalletButton({ inverted: true })}
			</div> :
			<List inverted verticalAlign='bottom' style={{padding: '0 0 4px 4px', overflow: 'auto'}}>
				{this.renderAccountItem({ account: selected, inverted: true, showWallet: true })}
			</List>
	}

	readyRender() {
		return <div>
			{this.renderModalWallet({ inverted: true })}
			{this.renderSelectedAccount()}
		</div>
	}
}
