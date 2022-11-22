let express = require("express");
let app = express();



app.get('/', (req, res) => {
  let absPath = __dirname + '/views/index.html';
  res.sendFile(absPath);
});



app.get('/api/whoami', (req, res) => {
  let ip = req.ip;
  let lang = req.get('Accept-Language').split(',').slice(0,2);
  let agent = req.get('User-Agent');

  res.json({
    ipaddress: ip,
    language: lang.join(","),
    software: agent
  })
});

app.use('/assets', express.static(__dirname + '/public'));

module.exports = app;
