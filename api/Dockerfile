FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

RUN npm install -g @nestjs/cli
RUN npm run build
# RUN npm run test

CMD ["node", "dist/main.js"]
