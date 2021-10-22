const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    username: String,
    email: {
      type: String,
      unique: true,
    },
    emailConfirmed: String,
    passwordHash: String,
    salt: String,
    roles: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
    },
    permissions: [],
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

module.exports = mongoose.model('User', UserSchema);
