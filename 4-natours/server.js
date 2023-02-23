const dotenv = require('dotenv');
const mongoose = require('mongoose');

// catching uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.msg);
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
  })
  .then(() => {
    // console.log(connection.connections);
    console.log('DB connected successfully...');
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
  console.log('err = ', err);
  console.log(err.name, err.msg);
  console.log('UNHANDLED REJCTION! 💥 Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});
