const { createCipheriv } = require('crypto');
const fs = require('fs');
const superagent = require('superagent');

/// promisifying read/write file operations
const readFilePromise = (file) => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err) reject('File was not found');
      resolve(data);
    });
  });
};

const writeFilePromise = (file, data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, err => {
      console.log(`data bein written = ${data}`)  
      if (err) reject('Could not write to file');
      resolve('success');
    });
  });
};

/// method 1 - without using promises
// fs.readFile('dog.txt', (err, data) => {
//     console.log(`Breed: ${data}`);

//     superagent
//         .get(`https://dog.ceo/api/breed/${data}/images/random`)
//         .then(res => {
//             console.log(res.body.message);
//             fs.writeFile('dog-img.txt', res.body.message, (err) => {
//                 console.log('random dog image saved to dog-img.txt');
//             });
//         }).catch(err => {
//             console.log(`error = ${err.message}`);
//         });
// });

/// method 2 - using .then() and .catch() methods to consume promises by chaining
// readFilePromise('dog.txt')
//   .then((data) => {
//     console.log(`Breed: ${data}`);
//     return superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);
//   })
//   .then((res) => {
//     console.log(res.body.message);
//     return writeFilePromise('dog-img.txt', res.body.message)
//   })
//   .then((res) => {
//     console.log(res);
//   })
//   .catch((err) => {
//     console.log(`error = ${err.message}`);
//   });


/// method 3 - consuming promises by chaninig + async + await 
const getDogPic = async() => {
    try {
        const data = await readFilePromise('dog.txt');
        console.log(`Breed: ${data}`);

        const res1Promise = superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);
        const res2Promise = superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);
        const res3Promise = superagent.get(`https://dog.ceo/api/breed/${data}/images/random`);
        
        const all = await Promise.all([res1Promise, res2Promise, res3Promise]);
        const images = all.map(e => e.body.message);
        console.log(images);

        const writeRes = await writeFilePromise('dog-img.txt', images.join('\n'))
        console.log(writeRes);
    } catch(err) {
        console.log(`error = ${err}`);
        throw(err);
    }
    return "test value";
}

/*
console.log('1: Will get doc pics');
getDogPic().then(res => {
    console.log(res);
    console.log('2: Done getting doc pics');
}).catch(err => {
    console.log(`[ERROR]`);
});
*/

console.log('1: Will get doc pics');
(async () => {
    try {
        const res = await getDogPic();
        console.log(res);
        console.log('2: Done getting doc pics');
    } catch(err) {
        console.log(`[ERROR]`);
    }
})();

