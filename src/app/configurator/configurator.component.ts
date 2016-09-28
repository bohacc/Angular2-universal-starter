import { isBrowser } from 'angular2-universal';

import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Http } from '@angular/http';

import { Carousel } from '../carousel/carousel.component.ts';

declare var $: any;

@Component({
  selector: 'configurator',
  templateUrl: 'configurator.template.html',
})

export class Configurator {
  product: Object;
  tabsState: number;
  tabsStateHover: number;
  amount: string;

  constructor(private route: ActivatedRoute, private http: Http) { }

  ngOnInit() {
    if (isBrowser) {
      //noinspection TypeScriptUnresolvedFunction
      $(require('../../../tools/js/jquery/ui/ui.product.img.zoom.js'));
      //noinspection TypeScriptUnresolvedFunction
      $(require('../../../tools/js/jquery/ui/ui.product.img.previews.js'));
      //noinspection TypeScriptUnresolvedFunction
      $(require('../../../tools/js/jquery/ui/ui.vertical.img.previews.js'));
      //noinspection TypeScriptUnresolvedFunction
      $(require('../../../tools/js/jquery/ui/ui.product.img.lightbox.js'));
      //noinspection TypeScriptUnresolvedFunction
      $(require('../../../tools/js/jquery/ui/ui.product.configurator.js'));

      /*$((function () {
        var options = {
          ranger: $("#slider_lenght"),
          input: $(".amount_lenght"),
          button_increase: $(".amount_increase"),
          button_decrease: $(".amount_decrease"),
          min: 0,
          max: 5000,
          default: 50,
          step: 50,
          postfix: " mm",
          round: false
        }
        configuration_slideshow(options);
      }));*/

      /*
      $(document).ready(function() {
        var options = {
          ranger: $("#slider_power_lenght"),
          input: $(".amount_power_lenght"),
          button_increase: $(".amount_power_increase"),
          button_decrease: $(".amount_power_decrease"),
          min: 0,
          max: 10,
          default: 1,
          step: 0.0500,
          postfix: " m",
          round: true
        }
        configuration_slideshow(options);
      });
      $(document).ready(function() {
        var options = {
          ranger: $("#slider_power_sec_lenght"),
          input: $(".amount_power_sec_lenght"),
          button_increase: $(".amount_power_sec_increase"),
          button_decrease: $(".amount_power_sec_decrease"),
          min: 0,
          max: 10,
          default: 0,
          step: 0.0500,
          postfix: " m",
          round: true
        }
        configuration_slideshow(options);
      });
      */
    }
  }
}
