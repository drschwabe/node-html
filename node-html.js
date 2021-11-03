const no = {}

no.html = (css, body, script) => {
	if(!css) {
		css = ''
	} else if(css.search('.css') && css.search('{') === -1) {
		css = `<link href="${css}" rel="stylesheet">`
	} else {
		css = `<style>${css}</style>`
	}
	return `
<html>
<head>
	<meta charset="utf-8" />
	${css}
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

no.makeHTML = (pathAndFileName, html) => {
	if(!pathAndFileName) return console.error('path and filename required')
	if(!html) html = no.html()
	fs.writeFileSync(pathAndFileName, html)
}

const express = require('express')
no.server = port => {
	if(!port) port = 8000
	no.expressApp = express()
	no.expressApp.listen(port, () => console.log('http://localhost:' + port))
	return no.expressApp
}

const _s = require('underscore.string')
no.static = (route, directory) => {
	if(!route) route = '/'
	if(!directory) directory =  _s.strLeftBack( require.main.filename, '/' )
	//TODO: start express app if not already started.
	no.expressApp.use(route, express.static(directory))
}

no.index = (html, port) => {
	let newExpressServer 
	if(!no.expressApp) {
		newExpressServer = no.server( port ? port : null )
	}
	if(!html) html = no.html()
	//should autodetect if a client.bundle.js file is on fs
	no.expressApp.get('/', (req, res) => {
		res.send( html )
	})
	if(newExpressServer) return newExpressServer
}
no.serveIndex = no.index //< alias

//CSS:
const stringify = require('stringify')
stringify.registerWithRequire({
	appliesTo: {includeExtensions: ['.css']}
})
//^ the above tek let's us then require CSS below:

const path = require('path')
const tailwindModulePath = require.resolve('tailwindcss')
const tailwindDistPath = path.resolve( tailwindModulePath, '../../dist/')
no.css = require(tailwindDistPath + '/tailwind.min.css' )

//JQuery
const cheerio = require('cheerio') 
no.jquery = cheerio.load
no.jQuery = cheerio.load //< alias; common spelling variant.

//bundle...
const browserify = require('browserify')
const watchify = require('watchify')
const UglifyJS = require("uglify-js")
const _ = require('underscore')

const compile = async (watch, compress, clientJsName, bundleName) => {
	return new Promise((resolve, reject) => {
		if(!clientJsName) clientJsName = 'client.js'

		let clientBaseName =  _s(clientJsName).strLeftBack('.js').strRightBack('/').value() 

		let targetDirectory
		if(bundleName && bundleName.search('/') > -1) {
			targetDirectory =  _s.strLeftBack( bundleName, '/' )
		} else if(clientJsName.search('/') > -1) {
			targetDirectory =  _s.strLeftBack( clientJsName, '/' )
		}

		if(!bundleName && targetDirectory) {
			bundleName = `${targetDirectory}/${clientBaseName}.bundle.js`
		} else if(!bundleName) {
			bundleName = `${clientBaseName}.bundle.js`
		} 

		let baseDirectory = _s.strLeftBack( require.main.filename, '/' )
		let b = browserify({
			cache: {},
			packageCache: {},
			debug : true,
			basedir : baseDirectory,
			commondir : false
		})

		const bundleOutputPath = targetDirectory ? bundleName : baseDirectory + '/' + bundleName

		const bundle = () => {
			b.bundle( (err, buff) => {
				if(err) return console.warn(err)
				fs.writeFile(bundleOutputPath,buff, (err) => {
					if(err) return console.warn(err)
					console.log(`wrote to ${bundleName}`)
					if(compress) {
						let options = {
							compress : _.isObject(compress) ? compress : {}
						}
						console.log('compressing...')
						let result = UglifyJS.minify(fs.readFileSync(bundleOutputPath, 'utf8'), options)
						if (result.error) return console.error(result.error)
						fs.writeFileSync(bundleOutputPath, result.code)
						console.log('done!')
					}
					resolve()
				})
			})
			.on('error', error => {
				reject(error)
			})
		}

		if(watch) b.plugin(watchify)

		b.transform(stringify({
			extensions: [ '.html' , '.css', '.svg'],
		}), {
			global: true
		})
		b.add(`${baseDirectory}/${clientJsName}`)
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
	})
}

no.watch = (...params) => compile(true, false, ...params)

no.compile = (...params) => compile(...params)

no.compress = (inputScript, outputTarget, options) => {
	options = {
		compress : _.isObject(options) ? options : {}
	}
	if(!outputTarget) outputTarget = __dirname + 'bundle.js'
	let result = UglifyJS.minify(inputScript, options)
	if (result.error) return console.error(result.error)
	fs.writeFileSync(outputTarget, result.code)
}

module.exports = no