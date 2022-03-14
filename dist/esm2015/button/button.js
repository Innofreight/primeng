import { NgModule, Directive, Component, ElementRef, EventEmitter, Output, Input, ChangeDetectionStrategy, ViewEncapsulation, ContentChildren } from '@angular/core';
import { DomHandler } from 'primeng/dom';
import { CommonModule } from '@angular/common';
import { RippleModule } from 'primeng/ripple';
import { PrimeTemplate } from 'primeng/api';
export class ButtonDirective {
    constructor(el) {
        this.el = el;
        this.iconPos = 'left';
        this.loadingIcon = "pi pi-spinner pi-spin";
        this._loading = false;
    }
    ngAfterViewInit() {
        this._initialStyleClass = this.el.nativeElement.className;
        DomHandler.addMultipleClasses(this.el.nativeElement, this.getStyleClass());
        if (this.icon) {
            this.createIconEl();
        }
        let labelElement = document.createElement("span");
        if (this.icon && !this.label) {
            labelElement.setAttribute('aria-hidden', 'true');
        }
        labelElement.className = 'p-button-label';
        if (this.label)
            labelElement.appendChild(document.createTextNode(this.label));
        else
            labelElement.innerHTML = '&nbsp;';
        this.el.nativeElement.appendChild(labelElement);
        this.initialized = true;
    }
    getStyleClass() {
        let styleClass = 'p-button p-component';
        if (this.icon && !this.label) {
            styleClass = styleClass + ' p-button-icon-only';
        }
        if (this.loading) {
            styleClass = styleClass + ' p-disabled p-button-loading';
            if (!this.icon && this.label)
                styleClass = styleClass + ' p-button-loading-label-only';
        }
        return styleClass;
    }
    setStyleClass() {
        let styleClass = this.getStyleClass();
        this.el.nativeElement.className = styleClass + ' ' + this._initialStyleClass;
    }
    createIconEl() {
        let iconElement = document.createElement("span");
        iconElement.className = 'p-button-icon';
        iconElement.setAttribute("aria-hidden", "true");
        let iconPosClass = this.label ? 'p-button-icon-' + this.iconPos : null;
        if (iconPosClass) {
            DomHandler.addClass(iconElement, iconPosClass);
        }
        DomHandler.addMultipleClasses(iconElement, this.getIconClass());
        let labelEl = DomHandler.findSingle(this.el.nativeElement, '.p-button-label');
        if (labelEl)
            this.el.nativeElement.insertBefore(iconElement, labelEl);
        else
            this.el.nativeElement.appendChild(iconElement);
    }
    getIconClass() {
        return this.loading ? 'p-button-loading-icon ' + this.loadingIcon : this._icon;
    }
    setIconClass() {
        let iconElement = DomHandler.findSingle(this.el.nativeElement, '.p-button-icon');
        if (iconElement) {
            if (this.iconPos)
                iconElement.className = 'p-button-icon p-button-icon-' + this.iconPos + ' ' + this.getIconClass();
            else
                iconElement.className = 'p-button-icon ' + this.getIconClass();
        }
        else {
            this.createIconEl();
        }
    }
    removeIconElement() {
        let iconElement = DomHandler.findSingle(this.el.nativeElement, '.p-button-icon');
        this.el.nativeElement.removeChild(iconElement);
    }
    get label() {
        return this._label;
    }
    set label(val) {
        this._label = val;
        if (this.initialized) {
            DomHandler.findSingle(this.el.nativeElement, '.p-button-label').textContent = this._label || '&nbsp;';
            this.setStyleClass();
        }
    }
    get icon() {
        return this._icon;
    }
    set icon(val) {
        this._icon = val;
        if (this.initialized) {
            this.setIconClass();
            this.setStyleClass();
        }
    }
    get loading() {
        return this._loading;
    }
    set loading(val) {
        this._loading = val;
        if (this.initialized) {
            if (this.loading || this.icon)
                this.setIconClass();
            else
                this.removeIconElement();
            this.setStyleClass();
        }
    }
    ngOnDestroy() {
        this.initialized = false;
    }
}
ButtonDirective.decorators = [
    { type: Directive, args: [{
                selector: '[pButton]'
            },] }
];
ButtonDirective.ctorParameters = () => [
    { type: ElementRef }
];
ButtonDirective.propDecorators = {
    iconPos: [{ type: Input }],
    loadingIcon: [{ type: Input }],
    label: [{ type: Input }],
    icon: [{ type: Input }],
    loading: [{ type: Input }]
};
export class Button {
    constructor() {
        this.type = "button";
        this.iconPos = 'left';
        this.loading = false;
        this.loadingIcon = "pi pi-spinner pi-spin";
        this.onClick = new EventEmitter();
        this.onFocus = new EventEmitter();
        this.onBlur = new EventEmitter();
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
    }
    badgeStyleClass() {
        return {
            'p-badge p-component': true,
            'p-badge-no-gutter': this.badge && String(this.badge).length === 1
        };
    }
}
Button.decorators = [
    { type: Component, args: [{
                selector: 'p-button',
                template: `
        <button [attr.type]="type" [class]="styleClass" [ngStyle]="style" [disabled]="disabled || loading"
            [ngClass]="{'p-button p-component':true,
                        'p-button-icon-only': (icon && !label),
                        'p-button-vertical': (iconPos === 'top' || iconPos === 'bottom') && label,
                        'p-disabled': this.disabled || this.loading,
                        'p-button-loading': this.loading,
                        'p-button-loading-label-only': this.loading && !this.icon && this.label}"
                        (click)="onClick.emit($event)" (focus)="onFocus.emit($event)" (blur)="onBlur.emit($event)" pRipple>
            <ng-content></ng-content>
            <ng-container *ngTemplateOutlet="contentTemplate"></ng-container>
            <span [ngClass]="{'p-button-icon': true,
                        'p-button-icon-left': iconPos === 'left' && label,
                        'p-button-icon-right': iconPos === 'right' && label,
                        'p-button-icon-top': iconPos === 'top' && label,
                        'p-button-icon-bottom': iconPos === 'bottom' && label}"
                        [class]="loading ? 'p-button-loading-icon ' + loadingIcon : icon" *ngIf="!contentTemplate && (icon||loading)" [attr.aria-hidden]="true"></span>
            <span class="p-button-label" [attr.aria-hidden]="icon && !label" *ngIf="!contentTemplate">{{label||'&nbsp;'}}</span>
            <span [ngClass]="badgeStyleClass()" [class]="badgeClass" *ngIf="!contentTemplate && badge">{{badge}}</span>
        </button>
    `,
                changeDetection: ChangeDetectionStrategy.OnPush,
                encapsulation: ViewEncapsulation.None
            },] }
];
Button.propDecorators = {
    type: [{ type: Input }],
    iconPos: [{ type: Input }],
    icon: [{ type: Input }],
    badge: [{ type: Input }],
    label: [{ type: Input }],
    disabled: [{ type: Input }],
    loading: [{ type: Input }],
    loadingIcon: [{ type: Input }],
    style: [{ type: Input }],
    styleClass: [{ type: Input }],
    badgeClass: [{ type: Input }],
    templates: [{ type: ContentChildren, args: [PrimeTemplate,] }],
    onClick: [{ type: Output }],
    onFocus: [{ type: Output }],
    onBlur: [{ type: Output }]
};
export class ButtonModule {
}
ButtonModule.decorators = [
    { type: NgModule, args: [{
                imports: [CommonModule, RippleModule],
                exports: [ButtonDirective, Button],
                declarations: [ButtonDirective, Button]
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnV0dG9uLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLy4uL3NyYy9hcHAvY29tcG9uZW50cy9idXR0b24vIiwic291cmNlcyI6WyJidXR0b24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFFBQVEsRUFBQyxTQUFTLEVBQUMsU0FBUyxFQUFDLFVBQVUsRUFBQyxZQUFZLEVBQWUsTUFBTSxFQUFXLEtBQUssRUFBQyx1QkFBdUIsRUFBRSxpQkFBaUIsRUFBRSxlQUFlLEVBQTJDLE1BQU0sZUFBZSxDQUFDO0FBQzlOLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDdkMsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQzdDLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUM1QyxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBSzFDLE1BQU0sT0FBTyxlQUFlO0lBZ0J4QixZQUFtQixFQUFjO1FBQWQsT0FBRSxHQUFGLEVBQUUsQ0FBWTtRQWR4QixZQUFPLEdBQXdDLE1BQU0sQ0FBQztRQUV0RCxnQkFBVyxHQUFXLHVCQUF1QixDQUFDO1FBTWhELGFBQVEsR0FBWSxLQUFLLENBQUM7SUFNRyxDQUFDO0lBRXJDLGVBQWU7UUFDWCxJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDO1FBQzFELFVBQVUsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQztRQUUzRSxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDWCxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7U0FDdkI7UUFFRCxJQUFJLFlBQVksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2xELElBQUksSUFBSSxDQUFDLElB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QUM7b0JBQ3pDLE1BQU07Z0JBRU47b0JBQ0ksSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO29CQUN6QyxNQUFNO2FBQ1Q7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxlQUFlO1FBQ1gsT0FBTztZQUNILHFCQUFxQixFQUFFLElBQUk7WUFDM0IsbUJBQW1CLEVBQUUsSUFBSSxDQUFDLEtBQUssSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDO1NBQ3JFLENBQUE7SUFDTCxDQUFDOzs7WUEvRUosU0FBUyxTQUFDO2dCQUNQLFFBQVEsRUFBRSxVQUFVO2dCQUNwQixRQUFRLEVBQUU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0tBb0JUO2dCQUNELGVBQWUsRUFBRSx1QkFBdUIsQ0FBQyxNQUFNO2dCQUMvQyxhQUFhLEVBQUUsaUJBQWlCLENBQUMsSUFBSTthQUN4Qzs7O21CQUdJLEtBQUs7c0JBRUwsS0FBSzttQkFFTCxLQUFLO29CQUVMLEtBQUs7b0JBRUwsS0FBSzt1QkFFTCxLQUFLO3NCQUVMLEtBQUs7MEJBRUwsS0FBSztvQkFFTCxLQUFLO3lCQUVMLEtBQUs7eUJBRUwsS0FBSzt3QkFJTCxlQUFlLFNBQUMsYUFBYTtzQkFFN0IsTUFBTTtzQkFFTixNQUFNO3FCQUVOLE1BQU07O0FBNkJYLE1BQU0sT0FBTyxZQUFZOzs7WUFMeEIsUUFBUSxTQUFDO2dCQUNOLE9BQU8sRUFBRSxDQUFDLFlBQVksRUFBQyxZQUFZLENBQUM7Z0JBQ3BDLE9BQU8sRUFBRSxDQUFDLGVBQWUsRUFBQyxNQUFNLENBQUM7Z0JBQ2pDLFlBQVksRUFBRSxDQUFDLGVBQWUsRUFBQyxNQUFNLENBQUM7YUFDekMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge05nTW9kdWxlLERpcmVjdGl2ZSxDb21wb25lbnQsRWxlbWVudFJlZixFdmVudEVtaXR0ZXIsQWZ0ZXJWaWV3SW5pdCxPdXRwdXQsT25EZXN0cm95LElucHV0LENoYW5nZURldGVjdGlvblN0cmF0ZWd5LCBWaWV3RW5jYXBzdWxhdGlvbiwgQ29udGVudENoaWxkcmVuLCBBZnRlckNvbnRlbnRJbml0LCBUZW1wbGF0ZVJlZiwgUXVlcnlMaXN0fSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHtEb21IYW5kbGVyfSBmcm9tICdwcmltZW5nL2RvbSc7XHJcbmltcG9ydCB7Q29tbW9uTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xyXG5pbXBvcnQge1JpcHBsZU1vZHVsZX0gZnJvbSAncHJpbWVuZy9yaXBwbGUnOyBcclxuaW1wb3J0IHtQcmltZVRlbXBsYXRlfSBmcm9tICdwcmltZW5nL2FwaSc7IFxyXG5cclxuQERpcmVjdGl2ZSh7XHJcbiAgICBzZWxlY3RvcjogJ1twQnV0dG9uXSdcclxufSlcclxuZXhwb3J0IGNsYXNzIEJ1dHRvbkRpcmVjdGl2ZSBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSB7XHJcblxyXG4gICAgQElucHV0KCkgaWNvblBvczogJ2xlZnQnIHwgJ3JpZ2h0JyB8ICd0b3AnIHwgJ2JvdHRvbScgPSAnbGVmdCc7XHJcbiAgICAgICAgICAgIFxyXG4gICAgQElucHV0KCkgbG9hZGluZ0ljb246IHN0cmluZyA9IFwicGkgcGktc3Bpbm5lciBwaS1zcGluXCI7XHJcblxyXG4gICAgcHVibGljIF9sYWJlbDogc3RyaW5nO1xyXG4gICAgXHJcbiAgICBwdWJsaWMgX2ljb246IHN0cmluZztcclxuXHJcbiAgICBwdWJsaWMgX2xvYWRpbmc6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgICAgICAgICAgXHJcbiAgICBwdWJsaWMgaW5pdGlhbGl6ZWQ6IGJvb2xlYW47XHJcbiAgICBcclxuICAgIHB1YmxpYyBfaW5pdGlhbFN0eWxlQ2xhc3M6IHN0cmluZztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgZWw6IEVsZW1lbnRSZWYpIHt9XHJcbiAgICBcclxuICAgIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcclxuICAgICAgICB0aGlzLl9pbml0aWFsU3R5bGVDbGFzcyA9IHRoaXMuZWwubmF0aXZlRWxlbWVudC5jbGFzc05hbWU7XHJcbiAgICAgICAgRG9tSGFuZGxlci5hZGRNdWx0aXBsZUNsYXNzZXModGhpcy5lbC5uYXRpdmVFbGVtZW50LCB0aGlzLmdldFN0eWxlQ2xhc3MoKSk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmljb24pIHtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVJY29uRWwoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IGxhYmVsRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xyXG4gICAgICAgIGlmICh0aGlzLmljb24gJiYgIXRoaXMubGFiZWwpIHtcclxuICAgICAgICAgICAgbGFiZWxFbGVtZW50LnNldEF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nLCAndHJ1ZScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsYWJlbEVsZW1lbnQuY2xhc3NOYW1lID0gJ3AtYnV0dG9uLWxhYmVsJztcclxuXHJcbiAgICAgICAgaWYgKHRoaXMubGFiZWwpXHJcbiAgICAgICAgICAgIGxhYmVsRWxlbWVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0aGlzLmxhYmVsKSk7XHJcbiAgICAgICAgZWxzZSBcclxuICAgICAgICAgICAgbGFiZWxFbGVtZW50LmlubmVySFRNTCA9ICcmbmJzcDsnO1xyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMuZWwubmF0aXZlRWxlbWVudC5hcHBlbmRDaGlsZChsYWJlbEVsZW1lbnQpO1xyXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlO1xyXG4gICAgfVxyXG4gICAgICAgIFxyXG4gICAgZ2V0U3R5bGVDbGFzcygpOiBzdHJpbmcge1xyXG4gICAgICAgIGxldCBzdHlsZUNsYXNzID0gJ3AtYnV0dG9uIHAtY29tcG9uZW50JztcclxuICAgICAgICBpZiAodGhpcy5pY29uICYmICF0aGlzLmxhYmVsKSB7XHJcbiAgICAgICAgICAgIHN0eWxlQ2xhc3MgPSBzdHlsZUNsYXNzICsgJyBwLWJ1dHRvbi1pY29uLW9ubHknO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMubG9hZGluZykge1xyXG4gICAgICAgICAgICBzdHlsZUNsYXNzID0gc3R5bGVDbGFzcyArICcgcC1kaXNhYmxlZCBwLWJ1dHRvbi1sb2FkaW5nJztcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmljb24gJiYgdGhpcy5sYWJlbClcclxuICAgICAgICAgICAgICAgIHN0eWxlQ2xhc3MgPSBzdHlsZUNsYXNzICsgJyBwLWJ1dHRvbi1sb2FkaW5nLWxhYmVsLW9ubHknO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICByZXR1cm4gc3R5bGVDbGFzcztcclxuICAgIH1cclxuXHJcbiAgICBzZXRTdHlsZUNsYXNzKCkge1xyXG4gICAgICAgIGxldCBzdHlsZUNsYXNzID0gdGhpcy5nZXRTdHlsZUNsYXNzKCk7XHJcbiAgICAgICAgdGhpcy5lbC5uYXRpdmVFbGVtZW50LmNsYXNzTmFtZSA9IHN0eWxlQ2xhc3MgKyAnICcgKyB0aGlzLl9pbml0aWFsU3R5bGVDbGFzcztcclxuICAgIH1cclxuXHJcbiAgICBjcmVhdGVJY29uRWwoKSB7XHJcbiAgICAgICAgbGV0IGljb25FbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XHJcbiAgICAgICAgaWNvbkVsZW1lbnQuY2xhc3NOYW1lID0gJ3AtYnV0dG9uLWljb24nO1xyXG4gICAgICAgIGljb25FbGVtZW50LnNldEF0dHJpYnV0ZShcImFyaWEtaGlkZGVuXCIsIFwidHJ1ZVwiKTtcclxuICAgICAgICBsZXQgaWNvblBvc0NsYXNzID0gdGhpcy5sYWJlbCA/ICdwLWJ1dHRvbi1pY29uLScgKyB0aGlzLmljb25Qb3MgOiBudWxsO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmIChpY29uUG9zQ2xhc3MpIHtcclxuICAgICAgICAgICAgRG9tSGFuZGxlci5hZGRDbGFzcyhpY29uRWxlbWVudCwgaWNvblBvc0NsYXNzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIERvbUhhbmRsZXIuYWRkTXVsdGlwbGVDbGFzc2VzKGljb25FbGVtZW50LCB0aGlzLmdldEljb25DbGFzcygpKTtcclxuICAgICAgICBsZXQgbGFiZWxFbCA9IERvbUhhbmRsZXIuZmluZFNpbmdsZSh0aGlzLmVsLm5hdGl2ZUVsZW1lbnQsICcucC1idXR0b24tbGFiZWwnKVxyXG5cclxuICAgICAgICBpZiAobGFiZWxFbClcclxuICAgICAgICAgICAgdGhpcy5lbC5uYXRpdmVFbGVtZW50Lmluc2VydEJlZm9yZShpY29uRWxlbWVudCwgbGFiZWxFbCk7XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB0aGlzLmVsLm5hdGl2ZUVsZW1lbnQuYXBwZW5kQ2hpbGQoaWNvbkVsZW1lbnQpXHJcbiAgICB9XHJcblxyXG4gICAgZ2V0SWNvbkNsYXNzKCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmxvYWRpbmcgPyAncC1idXR0b24tbG9hZGluZy1pY29uICcgKyB0aGlzLmxvYWRpbmdJY29uIDogdGhpcy5faWNvbjtcclxuICAgIH1cclxuXHJcbiAgICBzZXRJY29uQ2xhc3MoKSB7XHJcbiAgICAgICAgbGV0IGljb25FbGVtZW50ID0gRG9tSGFuZGxlci5maW5kU2luZ2xlKHRoaXMuZWwubmF0aXZlRWxlbWVudCwgJy5wLWJ1dHRvbi1pY29uJyk7XHJcbiAgICAgICAgaWYgKGljb25FbGVtZW50KSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmljb25Qb3MpIFxyXG4gICAgICAgICAgICAgICAgaWNvbkVsZW1lbnQuY2xhc3NOYW1lID0gJ3AtYnV0dG9uLWljb24gcC1idXR0b24taWNvbi0nICsgdGhpcy5pY29uUG9zICsgJyAnICsgdGhpcy5nZXRJY29uQ2xhc3MoKTtcclxuICAgICAgICAgICAgZWxzZSBcclxuICAgICAgICAgICAgICAgIGljb25FbGVtZW50LmNsYXNzTmFtZSA9ICdwLWJ1dHRvbi1pY29uICcgKyB0aGlzLmdldEljb25DbGFzcygpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVJY29uRWwoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmVtb3ZlSWNvbkVsZW1lbnQoKSB7XHJcbiAgICAgICAgbGV0IGljb25FbGVtZW50ID0gRG9tSGFuZGxlci5maW5kU2luZ2xlKHRoaXMuZWwubmF0aXZlRWxlbWVudCwgJy5wLWJ1dHRvbi1pY29uJyk7XHJcbiAgICAgICAgdGhpcy5lbC5uYXRpdmVFbGVtZW50LnJlbW92ZUNoaWxkKGljb25FbGVtZW50KVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBASW5wdXQoKSBnZXQgbGFiZWwoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbGFiZWw7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IGxhYmVsKHZhbDogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5fbGFiZWwgPSB2YWw7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMuaW5pdGlhbGl6ZWQpIHtcclxuICAgICAgICAgICAgRG9tSGFuZGxlci5maW5kU2luZ2xlKHRoaXMuZWwubmF0aXZlRWxlbWVudCwgJy5wLWJ1dHRvbi1sYWJlbCcpLnRleHRDb250ZW50ID0gdGhpcy5fbGFiZWwgfHwgJyZuYnNwOyc7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0U3R5bGVDbGFzcygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgQElucHV0KCkgZ2V0IGljb24oKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faWNvbjtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgaWNvbih2YWw6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuX2ljb24gPSB2YWw7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMuaW5pdGlhbGl6ZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5zZXRJY29uQ2xhc3MoKTtcclxuICAgICAgICAgICAgdGhpcy5zZXRTdHlsZUNsYXNzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIEBJbnB1dCgpIGdldCBsb2FkaW5nKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9sb2FkaW5nO1xyXG4gICAgfVxyXG5cclxuICAgIHNldCBsb2FkaW5nKHZhbDogYm9vbGVhbikge1xyXG4gICAgICAgIHRoaXMuX2xvYWRpbmcgPSB2YWw7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMuaW5pdGlhbGl6ZWQpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMubG9hZGluZyB8fCB0aGlzLmljb24pXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldEljb25DbGFzcygpO1xyXG4gICAgICAgICAgICBlbHNlIFxyXG4gICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVJY29uRWxlbWVudCgpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5zZXRTdHlsZUNsYXNzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBuZ09uRGVzdHJveSgpIHtcclxuICAgICAgICB0aGlzLmluaXRpYWxpemVkID0gZmFsc2U7XHJcbiAgICB9XHJcbn1cclxuXHJcbkBDb21wb25lbnQoe1xyXG4gICAgc2VsZWN0b3I6ICdwLWJ1dHRvbicsXHJcbiAgICB0ZW1wbGF0ZTogYFxyXG4gICAgICAgIDxidXR0b24gW2F0dHIudHlwZV09XCJ0eXBlXCIgW2NsYXNzXT1cInN0eWxlQ2xhc3NcIiBbbmdTdHlsZV09XCJzdHlsZVwiIFtkaXNhYmxlZF09XCJkaXNhYmxlZCB8fCBsb2FkaW5nXCJcclxuICAgICAgICAgICAgW25nQ2xhc3NdPVwieydwLWJ1dHRvbiBwLWNvbXBvbmVudCc6dHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ3AtYnV0dG9uLWljb24tb25seSc6IChpY29uICYmICFsYWJlbCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdwLWJ1dHRvbi12ZXJ0aWNhbCc6IChpY29uUG9zID09PSAndG9wJyB8fCBpY29uUG9zID09PSAnYm90dG9tJykgJiYgbGFiZWwsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdwLWRpc2FibGVkJzogdGhpcy5kaXNhYmxlZCB8fCB0aGlzLmxvYWRpbmcsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdwLWJ1dHRvbi1sb2FkaW5nJzogdGhpcy5sb2FkaW5nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAncC1idXR0b24tbG9hZGluZy1sYWJlbC1vbmx5JzogdGhpcy5sb2FkaW5nICYmICF0aGlzLmljb24gJiYgdGhpcy5sYWJlbH1cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAoY2xpY2spPVwib25DbGljay5lbWl0KCRldmVudClcIiAoZm9jdXMpPVwib25Gb2N1cy5lbWl0KCRldmVudClcIiAoYmx1cik9XCJvbkJsdXIuZW1pdCgkZXZlbnQpXCIgcFJpcHBsZT5cclxuICAgICAgICAgICAgPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PlxyXG4gICAgICAgICAgICA8bmctY29udGFpbmVyICpuZ1RlbXBsYXRlT3V0bGV0PVwiY29udGVudFRlbXBsYXRlXCI+PC9uZy1jb250YWluZXI+XHJcbiAgICAgICAgICAgIDxzcGFuIFtuZ0NsYXNzXT1cInsncC1idXR0b24taWNvbic6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdwLWJ1dHRvbi1pY29uLWxlZnQnOiBpY29uUG9zID09PSAnbGVmdCcgJiYgbGFiZWwsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdwLWJ1dHRvbi1pY29uLXJpZ2h0JzogaWNvblBvcyA9PT0gJ3JpZ2h0JyAmJiBsYWJlbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ3AtYnV0dG9uLWljb24tdG9wJzogaWNvblBvcyA9PT0gJ3RvcCcgJiYgbGFiZWwsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdwLWJ1dHRvbi1pY29uLWJvdHRvbSc6IGljb25Qb3MgPT09ICdib3R0b20nICYmIGxhYmVsfVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFtjbGFzc109XCJsb2FkaW5nID8gJ3AtYnV0dG9uLWxvYWRpbmctaWNvbiAnICsgbG9hZGluZ0ljb24gOiBpY29uXCIgKm5nSWY9XCIhY29udGVudFRlbXBsYXRlICYmIChpY29ufHxsb2FkaW5nKVwiIFthdHRyLmFyaWEtaGlkZGVuXT1cInRydWVcIj48L3NwYW4+XHJcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwicC1idXR0b24tbGFiZWxcIiBbYXR0ci5hcmlhLWhpZGRlbl09XCJpY29uICYmICFsYWJlbFwiICpuZ0lmPVwiIWNvbnRlbnRUZW1wbGF0ZVwiPnt7bGFiZWx8fCcmbmJzcDsnfX08L3NwYW4+XHJcbiAgICAgICAgICAgIDxzcGFuIFtuZ0NsYXNzXT1cImJhZGdlU3R5bGVDbGFzcygpXCIgW2NsYXNzXT1cImJhZGdlQ2xhc3NcIiAqbmdJZj1cIiFjb250ZW50VGVtcGxhdGUgJiYgYmFkZ2VcIj57e2JhZGdlfX08L3NwYW4+XHJcbiAgICAgICAgPC9idXR0b24+XHJcbiAgICBgLFxyXG4gICAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXHJcbiAgICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBCdXR0b24gaW1wbGVtZW50cyBBZnRlckNvbnRlbnRJbml0IHtcclxuXHJcbiAgICBASW5wdXQoKSB0eXBlOiBzdHJpbmcgPSBcImJ1dHRvblwiO1xyXG5cclxuICAgIEBJbnB1dCgpIGljb25Qb3M6IHN0cmluZyA9ICdsZWZ0JztcclxuXHJcbiAgICBASW5wdXQoKSBpY29uOiBzdHJpbmc7XHJcblxyXG4gICAgQElucHV0KCkgYmFkZ2U6IHN0cmluZztcclxuXHJcbiAgICBASW5wdXQoKSBsYWJlbDogc3RyaW5nO1xyXG5cclxuICAgIEBJbnB1dCgpIGRpc2FibGVkOiBib29sZWFuO1xyXG5cclxuICAgIEBJbnB1dCgpIGxvYWRpbmc6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgICBASW5wdXQoKSBsb2FkaW5nSWNvbjogc3RyaW5nID0gXCJwaSBwaS1zcGlubmVyIHBpLXNwaW5cIjtcclxuXHJcbiAgICBASW5wdXQoKSBzdHlsZTogYW55O1xyXG5cclxuICAgIEBJbnB1dCgpIHN0eWxlQ2xhc3M6IHN0cmluZztcclxuXHJcbiAgICBASW5wdXQoKSBiYWRnZUNsYXNzOiBzdHJpbmc7XHJcblxyXG4gICAgY29udGVudFRlbXBsYXRlOiBUZW1wbGF0ZVJlZjxhbnk+O1xyXG5cclxuICAgIEBDb250ZW50Q2hpbGRyZW4oUHJpbWVUZW1wbGF0ZSkgdGVtcGxhdGVzOiBRdWVyeUxpc3Q8YW55PjtcclxuXHJcbiAgICBAT3V0cHV0KCkgb25DbGljazogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XHJcblxyXG4gICAgQE91dHB1dCgpIG9uRm9jdXM6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG5cclxuICAgIEBPdXRwdXQoKSBvbkJsdXI6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG5cclxuICAgIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcclxuICAgICAgICB0aGlzLnRlbXBsYXRlcy5mb3JFYWNoKChpdGVtKSA9PiB7XHJcbiAgICAgICAgICAgIHN3aXRjaChpdGVtLmdldFR5cGUoKSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnY29udGVudCc6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb250ZW50VGVtcGxhdGUgPSBpdGVtLnRlbXBsYXRlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb250ZW50VGVtcGxhdGUgPSBpdGVtLnRlbXBsYXRlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBiYWRnZVN0eWxlQ2xhc3MoKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgJ3AtYmFkZ2UgcC1jb21wb25lbnQnOiB0cnVlLFxyXG4gICAgICAgICAgICAncC1iYWRnZS1uby1ndXR0ZXInOiB0aGlzLmJhZGdlICYmIFN0cmluZyh0aGlzLmJhZGdlKS5sZW5ndGggPT09IDFcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbkBOZ01vZHVsZSh7XHJcbiAgICBpbXBvcnRzOiBbQ29tbW9uTW9kdWxlLFJpcHBsZU1vZHVsZV0sXHJcbiAgICBleHBvcnRzOiBbQnV0dG9uRGlyZWN0aXZlLEJ1dHRvbl0sXHJcbiAgICBkZWNsYXJhdGlvbnM6IFtCdXR0b25EaXJlY3RpdmUsQnV0dG9uXVxyXG59KVxyXG5leHBvcnQgY2xhc3MgQnV0dG9uTW9kdWxlIHsgfVxyXG4iXX0=