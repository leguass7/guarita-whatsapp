#!/bin/bash

#docker system prune --all --force --volumes

docker-compose -f "docker-compose.yml" down --volumes

git pull

docker-compose -f "docker-compose.yml" up -d --build

exit 0


