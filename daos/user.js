const { parseCondition, parseTimeRange, findDocument } = require('./daoUtil');
const User = require('../models/user');

const findUser = async condition => {
  const user = await findDocument(User, condition);
  return user;
};

module.exports = {
  findUser,
};
