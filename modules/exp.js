module.exports = {
	init: function(sussylang){
		return 10
	},
	commands: {
		'init': function (sussy, args){
			sussy.add_code(`const express = require('express');`)
			sussy.add_code('app = express();')
		},
		'get': function (sussy, args){
			console.log(args)
			sussy.add_code(`app.get(${sussy.format(args[1])}, ${sussy.name}[${sussy.format(args[0])}],)`)
		},
		'send': function (sussy, args){
			console.log(args)
			sussy.add_code(`args[1].send(${sussy.format(args[0])})`)
		},
		'sendfile': function (sussy, args){
			sussy.add_code(`args[1].sendFile(__dirname + '/' + ${sussy.format(args[0])})`)
		},
		'listen': function (sussy, args){
			sussy.add_code(`app.listen(${sussy.format(args[0])}, ${sussy.name}[${sussy.format(args[1])}])`)
		}
	}
}
