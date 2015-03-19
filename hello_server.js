var http = require('http');

var server = http.createServer(function(req, res) {
	res.write('Hello!');
	res.end();
});

server.listen(3000, "127.0.0.1", function() {
	console.log("Listening on port 3000")
});

module.exports = server;