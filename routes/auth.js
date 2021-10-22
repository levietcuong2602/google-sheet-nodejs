const router = require('express').Router();

const asyncMiddleware = require('../middlewares/wrapAsync');
const authController = require('../controllers/auth');

router.get('/auth/login', asyncMiddleware(authController.login));

module.exports = router;
