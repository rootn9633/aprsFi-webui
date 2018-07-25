const express = require('express')
const app = express()
const cors = require('cors');
const path = require('path');

const process = require('./process')
const config = require('./config')

app.use(express.static('public'))
app.use(cors());

app.set('view engine', 'ejs')

app.get('/', (req, res) => res.render('main', { token: config.mapbox.token}))
app.get('/geoData', process.geojsonConvert)

app.listen(3000, () => console.log('server running on port 3000!'))