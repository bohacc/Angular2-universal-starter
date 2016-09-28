import {Component, EventEmitter, Output, Input} from '@angular/core';
import {AppService} from "../app.service";
import {Http} from "@angular/http";
import Constants = require('../../backend/constants');

@Component({
  selector: 'payment',
  templateUrl: 'payment.template.html'
})

export class Payment {
  @Output() onSelect = new EventEmitter<{item: any, callback: Function}>();
  @Input() defaultPayment: string;
  appService: AppService;
  paymentObj: any = {records: []};
  selectedPayment: any;
  isProcess: Boolean = false;
  isOpen: Boolean = false;
  store: any;
  formatNumber1: string;

  constructor (private http: Http) {
    this.appService = AppService.getInstance();
    this.store = this.appService.getStore();
    this.formatNumber1 = Constants.FORMAT_NUMBER_1;
  }

  ngOnInit() {
    this.getData();
  }

  ngChanges(changes) {
    if (changes.defaultPayment) {
      this.setDefault();
    }
  }

  setDefault() {
    this.selectedPayment = this.store.payment || this.defaultPayment;
  }

  getData(obj: any = null) {
    this.isOpen = true;
    let code = (obj && obj.item ? obj.item.code : '' || '');
    this.http.get(this.appService.getRootPath() + '/payment/' + code)
      .subscribe(res => {
        this.paymentObj = res.json();
        this.setDefault();
        if (obj && obj.callback) {
          obj.callback();
        }
      });
  }

  selectItem(item: any) {
    let self = this;
    this.isProcess = true;
    let callback = function () {
      self.isProcess = false;
    };
    let code = (item ? item.code : '' || '');
    this.http.post(this.appService.getRootPath() + '/payment', {code: item.code})
      .subscribe(res => {
        this.onSelect.emit({item: item, callback: callback}); // only for refresh, callback is not call
        callback();
      });
  }

  refresh(obj: any = null) {
    this.appService.clearPayment();
    this.defaultPayment = '';
    this.selectedPayment = '';
    this.getData(obj);
  }
}
