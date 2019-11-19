require('dotenv').config();

const PORT = process.env.PORT || 8000;
const express = require('express');
const app = express();
const bodyParser = require('body-parser');


app.use(require('cors')())
app.use(bodyParser.json());

const Libraries = require('./libraries');
const endpoints = require('./endpoints.json');

for (const endpoint_url in endpoints) {
  const endpoint_info = endpoints[endpoint_url];
  for (const httpAction in endpoint_info) {
    const { library, options, err_message } = endpoint_info[httpAction];
    console.log(`Building endpoint - ${httpAction} ${endpoint_url}`);
    app[httpAction](endpoint_url, (req, res) => {
      console.log(`${httpAction} request @ ${endpoint_url}`);

      Libraries[library][httpAction](options, req)
        .then(data => res.status(200).json(data))
        .catch(err => {
          console.log(err);
          res.status(500).json({err: err_message})
        })
    })
  }
}

// console.log(app._router.stack);

app.listen(PORT, () => console.log(`Server running on port ${PORT}!`));
