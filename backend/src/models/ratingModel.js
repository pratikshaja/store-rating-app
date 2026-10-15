
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Rating = sequelize.define(
  'Rating',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },

    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },

    store_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'stores',
        key: 'id',
      },
    },

    rating: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      validate: {
        isInt: {
          msg: 'Rating must be an integer.',
        },
        min: {
          args: [1],
          msg: 'Rating must be at least 1.',
        },
        max: {
          args: [5],
          msg: 'Rating cannot exceed 5.',
        },
      },
    },
  },
  {
    tableName: 'ratings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'store_id'],
      },
    ],
  }
);

module.exports = Rating;