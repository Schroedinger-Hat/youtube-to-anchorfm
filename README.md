# Youtube to Anchor.fm - An automation tool to publish your podcast

![Cover image](https://raw.githubusercontent.com/Schrodinger-Hat/youtube-to-anchorfm/master/assets/img/cover.png "Cover image")

You will thank us later, now you should give us a star.

Come on... Don't be shy.

## How it works

The workflow is using `youtube-dl` library and `puppeteer`.

The first one is a npm module used for donwloading the video / audio from YouTube, meanwhile Puppeteer will upload the generated file into the Anchor.fm dashboard (by loggin it).

The action will start everytime you push a change on the `episode.json` file. Into this file you need to specify the youtube id of your video.

## How can I use it?

We are working on put the action into the Github Actions marketplace.

Meanwhile you can add under the `.github/workflows` directory this yml:

```
name: Upload Episode from YouTube To Anchor.Fm

on:
  push:
    paths: 
      - episode.json
    branches: [master]

jobs:
  upload_episode:
    runs-on: ubuntu-16.04
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v1
        with:
          node-version: "12"
      - name: Install And Configure youtube-dl
        run: |
          sudo curl -k -L https://yt-dl.org/downloads/latest/youtube-dl -o /usr/local/bin/youtube-dl
          sudo chmod a+rx /usr/local/bin/youtube-dl
      - name: Install Deps, donwload audio file from youtube video defined in episode.json and upload to anchor
        run: |
          npm install
          npm run upload
        env:
          ANCHOR_EMAIL: ${{ secrets.ANCHOR_EMAIL }}
          ANCHOR_PASSWORD: ${{ secrets.ANCHOR_PASSWORD }}
```

**NOTE**: you need to set up the secrets for ANCHOR_EMAIL and ANCHOR_PASSWORD. This environment variables are mandatory as they specify the signin account.


# Credits

[@thejoin](https://github.com/thejoin95) & [@wabri](https://github.com/wabri)
