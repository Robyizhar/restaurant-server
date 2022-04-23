const router = require('express').Router();
const InvoiceController = require('./controller');

router.get('/invoices/:order_id', InvoiceController.show);
// router.delete('/products/:id', ProductController.destroy);
module.exports = router;
