import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

import Constants = require('../../backend/constants');
import {Http} from "@angular/http";

@Component({
  selector: 'list-item',
  templateUrl: 'list-item.template.html',
})
export class ListItem {
  @Input('item') item: any;

  constructor(private router: Router, private http: Http) {}

  buy() {
    this.http.post('/products/' + this.item.id + '/buy', {item: this.item, amount: 1})
      .subscribe(
        res => {
          let data = res.json() || [];
          this.router.navigate([Constants.PATHS.CART]);
        },
        err => {
          console.log(Constants.PRODUCT_ADD_TO_CART_ERROR);
        }
      );
  }
}
