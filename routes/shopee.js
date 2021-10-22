const router = require('express').Router();

const asyncMiddleware = require('../middlewares/wrapAsync');
const shopeeController = require('../controllers/shopee');

router.post('/shopee/payment', asyncMiddleware(shopeeController.shopeePayment));

module.exports = router;
