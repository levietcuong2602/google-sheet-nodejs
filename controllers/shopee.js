const shopeeService = require('../services/shopee');

const shopeePayment = async (req, res) => {
  const result = await shopeeService.shopeePayment({ ...req.body });
  return res.send({ status: 1, result });
};

const callbackShopee = async (req, res) => {
  console.log(JSON.stringify({ ...req.query, ...req.body }));
  await shopeeService.callbackShopee(req.query);
  return res.send({ status: 1 });
};
module.exports = { shopeePayment, callbackShopee };
