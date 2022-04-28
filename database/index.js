// import package mongoose
const mongoose = require('mongoose');

// kita import konfigurasi terkait MongoDB dari `app/config.js`
const { dbHost, dbName, dbPort, dbUser, dbPass } = require('../app/config');

// connect ke MongoDB menggunakan konfigurasi yang telah kita import  /home/robbyizh/mongodb-0.sock
mongoose.connect(`mongodb://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}`, {useNewUrlParser: true, useUnifiedTopology: true});
// mongoose.connect("mongodb://root:root@%2Fhome%2Frobbyizh%2Fmongodb-0.sock/restaurant", {useNewUrlParser: true, useUnifiedTopology: true});

// simpan koneksi dalam const `db`
const db = mongoose.connection;

// export `db` supaya bisa digunakan oleh file lain yang membutuhkan
module.exports = db;