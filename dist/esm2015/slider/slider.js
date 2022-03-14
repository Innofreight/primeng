import { NgModule, Component, ElementRef, Input, Output, EventEmitter, forwardRef, Renderer2, NgZone, ChangeDetectorRef, ViewChild, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomHandler } from 'primeng/dom';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
export const SLIDER_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => Slider),
    multi: true
};
export class Slider {
    constructor(el, renderer, ngZone, cd) {
        this.el = el;
        this.renderer = renderer;
        this.ngZone = ngZone;
        this.cd = cd;
        this.min = 0;
        this.max = 100;
        this.orientation = 'horizontal';
        this.tabindex = 0;
        this.onChange = new EventEmitter();
        this.onSlideEnd = new EventEmitter();
        this.handleValues = [];
        this.onModelChange = () => { };
        this.onModelTouched = () => { };
        this.handleIndex = 0;
    }
    onMouseDown(event, index) {
        if (this.disabled) {
            return;
        }
        this.dragging = true;
        this.updateDomData();
        this.sliderHandleClick = true;
        if (this.range && this.handleValues && this.handleValues[0] === 100) {
            this.handleIndex = 0;
        }
        else {
            this.handleIndex = index;
        }
        this.bindDragListeners();
        event.target.focus();
        event.preventDefault();
        if (this.animate) {
            DomHandler.removeClass(this.el.nativeElement.children[0], 'p-slider-animate');
        }
    }
    onTouchStart(event, index) {
        if (this.disabled) {
            return;
        }
        var touchobj = event.changedTouches[0];
        this.startHandleValue = (this.range) ? this.handleValues[index] : this.handleValue;
        this.dragging = true;
        if (this.range && this.handleValues && this.handleValues[0] === 100) {
            this.handleIndex = 0;
        }
        else {
            this.handleIndex = index;
        }
        if (this.orientation === 'horizontal') {
            this.startx = parseInt(touchobj.clientX, 10);
            this.barWidth = this.el.nativeElement.children[0].offsetWidth;
        }
        else {
            this.starty = parseInt(touchobj.clientY, 10);
            this.barHeight = this.el.nativeElement.children[0].offsetHeight;
        }
        if (this.animate) {
            DomHandler.removeClass(this.el.nativeElement.children[0], 'p-slider-animate');
        }
        event.preventDefault();
    }
    onTouchMove(event, index) {
        if (this.disabled) {
            return;
        }
        var touchobj = event.changedTouches[0], handleValue = 0;
        if (this.orientation === 'horizontal') {
            handleValue = Math.floor(((parseInt(touchobj.clientX, 10) - this.startx) * 100) / (this.barWidth)) + this.startHandleValue;
        }
        else {
            handleValue = Math.floor(((this.starty - parseInt(touchobj.clientY, 10)) * 100) / (this.barHeight)) + this.startHandleValue;
        }
        this.setValueFromHandle(event, handleValue);
        event.preventDefault();
    }
    onTouchEnd(event, index) {
        if (this.disabled) {
            return;
        }
        this.dragging = false;
        if (this.range)
            this.onSlideEnd.emit({ originalEvent: event, values: this.values });
        else
            this.onSlideEnd.emit({ originalEvent: event, value: this.value });
        if (this.animate) {
            DomHandler.addClass(this.el.nativeElement.children[0], 'p-slider-animate');
        }
        event.preventDefault();
    }
    onBarClick(event) {
        if (this.disabled) {
            return;
        }
        if (!this.sliderHandleClick) {
            this.updateDomData();
            this.handleChange(event);
        }
        this.sliderHandleClick = false;
    }
    onHandleKeydown(event, handleIndex) {
        if (this.disabled) {
            return;
        }
        if (event.which == 38 || event.which == 39) {
            this.spin(event, 1, handleIndex);
        }
        else if (event.which == 37 || event.which == 40) {
            this.spin(event, -1, handleIndex);
        }
    }
    spin(event, dir, handleIndex) {
        let step = (this.step || 1) * dir;
        if (this.range) {
            this.handleIndex = handleIndex;
            this.updateValue(this.values[this.handleIndex] + step);
            this.updateHandleValue();
        }
        else {
            this.updateValue(this.value + step);
            this.updateHandleValue();
        }
        event.preventDefault();
    }
    handleChange(event) {
        let handleValue = this.calculateHandleValue(event);
        this.setValueFromHandle(event, handleValue);
    }
    bindDragListeners() {
        this.ngZone.runOutsideAngular(() => {
            const documentTarget = this.el ? this.el.nativeElement.ownerDocument : 'document';
            if (!this.dragListener) {
                this.dragListener = this.renderer.listen(documentTarget, 'mousemove', (event) => {
                    if (this.dragging) {
                        this.ngZone.run(() => {
                            this.handleChange(event);
                        });
                    }
                });
            }
            if (!this.mouseupListener) {
                this.mouseupListener = this.renderer.listen(documentTarget, 'mouseup', (event) => {
                    if (this.dragging) {
                        this.dragging = false;
                        this.ngZone.run(() => {
                            if (this.range)
                                this.onSlideEnd.emit({ originalEvent: event, values: this.values });
                            else
                                this.onSlideEnd.emit({ originalEvent: event, value: this.value });
                            if (this.animate) {
                                DomHandler.addClass(this.el.nativeElement.children[0], 'p-slider-animate');
                            }
                        });
                    }
                });
            }
        });
    }
    unbindDragListeners() {
        if (this.dragListener) {
            this.dragListener();
        }
        if (this.mouseupListener) {
            this.mouseupListener();
        }
    }
    setValueFromHandle(event, handleValue) {
        this.sliderHandleClick = false;
        let newValue = this.getValueFromHandle(handleValue);
        if (this.range) {
            if (this.step) {
                this.handleStepChange(newValue, this.values[this.handleIndex]);
            }
            else {
                this.handleValues[this.handleIndex] = handleValue;
                this.updateValue(newValue, event);
            }
        }
        else {
            if (this.step) {
                this.handleStepChange(newValue, this.value);
            }
            else {
                this.handleValue = handleValue;
                this.updateValue(newValue, event);
            }
        }
        this.cd.markForCheck();
    }
    handleStepChange(newValue, oldValue) {
        let diff = (newValue - oldValue);
        let val = oldValue;
        if (diff < 0) {
            val = oldValue + Math.ceil(newValue / this.step - oldValue / this.step) * this.step;
        }
        else if (diff > 0) {
            val = oldValue + Math.floor(newValue / this.step - oldValue / this.step) * this.step;
        }
        this.updateValue(val);
        this.updateHandleValue();
    }
    writeValue(value) {
        if (this.range)
            this.values = value || [0, 0];
        else
            this.value = value || 0;
        this.updateHandleValue();
        this.cd.markForCheck();
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
    get rangeStartLeft() {
        return this.isVertical() ? 'auto' : this.handleValues[0] + '%';
    }
    get rangeStartBottom() {
        return this.isVertical() ? this.handleValues[0] + '%' : 'auto';
    }
    get rangeEndLeft() {
        return this.isVertical() ? 'auto' : this.handleValues[1] + '%';
    }
    get rangeEndBottom() {
        return this.isVertical() ? this.handleValues[1] + '%' : 'auto';
    }
    isVertical() {
        return this.orientation === 'vertical';
    }
    updateDomData() {
        let rect = this.el.nativeElement.children[0].getBoundingClientRect();
        this.initX = rect.left + DomHandler.getWindowScrollLeft();
        this.initY = rect.top + DomHandler.getWindowScrollTop();
        this.barWidth = this.el.nativeElement.children[0].offsetWidth;
        this.barHeight = this.el.nativeElement.children[0].offsetHeight;
    }
    calculateHandleValue(event) {
        if (this.orientation === 'horizontal')
            return ((event.pageX - this.initX) * 100) / (this.barWidth);
        else
            return (((this.initY + this.barHeight) - event.pageY) * 100) / (this.barHeight);
    }
    updateHandleValue() {
        if (this.range) {
            this.handleValues[0] = (this.values[0] < this.min ? 0 : this.values[0] - this.min) * 100 / (this.max - this.min);
            this.handleValues[1] = (this.values[1] > this.max ? 100 : this.values[1] - this.min) * 100 / (this.max - this.min);
        }
        else {
            if (this.value < this.min)
                this.handleValue = 0;
            else if (this.value > this.max)
                this.handleValue = 100;
            else
                this.handleValue = (this.value - this.min) * 100 / (this.max - this.min);
        }
    }
    updateValue(val, event) {
        if (this.range) {
            let value = val;
            if (this.handleIndex == 0) {
                if (value < this.min) {
                    value = this.min;
                    this.handleValues[0] = 0;
                }
                else if (value > this.values[1]) {
                    value = this.values[1];
                    this.handleValues[0] = this.handleValues[1];
                }
                this.sliderHandleStart.nativeElement.focus();
            }
            else {
                if (value > this.max) {
                    value = this.max;
                    this.handleValues[1] = 100;
                }
                else if (value < this.values[0]) {
                    value = this.values[0];
                    this.handleValues[1] = this.handleValues[0];
                }
                this.sliderHandleEnd.nativeElement.focus();
            }
            this.values[this.handleIndex] = this.getNormalizedValue(value);
            this.values = this.values.slice();
            this.onModelChange(this.values);
            this.onChange.emit({ event: event, values: this.values });
        }
        else {
            if (val < this.min) {
                val = this.min;
                this.handleValue = 0;
            }
            else if (val > this.max) {
                val = this.max;
                this.handleValue = 100;
            }
            this.value = this.getNormalizedValue(val);
            this.onModelChange(this.value);
            this.onChange.emit({ event: event, value: this.value });
            this.sliderHandle.nativeElement.focus();
        }
    }
    getValueFromHandle(handleValue) {
        return (this.max - this.min) * (handleValue / 100) + this.min;
    }
    getDecimalsCount(value) {
        if (value && Math.floor(value) !== value)
            return value.toString().split(".")[1].length || 0;
        return 0;
    }
    getNormalizedValue(val) {
        let decimalsCount = this.getDecimalsCount(this.step);
        if (decimalsCount > 0) {
            return +val.toFixed(decimalsCount);
        }
        else {
            return Math.floor(val);
        }
    }
    ngOnDestroy() {
        this.unbindDragListeners();
    }
}
Slider.decorators = [
    { type: Component, args: [{
                selector: 'p-slider',
                template: `
        <div [ngStyle]="style" [class]="styleClass" [ngClass]="{'p-slider p-component':true,'p-disabled':disabled,
            'p-slider-horizontal':orientation == 'horizontal','p-slider-vertical':orientation == 'vertical','p-slider-animate':animate}"
            (click)="onBarClick($event)">
            <span *ngIf="range && orientation == 'horizontal'" class="p-slider-range" [ngStyle]="{'left':handleValues[0] + '%',width: (handleValues[1] - handleValues[0] + '%')}"></span>
            <span *ngIf="range && orientation == 'vertical'" class="p-slider-range" [ngStyle]="{'bottom':handleValues[0] + '%',height: (handleValues[1] - handleValues[0] + '%')}"></span>
            <span *ngIf="!range && orientation=='vertical'" class="p-slider-range" [ngStyle]="{'height': handleValue + '%'}"></span>
            <span *ngIf="!range && orientation=='horizontal'" class="p-slider-range" [ngStyle]="{'width': handleValue + '%'}"></span>
            <span #sliderHandle *ngIf="!range" [attr.tabindex]="disabled ? null : tabindex" (keydown)="onHandleKeydown($event)" class="p-slider-handle" (mousedown)="onMouseDown($event)" (touchstart)="onTouchStart($event)" (touchmove)="onTouchMove($event)" (touchend)="onTouchEnd($event)"
                [style.transition]="dragging ? 'none': null" [ngStyle]="{'left': orientation == 'horizontal' ? handleValue + '%' : null,'bottom': orientation == 'vertical' ? handleValue + '%' : null}"
                [attr.aria-valuemin]="min" [attr.aria-valuenow]="value" [attr.aria-valuemax]="max" [attr.aria-labelledby]="ariaLabelledBy"></span>
            <span #sliderHandleStart *ngIf="range" [attr.tabindex]="disabled ? null : tabindex" (keydown)="onHandleKeydown($event,0)" (mousedown)="onMouseDown($event,0)" (touchstart)="onTouchStart($event,0)" (touchmove)="onTouchMove($event,0)" (touchend)="onTouchEnd($event)" [style.transition]="dragging ? 'none': null" class="p-slider-handle" 
                [ngStyle]="{'left': rangeStartLeft, 'bottom': rangeStartBottom}" [ngClass]="{'p-slider-handle-active':handleIndex==0}"
                [attr.aria-valuemin]="min" [attr.aria-valuenow]="value ? value[0] : null" [attr.aria-valuemax]="max" [attr.aria-labelledby]="ariaLabelledBy"></span>
            <span #sliderHandleEnd *ngIf="range" [attr.tabindex]="disabled ? null : tabindex" (keydown)="onHandleKeydown($event,1)" (mousedown)="onMouseDown($event,1)" (touchstart)="onTouchStart($event,1)" (touchmove)="onTouchMove($event,1)" (touchend)="onTouchEnd($event)" [style.transition]="dragging ? 'none': null" class="p-slider-handle" 
                [ngStyle]="{'left': rangeEndLeft, 'bottom': rangeEndBottom}" [ngClass]="{'p-slider-handle-active':handleIndex==1}"
                [attr.aria-valuemin]="min" [attr.aria-valuenow]="value ? value[1] : null" [attr.aria-valuemax]="max" [attr.aria-labelledby]="ariaLabelledBy"></span>
        </div>
    `,
                providers: [SLIDER_VALUE_ACCESSOR],
                changeDetection: ChangeDetectionStrategy.OnPush,
                encapsulation: ViewEncapsulation.None,
                styles: [".p-slider{position:relative}.p-slider .p-slider-handle{cursor:grab;touch-action:none}.p-slider-range,.p-slider .p-slider-handle{display:block;position:absolute}.p-slider-horizontal .p-slider-range{height:100%;left:0;top:0}.p-slider-horizontal .p-slider-handle{top:50%}.p-slider-vertical{height:100px}.p-slider-vertical .p-slider-handle{left:50%}.p-slider-vertical .p-slider-range{bottom:0;left:0;width:100%}"]
            },] }
];
Slider.ctorParameters = () => [
    { type: ElementRef },
    { type: Renderer2 },
    { type: NgZone },
    { type: ChangeDetectorRef }
];
Slider.propDecorators = {
    animate: [{ type: Input }],
    disabled: [{ type: Input }],
    min: [{ type: Input }],
    max: [{ type: Input }],
    orientation: [{ type: Input }],
    step: [{ type: Input }],
    range: [{ type: Input }],
    style: [{ type: Input }],
    styleClass: [{ type: Input }],
    ariaLabelledBy: [{ type: Input }],
    tabindex: [{ type: Input }],
    onChange: [{ type: Output }],
    onSlideEnd: [{ type: Output }],
    sliderHandle: [{ type: ViewChild, args: ["sliderHandle",] }],
    sliderHandleStart: [{ type: ViewChild, args: ["sliderHandleStart",] }],
    sliderHandleEnd: [{ type: ViewChild, args: ["sliderHandleEnd",] }]
};
export class SliderModule {
}
SliderModule.decorators = [
    { type: NgModule, args: [{
                imports: [CommonModule],
                exports: [Slider],
                declarations: [Slider]
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2xpZGVyLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLy4uL3NyYy9hcHAvY29tcG9uZW50cy9zbGlkZXIvIiwic291cmNlcyI6WyJzbGlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFhLEtBQUssRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUMsTUFBTSxFQUFDLGlCQUFpQixFQUFFLFNBQVMsRUFBRSx1QkFBdUIsRUFBRSxpQkFBaUIsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUM3TSxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDN0MsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUN2QyxPQUFPLEVBQUMsaUJBQWlCLEVBQXVCLE1BQU0sZ0JBQWdCLENBQUM7QUFFdkUsTUFBTSxDQUFDLE1BQU0scUJBQXFCLEdBQVE7SUFDeEMsT0FBTyxFQUFFLGlCQUFpQjtJQUMxQixXQUFXLEVBQUUsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQztJQUNyQyxLQUFLLEVBQUUsSUFBSTtDQUNaLENBQUM7QUE0QkYsTUFBTSxPQUFPLE1BQU07SUFzRWYsWUFBbUIsRUFBYyxFQUFTLFFBQW1CLEVBQVUsTUFBYyxFQUFTLEVBQXFCO1FBQWhHLE9BQUUsR0FBRixFQUFFLENBQVk7UUFBUyxhQUFRLEdBQVIsUUFBUSxDQUFXO1FBQVUsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUFTLE9BQUUsR0FBRixFQUFFLENBQW1CO1FBaEUxRyxRQUFHLEdBQVcsQ0FBQyxDQUFDO1FBRWhCLFFBQUcsR0FBVyxHQUFHLENBQUM7UUFFbEIsZ0JBQVcsR0FBVyxZQUFZLENBQUM7UUFZbkMsYUFBUSxHQUFXLENBQUMsQ0FBQztRQUVwQixhQUFRLEdBQXNCLElBQUksWUFBWSxFQUFFLENBQUM7UUFFakQsZUFBVSxHQUFzQixJQUFJ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QUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7U0FDbkM7YUFDSTtZQUNKLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUN2QjtJQUNGLENBQUM7SUFFRSxXQUFXO1FBQ1AsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7SUFDL0IsQ0FBQzs7O1lBdGRKLFNBQVMsU0FBQztnQkFDUCxRQUFRLEVBQUUsVUFBVTtnQkFDcEIsUUFBUSxFQUFFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7S0FrQlQ7Z0JBQ0QsU0FBUyxFQUFFLENBQUMscUJBQXFCLENBQUM7Z0JBQ2xDLGVBQWUsRUFBRSx1QkFBdUIsQ0FBQyxNQUFNO2dCQUMvQyxhQUFhLEVBQUUsaUJBQWlCLENBQUMsSUFBSTs7YUFFeEM7OztZQXBDNEIsVUFBVTtZQUFzRCxTQUFTO1lBQUMsTUFBTTtZQUFDLGlCQUFpQjs7O3NCQXVDMUgsS0FBSzt1QkFFTCxLQUFLO2tCQUVMLEtBQUs7a0JBRUwsS0FBSzswQkFFTCxLQUFLO21CQUVMLEtBQUs7b0JBRUwsS0FBSztvQkFFTCxLQUFLO3lCQUVMLEtBQUs7NkJBRUwsS0FBSzt1QkFFTCxLQUFLO3VCQUVMLE1BQU07eUJBRU4sTUFBTTsyQkFFTixTQUFTLFNBQUMsY0FBYztnQ0FFeEIsU0FBUyxTQUFDLG1CQUFtQjs4QkFFN0IsU0FBUyxTQUFDLGlCQUFpQjs7QUFvYWhDLE1BQU0sT0FBTyxZQUFZOzs7WUFMeEIsUUFBUSxTQUFDO2dCQUNOLE9BQU8sRUFBRSxDQUFDLFlBQVksQ0FBQztnQkFDdkIsT0FBTyxFQUFFLENBQUMsTUFBTSxDQUFDO2dCQUNqQixZQUFZLEVBQUUsQ0FBQyxNQUFNLENBQUM7YUFDekIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge05nTW9kdWxlLCBDb21wb25lbnQsIEVsZW1lbnRSZWYsIE9uRGVzdHJveSwgSW5wdXQsIE91dHB1dCwgRXZlbnRFbWl0dGVyLCBmb3J3YXJkUmVmLCBSZW5kZXJlcjIsTmdab25lLENoYW5nZURldGVjdG9yUmVmLCBWaWV3Q2hpbGQsIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LCBWaWV3RW5jYXBzdWxhdGlvbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7Q29tbW9uTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xyXG5pbXBvcnQge0RvbUhhbmRsZXJ9IGZyb20gJ3ByaW1lbmcvZG9tJztcclxuaW1wb3J0IHtOR19WQUxVRV9BQ0NFU1NPUiwgQ29udHJvbFZhbHVlQWNjZXNzb3J9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcclxuXHJcbmV4cG9ydCBjb25zdCBTTElERVJfVkFMVUVfQUNDRVNTT1I6IGFueSA9IHtcclxuICBwcm92aWRlOiBOR19WQUxVRV9BQ0NFU1NPUixcclxuICB1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBTbGlkZXIpLFxyXG4gIG11bHRpOiB0cnVlXHJcbn07XHJcblxyXG5AQ29tcG9uZW50KHtcclxuICAgIHNlbGVjdG9yOiAncC1zbGlkZXInLFxyXG4gICAgdGVtcGxhdGU6IGBcclxuICAgICAgICA8ZGl2IFtuZ1N0eWxlXT1cInN0eWxlXCIgW2NsYXNzXT1cInN0eWxlQ2xhc3NcIiBbbmdDbGFzc109XCJ7J3Atc2xpZGVyIHAtY29tcG9uZW50Jzp0cnVlLCdwLWRpc2FibGVkJzpkaXNhYmxlZCxcclxuICAgICAgICAgICAgJ3Atc2xpZGVyLWhvcml6b250YWwnOm9yaWVudGF0aW9uID09ICdob3Jpem9udGFsJywncC1zbGlkZXItdmVydGljYWwnOm9yaWVudGF0aW9uID09ICd2ZXJ0aWNhbCcsJ3Atc2xpZGVyLWFuaW1hdGUnOmFuaW1hdGV9XCJcclxuICAgICAgICAgICAgKGNsaWNrKT1cIm9uQmFyQ2xpY2soJGV2ZW50KVwiPlxyXG4gICAgICAgICAgICA8c3BhbiAqbmdJZj1cInJhbmdlICYmIG9yaWVudGF0aW9uID09ICdob3Jpem9udGFsJ1wiIGNsYXNzPVwicC1zbGlkZXItcmFuZ2VcIiBbbmdTdHlsZV09XCJ7J2xlZnQnOmhhbmRsZVZhbHVlc1swXSArICclJyx3aWR0aDogKGhhbmRsZVZhbHVlc1sxXSAtIGhhbmRsZVZhbHVlc1swXSArICclJyl9XCI+PC9zcGFuPlxyXG4gICAgICAgICAgICA8c3BhbiAqbmdJZj1cInJhbmdlICYmIG9yaWVudGF0aW9uID09ICd2ZXJ0aWNhbCdcIiBjbGFzcz1cInAtc2xpZGVyLXJhbmdlXCIgW25nU3R5bGVdPVwieydib3R0b20nOmhhbmRsZVZhbHVlc1swXSArICclJyxoZWlnaHQ6IChoYW5kbGVWYWx1ZXNbMV0gLSBoYW5kbGVWYWx1ZXNbMF0gKyAnJScpfVwiPjwvc3Bhbj5cclxuICAgICAgICAgICAgPHNwYW4gKm5nSWY9XCIhcmFuZ2UgJiYgb3JpZW50YXRpb249PSd2ZXJ0aWNhbCdcIiBjbGFzcz1cInAtc2xpZGVyLXJhbmdlXCIgW25nU3R5bGVdPVwieydoZWlnaHQnOiBoYW5kbGVWYWx1ZSArICclJ31cIj48L3NwYW4+XHJcbiAgICAgICAgICAgIDxzcGFuICpuZ0lmPVwiIXJhbmdlICYmIG9yaWVudGF0aW9uPT0naG9yaXpvbnRhbCdcIiBjbGFzcz1cInAtc2xpZGVyLXJhbmdlXCIgW25nU3R5bGVdPVwieyd3aWR0aCc6IGhhbmRsZVZhbHVlICsgJyUnfVwiPjwvc3Bhbj5cclxuICAgICAgICAgICAgPHNwYW4gI3NsaWRlckhhbmRsZSAqbmdJZj1cIiFyYW5nZVwiIFthdHRyLnRhYmluZGV4XT1cImRpc2FibGVkID8gbnVsbCA6IHRhYmluZGV4XCIgKGtleWRvd24pPVwib25IYW5kbGVLZXlkb3duKCRldmVudClcIiBjbGFzcz1cInAtc2xpZGVyLWhhbmRsZVwiIChtb3VzZWRvd24pPVwib25Nb3VzZURvd24oJGV2ZW50KVwiICh0b3VjaHN0YXJ0KT1cIm9uVG91Y2hTdGFydCgkZXZlbnQpXCIgKHRvdWNobW92ZSk9XCJvblRvdWNoTW92ZSgkZXZlbnQpXCIgKHRvdWNoZW5kKT1cIm9uVG91Y2hFbmQoJGV2ZW50KVwiXHJcbiAgICAgICAgICAgICAgICBbc3R5bGUudHJhbnNpdGlvbl09XCJkcmFnZ2luZyA/ICdub25lJzogbnVsbFwiIFtuZ1N0eWxlXT1cInsnbGVmdCc6IG9yaWVudGF0aW9uID09ICdob3Jpem9udGFsJyA/IGhhbmRsZVZhbHVlICsgJyUnIDogbnVsbCwnYm90dG9tJzogb3JpZW50YXRpb24gPT0gJ3ZlcnRpY2FsJyA/IGhhbmRsZVZhbHVlICsgJyUnIDogbnVsbH1cIlxyXG4gICAgICAgICAgICAgICAgW2F0dHIuYXJpYS12YWx1ZW1pbl09XCJtaW5cIiBbYXR0ci5hcmlhLXZhbHVlbm93XT1cInZhbHVlXCIgW2F0dHIuYXJpYS12YWx1ZW1heF09XCJtYXhcIiBbYXR0ci5hcmlhLWxhYmVsbGVkYnldPVwiYXJpYUxhYmVsbGVkQnlcIj48L3NwYW4+XHJcbiAgICAgICAgICAgIDxzcGFuICNzbGlkZXJIYW5kbGVTdGFydCAqbmdJZj1cInJhbmdlXCIgW2F0dHIudGFiaW5kZXhdPVwiZGlzYWJsZWQgPyBudWxsIDogdGFiaW5kZXhcIiAoa2V5ZG93bik9XCJvbkhhbmRsZUtleWRvd24oJGV2ZW50LDApXCIgKG1vdXNlZG93bik9XCJvbk1vdXNlRG93bigkZXZlbnQsMClcIiAodG91Y2hzdGFydCk9XCJvblRvdWNoU3RhcnQoJGV2ZW50LDApXCIgKHRvdWNobW92ZSk9XCJvblRvdWNoTW92ZSgkZXZlbnQsMClcIiAodG91Y2hlbmQpPVwib25Ub3VjaEVuZCgkZXZlbnQpXCIgW3N0eWxlLnRyYW5zaXRpb25dPVwiZHJhZ2dpbmcgPyAnbm9uZSc6IG51bGxcIiBjbGFzcz1cInAtc2xpZGVyLWhhbmRsZVwiIFxyXG4gICAgICAgICAgICAgICAgW25nU3R5bGVdPVwieydsZWZ0JzogcmFuZ2VTdGFydExlZnQsICdib3R0b20nOiByYW5nZVN0YXJ0Qm90dG9tfVwiIFtuZ0NsYXNzXT1cInsncC1zbGlkZXItaGFuZGxlLWFjdGl2ZSc6aGFuZGxlSW5kZXg9PTB9XCJcclxuICAgICAgICAgICAgICAgIFthdHRyLmFyaWEtdmFsdWVtaW5dPVwibWluXCIgW2F0dHIuYXJpYS12YWx1ZW5vd109XCJ2YWx1ZSA/IHZhbHVlWzBdIDogbnVsbFwiIFthdHRyLmFyaWEtdmFsdWVtYXhdPVwibWF4XCIgW2F0dHIuYXJpYS1sYWJlbGxlZGJ5XT1cImFyaWFMYWJlbGxlZEJ5XCI+PC9zcGFuPlxyXG4gICAgICAgICAgICA8c3BhbiAjc2xpZGVySGFuZGxlRW5kICpuZ0lmPVwicmFuZ2VcIiBbYXR0ci50YWJpbmRleF09XCJkaXNhYmxlZCA/IG51bGwgOiB0YWJpbmRleFwiIChrZXlkb3duKT1cIm9uSGFuZGxlS2V5ZG93bigkZXZlbnQsMSlcIiAobW91c2Vkb3duKT1cIm9uTW91c2VEb3duKCRldmVudCwxKVwiICh0b3VjaHN0YXJ0KT1cIm9uVG91Y2hTdGFydCgkZXZlbnQsMSlcIiAodG91Y2htb3ZlKT1cIm9uVG91Y2hNb3ZlKCRldmVudCwxKVwiICh0b3VjaGVuZCk9XCJvblRvdWNoRW5kKCRldmVudClcIiBbc3R5bGUudHJhbnNpdGlvbl09XCJkcmFnZ2luZyA/ICdub25lJzogbnVsbFwiIGNsYXNzPVwicC1zbGlkZXItaGFuZGxlXCIgXHJcbiAgICAgICAgICAgICAgICBbbmdTdHlsZV09XCJ7J2xlZnQnOiByYW5nZUVuZExlZnQsICdib3R0b20nOiByYW5nZUVuZEJvdHRvbX1cIiBbbmdDbGFzc109XCJ7J3Atc2xpZGVyLWhhbmRsZS1hY3RpdmUnOmhhbmRsZUluZGV4PT0xfVwiXHJcbiAgICAgICAgICAgICAgICBbYXR0ci5hcmlhLXZhbHVlbWluXT1cIm1pblwiIFthdHRyLmFyaWEtdmFsdWVub3ddPVwidmFsdWUgPyB2YWx1ZVsxXSA6IG51bGxcIiBbYXR0ci5hcmlhLXZhbHVlbWF4XT1cIm1heFwiIFthdHRyLmFyaWEtbGFiZWxsZWRieV09XCJhcmlhTGFiZWxsZWRCeVwiPjwvc3Bhbj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgIGAsXHJcbiAgICBwcm92aWRlcnM6IFtTTElERVJfVkFMVUVfQUNDRVNTT1JdLFxyXG4gICAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXHJcbiAgICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxyXG4gICAgc3R5bGVVcmxzOiBbJy4vc2xpZGVyLmNzcyddXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBTbGlkZXIgaW1wbGVtZW50cyBPbkRlc3Ryb3ksQ29udHJvbFZhbHVlQWNjZXNzb3Ige1xyXG5cclxuICAgIEBJbnB1dCgpIGFuaW1hdGU6IGJvb2xlYW47XHJcblxyXG4gICAgQElucHV0KCkgZGlzYWJsZWQ6IGJvb2xlYW47XHJcblxyXG4gICAgQElucHV0KCkgbWluOiBudW1iZXIgPSAwO1xyXG5cclxuICAgIEBJbnB1dCgpIG1heDogbnVtYmVyID0gMTAwO1xyXG5cclxuICAgIEBJbnB1dCgpIG9yaWVudGF0aW9uOiBzdHJpbmcgPSAnaG9yaXpvbnRhbCc7XHJcblxyXG4gICAgQElucHV0KCkgc3RlcDogbnVtYmVyO1xyXG5cclxuICAgIEBJbnB1dCgpIHJhbmdlOiBib29sZWFuO1xyXG5cclxuICAgIEBJbnB1dCgpIHN0eWxlOiBhbnk7XHJcblxyXG4gICAgQElucHV0KCkgc3R5bGVDbGFzczogc3RyaW5nO1xyXG5cclxuICAgIEBJbnB1dCgpIGFyaWFMYWJlbGxlZEJ5OiBzdHJpbmc7XHJcblxyXG4gICAgQElucHV0KCkgdGFiaW5kZXg6IG51bWJlciA9IDA7XHJcblxyXG4gICAgQE91dHB1dCgpIG9uQ2hhbmdlOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcclxuICAgIFxyXG4gICAgQE91dHB1dCgpIG9uU2xpZGVFbmQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG4gICAgXHJcbiAgICBAVmlld0NoaWxkKFwic2xpZGVySGFuZGxlXCIpIHNsaWRlckhhbmRsZTogRWxlbWVudFJlZjtcclxuXHJcbiAgICBAVmlld0NoaWxkKFwic2xpZGVySGFuZGxlU3RhcnRcIikgc2xpZGVySGFuZGxlU3RhcnQ6IEVsZW1lbnRSZWY7XHJcblxyXG4gICAgQFZpZXdDaGlsZChcInNsaWRlckhhbmRsZUVuZFwiKSBzbGlkZXJIYW5kbGVFbmQ6IEVsZW1lbnRSZWY7XHJcblxyXG4gICAgcHVibGljIHZhbHVlOiBudW1iZXI7XHJcbiAgICBcclxuICAgIHB1YmxpYyB2YWx1ZXM6IG51bWJlcltdO1xyXG4gICAgXHJcbiAgICBwdWJsaWMgaGFuZGxlVmFsdWU6IG51bWJlcjtcclxuICAgIFxyXG4gICAgcHVibGljIGhhbmRsZVZhbHVlczogbnVtYmVyW10gPSBbXTtcclxuICAgICAgICBcclxuICAgIHB1YmxpYyBvbk1vZGVsQ2hhbmdlOiBGdW5jdGlvbiA9ICgpID0+IHt9O1xyXG4gICAgXHJcbiAgICBwdWJsaWMgb25Nb2RlbFRvdWNoZWQ6IEZ1bmN0aW9uID0gKCkgPT4ge307XHJcbiAgICBcclxuICAgIHB1YmxpYyBkcmFnZ2luZzogYm9vbGVhbjtcclxuICAgIFxyXG4gICAgcHVibGljIGRyYWdMaXN0ZW5lcjogYW55O1xyXG4gICAgXHJcbiAgICBwdWJsaWMgbW91c2V1cExpc3RlbmVyOiBhbnk7XHJcbiAgICAgICAgXHJcbiAgICBwdWJsaWMgaW5pdFg6IG51bWJlcjtcclxuICAgIFxyXG4gICAgcHVibGljIGluaXRZOiBudW1iZXI7XHJcbiAgICBcclxuICAgIHB1YmxpYyBiYXJXaWR0aDogbnVtYmVyO1xyXG4gICAgXHJcbiAgICBwdWJsaWMgYmFySGVpZ2h0OiBudW1iZXI7XHJcbiAgICBcclxuICAgIHB1YmxpYyBzbGlkZXJIYW5kbGVDbGljazogYm9vbGVhbjtcclxuICAgIFxyXG4gICAgcHVibGljIGhhbmRsZUluZGV4OiBudW1iZXIgPSAwO1xyXG5cclxuICAgIHB1YmxpYyBzdGFydEhhbmRsZVZhbHVlOiBhbnk7XHJcblxyXG4gICAgcHVibGljIHN0YXJ0eDogbnVtYmVyO1xyXG5cclxuICAgIHB1YmxpYyBzdGFydHk6IG51bWJlcjtcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3IocHVibGljIGVsOiBFbGVtZW50UmVmLCBwdWJsaWMgcmVuZGVyZXI6IFJlbmRlcmVyMiwgcHJpdmF0ZSBuZ1pvbmU6IE5nWm9uZSwgcHVibGljIGNkOiBDaGFuZ2VEZXRlY3RvclJlZikge31cclxuICAgIFxyXG4gICAgb25Nb3VzZURvd24oZXZlbnQsIGluZGV4PzpudW1iZXIpIHtcclxuICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuZHJhZ2dpbmcgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMudXBkYXRlRG9tRGF0YSgpO1xyXG4gICAgICAgIHRoaXMuc2xpZGVySGFuZGxlQ2xpY2sgPSB0cnVlO1xyXG4gICAgICAgIGlmICh0aGlzLnJhbmdlICYmIHRoaXMuaGFuZGxlVmFsdWVzICYmIHRoaXMuaGFuZGxlVmFsdWVzWzBdID09PSAxMDApIHtcclxuICAgICAgICAgICAgdGhpcy5oYW5kbGVJbmRleCA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZUluZGV4ID0gaW5kZXg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmJpbmREcmFnTGlzdGVuZXJzKCk7XHJcbiAgICAgICAgZXZlbnQudGFyZ2V0LmZvY3VzKCk7XHJcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuYW5pbWF0ZSkge1xyXG4gICAgICAgICAgICBEb21IYW5kbGVyLnJlbW92ZUNsYXNzKHRoaXMuZWwubmF0aXZlRWxlbWVudC5jaGlsZHJlblswXSwgJ3Atc2xpZGVyLWFuaW1hdGUnKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgb25Ub3VjaFN0YXJ0KGV2ZW50LCBpbmRleD86bnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIHRvdWNob2JqID0gZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF07XHJcbiAgICAgICAgdGhpcy5zdGFydEhhbmRsZVZhbHVlID0gKHRoaXMucmFuZ2UpID8gdGhpcy5oYW5kbGVWYWx1ZXNbaW5kZXhdIDogdGhpcy5oYW5kbGVWYWx1ZTtcclxuICAgICAgICB0aGlzLmRyYWdnaW5nID0gdHJ1ZTtcclxuICAgICAgICBpZiAodGhpcy5yYW5nZSAmJiB0aGlzLmhhbmRsZVZhbHVlcyAmJiB0aGlzLmhhbmRsZVZhbHVlc1swXSA9PT0gMTAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlSW5kZXggPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5oYW5kbGVJbmRleCA9IGluZGV4O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMub3JpZW50YXRpb24gPT09ICdob3Jpem9udGFsJykge1xyXG4gICAgICAgICAgICB0aGlzLnN0YXJ0eCA9IHBhcnNlSW50KHRvdWNob2JqLmNsaWVudFgsIDEwKTtcclxuICAgICAgICAgICAgdGhpcy5iYXJXaWR0aCA9IHRoaXMuZWwubmF0aXZlRWxlbWVudC5jaGlsZHJlblswXS5vZmZzZXRXaWR0aDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3RhcnR5ID0gcGFyc2VJbnQodG91Y2hvYmouY2xpZW50WSwgMTApO1xyXG4gICAgICAgICAgICB0aGlzLmJhckhlaWdodCA9IHRoaXMuZWwubmF0aXZlRWxlbWVudC5jaGlsZHJlblswXS5vZmZzZXRIZWlnaHQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5hbmltYXRlKSB7XHJcbiAgICAgICAgICAgIERvbUhhbmRsZXIucmVtb3ZlQ2xhc3ModGhpcy5lbC5uYXRpdmVFbGVtZW50LmNoaWxkcmVuWzBdLCAncC1zbGlkZXItYW5pbWF0ZScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIH1cclxuXHJcbiAgICBvblRvdWNoTW92ZShldmVudCwgaW5kZXg/Om51bWJlcikge1xyXG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgdmFyIHRvdWNob2JqID0gZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0sXHJcbiAgICAgICAgaGFuZGxlVmFsdWUgPSAwO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5vcmllbnRhdGlvbiA9PT0gJ2hvcml6b250YWwnKSB7XHJcbiAgICAgICAgICAgIGhhbmRsZVZhbHVlID0gTWF0aC5mbG9vcigoKHBhcnNlSW50KHRvdWNob2JqLmNsaWVudFgsIDEwKSAtIHRoaXMuc3RhcnR4KSAqIDEwMCkgLyAodGhpcy5iYXJXaWR0aCkpICsgdGhpcy5zdGFydEhhbmRsZVZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgaGFuZGxlVmFsdWUgPSBNYXRoLmZsb29yKCgodGhpcy5zdGFydHkgLSBwYXJzZUludCh0b3VjaG9iai5jbGllbnRZLCAxMCkpICogMTAwKSAvICh0aGlzLmJhckhlaWdodCkpICArIHRoaXMuc3RhcnRIYW5kbGVWYWx1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuc2V0VmFsdWVGcm9tSGFuZGxlKGV2ZW50LCBoYW5kbGVWYWx1ZSk7XHJcblxyXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgb25Ub3VjaEVuZChldmVudCwgaW5kZXg/Om51bWJlcikge1xyXG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZHJhZ2dpbmcgPSBmYWxzZTtcclxuICAgICAgICBcclxuICAgICAgICBpZiAodGhpcy5yYW5nZSlcclxuICAgICAgICAgICAgdGhpcy5vblNsaWRlRW5kLmVtaXQoe29yaWdpbmFsRXZlbnQ6IGV2ZW50LCB2YWx1ZXM6IHRoaXMudmFsdWVzfSk7XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB0aGlzLm9uU2xpZGVFbmQuZW1pdCh7b3JpZ2luYWxFdmVudDogZXZlbnQsIHZhbHVlOiB0aGlzLnZhbHVlfSk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmFuaW1hdGUpIHtcclxuICAgICAgICAgICAgRG9tSGFuZGxlci5hZGRDbGFzcyh0aGlzLmVsLm5hdGl2ZUVsZW1lbnQuY2hpbGRyZW5bMF0sICdwLXNsaWRlci1hbmltYXRlJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIG9uQmFyQ2xpY2soZXZlbnQpIHtcclxuICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICghdGhpcy5zbGlkZXJIYW5kbGVDbGljaykge1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZURvbURhdGEoKTtcclxuICAgICAgICAgICAgdGhpcy5oYW5kbGVDaGFuZ2UoZXZlbnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnNsaWRlckhhbmRsZUNsaWNrID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgb25IYW5kbGVLZXlkb3duKGV2ZW50LCBoYW5kbGVJbmRleD86bnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZXZlbnQud2hpY2ggPT0gMzggfHwgZXZlbnQud2hpY2ggPT0gMzkpIHtcclxuICAgICAgICAgICAgdGhpcy5zcGluKGV2ZW50LCAxLCBoYW5kbGVJbmRleCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGV2ZW50LndoaWNoID09IDM3IHx8IGV2ZW50LndoaWNoID09IDQwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3BpbihldmVudCwgLTEsIGhhbmRsZUluZGV4KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHNwaW4oZXZlbnQsIGRpcjogbnVtYmVyLCBoYW5kbGVJbmRleD86bnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IHN0ZXAgPSAodGhpcy5zdGVwIHx8IDEpICogZGlyO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5yYW5nZSkge1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZUluZGV4ID0gaGFuZGxlSW5kZXg7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlVmFsdWUodGhpcy52YWx1ZXNbdGhpcy5oYW5kbGVJbmRleF0gKyBzdGVwKTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVIYW5kbGVWYWx1ZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVWYWx1ZSh0aGlzLnZhbHVlICsgc3RlcCk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlSGFuZGxlVmFsdWUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgaGFuZGxlQ2hhbmdlKGV2ZW50OiBFdmVudCkge1xyXG4gICAgICAgIGxldCBoYW5kbGVWYWx1ZSA9IHRoaXMuY2FsY3VsYXRlSGFuZGxlVmFsdWUoZXZlbnQpO1xyXG4gICAgICAgIHRoaXMuc2V0VmFsdWVGcm9tSGFuZGxlKGV2ZW50LCBoYW5kbGVWYWx1ZSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGJpbmREcmFnTGlzdGVuZXJzKCkge1xyXG4gICAgICAgIHRoaXMubmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgZG9jdW1lbnRUYXJnZXQ6IGFueSA9IHRoaXMuZWwgPyB0aGlzLmVsLm5hdGl2ZUVsZW1lbnQub3duZXJEb2N1bWVudCA6ICdkb2N1bWVudCc7XHJcblxyXG4gICAgICAgICAgICBpZiAoIXRoaXMuZHJhZ0xpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRyYWdMaXN0ZW5lciA9IHRoaXMucmVuZGVyZXIubGlzdGVuKGRvY3VtZW50VGFyZ2V0LCAnbW91c2Vtb3ZlJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuZHJhZ2dpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5uZ1pvbmUucnVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlQ2hhbmdlKGV2ZW50KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghdGhpcy5tb3VzZXVwTGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubW91c2V1cExpc3RlbmVyID0gdGhpcy5yZW5kZXJlci5saXN0ZW4oZG9jdW1lbnRUYXJnZXQsICdtb3VzZXVwJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuZHJhZ2dpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kcmFnZ2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm5nWm9uZS5ydW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucmFuZ2UpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vblNsaWRlRW5kLmVtaXQoe29yaWdpbmFsRXZlbnQ6IGV2ZW50LCB2YWx1ZXM6IHRoaXMudmFsdWVzfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vblNsaWRlRW5kLmVtaXQoe29yaWdpbmFsRXZlbnQ6IGV2ZW50LCB2YWx1ZTogdGhpcy52YWx1ZX0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmFuaW1hdGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBEb21IYW5kbGVyLmFkZENsYXNzKHRoaXMuZWwubmF0aXZlRWxlbWVudC5jaGlsZHJlblswXSwgJ3Atc2xpZGVyLWFuaW1hdGUnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgdW5iaW5kRHJhZ0xpc3RlbmVycygpIHtcclxuICAgICAgICBpZiAodGhpcy5kcmFnTGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5kcmFnTGlzdGVuZXIoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMubW91c2V1cExpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMubW91c2V1cExpc3RlbmVyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNldFZhbHVlRnJvbUhhbmRsZShldmVudDogRXZlbnQsIGhhbmRsZVZhbHVlOiBhbnkpIHtcclxuICAgICAgICB0aGlzLnNsaWRlckhhbmRsZUNsaWNrID0gZmFsc2U7XHJcbiAgICAgICAgbGV0IG5ld1ZhbHVlID0gdGhpcy5nZXRWYWx1ZUZyb21IYW5kbGUoaGFuZGxlVmFsdWUpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5yYW5nZSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zdGVwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZVN0ZXBDaGFuZ2UobmV3VmFsdWUsIHRoaXMudmFsdWVzW3RoaXMuaGFuZGxlSW5kZXhdKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlVmFsdWVzW3RoaXMuaGFuZGxlSW5kZXhdID0gaGFuZGxlVmFsdWU7ICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVWYWx1ZShuZXdWYWx1ZSwgZXZlbnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgeyAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAodGhpcy5zdGVwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZVN0ZXBDaGFuZ2UobmV3VmFsdWUsIHRoaXMudmFsdWUpO1xyXG4gICAgICAgICAgICB9IFxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlVmFsdWUgPSBoYW5kbGVWYWx1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlVmFsdWUobmV3VmFsdWUsIGV2ZW50KTtcclxuICAgICAgICAgICAgfSAgICAgICAgIFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jZC5tYXJrRm9yQ2hlY2soKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgaGFuZGxlU3RlcENoYW5nZShuZXdWYWx1ZTogbnVtYmVyLCBvbGRWYWx1ZTogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IGRpZmYgPSAobmV3VmFsdWUgLSBvbGRWYWx1ZSk7XHJcbiAgICAgICAgbGV0IHZhbCA9IG9sZFZhbHVlO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmIChkaWZmIDwgMCkge1xyXG4gICAgICAgICAgICB2YWwgPSBvbGRWYWx1ZSArIE1hdGguY2VpbChuZXdWYWx1ZSAvIHRoaXMuc3RlcCAtIG9sZFZhbHVlIC8gdGhpcy5zdGVwKSAqIHRoaXMuc3RlcDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoZGlmZiA+IDApIHtcclxuICAgICAgICAgICAgdmFsID0gb2xkVmFsdWUgKyBNYXRoLmZsb29yKG5ld1ZhbHVlIC8gdGhpcy5zdGVwIC0gb2xkVmFsdWUgLyB0aGlzLnN0ZXApICogdGhpcy5zdGVwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnVwZGF0ZVZhbHVlKHZhbCk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVIYW5kbGVWYWx1ZSgpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICB3cml0ZVZhbHVlKHZhbHVlOiBhbnkpIDogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMucmFuZ2UpXHJcbiAgICAgICAgICAgIHRoaXMudmFsdWVzID0gdmFsdWV8fFswLDBdO1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlfHwwO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMudXBkYXRlSGFuZGxlVmFsdWUoKTtcclxuICAgICAgICB0aGlzLmNkLm1hcmtGb3JDaGVjaygpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICByZWdpc3Rlck9uQ2hhbmdlKGZuOiBGdW5jdGlvbik6IHZvaWQge1xyXG4gICAgICAgIHRoaXMub25Nb2RlbENoYW5nZSA9IGZuO1xyXG4gICAgfVxyXG5cclxuICAgIHJlZ2lzdGVyT25Ub3VjaGVkKGZuOiBGdW5jdGlvbik6IHZvaWQge1xyXG4gICAgICAgIHRoaXMub25Nb2RlbFRvdWNoZWQgPSBmbjtcclxuICAgIH1cclxuICAgIFxyXG4gICAgc2V0RGlzYWJsZWRTdGF0ZSh2YWw6IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmRpc2FibGVkID0gdmFsO1xyXG4gICAgICAgIHRoaXMuY2QubWFya0ZvckNoZWNrKCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGdldCByYW5nZVN0YXJ0TGVmdCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5pc1ZlcnRpY2FsKCkgPyAnYXV0bycgOiB0aGlzLmhhbmRsZVZhbHVlc1swXSArICclJztcclxuICAgIH1cclxuICAgIFxyXG4gICAgZ2V0IHJhbmdlU3RhcnRCb3R0b20oKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNWZXJ0aWNhbCgpID8gdGhpcy5oYW5kbGVWYWx1ZXNbMF0gKyAnJScgOiAnYXV0byc7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGdldCByYW5nZUVuZExlZnQoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNWZXJ0aWNhbCgpID8gJ2F1dG8nIDogdGhpcy5oYW5kbGVWYWx1ZXNbMV0gKyAnJSc7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGdldCByYW5nZUVuZEJvdHRvbSgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5pc1ZlcnRpY2FsKCkgPyB0aGlzLmhhbmRsZVZhbHVlc1sxXSArICclJyA6ICdhdXRvJztcclxuICAgIH1cclxuICAgIFxyXG4gICAgaXNWZXJ0aWNhbCgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5vcmllbnRhdGlvbiA9PT0gJ3ZlcnRpY2FsJztcclxuICAgIH1cclxuICAgIFxyXG4gICAgdXBkYXRlRG9tRGF0YSgpOiB2b2lkIHtcclxuICAgICAgICBsZXQgcmVjdCA9IHRoaXMuZWwubmF0aXZlRWxlbWVudC5jaGlsZHJlblswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgICB0aGlzLmluaXRYID0gcmVjdC5sZWZ0ICsgRG9tSGFuZGxlci5nZXRXaW5kb3dTY3JvbGxMZWZ0KCk7XHJcbiAgICAgICAgdGhpcy5pbml0WSA9IHJlY3QudG9wICsgRG9tSGFuZGxlci5nZXRXaW5kb3dTY3JvbGxUb3AoKTtcclxuICAgICAgICB0aGlzLmJhcldpZHRoID0gdGhpcy5lbC5uYXRpdmVFbGVtZW50LmNoaWxkcmVuWzBdLm9mZnNldFdpZHRoO1xyXG4gICAgICAgIHRoaXMuYmFySGVpZ2h0ID0gdGhpcy5lbC5uYXRpdmVFbGVtZW50LmNoaWxkcmVuWzBdLm9mZnNldEhlaWdodDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgY2FsY3VsYXRlSGFuZGxlVmFsdWUoZXZlbnQpOiBudW1iZXIge1xyXG4gICAgICAgIGlmICh0aGlzLm9yaWVudGF0aW9uID09PSAnaG9yaXpvbnRhbCcpXHJcbiAgICAgICAgICAgIHJldHVybiAoKGV2ZW50LnBhZ2VYIC0gdGhpcy5pbml0WCkgKiAxMDApIC8gKHRoaXMuYmFyV2lkdGgpO1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICAgcmV0dXJuKCgodGhpcy5pbml0WSArIHRoaXMuYmFySGVpZ2h0KSAtIGV2ZW50LnBhZ2VZKSAqIDEwMCkgLyAodGhpcy5iYXJIZWlnaHQpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICB1cGRhdGVIYW5kbGVWYWx1ZSgpOiB2b2lkIHtcclxuICAgICAgICBpZiAodGhpcy5yYW5nZSkge1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZVZhbHVlc1swXSA9ICh0aGlzLnZhbHVlc1swXSA8IHRoaXMubWluID8gMCA6IHRoaXMudmFsdWVzWzBdIC0gdGhpcy5taW4pICogMTAwIC8gKHRoaXMubWF4IC0gdGhpcy5taW4pO1xyXG4gICAgICAgICAgICB0aGlzLmhhbmRsZVZhbHVlc1sxXSA9ICh0aGlzLnZhbHVlc1sxXSA+IHRoaXMubWF4ID8gMTAwIDogdGhpcy52YWx1ZXNbMV0gLSB0aGlzLm1pbikgKiAxMDAgLyAodGhpcy5tYXggLSB0aGlzLm1pbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAodGhpcy52YWx1ZSA8IHRoaXMubWluKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVWYWx1ZSA9IDA7XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMudmFsdWUgPiB0aGlzLm1heClcclxuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlVmFsdWUgPSAxMDA7XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlVmFsdWUgPSAodGhpcy52YWx1ZSAtIHRoaXMubWluKSAqIDEwMCAvICh0aGlzLm1heCAtIHRoaXMubWluKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHVwZGF0ZVZhbHVlKHZhbDogbnVtYmVyLCBldmVudD86IEV2ZW50KTogdm9pZCB7XHJcbiAgICAgICAgaWYgKHRoaXMucmFuZ2UpIHtcclxuICAgICAgICAgICAgbGV0IHZhbHVlID0gdmFsO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgaWYgKHRoaXMuaGFuZGxlSW5kZXggPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlIDwgdGhpcy5taW4pIHtcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IHRoaXMubWluO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlVmFsdWVzWzBdID0gMDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHZhbHVlID4gdGhpcy52YWx1ZXNbMV0pIHtcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IHRoaXMudmFsdWVzWzFdO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlVmFsdWVzWzBdID0gdGhpcy5oYW5kbGVWYWx1ZXNbMV07XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5zbGlkZXJIYW5kbGVTdGFydC5uYXRpdmVFbGVtZW50LmZvY3VzKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgPiB0aGlzLm1heCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gdGhpcy5tYXg7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVWYWx1ZXNbMV0gPSAxMDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmICh2YWx1ZSA8IHRoaXMudmFsdWVzWzBdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSB0aGlzLnZhbHVlc1swXTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZVZhbHVlc1sxXSA9IHRoaXMuaGFuZGxlVmFsdWVzWzBdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuc2xpZGVySGFuZGxlRW5kLm5hdGl2ZUVsZW1lbnQuZm9jdXMoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy52YWx1ZXNbdGhpcy5oYW5kbGVJbmRleF0gPSB0aGlzLmdldE5vcm1hbGl6ZWRWYWx1ZSh2YWx1ZSk7XHJcbiAgICAgICAgICAgIHRoaXMudmFsdWVzID0gdGhpcy52YWx1ZXMuc2xpY2UoKTtcclxuICAgICAgICAgICAgdGhpcy5vbk1vZGVsQ2hhbmdlKHRoaXMudmFsdWVzKTtcclxuICAgICAgICAgICAgdGhpcy5vbkNoYW5nZS5lbWl0KHtldmVudDogZXZlbnQsIHZhbHVlczogdGhpcy52YWx1ZXN9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGlmICh2YWwgPCB0aGlzLm1pbikge1xyXG4gICAgICAgICAgICAgICAgdmFsID0gdGhpcy5taW47XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZVZhbHVlID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICh2YWwgPiB0aGlzLm1heCkge1xyXG4gICAgICAgICAgICAgICAgdmFsID0gdGhpcy5tYXg7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZVZhbHVlID0gMTAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG5cdFx0XHR0aGlzLnZhbHVlID0gdGhpcy5nZXROb3JtYWxpemVkVmFsdWUodmFsKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMub25Nb2RlbENoYW5nZSh0aGlzLnZhbHVlKTtcclxuICAgICAgICAgICAgdGhpcy5vbkNoYW5nZS5lbWl0KHtldmVudDogZXZlbnQsIHZhbHVlOiB0aGlzLnZhbHVlfSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2xpZGVySGFuZGxlLm5hdGl2ZUVsZW1lbnQuZm9jdXMoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgZ2V0VmFsdWVGcm9tSGFuZGxlKGhhbmRsZVZhbHVlOiBudW1iZXIpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiAodGhpcy5tYXggLSB0aGlzLm1pbikgKiAoaGFuZGxlVmFsdWUgLyAxMDApICsgdGhpcy5taW47XHJcbiAgICB9XHJcblx0XHJcblx0Z2V0RGVjaW1hbHNDb3VudCh2YWx1ZTogbnVtYmVyKTogbnVtYmVyIHtcclxuXHRcdGlmICh2YWx1ZSAmJiBNYXRoLmZsb29yKHZhbHVlKSAhPT0gdmFsdWUpXHJcblx0XHRcdHJldHVybiB2YWx1ZS50b1N0cmluZygpLnNwbGl0KFwiLlwiKVsxXS5sZW5ndGggfHwgMDtcclxuXHRcdHJldHVybiAwO1xyXG5cdH1cclxuXHRcclxuXHRnZXROb3JtYWxpemVkVmFsdWUodmFsOiBudW1iZXIpOiBudW1iZXIge1xyXG5cdFx0bGV0IGRlY2ltYWxzQ291bnQgPSB0aGlzLmdldERlY2ltYWxzQ291bnQodGhpcy5zdGVwKTtcclxuXHRcdGlmIChkZWNpbWFsc0NvdW50ID4gMCkge1xyXG5cdFx0XHRyZXR1cm4gK3ZhbC50b0ZpeGVkKGRlY2ltYWxzQ291bnQpO1xyXG5cdFx0fSBcclxuXHRcdGVsc2Uge1xyXG5cdFx0XHRyZXR1cm4gTWF0aC5mbG9vcih2YWwpO1xyXG5cdFx0fVxyXG5cdH1cclxuICAgIFxyXG4gICAgbmdPbkRlc3Ryb3koKSB7XHJcbiAgICAgICAgdGhpcy51bmJpbmREcmFnTGlzdGVuZXJzKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbkBOZ01vZHVsZSh7XHJcbiAgICBpbXBvcnRzOiBbQ29tbW9uTW9kdWxlXSxcclxuICAgIGV4cG9ydHM6IFtTbGlkZXJdLFxyXG4gICAgZGVjbGFyYXRpb25zOiBbU2xpZGVyXVxyXG59KVxyXG5leHBvcnQgY2xhc3MgU2xpZGVyTW9kdWxlIHsgfVxyXG4iXX0=