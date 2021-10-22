/* eslint-disable guard-for-in */
const moment = require('moment');
const fs = require('fs');
const { logger } = require('../utils/logger');
const { convertPhoneNumber } = require('../utils/phoneNumber');
const { nonAccentVietnamese, slugify } = require('../utils/string');

const calls = require('../data/calls.json');
const Excel = require('exceljs');

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

const generateJson = async () => {
  const wb = new Excel.Workbook();
  const path = require('path');
  const filePath = path.resolve(__dirname, './../test/xlsx/mic_data_v2.xlsx');

  const headers = {};
  const dataRow = [];
  wb.xlsx.readFile(filePath).then(async () => {
    let sheet_id;
    wb.eachSheet((sh, sheetId) => {
      if (!sheet_id) sheet_id = sheetId;
    });
    logger.info(`sheet_id: ${sheet_id}`);
    const sh = wb.getWorksheet(sheet_id);

    await sh.eachRow({ includeEmpty: false }, async (row, rowNumber) => {
      const rowValue = {};
      let idexCol = 0;
      await row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
        let cellValue = cell.value;
        const address = cell.address.replace(/\d+/g, '');

        if (rowNumber === 1 && cellValue) {
          headers[address] = cellValue;
        } else if (headers[address] && cellValue) {
          const idxColumn = nonAccentVietnamese(
            headers[address].toString().trim(),
          ).replace(/\s/g, '_');
          rowValue[idxColumn] = cellValue;
        }
        idexCol += 1;
      });

      if (rowNumber > 1 && Object.keys(rowValue).length > 0) {
        dataRow.push(rowValue);
      }
    });

    console.log(`-------------- ${dataRow.length} -------------`);

    const data = [];
    for (const row of dataRow) {
      try {
        const time =
          typeof row.ngay_van_ban === 'string'
            ? moment(row.ngay_van_ban, 'DD/MM/YYYY').format('DDMMYYYY')
            : moment(row.ngay_van_ban).format('MMDDYYYY');
        row.file_name = `${row.so_hieu}_${time}`;
        data.push({
          id: row.so_hieu.trim(),
          release_date: moment(time, 'DDMMYYYY').format('DD/MM/YYYY'),
          uuid: row.file_name,
        });
      } catch (error) {
        console.log(error.message, row.so_hieu, row.ngay_van_ban);
      }
    }

    await fs.writeFileSync(
      path.join(__dirname, '../test/json/mic_data_v2.json'),
      JSON.stringify(data, null, 2),
      { encoding: 'utf-8' },
    );
  });
};

async function run() {
  const wb = new Excel.Workbook();
  const headers = {};
  const dataRow = [];
  const columns = [];
  const path = require('path');
  const filePath = path.resolve(__dirname, './../test/xlsx/mic_data_v2.xlsx');
  await wb.xlsx.readFile(filePath).then(async () => {
    console.log('read file done');
    let sheet_id;
    wb.eachSheet((sh, sheetId) => {
      if (!sheet_id) sheet_id = sheetId;
    });
    console.log(`sheet_id: ${sheet_id}`);
    const sh = wb.getWorksheet(sheet_id);
    const countContact = sh.actualRowCount;
    console.log(
      JSON.stringify({
        countContact,
      }),
    );
    await sh.eachRow({ includeEmpty: false }, async (row, rowNumber) => {
      const rowValue = {};
      row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
        const cellValue = cell.value;
        const address = cell.address.replace(/\d+/g, '');

        if (rowNumber === 1 && cellValue) {
          headers[address] = cellValue;
          const idxColumn = nonAccentVietnamese(
            headers[address].toString().trim(),
          ).replace(/\s/g, '_');
          columns.push({ header: headers[address], key: idxColumn });
        } else if (headers[address] && cellValue) {
          const idxColumn = nonAccentVietnamese(
            headers[address].toString().trim(),
          ).replace(/\s/g, '_');
          rowValue[idxColumn] = cellValue;
        }
      });

      if (rowNumber > 1 && Object.keys(rowValue).length > 0) {
        rowValue.phone_number = rowValue[Object.keys(rowValue)[0]];
        dataRow.push(rowValue);
      }
    });
  });
  console.log(columns);
  const data = [];
  for (const row of dataRow) {
    try {
      const time =
        typeof row.ngay_van_ban === 'string'
          ? moment(row.ngay_van_ban, 'DD/MM/YYYY').format('DDMMYYYY')
          : moment(row.ngay_van_ban).format('MMDDYYYY');

      row.file_name = `${row['so_hieu/_nhom_linh_vuc'].trim()}_${time}`;
      data.push({
        ...row,
        id: row['so_hieu/_nhom_linh_vuc'].trim(),
        release_date: moment(time, 'DDMMYYYY').format('DD/MM/YYYY'),
        uuid: row.file_name,
      });
    } catch (error) {
      console.log(error.message, row.so_hieu, row.ngay_van_ban);
    }
  }
  // const workbook = new Excel.Workbook();
  // const worksheet = workbook.addWorksheet('Data');
  // columns.push({ header: 'Tên file', key: 'file_name' });
  // worksheet.columns = columns;
  // for (const row of dataRow) {
  //   worksheet.addRow(row);
  // }
  // workbook.xlsx.writeFile('/Users/huanlio/Downloads/phanloai_get.xlsx');
  await fs.writeFileSync(
    path.join(__dirname, '../test/json/mic_data_v2.json'),
    JSON.stringify(data, null, 2),
  );
}

const exportExcel = async () => {
  console.log('================= Exort Excel =============');
  const data = require('../test/json/full_data_v2.json');
  console.log(`===> ====> ====> ====> length = ${data.length} =============`);

  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet('ExampleSheet');

  // add column headers
  worksheet.columns = [
    { header: 'Số hiêu', key: 'so_hieu' },
    { header: 'Ngày ban hành', key: 'ngay_ban_hanh' },
  ];
  for (const item of data) {
    const { id, releaseDate, summary } = item;
    if (!summary) {
      worksheet.addRow({
        so_hieu: id,
        ngay_ban_hanh: releaseDate,
        tom_tat: summary,
      });
    }
  }
  workbook.xlsx
    .writeFile('full_data_v2.xlsx')
    .then(() => {
      console.log('saved');
    })
    .catch(err => {
      console.log('err', err);
    });
};


module.exports = {
  getCallBlacklist,
  convertDateStringToTS,
  generateJson,
  run,
  exportExcel,
};
