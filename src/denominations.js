const { setNetworkDefault, denominationInfo: { init } } = require('oo7-substrate')

setNetworkDefault(42)

init({
	denominations: {
		joy: 15,
	},
	primary: 'joy',
	unit: 'gem',
	ticker: 'JOY'
})

/*
init({
	denominations: {
		bbq: 15,
	},
	primary: 'bbq',
	unit: 'birch',
	ticker: 'BBQ'
})
*/

/*const denominationInfoDOT = {
	denominations: {
		dot: 15,
		point: 12,
		µdot: 9,
	},
	primary: 'dot',
	unit: 'planck',
	ticker: 'DOT'
}*/
