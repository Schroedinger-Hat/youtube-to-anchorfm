#!/bin/sh -l

# Guarantee that we are on the same path as our *.js scripts
cd /
npm install
sudo npm i puppeteer --unsafe-perm=true --allow-root
node index.js
