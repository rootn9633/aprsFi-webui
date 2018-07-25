const express = require('express')
const app = express()
const cors = require('cors');

app.use(cors());

app.get('/', async (req, res) => {
  const { Pool, Client } = require('pg')

  // pools will use environment variables
  // for connection information
  const pool = new Pool({
    user: 'rootn',
    host: 'localhost',
    database: 'rootn',
    password: 'Howard131',
    port: 5432,
  })

  // you can also use async/await
  const queryres = await pool.query("SELECT * FROM gps WHERE stat != '0'")
  console.log(queryres.rows);
  const geo = queryres.rows.map((row) => {
    const latitude = parseFloat(row.lat) / 100
    const longitude = parseFloat(row.lon) / 100
    return { "type": "Feature", "properties": { "latitude": latitude, "longitude": longitude, "time": 1, "id": "route1", "name": "Gimme" }, "geometry": { "type": "Point", "coordinates": [longitude, latitude] } }
  })
  await pool.end()
  // console.log(geo.slice(0, 17));
  res.send(JSON.stringify({
    "type": "FeatureCollection",
    "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
    "features": geo
  }))
})

app.listen(3000, () => console.log('Example app listening on port 3000!'))