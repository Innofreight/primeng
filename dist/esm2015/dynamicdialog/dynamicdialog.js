import { Component, NgModule, ComponentFactoryResolver, ViewChild, ChangeDetectorRef, Renderer2, NgZone, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { trigger, style, transition, animate, animation, useAnimation } from '@angular/animations';
import { DynamicDialogContent } from './dynamicdialogcontent';
import { DynamicDialogConfig } from './dynamicdialog-config';
import { CommonModule } from '@angular/common';
import { DomHandler } from 'primeng/dom';
import { DynamicDialogRef } from './dynamicdialog-ref';
const showAnimation = animation([
    style({ transform: '{{transform}}', opacity: 0 }),
    animate('{{transition}}', style({ transform: 'none', opacity: 1 }))
]);
const hideAnimation = animation([
    animate('{{transition}}', style({ transform: '{{transform}}', opacity: 0 }))
]);
export class DynamicDialogComponent {
    constructor(componentFactoryResolver, cd, renderer, config, dialogRef, zone) {
        this.componentFactoryResolver = componentFactoryResolver;
        this.cd = cd;
        this.renderer = renderer;
        this.config = config;
        this.dialogRef = dialogRef;
        this.zone = zone;
        this.visible = true;
        this.transformOptions = "scale(0.7)";
    }
    ngAfterViewInit() {
        this.loadChildComponent(this.childComponentType);
        this.cd.detectChanges();
    }
    loadChildComponent(componentType) {
        let componentFactory = this.componentFactoryResolver.resolveComponentFactory(componentType);
        let viewContainerRef = this.insertionPoint.viewContainerRef;
        viewContainerRef.clear();
        this.componentRef = viewContainerRef.createComponent(componentFactory);
    }
    moveOnTop() {
        if (this.config.autoZIndex !== false) {
            const zIndex = (this.config.baseZIndex || 0) + (++DomHandler.zindex);
            this.container.style.zIndex = String(zIndex);
            this.maskViewChild.nativeElement.style.zIndex = String(zIndex - 1);
        }
    }
    onAnimationStart(event) {
        switch (event.toState) {
            case 'visible':
                this.container = event.element;
                this.wrapper = this.container.parentElement;
                this.moveOnTop();
                this.bindGlobalListeners();
                if (this.config.modal !== false) {
                    this.enableModality();
                }
                this.focus();
                break;
            case 'void':
                this.onContainerDestroy();
                break;
        }
    }
    onAnimationEnd(event) {
        if (event.toState === 'void') {
            this.dialogRef.destroy();
        }
    }
    onContainerDestroy() {
        this.unbindGlobalListeners();
        if (this.config.modal !== false) {
            this.disableModality();
        }
        this.container = null;
    }
    close() {
        this.visible = false;
        this.cd.markForCheck();
    }
    hide() {
        if (this.dialogRef) {
            this.dialogRef.close();
        }
    }
    enableModality() {
        if (this.config.closable !== false && this.config.dismissableMask) {
            this.maskClickListener = this.renderer.listen(this.wrapper, 'mousedown', (event) => {
                if (this.wrapper && this.wrapper.isSameNode(event.target)) {
                    this.hide();
                }
            });
        }
        if (this.config.modal !== false) {
            DomHandler.addClass(document.body, 'p-overflow-hidden');
        }
    }
    disableModality() {
        if (this.wrapper) {
            if (this.config.dismissableMask) {
                this.unbindMaskClickListener();
            }
            if (this.config.modal !== false) {
                DomHandler.removeClass(document.body, 'p-overflow-hidden');
            }
            if (!this.cd.destroyed) {
                this.cd.detectChanges();
            }
        }
    }
    onKeydown(event) {
        if (event.which === 9) {
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
    }
    focus() {
        let focusable = DomHandler.findSingle(this.container, '[autofocus]');
        if (focusable) {
            this.zone.runOutsideAngular(() => {
                setTimeout(() => focusable.focus(), 5);
            });
        }
    }
    bindGlobalListeners() {
        this.bindDocumentKeydownListener();
        if (this.config.closeOnEscape !== false && this.config.closable !== false) {
            this.bindDocumentEscapeListener();
        }
    }
    unbindGlobalListeners() {
        this.unbindDocumentKeydownListener();
        this.unbindDocumentEscapeListener();
    }
    bindDocumentKeydownListener() {
        this.zone.runOutsideAngular(() => {
            this.documentKeydownListener = this.onKeydown.bind(this);
            window.document.addEventListener('keydown', this.documentKeydownListener);
        });
    }
    unbindDocumentKeydownListener() {
        if (this.documentKeydownListener) {
            window.document.removeEventListener('keydown', this.documentKeydownListener);
            this.documentKeydownListener = null;
        }
    }
    bindDocumentEscapeListener() {
        const documentTarget = this.maskViewChild ? this.maskViewChild.nativeElement.ownerDocument : 'document';
        this.documentEscapeListener = this.renderer.listen(documentTarget, 'keydown', (event) => {
            if (event.which == 27) {
                if (parseInt(this.container.style.zIndex) == (DomHandler.zindex + (this.config.baseZIndex ? this.config.baseZIndex : 0))) {
                    this.hide();
                }
            }
        });
    }
    unbindDocumentEscapeListener() {
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
    ngOnDestroy() {
        this.onContainerDestroy();
        if (this.componentRef) {
            this.componentRef.destroy();
        }
    }
}
DynamicDialogComponent.decorators = [
    { type: Component, args: [{
                selector: 'p-dynamicDialog',
                template: `
        <div #mask [ngClass]="{'p-dialog-mask':true, 'p-component-overlay p-dialog-mask-scrollblocker': config.modal !== false}">
            <div [ngClass]="{'p-dialog p-dynamic-dialog p-component':true, 'p-dialog-rtl': config.rtl}" [ngStyle]="config.style" [class]="config.styleClass"
                [@animation]="{value: 'visible', params: {transform: transformOptions, transition: config.transitionOptions || '150ms cubic-bezier(0, 0, 0.2, 1)'}}"
                (@animation.start)="onAnimationStart($event)" (@animation.done)="onAnimationEnd($event)" role="dialog" *ngIf="visible"
                [style.width]="config.width" [style.height]="config.height">
                <div class="p-dialog-header" *ngIf="config.showHeader === false ? false: true">
                    <span class="p-dialog-title">{{config.header}}</span>
                    <div class="p-dialog-header-icons">
                        <button [ngClass]="'p-dialog-header-icon p-dialog-header-maximize p-link'" type="button" (click)="hide()" (keydown.enter)="hide()" *ngIf="config.closable !== false">
                            <span class="p-dialog-header-close-icon pi pi-times"></span>
                        </button>
                    </div>
                </div>
                <div class="p-dialog-content" [ngStyle]="config.contentStyle">
                    <ng-template pDynamicDialogContent></ng-template>
                </div>
                <div class="p-dialog-footer" *ngIf="config.footer">
                    {{config.footer}}
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
                changeDetection: ChangeDetectionStrategy.Default,
                encapsulation: ViewEncapsulation.None,
                styles: [".p-dialog-mask{align-items:center;background-color:transparent;display:flex;height:100%;justify-content:center;left:0;pointer-events:none;position:fixed;top:0;transition-property:background-color;width:100%}.p-dialog,.p-dialog-mask.p-component-overlay{pointer-events:auto}.p-dialog{display:flex;flex-direction:column;max-height:90%;position:relative;transform:scale(1)}.p-dialog-content{overflow-y:auto}.p-dialog-header{align-items:center;display:flex;flex-shrink:0;justify-content:space-between}.p-dialog-footer{flex-shrink:0}.p-dialog .p-dialog-header-icons{align-items:center;display:flex}.p-dialog .p-dialog-header-icon{align-items:center;display:flex;justify-content:center;overflow:hidden;position:relative}.p-dialog-mask.p-dialog-mask-leave{background-color:transparent}.p-fluid .p-dialog-footer .p-button{width:auto}.p-dialog-bottom-left .p-dialog,.p-dialog-bottom-right .p-dialog,.p-dialog-bottom .p-dialog,.p-dialog-left .p-dialog,.p-dialog-right .p-dialog,.p-dialog-top-left .p-dialog,.p-dialog-top-right .p-dialog,.p-dialog-top .p-dialog{margin:.75rem;transform:translateZ(0)}.p-dialog-maximized{height:100%;left:0!important;max-height:100%;top:0!important;transform:none;transition:none;width:100vw!important}.p-dialog-maximized .p-dialog-content{flex-grow:1}.p-dialog-left{justify-content:flex-start}.p-dialog-right{justify-content:flex-end}.p-dialog-top,.p-dialog-top-left{align-items:flex-start}.p-dialog-top-left{justify-content:flex-start}.p-dialog-top-right{align-items:flex-start;justify-content:flex-end}.p-dialog-bottom{align-items:flex-end}.p-dialog-bottom-left{align-items:flex-end;justify-content:flex-start}.p-dialog-bottom-right{align-items:flex-end;justify-content:flex-end}.p-dialog .p-resizable-handle{bottom:1px;cursor:se-resize;display:block;font-size:.1px;height:12px;position:absolute;right:1px;width:12px}.p-confirm-dialog .p-dialog-content{align-items:center;display:flex}"]
            },] }
];
DynamicDialogComponent.ctorParameters = () => [
    { type: ComponentFactoryResolver },
    { type: ChangeDetectorRef },
    { type: Renderer2 },
    { type: DynamicDialogConfig },
    { type: DynamicDialogRef },
    { type: NgZone }
];
DynamicDialogComponent.propDecorators = {
    insertionPoint: [{ type: ViewChild, args: [DynamicDialogContent,] }],
    maskViewChild: [{ type: ViewChild, args: ['mask',] }]
};
export class DynamicDialogModule {
}
DynamicDialogModule.decorators = [
    { type: NgModule, args: [{
                imports: [CommonModule],
                declarations: [DynamicDialogComponent, DynamicDialogContent],
                entryComponents: [DynamicDialogComponent]
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHluYW1pY2RpYWxvZy5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8uLi9zcmMvYXBwL2NvbXBvbmVudHMvZHluYW1pY2RpYWxvZy8iLCJzb3VyY2VzIjpbImR5bmFtaWNkaWFsb2cudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQVEsd0JBQXdCLEVBQUUsU0FBUyxFQUEwQyxpQkFBaUIsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFjLHVCQUF1QixFQUFXLGlCQUFpQixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzlPLE9BQU8sRUFBRSxPQUFPLEVBQUMsS0FBSyxFQUFDLFVBQVUsRUFBQyxPQUFPLEVBQWlCLFNBQVMsRUFBRSxZQUFZLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUMvRyxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUM5RCxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUM3RCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDL0MsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUN6QyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUV2RCxNQUFNLGFBQWEsR0FBRyxTQUFTLENBQUM7SUFDNUIsS0FBSyxDQUFDLEVBQUUsU0FBUyxFQUFFLGVBQWUsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDakQsT0FBTyxDQUFDLGdCQUFnQixFQUFFLEtBQUssQ0FBQyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7Q0FDdEUsQ0FBQyxDQUFDO0FBRUgsTUFBTSxhQUFhLEdBQUcsU0FBUyxDQUFDO0lBQzVCLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxLQUFLLENBQUMsRUFBRSxTQUFTLEVBQUUsZUFBZSxFQUFFLE9BQU8sRUFB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IFR5cGUsIENvbXBvbmVudEZhY3RvcnlSZXNvbHZlciwgVmlld0NoaWxkLCBPbkRlc3Ryb3ksIENvbXBvbmVudFJlZiwgQWZ0ZXJWaWV3SW5pdCwgQ2hhbmdlRGV0ZWN0b3JSZWYsIFJlbmRlcmVyMiwgTmdab25lLCBFbGVtZW50UmVmLCBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSwgVmlld1JlZiwgVmlld0VuY2Fwc3VsYXRpb24gfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgdHJpZ2dlcixzdHlsZSx0cmFuc2l0aW9uLGFuaW1hdGUsQW5pbWF0aW9uRXZlbnQsIGFuaW1hdGlvbiwgdXNlQW5pbWF0aW9uIH0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XHJcbmltcG9ydCB7IER5bmFtaWNEaWFsb2dDb250ZW50IH0gZnJvbSAnLi9keW5hbWljZGlhbG9nY29udGVudCc7XHJcbmltcG9ydCB7IER5bmFtaWNEaWFsb2dDb25maWcgfSBmcm9tICcuL2R5bmFtaWNkaWFsb2ctY29uZmlnJztcclxuaW1wb3J0IHsgQ29tbW9uTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcclxuaW1wb3J0IHsgRG9tSGFuZGxlciB9IGZyb20gJ3ByaW1lbmcvZG9tJztcclxuaW1wb3J0IHsgRHluYW1pY0RpYWxvZ1JlZiB9IGZyb20gJy4vZHluYW1pY2RpYWxvZy1yZWYnO1xyXG5cclxuY29uc3Qgc2hvd0FuaW1hdGlvbiA9IGFuaW1hdGlvbihbXHJcbiAgICBzdHlsZSh7IHRyYW5zZm9ybTogJ3t7dHJhbnNmb3JtfX0nLCBvcGFjaXR5OiAwIH0pLFxyXG4gICAgYW5pbWF0ZSgne3t0cmFuc2l0aW9ufX0nLCBzdHlsZSh7IHRyYW5zZm9ybTogJ25vbmUnLCBvcGFjaXR5OiAxIH0pKVxyXG5dKTtcclxuXHJcbmNvbnN0IGhpZGVBbmltYXRpb24gPSBhbmltYXRpb24oW1xyXG4gICAgYW5pbWF0ZSgne3t0cmFuc2l0aW9ufX0nLCBzdHlsZSh7IHRyYW5zZm9ybTogJ3t7dHJhbnNmb3JtfX0nLCBvcGFjaXR5OiAwIH0pKVxyXG5dKTtcclxuXHJcbkBDb21wb25lbnQoe1xyXG5cdHNlbGVjdG9yOiAncC1keW5hbWljRGlhbG9nJyxcclxuXHR0ZW1wbGF0ZTogYFxyXG4gICAgICAgIDxkaXYgI21hc2sgW25nQ2xhc3NdPVwieydwLWRpYWxvZy1tYXNrJzp0cnVlLCAncC1jb21wb25lbnQtb3ZlcmxheSBwLWRpYWxvZy1tYXNrLXNjcm9sbGJsb2NrZXInOiBjb25maWcubW9kYWwgIT09IGZhbHNlfVwiPlxyXG4gICAgICAgICAgICA8ZGl2IFtuZ0NsYXNzXT1cInsncC1kaWFsb2cgcC1keW5hbWljLWRpYWxvZyBwLWNvbXBvbmVudCc6dHJ1ZSwgJ3AtZGlhbG9nLXJ0bCc6IGNvbmZpZy5ydGx9XCIgW25nU3R5bGVdPVwiY29uZmlnLnN0eWxlXCIgW2NsYXNzXT1cImNvbmZpZy5zdHlsZUNsYXNzXCJcclxuICAgICAgICAgICAgICAgIFtAYW5pbWF0aW9uXT1cInt2YWx1ZTogJ3Zpc2libGUnLCBwYXJhbXM6IHt0cmFuc2Zvcm06IHRyYW5zZm9ybU9wdGlvbnMsIHRyYW5zaXRpb246IGNvbmZpZy50cmFuc2l0aW9uT3B0aW9ucyB8fCAnMTUwbXMgY3ViaWMtYmV6aWVyKDAsIDAsIDAuMiwgMSknfX1cIlxyXG4gICAgICAgICAgICAgICAgKEBhbmltYXRpb24uc3RhcnQpPVwib25BbmltYXRpb25TdGFydCgkZXZlbnQpXCIgKEBhbmltYXRpb24uZG9uZSk9XCJvbkFuaW1hdGlvbkVuZCgkZXZlbnQpXCIgcm9sZT1cImRpYWxvZ1wiICpuZ0lmPVwidmlzaWJsZVwiXHJcbiAgICAgICAgICAgICAgICBbc3R5bGUud2lkdGhdPVwiY29uZmlnLndpZHRoXCIgW3N0eWxlLmhlaWdodF09XCJjb25maWcuaGVpZ2h0XCI+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicC1kaWFsb2ctaGVhZGVyXCIgKm5nSWY9XCJjb25maWcuc2hvd0hlYWRlciA9PT0gZmFsc2UgPyBmYWxzZTogdHJ1ZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwicC1kaWFsb2ctdGl0bGVcIj57e2NvbmZpZy5oZWFkZXJ9fTwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicC1kaWFsb2ctaGVhZGVyLWljb25zXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gW25nQ2xhc3NdPVwiJ3AtZGlhbG9nLWhlYWRlci1pY29uIHAtZGlhbG9nLWhlYWRlci1tYXhpbWl6ZSBwLWxpbmsnXCIgdHlwZT1cImJ1dHRvblwiIChjbGljayk9XCJoaWRlKClcIiAoa2V5ZG93bi5lbnRlcik9XCJoaWRlKClcIiAqbmdJZj1cImNvbmZpZy5jbG9zYWJsZSAhPT0gZmFsc2VcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwicC1kaWFsb2ctaGVhZGVyLWNsb3NlLWljb24gcGkgcGktdGltZXNcIj48L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicC1kaWFsb2ctY29udGVudFwiIFtuZ1N0eWxlXT1cImNvbmZpZy5jb250ZW50U3R5bGVcIj5cclxuICAgICAgICAgICAgICAgICAgICA8bmctdGVtcGxhdGUgcER5bmFtaWNEaWFsb2dDb250ZW50PjwvbmctdGVtcGxhdGU+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwLWRpYWxvZy1mb290ZXJcIiAqbmdJZj1cImNvbmZpZy5mb290ZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICB7e2NvbmZpZy5mb290ZXJ9fVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG5cdGAsXHJcblx0YW5pbWF0aW9uczogW1xyXG4gICAgICAgIHRyaWdnZXIoJ2FuaW1hdGlvbicsIFtcclxuICAgICAgICAgICAgdHJhbnNpdGlvbigndm9pZCA9PiB2aXNpYmxlJywgW1xyXG4gICAgICAgICAgICAgICAgdXNlQW5pbWF0aW9uKHNob3dBbmltYXRpb24pXHJcbiAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICB0cmFuc2l0aW9uKCd2aXNpYmxlID0+IHZvaWQnLCBbXHJcbiAgICAgICAgICAgICAgICB1c2VBbmltYXRpb24oaGlkZUFuaW1hdGlvbilcclxuICAgICAgICAgICAgXSlcclxuICAgICAgICBdKVxyXG4gICAgXSxcclxuICAgIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuRGVmYXVsdCxcclxuICAgIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXHJcbiAgICBzdHlsZVVybHM6IFsnLi4vZGlhbG9nL2RpYWxvZy5jc3MnXVxyXG59KVxyXG5leHBvcnQgY2xhc3MgRHluYW1pY0RpYWxvZ0NvbXBvbmVudCBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSB7XHJcblxyXG5cdHZpc2libGU6IGJvb2xlYW4gPSB0cnVlO1xyXG5cclxuXHRjb21wb25lbnRSZWY6IENvbXBvbmVudFJlZjxhbnk+O1xyXG5cclxuXHRtYXNrOiBIVE1MRGl2RWxlbWVudDtcclxuXHJcblx0QFZpZXdDaGlsZChEeW5hbWljRGlhbG9nQ29udGVudCkgaW5zZXJ0aW9uUG9pbnQ6IER5bmFtaWNEaWFsb2dDb250ZW50O1xyXG5cclxuXHRAVmlld0NoaWxkKCdtYXNrJykgbWFza1ZpZXdDaGlsZDogRWxlbWVudFJlZjtcclxuXHJcblx0Y2hpbGRDb21wb25lbnRUeXBlOiBUeXBlPGFueT47XHJcblxyXG4gICAgY29udGFpbmVyOiBIVE1MRGl2RWxlbWVudDtcclxuXHJcbiAgICB3cmFwcGVyOiBIVE1MRWxlbWVudDtcclxuXHJcbiAgICBkb2N1bWVudEtleWRvd25MaXN0ZW5lcjogYW55O1xyXG5cclxuICAgIGRvY3VtZW50RXNjYXBlTGlzdGVuZXI6IEZ1bmN0aW9uO1xyXG5cclxuICAgIG1hc2tDbGlja0xpc3RlbmVyOiBGdW5jdGlvbjtcclxuXHJcbiAgICB0cmFuc2Zvcm1PcHRpb25zOiBzdHJpbmcgPSBcInNjYWxlKDAuNylcIjtcclxuXHJcblx0Y29uc3RydWN0b3IocHJpdmF0ZSBjb21wb25lbnRGYWN0b3J5UmVzb2x2ZXI6IENvbXBvbmVudEZhY3RvcnlSZXNvbHZlciwgcHJpdmF0ZSBjZDogQ2hhbmdlRGV0ZWN0b3JSZWYsIHB1YmxpYyByZW5kZXJlcjogUmVuZGVyZXIyLFxyXG5cdFx0XHRwdWJsaWMgY29uZmlnOiBEeW5hbWljRGlhbG9nQ29uZmlnLCBwcml2YXRlIGRpYWxvZ1JlZjogRHluYW1pY0RpYWxvZ1JlZiwgcHVibGljIHpvbmU6IE5nWm9uZSkgeyB9XHJcblxyXG5cdG5nQWZ0ZXJWaWV3SW5pdCgpIHtcclxuXHRcdHRoaXMubG9hZENoaWxkQ29tcG9uZW50KHRoaXMuY2hpbGRDb21wb25lbnRUeXBlKTtcclxuXHRcdHRoaXMuY2QuZGV0ZWN0Q2hhbmdlcygpO1xyXG5cdH1cclxuXHJcblx0bG9hZENoaWxkQ29tcG9uZW50KGNvbXBvbmVudFR5cGU6IFR5cGU8YW55Pikge1xyXG5cdFx0bGV0IGNvbXBvbmVudEZhY3RvcnkgPSB0aGlzLmNvbXBvbmVudEZhY3RvcnlSZXNvbHZlci5yZXNvbHZlQ29tcG9uZW50RmFjdG9yeShjb21wb25lbnRUeXBlKTtcclxuXHJcblx0XHRsZXQgdmlld0NvbnRhaW5lclJlZiA9IHRoaXMuaW5zZXJ0aW9uUG9pbnQudmlld0NvbnRhaW5lclJlZjtcclxuXHRcdHZpZXdDb250YWluZXJSZWYuY2xlYXIoKTtcclxuXHJcblx0XHR0aGlzLmNvbXBvbmVudFJlZiA9IHZpZXdDb250YWluZXJSZWYuY3JlYXRlQ29tcG9uZW50KGNvbXBvbmVudEZhY3RvcnkpO1xyXG5cdH1cclxuXHJcblx0bW92ZU9uVG9wKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmNvbmZpZy5hdXRvWkluZGV4ICE9PSBmYWxzZSkge1xyXG5cdFx0XHRjb25zdCB6SW5kZXggPSAodGhpcy5jb25maWcuYmFzZVpJbmRleHx8MCkgKyAoKytEb21IYW5kbGVyLnppbmRleCk7XHJcblx0XHRcdHRoaXMuY29udGFpbmVyLnN0eWxlLnpJbmRleCA9IFN0cmluZyh6SW5kZXgpO1xyXG5cdFx0XHR0aGlzLm1hc2tWaWV3Q2hpbGQubmF0aXZlRWxlbWVudC5zdHlsZS56SW5kZXggPSBTdHJpbmcoekluZGV4IC0gMSk7XHJcblx0XHR9XHJcbiAgICB9XHJcblxyXG5cdG9uQW5pbWF0aW9uU3RhcnQoZXZlbnQ6IEFuaW1hdGlvbkV2ZW50KSB7XHJcblx0XHRzd2l0Y2goZXZlbnQudG9TdGF0ZSkge1xyXG5cdFx0XHRjYXNlICd2aXNpYmxlJzpcclxuICAgICAgICAgICAgICAgIHRoaXMuY29udGFpbmVyID0gZXZlbnQuZWxlbWVudDtcclxuICAgICAgICAgICAgICAgIHRoaXMud3JhcHBlciA9IHRoaXMuY29udGFpbmVyLnBhcmVudEVsZW1lbnQ7XHJcblx0XHRcdFx0dGhpcy5tb3ZlT25Ub3AoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYmluZEdsb2JhbExpc3RlbmVycygpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZy5tb2RhbCAhPT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVuYWJsZU1vZGFsaXR5KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZvY3VzKCk7XHJcblx0XHRcdGJyZWFrO1xyXG5cclxuXHRcdFx0Y2FzZSAndm9pZCc6XHJcblx0XHRcdFx0dGhpcy5vbkNvbnRhaW5lckRlc3Ryb3koKTtcclxuXHRcdFx0YnJlYWs7XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRvbkFuaW1hdGlvbkVuZChldmVudDogQW5pbWF0aW9uRXZlbnQpIHtcclxuXHRcdGlmIChldmVudC50b1N0YXRlID09PSAndm9pZCcpIHtcclxuXHRcdFx0dGhpcy5kaWFsb2dSZWYuZGVzdHJveSgpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0b25Db250YWluZXJEZXN0cm95KCkge1xyXG5cdFx0dGhpcy51bmJpbmRHbG9iYWxMaXN0ZW5lcnMoKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuY29uZmlnLm1vZGFsICE9PSBmYWxzZSkge1xyXG4gICAgICAgICAgICB0aGlzLmRpc2FibGVNb2RhbGl0eSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmNvbnRhaW5lciA9IG51bGw7XHJcblx0fVxyXG5cclxuXHRjbG9zZSgpIHtcclxuICAgICAgICB0aGlzLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmNkLm1hcmtGb3JDaGVjaygpO1xyXG5cdH1cclxuXHJcbiAgICBoaWRlKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmRpYWxvZ1JlZikge1xyXG4gICAgICAgICAgICB0aGlzLmRpYWxvZ1JlZi5jbG9zZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBlbmFibGVNb2RhbGl0eSgpIHtcclxuICAgICAgICBpZiAodGhpcy5jb25maWcuY2xvc2FibGUgIT09IGZhbHNlICYmIHRoaXMuY29uZmlnLmRpc21pc3NhYmxlTWFzaykge1xyXG4gICAgICAgICAgICB0aGlzLm1hc2tDbGlja0xpc3RlbmVyID0gdGhpcy5yZW5kZXJlci5saXN0ZW4odGhpcy53cmFwcGVyLCAnbW91c2Vkb3duJywgKGV2ZW50OiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLndyYXBwZXIgJiYgdGhpcy53cmFwcGVyLmlzU2FtZU5vZGUoZXZlbnQudGFyZ2V0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmNvbmZpZy5tb2RhbCAhPT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgRG9tSGFuZGxlci5hZGRDbGFzcyhkb2N1bWVudC5ib2R5LCAncC1vdmVyZmxvdy1oaWRkZW4nKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZGlzYWJsZU1vZGFsaXR5KCkge1xyXG4gICAgICAgIGlmICh0aGlzLndyYXBwZXIpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlnLmRpc21pc3NhYmxlTWFzaykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy51bmJpbmRNYXNrQ2xpY2tMaXN0ZW5lcigpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5jb25maWcubW9kYWwgIT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICBEb21IYW5kbGVyLnJlbW92ZUNsYXNzKGRvY3VtZW50LmJvZHksICdwLW92ZXJmbG93LWhpZGRlbicpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoISh0aGlzLmNkIGFzIFZpZXdSZWYpLmRlc3Ryb3llZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jZC5kZXRlY3RDaGFuZ2VzKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgb25LZXlkb3duKGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XHJcbiAgICAgICAgaWYgKGV2ZW50LndoaWNoID09PSA5KSB7XHJcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgICAgICAgICBsZXQgZm9jdXNhYmxlRWxlbWVudHMgPSBEb21IYW5kbGVyLmdldEZvY3VzYWJsZUVsZW1lbnRzKHRoaXMuY29udGFpbmVyKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChmb2N1c2FibGVFbGVtZW50cyAmJiBmb2N1c2FibGVFbGVtZW50cy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWZvY3VzYWJsZUVsZW1lbnRzWzBdLm93bmVyRG9jdW1lbnQuYWN0aXZlRWxlbWVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvY3VzYWJsZUVsZW1lbnRzWzBdLmZvY3VzKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgZm9jdXNlZEluZGV4ID0gZm9jdXNhYmxlRWxlbWVudHMuaW5kZXhPZihmb2N1c2FibGVFbGVtZW50c1swXS5vd25lckRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoZXZlbnQuc2hpZnRLZXkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZvY3VzZWRJbmRleCA9PSAtMSB8fCBmb2N1c2VkSW5kZXggPT09IDApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb2N1c2FibGVFbGVtZW50c1tmb2N1c2FibGVFbGVtZW50cy5sZW5ndGggLSAxXS5mb2N1cygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb2N1c2FibGVFbGVtZW50c1tmb2N1c2VkSW5kZXggLSAxXS5mb2N1cygpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZvY3VzZWRJbmRleCA9PSAtMSB8fCBmb2N1c2VkSW5kZXggPT09IChmb2N1c2FibGVFbGVtZW50cy5sZW5ndGggLSAxKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvY3VzYWJsZUVsZW1lbnRzWzBdLmZvY3VzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvY3VzYWJsZUVsZW1lbnRzW2ZvY3VzZWRJbmRleCArIDFdLmZvY3VzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZvY3VzKCkge1xyXG4gICAgICAgIGxldCBmb2N1c2FibGUgPSBEb21IYW5kbGVyLmZpbmRTaW5nbGUodGhpcy5jb250YWluZXIsICdbYXV0b2ZvY3VzXScpO1xyXG4gICAgICAgIGlmIChmb2N1c2FibGUpIHtcclxuICAgICAgICAgICAgdGhpcy56b25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gZm9jdXNhYmxlLmZvY3VzKCksIDUpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG5cdGJpbmRHbG9iYWxMaXN0ZW5lcnMoKSB7XHJcbiAgICAgICAgdGhpcy5iaW5kRG9jdW1lbnRLZXlkb3duTGlzdGVuZXIoKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuY29uZmlnLmNsb3NlT25Fc2NhcGUgIT09IGZhbHNlICYmIHRoaXMuY29uZmlnLmNsb3NhYmxlICE9PSBmYWxzZSkge1xyXG4gICAgICAgICAgICB0aGlzLmJpbmREb2N1bWVudEVzY2FwZUxpc3RlbmVyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHVuYmluZEdsb2JhbExpc3RlbmVycygpIHtcclxuICAgICAgICB0aGlzLnVuYmluZERvY3VtZW50S2V5ZG93bkxpc3RlbmVyKCk7XHJcbiAgICAgICAgdGhpcy51bmJpbmREb2N1bWVudEVzY2FwZUxpc3RlbmVyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgYmluZERvY3VtZW50S2V5ZG93bkxpc3RlbmVyKCkge1xyXG4gICAgICAgIHRoaXMuem9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuZG9jdW1lbnRLZXlkb3duTGlzdGVuZXIgPSB0aGlzLm9uS2V5ZG93bi5iaW5kKHRoaXMpO1xyXG4gICAgICAgICAgICB3aW5kb3cuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHRoaXMuZG9jdW1lbnRLZXlkb3duTGlzdGVuZXIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHVuYmluZERvY3VtZW50S2V5ZG93bkxpc3RlbmVyKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmRvY3VtZW50S2V5ZG93bkxpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgIHdpbmRvdy5kb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdGhpcy5kb2N1bWVudEtleWRvd25MaXN0ZW5lcik7XHJcbiAgICAgICAgICAgIHRoaXMuZG9jdW1lbnRLZXlkb3duTGlzdGVuZXIgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcblx0YmluZERvY3VtZW50RXNjYXBlTGlzdGVuZXIoKSB7XHJcbiAgICAgICAgY29uc3QgZG9jdW1lbnRUYXJnZXQ6IGFueSA9IHRoaXMubWFza1ZpZXdDaGlsZCA/IHRoaXMubWFza1ZpZXdDaGlsZC5uYXRpdmVFbGVtZW50Lm93bmVyRG9jdW1lbnQgOiAnZG9jdW1lbnQnO1xyXG5cclxuICAgICAgICB0aGlzLmRvY3VtZW50RXNjYXBlTGlzdGVuZXIgPSB0aGlzLnJlbmRlcmVyLmxpc3Rlbihkb2N1bWVudFRhcmdldCwgJ2tleWRvd24nLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgaWYgKGV2ZW50LndoaWNoID09IDI3KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocGFyc2VJbnQodGhpcy5jb250YWluZXIuc3R5bGUuekluZGV4KSA9PSAoRG9tSGFuZGxlci56aW5kZXggKyAodGhpcy5jb25maWcuYmFzZVpJbmRleCA/IHRoaXMuY29uZmlnLmJhc2VaSW5kZXggOiAwKSkpIHtcclxuXHRcdFx0XHRcdHRoaXMuaGlkZSgpO1xyXG5cdFx0XHRcdH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHVuYmluZERvY3VtZW50RXNjYXBlTGlzdGVuZXIoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZG9jdW1lbnRFc2NhcGVMaXN0ZW5lcikge1xyXG4gICAgICAgICAgICB0aGlzLmRvY3VtZW50RXNjYXBlTGlzdGVuZXIoKTtcclxuICAgICAgICAgICAgdGhpcy5kb2N1bWVudEVzY2FwZUxpc3RlbmVyID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdW5iaW5kTWFza0NsaWNrTGlzdGVuZXIoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMubWFza0NsaWNrTGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5tYXNrQ2xpY2tMaXN0ZW5lcigpO1xyXG4gICAgICAgICAgICB0aGlzLm1hc2tDbGlja0xpc3RlbmVyID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG5cdG5nT25EZXN0cm95KCkge1xyXG5cdFx0dGhpcy5vbkNvbnRhaW5lckRlc3Ryb3koKTtcclxuXHJcblx0XHRpZiAodGhpcy5jb21wb25lbnRSZWYpIHtcclxuXHRcdFx0dGhpcy5jb21wb25lbnRSZWYuZGVzdHJveSgpO1xyXG5cdFx0fVxyXG5cdH1cclxufVxyXG5cclxuQE5nTW9kdWxlKHtcclxuXHRpbXBvcnRzOiBbQ29tbW9uTW9kdWxlXSxcclxuXHRkZWNsYXJhdGlvbnM6IFtEeW5hbWljRGlhbG9nQ29tcG9uZW50LCBEeW5hbWljRGlhbG9nQ29udGVudF0sXHJcblx0ZW50cnlDb21wb25lbnRzOiBbRHluYW1pY0RpYWxvZ0NvbXBvbmVudF1cclxufSlcclxuZXhwb3J0IGNsYXNzIER5bmFtaWNEaWFsb2dNb2R1bGUgeyB9XHJcbiJdfQ==