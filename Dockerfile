FROM node:current-alpine3.14

WORKDIR /usr/app

COPY . .

RUN yarn install --frozen-lockfile

RUN export NODE_OPTIONS="--max-old-space-size=530" && yarn build

CMD ["yarn", "start"]
