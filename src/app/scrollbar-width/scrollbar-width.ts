import { isBrowser } from 'angular2-universal';

import { Directive, ElementRef, OnInit } from '@angular/core';

import { AppService } from '../app.service';

declare var $: any;

@Directive({
  selector: '[scroll-bar-width]'
})

export class ScrollBarWidth implements OnInit {
  constructor(private _elRef: ElementRef) {}

  ngOnInit() {
    if (isBrowser) {
      // JQUERY ACTUAL VIEWPORT
      let widthWithScroll = $(this._elRef.nativeElement).outerWidth();
      AppService.getInstance().setScrollBarWidth(100 - widthWithScroll);
    }
  }
}
