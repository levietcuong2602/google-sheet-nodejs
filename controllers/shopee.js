const shopeeService = require('../services/shopee');

const shopeePayment = async (req, res) => {
  const result = await shopeeService.shopeePayment({ ...req.body });
  return res.send({ status: 1, result });
};

module.exports = { shopeePayment };
