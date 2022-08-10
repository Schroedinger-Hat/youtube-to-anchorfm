#!/bin/sh -l

# Guarantee that we are on the same path as our *.js scripts
cd /
npm ci  # more suitable for installs from scratch 
npm start
