const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

module.exports = mongoose.model('Role', RoleSchema);
