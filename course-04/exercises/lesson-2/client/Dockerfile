FROM node:slim

WORKDIR /app

COPY package.*json .

COPY . .

RUN npm install

RUN npm uninstall @types/react-native

ENTRYPOINT ["npm", "start"]
