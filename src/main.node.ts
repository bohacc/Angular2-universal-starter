import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { UniversalModule } from 'angular2-universal';

import { App } from './app/app';
import { routing, appRoutingProviders } from './app/app.routing';

//noinspection TypeScriptUnresolvedVariable
let port = (parseInt(process.env.DIT_PORT, 10) || 9002);

@NgModule({
  bootstrap: [ App ],
  declarations: [
    App,
  ],
  imports: [
    UniversalModule, // NodeModule, NodeHttpModule, and NodeJsonpModule are included
    FormsModule,
    routing,
  ],
  providers: [
    appRoutingProviders,
  ]
})
export class MainModule {}
