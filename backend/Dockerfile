FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache ffmpeg

COPY package.json ./
RUN npm install

COPY src ./src
COPY videos ./videos

RUN mkdir hls

EXPOSE 8000
CMD ["npm", "run", "dev"]