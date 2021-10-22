const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema.Types;

const ResoueceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    resourcesRoles: [
      {
        roleId: { type: ObjectId, ref: 'Role' },
        roleName: { type: String },
        actions: [{}],
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

module.exports = mongoose.model('Resources', ResoueceSchema);
