import { isBrowser } from 'angular2-universal';

import { Component } from '@angular/core';
//import { ROUTER_DIRECTIVES, Router, NavigationEnd, Event } from '@angular/router';

/*declare var ga:Function;*/
declare var window: { dataLayer: any };

@Component({
  selector: 'app',
  templateUrl: 'app.template.html'
})
export class App {
  constructor(/*private router:Router*/) {
    /*Google analytics*/
    /*this.router.events.subscribe(
      (event:Event) => {
        if (event instanceof NavigationEnd && isBrowser) {
          ga('send', 'pageview', event.urlAfterRedirects);
        }
      });*/

    /*Google Tag Manager*/
    /*this.router.events.subscribe(
      (event:Event) => {
        if (event instanceof NavigationEnd && isBrowser) {
          //noinspection TypeScriptUnresolvedVariable
          window.dataLayer.push({
            event: 'pageView',
            action: event.urlAfterRedirects,
          });
        }
      });*/
  }
}
