FROM node:22-alpine

RUN npm install -g nodemon

WORKDIR /app

COPY ./package.json .

RUN yarn

COPY . .

EXPOSE 4000

CMD ["yarn", "start:dev"]

