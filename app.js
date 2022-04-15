var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// import router dari masing-masing module
const Index = require('./routes/index');
const ProductRouter = require('./app/product/router');
const CategoryRouter = require('./app/category/router');
const TagRouter = require('./app/tag/router');
const AuthRouter = require('./app/auth/router');
const { decodeToken } = require('./app/auth/middleware');
const Area = require('./app/wilayah/router');
const deliveryRouter = require('./app/delivery-addresses/router');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(decodeToken());

// gunakan router yang sudah di require
app.use('/', Index);
app.use('/', ProductRouter);
app.use('/', CategoryRouter);
app.use('/', TagRouter);
app.use('/', AuthRouter);
app.use('/', Area);
app.use('/', deliveryRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');

});

module.exports = app;
