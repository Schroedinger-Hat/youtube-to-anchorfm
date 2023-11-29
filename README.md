# YouTube to Anchor.fm - An automation tool to publish your podcast

![Cover image](https://raw.githubusercontent.com/Schrodinger-Hat/youtube-to-anchorfm/main/assets/img/cover.png 'Cover image')

This action will upload an audio file from a given YouTube video automatically to your Anchor.fm account.

It is very useful in a scenario where you have a YouTube account and also a podcast at Spotify through Anchor.fm.

In our live show ([Schrodinger Hat](https://open.spotify.com/show/7yfkQCV6hrPIqflSqJDB2P)) we had this necessity. So we built it for the open source community.

Every contribution is appreciated, even just a simple feedback.

Table of Contents
=================

* [YouTube to Anchor.fm - An automation tool to publish your podcast](#youtube-to-anchorfm---an-automation-tool-to-publish-your-podcast)
   * [How it works](#how-it-works)
   * [How can I run this as a GitHub action?](#how-can-i-run-this-as-a-github-action)
   * [Environment variables](#environment-variables)
      * [Draft Mode](#draft-mode)
      * [Audio conversion options](#audio-conversion-options)
      * [Explicit Mode](#explicit-mode)
      * [Thumbnail Mode](#thumbnail-mode)
      * [Add YouTube URL to Podcast Description](#add-youtube-url-to-podcast-description)
      * [Set a publish date for the episode](#set-a-publish-date-for-the-episode)
  * [Multiple shows per repository](#multiple-shows-per-repository)
   * [How can I setup for development and use the script locally?](#how-can-i-setup-for-development-and-use-the-script-locally)
   * [How to upload a YouTube playlist to Anchor.fm using this script?](#how-to-upload-a-youtube-playlist-to-anchorfm-using-this-script)
* [Contributors](#contributors)
* [License](#license)


## How it works

The action will start every time you push a change on the `episode.json` file. Into this file you need to specify the YouTube id of your video.

The action uses a docker image built over Ubuntu. It takes some time to setup the environment before running the script.

**NOTE**: For the script to run successfully it is necessary for there to be at least one episode manually published on Anchor.fm, as the steps to publish on a brand new Anchor.fm account are different, and the automation will break.

## How can I run this as a GitHub action?

You can use the latest version of this action from the [GitHub Actions marketplace](https://github.com/marketplace/actions/upload-episode-from-youtube-to-anchor-fm).

In the repository root directory add a `episode.json` file containing your YouTube video id, e.g.:

```json
{
  "id": "nHCXZC2InAA"
}
```

Then create a GitHub action in the `.github/workflows` directory with this yaml:

```yaml
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
        uses: Schrodinger-Hat/youtube-to-anchorfm@v2.0.0
        env:
          ANCHOR_EMAIL: ${{ secrets.ANCHOR_EMAIL }}
          ANCHOR_PASSWORD: ${{ secrets.ANCHOR_PASSWORD }}
          EPISODE_PATH: /github/workspace
```

**NOTE**: you need to [set up the secrets](https://docs.github.com/en/free-pro-team@latest/actions/reference/encrypted-secrets#creating-encrypted-secrets-for-a-repository) for _ANCHOR_EMAIL_ and _ANCHOR_PASSWORD_. This environment variables are mandatory as they specify the sign in account.


## Environment variables

### Draft Mode

By setting the `SAVE_AS_DRAFT`, the new episode will be published as a draft. This can be useful if you need someone else's
approval before actual publication.

```yaml
env:
  SAVE_AS_DRAFT: true
```

### Audio conversion options

ffmpeg is used to convert the video to MP3. It's possible to pass arguments to ffmpeg with `POSTPROCESSOR_ARGS` environment
variable.

See `-postprocessor-args` syntax and options on https://github.com/yt-dlp/yt-dlp#post-processing-options.

The example below convert the video to mono audio.

```yaml
env:
  POSTPROCESSOR_ARGS: 'ffmpeg:-ac 1'
```

### Explicit Mode

By setting the `IS_EXPLICIT`, the new episode will be marked as explicit.

```yaml
env:
  IS_EXPLICIT: true
```

### Thumbnail Mode

By setting the `LOAD_THUMBNAIL`, the new episode will include the video thumbnail as the episode art.

```yaml
env:
  LOAD_THUMBNAIL: true
```

### Add YouTube URL to Podcast Description

By setting the `URL_IN_DESCRIPTION`, the Podcast description will include the YouTube URL on a new line at the end of the description.
It is recommended to set it, for if the YouTube video has no description it will fail to save the new episode. Setting it to true guarantees to always have a description.

```yaml
env:
  URL_IN_DESCRIPTION: true
```

### Set a publish date for the episode

By setting `SET_PUBLISH_DATE`, the new episode can be scheduled for publishing the episode on the date that the YouTube video is uploaded. Please note that the scheduling will work if `SAVE_AS_DRAFT` is not set, because Anchor.fm doesn't store publish date for draft episodes.
If `SET_PUBLISH_DATE` is not set, then Anchor.fm will choose the current date for publishing.

```yaml
env:
  SET_PUBLISH_DATE: true
```

## Multiple shows per repository

It is possible to use a single repository to maintain several shows.

You'll need an episode config per show.

As an example, suppose you have two shows, you called "Great News" and another "Sad News".

You repository will look like this:

```
.github/
├─ workflows/
│  ├─ great-news.yaml
│  ├─ sad-news.yaml
great-news.json
sad-news.json
```

In `great-news.json` and `sad-news.json`, you have:
```json
{
  "id": "episode_video_id"
}
```

In `great-news.yaml` and `sad-news.yaml`:
```yaml
name: 'Great News Upload Action'
on:
  push:
    paths: 
    ## only updates to this file trigger this action
      - great-news.json   # or sad-news.json
jobs:
  upload_episode:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Upload Episode from YouTube To Anchor.Fm
        uses: Schrodinger-Hat/youtube-to-anchorfm@v2.0.0
        env:
          ANCHOR_EMAIL: ${{ secrets.ANCHOR_EMAIL_GREATNEWS}}  # OR secrets.ANCHOR_EMAIL_SADNEWS 
          ANCHOR_PASSWORD: ${{ secrets.ANCHOR_PASSWORD_GREATNEWS }}  # OR secrets.ANCHOR_PASSWORD_SADNEWS
          EPISODE_PATH: /github/workspace/
          EPISODE_FILE: great-news.json
          # (…) Other configs as needed
```

## How can I setup for development and use the script locally?

To run the script locally, you need `python3` and `ffmpeg` to be available in `PATH` which are used by the npm dependency `youtube-dl-exec`.

Clone the repository and run `npm ci` to install the exact dependencies that are specified in `package-lock.json`.

After that, you can edit `episode.json` that is located at the root of this repository.
It is recommended to specify the id of a short YouTube video in `episode.json` for testing.

Then, make sure to setup your `.env` file in the root of this repository so you can put
the environment variables that you normally specify in the GitHub action YAML file.

To do that, you can copy `.env.sample` into a file with name `.env`.

Make sure to specify the mandatory environment variables for logging in to Anchor.fm,
`ANCHOR_EMAIL` and `ANCHOR_PASSWORD`.

Finally, you can do `npm start` to execute the script.

## How to upload a YouTube playlist to Anchor.fm using this script?

⚠ WARNING: This Potentially violates GitHub's Terms of service ⚠

> In particular, any repositories that use GitHub Actions or similar 3rd party services solely to interact with 3rd party websites, to engage in incentivized activities, or for general computing purposes may fall foul of the [GitHub Additional Product Terms (Actions)](https://docs.github.com/github/site-policy/github-terms-for-additional-products-and-features#actions), or the [GitHub Acceptable Use Policies](https://docs.github.com/github/site-policy/github-acceptable-use-policies).
> Actions should not be used for any activity unrelated to the production, testing, deployment, or publication of the software project associated with the repository where GitHub Actions are used.

Currently, you can process a full playlist (one way only) with

```bash
curl https://scc-youtube.vercel.app/playlist-items/PLoXdlLuaGN8ShASxcE2A4YuSto3AblDmX \
    | jq '.[].contentDetails.videoId' -r \
    | tac \
    | xargs -I% bash -c "jo id='%' > episode.json && git commit -am % && git push"
```

`https://scc-youtube.vercel.app/playlist-items` is from https://github.com/ThatGuySam/youtube-json-server

`jo` is a json generator https://github.com/jpmens/jo

`tac` is a command present in most Linux distributions and on mac with brew install coreutils. Its from reversing the list from older to newer. Remove if you want to upload in the order presented on YouTube.

`jq` is a json processor https://stedolan.github.io/jq/

This must be run on the folder where your episode.json is.

# Contributors

Thanks goes to these wonderful people ([emoji key](https://github.com/all-contributors/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center"><a href="https://www.linkedin.com/in/%F0%9F%90%A7gabriele-puliti-b62915a9/"><img src="https://avatars.githubusercontent.com/u/12409541?v=4?s=100" width="100px;" alt="GabrielePuliti"/><br /><sub><b>GabrielePuliti</b></sub></a><br /><a href="#design-Wabri" title="Design">🎨</a> <a href="https://github.com/Schrodinger-Hat/youtube-to-anchorfm/commits?author=Wabri" title="Code">💻</a> <a href="#maintenance-Wabri" title="Maintenance">🚧</a> <a href="https://github.com/Schrodinger-Hat/youtube-to-anchorfm/pulls?q=is%3Apr+reviewed-by%3AWabri" title="Reviewed Pull Requests">👀</a></td>
      <td align="center"><a href="https://www.mikilombardi.com"><img src="https://avatars.githubusercontent.com/u/6616203?v=4?s=100" width="100px;" alt="Miki Lombardi"/><br /><sub><b>Miki Lombardi</b></sub></a><br /><a href="https://github.com/Schrodinger-Hat/youtube-to-anchorfm/commits?author=TheJoin95" title="Code">💻</a> <a href="#maintenance-TheJoin95" title="Maintenance">🚧</a> <a href="https://github.com/Schrodinger-Hat/youtube-to-anchorfm/pulls?q=is%3Apr+reviewed-by%3ATheJoin95" title="Reviewed Pull Requests">👀</a></td>
      <td align="center"><a href="habet.dev"><img src="https://avatars.githubusercontent.com/u/82916197?v=4?s=100" width="100px;" alt="Abe Hanoka"/><br /><sub><b>Abe Hanoka</b></sub></a><br /><a href="https://github.com/Schrodinger-Hat/youtube-to-anchorfm/commits?author=abe-101" title="Code">💻</a> <a href="#maintenance-abe-101" title="Maintenance">🚧</a> <a href="https://github.com/Schrodinger-Hat/youtube-to-anchorfm/pulls?q=is%3Apr+reviewed-by%3Aabe-101" title="Reviewed Pull Requests">👀</a></td>
      <td align="center"><a href="https://github.com/matevskial"><img src="https://avatars.githubusercontent.com/u/44746117?v=4?s=100" width="100px;" alt="matevskial"/><br /><sub><b>matevskial</b></sub></a><br /><a href="https://github.com/Schrodinger-Hat/youtube-to-anchorfm/commits?author=matevskial" title="Code">💻</a> <a href="#maintenance-matevskial" title="Maintenance">🚧</a></td>
      <td align="center"><a href="https://github.com/Amod02-prog"><img src="https://avatars.githubusercontent.com/u/83520862?v=4?s=100" width="100px;" alt="Amod Deshpande"/><br /><sub><b>Amod Deshpande</b></sub></a><br /><a href="https://github.com/Schrodinger-Hat/youtube-to-anchorfm/commits?author=Amod02-prog" title="Documentation">📖</a></td>
      <td align="center"><a href="https://github.com/zephyrus3"><img src="https://avatars.githubusercontent.com/u/47828820?v=4?s=100" width="100px;" alt="Guilherme Costa"/><br /><sub><b>Guilherme Costa</b></sub></a><br /><a href="https://github.com/Schrodinger-Hat/youtube-to-anchorfm/commits?author=zephyrus3" title="Code">💻</a> <a href="https://github.com/Schrodinger-Hat/youtube-to-anchorfm/issues?q=author%3Azephyrus3" title="Bug reports">🐛</a></td>
      <td align="center"><a href="https://github.com/weltonrodrigo"><img src="https://avatars.githubusercontent.com/u/1644644?v=4?s=100" width="100px;" alt="Welton Rodrigo Torres Nascimento"/><br /><sub><b>Welton Rodrigo Torres Nascimento</b></sub></a><br /><a href="https://github.com/Schrodinger-Hat/youtube-to-anchorfm/commits?author=weltonrodrigo" title="Documentation">📖</a> <a href="https://github.com/Schrodinger-Hat/youtube-to-anchorfm/commits?author=weltonrodrigo" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center"><a href="https://github.com/nicpuppa"><img src="https://avatars.githubusercontent.com/u/72783243?v=4?s=100" width="100px;" alt="Nicola Puppa"/><br /><sub><b>Nicola Puppa</b></sub></a><br /><a href="https://github.com/Schrodinger-Hat/youtube-to-anchorfm/commits?author=nicpuppa" title="Documentation">📖</a></td>
      <td align="center"><a href="http://matej.voboril.dev"><img src="https://avatars.githubusercontent.com/u/7128721?v=4?s=100" width="100px;" alt="Matt"/><br /><sub><b>Matt</b></sub></a><br /><a href="https://github.com/Schrodinger-Hat/youtube-to-anchorfm/issues?q=author%3ATobiTenno" title="Bug reports">🐛</a></td>
    </tr>
  </tbody>
  <tfoot>
    
  </tfoot>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://allcontributors.org) specification.

# License

MIT
