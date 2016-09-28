"use strict";
var Cookies = require("cookies");
// the polyfills must be the first thing imported in node.js
require('angular2-universal-polyfills');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
// Angular 2
var core_1 = require('@angular/core');
// Angular 2 Universal
var angular2_express_engine_1 = require('angular2-express-engine');
var main_node_1 = require('./main.node');
var api = require('./backend/api');
// enable prod for faster renders
core_1.enableProdMode();
var app = express();
var ROOT = path.join(path.resolve(__dirname, '..'));
// APP_PORT, APP_ENV, APP_SSL
var env = process.env.NODE_ENV || process.env.APP_ENV, port = (parseInt(process.env.APP_PORT, 10) || 9002), ssl = (parseInt(process.env.APP_SSL, 10) || 0);
// Express View
app.engine('.html', angular2_express_engine_1.createEngine({ ngModule: main_node_1.MainModule }));
app.set('views', __dirname);
app.set('view engine', 'html');
//noinspection TypeScriptValidateTypes
app.use(cookieParser('Angular 2 Universal'));
app.use(bodyParser.json());
// cookies
app.use(Cookies.express());
app.use(api.sessionidCookie);
// Serve static files
app.use('/assets', express.static(path.join(__dirname, 'assets'), { maxAge: 30 }));
app.use('/tools', express.static(path.join(__dirname, '../tools'), { maxAge: 30 }));
app.use('/templates', express.static(path.join(__dirname, '../templates'), { maxAge: 30 }));
app.use('/images', express.static(path.join(__dirname, '../images'), { maxAge: 30 }));
app.use('/examples', express.static(path.join(__dirname, '../examples'), { maxAge: 30 }));
app.use('/files', express.static(path.join(__dirname, '../files'), { maxAge: 30 }));
app.use(express.static(path.join(ROOT, 'dist/client'), { index: false }));
function ngApp(req, res) {
    res.render('index', {
        req: req,
        res: res,
        ngModule: main_node_1.MainModule,
        preboot: false,
        baseUrl: '/',
        requestUrl: req.originalUrl,
        originUrl: req.hostname
    });
}
// Routes with html5pushstate
// ensure routes match client-side-app
/*app.get('/', ngApp);
app.get('/about', ngApp);
app.get('/about/!*', ngApp);
app.get('/home', ngApp);
app.get('/home/!*', ngApp);*/
app.get('/web_get_img_data', api.emptyImage);
app.get('/logout', api.logout);
app.post('/login', api.login);
app.get('/xml-export-seznam', api.xmlExportSeznam);
app.get('/xml-export-heureka', api.xmlExportHeureka);
app.get('/sitemap', api.sitemap);
app.get('/partners', api.partnersList);
app.get('/user', api.user2);
app.post('/user', api.createUser);
app.put('/user', api.saveUser);
app.put('/user/current', api.saveCurrentUser);
app.post('/user/current', api.saveCurrentUser);
app.post('/user/current/part', api.saveCurrentUserPart);
app.get('/cart', api.cart2);
app.get('/cart/info', api.cartInfo);
app.get('/shipping', api.shipping);
app.get('/shipping/:code', api.shipping);
app.post('/shipping', api.shippingPost);
app.get('/payment', api.payment);
app.get('/payment/:code', api.payment);
app.post('/payment', api.paymentPost);
app.post('/order', api.createOrder);
app.get('/order/verify', api.verifyOrder);
app.post('/coupons', api.addCoupon);
app.delete('/coupons/:code', api.removeCoupon);
app.get('/:code', ngApp);
app.get('/', ngApp);
app.get('/load-objects/redirect/:code', api.loadObjects);
app.get('/redirect-navigations/page/:id', api.redirectNavigations);
app.get('/redirect-navigations/product/:code', api.redirectNavigationsProduct);
app.get('/products/:code', api.getProduct);
app.post('/products/buy', api.productBuy);
app.post('/products/:id/buy', api.productBuy);
app.put('/products', api.productPut);
app.delete('/products/item/:itemId', api.productDelete);
app.get('/products/list/:code', api.productsList);
app.get('/products/list/:code/pagination', api.productsListPagination);
app.get('/products/:id/attachments/type/:type/table/:tableName', api.attachments);
app.get('/products/:id/similar', api.productsSimilar);
app.get('/filter/:code/type/:type', api.getFilterForList);
app.get('/filter/type/:code', api.getFilterType);
app.get('/cats/:code', api.category);
app.get('/attachments/:id', api.attachment);
app.get('/files/**', api.emptyImage);
app.post('/newsletter/login', api.newsletterLogin);
app.get('*', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    var pojo = { status: 404, message: 'No Content' };
    var json = JSON.stringify(pojo, null, 2);
    res.status(404).send(json);
});
// Server
var server = app.listen(port, function () {
    console.log("Listening on: http://localhost:" + server.address().port);
});
