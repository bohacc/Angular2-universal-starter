import { Component, ElementRef, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { ISelectBox } from '../select-box/select-box.interface';

declare var $: any;

@Component({
  selector: '[select-box]',
  templateUrl: './select-box.template.html',
})

export class SelectBox implements OnInit {
  @Input('items') items: Array<any>;
  @Input('defaultItem') defaultItem: ISelectBox;
  @Output('onSelectItem') onSelectItem = new EventEmitter<ISelectBox>();
  showItems: Boolean;
  selectedItem: ISelectBox = {id: '1', name: '', val: ''};
  emptyItem: ISelectBox = {id: 'empty', name: '', val: ''};
  isDefaultSet: Boolean;

  constructor(private _elRef: ElementRef) {}

  ngOnInit() {
    this.setDefault();
  }

  onEnter() {
    this.showItems = !this.showItems;
  }

  onSelect(item: ISelectBox) {
    this.onSelectItem.emit(item);
    this.selectedItem = item;
    this.showItems = false;
  }

  setDefault() {
    this.showItems = false;
    if (this.defaultItem.id) {
      this.selectedItem = this.defaultItem;
    }
  }
}
