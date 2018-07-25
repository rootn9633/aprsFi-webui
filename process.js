const { Pool, Client } = require('pg')

const config = require('./config')

const [SCHEMA, TABLE] = [config.database.schema, config.database.table]

const geojsonConvert = async (req, res) => {
  const pool = new Pool(config.psql)

  const queryres = await pool.query(`SELECT * FROM ${SCHEMA}.${TABLE} WHERE stat != '0'`)
  const geo = queryres.rows.map((row) => {
    const latitude = parseFloat(row.lat)/100
    const longitude = parseFloat(row.lon)/100
    const data = row.stat.split('-')
    const pm25 = parseInt(data[0].substring(5, data[0].length))
    return { 
      type: "Feature", 
      properties: { 
        latitude, longitude, time: 1, id: "route1", name: "Gimme", pm25 
      }, 
      geometry: {
        type: "Point", 
        coordinates: [longitude, latitude]
      }
    }
  })

  await pool.end()
  
  res.send(JSON.stringify({
    type: "FeatureCollection",
    crs: { type: "name", properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" } },
    "features": geo
  }))
}

module.exports = { geojsonConvert }