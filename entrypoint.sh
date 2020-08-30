#!/bin/sh -l

npm install
sudo npm i puppeteer --unsafe-perm=true --allow-root
node index.js