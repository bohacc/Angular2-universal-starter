import { Component } from '@angular/core';
import Constants = require('../../backend/constants');
import {AppService} from "../app.service";
import {Http} from "@angular/http";
import {Router} from "@angular/router";

@Component({
  selector: 'cart',
  templateUrl: 'cart.template.html'
})

export class Cart {
  appService: AppService;
  cartObj: any = {};
  amount: number = 1;
  otherProduct: any = {code: null, amount: 1};
  test: any;
  httpTimeoutU: any;
  httpTimeoutR: any;
  httpSubscriptionU: any;
  httpSubscriptionR: any;
  filled: Boolean = false;
  store: any;
  formatNumber1: string;
  inProcess: Boolean = false;
  coupon: any = {code: '', name: '', price: null};
  showCoupons: Boolean = false;
  existCoupons: Boolean = false;

  constructor (private http: Http, private router: Router) {
    this.appService = AppService.getInstance();
    this.store = this.appService.getStore();
    this.formatNumber1 = Constants.FORMAT_NUMBER_1;
  }

  ngOnInit() {
    this.getData();
  }

  removeItem(item: any) {
    if (this.inProcess) {
      return;
    }

    this.inProcess = true;
    let _this = this;
    if (this.httpTimeoutR) {
      clearTimeout(this.httpTimeoutR);
    }
    this.httpTimeoutR = setTimeout(function () {
      if (_this.httpSubscriptionR) {
        _this.httpSubscriptionR.unsubscribe();
      }
      _this.httpSubscriptionR = _this.http.delete(_this.appService.getRootPath() + '/products/item/' + item.itemId)
        .subscribe(
          res => {
            _this.inProcess = false;
            _this.getData();
          },
          res => {
            _this.inProcess = false;
          }
        );
    }, 200);
  }

  updateItem(item: any) {
    if (this.inProcess) {
      return;
    }

    this.inProcess = true;
    let _this = this;
    if (this.httpTimeoutU) {
      clearTimeout(this.httpTimeoutU);
    }
    this.httpTimeoutU = setTimeout(function () {
      if (_this.httpSubscriptionU) {
        _this.httpSubscriptionU.unsubscribe();
      }
      _this.httpSubscriptionU = _this.http.put(_this.appService.getRootPath() + '/products', item)
        .subscribe(
          res => {
            _this.inProcess = false;
            _this.getData();
          },
          res => {
            _this.inProcess = false;
          }
        );
    }, 200);
  }

  getData() {
    this.http.get(this.appService.getRootPath() + '/cart')
      .subscribe(res => {
        this.cartObj = res.json();
        this.setFilled();
        this.setCoupon();
        // REFRESH CART INFO
        this.store.priceVatAmount = this.cartObj.priceAmountVat;
        this.store.amount = this.cartObj.amount;
      });
  }

  setFilled() {
    this.filled = (this.cartObj && this.cartObj.records && this.cartObj.records.length > 0);
  }

  buy() {
    if (!this.otherProduct.code || !this.otherProduct.amount) {
      return;
    }
    this.http.post('/products/buy', this.otherProduct)
      .subscribe(
        res => {
          let data = res.json() || [];
          this.setDefaultOtherProduct();
          this.getData();
        },
        err => {
          alert(Constants.PRODUCT_ADD_TO_CART_ERROR);
        }
      );
  }

  setDefaultOtherProduct() {
    this.otherProduct.code = '';
    this.otherProduct.amount = 1;
  }

  addCoupon() {
    this.inProcess = true;
    this.http.post('/coupons', {code: this.coupon.code})
      .subscribe(
        res => {
          let data = res.json();
          this.inProcess = false;
          if (data.error) {
            alert(Constants.MESSAGE_COUPON_ERROR);
            return;
          }
          if (!data.valid) {
            alert(Constants.MESSAGE_COUPON_INVALID);
            return;
          }
          if (data.valid) {
            this.clearCurrentCoupon();
            this.getData();
          }
        },
        res => {
          this.inProcess = false;
        }
      )
  }

  incAmount(obj: any) {
    obj.amount = parseInt(obj.amount) + 1;
    this.updateItem(obj);
  }

  decAmount(obj: any) {
    if (obj.amount == 1) {
      return;
    }
    obj.amount = parseInt(obj.amount) - 1;
    this.updateItem(obj);
  }

  next() {
    if (this.filled) {
      this.router.navigate([Constants.PATHS.ORDER_SHIPPING_AND_PAYMENT]);
    } else {
      alert(Constants.MESSAGE_CART_ITEMS_NOT_FOUND);
    }
  }

  setCoupon() {
    if (this.cartObj && this.cartObj.coupons && this.cartObj.coupons[0]) {
      this.coupon.code = this.cartObj.coupons[0].code;
      this.coupon.name = this.cartObj.coupons[0].name;
      this.coupon.price = this.cartObj.coupons[0].price;
      this.showCoupons = true;
      this.existCoupons = true;
    }
  }

  removeCoupon() {
    this.inProcess = true;
    this.http.delete('/coupons/' + this.coupon.code)
      .subscribe(
        res => {
          let data = res.json();
          this.inProcess = false;
          if (data.error) {
            alert(Constants.MESSAGE_COUPON_DELETE_ERROR);
            return;
          }
          this.getData();
        },
        res => {
          this.inProcess = false;
        }
      )
  }

  onCoupon() {
    if (this.existCoupons) {
      this.removeCoupon();
    } else {
      this.addCoupon();
    }
  }

  clearCurrentCoupon() {
    this.coupon.code = '';
    this.coupon.name = '';
    this.coupon.price = '';
  }
}
