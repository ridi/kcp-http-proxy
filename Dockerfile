FROM node:lts-buster

LABEL maintainer="ridicorp"

ENV LC_ALL=C.UTF-8

COPY . /app
WORKDIR /app

RUN yarn install --frozen-lockfile
RUN yarn run build

EXPOSE 80
CMD ["yarn", "start"]