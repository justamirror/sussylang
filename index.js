const fs = require('fs')

function format(s){
				if (typeof s === 'undefined'){
					return ''
				} else if (s.type==='str'){
					return '"'+s.value.replace('"', '\\"').replace("'", "\\'")+'"'
				} else if (s.type === 'int'){
					return s.value.toString()
				} else if (s.type==='var'){
					return `sussy.stack[${s.value}]`
				} else if (s.type==='arg'){
					return `args[${s.value}]`
				}
}
cheatsheet = {
	'String byte sep': '䷢',
	'Argument sep': '䷢䷢',
	'Numbers, string bytes and command': 'ඞ',
	'Example': `(ඞඞ)[COMMAND IN]䷢䷢(ඞ)[NUMBER 1]`
}
module.exports = sussylang = {
	sep: "䷢",
	amogus: "ඞ",
	varamogus: "ඩ",
	argsamogus: 'ඪ',
	error: function error(text){
		console.error(`\x1b[31m\x1b[1m${text}\x1b[0m`)
		return {'error': true, 'text':text}
	},
	check: /[^\sඞ䷢ඩ \n]/,
	chunk: function(code){
		var code = code.replace(sussylang.check, '')
		var funcs = code.split(sussylang.sep+sussylang.sep+sussylang.sep)
		var splcommands = []
		for (var i = 0; i < funcs.length; i++) {
			var commands = funcs[i].split('\n')
			splcommands[i] = []
			for (var i2 = 0; i2 < commands.length; i2++) {
				commands[i2] = commands[i2].replace(/ /, '')
				splcommands[i][splcommands[i].length] = commands[i2].split(sussylang.sep+sussylang.sep)
			}
		}
		return splcommands
	},
	compile_file: function(filename, requiring){
		return sussylang.compile(fs.readFileSync(__dirname+'/'+filename).toString(), undefined, undefined, requiring)
	},
	compile_headless: function(code, sindent, name, requiring){
		if (typeof sindent==='undefined') sindent = ''
		if (typeof name==='undefined') name = 'main'
		if (typeof requiring==='undefined') requiring = true
		name = name.replace(/[^a-zA-Z0-9_]/g, '')
		name = 'sussy.modules.'+name
		sussycompat =  {
			'out': function(){call_op(1, ...arguments)},
			'in': function(){call_op(2, ...arguments)},
			'set': function(){call_op(3, ...arguments)},
			'add': function(){call_op(4, ...arguments)},
			'gotosub': function(){call_op(5, ...arguments)},
			'gotosubif': function(){call_op(6, ...arguments)},
			'sub': function(){call_op(7, ...arguments)},
			'include': function(){call_op(8, ...arguments)},
			'express': function(){call_op(10, ...arguments)},
			'add_code': (code)=>{
				compcode+=`\n${indent}`+code
			},
			'format': format,
			'name': name,
		}
		
		function call_op(n){
			console.log(arguments)
			args = [...arguments].slice(1)
			for (var i=0; i < args.length; i++) {
				console.log(args[i])
				if (typeof args[i] === 'string') args[i] = {'type': 'str', 'value': args[i]}
				else if (typeof args[i] === 'number') args[i] = {'type': 'int', 'value': args[i]}
			}
			compcode = opcode[n](args, compcode)
		}
		var labels = sussylang.chunk(code)
		var compcode = `${sindent}${name} = function(){`
		var opcode = {
			1: (args, compcode)=>{return compcode+`\n${indent}sussy.out(${format(args[0])});`},
			2: (args, compcode)=>{return compcode+`\n${indent}sussy.stack[sussy.stack.length] = sussy.in(${format(args[0])})`},
			3: (args, compcode)=>{return compcode+`\n${indent}sussy.set(${format(args[0])}, ${format(args[1])})`},
			4: (args, compcode)=>{return compcode+`\n${indent}sussy.add(${format(args[0])}, ${format(args[1])})`},
			5: (args, compcode)=>{
				console.log(args)
				if (args[0]['type']==='int'){
					console.log(labels.length)
					if (args[0]['value']<labels.length){
						return compcode+`\n${indent}${name}[${format(args[0])}]()`
					}
				} else if (!(typeof args[0]==='undefined') & args[1]['type']==='int'){
					if (!requiring){
						return sussylang.error('UHOH: Require is NOT enabled.')
					}
					return compcode+`\n${indent}sussy.modules[${format(args[0])}][${format(args[1])}]()`
				} else {
					return sussylang.error('HOWDOIPROCESSTHIS: Invaild inputs for command call.')
				}
			}, 
			6: (args, compcode)=>{
				if (args[0]['type']==='int' & args[0]['value']<labels.length){
					if (args[2].value===1) var op = '<'
					else if (args[2].value===2) var op = '==='
					else if (args[2].value===3) var op = '>'
					return compcode+`\n${indent}if (${format(args[1])} ${op} ${format(args[3])}) ${name}[${format(args[0])}]()`
				}
			},
			7: (args, compcode)=>{return compcode+`\n${indent}sussy.sub(${format(args[0])}, ${format(args[1])})`},
			8: (args, compcode)=>{
				if (!requiring){
					return sussylang.error('UHOH: Require is NOT enabled.')
				}
				if (typeof args[0]==='undefined'){
					return sussylang.error('SUS: Include? Include WHAT????')
				} else if (!(args[0].type === 'str')){
					return sussylang.error('SUS: Including a non string??? what.')
				}
			if (args[0].value.endsWith('.js')){
				var mod = require("./"+args[0].value)
				function handle(args){
					mod.commands[args[0].value](sussycompat, args.splice(1))
				}
				opcode[mod.init(sussylang)] = handle
				return compcode
			} else return compcode+sussylang.compile_headless(fs.readFileSync(__dirname+'/'+args[0].value).toString(), indent, args[0].value.split('.')[0]).text+'\n'
			},

		}
		for (var li = 0; li < labels.length; li++) {
			var commands = labels[li]
			compcode+=`\n	${sindent}${name}[${li}] = function(...args){`
			var indent = sindent+'		'
		for (var i = 0; i < commands.length; i++) {
			if (commands[i][0]==='' & commands[i].length===1) continue
			var command = commands[i][0].length
			var unargs = commands[i].slice(1)
			var args = []

			// convert args to numbers and strings
			for (var i2 = 0; i2 < unargs.length; i2++) {
				unargs[i2] = unargs[i2].replace(' ','')
				if (unargs[i2][0]===sussylang.varamogus) {
					args[args.length] =  {'type': 'var', 'value': unargs[i2].length-1}
				} else if (unargs[i2][0]===sussylang.argsamogus) {
					args[args.length] =  {'type': 'arg', 'value': unargs[i2].length-1}
				} else if (unargs[i2].includes(sussylang.sep)){
					var sp = unargs[i2].split(sussylang.sep)
					var s = []
					for (var i3 = 0; i3 < sp.length-1; i3++) {
						s[s.length] = sp[i3].length-1
					}
					args[args.length] = {'type': 'str', 'value': String.fromCharCode(...s)}
				} else {
					args[args.length] = {'type': 'int', 'value': unargs[i2].length}
				}
			}
			
			var result = opcode[command](args, compcode, indent)
			if (typeof result==='object'){
				return result
			} else if (typeof result==='string'){
				compcode = result
			}
		}
		compcode+=`\n	${sindent}};`
		}
		
		compcode+=`
	${sindent}${name}[0]()
${sindent}};
${sindent}${name}()`
		return {'error': false, 'text': compcode}
	},
	compile: function(code, in_, out, requiring){
		if (typeof in_ === 'undefined') in_ = 'require("prompt-sync")({ sigint: true })'
		if (typeof out === 'undefined') out = 'console.log'
		var head = `sussy = {
		out: ${out},
		in: ${in_},
		modules: {},
		set:(i,v)=>{
			sussy.stack[i-1] = v
		},
		add:(i,v)=>{
			sussy.stack[i-1] += v
		}, 
		sub:(i,v)=>{
			sussy.stack[i-1] -= v
		}, 
		stack: []
};\n\n`
	var result = sussylang.compile_headless(code, undefined, undefined, requiring)
	if (!result.error){
		result.text = head+result.text
	}
	return result
	},
	console: function (){
		const config = JSON.parse(fs.readFileSync('console.json').toString())
		r = RegExp(/\\ /g)
		var prompt = require("prompt-sync")({ sigint: true })
		eval(sussylang.compile('', 'prompt').text)
		if (config.import_and_export.auto){
			sussy.stack = JSON.parse(fs.readFileSync(config.import_and_export.filename).toString())
		}
		while (true){
			uncomp = prompt('>>> ')
			if (!uncomp.startsWith('$')){
				code = sussylang.compile_headless(uncomp)
				if (code.error){
					console.error(code.text)
				} else {
					try{
						eval(code.text)
					} catch (e){
						console.error(e)
					}
				}
			} else {
				command = uncomp.slice(1).replace(r, '$ANTISPACESPLIT').split(' ')
				for (let i = 0; i < command.length; i++) {
					command[i] = command[i].replace(/\$ANTISPACESPLIT/g, ' ')
				}
				args = command.slice(1)
				command = command[0]
				if (command=='exit'){
					break
				} else if (command=='stack'){
					console.log(sussy.stack.join('\n'))
				} else if (command=='run'){
					code = sussylang.compile_file(args[0])
					if (!code.error){
						try{
							eval(code.text)
						} catch (e){
							console.error(e)
						}
					} else {
						console.error(code.text)
					}
				} else if (command=='export') {
					if (typeof args[0] == 'undefined'){
						args[0] = config.import_and_export.filename
					}
					fs.writeFileSync(args[0], JSON.stringify(sussy.stack))
				}
			}
		}

		if (config.import_and_export.auto){
			fs.writeFileSync(config.import_and_export.filename, JSON.stringify(sussy.stack))
		}
	}
}
function texttosus(text){
	var conv = ''
	for (var i = 0; i < text.length; i++) {
		conv+="ඞ".repeat(text.charCodeAt(i)+1)+"䷢"
	}
	return conv
}
sussylang.console()