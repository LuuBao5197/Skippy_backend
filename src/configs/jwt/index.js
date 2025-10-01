const jwt = require('jsonwebtoken');

const createToken = (payload) => {
    const jwtSecretKey = process.env.JWT_SECRET_KEY;
    return jwt.sign(payload, jwtSecretKey, { expiresIn: "30m" });
};

const verifyToken = (token) => {
    const jwtSecretKey = process.env.JWT_SECRET_KEY;
    return jwt.verify(token, jwtSecretKey); // throw error nếu sai
};

const verifyRefreshToken = async (token, tokenDB) => {
    const match = await bcrypt.compare(token, tokenDB);
    if (!match) throw new Error("Invalid refresh token");
    const jwtSecretKey = process.env.JWT_SECRET_KEY;
    return jwt.verify(token, jwtSecretKey); // throw error nếu sai
};
const createRefreshToken = (payload) => {
    const jwtRefreshKey = process.env.JWT_REFRESH_KEY; // key riêng cho refresh
    return jwt.sign(payload, jwtRefreshKey, { expiresIn: "7d" }); // refresh token lâu hơn
};
const refreshToken = (token) => {
    try {
        const jwtRefreshKey = process.env.JWT_REFRESH_KEY;
        const decoded = jwt.verify(token, jwtRefreshKey); // kiểm tra refresh token

        // nếu ok thì tạo access token mới
        const newAccessToken = createToken({ id: decoded.id, role: decoded.role });
        return { accessToken: newAccessToken };
    } catch (err) {
        throw new Error("Invalid refresh token");
    }
}
module.exports = {
    createToken,
    verifyToken,
    createRefreshToken,
    verifyRefreshToken,
    refreshToken
}
