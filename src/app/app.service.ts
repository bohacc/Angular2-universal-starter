//noinspection TypeScriptUnresolvedFunction
let Constants = require('../backend/constants');

import { isBrowser } from 'angular2-universal';

import { Injectable } from '@angular/core';

@Injectable()
export class AppService {
  static instance:AppService;
  static isCreating:boolean = false;
  store: any;

  constructor() {
    if (!AppService.isCreating) {
      throw new Error("You can't call new in Singleton instances! Call SingletonService.getInstance() instead.");
    }
    this.store = {};
  }

  static getInstance() {
    if (AppService.instance == null) {
      AppService.isCreating = true;
      AppService.instance = new AppService();
      AppService.isCreating = false;
    }

    return AppService.instance;
  }

  getStore() {
    return this.store;
  }

  getRootPath() {
    return isBrowser ? '' : Constants.ROOT_PATH;
  }
}
