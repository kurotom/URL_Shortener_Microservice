let express = require("express");
let app = express();

let bodyParser = require("body-parser");
let mongoose = require('mongoose');

require('dotenv').config();

const dns = require('dns');

// Import Model
let urlModel = require('./db_Model/url_model.js');


// MongoDB

const settingsConnection = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: process.env.DBNAME
}

mongoose.connect(
    process.env.URI_MONGO,
    settingsConnection
  )
  .then((response) => {
    // console.log(response.connections[0].name)
    console.log("Connected!");
  })
  .catch((error) => {
    console.log(error);
  });
//


app.use(bodyParser.urlencoded({extended: false}));


app.get('/', (req, res) => {
  let absPath = __dirname + '/views/index.html';
  res.sendFile(absPath);
});



app.get('/api/shorturl/:id', (req, res) => {
  let id = req.params.id;

  urlModel.find({short_url: id})
    .then((match) => {
      // console.log('url match', match);
      res.redirect(match[0].original_url);
    })
    .catch((error) => {
      // console.log('Redirect Error:', error);
      res.json({error: 'Server error'});
    });

});


app.post('/api/shorturl', (req, res) => {
  let url = req.body.url;

  if (url.length > 0) {
    try {
      let urlObj = new URL (req.body.url);
      // console.log("--->", urlObj.hostname);

      dns.lookup(urlObj.hostname, (err, address, family) => {
        // console.log(err, address, family);

        if (err === null) {
          // console.log(urlObj.href, urlObj)
          urlModel.find({original_url: urlObj.href})
            .then((match) => {
              // console.log('MATCH', match);

              if (match.length === 0) {

                urlModel.count()
                  .then((amount) => {
                    let myUrl = new urlModel({
                      original_url: urlObj.href,
                      short_url: amount  + 1
                    });

                    myUrl.save()
                      .then((saved) => {
                        console.log("saved");
                        // console.log(saved)
                        res.json({
                          original_url: saved.original_url,
                          short_url: saved.short_url
                        });
                      })
                      .catch((error) => {
                        // console.log('Error Save DB ->', error);
                        res.json({error: 'Server error'});
                      });
                  })
                  .catch((error) => {
                    // console.log(error);
                    res.json({error: 'Server error'});
                  });

              } else if (match.length > 0) {
                res.json({
                  original_url: match[0].original_url,
                  short_url: match[0].short_url
                });
              };
            })
            .catch((error) => {
              // console.log(error);
              res.json({error: 'Server Error'});
            });
        } else if (err !== null) {
          // res.json({error: "Invalid Hostname"})
          res.json({error: 'invalid url'});
        };
      });
    } catch (error) {
      // console.log('URL error --->', error);
      res.json({error: 'invalid url'});
    }
  } else {
    res.json({error: 'invalid url'});
  };
});



app.use('/assets', express.static(__dirname + '/public'));

module.exports = app;
