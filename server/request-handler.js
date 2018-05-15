var fs = require('fs');
var path = require('path');
/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/
var storage = [];
// var storage = [{text: '', roomname: '', username: ''}, {text: '', roomname: '', username: ''}];

var exampleResponseObject = {
  results: storage
};

var fileOutput = fs.createReadStream(path.join(__dirname, 'storage.txt'));
// var fileOutput = fs.createReadStream(path.join(__dirname, 'storage.txt'));

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};

var requestHandler = function(request, response) {
  
  console.log('Serving request type ' + request.method + ' for url ' + request.url);
  
  if (request.url === '/' || request.url.includes('username')) {
    fs.readFile(path.join(__dirname, '..', 'client', 'index.html'), 'utf8', function(err, data) {
      if (err) { throw err; }
      response.writeHead(200, {'Content-Type': 'text/html'});
      response.write(data);
      response.end();
    });  
    fs.readFile(path.join(__dirname, 'storage.txt'), 'utf8', function(err, data) {
      if (err) { throw err; }
      storage = JSON.parse(data).results;
      console.log('Data Loaded');
    });
    // fileOutput.on('data', function(data) {
    //   storage = JSON.parse(data.toString()).results;
    // });

  } else if (request.url.includes('client')) {
    fs.readFile(path.join(__dirname, '..', request.url), 'utf8', function(err, data) {
      if (err) { throw err; }
      if (request.url.includes('.css')) {
        response.writeHead(200, {'Content-Type': 'text/css'});
      } else {
        response.writeHead(200, {'Content-Type': 'text/javascript'});
      }

      response.write(data);
      response.end();
    });
  } else if (request.url !== '/classes/messages' && request.url !== '/classes/messages?order=-createdAt') {
    var statusCode = 404;
    var headers = defaultCorsHeaders;
    headers['Content-Type'] = 'text/plain';
    response.writeHead(statusCode, headers);
    response.end(JSON.stringify({ results: 'Not Correct URL' }));

  } else if (request.method === 'POST') {
    request.on('data', (chunk) => {
      var message = JSON.parse(chunk.toString());
      console.log(message.username);
      if (message.username === undefined || message.username === '') {
        var statusCode = 405;
        var headers = defaultCorsHeaders;
        headers['Content-Type'] = 'text/plain';
        response.writeHead(statusCode, headers);
        response.end();
      } else if (message.text === undefined || message.text === '') {
        var statusCode = 406;
        var headers = defaultCorsHeaders;
        headers['Content-Type'] = 'text/plain';
        response.writeHead(statusCode, headers);
        response.end();
      } else if (message.roomname === undefined || message.roomname === '') {
        var statusCode = 407;
        var headers = defaultCorsHeaders;
        headers['Content-Type'] = 'text/plain';
        response.writeHead(statusCode, headers);
        response.end();
      } else {
        var statusCode = 201;
        var headers = defaultCorsHeaders;
        headers['Content-Type'] = 'text/plain';
        response.writeHead(statusCode, headers);
        storage.push(message);
        console.log(storage);
        fs.writeFile(path.join(__dirname, 'storage.txt'), JSON.stringify({ results: storage }), function(err) {
          if (err) { throw err; }
          console.log('saved');
        });
        response.end(JSON.stringify({ results: storage }));
      }
      
    });
  } else if (request.method === 'GET') {
    
    fs.readFile(path.join(__dirname, 'storage.txt'), 'utf8', function(err, data) {
      if (err) { throw err; }
      var statusCode = 200;
      var headers = defaultCorsHeaders;
      headers['Content-Type'] = 'text/plain';
      response.writeHead(statusCode, headers);
      response.write(data);
      response.end();
    });
    
    // fileOutput.on('data', function(data) {
    //   var statusCode = 200;
    //   var headers = defaultCorsHeaders;
    //   headers['Content-Type'] = 'text/plain';
    //   response.writeHead(statusCode, headers);
    //   response.write(data.toString());
    //   response.end();
    // });
    
  } else {
    
    var statusCode = 200;
    var headers = defaultCorsHeaders;
    headers['Content-Type'] = 'text/plain';
    response.writeHead(statusCode, headers);
    response.end();
  }

};

exports.handleRequest = requestHandler;
exports.requestHandler = requestHandler;
exports.defaultCorsHeaders = defaultCorsHeaders;

//module.exports = requestHandler;