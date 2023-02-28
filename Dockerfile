FROM ubuntu:20.04

RUN apt-get update && apt-get install -y sudo
RUN apt-get -y upgrade
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
RUN apt-get install -y python
RUN apt-get install -y nodejs
RUN apt-get install --reinstall libgtk2.0-0 -y
RUN apt-get install -y libgbm-dev
RUN apt-get install libnss3 libnss3-tools libxss1 libgtk-3-0 -y
# To allow MP3 conversion
RUN apt-get install ffmpeg -y

COPY package-lock.json /package-lock.json
COPY package.json /package.json
RUN npm ci
COPY src /src

# Temporarily get master yt-dlp for bug https://github.com/yt-dlp/yt-dlp/issues/6369
RUN apt install pip -y 
RUN python3 -m pip install -U pip setuptools wheel https://codeload.github.com/yt-dlp/yt-dlp/zip/5b28cef72db3b531680d89c121631c73ae05354f
# RUN python3 -m pip install 

COPY entrypoint.sh /entrypoint.sh
COPY episode.json /episode.json

RUN chmod 777 /entrypoint.sh
ENV LC_ALL=en_US.UTF-8



ENTRYPOINT [ "/entrypoint.sh" ]
