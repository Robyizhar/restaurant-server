const router = require('express').Router();
const multer = require('multer');

const addressController = require('./controller');

router.get('/delivery-addresses', addressController.index);
router.post('/delivery-addresses', multer().none(), addressController.store);
router.put('/delivery-addresses/:id', multer().none(), addressController.update);
router.delete('/delivery-addresses/:id', addressController.destroy);

module.exports = router;
