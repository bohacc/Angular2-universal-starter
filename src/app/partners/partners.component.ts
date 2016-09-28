import { isBrowser } from 'angular2-universal';

import { Component, ElementRef } from '@angular/core';
import { Http } from '@angular/http';
import {AppService} from "../app.service";

declare var $: any;

@Component({
  selector: 'partners',
  templateUrl: 'partners.template.html',
})
export class Partners {
  items: Array<Object>;
  isInit: Boolean = false;
  appService: AppService

  constructor(private http: Http, private _elRef: ElementRef) {
    this.appService = AppService.getInstance();
  }

  ngOnInit() {
    this.getData();
  }

  getData() {
    let self = this;
    this.http.get(this.appService.getRootPath() + '/partners')
      .subscribe(res => {
        let data = res.json() || [];
        this.items = data;
        if (isBrowser) {
          window.setTimeout(function () {
            self.isInit = true;
          }, 300);
        }
      });
  }
}
