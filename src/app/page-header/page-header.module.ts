import { NgModule } from '@angular/core';

import { PageHeader } from './page-header.component';
import { ShopCategories } from '../shop-categories/shop-categories.component';

@NgModule({
  declarations: [
    PageHeader
  ],
  exports: [
    PageHeader
  ]
})
export class PageHeaderModule {
}
