FROM keymetrics/pm2:latest-stretch

LABEL maintainer="ridicorp"

COPY . /app

WORKDIR /app

RUN npm install

RUN npm run build

CMD ["npm", "start"]