module.exports = {
    port: process.env.PORT || 5000,
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/stockomni',
    jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key',
    jwtExpire: process.env.JWT_EXPIRE || '24h',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    nodeEnv: process.env.NODE_ENV || 'development'
};
