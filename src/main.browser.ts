import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { UniversalModule } from 'angular2-universal';

import { AlertModule, DatepickerModule, DropdownModule } from 'ng2-bootstrap/ng2-bootstrap';

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
    AlertModule,
    DatepickerModule,
    DropdownModule
  ],
  providers: [
    appRoutingProviders,
  ]
})
export class MainModule {}

