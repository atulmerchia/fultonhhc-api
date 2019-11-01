require('dotenv').config();
const path = require('path');

const PORT = process.env.PORT || 8000;
const express = require('express');
const app = express();
const firebaseConfig = require(path.join(__dirname, `./config/firebase-${process.env.DB_MODE}.json`));
const Firebase = require('firebase').initializeApp(firebaseConfig);

app.listen(PORT, () => console.log(`Server running on port ${PORT}!`));
