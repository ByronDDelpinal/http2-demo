// Require necessary libraries
const spdy = require('spdy');
const express = require('express');
const path = require('path');
const fs = require('fs');

// Define global variables
const app = express();
const port = 3000;
const options = {
  key: fs.readFileSync(__dirname + '/server.key'),
  cert:  fs.readFileSync(__dirname + '/server.crt'),
  title: 'HTTP/2 Example'
};

app.use(express.static('app/assets'));

app.engine('ntl', function (filePath, options, callback) {
  fs.readFile(filePath, function (err, content) {
    if (err) return callback(err);

    var rendered = content.toString()
      .replace('#title#', '<title>' + options.title + '</title>');

    return callback(null, rendered);
  })
})

app.set('views', './app/views');
app.set('view engine', 'ntl');

// Define route for index page
app.get('/', function (req, res) {
  const headerCSSFile = fs.readFile('app/assets/css/header.css');
  const heroImageFile = fs.readFile('app/assets/images/hero.jpeg');
  const mainJSFile = fs.readFile('app/assets/javascript/main.js');
  const navigationCSSFile = fs.readFile('app/assets/css/navigation.css');

  if (res.push) {
    // Push navigation style css file
    let navigationStream = res.push('app/assets/css/navigation.css', {
      req: {'accept': '**/*'},
      res: {'content-type': 'text/css'}
    });

    navigationStream.on('error', err => {
      console.log(err);
    });

    navigationStream.end(navigationCSSFile);

    // Push header style css file
    let headerStream = res.push('/app/assets/css/header.css', {
      req: {'accept': '**/*'},
      res: {'content-type': 'text/css'}
    });

    headerStream.on('error', err => {
      console.log(err);
    });

    navigationStream.end(headerCSSFile);

    // Push hero image file
    let heroStream = res.push('/app/assets/images/hero.jpeg', {
      req: {'accept': '**/*'},
      res: {'content-type': 'image/jpeg'}
    });

    heroStream.on('error', err => {
      console.log(err);
    });

    navigationStream.end(heroImageFile);

    // Push main javascript file
    let mainStream = res.push('/app/assets/javascript/main.js', {
      req: {'accept': '**/*'},
      res: {'content-type': '/javascript'}
    });

    mainStream.on('error', err => {
      console.log(err);
    });

    mainStream.end(mainJSFile);
  }

  res.render('index', options);
});

spdy
  .createServer(options, app)
  .listen(port, (error) => {
    if (error) {
      console.error(error)
      return process.exit(1)
    } else {
      console.log('Listening on port: ' + port + '.')
    }
  });
