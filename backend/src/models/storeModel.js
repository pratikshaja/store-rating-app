
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Store = sequelize.define(
  'Store',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },

    name: {
      type: DataTypes.STRING(60),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Store name is required.',
        },
        len: {
          args: [20, 60],
          msg: 'Store name must be between 20 and 60 characters.',
        },
      },
    },

    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: 'Please provide a valid store email.',
        },
      },
    },

    address: {
      type: DataTypes.STRING(400),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Store address is required.',
        },
        len: {
          args: [1, 400],
          msg: 'Store address cannot exceed 400 characters.',
        },
      },
    },

    owner_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  },
  {
    tableName: 'stores',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

module.exports = Store;
