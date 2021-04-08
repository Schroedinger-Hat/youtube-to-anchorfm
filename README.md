# Hasnode to Anchor.fm - An automation tool to publish your podcast

This action will upload an audio file from a given youtube video automatically to your Anchor.fm account.

## How it works

## How can I use it?

# Credits

[Forked repo](https://github.com/Schrodinger-Hat/youtube-to-anchorfm): [@thejoin](https://github.com/thejoin95) & [@wabri](https://github.com/wabri)

Code for gtts by @W01fw00d from https://github.com/W01fw00d/text-to-voice

Hasnode management by @W01fw00d

# License

MIT

# Transform text doc to voice audio file

| **Main dependencies:**

- [node-gtts](https://www.npmjs.com/package/node-gtts)
- [fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg)

| **Setup:**

- Install [ffmpeg](http://www.ffmpeg.org/). It's recommended to install full version to be sure to have all needed features
- `[Windows]` Add `ffmpeg` and `ffprobe` to your `PATH`

- Install dependencies:

```
npm install
```

| **How to use:**

- Expected filename structure: `{bookCode}_cap{chapterCode}`. You have an example in `src/input/test1/test1_cap1.txt`

- Add the input text doc in `.txt` format in `src/input/{bookcode}/`

- Add desired `opening.mp3` song in `input/{bookcode}/songs/`. Add the `closure.mp3` song in its own folder too

- Get your files data for command arguments:

A) `bookCode`: The name of the folder for your chosen input file, as well as the desired location for the output file. It's part of the input and output file name too

B) `chapterCode`: Part of the input and output file name

C) `lang`: Desired language for the voices. Supports Spanish (`es`) and English (`en`). Defaults to `es`

D) `shallAddChapterNumber`: Set it to any value for adding a voice line at the beginning mentioning the chapter number. Leave empty for not.

- Create `output/{bookcode}` folder. It will be used to store the output audio file

- Execute task (? args are optional):

```
node index.js {bookcode} {chapterCode} {?lang} {?shallAddChapterNumber}
```

- Output `.mp3` audio file will appear on `src/output/{bookcode}`

| **Command executed on ffmpeg:**

The task executes:

```
ffmpeg -i src/input/test1/songs/opening.mp3 -i src/output/test1/test1_cap1_0_0.mp3 -i src/input/test1/songs/closure.mp3
-y -filter_complex concat=n=73:v=0:a=1 src/output/test1/test1_cap1.mp3
```

| **Attribution:**

- `test1` opening and closure songs were created by @W01fw00d
