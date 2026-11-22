FROM node:24-alpine AS lint
RUN npm install -g htmlhint@1.9.2
WORKDIR /site
COPY index.html style.css app.js ./
RUN htmlhint index.html

FROM nginx:alpine
COPY --from=lint /site/ /usr/share/nginx/html/
EXPOSE 80
