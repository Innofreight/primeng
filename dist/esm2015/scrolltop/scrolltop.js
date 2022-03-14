import { NgModule, Component, ChangeDetectionStrategy, ViewEncapsulation, Input, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { DomHandler } from 'primeng/dom';
export class ScrollTop {
    constructor(el, cd) {
        this.el = el;
        this.cd = cd;
        this.target = "window";
        this.threshold = 400;
        this.icon = "pi pi-chevron-up";
        this.behavior = "smooth";
        this.showTransitionOptions = '.15s';
        this.hideTransitionOptions = '.15s';
        this.visible = false;
    }
    ngOnInit() {
        if (this.target === 'window')
            this.bindDocumentScrollListener();
        else if (this.target === 'parent')
            this.bindParentScrollListener();
    }
    onClick() {
        let scrollElement = this.target === 'window' ? window : this.el.nativeElement.parentElement;
        scrollElement.scroll({
            top: 0,
            behavior: this.behavior
        });
    }
    onEnter() {
        this.el.nativeElement.children[0].style.zIndex = DomHandler.generateZIndex();
    }
    checkVisibility(scrollY) {
        if (scrollY > this.threshold)
            this.visible = true;
        else
            this.visible = false;
        this.cd.markForCheck();
    }
    bindParentScrollListener() {
        this.scrollListener = () => {
            this.checkVisibility(this.el.nativeElement.parentElement.scrollTop);
        };
        this.el.nativeElement.parentElement.addEventListener('scroll', this.scrollListener);
    }
    bindDocumentScrollListener() {
        this.scrollListener = () => {
            this.checkVisibility(DomHandler.getWindowScrollTop());
        };
        window.addEventListener('scroll', this.scrollListener);
    }
    unbindParentScrollListener() {
        if (this.scrollListener) {
            this.el.nativeElement.parentElement.removeEventListener('scroll', this.scrollListener);
            this.scrollListener = null;
        }
    }
    unbindDocumentScrollListener() {
        if (this.scrollListener) {
            window.removeEventListener('scroll', this.scrollListener);
            this.scrollListener = null;
        }
    }
    containerClass() {
        return {
            'p-scrolltop p-link p-component': true,
            'p-scrolltop-sticky': this.target !== 'window'
        };
    }
    ngOnDestroy() {
        if (this.target === 'window')
            this.unbindDocumentScrollListener();
        else if (this.target === 'parent')
            this.unbindParentScrollListener();
    }
}
ScrollTop.decorators = [
    { type: Component, args: [{
                selector: 'p-scrollTop',
                template: `
        <button  *ngIf="visible" [@animation]="{value: 'open', params: {showTransitionParams: showTransitionOptions, hideTransitionParams: hideTransitionOptions}}" (@animation.start)="onEnter()"
            [ngClass]="containerClass()" (click)="onClick()" [class]="styleClass" [ngStyle]="style" type="button">
            <span [class]="icon" [ngClass]="'p-scrolltop-icon'"></span>
        </button>
    `,
                changeDetection: ChangeDetectionStrategy.OnPush,
                encapsulation: ViewEncapsulation.None,
                animations: [
                    trigger('animation', [
                        state('void', style({
                            opacity: 0
                        })),
                        state('open', style({
                            opacity: 1
                        })),
                        transition('void => open', animate('{{showTransitionParams}}')),
                        transition('open => void', animate('{{hideTransitionParams}}')),
                    ])
                ],
                styles: [".p-scrolltop{align-items:center;bottom:20px;display:flex;justify-content:center;position:fixed;right:20px}.p-scrolltop-sticky{position:sticky}.p-scrolltop-sticky.p-link{margin-left:auto}"]
            },] }
];
ScrollTop.ctorParameters = () => [
    { type: ElementRef },
    { type: ChangeDetectorRef }
];
ScrollTop.propDecorators = {
    styleClass: [{ type: Input }],
    style: [{ type: Input }],
    target: [{ type: Input }],
    threshold: [{ type: Input }],
    icon: [{ type: Input }],
    behavior: [{ type: Input }],
    showTransitionOptions: [{ type: Input }],
    hideTransitionOptions: [{ type: Input }]
};
export class ScrollTopModule {
}
ScrollTopModule.decorators = [
    { type: NgModule, args: [{
                imports: [CommonModule],
                exports: [ScrollTop],
                declarations: [ScrollTop]
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Nyb2xsdG9wLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLy4uL3NyYy9hcHAvY29tcG9uZW50cy9zY3JvbGx0b3AvIiwic291cmNlcyI6WyJzY3JvbGx0b3AudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsdUJBQXVCLEVBQUUsaUJBQWlCLEVBQUUsS0FBSyxFQUFxQixVQUFVLEVBQUUsaUJBQWlCLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDeEosT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDakYsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQTBCekMsTUFBTSxPQUFPLFNBQVM7SUFzQmxCLFlBQW1CLEVBQWMsRUFBVSxFQUFxQjtRQUE3QyxPQUFFLEdBQUYsRUFBRSxDQUFZO1FBQVUsT0FBRSxHQUFGLEVBQUUsQ0FBbUI7UUFoQnZELFdBQU0sR0FBVyxRQUFRLENBQUM7UUFFMUIsY0FBUyxHQUFXLEdBQUcsQ0FBQztRQUV4QixTQUFJLEdBQVcsa0JBQWtCLENBQUM7UUFFbEMsYUFBUSxHQUFXLFFBQVEsQ0FBQztRQUU1QiwwQkFBcUIsR0FBVyxNQUFNLENBQUM7UUFFdkMsMEJBQXFCLEdBQVcsTUFBTSxDQUFDO1FBSWhELFlBQU8sR0FBWSxLQUFLLENBQUM7SUFFMkMsQ0FBQztJQUVyRSxRQUFRO1FBQ0osSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLFFBQVE7WUFDeEIsSUFBSSxDQUFDLDBCQUEwQixFQUFFLENBQUM7YUFDakMsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLFFBQVE7WUFDN0IsSUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUM7SUFDeEMsQ0FBQztJQUVELE9BQU87UUFDSCxJQUFJLGFBQWEs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Qzt5QkFDYixDQUFDLENBQUM7d0JBQ0gsS0FBSyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUM7NEJBQ2hCLE9BQU8sRUFBRSxDQUFDO3lCQUNiLENBQUMsQ0FBQzt3QkFDSCxVQUFVLENBQUMsY0FBYyxFQUFFLE9BQU8sQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO3dCQUMvRCxVQUFVLENBQUMsY0FBYyxFQUFFLE9BQU8sQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO3FCQUNsRSxDQUFDO2lCQUNMOzthQUNKOzs7WUE1Qm1HLFVBQVU7WUFBRSxpQkFBaUI7Ozt5QkErQjVILEtBQUs7b0JBRUwsS0FBSztxQkFFTCxLQUFLO3dCQUVMLEtBQUs7bUJBRUwsS0FBSzt1QkFFTCxLQUFLO29DQUVMLEtBQUs7b0NBRUwsS0FBSzs7QUF1RlYsTUFBTSxPQUFPLGVBQWU7OztZQUwzQixRQUFRLFNBQUM7Z0JBQ04sT0FBTyxFQUFFLENBQUMsWUFBWSxDQUFDO2dCQUN2QixPQUFPLEVBQUUsQ0FBQyxTQUFTLENBQUM7Z0JBQ3BCLFlBQVksRUFBRSxDQUFDLFNBQVMsQ0FBQzthQUM1QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5nTW9kdWxlLCBDb21wb25lbnQsIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LCBWaWV3RW5jYXBzdWxhdGlvbiwgSW5wdXQsIE9uSW5pdCwgT25EZXN0cm95LCBFbGVtZW50UmVmLCBDaGFuZ2VEZXRlY3RvclJlZn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IENvbW1vbk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XHJcbmltcG9ydCB7IGFuaW1hdGUsIHN0YXRlLCBzdHlsZSwgdHJhbnNpdGlvbiwgdHJpZ2dlciB9IGZyb20gJ0Bhbmd1bGFyL2FuaW1hdGlvbnMnO1xyXG5pbXBvcnQgeyBEb21IYW5kbGVyIH0gZnJvbSAncHJpbWVuZy9kb20nO1xyXG5cclxuQENvbXBvbmVudCh7XHJcbiAgICBzZWxlY3RvcjogJ3Atc2Nyb2xsVG9wJyxcclxuICAgIHRlbXBsYXRlOiBgXHJcbiAgICAgICAgPGJ1dHRvbiAgKm5nSWY9XCJ2aXNpYmxlXCIgW0BhbmltYXRpb25dPVwie3ZhbHVlOiAnb3BlbicsIHBhcmFtczoge3Nob3dUcmFuc2l0aW9uUGFyYW1zOiBzaG93VHJhbnNpdGlvbk9wdGlvbnMsIGhpZGVUcmFuc2l0aW9uUGFyYW1zOiBoaWRlVHJhbnNpdGlvbk9wdGlvbnN9fVwiIChAYW5pbWF0aW9uLnN0YXJ0KT1cIm9uRW50ZXIoKVwiXHJcbiAgICAgICAgICAgIFtuZ0NsYXNzXT1cImNvbnRhaW5lckNsYXNzKClcIiAoY2xpY2spPVwib25DbGljaygpXCIgW2NsYXNzXT1cInN0eWxlQ2xhc3NcIiBbbmdTdHlsZV09XCJzdHlsZVwiIHR5cGU9XCJidXR0b25cIj5cclxuICAgICAgICAgICAgPHNwYW4gW2NsYXNzXT1cImljb25cIiBbbmdDbGFzc109XCIncC1zY3JvbGx0b3AtaWNvbidcIj48L3NwYW4+XHJcbiAgICAgICAgPC9idXR0b24+XHJcbiAgICBgLFxyXG4gICAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXHJcbiAgICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxyXG4gICAgc3R5bGVVcmxzOiBbJy4vc2Nyb2xsdG9wLmNzcyddLFxyXG4gICAgYW5pbWF0aW9uczogW1xyXG4gICAgICAgIHRyaWdnZXIoJ2FuaW1hdGlvbicsIFtcclxuICAgICAgICAgICAgc3RhdGUoJ3ZvaWQnLCBzdHlsZSh7XHJcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAwXHJcbiAgICAgICAgICAgIH0pKSxcclxuICAgICAgICAgICAgc3RhdGUoJ29wZW4nLCBzdHlsZSh7XHJcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAxXHJcbiAgICAgICAgICAgIH0pKSxcclxuICAgICAgICAgICAgdHJhbnNpdGlvbigndm9pZCA9PiBvcGVuJywgYW5pbWF0ZSgne3tzaG93VHJhbnNpdGlvblBhcmFtc319JykpLFxyXG4gICAgICAgICAgICB0cmFuc2l0aW9uKCdvcGVuID0+IHZvaWQnLCBhbmltYXRlKCd7e2hpZGVUcmFuc2l0aW9uUGFyYW1zfX0nKSksXHJcbiAgICAgICAgXSlcclxuICAgIF1cclxufSlcclxuZXhwb3J0IGNsYXNzIFNjcm9sbFRvcCBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95IHtcclxuXHJcbiAgICBASW5wdXQoKSBzdHlsZUNsYXNzOiBzdHJpbmc7XHJcblxyXG4gICAgQElucHV0KCkgc3R5bGU6IGFueTtcclxuXHJcbiAgICBASW5wdXQoKSB0YXJnZXQ6IHN0cmluZyA9IFwid2luZG93XCI7XHJcbiAgICBcclxuICAgIEBJbnB1dCgpIHRocmVzaG9sZDogbnVtYmVyID0gNDAwO1xyXG5cclxuICAgIEBJbnB1dCgpIGljb246IHN0cmluZyA9IFwicGkgcGktY2hldnJvbi11cFwiO1xyXG5cclxuICAgIEBJbnB1dCgpIGJlaGF2aW9yOiBzdHJpbmcgPSBcInNtb290aFwiO1xyXG4gICAgXHJcbiAgICBASW5wdXQoKSBzaG93VHJhbnNpdGlvbk9wdGlvbnM6IHN0cmluZyA9ICcuMTVzJztcclxuXHJcbiAgICBASW5wdXQoKSBoaWRlVHJhbnNpdGlvbk9wdGlvbnM6IHN0cmluZyA9ICcuMTVzJztcclxuXHJcbiAgICBzY3JvbGxMaXN0ZW5lcjogYW55O1xyXG4gICAgXHJcbiAgICB2aXNpYmxlOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gICAgY29uc3RydWN0b3IocHVibGljIGVsOiBFbGVtZW50UmVmLCBwcml2YXRlIGNkOiBDaGFuZ2VEZXRlY3RvclJlZikgeyB9XHJcblxyXG4gICAgbmdPbkluaXQoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMudGFyZ2V0ID09PSAnd2luZG93JylcclxuICAgICAgICAgICAgdGhpcy5iaW5kRG9jdW1lbnRTY3JvbGxMaXN0ZW5lcigpO1xyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMudGFyZ2V0ID09PSAncGFyZW50JylcclxuICAgICAgICAgICAgdGhpcy5iaW5kUGFyZW50U2Nyb2xsTGlzdGVuZXIoKTtcclxuICAgIH1cclxuXHJcbiAgICBvbkNsaWNrKCkge1xyXG4gICAgICAgIGxldCBzY3JvbGxFbGVtZW50ID0gdGhpcy50YXJnZXQgPT09ICd3aW5kb3cnID8gd2luZG93IDogdGhpcy5lbC5uYXRpdmVFbGVtZW50LnBhcmVudEVsZW1lbnQ7XHJcbiAgICAgICAgIHNjcm9sbEVsZW1lbnQuc2Nyb2xsKHtcclxuICAgICAgICAgICAgdG9wOiAwLCBcclxuICAgICAgICAgICAgYmVoYXZpb3I6IHRoaXMuYmVoYXZpb3JcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBvbkVudGVyKCkge1xyXG4gICAgICAgIHRoaXMuZWwubmF0aXZlRWxlbWVudC5jaGlsZHJlblswXS5zdHlsZS56SW5kZXggPSBEb21IYW5kbGVyLmdlbmVyYXRlWkluZGV4KCk7XHJcbiAgICB9XHJcblxyXG4gICAgY2hlY2tWaXNpYmlsaXR5KHNjcm9sbFkpIHtcclxuICAgICAgICBpZiAoc2Nyb2xsWSA+IHRoaXMudGhyZXNob2xkKVxyXG4gICAgICAgICAgICB0aGlzLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICAgdGhpcy52aXNpYmxlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMuY2QubWFya0ZvckNoZWNrKCk7XHJcbiAgICB9XHJcblxyXG4gICAgYmluZFBhcmVudFNjcm9sbExpc3RlbmVyKCkge1xyXG4gICAgICAgIHRoaXMuc2Nyb2xsTGlzdGVuZXIgPSAoKSA9PiB7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmNoZWNrVmlzaWJpbGl0eSh0aGlzLmVsLm5hdGl2ZUVsZW1lbnQucGFyZW50RWxlbWVudC5zY3JvbGxUb3ApO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5lbC5uYXRpdmVFbGVtZW50LnBhcmVudEVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgdGhpcy5zY3JvbGxMaXN0ZW5lcik7XHJcbiAgICB9XHJcblxyXG4gICAgYmluZERvY3VtZW50U2Nyb2xsTGlzdGVuZXIoKSB7XHJcbiAgICAgICAgdGhpcy5zY3JvbGxMaXN0ZW5lciA9ICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5jaGVja1Zpc2liaWxpdHkoRG9tSGFuZGxlci5nZXRXaW5kb3dTY3JvbGxUb3AoKSk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBcclxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgdGhpcy5zY3JvbGxMaXN0ZW5lcik7XHJcbiAgICB9XHJcblxyXG4gICAgdW5iaW5kUGFyZW50U2Nyb2xsTGlzdGVuZXIoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc2Nyb2xsTGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5lbC5uYXRpdmVFbGVtZW50LnBhcmVudEVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgdGhpcy5zY3JvbGxMaXN0ZW5lcik7XHJcbiAgICAgICAgICAgIHRoaXMuc2Nyb2xsTGlzdGVuZXIgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1bmJpbmREb2N1bWVudFNjcm9sbExpc3RlbmVyKCkge1xyXG4gICAgICAgIGlmICh0aGlzLnNjcm9sbExpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdzY3JvbGwnLCB0aGlzLnNjcm9sbExpc3RlbmVyKTtcclxuICAgICAgICAgICAgdGhpcy5zY3JvbGxMaXN0ZW5lciA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnRhaW5lckNsYXNzKCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICdwLXNjcm9sbHRvcCBwLWxpbmsgcC1jb21wb25lbnQnOiB0cnVlLFxyXG4gICAgICAgICAgICAncC1zY3JvbGx0b3Atc3RpY2t5JzogdGhpcy50YXJnZXQgIT09ICd3aW5kb3cnXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBuZ09uRGVzdHJveSgpIHtcclxuICAgICAgICBpZiAodGhpcy50YXJnZXQgPT09ICd3aW5kb3cnKVxyXG4gICAgICAgICAgICB0aGlzLnVuYmluZERvY3VtZW50U2Nyb2xsTGlzdGVuZXIoKTtcclxuICAgICAgICBlbHNlIGlmICh0aGlzLnRhcmdldCA9PT0gJ3BhcmVudCcpXHJcbiAgICAgICAgICAgIHRoaXMudW5iaW5kUGFyZW50U2Nyb2xsTGlzdGVuZXIoKTtcclxuICAgIH1cclxufVxyXG5cclxuQE5nTW9kdWxlKHtcclxuICAgIGltcG9ydHM6IFtDb21tb25Nb2R1bGVdLFxyXG4gICAgZXhwb3J0czogW1Njcm9sbFRvcF0sXHJcbiAgICBkZWNsYXJhdGlvbnM6IFtTY3JvbGxUb3BdXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBTY3JvbGxUb3BNb2R1bGUgeyB9XHJcbiJdfQ==