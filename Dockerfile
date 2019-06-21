FROM keymetrics/pm2:latest-stretch

LABEL maintainer="ridicorp"

COPY . /app
WORKDIR /app

RUN npm install
RUN npm run build

EXPOSE 80
CMD ["npm", "start"]