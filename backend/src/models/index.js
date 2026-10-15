
const User = require('./userModel');
const Store = require('./storeModel');
const Rating = require('./ratingModel');

// One user can own many stores
User.hasMany(Store, {
  foreignKey: 'owner_id',
  as: 'stores',
});

Store.belongsTo(User, {
  foreignKey: 'owner_id',
  as: 'owner',
});

// One user can give many ratings
User.hasMany(Rating, {
  foreignKey: 'user_id',
  as: 'ratings',
});

Rating.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

// One store can receive many ratings
Store.hasMany(Rating, {
  foreignKey: 'store_id',
  as: 'ratings',
});

Rating.belongsTo(Store, {
  foreignKey: 'store_id',
  as: 'store',
});

module.exports = {
  User,
  Store,
  Rating,
};
