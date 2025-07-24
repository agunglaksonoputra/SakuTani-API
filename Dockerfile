FROM node:18

WORKDIR /app

COPY . .

RUN npm install
RUN npm run build

RUN npm install -g serve

EXPOSE 3016

CMD ["serve", "-s", "dist", "-l", "3016"]
