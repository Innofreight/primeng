import { NgModule, Component, EventEmitter, Input, NgZone, Output, ElementRef, ChangeDetectionStrategy, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
export class Captcha {
    constructor(el, _zone, cd) {
        this.el = el;
        this._zone = _zone;
        this.cd = cd;
        this.siteKey = null;
        this.theme = 'light';
        this.type = 'image';
        this.size = 'normal';
        this.tabindex = 0;
        this.initCallback = "initRecaptcha";
        this.onResponse = new EventEmitter();
        this.onExpire = new EventEmitter();
        this._instance = null;
        this._language = null;
    }
    get language() {
        return this._language;
    }
    set language(language) {
        this._language = language;
        this.init();
    }
    ngAfterViewInit() {
        if (window.grecaptcha) {
            if (!window.grecaptcha.render) {
                setTimeout(() => {
                    this.init();
                }, 100);
            }
            else {
                this.init();
            }
        }
        else {
            window[this.initCallback] = () => {
                this.init();
            };
        }
    }
    init() {
        this._instance = window.grecaptcha.render(this.el.nativeElement.children[0], {
            'sitekey': this.siteKey,
            'theme': this.theme,
            'type': this.type,
            'size': this.size,
            'tabindex': this.tabindex,
            'hl': this.language,
            'callback': (response) => { this._zone.run(() => this.recaptchaCallback(response)); },
            'expired-callback': () => { this._zone.run(() => this.recaptchaExpiredCallback()); }
        });
    }
    reset() {
        if (this._instance === null)
            return;
        window.grecaptcha.reset(this._instance);
        this.cd.markForCheck();
    }
    getResponse() {
        if (this._instance === null)
            return null;
        return window.grecaptcha.getResponse(this._instance);
    }
    recaptchaCallback(response) {
        this.onResponse.emit({
            response: response
        });
    }
    recaptchaExpiredCallback() {
        this.onExpire.emit();
    }
    ngOnDestroy() {
        if (this._instance != null) {
            window.grecaptcha.reset(this._instance);
        }
    }
}
Captcha.decorators = [
    { type: Component, args: [{
                selector: 'p-captcha',
                template: `<div></div>`,
                changeDetection: ChangeDetectionStrategy.OnPush,
                encapsulation: ViewEncapsulation.None
            },] }
];
Captcha.ctorParameters = () => [
    { type: ElementRef },
    { type: NgZone },
    { type: ChangeDetectorRef }
];
Captcha.propDecorators = {
    siteKey: [{ type: Input }],
    theme: [{ type: Input }],
    type: [{ type: Input }],
    size: [{ type: Input }],
    tabindex: [{ type: Input }],
    initCallback: [{ type: Input }],
    onResponse: [{ type: Output }],
    onExpire: [{ type: Output }],
    language: [{ type: Input }]
};
export class CaptchaModule {
}
CaptchaModule.decorators = [
    { type: NgModule, args: [{
                imports: [CommonModule],
                exports: [Captcha],
                declarations: [Captcha]
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FwdGNoYS5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8uLi9zcmMvYXBwL2NvbXBvbmVudHMvY2FwdGNoYS8iLCJzb3VyY2VzIjpbImNhcHRjaGEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFFBQVEsRUFBZSxTQUFTLEVBQUMsWUFBWSxFQUFDLEtBQUssRUFBQyxNQUFNLEVBQVcsTUFBTSxFQUFDLFVBQVUsRUFBQyx1QkFBdUIsRUFBRSxpQkFBaUIsRUFBRSxpQkFBaUIsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNuTCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFRN0MsTUFBTSxPQUFPLE9BQU87SUFnQ2hCLFlBQW1CLEVBQWMsRUFBUyxLQUFhLEVBQVMsRUFBcUI7UUFBbEUsT0FBRSxHQUFGLEVBQUUsQ0FBWTtRQUFTLFVBQUssR0FBTCxLQUFLLENBQVE7UUFBUyxPQUFFLEdBQUYsRUFBRSxDQUFtQjtRQTlCNUUsWUFBTyxHQUFXLElBQUksQ0FBQztRQUV2QixVQUFLLEdBQUcsT0FBTyxDQUFDO1FBRWhCLFNBQUksR0FBRyxPQUFPLENBQUM7UUFFZixTQUFJLEdBQUcsUUFBUSxDQUFDO1FBRWhCLGFBQVEsR0FBRyxDQUFDLENBQUM7UUFFYixpQkFBWSxHQUFHLGVBQWUsQ0FBQztRQUU5QixlQUFVLEdBQXNCLElBQUksWUFBWSxFQUFFLENBQUM7UUFFbkQsYUFBUSxHQUFzQixJQUFJLFlBQVksRUFBRSxDQUFDO1FBRW5ELGNBQVMsR0FBUSxJQUFJLENBQUM7UUFFdEIsY0FBUyxHQUFRLElBQUksQ0FBQztJQVkwRCxDQUFDO0lBVHpGLElBQWEsUUFBUTtRQUNqQixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7SUFDMUIsQ0FBQztJQUVELElBQUksUUFBUSxDQUFDLFFBQWdCO1FBQ3pCLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO1FBQzFCLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNoQixD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dUJBRU4sTUFBTTt1QkFPTixLQUFLOztBQStFVixNQUFNLE9BQU8sYUFBYTs7O1lBTHpCLFFBQVEsU0FBQztnQkFDTixPQUFPLEVBQUUsQ0FBQyxZQUFZLENBQUM7Z0JBQ3ZCLE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQztnQkFDbEIsWUFBWSxFQUFFLENBQUMsT0FBTyxDQUFDO2FBQzFCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtOZ01vZHVsZSxBZnRlclZpZXdJbml0LENvbXBvbmVudCxFdmVudEVtaXR0ZXIsSW5wdXQsTmdab25lLE9uRGVzdHJveSxPdXRwdXQsRWxlbWVudFJlZixDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSwgVmlld0VuY2Fwc3VsYXRpb24sIENoYW5nZURldGVjdG9yUmVmfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHtDb21tb25Nb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XHJcblxyXG5AQ29tcG9uZW50KHtcclxuICAgIHNlbGVjdG9yOiAncC1jYXB0Y2hhJyxcclxuICAgIHRlbXBsYXRlOiBgPGRpdj48L2Rpdj5gLFxyXG4gICAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXHJcbiAgICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBDYXB0Y2hhIGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCxPbkRlc3Ryb3kge1xyXG5cclxuICAgIEBJbnB1dCgpIHNpdGVLZXk6IHN0cmluZyA9IG51bGw7XHJcbiAgICAgICAgXHJcbiAgICBASW5wdXQoKSB0aGVtZSA9ICdsaWdodCc7XHJcbiAgICBcclxuICAgIEBJbnB1dCgpIHR5cGUgPSAnaW1hZ2UnO1xyXG4gICAgXHJcbiAgICBASW5wdXQoKSBzaXplID0gJ25vcm1hbCc7XHJcbiAgICBcclxuICAgIEBJbnB1dCgpIHRhYmluZGV4ID0gMDtcclxuICAgICBcclxuICAgIEBJbnB1dCgpIGluaXRDYWxsYmFjayA9IFwiaW5pdFJlY2FwdGNoYVwiO1xyXG4gICAgXHJcbiAgICBAT3V0cHV0KCkgb25SZXNwb25zZTogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XHJcbiAgICBcclxuICAgIEBPdXRwdXQoKSBvbkV4cGlyZTogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XHJcbiAgICBcclxuICAgIHByaXZhdGUgX2luc3RhbmNlOiBhbnkgPSBudWxsO1xyXG5cclxuICAgIHByaXZhdGUgX2xhbmd1YWdlOiBhbnkgPSBudWxsO1xyXG5cclxuXHJcbiAgICBASW5wdXQoKSBnZXQgbGFuZ3VhZ2UoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbGFuZ3VhZ2U7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IGxhbmd1YWdlKGxhbmd1YWdlOiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLl9sYW5ndWFnZSA9IGxhbmd1YWdlO1xyXG4gICAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBlbDogRWxlbWVudFJlZiwgcHVibGljIF96b25lOiBOZ1pvbmUsIHB1YmxpYyBjZDogQ2hhbmdlRGV0ZWN0b3JSZWYpIHt9XHJcbiAgICBcclxuICAgIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcclxuICAgICAgICBpZiAoKDxhbnk+d2luZG93KS5ncmVjYXB0Y2hhKSB7XHJcbiAgICAgICAgICAgIGlmICghKDxhbnk+d2luZG93KS5ncmVjYXB0Y2hhLnJlbmRlcil7XHJcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+e1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5pdCgpO1xyXG4gICAgICAgICAgICAgICAgfSwxMDApXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmluaXQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgKDxhbnk+d2luZG93KVt0aGlzLmluaXRDYWxsYmFja10gPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgdGhpcy5pbml0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IFxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBpbml0KCnCoHtcclxuICAgICAgICB0aGlzLl9pbnN0YW5jZSA9ICg8YW55PndpbmRvdykuZ3JlY2FwdGNoYS5yZW5kZXIodGhpcy5lbC5uYXRpdmVFbGVtZW50LmNoaWxkcmVuWzBdLCB7XHJcbiAgICAgICAgICAgICdzaXRla2V5JzogdGhpcy5zaXRlS2V5LFxyXG4gICAgICAgICAgICAndGhlbWUnOiB0aGlzLnRoZW1lLFxyXG4gICAgICAgICAgICAndHlwZSc6IHRoaXMudHlwZSxcclxuICAgICAgICAgICAgJ3NpemUnOiB0aGlzLnNpemUsXHJcbiAgICAgICAgICAgICd0YWJpbmRleCc6IHRoaXMudGFiaW5kZXgsXHJcbiAgICAgICAgICAgICdobCc6IHRoaXMubGFuZ3VhZ2UsXHJcbiAgICAgICAgICAgICdjYWxsYmFjayc6IChyZXNwb25zZTogc3RyaW5nKSA9PiB7dGhpcy5fem9uZS5ydW4oKCkgPT4gdGhpcy5yZWNhcHRjaGFDYWxsYmFjayhyZXNwb25zZSkpfSxcclxuICAgICAgICAgICAgJ2V4cGlyZWQtY2FsbGJhY2snOiAoKSA9PiB7dGhpcy5fem9uZS5ydW4oKCkgPT4gdGhpcy5yZWNhcHRjaGFFeHBpcmVkQ2FsbGJhY2soKSl9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHJlc2V0KCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9pbnN0YW5jZSA9PT0gbnVsbClcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIFxyXG4gICAgICAgICg8YW55PndpbmRvdykuZ3JlY2FwdGNoYS5yZXNldCh0aGlzLl9pbnN0YW5jZSk7XHJcbiAgICAgICAgdGhpcy5jZC5tYXJrRm9yQ2hlY2soKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZ2V0UmVzcG9uc2UoKTogU3RyaW5nIHtcclxuICAgICAgICBpZiAodGhpcy5faW5zdGFuY2UgPT09IG51bGwpXHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHJldHVybiAoPGFueT53aW5kb3cpLmdyZWNhcHRjaGEuZ2V0UmVzcG9uc2UodGhpcy5faW5zdGFuY2UpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICByZWNhcHRjaGFDYWxsYmFjayhyZXNwb25zZTogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5vblJlc3BvbnNlLmVtaXQoe1xyXG4gICAgICAgICAgICByZXNwb25zZTogcmVzcG9uc2VcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZWNhcHRjaGFFeHBpcmVkQ2FsbGJhY2soKSB7XHJcbiAgICAgICAgdGhpcy5vbkV4cGlyZS5lbWl0KCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIG5nT25EZXN0cm95KCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9pbnN0YW5jZSAhPSBudWxsKSB7XHJcbiAgICAgICAgICAoPGFueT53aW5kb3cpLmdyZWNhcHRjaGEucmVzZXQodGhpcy5faW5zdGFuY2UpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuQE5nTW9kdWxlKHtcclxuICAgIGltcG9ydHM6IFtDb21tb25Nb2R1bGVdLFxyXG4gICAgZXhwb3J0czogW0NhcHRjaGFdLFxyXG4gICAgZGVjbGFyYXRpb25zOiBbQ2FwdGNoYV1cclxufSlcclxuZXhwb3J0IGNsYXNzIENhcHRjaGFNb2R1bGUgeyB9XHJcbiJdfQ==