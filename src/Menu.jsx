import React from 'react';
import { calls, runtime } from 'oo7-substrate';
import {ReactiveComponent} from 'oo7-react';
import {Menu} from 'semantic-ui-react';
import {MenuWallet} from './WalletList'

export class JoyMenu extends ReactiveComponent {

    constructor() {
        super([], {})
    }

    render() {
        return <div className="ui fixed inverted menu">
            <div className="ui container">
                <a href="#" className="header item">
                    <img className="logo"
                        style={{ width: '90px', margin: '1px .5rem 0 0' }}
                        src="https://www.joystream.org/images/joytream-logo-complete-white.svg" />
                    Sparta Testnet
                </a>
                <a href="#" className="item">Council</a>
                <a href="#" className="item">Proposals</a>
                <Menu.Item position='right'>
                    <MenuWallet/>
                </Menu.Item>
            </div>
        </div>
    }
}