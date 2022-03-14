import { NgModule, Component, Input, ElementRef, ChangeDetectionStrategy, ViewEncapsulation, ContentChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimeTemplate, SharedModule } from 'primeng/api';
export class Timeline {
    constructor(el) {
        this.el = el;
        this.align = 'left';
        this.layout = 'vertical';
    }
    getBlockableElement() {
        return this.el.nativeElement.children[0];
    }
    ngAfterContentInit() {
        this.templates.forEach((item) => {
            switch (item.getType()) {
                case 'content':
                    this.contentTemplate = item.template;
                    break;
                case 'opposite':
                    this.oppositeTemplate = item.template;
                    break;
                case 'marker':
                    this.markerTemplate = item.template;
                    break;
            }
        });
    }
}
Timeline.decorators = [
    { type: Component, args: [{
                selector: 'p-timeline',
                template: `
        <div [class]="styleClass" [ngStyle]="style" [ngClass]="{'p-timeline p-component': true, 
                'p-timeline-left': align === 'left',
                'p-timeline-right': align === 'right',
                'p-timeline-top': align === 'top',
                'p-timeline-bottom': align === 'bottom',
                'p-timeline-alternate': align === 'alternate',
                'p-timeline-vertical': layout === 'vertical',
                'p-timeline-horizontal': layout === 'horizontal'}">
            <div *ngFor="let event of value; let last=last" class="p-timeline-event">
                <div class="p-timeline-event-opposite">
                    <ng-container *ngTemplateOutlet="oppositeTemplate; context: {$implicit: event}"></ng-container>
                </div>
                <div class="p-timeline-event-separator">
                    <ng-container *ngIf="markerTemplate; else marker">
                        <ng-container *ngTemplateOutlet="markerTemplate; context: {$implicit: event}"></ng-container>
                    </ng-container>
                    <ng-template #marker>
                        <div class="p-timeline-event-marker"></div>
                    </ng-template>
                    <div *ngIf="!last" class="p-timeline-event-connector"></div>
                </div>
                <div class="p-timeline-event-content">
                    <ng-container *ngTemplateOutlet="contentTemplate; context: {$implicit: event}"></ng-container>
                </div>
            </div>
        </div>
    `,
                changeDetection: ChangeDetectionStrategy.OnPush,
                encapsulation: ViewEncapsulation.None,
                styles: [".p-timeline{display:flex;flex-direction:column;flex-grow:1}.p-timeline-left .p-timeline-event-opposite{text-align:right}.p-timeline-left .p-timeline-event-content{text-align:left}.p-timeline-right .p-timeline-event{flex-direction:row-reverse}.p-timeline-right .p-timeline-event-opposite{text-align:left}.p-timeline-right .p-timeline-event-content{text-align:right}.p-timeline-vertical.p-timeline-alternate .p-timeline-event:nth-child(2n){flex-direction:row-reverse}.p-timeline-vertical.p-timeline-alternate .p-timeline-event:nth-child(odd) .p-timeline-event-opposite{text-align:right}.p-timeline-vertical.p-timeline-alternate .p-timeline-event:nth-child(2n) .p-timeline-event-opposite,.p-timeline-vertical.p-timeline-alternate .p-timeline-event:nth-child(odd) .p-timeline-event-content{text-align:left}.p-timeline-vertical.p-timeline-alternate .p-timeline-event:nth-child(2n) .p-timeline-event-content{text-align:right}.p-timeline-event{display:flex;min-height:70px;position:relative}.p-timeline-event:last-child{min-height:0}.p-timeline-event-content,.p-timeline-event-opposite{flex:1;padding:0 1rem}.p-timeline-event-separator{align-items:center;display:flex;flex:0;flex-direction:column}.p-timeline-event-marker{align-self:baseline;display:flex}.p-timeline-event-connector{flex-grow:1}.p-timeline-horizontal{flex-direction:row}.p-timeline-horizontal .p-timeline-event{flex:1;flex-direction:column}.p-timeline-horizontal .p-timeline-event:last-child{flex:0}.p-timeline-horizontal .p-timeline-event-separator{flex-direction:row}.p-timeline-horizontal .p-timeline-event-connector{width:100%}.p-timeline-bottom .p-timeline-event,.p-timeline-horizontal.p-timeline-alternate .p-timeline-event:nth-child(2n){flex-direction:column-reverse}"]
            },] }
];
Timeline.ctorParameters = () => [
    { type: ElementRef }
];
Timeline.propDecorators = {
    value: [{ type: Input }],
    style: [{ type: Input }],
    styleClass: [{ type: Input }],
    align: [{ type: Input }],
    layout: [{ type: Input }],
    templates: [{ type: ContentChildren, args: [PrimeTemplate,] }]
};
export class TimelineModule {
}
TimelineModule.decorators = [
    { type: NgModule, args: [{
                imports: [CommonModule],
                exports: [Timeline, SharedModule],
                declarations: [Timeline]
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGltZWxpbmUuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4vc3JjL2FwcC9jb21wb25lbnRzL3RpbWVsaW5lLyIsInNvdXJjZXMiOlsidGltZWxpbmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSx1QkFBdUIsRUFBRSxpQkFBaUIsRUFBb0IsZUFBZSxFQUF5QixNQUFNLGVBQWUsQ0FBQztBQUM1SyxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDN0MsT0FBTyxFQUFjLGFBQWEsRUFBRSxZQUFZLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFvQ3JFLE1BQU0sT0FBTyxRQUFRO0lBb0JqQixZQUFvQixFQUFjO1FBQWQsT0FBRSxHQUFGLEVBQUUsQ0FBWTtRQVp6QixVQUFLLEdBQVcsTUFBTSxDQUFDO1FBRXZCLFdBQU0sR0FBVyxVQUFVLENBQUM7SUFVQSxDQUFDO0lBRXRDLG1CQUFtQjtRQUNmLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzdDLENBQUM7SUFFRCxrQkFBa0I7UUFDZCxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO1lBQzVCLFFBQU8sSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFO2dCQUNuQixLQUFLLFNBQVM7b0JBQ1YsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO29CQUN6QyxNQUFNO2dCQUVOLEtBQUssVUFBVTtvQkFDWCxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztvQkFDMUMsTUFBTTtnQkFFTixLQUFLLFFBQVE7b0JBQ1QsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO29CQUN4QyxNQUFNO2FBQ1Q7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7OztZQTVFSixTQUFTLFNBQUM7Z0JBQ1AsUUFBUSxFQUFFLFlBQVk7Z0JBQ3RCLFFBQVEsRUFBRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0tBMkJUO2dCQUNELGVBQWUsRUFBRSx1QkFBdUIsQ0FBQyxNQUFNO2dCQUMvQyxhQUFhLEVBQUUsaUJBQWlCLENBQUMsSUFBSTs7YUFFeEM7OztZQXJDbUMsVUFBVTs7O29CQXdDekMsS0FBSztvQkFFTCxLQUFLO3lCQUVMLEtBQUs7b0JBRUwsS0FBSztxQkFFTCxLQUFLO3dCQUVMLGVBQWUsU0FBQyxhQUFhOztBQXVDbEMsTUFBTSxPQUFPLGNBQWM7OztZQUwxQixRQUFRLFNBQUM7Z0JBQ04sT0FBTyxFQUFFLENBQUMsWUFBWSxDQUFDO2dCQUN2QixPQUFPLEVBQUUsQ0FBQyxRQUFRLEVBQUUsWUFBWSxDQUFDO2dCQUNqQyxZQUFZLEVBQUUsQ0FBQyxRQUFRLENBQUM7YUFDM0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge05nTW9kdWxlICxDb21wb25lbnQsIElucHV0LCBFbGVtZW50UmVmLCBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSwgVmlld0VuY2Fwc3VsYXRpb24sIEFmdGVyQ29udGVudEluaXQsIENvbnRlbnRDaGlsZHJlbiwgUXVlcnlMaXN0LCBUZW1wbGF0ZVJlZn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7Q29tbW9uTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xyXG5pbXBvcnQge0Jsb2NrYWJsZVVJLCBQcmltZVRlbXBsYXRlLCBTaGFyZWRNb2R1bGV9IGZyb20gJ3ByaW1lbmcvYXBpJztcclxuXHJcbkBDb21wb25lbnQoe1xyXG4gICAgc2VsZWN0b3I6ICdwLXRpbWVsaW5lJyxcclxuICAgIHRlbXBsYXRlOiBgXHJcbiAgICAgICAgPGRpdiBbY2xhc3NdPVwic3R5bGVDbGFzc1wiIFtuZ1N0eWxlXT1cInN0eWxlXCIgW25nQ2xhc3NdPVwieydwLXRpbWVsaW5lIHAtY29tcG9uZW50JzogdHJ1ZSwgXHJcbiAgICAgICAgICAgICAgICAncC10aW1lbGluZS1sZWZ0JzogYWxpZ24gPT09ICdsZWZ0JyxcclxuICAgICAgICAgICAgICAgICdwLXRpbWVsaW5lLXJpZ2h0JzogYWxpZ24gPT09ICdyaWdodCcsXHJcbiAgICAgICAgICAgICAgICAncC10aW1lbGluZS10b3AnOiBhbGlnbiA9PT0gJ3RvcCcsXHJcbiAgICAgICAgICAgICAgICAncC10aW1lbGluZS1ib3R0b20nOiBhbGlnbiA9PT0gJ2JvdHRvbScsXHJcbiAgICAgICAgICAgICAgICAncC10aW1lbGluZS1hbHRlcm5hdGUnOiBhbGlnbiA9PT0gJ2FsdGVybmF0ZScsXHJcbiAgICAgICAgICAgICAgICAncC10aW1lbGluZS12ZXJ0aWNhbCc6IGxheW91dCA9PT0gJ3ZlcnRpY2FsJyxcclxuICAgICAgICAgICAgICAgICdwLXRpbWVsaW5lLWhvcml6b250YWwnOiBsYXlvdXQgPT09ICdob3Jpem9udGFsJ31cIj5cclxuICAgICAgICAgICAgPGRpdiAqbmdGb3I9XCJsZXQgZXZlbnQgb2YgdmFsdWU7IGxldCBsYXN0PWxhc3RcIiBjbGFzcz1cInAtdGltZWxpbmUtZXZlbnRcIj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwLXRpbWVsaW5lLWV2ZW50LW9wcG9zaXRlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPG5nLWNvbnRhaW5lciAqbmdUZW1wbGF0ZU91dGxldD1cIm9wcG9zaXRlVGVtcGxhdGU7IGNvbnRleHQ6IHskaW1wbGljaXQ6IGV2ZW50fVwiPjwvbmctY29udGFpbmVyPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicC10aW1lbGluZS1ldmVudC1zZXBhcmF0b3JcIj5cclxuICAgICAgICAgICAgICAgICAgICA8bmctY29udGFpbmVyICpuZ0lmPVwibWFya2VyVGVtcGxhdGU7IGVsc2UgbWFya2VyXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxuZy1jb250YWluZXIgKm5nVGVtcGxhdGVPdXRsZXQ9XCJtYXJrZXJUZW1wbGF0ZTsgY29udGV4dDogeyRpbXBsaWNpdDogZXZlbnR9XCI+PC9uZy1jb250YWluZXI+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9uZy1jb250YWluZXI+XHJcbiAgICAgICAgICAgICAgICAgICAgPG5nLXRlbXBsYXRlICNtYXJrZXI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwLXRpbWVsaW5lLWV2ZW50LW1hcmtlclwiPjwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDwvbmctdGVtcGxhdGU+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiAqbmdJZj1cIiFsYXN0XCIgY2xhc3M9XCJwLXRpbWVsaW5lLWV2ZW50LWNvbm5lY3RvclwiPjwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicC10aW1lbGluZS1ldmVudC1jb250ZW50XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPG5nLWNvbnRhaW5lciAqbmdUZW1wbGF0ZU91dGxldD1cImNvbnRlbnRUZW1wbGF0ZTsgY29udGV4dDogeyRpbXBsaWNpdDogZXZlbnR9XCI+PC9uZy1jb250YWluZXI+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICBgLFxyXG4gICAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXHJcbiAgICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxyXG4gICAgc3R5bGVVcmxzOiBbJy4vdGltZWxpbmUuY3NzJ11cclxufSlcclxuZXhwb3J0IGNsYXNzIFRpbWVsaW5lIGltcGxlbWVudHMgQWZ0ZXJDb250ZW50SW5pdCwgQmxvY2thYmxlVUkge1xyXG5cclxuICAgIEBJbnB1dCgpIHZhbHVlOiBhbnlbXTtcclxuXHJcbiAgICBASW5wdXQoKSBzdHlsZTogYW55O1xyXG5cclxuICAgIEBJbnB1dCgpIHN0eWxlQ2xhc3M6IHN0cmluZztcclxuXHJcbiAgICBASW5wdXQoKSBhbGlnbjogc3RyaW5nID0gJ2xlZnQnO1xyXG5cclxuICAgIEBJbnB1dCgpIGxheW91dDogc3RyaW5nID0gJ3ZlcnRpY2FsJztcclxuXHJcbiAgICBAQ29udGVudENoaWxkcmVuKFByaW1lVGVtcGxhdGUpIHRlbXBsYXRlczogUXVlcnlMaXN0PGFueT47XHJcblxyXG4gICAgY29udGVudFRlbXBsYXRlOiBUZW1wbGF0ZVJlZjxhbnk+O1xyXG5cclxuICAgIG9wcG9zaXRlVGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT47XHJcblxyXG4gICAgbWFya2VyVGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT47XHJcblxyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBlbDogRWxlbWVudFJlZikge31cclxuXHJcbiAgICBnZXRCbG9ja2FibGVFbGVtZW50KCk6IEhUTUxFbGVtZW50IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5lbC5uYXRpdmVFbGVtZW50LmNoaWxkcmVuWzBdO1xyXG4gICAgfVxyXG5cclxuICAgIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcclxuICAgICAgICB0aGlzLnRlbXBsYXRlcy5mb3JFYWNoKChpdGVtKSA9PiB7XHJcbiAgICAgICAgICAgIHN3aXRjaChpdGVtLmdldFR5cGUoKSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnY29udGVudCc6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb250ZW50VGVtcGxhdGUgPSBpdGVtLnRlbXBsYXRlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICAgICAgY2FzZSAnb3Bwb3NpdGUnOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3Bwb3NpdGVUZW1wbGF0ZSA9IGl0ZW0udGVtcGxhdGU7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgICAgICBjYXNlICdtYXJrZXInOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFya2VyVGVtcGxhdGUgPSBpdGVtLnRlbXBsYXRlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbn1cclxuXHJcbkBOZ01vZHVsZSh7XHJcbiAgICBpbXBvcnRzOiBbQ29tbW9uTW9kdWxlXSxcclxuICAgIGV4cG9ydHM6IFtUaW1lbGluZSwgU2hhcmVkTW9kdWxlXSxcclxuICAgIGRlY2xhcmF0aW9uczogW1RpbWVsaW5lXVxyXG59KVxyXG5leHBvcnQgY2xhc3MgVGltZWxpbmVNb2R1bGUgeyB9XHJcbiJdfQ==