FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm i -g serve
COPY . .
RUN npm run build
ENV VITE_PORT=5000
ENV VITE_ORIGIN=http://0.0.0.0:5000
EXPOSE $VITE_PORT
CMD [ "serve", "-s", "dist", "-l", "tcp://0.0.0.0:5000" ]