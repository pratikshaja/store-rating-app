
const { Op, fn, col } = require('sequelize');
const { User, Store, Rating } = require('../models');

// Store Owner dashboard
const getDashboard = async (req, res, next) => {
  try {
    // Owner ID must always come from the verified JWT
    const ownerId = req.user.id;

    const stores = await Store.findAll({
      where: { owner_id: ownerId },
      attributes: [
        'id',
        'name',
        'email',
        'address',
        [
          fn('ROUND', fn('AVG', col('ratings.rating')), 2),
          'avg_rating',
        ],
        [
          fn('COUNT', col('ratings.id')),
          'total_ratings',
        ],
      ],
      include: [
        {
          model: Rating,
          as: 'ratings',
          attributes: [],
          required: false,
        },
      ],
      group: ['Store.id'],
      order: [['name', 'ASC']],
    });

    const data = stores.map((store) => {
      const item = store.toJSON();

      return {
        store_id: item.id,
        store_name: item.name,
        store_email: item.email,
        store_address: item.address,
        avg_rating: item.avg_rating,
        total_ratings: item.total_ratings,
      };
    });

    if (data.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'You do not own any stores yet.',
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

// List users who rated this owner's stores
const getRatings = async (req, res, next) => {
  try {
    const ownerId = req.user.id;

    const ratings = await Rating.findAll({
      attributes: [
        'id',
        'rating',
        'created_at',
        'updated_at',
      ],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
          required: true,
        },
        {
          model: Store,
          as: 'store',
          attributes: ['id', 'name'],
          where: { owner_id: ownerId },
          required: true,
        },
      ],
      order: [['updated_at', 'DESC']],
    });

    const data = ratings.map((rating) => {
      const item = rating.toJSON();

      return {
        rating_id: item.id,
        rating: item.rating,
        created_at: item.created_at,
        updated_at: item.updated_at,
        user_id: item.user.id,
        user_name: item.user.name,
        user_email: item.user.email,
        store_id: item.store.id,
        store_name: item.store.name,
      };
    });

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboard,
  getRatings,
};
