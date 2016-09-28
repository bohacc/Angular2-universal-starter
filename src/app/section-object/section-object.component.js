"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require('@angular/core');
var test_component_1 = require('../test/test.component');
var page_header_component_1 = require('../page-header/page-header.component');
var slides_obj_component_1 = require("../slides-obj/slides-obj.component");
var partners_component_1 = require("../partners/partners.component");
var login_page_component_1 = require("../login-page/login-page.component");
var redirect_navigation_component_1 = require("../redirect-navigation/redirect-navigation.component");
var configurator_component_1 = require("../configurator/configurator.component");
var record_component_1 = require("../record/record.component");
var list2_component_1 = require("../list2/list2.component");
var shop_categories_dev_obj_component_1 = require("../shop-categories-dev-obj/shop-categories-dev-obj.component");
var shop_categories_obj_component_1 = require("../shop-categories-obj/shop-categories-obj.component");
var list_obj_component_1 = require("../list-obj/list-obj.component");
var list3_obj_component_1 = require("../list3-obj/list3-obj.component");
var list4_obj_component_1 = require("../list4-obj/list4-obj.component");
var SectionObject = (function () {
    function SectionObject(http) {
        this.http = http;
        this.html = '';
        this.self = this;
        this.obj = test_component_1.Test;
        this.isComponentType = 0;
    }
    SectionObject.prototype.ngOnInit = function () {
        var _this = this;
        if (!this.src)
            return;
        if (this.objectType == 1 &&
            this.objectID !== '6371'
            && this.objectID !== '6370'
            && this.objectID !== '6376'
            && this.objectID !== '6531'
            && this.objectID !== '6363'
            && this.objectID !== '6344'
            && this.objectID !== '6577'
            && this.objectID !== '6622'
            && this.objectID !== '6663'
            && this.objectID !== '6347'
            && this.objectID !== '6343'
            && this.objectID !== '6373'
            && this.objectID !== '6350') {
            this.http.get('/templates/' + this.src).subscribe(function (res) {
                _this.html = res.text();
                _this.isComponentType = 1;
            });
        }
        else if (this.pos == 3 && (this.objectID === 'ZAZNAM_PRODUKTU_NG2' || this.objectID === '6371')) {
            this.isComponentType = 2;
            this.obj = record_component_1.Record;
        }
        else if (this.pos == 3 && (this.objectID === 'KONFIGURATOR_NG2' || this.objectID === '6376')) {
            this.isComponentType = 2;
            this.obj = configurator_component_1.Configurator;
        }
        else if (this.pos == 3 && (this.objectID === 'SEZNAM2_NG' || this.objectID === '6531')) {
            this.isComponentType = 2;
            this.obj = list2_component_1.List2;
        }
        else if (this.pos == 3 && (this.objectID === 'SEZNAM_NG2' || this.objectID === '6370')) {
            this.isComponentType = 2;
            this.obj = list_obj_component_1.ListObj;
        }
        else if (this.pos == 3 && (this.objectID === 'REDIRECT_NAVIGATION_NG2' || this.objectID === '6363')) {
            this.isComponentType = 2;
            this.obj = redirect_navigation_component_1.RedirectNavigation;
        }
        else if (this.pos == 1 && (this.objectID === 'SIDE_MENU_NG2' || this.objectID === '6344')) {
            this.isComponentType = 2;
            this.obj = shop_categories_obj_component_1.ShopCategoriesObj;
        }
        else if (this.pos == 3 && (this.objectID === 'SEZNAM3_NG2' || this.objectID === '6577')) {
            this.isComponentType = 2;
            this.obj = list3_obj_component_1.List3Obj;
        }
        else if (this.pos == 3 && (this.objectID === 'SEZNAM4_NG2' || this.objectID === '6622')) {
            this.isComponentType = 2;
            this.obj = list4_obj_component_1.List4Obj;
        }
        else if (this.pos == 1 && (this.objectID === 'SIDE_MENU_DEV_NG2' || this.objectID === '6663')) {
            this.isComponentType = 2;
            this.obj = shop_categories_dev_obj_component_1.ShopCategoriesDevObj;
        }
        else if (this.pos == 7 && (this.objectID === 'PARTNERS_NG2' || this.objectID === '6347')) {
            this.isComponentType = 2;
            this.obj = partners_component_1.Partners;
        }
        else if (this.pos == 6 && (this.objectID === 'PAGE_HEADER_NG2' || this.objectID === '6343')) {
            this.isComponentType = 2;
            this.obj = page_header_component_1.PageHeader;
        }
        else if (this.pos == 3 && (this.objectID === 'LOGIN_PAGE_NG2' || this.objectID === '6373')) {
            this.isComponentType = 2;
            this.obj = login_page_component_1.LoginPage;
        }
        else if (this.pos == 3 && (this.objectID === 'SLIDES_NG2' || this.objectID === '6350')) {
            this.isComponentType = 2;
            this.obj = slides_obj_component_1.SlidesObj;
        }
    };
    __decorate([
        core_1.Input()
    ], SectionObject.prototype, "src", void 0);
    __decorate([
        core_1.Input('object-id')
    ], SectionObject.prototype, "objectID", void 0);
    __decorate([
        core_1.Input('object-type')
    ], SectionObject.prototype, "objectType", void 0);
    __decorate([
        core_1.Input('pos')
    ], SectionObject.prototype, "pos", void 0);
    SectionObject = __decorate([
        core_1.Component({
            selector: 'section-object',
            template: '<dcl-wrapper *ngIf="isComponentType==2" [type]="obj" [html]="html"></dcl-wrapper> ' +
                '<dcl-wrapper-other *ngIf="isComponentType==1" [html]="html"></dcl-wrapper-other>'
        })
    ], SectionObject);
    return SectionObject;
}());
exports.SectionObject = SectionObject;
