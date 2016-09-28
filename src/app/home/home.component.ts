import { Component, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Http } from '@angular/http';

import { isBrowser } from 'angular2-universal';

let Constants = require('../../backend/constants');
import { AppService } from '../app.service';

@Component({
  selector: 'home',
  templateUrl: 'home.template.html',
})

export class Home implements AfterViewInit {
  objects: any;
  appService: AppService;
  bodyClass: Boolean = false;

  constructor(private route: ActivatedRoute, private http: Http) {
    this.appService = AppService.getInstance();
  }

  ngOnInit() {
    this.objects = {"content": []};
    this.route.params.subscribe(params => {
      let code = params['code'] || 'homepage';
      this.http.get(this.appService.getRootPath() + '/load-objects/redirect/' + code)
        .subscribe(res => {
            let data = res.json();
            this.objects.content = data;
            this.bodyClass = data[0] ? data[0].bodyClass == 1 : false;
            this.appService.setPageId(data[0] ? data[0].idPage : null);
            this.appService.setTableName(data[0] ? data[0].tableName : null);
          },
          res => {
            console.log(res);
          });
      this.appService.setPath(code);
    });
    //this.objects.content = [{"fileName":"a_6343.html","position":6,"tableName":"WEB_NASTAVENI_WEBU","objectID":"6343","objectType":1,"class":null},{"fileName":"a_6347.html","position":7,"tableName":"WEB_NASTAVENI_WEBU","objectID":"6347","objectType":1,"class":null},{"fileName":"a_6344.html","position":1,"tableName":"WEB_NASTAVENI_WEBU","objectID":"6344","objectType":1,"class":null},{"fileName":"a_6363.html","position":3,"tableName":"WEB_NASTAVENI_WEBU","objectID":"6363","objectType":1,"class":null},{"fileName":"a_6345.html","position":1,"tableName":"WEB_NASTAVENI_WEBU","objectID":"6345","objectType":1,"class":null},{"fileName":"a_6348.html","position":7,"tableName":"WEB_NASTAVENI_WEBU","objectID":"6348","objectType":1,"class":null},{"fileName":"a_6403.html","position":3,"tableName":"WEB_NASTAVENI_WEBU","objectID":"6403","objectType":1,"class":null},{"fileName":"a_6349.html","position":7,"tableName":"WEB_NASTAVENI_WEBU","objectID":"6349","objectType":1,"class":null},{"fileName":"a_6346.html","position":1,"tableName":"WEB_NASTAVENI_WEBU","objectID":"6346","objectType":1,"class":null}];
  }

  ngAfterViewInit() {
    this.appService.refreshWidth();
  }

  onResize(event) {
    this.appService.setAppWidth(event.target.innerWidth);
    this.appService.refreshWidth();
  }
}
