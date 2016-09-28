import {Component, Input, Output, EventEmitter} from '@angular/core';
import {AppService} from "../app.service";
import {Router} from "@angular/router";
import {Http} from "@angular/http";
import Constants = require('../../backend/constants');

@Component({
  selector: 'login',
  templateUrl: 'login.template.html'
})

export class Login {
  @Input() pathAfterLogin: string;
  @Output() onLogin = new EventEmitter<any>();
  loginName: string;
  password: string;
  isError: Boolean;
  isFilled: Boolean = true;
  appService: AppService;

  constructor(private router: Router, private http: Http) {
    this.appService = AppService.getInstance();
  }

  ngOnInit() {

  }

  login() {
    this.isError = false;

    this.isFilled = true;
    if (!this.loginName || !this.password) {
      this.isFilled = false;
      return;
    }

    this.http.post(this.appService.getRootPath() + '/login', {login: this.loginName, password: this.password})
      .subscribe(res => {
        let data = res.json();
        if (data.isLogged) {
          this.onLogin.emit(data);

          let url = (this.pathAfterLogin || Constants.PATHS.HOMEPAGE);
          this.router.navigate([url]);
        } else {
          this.isError = true;
        }
      });
  }

  onSubmit() {
    this.login();
  }
}
