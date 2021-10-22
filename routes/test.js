const router = require('express').Router();

const asyncMiddleware = require('../middlewares/wrapAsync');
const testController = require('../controllers');

router.get('/test/cert', asyncMiddleware(testController.test));

router.all('/test/callback', asyncMiddleware(testController.callback));

module.exports = router;
