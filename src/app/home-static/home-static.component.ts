import { Component } from '@angular/core';

import { AppService } from '../app.service';

@Component({
  selector: 'home-static',
  templateUrl: 'home-static.template.html',
})
export class HomeStatic {
  appService: AppService;

  constructor() {
    this.appService = AppService.getInstance();
  }

  ngAfterViewInit() {
    //this.appService.refreshWidth();
  }

  onResize(event) {
    //this.appService.setAppWidth(event.target.innerWidth);
    //this.appService.refreshWidth();
  }
}
