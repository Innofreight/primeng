import { NgModule, Component, Input, Output, ViewChild, EventEmitter, ContentChildren, ChangeDetectionStrategy, NgZone, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomHandler } from 'primeng/dom';
import { PrimeTemplate, SharedModule } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { UniqueComponentId } from 'primeng/utils';
import { RippleModule } from 'primeng/ripple';
import { trigger, state, style, transition, animate, query, animateChild } from '@angular/animations';
export class ToastItem {
    constructor(zone) {
        this.zone = zone;
        this.onClose = new EventEmitter();
    }
    ngAfterViewInit() {
        this.initTimeout();
    }
    initTimeout() {
        if (!this.message.sticky) {
            this.zone.runOutsideAngular(() => {
                this.timeout = setTimeout(() => {
                    this.onClose.emit({
                        index: this.index,
                        message: this.message
                    });
                }, this.message.life || 3000);
            });
        }
    }
    clearTimeout() {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
    }
    onMouseEnter() {
        this.clearTimeout();
    }
    onMouseLeave() {
        this.initTimeout();
    }
    onCloseIconClick(event) {
        this.clearTimeout();
        this.onClose.emit({
            index: this.index,
            message: this.message
        });
        event.preventDefault();
    }
    ngOnDestroy() {
        this.clearTimeout();
    }
}
ToastItem.decorators = [
    { type: Component, args: [{
                selector: 'p-toastItem',
                template: `
        <div #container [attr.id]="message.id" [class]="message.styleClass" [ngClass]="['p-toast-message-' + message.severity, 'p-toast-message']" [@messageState]="{value: 'visible', params: {showTransformParams: showTransformOptions, hideTransformParams: hideTransformOptions, showTransitionParams: showTransitionOptions, hideTransitionParams: hideTransitionOptions}}"
                (mouseenter)="onMouseEnter()" (mouseleave)="onMouseLeave()">
            <div class="p-toast-message-content" role="alert" aria-live="assertive" aria-atomic="true"  [ngClass]="message.contentStyleClass">
                <ng-container *ngIf="!template">
                    <span [class]="'p-toast-message-icon pi' + (message.icon ? ' ' + message.icon : '')" [ngClass]="{'pi-info-circle': message.severity == 'info', 'pi-exclamation-triangle': message.severity == 'warn',
                        'pi-times-circle': message.severity == 'error', 'pi-check' :message.severity == 'success'}"></span>
                    <div class="p-toast-message-text">
                        <div class="p-toast-summary">{{message.summary}}</div>
                        <div class="p-toast-detail">{{message.detail}}</div>
                    </div>
                </ng-container>
                <ng-container *ngTemplateOutlet="template; context: {$implicit: message}"></ng-container>
                <button type="button" class="p-toast-icon-close p-link" (click)="onCloseIconClick($event)" (keydown.enter)="onCloseIconClick($event)" *ngIf="message.closable !== false" pRipple>
                    <span class="p-toast-icon-close-icon pi pi-times"></span>
                </button>
            </div>
        </div>
    `,
                animations: [
                    trigger('messageState', [
                        state('visible', style({
                            transform: 'translateY(0)',
                            opacity: 1
                        })),
                        transition('void => *', [
                            style({ transform: '{{showTransformParams}}', opacity: 0 }),
                            animate('{{showTransitionParams}}')
                        ]),
                        transition('* => void', [
                            animate(('{{hideTransitionParams}}'), style({
                                height: 0,
                                opacity: 0,
                                transform: '{{hideTransformParams}}'
                            }))
                        ])
                    ])
                ],
                encapsulation: ViewEncapsulation.None,
                changeDetection: ChangeDetectionStrategy.OnPush
            },] }
];
ToastItem.ctorParameters = () => [
    { type: NgZone }
];
ToastItem.propDecorators = {
    message: [{ type: Input }],
    index: [{ type: Input }],
    template: [{ type: Input }],
    showTransformOptions: [{ type: Input }],
    hideTransformOptions: [{ type: Input }],
    showTransitionOptions: [{ type: Input }],
    hideTransitionOptions: [{ type: Input }],
    onClose: [{ type: Output }],
    containerViewChild: [{ type: ViewChild, args: ['container',] }]
};
export class Toast {
    constructor(messageService, cd) {
        this.messageService = messageService;
        this.cd = cd;
        this.autoZIndex = true;
        this.baseZIndex = 0;
        this.position = 'top-right';
        this.preventOpenDuplicates = false;
        this.preventDuplicates = false;
        this.showTransformOptions = 'translateY(100%)';
        this.hideTransformOptions = 'translateY(-100%)';
        this.showTransitionOptions = '300ms ease-out';
        this.hideTransitionOptions = '250ms ease-in';
        this.onClose = new EventEmitter();
        this.id = UniqueComponentId();
    }
    ngOnInit() {
        this.messageSubscription = this.messageService.messageObserver.subscribe(messages => {
            if (messages) {
                if (messages instanceof Array) {
                    const filteredMessages = messages.filter(m => this.canAdd(m));
                    this.add(filteredMessages);
                }
                else if (this.canAdd(messages)) {
                    this.add([messages]);
                }
            }
        });
        this.clearSubscription = this.messageService.clearObserver.subscribe(key => {
            if (key) {
                if (this.key === key) {
                    this.messages = null;
                }
            }
            else {
                this.messages = null;
            }
            this.cd.markForCheck();
        });
        if (this.breakpoints) {
            this.createStyle();
        }
    }
    add(messages) {
        this.messages = this.messages ? [...this.messages, ...messages] : [...messages];
        if (this.preventDuplicates) {
            this.messagesArchieve = this.messagesArchieve ? [...this.messagesArchieve, ...messages] : [...messages];
        }
        this.cd.markForCheck();
    }
    canAdd(message) {
        let allow = this.key === message.key;
        if (allow && this.preventOpenDuplicates) {
            allow = !this.containsMessage(this.messages, message);
        }
        if (allow && this.preventDuplicates) {
            allow = !this.containsMessage(this.messagesArchieve, message);
        }
        return allow;
    }
    containsMessage(collection, message) {
        if (!collection) {
            return false;
        }
        return collection.find(m => {
            return ((m.summary === message.summary) && (m.detail == message.detail) && (m.severity === message.severity));
        }) != null;
    }
    ngAfterContentInit() {
        this.templates.forEach((item) => {
            switch (item.getType()) {
                case 'message':
                    this.template = item.template;
                    break;
                default:
                    this.template = item.template;
                    break;
            }
        });
    }
    onMessageClose(event) {
        this.messages.splice(event.index, 1);
        this.onClose.emit({
            message: event.message
        });
        this.cd.detectChanges();
    }
    onAnimationStart(event) {
        if (event.fromState === 'void' && this.autoZIndex) {
            this.containerViewChild.nativeElement.style.zIndex = String(this.baseZIndex + (++DomHandler.zindex));
            this.containerViewChild.nativeElement.setAttribute(this.id, '');
        }
    }
    createStyle() {
        if (!this.styleElement) {
            this.styleElement = document.createElement('style');
            this.styleElement.type = 'text/css';
            document.head.appendChild(this.styleElement);
            let innerHTML = '';
            for (let breakpoint in this.breakpoints) {
                let breakpointStyle = '';
                for (let styleProp in this.breakpoints[breakpoint]) {
                    breakpointStyle += styleProp + ':' + this.breakpoints[breakpoint][styleProp] + ' !important;';
                }
                innerHTML += `
                    @media screen and (max-width: ${breakpoint}) {
                        .p-toast[${this.id}] {
                           ${breakpointStyle}
                        }
                    }
                `;
            }
            this.styleElement.innerHTML = innerHTML;
        }
    }
    destroyStyle() {
        if (this.styleElement) {
            document.head.removeChild(this.styleElement);
            this.styleElement = null;
        }
    }
    ngOnDestroy() {
        if (this.messageSubscription) {
            this.messageSubscription.unsubscribe();
        }
        if (this.clearSubscription) {
            this.clearSubscription.unsubscribe();
        }
        this.destroyStyle();
    }
}
Toast.decorators = [
    { type: Component, args: [{
                selector: 'p-toast',
                template: `
        <div #container [ngClass]="'p-toast p-component p-toast-' + position" [ngStyle]="style" [class]="styleClass">
            <p-toastItem *ngFor="let msg of messages; let i=index" [message]="msg" [index]="i" (onClose)="onMessageClose($event)"
                    [template]="template" @toastAnimation (@toastAnimation.start)="onAnimationStart($event)"
                    [showTransformOptions]="showTransformOptions" [hideTransformOptions]="hideTransformOptions"
                    [showTransitionOptions]="showTransitionOptions" [hideTransitionOptions]="hideTransitionOptions"></p-toastItem>
        </div>
    `,
                animations: [
                    trigger('toastAnimation', [
                        transition(':enter, :leave', [
                            query('@*', animateChild())
                        ])
                    ])
                ],
                changeDetection: ChangeDetectionStrategy.OnPush,
                encapsulation: ViewEncapsulation.None,
                styles: [".p-toast{position:fixed;width:25rem}.p-toast-message{overflow:hidden}.p-toast-message-content{align-items:flex-start;display:flex}.p-toast-message-text{flex:1 1 auto}.p-toast-top-right{right:20px;top:20px}.p-toast-top-left{left:20px;top:20px}.p-toast-bottom-left{bottom:20px;left:20px}.p-toast-bottom-right{bottom:20px;right:20px}.p-toast-top-center{left:50%;top:20px;transform:translateX(-50%)}.p-toast-bottom-center{bottom:20px;left:50%;transform:translateX(-50%)}.p-toast-center{left:50%;min-width:20vw;top:50%;transform:translate(-50%,-50%)}.p-toast-icon-close{align-items:center;display:flex;justify-content:center;overflow:hidden;position:relative}.p-toast-icon-close.p-link{cursor:pointer}"]
            },] }
];
Toast.ctorParameters = () => [
    { type: MessageService },
    { type: ChangeDetectorRef }
];
Toast.propDecorators = {
    key: [{ type: Input }],
    autoZIndex: [{ type: Input }],
    baseZIndex: [{ type: Input }],
    style: [{ type: Input }],
    styleClass: [{ type: Input }],
    position: [{ type: Input }],
    preventOpenDuplicates: [{ type: Input }],
    preventDuplicates: [{ type: Input }],
    showTransformOptions: [{ type: Input }],
    hideTransformOptions: [{ type: Input }],
    showTransitionOptions: [{ type: Input }],
    hideTransitionOptions: [{ type: Input }],
    breakpoints: [{ type: Input }],
    onClose: [{ type: Output }],
    containerViewChild: [{ type: ViewChild, args: ['container',] }],
    templates: [{ type: ContentChildren, args: [PrimeTemplate,] }]
};
export class ToastModule {
}
ToastModule.decorators = [
    { type: NgModule, args: [{
                imports: [CommonModule, RippleModule],
                exports: [Toast, SharedModule],
                declarations: [Toast, ToastItem]
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9hc3QuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4vc3JjL2FwcC9jb21wb25lbnRzL3RvYXN0LyIsInNvdXJjZXMiOlsidG9hc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFFBQVEsRUFBQyxTQUFTLEVBQUMsS0FBSyxFQUFDLE1BQU0sRUFBNEQsU0FBUyxFQUFDLFlBQVksRUFBQyxlQUFlLEVBQXVCLHVCQUF1QixFQUFFLE1BQU0sRUFBRSxpQkFBaUIsRUFBRSxpQkFBaUIsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUM1UCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFFN0MsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUN2QyxPQUFPLEVBQUMsYUFBYSxFQUFDLFlBQVksRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUN2RCxPQUFPLEVBQUMsY0FBYyxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQzNDLE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNoRCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFFNUMsT0FBTyxFQUFDLE9BQU8sRUFBQyxLQUFLLEVBQUMsS0FBSyxFQUFDLFVBQVUsRUFBQyxPQUFPLEVBQUMsS0FBSyxFQUFDLFlBQVksRUFBZ0IsTUFBTSxxQkFBcUIsQ0FBQztBQTZDN0csTUFBTSxPQUFPLFNBQVM7SUFzQmxCLFlBQW9CLElBQVk7UUFBWixTQUFJLEdBQUosSUFBSSxDQUFRO1FBTnRCLFlBQU8sR0FBc0IsSUFBSSxZQUFZLEVBQUUsQ0FBQztJQU12QixDQUFDO0lBRXBDLGVBQWU7UUFDWCxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDdkIsQ0FBQztJQUVELFdBQVc7UUFDUCxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUU7WUFDdEIsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxH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QkFDN0IsWUFBWSxFQUFFLENBQUMsS0FBSyxFQUFDLFNBQVMsQ0FBQzthQUNsQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TmdNb2R1bGUsQ29tcG9uZW50LElucHV0LE91dHB1dCxPbkluaXQsQWZ0ZXJWaWV3SW5pdCxBZnRlckNvbnRlbnRJbml0LE9uRGVzdHJveSxFbGVtZW50UmVmLFZpZXdDaGlsZCxFdmVudEVtaXR0ZXIsQ29udGVudENoaWxkcmVuLFF1ZXJ5TGlzdCxUZW1wbGF0ZVJlZixDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSwgTmdab25lLCBDaGFuZ2VEZXRlY3RvclJlZiwgVmlld0VuY2Fwc3VsYXRpb259IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQge0NvbW1vbk1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcclxuaW1wb3J0IHtNZXNzYWdlfSBmcm9tICdwcmltZW5nL2FwaSc7XHJcbmltcG9ydCB7RG9tSGFuZGxlcn0gZnJvbSAncHJpbWVuZy9kb20nO1xyXG5pbXBvcnQge1ByaW1lVGVtcGxhdGUsU2hhcmVkTW9kdWxlfSBmcm9tICdwcmltZW5nL2FwaSc7XHJcbmltcG9ydCB7TWVzc2FnZVNlcnZpY2V9IGZyb20gJ3ByaW1lbmcvYXBpJztcclxuaW1wb3J0IHtVbmlxdWVDb21wb25lbnRJZH0gZnJvbSAncHJpbWVuZy91dGlscyc7XHJcbmltcG9ydCB7UmlwcGxlTW9kdWxlfSBmcm9tICdwcmltZW5nL3JpcHBsZSc7XHJcbmltcG9ydCB7U3Vic2NyaXB0aW9ufSBmcm9tICdyeGpzJztcclxuaW1wb3J0IHt0cmlnZ2VyLHN0YXRlLHN0eWxlLHRyYW5zaXRpb24sYW5pbWF0ZSxxdWVyeSxhbmltYXRlQ2hpbGQsQW5pbWF0aW9uRXZlbnR9IGZyb20gJ0Bhbmd1bGFyL2FuaW1hdGlvbnMnO1xyXG5cclxuQENvbXBvbmVudCh7XHJcbiAgICBzZWxlY3RvcjogJ3AtdG9hc3RJdGVtJyxcclxuICAgIHRlbXBsYXRlOiBgXHJcbiAgICAgICAgPGRpdiAjY29udGFpbmVyIFthdHRyLmlkXT1cIm1lc3NhZ2UuaWRcIiBbY2xhc3NdPVwibWVzc2FnZS5zdHlsZUNsYXNzXCIgW25nQ2xhc3NdPVwiWydwLXRvYXN0LW1lc3NhZ2UtJyArIG1lc3NhZ2Uuc2V2ZXJpdHksICdwLXRvYXN0LW1lc3NhZ2UnXVwiIFtAbWVzc2FnZVN0YXRlXT1cInt2YWx1ZTogJ3Zpc2libGUnLCBwYXJhbXM6IHtzaG93VHJhbnNmb3JtUGFyYW1zOiBzaG93VHJhbnNmb3JtT3B0aW9ucywgaGlkZVRyYW5zZm9ybVBhcmFtczogaGlkZVRyYW5zZm9ybU9wdGlvbnMsIHNob3dUcmFuc2l0aW9uUGFyYW1zOiBzaG93VHJhbnNpdGlvbk9wdGlvbnMsIGhpZGVUcmFuc2l0aW9uUGFyYW1zOiBoaWRlVHJhbnNpdGlvbk9wdGlvbnN9fVwiXHJcbiAgICAgICAgICAgICAgICAobW91c2VlbnRlcik9XCJvbk1vdXNlRW50ZXIoKVwiIChtb3VzZWxlYXZlKT1cIm9uTW91c2VMZWF2ZSgpXCI+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwLXRvYXN0LW1lc3NhZ2UtY29udGVudFwiIHJvbGU9XCJhbGVydFwiIGFyaWEtbGl2ZT1cImFzc2VydGl2ZVwiIGFyaWEtYXRvbWljPVwidHJ1ZVwiICBbbmdDbGFzc109XCJtZXNzYWdlLmNvbnRlbnRTdHlsZUNsYXNzXCI+XHJcbiAgICAgICAgICAgICAgICA8bmctY29udGFpbmVyICpuZ0lmPVwiIXRlbXBsYXRlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gW2NsYXNzXT1cIidwLXRvYXN0LW1lc3NhZ2UtaWNvbiBwaScgKyAobWVzc2FnZS5pY29uID8gJyAnICsgbWVzc2FnZS5pY29uIDogJycpXCIgW25nQ2xhc3NdPVwieydwaS1pbmZvLWNpcmNsZSc6IG1lc3NhZ2Uuc2V2ZXJpdHkgPT0gJ2luZm8nLCAncGktZXhjbGFtYXRpb24tdHJpYW5nbGUnOiBtZXNzYWdlLnNldmVyaXR5ID09ICd3YXJuJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ3BpLXRpbWVzLWNpcmNsZSc6IG1lc3NhZ2Uuc2V2ZXJpdHkgPT0gJ2Vycm9yJywgJ3BpLWNoZWNrJyA6bWVzc2FnZS5zZXZlcml0eSA9PSAnc3VjY2Vzcyd9XCI+PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwLXRvYXN0LW1lc3NhZ2UtdGV4dFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicC10b2FzdC1zdW1tYXJ5XCI+e3ttZXNzYWdlLnN1bW1hcnl9fTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicC10b2FzdC1kZXRhaWxcIj57e21lc3NhZ2UuZGV0YWlsfX08L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvbmctY29udGFpbmVyPlxyXG4gICAgICAgICAgICAgICAgPG5nLWNvbnRhaW5lciAqbmdUZW1wbGF0ZU91dGxldD1cInRlbXBsYXRlOyBjb250ZXh0OiB7JGltcGxpY2l0OiBtZXNzYWdlfVwiPjwvbmctY29udGFpbmVyPlxyXG4gICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJwLXRvYXN0LWljb24tY2xvc2UgcC1saW5rXCIgKGNsaWNrKT1cIm9uQ2xvc2VJY29uQ2xpY2soJGV2ZW50KVwiIChrZXlkb3duLmVudGVyKT1cIm9uQ2xvc2VJY29uQ2xpY2soJGV2ZW50KVwiICpuZ0lmPVwibWVzc2FnZS5jbG9zYWJsZSAhPT0gZmFsc2VcIiBwUmlwcGxlPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwicC10b2FzdC1pY29uLWNsb3NlLWljb24gcGkgcGktdGltZXNcIj48L3NwYW4+XHJcbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICBgLFxyXG4gICAgYW5pbWF0aW9uczogW1xyXG4gICAgICAgIHRyaWdnZXIoJ21lc3NhZ2VTdGF0ZScsIFtcclxuICAgICAgICAgICAgc3RhdGUoJ3Zpc2libGUnLCBzdHlsZSh7XHJcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGVZKDApJyxcclxuICAgICAgICAgICAgICAgIG9wYWNpdHk6IDFcclxuICAgICAgICAgICAgfSkpLFxyXG4gICAgICAgICAgICB0cmFuc2l0aW9uKCd2b2lkID0+IConLCBbXHJcbiAgICAgICAgICAgICAgICBzdHlsZSh7dHJhbnNmb3JtOiAne3tzaG93VHJhbnNmb3JtUGFyYW1zfX0nLCBvcGFjaXR5OiAwfSksXHJcbiAgICAgICAgICAgICAgICBhbmltYXRlKCd7e3Nob3dUcmFuc2l0aW9uUGFyYW1zfX0nKVxyXG4gICAgICAgICAgICBdKSxcclxuICAgICAgICAgICAgdHJhbnNpdGlvbignKiA9PiB2b2lkJywgW1xyXG4gICAgICAgICAgICAgICAgYW5pbWF0ZSgoJ3t7aGlkZVRyYW5zaXRpb25QYXJhbXN9fScpLCBzdHlsZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiAwLFxyXG4gICAgICAgICAgICAgICAgICAgIG9wYWNpdHk6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtOiAne3toaWRlVHJhbnNmb3JtUGFyYW1zfX0nXHJcbiAgICAgICAgICAgICAgICB9KSlcclxuICAgICAgICAgICAgXSlcclxuICAgICAgICBdKVxyXG4gICAgXSxcclxuICAgIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXHJcbiAgICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaFxyXG59KVxyXG5leHBvcnQgY2xhc3MgVG9hc3RJdGVtIGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCwgT25EZXN0cm95IHtcclxuXHJcbiAgICBASW5wdXQoKSBtZXNzYWdlOiBNZXNzYWdlO1xyXG5cclxuICAgIEBJbnB1dCgpIGluZGV4OiBudW1iZXI7XHJcblxyXG4gICAgQElucHV0KCkgdGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT47XHJcblxyXG4gICAgQElucHV0KCkgc2hvd1RyYW5zZm9ybU9wdGlvbnM6IHN0cmluZztcclxuXHJcbiAgICBASW5wdXQoKSBoaWRlVHJhbnNmb3JtT3B0aW9uczogc3RyaW5nO1xyXG5cclxuICAgIEBJbnB1dCgpIHNob3dUcmFuc2l0aW9uT3B0aW9uczogc3RyaW5nO1xyXG5cclxuICAgIEBJbnB1dCgpIGhpZGVUcmFuc2l0aW9uT3B0aW9uczogc3RyaW5nO1xyXG5cclxuICAgIEBPdXRwdXQoKSBvbkNsb3NlOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcclxuXHJcbiAgICBAVmlld0NoaWxkKCdjb250YWluZXInKSBjb250YWluZXJWaWV3Q2hpbGQ6IEVsZW1lbnRSZWY7XHJcblxyXG4gICAgdGltZW91dDogYW55O1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgem9uZTogTmdab25lKSB7fVxyXG5cclxuICAgIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcclxuICAgICAgICB0aGlzLmluaXRUaW1lb3V0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgaW5pdFRpbWVvdXQoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLm1lc3NhZ2Uuc3RpY2t5KSB7XHJcbiAgICAgICAgICAgIHRoaXMuem9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uQ2xvc2UuZW1pdCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4OiB0aGlzLmluZGV4LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiB0aGlzLm1lc3NhZ2VcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0sIHRoaXMubWVzc2FnZS5saWZlIHx8IDMwMDApO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY2xlYXJUaW1lb3V0KCkge1xyXG4gICAgICAgIGlmICh0aGlzLnRpbWVvdXQpIHtcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dCk7XHJcbiAgICAgICAgICAgIHRoaXMudGltZW91dCA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG9uTW91c2VFbnRlcigpIHtcclxuICAgICAgICB0aGlzLmNsZWFyVGltZW91dCgpO1xyXG4gICAgfVxyXG5cclxuICAgIG9uTW91c2VMZWF2ZSgpIHtcclxuICAgICAgICB0aGlzLmluaXRUaW1lb3V0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgb25DbG9zZUljb25DbGljayhldmVudCkge1xyXG4gICAgICAgIHRoaXMuY2xlYXJUaW1lb3V0KCk7XHJcblxyXG4gICAgICAgIHRoaXMub25DbG9zZS5lbWl0KHtcclxuICAgICAgICAgICAgaW5kZXg6IHRoaXMuaW5kZXgsXHJcbiAgICAgICAgICAgIG1lc3NhZ2U6IHRoaXMubWVzc2FnZVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgfVxyXG5cclxuICAgIG5nT25EZXN0cm95KCkge1xyXG4gICAgICAgIHRoaXMuY2xlYXJUaW1lb3V0KCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbkBDb21wb25lbnQoe1xyXG4gICAgc2VsZWN0b3I6ICdwLXRvYXN0JyxcclxuICAgIHRlbXBsYXRlOiBgXHJcbiAgICAgICAgPGRpdiAjY29udGFpbmVyIFtuZ0NsYXNzXT1cIidwLXRvYXN0IHAtY29tcG9uZW50IHAtdG9hc3QtJyArIHBvc2l0aW9uXCIgW25nU3R5bGVdPVwic3R5bGVcIiBbY2xhc3NdPVwic3R5bGVDbGFzc1wiPlxyXG4gICAgICAgICAgICA8cC10b2FzdEl0ZW0gKm5nRm9yPVwibGV0IG1zZyBvZiBtZXNzYWdlczsgbGV0IGk9aW5kZXhcIiBbbWVzc2FnZV09XCJtc2dcIiBbaW5kZXhdPVwiaVwiIChvbkNsb3NlKT1cIm9uTWVzc2FnZUNsb3NlKCRldmVudClcIlxyXG4gICAgICAgICAgICAgICAgICAgIFt0ZW1wbGF0ZV09XCJ0ZW1wbGF0ZVwiIEB0b2FzdEFuaW1hdGlvbiAoQHRvYXN0QW5pbWF0aW9uLnN0YXJ0KT1cIm9uQW5pbWF0aW9uU3RhcnQoJGV2ZW50KVwiXHJcbiAgICAgICAgICAgICAgICAgICAgW3Nob3dUcmFuc2Zvcm1PcHRpb25zXT1cInNob3dUcmFuc2Zvcm1PcHRpb25zXCIgW2hpZGVUcmFuc2Zvcm1PcHRpb25zXT1cImhpZGVUcmFuc2Zvcm1PcHRpb25zXCJcclxuICAgICAgICAgICAgICAgICAgICBbc2hvd1RyYW5zaXRpb25PcHRpb25zXT1cInNob3dUcmFuc2l0aW9uT3B0aW9uc1wiIFtoaWRlVHJhbnNpdGlvbk9wdGlvbnNdPVwiaGlkZVRyYW5zaXRpb25PcHRpb25zXCI+PC9wLXRvYXN0SXRlbT5cclxuICAgICAgICA8L2Rpdj5cclxuICAgIGAsXHJcbiAgICBhbmltYXRpb25zOiBbXHJcbiAgICAgICAgdHJpZ2dlcigndG9hc3RBbmltYXRpb24nLCBbXHJcbiAgICAgICAgICAgIHRyYW5zaXRpb24oJzplbnRlciwgOmxlYXZlJywgW1xyXG4gICAgICAgICAgICAgICAgcXVlcnkoJ0AqJywgYW5pbWF0ZUNoaWxkKCkpXHJcbiAgICAgICAgICAgIF0pXHJcbiAgICAgICAgXSlcclxuICAgIF0sXHJcbiAgICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcclxuICAgIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXHJcbiAgICBzdHlsZVVybHM6IFsnLi90b2FzdC5jc3MnXVxyXG59KVxyXG5leHBvcnQgY2xhc3MgVG9hc3QgaW1wbGVtZW50cyBPbkluaXQsQWZ0ZXJDb250ZW50SW5pdCxPbkRlc3Ryb3kge1xyXG5cclxuICAgIEBJbnB1dCgpIGtleTogc3RyaW5nO1xyXG5cclxuICAgIEBJbnB1dCgpIGF1dG9aSW5kZXg6IGJvb2xlYW4gPSB0cnVlO1xyXG5cclxuICAgIEBJbnB1dCgpIGJhc2VaSW5kZXg6IG51bWJlciA9IDA7XHJcblxyXG4gICAgQElucHV0KCkgc3R5bGU6IGFueTtcclxuXHJcbiAgICBASW5wdXQoKSBzdHlsZUNsYXNzOiBzdHJpbmc7XHJcblxyXG4gICAgQElucHV0KCkgcG9zaXRpb246IHN0cmluZyA9ICd0b3AtcmlnaHQnO1xyXG5cclxuICAgIEBJbnB1dCgpIHByZXZlbnRPcGVuRHVwbGljYXRlczogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICAgIEBJbnB1dCgpIHByZXZlbnREdXBsaWNhdGVzOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gICAgQElucHV0KCkgc2hvd1RyYW5zZm9ybU9wdGlvbnM6IHN0cmluZyA9ICd0cmFuc2xhdGVZKDEwMCUpJztcclxuXHJcbiAgICBASW5wdXQoKSBoaWRlVHJhbnNmb3JtT3B0aW9uczogc3RyaW5nID0gJ3RyYW5zbGF0ZVkoLTEwMCUpJztcclxuXHJcbiAgICBASW5wdXQoKSBzaG93VHJhbnNpdGlvbk9wdGlvbnM6IHN0cmluZyA9ICczMDBtcyBlYXNlLW91dCc7XHJcblxyXG4gICAgQElucHV0KCkgaGlkZVRyYW5zaXRpb25PcHRpb25zOiBzdHJpbmcgPSAnMjUwbXMgZWFzZS1pbic7XHJcblxyXG4gICAgQElucHV0KCkgYnJlYWtwb2ludHM6IGFueTtcclxuXHJcbiAgICBAT3V0cHV0KCkgb25DbG9zZTogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XHJcblxyXG4gICAgQFZpZXdDaGlsZCgnY29udGFpbmVyJykgY29udGFpbmVyVmlld0NoaWxkOiBFbGVtZW50UmVmO1xyXG5cclxuICAgIEBDb250ZW50Q2hpbGRyZW4oUHJpbWVUZW1wbGF0ZSkgdGVtcGxhdGVzOiBRdWVyeUxpc3Q8YW55PjtcclxuXHJcbiAgICBtZXNzYWdlU3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb247XHJcblxyXG4gICAgY2xlYXJTdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbjtcclxuXHJcbiAgICBtZXNzYWdlczogTWVzc2FnZVtdO1xyXG5cclxuICAgIG1lc3NhZ2VzQXJjaGlldmU6IE1lc3NhZ2VbXTtcclxuXHJcbiAgICB0ZW1wbGF0ZTogVGVtcGxhdGVSZWY8YW55PjtcclxuXHJcbiAgICBzdHlsZUVsZW1lbnQ6IGFueTtcclxuXHJcbiAgICBpZDogc3RyaW5nID0gVW5pcXVlQ29tcG9uZW50SWQoKTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgbWVzc2FnZVNlcnZpY2U6IE1lc3NhZ2VTZXJ2aWNlLCBwcml2YXRlIGNkOiBDaGFuZ2VEZXRlY3RvclJlZikge31cclxuXHJcbiAgICBuZ09uSW5pdCgpIHtcclxuICAgICAgICB0aGlzLm1lc3NhZ2VTdWJzY3JpcHRpb24gPSB0aGlzLm1lc3NhZ2VTZXJ2aWNlLm1lc3NhZ2VPYnNlcnZlci5zdWJzY3JpYmUobWVzc2FnZXMgPT4ge1xyXG4gICAgICAgICAgICBpZiAobWVzc2FnZXMpIHtcclxuICAgICAgICAgICAgICAgIGlmIChtZXNzYWdlcyBpbnN0YW5jZW9mIEFycmF5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZmlsdGVyZWRNZXNzYWdlcyA9IG1lc3NhZ2VzLmZpbHRlcihtID0+IHRoaXMuY2FuQWRkKG0pKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZChmaWx0ZXJlZE1lc3NhZ2VzKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuY2FuQWRkKG1lc3NhZ2VzKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkKFttZXNzYWdlc10pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuY2xlYXJTdWJzY3JpcHRpb24gPSB0aGlzLm1lc3NhZ2VTZXJ2aWNlLmNsZWFyT2JzZXJ2ZXIuc3Vic2NyaWJlKGtleSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChrZXkpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmtleSA9PT0ga2V5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tZXNzYWdlcyA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm1lc3NhZ2VzID0gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5jZC5tYXJrRm9yQ2hlY2soKTtcclxuICAgICAgICB9KTtcclxuXHJcblxyXG4gICAgICAgIGlmICh0aGlzLmJyZWFrcG9pbnRzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlU3R5bGUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgYWRkKG1lc3NhZ2VzOiBNZXNzYWdlW10pOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm1lc3NhZ2VzID0gdGhpcy5tZXNzYWdlcyA/IFsuLi50aGlzLm1lc3NhZ2VzLCAuLi5tZXNzYWdlc10gOiBbLi4ubWVzc2FnZXNdO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5wcmV2ZW50RHVwbGljYXRlcykge1xyXG4gICAgICAgICAgICB0aGlzLm1lc3NhZ2VzQXJjaGlldmUgPSB0aGlzLm1lc3NhZ2VzQXJjaGlldmUgPyBbLi4udGhpcy5tZXNzYWdlc0FyY2hpZXZlLCAuLi5tZXNzYWdlc10gOiBbLi4ubWVzc2FnZXNdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jZC5tYXJrRm9yQ2hlY2soKTtcclxuICAgIH1cclxuXHJcbiAgICBjYW5BZGQobWVzc2FnZTogTWVzc2FnZSk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBhbGxvdyA9IHRoaXMua2V5ID09PSBtZXNzYWdlLmtleTtcclxuXHJcbiAgICAgICAgaWYgKGFsbG93ICYmIHRoaXMucHJldmVudE9wZW5EdXBsaWNhdGVzKSB7XHJcbiAgICAgICAgICAgIGFsbG93ID0gIXRoaXMuY29udGFpbnNNZXNzYWdlKHRoaXMubWVzc2FnZXMsIG1lc3NhZ2UpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGFsbG93ICYmIHRoaXMucHJldmVudER1cGxpY2F0ZXMpIHtcclxuICAgICAgICAgICAgYWxsb3cgPSAhdGhpcy5jb250YWluc01lc3NhZ2UodGhpcy5tZXNzYWdlc0FyY2hpZXZlLCBtZXNzYWdlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBhbGxvdztcclxuICAgIH1cclxuXHJcbiAgICBjb250YWluc01lc3NhZ2UoY29sbGVjdGlvbjogTWVzc2FnZVtdLCBtZXNzYWdlOiBNZXNzYWdlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCFjb2xsZWN0aW9uKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBjb2xsZWN0aW9uLmZpbmQobSA9PiB7XHJcbiAgICAgICAgICAgcmV0dXJuICgobS5zdW1tYXJ5ID09PSBtZXNzYWdlLnN1bW1hcnkpICYmIChtLmRldGFpbCA9PSBtZXNzYWdlLmRldGFpbCkgJiYgKG0uc2V2ZXJpdHkgPT09IG1lc3NhZ2Uuc2V2ZXJpdHkpKTtcclxuICAgICAgICB9KSAhPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcclxuICAgICAgICB0aGlzLnRlbXBsYXRlcy5mb3JFYWNoKChpdGVtKSA9PiB7XHJcbiAgICAgICAgICAgIHN3aXRjaChpdGVtLmdldFR5cGUoKSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnbWVzc2FnZSc6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50ZW1wbGF0ZSA9IGl0ZW0udGVtcGxhdGU7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGVtcGxhdGUgPSBpdGVtLnRlbXBsYXRlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBvbk1lc3NhZ2VDbG9zZShldmVudCkge1xyXG4gICAgICAgIHRoaXMubWVzc2FnZXMuc3BsaWNlKGV2ZW50LmluZGV4LCAxKTtcclxuXHJcbiAgICAgICAgdGhpcy5vbkNsb3NlLmVtaXQoe1xyXG4gICAgICAgICAgICBtZXNzYWdlOiBldmVudC5tZXNzYWdlXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuY2QuZGV0ZWN0Q2hhbmdlcygpO1xyXG4gICAgfVxyXG5cclxuICAgIG9uQW5pbWF0aW9uU3RhcnQoZXZlbnQ6IEFuaW1hdGlvbkV2ZW50KSB7XHJcbiAgICAgICAgaWYgKGV2ZW50LmZyb21TdGF0ZSA9PT0gJ3ZvaWQnICYmIHRoaXMuYXV0b1pJbmRleCkge1xyXG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lclZpZXdDaGlsZC5uYXRpdmVFbGVtZW50LnN0eWxlLnpJbmRleCA9IFN0cmluZyh0aGlzLmJhc2VaSW5kZXggKyAoKytEb21IYW5kbGVyLnppbmRleCkpO1xyXG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lclZpZXdDaGlsZC5uYXRpdmVFbGVtZW50LnNldEF0dHJpYnV0ZSh0aGlzLmlkLCAnJyk7XHJcblxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGVTdHlsZSgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuc3R5bGVFbGVtZW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3R5bGVFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcclxuICAgICAgICAgICAgdGhpcy5zdHlsZUVsZW1lbnQudHlwZSA9ICd0ZXh0L2Nzcyc7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQodGhpcy5zdHlsZUVsZW1lbnQpO1xyXG4gICAgICAgICAgICBsZXQgaW5uZXJIVE1MID0gJyc7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGJyZWFrcG9pbnQgaW4gdGhpcy5icmVha3BvaW50cykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGJyZWFrcG9pbnRTdHlsZSA9ICcnO1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgc3R5bGVQcm9wIGluIHRoaXMuYnJlYWtwb2ludHNbYnJlYWtwb2ludF0pIHtcclxuICAgICAgICAgICAgICAgICAgICBicmVha3BvaW50U3R5bGUgKz0gc3R5bGVQcm9wICsgJzonICsgdGhpcy5icmVha3BvaW50c1ticmVha3BvaW50XVtzdHlsZVByb3BdICsgJyAhaW1wb3J0YW50Oyc7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpbm5lckhUTUwgKz0gYFxyXG4gICAgICAgICAgICAgICAgICAgIEBtZWRpYSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6ICR7YnJlYWtwb2ludH0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLnAtdG9hc3RbJHt0aGlzLmlkfV0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAke2JyZWFrcG9pbnRTdHlsZX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGBcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5zdHlsZUVsZW1lbnQuaW5uZXJIVE1MID0gaW5uZXJIVE1MO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBkZXN0cm95U3R5bGUoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc3R5bGVFbGVtZW50KSB7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmhlYWQucmVtb3ZlQ2hpbGQodGhpcy5zdHlsZUVsZW1lbnQpO1xyXG4gICAgICAgICAgICB0aGlzLnN0eWxlRWxlbWVudCA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG5nT25EZXN0cm95KCkge1xyXG4gICAgICAgIGlmICh0aGlzLm1lc3NhZ2VTdWJzY3JpcHRpb24pIHtcclxuICAgICAgICAgICAgdGhpcy5tZXNzYWdlU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5jbGVhclN1YnNjcmlwdGlvbikge1xyXG4gICAgICAgICAgICB0aGlzLmNsZWFyU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmRlc3Ryb3lTdHlsZSgpO1xyXG4gICAgfVxyXG59XHJcblxyXG5ATmdNb2R1bGUoe1xyXG4gICAgaW1wb3J0czogW0NvbW1vbk1vZHVsZSxSaXBwbGVNb2R1bGVdLFxyXG4gICAgZXhwb3J0czogW1RvYXN0LFNoYXJlZE1vZHVsZV0sXHJcbiAgICBkZWNsYXJhdGlvbnM6IFtUb2FzdCxUb2FzdEl0ZW1dXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBUb2FzdE1vZHVsZSB7IH1cclxuIl19