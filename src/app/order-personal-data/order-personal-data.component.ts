import {Component, ViewChild} from '@angular/core';
import {Router} from "@angular/router";

import Constants = require('../../backend/constants');
import {Http} from "@angular/http";
import {AppService} from "../app.service";
import {Registration} from "../registration/registration.component";

@Component({
  selector: 'order-personal-data',
  templateUrl: 'order-personal-data.template.html'
})

export class OrderPersonalData {
  @ViewChild('registration') registrationCmp: Registration;
  appService: AppService;
  //store: any;
  //loginName: string;
  //password: string;
  //inProcess: Boolean = false;
  //saveAsNewUser: Boolean;
  user: any;
  //isLogged: Boolean;
  pathAfterLogin: string;

  constructor (private router: Router, private http: Http) {
    this.appService = AppService.getInstance();
    //this.store = this.appService.getStore();
    this.pathAfterLogin = Constants.PATHS.ORDER_PERSONAL_DATA;
    this.user = {isLogged: false};
  }

  ngOnInit() {
    this.getUser();
  }

  nextPage() {
    let callback = function () {
      this.router.navigate([Constants.PATHS.ORDER_SUMMARY]);
    };
    this.registrationCmp.orderSaveUser({callback: callback});
  }

  getUser() {
    this.http.get(this.appService.getRootPath() + '/user')
      .subscribe(res => {
        let data = res.json();
        //this.isLogged = data.isLogged;
        this.user = data;
      })
  }

  onLogin(obj: any) {
    this.user = obj.user;
  }
}
