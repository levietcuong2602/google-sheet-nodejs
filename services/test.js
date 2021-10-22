const CryptoJS = require('crypto-js');
const axios = require('axios');

const generateSHA256 = async () => {
  const money = 10000;
  const type = 'zalopay';
  const ipn_url =
    'https://cp-dev.aicallcenter.vn/default/callback-payment-zalo';

  const callback_url = 'https://cp-dev.aicallcenter.vn/by-package-history';
  const desc = 'V5000001245';
  const customer_id = 11;

  const private_key = 'nf0wx1Ct6AeKAB5Rq1rmEob6QFBOH1U0eJzrQOys';
  const cert = CryptoJS.HmacSHA256(
    `${money}|${type}|${callback_url}|${desc}|${customer_id}|${ipn_url}`,
    private_key,
  ).toString();

  return cert;
};

const descriptAES = async () => {
  const money = 10000;
  const type = 'atm';
  const bank_code = 'NCB';
  const ipn_url = 'https://payment-sb.vbeecore.com/api/provider/demo';
  // const cert =
  //   'cd16816a9b4f83507b79aff9f0caaa1e78b6a3ea708af3cad739e673c651a72f';
  const callback_url = 'https://payment-sb.vbeecore.com/api/provider/demo';
  const desc = 'Gói trả trước';
  const customer_id = '12';
  const private_key = 'nf0wx1Ct6AeKAB5Rq1rmEob6QFBOH1U0eJzrQOys';

  const cert = CryptoJS.HmacSHA256(
    `${money}|${type}|${callback_url}|${desc}|${customer_id}|${ipn_url}`,
    private_key,
  ).toString();

  return cert;
};

const scheduleRequest = () => {
  let i = 0;
  const requests = [];
  for (i = 0; i < 50; i++) {
    requests.push(i);
  }
  try {
    setInterval(async () => {
      console.log('=========request starting ...=======');
      await Promise.all(
        requests.map(async e => {
          await axios({
            url: 'http://localhost:8001/api/v1/mic/search',
            method: 'GET',
            params: {
              input_text: '749/CĐ-BCĐQG_26052024',
            },
          });
        }),
      );
      console.log('=========request end=======');
    }, 1000);
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = { generateSHA256, descriptAES, scheduleRequest };
