// utils/rateLimiters.js
const rateLimit = require("express-rate-limit");

// Limit umum untuk API publik: 60 request / menit
const generalLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 menit
    max: 60, // maks 60 request
    message: {
        success: false,
        error: "Terlalu banyak request, coba lagi nanti."
    },
    standardHeaders: false,
    legacyHeaders: false,
});

// Limit burst: max 10 request dalam 10 detik
const burstLimiter = rateLimit({
    windowMs: 10 * 1000, // 10 detik
    max: 20,
    message: {
        success: false,
        error: "Terlalu cepat mengirim request, tunggu sebentar."
    },
    standardHeaders: false,
    legacyHeaders: false,
});

// Limit khusus endpoint sensitif, misalnya login
const authLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 menit
    max: 5, // maks 5 percobaan login / menit
    message: {
        success: false,
        error: "Terlalu banyak percobaan login, coba lagi nanti."
    },
    standardHeaders: false,
    legacyHeaders: false,
});

module.exports = {
    generalLimiter,
    burstLimiter,
    authLimiter,
};
