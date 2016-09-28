import { NgModule } from '@angular/core';

import { ShopCategories } from './shop-categories/shop-categories.component';
import { PageHeader } from './page-header/page-header.component';

@NgModule({
  declarations: [
    ShopCategories,
    PageHeader
  ],
  exports: [
    ShopCategories,
    PageHeader
  ]
})
export class AppModule {
}
