FROM ubuntu:22.04

RUN apt-get update  \
    && apt-get -y upgrade \
    && apt-get install -y sudo ca-certificates curl gnupg \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*

# install node
RUN mkdir -p /etc/apt/keyrings
RUN curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
RUN echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_18.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list
RUN apt-get update && apt-get install -y nodejs  \
    python3  \
    libgtk2.0-0 \
    libgbm-dev \
    libnss3 \
    libnss3-tools \
    libxss1 \
    libgtk-3-0 \
    ffmpeg \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.npm to speed up subsequent builds.
# Leverage a bind mounts to package.json and package-lock.json to avoid having to copy them
# into this layer.
RUN --mount=type=bind,source=package.json,target=/package.json \
    --mount=type=bind,source=package-lock.json,target=/package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci

COPY src src
COPY package-lock.json .
COPY package.json .
COPY entrypoint.sh .
COPY episode.json .

RUN chmod 777 /entrypoint.sh
ENV LC_ALL=en_US.UTF-8

ENTRYPOINT [ "/entrypoint.sh" ]
