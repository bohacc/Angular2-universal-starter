"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require('@angular/core');
var angular2_universal_1 = require('angular2-universal');
var Constants = require('../backend/constants');
var app_service_1 = require('../app.service');
var Home = (function () {
    function Home(route, http) {
        this.route = route;
        this.http = http;
        this.bodyClass = false;
        this.appService = app_service_1.AppService.getInstance();
    }
    Home.prototype.ngOnInit = function () {
        var _this = this;
        this.objects = { "content": [] };
        this.route.params.subscribe(function (params) {
            var code = params['code'] || 'homepage';
            if (!angular2_universal_1.isBrowser && String(code) != 'tryCatch.js.map') {
                console.log('HOME');
                console.log(code);
                console.log('CALL API');
                _this.http.get(Constants.rootPath + '/load-objects/redirect/' + code)
                    .subscribe(function (res) {
                    console.log('SUCCESS');
                    var data = res.json();
                    _this.objects.content = data;
                    _this.bodyClass = data[0] ? data[0].bodyClass == 1 : false;
                    _this.appService.setPageId(data[0] ? data[0].idPage : null);
                    _this.appService.setTableName(data[0] ? data[0].tableName : null);
                }, function (res) {
                    console.log('ERROR');
                    console.log(res);
                });
                _this.appService.setPath(code);
            }
        });
        //this.objects.content = [{"fileName":"a_6343.html","position":6,"tableName":"WEB_NASTAVENI_WEBU","objectID":"6343","objectType":1,"class":null},{"fileName":"a_6347.html","position":7,"tableName":"WEB_NASTAVENI_WEBU","objectID":"6347","objectType":1,"class":null},{"fileName":"a_6344.html","position":1,"tableName":"WEB_NASTAVENI_WEBU","objectID":"6344","objectType":1,"class":null},{"fileName":"a_6363.html","position":3,"tableName":"WEB_NASTAVENI_WEBU","objectID":"6363","objectType":1,"class":null},{"fileName":"a_6345.html","position":1,"tableName":"WEB_NASTAVENI_WEBU","objectID":"6345","objectType":1,"class":null},{"fileName":"a_6348.html","position":7,"tableName":"WEB_NASTAVENI_WEBU","objectID":"6348","objectType":1,"class":null},{"fileName":"a_6403.html","position":3,"tableName":"WEB_NASTAVENI_WEBU","objectID":"6403","objectType":1,"class":null},{"fileName":"a_6349.html","position":7,"tableName":"WEB_NASTAVENI_WEBU","objectID":"6349","objectType":1,"class":null},{"fileName":"a_6346.html","position":1,"tableName":"WEB_NASTAVENI_WEBU","objectID":"6346","objectType":1,"class":null}];
    };
    Home.prototype.ngAfterViewInit = function () {
        this.appService.refreshWidth();
    };
    Home.prototype.onResize = function (event) {
        this.appService.setAppWidth(event.target.innerWidth);
        this.appService.refreshWidth();
    };
    Home = __decorate([
        core_1.Component({
            selector: 'home',
            templateUrl: 'home.template.html',
        })
    ], Home);
    return Home;
}());
exports.Home = Home;
