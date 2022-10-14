const EventEmitter = require('events');
const http = require('http');

class Sales extends EventEmitter {
    constructor() {
        super();
    }
}

const myEmitter = new Sales();

myEmitter.on("newSale", () => {
    console.log('There was a new sale');
});

myEmitter.on("newSale", () => {
    console.log('Customer name: Rohit');
});

myEmitter.on("newSale", (stock) => {
    console.log(`stock remaining: ${stock}`);
});

myEmitter.emit("newSale");
myEmitter.emit("newSale", 10);

///////////////////////////////////////////////////////////////////////
/// creating a small web server

const server = http.createServer();

server.on("request", (req, res) => {    
    console.log(`Request received !!`);
    console.log(`${req.url}`);
    res.end(`Request received !!`);
});

server.on("request", (req, res) => {  
    console.log(`Another request received !!`);  
});

server.on('close', () => {
    console.log(`Server closed !!`);
});

server.listen(8000, '127.0.0.1', () => {
    console.log(`Waiting for requests...`);
});

