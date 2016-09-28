import { isBrowser } from 'angular2-universal';

import { Component } from '@angular/core';
import { Http } from '@angular/http';

import { AppService } from '../app.service';


declare var $: any;

@Component({
  selector: 'list2',
  templateUrl: 'list2.template.html',
})

export class List2 {
  tabsState: number = 1;
  tabsStateHover: number;
  appService: AppService;
  category: any = {id: null};

  constructor(private http: Http) {
    this.appService = AppService.getInstance();
  }

  ngOnInit() {
    if (isBrowser) {
      //noinspection TypeScriptUnresolvedFunction
      $(require('../../../tools/js/jquery/ui/ui.product.img.previews.js'));
      //noinspection TypeScriptUnresolvedFunction
      $(require('../../../tools/js/jquery/ui/ui.vertical.img.previews.js'));
      //noinspection TypeScriptUnresolvedFunction
      $(require('../../../tools/js/jquery/ui/ui.product.img.lightbox.js'));
    }
    this.getData();
  }
  public setTabState(index: number) {
    this.tabsState = index;
  }

  public setHoverIn(index: number) {
    this.tabsStateHover = index;
  }

  public setHoverOut() {
    this.tabsStateHover = this.tabsState;
  }

  getData() {
    this.http.get(this.appService.getRootPath() + '/cats/' + this.appService.getPath())
      .subscribe(res => {
        let data = res.json();
        this.category = data || {};
      });
  }
}
