import { NgModule, Component, Input, Output, EventEmitter, Optional, ElementRef, ChangeDetectionStrategy, ContentChildren, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, style, transition, animate } from '@angular/animations';
import { PrimeTemplate, MessageService } from 'primeng/api';
import { RippleModule } from 'primeng/ripple';
export class Messages {
    constructor(messageService, el, cd) {
        this.messageService = messageService;
        this.el = el;
        this.cd = cd;
        this.closable = true;
        this.enableService = true;
        this.escape = true;
        this.showTransitionOptions = '300ms ease-out';
        this.hideTransitionOptions = '200ms cubic-bezier(0.86, 0, 0.07, 1)';
        this.valueChange = new EventEmitter();
    }
    ngAfterContentInit() {
        this.templates.forEach((item) => {
            switch (item.getType()) {
                case 'content':
                    this.contentTemplate = item.template;
                    break;
                default:
                    this.contentTemplate = item.template;
                    break;
            }
        });
        if (this.messageService && this.enableService && !this.contentTemplate) {
            this.messageSubscription = this.messageService.messageObserver.subscribe((messages) => {
                if (messages) {
                    if (messages instanceof Array) {
                        let filteredMessages = messages.filter(m => this.key === m.key);
                        this.value = this.value ? [...this.value, ...filteredMessages] : [...filteredMessages];
                    }
                    else if (this.key === messages.key) {
                        this.value = this.value ? [...this.value, ...[messages]] : [messages];
                    }
                    this.cd.markForCheck();
                }
            });
            this.clearSubscription = this.messageService.clearObserver.subscribe(key => {
                if (key) {
                    if (this.key === key) {
                        this.value = null;
                    }
                }
                else {
                    this.value = null;
                }
                this.cd.markForCheck();
            });
        }
    }
    hasMessages() {
        let parentEl = this.el.nativeElement.parentElement;
        if (parentEl && parentEl.offsetParent) {
            return this.contentTemplate != null || this.value && this.value.length > 0;
        }
        return false;
    }
    clear() {
        this.value = [];
        this.valueChange.emit(this.value);
    }
    removeMessage(i) {
        this.value = this.value.filter((msg, index) => index !== i);
        this.valueChange.emit(this.value);
    }
    get icon() {
        const severity = this.severity || (this.hasMessages() ? this.value[0].severity : null);
        if (this.hasMessages()) {
            switch (severity) {
                case 'success':
                    return 'pi-check';
                    break;
                case 'info':
                    return 'pi-info-circle';
                    break;
                case 'error':
                    return 'pi-times';
                    break;
                case 'warn':
                    return 'pi-exclamation-triangle';
                    break;
                default:
                    return 'pi-info-circle';
                    break;
            }
        }
        return null;
    }
    ngOnDestroy() {
        if (this.messageSubscription) {
            this.messageSubscription.unsubscribe();
        }
        if (this.clearSubscription) {
            this.clearSubscription.unsubscribe();
        }
    }
}
Messages.decorators = [
    { type: Component, args: [{
                selector: 'p-messages',
                template: `
        <div class="p-messages p-component" role="alert" [ngStyle]="style" [class]="styleClass">
            <ng-container *ngIf="!contentTemplate; else staticMessage">
                <div *ngFor="let msg of value; let i=index" [ngClass]="'p-message p-message-' + msg.severity" role="alert" 
                    [@messageAnimation]="{value: 'visible', params: {showTransitionParams: showTransitionOptions, hideTransitionParams: hideTransitionOptions}}">
                    <div class="p-message-wrapper">
                       <span [class]="'p-message-icon pi' + (msg.icon ? ' ' + msg.icon : '')" [ngClass]="{'pi-info-circle': msg.severity === 'info', 
                            'pi-check': msg.severity === 'success',
                            'pi-exclamation-triangle': msg.severity === 'warn',
                            'pi-times-circle': msg.severity === 'error'}"></span>
                        <ng-container *ngIf="!escape; else escapeOut">
                            <span *ngIf="msg.summary" class="p-message-summary" [innerHTML]="msg.summary"></span>
                            <span *ngIf="msg.detail" class="p-message-detail" [innerHTML]="msg.detail"></span>
                        </ng-container>
                        <ng-template #escapeOut>
                            <span *ngIf="msg.summary" class="p-message-summary">{{msg.summary}}</span>
                            <span *ngIf="msg.detail" class="p-message-detail">{{msg.detail}}</span>
                        </ng-template>
                        <button class="p-message-close p-link" (click)="removeMessage(i)" *ngIf="closable" type="button" pRipple>
                            <i class="p-message-close-icon pi pi-times"></i>
                        </button>
                    </div>
                </div>
            </ng-container>
            <ng-template #staticMessage>
                <div [ngClass]="'p-message p-message-' + severity" role="alert">
                    <div class="p-message-wrapper">
                        <ng-container *ngTemplateOutlet="contentTemplate"></ng-container>
                    </div>
                </div>
            </ng-template>
            </div>
    `,
                animations: [
                    trigger('messageAnimation', [
                        transition(':enter', [
                            style({ opacity: 0, transform: 'translateY(-25%)' }),
                            animate('{{showTransitionParams}}')
                        ]),
                        transition(':leave', [
                            animate('{{hideTransitionParams}}', style({ height: 0, marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0, overflow: 'hidden', opacity: 0 }))
                        ])
                    ])
                ],
                changeDetection: ChangeDetectionStrategy.OnPush,
                encapsulation: ViewEncapsulation.None,
                styles: [".p-message-close,.p-message-wrapper{align-items:center;display:flex}.p-message-close{justify-content:center}.p-message-close.p-link{margin-left:auto;overflow:hidden;position:relative}"]
            },] }
];
Messages.ctorParameters = () => [
    { type: MessageService, decorators: [{ type: Optional }] },
    { type: ElementRef },
    { type: ChangeDetectorRef }
];
Messages.propDecorators = {
    value: [{ type: Input }],
    closable: [{ type: Input }],
    style: [{ type: Input }],
    styleClass: [{ type: Input }],
    enableService: [{ type: Input }],
    key: [{ type: Input }],
    escape: [{ type: Input }],
    severity: [{ type: Input }],
    showTransitionOptions: [{ type: Input }],
    hideTransitionOptions: [{ type: Input }],
    templates: [{ type: ContentChildren, args: [PrimeTemplate,] }],
    valueChange: [{ type: Output }]
};
export class MessagesModule {
}
MessagesModule.decorators = [
    { type: NgModule, args: [{
                imports: [CommonModule, RippleModule],
                exports: [Messages],
                declarations: [Messages]
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVzc2FnZXMuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4vc3JjL2FwcC9jb21wb25lbnRzL21lc3NhZ2VzLyIsInNvdXJjZXMiOlsibWVzc2FnZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFFBQVEsRUFBQyxTQUFTLEVBQVcsS0FBSyxFQUFDLE1BQU0sRUFBQyxZQUFZLEVBQWtCLFFBQVEsRUFBQyxVQUFVLEVBQUMsdUJBQXVCLEVBQUMsZUFBZSxFQUF3QixpQkFBaUIsRUFBRSxpQkFBaUIsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUM5TixPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDN0MsT0FBTyxFQUFDLE9BQU8sRUFBTyxLQUFLLEVBQUMsVUFBVSxFQUFDLE9BQU8sRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQzNFLE9BQU8sRUFBUyxhQUFhLEVBQUMsY0FBYyxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBRWpFLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQW9ENUMsTUFBTSxPQUFPLFFBQVE7SUFnQ2pCLFlBQStCLGNBQThCLEVBQVMsRUFBYyxFQUFTLEVBQXFCO1FBQW5GLG1CQUFjLEdBQWQsY0FBYyxDQUFnQjtRQUFTLE9BQUUsR0FBRixFQUFFLENBQVk7UUFBUyxPQUFFLEdBQUYsRUFBRSxDQUFtQjtRQTVCekcsYUFBUSxHQUFZLElBQUksQ0FBQztRQU16QixrQkFBYSxHQUFZLElBQUksQ0FBQztRQUk5QixXQUFNLEdBQVksSUFBSSxDQUFDO1FBSXZCLDBCQUFxQixHQUFXLGdCQUFnQixDQUFDO1FBRWpELDBCQUFxQixHQUFXLHNDQUFzQyxDQUFDO1FBSXRFLGdCQUFXLEdBQTRCLElBQUksWUFBWSxFQUFhLENBQUM7SUFRc0MsQ0FBQztJQUV0SCxrQkFBa0I7UUFDZCxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO1lBQzVCLFFB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Q0FBQyxFQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLGtCQUFrQixFQUFDLENBQUM7NEJBQ2xELE9BQU8sQ0FBQywwQkFBMEIsQ0FBQzt5QkFDdEMsQ0FBQzt3QkFDRixVQUFVLENBQUMsUUFBUSxFQUFFOzRCQUNqQixPQUFPLENBQUMsMEJBQTBCLEVBQUUsS0FBSyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxFQUFFLFlBQVksRUFBRSxDQUFDLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRSxXQUFXLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7eUJBQzFKLENBQUM7cUJBQ0wsQ0FBQztpQkFDTDtnQkFDRCxlQUFlLEVBQUUsdUJBQXVCLENBQUMsTUFBTTtnQkFDL0MsYUFBYSxFQUFFLGlCQUFpQixDQUFDLElBQUk7O2FBRXhDOzs7WUFyRDZCLGNBQWMsdUJBc0YzQixRQUFRO1lBekZnRSxVQUFVO1lBQW1GLGlCQUFpQjs7O29CQTJEbE0sS0FBSzt1QkFFTCxLQUFLO29CQUVMLEtBQUs7eUJBRUwsS0FBSzs0QkFFTCxLQUFLO2tCQUVMLEtBQUs7cUJBRUwsS0FBSzt1QkFFTCxLQUFLO29DQUVMLEtBQUs7b0NBRUwsS0FBSzt3QkFFTCxlQUFlLFNBQUMsYUFBYTswQkFFN0IsTUFBTTs7QUFzSFgsTUFBTSxPQUFPLGNBQWM7OztZQUwxQixRQUFRLFNBQUM7Z0JBQ04sT0FBTyxFQUFFLENBQUMsWUFBWSxFQUFDLFlBQVksQ0FBQztnQkFDcEMsT0FBTyxFQUFFLENBQUMsUUFBUSxDQUFDO2dCQUNuQixZQUFZLEVBQUUsQ0FBQyxRQUFRLENBQUM7YUFDM0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge05nTW9kdWxlLENvbXBvbmVudCxPbkRlc3Ryb3ksSW5wdXQsT3V0cHV0LEV2ZW50RW1pdHRlcixBZnRlckNvbnRlbnRJbml0LE9wdGlvbmFsLEVsZW1lbnRSZWYsQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksQ29udGVudENoaWxkcmVuLFF1ZXJ5TGlzdCxUZW1wbGF0ZVJlZiwgVmlld0VuY2Fwc3VsYXRpb24sIENoYW5nZURldGVjdG9yUmVmfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHtDb21tb25Nb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XHJcbmltcG9ydCB7dHJpZ2dlcixzdGF0ZSxzdHlsZSx0cmFuc2l0aW9uLGFuaW1hdGV9IGZyb20gJ0Bhbmd1bGFyL2FuaW1hdGlvbnMnO1xyXG5pbXBvcnQge01lc3NhZ2UsUHJpbWVUZW1wbGF0ZSxNZXNzYWdlU2VydmljZX0gZnJvbSAncHJpbWVuZy9hcGknO1xyXG5pbXBvcnQge1N1YnNjcmlwdGlvbn0gZnJvbSAncnhqcyc7XHJcbmltcG9ydCB7UmlwcGxlTW9kdWxlfSBmcm9tICdwcmltZW5nL3JpcHBsZSc7XHJcblxyXG5AQ29tcG9uZW50KHtcclxuICAgIHNlbGVjdG9yOiAncC1tZXNzYWdlcycsXHJcbiAgICB0ZW1wbGF0ZTogYFxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJwLW1lc3NhZ2VzIHAtY29tcG9uZW50XCIgcm9sZT1cImFsZXJ0XCIgW25nU3R5bGVdPVwic3R5bGVcIiBbY2xhc3NdPVwic3R5bGVDbGFzc1wiPlxyXG4gICAgICAgICAgICA8bmctY29udGFpbmVyICpuZ0lmPVwiIWNvbnRlbnRUZW1wbGF0ZTsgZWxzZSBzdGF0aWNNZXNzYWdlXCI+XHJcbiAgICAgICAgICAgICAgICA8ZGl2ICpuZ0Zvcj1cImxldCBtc2cgb2YgdmFsdWU7IGxldCBpPWluZGV4XCIgW25nQ2xhc3NdPVwiJ3AtbWVzc2FnZSBwLW1lc3NhZ2UtJyArIG1zZy5zZXZlcml0eVwiIHJvbGU9XCJhbGVydFwiIFxyXG4gICAgICAgICAgICAgICAgICAgIFtAbWVzc2FnZUFuaW1hdGlvbl09XCJ7dmFsdWU6ICd2aXNpYmxlJywgcGFyYW1zOiB7c2hvd1RyYW5zaXRpb25QYXJhbXM6IHNob3dUcmFuc2l0aW9uT3B0aW9ucywgaGlkZVRyYW5zaXRpb25QYXJhbXM6IGhpZGVUcmFuc2l0aW9uT3B0aW9uc319XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInAtbWVzc2FnZS13cmFwcGVyXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gW2NsYXNzXT1cIidwLW1lc3NhZ2UtaWNvbiBwaScgKyAobXNnLmljb24gPyAnICcgKyBtc2cuaWNvbiA6ICcnKVwiIFtuZ0NsYXNzXT1cInsncGktaW5mby1jaXJjbGUnOiBtc2cuc2V2ZXJpdHkgPT09ICdpbmZvJywgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAncGktY2hlY2snOiBtc2cuc2V2ZXJpdHkgPT09ICdzdWNjZXNzJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdwaS1leGNsYW1hdGlvbi10cmlhbmdsZSc6IG1zZy5zZXZlcml0eSA9PT0gJ3dhcm4nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3BpLXRpbWVzLWNpcmNsZSc6IG1zZy5zZXZlcml0eSA9PT0gJ2Vycm9yJ31cIj48L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxuZy1jb250YWluZXIgKm5nSWY9XCIhZXNjYXBlOyBlbHNlIGVzY2FwZU91dFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gKm5nSWY9XCJtc2cuc3VtbWFyeVwiIGNsYXNzPVwicC1tZXNzYWdlLXN1bW1hcnlcIiBbaW5uZXJIVE1MXT1cIm1zZy5zdW1tYXJ5XCI+PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gKm5nSWY9XCJtc2cuZGV0YWlsXCIgY2xhc3M9XCJwLW1lc3NhZ2UtZGV0YWlsXCIgW2lubmVySFRNTF09XCJtc2cuZGV0YWlsXCI+PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L25nLWNvbnRhaW5lcj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPG5nLXRlbXBsYXRlICNlc2NhcGVPdXQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiAqbmdJZj1cIm1zZy5zdW1tYXJ5XCIgY2xhc3M9XCJwLW1lc3NhZ2Utc3VtbWFyeVwiPnt7bXNnLnN1bW1hcnl9fTwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuICpuZ0lmPVwibXNnLmRldGFpbFwiIGNsYXNzPVwicC1tZXNzYWdlLWRldGFpbFwiPnt7bXNnLmRldGFpbH19PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L25nLXRlbXBsYXRlPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwicC1tZXNzYWdlLWNsb3NlIHAtbGlua1wiIChjbGljayk9XCJyZW1vdmVNZXNzYWdlKGkpXCIgKm5nSWY9XCJjbG9zYWJsZVwiIHR5cGU9XCJidXR0b25cIiBwUmlwcGxlPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGkgY2xhc3M9XCJwLW1lc3NhZ2UtY2xvc2UtaWNvbiBwaSBwaS10aW1lc1wiPjwvaT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9uZy1jb250YWluZXI+XHJcbiAgICAgICAgICAgIDxuZy10ZW1wbGF0ZSAjc3RhdGljTWVzc2FnZT5cclxuICAgICAgICAgICAgICAgIDxkaXYgW25nQ2xhc3NdPVwiJ3AtbWVzc2FnZSBwLW1lc3NhZ2UtJyArIHNldmVyaXR5XCIgcm9sZT1cImFsZXJ0XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInAtbWVzc2FnZS13cmFwcGVyXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxuZy1jb250YWluZXIgKm5nVGVtcGxhdGVPdXRsZXQ9XCJjb250ZW50VGVtcGxhdGVcIj48L25nLWNvbnRhaW5lcj5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L25nLXRlbXBsYXRlPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgIGAsXHJcbiAgICBhbmltYXRpb25zOiBbXHJcbiAgICAgICAgdHJpZ2dlcignbWVzc2FnZUFuaW1hdGlvbicsIFtcclxuICAgICAgICAgICAgdHJhbnNpdGlvbignOmVudGVyJywgW1xyXG4gICAgICAgICAgICAgICAgc3R5bGUoe29wYWNpdHk6IDAsIHRyYW5zZm9ybTogJ3RyYW5zbGF0ZVkoLTI1JSknfSksXHJcbiAgICAgICAgICAgICAgICBhbmltYXRlKCd7e3Nob3dUcmFuc2l0aW9uUGFyYW1zfX0nKVxyXG4gICAgICAgICAgICBdKSxcclxuICAgICAgICAgICAgdHJhbnNpdGlvbignOmxlYXZlJywgW1xyXG4gICAgICAgICAgICAgICAgYW5pbWF0ZSgne3toaWRlVHJhbnNpdGlvblBhcmFtc319Jywgc3R5bGUoeyBoZWlnaHQ6IDAsIG1hcmdpblRvcDogMCwgbWFyZ2luQm90dG9tOiAwLCBtYXJnaW5MZWZ0OiAwLCBtYXJnaW5SaWdodDogMCwgb3ZlcmZsb3c6ICdoaWRkZW4nLCBvcGFjaXR5OiAwIH0pKVxyXG4gICAgICAgICAgICBdKVxyXG4gICAgICAgIF0pXHJcbiAgICBdLFxyXG4gICAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXHJcbiAgICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxyXG4gICAgc3R5bGVVcmxzOiBbJy4vbWVzc2FnZXMuY3NzJ11cclxufSlcclxuZXhwb3J0IGNsYXNzIE1lc3NhZ2VzIGltcGxlbWVudHMgQWZ0ZXJDb250ZW50SW5pdCwgT25EZXN0cm95IHtcclxuXHJcbiAgICBASW5wdXQoKSB2YWx1ZTogTWVzc2FnZVtdO1xyXG5cclxuICAgIEBJbnB1dCgpIGNsb3NhYmxlOiBib29sZWFuID0gdHJ1ZTtcclxuXHJcbiAgICBASW5wdXQoKSBzdHlsZTogYW55O1xyXG5cclxuICAgIEBJbnB1dCgpIHN0eWxlQ2xhc3M6IHN0cmluZztcclxuXHJcbiAgICBASW5wdXQoKSBlbmFibGVTZXJ2aWNlOiBib29sZWFuID0gdHJ1ZTtcclxuXHJcbiAgICBASW5wdXQoKSBrZXk6IHN0cmluZztcclxuXHJcbiAgICBASW5wdXQoKSBlc2NhcGU6IGJvb2xlYW4gPSB0cnVlO1xyXG5cclxuICAgIEBJbnB1dCgpIHNldmVyaXR5OiBzdHJpbmc7XHJcblxyXG4gICAgQElucHV0KCkgc2hvd1RyYW5zaXRpb25PcHRpb25zOiBzdHJpbmcgPSAnMzAwbXMgZWFzZS1vdXQnO1xyXG5cclxuICAgIEBJbnB1dCgpIGhpZGVUcmFuc2l0aW9uT3B0aW9uczogc3RyaW5nID0gJzIwMG1zIGN1YmljLWJlemllcigwLjg2LCAwLCAwLjA3LCAxKSc7XHJcblxyXG4gICAgQENvbnRlbnRDaGlsZHJlbihQcmltZVRlbXBsYXRlKSB0ZW1wbGF0ZXM6IFF1ZXJ5TGlzdDxhbnk+O1xyXG5cclxuICAgIEBPdXRwdXQoKSB2YWx1ZUNoYW5nZTogRXZlbnRFbWl0dGVyPE1lc3NhZ2VbXT4gPSBuZXcgRXZlbnRFbWl0dGVyPE1lc3NhZ2VbXT4oKTtcclxuXHJcbiAgICBtZXNzYWdlU3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb247XHJcblxyXG4gICAgY2xlYXJTdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbjtcclxuXHJcbiAgICBjb250ZW50VGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT47XHJcblxyXG4gICAgY29uc3RydWN0b3IoQE9wdGlvbmFsKCkgcHVibGljIG1lc3NhZ2VTZXJ2aWNlOiBNZXNzYWdlU2VydmljZSwgcHVibGljIGVsOiBFbGVtZW50UmVmLCBwdWJsaWMgY2Q6IENoYW5nZURldGVjdG9yUmVmKSB7fVxyXG5cclxuICAgIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcclxuICAgICAgICB0aGlzLnRlbXBsYXRlcy5mb3JFYWNoKChpdGVtKSA9PiB7XHJcbiAgICAgICAgICAgIHN3aXRjaChpdGVtLmdldFR5cGUoKSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnY29udGVudCc6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb250ZW50VGVtcGxhdGUgPSBpdGVtLnRlbXBsYXRlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnRlbnRUZW1wbGF0ZSA9IGl0ZW0udGVtcGxhdGU7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5tZXNzYWdlU2VydmljZSAmJiB0aGlzLmVuYWJsZVNlcnZpY2UgJiYgIXRoaXMuY29udGVudFRlbXBsYXRlKSB7XHJcbiAgICAgICAgICAgIHRoaXMubWVzc2FnZVN1YnNjcmlwdGlvbiA9IHRoaXMubWVzc2FnZVNlcnZpY2UubWVzc2FnZU9ic2VydmVyLnN1YnNjcmliZSgobWVzc2FnZXM6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKG1lc3NhZ2VzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1lc3NhZ2VzIGluc3RhbmNlb2YgQXJyYXkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGZpbHRlcmVkTWVzc2FnZXMgPSBtZXNzYWdlcy5maWx0ZXIobSA9PiB0aGlzLmtleSA9PT0gbS5rZXkpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy52YWx1ZSA/IFsuLi50aGlzLnZhbHVlLCAuLi5maWx0ZXJlZE1lc3NhZ2VzXSA6IFsuLi5maWx0ZXJlZE1lc3NhZ2VzXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5rZXkgPT09IG1lc3NhZ2VzLmtleSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy52YWx1ZSA/IFsuLi50aGlzLnZhbHVlLCAuLi5bbWVzc2FnZXNdXSA6IFttZXNzYWdlc107XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNkLm1hcmtGb3JDaGVjaygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY2xlYXJTdWJzY3JpcHRpb24gPSB0aGlzLm1lc3NhZ2VTZXJ2aWNlLmNsZWFyT2JzZXJ2ZXIuc3Vic2NyaWJlKGtleSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoa2V5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMua2V5ID09PSBrZXkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy52YWx1ZSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy52YWx1ZSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jZC5tYXJrRm9yQ2hlY2soKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGhhc01lc3NhZ2VzKCkge1xyXG4gICAgICAgIGxldCBwYXJlbnRFbCA9IHRoaXMuZWwubmF0aXZlRWxlbWVudC5wYXJlbnRFbGVtZW50O1xyXG4gICAgICAgIGlmIChwYXJlbnRFbCAmJiBwYXJlbnRFbC5vZmZzZXRQYXJlbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29udGVudFRlbXBsYXRlICE9IG51bGwgfHwgdGhpcy52YWx1ZSAmJiB0aGlzLnZhbHVlLmxlbmd0aCA+IDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgY2xlYXIoKSB7XHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IFtdO1xyXG4gICAgICAgIHRoaXMudmFsdWVDaGFuZ2UuZW1pdCh0aGlzLnZhbHVlKTtcclxuICAgIH1cclxuXHJcbiAgICByZW1vdmVNZXNzYWdlKGk6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMudmFsdWUgPSB0aGlzLnZhbHVlLmZpbHRlcigobXNnLCBpbmRleCkgPT4gaW5kZXggIT09IGkpO1xyXG4gICAgICAgIHRoaXMudmFsdWVDaGFuZ2UuZW1pdCh0aGlzLnZhbHVlKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgaWNvbigpOiBzdHJpbmcge1xyXG4gICAgICAgIGNvbnN0IHNldmVyaXR5ID0gdGhpcy5zZXZlcml0eSB8fCAodGhpcy5oYXNNZXNzYWdlcygpID8gdGhpcy52YWx1ZVswXS5zZXZlcml0eSA6IG51bGwpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5oYXNNZXNzYWdlcygpKSB7XHJcbiAgICAgICAgICAgIHN3aXRjaChzZXZlcml0eSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnc3VjY2Vzcyc6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICdwaS1jaGVjayc7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgICAgICBjYXNlICdpbmZvJzpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ3BpLWluZm8tY2lyY2xlJztcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgIGNhc2UgJ2Vycm9yJzpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ3BpLXRpbWVzJztcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgIGNhc2UgJ3dhcm4nOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAncGktZXhjbGFtYXRpb24tdHJpYW5nbGUnO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ3BpLWluZm8tY2lyY2xlJztcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBuZ09uRGVzdHJveSgpIHtcclxuICAgICAgICBpZiAodGhpcy5tZXNzYWdlU3Vic2NyaXB0aW9uKSB7XHJcbiAgICAgICAgICAgIHRoaXMubWVzc2FnZVN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuY2xlYXJTdWJzY3JpcHRpb24pIHtcclxuICAgICAgICAgICAgdGhpcy5jbGVhclN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuQE5nTW9kdWxlKHtcclxuICAgIGltcG9ydHM6IFtDb21tb25Nb2R1bGUsUmlwcGxlTW9kdWxlXSxcclxuICAgIGV4cG9ydHM6IFtNZXNzYWdlc10sXHJcbiAgICBkZWNsYXJhdGlvbnM6IFtNZXNzYWdlc11cclxufSlcclxuZXhwb3J0IGNsYXNzIE1lc3NhZ2VzTW9kdWxlIHsgfVxyXG4iXX0=