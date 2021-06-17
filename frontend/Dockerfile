FROM alpine:3.14

RUN apk add nodejs npm

RUN mkdir /app

ADD . /app

WORKDIR /app

RUN npm i

RUN npm i -g http-server

RUN npm run build

ENTRYPOINT [ "http-server", "/app/dist" ]