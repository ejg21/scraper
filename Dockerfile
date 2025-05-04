FROM mcr.microsoft.com/playwright:v1.42.1

WORKDIR /app
COPY . .

RUN npm install

CMD ["node", "index.js"]
