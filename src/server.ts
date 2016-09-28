let Cookies = require( "cookies" );
// the polyfills must be the first thing imported in node.js
import 'angular2-universal-polyfills';

import * as path from 'path';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';

// Angular 2
import { enableProdMode } from '@angular/core';
// Angular 2 Universal
import { createEngine } from 'angular2-express-engine';

import { MainModule  } from './main.node';
import * as api from './backend/api';

// enable prod for faster renders
enableProdMode();

const app = express();
const ROOT = path.join(path.resolve(__dirname, '..'));

// APP_PORT, APP_ENV, APP_SSL
const env = process.env.NODE_ENV || process.env.APP_ENV, port = (parseInt(process.env.APP_PORT, 10) || 9002), ssl = (parseInt(process.env.APP_SSL, 10) || 0);

// Express View
app.engine('.html', createEngine({ngModule: MainModule}));
app.set('views', __dirname);
app.set('view engine', 'html');

//noinspection TypeScriptValidateTypes
app.use(cookieParser('Angular 2 Universal'));
app.use(bodyParser.json());

// cookies
app.use(Cookies.express());
app.use(api.sessionidCookie);

// Serve static files
app.use('/assets', express.static(path.join(__dirname, 'assets'), {maxAge: 30}));
app.use('/files', express.static(path.join(__dirname, '../files'), {maxAge: 30}));
app.use(express.static(path.join(ROOT, 'dist/client'), {index: false}));

function ngApp(req, res) {
  res.render('index', {
    req,
    res,
    ngModule: MainModule,
    preboot: false,
    baseUrl: '/',
    requestUrl: req.originalUrl,
    originUrl: req.hostname
  });
}
// Routes with html5pushstate
// ensure routes match client-side-app
app.get('/logout', api.logout);
app.post('/login', api.login);

app.get('/', ngApp);

app.get('*', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  var pojo = { status: 404, message: 'No Content' };
  var json = JSON.stringify(pojo, null, 2);
  res.status(404).send(json);
});

// Server
let server = app.listen(port, () => {
  console.log(`Listening on: http://localhost:${server.address().port}`);
});
