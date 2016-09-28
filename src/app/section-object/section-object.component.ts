import { Component, Input } from '@angular/core';
import { Http } from '@angular/http';

import { Test } from '../test/test.component';
import { PageHeader } from '../page-header/page-header.component';
import { ShopCategories } from "../shop-categories/shop-categories.component";
import { SlidesObj } from "../slides-obj/slides-obj.component";
import {Partners} from "../partners/partners.component";
import {LoginPage} from "../login-page/login-page.component";
import {RedirectNavigation} from "../redirect-navigation/redirect-navigation.component";
import {Configurator} from "../configurator/configurator.component";
import {Record} from "../record/record.component";
import {List2} from "../list2/list2.component";
import {ShopCategoriesDevObj} from "../shop-categories-dev-obj/shop-categories-dev-obj.component";
import {ShopCategoriesObj} from "../shop-categories-obj/shop-categories-obj.component";
import {ListObj} from "../list-obj/list-obj.component";
import {List3Obj} from "../list3-obj/list3-obj.component";
import {List4Obj} from "../list4-obj/list4-obj.component";
import {AppService} from "../app.service";
import {CartPage} from "../cart-page/cart-page.component";
import {OrderStep1} from "../order-step1/order-step1.component";
import {OrderStep2} from "../order-step2/order-step2.component";
import {OrderStep3} from "../order-step3/order-step3.component";
import {OrderStep4} from "../order-step4/order-step4.component";
import {RegistrationSuccess} from "../registration-success/registration-success.component";
import {RegistrationPage} from "../registration-page/registration-page.component";

@Component({
  selector: 'section-object',
  template:
    '<dcl-wrapper *ngIf="isComponentType==2" [type]="obj" [html]="html"></dcl-wrapper> ' +
    '<dcl-wrapper-other *ngIf="isComponentType==1" [html]="html"></dcl-wrapper-other>'
})

export class SectionObject {
  @Input() src: string;
  @Input('object-id')
  private objectID: string;
  @Input('object-type')
  private objectType: number;
  @Input('pos')
  private pos: number;
  html = '';
  self = this;
  obj: any = Test;
  isComponentType: number = 0;
  appService: AppService;

  constructor(private http: Http) {
    this.appService = AppService.getInstance();
  }

  ngOnInit() {
    if (!this.src) return;

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
      && this.objectID !== '6350'
      && this.objectID !== '6379'
      && this.objectID !== '6384'
      && this.objectID !== '6380'
      && this.objectID !== '6381'
      && this.objectID !== '6382'
      && this.objectID !== '6383'
      && this.objectID !== '6385'
    ){
      this.http.get(this.appService.getRootPath() + '/templates/' + this.src).subscribe((res) => {
        this.html = res.text();
        this.isComponentType = 1;
      });
    } else if (this.pos == 3 && (this.objectID === 'ZAZNAM_PRODUKTU_NG2' || this.objectID === '6371')) {
      this.isComponentType = 2;
      this.obj = Record;
    } else if (this.pos == 3 && (this.objectID === 'KONFIGURATOR_NG2' || this.objectID === '6376')) {
      this.isComponentType = 2;
      this.obj = Configurator;
    } else if (this.pos == 3 && (this.objectID === 'SEZNAM2_NG' || this.objectID === '6531')) {
      this.isComponentType = 2;
      this.obj = List2;
    } else if (this.pos == 3 && (this.objectID === 'SEZNAM_NG2' || this.objectID === '6370')) {
      this.isComponentType = 2;
      this.obj = ListObj;
    } else if (this.pos == 3 && (this.objectID === 'REDIRECT_NAVIGATION_NG2' || this.objectID === '6363')) {
      this.isComponentType = 2;
      this.obj = RedirectNavigation;
    } else if (this.pos == 1 && (this.objectID === 'SIDE_MENU_NG2' || this.objectID === '6344')) {
      this.isComponentType = 2;
      this.obj = ShopCategoriesObj;
    } else if (this.pos == 3 && (this.objectID === 'SEZNAM3_NG2' || this.objectID === '6577')) {
      this.isComponentType = 2;
      this.obj = List3Obj;
    } else if (this.pos == 3 && (this.objectID === 'SEZNAM4_NG2' || this.objectID === '6622')) {
      this.isComponentType = 2;
      this.obj = List4Obj;
    } else if (this.pos == 1 && (this.objectID === 'SIDE_MENU_DEV_NG2' || this.objectID === '6663')) {
      this.isComponentType = 2;
      this.obj = ShopCategoriesDevObj;
    } else if (this.pos == 7 && (this.objectID === 'PARTNERS_NG2' || this.objectID === '6347')) {
      this.isComponentType = 2;
      this.obj = Partners;
    } else if (this.pos == 6 && (this.objectID === 'PAGE_HEADER_NG2' || this.objectID === '6343')) {
      this.isComponentType = 2;
      this.obj = PageHeader;
    } else if (this.pos == 3 && (this.objectID === 'LOGIN_PAGE_NG2' || this.objectID === '6373')) {
      this.isComponentType = 2;
      this.obj = LoginPage;
    } else if (this.pos == 3 && (this.objectID === 'SLIDES_NG2' || this.objectID === '6350')) {
      this.isComponentType = 2;
      this.obj = SlidesObj;
    } else if (this.pos == 3 && (this.objectID === 'CART_PAGE_NG2' || this.objectID === '6379')) {
      this.isComponentType = 2;
      this.obj = CartPage;
    } else if (this.pos == 3 && (this.objectID === 'REGISTRATION_NG2' || this.objectID === '6384')) {
      this.isComponentType = 2;
      this.obj = RegistrationPage;
    } else if (this.pos == 3 && (this.objectID === 'ORDER_STEP1_NG2' || this.objectID === '6380')) {
      this.isComponentType = 2;
      this.obj = OrderStep1;
    } else if (this.pos == 3 && (this.objectID === 'ORDER_STEP2_NG2' || this.objectID === '6381')) {
      this.isComponentType = 2;
      this.obj = OrderStep2;
    } else if (this.pos == 3 && (this.objectID === 'ORDER_STEP3_NG2' || this.objectID === '6382')) {
      this.isComponentType = 2;
      this.obj = OrderStep3;
    } else if (this.pos == 3 && (this.objectID === 'ORDER_STEP4_NG2' || this.objectID === '6383')) {
      this.isComponentType = 2;
      this.obj = OrderStep4;
    } else if (this.pos == 3 && (this.objectID === 'REGISTRATION_SUCCESS_NG2' || this.objectID === '6385')) {
      this.isComponentType = 2;
      this.obj = RegistrationSuccess;
    }
  }
}
