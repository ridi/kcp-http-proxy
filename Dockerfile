FROM keymetrics/pm2:latest-stretch

LABEL maintainer="ridicorp"

COPY . /app
WORKDIR /app

RUN yarn install --frozen-lockfile
RUN yarn run build

EXPOSE 80
CMD ["yarn", "start"]