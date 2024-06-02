const no = {}
const { log, warn, error } = console
const fs = require('fs')


no.html = (css, body, script, title, favicon, headScript) => {
	if(!css) {
		css = ''
  } else if(css.search('<style>') > -1) {
    css = css //< assume param is already a valid html block
	} else if(css.search('{')) {
		css = `<style>${css}</style>`
	} else if(css.search('http')) {
		css = `<link href="${css}" rel="stylesheet">`
	}
  if(favicon && _.isBoolean(favicon)) {
    //use default favicon filename: 
    favicon = `<link rel="shortcut icon" 
    type="image/x-icon" href="/favicon.ico">`
  } else if(favicon) {
    script = `<link rel="shortcut icon" 
    type="image/x-icon" href="${favicon}">` 
  }    

  if(script && _.isBoolean(script)) {
    //use default filename 'client.bundle.js' : 
    script = `<script src="client.bundle.js"></script>` 
  } else if(script) {
    script = `<script src="${script}"></script>`
  }
	return `
<html>
<head>
  <meta name="viewport" 
    content="width=device-width, initial-scale=1"> 
  ${ title ? `<title>${title}</title>` : '' } 

  ${ favicon ? favicon : '' } 
  ${ headScript ? headScript : '' } 
	${css}
</head>
<body>
	${body ? body : ''}
	${script ? script : '' }
</body>            
</html>
`
}

no.makeIndex = (path, html) => {
	if(!path) path = process.cwd() + '/index.html'
	if(!html) html = no.html()
	fs.writeFileSync(path, html )
}

no.makeHTML = (pathAndFileName, html) => {
	if(!pathAndFileName) return error('path and filename required')
	if(!html) html = no.html()
	fs.writeFileSync(pathAndFileName, html)
}

const express = require('express')
no.server = port => {
	if(!port) port = 8000
	no.expressApp = express()
	no.expressApp.listen(port, () => log('http://localhost:' + port))
	return no.expressApp
}
no.serve = no.server

no.express = express 

const _s = require('underscore.string')
no.static = (route, directory, expressApp) => {
	if(!route) route = '/'
	if(!directory) directory =  _s.strLeftBack( require.main.filename, '/' )
	//TODO: start express app if not already started.
  let theExpressApp = expressApp ? expressApp : no.expressApp
	theExpressApp.use(route, express.static(directory))
}

no.index = (html, port, expressApp) => {
	if(!no.expressApp && !expressApp) {
		expressApp = no.server( port ? port : null )
	} else if(no.expressApp && !expressApp) {
    expressApp = no.expressApp 
  }
	if(!html) html = no.html()
	//should autodetect if a client.bundle.js file is on fs
	expressApp.get('/', (req, res) => 
    res.send( html )) 
  return expressApp
}
no.serveIndex = no.index //< alias

//CSS:
const stringify = require('stringify')

const path = require('path')
const tailwindModulePath = require.resolve('tailwindcss')
const tailwindDistPath = path.resolve( tailwindModulePath, '../../dist/')
no.css = fs.readFileSync( tailwindDistPath + '/tailwind.min.css' , 'utf8') 
no.twCss = no.css //< alias 
no.style = `<style>${no.css}</style>`
no.twStyle = no.style 

//JQuery
const cheerio = require('cheerio') 
no.jquery = cheerio.load
no.jQuery = cheerio.load //< alias; common spelling variant.

//bundle...
const browserify = require('browserify')
const watchify = require('watchify')
const UglifyJS = require("uglify-js")
const _ = require('underscore')

const compile = async (watch, compress, clientJsName, bundleName, cli) => {
	return new Promise((resolve, reject) => {
		if(!clientJsName) clientJsName = 'client.js'

		let clientBaseName =  _s(clientJsName).strLeftBack('.js').strRightBack('/').value() 

		let targetDirectory, inputPath  
		if(bundleName && bundleName.search('/') > -1) {
			targetDirectory =  _s.strLeftBack( bundleName, '/' )
		} else if(clientJsName.search('/') > -1) {
			targetDirectory =  _s.strLeftBack( clientJsName, '/' )
      inputPath = clientJsName 
		}

		if(!bundleName && targetDirectory) {
			bundleName = `${targetDirectory}/${clientBaseName}.bundle.js`
		} else if(!bundleName) {
			bundleName = `${clientBaseName}.bundle.js`
		} 

    let baseDirectory = cli ? process.cwd() 
      : _s.strLeftBack( require.main.filename , '/' )           

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
				if(err) return warn(err)
				fs.writeFile(bundleOutputPath,buff, (err) => {
					if(err) return warn(err)
					log(`wrote to ${bundleName}`)
					if(compress) {
						let options = {
							compress : _.isObject(compress) ? compress : {}
						}
						log('compressing...')
						let result = UglifyJS.minify(fs.readFileSync(bundleOutputPath, 'utf8'), options)
						if (result.error) return error(result.error)
						fs.writeFileSync(bundleOutputPath, result.code)
						log('done!')
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
		b.add(inputPath ? inputPath : `${baseDirectory}/${clientJsName}`)
		b.transform("babelify", {
			//presets: ["@babel/preset-env"],
			sourceType : 'unambiguous',
			global: true,
			plugins: [
        ["@babel/plugin-transform-runtime", {absoluteRuntime : true }],
        "@babel/plugin-transform-modules-commonjs", 
        ["@babel/plugin-transform-react-jsx", { "pragma": "createElement" }] 
		  ]
		})
		b.on('update', () => {
			log('writing new bundle...')
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
	if (result.error) return error(result.error)
	fs.writeFileSync(outputTarget, result.code)
}

no.twCdn = `
  <script src="https://cdn.tailwindcss.com"></script>
`
no.tw = no.twCdn  
no.twCdnScript = no.twCdn  

no.twLocal = `<script src="/tailwind-play.js"></script>` 
no.twLocalScript = no.twLocal

no.twCdnUrl = "https://cdn.tailwindcss.com" 

no.twBasicCss = `
  a { @apply text-blue-700 font-semibold } 
  h8, .h8 { @apply text-xs }
  h7, .h7 { @apply text-sm }
  h5, .h5 { @apply text-lg }
  h4, .h4 { @apply text-xl }
  h3, .h3 { @apply text-2xl } 
  h2, .h2 { @apply text-3xl }
  h1, .h1 { @apply text-4xl  } 
  ::selection { 
    @apply bg-purple-800; 
    color: #fff; 
    text-shadow: none;
  }    
  button { @apply bg-gray-100 border border-black p-2 rounded } 
  input { @apply border border-gray-200 p-2 } 
`   

no.twBasicStyle = `
 <style type="text/tailwindcss">   
   ${no.twBasicCss}                              
 </style> 
`

module.exports = no
