// import `router` dan `multer`
const router = require('express').Router();
const multer = require('multer');
// import `cartController`
const cartController = require('./controller');
// route untuk `update` cart
router.put('/carts', multer().none(), cartController.update);
router.get('/carts', cartController.index);
// export router
module.exports = router;
