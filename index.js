// var subdomain = require('express-subdomain');
var express = require('express');
var bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
// const checkJwt = require('./src/index')
const mwBasicAuth = require('./src/basicAuth')
const port = process.env.PORT || 3000; 
var app = express();
// var app = express.Router();

app.use(helmet());
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('combined'));

// app.use(subdomain('app', app));
app.use(mwBasicAuth)
// app.use(checkJwt);

require('./distaurant/index')(app)

// Start server
app.listen(port);
console.log("Server running on port " + port);


// app.use(function (err, req, res, next) {
//     if (err.name == "UnauthorizedError") {
//         res.status(403).send({
//             success: false,
//             message: 'Unauthorized Error'
//         })
//     } 

// })