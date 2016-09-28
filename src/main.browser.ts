import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { UniversalModule } from 'angular2-universal';

import { App } from './app/app';
import { routing, appRoutingProviders } from './app/app.routing';
import {Home} from "./app/home/home.component";

@NgModule({
  bootstrap: [ App ],
  declarations: [
    App,
    Home
  ],
  imports: [
    UniversalModule, // BrowserModule, HttpModule, and JsonpModule are included
    FormsModule,
    routing,
  ],
  providers: [
    appRoutingProviders,
  ]
})
export class MainModule {}

