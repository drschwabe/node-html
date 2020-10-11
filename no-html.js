const no = {}

no.html = (css, body, script) => {
	return `
<html>
<head>
	<style>
		${css ? css : '' }
	</style>
</head>
<body>
	${body ? body : ''}
	${script ? `<script src="${script}"></script>` : '' }
</body>
</html>
`
}

const fs = require('fs')
no.makeIndex = (path, html) => {
	if(!path) path = process.cwd() + '/index.html'
	if(!html) html = no.html()
	fs.writeFileSync(path, html )
}


const express = require('express')
no.server = port => {
	if(!port) port = 8000
	no.expressApp = express()
	no.expressApp.listen(port, () => console.log('http://localhost:' + port))
	return no.expressApp
}

const _s = require('underscore.string')
no.static = directory => {
	if(!directory) directory =  _s.strLeftBack( require.main.filename, '/' )
	no.expressApp.use(express.static(directory))
}

no.index = (html, port) => {
	if(!no.expressApp) no.server( port ? port : null )
	if(!html) html = no.html()
	//should autodetect if a client.bundle.js file is on fs
	no.expressApp.get('/', (req, res) => {
		res.send( html )
	})
}

//CSS:
const stringify = require('stringify')
stringify.registerWithRequire({
	appliesTo: {includeExtensions: ['.css']}
})
//^ the above tek let's us then require CSS below:
no.css = require('masscss')


//JQuery
const cheerio = require('cheerio') 
no.jquery = cheerio.load


//bundle...
const browserify = require('browserify')
const watchify = require('watchify')
const UglifyJS = require("uglify-js")

const path = require('path')

const compile = (watch, compress, clientJsName, bundleName) => {

	if(!clientJsName) clientJsName = 'client.js'
	if(!bundleName) bundleName = 'client.bundle.js'

	let directory = _s.strLeftBack( require.main.filename, '/' )
	let b = browserify({
		cache: {},
		packageCache: {},
		debug : true,
		basedir : directory,
		commondir : false
	})

	const bundle = () => {
		b.bundle( (err, buff) => {
			if(err) return console.warn(err)
			fs.writeFile(`${directory}/${bundleName}`,buff, (err) => {
				if(err) return console.warn(err)
				console.log(`wrote to ${bundleName}`)
				if(compress) {
					console.log('compressing...')
					let result = UglifyJS.minify(fs.readFileSync(`${directory}/${bundleName}`, 'utf8'))
					if (result.error) return console.error(result.error)
					fs.writeFileSync(`${directory}/${bundleName}`, result.code)
					console.log('done!')
				}
			})
		})
		.on('error', console.error)
	}

	if(watch) b.plugin(watchify)

	b.transform(stringify({
		extensions: [ '.html' , '.css', '.svg'],
	}), {
		global: true
	})
	b.add(`${directory}/${clientJsName}`)
	b.transform("babelify", {
		presets: ["@babel/preset-env"],
		sourceType : 'unambiguous',
		global: true,
		plugins: [["@babel/plugin-transform-runtime", {absoluteRuntime : true }]]
	})
	b.on('update', () => {
		console.log('writing new bundle...')
		bundle()
	})
	bundle()
}

no.watch = (...params) => compile(true, false, ...params)

no.compile = (...params) => compile(...params)

module.exports = no