#!/bin/bash
docker-compose -f "docker-compose.yml" down --volumes

git pull

docker-compose -f "docker-compose.yml" up -d --build

docker logs -f guarita-whatsapp
