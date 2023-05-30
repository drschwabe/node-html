#!/usr/bin/env node
const { log } = console
const argv = require('minimist')(process.argv.slice(2))
const no = require('./node-html') 

const command = argv._[0]   

if(command === 'compile') {
  log('compile client.js ....') 
  no.compile(false, false, 
    process.cwd() + '/client.js', 'client.bundle.js', true)  
}

if(command === 'serve') {
  log('start Express server....') 
  no.server() 
}
