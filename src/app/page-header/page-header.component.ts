import { Component, OnInit } from '@angular/core';
import {AppService} from "../app.service";
import {Http} from "@angular/http";

@Component({
  selector: 'page-header',
  templateUrl: 'page-header.template.html',
})

export class PageHeader implements OnInit {
  appService: AppService;
  store: any;
  priceVatAmount: string;
  amount: string;

  constructor(private http: Http) {
    this.appService = AppService.getInstance();
    this.store = this.appService.getStore();
  }

  ngOnInit() {
    this.getCartInfo();
  }

  getCartInfo() {
    this.http.get(this.appService.getRootPath() + '/cart/info')
      .subscribe(res => {
        let data = res.json();
        this.store.priceVatAmount = (data.priceVatAmount || 0);
        this.store.amount = (data.amount || 0);
      });
  }
}
