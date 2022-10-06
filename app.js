const config = require('./config');
const express = require('express');

const app = express();

app.listen(config.PORT)