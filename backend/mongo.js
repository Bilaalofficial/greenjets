const { Client } = require('pg');

const dbConfig = {
    user: 'bradmin',
    password: '123',
    host: '65.0.31.9',
    port: '5432',
    database: 'dash_backup',
};

const client = new Client(dbConfig);

client.connect()
    .then(() => {
        console.log('Connected to PostgreSQL database');


    })
    .catch((err) => {
        console.error('Error connecting to PostgreSQL database', err);
    });

module.exports = client;
