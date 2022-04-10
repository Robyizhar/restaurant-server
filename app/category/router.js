const router = require('express').Router();

// require multer
const multer = require('multer');

// require os
// const os = require('os');

// import product controller 
const CategoryController = require('./controller'); 

// pasangkan route endpoint 
router.get('/category', CategoryController.index);
router.post('/category', multer().none(), CategoryController.store);
router.put('/category/:id', multer().none(), CategoryController.update);
router.delete('/category/:id', CategoryController.destroy);

// export router 
module.exports = router;