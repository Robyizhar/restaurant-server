const router = require('express').Router();

// require multer
const multer = require('multer');

// require os
const os = require('os');

// import product controller 
const ProductController = require('./controller'); 

// pasangkan route endpoint 
router.get('/products', ProductController.index);
router.post('/products', multer({dest: os.tmpdir()}).single('image'), ProductController.store);
router.put('/products/:id', multer({dest: os.tmpdir()}).single('image'), ProductController.update);
router.delete('/products/:id', ProductController.destroy);

// export router 
module.exports = router;