FROM ubuntu:20.04

RUN apt-get update && apt-get install -y sudo
RUN apt-get -y upgrade
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
RUN apt-get install -y python
RUN apt-get install -y nodejs
RUN apt-get install --reinstall libgtk2.0-0 -y
RUN apt-get install -y libgbm-dev
RUN apt-get install libnss3 libnss3-tools libxss1 libgtk-3-0 -y
# To allow MP3 conversion
RUN apt-get install ffmpeg -y

COPY src /src
COPY package-lock.json /package-lock.json
COPY package.json /package.json
COPY entrypoint.sh /entrypoint.sh
COPY episode.json /episode.json

RUN chmod 777 /entrypoint.sh
ENV LC_ALL=en_US.UTF-8

ENTRYPOINT [ "/entrypoint.sh" ]
