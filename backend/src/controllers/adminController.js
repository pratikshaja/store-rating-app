
const bcrypt = require('bcrypt');
const { Op, fn, col, literal } = require('sequelize');
const { User, Store, Rating } = require('../models');

const SALT_ROUNDS = 10;

const USER_SORT_ALLOWLIST = [
  'name',
  'email',
  'address',
  'role',
  'created_at',
];

const STORE_SORT_ALLOWLIST = [
  'name',
  'email',
  'address',
  'created_at',
];

// Dashboard: total users, stores and ratings
const getDashboard = async (req, res, next) => {
  try {
    const [total_users, total_stores, total_ratings] =
      await Promise.all([
        User.count(),
        Store.count(),
        Rating.count(),
      ]);

    return res.status(200).json({
      success: true,
      data: {
        total_users,
        total_stores,
        total_ratings,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Create a normal user, admin or store owner
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, address, role } = req.body;

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      address: address ? address.trim() : null,
      role,
    });

    return res.status(201).json({
      success: true,
      message: `${role} account created successfully.`,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// List users with filters and sorting
const getUsers = async (req, res, next) => {
  try {
    const {
      name,
      email,
      address,
      role,
      sort = 'created_at',
      order = 'asc',
    } = req.query;

    const sortColumn = USER_SORT_ALLOWLIST.includes(sort)
      ? sort
      : 'created_at';

    const sortOrder = String(order).toLowerCase() === 'desc'
      ? 'DESC'
      : 'ASC';

    const where = {};

    if (name) {
      where.name = { [Op.like]: `%${name}%` };
    }

    if (email) {
      where.email = { [Op.like]: `%${email}%` };
    }

    if (address) {
      where.address = { [Op.like]: `%${address}%` };
    }

    if (role) {
      where.role = String(role).toUpperCase();
    }

    const users = await User.findAll({
      where,
      attributes: [
        'id',
        'name',
        'email',
        'address',
        'role',
        'created_at',
      ],
      order: [[sortColumn, sortOrder]],
    });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (err) {
    next(err);
  }
};

// Get one user's details
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: [
        'id',
        'name',
        'email',
        'address',
        'role',
        'created_at',
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const data = user.toJSON();

    if (user.role === 'STORE_OWNER') {
      const stores = await Store.findAll({
        where: { owner_id: user.id },
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

      data.stores = stores;
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

// Create a store for an existing store owner
const createStore = async (req, res, next) => {
  try {
    const { name, email, address, owner_id } = req.body;

    const owner = await User.findOne({
      where: {
        id: owner_id,
        role: 'STORE_OWNER',
      },
      attributes: ['id', 'name'],
    });

    if (!owner) {
      return res.status(400).json({
        success: false,
        message:
          'Owner not found or the specified user is not a Store Owner.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingStore = await Store.findOne({
      where: { email: normalizedEmail },
    });

    if (existingStore) {
      return res.status(409).json({
        success: false,
        message: 'A store with this email already exists.',
      });
    }

    const store = await Store.create({
      name: name.trim(),
      email: normalizedEmail,
      address: address.trim(),
      owner_id: owner.id,
    });

    return res.status(201).json({
      success: true,
      message: 'Store created successfully.',
      data: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        owner_id: owner.id,
        owner_name: owner.name,
      },
    });
  } catch (err) {
    next(err);
  }
};

// List stores with filters, owner details, ratings and sorting
const getStores = async (req, res, next) => {
  try {
    const {
      name,
      email,
      address,
      sort = 'created_at',
      order = 'asc',
    } = req.query;

    const sortColumn = STORE_SORT_ALLOWLIST.includes(sort)
      ? sort
      : 'created_at';

    const sortOrder = String(order).toLowerCase() === 'desc'
      ? 'DESC'
      : 'ASC';

    const where = {};

    if (name) {
      where.name = { [Op.like]: `%${name}%` };
    }

    if (email) {
      where.email = { [Op.like]: `%${email}%` };
    }

    if (address) {
      where.address = { [Op.like]: `%${address}%` };
    }

    const stores = await Store.findAll({
      where,
      attributes: [
        'id',
        'name',
        'email',
        'address',
        'owner_id',
        'created_at',
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
          model: User,
          as: 'owner',
          attributes: ['name'],
          required: true,
        },
        {
          model: Rating,
          as: 'ratings',
          attributes: [],
          required: false,
        },
      ],
      group: ['Store.id', 'owner.id'],
      order: [[sortColumn, sortOrder]],
    });

    const data = stores.map((store) => {
      const item = store.toJSON();

      item.owner_name = item.owner ? item.owner.name : null;
      delete item.owner;

      return item;
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
  createUser,
  getUsers,
  getUserById,
  createStore,
  getStores,
};
