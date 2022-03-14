import { NgModule, Component, ElementRef, Input, Output, EventEmitter, forwardRef, Renderer2, ViewChild, ChangeDetectorRef, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { trigger, style, transition, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { DomHandler, ConnectedOverlayScrollHandler } from 'primeng/dom';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
export const COLORPICKER_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ColorPicker),
    multi: true
};
export class ColorPicker {
    constructor(el, renderer, cd) {
        this.el = el;
        this.renderer = renderer;
        this.cd = cd;
        this.format = 'hex';
        this.autoZIndex = true;
        this.baseZIndex = 0;
        this.showTransitionOptions = '.12s cubic-bezier(0, 0, 0.2, 1)';
        this.hideTransitionOptions = '.1s linear';
        this.onChange = new EventEmitter();
        this.onShow = new EventEmitter();
        this.onHide = new EventEmitter();
        this.value = { h: 0, s: 100, b: 100 };
        this.defaultColor = 'ff0000';
        this.onModelChange = () => { };
        this.onModelTouched = () => { };
    }
    set colorSelector(element) {
        this.colorSelectorViewChild = element;
    }
    set colorHandle(element) {
        this.colorHandleViewChild = element;
    }
    set hue(element) {
        this.hueViewChild = element;
    }
    set hueHandle(element) {
        this.hueHandleViewChild = element;
    }
    onHueMousedown(event) {
        if (this.disabled) {
            return;
        }
        this.bindDocumentMousemoveListener();
        this.bindDocumentMouseupListener();
        this.hueDragging = true;
        this.pickHue(event);
    }
    onHueTouchStart(event) {
        if (this.disabled) {
            return;
        }
        this.hueDragging = true;
        this.pickHue(event);
    }
    onColorTouchStart(event) {
        if (this.disabled) {
            return;
        }
        this.colorDragging = true;
        this.pickColor(event);
    }
    pickHue(event) {
        let top = this.hueViewChild.nativeElement.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0);
        this.value = this.validateHSB({
            h: Math.floor(360 * (150 - Math.max(0, Math.min(150, ((event.pageY || event.changedTouches[0].pageY) - top)))) / 150),
            s: this.value.s,
            b: this.value.b
        });
        this.updateColorSelector();
        this.updateUI();
        this.updateModel();
        this.onChange.emit({ originalEvent: event, value: this.getValueToUpdate() });
    }
    onColorMousedown(event) {
        if (this.disabled) {
            return;
        }
        this.bindDocumentMousemoveListener();
        this.bindDocumentMouseupListener();
        this.colorDragging = true;
        this.pickColor(event);
    }
    onMove(event) {
        if (this.colorDragging) {
            this.pickColor(event);
            event.preventDefault();
        }
        if (this.hueDragging) {
            this.pickHue(event);
            event.preventDefault();
        }
    }
    onDragEnd() {
        this.colorDragging = false;
        this.hueDragging = false;
        this.unbindDocumentMousemoveListener();
        this.unbindDocumentMouseupListener();
    }
    pickColor(event) {
        let rect = this.colorSelectorViewChild.nativeElement.getBoundingClientRect();
        let top = rect.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0);
        let left = rect.left + document.body.scrollLeft;
        let saturation = Math.floor(100 * (Math.max(0, Math.min(150, ((event.pageX || event.changedTouches[0].pageX) - left)))) / 150);
        let brightness = Math.floor(100 * (150 - Math.max(0, Math.min(150, ((event.pageY || event.changedTouches[0].pageY) - top)))) / 150);
        this.value = this.validateHSB({
            h: this.value.h,
            s: saturation,
            b: brightness
        });
        this.updateUI();
        this.updateModel();
        this.onChange.emit({ originalEvent: event, value: this.getValueToUpdate() });
    }
    getValueToUpdate() {
        let val;
        switch (this.format) {
            case 'hex':
                val = '#' + this.HSBtoHEX(this.value);
                break;
            case 'rgb':
                val = this.HSBtoRGB(this.value);
                break;
            case 'hsb':
                val = this.value;
                break;
        }
        return val;
    }
    updateModel() {
        this.onModelChange(this.getValueToUpdate());
    }
    writeValue(value) {
        if (value) {
            switch (this.format) {
                case 'hex':
                    this.value = this.HEXtoHSB(value);
                    break;
                case 'rgb':
                    this.value = this.RGBtoHSB(value);
                    break;
                case 'hsb':
                    this.value = value;
                    break;
            }
        }
        else {
            this.value = this.HEXtoHSB(this.defaultColor);
        }
        this.updateColorSelector();
        this.updateUI();
        this.cd.markForCheck();
    }
    updateColorSelector() {
        if (this.colorSelectorViewChild) {
            const hsb = {};
            hsb.s = 100;
            hsb.b = 100;
            hsb.h = this.value.h;
            this.colorSelectorViewChild.nativeElement.style.backgroundColor = '#' + this.HSBtoHEX(hsb);
        }
    }
    updateUI() {
        if (this.colorHandleViewChild && this.hueHandleViewChild.nativeElement) {
            this.colorHandleViewChild.nativeElement.style.left = Math.floor(150 * this.value.s / 100) + 'px';
            this.colorHandleViewChild.nativeElement.style.top = Math.floor(150 * (100 - this.value.b) / 100) + 'px';
            this.hueHandleViewChild.nativeElement.style.top = Math.floor(150 - (150 * this.value.h / 360)) + 'px';
        }
        this.inputBgColor = '#' + this.HSBtoHEX(this.value);
    }
    onInputFocus() {
        this.onModelTouched();
    }
    show() {
        this.overlayVisible = true;
    }
    onOverlayAnimationStart(event) {
        switch (event.toState) {
            case 'visible':
                if (!this.inline) {
                    this.overlay = event.element;
                    this.appendOverlay();
                    if (this.autoZIndex) {
                        this.overlay.style.zIndex = String(this.baseZIndex + (++DomHandler.zindex));
                    }
                    this.alignOverlay();
                    this.bindDocumentClickListener();
                    this.bindDocumentResizeListener();
                    this.bindScrollListener();
                    this.updateColorSelector();
                    this.updateUI();
                }
                break;
            case 'void':
                this.onOverlayHide();
                break;
        }
    }
    onOverlayAnimationEnd(event) {
        switch (event.toState) {
            case 'visible':
                if (!this.inline) {
                    this.onShow.emit({});
                }
                break;
            case 'void':
                this.onHide.emit({});
                break;
        }
    }
    appendOverlay() {
        if (this.appendTo) {
            if (this.appendTo === 'body')
                document.body.appendChild(this.overlay);
            else
                DomHandler.appendChild(this.overlay, this.appendTo);
        }
    }
    restoreOverlayAppend() {
        if (this.overlay && this.appendTo) {
            this.el.nativeElement.appendChild(this.overlay);
        }
    }
    alignOverlay() {
        if (this.appendTo)
            DomHandler.absolutePosition(this.overlay, this.inputViewChild.nativeElement);
        else
            DomHandler.relativePosition(this.overlay, this.inputViewChild.nativeElement);
    }
    hide() {
        this.overlayVisible = false;
        this.cd.markForCheck();
    }
    onInputClick() {
        this.selfClick = true;
        this.togglePanel();
    }
    togglePanel() {
        if (!this.overlayVisible)
            this.show();
        else
            this.hide();
    }
    onInputKeydown(event) {
        switch (event.which) {
            //space
            case 32:
                this.togglePanel();
                event.preventDefault();
                break;
            //escape and tab
            case 27:
            case 9:
                this.hide();
                break;
        }
    }
    onPanelClick() {
        this.selfClick = true;
    }
    registerOnChange(fn) {
        this.onModelChange = fn;
    }
    registerOnTouched(fn) {
        this.onModelTouched = fn;
    }
    setDisabledState(val) {
        this.disabled = val;
        this.cd.markForCheck();
    }
    bindDocumentClickListener() {
        if (!this.documentClickListener) {
            const documentTarget = this.el ? this.el.nativeElement.ownerDocument : 'document';
            this.documentClickListener = this.renderer.listen(documentTarget, 'click', () => {
                if (!this.selfClick) {
                    this.overlayVisible = false;
                    this.unbindDocumentClickListener();
                }
                this.selfClick = false;
                this.cd.markForCheck();
            });
        }
    }
    unbindDocumentClickListener() {
        if (this.documentClickListener) {
            this.documentClickListener();
            this.documentClickListener = null;
        }
    }
    bindDocumentMousemoveListener() {
        if (!this.documentMousemoveListener) {
            const documentTarget = this.el ? this.el.nativeElement.ownerDocument : 'document';
            this.documentMousemoveListener = this.renderer.listen(documentTarget, 'mousemove', (event) => {
                if (this.colorDragging) {
                    this.pickColor(event);
                }
                if (this.hueDragging) {
                    this.pickHue(event);
                }
            });
        }
    }
    unbindDocumentMousemoveListener() {
        if (this.documentMousemoveListener) {
            this.documentMousemoveListener();
            this.documentMousemoveListener = null;
        }
    }
    bindDocumentMouseupListener() {
        if (!this.documentMouseupListener) {
            const documentTarget = this.el ? this.el.nativeElement.ownerDocument : 'document';
            this.documentMouseupListener = this.renderer.listen(documentTarget, 'mouseup', () => {
                this.colorDragging = false;
                this.hueDragging = false;
                this.unbindDocumentMousemoveListener();
                this.unbindDocumentMouseupListener();
            });
        }
    }
    unbindDocumentMouseupListener() {
        if (this.documentMouseupListener) {
            this.documentMouseupListener();
            this.documentMouseupListener = null;
        }
    }
    bindDocumentResizeListener() {
        this.documentResizeListener = this.onWindowResize.bind(this);
        window.addEventListener('resize', this.documentResizeListener);
    }
    unbindDocumentResizeListener() {
        if (this.documentResizeListener) {
            window.removeEventListener('resize', this.documentResizeListener);
            this.documentResizeListener = null;
        }
    }
    onWindowResize() {
        this.hide();
    }
    bindScrollListener() {
        if (!this.scrollHandler) {
            this.scrollHandler = new ConnectedOverlayScrollHandler(this.containerViewChild.nativeElement, () => {
                if (this.overlayVisible) {
                    this.hide();
                }
            });
        }
        this.scrollHandler.bindScrollListener();
    }
    unbindScrollListener() {
        if (this.scrollHandler) {
            this.scrollHandler.unbindScrollListener();
        }
    }
    validateHSB(hsb) {
        return {
            h: Math.min(360, Math.max(0, hsb.h)),
            s: Math.min(100, Math.max(0, hsb.s)),
            b: Math.min(100, Math.max(0, hsb.b))
        };
    }
    validateRGB(rgb) {
        return {
            r: Math.min(255, Math.max(0, rgb.r)),
            g: Math.min(255, Math.max(0, rgb.g)),
            b: Math.min(255, Math.max(0, rgb.b))
        };
    }
    validateHEX(hex) {
        var len = 6 - hex.length;
        if (len > 0) {
            var o = [];
            for (var i = 0; i < len; i++) {
                o.push('0');
            }
            o.push(hex);
            hex = o.join('');
        }
        return hex;
    }
    HEXtoRGB(hex) {
        let hexValue = parseInt(((hex.indexOf('#') > -1) ? hex.substring(1) : hex), 16);
        return { r: hexValue >> 16, g: (hexValue & 0x00FF00) >> 8, b: (hexValue & 0x0000FF) };
    }
    HEXtoHSB(hex) {
        return this.RGBtoHSB(this.HEXtoRGB(hex));
    }
    RGBtoHSB(rgb) {
        var hsb = {
            h: 0,
            s: 0,
            b: 0
        };
        var min = Math.min(rgb.r, rgb.g, rgb.b);
        var max = Math.max(rgb.r, rgb.g, rgb.b);
        var delta = max - min;
        hsb.b = max;
        hsb.s = max != 0 ? 255 * delta / max : 0;
        if (hsb.s != 0) {
            if (rgb.r == max) {
                hsb.h = (rgb.g - rgb.b) / delta;
            }
            else if (rgb.g == max) {
                hsb.h = 2 + (rgb.b - rgb.r) / delta;
            }
            else {
                hsb.h = 4 + (rgb.r - rgb.g) / delta;
            }
        }
        else {
            hsb.h = -1;
        }
        hsb.h *= 60;
        if (hsb.h < 0) {
            hsb.h += 360;
        }
        hsb.s *= 100 / 255;
        hsb.b *= 100 / 255;
        return hsb;
    }
    HSBtoRGB(hsb) {
        var rgb = {
            r: null, g: null, b: null
        };
        let h = hsb.h;
        let s = hsb.s * 255 / 100;
        let v = hsb.b * 255 / 100;
        if (s == 0) {
            rgb = {
                r: v,
                g: v,
                b: v
            };
        }
        else {
            let t1 = v;
            let t2 = (255 - s) * v / 255;
            let t3 = (t1 - t2) * (h % 60) / 60;
            if (h == 360)
                h = 0;
            if (h < 60) {
                rgb.r = t1;
                rgb.b = t2;
                rgb.g = t2 + t3;
            }
            else if (h < 120) {
                rgb.g = t1;
                rgb.b = t2;
                rgb.r = t1 - t3;
            }
            else if (h < 180) {
                rgb.g = t1;
                rgb.r = t2;
                rgb.b = t2 + t3;
            }
            else if (h < 240) {
                rgb.b = t1;
                rgb.r = t2;
                rgb.g = t1 - t3;
            }
            else if (h < 300) {
                rgb.b = t1;
                rgb.g = t2;
                rgb.r = t2 + t3;
            }
            else if (h < 360) {
                rgb.r = t1;
                rgb.g = t2;
                rgb.b = t1 - t3;
            }
            else {
                rgb.r = 0;
                rgb.g = 0;
                rgb.b = 0;
            }
        }
        return { r: Math.round(rgb.r), g: Math.round(rgb.g), b: Math.round(rgb.b) };
    }
    RGBtoHEX(rgb) {
        var hex = [
            rgb.r.toString(16),
            rgb.g.toString(16),
            rgb.b.toString(16)
        ];
        for (var key in hex) {
            if (hex[key].length == 1) {
                hex[key] = '0' + hex[key];
            }
        }
        return hex.join('');
    }
    HSBtoHEX(hsb) {
        return this.RGBtoHEX(this.HSBtoRGB(hsb));
    }
    onOverlayHide() {
        this.unbindScrollListener();
        this.unbindDocumentResizeListener();
        this.unbindDocumentClickListener();
        this.overlay = null;
    }
    ngOnDestroy() {
        if (this.scrollHandler) {
            this.scrollHandler.destroy();
            this.scrollHandler = null;
        }
        this.restoreOverlayAppend();
        this.onOverlayHide();
    }
}
ColorPicker.decorators = [
    { type: Component, args: [{
                selector: 'p-colorPicker',
                template: `
        <div #container [ngStyle]="style" [class]="styleClass" [ngClass]="{'p-colorpicker p-component':true,'p-colorpicker-overlay':!inline,'p-colorpicker-dragging':colorDragging||hueDragging}">
            <input #input type="text" *ngIf="!inline" class="p-colorpicker-preview p-inputtext" readonly="readonly" [ngClass]="{'p-disabled': disabled}"
                (focus)="onInputFocus()" (click)="onInputClick()" (keydown)="onInputKeydown($event)" [attr.id]="inputId" [attr.tabindex]="tabindex" [disabled]="disabled"
                [style.backgroundColor]="inputBgColor">
            <div *ngIf="inline || overlayVisible" [ngClass]="{'p-colorpicker-panel': true, 'p-colorpicker-overlay-panel':!inline, 'p-disabled': disabled}" (click)="onPanelClick()"
                [@overlayAnimation]="{value: 'visible', params: {showTransitionParams: showTransitionOptions, hideTransitionParams: hideTransitionOptions}}" [@.disabled]="inline === true" 
                    (@overlayAnimation.start)="onOverlayAnimationStart($event)" (@overlayAnimation.done)="onOverlayAnimationEnd($event)">
                <div class="p-colorpicker-content">
                    <div #colorSelector class="p-colorpicker-color-selector" (touchstart)="onColorTouchStart($event)" (touchmove)="onMove($event)" (touchend)="onDragEnd()" (mousedown)="onColorMousedown($event)">
                        <div class="p-colorpicker-color">
                            <div #colorHandle class="p-colorpicker-color-handle"></div>
                        </div>
                    </div>
                    <div #hue class="p-colorpicker-hue" (mousedown)="onHueMousedown($event)" (touchstart)="onHueTouchStart($event)" (touchmove)="onMove($event)" (touchend)="onDragEnd()">
                        <div #hueHandle class="p-colorpicker-hue-handle"></div>
                    </div>
                </div>
            </div>
        </div>
    `,
                animations: [
                    trigger('overlayAnimation', [
                        transition(':enter', [
                            style({ opacity: 0, transform: 'scaleY(0.8)' }),
                            animate('{{showTransitionParams}}')
                        ]),
                        transition(':leave', [
                            animate('{{hideTransitionParams}}', style({ opacity: 0 }))
                        ])
                    ])
                ],
                providers: [COLORPICKER_VALUE_ACCESSOR],
                changeDetection: ChangeDetectionStrategy.OnPush,
                encapsulation: ViewEncapsulation.None,
                styles: [".p-colorpicker{display:inline-block}.p-colorpicker-dragging{cursor:pointer}.p-colorpicker-overlay{position:relative}.p-colorpicker-panel{height:166px;position:relative;width:193px}.p-colorpicker-overlay-panel{position:absolute}.p-colorpicker-preview{cursor:pointer}.p-colorpicker-panel .p-colorpicker-content{position:relative}.p-colorpicker-panel .p-colorpicker-color-selector{height:150px;left:8px;position:absolute;top:8px;width:150px}.p-colorpicker-panel .p-colorpicker-color{height:150px;width:150px}.p-colorpicker-panel .p-colorpicker-color-handle{border-radius:100%;border-style:solid;border-width:1px;cursor:pointer;height:10px;left:150px;margin:-5px 0 0 -5px;opacity:.85;position:absolute;top:0;width:10px}.p-colorpicker-panel .p-colorpicker-hue{height:150px;left:167px;opacity:.85;position:absolute;top:8px;width:17px}.p-colorpicker-panel .p-colorpicker-hue-handle{border-style:solid;border-width:2px;cursor:pointer;height:10px;left:0;margin-left:-2px;margin-top:-5px;opacity:.85;position:absolute;top:150px;width:21px}"]
            },] }
];
ColorPicker.ctorParameters = () => [
    { type: ElementRef },
    { type: Renderer2 },
    { type: ChangeDetectorRef }
];
ColorPicker.propDecorators = {
    style: [{ type: Input }],
    styleClass: [{ type: Input }],
    inline: [{ type: Input }],
    format: [{ type: Input }],
    appendTo: [{ type: Input }],
    disabled: [{ type: Input }],
    tabindex: [{ type: Input }],
    inputId: [{ type: Input }],
    autoZIndex: [{ type: Input }],
    baseZIndex: [{ type: Input }],
    showTransitionOptions: [{ type: Input }],
    hideTransitionOptions: [{ type: Input }],
    onChange: [{ type: Output }],
    onShow: [{ type: Output }],
    onHide: [{ type: Output }],
    containerViewChild: [{ type: ViewChild, args: ['container',] }],
    inputViewChild: [{ type: ViewChild, args: ['input',] }],
    colorSelector: [{ type: ViewChild, args: ['colorSelector',] }],
    colorHandle: [{ type: ViewChild, args: ['colorHandle',] }],
    hue: [{ type: ViewChild, args: ['hue',] }],
    hueHandle: [{ type: ViewChild, args: ['hueHandle',] }]
};
export class ColorPickerModule {
}
ColorPickerModule.decorators = [
    { type: NgModule, args: [{
                imports: [CommonModule],
                exports: [ColorPicker],
                declarations: [ColorPicker]
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sb3JwaWNrZXIuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4vc3JjL2FwcC9jb21wb25lbnRzL2NvbG9ycGlja2VyLyIsInNvdXJjZXMiOlsiY29sb3JwaWNrZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQWEsWUFBWSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLGlCQUFpQixFQUFFLHVCQUF1QixFQUFFLGlCQUFpQixFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3pNLE9BQU8sRUFBRSxPQUFPLEVBQVMsS0FBSyxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQWtCLE1BQU0scUJBQXFCLENBQUM7QUFDakcsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxVQUFVLEVBQUUsNkJBQTZCLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDeEUsT0FBTyxFQUFFLGlCQUFpQixFQUF3QixNQUFNLGdCQUFnQixDQUFDO0FBRXpFLE1BQU0sQ0FBQyxNQUFNLDBCQUEwQixHQUFRO0lBQzNDLE9BQU8sRUFBRSxpQkFBaUI7SUFDMUIsV0FBVyxFQUFFLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUM7SUFDMUMsS0FBSyxFQUFFLElBQUk7Q0FDZCxDQUFDO0FBeUNGLE1BQU0sT0FBTyxXQUFXO0lBK0VwQixZQUFtQixFQUFjLEVBQVMsUUFBbUIsRUFBUyxFQUFxQjtRQUF4RSxPQUFFLEdBQUYsRUFBRSxDQUFZO1FBQVMsYUFBUSxHQUFSLFFBQVEsQ0FBVztRQUFTLE9BQUUsR0FBRixFQUFFLENBQW1CO1FBdkVsRixXQUFNLEdBQVcsS0FBSyxDQUFDO1FBVXZCLGVBQVUsR0FBWSxJQUFJLENBQUM7UUFFM0IsZUFBVSxHQUFXLENBQUMsQ0FBQztRQUV2QiwwQkFBcUIsR0FBVyxpQ0FBaUMsQ0FB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QUM7Z0JBQUMsR0FBRyxDQUFDLENBQUMsR0FBQyxFQUFFLEdBQUMsRUFBRSxDQUFBO2FBQUM7aUJBQzVDLElBQUksQ0FBQyxHQUFDLEdBQUcsRUFBRTtnQkFBQyxHQUFHLENBQUMsQ0FBQyxHQUFDLEVBQUUsQ0FBQztnQkFBQyxHQUFHLENBQUMsQ0FBQyxHQUFDLEVBQUUsQ0FBQztnQkFBQyxHQUFHLENBQUMsQ0FBQyxHQUFDLEVBQUUsR0FBQyxFQUFFLENBQUE7YUFBQztpQkFDNUMsSUFBSSxDQUFDLEdBQUMsR0FBRyxFQUFFO2dCQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUMsRUFBRSxDQUFDO2dCQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUMsRUFBRSxDQUFDO2dCQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUMsRUFBRSxHQUFDLEVBQUUsQ0FBQTthQUFDO2lCQUM1QyxJQUFJLENBQUMsR0FBQyxHQUFHLEVBQUU7Z0JBQUMsR0FBRyxDQUFDLENBQUMsR0FBQyxFQUFFLENBQUM7Z0JBQUMsR0FBRyxDQUFDLENBQUMsR0FBQyxFQUFFLENBQUM7Z0JBQUMsR0FBRyxDQUFDLENBQUMsR0FBQyxFQUFFLEdBQUMsRUFBRSxDQUFBO2FBQUM7aUJBQzVDO2dCQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDO2dCQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDO2dCQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFBO2FBQUM7U0FDbkM7UUFDRCxPQUFPLEVBQUMsQ0FBQyxFQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQztJQUMzRSxDQUFDO0lBRUQsUUFBUSxDQUFDLEdBQUc7UUFDUixJQUFJLEdBQUcsR0FBRztZQUNOLEdBQUcsQ0FBQyxDQUFD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ZW50IjpbImltcG9ydCB7IE5nTW9kdWxlLCBDb21wb25lbnQsIEVsZW1lbnRSZWYsIElucHV0LCBPdXRwdXQsIE9uRGVzdHJveSwgRXZlbnRFbWl0dGVyLCBmb3J3YXJkUmVmLCBSZW5kZXJlcjIsIFZpZXdDaGlsZCwgQ2hhbmdlRGV0ZWN0b3JSZWYsIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LCBWaWV3RW5jYXBzdWxhdGlvbiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyB0cmlnZ2VyLCBzdGF0ZSwgc3R5bGUsIHRyYW5zaXRpb24sIGFuaW1hdGUsIEFuaW1hdGlvbkV2ZW50IH0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XHJcbmltcG9ydCB7IENvbW1vbk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XHJcbmltcG9ydCB7IERvbUhhbmRsZXIsIENvbm5lY3RlZE92ZXJsYXlTY3JvbGxIYW5kbGVyIH0gZnJvbSAncHJpbWVuZy9kb20nO1xyXG5pbXBvcnQgeyBOR19WQUxVRV9BQ0NFU1NPUiwgQ29udHJvbFZhbHVlQWNjZXNzb3IgfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XHJcblxyXG5leHBvcnQgY29uc3QgQ09MT1JQSUNLRVJfVkFMVUVfQUNDRVNTT1I6IGFueSA9IHtcclxuICAgIHByb3ZpZGU6IE5HX1ZBTFVFX0FDQ0VTU09SLFxyXG4gICAgdXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gQ29sb3JQaWNrZXIpLFxyXG4gICAgbXVsdGk6IHRydWVcclxufTtcclxuXHJcbkBDb21wb25lbnQoe1xyXG4gICAgc2VsZWN0b3I6ICdwLWNvbG9yUGlja2VyJyxcclxuICAgIHRlbXBsYXRlOiBgXHJcbiAgICAgICAgPGRpdiAjY29udGFpbmVyIFtuZ1N0eWxlXT1cInN0eWxlXCIgW2NsYXNzXT1cInN0eWxlQ2xhc3NcIiBbbmdDbGFzc109XCJ7J3AtY29sb3JwaWNrZXIgcC1jb21wb25lbnQnOnRydWUsJ3AtY29sb3JwaWNrZXItb3ZlcmxheSc6IWlubGluZSwncC1jb2xvcnBpY2tlci1kcmFnZ2luZyc6Y29sb3JEcmFnZ2luZ3x8aHVlRHJhZ2dpbmd9XCI+XHJcbiAgICAgICAgICAgIDxpbnB1dCAjaW5wdXQgdHlwZT1cInRleHRcIiAqbmdJZj1cIiFpbmxpbmVcIiBjbGFzcz1cInAtY29sb3JwaWNrZXItcHJldmlldyBwLWlucHV0dGV4dFwiIHJlYWRvbmx5PVwicmVhZG9ubHlcIiBbbmdDbGFzc109XCJ7J3AtZGlzYWJsZWQnOiBkaXNhYmxlZH1cIlxyXG4gICAgICAgICAgICAgICAgKGZvY3VzKT1cIm9uSW5wdXRGb2N1cygpXCIgKGNsaWNrKT1cIm9uSW5wdXRDbGljaygpXCIgKGtleWRvd24pPVwib25JbnB1dEtleWRvd24oJGV2ZW50KVwiIFthdHRyLmlkXT1cImlucHV0SWRcIiBbYXR0ci50YWJpbmRleF09XCJ0YWJpbmRleFwiIFtkaXNhYmxlZF09XCJkaXNhYmxlZFwiXHJcbiAgICAgICAgICAgICAgICBbc3R5bGUuYmFja2dyb3VuZENvbG9yXT1cImlucHV0QmdDb2xvclwiPlxyXG4gICAgICAgICAgICA8ZGl2ICpuZ0lmPVwiaW5saW5lIHx8IG92ZXJsYXlWaXNpYmxlXCIgW25nQ2xhc3NdPVwieydwLWNvbG9ycGlja2VyLXBhbmVsJzogdHJ1ZSwgJ3AtY29sb3JwaWNrZXItb3ZlcmxheS1wYW5lbCc6IWlubGluZSwgJ3AtZGlzYWJsZWQnOiBkaXNhYmxlZH1cIiAoY2xpY2spPVwib25QYW5lbENsaWNrKClcIlxyXG4gICAgICAgICAgICAgICAgW0BvdmVybGF5QW5pbWF0aW9uXT1cInt2YWx1ZTogJ3Zpc2libGUnLCBwYXJhbXM6IHtzaG93VHJhbnNpdGlvblBhcmFtczogc2hvd1RyYW5zaXRpb25PcHRpb25zLCBoaWRlVHJhbnNpdGlvblBhcmFtczogaGlkZVRyYW5zaXRpb25PcHRpb25zfX1cIiBbQC5kaXNhYmxlZF09XCJpbmxpbmUgPT09IHRydWVcIiBcclxuICAgICAgICAgICAgICAgICAgICAoQG92ZXJsYXlBbmltYXRpb24uc3RhcnQpPVwib25PdmVybGF5QW5pbWF0aW9uU3RhcnQoJGV2ZW50KVwiIChAb3ZlcmxheUFuaW1hdGlvbi5kb25lKT1cIm9uT3ZlcmxheUFuaW1hdGlvbkVuZCgkZXZlbnQpXCI+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicC1jb2xvcnBpY2tlci1jb250ZW50XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiAjY29sb3JTZWxlY3RvciBjbGFzcz1cInAtY29sb3JwaWNrZXItY29sb3Itc2VsZWN0b3JcIiAodG91Y2hzdGFydCk9XCJvbkNvbG9yVG91Y2hTdGFydCgkZXZlbnQpXCIgKHRvdWNobW92ZSk9XCJvbk1vdmUoJGV2ZW50KVwiICh0b3VjaGVuZCk9XCJvbkRyYWdFbmQoKVwiIChtb3VzZWRvd24pPVwib25Db2xvck1vdXNlZG93bigkZXZlbnQpXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwLWNvbG9ycGlja2VyLWNvbG9yXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2ICNjb2xvckhhbmRsZSBjbGFzcz1cInAtY29sb3JwaWNrZXItY29sb3ItaGFuZGxlXCI+PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgI2h1ZSBjbGFzcz1cInAtY29sb3JwaWNrZXItaHVlXCIgKG1vdXNlZG93bik9XCJvbkh1ZU1vdXNlZG93bigkZXZlbnQpXCIgKHRvdWNoc3RhcnQpPVwib25IdWVUb3VjaFN0YXJ0KCRldmVudClcIiAodG91Y2htb3ZlKT1cIm9uTW92ZSgkZXZlbnQpXCIgKHRvdWNoZW5kKT1cIm9uRHJhZ0VuZCgpXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgI2h1ZUhhbmRsZSBjbGFzcz1cInAtY29sb3JwaWNrZXItaHVlLWhhbmRsZVwiPjwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgYCxcclxuICAgIGFuaW1hdGlvbnM6IFtcclxuICAgICAgICB0cmlnZ2VyKCdvdmVybGF5QW5pbWF0aW9uJywgW1xyXG4gICAgICAgICAgICB0cmFuc2l0aW9uKCc6ZW50ZXInLCBbXHJcbiAgICAgICAgICAgICAgICBzdHlsZSh7b3BhY2l0eTogMCwgdHJhbnNmb3JtOiAnc2NhbGVZKDAuOCknfSksXHJcbiAgICAgICAgICAgICAgICBhbmltYXRlKCd7e3Nob3dUcmFuc2l0aW9uUGFyYW1zfX0nKVxyXG4gICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICAgIHRyYW5zaXRpb24oJzpsZWF2ZScsIFtcclxuICAgICAgICAgICAgICAgIGFuaW1hdGUoJ3t7aGlkZVRyYW5zaXRpb25QYXJhbXN9fScsIHN0eWxlKHsgb3BhY2l0eTogMCB9KSlcclxuICAgICAgICAgICAgICBdKVxyXG4gICAgICAgIF0pXHJcbiAgICBdLFxyXG4gICAgcHJvdmlkZXJzOiBbQ09MT1JQSUNLRVJfVkFMVUVfQUNDRVNTT1JdLFxyXG4gICAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXHJcbiAgICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxyXG4gICAgc3R5bGVVcmxzOiBbJy4vY29sb3JwaWNrZXIuY3NzJ11cclxufSlcclxuZXhwb3J0IGNsYXNzIENvbG9yUGlja2VyIGltcGxlbWVudHMgQ29udHJvbFZhbHVlQWNjZXNzb3IsIE9uRGVzdHJveSB7XHJcblxyXG4gICAgQElucHV0KCkgc3R5bGU6IGFueTtcclxuXHJcbiAgICBASW5wdXQoKSBzdHlsZUNsYXNzOiBzdHJpbmc7XHJcblxyXG4gICAgQElucHV0KCkgaW5saW5lOiBib29sZWFuO1xyXG5cclxuICAgIEBJbnB1dCgpIGZvcm1hdDogc3RyaW5nID0gJ2hleCc7XHJcblxyXG4gICAgQElucHV0KCkgYXBwZW5kVG86IGFueTtcclxuXHJcbiAgICBASW5wdXQoKSBkaXNhYmxlZDogYm9vbGVhbjtcclxuXHJcbiAgICBASW5wdXQoKSB0YWJpbmRleDogc3RyaW5nO1xyXG5cclxuICAgIEBJbnB1dCgpIGlucHV0SWQ6IHN0cmluZztcclxuXHJcbiAgICBASW5wdXQoKSBhdXRvWkluZGV4OiBib29sZWFuID0gdHJ1ZTtcclxuXHJcbiAgICBASW5wdXQoKSBiYXNlWkluZGV4OiBudW1iZXIgPSAwO1xyXG5cclxuICAgIEBJbnB1dCgpIHNob3dUcmFuc2l0aW9uT3B0aW9uczogc3RyaW5nID0gJy4xMnMgY3ViaWMtYmV6aWVyKDAsIDAsIDAuMiwgMSknO1xyXG5cclxuICAgIEBJbnB1dCgpIGhpZGVUcmFuc2l0aW9uT3B0aW9uczogc3RyaW5nID0gJy4xcyBsaW5lYXInO1xyXG5cclxuICAgIEBPdXRwdXQoKSBvbkNoYW5nZTogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XHJcblxyXG4gICAgQE91dHB1dCgpIG9uU2hvdzogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XHJcblxyXG4gICAgQE91dHB1dCgpIG9uSGlkZTogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XHJcblxyXG5cclxuICAgIEBWaWV3Q2hpbGQoJ2NvbnRhaW5lcicpIGNvbnRhaW5lclZpZXdDaGlsZDogRWxlbWVudFJlZjtcclxuXHJcbiAgICBAVmlld0NoaWxkKCdpbnB1dCcpIGlucHV0Vmlld0NoaWxkOiBFbGVtZW50UmVmO1xyXG5cclxuICAgIHZhbHVlOiBhbnkgPSB7aDowLCBzOiAxMDAsIGI6IDEwMH07XHJcblxyXG4gICAgaW5wdXRCZ0NvbG9yOiBzdHJpbmc7XHJcblxyXG4gICAgc2hvd246IGJvb2xlYW47XHJcblxyXG4gICAgb3ZlcmxheVZpc2libGU6IGJvb2xlYW47XHJcblxyXG4gICAgZGVmYXVsdENvbG9yOiBzdHJpbmcgPSAnZmYwMDAwJztcclxuXHJcbiAgICBvbk1vZGVsQ2hhbmdlOiBGdW5jdGlvbiA9ICgpID0+IHt9O1xyXG5cclxuICAgIG9uTW9kZWxUb3VjaGVkOiBGdW5jdGlvbiA9ICgpID0+IHt9O1xyXG5cclxuICAgIGRvY3VtZW50Q2xpY2tMaXN0ZW5lcjogRnVuY3Rpb247XHJcblxyXG4gICAgZG9jdW1lbnRSZXNpemVMaXN0ZW5lcjogYW55O1xyXG5cclxuICAgIGRvY3VtZW50TW91c2Vtb3ZlTGlzdGVuZXI6IEZ1bmN0aW9uO1xyXG5cclxuICAgIGRvY3VtZW50TW91c2V1cExpc3RlbmVyOiBGdW5jdGlvbjtcclxuXHJcbiAgICBkb2N1bWVudEh1ZU1vdmVMaXN0ZW5lcjogRnVuY3Rpb247XHJcblxyXG4gICAgc2Nyb2xsSGFuZGxlcjogYW55O1xyXG5cclxuICAgIHNlbGZDbGljazogYm9vbGVhbjtcclxuXHJcbiAgICBjb2xvckRyYWdnaW5nOiBib29sZWFuO1xyXG5cclxuICAgIGh1ZURyYWdnaW5nOiBib29sZWFuO1xyXG5cclxuICAgIG92ZXJsYXk6IEhUTUxEaXZFbGVtZW50O1xyXG5cclxuICAgIGNvbG9yU2VsZWN0b3JWaWV3Q2hpbGQ6IEVsZW1lbnRSZWY7XHJcblxyXG4gICAgY29sb3JIYW5kbGVWaWV3Q2hpbGQ6IEVsZW1lbnRSZWY7XHJcblxyXG4gICAgaHVlVmlld0NoaWxkOiBFbGVtZW50UmVmO1xyXG5cclxuICAgIGh1ZUhhbmRsZVZpZXdDaGlsZDogRWxlbWVudFJlZjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgZWw6IEVsZW1lbnRSZWYsIHB1YmxpYyByZW5kZXJlcjogUmVuZGVyZXIyLCBwdWJsaWMgY2Q6IENoYW5nZURldGVjdG9yUmVmKSB7fVxyXG5cclxuICAgIEBWaWV3Q2hpbGQoJ2NvbG9yU2VsZWN0b3InKSBzZXQgY29sb3JTZWxlY3RvcihlbGVtZW50OiBFbGVtZW50UmVmKSB7XHJcbiAgICAgICAgdGhpcy5jb2xvclNlbGVjdG9yVmlld0NoaWxkID0gZWxlbWVudDtcclxuICAgIH1cclxuXHJcbiAgICBAVmlld0NoaWxkKCdjb2xvckhhbmRsZScpIHNldCBjb2xvckhhbmRsZShlbGVtZW50OiBFbGVtZW50UmVmKSB7XHJcbiAgICAgICAgdGhpcy5jb2xvckhhbmRsZVZpZXdDaGlsZCA9IGVsZW1lbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgQFZpZXdDaGlsZCgnaHVlJykgc2V0IGh1ZShlbGVtZW50OiBFbGVtZW50UmVmKSB7XHJcbiAgICAgICAgdGhpcy5odWVWaWV3Q2hpbGQgPSBlbGVtZW50O1xyXG4gICAgfVxyXG5cclxuICAgIEBWaWV3Q2hpbGQoJ2h1ZUhhbmRsZScpIHNldCBodWVIYW5kbGUoZWxlbWVudDogRWxlbWVudFJlZikge1xyXG4gICAgICAgIHRoaXMuaHVlSGFuZGxlVmlld0NoaWxkID0gZWxlbWVudDtcclxuICAgIH1cclxuXHJcbiAgICBvbkh1ZU1vdXNlZG93bihldmVudDogTW91c2VFdmVudCkge1xyXG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuYmluZERvY3VtZW50TW91c2Vtb3ZlTGlzdGVuZXIoKTtcclxuICAgICAgICB0aGlzLmJpbmREb2N1bWVudE1vdXNldXBMaXN0ZW5lcigpO1xyXG5cclxuICAgICAgICB0aGlzLmh1ZURyYWdnaW5nID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLnBpY2tIdWUoZXZlbnQpO1xyXG4gICAgfVxyXG5cclxuICAgIG9uSHVlVG91Y2hTdGFydChldmVudCkge1xyXG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuaHVlRHJhZ2dpbmcgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMucGlja0h1ZShldmVudCk7XHJcbiAgICB9XHJcblxyXG4gICAgb25Db2xvclRvdWNoU3RhcnQoZXZlbnQpIHtcclxuICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmNvbG9yRHJhZ2dpbmcgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMucGlja0NvbG9yKGV2ZW50KTtcclxuICAgIH1cclxuXHJcbiAgICBwaWNrSHVlKGV2ZW50KSB7XHJcbiAgICAgICAgbGV0IHRvcDogbnVtYmVyID0gdGhpcy5odWVWaWV3Q2hpbGQubmF0aXZlRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3AgKyAod2luZG93LnBhZ2VZT2Zmc2V0IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3AgfHwgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AgfHwgMCk7XHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IHRoaXMudmFsaWRhdGVIU0Ioe1xyXG4gICAgICAgICAgICBoOiBNYXRoLmZsb29yKDM2MCAqICgxNTAgLSBNYXRoLm1heCgwLCBNYXRoLm1pbigxNTAsICgoZXZlbnQucGFnZVkgfHwgZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0ucGFnZVkpIC0gdG9wKSkpKSAvIDE1MCksXHJcbiAgICAgICAgICAgIHM6IHRoaXMudmFsdWUucyxcclxuICAgICAgICAgICAgYjogdGhpcy52YWx1ZS5iXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMudXBkYXRlQ29sb3JTZWxlY3RvcigpO1xyXG4gICAgICAgIHRoaXMudXBkYXRlVUkoKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZU1vZGVsKCk7XHJcbiAgICAgICAgdGhpcy5vbkNoYW5nZS5lbWl0KHtvcmlnaW5hbEV2ZW50OiBldmVudCwgdmFsdWU6IHRoaXMuZ2V0VmFsdWVUb1VwZGF0ZSgpfSk7XHJcbiAgICB9XHJcblxyXG4gICAgb25Db2xvck1vdXNlZG93bihldmVudDogTW91c2VFdmVudCkge1xyXG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuYmluZERvY3VtZW50TW91c2Vtb3ZlTGlzdGVuZXIoKTtcclxuICAgICAgICB0aGlzLmJpbmREb2N1bWVudE1vdXNldXBMaXN0ZW5lcigpO1xyXG5cclxuICAgICAgICB0aGlzLmNvbG9yRHJhZ2dpbmcgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMucGlja0NvbG9yKGV2ZW50KTtcclxuICAgIH1cclxuXHJcbiAgICBvbk1vdmUoZXZlbnQpIHtcclxuICAgICAgICBpZiAodGhpcy5jb2xvckRyYWdnaW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGlja0NvbG9yKGV2ZW50KTtcclxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmh1ZURyYWdnaW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMucGlja0h1ZShldmVudCk7XHJcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG9uRHJhZ0VuZCgpIHtcclxuICAgICAgICB0aGlzLmNvbG9yRHJhZ2dpbmcgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmh1ZURyYWdnaW5nID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMudW5iaW5kRG9jdW1lbnRNb3VzZW1vdmVMaXN0ZW5lcigpO1xyXG4gICAgICAgIHRoaXMudW5iaW5kRG9jdW1lbnRNb3VzZXVwTGlzdGVuZXIoKTtcclxuICAgIH1cclxuXHJcbiAgICBwaWNrQ29sb3IoZXZlbnQpIHtcclxuICAgICAgICBsZXQgcmVjdCA9IHRoaXMuY29sb3JTZWxlY3RvclZpZXdDaGlsZC5uYXRpdmVFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgIGxldCB0b3AgPSByZWN0LnRvcCArICh3aW5kb3cucGFnZVlPZmZzZXQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCB8fCBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCB8fCAwKTtcclxuICAgICAgICBsZXQgbGVmdCA9IHJlY3QubGVmdCArIGRvY3VtZW50LmJvZHkuc2Nyb2xsTGVmdDtcclxuICAgICAgICBsZXQgc2F0dXJhdGlvbiA9IE1hdGguZmxvb3IoMTAwICogKE1hdGgubWF4KDAsIE1hdGgubWluKDE1MCwgKChldmVudC5wYWdlWCB8fCBldmVudC5jaGFuZ2VkVG91Y2hlc1swXS5wYWdlWCktIGxlZnQpKSkpIC8gMTUwKTtcclxuICAgICAgICBsZXQgYnJpZ2h0bmVzcyA9IE1hdGguZmxvb3IoMTAwICogKDE1MCAtIE1hdGgubWF4KDAsIE1hdGgubWluKDE1MCwgKChldmVudC5wYWdlWSB8fCBldmVudC5jaGFuZ2VkVG91Y2hlc1swXS5wYWdlWSkgLSB0b3ApKSkpIC8gMTUwKTtcclxuICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy52YWxpZGF0ZUhTQih7XHJcbiAgICAgICAgICAgIGg6IHRoaXMudmFsdWUuaCxcclxuICAgICAgICAgICAgczogc2F0dXJhdGlvbixcclxuICAgICAgICAgICAgYjogYnJpZ2h0bmVzc1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZVVJKCk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVNb2RlbCgpO1xyXG4gICAgICAgIHRoaXMub25DaGFuZ2UuZW1pdCh7b3JpZ2luYWxFdmVudDogZXZlbnQsIHZhbHVlOiB0aGlzLmdldFZhbHVlVG9VcGRhdGUoKX0pO1xyXG4gICAgfVxyXG5cclxuICAgIGdldFZhbHVlVG9VcGRhdGUoKSB7XHJcbiAgICAgICAgbGV0IHZhbDogYW55O1xyXG4gICAgICAgIHN3aXRjaCh0aGlzLmZvcm1hdCkge1xyXG4gICAgICAgICAgICBjYXNlICdoZXgnOlxyXG4gICAgICAgICAgICAgICAgdmFsID0gJyMnICsgdGhpcy5IU0J0b0hFWCh0aGlzLnZhbHVlKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICBjYXNlICdyZ2InOlxyXG4gICAgICAgICAgICAgICAgdmFsID0gdGhpcy5IU0J0b1JHQih0aGlzLnZhbHVlKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICBjYXNlICdoc2InOlxyXG4gICAgICAgICAgICAgICAgdmFsID0gdGhpcy52YWx1ZTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdmFsO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZU1vZGVsKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMub25Nb2RlbENoYW5nZSh0aGlzLmdldFZhbHVlVG9VcGRhdGUoKSk7XHJcbiAgICB9XHJcblxyXG4gICAgd3JpdGVWYWx1ZSh2YWx1ZTogYW55KTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHN3aXRjaCh0aGlzLmZvcm1hdCkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnaGV4JzpcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy5IRVh0b0hTQih2YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgICAgICBjYXNlICdyZ2InOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudmFsdWUgPSB0aGlzLlJHQnRvSFNCKHZhbHVlKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgIGNhc2UgJ2hzYic6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSB0aGlzLkhFWHRvSFNCKHRoaXMuZGVmYXVsdENvbG9yKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMudXBkYXRlQ29sb3JTZWxlY3RvcigpO1xyXG4gICAgICAgIHRoaXMudXBkYXRlVUkoKTtcclxuICAgICAgICB0aGlzLmNkLm1hcmtGb3JDaGVjaygpO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZUNvbG9yU2VsZWN0b3IoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuY29sb3JTZWxlY3RvclZpZXdDaGlsZCkge1xyXG4gICAgICAgICAgICBjb25zdCBoc2I6IGFueSA9IHt9O1xyXG4gICAgICAgICAgICBoc2IucyA9IDEwMDtcclxuICAgICAgICAgICAgaHNiLmIgPSAxMDA7XHJcbiAgICAgICAgICAgIGhzYi5oID0gdGhpcy52YWx1ZS5oO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jb2xvclNlbGVjdG9yVmlld0NoaWxkLm5hdGl2ZUVsZW1lbnQuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJyMnICsgdGhpcy5IU0J0b0hFWChoc2IpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVVSSgpIHtcclxuICAgICAgICBpZiAodGhpcy5jb2xvckhhbmRsZVZpZXdDaGlsZCAmJiB0aGlzLmh1ZUhhbmRsZVZpZXdDaGlsZC5uYXRpdmVFbGVtZW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMuY29sb3JIYW5kbGVWaWV3Q2hpbGQubmF0aXZlRWxlbWVudC5zdHlsZS5sZWZ0ID0gIE1hdGguZmxvb3IoMTUwICogdGhpcy52YWx1ZS5zIC8gMTAwKSArICdweCc7XHJcbiAgICAgICAgICAgIHRoaXMuY29sb3JIYW5kbGVWaWV3Q2hpbGQubmF0aXZlRWxlbWVudC5zdHlsZS50b3AgPSAgTWF0aC5mbG9vcigxNTAgKiAoMTAwIC0gdGhpcy52YWx1ZS5iKSAvIDEwMCkgKyAncHgnO1xyXG4gICAgICAgICAgICB0aGlzLmh1ZUhhbmRsZVZpZXdDaGlsZC5uYXRpdmVFbGVtZW50LnN0eWxlLnRvcCA9IE1hdGguZmxvb3IoMTUwIC0gKDE1MCAqIHRoaXMudmFsdWUuaCAvIDM2MCkpICsgJ3B4JztcclxuXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmlucHV0QmdDb2xvciA9ICcjJyArIHRoaXMuSFNCdG9IRVgodGhpcy52YWx1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgb25JbnB1dEZvY3VzKCkge1xyXG4gICAgICAgIHRoaXMub25Nb2RlbFRvdWNoZWQoKTtcclxuICAgIH1cclxuXHJcbiAgICBzaG93KCkge1xyXG4gICAgICAgIHRoaXMub3ZlcmxheVZpc2libGUgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIG9uT3ZlcmxheUFuaW1hdGlvblN0YXJ0KGV2ZW50OiBBbmltYXRpb25FdmVudCkge1xyXG4gICAgICAgIHN3aXRjaChldmVudC50b1N0YXRlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgJ3Zpc2libGUnOlxyXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmlubGluZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3ZlcmxheSA9IGV2ZW50LmVsZW1lbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hcHBlbmRPdmVybGF5KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuYXV0b1pJbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm92ZXJsYXkuc3R5bGUuekluZGV4ID0gU3RyaW5nKHRoaXMuYmFzZVpJbmRleCArICgrK0RvbUhhbmRsZXIuemluZGV4KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWxpZ25PdmVybGF5KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5iaW5kRG9jdW1lbnRDbGlja0xpc3RlbmVyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5iaW5kRG9jdW1lbnRSZXNpemVMaXN0ZW5lcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYmluZFNjcm9sbExpc3RlbmVyKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ29sb3JTZWxlY3RvcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlVUkoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICBjYXNlICd2b2lkJzpcclxuICAgICAgICAgICAgICAgIHRoaXMub25PdmVybGF5SGlkZSgpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgb25PdmVybGF5QW5pbWF0aW9uRW5kKGV2ZW50OiBBbmltYXRpb25FdmVudCkge1xyXG4gICAgICAgIHN3aXRjaChldmVudC50b1N0YXRlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgJ3Zpc2libGUnOlxyXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmlubGluZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25TaG93LmVtaXQoe30pXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgY2FzZSAndm9pZCc6XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9uSGlkZS5lbWl0KHt9KVxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgYXBwZW5kT3ZlcmxheSgpIHtcclxuICAgICAgICBpZiAodGhpcy5hcHBlbmRUbykge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5hcHBlbmRUbyA9PT0gJ2JvZHknKVxyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLm92ZXJsYXkpO1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICBEb21IYW5kbGVyLmFwcGVuZENoaWxkKHRoaXMub3ZlcmxheSwgdGhpcy5hcHBlbmRUbyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJlc3RvcmVPdmVybGF5QXBwZW5kKCkge1xyXG4gICAgICAgIGlmICh0aGlzLm92ZXJsYXkgJiYgdGhpcy5hcHBlbmRUbykge1xyXG4gICAgICAgICAgICB0aGlzLmVsLm5hdGl2ZUVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5vdmVybGF5KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgYWxpZ25PdmVybGF5KCkge1xyXG4gICAgICAgIGlmICh0aGlzLmFwcGVuZFRvKVxyXG4gICAgICAgICAgICBEb21IYW5kbGVyLmFic29sdXRlUG9zaXRpb24odGhpcy5vdmVybGF5LCB0aGlzLmlucHV0Vmlld0NoaWxkLm5hdGl2ZUVsZW1lbnQpO1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICAgRG9tSGFuZGxlci5yZWxhdGl2ZVBvc2l0aW9uKHRoaXMub3ZlcmxheSwgdGhpcy5pbnB1dFZpZXdDaGlsZC5uYXRpdmVFbGVtZW50KTtcclxuICAgIH1cclxuXHJcbiAgICBoaWRlKCkge1xyXG4gICAgICAgIHRoaXMub3ZlcmxheVZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmNkLm1hcmtGb3JDaGVjaygpO1xyXG4gICAgfVxyXG5cclxuICAgIG9uSW5wdXRDbGljaygpIHtcclxuICAgICAgICB0aGlzLnNlbGZDbGljayA9IHRydWU7XHJcbiAgICAgICAgdGhpcy50b2dnbGVQYW5lbCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHRvZ2dsZVBhbmVsKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5vdmVybGF5VmlzaWJsZSlcclxuICAgICAgICAgICAgdGhpcy5zaG93KCk7XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB0aGlzLmhpZGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBvbklucHV0S2V5ZG93bihldmVudDogS2V5Ym9hcmRFdmVudCkge1xyXG4gICAgICAgIHN3aXRjaChldmVudC53aGljaCkge1xyXG4gICAgICAgICAgICAvL3NwYWNlXHJcbiAgICAgICAgICAgIGNhc2UgMzI6XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZVBhbmVsKCk7XHJcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgIC8vZXNjYXBlIGFuZCB0YWJcclxuICAgICAgICAgICAgY2FzZSAyNzpcclxuICAgICAgICAgICAgY2FzZSA5OlxyXG4gICAgICAgICAgICAgICAgdGhpcy5oaWRlKCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBvblBhbmVsQ2xpY2soKSB7XHJcbiAgICAgICAgdGhpcy5zZWxmQ2xpY2sgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHJlZ2lzdGVyT25DaGFuZ2UoZm46IEZ1bmN0aW9uKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5vbk1vZGVsQ2hhbmdlID0gZm47XHJcbiAgICB9XHJcblxyXG4gICAgcmVnaXN0ZXJPblRvdWNoZWQoZm46IEZ1bmN0aW9uKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5vbk1vZGVsVG91Y2hlZCA9IGZuO1xyXG4gICAgfVxyXG5cclxuICAgIHNldERpc2FibGVkU3RhdGUodmFsOiBib29sZWFuKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5kaXNhYmxlZCA9IHZhbDtcclxuICAgICAgICB0aGlzLmNkLm1hcmtGb3JDaGVjaygpO1xyXG4gICAgfVxyXG5cclxuICAgIGJpbmREb2N1bWVudENsaWNrTGlzdGVuZXIoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmRvY3VtZW50Q2xpY2tMaXN0ZW5lcikge1xyXG4gICAgICAgICAgICBjb25zdCBkb2N1bWVudFRhcmdldDogYW55ID0gdGhpcy5lbCA/IHRoaXMuZWwubmF0aXZlRWxlbWVudC5vd25lckRvY3VtZW50IDogJ2RvY3VtZW50JztcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZG9jdW1lbnRDbGlja0xpc3RlbmVyID0gdGhpcy5yZW5kZXJlci5saXN0ZW4oZG9jdW1lbnRUYXJnZXQsICdjbGljaycsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5zZWxmQ2xpY2spIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm92ZXJsYXlWaXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51bmJpbmREb2N1bWVudENsaWNrTGlzdGVuZXIoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGZDbGljayA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jZC5tYXJrRm9yQ2hlY2soKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHVuYmluZERvY3VtZW50Q2xpY2tMaXN0ZW5lcigpIHtcclxuICAgICAgICBpZiAodGhpcy5kb2N1bWVudENsaWNrTGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5kb2N1bWVudENsaWNrTGlzdGVuZXIoKTtcclxuICAgICAgICAgICAgdGhpcy5kb2N1bWVudENsaWNrTGlzdGVuZXIgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBiaW5kRG9jdW1lbnRNb3VzZW1vdmVMaXN0ZW5lcigpIHtcclxuICAgICAgICBpZiAoIXRoaXMuZG9jdW1lbnRNb3VzZW1vdmVMaXN0ZW5lcikge1xyXG4gICAgICAgICAgICBjb25zdCBkb2N1bWVudFRhcmdldDogYW55ID0gdGhpcy5lbCA/IHRoaXMuZWwubmF0aXZlRWxlbWVudC5vd25lckRvY3VtZW50IDogJ2RvY3VtZW50JztcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZG9jdW1lbnRNb3VzZW1vdmVMaXN0ZW5lciA9IHRoaXMucmVuZGVyZXIubGlzdGVuKGRvY3VtZW50VGFyZ2V0LCAnbW91c2Vtb3ZlJywgKGV2ZW50OiBNb3VzZUV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jb2xvckRyYWdnaW5nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5waWNrQ29sb3IoZXZlbnQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmh1ZURyYWdnaW5nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5waWNrSHVlKGV2ZW50KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHVuYmluZERvY3VtZW50TW91c2Vtb3ZlTGlzdGVuZXIoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZG9jdW1lbnRNb3VzZW1vdmVMaXN0ZW5lcikge1xyXG4gICAgICAgICAgICB0aGlzLmRvY3VtZW50TW91c2Vtb3ZlTGlzdGVuZXIoKTtcclxuICAgICAgICAgICAgdGhpcy5kb2N1bWVudE1vdXNlbW92ZUxpc3RlbmVyID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgYmluZERvY3VtZW50TW91c2V1cExpc3RlbmVyKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5kb2N1bWVudE1vdXNldXBMaXN0ZW5lcikge1xyXG4gICAgICAgICAgICBjb25zdCBkb2N1bWVudFRhcmdldDogYW55ID0gdGhpcy5lbCA/IHRoaXMuZWwubmF0aXZlRWxlbWVudC5vd25lckRvY3VtZW50IDogJ2RvY3VtZW50JztcclxuXHJcbiAgICAgICAgICAgIHRoaXMuZG9jdW1lbnRNb3VzZXVwTGlzdGVuZXIgPSB0aGlzLnJlbmRlcmVyLmxpc3Rlbihkb2N1bWVudFRhcmdldCwgJ21vdXNldXAnLCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbG9yRHJhZ2dpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuaHVlRHJhZ2dpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHRoaXMudW5iaW5kRG9jdW1lbnRNb3VzZW1vdmVMaXN0ZW5lcigpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy51bmJpbmREb2N1bWVudE1vdXNldXBMaXN0ZW5lcigpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdW5iaW5kRG9jdW1lbnRNb3VzZXVwTGlzdGVuZXIoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZG9jdW1lbnRNb3VzZXVwTGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5kb2N1bWVudE1vdXNldXBMaXN0ZW5lcigpO1xyXG4gICAgICAgICAgICB0aGlzLmRvY3VtZW50TW91c2V1cExpc3RlbmVyID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgYmluZERvY3VtZW50UmVzaXplTGlzdGVuZXIoKSB7XHJcbiAgICAgICAgdGhpcy5kb2N1bWVudFJlc2l6ZUxpc3RlbmVyID0gdGhpcy5vbldpbmRvd1Jlc2l6ZS5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLmRvY3VtZW50UmVzaXplTGlzdGVuZXIpO1xyXG4gICAgfVxyXG5cclxuICAgIHVuYmluZERvY3VtZW50UmVzaXplTGlzdGVuZXIoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZG9jdW1lbnRSZXNpemVMaXN0ZW5lcikge1xyXG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5kb2N1bWVudFJlc2l6ZUxpc3RlbmVyKTtcclxuICAgICAgICAgICAgdGhpcy5kb2N1bWVudFJlc2l6ZUxpc3RlbmVyID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgb25XaW5kb3dSZXNpemUoKSB7XHJcbiAgICAgICAgdGhpcy5oaWRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgYmluZFNjcm9sbExpc3RlbmVyKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5zY3JvbGxIYW5kbGVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2Nyb2xsSGFuZGxlciA9IG5ldyBDb25uZWN0ZWRPdmVybGF5U2Nyb2xsSGFuZGxlcih0aGlzLmNvbnRhaW5lclZpZXdDaGlsZC5uYXRpdmVFbGVtZW50LCAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vdmVybGF5VmlzaWJsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuc2Nyb2xsSGFuZGxlci5iaW5kU2Nyb2xsTGlzdGVuZXIoKTtcclxuICAgIH1cclxuXHJcbiAgICB1bmJpbmRTY3JvbGxMaXN0ZW5lcigpIHtcclxuICAgICAgICBpZiAodGhpcy5zY3JvbGxIYW5kbGVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2Nyb2xsSGFuZGxlci51bmJpbmRTY3JvbGxMaXN0ZW5lcigpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YWxpZGF0ZUhTQihoc2IpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBoOiBNYXRoLm1pbigzNjAsIE1hdGgubWF4KDAsIGhzYi5oKSksXHJcbiAgICAgICAgICAgIHM6IE1hdGgubWluKDEwMCwgTWF0aC5tYXgoMCwgaHNiLnMpKSxcclxuICAgICAgICAgICAgYjogTWF0aC5taW4oMTAwLCBNYXRoLm1heCgwLCBoc2IuYikpXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICB2YWxpZGF0ZVJHQihyZ2IpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByOiBNYXRoLm1pbigyNTUsIE1hdGgubWF4KDAsIHJnYi5yKSksXHJcbiAgICAgICAgICAgIGc6IE1hdGgubWluKDI1NSwgTWF0aC5tYXgoMCwgcmdiLmcpKSxcclxuICAgICAgICAgICAgYjogTWF0aC5taW4oMjU1LCBNYXRoLm1heCgwLCByZ2IuYikpXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICB2YWxpZGF0ZUhFWChoZXgpIHtcclxuICAgICAgICB2YXIgbGVuID0gNiAtIGhleC5sZW5ndGg7XHJcbiAgICAgICAgaWYgKGxlbiA+IDApIHtcclxuICAgICAgICAgICAgdmFyIG8gPSBbXTtcclxuICAgICAgICAgICAgZm9yICh2YXIgaT0wOyBpPGxlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBvLnB1c2goJzAnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBvLnB1c2goaGV4KTtcclxuICAgICAgICAgICAgaGV4ID0gby5qb2luKCcnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGhleDtcclxuICAgIH1cclxuXHJcbiAgICBIRVh0b1JHQihoZXgpIHtcclxuICAgICAgICBsZXQgaGV4VmFsdWUgPSBwYXJzZUludCgoKGhleC5pbmRleE9mKCcjJykgPiAtMSkgPyBoZXguc3Vic3RyaW5nKDEpIDogaGV4KSwgMTYpO1xyXG4gICAgICAgIHJldHVybiB7cjogaGV4VmFsdWUgPj4gMTYsIGc6IChoZXhWYWx1ZSAmIDB4MDBGRjAwKSA+PiA4LCBiOiAoaGV4VmFsdWUgJiAweDAwMDBGRil9O1xyXG4gICAgfVxyXG5cclxuICAgIEhFWHRvSFNCKGhleCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLlJHQnRvSFNCKHRoaXMuSEVYdG9SR0IoaGV4KSk7XHJcbiAgICB9XHJcblxyXG4gICAgUkdCdG9IU0IocmdiKSB7XHJcbiAgICAgICAgdmFyIGhzYiA9IHtcclxuICAgICAgICAgICAgaDogMCxcclxuICAgICAgICAgICAgczogMCxcclxuICAgICAgICAgICAgYjogMFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdmFyIG1pbiA9IE1hdGgubWluKHJnYi5yLCByZ2IuZywgcmdiLmIpO1xyXG4gICAgICAgIHZhciBtYXggPSBNYXRoLm1heChyZ2IuciwgcmdiLmcsIHJnYi5iKTtcclxuICAgICAgICB2YXIgZGVsdGEgPSBtYXggLSBtaW47XHJcbiAgICAgICAgaHNiLmIgPSBtYXg7XHJcbiAgICAgICAgaHNiLnMgPSBtYXggIT0gMCA/IDI1NSAqIGRlbHRhIC8gbWF4IDogMDtcclxuICAgICAgICBpZiAoaHNiLnMgIT0gMCkge1xyXG4gICAgICAgICAgICBpZiAocmdiLnIgPT0gbWF4KSB7XHJcbiAgICAgICAgICAgICAgICBoc2IuaCA9IChyZ2IuZyAtIHJnYi5iKSAvIGRlbHRhO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHJnYi5nID09IG1heCkge1xyXG4gICAgICAgICAgICAgICAgaHNiLmggPSAyICsgKHJnYi5iIC0gcmdiLnIpIC8gZGVsdGE7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBoc2IuaCA9IDQgKyAocmdiLnIgLSByZ2IuZykgLyBkZWx0YTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGhzYi5oID0gLTE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGhzYi5oICo9IDYwO1xyXG4gICAgICAgIGlmIChoc2IuaCA8IDApIHtcclxuICAgICAgICAgICAgaHNiLmggKz0gMzYwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBoc2IucyAqPSAxMDAvMjU1O1xyXG4gICAgICAgIGhzYi5iICo9IDEwMC8yNTU7XHJcbiAgICAgICAgcmV0dXJuIGhzYjtcclxuICAgIH1cclxuXHJcbiAgICBIU0J0b1JHQihoc2IpIHtcclxuICAgICAgICB2YXIgcmdiID0ge1xyXG4gICAgICAgICAgICByOiBudWxsLCBnOiBudWxsLCBiOiBudWxsXHJcbiAgICAgICAgfTtcclxuICAgICAgICBsZXQgaDogbnVtYmVyID0gaHNiLmg7XHJcbiAgICAgICAgbGV0IHM6IG51bWJlciA9IGhzYi5zKjI1NS8xMDA7XHJcbiAgICAgICAgbGV0IHY6IG51bWJlciA9IGhzYi5iKjI1NS8xMDA7XHJcbiAgICAgICAgaWYgKHMgPT0gMCkge1xyXG4gICAgICAgICAgICByZ2IgPSB7XHJcbiAgICAgICAgICAgICAgICByOiB2LFxyXG4gICAgICAgICAgICAgICAgZzogdixcclxuICAgICAgICAgICAgICAgIGI6IHZcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgbGV0IHQxOiBudW1iZXIgPSB2O1xyXG4gICAgICAgICAgICBsZXQgdDI6IG51bWJlciA9ICgyNTUtcykqdi8yNTU7XHJcbiAgICAgICAgICAgIGxldCB0MzogbnVtYmVyID0gKHQxLXQyKSooaCU2MCkvNjA7XHJcbiAgICAgICAgICAgIGlmIChoPT0zNjApIGggPSAwO1xyXG4gICAgICAgICAgICBpZiAoaDw2MCkge3JnYi5yPXQxO1x0cmdiLmI9dDI7IHJnYi5nPXQyK3QzfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChoPDEyMCkge3JnYi5nPXQxOyByZ2IuYj10MjtcdHJnYi5yPXQxLXQzfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChoPDE4MCkge3JnYi5nPXQxOyByZ2Iucj10MjtcdHJnYi5iPXQyK3QzfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChoPDI0MCkge3JnYi5iPXQxOyByZ2Iucj10MjtcdHJnYi5nPXQxLXQzfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChoPDMwMCkge3JnYi5iPXQxOyByZ2IuZz10MjtcdHJnYi5yPXQyK3QzfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChoPDM2MCkge3JnYi5yPXQxOyByZ2IuZz10MjtcdHJnYi5iPXQxLXQzfVxyXG4gICAgICAgICAgICBlbHNlIHtyZ2Iucj0wOyByZ2IuZz0wO1x0cmdiLmI9MH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHtyOk1hdGgucm91bmQocmdiLnIpLCBnOk1hdGgucm91bmQocmdiLmcpLCBiOk1hdGgucm91bmQocmdiLmIpfTtcclxuICAgIH1cclxuXHJcbiAgICBSR0J0b0hFWChyZ2IpIHtcclxuICAgICAgICB2YXIgaGV4ID0gW1xyXG4gICAgICAgICAgICByZ2Iuci50b1N0cmluZygxNiksXHJcbiAgICAgICAgICAgIHJnYi5nLnRvU3RyaW5nKDE2KSxcclxuICAgICAgICAgICAgcmdiLmIudG9TdHJpbmcoMTYpXHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAgZm9yKHZhciBrZXkgaW4gaGV4KSB7XHJcbiAgICAgICAgICAgIGlmIChoZXhba2V5XS5sZW5ndGggPT0gMSkge1xyXG4gICAgICAgICAgICAgICAgaGV4W2tleV0gPSAnMCcgKyBoZXhba2V5XTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGhleC5qb2luKCcnKTtcclxuICAgIH1cclxuXHJcbiAgICBIU0J0b0hFWChoc2IpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5SR0J0b0hFWCh0aGlzLkhTQnRvUkdCKGhzYikpO1xyXG4gICAgfVxyXG5cclxuICAgIG9uT3ZlcmxheUhpZGUoKSB7XHJcbiAgICAgICAgdGhpcy51bmJpbmRTY3JvbGxMaXN0ZW5lcigpO1xyXG4gICAgICAgIHRoaXMudW5iaW5kRG9jdW1lbnRSZXNpemVMaXN0ZW5lcigpO1xyXG4gICAgICAgIHRoaXMudW5iaW5kRG9jdW1lbnRDbGlja0xpc3RlbmVyKCk7XHJcbiAgICAgICAgdGhpcy5vdmVybGF5ID0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBuZ09uRGVzdHJveSgpIHtcclxuICAgICAgICBpZiAodGhpcy5zY3JvbGxIYW5kbGVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2Nyb2xsSGFuZGxlci5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2Nyb2xsSGFuZGxlciA9IG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnJlc3RvcmVPdmVybGF5QXBwZW5kKCk7XHJcbiAgICAgICAgdGhpcy5vbk92ZXJsYXlIaWRlKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbkBOZ01vZHVsZSh7XHJcbiAgICBpbXBvcnRzOiBbQ29tbW9uTW9kdWxlXSxcclxuICAgIGV4cG9ydHM6IFtDb2xvclBpY2tlcl0sXHJcbiAgICBkZWNsYXJhdGlvbnM6IFtDb2xvclBpY2tlcl1cclxufSlcclxuZXhwb3J0IGNsYXNzIENvbG9yUGlja2VyTW9kdWxlIHsgfVxyXG4iXX0=