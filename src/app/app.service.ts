//noinspection TypeScriptUnresolvedFunction
let Constants = require('../backend/constants');

import { isBrowser } from 'angular2-universal';

import { Injectable } from '@angular/core';

import { ISelectBox } from './select-box/select-box.interface';
import { IListFilter } from './list-filter/list-filter.interface';

@Injectable()
export class AppService {
  static instance:AppService;
  static isCreating:boolean = false;
  store: any;
  constructor() {
    if (!AppService.isCreating) {
      throw new Error("You can't call new in Singleton instances! Call SingletonService.getInstance() instead.");
    }
    this.store = {
      appWidth: 0,
      scrollBarWidth: 0,
      showCats: true,
      showCatsMobile: false,
      cart: {
        amount: 0,
        priveVatAmount: 0
      }
      //isLogged: false,
      //user: {}
    };
  }

  static getInstance() {
    if (AppService.instance == null) {
      AppService.isCreating = true;
      AppService.instance = new AppService();
      AppService.isCreating = false;
    }

    return AppService.instance;
  }

  getScrollBarWidth() {
    return this.store.scrollBarWidth;
  }
  setScrollBarWidth(width) {
    this.store.scrollBarWidth = width;
  }
  setAppWidth(width) {
    this.store.appWidth = width;
  }
  getAppWidth() {
    return this.store.appWidth;
  }
  setShowCats(arg) {
    this.store.showCats = arg;
  }
  getShowCats() {
    return this.store.showCats;
  }
  getStore() {
    return this.store;
  }
  refreshWidth() {
    if (isBrowser) {
      let width = this.store.appWidth + this.store.scrollBarWidth;
      if (width <= 991) {
        this.store.showCats = false;
        this.store.showCatsMobile = true;
      }
      else if (width >= 992) {
        this.store.showCats = true;
        this.store.showCatsMobile = false;
      }
    }
  }
  setPath(code: string) {
    this.store.path = code;
  }
  getPath() {
    return this.store.path;
  }
  setPageId(id: number) {
    this.store.idPage = id;
  }
  getPageId() {
    return this.store.idPage;
  }
  setTableName(name: string) {
    this.store.tableName = name;
  }
  setRedirect(code: string) {
    this.store.redirect = code;
  }
  getImageForType(ext: string) {
    let imgObj, imgs = [
      {ext: '.doc', img: 'file_doc.png'},
      {ext: '.docx', img: 'file_doc.png'},
      {ext: '.xls', img: 'file_docx.png'},
      {ext: '.xlsx', img: 'file_docx.png'},
      {ext: '.pdf', img: 'file_pdf.png'},
    ];
    imgObj = imgs.filter(function (el) {
      return el.ext === ext;
    })[0];
    return Constants.imageFileExtPath + (imgObj ? imgObj.img : '');
  }

  getSelectItemParamComboBox(code: string, item: ISelectBox, selectedItems: Array<ISelectBox>): Array<ISelectBox> {
    //TODO change value(slider)
    let index = -1, par, parSel, del;
    del = !item.val;
    selectedItems.map(function (el, i) {
      par = code || item.id.split(':')[0];
      parSel = el.id.split(':')[0];
      if (par === parSel) {
        index = i;
        del = true;
      }
    });
    if (del) {
      selectedItems.splice(index, 1);
      if (item.val) {
        selectedItems.push(item);
      }
    } else {
      selectedItems.push(item);
    }
    return selectedItems;
  }

  getStringForFilter(arr: Array<IListFilter>): string {
    let filters: string = '';
    arr.map(function (el, i) {
      if (filters) {
        filters += '@';
      }
      filters += el.val;
    });
    return filters;
  }

  getSelectItemParam(item: ISelectBox, selectedItems: Array<ISelectBox>): Array<ISelectBox> {
    let index = -1;
    selectedItems.map(function (el, i) {
      if (item.id === el.id) {
        index = i;
      }
    });
    if (index > -1) {
      selectedItems.splice(index, 1);
    } else {
      selectedItems.push(item);
    }
    return selectedItems;
  }
/*
  isLogged() {
    return this.store.isLogged;
  }

  setLogged(arg: Boolean) {
    this.store.isLogged = arg;
  }
*/
  setLoginName(name: string) {
    this.store.loginName = name;
  }

  getRootPath() {
    return isBrowser ? '' : Constants.ROOT_PATH;
  }
/*
  setUser(obj: any) {
    this.store.user.login = obj.login;
    this.store.user.priceAmount = obj.priceAmount;
    this.store.user.priceVatAmount = obj.priceVatAmount;

    // INVOICE
    this.store.user.firstName = obj.firstName;
    this.store.user.lastName = obj.lastName;
    this.store.user.email = obj.email;
    this.store.user.phone = obj.phone;
    this.store.user.street = obj.street;
    this.store.user.city = obj.city;
    this.store.user.country = obj.country;
    this.store.user.zip = obj.zip;
    this.store.user.companyName = obj.companyName;

    // DELIVERY
    this.store.user.firstNameDelivery = obj.firstNameDelivery;
    this.store.user.lastNameDelivery = obj.lastNameDelivery;
    this.store.user.streetDelivery = obj.streetDelivery;
    this.store.user.cityDelivery = obj.cityDelivery;
    this.store.user.countryDelivery = obj.countryDelivery;
    this.store.user.zipDelivery = obj.zipDelivery;
    this.store.user.companyNameDelivery = obj.companyNameDelivery;

    this.store.user.deliveryIsNotInvoice = obj.deliveryIsNotInvoice;
    this.store.user.toCompany = obj.toCompany;

    this.store.shipping = obj.shipping;
    this.store.payment = obj.payment;
  }
*/
/*
  clearUser() {
    for (var key in this.store.user) {
      // skip loop if the property is from prototype
      if (!this.store.user.hasOwnProperty(key)) continue;
      this.store.user[key] = null;
    }
  }
*/
  clearPayment() {
    this.store.payment = '';
  }
}
