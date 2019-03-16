module.exports = {
  database: {
    name: process.env.DB_NAME || "chatapp",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "10021002",
    url: process.env.DB_URL
  },
  port: process.env.PORT || 4000,
  token: {
    accessSecret: process.env.JWT_SECRET || "test",
    refreshSecret: process.env.REFRESH_SECRET || "test2"
  }
};
