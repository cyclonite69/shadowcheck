FROM node:20.19.2-alpine

RUN apk add --no-cache git curl bash
RUN npm install -g tsx

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

EXPOSE 5000 5173

CMD ["npm", "run", "dev:full"]
