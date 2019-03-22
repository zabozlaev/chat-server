const jwt = require("jsonwebtoken");

const {
  token: { accessSecret }
} = require("./config");

const db = require("./models");

const verifyToken = token => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, accessSecret, {}, (err, decoded) => {
      resolve(err ? null : decoded);
    });
  });
};

const decode = async authHeader => {
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split("Bearer ")[1].trim();
    const decoded = await verifyToken(token);

    return decoded;
  }
  return null;
};

const createToken = (payload = {}, expiresIn = "2h", secret = accessSecret) => {
  const token = jwt.sign(payload, secret, {
    expiresIn
  });
  return {
    token
  };
};

const getOrCreateRefreshToken = async userId => {
  const refreshToken = await db.RefreshToken.findOne({
    where: {
      user_id: userId
    }
  });

  if (!refreshToken) {
    const { token } = await db.RefreshToken.create({ user_id: userId });
    return token;
  }
  if (refreshToken.hasExpired()) {
    await refreshToken.destroy();
    const { token } = await db.RefreshToken.create({ user_id: userId });
    return token;
  }

  return refreshToken.token;
};

module.exports = {
  verifyToken,
  decode,
  createToken,
  getOrCreateRefreshToken
};
