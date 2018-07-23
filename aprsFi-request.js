const request = require('superagent')
const { Pool, Client } = require('pg')
const config = require('./config')

const pool = new Pool(config.psql);

const SCHEMA = config.schema;
const TABLE = config.table;

const [SCHEMA, TABLE] = [config.database.schema, config.database.table]

(async () => {
  console.log(`checking if ${SCHEMA} schema exists`);
  await pool.query('SELECT schema_name FROM information_schema.schemata WHERE schema_name = $1;', [SCHEMA])
    .then((res) => {
      if (!res.rows.length) {
        console.log(`creating schema ${SCHEMA}`);
        pool.query('CREATE SCHEMA $1', [SCHEMA])
          .then((res) => {
            console.log('OK');
          })
          .catch(e => setImmediate(() => { throw e }))
      }
      else
        console.log('OK');
    })
    .catch(e => setImmediate(() => { throw e }))

  console.log(`checking if ${TABLE} table exists`);
  await pool.query('SELECT to_regclass($1);', [`${SCHEMA}.${TABLE}`])
    .then((res) => {
      if (!res.rows[0].to_regclass) {
        console.log(`creating table ${TABLE}`);
        const query = `CREATE TABLE ${SCHEMA}.${TABLE}(
            timestamp INT,
            stat text,
            lat text,
            lon text,
            PRIMARY KEY (timestamp)
          );`
        pool.query(query)
          .then((res) => {console.log('OK');})
          .catch(e => setImmediate(() => { throw e }))
      }
      else
        console.log('OK');
    })
    .catch(e => setImmediate(() => { throw e }))
  })().catch(e => setImmediate(() => { throw e }))

const aprsFiBaseUrl = 'https://api.aprs.fi/api/get'

console.log('starting requests for data');


const askForData = async () => {
  
  request
    .get(aprsFiBaseUrl)
    .query({ what: 'loc', name: 'BV2DQ-2', apikey: '114550.jF3oS2a0IXVxVJqp', format: 'json' })
    .end( async (err, res) => {
      const last = await pool.query(`SELECT * FROM ${SCHEMA}.${TABLE} ORDER BY timestamp DESC LIMIT 1`)
      const dat = res.body.entries[0];
      if (last.rows.length == 0 || last.rows[0].timestamp < parseInt(dat.status_lasttime)) {
        console.log(dat);
        pool.query(`INSERT INTO ${SCHEMA}.${TABLE}(lat, lon, timestamp, stat) VALUES($1, $2, $3, $4)`, [dat.lat, dat.lng, dat.status_lasttime, dat.status] )
        .catch(e => console.error(e.stack))
      }
    });
}

setInterval(askForData, config.interval);