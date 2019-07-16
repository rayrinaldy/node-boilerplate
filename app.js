const express = require('express');
const createError = require('http-errors');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const favicon = require('serve-favicon');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const statusMonitor = require('express-status-monitor')({ path: '' });
const auth = require('http-auth');
const flash = require('connect-flash');
const helmet = require('helmet')
const cors = require('cors');
const csrf = require('csurf');
const app = express();

let routes = require('./routes');
let config = require('./config/config');

/**
 * ! •••••••••••••••••••••••••••••••
 * ! Express Server Monitor
 * ! •••••••••••••••••••••••••••••••
 */

const basicAuth = auth.basic({realm: 'Monitor Area'}, (user, pass, callback) => {
  callback(user === 'user' && pass === 'password');
});

app.use(statusMonitor.middleware);
app.get('/status', auth.connect(basicAuth), statusMonitor.pageRoute);

/**
 * ! •••••••••••••••••••••••••••••••
 * ! Mongoose Connection
 * ! •••••••••••••••••••••••••••••••
 */
mongoose.Promise = global.Promise;
mongoose
  .connect(config.database.url, {
    useNewUrlParser: true,
    useCreateIndex: true
  })
  .then(() => {
    console.log('Database is Connected');
  })
  .catch((err) => console.log(err));

mongoose.set('debug', process.env.NODE_ENV === 'local' ? true : false);

/**
 * ! •••••••••••••••••••••••••••••••
 * ! View Engine Setup
 * ! •••••••••••••••••••••••••••••••
 */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));

// enabling CORS for all requests
app.use(cors());

// adding Helmet to enhance API's security
app.use(helmet());
app.use(helmet.hidePoweredBy({ setTo: 'Raline Server 2.0.93' }))

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// Turn this on if you set session cookie as true
// •••••••••••••••••••••••••••••••

// if (process.env.NODE_ENV === 'production') {
//   app.set('trust proxy', 1)
// }

app.use(session({
  secret: config.session.secret,
  store: process.env.NODE_ENV === 'production' ? new MongoStore({ mongooseConnection: mongoose.connection }) : '',
  resave: false,
  cookie: { secure: false },
  saveUninitialized: false
}))

/**
 * ! •••••••••••••••••••••••••••••••
 * ! CSRF Token Setup
 * ! •••••••••••••••••••••••••••••••
 */
app.use(csrf({
  cookie: true
}));

app.use((req, res, next) => {
  res.locals._csrf = req.csrfToken();
  next();
});

/**
 * ! •••••••••••••••••••••••••••••••
 * ! Flash Messages
 * ! •••••••••••••••••••••••••••••••
 */
app.use(flash());

/**
 * ! •••••••••••••••••••••••••••••••
 * ! Passport Middleware
 * ! •••••••••••••••••••••••••••••••
 */
app.use(passport.initialize());
app.use(passport.session());

/**
 * ! •••••••••••••••••••••••••••••••
 * ! Routes Setup
 * ! •••••••••••••••••••••••••••••••
 */
app.use('/', routes);

/**
 * ! •••••••••••••••••••••••••••••••
 * ! Set Permission
 * ? Used for Role Based Access Control
 * ? How to use: require('permission')('staff')
 * ! •••••••••••••••••••••••••••••••
 */
const notAuthenticated = {
  flashType: 'error',
  message: 'Please log in first',
  redirect: '/',
};

app.set('permission', {
  role: 'userGroup',
  notAuthenticated: notAuthenticated,
});

/**
 * ! •••••••••••••••••••••••••••••••
 * ! Passport Config
 * ! •••••••••••••••••••••••••••••••
 */
require('./auth/local');

/**
 * ! •••••••••••••••••••••••••••••••
 * ! Catch 404 and forward to Error Handler
 * ! •••••••••••••••••••••••••••••••
 */
app.use(function (req, res, next) {
  next(createError(404));
});

/**
 * ! •••••••••••••••••••••••••••••••
 * ! Error Handler
 * ! •••••••••••••••••••••••••••••••
 */
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);

  if (req.xhr) {
    res.send(err);
  } else {
    res.render('error');
  }
});

module.exports = app;