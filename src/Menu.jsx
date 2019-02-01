import React from 'react';
import { calls, runtime } from 'oo7-substrate';
import { ReactiveComponent, If, Rdiv, Rspan } from 'oo7-react';

export class Menu extends ReactiveComponent {

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
            </div>
        </div>
    }
}