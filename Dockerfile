FROM node:lts-alpine3.15

WORKDIR /usr/app

COPY . .

# RUN yarn install --frozen-lockfile --production
RUN yarn install --frozen-lockfile

RUN yarn build:heap

CMD ["yarn", "start"]
