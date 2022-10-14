// console.log(arguments);
// console.log(require("module").wrapper);

let C = require('./test-module-1');
let c = new C();

// module.exports
console.log(c.add(4, 5));
console.log(c.multiply(4, 5));
console.log(c.divide(40, 5));

// exports
c = require('./test-module-2');

console.log(c.add(4, 5));
console.log(c.multiply(4, 5));
console.log(c.divide(40, 5));

const {add, multiply, divide} = require('./test-module-2');

console.log(add(4, 5));
console.log(multiply(4, 5));
console.log(divide(40, 5));

// caching
require('./test-module-3')(4);
require('./test-module-3')(5);
require('./test-module-3')(6);