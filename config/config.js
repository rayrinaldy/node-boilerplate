const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    database: {
        url: process.env.MONGOURL
    },
    session: {
        secret: process.env.SESSION_SECRET,
        facebook: {
            "app_id": process.env.FB_APP_ID,
            "app_secret": process.env.FB_APP_SECRET,
            "callback_url": process.env.FB_CALLBACK_URL
        },
    }
}