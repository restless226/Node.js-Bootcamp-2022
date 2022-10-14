const fs = require('fs');
const server = require('http').createServer();

server.on('request', (req, res) => {
    /// solution 1 (without using streams)
    // fs.readFile('test-file.txt', (err, data) => {
    //     if (err) console.log(`error = ${err}`);
    //     else res.end(data);
    // });

    /// solution 2 (using streams)
    // const readable = fs.createReadStream('test-file.txt');
    // readable.on('data', (chunk) => {
    //     res.write(chunk);
    // });
    // readable.on('end', () => {
    //     res.end();
    // });
    // readable.on('error', (error) => {
    //     console.log(`error = ${error}`);
    //     res.statusCode(500);
    //     res.end('File not found !!');
    // });

    /// solution 3 
    const readable = fs.createReadStream('test-file.txt');
    readable.pipe(res);     // readableSource.pipe(writableDestination) 
});

server.listen(8000, '127.0.0.1', () => {
    console.log(`Server is listening...`);
});