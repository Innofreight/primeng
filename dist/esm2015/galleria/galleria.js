import { NgModule, Component, ElementRef, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChild, ContentChildren, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule, PrimeTemplate } from 'primeng/api';
import { UniqueComponentId } from 'primeng/utils';
import { DomHandler } from 'primeng/dom';
import { RippleModule } from 'primeng/ripple';
export class Galleria {
    constructor(element, cd) {
        this.element = element;
        this.cd = cd;
        this.fullScreen = false;
        this.numVisible = 3;
        this.showItemNavigators = false;
        this.showThumbnailNavigators = true;
        this.showItemNavigatorsOnHover = false;
        this.changeItemOnIndicatorHover = false;
        this.circular = false;
        this.autoPlay = false;
        this.transitionInterval = 4000;
        this.showThumbnails = true;
        this.thumbnailsPosition = "bottom";
        this.verticalThumbnailViewPortHeight = "300px";
        this.showIndicators = false;
        this.showIndicatorsOnItem = false;
        this.indicatorsPosition = "bottom";
        this.baseZIndex = 0;
        this.activeIndexChange = new EventEmitter();
        this.visibleChange = new EventEmitter();
        this._visible = false;
        this._activeIndex = 0;
    }
    get activeIndex() {
        return this._activeIndex;
    }
    ;
    set activeIndex(activeIndex) {
        this._activeIndex = activeIndex;
    }
    get visible() {
        return this._visible;
    }
    ;
    set visible(visible) {
        this._visible = visible;
    }
    ngAfterContentInit() {
        this.templates.forEach((item) => {
            switch (item.getType()) {
                case 'header':
                    this.headerFacet = item.template;
                    break;
                case 'footer':
                    this.footerFacet = item.template;
                    break;
                case 'indicator':
                    this.indicatorFacet = item.template;
                    break;
                case 'caption':
                    this.captionFacet = item.template;
                    break;
            }
        });
    }
    ngOnChanges(simpleChanges) {
        if (this.fullScreen && simpleChanges.visible) {
            if (simpleChanges.visible.currentValue) {
                DomHandler.addClass(document.body, 'p-overflow-hidden');
                this.zIndex = String(this.baseZIndex + ++DomHandler.zindex);
            }
            else {
                DomHandler.removeClass(document.body, 'p-overflow-hidden');
            }
        }
    }
    onMaskHide() {
        this.visible = false;
        this.visibleChange.emit(false);
    }
    onActiveItemChange(index) {
        if (this.activeIndex !== index) {
            this.activeIndex = index;
            this.activeIndexChange.emit(index);
        }
    }
    ngOnDestroy() {
        if (this.fullScreen) {
            DomHandler.removeClass(document.body, 'p-overflow-hidden');
        }
    }
}
Galleria.decorators = [
    { type: Component, args: [{
                selector: 'p-galleria',
                template: `
        <div *ngIf="fullScreen;else windowed">
            <div *ngIf="visible" #mask [ngClass]="{'p-galleria-mask p-component-overlay':true, 'p-galleria-visible': this.visible}" [class]="maskClass" [ngStyle]="{'zIndex':zIndex}">
                <p-galleriaContent [value]="value" [activeIndex]="activeIndex" (maskHide)="onMaskHide()" (activeItemChange)="onActiveItemChange($event)" [ngStyle]="containerStyle"></p-galleriaContent>
            </div>
        </div>

        <ng-template #windowed>
            <p-galleriaContent [value]="value" [activeIndex]="activeIndex" (activeItemChange)="onActiveItemChange($event)"></p-galleriaContent>
        </ng-template>
    `,
                changeDetection: ChangeDetectionStrategy.OnPush,
                encapsulation: ViewEncapsulation.None,
                styles: [".p-galleria-content,.p-galleria-item-wrapper{display:flex;flex-direction:column}.p-galleria-item-wrapper{position:relative}.p-galleria-item-container{display:flex;height:100%;position:relative}.p-galleria-item-nav{align-items:center;display:inline-flex;justify-content:center;margin-top:-.5rem;overflow:hidden;position:absolute;top:50%}.p-galleria-item-prev{border-bottom-left-radius:0;border-top-left-radius:0;left:0}.p-galleria-item-next{border-bottom-right-radius:0;border-top-right-radius:0;right:0}.p-galleria-item{align-items:center;display:flex;height:100%;justify-content:center;width:100%}.p-galleria-item-nav-onhover .p-galleria-item-nav{opacity:0;pointer-events:none;transition:opacity .2s ease-in-out}.p-galleria-item-nav-onhover .p-galleria-item-wrapper:hover .p-galleria-item-nav{opacity:1;pointer-events:all}.p-galleria-item-nav-onhover .p-galleria-item-wrapper:hover .p-galleria-item-nav.p-disabled{pointer-events:none}.p-galleria-caption{bottom:0;left:0;position:absolute;width:100%}.p-galleria-thumbnail-wrapper{display:flex;flex-direction:column;flex-shrink:0;overflow:auto}.p-galleria-thumbnail-next,.p-galleria-thumbnail-prev{-ms-grid-row-align:center;align-self:center;flex:0 0 auto;overflow:hidden;position:relative}.p-galleria-thumbnail-next,.p-galleria-thumbnail-next span,.p-galleria-thumbnail-prev,.p-galleria-thumbnail-prev span{align-items:center;display:flex;justify-content:center}.p-galleria-thumbnail-container{display:flex;flex-direction:row}.p-galleria-thumbnail-items-container{overflow:hidden}.p-galleria-thumbnail-items{display:flex}.p-galleria-thumbnail-item{align-items:center;cursor:pointer;display:flex;justify-content:center;opacity:.5;overflow:auto}.p-galleria-thumbnail-item:hover{opacity:1;transition:opacity .3s}.p-galleria-thumbnail-item-current{opacity:1}.p-galleria-thumbnails-left .p-galleria-content,.p-galleria-thumbnails-left .p-galleria-item-wrapper,.p-galleria-thumbnails-right .p-galleria-content,.p-galleria-thumbnails-right .p-galleria-item-wrapper{flex-direction:row}.p-galleria-thumbnails-left p-galleriaitem,.p-galleria-thumbnails-top p-galleriaitem{order:2}.p-galleria-thumbnails-left p-galleriathumbnails,.p-galleria-thumbnails-top p-galleriathumbnails{order:1}.p-galleria-thumbnails-left .p-galleria-thumbnail-container,.p-galleria-thumbnails-right .p-galleria-thumbnail-container{flex-direction:column;flex-grow:1}.p-galleria-thumbnails-left .p-galleria-thumbnail-items,.p-galleria-thumbnails-right .p-galleria-thumbnail-items{flex-direction:column;height:100%}.p-galleria-thumbnails-left .p-galleria-thumbnail-wrapper,.p-galleria-thumbnails-right .p-galleria-thumbnail-wrapper{height:100%}.p-galleria-indicators{align-items:center;display:flex;justify-content:center}.p-galleria-indicator>button{align-items:center;display:inline-flex}.p-galleria-indicators-left .p-galleria-item-wrapper,.p-galleria-indicators-right .p-galleria-item-wrapper{align-items:center;flex-direction:row}.p-galleria-indicators-left .p-galleria-item-container,.p-galleria-indicators-top .p-galleria-item-container{order:2}.p-galleria-indicators-left .p-galleria-indicators,.p-galleria-indicators-top .p-galleria-indicators{order:1}.p-galleria-indicators-left .p-galleria-indicators,.p-galleria-indicators-right .p-galleria-indicators{flex-direction:column}.p-galleria-indicator-onitem .p-galleria-indicators{display:flex;position:absolute;z-index:1}.p-galleria-indicator-onitem.p-galleria-indicators-top .p-galleria-indicators{align-items:flex-start;left:0;top:0;width:100%}.p-galleria-indicator-onitem.p-galleria-indicators-right .p-galleria-indicators{align-items:flex-end;height:100%;right:0;top:0}.p-galleria-indicator-onitem.p-galleria-indicators-bottom .p-galleria-indicators{align-items:flex-end;bottom:0;left:0;width:100%}.p-galleria-indicator-onitem.p-galleria-indicators-left .p-galleria-indicators{align-items:flex-start;height:100%;left:0;top:0}.p-galleria-mask{background-color:transparent;height:100%;left:0;position:fixed;transition-property:background-color;width:100%}.p-galleria-close,.p-galleria-mask{align-items:center;display:flex;justify-content:center;top:0}.p-galleria-close{overflow:hidden;position:absolute;right:0}.p-galleria-mask .p-galleria-item-nav{margin-top:-.5rem;position:fixed;top:50%}.p-galleria-mask.p-galleria-mask-leave{background-color:transparent}.p-items-hidden .p-galleria-thumbnail-item{visibility:hidden}.p-items-hidden .p-galleria-thumbnail-item.p-galleria-thumbnail-item-active{visibility:visible}"]
            },] }
];
Galleria.ctorParameters = () => [
    { type: ElementRef },
    { type: ChangeDetectorRef }
];
Galleria.propDecorators = {
    activeIndex: [{ type: Input }],
    fullScreen: [{ type: Input }],
    id: [{ type: Input }],
    value: [{ type: Input }],
    numVisible: [{ type: Input }],
    responsiveOptions: [{ type: Input }],
    showItemNavigators: [{ type: Input }],
    showThumbnailNavigators: [{ type: Input }],
    showItemNavigatorsOnHover: [{ type: Input }],
    changeItemOnIndicatorHover: [{ type: Input }],
    circular: [{ type: Input }],
    autoPlay: [{ type: Input }],
    transitionInterval: [{ type: Input }],
    showThumbnails: [{ type: Input }],
    thumbnailsPosition: [{ type: Input }],
    verticalThumbnailViewPortHeight: [{ type: Input }],
    showIndicators: [{ type: Input }],
    showIndicatorsOnItem: [{ type: Input }],
    indicatorsPosition: [{ type: Input }],
    baseZIndex: [{ type: Input }],
    maskClass: [{ type: Input }],
    containerClass: [{ type: Input }],
    containerStyle: [{ type: Input }],
    mask: [{ type: ViewChild, args: ['mask', { static: false },] }],
    visible: [{ type: Input }],
    activeIndexChange: [{ type: Output }],
    visibleChange: [{ type: Output }],
    templates: [{ type: ContentChildren, args: [PrimeTemplate,] }]
};
export class GalleriaContent {
    constructor(galleria, cd) {
        this.galleria = galleria;
        this.cd = cd;
        this.value = [];
        this.maskHide = new EventEmitter();
        this.activeItemChange = new EventEmitter();
        this.id = this.galleria.id || UniqueComponentId();
        this.slideShowActicve = false;
        this._activeIndex = 0;
        this.slideShowActive = true;
    }
    get activeIndex() {
        return this._activeIndex;
    }
    ;
    set activeIndex(activeIndex) {
        this._activeIndex = activeIndex;
    }
    galleriaClass() {
        const thumbnailsPosClass = this.galleria.showThumbnails && this.getPositionClass('p-galleria-thumbnails', this.galleria.thumbnailsPosition);
        const indicatorPosClass = this.galleria.showIndicators && this.getPositionClass('p-galleria-indicators', this.galleria.indicatorsPosition);
        return (this.galleria.containerClass ? this.galleria.containerClass + " " : '') + (thumbnailsPosClass ? thumbnailsPosClass + " " : '') + (indicatorPosClass ? indicatorPosClass + " " : '');
    }
    startSlideShow() {
        this.interval = setInterval(() => {
            let activeIndex = (this.galleria.circular && (this.value.length - 1) === this.activeIndex) ? 0 : (this.activeIndex + 1);
            this.onActiveIndexChange(activeIndex);
            this.activeIndex = activeIndex;
        }, this.galleria.transitionInterval);
        this.slideShowActive = true;
    }
    stopSlideShow() {
        if (this.interval) {
            clearInterval(this.interval);
        }
        this.slideShowActive = false;
    }
    getPositionClass(preClassName, position) {
        const positions = ['top', 'left', 'bottom', 'right'];
        const pos = positions.find(item => item === position);
        return pos ? `${preClassName}-${pos}` : '';
    }
    isVertical() {
        return this.galleria.thumbnailsPosition === 'left' || this.galleria.thumbnailsPosition === 'right';
    }
    onActiveIndexChange(index) {
        if (this.activeIndex !== index) {
            this.activeIndex = index;
            this.activeItemChange.emit(this.activeIndex);
        }
    }
}
GalleriaContent.decorators = [
    { type: Component, args: [{
                selector: 'p-galleriaContent',
                template: `
        <div [attr.id]="id" *ngIf="value && value.length > 0" [ngClass]="{'p-galleria p-component': true, 'p-galleria-fullscreen': this.galleria.fullScreen, 
            'p-galleria-indicator-onitem': this.galleria.showIndicatorsOnItem, 'p-galleria-item-nav-onhover': this.galleria.showItemNavigatorsOnHover && !this.galleria.fullScreen}"
            [ngStyle]="!galleria.fullScreen ? galleria.containerStyle : {}" [class]="galleriaClass()">
            <button *ngIf="galleria.fullScreen" type="button" class="p-galleria-close p-link" (click)="maskHide.emit()" pRipple>
                <span class="p-galleria-close-icon pi pi-times"></span>
            </button>
            <div *ngIf="galleria.templates && galleria.headerFacet" class="p-galleria-header">
                <p-galleriaItemSlot type="header" [templates]="galleria.templates"></p-galleriaItemSlot>
            </div>
            <div class="p-galleria-content">
                <p-galleriaItem [value]="value" [activeIndex]="activeIndex" [circular]="galleria.circular" [templates]="galleria.templates" (onActiveIndexChange)="onActiveIndexChange($event)" 
                    [showIndicators]="galleria.showIndicators" [changeItemOnIndicatorHover]="galleria.changeItemOnIndicatorHover" [indicatorFacet]="galleria.indicatorFacet"
                    [captionFacet]="galleria.captionFacet" [showItemNavigators]="galleria.showItemNavigators" [autoPlay]="galleria.autoPlay" [slideShowActive]="slideShowActive"
                    (startSlideShow)="startSlideShow()" (stopSlideShow)="stopSlideShow()"></p-galleriaItem>

                <p-galleriaThumbnails *ngIf="galleria.showThumbnails" [containerId]="id" [value]="value" (onActiveIndexChange)="onActiveIndexChange($event)" [activeIndex]="activeIndex" [templates]="galleria.templates"
                    [numVisible]="galleria.numVisible" [responsiveOptions]="galleria.responsiveOptions" [circular]="galleria.circular"
                    [isVertical]="isVertical()" [contentHeight]="galleria.verticalThumbnailViewPortHeight" [showThumbnailNavigators]="galleria.showThumbnailNavigators"
                    [slideShowActive]="slideShowActive" (stopSlideShow)="stopSlideShow()"></p-galleriaThumbnails>
            </div>
            <div *ngIf="galleria.templates && galleria.footerFacet" class="p-galleria-footer">
                <p-galleriaItemSlot type="footer" [templates]="galleria.templates"></p-galleriaItemSlot>
            </div>
        </div>
    `,
                changeDetection: ChangeDetectionStrategy.OnPush
            },] }
];
GalleriaContent.ctorParameters = () => [
    { type: Galleria },
    { type: ChangeDetectorRef }
];
GalleriaContent.propDecorators = {
    activeIndex: [{ type: Input }],
    value: [{ type: Input }],
    maskHide: [{ type: Output }],
    activeItemChange: [{ type: Output }]
};
export class GalleriaItemSlot {
    get item() {
        return this._item;
    }
    ;
    set item(item) {
        this._item = item;
        if (this.templates) {
            this.templates.forEach((item) => {
                if (item.getType() === this.type) {
                    switch (this.type) {
                        case 'item':
                        case 'caption':
                        case 'thumbnail':
                            this.context = { $implicit: this.item };
                            this.contentTemplate = item.template;
                            break;
                    }
                }
            });
        }
    }
    ngAfterContentInit() {
        this.templates.forEach((item) => {
            if (item.getType() === this.type) {
                switch (this.type) {
                    case 'item':
                    case 'caption':
                    case 'thumbnail':
                        this.context = { $implicit: this.item };
                        this.contentTemplate = item.template;
                        break;
                    case 'indicator':
                        this.context = { $implicit: this.index };
                        this.contentTemplate = item.template;
                        break;
                    default:
                        this.context = {};
                        this.contentTemplate = item.template;
                        break;
                }
            }
        });
    }
}
GalleriaItemSlot.decorators = [
    { type: Component, args: [{
                selector: 'p-galleriaItemSlot',
                template: `
        <ng-container *ngIf="contentTemplate">
            <ng-container *ngTemplateOutlet="contentTemplate; context: context"></ng-container>
        </ng-container>
    `,
                changeDetection: ChangeDetectionStrategy.OnPush
            },] }
];
GalleriaItemSlot.propDecorators = {
    templates: [{ type: Input }],
    index: [{ type: Input }],
    item: [{ type: Input }],
    type: [{ type: Input }]
};
export class GalleriaItem {
    constructor() {
        this.circular = false;
        this.showItemNavigators = false;
        this.showIndicators = true;
        this.slideShowActive = true;
        this.changeItemOnIndicatorHover = true;
        this.autoPlay = false;
        this.startSlideShow = new EventEmitter();
        this.stopSlideShow = new EventEmitter();
        this.onActiveIndexChange = new EventEmitter();
        this._activeIndex = 0;
    }
    get activeIndex() {
        return this._activeIndex;
    }
    ;
    set activeIndex(activeIndex) {
        this._activeIndex = activeIndex;
        this.activeItem = this.value[this._activeIndex];
    }
    ngOnInit() {
        if (this.autoPlay) {
            this.startSlideShow.emit();
        }
    }
    next() {
        let nextItemIndex = this.activeIndex + 1;
        let activeIndex = this.circular && this.value.length - 1 === this.activeIndex
            ? 0
            : nextItemIndex;
        this.onActiveIndexChange.emit(activeIndex);
    }
    prev() {
        let prevItemIndex = this.activeIndex !== 0 ? this.activeIndex - 1 : 0;
        let activeIndex = this.circular && this.activeIndex === 0
            ? this.value.length - 1
            : prevItemIndex;
        this.onActiveIndexChange.emit(activeIndex);
    }
    stopTheSlideShow() {
        if (this.slideShowActive && this.stopSlideShow) {
            this.stopSlideShow.emit();
        }
    }
    navForward(e) {
        this.stopTheSlideShow();
        this.next();
        if (e && e.cancelable) {
            e.preventDefault();
        }
    }
    navBackward(e) {
        this.stopTheSlideShow();
        this.prev();
        if (e && e.cancelable) {
            e.preventDefault();
        }
    }
    onIndicatorClick(index) {
        this.stopTheSlideShow();
        this.onActiveIndexChange.emit(index);
    }
    onIndicatorMouseEnter(index) {
        if (this.changeItemOnIndicatorHover) {
            this.stopTheSlideShow();
            this.onActiveIndexChange.emit(index);
        }
    }
    onIndicatorKeyDown(index) {
        this.stopTheSlideShow();
        this.onActiveIndexChange.emit(index);
    }
    isNavForwardDisabled() {
        return !this.circular && this.activeIndex === (this.value.length - 1);
    }
    isNavBackwardDisabled() {
        return !this.circular && this.activeIndex === 0;
    }
    isIndicatorItemActive(index) {
        return this.activeIndex === index;
    }
}
GalleriaItem.decorators = [
    { type: Component, args: [{
                selector: 'p-galleriaItem',
                template: `
        <div class="p-galleria-item-wrapper">
            <div class="p-galleria-item-container">
                <button *ngIf="showItemNavigators" type="button" [ngClass]="{'p-galleria-item-prev p-galleria-item-nav p-link': true, 'p-disabled': this.isNavBackwardDisabled()}" (click)="navBackward($event)" [disabled]="isNavBackwardDisabled()" pRipple>
                    <span class="p-galleria-item-prev-icon pi pi-chevron-left"></span>
                </button>
                <p-galleriaItemSlot type="item" [item]="activeItem" [templates]="templates" class="p-galleria-item"></p-galleriaItemSlot>
                <button *ngIf="showItemNavigators" type="button" [ngClass]="{'p-galleria-item-next p-galleria-item-nav p-link': true,'p-disabled': this.isNavForwardDisabled()}" (click)="navForward($event)"  [disabled]="isNavForwardDisabled()" pRipple>
                    <span class="p-galleria-item-next-icon pi pi-chevron-right"></span>
                </button>
                <div class="p-galleria-caption" *ngIf="captionFacet">
                    <p-galleriaItemSlot type="caption" [item]="activeItem" [templates]="templates"></p-galleriaItemSlot>
                </div>
            </div>
            <ul *ngIf="showIndicators" class="p-galleria-indicators p-reset">
                <li *ngFor="let item of value; let index = index;" tabindex="0"
                    (click)="onIndicatorClick(index)" (mouseenter)="onIndicatorMouseEnter(index)" (keydown.enter)="onIndicatorKeyDown(index)"
                    [ngClass]="{'p-galleria-indicator': true,'p-highlight': isIndicatorItemActive(index)}">
                    <button type="button" tabIndex="-1" class="p-link" *ngIf="!indicatorFacet">
                    </button>
                    <p-galleriaItemSlot type="indicator" [index]="index" [templates]="templates"></p-galleriaItemSlot>
                </li>
            </ul>
        </div>
    `,
                changeDetection: ChangeDetectionStrategy.OnPush
            },] }
];
GalleriaItem.propDecorators = {
    circular: [{ type: Input }],
    value: [{ type: Input }],
    showItemNavigators: [{ type: Input }],
    showIndicators: [{ type: Input }],
    slideShowActive: [{ type: Input }],
    changeItemOnIndicatorHover: [{ type: Input }],
    autoPlay: [{ type: Input }],
    templates: [{ type: Input }],
    indicatorFacet: [{ type: Input }],
    captionFacet: [{ type: Input }],
    startSlideShow: [{ type: Output }],
    stopSlideShow: [{ type: Output }],
    onActiveIndexChange: [{ type: Output }],
    activeIndex: [{ type: Input }]
};
export class GalleriaThumbnails {
    constructor(cd) {
        this.cd = cd;
        this.isVertical = false;
        this.slideShowActive = false;
        this.circular = false;
        this.contentHeight = "300px";
        this.showThumbnailNavigators = true;
        this.onActiveIndexChange = new EventEmitter();
        this.stopSlideShow = new EventEmitter();
        this.startPos = null;
        this.thumbnailsStyle = null;
        this.sortedResponsiveOptions = null;
        this.totalShiftedItems = 0;
        this.page = 0;
        this._numVisible = 0;
        this.d_numVisible = 0;
        this._oldNumVisible = 0;
        this._activeIndex = 0;
        this._oldactiveIndex = 0;
    }
    get numVisible() {
        return this._numVisible;
    }
    ;
    set numVisible(numVisible) {
        this._numVisible = numVisible;
        this._oldNumVisible = this.d_numVisible;
        this.d_numVisible = numVisible;
    }
    get activeIndex() {
        return this._activeIndex;
    }
    ;
    set activeIndex(activeIndex) {
        this._oldactiveIndex = this._activeIndex;
        this._activeIndex = activeIndex;
    }
    ngOnInit() {
        this.createStyle();
        if (this.responsiveOptions) {
            this.bindDocumentListeners();
        }
    }
    ngAfterContentChecked() {
        let totalShiftedItems = this.totalShiftedItems;
        if ((this._oldNumVisible !== this.d_numVisible || this._oldactiveIndex !== this._activeIndex) && this.itemsContainer) {
            if (this._activeIndex <= this.getMedianItemIndex()) {
                totalShiftedItems = 0;
            }
            else if (this.value.length - this.d_numVisible + this.getMedianItemIndex() < this._activeIndex) {
                totalShiftedItems = this.d_numVisible - this.value.length;
            }
            else if (this.value.length - this.d_numVisible < this._activeIndex && this.d_numVisible % 2 === 0) {
                totalShiftedItems = (this._activeIndex * -1) + this.getMedianItemIndex() + 1;
            }
            else {
                totalShiftedItems = (this._activeIndex * -1) + this.getMedianItemIndex();
            }
            if (totalShiftedItems !== this.totalShiftedItems) {
                this.totalShiftedItems = totalShiftedItems;
            }
            if (this.itemsContainer && this.itemsContainer.nativeElement) {
                this.itemsContainer.nativeElement.style.transform = this.isVertical ? `translate3d(0, ${totalShiftedItems * (100 / this.d_numVisible)}%, 0)` : `translate3d(${totalShiftedItems * (100 / this.d_numVisible)}%, 0, 0)`;
            }
            if (this._oldactiveIndex !== this._activeIndex) {
                DomHandler.removeClass(this.itemsContainer.nativeElement, 'p-items-hidden');
                this.itemsContainer.nativeElement.style.transition = 'transform 500ms ease 0s';
            }
            this._oldactiveIndex = this._activeIndex;
            this._oldNumVisible = this.d_numVisible;
        }
    }
    ngAfterViewInit() {
        this.calculatePosition();
    }
    createStyle() {
        if (!this.thumbnailsStyle) {
            this.thumbnailsStyle = document.createElement('style');
            this.thumbnailsStyle.type = 'text/css';
            document.body.appendChild(this.thumbnailsStyle);
        }
        let innerHTML = `
            #${this.containerId} .p-galleria-thumbnail-item {
                flex: 1 0 ${(100 / this.d_numVisible)}%
            }
        `;
        if (this.responsiveOptions) {
            this.sortedResponsiveOptions = [...this.responsiveOptions];
            this.sortedResponsiveOptions.sort((data1, data2) => {
                const value1 = data1.breakpoint;
                const value2 = data2.breakpoint;
                let result = null;
                if (value1 == null && value2 != null)
                    result = -1;
                else if (value1 != null && value2 == null)
                    result = 1;
                else if (value1 == null && value2 == null)
                    result = 0;
                else if (typeof value1 === 'string' && typeof value2 === 'string')
                    result = value1.localeCompare(value2, undefined, { numeric: true });
                else
                    result = (value1 < value2) ? -1 : (value1 > value2) ? 1 : 0;
                return -1 * result;
            });
            for (let i = 0; i < this.sortedResponsiveOptions.length; i++) {
                let res = this.sortedResponsiveOptions[i];
                innerHTML += `
                    @media screen and (max-width: ${res.breakpoint}) {
                        #${this.containerId} .p-galleria-thumbnail-item {
                            flex: 1 0 ${(100 / res.numVisible)}%
                        }
                    }
                `;
            }
        }
        this.thumbnailsStyle.innerHTML = innerHTML;
    }
    calculatePosition() {
        if (this.itemsContainer && this.sortedResponsiveOptions) {
            let windowWidth = window.innerWidth;
            let matchedResponsiveData = {
                numVisible: this._numVisible
            };
            for (let i = 0; i < this.sortedResponsiveOptions.length; i++) {
                let res = this.sortedResponsiveOptions[i];
                if (parseInt(res.breakpoint, 10) >= windowWidth) {
                    matchedResponsiveData = res;
                }
            }
            if (this.d_numVisible !== matchedResponsiveData.numVisible) {
                this.d_numVisible = matchedResponsiveData.numVisible;
                this.cd.markForCheck();
            }
        }
    }
    getTabIndex(index) {
        return this.isItemActive(index) ? 0 : null;
    }
    navForward(e) {
        this.stopTheSlideShow();
        let nextItemIndex = this._activeIndex + 1;
        if (nextItemIndex + this.totalShiftedItems > this.getMedianItemIndex() && ((-1 * this.totalShiftedItems) < this.getTotalPageNumber() - 1 || this.circular)) {
            this.step(-1);
        }
        let activeIndex = this.circular && (this.value.length - 1) === this._activeIndex ? 0 : nextItemIndex;
        this.onActiveIndexChange.emit(activeIndex);
        if (e.cancelable) {
            e.preventDefault();
        }
    }
    navBackward(e) {
        this.stopTheSlideShow();
        let prevItemIndex = this._activeIndex !== 0 ? this._activeIndex - 1 : 0;
        let diff = prevItemIndex + this.totalShiftedItems;
        if ((this.d_numVisible - diff - 1) > this.getMedianItemIndex() && ((-1 * this.totalShiftedItems) !== 0 || this.circular)) {
            this.step(1);
        }
        let activeIndex = this.circular && this._activeIndex === 0 ? this.value.length - 1 : prevItemIndex;
        this.onActiveIndexChange.emit(activeIndex);
        if (e.cancelable) {
            e.preventDefault();
        }
    }
    onItemClick(index) {
        this.stopTheSlideShow();
        let selectedItemIndex = index;
        if (selectedItemIndex !== this._activeIndex) {
            const diff = selectedItemIndex + this.totalShiftedItems;
            let dir = 0;
            if (selectedItemIndex < this._activeIndex) {
                dir = (this.d_numVisible - diff - 1) - this.getMedianItemIndex();
                if (dir > 0 && (-1 * this.totalShiftedItems) !== 0) {
                    this.step(dir);
                }
            }
            else {
                dir = this.getMedianItemIndex() - diff;
                if (dir < 0 && (-1 * this.totalShiftedItems) < this.getTotalPageNumber() - 1) {
                    this.step(dir);
                }
            }
            this.activeIndex = selectedItemIndex;
            this.onActiveIndexChange.emit(this.activeIndex);
        }
    }
    step(dir) {
        let totalShiftedItems = this.totalShiftedItems + dir;
        if (dir < 0 && (-1 * totalShiftedItems) + this.d_numVisible > (this.value.length - 1)) {
            totalShiftedItems = this.d_numVisible - this.value.length;
        }
        else if (dir > 0 && totalShiftedItems > 0) {
            totalShiftedItems = 0;
        }
        if (this.circular) {
            if (dir < 0 && this.value.length - 1 === this._activeIndex) {
                totalShiftedItems = 0;
            }
            else if (dir > 0 && this._activeIndex === 0) {
                totalShiftedItems = this.d_numVisible - this.value.length;
            }
        }
        if (this.itemsContainer) {
            DomHandler.removeClass(this.itemsContainer.nativeElement, 'p-items-hidden');
            this.itemsContainer.nativeElement.style.transform = this.isVertical ? `translate3d(0, ${totalShiftedItems * (100 / this.d_numVisible)}%, 0)` : `translate3d(${totalShiftedItems * (100 / this.d_numVisible)}%, 0, 0)`;
            this.itemsContainer.nativeElement.style.transition = 'transform 500ms ease 0s';
        }
        this.totalShiftedItems = totalShiftedItems;
    }
    stopTheSlideShow() {
        if (this.slideShowActive && this.stopSlideShow) {
            this.stopSlideShow.emit();
        }
    }
    changePageOnTouch(e, diff) {
        if (diff < 0) { // left
            this.navForward(e);
        }
        else { // right
            this.navBackward(e);
        }
    }
    getTotalPageNumber() {
        return this.value.length > this.d_numVisible ? (this.value.length - this.d_numVisible) + 1 : 0;
    }
    getMedianItemIndex() {
        let index = Math.floor(this.d_numVisible / 2);
        return (this.d_numVisible % 2) ? index : index - 1;
    }
    onTransitionEnd() {
        if (this.itemsContainer && this.itemsContainer.nativeElement) {
            DomHandler.addClass(this.itemsContainer.nativeElement, 'p-items-hidden');
            this.itemsContainer.nativeElement.style.transition = '';
        }
    }
    onTouchEnd(e) {
        let touchobj = e.changedTouches[0];
        if (this.isVertical) {
            this.changePageOnTouch(e, (touchobj.pageY - this.startPos.y));
        }
        else {
            this.changePageOnTouch(e, (touchobj.pageX - this.startPos.x));
        }
    }
    onTouchMove(e) {
        if (e.cancelable) {
            e.preventDefault();
        }
    }
    onTouchStart(e) {
        let touchobj = e.changedTouches[0];
        this.startPos = {
            x: touchobj.pageX,
            y: touchobj.pageY
        };
    }
    isNavBackwardDisabled() {
        return (!this.circular && this._activeIndex === 0) || (this.value.length <= this.d_numVisible);
    }
    isNavForwardDisabled() {
        return (!this.circular && this._activeIndex === (this.value.length - 1)) || (this.value.length <= this.d_numVisible);
    }
    firstItemAciveIndex() {
        return this.totalShiftedItems * -1;
    }
    lastItemActiveIndex() {
        return this.firstItemAciveIndex() + this.d_numVisible - 1;
    }
    isItemActive(index) {
        return this.firstItemAciveIndex() <= index && this.lastItemActiveIndex() >= index;
    }
    bindDocumentListeners() {
        if (!this.documentResizeListener) {
            this.documentResizeListener = () => {
                this.calculatePosition();
            };
            window.addEventListener('resize', this.documentResizeListener);
        }
    }
    unbindDocumentListeners() {
        if (this.documentResizeListener) {
            window.removeEventListener('resize', this.documentResizeListener);
            this.documentResizeListener = null;
        }
    }
    ngOnDestroy() {
        if (this.responsiveOptions) {
            this.unbindDocumentListeners();
        }
        if (this.thumbnailsStyle) {
            this.thumbnailsStyle.parentNode.removeChild(this.thumbnailsStyle);
        }
    }
}
GalleriaThumbnails.decorators = [
    { type: Component, args: [{
                selector: 'p-galleriaThumbnails',
                template: `
        <div class="p-galleria-thumbnail-wrapper">
            <div class="p-galleria-thumbnail-container">
                <button *ngIf="showThumbnailNavigators" type="button" [ngClass]="{'p-galleria-thumbnail-prev p-link': true, 'p-disabled': this.isNavBackwardDisabled()}" (click)="navBackward($event)" [disabled]="isNavBackwardDisabled()" pRipple>
                    <span [ngClass]="{'p-galleria-thumbnail-prev-icon pi': true, 'pi-chevron-left': !this.isVertical, 'pi-chevron-up': this.isVertical}"></span>
                </button>
                <div class="p-galleria-thumbnail-items-container" [ngStyle]="{'height': isVertical ? contentHeight : ''}">
                    <div #itemsContainer class="p-galleria-thumbnail-items" (transitionend)="onTransitionEnd()"
                        (touchstart)="onTouchStart($event)" (touchmove)="onTouchMove($event)" (touchend)="onTouchEnd($event)">
                        <div *ngFor="let item of value; let index = index;" [ngClass]="{'p-galleria-thumbnail-item': true, 'p-galleria-thumbnail-item-current': activeIndex === index, 'p-galleria-thumbnail-item-active': isItemActive(index),
                            'p-galleria-thumbnail-item-start': firstItemAciveIndex() === index, 'p-galleria-thumbnail-item-end': lastItemActiveIndex() === index }">
                            <div class="p-galleria-thumbnail-item-content" [attr.tabindex]="getTabIndex(index)" (click)="onItemClick(index)" (keydown.enter)="onItemClick(index)">
                                <p-galleriaItemSlot type="thumbnail" [item]="item" [templates]="templates"></p-galleriaItemSlot>
                            </div>
                        </div>
                    </div>
                </div>
                <button *ngIf="showThumbnailNavigators" type="button" [ngClass]="{'p-galleria-thumbnail-next p-link': true, 'p-disabled': this.isNavForwardDisabled()}" (click)="navForward($event)" [disabled]="isNavForwardDisabled()" pRipple>
                    <span [ngClass]="{'p-galleria-thumbnail-next-icon pi': true, 'pi-chevron-right': !this.isVertical, 'pi-chevron-down': this.isVertical}"></span>
                </button>
            </div>
        </div>
    `,
                changeDetection: ChangeDetectionStrategy.OnPush
            },] }
];
GalleriaThumbnails.ctorParameters = () => [
    { type: ChangeDetectorRef }
];
GalleriaThumbnails.propDecorators = {
    containerId: [{ type: Input }],
    value: [{ type: Input }],
    isVertical: [{ type: Input }],
    slideShowActive: [{ type: Input }],
    circular: [{ type: Input }],
    responsiveOptions: [{ type: Input }],
    contentHeight: [{ type: Input }],
    showThumbnailNavigators: [{ type: Input }],
    templates: [{ type: Input }],
    onActiveIndexChange: [{ type: Output }],
    stopSlideShow: [{ type: Output }],
    itemsContainer: [{ type: ViewChild, args: ['itemsContainer',] }],
    numVisible: [{ type: Input }],
    activeIndex: [{ type: Input }]
};
export class GalleriaModule {
}
GalleriaModule.decorators = [
    { type: NgModule, args: [{
                imports: [CommonModule, SharedModule, RippleModule],
                exports: [CommonModule, Galleria, GalleriaContent, GalleriaItemSlot, GalleriaItem, GalleriaThumbnails, SharedModule],
                declarations: [Galleria, GalleriaContent, GalleriaItemSlot, GalleriaItem, GalleriaThumbnails]
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2FsbGVyaWEuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4vc3JjL2FwcC9jb21wb25lbnRzL2dhbGxlcmlhLyIsInNvdXJjZXMiOlsiZ2FsbGVyaWEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFFBQVEsRUFBQyxTQUFTLEVBQUMsVUFBVSxFQUFXLEtBQUssRUFBQyxNQUFNLEVBQUMsWUFBWSxFQUFDLHVCQUF1QixFQUFFLFNBQVMsRUFBRSxlQUFlLEVBQWlGLGlCQUFpQixFQUFFLGlCQUFpQixFQUFnQixNQUFNLGVBQWUsQ0FBQztBQUN4UixPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDN0MsT0FBTyxFQUFFLFlBQVksRUFBRSxhQUFhLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDMUQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ2xELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDekMsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBbUI5QyxNQUFNLE9BQU8sUUFBUTtJQXFGakIsWUFBbUIsT0FBbUIsRUFBUyxFQUFxQjtRQUFqRCxZQUFPLEdBQVAsT0FBTyxDQUFZO1FBQVMsT0FBRSxHQUFGLEVBQUUsQ0FBbUI7UUEzRTNELGVBQVUsR0FBWSxLQUFLLENBQUM7UUFNNUIsZUFBVSxHQUFXLENBQUMsQ0FBQztRQUl2Qix1QkFBa0IsR0FBWSxLQUFLLENBQUM7UUFFcEMsNEJBQXVCLEdBQVksSUFBSSxDQUFDO1FBRXhDLDhCQUF5QixHQUFZLEtBQUssQ0FBQztRQUUzQywrQkFBMEIsR0FBWSxLQUFLLENBQUM7UUFFNUMsYUFBUSxHQUFZLEtBQUssQ0FBQztRQUUxQixhQUFRLEdBQVksS0FBSyxDQUFDO1FBRTFCLHVCQUFrQixHQUFXLElBQUksQ0FBQztRQUVsQyxtQkFBYyxHQUFZLElBQUksQ0FBQztRQUUvQix1QkFBa0IsR0FBVyxR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QUVMLE1BQU07NEJBRU4sTUFBTTs2QkFFTixTQUFTLFNBQUMsZ0JBQWdCO3lCQUUxQixLQUFLOzBCQVVMLEtBQUs7O0FBbVdWLE1BQU0sT0FBTyxjQUFjOzs7WUFMMUIsUUFBUSxTQUFDO2dCQUNOLE9BQU8sRUFBRSxDQUFDLFlBQVksRUFBRSxZQUFZLEVBQUUsWUFBWSxDQUFDO2dCQUNuRCxPQUFPLEVBQUUsQ0FBQyxZQUFZLEVBQUUsUUFBUSxFQUFFLGVBQWUsRUFBRSxnQkFBZ0IsRUFBRSxZQUFZLEVBQUUsa0JBQWtCLEVBQUUsWUFBWSxDQUFDO2dCQUNwSCxZQUFZLEVBQUUsQ0FBQyxRQUFRLEVBQUUsZUFBZSxFQUFFLGdCQUFnQixFQUFFLFlBQVksRUFBRSxrQkFBa0IsQ0FBQzthQUNoRyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TmdNb2R1bGUsQ29tcG9uZW50LEVsZW1lbnRSZWYsT25EZXN0cm95LElucHV0LE91dHB1dCxFdmVudEVtaXR0ZXIsQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksIFZpZXdDaGlsZCwgQ29udGVudENoaWxkcmVuLCBRdWVyeUxpc3QsIFRlbXBsYXRlUmVmLCBPbkluaXQsIE9uQ2hhbmdlcywgQWZ0ZXJDb250ZW50Q2hlY2tlZCwgU2ltcGxlQ2hhbmdlcywgVmlld0VuY2Fwc3VsYXRpb24sIENoYW5nZURldGVjdG9yUmVmLCBBZnRlclZpZXdJbml0fSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHtDb21tb25Nb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XHJcbmltcG9ydCB7IFNoYXJlZE1vZHVsZSwgUHJpbWVUZW1wbGF0ZSB9IGZyb20gJ3ByaW1lbmcvYXBpJztcclxuaW1wb3J0IHsgVW5pcXVlQ29tcG9uZW50SWQgfSBmcm9tICdwcmltZW5nL3V0aWxzJztcclxuaW1wb3J0IHsgRG9tSGFuZGxlciB9IGZyb20gJ3ByaW1lbmcvZG9tJztcclxuaW1wb3J0IHsgUmlwcGxlTW9kdWxlIH0gZnJvbSAncHJpbWVuZy9yaXBwbGUnOyAgXHJcblxyXG5AQ29tcG9uZW50KHtcclxuICAgIHNlbGVjdG9yOiAncC1nYWxsZXJpYScsXHJcbiAgICB0ZW1wbGF0ZTogYFxyXG4gICAgICAgIDxkaXYgKm5nSWY9XCJmdWxsU2NyZWVuO2Vsc2Ugd2luZG93ZWRcIj5cclxuICAgICAgICAgICAgPGRpdiAqbmdJZj1cInZpc2libGVcIiAjbWFzayBbbmdDbGFzc109XCJ7J3AtZ2FsbGVyaWEtbWFzayBwLWNvbXBvbmVudC1vdmVybGF5Jzp0cnVlLCAncC1nYWxsZXJpYS12aXNpYmxlJzogdGhpcy52aXNpYmxlfVwiIFtjbGFzc109XCJtYXNrQ2xhc3NcIiBbbmdTdHlsZV09XCJ7J3pJbmRleCc6ekluZGV4fVwiPlxyXG4gICAgICAgICAgICAgICAgPHAtZ2FsbGVyaWFDb250ZW50IFt2YWx1ZV09XCJ2YWx1ZVwiIFthY3RpdmVJbmRleF09XCJhY3RpdmVJbmRleFwiIChtYXNrSGlkZSk9XCJvbk1hc2tIaWRlKClcIiAoYWN0aXZlSXRlbUNoYW5nZSk9XCJvbkFjdGl2ZUl0ZW1DaGFuZ2UoJGV2ZW50KVwiIFtuZ1N0eWxlXT1cImNvbnRhaW5lclN0eWxlXCI+PC9wLWdhbGxlcmlhQ29udGVudD5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgIDxuZy10ZW1wbGF0ZSAjd2luZG93ZWQ+XHJcbiAgICAgICAgICAgIDxwLWdhbGxlcmlhQ29udGVudCBbdmFsdWVdPVwidmFsdWVcIiBbYWN0aXZlSW5kZXhdPVwiYWN0aXZlSW5kZXhcIiAoYWN0aXZlSXRlbUNoYW5nZSk9XCJvbkFjdGl2ZUl0ZW1DaGFuZ2UoJGV2ZW50KVwiPjwvcC1nYWxsZXJpYUNvbnRlbnQ+XHJcbiAgICAgICAgPC9uZy10ZW1wbGF0ZT5cclxuICAgIGAsXHJcbiAgICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcclxuICAgIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXHJcbiAgICBzdHlsZVVybHM6IFsnLi9nYWxsZXJpYS5jc3MnXVxyXG59KVxyXG5leHBvcnQgY2xhc3MgR2FsbGVyaWEgaW1wbGVtZW50cyBPbkNoYW5nZXMsIE9uRGVzdHJveSB7XHJcblxyXG4gICAgQElucHV0KCkgZ2V0IGFjdGl2ZUluZGV4KCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FjdGl2ZUluZGV4O1xyXG4gICAgfTtcclxuXHJcbiAgICBzZXQgYWN0aXZlSW5kZXgoYWN0aXZlSW5kZXgpIHtcclxuICAgICAgICB0aGlzLl9hY3RpdmVJbmRleCA9IGFjdGl2ZUluZGV4O1xyXG4gICAgfVxyXG5cclxuICAgIEBJbnB1dCgpIGZ1bGxTY3JlZW46IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgICBASW5wdXQoKSBpZDogc3RyaW5nO1xyXG5cclxuICAgIEBJbnB1dCgpIHZhbHVlOiBhbnlbXTtcclxuXHJcbiAgICBASW5wdXQoKSBudW1WaXNpYmxlOiBudW1iZXIgPSAzO1xyXG5cclxuICAgIEBJbnB1dCgpIHJlc3BvbnNpdmVPcHRpb25zOiBhbnlbXTtcclxuXHJcbiAgICBASW5wdXQoKSBzaG93SXRlbU5hdmlnYXRvcnM6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgICBASW5wdXQoKSBzaG93VGh1bWJuYWlsTmF2aWdhdG9yczogYm9vbGVhbiA9IHRydWU7XHJcblxyXG4gICAgQElucHV0KCkgc2hvd0l0ZW1OYXZpZ2F0b3JzT25Ib3ZlcjogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICAgIEBJbnB1dCgpIGNoYW5nZUl0ZW1PbkluZGljYXRvckhvdmVyOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gICAgQElucHV0KCkgY2lyY3VsYXI6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgICBASW5wdXQoKSBhdXRvUGxheTogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICAgIEBJbnB1dCgpIHRyYW5zaXRpb25JbnRlcnZhbDogbnVtYmVyID0gNDAwMDtcclxuXHJcbiAgICBASW5wdXQoKSBzaG93VGh1bWJuYWlsczogYm9vbGVhbiA9IHRydWU7XHJcblxyXG4gICAgQElucHV0KCkgdGh1bWJuYWlsc1Bvc2l0aW9uOiBzdHJpbmcgPSBcImJvdHRvbVwiO1xyXG5cclxuICAgIEBJbnB1dCgpIHZlcnRpY2FsVGh1bWJuYWlsVmlld1BvcnRIZWlnaHQ6IHN0cmluZyA9IFwiMzAwcHhcIjtcclxuXHJcbiAgICBASW5wdXQoKSBzaG93SW5kaWNhdG9yczogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICAgIEBJbnB1dCgpIHNob3dJbmRpY2F0b3JzT25JdGVtOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gICAgQElucHV0KCkgaW5kaWNhdG9yc1Bvc2l0aW9uOiBzdHJpbmcgPSBcImJvdHRvbVwiO1xyXG5cclxuICAgIEBJbnB1dCgpIGJhc2VaSW5kZXg6IG51bWJlciA9IDA7XHJcblxyXG4gICAgQElucHV0KCkgbWFza0NsYXNzOiBzdHJpbmc7XHJcblxyXG4gICAgQElucHV0KCkgY29udGFpbmVyQ2xhc3M6IHN0cmluZztcclxuXHJcbiAgICBASW5wdXQoKSBjb250YWluZXJTdHlsZTogYW55O1xyXG5cclxuICAgIEBWaWV3Q2hpbGQoJ21hc2snLCB7c3RhdGljOiBmYWxzZX0pIG1hc2s6IEVsZW1lbnRSZWY7XHJcblxyXG4gICAgQElucHV0KCkgZ2V0IHZpc2libGUoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Zpc2libGU7XHJcbiAgICB9O1xyXG5cclxuICAgIHNldCB2aXNpYmxlKHZpc2libGU6IGJvb2xlYW4pIHtcclxuICAgICAgICB0aGlzLl92aXNpYmxlID0gdmlzaWJsZTtcclxuICAgIH1cclxuXHJcbiAgICBAT3V0cHV0KCkgYWN0aXZlSW5kZXhDaGFuZ2U6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG5cclxuICAgIEBPdXRwdXQoKSB2aXNpYmxlQ2hhbmdlOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcclxuICAgIFxyXG5cdEBDb250ZW50Q2hpbGRyZW4oUHJpbWVUZW1wbGF0ZSkgdGVtcGxhdGVzOiBRdWVyeUxpc3Q8YW55PjtcclxuXHJcblxyXG4gICAgX3Zpc2libGU6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgICBfYWN0aXZlSW5kZXg6IG51bWJlciA9IDA7XHJcblxyXG4gICAgaGVhZGVyRmFjZXQ6IGFueTtcclxuXHJcbiAgICBmb290ZXJGYWNldDogYW55O1xyXG5cclxuICAgIGluZGljYXRvckZhY2V0OiBhbnk7XHJcblxyXG4gICAgY2FwdGlvbkZhY2V0OiBhbnk7XHJcblxyXG4gICAgekluZGV4OiBzdHJpbmc7XHJcblxyXG4gICAgY29uc3RydWN0b3IocHVibGljIGVsZW1lbnQ6IEVsZW1lbnRSZWYsIHB1YmxpYyBjZDogQ2hhbmdlRGV0ZWN0b3JSZWYpIHsgfVxyXG5cclxuICAgIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcclxuICAgICAgICB0aGlzLnRlbXBsYXRlcy5mb3JFYWNoKChpdGVtKSA9PiB7XHJcbiAgICAgICAgICAgIHN3aXRjaChpdGVtLmdldFR5cGUoKSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnaGVhZGVyJzpcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmhlYWRlckZhY2V0ID0gaXRlbS50ZW1wbGF0ZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnZm9vdGVyJzpcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmZvb3RlckZhY2V0ID0gaXRlbS50ZW1wbGF0ZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnaW5kaWNhdG9yJzpcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmluZGljYXRvckZhY2V0ID0gaXRlbS50ZW1wbGF0ZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnY2FwdGlvbic6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jYXB0aW9uRmFjZXQgPSBpdGVtLnRlbXBsYXRlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBuZ09uQ2hhbmdlcyhzaW1wbGVDaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZnVsbFNjcmVlbiAmJiBzaW1wbGVDaGFuZ2VzLnZpc2libGUpIHtcclxuICAgICAgICAgICAgaWYgKHNpbXBsZUNoYW5nZXMudmlzaWJsZS5jdXJyZW50VmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIERvbUhhbmRsZXIuYWRkQ2xhc3MoZG9jdW1lbnQuYm9keSwgJ3Atb3ZlcmZsb3ctaGlkZGVuJyk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy56SW5kZXggPSBTdHJpbmcodGhpcy5iYXNlWkluZGV4ICsgKytEb21IYW5kbGVyLnppbmRleClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIERvbUhhbmRsZXIucmVtb3ZlQ2xhc3MoZG9jdW1lbnQuYm9keSwgJ3Atb3ZlcmZsb3ctaGlkZGVuJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIG9uTWFza0hpZGUoKSB7XHJcbiAgICAgICAgdGhpcy52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy52aXNpYmxlQ2hhbmdlLmVtaXQoZmFsc2UpO1xyXG4gICAgfVxyXG5cclxuICAgIG9uQWN0aXZlSXRlbUNoYW5nZShpbmRleCkge1xyXG4gICAgICAgIGlmICh0aGlzLmFjdGl2ZUluZGV4ICE9PSBpbmRleCkge1xyXG4gICAgICAgICAgICB0aGlzLmFjdGl2ZUluZGV4ID0gaW5kZXg7XHJcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlSW5kZXhDaGFuZ2UuZW1pdChpbmRleCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG5nT25EZXN0cm95KCkge1xyXG4gICAgICAgIGlmICh0aGlzLmZ1bGxTY3JlZW4pIHtcclxuICAgICAgICAgICAgRG9tSGFuZGxlci5yZW1vdmVDbGFzcyhkb2N1bWVudC5ib2R5LCAncC1vdmVyZmxvdy1oaWRkZW4nKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbkBDb21wb25lbnQoe1xyXG4gICAgc2VsZWN0b3I6ICdwLWdhbGxlcmlhQ29udGVudCcsXHJcbiAgICB0ZW1wbGF0ZTogYFxyXG4gICAgICAgIDxkaXYgW2F0dHIuaWRdPVwiaWRcIiAqbmdJZj1cInZhbHVlICYmIHZhbHVlLmxlbmd0aCA+IDBcIiBbbmdDbGFzc109XCJ7J3AtZ2FsbGVyaWEgcC1jb21wb25lbnQnOiB0cnVlLCAncC1nYWxsZXJpYS1mdWxsc2NyZWVuJzogdGhpcy5nYWxsZXJpYS5mdWxsU2NyZWVuLCBcclxuICAgICAgICAgICAgJ3AtZ2FsbGVyaWEtaW5kaWNhdG9yLW9uaXRlbSc6IHRoaXMuZ2FsbGVyaWEuc2hvd0luZGljYXRvcnNPbkl0ZW0sICdwLWdhbGxlcmlhLWl0ZW0tbmF2LW9uaG92ZXInOiB0aGlzLmdhbGxlcmlhLnNob3dJdGVtTmF2aWdhdG9yc09uSG92ZXIgJiYgIXRoaXMuZ2FsbGVyaWEuZnVsbFNjcmVlbn1cIlxyXG4gICAgICAgICAgICBbbmdTdHlsZV09XCIhZ2FsbGVyaWEuZnVsbFNjcmVlbiA/IGdhbGxlcmlhLmNvbnRhaW5lclN0eWxlIDoge31cIiBbY2xhc3NdPVwiZ2FsbGVyaWFDbGFzcygpXCI+XHJcbiAgICAgICAgICAgIDxidXR0b24gKm5nSWY9XCJnYWxsZXJpYS5mdWxsU2NyZWVuXCIgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwicC1nYWxsZXJpYS1jbG9zZSBwLWxpbmtcIiAoY2xpY2spPVwibWFza0hpZGUuZW1pdCgpXCIgcFJpcHBsZT5cclxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwicC1nYWxsZXJpYS1jbG9zZS1pY29uIHBpIHBpLXRpbWVzXCI+PC9zcGFuPlxyXG4gICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgPGRpdiAqbmdJZj1cImdhbGxlcmlhLnRlbXBsYXRlcyAmJiBnYWxsZXJpYS5oZWFkZXJGYWNldFwiIGNsYXNzPVwicC1nYWxsZXJpYS1oZWFkZXJcIj5cclxuICAgICAgICAgICAgICAgIDxwLWdhbGxlcmlhSXRlbVNsb3QgdHlwZT1cImhlYWRlclwiIFt0ZW1wbGF0ZXNdPVwiZ2FsbGVyaWEudGVtcGxhdGVzXCI+PC9wLWdhbGxlcmlhSXRlbVNsb3Q+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwicC1nYWxsZXJpYS1jb250ZW50XCI+XHJcbiAgICAgICAgICAgICAgICA8cC1nYWxsZXJpYUl0ZW0gW3ZhbHVlXT1cInZhbHVlXCIgW2FjdGl2ZUluZGV4XT1cImFjdGl2ZUluZGV4XCIgW2NpcmN1bGFyXT1cImdhbGxlcmlhLmNpcmN1bGFyXCIgW3RlbXBsYXRlc109XCJnYWxsZXJpYS50ZW1wbGF0ZXNcIiAob25BY3RpdmVJbmRleENoYW5nZSk9XCJvbkFjdGl2ZUluZGV4Q2hhbmdlKCRldmVudClcIiBcclxuICAgICAgICAgICAgICAgICAgICBbc2hvd0luZGljYXRvcnNdPVwiZ2FsbGVyaWEuc2hvd0luZGljYXRvcnNcIiBbY2hhbmdlSXRlbU9uSW5kaWNhdG9ySG92ZXJdPVwiZ2FsbGVyaWEuY2hhbmdlSXRlbU9uSW5kaWNhdG9ySG92ZXJcIiBbaW5kaWNhdG9yRmFjZXRdPVwiZ2FsbGVyaWEuaW5kaWNhdG9yRmFjZXRcIlxyXG4gICAgICAgICAgICAgICAgICAgIFtjYXB0aW9uRmFjZXRdPVwiZ2FsbGVyaWEuY2FwdGlvbkZhY2V0XCIgW3Nob3dJdGVtTmF2aWdhdG9yc109XCJnYWxsZXJpYS5zaG93SXRlbU5hdmlnYXRvcnNcIiBbYXV0b1BsYXldPVwiZ2FsbGVyaWEuYXV0b1BsYXlcIiBbc2xpZGVTaG93QWN0aXZlXT1cInNsaWRlU2hvd0FjdGl2ZVwiXHJcbiAgICAgICAgICAgICAgICAgICAgKHN0YXJ0U2xpZGVTaG93KT1cInN0YXJ0U2xpZGVTaG93KClcIiAoc3RvcFNsaWRlU2hvdyk9XCJzdG9wU2xpZGVTaG93KClcIj48L3AtZ2FsbGVyaWFJdGVtPlxyXG5cclxuICAgICAgICAgICAgICAgIDxwLWdhbGxlcmlhVGh1bWJuYWlscyAqbmdJZj1cImdhbGxlcmlhLnNob3dUaHVtYm5haWxzXCIgW2NvbnRhaW5lcklkXT1cImlkXCIgW3ZhbHVlXT1cInZhbHVlXCIgKG9uQWN0aXZlSW5kZXhDaGFuZ2UpPVwib25BY3RpdmVJbmRleENoYW5nZSgkZXZlbnQpXCIgW2FjdGl2ZUluZGV4XT1cImFjdGl2ZUluZGV4XCIgW3RlbXBsYXRlc109XCJnYWxsZXJpYS50ZW1wbGF0ZXNcIlxyXG4gICAgICAgICAgICAgICAgICAgIFtudW1WaXNpYmxlXT1cImdhbGxlcmlhLm51bVZpc2libGVcIiBbcmVzcG9uc2l2ZU9wdGlvbnNdPVwiZ2FsbGVyaWEucmVzcG9uc2l2ZU9wdGlvbnNcIiBbY2lyY3VsYXJdPVwiZ2FsbGVyaWEuY2lyY3VsYXJcIlxyXG4gICAgICAgICAgICAgICAgICAgIFtpc1ZlcnRpY2FsXT1cImlzVmVydGljYWwoKVwiIFtjb250ZW50SGVpZ2h0XT1cImdhbGxlcmlhLnZlcnRpY2FsVGh1bWJuYWlsVmlld1BvcnRIZWlnaHRcIiBbc2hvd1RodW1ibmFpbE5hdmlnYXRvcnNdPVwiZ2FsbGVyaWEuc2hvd1RodW1ibmFpbE5hdmlnYXRvcnNcIlxyXG4gICAgICAgICAgICAgICAgICAgIFtzbGlkZVNob3dBY3RpdmVdPVwic2xpZGVTaG93QWN0aXZlXCIgKHN0b3BTbGlkZVNob3cpPVwic3RvcFNsaWRlU2hvdygpXCI+PC9wLWdhbGxlcmlhVGh1bWJuYWlscz5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDxkaXYgKm5nSWY9XCJnYWxsZXJpYS50ZW1wbGF0ZXMgJiYgZ2FsbGVyaWEuZm9vdGVyRmFjZXRcIiBjbGFzcz1cInAtZ2FsbGVyaWEtZm9vdGVyXCI+XHJcbiAgICAgICAgICAgICAgICA8cC1nYWxsZXJpYUl0ZW1TbG90IHR5cGU9XCJmb290ZXJcIiBbdGVtcGxhdGVzXT1cImdhbGxlcmlhLnRlbXBsYXRlc1wiPjwvcC1nYWxsZXJpYUl0ZW1TbG90PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgIGAsXHJcbiAgIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBHYWxsZXJpYUNvbnRlbnQge1xyXG5cclxuICAgIEBJbnB1dCgpIGdldCBhY3RpdmVJbmRleCgpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9hY3RpdmVJbmRleDtcclxuICAgIH07XHJcblxyXG4gICAgc2V0IGFjdGl2ZUluZGV4KGFjdGl2ZUluZGV4OiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLl9hY3RpdmVJbmRleCA9IGFjdGl2ZUluZGV4O1xyXG4gICAgfVxyXG5cclxuICAgIEBJbnB1dCgpIHZhbHVlOiBhbnlbXSA9IFtdO1xyXG5cclxuICAgIEBPdXRwdXQoKSBtYXNrSGlkZTogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XHJcblxyXG4gICAgQE91dHB1dCgpIGFjdGl2ZUl0ZW1DaGFuZ2U6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG5cclxuICAgIGlkOiBzdHJpbmcgPSB0aGlzLmdhbGxlcmlhLmlkIHx8IFVuaXF1ZUNvbXBvbmVudElkKCk7XHJcblxyXG4gICAgc2xpZGVTaG93QWN0aWN2ZTogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICAgIF9hY3RpdmVJbmRleDogbnVtYmVyID0gMDtcclxuXHJcbiAgICBzbGlkZVNob3dBY3RpdmU6IGJvb2xlYW4gPSB0cnVlO1xyXG5cclxuICAgIGludGVydmFsOiBhbnk7XHJcblxyXG4gICAgc3R5bGVDbGFzczogc3RyaW5nO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBnYWxsZXJpYTogR2FsbGVyaWEsIHB1YmxpYyBjZDogQ2hhbmdlRGV0ZWN0b3JSZWYpIHsgfVxyXG5cclxuICAgIGdhbGxlcmlhQ2xhc3MoKSB7XHJcbiAgICAgICAgY29uc3QgdGh1bWJuYWlsc1Bvc0NsYXNzID0gdGhpcy5nYWxsZXJpYS5zaG93VGh1bWJuYWlscyAmJiB0aGlzLmdldFBvc2l0aW9uQ2xhc3MoJ3AtZ2FsbGVyaWEtdGh1bWJuYWlscycsIHRoaXMuZ2FsbGVyaWEudGh1bWJuYWlsc1Bvc2l0aW9uKTtcclxuICAgICAgICBjb25zdCBpbmRpY2F0b3JQb3NDbGFzcyA9IHRoaXMuZ2FsbGVyaWEuc2hvd0luZGljYXRvcnMgJiYgdGhpcy5nZXRQb3NpdGlvbkNsYXNzKCdwLWdhbGxlcmlhLWluZGljYXRvcnMnLCB0aGlzLmdhbGxlcmlhLmluZGljYXRvcnNQb3NpdGlvbik7XHJcblxyXG4gICAgICAgIHJldHVybiAodGhpcy5nYWxsZXJpYS5jb250YWluZXJDbGFzcyA/IHRoaXMuZ2FsbGVyaWEuY29udGFpbmVyQ2xhc3MgKyBcIiBcIiA6ICcnKSArICh0aHVtYm5haWxzUG9zQ2xhc3MgPyB0aHVtYm5haWxzUG9zQ2xhc3MgKyBcIiBcIiA6ICcnKSArIChpbmRpY2F0b3JQb3NDbGFzcyA/IGluZGljYXRvclBvc0NsYXNzICsgXCIgXCIgOiAnJyk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhcnRTbGlkZVNob3coKSB7XHJcbiAgICAgICAgdGhpcy5pbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcclxuICAgICAgICAgICAgbGV0IGFjdGl2ZUluZGV4ID0gKHRoaXMuZ2FsbGVyaWEuY2lyY3VsYXIgJiYgKHRoaXMudmFsdWUubGVuZ3RoIC0gMSkgPT09IHRoaXMuYWN0aXZlSW5kZXgpID8gMCA6ICh0aGlzLmFjdGl2ZUluZGV4ICsgMSk7XHJcbiAgICAgICAgICAgIHRoaXMub25BY3RpdmVJbmRleENoYW5nZShhY3RpdmVJbmRleCk7XHJcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlSW5kZXggPSBhY3RpdmVJbmRleDtcclxuICAgICAgICB9LCB0aGlzLmdhbGxlcmlhLnRyYW5zaXRpb25JbnRlcnZhbCk7XHJcblxyXG4gICAgICAgIHRoaXMuc2xpZGVTaG93QWN0aXZlID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBzdG9wU2xpZGVTaG93KCkge1xyXG4gICAgICAgIGlmICh0aGlzLmludGVydmFsKSB7XHJcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcnZhbCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnNsaWRlU2hvd0FjdGl2ZSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFBvc2l0aW9uQ2xhc3MocHJlQ2xhc3NOYW1lLCBwb3NpdGlvbikge1xyXG4gICAgICAgIGNvbnN0IHBvc2l0aW9ucyA9IFsndG9wJywgJ2xlZnQnLCAnYm90dG9tJywgJ3JpZ2h0J107XHJcbiAgICAgICAgY29uc3QgcG9zID0gcG9zaXRpb25zLmZpbmQoaXRlbSA9PiBpdGVtID09PSBwb3NpdGlvbik7XHJcblxyXG4gICAgICAgIHJldHVybiBwb3MgPyBgJHtwcmVDbGFzc05hbWV9LSR7cG9zfWAgOiAnJztcclxuICAgIH1cclxuXHJcbiAgICBpc1ZlcnRpY2FsKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdhbGxlcmlhLnRodW1ibmFpbHNQb3NpdGlvbiA9PT0gJ2xlZnQnIHx8IHRoaXMuZ2FsbGVyaWEudGh1bWJuYWlsc1Bvc2l0aW9uID09PSAncmlnaHQnO1xyXG4gICAgfVxyXG5cclxuICAgIG9uQWN0aXZlSW5kZXhDaGFuZ2UoaW5kZXgpIHtcclxuICAgICAgICBpZiAodGhpcy5hY3RpdmVJbmRleCAhPT0gaW5kZXgpIHtcclxuICAgICAgICAgICAgdGhpcy5hY3RpdmVJbmRleCA9IGluZGV4O1xyXG4gICAgICAgICAgICB0aGlzLmFjdGl2ZUl0ZW1DaGFuZ2UuZW1pdCh0aGlzLmFjdGl2ZUluZGV4KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbkBDb21wb25lbnQoe1xyXG4gICAgc2VsZWN0b3I6ICdwLWdhbGxlcmlhSXRlbVNsb3QnLFxyXG4gICAgdGVtcGxhdGU6IGBcclxuICAgICAgICA8bmctY29udGFpbmVyICpuZ0lmPVwiY29udGVudFRlbXBsYXRlXCI+XHJcbiAgICAgICAgICAgIDxuZy1jb250YWluZXIgKm5nVGVtcGxhdGVPdXRsZXQ9XCJjb250ZW50VGVtcGxhdGU7IGNvbnRleHQ6IGNvbnRleHRcIj48L25nLWNvbnRhaW5lcj5cclxuICAgICAgICA8L25nLWNvbnRhaW5lcj5cclxuICAgIGAsXHJcbiAgIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBHYWxsZXJpYUl0ZW1TbG90IHtcclxuICAgIEBJbnB1dCgpIHRlbXBsYXRlczogUXVlcnlMaXN0PGFueT47XHJcblxyXG4gICAgQElucHV0KCkgaW5kZXg6IG51bWJlcjtcclxuXHJcbiAgICBASW5wdXQoKSBnZXQgaXRlbSgpOiBhbnkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9pdGVtO1xyXG4gICAgfTtcclxuXHJcbiAgICBzZXQgaXRlbShpdGVtOmFueSkge1xyXG4gICAgICAgIHRoaXMuX2l0ZW0gPSBpdGVtO1xyXG4gICAgICAgIGlmICh0aGlzLnRlbXBsYXRlcykge1xyXG4gICAgICAgICAgICB0aGlzLnRlbXBsYXRlcy5mb3JFYWNoKChpdGVtKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXRlbS5nZXRUeXBlKCkgPT09IHRoaXMudHlwZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHN3aXRjaCh0aGlzLnR5cGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnaXRlbSc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ2NhcHRpb24nOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICd0aHVtYm5haWwnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb250ZXh0ID0geyRpbXBsaWNpdDogdGhpcy5pdGVtfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29udGVudFRlbXBsYXRlID0gaXRlbS50ZW1wbGF0ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgQElucHV0KCkgdHlwZTogc3RyaW5nO1xyXG5cclxuICAgIGNvbnRlbnRUZW1wbGF0ZTogVGVtcGxhdGVSZWY8YW55PjtcclxuXHJcbiAgICBjb250ZXh0OmFueTtcclxuXHJcbiAgICBfaXRlbTphbnk7XHJcblxyXG4gICAgbmdBZnRlckNvbnRlbnRJbml0KCkge1xyXG4gICAgICAgIHRoaXMudGVtcGxhdGVzLmZvckVhY2goKGl0ZW0pID0+IHtcclxuICAgICAgICAgICAgaWYgKGl0ZW0uZ2V0VHlwZSgpID09PSB0aGlzLnR5cGUpIHtcclxuICAgICAgICAgICAgICAgIHN3aXRjaCh0aGlzLnR5cGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdpdGVtJzpcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdjYXB0aW9uJzpcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICd0aHVtYm5haWwnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnRleHQgPSB7JGltcGxpY2l0OiB0aGlzLml0ZW19O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnRlbnRUZW1wbGF0ZSA9IGl0ZW0udGVtcGxhdGU7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnaW5kaWNhdG9yJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb250ZXh0ID0geyRpbXBsaWNpdDogdGhpcy5pbmRleH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY29udGVudFRlbXBsYXRlID0gaXRlbS50ZW1wbGF0ZTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnRleHQgPSB7fTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb250ZW50VGVtcGxhdGUgPSBpdGVtLnRlbXBsYXRlO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbkBDb21wb25lbnQoe1xyXG4gICAgc2VsZWN0b3I6ICdwLWdhbGxlcmlhSXRlbScsXHJcbiAgICB0ZW1wbGF0ZTogYFxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJwLWdhbGxlcmlhLWl0ZW0td3JhcHBlclwiPlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwicC1nYWxsZXJpYS1pdGVtLWNvbnRhaW5lclwiPlxyXG4gICAgICAgICAgICAgICAgPGJ1dHRvbiAqbmdJZj1cInNob3dJdGVtTmF2aWdhdG9yc1wiIHR5cGU9XCJidXR0b25cIiBbbmdDbGFzc109XCJ7J3AtZ2FsbGVyaWEtaXRlbS1wcmV2IHAtZ2FsbGVyaWEtaXRlbS1uYXYgcC1saW5rJzogdHJ1ZSwgJ3AtZGlzYWJsZWQnOiB0aGlzLmlzTmF2QmFja3dhcmREaXNhYmxlZCgpfVwiIChjbGljayk9XCJuYXZCYWNrd2FyZCgkZXZlbnQpXCIgW2Rpc2FibGVkXT1cImlzTmF2QmFja3dhcmREaXNhYmxlZCgpXCIgcFJpcHBsZT5cclxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInAtZ2FsbGVyaWEtaXRlbS1wcmV2LWljb24gcGkgcGktY2hldnJvbi1sZWZ0XCI+PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICA8cC1nYWxsZXJpYUl0ZW1TbG90IHR5cGU9XCJpdGVtXCIgW2l0ZW1dPVwiYWN0aXZlSXRlbVwiIFt0ZW1wbGF0ZXNdPVwidGVtcGxhdGVzXCIgY2xhc3M9XCJwLWdhbGxlcmlhLWl0ZW1cIj48L3AtZ2FsbGVyaWFJdGVtU2xvdD5cclxuICAgICAgICAgICAgICAgIDxidXR0b24gKm5nSWY9XCJzaG93SXRlbU5hdmlnYXRvcnNcIiB0eXBlPVwiYnV0dG9uXCIgW25nQ2xhc3NdPVwieydwLWdhbGxlcmlhLWl0ZW0tbmV4dCBwLWdhbGxlcmlhLWl0ZW0tbmF2IHAtbGluayc6IHRydWUsJ3AtZGlzYWJsZWQnOiB0aGlzLmlzTmF2Rm9yd2FyZERpc2FibGVkKCl9XCIgKGNsaWNrKT1cIm5hdkZvcndhcmQoJGV2ZW50KVwiICBbZGlzYWJsZWRdPVwiaXNOYXZGb3J3YXJkRGlzYWJsZWQoKVwiIHBSaXBwbGU+XHJcbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJwLWdhbGxlcmlhLWl0ZW0tbmV4dC1pY29uIHBpIHBpLWNoZXZyb24tcmlnaHRcIj48L3NwYW4+XHJcbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwLWdhbGxlcmlhLWNhcHRpb25cIiAqbmdJZj1cImNhcHRpb25GYWNldFwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxwLWdhbGxlcmlhSXRlbVNsb3QgdHlwZT1cImNhcHRpb25cIiBbaXRlbV09XCJhY3RpdmVJdGVtXCIgW3RlbXBsYXRlc109XCJ0ZW1wbGF0ZXNcIj48L3AtZ2FsbGVyaWFJdGVtU2xvdD5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPHVsICpuZ0lmPVwic2hvd0luZGljYXRvcnNcIiBjbGFzcz1cInAtZ2FsbGVyaWEtaW5kaWNhdG9ycyBwLXJlc2V0XCI+XHJcbiAgICAgICAgICAgICAgICA8bGkgKm5nRm9yPVwibGV0IGl0ZW0gb2YgdmFsdWU7IGxldCBpbmRleCA9IGluZGV4O1wiIHRhYmluZGV4PVwiMFwiXHJcbiAgICAgICAgICAgICAgICAgICAgKGNsaWNrKT1cIm9uSW5kaWNhdG9yQ2xpY2soaW5kZXgpXCIgKG1vdXNlZW50ZXIpPVwib25JbmRpY2F0b3JNb3VzZUVudGVyKGluZGV4KVwiIChrZXlkb3duLmVudGVyKT1cIm9uSW5kaWNhdG9yS2V5RG93bihpbmRleClcIlxyXG4gICAgICAgICAgICAgICAgICAgIFtuZ0NsYXNzXT1cInsncC1nYWxsZXJpYS1pbmRpY2F0b3InOiB0cnVlLCdwLWhpZ2hsaWdodCc6IGlzSW5kaWNhdG9ySXRlbUFjdGl2ZShpbmRleCl9XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgdGFiSW5kZXg9XCItMVwiIGNsYXNzPVwicC1saW5rXCIgKm5nSWY9XCIhaW5kaWNhdG9yRmFjZXRcIj5cclxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgICA8cC1nYWxsZXJpYUl0ZW1TbG90IHR5cGU9XCJpbmRpY2F0b3JcIiBbaW5kZXhdPVwiaW5kZXhcIiBbdGVtcGxhdGVzXT1cInRlbXBsYXRlc1wiPjwvcC1nYWxsZXJpYUl0ZW1TbG90PlxyXG4gICAgICAgICAgICAgICAgPC9saT5cclxuICAgICAgICAgICAgPC91bD5cclxuICAgICAgICA8L2Rpdj5cclxuICAgIGAsXHJcbiAgIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBHYWxsZXJpYUl0ZW0gaW1wbGVtZW50cyBPbkluaXQge1xyXG5cclxuICAgIEBJbnB1dCgpIGNpcmN1bGFyOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gICAgQElucHV0KCkgdmFsdWU6IGFueVtdO1xyXG5cclxuICAgIEBJbnB1dCgpIHNob3dJdGVtTmF2aWdhdG9yczogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICAgIEBJbnB1dCgpIHNob3dJbmRpY2F0b3JzOiBib29sZWFuID0gdHJ1ZTtcclxuXHJcbiAgICBASW5wdXQoKSBzbGlkZVNob3dBY3RpdmU6IGJvb2xlYW4gPSB0cnVlO1xyXG5cclxuICAgIEBJbnB1dCgpIGNoYW5nZUl0ZW1PbkluZGljYXRvckhvdmVyOiBib29sZWFuID0gdHJ1ZTtcclxuXHJcbiAgICBASW5wdXQoKSBhdXRvUGxheTogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICAgIEBJbnB1dCgpIHRlbXBsYXRlczogUXVlcnlMaXN0PGFueT47XHJcblxyXG4gICAgQElucHV0KCkgaW5kaWNhdG9yRmFjZXQ6IGFueTtcclxuXHJcbiAgICBASW5wdXQoKSBjYXB0aW9uRmFjZXQ6IGFueTtcclxuXHJcbiAgICBAT3V0cHV0KCkgc3RhcnRTbGlkZVNob3c6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG5cclxuICAgIEBPdXRwdXQoKSBzdG9wU2xpZGVTaG93OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcclxuICAgIFxyXG4gICAgQE91dHB1dCgpIG9uQWN0aXZlSW5kZXhDaGFuZ2U6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG5cclxuICAgIEBJbnB1dCgpIGdldCBhY3RpdmVJbmRleCgpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9hY3RpdmVJbmRleDtcclxuICAgIH07XHJcblxyXG4gICAgc2V0IGFjdGl2ZUluZGV4KGFjdGl2ZUluZGV4KSB7XHJcbiAgICAgICAgdGhpcy5fYWN0aXZlSW5kZXggPSBhY3RpdmVJbmRleDtcclxuICAgICAgICB0aGlzLmFjdGl2ZUl0ZW0gPSB0aGlzLnZhbHVlW3RoaXMuX2FjdGl2ZUluZGV4XTtcclxuICAgIH1cclxuXHJcbiAgICBfYWN0aXZlSW5kZXg6IG51bWJlciA9IDA7XHJcblxyXG4gICAgYWN0aXZlSXRlbTogYW55O1xyXG5cclxuICAgIG5nT25Jbml0KCkge1xyXG4gICAgICAgIGlmICh0aGlzLmF1dG9QbGF5KSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhcnRTbGlkZVNob3cuZW1pdCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBuZXh0KCkge1xyXG4gICAgICAgIGxldCBuZXh0SXRlbUluZGV4ID0gdGhpcy5hY3RpdmVJbmRleCArIDE7XHJcbiAgICAgICAgbGV0IGFjdGl2ZUluZGV4ID0gdGhpcy5jaXJjdWxhciAmJiB0aGlzLnZhbHVlLmxlbmd0aCAtIDEgPT09IHRoaXMuYWN0aXZlSW5kZXhcclxuICAgICAgICAgICAgICAgICAgICA/IDBcclxuICAgICAgICAgICAgICAgICAgICA6IG5leHRJdGVtSW5kZXg7XHJcbiAgICAgICAgdGhpcy5vbkFjdGl2ZUluZGV4Q2hhbmdlLmVtaXQoYWN0aXZlSW5kZXgpO1xyXG4gICAgfVxyXG5cclxuICAgIHByZXYoKSB7XHJcbiAgICAgICAgbGV0IHByZXZJdGVtSW5kZXggPSB0aGlzLmFjdGl2ZUluZGV4ICE9PSAwID8gdGhpcy5hY3RpdmVJbmRleCAtIDEgOiAwO1xyXG4gICAgICAgIGxldCBhY3RpdmVJbmRleCA9IHRoaXMuY2lyY3VsYXIgJiYgdGhpcy5hY3RpdmVJbmRleCA9PT0gMFxyXG4gICAgICAgICAgICAgICAgPyB0aGlzLnZhbHVlLmxlbmd0aCAtIDFcclxuICAgICAgICAgICAgICAgIDogcHJldkl0ZW1JbmRleFxyXG4gICAgICAgIHRoaXMub25BY3RpdmVJbmRleENoYW5nZS5lbWl0KGFjdGl2ZUluZGV4KTtcclxuICAgIH1cclxuXHJcbiAgICBzdG9wVGhlU2xpZGVTaG93KCkge1xyXG4gICAgICAgIGlmICh0aGlzLnNsaWRlU2hvd0FjdGl2ZSAmJiB0aGlzLnN0b3BTbGlkZVNob3cpIHtcclxuICAgICAgICAgICAgdGhpcy5zdG9wU2xpZGVTaG93LmVtaXQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbmF2Rm9yd2FyZChlKSB7XHJcbiAgICAgICAgdGhpcy5zdG9wVGhlU2xpZGVTaG93KCk7XHJcbiAgICAgICAgdGhpcy5uZXh0KCk7XHJcblxyXG4gICAgICAgIGlmIChlICYmIGUuY2FuY2VsYWJsZSkge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG5hdkJhY2t3YXJkKGUpIHtcclxuICAgICAgICB0aGlzLnN0b3BUaGVTbGlkZVNob3coKTtcclxuICAgICAgICB0aGlzLnByZXYoKTtcclxuXHJcbiAgICAgICAgaWYgKGUgJiYgZS5jYW5jZWxhYmxlKSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgb25JbmRpY2F0b3JDbGljayhpbmRleCkge1xyXG4gICAgICAgIHRoaXMuc3RvcFRoZVNsaWRlU2hvdygpO1xyXG4gICAgICAgIHRoaXMub25BY3RpdmVJbmRleENoYW5nZS5lbWl0KGluZGV4KTtcclxuICAgIH1cclxuXHJcbiAgICBvbkluZGljYXRvck1vdXNlRW50ZXIoaW5kZXgpIHtcclxuICAgICAgICBpZiAodGhpcy5jaGFuZ2VJdGVtT25JbmRpY2F0b3JIb3Zlcikge1xyXG4gICAgICAgICAgICB0aGlzLnN0b3BUaGVTbGlkZVNob3coKTtcclxuICAgICAgICAgICAgdGhpcy5vbkFjdGl2ZUluZGV4Q2hhbmdlLmVtaXQoaW5kZXgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBvbkluZGljYXRvcktleURvd24oaW5kZXgpIHtcclxuICAgICAgICB0aGlzLnN0b3BUaGVTbGlkZVNob3coKTtcclxuICAgICAgICB0aGlzLm9uQWN0aXZlSW5kZXhDaGFuZ2UuZW1pdChpbmRleCk7XHJcbiAgICB9XHJcblxyXG4gICAgaXNOYXZGb3J3YXJkRGlzYWJsZWQoKSB7XHJcbiAgICAgICAgcmV0dXJuICF0aGlzLmNpcmN1bGFyICYmIHRoaXMuYWN0aXZlSW5kZXggPT09ICh0aGlzLnZhbHVlLmxlbmd0aCAtIDEpO1xyXG4gICAgfVxyXG5cclxuICAgIGlzTmF2QmFja3dhcmREaXNhYmxlZCgpIHtcclxuICAgICAgICByZXR1cm4gIXRoaXMuY2lyY3VsYXIgJiYgdGhpcy5hY3RpdmVJbmRleCA9PT0gMDtcclxuICAgIH1cclxuXHJcbiAgICBpc0luZGljYXRvckl0ZW1BY3RpdmUoaW5kZXgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5hY3RpdmVJbmRleCA9PT0gaW5kZXg7XHJcbiAgICB9XHJcbn1cclxuXHJcbkBDb21wb25lbnQoe1xyXG4gICAgc2VsZWN0b3I6ICdwLWdhbGxlcmlhVGh1bWJuYWlscycsXHJcbiAgICB0ZW1wbGF0ZTogYFxyXG4gICAgICAgIDxkaXYgY2xhc3M9XCJwLWdhbGxlcmlhLXRodW1ibmFpbC13cmFwcGVyXCI+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwLWdhbGxlcmlhLXRodW1ibmFpbC1jb250YWluZXJcIj5cclxuICAgICAgICAgICAgICAgIDxidXR0b24gKm5nSWY9XCJzaG93VGh1bWJuYWlsTmF2aWdhdG9yc1wiIHR5cGU9XCJidXR0b25cIiBbbmdDbGFzc109XCJ7J3AtZ2FsbGVyaWEtdGh1bWJuYWlsLXByZXYgcC1saW5rJzogdHJ1ZSwgJ3AtZGlzYWJsZWQnOiB0aGlzLmlzTmF2QmFja3dhcmREaXNhYmxlZCgpfVwiIChjbGljayk9XCJuYXZCYWNrd2FyZCgkZXZlbnQpXCIgW2Rpc2FibGVkXT1cImlzTmF2QmFja3dhcmREaXNhYmxlZCgpXCIgcFJpcHBsZT5cclxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBbbmdDbGFzc109XCJ7J3AtZ2FsbGVyaWEtdGh1bWJuYWlsLXByZXYtaWNvbiBwaSc6IHRydWUsICdwaS1jaGV2cm9uLWxlZnQnOiAhdGhpcy5pc1ZlcnRpY2FsLCAncGktY2hldnJvbi11cCc6IHRoaXMuaXNWZXJ0aWNhbH1cIj48L3NwYW4+XHJcbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwLWdhbGxlcmlhLXRodW1ibmFpbC1pdGVtcy1jb250YWluZXJcIiBbbmdTdHlsZV09XCJ7J2hlaWdodCc6IGlzVmVydGljYWwgPyBjb250ZW50SGVpZ2h0IDogJyd9XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiAjaXRlbXNDb250YWluZXIgY2xhc3M9XCJwLWdhbGxlcmlhLXRodW1ibmFpbC1pdGVtc1wiICh0cmFuc2l0aW9uZW5kKT1cIm9uVHJhbnNpdGlvbkVuZCgpXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgKHRvdWNoc3RhcnQpPVwib25Ub3VjaFN0YXJ0KCRldmVudClcIiAodG91Y2htb3ZlKT1cIm9uVG91Y2hNb3ZlKCRldmVudClcIiAodG91Y2hlbmQpPVwib25Ub3VjaEVuZCgkZXZlbnQpXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgKm5nRm9yPVwibGV0IGl0ZW0gb2YgdmFsdWU7IGxldCBpbmRleCA9IGluZGV4O1wiIFtuZ0NsYXNzXT1cInsncC1nYWxsZXJpYS10aHVtYm5haWwtaXRlbSc6IHRydWUsICdwLWdhbGxlcmlhLXRodW1ibmFpbC1pdGVtLWN1cnJlbnQnOiBhY3RpdmVJbmRleCA9PT0gaW5kZXgsICdwLWdhbGxlcmlhLXRodW1ibmFpbC1pdGVtLWFjdGl2ZSc6IGlzSXRlbUFjdGl2ZShpbmRleCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAncC1nYWxsZXJpYS10aHVtYm5haWwtaXRlbS1zdGFydCc6IGZpcnN0SXRlbUFjaXZlSW5kZXgoKSA9PT0gaW5kZXgsICdwLWdhbGxlcmlhLXRodW1ibmFpbC1pdGVtLWVuZCc6IGxhc3RJdGVtQWN0aXZlSW5kZXgoKSA9PT0gaW5kZXggfVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInAtZ2FsbGVyaWEtdGh1bWJuYWlsLWl0ZW0tY29udGVudFwiIFthdHRyLnRhYmluZGV4XT1cImdldFRhYkluZGV4KGluZGV4KVwiIChjbGljayk9XCJvbkl0ZW1DbGljayhpbmRleClcIiAoa2V5ZG93bi5lbnRlcik9XCJvbkl0ZW1DbGljayhpbmRleClcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cC1nYWxsZXJpYUl0ZW1TbG90IHR5cGU9XCJ0aHVtYm5haWxcIiBbaXRlbV09XCJpdGVtXCIgW3RlbXBsYXRlc109XCJ0ZW1wbGF0ZXNcIj48L3AtZ2FsbGVyaWFJdGVtU2xvdD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGJ1dHRvbiAqbmdJZj1cInNob3dUaHVtYm5haWxOYXZpZ2F0b3JzXCIgdHlwZT1cImJ1dHRvblwiIFtuZ0NsYXNzXT1cInsncC1nYWxsZXJpYS10aHVtYm5haWwtbmV4dCBwLWxpbmsnOiB0cnVlLCAncC1kaXNhYmxlZCc6IHRoaXMuaXNOYXZGb3J3YXJkRGlzYWJsZWQoKX1cIiAoY2xpY2spPVwibmF2Rm9yd2FyZCgkZXZlbnQpXCIgW2Rpc2FibGVkXT1cImlzTmF2Rm9yd2FyZERpc2FibGVkKClcIiBwUmlwcGxlPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIFtuZ0NsYXNzXT1cInsncC1nYWxsZXJpYS10aHVtYm5haWwtbmV4dC1pY29uIHBpJzogdHJ1ZSwgJ3BpLWNoZXZyb24tcmlnaHQnOiAhdGhpcy5pc1ZlcnRpY2FsLCAncGktY2hldnJvbi1kb3duJzogdGhpcy5pc1ZlcnRpY2FsfVwiPjwvc3Bhbj5cclxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgIGAsXHJcbiAgIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBHYWxsZXJpYVRodW1ibmFpbHMgaW1wbGVtZW50cyBPbkluaXQsIEFmdGVyQ29udGVudENoZWNrZWQsIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSB7XHJcblxyXG4gICAgQElucHV0KCkgY29udGFpbmVySWQ6IHN0cmluZztcclxuXHJcbiAgICBASW5wdXQoKSB2YWx1ZTogYW55W107XHJcblxyXG4gICAgQElucHV0KCkgaXNWZXJ0aWNhbDogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICAgIEBJbnB1dCgpIHNsaWRlU2hvd0FjdGl2ZTogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICAgIEBJbnB1dCgpIGNpcmN1bGFyOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gICAgQElucHV0KCkgcmVzcG9uc2l2ZU9wdGlvbnM6IGFueVtdO1xyXG5cclxuICAgIEBJbnB1dCgpIGNvbnRlbnRIZWlnaHQ6IHN0cmluZyA9IFwiMzAwcHhcIjtcclxuXHJcbiAgICBASW5wdXQoKSBzaG93VGh1bWJuYWlsTmF2aWdhdG9ycyA9IHRydWU7XHJcblxyXG4gICAgQElucHV0KCkgdGVtcGxhdGVzOiBRdWVyeUxpc3Q8YW55PjtcclxuXHJcbiAgICBAT3V0cHV0KCkgb25BY3RpdmVJbmRleENoYW5nZTogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XHJcblxyXG4gICAgQE91dHB1dCgpIHN0b3BTbGlkZVNob3c6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG5cclxuICAgIEBWaWV3Q2hpbGQoJ2l0ZW1zQ29udGFpbmVyJykgaXRlbXNDb250YWluZXI6IEVsZW1lbnRSZWY7XHJcblxyXG4gICAgQElucHV0KCkgZ2V0IG51bVZpc2libGUoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbnVtVmlzaWJsZTtcclxuICAgIH07XHJcblxyXG4gICAgc2V0IG51bVZpc2libGUobnVtVmlzaWJsZSkge1xyXG4gICAgICAgIHRoaXMuX251bVZpc2libGUgPSBudW1WaXNpYmxlO1xyXG4gICAgICAgIHRoaXMuX29sZE51bVZpc2libGUgPSB0aGlzLmRfbnVtVmlzaWJsZTtcclxuICAgICAgICB0aGlzLmRfbnVtVmlzaWJsZSA9IG51bVZpc2libGU7XHJcbiAgICB9XHJcblxyXG4gICAgQElucHV0KCkgZ2V0IGFjdGl2ZUluZGV4KCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FjdGl2ZUluZGV4O1xyXG4gICAgfTtcclxuXHJcbiAgICBzZXQgYWN0aXZlSW5kZXgoYWN0aXZlSW5kZXgpIHtcclxuICAgICAgICB0aGlzLl9vbGRhY3RpdmVJbmRleCA9IHRoaXMuX2FjdGl2ZUluZGV4O1xyXG4gICAgICAgIHRoaXMuX2FjdGl2ZUluZGV4ID0gYWN0aXZlSW5kZXg7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGluZGV4OiBudW1iZXI7XHJcblxyXG4gICAgc3RhcnRQb3MgPSBudWxsO1xyXG4gICAgXHJcbiAgICB0aHVtYm5haWxzU3R5bGUgPSBudWxsO1xyXG5cclxuICAgIHNvcnRlZFJlc3BvbnNpdmVPcHRpb25zID0gbnVsbDtcclxuXHJcbiAgICB0b3RhbFNoaWZ0ZWRJdGVtczogbnVtYmVyID0gMDtcclxuXHJcbiAgICBwYWdlOiBudW1iZXIgPSAwO1xyXG5cclxuICAgIGRvY3VtZW50UmVzaXplTGlzdGVuZXI6IGFueTtcclxuXHJcbiAgICBfbnVtVmlzaWJsZTpudW1iZXIgPSAwO1xyXG5cclxuICAgIGRfbnVtVmlzaWJsZTogbnVtYmVyID0gMDtcclxuXHJcbiAgICBfb2xkTnVtVmlzaWJsZTogbnVtYmVyID0gMDtcclxuXHJcbiAgICBfYWN0aXZlSW5kZXg6IG51bWJlciA9IDA7XHJcbiAgICBcclxuICAgIF9vbGRhY3RpdmVJbmRleDogbnVtYmVyID0gMDtcclxuXHJcbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGNkOiBDaGFuZ2VEZXRlY3RvclJlZikgeyB9XHJcblxyXG4gICAgbmdPbkluaXQoKSB7XHJcbiAgICAgICAgdGhpcy5jcmVhdGVTdHlsZSgpO1xyXG5cclxuXHRcdGlmICh0aGlzLnJlc3BvbnNpdmVPcHRpb25zKSB7XHJcblx0XHRcdHRoaXMuYmluZERvY3VtZW50TGlzdGVuZXJzKCk7XHJcblx0XHR9XHJcbiAgICB9XHJcblxyXG4gICAgbmdBZnRlckNvbnRlbnRDaGVja2VkKCkge1xyXG4gICAgICAgIGxldCB0b3RhbFNoaWZ0ZWRJdGVtcyA9IHRoaXMudG90YWxTaGlmdGVkSXRlbXM7XHJcblxyXG4gICAgICAgIGlmICgodGhpcy5fb2xkTnVtVmlzaWJsZSAhPT0gdGhpcy5kX251bVZpc2libGUgfHwgdGhpcy5fb2xkYWN0aXZlSW5kZXggIT09IHRoaXMuX2FjdGl2ZUluZGV4KSAmJiB0aGlzLml0ZW1zQ29udGFpbmVyKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9hY3RpdmVJbmRleCA8PSB0aGlzLmdldE1lZGlhbkl0ZW1JbmRleCgpKSB7XHJcbiAgICAgICAgICAgICAgICB0b3RhbFNoaWZ0ZWRJdGVtcyA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAodGhpcy52YWx1ZS5sZW5ndGggLSB0aGlzLmRfbnVtVmlzaWJsZSArIHRoaXMuZ2V0TWVkaWFuSXRlbUluZGV4KCkgPCB0aGlzLl9hY3RpdmVJbmRleCkge1xyXG4gICAgICAgICAgICAgICAgdG90YWxTaGlmdGVkSXRlbXMgPSB0aGlzLmRfbnVtVmlzaWJsZSAtIHRoaXMudmFsdWUubGVuZ3RoO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMudmFsdWUubGVuZ3RoIC0gdGhpcy5kX251bVZpc2libGUgPCB0aGlzLl9hY3RpdmVJbmRleCAmJiB0aGlzLmRfbnVtVmlzaWJsZSAlIDIgPT09IDApIHtcclxuICAgICAgICAgICAgICAgIHRvdGFsU2hpZnRlZEl0ZW1zID0gKHRoaXMuX2FjdGl2ZUluZGV4ICogLTEpICsgdGhpcy5nZXRNZWRpYW5JdGVtSW5kZXgoKSArIDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0b3RhbFNoaWZ0ZWRJdGVtcyA9ICh0aGlzLl9hY3RpdmVJbmRleCAqIC0xKSArIHRoaXMuZ2V0TWVkaWFuSXRlbUluZGV4KCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0b3RhbFNoaWZ0ZWRJdGVtcyAhPT0gdGhpcy50b3RhbFNoaWZ0ZWRJdGVtcykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy50b3RhbFNoaWZ0ZWRJdGVtcyA9IHRvdGFsU2hpZnRlZEl0ZW1zO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5pdGVtc0NvbnRhaW5lciAmJiB0aGlzLml0ZW1zQ29udGFpbmVyLm5hdGl2ZUVsZW1lbnQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaXRlbXNDb250YWluZXIubmF0aXZlRWxlbWVudC5zdHlsZS50cmFuc2Zvcm0gPSB0aGlzLmlzVmVydGljYWwgPyBgdHJhbnNsYXRlM2QoMCwgJHt0b3RhbFNoaWZ0ZWRJdGVtcyAqICgxMDAvIHRoaXMuZF9udW1WaXNpYmxlKX0lLCAwKWAgOiBgdHJhbnNsYXRlM2QoJHt0b3RhbFNoaWZ0ZWRJdGVtcyAqICgxMDAvIHRoaXMuZF9udW1WaXNpYmxlKX0lLCAwLCAwKWA7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9vbGRhY3RpdmVJbmRleCAhPT0gdGhpcy5fYWN0aXZlSW5kZXgpIHtcclxuICAgICAgICAgICAgICAgIERvbUhhbmRsZXIucmVtb3ZlQ2xhc3ModGhpcy5pdGVtc0NvbnRhaW5lci5uYXRpdmVFbGVtZW50LCAncC1pdGVtcy1oaWRkZW4nKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaXRlbXNDb250YWluZXIubmF0aXZlRWxlbWVudC5zdHlsZS50cmFuc2l0aW9uID0gJ3RyYW5zZm9ybSA1MDBtcyBlYXNlIDBzJztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5fb2xkYWN0aXZlSW5kZXggPSB0aGlzLl9hY3RpdmVJbmRleDtcclxuICAgICAgICAgICAgdGhpcy5fb2xkTnVtVmlzaWJsZSA9IHRoaXMuZF9udW1WaXNpYmxlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBuZ0FmdGVyVmlld0luaXQoKSB7XHJcblx0XHR0aGlzLmNhbGN1bGF0ZVBvc2l0aW9uKCk7XHJcbiAgICB9XHJcblxyXG4gICAgY3JlYXRlU3R5bGUoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLnRodW1ibmFpbHNTdHlsZSkge1xyXG4gICAgICAgICAgICB0aGlzLnRodW1ibmFpbHNTdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyk7XHJcbiAgICAgICAgICAgIHRoaXMudGh1bWJuYWlsc1N0eWxlLnR5cGUgPSAndGV4dC9jc3MnO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMudGh1bWJuYWlsc1N0eWxlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBpbm5lckhUTUwgPSBgXHJcbiAgICAgICAgICAgICMke3RoaXMuY29udGFpbmVySWR9IC5wLWdhbGxlcmlhLXRodW1ibmFpbC1pdGVtIHtcclxuICAgICAgICAgICAgICAgIGZsZXg6IDEgMCAkeyAoMTAwLyB0aGlzLmRfbnVtVmlzaWJsZSkgfSVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIGA7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnJlc3BvbnNpdmVPcHRpb25zKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc29ydGVkUmVzcG9uc2l2ZU9wdGlvbnMgPSBbLi4udGhpcy5yZXNwb25zaXZlT3B0aW9uc107XHJcbiAgICAgICAgICAgIHRoaXMuc29ydGVkUmVzcG9uc2l2ZU9wdGlvbnMuc29ydCgoZGF0YTEsIGRhdGEyKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZTEgPSBkYXRhMS5icmVha3BvaW50O1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWUyID0gZGF0YTIuYnJlYWtwb2ludDtcclxuICAgICAgICAgICAgICAgIGxldCByZXN1bHQgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh2YWx1ZTEgPT0gbnVsbCAmJiB2YWx1ZTIgIT0gbnVsbClcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSAtMTtcclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHZhbHVlMSAhPSBudWxsICYmIHZhbHVlMiA9PSBudWxsKVxyXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IDE7XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmICh2YWx1ZTEgPT0gbnVsbCAmJiB2YWx1ZTIgPT0gbnVsbClcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSAwO1xyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodHlwZW9mIHZhbHVlMSA9PT0gJ3N0cmluZycgJiYgdHlwZW9mIHZhbHVlMiA9PT0gJ3N0cmluZycpXHJcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gdmFsdWUxLmxvY2FsZUNvbXBhcmUodmFsdWUyLCB1bmRlZmluZWQsIHsgbnVtZXJpYzogdHJ1ZSB9KTtcclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSAodmFsdWUxIDwgdmFsdWUyKSA/IC0xIDogKHZhbHVlMSA+IHZhbHVlMikgPyAxIDogMDtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gLTEgKiByZXN1bHQ7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnNvcnRlZFJlc3BvbnNpdmVPcHRpb25zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgcmVzID0gdGhpcy5zb3J0ZWRSZXNwb25zaXZlT3B0aW9uc1tpXTtcclxuXHJcbiAgICAgICAgICAgICAgICBpbm5lckhUTUwgKz0gYFxyXG4gICAgICAgICAgICAgICAgICAgIEBtZWRpYSBzY3JlZW4gYW5kIChtYXgtd2lkdGg6ICR7cmVzLmJyZWFrcG9pbnR9KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICMke3RoaXMuY29udGFpbmVySWR9IC5wLWdhbGxlcmlhLXRodW1ibmFpbC1pdGVtIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZsZXg6IDEgMCAkeyAoMTAwLyByZXMubnVtVmlzaWJsZSkgfSVcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy50aHVtYm5haWxzU3R5bGUuaW5uZXJIVE1MID0gaW5uZXJIVE1MO1xyXG4gICAgfVxyXG5cclxuICAgIGNhbGN1bGF0ZVBvc2l0aW9uKCkge1xyXG4gICAgICAgIGlmICh0aGlzLml0ZW1zQ29udGFpbmVyICYmIHRoaXMuc29ydGVkUmVzcG9uc2l2ZU9wdGlvbnMpIHtcclxuICAgICAgICAgICAgbGV0IHdpbmRvd1dpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XHJcbiAgICAgICAgICAgIGxldCBtYXRjaGVkUmVzcG9uc2l2ZURhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICBudW1WaXNpYmxlOiB0aGlzLl9udW1WaXNpYmxlXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuc29ydGVkUmVzcG9uc2l2ZU9wdGlvbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCByZXMgPSB0aGlzLnNvcnRlZFJlc3BvbnNpdmVPcHRpb25zW2ldO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChwYXJzZUludChyZXMuYnJlYWtwb2ludCwgMTApID49IHdpbmRvd1dpZHRoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWF0Y2hlZFJlc3BvbnNpdmVEYXRhID0gcmVzO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5kX251bVZpc2libGUgIT09IG1hdGNoZWRSZXNwb25zaXZlRGF0YS5udW1WaXNpYmxlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRfbnVtVmlzaWJsZSA9IG1hdGNoZWRSZXNwb25zaXZlRGF0YS5udW1WaXNpYmxlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jZC5tYXJrRm9yQ2hlY2soKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBnZXRUYWJJbmRleChpbmRleCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmlzSXRlbUFjdGl2ZShpbmRleCkgPyAwIDogbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBuYXZGb3J3YXJkKGUpIHtcclxuICAgICAgICB0aGlzLnN0b3BUaGVTbGlkZVNob3coKTtcclxuXHJcbiAgICAgICAgbGV0IG5leHRJdGVtSW5kZXggPSB0aGlzLl9hY3RpdmVJbmRleCArIDE7XHJcbiAgICAgICAgaWYgKG5leHRJdGVtSW5kZXggKyB0aGlzLnRvdGFsU2hpZnRlZEl0ZW1zID4gdGhpcy5nZXRNZWRpYW5JdGVtSW5kZXgoKSAmJiAoKC0xICogdGhpcy50b3RhbFNoaWZ0ZWRJdGVtcykgPCB0aGlzLmdldFRvdGFsUGFnZU51bWJlcigpIC0gMSB8fCB0aGlzLmNpcmN1bGFyKSkge1xyXG4gICAgICAgICAgICB0aGlzLnN0ZXAoLTEpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGFjdGl2ZUluZGV4ID0gdGhpcy5jaXJjdWxhciAmJiAodGhpcy52YWx1ZS5sZW5ndGggLSAxKSA9PT0gdGhpcy5fYWN0aXZlSW5kZXggPyAwIDogbmV4dEl0ZW1JbmRleDtcclxuICAgICAgICB0aGlzLm9uQWN0aXZlSW5kZXhDaGFuZ2UuZW1pdChhY3RpdmVJbmRleCk7XHJcblxyXG4gICAgICAgIGlmIChlLmNhbmNlbGFibGUpIHtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBuYXZCYWNrd2FyZChlKSB7XHJcbiAgICAgICAgdGhpcy5zdG9wVGhlU2xpZGVTaG93KCk7XHJcblxyXG4gICAgICAgIGxldCBwcmV2SXRlbUluZGV4ID0gdGhpcy5fYWN0aXZlSW5kZXggIT09IDAgPyB0aGlzLl9hY3RpdmVJbmRleCAtIDEgOiAwO1xyXG4gICAgICAgIGxldCBkaWZmID0gcHJldkl0ZW1JbmRleCArIHRoaXMudG90YWxTaGlmdGVkSXRlbXM7XHJcbiAgICAgICAgaWYgKCh0aGlzLmRfbnVtVmlzaWJsZSAtIGRpZmYgLSAxKSA+IHRoaXMuZ2V0TWVkaWFuSXRlbUluZGV4KCkgJiYgKCgtMSAqIHRoaXMudG90YWxTaGlmdGVkSXRlbXMpICE9PSAwIHx8IHRoaXMuY2lyY3VsYXIpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3RlcCgxKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBhY3RpdmVJbmRleCA9IHRoaXMuY2lyY3VsYXIgJiYgdGhpcy5fYWN0aXZlSW5kZXggPT09IDAgPyB0aGlzLnZhbHVlLmxlbmd0aCAtIDEgOiBwcmV2SXRlbUluZGV4O1xyXG4gICAgICAgIHRoaXMub25BY3RpdmVJbmRleENoYW5nZS5lbWl0KGFjdGl2ZUluZGV4KTtcclxuXHJcbiAgICAgICAgaWYgKGUuY2FuY2VsYWJsZSkge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG9uSXRlbUNsaWNrKGluZGV4KSB7XHJcbiAgICAgICAgdGhpcy5zdG9wVGhlU2xpZGVTaG93KCk7XHJcblxyXG4gICAgICAgIGxldCBzZWxlY3RlZEl0ZW1JbmRleCA9IGluZGV4O1xyXG4gICAgICAgIGlmIChzZWxlY3RlZEl0ZW1JbmRleCAhPT0gdGhpcy5fYWN0aXZlSW5kZXgpIHtcclxuICAgICAgICAgICAgY29uc3QgZGlmZiA9IHNlbGVjdGVkSXRlbUluZGV4ICsgdGhpcy50b3RhbFNoaWZ0ZWRJdGVtcztcclxuICAgICAgICAgICAgbGV0IGRpciA9IDA7XHJcbiAgICAgICAgICAgIGlmIChzZWxlY3RlZEl0ZW1JbmRleCA8IHRoaXMuX2FjdGl2ZUluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICBkaXIgPSAodGhpcy5kX251bVZpc2libGUgLSBkaWZmIC0gMSkgLSB0aGlzLmdldE1lZGlhbkl0ZW1JbmRleCgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGRpciA+IDAgJiYgKC0xICogdGhpcy50b3RhbFNoaWZ0ZWRJdGVtcykgIT09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0ZXAoZGlyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGRpciA9IHRoaXMuZ2V0TWVkaWFuSXRlbUluZGV4KCkgLSBkaWZmO1xyXG4gICAgICAgICAgICAgICAgaWYgKGRpciA8IDAgJiYgKC0xICogdGhpcy50b3RhbFNoaWZ0ZWRJdGVtcykgPCB0aGlzLmdldFRvdGFsUGFnZU51bWJlcigpIC0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc3RlcChkaXIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLmFjdGl2ZUluZGV4ID0gc2VsZWN0ZWRJdGVtSW5kZXg7XHJcbiAgICAgICAgICAgIHRoaXMub25BY3RpdmVJbmRleENoYW5nZS5lbWl0KHRoaXMuYWN0aXZlSW5kZXgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzdGVwKGRpcikge1xyXG4gICAgICAgIGxldCB0b3RhbFNoaWZ0ZWRJdGVtcyA9IHRoaXMudG90YWxTaGlmdGVkSXRlbXMgKyBkaXI7XHJcblxyXG4gICAgICAgIGlmIChkaXIgPCAwICYmICgtMSAqIHRvdGFsU2hpZnRlZEl0ZW1zKSArIHRoaXMuZF9udW1WaXNpYmxlID4gKHRoaXMudmFsdWUubGVuZ3RoIC0gMSkpIHtcclxuICAgICAgICAgICAgdG90YWxTaGlmdGVkSXRlbXMgPSB0aGlzLmRfbnVtVmlzaWJsZSAtIHRoaXMudmFsdWUubGVuZ3RoO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChkaXIgPiAwICYmIHRvdGFsU2hpZnRlZEl0ZW1zID4gMCkge1xyXG4gICAgICAgICAgICB0b3RhbFNoaWZ0ZWRJdGVtcyA9IDA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5jaXJjdWxhcikge1xyXG4gICAgICAgICAgICBpZiAoZGlyIDwgMCAmJiB0aGlzLnZhbHVlLmxlbmd0aCAtIDEgPT09IHRoaXMuX2FjdGl2ZUluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICB0b3RhbFNoaWZ0ZWRJdGVtcyA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoZGlyID4gMCAmJiB0aGlzLl9hY3RpdmVJbmRleCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdG90YWxTaGlmdGVkSXRlbXMgPSB0aGlzLmRfbnVtVmlzaWJsZSAtIHRoaXMudmFsdWUubGVuZ3RoO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5pdGVtc0NvbnRhaW5lcikge1xyXG4gICAgICAgICAgICBEb21IYW5kbGVyLnJlbW92ZUNsYXNzKHRoaXMuaXRlbXNDb250YWluZXIubmF0aXZlRWxlbWVudCwgJ3AtaXRlbXMtaGlkZGVuJyk7XHJcbiAgICAgICAgICAgIHRoaXMuaXRlbXNDb250YWluZXIubmF0aXZlRWxlbWVudC5zdHlsZS50cmFuc2Zvcm0gPSB0aGlzLmlzVmVydGljYWwgPyBgdHJhbnNsYXRlM2QoMCwgJHt0b3RhbFNoaWZ0ZWRJdGVtcyAqICgxMDAvIHRoaXMuZF9udW1WaXNpYmxlKX0lLCAwKWAgOiBgdHJhbnNsYXRlM2QoJHt0b3RhbFNoaWZ0ZWRJdGVtcyAqICgxMDAvIHRoaXMuZF9udW1WaXNpYmxlKX0lLCAwLCAwKWA7XHJcbiAgICAgICAgICAgIHRoaXMuaXRlbXNDb250YWluZXIubmF0aXZlRWxlbWVudC5zdHlsZS50cmFuc2l0aW9uID0gJ3RyYW5zZm9ybSA1MDBtcyBlYXNlIDBzJztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMudG90YWxTaGlmdGVkSXRlbXMgPSB0b3RhbFNoaWZ0ZWRJdGVtcztcclxuICAgIH1cclxuXHJcbiAgICBzdG9wVGhlU2xpZGVTaG93KCkge1xyXG4gICAgICAgIGlmICh0aGlzLnNsaWRlU2hvd0FjdGl2ZSAmJiB0aGlzLnN0b3BTbGlkZVNob3cpIHtcclxuICAgICAgICAgICAgdGhpcy5zdG9wU2xpZGVTaG93LmVtaXQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY2hhbmdlUGFnZU9uVG91Y2goZSwgZGlmZikge1xyXG4gICAgICAgIGlmIChkaWZmIDwgMCkgeyAgICAgICAgICAgLy8gbGVmdFxyXG4gICAgICAgICAgICB0aGlzLm5hdkZvcndhcmQoZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgeyAgICAgICAgICAgICAgICAgICAgLy8gcmlnaHRcclxuICAgICAgICAgICAgdGhpcy5uYXZCYWNrd2FyZChlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGdldFRvdGFsUGFnZU51bWJlcigpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy52YWx1ZS5sZW5ndGggPiB0aGlzLmRfbnVtVmlzaWJsZSA/ICh0aGlzLnZhbHVlLmxlbmd0aCAtIHRoaXMuZF9udW1WaXNpYmxlKSArIDEgOiAwO1xyXG4gICAgfVxyXG5cclxuICAgIGdldE1lZGlhbkl0ZW1JbmRleCgpIHtcclxuICAgICAgICBsZXQgaW5kZXggPSBNYXRoLmZsb29yKHRoaXMuZF9udW1WaXNpYmxlIC8gMik7XHJcblxyXG4gICAgICAgIHJldHVybiAodGhpcy5kX251bVZpc2libGUgJSAyKSA/IGluZGV4IDogaW5kZXggLSAxO1xyXG4gICAgfVxyXG5cclxuICAgIG9uVHJhbnNpdGlvbkVuZCgpIHtcclxuICAgICAgICBpZiAodGhpcy5pdGVtc0NvbnRhaW5lciAmJiB0aGlzLml0ZW1zQ29udGFpbmVyLm5hdGl2ZUVsZW1lbnQpIHtcclxuICAgICAgICAgICAgRG9tSGFuZGxlci5hZGRDbGFzcyh0aGlzLml0ZW1zQ29udGFpbmVyLm5hdGl2ZUVsZW1lbnQsICdwLWl0ZW1zLWhpZGRlbicpO1xyXG4gICAgICAgICAgICB0aGlzLml0ZW1zQ29udGFpbmVyLm5hdGl2ZUVsZW1lbnQuc3R5bGUudHJhbnNpdGlvbiA9ICcnO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBvblRvdWNoRW5kKGUpIHtcclxuICAgICAgICBsZXQgdG91Y2hvYmogPSBlLmNoYW5nZWRUb3VjaGVzWzBdO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5pc1ZlcnRpY2FsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2hhbmdlUGFnZU9uVG91Y2goZSwgKHRvdWNob2JqLnBhZ2VZIC0gdGhpcy5zdGFydFBvcy55KSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmNoYW5nZVBhZ2VPblRvdWNoKGUsICh0b3VjaG9iai5wYWdlWCAtIHRoaXMuc3RhcnRQb3MueCkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBvblRvdWNoTW92ZShlKSB7XHJcbiAgICAgICAgaWYgKGUuY2FuY2VsYWJsZSkge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG9uVG91Y2hTdGFydChlKSB7XHJcbiAgICAgICAgbGV0IHRvdWNob2JqID0gZS5jaGFuZ2VkVG91Y2hlc1swXTtcclxuXHJcbiAgICAgICAgdGhpcy5zdGFydFBvcyA9IHtcclxuICAgICAgICAgICAgeDogdG91Y2hvYmoucGFnZVgsXHJcbiAgICAgICAgICAgIHk6IHRvdWNob2JqLnBhZ2VZXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBpc05hdkJhY2t3YXJkRGlzYWJsZWQoKSB7XHJcbiAgICAgICAgcmV0dXJuICghdGhpcy5jaXJjdWxhciAmJiB0aGlzLl9hY3RpdmVJbmRleCA9PT0gMCkgfHwgKHRoaXMudmFsdWUubGVuZ3RoIDw9IHRoaXMuZF9udW1WaXNpYmxlKTtcclxuICAgIH1cclxuXHJcbiAgICBpc05hdkZvcndhcmREaXNhYmxlZCgpIHtcclxuICAgICAgICByZXR1cm4gKCF0aGlzLmNpcmN1bGFyICYmIHRoaXMuX2FjdGl2ZUluZGV4ID09PSAodGhpcy52YWx1ZS5sZW5ndGggLSAxKSkgfHwgKHRoaXMudmFsdWUubGVuZ3RoIDw9IHRoaXMuZF9udW1WaXNpYmxlKTtcclxuICAgIH1cclxuXHJcbiAgICBmaXJzdEl0ZW1BY2l2ZUluZGV4KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnRvdGFsU2hpZnRlZEl0ZW1zICogLTE7XHJcbiAgICB9XHJcblxyXG4gICAgbGFzdEl0ZW1BY3RpdmVJbmRleCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5maXJzdEl0ZW1BY2l2ZUluZGV4KCkgKyB0aGlzLmRfbnVtVmlzaWJsZSAtIDE7XHJcbiAgICB9XHJcblxyXG4gICAgaXNJdGVtQWN0aXZlKGluZGV4KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZmlyc3RJdGVtQWNpdmVJbmRleCgpIDw9IGluZGV4ICYmIHRoaXMubGFzdEl0ZW1BY3RpdmVJbmRleCgpID49IGluZGV4O1xyXG4gICAgfVxyXG5cclxuICAgIGJpbmREb2N1bWVudExpc3RlbmVycygpIHtcclxuICAgICAgICBpZiAoIXRoaXMuZG9jdW1lbnRSZXNpemVMaXN0ZW5lcikge1xyXG4gICAgICAgICAgICB0aGlzLmRvY3VtZW50UmVzaXplTGlzdGVuZXIgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNhbGN1bGF0ZVBvc2l0aW9uKCk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5kb2N1bWVudFJlc2l6ZUxpc3RlbmVyKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdW5iaW5kRG9jdW1lbnRMaXN0ZW5lcnMoKSB7XHJcbiAgICAgICAgaWYodGhpcy5kb2N1bWVudFJlc2l6ZUxpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLmRvY3VtZW50UmVzaXplTGlzdGVuZXIpO1xyXG4gICAgICAgICAgICB0aGlzLmRvY3VtZW50UmVzaXplTGlzdGVuZXIgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBuZ09uRGVzdHJveSgpIHtcclxuICAgICAgICBpZiAodGhpcy5yZXNwb25zaXZlT3B0aW9ucykge1xyXG5cdFx0XHR0aGlzLnVuYmluZERvY3VtZW50TGlzdGVuZXJzKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy50aHVtYm5haWxzU3R5bGUpIHtcclxuICAgICAgICAgICAgdGhpcy50aHVtYm5haWxzU3R5bGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLnRodW1ibmFpbHNTdHlsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5ATmdNb2R1bGUoe1xyXG4gICAgaW1wb3J0czogW0NvbW1vbk1vZHVsZSwgU2hhcmVkTW9kdWxlLCBSaXBwbGVNb2R1bGVdLFxyXG4gICAgZXhwb3J0czogW0NvbW1vbk1vZHVsZSwgR2FsbGVyaWEsIEdhbGxlcmlhQ29udGVudCwgR2FsbGVyaWFJdGVtU2xvdCwgR2FsbGVyaWFJdGVtLCBHYWxsZXJpYVRodW1ibmFpbHMsIFNoYXJlZE1vZHVsZV0sXHJcbiAgICBkZWNsYXJhdGlvbnM6IFtHYWxsZXJpYSwgR2FsbGVyaWFDb250ZW50LCBHYWxsZXJpYUl0ZW1TbG90LCBHYWxsZXJpYUl0ZW0sIEdhbGxlcmlhVGh1bWJuYWlsc11cclxufSlcclxuZXhwb3J0IGNsYXNzIEdhbGxlcmlhTW9kdWxlIHsgfSJdfQ==