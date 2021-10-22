const axios = require('axios');
const CryptoJS = require('crypto-js');
const uuid = require('uuid').v4;
const moment = require('moment');

const CustomError = require('../errors/CustomError');
const statusCode = require('../errors/statusCode');
const { logger } = require('../utils/logger');
const { generateRandomString } = require('../utils/string');

const {
  DOMAIN_SHOPEE_PAYMENT,
  SECRET_KEY_SHOPEE_PAYMENT,
  CLIENT_ID_SHOPEE_PAYMENT,
  MERCHANT_EXT_ID_SHOPEE,
  STORE_EXT_ID_SHOPEE,
} = process.env;

const shopeePayment = async ({}) => {
  try {
    const dataBody = {
      request_id: generateRandomString(16),
      amount: 10000000, // amount real x 100
      currency: 'VND',
      merchant_ext_id: MERCHANT_EXT_ID_SHOPEE, // mã định danh đối tác
      store_ext_id: STORE_EXT_ID_SHOPEE, // mã định danh cửa hàng
      payment_reference_id: generateRandomString(16), // mã hóa đơn
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
      '[shopeePayment] request: ',
      JSON.stringify({ headers, dataBody, hash }),
    );
    const { data } = await axios({
      url: `${DOMAIN_SHOPEE_PAYMENT}/v3/merchant-host/qr/create`,
      method: 'POST',
      headers,
      data: dataBody,
    });
    logger.info('[shopeePayment] result: ', JSON.stringify(data));
    if (data.errcode === 0) {
      // thành công
      return data;
    }

    throw new CustomError(statusCode.PAYMENT_SHOPEE_FAILURE, data.debug_msg);
  } catch (error) {
    throw new CustomError(statusCode.PAYMENT_SHOPEE_ERROR, error.message);
  }
};

module.exports = { shopeePayment };
