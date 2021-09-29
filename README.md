# Youtube to Anchor.fm - An automation tool to publish your podcast

![Cover image](https://raw.githubusercontent.com/Schrodinger-Hat/youtube-to-anchorfm/main/assets/img/cover.png "Cover image")

This action will upload an audio file from a given youtube video automatically to your Anchor.fm account.

It is very useful in a scenario where you have a YouTube account and also a podcast over Spotify, Anchor.fm, Play Music, iTunes etc.

In our live show (Schrodinger Hat) we had this necessity. So we built it for the open source community.

Every contribution it is appreciated, also a simple feedback.

## How it works

The workflow is using `youtube-dl` library and `puppeteer`.

The first one is a npm module used for donwloading the video / audio from YouTube, meanwhile Puppeteer will upload the generated file into the Anchor.fm dashboard (by loggin it).

The action will start everytime you push a change on the `episode.json` file. Into this file you need to specify the youtube id of your video.

The action use a docker image built over ubuntu 18.04. It take some times to setup the environment (installing dependecies and chromium browser).

## How can I use it?

You can use the latest version of this action from the [Github Actions marketplace](https://github.com/marketplace/actions/upload-episode-from-youtube-to-anchor-fm).

In your repository root directory you should add a `episode.json` file containing your youtube video id, e.g:
```
{
  "id": "nHCXZC2InAA"
}
```

Then you can add under the `.github/workflows` directory this yml:

```
name: 'Upload Episode from YouTube To Anchor.Fm'

on:
  push:
    paths: 
      - episode.json
    branches: [main]

jobs:
  upload_episode:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Upload Episode from YouTube To Anchor.Fm
        uses: Schrodinger-Hat/youtube-to-anchorfm@v0.1.6
        env:
          ANCHOR_EMAIL: ${{ secrets.ANCHOR_EMAIL }}
          ANCHOR_PASSWORD: ${{ secrets.ANCHOR_PASSWORD }}
          EPISODE_PATH: /github/workflow
```

**NOTE**: you need to [set up the secrets](https://docs.github.com/en/free-pro-team@latest/actions/reference/encrypted-secrets#creating-encrypted-secrets-for-a-repository) for *ANCHOR_EMAIL* and *ANCHOR_PASSWORD*. This environment variables are mandatory as they specify the signin account.


# Credits

[@thejoin](https://github.com/thejoin95) & [@wabri](https://github.com/wabri)


# License

MIT
