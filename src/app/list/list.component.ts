import { Component, ViewChild, Input } from '@angular/core';
import { Http } from '@angular/http';

import { AppService } from '../app.service';
import { Pagination } from '../pagination/pagination.component';
import { IListFilter } from '../list-filter/list-filter.interface';
import { ISelectBox } from '../select-box/select-box.interface';

@Component({
  selector: 'list',
  templateUrl: 'list.template.html',
})

export class List {
  @Input('asListType') asListType: number;
  @ViewChild(Pagination) pagination:Pagination;
  appService: AppService;
  products: Array<Object>;
  defaultItem: ISelectBox;
  itemsOnPage: Array<ISelectBox>;
  itemsOnPageCount: number;
  page: number;
  sort: ISelectBox;
  inc: Boolean;
  httpSubscription: any;
  sortItems: Array<ISelectBox>;
  defaultItemSort: ISelectBox;
  action: Boolean;
  news: Boolean;
  stock: Boolean;
  notFoundText: string = 'Nenalezen žádný záznam';
  paginationCount: number;
  httpTimeout: any;
  filtersAdvanced: Array<IListFilter> = [];
  filtersBasic: Array<IListFilter> = [];

  constructor(private http: Http) {
    this.appService = AppService.getInstance();
    this.page = 1;
    this.products = [];
    this.itemsOnPage = [
      {id: 1, name: '8', val: '8'},
      {id: 2, name: '24', val: '24'},
      {id: 3, name: '48', val: '48'},
      {id: 4, name: '64', val: '64'}
    ];
    this.defaultItem = this.itemsOnPage[0];
    this.itemsOnPageCount = parseInt(this.defaultItem.val, 10);
    this.sortItems = [
      {id: 1, name: 'Výchozí', val: 'name_asc'},
      {id: 2, name: 'Cena vzestupně', val: 'price_asc'},
      {id: 3, name: 'Cena sestupně', val: 'price_desc'},
      {id: 4, name: 'Kód vzestupně', val: 'code_asc'},
      {id: 5, name: 'Kód sestupně', val: 'code_desc'},
      {id: 6, name: 'Název vzestupně', val: 'name_asc'},
      {id: 7, name: 'Název sestupně', val: 'name_desc'},
    ];
    this.defaultItemSort = this.sortItems[0];
    this.sort = this.defaultItemSort;
  }

  ngOnInit() {
    this.getData();
  }

  getData() {
    let _this = this;
    if (this.httpTimeout) {
      clearTimeout(this.httpTimeout);
    }
    this.httpTimeout = setTimeout(function () {
      if (_this.httpSubscription) {
        _this.httpSubscription.unsubscribe();
      }
      _this.httpSubscription = _this.http.get(_this.appService.getRootPath() + '/products/list/' + _this.appService.getPath() + _this.getMeta())
        .subscribe(res => {
          let data = res.json();
          _this.products = _this.inc ? _this.products.concat(data) : data;
          _this.inc = false;
        });
    }, 200);
  }

  getMeta() {
    return '?page=' + this.getPage() +
      '&rowsonpage=' + this.itemsOnPageCount +
      '&sort=' + this.getSort() +
      '&filter=' + this.getFilter() +
      '&filtersadv=' + this.getFiltersAdvanced() +
      '&filtersbasic=' + this.getFiltersBasic();
  }

  setPage(num: number) {
    this.page = num;
  }

  getPage() {
    return this.page;
  }

  setSort(obj: ISelectBox) {
    this.sort = obj;
  }

  getSort() {
    return this.sort.val;
  }

  getFilter() {
    return (this.stock ? 'stock' : '') +
      ':' + (this.action ? 'action' : '') +
      ':' + (this.news ? 'news' : '');
  }

  getFiltersAdvanced(): string {
    return this.appService.getStringForFilter(this.filtersAdvanced);
  }

  getFiltersBasic(): string {
    return this.appService.getStringForFilter(this.filtersBasic);
  }

  getFilterAll() {
    let flt = this.getFilter();
    let fltAdvanced = this.getFiltersAdvanced();
    let fltBasic = this.getFiltersBasic();
    return 'filter=' + flt + '&' + 'filtersadv=' + fltAdvanced + '&' + 'filtersbasic=' + fltBasic;
  }

  setFiltersAdvanced(filters: Array<IListFilter>) {
    this.filtersAdvanced = filters;
  }

  setFiltersBasic(filters: Array<IListFilter>) {
    this.filtersBasic = filters;
  }

  onPage(page: number) {
    this.setPage(page);
    this.getData();
  }

  onSelectItemsOnPage(obj: ISelectBox) {
    this.itemsOnPageCount = parseInt(obj.val, 10);
  }

  onLoadNextItems(arg: Boolean) {
    this.inc = arg;
  }

  onSelectSort(obj: ISelectBox) {
    this.setSort(obj);
    this.refreshData();
  }

  refreshDataWithPagination() {
    this.getData();
    this.pagination.refresh(this.getFilterAll());
  }

  refreshData() {
    this.getData();
    this.pagination.setDefault();
  }

  getPaginationCount(num: number) {
    this.paginationCount = num;
  }

  onChangeFilterAdvanced(filters: Array<IListFilter>) {
    this.setFiltersAdvanced(filters);
    this.refreshDataWithPagination();
  }

  onChangeFilterBasic(filters: Array<IListFilter>) {
    this.setFiltersBasic(filters);
    this.refreshDataWithPagination();
  }
}
