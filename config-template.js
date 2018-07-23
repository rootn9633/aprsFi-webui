const psql = {
  user: 'username',
  host: 'host',
  database: 'database',
  password: 'password',
  port: 5432,
}

const database = {
  schema: 'schema',
  table: 'table',
}

const INTERVAL = 10000

module.exports = {
  psql,
  database,
  interval: INTERVAL,
}