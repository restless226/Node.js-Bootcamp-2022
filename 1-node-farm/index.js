const fs = require('fs');
const http = require('http');
const url = require('url');
const replaceTemplate = require('./modules/replaceTemplate');
const slugify = require('slugify');

///////////////////////////////////////////////////////////////////////////////
// FILES

/* Blocking/Synchronous way */
// const textInput = fs.readFileSync('./txt/input.txt', 'utf-8');
// console.log(textInput);
// const textOutput = `this is what we know about avocado: ${textInput} \ncreated on ${Date.now()}`;
// fs.writeFileSync('./txt/output.txt', textOutput);
// console.log('File written !!');
//
/* 
Non-Blocking/Asynchronous way
can lead to "callback-hell"
*/
// fs.readFile('./txt/start.txt', 'utf-8', (err1, data1) => {
//     if (err1) return console.log('err1 = ' + `${err1}` + '\n');
//     console.log('data1 = ' +  `${data1}` + '\n');
//
//     fs.readFile(`./txt/${data1}.txt`, 'utf-8', (err2, data2) => {
//         if (err1) return console.log('err2 = ' + `${err2}` + '\n');
//         console.log('data2 = ' + `${data2}` + '\n');
//
//         fs.readFile('./txt/append.txt', 'utf-8', (err3, data3) => {
//             if (err3) return console.log('err3 = ' + `${err3}` + '\n');
//             console.log('data3 = ' + `${data3}` + '\n');
//
//             fs.writeFile('./txt/final.txt', `${data2}\n${data3}`, 'utf-8', (err4) => {
//                 if (err4) return console.log('err4 = ' + `${err4}` + '\n');
//                 console.log('File "final.txt" written successfully');
//             });
//         });
//     });
// });
// console.log('Reading File start.txt...');


///////////////////////////////////////////////////////////////////////////////
// SERVER

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObject = JSON.parse(data);

const templateOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`, 'utf-8');
const templateCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf-8');
const templateProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`, 'utf-8');

const slugs = dataObject.map((e) => slugify(e.productName, {
    replacement: '-', 
    lower: true,
}));

console.log(slugs);

console.log(slugify('Fresh Avocodos', {
    replacement: '-',
    lower: true,
}));

const server = http.createServer((req, res) => {
    // console.log("req.url = " + `${req.url}`);
    const {query, pathname} = url.parse(req.url, true);

    /// overview page
    if (pathname === '/' || pathname === '/overview') {
        res.writeHead(200, {'Content-type': 'text/html'});
        const cardsHtml = dataObject.map((e) => replaceTemplate(templateCard, e)).join('');
        // console.log("cardsHtml" + cardsHtml + '/n');
        const output = templateOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);
        res.end(output);
    } 
    /// product page
    else if (pathname === '/product') {
        // console.log(query);
        res.writeHead(200, {'Content-type': 'text/html'});
        const product = dataObject[query.id];
        const output = replaceTemplate(templateProduct, product);
        res.end(output);
    } 
    /// API page
    else if (pathname === '/api') {
        res.writeHead(200, {'Content-type': 'appliation/json'});
        res.end(dataObject);
    } 
    /// Not found case
    else {
        res.writeHead(404, {
            'Content-type': 'text/html',
            'my-own-header': 'hello world'
        });
        res.end('<h1> Page not found !!</h1>');
    }
});

server.listen(8000, '127.0.0.1', () => {
    console.log('listening to requests on port 8000...');
});