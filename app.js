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
  dbName: "shorturl"
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
      res.redirect(match[0].original_url)
    })
    .catch((error) => {
      console.log('Redirect Error:', error);
      res.json({error: 'Server error'});
    });

});


app.post('/api/shorturl', (req, res) => {
  let url = req.body.url;

  if (url.length === 0) {
    res.json({error: 'Invalid URL'});
  } else {

    let reURL = /(http|https)\:\/\/\w+.?\w+\.\w{2,3}\/?$/gmi;
    let matchUrl = url.match(reURL);
    if (matchUrl !== null) {
      console.log(matchUrl, matchUrl[0]);

      // let totalDocuments;
      // urlModel.count()
      //   .then((amount) => {
      //     totalDocuments = amount;
      //   })
      //   .catch((error) => {
      //     // console.log(error);
      //     res.json({error: 'Server error'});
      //   });

      // console.log(matchUrl)

      urlModel.find({original_url: matchUrl[0]})
        .then((match) => {

          // Condicional coincidencia URL consultada
          if (match.length === 0) {
            console.log(match, totalDocuments);

            const reLookup = /\w+.?\w+\.\w{2,3}\/?$/gi;
            let matchDomain = matchUrl[0].match(reLookup);

            console.log(matchDomain)

            let domainPure = "";
            let reDomainPure = /\/$/;
            let indexDomain = matchDomain[0].search(reDomainPure);
            console.log(indexDomain)
            if (domainPure < 0) {
              domainPure = matchDomain[0].slice(0,indexDomain);
            } else if (domainPure >= 0){
              domainPure = matchDomain[0];
            };

            console.log(matchDomain, domainPure);

            // Coincidencia REGEX dominio
            if (matchDomain === null) {
              res.json({error: 'Invalid Hostname'});
            } else if (matchDomain !== null) {
              // Busca el dominio si existe
              dns.lookup(domainPure, (err, address, family) => {
                // Existe y se guarda
                if (err === null) {


                  let totalDocuments;
                  urlModel.count()
                    .then((amount) => {
                      // totalDocuments = amount;

                      let myUrl = new urlModel({
                        original_url: matchUrl[0],
                        short_url: amount  + 1
                        // short_url: totalDocuments  + 1

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
                          console.log('Error Save DB ->', error);
                          res.json({error: 'Server error'});
                        });
                    })
                    .catch((error) => {
                      // console.log(error);
                      res.json({error: 'Server error'});
                    });



                  // let myUrl = new urlModel({
                  //   original_url: matchUrl[0],
                  //   short_url: totalDocuments  + 1
                  // });
                  //
                  // myUrl.save()
                  //   .then((saved) => {
                  //     console.log("saved");
                  //     // console.log(saved)
                  //     res.json({
                  //       original_url: saved.original_url,
                  //       short_url: saved.short_url
                  //     });
                  //   })
                  //   .catch((error) => {
                  //     console.log('Error Save DB ->', error);
                  //     res.json({error: 'Server error'});
                  //   });
                } else if (err === null) {
                  res.json({error: "Invalid Hostname"});
                };
              });
            };



          } else {
            res.json({
              original_url: match[0].original_url,
              short_url: match[0].short_url
            });
          }

        })
        .catch((error) => {
          console.log(error);
          res.json({error: 'Server error'});
        })



    } else {
      res.json({error: 'Invalid URL'});
    }
  };
});



app.use('/assets', express.static(__dirname + '/public'));

module.exports = app;
