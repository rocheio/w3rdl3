#!/bin/sh
set -e

: "${HOST?Need to set HOST}"

# Build the Docker image
docker build -t w3rdl3:latest .

# Ensure the target directory exists
ssh $HOST 'mkdir -p ~/w3rdl3'

# Send the docker-compose file to server
scp ./docker-compose.yml $HOST:w3rdl3

# Send the docker image to the server
docker save w3rdl3:latest | bzip2 | pv | \
    ssh $HOST 'bunzip2 | docker load'

# Run the image in the background
ssh $HOST 'cd ~/w3rdl3 && docker-compose up -d --remove-orphans'
