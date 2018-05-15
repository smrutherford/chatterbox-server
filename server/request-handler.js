var fs = require('fs');
var path = require('path');

var storage = [];

var fileOutput = fs.createReadStream(path.join(__dirname, 'storage.txt'));

var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10, // Seconds.
  'Content-Type': 'text/plain'
};

var headers = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10, // Seconds.
  'Content-Type': 'text/plain'
};

var respond = function(response, data, statusCode) {
  statusCode = statusCode || 200;
  response.writeHead(statusCode, headers);
  response.end(data);
}

var requestHandler = function(request, response) {
  
  if (request.url === '/' || request.url.includes('username')) {
    fs.readFile(path.join(__dirname, '..', 'client', 'index.html'), 'utf8', function(err, data) {
      if (err) { throw err; }
      response.writeHead(200, {'Content-Type': 'text/html'});
      response.write(data);
      response.end();
    });  
    fs.readFile(path.join(__dirname, 'storage.txt'), 'utf8', function(err, data) {
      if (err) { throw err; }
      console.log('Data: ', data);
      storage = JSON.parse(data).results;
      
    });
  } else if (request.url.includes('client')) {
    fs.readFile(path.join(__dirname, '..', request.url), 'utf8', function(err, data) {
      if (err) { throw err; }
      if (request.url.includes('.css')) {
        response.writeHead(200, {'Content-Type': 'text/css'});
      } else {
        response.writeHead(200, {'Content-Type': 'text/javascript'});
      }
      
      // console.log(data);
      response.write(data);
      response.end();
    });
  } else if (request.url !== '/classes/messages' && request.url !== '/classes/messages?order=-createdAt') {
    respond(response, 'incorrect URL', 404);
  } else if (request.method === 'POST') {
    request.on('data', (chunk) => {
      var message = JSON.parse(chunk.toString());
      console.log(storage)
      storage.push(message);
      fs.writeFile(path.join(__dirname, 'storage.txt'), JSON.stringify({ results: storage }), function(err) {
        if (err) { throw err; }
        console.log('saved');
      });
      respond(response, null, 201);
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
    
  } else {
    
    var statusCode = 200;
    var headers = defaultCorsHeaders;
    headers['Content-Type'] = 'text/plain';
    response.writeHead(statusCode, headers);
    response.end();
  }


  // var statusCode = 404;
  
  // console.log('Request: ', request.body);

  // Request and Response come from node's http module.
  //
  // They include information about both the incoming request, such as
  // headers and URL, and about the outgoing response, such as its status
  // and content.
  //
  // Documentation for both request and response can be found in the HTTP section at
  // http://nodejs.org/documentation/api/

  // Do some basic logging.
  //
  // Adding more logging to your server can be an easy way to get passive
  // debugging help, but you should always be careful about leaving stray
  // console.logs in your code.
  

  // The outgoing status.
  

  // See the note below about CORS headers.
  

  // Tell the client we are sending them plain text.
  //
  // You will need to change this if you are sending something
  // other than plain text, like JSON or HTML.
  

  // .writeHead() writes to the request line and headers of the response,
  // which includes the status and all headers.
  

  // Make sure to always call response.end() - Node may not send
  // anything back to the client until you do. The string you pass to
  // response.end() will be the body of the response - i.e. what shows
  // up in the browser.
  //
  // Calling .end "flushes" the response's internal buffer, forcing
  // node to actually send all the data over to the client.  
};

exports.handleRequest = requestHandler;
exports.requestHandler = requestHandler;
exports.defaultCorsHeaders = defaultCorsHeaders;

//module.exports = requestHandler;