# build the app from scratch
FROM node:13-alpine AS builder

RUN apk --update --no-cache add git openssh-client ruby ruby-ffi
RUN gem install compass
RUN npm_config_unsafe_perm=true npm install -g grunt-cli

ADD package.json /tmp/package.json
ADD package-lock.json /tmp/package-lock.json
RUN cd /tmp && npm install
RUN mkdir -p /usr/src/app && cp -a /tmp/node_modules /usr/src/app/

WORKDIR /usr/src/app
COPY . /usr/src/app/

RUN grunt

# serve the app with nginx
FROM nginx:stable

COPY --from=0 /usr/src/app/dist /var/www
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g daemon off;"]
