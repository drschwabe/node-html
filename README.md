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
`no.html(css,body,script)`  
Outputs an HTML skeleton string.  Optionally provide CSS (in the form of a raw CSS string), HTML content to go in the body, or a script filename.  [See template] 

```javascript
no.html(null,`<h1>hello world</h1>`, 'client.bundle.js')
// <html><head><style></style></head><body>
//   <h1>hello world</h1>
//   <script src="client.bundle.js"></script>
// </body></html>  
```
<br>


**makeIndex**   
`no.makeIndex(path,html)`  
Writes an HTML file to the filesystem.  Provide an optional `path` (defaults to cwd + 'index.html') and `html` (string)  If `html` is not provided it will write the default `no.html()` skeleton.  

```javascript
let html = no.html(null,`<h1>hello world</h1>`, 'client.bundle.js')
no.makeIndex(null,html)
// outputs index.html to cwd with the html output from previous example
```
<br>


**server**   
`no.server(port)`  
Creates and returns an Express web server on optional port (default `8000`).  

```javascript
no.server(8555)
// Express server created at: http://localhost:8555
```
<br>


**static**   
`no.static(route, directory)`  
Serves a given filesystem directory with optional route.  Run this after `no.server()`
Both params are optional, will use '/' and your `cwd` by default.

```javascript
no.server()
no.static()
//^ all files in your cwd now being served by Express
no.static('/assets', __dirname + '/assets')
//^ or call on specific directories
```
<br>


**index**   
`no.index(html, port)`  
Serves the given html (`string`) at optional port.  If a server is not already running it will be created. 

```javascript
no.index( no.html(null,null,'myscript.js') )
// http://localhost:8000/ now serving a blank HTML page + <script src="myscript.js">
```
<br>


**css**   
`no.css(html, port)`  
Returns a string containing [Tailwind CSS]

```javascript
no.html(no.css,`<h1 class="text-green-500">Now we can use CSS</h1>`))
// > HTML skeleton with the above h1 tag in the <body> and Tailwind CSS loaded into the <head><style> tag
```
<br>

**jquery**   
`no.jquery()`  
Let's you run jquery on a given string of HTML, useful in conjunction with no.html() for quickly hacking in some content in your HTML skeleton.  A wrapper for [cheerio.load]

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



MIT


[See template]: ./node-html.js#3
[Tailwind CSS]: https://www.tailwindcss.com
[cheerio.load]: https://github.com/cheeriojs/cheerio