const redis = require('redis');
const { promisify } = require('util');

const client = redis.createClient({
    url: process.env.REDIS_URL,
});

client.on('error', (err) => console.log('Redis Client Error', err));

client.connect();

const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

module.exports = { getAsync, setAsync };