FROM alpine:3.14

RUN apk add nodejs npm

RUN mkdir /app

ADD . /app

WORKDIR /app

RUN npm i

ENTRYPOINT [ "node", "/app/index.js" ]
