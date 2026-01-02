# node-html

For rapid prototyping & building of webpages or apps in as few lines as possible.

node-html is small lib with a set of convenience functions to get you quickly going with a functional HTML/CSS/JS page or app - including one-liners for generating an HTML skeleton,  starting an Express server, and serving a static directory. 


### usage
```bash
npm install node-html
```
 
```javascript
//In my nodejs file ie: server.js 
const no = require('node-html')
```

### api

**html**   
`no.html(css, body, script, title, favicon, headScript)`  
Outputs an HTML skeleton string. All parameters are optional:
- `css` - Raw CSS string, `<style>` block, or URL to stylesheet
- `body` - HTML content for the body
- `script` - Script filename (or `true` for default `client.bundle.js`)
- `title` - Page title
- `favicon` - Favicon path (or `true` for default `/favicon.ico`)
- `headScript` - Additional script/content for the head

```javascript
no.html(null, `<h1>hello world</h1>`, 'client.bundle.js')
// <html><head><style></style></head><body>
//   <h1>hello world</h1>
//   <script src="client.bundle.js"></script>
// </body></html>  

// Using boolean shorthand for defaults:
no.html(null, `<h1>hello</h1>`, true, 'My Page', true)
// Uses 'client.bundle.js' and '/favicon.ico' automatically
```
<br>


**makeIndex**   
`no.makeIndex(path, html)`  
Writes an HTML file to the filesystem.  Provide an optional `path` (defaults to cwd + 'index.html') and `html` (string).  If `html` is not provided it will write the default `no.html()` skeleton.  

```javascript
let html = no.html(null, `<h1>hello world</h1>`, 'client.bundle.js')
no.makeIndex(null, html)
// outputs index.html to cwd with the html output from previous example
```
<br>


**makeHTML**   
`no.makeHTML(pathAndFileName, html)`  
Writes an HTML file to a specific path. Unlike `makeIndex`, the path is required.

```javascript
no.makeHTML('./pages/about.html', no.html(null, `<h1>About</h1>`))
```
<br>


**server**   
`no.server(port)`  
Creates and returns an Express web server on optional port (default `8000`). Also available as `no.serve()`.

```javascript
no.server(8555)
// Express server created at: http://localhost:8555
```
<br>


**express**   
`no.express`  
Direct access to the Express module for advanced usage.

```javascript
const router = no.express.Router()
```
<br>


**static**   
`no.static(route, directory, expressApp)`  
Serves a given filesystem directory with optional route. Run this after `no.server()`.
All params are optional - uses '/' and your main script's directory by default. Optionally pass a custom Express app as the third parameter.

```javascript
no.server()
no.static()
//^ all files in your cwd now being served by Express
no.static('/assets', __dirname + '/assets')
//^ or call on specific directories
```
<br>


**index**   
`no.index(html, port, expressApp)`  
Serves the given html (`string`) at optional port. If a server is not already running it will be created. Also available as `no.serveIndex()`.

```javascript
no.index( no.html(null, null, 'myscript.js') )
// http://localhost:8000/ now serving a blank HTML page + <script src="myscript.js">
```
<br>


**css**   
`no.css`  
Returns a string containing [Tailwind CSS]. Also available as `no.twCss`.

```javascript
no.html(no.css, `<h1 class="text-green-500">Now we can use CSS</h1>`)
// > HTML skeleton with Tailwind CSS loaded into the <head><style> tag
```
<br>


**style**   
`no.style`  
Tailwind CSS wrapped in a `<style>` tag, ready to insert. Also available as `no.twStyle`.

```javascript
no.html(no.style, `<h1 class="text-green-500">Styled!</h1>`)
```
<br>


**twCdn**   
`no.twCdn`  
Script tag for loading Tailwind from CDN. Also available as `no.tw` and `no.twCdnScript`.

```javascript
no.html(null, `<h1 class="text-red-500">CDN Tailwind</h1>`, null, null, null, no.twCdn)
```
<br>


**twLocal**   
`no.twLocal`  
Script tag for loading a local Tailwind play CDN file. Also available as `no.twLocalScript`.

```javascript
no.html(null, body, null, null, null, no.twLocal)
// <script src="/tailwind-play.js"></script>
```
<br>


**twCdnUrl**   
`no.twCdnUrl`  
The raw Tailwind CDN URL string.

```javascript
no.twCdnUrl // "https://cdn.tailwindcss.com"
```
<br>


**twBasicCss**   
`no.twBasicCss`  
Basic Tailwind utility styles using `@apply` directives. Includes styles for links, headings (h1-h8), selection highlighting, buttons, and inputs.

```javascript
no.twBasicCss
// a { @apply text-blue-700 font-semibold } 
// h1, .h1 { @apply text-4xl } 
// ...etc
```
<br>


**twBasicStyle**   
`no.twBasicStyle`  
The basic CSS wrapped in a `<style type="text/tailwindcss">` tag for use with Tailwind CDN.

```javascript
no.html(null, body, null, null, null, no.twCdn + no.twBasicStyle)
```
<br>


**jquery**   
`no.jquery(html)`  
Let's you run jquery on a given string of HTML, useful in conjunction with no.html() for quickly hacking in some content in your HTML skeleton. A wrapper for [cheerio.load]. Also available as `no.jQuery`.

```javascript
let $ = no.jquery( no.html() )
$('body').append( `<h1>hello world</h1>` )
$('h1').html( `<h1>hello flat world</h1>` )
$.html()
// <html><head></head>
// <body>
//   <h1>hello flat world</h1>
// </body></html>
```
<br>


### aliases

| Primary | Alias(es) |
|---------|-----------|
| `no.server` | `no.serve` |
| `no.index` | `no.serveIndex` |
| `no.css` | `no.twCss` |
| `no.style` | `no.twStyle` |
| `no.twCdn` | `no.tw`, `no.twCdnScript` |
| `no.twLocal` | `no.twLocalScript` |
| `no.jquery` | `no.jQuery` |


MIT


[See template]: ./node-html.js#3
[Tailwind CSS]: https://www.tailwindcss.com
[cheerio.load]: https://github.com/cheeriojs/cheerio