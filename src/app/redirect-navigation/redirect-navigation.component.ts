import { Component, AfterViewInit } from '@angular/core';
import { Http } from '@angular/http';

import { AppService } from '../app.service';

declare var $: any;

@Component({
  selector: 'redirect-navigation',
  templateUrl: '../../../templates/a_6363.html',
})

export class RedirectNavigation implements AfterViewInit {
  redirects: Array<Object>;
  appService: AppService;

  constructor(private http: Http) {
    this.appService = AppService.getInstance();
  }

  ngAfterViewInit() {
    let store = this.appService.getStore();
    let url = store.tableName === 'PRODUKTY' ? '/redirect-navigations/product/' + store.path : '/redirect-navigations/page/' + store.idPage;
    this.http.get(this.appService.getRootPath() + url)
      .subscribe(res => {
        let data = res.json();
        this.redirects = data;
      });
  }
}
