#!/bin/sh -l

# Guarantee that we are on the same path as our *.js scripts
cd /
npm uninstall puppeteer
npm install puppeteer
npm start