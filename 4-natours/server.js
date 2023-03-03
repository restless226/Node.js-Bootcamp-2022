const dotenv = require('dotenv');
const mongoose = require('mongoose');

// catching uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception!!! 💥 Shutting Down!!!');
  console.log(err);
  // console.log(err.name, err.msg);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB connected successfully!!!');
  })
  .catch((err) => {
    console.log(`DB error = ${err.message}`);
    process.exit(-1);
  });

// console.log(app.get('env'));
// console.log(process.env);
// const testTour = new Tour({
//   name: 'The Park Camper',
//   price: 997,
// });
// testTour
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
//   .catch((err) => {
//     console.log('ERROR!!!', err);
//   });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`server listening on port ${port}...`);
});

// safety net - unhandled promise rejection
process.on('unhandledRejection', (err) => {
  console.log('Unhandled Rejection!!! 💥 Shutting Down Server!!!');
  console.log('unhandledRejection err = ', err);
  // console.log('unhandledRejection err.name = ', err.name);
  // console.log('unhandledRejection err.msg = ', err.msg);
  server.close(() => {
    process.exit(1);
  });
});
