module.exports = sussylang = {
	sep: "䷢",
	amogus: "ඞ",
	varamogus: "ඩ",
	error: function error(text){
		console.error(`\x1b[31m\x1b[1m${text}\x1b[0m`)
		return {'error': true, 'text':text}
	},
	check: /[^\sඞ䷢ඩ\|]/,
	chunk: function(code){
		var code = code.replace(sussylang.check, '')
		var funcs = code.split(sussylang.sep+sussylang.sep+sussylang.sep+sussylang.sep)
		var splcommands = []
		for (var i = 0; i < funcs.length; i++) {
			var commands = funcs[i].split(sussylang.sep+sussylang.sep+sussylang.sep)
			splcommands[i] = []
			for (var i2 = 0; i2 < commands.length; i2++) {
				commands[i2] = commands[i2].replace(/\|/, '')
				splcommands[i][splcommands[i].length] = commands[i2].split(sussylang.sep+sussylang.sep)
			}
		}
		return splcommands
	},
	compile: function(code, in_='(require("prompt-sync")({ sigint: true }))', out='console.log'){
		var labels = sussylang.chunk(code)
		var compcode = `sussy = {
		out: ${out},
		in: ${in_},
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
};\n
function main(){`

		for (var li = 0; li < labels.length; li++) {
			var commands = labels[li]
			compcode+=`\n	function LABEL_${li}(){`
			var indent = '		'
		for (var i = 0; i < commands.length; i++) {
			var command = commands[i][0].length
			var unargs = commands[i].slice(1)
			var args = []

			// convert args to numbers and strings
			for (var i2 = 0; i2 < unargs.length; i2++) {
				unargs[i2] = unargs[i2].replace(' ','')
				if (unargs[i2][0]===sussylang.varamogus) {
					args[args.length] =  {'type': 'var', 'value': unargs[i2].length-1}
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
			
			function format(s){
				if (typeof s === 'undefined'){
					return ''
				} else if (s.type==='str'){
					return '"'+s.value.replace('"', '\\"').replace("'", "\\'")+'"'
				} else if (s.type === 'int'){
					return s.value.toString()
				} else if (s.type==='var'){
					return `sussy.stack[${s.value}]`
				}
			}
			if (command===1){
				compcode+=`\n${indent}sussy.out(${format(args[0])});`
			} else if (command===2){
				compcode+=`\n${indent}sussy.stack[sussy.stack.length] = sussy.in(${format(args[0])})`
			} else if (command===3){
				compcode+=`\n${indent}sussy.set(${format(args[0])}, ${format(args[1])})`
			} else if (command===4){
				compcode+=`\n${indent}sussy.add(${format(args[0])}, ${format(args[1])})`
			} else if (command===5){
				if (args[0]['type']==='int' & args[0]['value']<labels.length){
					compcode+=`\n${indent}LABEL_${format(args[0])}()`
				} else {
					return sussylang.error(`SUS: Trying to call a label that doesnt exist. XSS eh?`)
				}
			} else if (command===6){
				if (args[0]['type']==='int' & args[0]['value']<labels.length){
					if (args[2].value===1) var op = '<'
					else if (args[2].value===2) var op = '==='
					else if (args[2].value===3) var op = '>'
					compcode+=`\n${indent}if (${format(args[1])} ${op} ${format(args[3])}) LABEL_${format(args[0])}()`
				} else {
					return sussylang.error(`SUS: Trying to call a label that doesnt exist. XSS eh?`)
				}
			} else if (command===7){
				compcode+=`\n${indent}sussy.sub(${format(args[0])}, ${format(args[1])})`
			}
		}
		compcode+=`\n	};`
		}
		compcode+=`
	LABEL_0()
};
main()`
		return {'error': false, 'text': compcode}
	},
}
function texttosus(text){
	var conv = ''
	for (var i = 0; i < text.length; i++) {
		conv+="ඞ".repeat(text.charCodeAt(i)+1)+"䷢"
	}
	return conv
}
// 104 101 108 108 111 032 119 111 114 108 100 aka hello world
// var code = sussylang.compile('ඞඞ䷢䷢䷢ඞ䷢䷢ඩ')
// console.log(code, 'ready')
// eval(code)