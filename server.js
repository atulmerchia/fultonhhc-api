require('dotenv').config();

const PORT        = process.env.PORT || 8000;
const express     = require('express');
const app         = express();
const bodyParser  = require('body-parser');
const busboy      = require('express-busboy');

const Libraries   = require('./libraries');
const endpoints   = require('./endpoints.json');


app.use(require('cors')())
app.use(bodyParser.json());

busboy.extend(app, { upload: true, path: './tmp', allowedPath: /./ })

for (const endpoint_url in endpoints) {
  const endpoint_info = endpoints[endpoint_url];
  for (const httpAction in endpoint_info) {
    const { library, options, err_message, public } = endpoint_info[httpAction];
    console.log(`Building endpoint - ${public ? "PUBLIC" : "SECURE"} - ${httpAction.toUpperCase().padEnd(6)} ${endpoint_url}`);
    app[httpAction](endpoint_url, async (req, res) => {
      console.log(`${httpAction} request @ ${req.url}`);

      if (public || await Libraries.Firebase.authenticate(req.headers.authorization))
        Libraries[library][httpAction](options, req)
          .then(data => res.status(200).json(data))
          .catch(err => {
            console.log(err);
            res.status(500).json({err: err_message})
          })
      else
        res.status(403).json({ err: "Invalid authorization" })
    })
  }
}

// console.log(app._router.stack);

app.listen(PORT, () => console.log(`Server running on port ${PORT}!`));
