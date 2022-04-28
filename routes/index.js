var express = require('express');
var router = express.Router();
const ProductSeeder = require('../database/seeder/products')
const CategorySeeder = require('../database/seeder/categories')
const TagSeeder = require('../database/seeder/tags')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Home' });
});

router.get('/migrate/products', ProductSeeder.destroyAndMigrate);
router.get('/migrate/categories', CategorySeeder.destroyAndMigrate);
router.get('/migrate/tags', TagSeeder.destroyAndMigrate);

module.exports = router;
