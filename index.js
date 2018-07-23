const request = require('superagent')
const { Pool, Client } = require('pg')
const config = require('./config')

const pool = new Pool(config.psql);

const SCHEMANAME = config.schema;
const TABLENAME = config.table;

(async () => {
  console.log(`checking if ${SCHEMANAME} schema exists`);
  await pool.query('SELECT schema_name FROM information_schema.schemata WHERE schema_name = $1;', [SCHEMANAME])
    .then((res) => {
      if (!res.rows.length) {
        console.log(`creating schema ${SCHEMANAME}`);
        pool.query('CREATE SCHEMA $1', [SCHEMANAME])
          .then((res) => {
            console.log('OK');
          })
          .catch(e => setImmediate(() => { throw e }))
      }
      else
        console.log('OK');
    })
    .catch(e => setImmediate(() => { throw e }))

  console.log(`checking if ${TABLENAME} table exists`);
  await pool.query('SELECT to_regclass($1);', [`${SCHEMANAME}.${TABLENAME}`])
    .then((res) => {
      if (!res.rows[0].to_regclass) {
        console.log(`creating table ${TABLENAME}`);
        const query = `CREATE TABLE ${SCHEMANAME}.${TABLENAME}(
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
      const last = await pool.query(`SELECT * FROM ${SCHEMANAME}.${TABLENAME} ORDER BY timestamp DESC LIMIT 1`)
      const dat = res.body.entries[0];
      if (last.rows.length == 0 || last.rows[0].timestamp < parseInt(dat.status_lasttime)) {
        console.log(dat);
        pool.query(`INSERT INTO ${SCHEMANAME}.${TABLENAME}(lat, lon, timestamp, stat) VALUES($1, $2, $3, $4)`, [dat.lat, dat.lng, dat.status_lasttime, dat.status] )
        .catch(e => console.error(e.stack))
      }
    });
}

setInterval(askForData, 10000);