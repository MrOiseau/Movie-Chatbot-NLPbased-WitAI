'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const viewEngine = require('./config/viewEngine');
const initWebRoutes = require('./routes/web');


const app = express();

// config view engine
viewEngine(app);

//use body-parser to post data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// init all web routes
initWebRoutes(app);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => 
	console.log(`Filmmate running on port ${PORT}`
));