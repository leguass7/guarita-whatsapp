FROM node:current-alpine3.10

WORKDIR /usr/app

COPY . .

RUN yarn install --frozen-lockfile --ignore-opcional

RUN yarn build

CMD ["yarn", "start"]
