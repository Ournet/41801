require('dotenv').config();

import * as express from 'express';
import config from './config';
import logger from './logger';
import * as path from 'path';
const bodyParser = require('body-parser');
import links from './links';
import initi18n from './i18n';
import catchError from './catch';
import rootMiddleware from './middlewares/root';
import homeRoute from './routes/home';
import redirectRoute from './routes/redirect';
import assets from './assets';

const ms = require('ms');
const compression = require('compression');
// const cookieParser = require('cookie-parser');

// const cors = require('cors');

const isProduction = process.env.NODE_ENV === 'production';

const app = express();

app.disable('x-powered-by');
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '../views'));
app.disable('etag');

app.locals.NODE_ENV = process.env.NODE_ENV;
app.locals.links = links;
app.locals.config = config;
app.locals.assets = assets;

// app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));
// app.use(cookieParser());
// app.use(methodOverride());
// app.use(responseTime());

// if (isProduction) {
// 	app.use(function(req, res, next) {
// 		// console.log(req.headers);
// 		if (!req.headers['x-amz-cf-id'] && process.env.MODE !== 'dev') {
// 			var config = res.locals.config;
// 			//console.log('Erorr: ', req.headers);
// 			return res.redirect('http://' + config.host + req.originalUrl);
// 		}
// 		next();
// 	});
// }

if (isProduction) {
    app.use(compression());
}

app.use(express.static(path.join(__dirname, '../public'), {
    maxAge: isProduction ? ms('10d') : 0
}));

app.use(redirectRoute);

app.use(initi18n);
app.use(rootMiddleware);
app.use(homeRoute);

app.all('*', function (req, res) {
    var error: any = new Error('Page not found');
    error.statusCode = 404;
    catchError(req, res, error);
});

app.listen(process.env.PORT, () => {
    logger.warn('Listening at %s', process.env.PORT);
});

process.on('unhandledRejection', function (error: Error) {
    logger.error('unhandledRejection: ' + error.message, error);
});

process.on('uncaughtException', function (error: Error) {
    logger.error('uncaughtException: ' + error.message, error);
});
