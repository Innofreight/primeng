import { NgModule, Component, ElementRef, Input, EventEmitter, Renderer2, ContentChild, NgZone, ViewChild, ChangeDetectorRef, ChangeDetectionStrategy, ViewEncapsulation, ContentChildren, Output } from '@angular/core';
import { trigger, style, transition, animate, useAnimation, animation } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { DomHandler } from 'primeng/dom';
import { Footer, SharedModule, PrimeTemplate, PrimeNGConfig, TranslationKeys, ConfirmEventType } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService } from 'primeng/api';
import { UniqueComponentId } from 'primeng/utils';
import { RippleModule } from 'primeng/ripple';
const showAnimation = animation([
    style({ transform: '{{transform}}', opacity: 0 }),
    animate('{{transition}}', style({ transform: 'none', opacity: 1 }))
]);
const hideAnimation = animation([
    animate('{{transition}}', style({ transform: '{{transform}}', opacity: 0 }))
]);
export class ConfirmDialog {
    constructor(el, renderer, confirmationService, zone, cd, config) {
        this.el = el;
        this.renderer = renderer;
        this.confirmationService = confirmationService;
        this.zone = zone;
        this.cd = cd;
        this.config = config;
        this.acceptIcon = 'pi pi-check';
        this.acceptVisible = true;
        this.rejectIcon = 'pi pi-times';
        this.rejectVisible = true;
        this.closeOnEscape = true;
        this.blockScroll = true;
        this.closable = true;
        this.autoZIndex = true;
        this.baseZIndex = 0;
        this.transitionOptions = '150ms cubic-bezier(0, 0, 0.2, 1)';
        this.focusTrap = true;
        this.defaultFocus = 'accept';
        this.onHide = new EventEmitter();
        this._position = "center";
        this.transformOptions = "scale(0.7)";
        this.id = UniqueComponentId();
        this.subscription = this.confirmationService.requireConfirmation$.subscribe(confirmation => {
            if (!confirmation) {
                this.hide();
                return;
            }
            if (confirmation.key === this.key) {
                this.confirmation = confirmation;
                this.confirmationOptions = {
                    message: this.confirmation.message || this.message,
                    icon: this.confirmation.icon || this.icon,
                    header: this.confirmation.header || this.header,
                    rejectVisible: this.confirmation.rejectVisible == null ? this.rejectVisible : this.confirmation.rejectVisible,
                    acceptVisible: this.confirmation.acceptVisible == null ? this.acceptVisible : this.confirmation.acceptVisible,
                    acceptLabel: this.confirmation.acceptLabel || this.acceptLabel,
                    rejectLabel: this.confirmation.rejectLabel || this.rejectLabel,
                    acceptIcon: this.confirmation.acceptIcon || this.acceptIcon,
                    rejectIcon: this.confirmation.rejectIcon || this.rejectIcon,
                    acceptButtonStyleClass: this.confirmation.acceptButtonStyleClass || this.acceptButtonStyleClass,
                    rejectButtonStyleClass: this.confirmation.rejectButtonStyleClass || this.rejectButtonStyleClass,
                    defaultFocus: this.confirmation.defaultFocus || this.defaultFocus,
                    blockScroll: (this.confirmation.blockScroll === false || this.confirmation.blockScroll === true) ? this.confirmation.blockScroll : this.blockScroll,
                    closeOnEscape: (this.confirmation.closeOnEscape === false || this.confirmation.closeOnEscape === true) ? this.confirmation.closeOnEscape : this.closeOnEscape,
                    dismissableMask: (this.confirmation.dismissableMask === false || this.confirmation.dismissableMask === true) ? this.confirmation.dismissableMask : this.dismissableMask
                };
                if (this.confirmation.accept) {
                    this.confirmation.acceptEvent = new EventEmitter();
                    this.confirmation.acceptEvent.subscribe(this.confirmation.accept);
                }
                if (this.confirmation.reject) {
                    this.confirmation.rejectEvent = new EventEmitter();
                    this.confirmation.rejectEvent.subscribe(this.confirmation.reject);
                }
                this.visible = true;
            }
        });
    }
    get visible() {
        return this._visible;
    }
    set visible(value) {
        this._visible = value;
        if (this._visible && !this.maskVisible) {
            this.maskVisible = true;
        }
        this.cd.markForCheck();
    }
    get position() {
        return this._position;
    }
    ;
    set position(value) {
        this._position = value;
        switch (value) {
            case 'top-left':
            case 'bottom-left':
            case 'left':
                this.transformOptions = "translate3d(-100%, 0px, 0px)";
                break;
            case 'top-right':
            case 'bottom-right':
            case 'right':
                this.transformOptions = "translate3d(100%, 0px, 0px)";
                break;
            case 'bottom':
                this.transformOptions = "translate3d(0px, 100%, 0px)";
                break;
            case 'top':
                this.transformOptions = "translate3d(0px, -100%, 0px)";
                break;
            default:
                this.transformOptions = "scale(0.7)";
                break;
        }
    }
    ngAfterContentInit() {
        this.templates.forEach((item) => {
            switch (item.getType()) {
                case 'header':
                    this.headerTemplate = item.template;
                    break;
                case 'footer':
                    this.footerTemplate = item.template;
                    break;
            }
        });
    }
    ngOnInit() {
        if (this.breakpoints) {
            this.createStyle();
        }
        this.translationSubscription = this.config.translationObserver.subscribe(() => {
            if (this.visible) {
                this.cd.markForCheck();
            }
        });
    }
    option(name) {
        const source = this.confirmationOptions || this;
        if (source.hasOwnProperty(name)) {
            return source[name];
        }
        return undefined;
    }
    onAnimationStart(event) {
        switch (event.toState) {
            case 'visible':
                this.container = event.element;
                this.wrapper = this.container.parentElement;
                this.contentContainer = DomHandler.findSingle(this.container, '.p-dialog-content');
                this.container.setAttribute(this.id, '');
                const element = this.getElementToFocus();
                if (element) {
                    element.focus();
                }
                this.appendContainer();
                this.moveOnTop();
                this.bindGlobalListeners();
                this.enableModality();
                break;
        }
    }
    onAnimationEnd(event) {
        switch (event.toState) {
            case 'void':
                this.onOverlayHide();
                break;
        }
    }
    getElementToFocus() {
        switch (this.option('defaultFocus')) {
            case 'accept':
                return DomHandler.findSingle(this.container, '.p-confirm-dialog-accept');
            case 'reject':
                return DomHandler.findSingle(this.container, '.p-confirm-dialog-reject');
            case 'close':
                return DomHandler.findSingle(this.container, '.p-dialog-header-close');
            case 'none':
                return null;
            //backward compatibility
            default:
                return DomHandler.findSingle(this.container, '.p-confirm-dialog-accept');
        }
    }
    appendContainer() {
        if (this.appendTo) {
            if (this.appendTo === 'body')
                document.body.appendChild(this.wrapper);
            else
                DomHandler.appendChild(this.wrapper, this.appendTo);
        }
    }
    restoreAppend() {
        if (this.wrapper && this.appendTo) {
            this.el.nativeElement.appendChild(this.wrapper);
        }
    }
    enableModality() {
        if (this.option('blockScroll')) {
            DomHandler.addClass(document.body, 'p-overflow-hidden');
        }
        if (this.option('dismissableMask')) {
            this.maskClickListener = this.renderer.listen(this.wrapper, 'mousedown', (event) => {
                if (this.wrapper && this.wrapper.isSameNode(event.target)) {
                    this.close(event);
                }
            });
        }
    }
    disableModality() {
        this.maskVisible = false;
        if (this.option('blockScroll')) {
            DomHandler.removeClass(document.body, 'p-overflow-hidden');
        }
        if (this.dismissableMask) {
            this.unbindMaskClickListener();
        }
        if (this.container && !this.cd['destroyed']) {
            this.cd.detectChanges();
        }
    }
    createStyle() {
        if (!this.styleElement) {
            this.styleElement = document.createElement('style');
            this.styleElement.type = 'text/css';
            document.head.appendChild(this.styleElement);
            let innerHTML = '';
            for (let breakpoint in this.breakpoints) {
                innerHTML += `
                    @media screen and (max-width: ${breakpoint}) {
                        .p-dialog[${this.id}] {
                            width: ${this.breakpoints[breakpoint]} !important;
                        }
                    }
                `;
            }
            this.styleElement.innerHTML = innerHTML;
        }
    }
    close(event) {
        if (this.confirmation.rejectEvent) {
            this.confirmation.rejectEvent.emit(ConfirmEventType.CANCEL);
        }
        this.hide(ConfirmEventType.CANCEL);
        event.preventDefault();
    }
    hide(type) {
        this.onHide.emit(type);
        this.visible = false;
        this.confirmation = null;
        this.confirmationOptions = null;
    }
    moveOnTop() {
        if (this.autoZIndex) {
            this.container.style.zIndex = String(this.baseZIndex + (++DomHandler.zindex));
            this.wrapper.style.zIndex = String(this.baseZIndex + (DomHandler.zindex - 1));
        }
    }
    getMaskClass() {
        let maskClass = { 'p-dialog-mask p-component-overlay': true, 'p-dialog-mask-scrollblocker': this.blockScroll };
        maskClass[this.getPositionClass().toString()] = true;
        return maskClass;
    }
    getPositionClass() {
        const positions = ['left', 'right', 'top', 'top-left', 'top-right', 'bottom', 'bottom-left', 'bottom-right'];
        const pos = positions.find(item => item === this.position);
        return pos ? `p-dialog-${pos}` : '';
    }
    bindGlobalListeners() {
        if ((this.option('closeOnEscape') && this.closable) || this.focusTrap && !this.documentEscapeListener) {
            const documentTarget = this.el ? this.el.nativeElement.ownerDocument : 'document';
            this.documentEscapeListener = this.renderer.listen(documentTarget, 'keydown', (event) => {
                if (event.which == 27 && (this.option('closeOnEscape') && this.closable)) {
                    if (parseInt(this.container.style.zIndex) === (DomHandler.zindex + this.baseZIndex) && this.visible) {
                        this.close(event);
                    }
                }
                if (event.which === 9 && this.focusTrap) {
                    event.preventDefault();
                    let focusableElements = DomHandler.getFocusableElements(this.container);
                    if (focusableElements && focusableElements.length > 0) {
                        if (!focusableElements[0].ownerDocument.activeElement) {
                            focusableElements[0].focus();
                        }
                        else {
                            let focusedIndex = focusableElements.indexOf(focusableElements[0].ownerDocument.activeElement);
                            if (event.shiftKey) {
                                if (focusedIndex == -1 || focusedIndex === 0)
                                    focusableElements[focusableElements.length - 1].focus();
                                else
                                    focusableElements[focusedIndex - 1].focus();
                            }
                            else {
                                if (focusedIndex == -1 || focusedIndex === (focusableElements.length - 1))
                                    focusableElements[0].focus();
                                else
                                    focusableElements[focusedIndex + 1].focus();
                            }
                        }
                    }
                }
            });
        }
    }
    unbindGlobalListeners() {
        if (this.documentEscapeListener) {
            this.documentEscapeListener();
            this.documentEscapeListener = null;
        }
    }
    unbindMaskClickListener() {
        if (this.maskClickListener) {
            this.maskClickListener();
            this.maskClickListener = null;
        }
    }
    onOverlayHide() {
        this.disableModality();
        this.unbindGlobalListeners();
        this.container = null;
    }
    destroyStyle() {
        if (this.styleElement) {
            document.head.removeChild(this.styleElement);
            this.styleElement = null;
        }
    }
    ngOnDestroy() {
        this.restoreAppend();
        this.onOverlayHide();
        this.subscription.unsubscribe();
        if (this.translationSubscription) {
            this.translationSubscription.unsubscribe();
        }
        this.destroyStyle();
    }
    accept() {
        if (this.confirmation && this.confirmation.acceptEvent) {
            this.confirmation.acceptEvent.emit();
        }
        this.hide(ConfirmEventType.ACCEPT);
    }
    reject() {
        if (this.confirmation && this.confirmation.rejectEvent) {
            this.confirmation.rejectEvent.emit(ConfirmEventType.REJECT);
        }
        this.hide(ConfirmEventType.REJECT);
    }
    get acceptButtonLabel() {
        return this.option('acceptLabel') || this.config.getTranslation(TranslationKeys.ACCEPT);
    }
    get rejectButtonLabel() {
        return this.option('rejectLabel') || this.config.getTranslation(TranslationKeys.REJECT);
    }
}
ConfirmDialog.decorators = [
    { type: Component, args: [{
                selector: 'p-confirmDialog',
                template: `
        <div [class]="maskStyleClass" [ngClass]="getMaskClass()" *ngIf="maskVisible">
            <div [ngClass]="{'p-dialog p-confirm-dialog p-component':true,'p-dialog-rtl':rtl}" [ngStyle]="style" [class]="styleClass" (mousedown)="moveOnTop()"
                [@animation]="{value: 'visible', params: {transform: transformOptions, transition: transitionOptions}}" (@animation.start)="onAnimationStart($event)" (@animation.done)="onAnimationEnd($event)" *ngIf="visible">
                <div class="p-dialog-header" *ngIf="headerTemplate">
                    <ng-container *ngTemplateOutlet="headerTemplate"></ng-container>
                </div>
                <div class="p-dialog-header" *ngIf="!headerTemplate">
                    <span class="p-dialog-title" *ngIf="option('header')">{{option('header')}}</span>
                    <div class="p-dialog-header-icons">
                        <button *ngIf="closable" type="button" [ngClass]="{'p-dialog-header-icon p-dialog-header-close p-link':true}" (click)="close($event)" (keydown.enter)="close($event)">
                            <span class="pi pi-times"></span>
                        </button>
                    </div>
                </div>
                <div #content class="p-dialog-content">
                    <i [ngClass]="'p-confirm-dialog-icon'" [class]="option('icon')" *ngIf="option('icon')"></i>
                    <span class="p-confirm-dialog-message" [innerHTML]="option('message')"></span>
                </div>
                <div class="p-dialog-footer" *ngIf="footer || footerTemplate">
                    <ng-content select="p-footer"></ng-content>
                    <ng-container *ngTemplateOutlet="footerTemplate"></ng-container>
                </div>
                <div class="p-dialog-footer" *ngIf="!footer && !footerTemplate">
                    <button type="button" pRipple pButton [icon]="option('rejectIcon')" [label]="rejectButtonLabel" (click)="reject()" [ngClass]="'p-confirm-dialog-reject'" [class]="option('rejectButtonStyleClass')" *ngIf="option('rejectVisible')" [attr.aria-label]="rejectAriaLabel"></button>
                    <button type="button" pRipple pButton [icon]="option('acceptIcon')" [label]="acceptButtonLabel" (click)="accept()" [ngClass]="'p-confirm-dialog-accept'" [class]="option('acceptButtonStyleClass')" *ngIf="option('acceptVisible')" [attr.aria-label]="acceptAriaLabel"></button>
                </div>
            </div>
        </div>
    `,
                animations: [
                    trigger('animation', [
                        transition('void => visible', [
                            useAnimation(showAnimation)
                        ]),
                        transition('visible => void', [
                            useAnimation(hideAnimation)
                        ])
                    ])
                ],
                changeDetection: ChangeDetectionStrategy.OnPush,
                encapsulation: ViewEncapsulation.None,
                styles: [".p-dialog-mask{align-items:center;background-color:transparent;display:flex;height:100%;justify-content:center;left:0;pointer-events:none;position:fixed;top:0;transition-property:background-color;width:100%}.p-dialog,.p-dialog-mask.p-component-overlay{pointer-events:auto}.p-dialog{display:flex;flex-direction:column;max-height:90%;position:relative;transform:scale(1)}.p-dialog-content{overflow-y:auto}.p-dialog-header{align-items:center;display:flex;flex-shrink:0;justify-content:space-between}.p-dialog-footer{flex-shrink:0}.p-dialog .p-dialog-header-icons{align-items:center;display:flex}.p-dialog .p-dialog-header-icon{align-items:center;display:flex;justify-content:center;overflow:hidden;position:relative}.p-dialog-mask.p-dialog-mask-leave{background-color:transparent}.p-fluid .p-dialog-footer .p-button{width:auto}.p-dialog-bottom-left .p-dialog,.p-dialog-bottom-right .p-dialog,.p-dialog-bottom .p-dialog,.p-dialog-left .p-dialog,.p-dialog-right .p-dialog,.p-dialog-top-left .p-dialog,.p-dialog-top-right .p-dialog,.p-dialog-top .p-dialog{margin:.75rem;transform:translateZ(0)}.p-dialog-maximized{height:100%;left:0!important;max-height:100%;top:0!important;transform:none;transition:none;width:100vw!important}.p-dialog-maximized .p-dialog-content{flex-grow:1}.p-dialog-left{justify-content:flex-start}.p-dialog-right{justify-content:flex-end}.p-dialog-top,.p-dialog-top-left{align-items:flex-start}.p-dialog-top-left{justify-content:flex-start}.p-dialog-top-right{align-items:flex-start;justify-content:flex-end}.p-dialog-bottom{align-items:flex-end}.p-dialog-bottom-left{align-items:flex-end;justify-content:flex-start}.p-dialog-bottom-right{align-items:flex-end;justify-content:flex-end}.p-dialog .p-resizable-handle{bottom:1px;cursor:se-resize;display:block;font-size:.1px;height:12px;position:absolute;right:1px;width:12px}.p-confirm-dialog .p-dialog-content{align-items:center;display:flex}"]
            },] }
];
ConfirmDialog.ctorParameters = () => [
    { type: ElementRef },
    { type: Renderer2 },
    { type: ConfirmationService },
    { type: NgZone },
    { type: ChangeDetectorRef },
    { type: PrimeNGConfig }
];
ConfirmDialog.propDecorators = {
    header: [{ type: Input }],
    icon: [{ type: Input }],
    message: [{ type: Input }],
    style: [{ type: Input }],
    styleClass: [{ type: Input }],
    maskStyleClass: [{ type: Input }],
    acceptIcon: [{ type: Input }],
    acceptLabel: [{ type: Input }],
    acceptAriaLabel: [{ type: Input }],
    acceptVisible: [{ type: Input }],
    rejectIcon: [{ type: Input }],
    rejectLabel: [{ type: Input }],
    rejectAriaLabel: [{ type: Input }],
    rejectVisible: [{ type: Input }],
    acceptButtonStyleClass: [{ type: Input }],
    rejectButtonStyleClass: [{ type: Input }],
    closeOnEscape: [{ type: Input }],
    dismissableMask: [{ type: Input }],
    blockScroll: [{ type: Input }],
    rtl: [{ type: Input }],
    closable: [{ type: Input }],
    appendTo: [{ type: Input }],
    key: [{ type: Input }],
    autoZIndex: [{ type: Input }],
    baseZIndex: [{ type: Input }],
    transitionOptions: [{ type: Input }],
    focusTrap: [{ type: Input }],
    defaultFocus: [{ type: Input }],
    breakpoints: [{ type: Input }],
    visible: [{ type: Input }],
    position: [{ type: Input }],
    onHide: [{ type: Output }],
    footer: [{ type: ContentChild, args: [Footer,] }],
    contentViewChild: [{ type: ViewChild, args: ['content',] }],
    templates: [{ type: ContentChildren, args: [PrimeTemplate,] }]
};
export class ConfirmDialogModule {
}
ConfirmDialogModule.decorators = [
    { type: NgModule, args: [{
                imports: [CommonModule, ButtonModule, RippleModule],
                exports: [ConfirmDialog, ButtonModule, SharedModule],
                declarations: [ConfirmDialog]
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlybWRpYWxvZy5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8uLi9zcmMvYXBwL2NvbXBvbmVudHMvY29uZmlybWRpYWxvZy8iLCJzb3VyY2VzIjpbImNvbmZpcm1kaWFsb2cudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFFBQVEsRUFBQyxTQUFTLEVBQUMsVUFBVSxFQUFXLEtBQUssRUFBQyxZQUFZLEVBQUMsU0FBUyxFQUFDLFlBQVksRUFBQyxNQUFNLEVBQUMsU0FBUyxFQUFDLGlCQUFpQixFQUFDLHVCQUF1QixFQUFFLGlCQUFpQixFQUFFLGVBQWUsRUFBNEMsTUFBTSxFQUFTLE1BQU0sZUFBZSxDQUFDO0FBQ3pRLE9BQU8sRUFBQyxPQUFPLEVBQUMsS0FBSyxFQUFDLFVBQVUsRUFBQyxPQUFPLEVBQWlCLFlBQVksRUFBRSxTQUFTLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUM3RyxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDN0MsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUN2QyxPQUFPLEVBQUMsTUFBTSxFQUFDLFlBQVksRUFBRSxhQUFhLEVBQUUsYUFBYSxFQUFFLGVBQWUsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUNqSCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFFNUMsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sYUFBYSxDQUFDO0FBRWhELE9BQU8sRUFBQyxpQkFBaUIsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNoRCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFOUMsTUFBTSxhQUFhLEdBQUcsU0FBUyxDQUFDO0lBQzVCLEtBQUssQ0FBQyxFQUFFLFNBQVMsRUFBRSxlQUFlLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDO0lBQ2pELE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxLQUFL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LEVBQUUsQ0FBQyxhQUFhLEVBQUMsWUFBWSxFQUFDLFlBQVksQ0FBQztnQkFDbEQsWUFBWSxFQUFFLENBQUMsYUFBYSxDQUFDO2FBQ2hDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtOZ01vZHVsZSxDb21wb25lbnQsRWxlbWVudFJlZixPbkRlc3Ryb3ksSW5wdXQsRXZlbnRFbWl0dGVyLFJlbmRlcmVyMixDb250ZW50Q2hpbGQsTmdab25lLFZpZXdDaGlsZCxDaGFuZ2VEZXRlY3RvclJlZixDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSwgVmlld0VuY2Fwc3VsYXRpb24sIENvbnRlbnRDaGlsZHJlbiwgUXVlcnlMaXN0LCBUZW1wbGF0ZVJlZiwgQWZ0ZXJDb250ZW50SW5pdCwgT3V0cHV0LCBPbkluaXR9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQge3RyaWdnZXIsc3R5bGUsdHJhbnNpdGlvbixhbmltYXRlLEFuaW1hdGlvbkV2ZW50LCB1c2VBbmltYXRpb24sIGFuaW1hdGlvbn0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XHJcbmltcG9ydCB7Q29tbW9uTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xyXG5pbXBvcnQge0RvbUhhbmRsZXJ9IGZyb20gJ3ByaW1lbmcvZG9tJztcclxuaW1wb3J0IHtGb290ZXIsU2hhcmVkTW9kdWxlLCBQcmltZVRlbXBsYXRlLCBQcmltZU5HQ29uZmlnLCBUcmFuc2xhdGlvbktleXMsIENvbmZpcm1FdmVudFR5cGV9IGZyb20gJ3ByaW1lbmcvYXBpJztcclxuaW1wb3J0IHtCdXR0b25Nb2R1bGV9IGZyb20gJ3ByaW1lbmcvYnV0dG9uJztcclxuaW1wb3J0IHtDb25maXJtYXRpb259IGZyb20gJ3ByaW1lbmcvYXBpJztcclxuaW1wb3J0IHtDb25maXJtYXRpb25TZXJ2aWNlfSBmcm9tICdwcmltZW5nL2FwaSc7XHJcbmltcG9ydCB7U3Vic2NyaXB0aW9ufSBmcm9tICdyeGpzJztcclxuaW1wb3J0IHtVbmlxdWVDb21wb25lbnRJZH0gZnJvbSAncHJpbWVuZy91dGlscyc7XHJcbmltcG9ydCB7IFJpcHBsZU1vZHVsZSB9IGZyb20gJ3ByaW1lbmcvcmlwcGxlJztcclxuXHJcbmNvbnN0IHNob3dBbmltYXRpb24gPSBhbmltYXRpb24oW1xyXG4gICAgc3R5bGUoeyB0cmFuc2Zvcm06ICd7e3RyYW5zZm9ybX19Jywgb3BhY2l0eTogMCB9KSxcclxuICAgIGFuaW1hdGUoJ3t7dHJhbnNpdGlvbn19Jywgc3R5bGUoeyB0cmFuc2Zvcm06ICdub25lJywgb3BhY2l0eTogMSB9KSlcclxuXSk7XHJcblxyXG5jb25zdCBoaWRlQW5pbWF0aW9uID0gYW5pbWF0aW9uKFtcclxuICAgIGFuaW1hdGUoJ3t7dHJhbnNpdGlvbn19Jywgc3R5bGUoeyB0cmFuc2Zvcm06ICd7e3RyYW5zZm9ybX19Jywgb3BhY2l0eTogMCB9KSlcclxuXSk7XHJcblxyXG5AQ29tcG9uZW50KHtcclxuICAgIHNlbGVjdG9yOiAncC1jb25maXJtRGlhbG9nJyxcclxuICAgIHRlbXBsYXRlOiBgXHJcbiAgICAgICAgPGRpdiBbY2xhc3NdPVwibWFza1N0eWxlQ2xhc3NcIiBbbmdDbGFzc109XCJnZXRNYXNrQ2xhc3MoKVwiICpuZ0lmPVwibWFza1Zpc2libGVcIj5cclxuICAgICAgICAgICAgPGRpdiBbbmdDbGFzc109XCJ7J3AtZGlhbG9nIHAtY29uZmlybS1kaWFsb2cgcC1jb21wb25lbnQnOnRydWUsJ3AtZGlhbG9nLXJ0bCc6cnRsfVwiIFtuZ1N0eWxlXT1cInN0eWxlXCIgW2NsYXNzXT1cInN0eWxlQ2xhc3NcIiAobW91c2Vkb3duKT1cIm1vdmVPblRvcCgpXCJcclxuICAgICAgICAgICAgICAgIFtAYW5pbWF0aW9uXT1cInt2YWx1ZTogJ3Zpc2libGUnLCBwYXJhbXM6IHt0cmFuc2Zvcm06IHRyYW5zZm9ybU9wdGlvbnMsIHRyYW5zaXRpb246IHRyYW5zaXRpb25PcHRpb25zfX1cIiAoQGFuaW1hdGlvbi5zdGFydCk9XCJvbkFuaW1hdGlvblN0YXJ0KCRldmVudClcIiAoQGFuaW1hdGlvbi5kb25lKT1cIm9uQW5pbWF0aW9uRW5kKCRldmVudClcIiAqbmdJZj1cInZpc2libGVcIj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwLWRpYWxvZy1oZWFkZXJcIiAqbmdJZj1cImhlYWRlclRlbXBsYXRlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPG5nLWNvbnRhaW5lciAqbmdUZW1wbGF0ZU91dGxldD1cImhlYWRlclRlbXBsYXRlXCI+PC9uZy1jb250YWluZXI+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwLWRpYWxvZy1oZWFkZXJcIiAqbmdJZj1cIiFoZWFkZXJUZW1wbGF0ZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwicC1kaWFsb2ctdGl0bGVcIiAqbmdJZj1cIm9wdGlvbignaGVhZGVyJylcIj57e29wdGlvbignaGVhZGVyJyl9fTwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicC1kaWFsb2ctaGVhZGVyLWljb25zXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gKm5nSWY9XCJjbG9zYWJsZVwiIHR5cGU9XCJidXR0b25cIiBbbmdDbGFzc109XCJ7J3AtZGlhbG9nLWhlYWRlci1pY29uIHAtZGlhbG9nLWhlYWRlci1jbG9zZSBwLWxpbmsnOnRydWV9XCIgKGNsaWNrKT1cImNsb3NlKCRldmVudClcIiAoa2V5ZG93bi5lbnRlcik9XCJjbG9zZSgkZXZlbnQpXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInBpIHBpLXRpbWVzXCI+PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiAjY29udGVudCBjbGFzcz1cInAtZGlhbG9nLWNvbnRlbnRcIj5cclxuICAgICAgICAgICAgICAgICAgICA8aSBbbmdDbGFzc109XCIncC1jb25maXJtLWRpYWxvZy1pY29uJ1wiIFtjbGFzc109XCJvcHRpb24oJ2ljb24nKVwiICpuZ0lmPVwib3B0aW9uKCdpY29uJylcIj48L2k+XHJcbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJwLWNvbmZpcm0tZGlhbG9nLW1lc3NhZ2VcIiBbaW5uZXJIVE1MXT1cIm9wdGlvbignbWVzc2FnZScpXCI+PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicC1kaWFsb2ctZm9vdGVyXCIgKm5nSWY9XCJmb290ZXIgfHwgZm9vdGVyVGVtcGxhdGVcIj5cclxuICAgICAgICAgICAgICAgICAgICA8bmctY29udGVudCBzZWxlY3Q9XCJwLWZvb3RlclwiPjwvbmctY29udGVudD5cclxuICAgICAgICAgICAgICAgICAgICA8bmctY29udGFpbmVyICpuZ1RlbXBsYXRlT3V0bGV0PVwiZm9vdGVyVGVtcGxhdGVcIj48L25nLWNvbnRhaW5lcj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInAtZGlhbG9nLWZvb3RlclwiICpuZ0lmPVwiIWZvb3RlciAmJiAhZm9vdGVyVGVtcGxhdGVcIj5cclxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBwUmlwcGxlIHBCdXR0b24gW2ljb25dPVwib3B0aW9uKCdyZWplY3RJY29uJylcIiBbbGFiZWxdPVwicmVqZWN0QnV0dG9uTGFiZWxcIiAoY2xpY2spPVwicmVqZWN0KClcIiBbbmdDbGFzc109XCIncC1jb25maXJtLWRpYWxvZy1yZWplY3QnXCIgW2NsYXNzXT1cIm9wdGlvbigncmVqZWN0QnV0dG9uU3R5bGVDbGFzcycpXCIgKm5nSWY9XCJvcHRpb24oJ3JlamVjdFZpc2libGUnKVwiIFthdHRyLmFyaWEtbGFiZWxdPVwicmVqZWN0QXJpYUxhYmVsXCI+PC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgcFJpcHBsZSBwQnV0dG9uIFtpY29uXT1cIm9wdGlvbignYWNjZXB0SWNvbicpXCIgW2xhYmVsXT1cImFjY2VwdEJ1dHRvbkxhYmVsXCIgKGNsaWNrKT1cImFjY2VwdCgpXCIgW25nQ2xhc3NdPVwiJ3AtY29uZmlybS1kaWFsb2ctYWNjZXB0J1wiIFtjbGFzc109XCJvcHRpb24oJ2FjY2VwdEJ1dHRvblN0eWxlQ2xhc3MnKVwiICpuZ0lmPVwib3B0aW9uKCdhY2NlcHRWaXNpYmxlJylcIiBbYXR0ci5hcmlhLWxhYmVsXT1cImFjY2VwdEFyaWFMYWJlbFwiPjwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgYCxcclxuICAgIGFuaW1hdGlvbnM6IFtcclxuICAgICAgICB0cmlnZ2VyKCdhbmltYXRpb24nLCBbXHJcbiAgICAgICAgICAgIHRyYW5zaXRpb24oJ3ZvaWQgPT4gdmlzaWJsZScsIFtcclxuICAgICAgICAgICAgICAgIHVzZUFuaW1hdGlvbihzaG93QW5pbWF0aW9uKVxyXG4gICAgICAgICAgICBdKSxcclxuICAgICAgICAgICAgdHJhbnNpdGlvbigndmlzaWJsZSA9PiB2b2lkJywgW1xyXG4gICAgICAgICAgICAgICAgdXNlQW5pbWF0aW9uKGhpZGVBbmltYXRpb24pXHJcbiAgICAgICAgICAgIF0pXHJcbiAgICAgICAgXSlcclxuICAgIF0sXHJcbiAgICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcclxuICAgIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXHJcbiAgICBzdHlsZVVybHM6IFsnLi4vZGlhbG9nL2RpYWxvZy5jc3MnXVxyXG59KVxyXG5leHBvcnQgY2xhc3MgQ29uZmlybURpYWxvZyBpbXBsZW1lbnRzIEFmdGVyQ29udGVudEluaXQsT25Jbml0LE9uRGVzdHJveSB7XHJcblxyXG4gICAgQElucHV0KCkgaGVhZGVyOiBzdHJpbmc7XHJcblxyXG4gICAgQElucHV0KCkgaWNvbjogc3RyaW5nO1xyXG5cclxuICAgIEBJbnB1dCgpIG1lc3NhZ2U6IHN0cmluZztcclxuXHJcbiAgICBASW5wdXQoKSBzdHlsZTogYW55O1xyXG5cclxuICAgIEBJbnB1dCgpIHN0eWxlQ2xhc3M6IHN0cmluZztcclxuXHJcbiAgICBASW5wdXQoKSBtYXNrU3R5bGVDbGFzczogc3RyaW5nO1xyXG5cclxuICAgIEBJbnB1dCgpIGFjY2VwdEljb246IHN0cmluZyA9ICdwaSBwaS1jaGVjayc7XHJcblxyXG4gICAgQElucHV0KCkgYWNjZXB0TGFiZWw6IHN0cmluZztcclxuXHJcbiAgICBASW5wdXQoKSBhY2NlcHRBcmlhTGFiZWw6IHN0cmluZztcclxuXHJcbiAgICBASW5wdXQoKSBhY2NlcHRWaXNpYmxlOiBib29sZWFuID0gdHJ1ZTtcclxuXHJcbiAgICBASW5wdXQoKSByZWplY3RJY29uOiBzdHJpbmcgPSAncGkgcGktdGltZXMnO1xyXG5cclxuICAgIEBJbnB1dCgpIHJlamVjdExhYmVsOiBzdHJpbmc7XHJcblxyXG4gICAgQElucHV0KCkgcmVqZWN0QXJpYUxhYmVsOiBzdHJpbmc7XHJcblxyXG4gICAgQElucHV0KCkgcmVqZWN0VmlzaWJsZTogYm9vbGVhbiA9IHRydWU7XHJcblxyXG4gICAgQElucHV0KCkgYWNjZXB0QnV0dG9uU3R5bGVDbGFzczogc3RyaW5nO1xyXG5cclxuICAgIEBJbnB1dCgpIHJlamVjdEJ1dHRvblN0eWxlQ2xhc3M6IHN0cmluZztcclxuXHJcbiAgICBASW5wdXQoKSBjbG9zZU9uRXNjYXBlOiBib29sZWFuID0gdHJ1ZTtcclxuXHJcbiAgICBASW5wdXQoKSBkaXNtaXNzYWJsZU1hc2s6IGJvb2xlYW47XHJcblxyXG4gICAgQElucHV0KCkgYmxvY2tTY3JvbGw6IGJvb2xlYW4gPSB0cnVlO1xyXG5cclxuICAgIEBJbnB1dCgpIHJ0bDogYm9vbGVhbjtcclxuXHJcbiAgICBASW5wdXQoKSBjbG9zYWJsZTogYm9vbGVhbiA9IHRydWU7XHJcblxyXG4gICAgQElucHV0KCkgYXBwZW5kVG86IGFueTtcclxuXHJcbiAgICBASW5wdXQoKSBrZXk6IHN0cmluZztcclxuXHJcbiAgICBASW5wdXQoKSBhdXRvWkluZGV4OiBib29sZWFuID0gdHJ1ZTtcclxuXHJcbiAgICBASW5wdXQoKSBiYXNlWkluZGV4OiBudW1iZXIgPSAwO1xyXG5cclxuICAgIEBJbnB1dCgpIHRyYW5zaXRpb25PcHRpb25zOiBzdHJpbmcgPSAnMTUwbXMgY3ViaWMtYmV6aWVyKDAsIDAsIDAuMiwgMSknO1xyXG5cclxuICAgIEBJbnB1dCgpIGZvY3VzVHJhcDogYm9vbGVhbiA9IHRydWU7XHJcblxyXG4gICAgQElucHV0KCkgZGVmYXVsdEZvY3VzOiBzdHJpbmcgPSAnYWNjZXB0JztcclxuXHJcbiAgICBASW5wdXQoKSBicmVha3BvaW50czogYW55O1xyXG5cclxuICAgIEBJbnB1dCgpIGdldCB2aXNpYmxlKCk6IGFueSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Zpc2libGU7XHJcbiAgICB9XHJcbiAgICBzZXQgdmlzaWJsZSh2YWx1ZTphbnkpIHtcclxuICAgICAgICB0aGlzLl92aXNpYmxlID0gdmFsdWU7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLl92aXNpYmxlICYmICF0aGlzLm1hc2tWaXNpYmxlKSB7XHJcbiAgICAgICAgICAgIHRoaXMubWFza1Zpc2libGUgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jZC5tYXJrRm9yQ2hlY2soKTtcclxuICAgIH1cclxuXHJcbiAgICBASW5wdXQoKSBnZXQgcG9zaXRpb24oKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcG9zaXRpb247XHJcbiAgICB9O1xyXG5cclxuICAgIHNldCBwb3NpdGlvbih2YWx1ZTogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5fcG9zaXRpb24gPSB2YWx1ZTtcclxuXHJcbiAgICAgICAgc3dpdGNoICh2YWx1ZSkge1xyXG4gICAgICAgICAgICBjYXNlICd0b3AtbGVmdCc6XHJcbiAgICAgICAgICAgIGNhc2UgJ2JvdHRvbS1sZWZ0JzpcclxuICAgICAgICAgICAgY2FzZSAnbGVmdCc6XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRyYW5zZm9ybU9wdGlvbnMgPSBcInRyYW5zbGF0ZTNkKC0xMDAlLCAwcHgsIDBweClcIjtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ3RvcC1yaWdodCc6XHJcbiAgICAgICAgICAgIGNhc2UgJ2JvdHRvbS1yaWdodCc6XHJcbiAgICAgICAgICAgIGNhc2UgJ3JpZ2h0JzpcclxuICAgICAgICAgICAgICAgIHRoaXMudHJhbnNmb3JtT3B0aW9ucyA9IFwidHJhbnNsYXRlM2QoMTAwJSwgMHB4LCAwcHgpXCI7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdib3R0b20nOlxyXG4gICAgICAgICAgICAgICAgdGhpcy50cmFuc2Zvcm1PcHRpb25zID0gXCJ0cmFuc2xhdGUzZCgwcHgsIDEwMCUsIDBweClcIjtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgJ3RvcCc6XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRyYW5zZm9ybU9wdGlvbnMgPSBcInRyYW5zbGF0ZTNkKDBweCwgLTEwMCUsIDBweClcIjtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRyYW5zZm9ybU9wdGlvbnMgPSBcInNjYWxlKDAuNylcIjtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIEBPdXRwdXQoKSBvbkhpZGU6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG5cclxuICAgIEBDb250ZW50Q2hpbGQoRm9vdGVyKSBmb290ZXI7XHJcblxyXG4gICAgQFZpZXdDaGlsZCgnY29udGVudCcpIGNvbnRlbnRWaWV3Q2hpbGQ6IEVsZW1lbnRSZWY7XHJcblxyXG4gICAgQENvbnRlbnRDaGlsZHJlbihQcmltZVRlbXBsYXRlKSB0ZW1wbGF0ZXM6IFF1ZXJ5TGlzdDxhbnk+O1xyXG5cclxuICAgIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcclxuICAgICAgICB0aGlzLnRlbXBsYXRlcy5mb3JFYWNoKChpdGVtKSA9PiB7XHJcbiAgICAgICAgICAgIHN3aXRjaChpdGVtLmdldFR5cGUoKSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnaGVhZGVyJzpcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmhlYWRlclRlbXBsYXRlID0gaXRlbS50ZW1wbGF0ZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnZm9vdGVyJzpcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmZvb3RlclRlbXBsYXRlID0gaXRlbS50ZW1wbGF0ZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgaGVhZGVyVGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT47XHJcblxyXG4gICAgZm9vdGVyVGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT47XHJcblxyXG4gICAgY29uZmlybWF0aW9uOiBDb25maXJtYXRpb247XHJcblxyXG4gICAgX3Zpc2libGU6IGJvb2xlYW47XHJcblxyXG4gICAgbWFza1Zpc2libGU6IGJvb2xlYW47XHJcblxyXG4gICAgZG9jdW1lbnRFc2NhcGVMaXN0ZW5lcjogYW55O1xyXG5cclxuICAgIGNvbnRhaW5lcjogSFRNTERpdkVsZW1lbnQ7XHJcblxyXG4gICAgd3JhcHBlcjogSFRNTEVsZW1lbnQ7XHJcblxyXG4gICAgY29udGVudENvbnRhaW5lcjogSFRNTERpdkVsZW1lbnQ7XHJcblxyXG4gICAgc3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb247XHJcblxyXG4gICAgbWFza0NsaWNrTGlzdGVuZXI6IEZ1bmN0aW9uO1xyXG5cclxuICAgIHByZVdpZHRoOiBudW1iZXI7XHJcblxyXG4gICAgX3Bvc2l0aW9uOiBzdHJpbmcgPSBcImNlbnRlclwiO1xyXG5cclxuICAgIHRyYW5zZm9ybU9wdGlvbnM6IGFueSA9IFwic2NhbGUoMC43KVwiO1xyXG5cclxuICAgIHN0eWxlRWxlbWVudDogYW55O1xyXG5cclxuICAgIGlkID0gVW5pcXVlQ29tcG9uZW50SWQoKTtcclxuXHJcbiAgICBjb25maXJtYXRpb25PcHRpb25zOiBDb25maXJtYXRpb247XHJcblxyXG4gICAgdHJhbnNsYXRpb25TdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgZWw6IEVsZW1lbnRSZWYsIHB1YmxpYyByZW5kZXJlcjogUmVuZGVyZXIyLCBwcml2YXRlIGNvbmZpcm1hdGlvblNlcnZpY2U6IENvbmZpcm1hdGlvblNlcnZpY2UsIHB1YmxpYyB6b25lOiBOZ1pvbmUsIHByaXZhdGUgY2Q6IENoYW5nZURldGVjdG9yUmVmLCBwdWJsaWMgY29uZmlnOiBQcmltZU5HQ29uZmlnKSB7XHJcbiAgICAgICAgdGhpcy5zdWJzY3JpcHRpb24gPSB0aGlzLmNvbmZpcm1hdGlvblNlcnZpY2UucmVxdWlyZUNvbmZpcm1hdGlvbiQuc3Vic2NyaWJlKGNvbmZpcm1hdGlvbiA9PiB7XHJcbiAgICAgICAgICAgIGlmICghY29uZmlybWF0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGNvbmZpcm1hdGlvbi5rZXkgPT09IHRoaXMua2V5KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbmZpcm1hdGlvbiA9IGNvbmZpcm1hdGlvbjtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29uZmlybWF0aW9uT3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiB0aGlzLmNvbmZpcm1hdGlvbi5tZXNzYWdlfHx0aGlzLm1lc3NhZ2UsXHJcbiAgICAgICAgICAgICAgICAgICAgaWNvbjogdGhpcy5jb25maXJtYXRpb24uaWNvbnx8dGhpcy5pY29uLFxyXG4gICAgICAgICAgICAgICAgICAgIGhlYWRlcjogdGhpcy5jb25maXJtYXRpb24uaGVhZGVyfHx0aGlzLmhlYWRlcixcclxuICAgICAgICAgICAgICAgICAgICByZWplY3RWaXNpYmxlOiB0aGlzLmNvbmZpcm1hdGlvbi5yZWplY3RWaXNpYmxlID09IG51bGwgPyB0aGlzLnJlamVjdFZpc2libGUgOiB0aGlzLmNvbmZpcm1hdGlvbi5yZWplY3RWaXNpYmxlLFxyXG4gICAgICAgICAgICAgICAgICAgIGFjY2VwdFZpc2libGU6IHRoaXMuY29uZmlybWF0aW9uLmFjY2VwdFZpc2libGUgPT0gbnVsbCA/IHRoaXMuYWNjZXB0VmlzaWJsZSA6IHRoaXMuY29uZmlybWF0aW9uLmFjY2VwdFZpc2libGUsXHJcbiAgICAgICAgICAgICAgICAgICAgYWNjZXB0TGFiZWw6IHRoaXMuY29uZmlybWF0aW9uLmFjY2VwdExhYmVsfHx0aGlzLmFjY2VwdExhYmVsLFxyXG4gICAgICAgICAgICAgICAgICAgIHJlamVjdExhYmVsOiB0aGlzLmNvbmZpcm1hdGlvbi5yZWplY3RMYWJlbHx8dGhpcy5yZWplY3RMYWJlbCxcclxuICAgICAgICAgICAgICAgICAgICBhY2NlcHRJY29uOiB0aGlzLmNvbmZpcm1hdGlvbi5hY2NlcHRJY29uIHx8IHRoaXMuYWNjZXB0SWNvbixcclxuICAgICAgICAgICAgICAgICAgICByZWplY3RJY29uOiB0aGlzLmNvbmZpcm1hdGlvbi5yZWplY3RJY29uIHx8IHRoaXMucmVqZWN0SWNvbixcclxuICAgICAgICAgICAgICAgICAgICBhY2NlcHRCdXR0b25TdHlsZUNsYXNzOiB0aGlzLmNvbmZpcm1hdGlvbi5hY2NlcHRCdXR0b25TdHlsZUNsYXNzIHx8IHRoaXMuYWNjZXB0QnV0dG9uU3R5bGVDbGFzcyxcclxuICAgICAgICAgICAgICAgICAgICByZWplY3RCdXR0b25TdHlsZUNsYXNzOiB0aGlzLmNvbmZpcm1hdGlvbi5yZWplY3RCdXR0b25TdHlsZUNsYXNzIHx8IHRoaXMucmVqZWN0QnV0dG9uU3R5bGVDbGFzcyxcclxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0Rm9jdXM6IHRoaXMuY29uZmlybWF0aW9uLmRlZmF1bHRGb2N1cyB8fCB0aGlzLmRlZmF1bHRGb2N1cyxcclxuICAgICAgICAgICAgICAgICAgICBibG9ja1Njcm9sbDogKHRoaXMuY29uZmlybWF0aW9uLmJsb2NrU2Nyb2xsID09PSBmYWxzZSB8fCB0aGlzLmNvbmZpcm1hdGlvbi5ibG9ja1Njcm9sbCA9PT0gdHJ1ZSkgPyB0aGlzLmNvbmZpcm1hdGlvbi5ibG9ja1Njcm9sbCA6IHRoaXMuYmxvY2tTY3JvbGwsXHJcbiAgICAgICAgICAgICAgICAgICAgY2xvc2VPbkVzY2FwZTogKHRoaXMuY29uZmlybWF0aW9uLmNsb3NlT25Fc2NhcGUgPT09IGZhbHNlIHx8IHRoaXMuY29uZmlybWF0aW9uLmNsb3NlT25Fc2NhcGUgPT09IHRydWUpID8gdGhpcy5jb25maXJtYXRpb24uY2xvc2VPbkVzY2FwZSA6IHRoaXMuY2xvc2VPbkVzY2FwZSxcclxuICAgICAgICAgICAgICAgICAgICBkaXNtaXNzYWJsZU1hc2s6ICh0aGlzLmNvbmZpcm1hdGlvbi5kaXNtaXNzYWJsZU1hc2sgPT09IGZhbHNlIHx8IHRoaXMuY29uZmlybWF0aW9uLmRpc21pc3NhYmxlTWFzayA9PT0gdHJ1ZSkgPyB0aGlzLmNvbmZpcm1hdGlvbi5kaXNtaXNzYWJsZU1hc2sgOiB0aGlzLmRpc21pc3NhYmxlTWFza1xyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jb25maXJtYXRpb24uYWNjZXB0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maXJtYXRpb24uYWNjZXB0RXZlbnQgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25maXJtYXRpb24uYWNjZXB0RXZlbnQuc3Vic2NyaWJlKHRoaXMuY29uZmlybWF0aW9uLmFjY2VwdCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlybWF0aW9uLnJlamVjdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlybWF0aW9uLnJlamVjdEV2ZW50ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29uZmlybWF0aW9uLnJlamVjdEV2ZW50LnN1YnNjcmliZSh0aGlzLmNvbmZpcm1hdGlvbi5yZWplY3QpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBuZ09uSW5pdCgpIHtcclxuICAgICAgICBpZiAodGhpcy5icmVha3BvaW50cykge1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVN0eWxlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnRyYW5zbGF0aW9uU3Vic2NyaXB0aW9uID0gdGhpcy5jb25maWcudHJhbnNsYXRpb25PYnNlcnZlci5zdWJzY3JpYmUoKCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAodGhpcy52aXNpYmxlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNkLm1hcmtGb3JDaGVjaygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgb3B0aW9uKG5hbWU6IHN0cmluZykge1xyXG4gICAgICAgIGNvbnN0IHNvdXJjZSA9IHRoaXMuY29uZmlybWF0aW9uT3B0aW9ucyB8fCB0aGlzO1xyXG4gICAgICAgIGlmIChzb3VyY2UuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNvdXJjZVtuYW1lXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH1cclxuXHJcbiAgICBvbkFuaW1hdGlvblN0YXJ0KGV2ZW50OiBBbmltYXRpb25FdmVudCkge1xyXG4gICAgICAgIHN3aXRjaChldmVudC50b1N0YXRlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgJ3Zpc2libGUnOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5jb250YWluZXIgPSBldmVudC5lbGVtZW50O1xyXG4gICAgICAgICAgICAgICAgdGhpcy53cmFwcGVyID0gdGhpcy5jb250YWluZXIucGFyZW50RWxlbWVudDtcclxuICAgICAgICAgICAgICAgIHRoaXMuY29udGVudENvbnRhaW5lciA9IERvbUhhbmRsZXIuZmluZFNpbmdsZSh0aGlzLmNvbnRhaW5lciwgJy5wLWRpYWxvZy1jb250ZW50Jyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnRhaW5lci5zZXRBdHRyaWJ1dGUodGhpcy5pZCwgJycpO1xyXG5cclxuICAgICAgICAgICAgICAgIGNvbnN0IGVsZW1lbnQgPSB0aGlzLmdldEVsZW1lbnRUb0ZvY3VzKCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuZm9jdXMoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmFwcGVuZENvbnRhaW5lcigpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tb3ZlT25Ub3AoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYmluZEdsb2JhbExpc3RlbmVycygpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5lbmFibGVNb2RhbGl0eSgpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgb25BbmltYXRpb25FbmQoZXZlbnQ6IEFuaW1hdGlvbkV2ZW50KSB7XHJcbiAgICAgICAgc3dpdGNoKGV2ZW50LnRvU3RhdGUpIHtcclxuICAgICAgICAgICAgY2FzZSAndm9pZCc6XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9uT3ZlcmxheUhpZGUoKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdldEVsZW1lbnRUb0ZvY3VzKCkge1xyXG4gICAgICAgIHN3aXRjaCh0aGlzLm9wdGlvbignZGVmYXVsdEZvY3VzJykpIHtcclxuICAgICAgICAgICAgY2FzZSAnYWNjZXB0JzpcclxuICAgICAgICAgICAgICAgIHJldHVybiBEb21IYW5kbGVyLmZpbmRTaW5nbGUodGhpcy5jb250YWluZXIsICcucC1jb25maXJtLWRpYWxvZy1hY2NlcHQnKTtcclxuXHJcbiAgICAgICAgICAgIGNhc2UgJ3JlamVjdCc6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gRG9tSGFuZGxlci5maW5kU2luZ2xlKHRoaXMuY29udGFpbmVyLCAnLnAtY29uZmlybS1kaWFsb2ctcmVqZWN0Jyk7XHJcblxyXG4gICAgICAgICAgICBjYXNlICdjbG9zZSc6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gRG9tSGFuZGxlci5maW5kU2luZ2xlKHRoaXMuY29udGFpbmVyLCAnLnAtZGlhbG9nLWhlYWRlci1jbG9zZScpO1xyXG5cclxuICAgICAgICAgICAgY2FzZSAnbm9uZSc6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuXHJcbiAgICAgICAgICAgIC8vYmFja3dhcmQgY29tcGF0aWJpbGl0eVxyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIERvbUhhbmRsZXIuZmluZFNpbmdsZSh0aGlzLmNvbnRhaW5lciwgJy5wLWNvbmZpcm0tZGlhbG9nLWFjY2VwdCcpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBhcHBlbmRDb250YWluZXIoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuYXBwZW5kVG8pIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuYXBwZW5kVG8gPT09ICdib2R5JylcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy53cmFwcGVyKTtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgRG9tSGFuZGxlci5hcHBlbmRDaGlsZCh0aGlzLndyYXBwZXIsIHRoaXMuYXBwZW5kVG8pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXN0b3JlQXBwZW5kKCkge1xyXG4gICAgICAgIGlmICh0aGlzLndyYXBwZXIgJiYgdGhpcy5hcHBlbmRUbykge1xyXG4gICAgICAgICAgICB0aGlzLmVsLm5hdGl2ZUVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy53cmFwcGVyKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZW5hYmxlTW9kYWxpdHkoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9uKCdibG9ja1Njcm9sbCcpKSB7XHJcbiAgICAgICAgICAgIERvbUhhbmRsZXIuYWRkQ2xhc3MoZG9jdW1lbnQuYm9keSwgJ3Atb3ZlcmZsb3ctaGlkZGVuJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5vcHRpb24oJ2Rpc21pc3NhYmxlTWFzaycpKSB7XHJcbiAgICAgICAgICAgIHRoaXMubWFza0NsaWNrTGlzdGVuZXIgPSB0aGlzLnJlbmRlcmVyLmxpc3Rlbih0aGlzLndyYXBwZXIsICdtb3VzZWRvd24nLCAoZXZlbnQ6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMud3JhcHBlciAmJiB0aGlzLndyYXBwZXIuaXNTYW1lTm9kZShldmVudC50YXJnZXQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jbG9zZShldmVudCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBkaXNhYmxlTW9kYWxpdHkoKSB7XHJcbiAgICAgICAgdGhpcy5tYXNrVmlzaWJsZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5vcHRpb24oJ2Jsb2NrU2Nyb2xsJykpIHtcclxuICAgICAgICAgICAgRG9tSGFuZGxlci5yZW1vdmVDbGFzcyhkb2N1bWVudC5ib2R5LCAncC1vdmVyZmxvdy1oaWRkZW4nKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmRpc21pc3NhYmxlTWFzaykge1xyXG4gICAgICAgICAgICB0aGlzLnVuYmluZE1hc2tDbGlja0xpc3RlbmVyKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5jb250YWluZXIgJiYgIXRoaXMuY2RbJ2Rlc3Ryb3llZCddKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2QuZGV0ZWN0Q2hhbmdlcygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGVTdHlsZSgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuc3R5bGVFbGVtZW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3R5bGVFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKTtcclxuICAgICAgICAgICAgdGhpcy5zdHlsZUVsZW1lbnQudHlwZSA9ICd0ZXh0L2Nzcyc7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQodGhpcy5zdHlsZUVsZW1lbnQpO1xyXG4gICAgICAgICAgICBsZXQgaW5uZXJIVE1MID0gJyc7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGJyZWFrcG9pbnQgaW4gdGhpcy5icmVha3BvaW50cykge1xyXG4gICAgICAgICAgICAgICAgaW5uZXJIVE1MICs9IGBcclxuICAgICAgICAgICAgICAgICAgICBAbWVkaWEgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiAke2JyZWFrcG9pbnR9KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5wLWRpYWxvZ1ske3RoaXMuaWR9XSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogJHt0aGlzLmJyZWFrcG9pbnRzW2JyZWFrcG9pbnRdfSAhaW1wb3J0YW50O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYFxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLnN0eWxlRWxlbWVudC5pbm5lckhUTUwgPSBpbm5lckhUTUw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNsb3NlKGV2ZW50OiBFdmVudCkge1xyXG4gICAgICAgIGlmICh0aGlzLmNvbmZpcm1hdGlvbi5yZWplY3RFdmVudCkge1xyXG4gICAgICAgICAgICB0aGlzLmNvbmZpcm1hdGlvbi5yZWplY3RFdmVudC5lbWl0KENvbmZpcm1FdmVudFR5cGUuQ0FOQ0VMKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuaGlkZShDb25maXJtRXZlbnRUeXBlLkNBTkNFTCk7XHJcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIH1cclxuXHJcbiAgICBoaWRlKHR5cGU/KSB7XHJcbiAgICAgICAgdGhpcy5vbkhpZGUuZW1pdCh0eXBlKTtcclxuICAgICAgICB0aGlzLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmNvbmZpcm1hdGlvbiA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5jb25maXJtYXRpb25PcHRpb25zID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBtb3ZlT25Ub3AoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuYXV0b1pJbmRleCkge1xyXG4gICAgICAgICAgICB0aGlzLmNvbnRhaW5lci5zdHlsZS56SW5kZXggPSBTdHJpbmcodGhpcy5iYXNlWkluZGV4ICsgKCsrRG9tSGFuZGxlci56aW5kZXgpKTtcclxuICAgICAgICAgICAgdGhpcy53cmFwcGVyLnN0eWxlLnpJbmRleCA9IFN0cmluZyh0aGlzLmJhc2VaSW5kZXggKyAoRG9tSGFuZGxlci56aW5kZXggLSAxKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdldE1hc2tDbGFzcygpIHtcclxuICAgICAgICBsZXQgbWFza0NsYXNzID0geydwLWRpYWxvZy1tYXNrIHAtY29tcG9uZW50LW92ZXJsYXknOiB0cnVlLCAncC1kaWFsb2ctbWFzay1zY3JvbGxibG9ja2VyJzogdGhpcy5ibG9ja1Njcm9sbH07XHJcbiAgICAgICAgbWFza0NsYXNzW3RoaXMuZ2V0UG9zaXRpb25DbGFzcygpLnRvU3RyaW5nKCldID0gdHJ1ZTtcclxuICAgICAgICByZXR1cm4gbWFza0NsYXNzO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFBvc2l0aW9uQ2xhc3MoKSB7XHJcbiAgICAgICAgY29uc3QgcG9zaXRpb25zID0gWydsZWZ0JywgJ3JpZ2h0JywgJ3RvcCcsICd0b3AtbGVmdCcsICd0b3AtcmlnaHQnLCAnYm90dG9tJywgJ2JvdHRvbS1sZWZ0JywgJ2JvdHRvbS1yaWdodCddO1xyXG4gICAgICAgIGNvbnN0IHBvcyA9IHBvc2l0aW9ucy5maW5kKGl0ZW0gPT4gaXRlbSA9PT0gdGhpcy5wb3NpdGlvbik7XHJcblxyXG4gICAgICAgIHJldHVybiBwb3MgPyBgcC1kaWFsb2ctJHtwb3N9YCA6ICcnO1xyXG4gICAgfVxyXG5cclxuICAgIGJpbmRHbG9iYWxMaXN0ZW5lcnMoKSB7XHJcbiAgICAgICAgaWYgKCh0aGlzLm9wdGlvbignY2xvc2VPbkVzY2FwZScpICYmIHRoaXMuY2xvc2FibGUpIHx8IHRoaXMuZm9jdXNUcmFwICYmICF0aGlzLmRvY3VtZW50RXNjYXBlTGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgY29uc3QgZG9jdW1lbnRUYXJnZXQ6IGFueSA9IHRoaXMuZWwgPyB0aGlzLmVsLm5hdGl2ZUVsZW1lbnQub3duZXJEb2N1bWVudCA6ICdkb2N1bWVudCc7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmRvY3VtZW50RXNjYXBlTGlzdGVuZXIgPSB0aGlzLnJlbmRlcmVyLmxpc3Rlbihkb2N1bWVudFRhcmdldCwgJ2tleWRvd24nLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChldmVudC53aGljaCA9PSAyNyAmJiAodGhpcy5vcHRpb24oJ2Nsb3NlT25Fc2NhcGUnKSAmJiB0aGlzLmNsb3NhYmxlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJzZUludCh0aGlzLmNvbnRhaW5lci5zdHlsZS56SW5kZXgpID09PSAoRG9tSGFuZGxlci56aW5kZXggKyB0aGlzLmJhc2VaSW5kZXgpICYmIHRoaXMudmlzaWJsZSnCoHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jbG9zZShldmVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChldmVudC53aGljaCA9PT0gOSAmJiB0aGlzLmZvY3VzVHJhcCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBmb2N1c2FibGVFbGVtZW50cyA9IERvbUhhbmRsZXIuZ2V0Rm9jdXNhYmxlRWxlbWVudHModGhpcy5jb250YWluZXIpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoZm9jdXNhYmxlRWxlbWVudHMgJiYgZm9jdXNhYmxlRWxlbWVudHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWZvY3VzYWJsZUVsZW1lbnRzWzBdLm93bmVyRG9jdW1lbnQuYWN0aXZlRWxlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9jdXNhYmxlRWxlbWVudHNbMF0uZm9jdXMoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBmb2N1c2VkSW5kZXggPSBmb2N1c2FibGVFbGVtZW50cy5pbmRleE9mKGZvY3VzYWJsZUVsZW1lbnRzWzBdLm93bmVyRG9jdW1lbnQuYWN0aXZlRWxlbWVudCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50LnNoaWZ0S2V5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZvY3VzZWRJbmRleCA9PSAtMSB8fCBmb2N1c2VkSW5kZXggPT09IDApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvY3VzYWJsZUVsZW1lbnRzW2ZvY3VzYWJsZUVsZW1lbnRzLmxlbmd0aCAtIDFdLmZvY3VzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb2N1c2FibGVFbGVtZW50c1tmb2N1c2VkSW5kZXggLSAxXS5mb2N1cygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZvY3VzZWRJbmRleCA9PSAtMSB8fCBmb2N1c2VkSW5kZXggPT09IChmb2N1c2FibGVFbGVtZW50cy5sZW5ndGggLSAxKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9jdXNhYmxlRWxlbWVudHNbMF0uZm9jdXMoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvY3VzYWJsZUVsZW1lbnRzW2ZvY3VzZWRJbmRleCArIDFdLmZvY3VzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1bmJpbmRHbG9iYWxMaXN0ZW5lcnMoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZG9jdW1lbnRFc2NhcGVMaXN0ZW5lcikge1xyXG4gICAgICAgICAgICB0aGlzLmRvY3VtZW50RXNjYXBlTGlzdGVuZXIoKTtcclxuICAgICAgICAgICAgdGhpcy5kb2N1bWVudEVzY2FwZUxpc3RlbmVyID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdW5iaW5kTWFza0NsaWNrTGlzdGVuZXIoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMubWFza0NsaWNrTGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5tYXNrQ2xpY2tMaXN0ZW5lcigpO1xyXG4gICAgICAgICAgICB0aGlzLm1hc2tDbGlja0xpc3RlbmVyID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgb25PdmVybGF5SGlkZSgpIHtcclxuICAgICAgICB0aGlzLmRpc2FibGVNb2RhbGl0eSgpO1xyXG4gICAgICAgIHRoaXMudW5iaW5kR2xvYmFsTGlzdGVuZXJzKCk7XHJcbiAgICAgICAgdGhpcy5jb250YWluZXIgPSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGRlc3Ryb3lTdHlsZSgpIHtcclxuICAgICAgICBpZiAodGhpcy5zdHlsZUVsZW1lbnQpIHtcclxuICAgICAgICAgICAgZG9jdW1lbnQuaGVhZC5yZW1vdmVDaGlsZCh0aGlzLnN0eWxlRWxlbWVudCk7XHJcbiAgICAgICAgICAgIHRoaXMuc3R5bGVFbGVtZW50ID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbmdPbkRlc3Ryb3koKSB7XHJcbiAgICAgICAgdGhpcy5yZXN0b3JlQXBwZW5kKCk7XHJcbiAgICAgICAgdGhpcy5vbk92ZXJsYXlIaWRlKCk7XHJcbiAgICAgICAgdGhpcy5zdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcclxuICAgICAgICBcclxuICAgICAgICBpZiAodGhpcy50cmFuc2xhdGlvblN1YnNjcmlwdGlvbikge1xyXG4gICAgICAgICAgICB0aGlzLnRyYW5zbGF0aW9uU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmRlc3Ryb3lTdHlsZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGFjY2VwdCgpIHtcclxuICAgICAgICBpZiAodGhpcy5jb25maXJtYXRpb24gJiYgdGhpcy5jb25maXJtYXRpb24uYWNjZXB0RXZlbnQpIHtcclxuICAgICAgICAgICAgdGhpcy5jb25maXJtYXRpb24uYWNjZXB0RXZlbnQuZW1pdCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5oaWRlKENvbmZpcm1FdmVudFR5cGUuQUNDRVBUKTtcclxuICAgIH1cclxuXHJcbiAgICByZWplY3QoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuY29uZmlybWF0aW9uICYmIHRoaXMuY29uZmlybWF0aW9uLnJlamVjdEV2ZW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMuY29uZmlybWF0aW9uLnJlamVjdEV2ZW50LmVtaXQoQ29uZmlybUV2ZW50VHlwZS5SRUpFQ1QpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5oaWRlKENvbmZpcm1FdmVudFR5cGUuUkVKRUNUKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgYWNjZXB0QnV0dG9uTGFiZWwoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5vcHRpb24oJ2FjY2VwdExhYmVsJykgfHwgdGhpcy5jb25maWcuZ2V0VHJhbnNsYXRpb24oVHJhbnNsYXRpb25LZXlzLkFDQ0VQVCk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHJlamVjdEJ1dHRvbkxhYmVsKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9uKCdyZWplY3RMYWJlbCcpIHx8IHRoaXMuY29uZmlnLmdldFRyYW5zbGF0aW9uKFRyYW5zbGF0aW9uS2V5cy5SRUpFQ1QpO1xyXG4gICAgfVxyXG59XHJcblxyXG5ATmdNb2R1bGUoe1xyXG4gICAgaW1wb3J0czogW0NvbW1vbk1vZHVsZSxCdXR0b25Nb2R1bGUsUmlwcGxlTW9kdWxlXSxcclxuICAgIGV4cG9ydHM6IFtDb25maXJtRGlhbG9nLEJ1dHRvbk1vZHVsZSxTaGFyZWRNb2R1bGVdLFxyXG4gICAgZGVjbGFyYXRpb25zOiBbQ29uZmlybURpYWxvZ11cclxufSlcclxuZXhwb3J0IGNsYXNzIENvbmZpcm1EaWFsb2dNb2R1bGUgeyB9XHJcbiJdfQ==