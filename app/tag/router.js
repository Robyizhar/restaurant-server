const router = require('express').Router();

// require multer
const multer = require('multer');

// require os
// const os = require('os');

// import product controller 
const TagController = require('./controller'); 

// pasangkan route endpoint 
router.get('/tag', TagController.index);
router.post('/tag', multer().none(), TagController.store);
router.put('/tag/:id', multer().none(), TagController.update);
router.delete('/tag/:id', TagController.destroy);

// export router 
module.exports = router;