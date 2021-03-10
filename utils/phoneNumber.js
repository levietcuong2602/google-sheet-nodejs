const { logger } = require('./logger');

// eslint-disable-next-line no-unused-vars
function convertPhoneNumber(phoneNumber) {
  try {
    phoneNumber = phoneNumber.replace(/[\s|.,|\-|(|)|+|_]/g, '').trim();
    const prefixCode = phoneNumber.substr(0, 2);
    switch (true) {
      case prefixCode === '82' && phoneNumber.length === 12: // korean
        phoneNumber = checkKoreaTelephone(phoneNumber);
        break;
      default:
        // default vn
        phoneNumber = checkVietnamTelephone(phoneNumber);
        break;
    }
    return phoneNumber;
  } catch (error) {
    logger.error(error.message);
  }
  return false;
}

function checkKoreaTelephone(phoneNumber) {
  return `+${phoneNumber}`;
}

function checkVietnamTelephone(phoneNumber) {
  if (phoneNumber.substr(0, 2) === '84' && phoneNumber.length > 10) {
    phoneNumber = `${phoneNumber.slice(2)}`;
  }

  if (phoneNumber.substr(0, 1) !== '0') {
    phoneNumber = `${0}${phoneNumber}`;
  }

  const viettel = {
    '016966': '03966',
    '0169': '039',
    '0168': '038',
    '0167': '037',
    '0166': '036',
    '0165': '035',
    '0164': '034',
    '0163': '033',
    '0162': '032',
  };
  const mobifone = {
    '0120': '070',
    '0121': '079',
    '0122': '077',
    '0126': '076',
    '0128': '078',
  };
  const vinaphone = {
    '0123': '083',
    '0124': '084',
    '0125': '085',
    '0127': '081',
    '0129': '082',
  };
  const vietnamobile = {
    '01862': '0562',
    '01863': '0563',
    '01864': '0564',
    '01865': '0565',
    '01866': '0566',
    '01867': '0567',
    '01868': '0568',
    '01869': '0569',
    '01882': '0582',
    '01883': '0583',
    '01884': '0584',
    '01885': '0585',
    '01886': '0586',
    '01887': '0587',
    '01888': '0588',
    '01889': '0589',
  };
  const gmobile = {
    '01992': '0592',
    '01993': '0593',
    '01998': '0598',
    '01999': '0599',
  };
  const array = [
    ...Object.entries(viettel),
    ...Object.entries(mobifone),
    ...Object.entries(vinaphone),
    ...Object.entries(vietnamobile),
    ...Object.entries(gmobile),
  ];
  // eslint-disable-next-line no-restricted-syntax
  for (const [prefix, convert] of array) {
    const phoneNumberPrefix = phoneNumber.substr(0, prefix.length);
    if (phoneNumberPrefix === prefix) {
      phoneNumber = phoneNumber.replace(phoneNumberPrefix, convert);
      break;
    }
  }

  if (phoneNumber.length !== 10) return false;

  return phoneNumber;
}

function checkTelcoByPhone(phone) {
  const prefix = phone.slice(0, 3);
  const viettel = [
    '098',
    '097',
    '096',
    '086',
    '039',
    '038',
    '037',
    '036',
    '035',
    '034',
    '033',
    '032',
  ];
  const mobiphone = ['070', '076', '077', '078', '079', '089', '090', '093'];
  const vinaphone = ['081', '082', '083', '084', '085', '088', '091', '094'];
  const vietnamobile = ['092', '058', '056', '018'];
  const gmobile = ['099', '019', '059'];
  if (viettel.includes(prefix)) return 'viettel';
  if (vinaphone.includes(prefix)) return 'vinaphone';
  if (mobiphone.includes(prefix)) return 'mobiphone';
  if (vietnamobile.includes(prefix)) return 'vietnamobile';
  if (gmobile.includes(prefix)) return 'gmobile';
  return 'viettel';
}

module.exports = { convertPhoneNumber, checkTelcoByPhone };
