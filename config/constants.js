// Backend Constants

// Spotify Service
export const SPOTIFY_TOKEN_REFRESH_INTERVAL = 3500000; // milliseconds (58 minutes)

// Album Search
export const DEFAULT_SEARCH_LIMIT = 20;

// Rating Validation
export const RATING_MIN = 0;
export const RATING_MAX = 10;

// ZeroMQ Microservice Addresses
export const ZEROMQ_ADDRESSES = {
    AUTH: process.env.ZEROMQ_ADDRESS || 'tcp://localhost:5555',
    DATA_SAVER: process.env.DATA_SAVER_ADDRESS || 'tcp://localhost:5556',
    QUOTES: process.env.QUOTES_SERVICE_ADDRESS || 'tcp://localhost:5555',
    RANDOM: process.env.RANDOM_SERVICE_ADDRESS || 'tcp://localhost:5558'
};
