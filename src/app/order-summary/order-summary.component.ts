import { Component } from '@angular/core';
import {Router} from "@angular/router";

import Constants = require('../../backend/constants');
import {AppService} from "../app.service";
import {Http} from "@angular/http";

@Component({
  selector: 'order-summary',
  templateUrl: 'order-summary.template.html'
})

export class OrderSummary {
  appService: AppService;
  inProcess: Boolean = false;
  user: any;

  constructor (private router: Router, private http: Http) {
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
      note: ''
    }
  }

  ngOnInit() {
    //this.user = this.store.user;
    this.getUser();
  }

  getUser() {
    this.http.get(this.appService.getRootPath() + '/user')
      .subscribe(res => {
        let data = res.json();
        this.user = data;
      })
  }

  verifyOrder(obj: any) {
    if (parseInt(obj.amount, 10) <= 0) {
      alert(Constants.MESSAGE_ORDER_AMOUNT_ERROR);
      return false;
    }
    if (!obj.shipping) {
      alert(Constants.MESSAGE_ORDER_SHIPPING_ERROR);
      return false;
    }
    if (!obj.payment) {
      alert(Constants.MESSAGE_ORDER_PAYMENT_ERROR);
      return false;
    }
    if (!obj.firstName) {
      alert(Constants.MESSAGE_ORDER_FIRSTNAME_ERROR);
      return false;
    }
    if (!obj.firstName) {
      alert(Constants.MESSAGE_ORDER_LASTNAME_ERROR);
      return false;
    }
    if (!obj.email) {
      alert(Constants.MESSAGE_ORDER_EMAIL_ERROR);
      return false;
    }
    return true;
  }

  order() {
    if (this.inProcess) {
      return;
    }
    this.inProcess = true;
    this.http.get(this.appService.getRootPath() + '/order/verify', {})
      .subscribe(
        res => {
          let data = res.json();
          if (this.verifyOrder(data)) {
            this.createOrder();
          } else {
            this.inProcess = false;
          }
        },
        res => {
          this.inProcess = false;
        }
      );
  }

  createOrder() {
    this.http.post(this.appService.getRootPath() + '/order', {})
      .subscribe(
        res => {
          this.inProcess = false;
          let data = res.json();

          if (data.userExist) {
            alert(Constants.MESSAGE_EXIST_USER);
          } else {
            if (data.id && !isNaN(data.id)) {
              this.router.navigate([Constants.PATHS.ORDER_SUCCESS]);
            } else {
              alert(Constants.MESSAGE_ORDER_ERROR);
            }
          }
        },
        res => {
          this.inProcess = false;
        }
      );
  }
}
