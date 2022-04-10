// (1) import package mongoose
const mongoose = require('mongoose');

// (2) kita import konfigurasi terkait MongoDB dari `app/config.js`
const { dbHost, dbName, dbPort, dbUser, dbPass } = require('../app/config');

// (3) connect ke MongoDB menggunakan konfigurasi yang telah kita import 
mongoose.connect(`mongodb://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}`, {useNewUrlParser: true, useUnifiedTopology: true});

// (4) simpan koneksi dalam const `db`
const db = mongoose.connection;

// (5) export `db` supaya bisa digunakan oleh file lain yang membutuhkan
module.exports = db;