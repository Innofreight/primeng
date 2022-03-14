import { NgModule, Directive, ElementRef, HostListener, Input, forwardRef, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomHandler } from 'primeng/dom';
import { NG_VALIDATORS } from '@angular/forms';
export const KEYFILTER_VALIDATOR = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => KeyFilter),
    multi: true
};
const DEFAULT_MASKS = {
    pint: /[\d]/,
    'int': /[\d\-]/,
    pnum: /[\d\.]/,
    money: /[\d\.\s,]/,
    num: /[\d\-\.]/,
    hex: /[0-9a-f]/i,
    email: /[a-z0-9_\.\-@]/i,
    alpha: /[a-z_]/i,
    alphanum: /[a-z0-9_]/i
};
const KEYS = {
    TAB: 9,
    RETURN: 13,
    ESC: 27,
    BACKSPACE: 8,
    DELETE: 46
};
const SAFARI_KEYS = {
    63234: 37,
    63235: 39,
    63232: 38,
    63233: 40,
    63276: 33,
    63277: 34,
    63272: 46,
    63273: 36,
    63275: 35 // end
};
export class KeyFilter {
    constructor(el) {
        this.el = el;
        this.ngModelChange = new EventEmitter();
        this.isAndroid = DomHandler.isAndroid();
    }
    get pattern() {
        return this._pattern;
    }
    set pattern(_pattern) {
        this._pattern = _pattern;
        this.regex = DEFAULT_MASKS[this._pattern] || this._pattern;
    }
    isNavKeyPress(e) {
        let k = e.keyCode;
        k = DomHandler.getBrowser().safari ? (SAFARI_KEYS[k] || k) : k;
        return (k >= 33 && k <= 40) || k == KEYS.RETURN || k == KEYS.TAB || k == KEYS.ESC;
    }
    ;
    isSpecialKey(e) {
        let k = e.keyCode || e.charCode;
        return k == 9 || k == 13 || k == 27 || k == 16 || k == 17 || (k >= 18 && k <= 20) ||
            (DomHandler.getBrowser().opera && !e.shiftKey && (k == 8 || (k >= 33 && k <= 35) || (k >= 36 && k <= 39) || (k >= 44 && k <= 45)));
    }
    getKey(e) {
        let k = e.keyCode || e.charCode;
        return DomHandler.getBrowser().safari ? (SAFARI_KEYS[k] || k) : k;
    }
    getCharCode(e) {
        return e.charCode || e.keyCode || e.which;
    }
    findDelta(value, prevValue) {
        let delta = '';
        for (let i = 0; i < value.length; i++) {
            let str = value.substr(0, i) + value.substr(i + value.length - prevValue.length);
            if (str === prevValue)
                delta = value.substr(i, value.length - prevValue.length);
        }
        return delta;
    }
    isValidChar(c) {
        return this.regex.test(c);
    }
    isValidString(str) {
        for (let i = 0; i < str.length; i++) {
            if (!this.isValidChar(str.substr(i, 1))) {
                return false;
            }
        }
        return true;
    }
    onInput(e) {
        if (this.isAndroid && !this.pValidateOnly) {
            let val = this.el.nativeElement.value;
            let lastVal = this.lastValue || '';
            let inserted = this.findDelta(val, lastVal);
            let removed = this.findDelta(lastVal, val);
            let pasted = inserted.length > 1 || (!inserted && !removed);
            if (pasted) {
                if (!this.isValidString(val)) {
                    this.el.nativeElement.value = lastVal;
                    this.ngModelChange.emit(lastVal);
                }
            }
            else if (!removed) {
                if (!this.isValidChar(inserted)) {
                    this.el.nativeElement.value = lastVal;
                    this.ngModelChange.emit(lastVal);
                }
            }
            val = this.el.nativeElement.value;
            if (this.isValidString(val)) {
                this.lastValue = val;
            }
        }
    }
    onKeyPress(e) {
        if (this.isAndroid || this.pValidateOnly) {
            return;
        }
        let browser = DomHandler.getBrowser();
        let k = this.getKey(e);
        if (browser.mozilla && (e.ctrlKey || e.altKey)) {
            return;
        }
        else if (k == 17 || k == 18) {
            return;
        }
        let c = this.getCharCode(e);
        let cc = String.fromCharCode(c);
        let ok = true;
        if (!browser.mozilla && (this.isSpecialKey(e) || !cc)) {
            return;
        }
        ok = this.regex.test(cc);
        if (!ok) {
            e.preventDefault();
        }
    }
    onPaste(e) {
        const clipboardData = e.clipboardData || window.clipboardData.getData('text');
        if (clipboardData) {
            const pastedText = clipboardData.getData('text');
            for (let char of pastedText.toString()) {
                if (!this.regex.test(char)) {
                    e.preventDefault();
                    return;
                }
            }
        }
    }
    validate(c) {
        if (this.pValidateOnly) {
            let value = this.el.nativeElement.value;
            if (value && !this.regex.test(value)) {
                return {
                    validatePattern: false
                };
            }
        }
    }
}
KeyFilter.decorators = [
    { type: Directive, args: [{
                selector: '[pKeyFilter]',
                providers: [KEYFILTER_VALIDATOR]
            },] }
];
KeyFilter.ctorParameters = () => [
    { type: ElementRef }
];
KeyFilter.propDecorators = {
    pValidateOnly: [{ type: Input }],
    ngModelChange: [{ type: Output }],
    pattern: [{ type: Input, args: ['pKeyFilter',] }],
    onInput: [{ type: HostListener, args: ['input', ['$event'],] }],
    onKeyPress: [{ type: HostListener, args: ['keypress', ['$event'],] }],
    onPaste: [{ type: HostListener, args: ['paste', ['$event'],] }]
};
export class KeyFilterModule {
}
KeyFilterModule.decorators = [
    { type: NgModule, args: [{
                imports: [CommonModule],
                exports: [KeyFilter],
                declarations: [KeyFilter]
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2V5ZmlsdGVyLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLy4uL3NyYy9hcHAvY29tcG9uZW50cy9rZXlmaWx0ZXIvIiwic291cmNlcyI6WyJrZXlmaWx0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDdkgsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDekMsT0FBTyxFQUE4QixhQUFhLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUUzRSxNQUFNLENBQUMsTUFBTSxtQkFBbUIsR0FBUTtJQUNwQyxPQUFPLEVBQUUsYUFBYTtJQUN0QixXQUFXLEVBQUUsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQztJQUN4QyxLQUFLLEVBQUUsSUFBSTtDQUNkLENBQUM7QUFFRixNQUFNLGFBQWEsR0FBRztJQUNsQixJQUFJLEVBQUUsTUFBTTtJQUNaLEtBQUssRUFBRSxRQUFRO0lBQ2YsSUFBSSxFQUFFLFFBQVE7SUFDZCxLQUFLLEVBQUUsV0FBVztJQUNsQixHQUFHLEVBQUUsVUFBVTtJQUNmLEdBQUcsRUFBRSxXQUFXO0lBQ2hCLEtBQUssRUFBRSxpQkFBaUI7SUFDeEIsS0FBSyxFQUFFLFNBQVM7SUFDaEIsUUFBUSxFQUFFLFlBQVk7Q0FDekIsQ0FBQztBQUVGLE1BQU0sSUFBSSxHQUFHO0lBQ1QsR0FBRyxFQUFFLENBQUM7SUFDTixNQUFNLEVBQUUsRUFBRTtJQUNWLEdBQUcsRUFBRSxFQUFFO0lBQ1AsU0FBUyxFQUFFLENBQUM7SUFDWixNQUFNLEVBQUUsRUFBRTtDQUNiLENBQUM7QUFFRixNQUFNLFdBQVcsR0FBRztJQUNoQixLQUFLLEVBQUUsRUFB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LEVBQUU7b0JBQ3hCLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztvQkFDbkIsT0FBTztpQkFDVjthQUNKO1NBQ0o7SUFDTCxDQUFDO0lBRUQsUUFBUSxDQUFDLENBQWtCO1FBQ3ZCLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtZQUNwQixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUM7WUFDeEMsSUFBSSxLQUFLLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRTtnQkFDbEMsT0FBTztvQkFDSCxlQUFlLEVBQUUsS0FBSztpQkFDekIsQ0FBQTthQUNKO1NBQ0o7SUFDTCxDQUFDOzs7WUF0S0osU0FBUyxTQUFDO2dCQUNQLFFBQVEsRUFBRSxjQUFjO2dCQUN4QixTQUFTLEVBQUUsQ0FBQyxtQkFBbUIsQ0FBQzthQUNuQzs7O1lBOUM2QixVQUFVOzs7NEJBaURuQyxLQUFLOzRCQUVMLE1BQU07c0JBa0JOLEtBQUssU0FBQyxZQUFZO3NCQXdEbEIsWUFBWSxTQUFDLE9BQU8sRUFBRSxDQUFDLFFBQVEsQ0FBQzt5QkE4QmhDLFlBQVksU0FBQyxVQUFVLEVBQUUsQ0FBQyxRQUFRLENBQUM7c0JBK0JuQyxZQUFZLFNBQUMsT0FBTyxFQUFFLENBQUMsUUFBUSxDQUFDOztBQWdDckMsTUFBTSxPQUFPLGVBQWU7OztZQUwzQixRQUFRLFNBQUM7Z0JBQ04sT0FBTyxFQUFFLENBQUMsWUFBWSxDQUFDO2dCQUN2QixPQUFPLEVBQUUsQ0FBQyxTQUFTLENBQUM7Z0JBQ3BCLFlBQVksRUFBRSxDQUFDLFNBQVMsQ0FBQzthQUM1QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5nTW9kdWxlLCBEaXJlY3RpdmUsIEVsZW1lbnRSZWYsIEhvc3RMaXN0ZW5lciwgSW5wdXQsIGZvcndhcmRSZWYsIE91dHB1dCwgRXZlbnRFbWl0dGVyIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IENvbW1vbk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XHJcbmltcG9ydCB7IERvbUhhbmRsZXIgfSBmcm9tICdwcmltZW5nL2RvbSc7XHJcbmltcG9ydCB7IFZhbGlkYXRvciwgQWJzdHJhY3RDb250cm9sLCBOR19WQUxJREFUT1JTIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xyXG5cclxuZXhwb3J0IGNvbnN0IEtFWUZJTFRFUl9WQUxJREFUT1I6IGFueSA9IHtcclxuICAgIHByb3ZpZGU6IE5HX1ZBTElEQVRPUlMsXHJcbiAgICB1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBLZXlGaWx0ZXIpLFxyXG4gICAgbXVsdGk6IHRydWVcclxufTtcclxuXHJcbmNvbnN0IERFRkFVTFRfTUFTS1MgPSB7XHJcbiAgICBwaW50OiAvW1xcZF0vLFxyXG4gICAgJ2ludCc6IC9bXFxkXFwtXS8sXHJcbiAgICBwbnVtOiAvW1xcZFxcLl0vLFxyXG4gICAgbW9uZXk6IC9bXFxkXFwuXFxzLF0vLFxyXG4gICAgbnVtOiAvW1xcZFxcLVxcLl0vLFxyXG4gICAgaGV4OiAvWzAtOWEtZl0vaSxcclxuICAgIGVtYWlsOiAvW2EtejAtOV9cXC5cXC1AXS9pLFxyXG4gICAgYWxwaGE6IC9bYS16X10vaSxcclxuICAgIGFscGhhbnVtOiAvW2EtejAtOV9dL2lcclxufTtcclxuXHJcbmNvbnN0IEtFWVMgPSB7XHJcbiAgICBUQUI6IDksXHJcbiAgICBSRVRVUk46IDEzLFxyXG4gICAgRVNDOiAyNyxcclxuICAgIEJBQ0tTUEFDRTogOCxcclxuICAgIERFTEVURTogNDZcclxufTtcclxuXHJcbmNvbnN0IFNBRkFSSV9LRVlTID0ge1xyXG4gICAgNjMyMzQ6IDM3LCAvLyBsZWZ0XHJcbiAgICA2MzIzNTogMzksIC8vIHJpZ2h0XHJcbiAgICA2MzIzMjogMzgsIC8vIHVwXHJcbiAgICA2MzIzMzogNDAsIC8vIGRvd25cclxuICAgIDYzMjc2OiAzMywgLy8gcGFnZSB1cFxyXG4gICAgNjMyNzc6IDM0LCAvLyBwYWdlIGRvd25cclxuICAgIDYzMjcyOiA0NiwgLy8gZGVsZXRlXHJcbiAgICA2MzI3MzogMzYsIC8vIGhvbWVcclxuICAgIDYzMjc1OiAzNSAgLy8gZW5kXHJcbn07XHJcblxyXG5ARGlyZWN0aXZlKHtcclxuICAgIHNlbGVjdG9yOiAnW3BLZXlGaWx0ZXJdJyxcclxuICAgIHByb3ZpZGVyczogW0tFWUZJTFRFUl9WQUxJREFUT1JdXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBLZXlGaWx0ZXIgaW1wbGVtZW50cyBWYWxpZGF0b3Ige1xyXG5cclxuICAgIEBJbnB1dCgpIHBWYWxpZGF0ZU9ubHk6IGJvb2xlYW47XHJcblxyXG4gICAgQE91dHB1dCgpIG5nTW9kZWxDaGFuZ2U6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG5cclxuICAgIHJlZ2V4OiBSZWdFeHA7XHJcblxyXG4gICAgX3BhdHRlcm46IGFueTtcclxuXHJcbiAgICBpc0FuZHJvaWQ6IGJvb2xlYW47XHJcblxyXG4gICAgbGFzdFZhbHVlOiBhbnk7XHJcblxyXG4gICAgY29uc3RydWN0b3IocHVibGljIGVsOiBFbGVtZW50UmVmKSB7XHJcbiAgICAgICAgdGhpcy5pc0FuZHJvaWQgPSBEb21IYW5kbGVyLmlzQW5kcm9pZCgpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBwYXR0ZXJuKCk6IGFueSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhdHRlcm47XHJcbiAgICB9XHJcblxyXG4gICAgQElucHV0KCdwS2V5RmlsdGVyJykgc2V0IHBhdHRlcm4oX3BhdHRlcm46IGFueSkge1xyXG4gICAgICAgIHRoaXMuX3BhdHRlcm4gPSBfcGF0dGVybjtcclxuICAgICAgICB0aGlzLnJlZ2V4ID0gREVGQVVMVF9NQVNLU1t0aGlzLl9wYXR0ZXJuXSB8fCB0aGlzLl9wYXR0ZXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlzTmF2S2V5UHJlc3MoZTogS2V5Ym9hcmRFdmVudCkge1xyXG4gICAgICAgIGxldCBrID0gZS5rZXlDb2RlO1xyXG4gICAgICAgIGsgPSBEb21IYW5kbGVyLmdldEJyb3dzZXIoKS5zYWZhcmkgPyAoU0FGQVJJX0tFWVNba10gfHwgaykgOiBrO1xyXG5cclxuICAgICAgICByZXR1cm4gKGsgPj0gMzMgJiYgayA8PSA0MCkgfHwgayA9PSBLRVlTLlJFVFVSTiB8fCBrID09IEtFWVMuVEFCIHx8IGsgPT0gS0VZUy5FU0M7XHJcbiAgICB9O1xyXG5cclxuICAgIGlzU3BlY2lhbEtleShlOiBLZXlib2FyZEV2ZW50KSB7XHJcbiAgICAgICAgbGV0IGsgPSBlLmtleUNvZGUgfHwgZS5jaGFyQ29kZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGsgPT0gOSB8fCBrID09IDEzIHx8IGsgPT0gMjcgfHwgayA9PSAxNiB8fCBrID09IDE3IHx8KGsgPj0gMTggJiYgayA8PSAyMCkgfHxcclxuICAgICAgICAgICAgKERvbUhhbmRsZXIuZ2V0QnJvd3NlcigpLm9wZXJhICYmICFlLnNoaWZ0S2V5ICYmIChrID09IDggfHwgKGsgPj0gMzMgJiYgayA8PSAzNSkgfHwgKGsgPj0gMzYgJiYgayA8PSAzOSkgfHwgKGsgPj0gNDQgJiYgayA8PSA0NSkpKTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgZ2V0S2V5KGU6IEtleWJvYXJkRXZlbnQpIHtcclxuICAgICAgICBsZXQgayA9IGUua2V5Q29kZSB8fCBlLmNoYXJDb2RlO1xyXG4gICAgICAgIHJldHVybiBEb21IYW5kbGVyLmdldEJyb3dzZXIoKS5zYWZhcmkgPyAoU0FGQVJJX0tFWVNba10gfHwgaykgOiBrO1xyXG4gICAgfVxyXG5cclxuICAgIGdldENoYXJDb2RlKGU6IEtleWJvYXJkRXZlbnQpIHtcclxuICAgICAgICByZXR1cm4gZS5jaGFyQ29kZSB8fCBlLmtleUNvZGUgfHwgZS53aGljaDtcclxuICAgIH1cclxuXHJcbiAgICBmaW5kRGVsdGEodmFsdWU6IHN0cmluZywgcHJldlZhbHVlOiBzdHJpbmcpIHtcclxuICAgICAgICBsZXQgZGVsdGEgPSAnJztcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB2YWx1ZS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgc3RyID0gdmFsdWUuc3Vic3RyKDAsIGkpICsgdmFsdWUuc3Vic3RyKGkgKyB2YWx1ZS5sZW5ndGggLSBwcmV2VmFsdWUubGVuZ3RoKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChzdHIgPT09IHByZXZWYWx1ZSlcclxuICAgICAgICAgICAgICAgIGRlbHRhID0gdmFsdWUuc3Vic3RyKGksIHZhbHVlLmxlbmd0aCAtIHByZXZWYWx1ZS5sZW5ndGgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGRlbHRhO1xyXG4gICAgfVxyXG5cclxuICAgIGlzVmFsaWRDaGFyKGM6IHN0cmluZykge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnJlZ2V4LnRlc3QoYyk7XHJcbiAgICB9XHJcblxyXG4gICAgaXNWYWxpZFN0cmluZyhzdHI6IHN0cmluZykge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5pc1ZhbGlkQ2hhcihzdHIuc3Vic3RyKGksIDEpKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBASG9zdExpc3RlbmVyKCdpbnB1dCcsIFsnJGV2ZW50J10pXHJcbiAgICBvbklucHV0KGU6IEtleWJvYXJkRXZlbnQpIHtcclxuICAgICAgICBpZiAodGhpcy5pc0FuZHJvaWQgJiYgIXRoaXMucFZhbGlkYXRlT25seSkge1xyXG4gICAgICAgICAgICBsZXQgdmFsID0gdGhpcy5lbC5uYXRpdmVFbGVtZW50LnZhbHVlO1xyXG4gICAgICAgICAgICBsZXQgbGFzdFZhbCA9IHRoaXMubGFzdFZhbHVlIHx8ICcnO1xyXG5cclxuICAgICAgICAgICAgbGV0IGluc2VydGVkID0gdGhpcy5maW5kRGVsdGEodmFsLCBsYXN0VmFsKTtcclxuICAgICAgICAgICAgbGV0IHJlbW92ZWQgPSB0aGlzLmZpbmREZWx0YShsYXN0VmFsLCB2YWwpO1xyXG4gICAgICAgICAgICBsZXQgcGFzdGVkID0gaW5zZXJ0ZWQubGVuZ3RoID4gMSB8fCAoIWluc2VydGVkICYmICFyZW1vdmVkKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChwYXN0ZWQpIHtcclxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5pc1ZhbGlkU3RyaW5nKHZhbCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVsLm5hdGl2ZUVsZW1lbnQudmFsdWUgPSBsYXN0VmFsO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubmdNb2RlbENoYW5nZS5lbWl0KGxhc3RWYWwpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKCFyZW1vdmVkKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuaXNWYWxpZENoYXIoaW5zZXJ0ZWQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbC5uYXRpdmVFbGVtZW50LnZhbHVlID0gbGFzdFZhbDtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm5nTW9kZWxDaGFuZ2UuZW1pdChsYXN0VmFsKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFsID0gdGhpcy5lbC5uYXRpdmVFbGVtZW50LnZhbHVlO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5pc1ZhbGlkU3RyaW5nKHZhbCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubGFzdFZhbHVlID0gdmFsO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIEBIb3N0TGlzdGVuZXIoJ2tleXByZXNzJywgWyckZXZlbnQnXSlcclxuICAgIG9uS2V5UHJlc3MoZTogS2V5Ym9hcmRFdmVudCkge1xyXG4gICAgICAgIGlmICh0aGlzLmlzQW5kcm9pZCB8fCB0aGlzLnBWYWxpZGF0ZU9ubHkpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGJyb3dzZXIgPSBEb21IYW5kbGVyLmdldEJyb3dzZXIoKTtcclxuICAgICAgICBsZXQgayA9IHRoaXMuZ2V0S2V5KGUpO1xyXG5cclxuICAgICAgICBpZiAoYnJvd3Nlci5tb3ppbGxhICYmIChlLmN0cmxLZXkgfHwgZS5hbHRLZXkpKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAoayA9PSAxNyB8fCBrID09IDE4KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBjID0gdGhpcy5nZXRDaGFyQ29kZShlKTtcclxuICAgICAgICBsZXQgY2MgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGMpO1xyXG4gICAgICAgIGxldCBvayA9IHRydWU7XHJcblxyXG4gICAgICAgIGlmICghYnJvd3Nlci5tb3ppbGxhICYmICh0aGlzLmlzU3BlY2lhbEtleShlKSB8fCAhY2MpKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG9rID0gdGhpcy5yZWdleC50ZXN0KGNjKTtcclxuXHJcbiAgICAgICAgaWYgKCFvaykge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIEBIb3N0TGlzdGVuZXIoJ3Bhc3RlJywgWyckZXZlbnQnXSlcclxuICAgIG9uUGFzdGUoZSkge1xyXG4gICAgICAgIGNvbnN0IGNsaXBib2FyZERhdGEgPSBlLmNsaXBib2FyZERhdGEgfHwgKDxhbnk+d2luZG93KS5jbGlwYm9hcmREYXRhLmdldERhdGEoJ3RleHQnKTtcclxuICAgICAgICBpZiAoY2xpcGJvYXJkRGF0YSkge1xyXG4gICAgICAgICAgICBjb25zdCBwYXN0ZWRUZXh0ID0gY2xpcGJvYXJkRGF0YS5nZXREYXRhKCd0ZXh0Jyk7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGNoYXIgb2YgcGFzdGVkVGV4dC50b1N0cmluZygpKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMucmVnZXgudGVzdChjaGFyKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdmFsaWRhdGUoYzogQWJzdHJhY3RDb250cm9sKTogeyBba2V5OiBzdHJpbmddOiBhbnkgfSB7XHJcbiAgICAgICAgaWYgKHRoaXMucFZhbGlkYXRlT25seSkge1xyXG4gICAgICAgICAgICBsZXQgdmFsdWUgPSB0aGlzLmVsLm5hdGl2ZUVsZW1lbnQudmFsdWU7XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSAmJiAhdGhpcy5yZWdleC50ZXN0KHZhbHVlKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICB2YWxpZGF0ZVBhdHRlcm46IGZhbHNlXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG59XHJcblxyXG5ATmdNb2R1bGUoe1xyXG4gICAgaW1wb3J0czogW0NvbW1vbk1vZHVsZV0sXHJcbiAgICBleHBvcnRzOiBbS2V5RmlsdGVyXSxcclxuICAgIGRlY2xhcmF0aW9uczogW0tleUZpbHRlcl1cclxufSlcclxuZXhwb3J0IGNsYXNzIEtleUZpbHRlck1vZHVsZSB7IH1cclxuIl19