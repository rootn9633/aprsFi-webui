const psql = {
  user: 'username',
  host: 'localhost',
  database: 'database',
  password: 'password',
  port: 5432,
}

const SCHEMANAME = 'schema'
const TABLENAME = 'table'

module.exports = {
  psql: psql,
  schema: SCHEMANAME,
  table: TABLENAME
}