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
