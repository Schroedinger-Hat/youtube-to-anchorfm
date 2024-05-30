FROM ubuntu:22.04

RUN apt-get update && apt-get install -y sudo
RUN apt-get -y upgrade
RUN apt-get install -y curl
RUN apt-get install -y ca-certificates curl gnupg
# install node
RUN mkdir -p /etc/apt/keyrings
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_18.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list
RUN apt-get update
RUN apt-get install -y nodejs
RUN apt-get install -y python3
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
