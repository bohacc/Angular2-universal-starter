import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Http } from '@angular/http';

import Constants = require('../../backend/constants');
import { AppService } from '../app.service';

@Component({
  selector: 'login-header',
  templateUrl: 'login-header.template.html',
})
export class LoginHeader {
  appService: AppService;
  loginName: string;
  isLogged: Boolean;

  constructor(private router: Router, private http: Http) {
    this.appService = AppService.getInstance();
    //this.appStore = this.appService.getStore();
  }

  ngOnInit() {
    this.getUser();
  }

  logout() {
    this.http.get(this.appService.getRootPath() + '/logout')
      .subscribe(res => {
        let data = res.json();
        if (data.state == '1') {
          this.router.navigate([Constants.PATHS.LOGIN]);
        } else {
          alert(Constants.MESSAGE_LOGOUT_ERROR);
        }
      });
  }

  getUser() {
    this.http.get(this.appService.getRootPath() + '/user')
      .subscribe(res => {
        let data = res.json();
        this.loginName = data.login;
        this.isLogged = data.isLogged;

        //this.appService.setLogged(data.isLogged);
        //this.appService.setLoginName(data.login);
        //this.appService.setUser(data);
      });
  }
}
