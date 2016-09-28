import { isBrowser } from 'angular2-universal';

import { Directive, ElementRef, OnInit } from '@angular/core';

import { AppService } from '../app.service';

declare var $: any;

@Directive({
  selector: '[app-width]'
})

export class AppWidth implements OnInit {
  constructor(private _elRef: ElementRef) {}

  ngOnInit() {
    if (isBrowser) {
      let appWidth = $(this._elRef.nativeElement).outerWidth();
      AppService.getInstance().setAppWidth(appWidth);
    }
  }
}
