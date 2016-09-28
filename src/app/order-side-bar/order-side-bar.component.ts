import { Component } from '@angular/core';
import {AppService} from "../app.service";
import {Http} from "@angular/http";
import Constants = require('../../backend/constants');

@Component({
  selector: 'order-side-bar',
  templateUrl: 'order-side-bar.template.html'
})

export class OrderSideBar {
  appService: AppService;
  cartObj: any = {records: []};
  formatNumber1: string;

  constructor (private http: Http) {
    this.appService = AppService.getInstance();
    this.formatNumber1 = Constants.FORMAT_NUMBER_1;
  }

  ngOnInit() {
    this.getData();
  }

  getData() {
    this.http.get(this.appService.getRootPath() + '/cart')
      .subscribe(res => {
        this.cartObj = res.json();
      });
  }

  refresh() {
    this.getData();
  }
}
