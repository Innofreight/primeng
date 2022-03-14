import { NgModule, Component, ChangeDetectionStrategy, ViewEncapsulation, Input, Directive, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'primeng/api';
import { DomHandler } from 'primeng/dom';
import { UniqueComponentId } from 'primeng/utils';
export class BadgeDirective {
    constructor(el) {
        this.el = el;
        this.iconPos = 'left';
    }
    ngAfterViewInit() {
        this.id = UniqueComponentId() + '_badge';
        let el = this.el.nativeElement.nodeName.indexOf("-") != -1 ? this.el.nativeElement.firstChild : this.el.nativeElement;
        let badge = document.createElement('span');
        badge.id = this.id;
        badge.className = 'p-badge p-component';
        if (this.severity) {
            DomHandler.addClass(badge, 'p-badge-' + this.severity);
        }
        if (this.value != null) {
            badge.appendChild(document.createTextNode(this.value));
            if (String(this.value).length === 1) {
                DomHandler.addClass(badge, 'p-badge-no-gutter');
            }
        }
        else {
            DomHandler.addClass(badge, 'p-badge-dot');
        }
        DomHandler.addClass(el, 'p-overlay-badge');
        el.appendChild(badge);
        this.initialized = true;
    }
    get value() {
        return this._value;
    }
    set value(val) {
        if (val !== this._value) {
            this._value = val;
            if (this.initialized) {
                let badge = document.getElementById(this.id);
                if (this._value) {
                    if (DomHandler.hasClass(badge, 'p-badge-dot'))
                        DomHandler.removeClass(badge, 'p-badge-dot');
                    if (String(this._value).length === 1) {
                        DomHandler.addClass(badge, 'p-badge-no-gutter');
                    }
                    else {
                        DomHandler.removeClass(badge, 'p-badge-no-gutter');
                    }
                }
                else if (!this._value && !DomHandler.hasClass(badge, 'p-badge-dot')) {
                    DomHandler.addClass(badge, 'p-badge-dot');
                }
                badge.innerHTML = '';
                badge.appendChild(document.createTextNode(this._value));
            }
        }
    }
    ngOnDestroy() {
        this.initialized = false;
    }
}
BadgeDirective.decorators = [
    { type: Directive, args: [{
                selector: '[pBadge]'
            },] }
];
BadgeDirective.ctorParameters = () => [
    { type: ElementRef }
];
BadgeDirective.propDecorators = {
    iconPos: [{ type: Input }],
    value: [{ type: Input }],
    severity: [{ type: Input }]
};
export class Badge {
    containerClass() {
        return {
            'p-badge p-component': true,
            'p-badge-no-gutter': this.value && String(this.value).length === 1,
            'p-badge-lg': this.size === 'large',
            'p-badge-xl': this.size === 'xlarge',
            'p-badge-info': this.severity === 'info',
            'p-badge-success': this.severity === 'success',
            'p-badge-warning': this.severity === 'warning',
            'p-badge-danger': this.severity === 'danger'
        };
    }
}
Badge.decorators = [
    { type: Component, args: [{
                selector: 'p-badge',
                template: `
        <span [ngClass]="containerClass()" [class]="styleClass" [ngStyle]="style">
                {{value}}
        </span>
    `,
                changeDetection: ChangeDetectionStrategy.OnPush,
                encapsulation: ViewEncapsulation.None,
                styles: [".p-badge{border-radius:10px;display:inline-block;padding:0 .5rem;text-align:center}.p-overlay-badge{position:relative}.p-overlay-badge .p-badge{margin:0;position:absolute;right:0;top:0;transform:translate(50%,-50%);transform-origin:100% 0}.p-badge-dot{height:.5rem;min-width:.5rem;width:.5rem}.p-badge-dot,.p-badge-no-gutter{border-radius:50%;padding:0}"]
            },] }
];
Badge.propDecorators = {
    styleClass: [{ type: Input }],
    style: [{ type: Input }],
    size: [{ type: Input }],
    severity: [{ type: Input }],
    value: [{ type: Input }]
};
export class BadgeModule {
}
BadgeModule.decorators = [
    { type: NgModule, args: [{
                imports: [CommonModule],
                exports: [Badge, BadgeDirective, SharedModule],
                declarations: [Badge, BadgeDirective]
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFkZ2UuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4vc3JjL2FwcC9jb21wb25lbnRzL2JhZGdlLyIsInNvdXJjZXMiOlsiYmFkZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsdUJBQXVCLEVBQUUsaUJBQWlCLEVBQUUsS0FBSyxFQUEyQyxTQUFTLEVBQTRCLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNqTSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDL0MsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUMzQyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUtsRCxNQUFNLE9BQU8sY0FBYztJQVV2QixZQUFtQixFQUFjO1FBQWQsT0FBRSxHQUFGLEVBQUUsQ0FBWTtRQVJ4QixZQUFPLEdBQXdDLE1BQU0sQ0FBQztJQVEzQixDQUFDO0lBRXJDLGVBQWU7UUFDWCxJQUFJLENBQUMsRUFBRSxHQUFHLGlCQUFpQixFQUFFLEdBQUcsUUFBUSxDQUFDO1FBQ3pDLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUM7UUFFdEgsSUFBSSxLQUFLLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMzQyxLQUFLLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUU7UUFDcEIsS0FBSyxDQUFDLFNBQVMsR0FBRyxxQkFBcUIsQ0FBQztRQUV4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SyxRQUFRO1lBQ3BDLGNBQWMsRUFBRSxJQUFJLENBQUMsUUFBUSxLQUFLLE1BQU07WUFDeEMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLFFBQVEsS0FBSyxTQUFTO1lBQzlDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxRQUFRLEtBQUssU0FBUztZQUM5QyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsUUFBUSxLQUFLLFFBQVE7U0FDL0MsQ0FBQztJQUNOLENBQUM7OztZQWxDSixTQUFTLFNBQUM7Z0JBQ1AsUUFBUSxFQUFFLFNBQVM7Z0JBQ25CLFFBQVEsRUFBRTs7OztLQUlUO2dCQUNELGVBQWUsRUFBRSx1QkFBdUIsQ0FBQyxNQUFNO2dCQUMvQyxhQUFhLEVBQUUsaUJBQWlCLENBQUMsSUFBSTs7YUFFeEM7Ozt5QkFHSSxLQUFLO29CQUVMLEtBQUs7bUJBRUwsS0FBSzt1QkFFTCxLQUFLO29CQUVMLEtBQUs7O0FBcUJWLE1BQU0sT0FBTyxXQUFXOzs7WUFMdkIsUUFBUSxTQUFDO2dCQUNOLE9BQU8sRUFBRSxDQUFDLFlBQVksQ0FBQztnQkFDdkIsT0FBTyxFQUFFLENBQUMsS0FBSyxFQUFFLGNBQWMsRUFBRSxZQUFZLENBQUM7Z0JBQzlDLFlBQVksRUFBRSxDQUFDLEtBQUssRUFBRSxjQUFjLENBQUM7YUFDeEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZ01vZHVsZSwgQ29tcG9uZW50LCBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSwgVmlld0VuY2Fwc3VsYXRpb24sIElucHV0LCBRdWVyeUxpc3QsIENvbnRlbnRDaGlsZHJlbiwgVGVtcGxhdGVSZWYsIERpcmVjdGl2ZSwgT25EZXN0cm95LCBBZnRlclZpZXdJbml0LCBFbGVtZW50UmVmIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IENvbW1vbk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XHJcbmltcG9ydCB7IFNoYXJlZE1vZHVsZSB9IGZyb20gJ3ByaW1lbmcvYXBpJztcclxuaW1wb3J0IHsgRG9tSGFuZGxlciB9IGZyb20gJ3ByaW1lbmcvZG9tJztcclxuaW1wb3J0IHsgVW5pcXVlQ29tcG9uZW50SWQgfSBmcm9tICdwcmltZW5nL3V0aWxzJztcclxuXHJcbkBEaXJlY3RpdmUoe1xyXG4gICAgc2VsZWN0b3I6ICdbcEJhZGdlXSdcclxufSlcclxuZXhwb3J0IGNsYXNzIEJhZGdlRGlyZWN0aXZlIGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCwgT25EZXN0cm95IHtcclxuXHJcbiAgICBASW5wdXQoKSBpY29uUG9zOiAnbGVmdCcgfCAncmlnaHQnIHwgJ3RvcCcgfCAnYm90dG9tJyA9ICdsZWZ0JztcclxuICAgICAgICAgICAgXHJcbiAgICBwdWJsaWMgX3ZhbHVlOiBzdHJpbmc7XHJcbiAgICAgICAgICAgIFxyXG4gICAgcHVibGljIGluaXRpYWxpemVkOiBib29sZWFuO1xyXG5cclxuICAgIHByaXZhdGUgaWQ6IHN0cmluZztcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3IocHVibGljIGVsOiBFbGVtZW50UmVmKSB7fVxyXG4gICAgXHJcbiAgICBuZ0FmdGVyVmlld0luaXQoKSB7XHJcbiAgICAgICAgdGhpcy5pZCA9IFVuaXF1ZUNvbXBvbmVudElkKCkgKyAnX2JhZGdlJztcclxuICAgICAgICBsZXQgZWwgPSB0aGlzLmVsLm5hdGl2ZUVsZW1lbnQubm9kZU5hbWUuaW5kZXhPZihcIi1cIikgIT0gLTEgPyB0aGlzLmVsLm5hdGl2ZUVsZW1lbnQuZmlyc3RDaGlsZCA6IHRoaXMuZWwubmF0aXZlRWxlbWVudDsgXHJcblxyXG4gICAgICAgIGxldCBiYWRnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcclxuICAgICAgICBiYWRnZS5pZCA9IHRoaXMuaWQgO1xyXG4gICAgICAgIGJhZGdlLmNsYXNzTmFtZSA9ICdwLWJhZGdlIHAtY29tcG9uZW50JztcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuc2V2ZXJpdHkpIHtcclxuICAgICAgICAgICAgRG9tSGFuZGxlci5hZGRDbGFzcyhiYWRnZSwgJ3AtYmFkZ2UtJyArIHRoaXMuc2V2ZXJpdHkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBpZiAodGhpcy52YWx1ZSAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgIGJhZGdlLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRoaXMudmFsdWUpKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmIChTdHJpbmcodGhpcy52YWx1ZSkubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICBEb21IYW5kbGVyLmFkZENsYXNzKGJhZGdlLCAncC1iYWRnZS1uby1ndXR0ZXInKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgRG9tSGFuZGxlci5hZGRDbGFzcyhiYWRnZSwgJ3AtYmFkZ2UtZG90Jyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBEb21IYW5kbGVyLmFkZENsYXNzKGVsLCAncC1vdmVybGF5LWJhZGdlJyk7XHJcbiAgICAgICAgZWwuYXBwZW5kQ2hpbGQoYmFkZ2UpO1xyXG5cclxuICAgICAgICB0aGlzLmluaXRpYWxpemVkID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBASW5wdXQoKSBnZXQgdmFsdWUoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fdmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IHZhbHVlKHZhbDogc3RyaW5nKSB7XHJcbiAgICAgICAgaWYgKHZhbCAhPT0gdGhpcy5fdmFsdWUpIHtcclxuICAgICAgICAgICAgdGhpcy5fdmFsdWUgPSB2YWw7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5pbml0aWFsaXplZCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IGJhZGdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGhpcy5pZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX3ZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKERvbUhhbmRsZXIuaGFzQ2xhc3MoYmFkZ2UsICdwLWJhZGdlLWRvdCcpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBEb21IYW5kbGVyLnJlbW92ZUNsYXNzKGJhZGdlLCAncC1iYWRnZS1kb3QnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKFN0cmluZyh0aGlzLl92YWx1ZSkubGVuZ3RoID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIERvbUhhbmRsZXIuYWRkQ2xhc3MoYmFkZ2UsICdwLWJhZGdlLW5vLWd1dHRlcicpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgRG9tSGFuZGxlci5yZW1vdmVDbGFzcyhiYWRnZSwgJ3AtYmFkZ2Utbm8tZ3V0dGVyJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoIXRoaXMuX3ZhbHVlICYmICFEb21IYW5kbGVyLmhhc0NsYXNzKGJhZGdlLCAncC1iYWRnZS1kb3QnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIERvbUhhbmRsZXIuYWRkQ2xhc3MoYmFkZ2UsICdwLWJhZGdlLWRvdCcpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGJhZGdlLmlubmVySFRNTCA9ICcnO1xyXG4gICAgICAgICAgICAgICAgYmFkZ2UuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGhpcy5fdmFsdWUpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBASW5wdXQoKSBzZXZlcml0eTogc3RyaW5nO1xyXG4gICAgICAgIFxyXG4gICAgbmdPbkRlc3Ryb3koKSB7XHJcbiAgICAgICAgdGhpcy5pbml0aWFsaXplZCA9IGZhbHNlO1xyXG4gICAgfVxyXG59XHJcblxyXG5AQ29tcG9uZW50KHtcclxuICAgIHNlbGVjdG9yOiAncC1iYWRnZScsXHJcbiAgICB0ZW1wbGF0ZTogYFxyXG4gICAgICAgIDxzcGFuIFtuZ0NsYXNzXT1cImNvbnRhaW5lckNsYXNzKClcIiBbY2xhc3NdPVwic3R5bGVDbGFzc1wiIFtuZ1N0eWxlXT1cInN0eWxlXCI+XHJcbiAgICAgICAgICAgICAgICB7e3ZhbHVlfX1cclxuICAgICAgICA8L3NwYW4+XHJcbiAgICBgLFxyXG4gICAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXHJcbiAgICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxyXG4gICAgc3R5bGVVcmxzOiBbJy4vYmFkZ2UuY3NzJ11cclxufSlcclxuZXhwb3J0IGNsYXNzIEJhZGdlIHtcclxuXHJcbiAgICBASW5wdXQoKSBzdHlsZUNsYXNzOiBzdHJpbmc7XHJcblxyXG4gICAgQElucHV0KCkgc3R5bGU6IGFueTtcclxuXHJcbiAgICBASW5wdXQoKSBzaXplOiBzdHJpbmc7XHJcbiAgICBcclxuICAgIEBJbnB1dCgpIHNldmVyaXR5OiBzdHJpbmc7XHJcbiAgICBcclxuICAgIEBJbnB1dCgpIHZhbHVlOiBzdHJpbmc7XHJcbiAgICBcclxuICAgIGNvbnRhaW5lckNsYXNzKCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICdwLWJhZGdlIHAtY29tcG9uZW50JzogdHJ1ZSxcclxuICAgICAgICAgICAgJ3AtYmFkZ2Utbm8tZ3V0dGVyJzogdGhpcy52YWx1ZSAmJiBTdHJpbmcodGhpcy52YWx1ZSkubGVuZ3RoID09PSAxLFxyXG4gICAgICAgICAgICAncC1iYWRnZS1sZyc6IHRoaXMuc2l6ZSA9PT0gJ2xhcmdlJyxcclxuICAgICAgICAgICAgJ3AtYmFkZ2UteGwnOiB0aGlzLnNpemUgPT09ICd4bGFyZ2UnLFxyXG4gICAgICAgICAgICAncC1iYWRnZS1pbmZvJzogdGhpcy5zZXZlcml0eSA9PT0gJ2luZm8nLFxyXG4gICAgICAgICAgICAncC1iYWRnZS1zdWNjZXNzJzogdGhpcy5zZXZlcml0eSA9PT0gJ3N1Y2Nlc3MnLFxyXG4gICAgICAgICAgICAncC1iYWRnZS13YXJuaW5nJzogdGhpcy5zZXZlcml0eSA9PT0gJ3dhcm5pbmcnLFxyXG4gICAgICAgICAgICAncC1iYWRnZS1kYW5nZXInOiB0aGlzLnNldmVyaXR5ID09PSAnZGFuZ2VyJ1xyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn1cclxuXHJcbkBOZ01vZHVsZSh7XHJcbiAgICBpbXBvcnRzOiBbQ29tbW9uTW9kdWxlXSxcclxuICAgIGV4cG9ydHM6IFtCYWRnZSwgQmFkZ2VEaXJlY3RpdmUsIFNoYXJlZE1vZHVsZV0sXHJcbiAgICBkZWNsYXJhdGlvbnM6IFtCYWRnZSwgQmFkZ2VEaXJlY3RpdmVdXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBCYWRnZU1vZHVsZSB7IH1cclxuIl19