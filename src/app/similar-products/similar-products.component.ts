import { Component, Input } from '@angular/core';
import { Http } from '@angular/http';
import {AppService} from "../app.service";

@Component({
  selector: 'similar-products',
  templateUrl: 'similar-products.template.html',
})
export class SimilarProducts {
  @Input('id') id: number;
  @Input('count') count: number;
  products: Array<Object>;
  appService: AppService;

  constructor(private http: Http) {
    this.appService = AppService.getInstance();
  }

  ngOnInit() {

  }

  ngOnChanges(inputChanges) {
    if (inputChanges.id) {
      this.getData();
    }
  }

  getData() {
    if (this.id && !isNaN(this.id)) {
      let self = this;
      this.http.get(this.appService.getRootPath() + '/products/' + this.id + '/similar?count=' + this.count)
        .subscribe(res => {
          let data = res.json();
          this.products = data;
        });
    }
  }

  // TODO: move to service
  buy() {

  }
}
