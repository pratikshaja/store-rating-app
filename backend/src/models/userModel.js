
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define(
  'User',
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
          msg: 'Name is required.',
        },
        len: {
          args: [20, 60],
          msg: 'Name must be between 20 and 60 characters.',
        },
      },
    },

    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: 'Please provide a valid email address.',
        },
      },
    },

    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    address: {
      type: DataTypes.STRING(400),
      allowNull: true,
      validate: {
        len: {
          args: [0, 400],
          msg: 'Address cannot exceed 400 characters.',
        },
      },
    },

    role: {
      type: DataTypes.ENUM('ADMIN', 'USER', 'STORE_OWNER'),
      allowNull: false,
      defaultValue: 'USER',
      validate: {
        isIn: {
          args: [['ADMIN', 'USER', 'STORE_OWNER']],
          msg: 'Invalid user role.',
        },
      },
    },
  },
  {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

module.exports = User;
