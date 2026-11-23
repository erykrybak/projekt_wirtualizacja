FROM node:24-alpine AS lint
RUN npm install -g htmlhint@1.9.2
WORKDIR /site
COPY index.html style.css app.js ./
RUN htmlhint index.html

FROM nginx/nginx-unprivileged
COPY --from=lint /site/ /usr/share/nginx/html/
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
