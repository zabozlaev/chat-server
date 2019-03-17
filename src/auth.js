const jwt = require("jsonwebtoken");

const {
  token: { accessSecret }
} = require("./config");

const verifyToken = token => {
  return new Promise(resolve => {
    jwt.verify(token, accessSecret, {}, (err, decoded) => {
      resolve(decoded);
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

const createToken = (
  payload = {},
  expiresIn = 1 * 3600 * 1000,
  secret = accessSecret
) => {
  const token = jwt.sign(payload, secret, {
    expiresIn
  });
  return {
    token
  };
};

module.exports = {
  verifyToken,
  decode,
  createToken
};
