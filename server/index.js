const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const redis = require('redis');
const keys = require('./keys');

// express app setup
const app = express();
app.use(cors());
app.use(bodyParser.json());

// postgres client setup
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort,
});
pgClient.on('error', () => console.log('lost pg connection'));
pgClient.query('CREATE TABLE IF NOT EXISTS values (number INT)').catch(err => console.log(err));

// redis client setup
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000,
});
const redisPublisher = redisClient.duplicate();

// express route handlers
app.get('/', (req, res) => {
  res.send('hello world');
});

app.get('/values/all', async (req, res) => {
  const values = await pgClient.query('select * from values');
  res.send(values.rows);
});

app.get('/values/current', async (req, res) => {
  redisClient.hgetall('values', (err, values) => {
    res.send(values);
  });
});

app.post('/values', async (req, res) => {
  const index = req.body.index;

  if (parseInt(index) > 40) {
    return res.status(422).send('index too high');
  }

  // put value into redis datastore
  redisClient.hset('values', index, 'Nothing yet!');
  redisPublisher.publish('insert', index);
  pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);
  res.send({ working: true });
});

app.listen(5000, err => {
  console.log('listening on port 5000');
});
