/* eslint-disable guard-for-in */
const moment = require('moment');
const fs = require('fs');
const { logger } = require('../utils/logger');
const { convertPhoneNumber } = require('../utils/phoneNumber');

const calls = require('../data/calls.json');

function getCallBlacklist() {
  // get call Register
  logger.info('total: ', calls.length);
  const callRegister = getCallRegister();
  logger.info('register: ', Object.keys(callRegister).length);
  // get call Remove
  const callRemove = getCallRemove();
  logger.info('remove: ', Object.keys(callRemove).length);

  const results = [];
  for (const key in callRegister) {
    if (
      !callRemove[key] ||
      convertDateStringToTS(callRegister[key].moTime) >
        convertDateStringToTS(callRemove[key].moTime)
    ) {
      results.push(key);
    }
  }

  logger.info('total length result: ', results.length);

  fs.writeFile(
    `dummy/phone_black_list_${moment().format('DD-MM-YYYY')}.txt`,
    results.join('\n'),
    err => {
      if (err) return logger.info(err);
      logger.info('phone_black_list.txt successfull');
      return true;
    },
  );
  return results;
}

function getCallRegister() {
  const results = {};

  const registers = calls.filter(e => e.cmdCode === 'DK');
  for (const call of registers) {
    const phone = convertPhoneNumber(call.msisdn);
    const checkCall =
      !results[phone] ||
      convertDateStringToTS(call.moTime) >
        convertDateStringToTS(results[phone].moTime);

    if (phone && checkCall) {
      results[phone] = call;
    }
  }

  return results;
}

function getCallRemove() {
  const results = {};

  const removes = calls.filter(e => e.cmdCode === 'HUY');
  for (const call of removes) {
    const phone = convertPhoneNumber(call.msisdn);
    const checkCall =
      !results[phone] ||
      convertDateStringToTS(call.moTime) >
        convertDateStringToTS(results[phone].moTime);
    if (phone && checkCall) {
      results[phone] = call;
    }
  }

  return results;
}

function convertDateStringToTS(dateString) {
  const [d, M, y, h, m, s] = dateString.match(/\d+/g);

  return new Date(y, M - 1, d, h, m, s).valueOf();
}

module.exports = {
  getCallBlacklist,
  convertDateStringToTS,
};
