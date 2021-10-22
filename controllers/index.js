const testService = require('../services/test');

async function helloworld(req, res) {
  return res.send({ status: 1, message: 'Hello guys' });
}

async function test(req, res) {
  const result = await testService.generateSHA256();
  return res.send({ status: 1, result });
}

async function callback(req, res) {
  console.log({ query: req.query, body: req.body });
  return res.send({ status: 1 });
}

module.exports = {
  helloworld,
  test,
  callback
};
