require('dotenv').config();

const PORT = process.env.PORT || 8000;
const express = require('express');
const app = express();

const Firebase = require('./firebase');

app.listen(PORT, () => console.log(`Server running on port ${PORT}!`));
