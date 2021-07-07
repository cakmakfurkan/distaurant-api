var express = require('express');
var bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mwBasicAuth = require('./src/basicAuth')
const port = process.env.PORT || 3000; 
var app = express();

app.use(helmet());
app.use(bodyParser.json());
app.use(cors({
    credentials: true,
    origin: true,
}));
app.use(morgan('combined'));

app.use(mwBasicAuth)

require('./distaurant/index')(app)

// Start server
app.listen(port);
console.log("Server running on port " + port);
