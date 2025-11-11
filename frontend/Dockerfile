FROM node:20.10 as build

WORKDIR /app

COPY ./package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:20.10 as run

WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/build ./build

CMD ["serve", "-s", "build"]

EXPOSE 3000
