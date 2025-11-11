FROM node:20.10.0

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN chmod +x ./GraphFiles/PythonFiles/*.sh

RUN apt-get update && \
    apt-get install -y python3 python3-pip && \
    pip3 install --break-system-packages --no-cache-dir matplotlib numpy scipy pandas plotly && \
    rm -rf /var/lib/apt/lists/*

EXPOSE 8000
CMD ["node", "app.js"]
