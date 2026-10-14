
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
   
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    // Check if the user's role is in the list of allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This action requires one of these roles: ${allowedRoles.join(', ')}.`,
      });
    }

    next();
  };
};

module.exports = authorize;
