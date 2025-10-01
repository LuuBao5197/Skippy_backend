const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <accessToken>

  if (!token) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded; // lưu thông tin user vào req
    next();
  } catch (err) {
    return res.sendStatus(403); // token hết hạn hoặc không hợp lệ
  }
};

module.exports = authenticate;
