import {Component, Input} from '@angular/core';
import {Http} from "@angular/http";
import {Router} from "@angular/router";

import {AppService} from "../app.service";
import { Tools } from '../../backend/tools';
let Constants = require('../../backend/constants');

@Component({
  selector: 'registration',
  templateUrl: 'registration.template.html'
})

export class Registration {
  @Input() type: number;
  @Input() userCache: any;
  appService: AppService;
  user: any;
  //store: any;
  httpSubscription: any;
  //isCreate: Boolean = false;
  inProcess: Boolean = false;

  constructor (private http: Http, private router: Router) {
    this.appService = AppService.getInstance();
    //this.store = this.appService.getStore();
    this.user = {
      login: '',
      password: '',
      passwordConfirm: '',
      firstName: '',
      LastName: '',
      email: '',
      phone: '',
      city: '',
      street: '',
      zip: '',
      companyName: '',
      regId: '',
      vatId: '',
      firstNameDelivery: '',
      lastNameDelivery: '',
      companyNameDelivery: '',
      cityDelivery: '',
      streetDelivery: '',
      zipDelivery: '',
      saveAsNewUser: false,
      note: '',
      newsletter: true
    }
  }

  ngOnInit() {
    if (this.userCache) {
      this.user = this.userCache;
    } else {
      this.getUser();
    }
  }

  ngOnChanges(changes) {
    if (changes.userCache && changes.userCache.currentValue) {
      //console.log(changes.userCache.currentValue);
      this.user = changes.userCache.currentValue;
    }
  }

  getUser() {
    this.http.get(this.appService.getRootPath() + '/user')
      .subscribe(res => {
        let data = res.json();
        this.user = data;
      })
  }

  save() {
    if (this.user.isLogged) {
      this.put();
    } else {
      this.post();
    }
  }

  saveCurrent(obj: any) {
    if (this.user.saveAsNewUser) {
      this.user.login = this.user.email;
    }
    this.postCurrent(obj);
  }

  post() {
    if (!this.validatePost()) {
      return;
    }
    if (this.httpSubscription) {
      this.httpSubscription.unsubscribe();
    }
    this.inProcess = true;
    this.httpSubscription = this.http.post(this.appService.getRootPath() + '/user', this.user)
      .subscribe(
        res => {
          this.inProcess = false;
          let data = res.json();
          if (data.error) {
            alert(Constants.MESSAGE_CREATE_USER_ERROR);
            return;
          }
          if (data.userExist) {
            alert(Constants.MESSAGE_EXIST_USER);
          }
          this.router.navigate([Constants.PATHS.NEW_USER_SUCCESS]);
        },
        res => {
          this.inProcess = false;
        }
      );
  }

  put() {
    if (!this.validatePut()) {
      return;
    }
    if (this.httpSubscription) {
      this.httpSubscription.unsubscribe();
    }
    this.inProcess = true;
    this.httpSubscription = this.http.put(this.appService.getRootPath() + '/user', this.user)
      .subscribe(
        res => {
          this.inProcess = false;
          let data = res.json();
          if (data.error) {
            alert(Constants.MESSAGE_UPDATE_USER_ERROR);
            return;
          }
          alert(Constants.MESSAGE_UPDATE_USER_SUCCESS);
        },
        res => {
          this.inProcess = false;
        }
      );
  }

  postCurrent(obj: any) {
    if (this.inProcess) {
      return;
    }
    if (!this.validatePost()) {
      return;
    }
    if (this.httpSubscription) {
      this.httpSubscription.unsubscribe();
    }
    this.inProcess = true;
    this.httpSubscription = this.http.post(this.appService.getRootPath() + '/user/current', this.user)
      .subscribe(
        res => {
          this.inProcess = false;
          let data = res.json();
          if (data.userExist) {
            alert(Constants.MESSAGE_EXIST_USER_EMAIL);
            //alert(Constants.MESSAGE_EXIST_USER);
          } else {
            this.router.navigate([Constants.PATHS.ORDER_SUMMARY]);
          }
        },
        res => {
          this.inProcess = false;
        }
      );
  }

  putCurrent(obj: any) {
    if (this.inProcess) {
      return;
    }
    if (!this.validatePut()) {
      return;
    }
    if (this.httpSubscription) {
      this.httpSubscription.unsubscribe();
    }
    this.inProcess = true;
    this.httpSubscription = this.http.put(this.appService.getRootPath() + '/user/current', this.user)
      .subscribe(
        res => {
          this.inProcess = false;
          let data = res.json();
        },
        res => {
          this.inProcess = false;
        }
      );
  }

  validateLogin(): Boolean {
    if (!this.user.saveAsNewUser) {
      return true;
    }
    if (!this.user.login) {
      alert(Constants.MESSAGE_LOGIN_NOT_FILLED);
      return false;
    }
    if (!this.user.password) {
      alert(Constants.MESSAGE_PASSWORD_NOT_FILLED);
      return false;
    }
    if (!this.user.confirmPassword) {
      alert(Constants.MESSAGE_CONFIRM_PASSWORD_NOT_FILLED);
      return false;
    }
    if (this.user.password != this.user.confirmPassword) {
      alert(Constants.MESSAGE_CONFIRM_PASSWORD_NOT_SAME);
      return false;
    }
    return true;
  }

  validateUser(): Boolean {
    if (!this.user.firstName) {
      alert(Constants.MESSAGE_FIRSTNAME_NOT_FILLED);
      return false;
    }
    if (!this.user.lastName) {
      alert(Constants.MESSAGE_LASTNAME_NOT_FILLED);
      return false;
    }
    if (!this.user.email) {
      alert(Constants.MESSAGE_EMAIL_NOT_FILLED);
      return false;
    }
    if (!Tools.validateEmail(this.user.email)) {
      alert(Constants.MESSAGE_EMAIL_VALIDATE);
      return false;
    }
    if (!this.user.phone) {
      alert(Constants.MESSAGE_PHONE_NOT_FILLED);
      return false;
    }
    if (this.user.phone && !Tools.validatePhone(this.user.phone)) {
      alert(Constants.MESSAGE_PHONE_VALIDATE);
      return false;
    }
    if (!this.user.street) {
      alert(Constants.MESSAGE_STREET_NOT_FILLED);
      return false;
    }
    if (!this.user.city) {
      alert(Constants.MESSAGE_CITY_NOT_FILLED);
      return false;
    }
    if (!this.user.zip) {
      alert(Constants.MESSAGE_ZIP_NOT_FILLED);
      return false;
    }
    if (this.user.zip && !Tools.validateZip(this.user.zip)) {
      alert(Constants.MESSAGE_ZIP_VALIDATE);
      return false;
    }
    if (this.user.deliveryIsNotInvoice && this.user.zipDelivery && !Tools.validateZip(this.user.zipDelivery)) {
      alert(Constants.MESSAGE_ZIP_VALIDATE);
      return false;
    }
    return true;
  }

  validatePost(): Boolean {
    if (!this.validateLogin()) {
      return false;
    }
    if (!this.validateUser()) {
      return false;
    }
    return true;
  }

  validatePut(): Boolean {
    if (!this.validateUser()) {
      return false;
    }
    return true;
  }

  orderSaveUser(obj: any) {
    this.saveCurrent(obj);
  }
}
