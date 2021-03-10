const { GoogleSpreadsheet } = require('google-spreadsheet');
const { logger } = require('../utils/logger');
const creds = require('../config/client_secret.json');
const personals = require('../data/personals.json');

// const sheetId = '1qSTyEegpP0XKmKT5jbHiojdLfFY222Trc_GErxpkLgk';
const sheetId = '1qSTyEegpP0XKmKT5jbHiojdLfFY222Trc_GErxpkLgk';

async function accessSpreadSheet() {
  try {
    logger.info('accessSpreadSheet is starting...');
    const doc = new GoogleSpreadsheet(sheetId);
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    await sheet.setHeaderRow(['Nội dung']);
    // get rows
    const rows = await sheet.getRows();
    // for (const row of rows) {
    //   const content = row['Nội dung'];
    //   if (!content) await row.delete();

    //   if (checkPersonalizeTags(content)) {
    //     await new Promise((resolve, reject) => {
    //       row['Nội dung'] = mergeText(content);
    //       row.save();
    //       setTimeout(() => {
    //         console.log(`Updated: ${content}`);
    //         resolve(`Update success row ${content}`);
    //       }, 1500);
    //     });
    //   }
    // }

    logger.info('edit spread sheet done!');
  } catch (err) {
    logger.error('accessSpreadSheet: ', err.message);
  }
}

function mergeText(content) {
  const regex = /{\b[\w\dư]+}/;
  while (content.match(regex) !== null) {
    const regexResult = content.match(regex);
    const key = regexResult[0].replace('{', '').replace('}', '');
    let value = '';
    if (personals[key]) {
      const textValues = personals[slug(key)] || [];
      if (textValues.length > 0) {
        const index = Math.floor(Math.random() * textValues.length);
        value = textValues[index];
      }
    }
    content = content.replace(`{${key}}`, `${value}`.trim());
  }
  return content.replace(/\s\s+/g, ' ').trim();
}

function getPersonalizeTags(content) {
  const tags = content.match(/\{\b[\w\d]+\}/g) || [];
  const results = [];
  for (const tag of tags) {
    const key = tag
      .trim()
      .toLowerCase()
      .replace(/\{/g, '')
      .replace(/\}/g, '');
    results.push(key);
  }
  return results;
}

function slug(str) {
  let result = str.trim().toLowerCase();
  result = result.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  result = result.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  result = result.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  result = result.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  result = result.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  result = result.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  result = result.replace(/đ/g, 'd');
  result = result.replace(/-/g, ' ');
  result = result.replace(/\s+/g, '_');
  return result;
}

function checkPersonalizeTags(content) {
  const tags = content.match(/\{\b[\w\dư]+\}/g) || [];
  return tags.length > 0;
}

module.exports = {
  accessSpreadSheet,
};
