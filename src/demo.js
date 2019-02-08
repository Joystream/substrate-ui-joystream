import {secretStore} from 'oo7-substrate';

// Use the next terminal command to generate accounts:
// $ subkey restore Member1
import DemoCreds from './demo-accounts.json'

export const DemoAccounts = Object.keys(DemoCreds)
    .map(name => Object.assign({ name }, DemoCreds[name]))

export function addDemoAccountsToWallet() {
    DemoAccounts.forEach(acc => {
        if (!secretStore().find(acc.address)) {
            secretStore().submit(acc.seed, acc.name)
        }
    })
}

export function removeDemoAccountsFromWallet() {
    DemoAccounts.forEach(acc => {
        secretStore().forget(acc.address)
    })
}

export function Alice() {
    return runtime.indices.ss58Decode('F7Gh')
}

export function Bob() {
    return runtime.indices.ss58Decode('5Gw3s7q4QLkSWwknsiPtjujPv3XM4Trxi5d4PgKMMk3gfGTE')
}

export function askAliceForTokens(toAddress, amount) {
    console.log('Ask Alice for tokens for', { toAddress, amount })
    let to = runtime.indices.ss58Decode(toAddress)
    post({
        sender: Alice(),
        call: calls.balances.transfer(to, amount)
    }).tie(console.log)
}
