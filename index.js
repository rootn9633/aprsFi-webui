const express = require('express')
const app = express()
const cors = require('cors');

const process = require('./process')

app.use(cors());

app.get('/', process.geojsonConvert)

app.listen(3000, () => console.log('server running on port 3000!'))