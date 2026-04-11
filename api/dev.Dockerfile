FROM node:25-alpine

WORKDIR /api

COPY package*.json .

RUN npm install

COPY . .

EXPOSE 8080

CMD [ "npm", "run" , "dev" ]