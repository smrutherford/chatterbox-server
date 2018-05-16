var fs = require('fs');
var path = require('path');

var storage = [];

var headers = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10, // Seconds.
  'Content-Type': 'text/plain'
};

var respond = function(response, data, statusCode, contentType) {
  statusCode = statusCode || 200;
  headers['Content-Type'] = contentType || headers['Content-Type'];
  response.writeHead(statusCode, headers);
  response.end(data);
};

var requestHandler = function(request, response) {
  
  if (request.url === '/' || request.url.includes('username')) {
    fs.readFile(path.join(__dirname, '..', 'client', 'index.html'), 'utf8', function(err, data) {
      if (err) { throw err; }
      respond(response, data, 200, 'text/html');
    });  
    fs.readFile(path.join(__dirname, 'storage.txt'), 'utf8', function(err, data) {
      if (err) { throw err; }
      storage = JSON.parse(data).results;
    });
  } else if (request.url !== '/classes/messages' && request.url !== '/classes/messages?order=-createdAt') {
    respond(response, 'incorrect URL', 404);
  } else if (request.method === 'POST') {
    request.on('data', (chunk) => {
      var message = JSON.parse(chunk.toString());
      storage.push(message);
      fs.writeFile(path.join(__dirname, 'storage.txt'), JSON.stringify({ results: storage }), function(err) {
        if (err) { throw err; }
      });
      respond(response, null, 201);
    });
  } else if (request.method === 'GET') {
    
    fs.readFile(path.join(__dirname, 'storage.txt'), 'utf8', function(err, data) {
      if (err) { throw err; }
      respond(response, data, 200);
    });
    
  } else {
    respond(response, data, 200);
  }

};

exports.handleRequest = requestHandler;
exports.requestHandler = requestHandler;

//module.exports = requestHandler;