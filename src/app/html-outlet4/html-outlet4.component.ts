//our root app component
import { NgModule, Component, Compiler, ViewContainerRef, ViewChild, Input, ComponentRef, ComponentFactory, ComponentFactoryResolver, ElementRef} from '@angular/core'
import { FormsModule } from '@angular/forms';

import {UniversalModule, isBrowser} from 'angular2-universal';

import { routing, appRoutingProviders } from '../app.routing';
import {SlidesComponent} from "../slides/slides.component";

declare var $: any;

// Helper component to add dynamic components
@Component({
  selector: 'dcl-wrapper-other',
  template: `<div #target></div>`
})
export class HtmlOutlet4 {
  @ViewChild('target', {read: ViewContainerRef}) target;
  @Input() html;
  cmpRef: ComponentRef<any>;
  private isViewInitialized:boolean = false;

  constructor(private componentFactoryResolver: ComponentFactoryResolver, private compiler: Compiler) {}

  updateComponent() {
    if(!this.isViewInitialized) {
      return;
    }
    if(this.cmpRef) {
      this.cmpRef.destroy();
    }
    if (!this.html) {
      return;
    }

    let html = this.html;
    @Component({template: html})
    class TemplateComponent {
      constructor(private _elRef: ElementRef) {}
      ngOnInit() {
        if (isBrowser && html.indexOf('slides') > -1) {
          $(require('../../../tools/js/jquery/slideshow/jquery.slides.js'));
          $(this._elRef.nativeElement).find('.slides').slidesjs({
            width: "100%",
            height: "100%",
            play: {
              active: true,
              effect: "fade",
              interval: 7000,
              auto: true,
              swap: false,
              pauseOnHover: false,
              restartDelay: 7000
            },

            menu_titles: {
              active: true
            }
          });
        }
      }
    }
    @NgModule({
      declarations: [
        TemplateComponent,
        //SlidesComponent
      ],
      //entryComponents: [SlidesComponent],
      imports: [
        UniversalModule,
        FormsModule,
        routing,
      ],
      providers: [
        appRoutingProviders,
      ]
    })
    class TemplateModule {}
    const mod = this.compiler.compileModuleAndAllComponentsSync(TemplateModule);
    const factory = mod.componentFactories.find((comp) =>
      comp.componentType === TemplateComponent
    );

    this.cmpRef = this.target.createComponent(factory);
  }

  ngOnChanges() {
    this.updateComponent();
  }

  ngAfterViewInit() {
    this.isViewInitialized = true;
    this.updateComponent();
  }

  ngOnDestroy() {
    if(this.cmpRef) {
      this.cmpRef.destroy();
    }
  }
}
