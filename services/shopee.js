const CryptoJS = require('crypto-js');
const uuid = require('uuid').v4;
const moment = require('moment');

const {
  DOMAIN_SHOPEE_PAYMENT,
  SECRET_KEY_SHOPEE_PAYMENT,
  CLIENT_ID_SHOPEE_PAYMENT,
  MERCHANT_EXT_ID_SHOPEE,
  STORE_EXT_ID_SHOPEE,
} = process.env;

const create_payment = async ({
  config,
  money,
  bank_code,
  callback_url,
  desc,
  provider,
  token,
  request_id,
}) => {
  console.log(
    '[shopee_payment][create_payment] params: ',
    JSON.stringify({
      config,
      money,
      bank_code,
      callback_url,
      desc,
      provider,
      token,
      request_id,
    }),
  );
  try {
    const dataBody = {
      request_id,
      amount: money * 100, // amount real x 100
      currency: 'VND',
      merchant_ext_id: MERCHANT_EXT_ID_SHOPEE, // mã định danh đối tác
      store_ext_id: STORE_EXT_ID_SHOPEE, // mã định danh cửa hàng
      payment_reference_id: request_id, // mã hóa đơn
      expiry_time: Math.floor(
        moment()
          .add(20, 'minutes')
          .valueOf() / 1000,
      ),
    };
    const hash = CryptoJS.HmacSHA256(
      JSON.stringify(dataBody),
      SECRET_KEY_SHOPEE_PAYMENT,
    );
    const signature = CryptoJS.enc.Base64.stringify(hash);

    const headers = {
      'X-Airpay-ClientId': parseInt(CLIENT_ID_SHOPEE_PAYMENT),
      'X-Airpay-Req-H': signature,
    };
    logger.info(
      '[shopee_payment][create_payment] request: ',
      JSON.stringify({ headers, dataBody, hash }),
    );
    const { data } = await axios({
      url: `${DOMAIN_SHOPEE_PAYMENT}/v3/merchant-host/qr/create`,
      method: 'POST',
      headers,
      data: dataBody,
    });
    logger.info(
      '[shopee_payment][create_payment] result: ',
      JSON.stringify(data),
    );
    if (data.errcode === 0) {
      return {
        error: 0,
        link: data.qr_url,
        request_id: data.request_id,
        qr_content: data.qr_content,
      };
    }
  } catch (error) {
    return { error: 1, message: error.message };
  }

  return { error: 1, message: 'Thanh toán không thành công' };
};

const verified_data = async params => {
  logger.info(
    '[shopee_payment][verified_data] params: ',
    JSON.stringify(params),
  );
};

function getConfig(config) {
  return {
    app_id: config['zalopay app_id'],
    key1: config['zalopay key 1'],
    key2: config['zalopay key 2'],
    base: config['zalopay base'],
  };
}

module.exports = { create_payment, verified_data, getConfig };
