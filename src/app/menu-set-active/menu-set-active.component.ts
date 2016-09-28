import { isBrowser } from 'angular2-universal';

import { Directive, ElementRef, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { AppService } from '../app.service';

declare var $: any;

@Directive({
  selector: '[menu-set-active]',
})

export class MenuSetActive implements AfterViewInit {
  @Output('onCollapseAll') onCollapseAll = new EventEmitter();
  appService: AppService;
  isOn: Boolean = false;

  constructor(private _elRef: ElementRef, private router: Router) {
    this.appService = AppService.getInstance();
  }

  ngOnInit() {
    this.router.events.subscribe(path => {
      if (this.isOn) {
        this.setActive();
        this.onCollapseAll.emit(null);
      }
    });

  }

  ngAfterViewInit() {
    this.setActive();
    this.isOn = true;
  }
  setActive() {
    if (isBrowser) {
      $(this._elRef.nativeElement)
        .find('li')
        .addClass('active')
        .removeClass('active')
        .removeClass('opened');
      //this.menuIsShowMobile('CATS-1')

      $(this._elRef.nativeElement)
        .find('a[href="/' + this.appService.getPath() + '"]')
        .parents('li')
        .addClass('active')
        .addClass('opened');
    }
  }
}
