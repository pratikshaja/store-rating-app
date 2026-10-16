
const { Op, fn, col } = require('sequelize');
const { User, Store, Rating } = require('../models');

// Get all stores with search, average rating and user's rating
const getAllStores = async (req, res, next) => {
  try {
    const { name, address, sort = 'name', order = 'asc' } = req.query;
    const userId = req.user.id;

    const allowedSortFields = ['name', 'address', 'created_at'];
    const sortColumn = allowedSortFields.includes(sort) ? sort : 'name';
    const sortOrder = String(order).toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    const where = {};

    if (name) {
      where.name = { [Op.like]: `%${name}%` };
    }

    if (address) {
      where.address = { [Op.like]: `%${address}%` };
    }

    const stores = await Store.findAll({
      where,
      attributes: [
        'id',
        'name',
        'address',
        [
          fn('ROUND', fn('AVG', col('ratings.rating')), 2),
          'avg_rating',
        ],
        [fn('COUNT', col('ratings.id')), 'total_ratings'],
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
      order: [[sortColumn, sortOrder]],
    });

  
    const myRatings = await Rating.findAll({
      where: { user_id: userId },
      attributes: ['store_id', 'rating'],
    });

    const ratingMap = new Map(
      myRatings.map((item) => [item.store_id, item.rating])
    );

    const data = stores.map((store) => {
      const item = store.toJSON();

      return {
        ...item,
        user_rating: ratingMap.has(item.id)
          ? ratingMap.get(item.id)
          : null,
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

// Get one store's details

const getStoreById = async (req, res, next) => {
  try {
    const store = await Store.findByPk(req.params.id, {
      attributes: [
        'id',
        'name',
        'email',
        'address',
        [
          fn('ROUND', fn('AVG', col('ratings.rating')), 2),
          'avg_rating',
        ],
        [fn('COUNT', col('ratings.id')), 'total_ratings'],
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
    });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found.',
      });
    }

    const myRating = await Rating.findOne({
      where: {
        store_id: store.id,
        user_id: req.user.id,
      },
      attributes: ['rating'],
    });

    return res.status(200).json({
      success: true,
      data: {
        ...store.toJSON(),
        user_rating: myRating ? myRating.rating : null,
      },
    });
  } catch (err) {
    next(err);
  }
};


// Submit or update a rating
const rateStore = async (req, res, next) => {
  try {
    const storeId = req.params.id;
    const userId = req.user.id;
    const ratingValue = Number(req.body.rating);

    const store = await Store.findByPk(storeId);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found.',
      });
    }

    const [rating, created] = await Rating.findOrCreate({
      where: {
        user_id: userId,
        store_id: storeId,
      },
      defaults: {
        rating: ratingValue,
      },
    });

    if (!created) {
      rating.rating = ratingValue;
      await rating.save();
    }

    const average = await Rating.findOne({
      where: { store_id: storeId },
      attributes: [
        [fn('ROUND', fn('AVG', col('rating')), 2), 'avg_rating'],
      ],
      raw: true,
    });

    return res.status(200).json({
      success: true,
      message: created
        ? 'Rating submitted successfully.'
        : 'Your rating has been updated successfully.',
      data: {
        store_id: Number(storeId),
        user_rating: ratingValue,
        avg_rating: average.avg_rating,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllStores,
  getStoreById,
  rateStore,
};
