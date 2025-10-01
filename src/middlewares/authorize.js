const authorize = (roles = []) => {
  if (typeof roles === 'string') roles = [roles];

  return (req, res, next) => {
    if (!req.user) return res.sendStatus(401);

    if (roles.length && !roles.includes(req.user.role)) {
      return res.sendStatus(403); // không đủ quyền
    }

    next();
  };
};

module.exports = authorize;
