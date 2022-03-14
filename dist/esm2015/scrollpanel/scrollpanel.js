import { NgModule, Component, Input, ElementRef, NgZone, ViewChild, ChangeDetectionStrategy, ViewEncapsulation, ChangeDetectorRef, ContentChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomHandler } from 'primeng/dom';
import { PrimeTemplate } from 'primeng/api';
export class ScrollPanel {
    constructor(el, zone, cd) {
        this.el = el;
        this.zone = zone;
        this.cd = cd;
        this.timeoutFrame = (fn) => setTimeout(fn, 0);
    }
    ngAfterViewInit() {
        this.zone.runOutsideAngular(() => {
            this.moveBar();
            this.moveBar = this.moveBar.bind(this);
            this.onXBarMouseDown = this.onXBarMouseDown.bind(this);
            this.onYBarMouseDown = this.onYBarMouseDown.bind(this);
            this.onDocumentMouseMove = this.onDocumentMouseMove.bind(this);
            this.onDocumentMouseUp = this.onDocumentMouseUp.bind(this);
            window.addEventListener('resize', this.moveBar);
            this.contentViewChild.nativeElement.addEventListener('scroll', this.moveBar);
            this.contentViewChild.nativeElement.addEventListener('mouseenter', this.moveBar);
            this.xBarViewChild.nativeElement.addEventListener('mousedown', this.onXBarMouseDown);
            this.yBarViewChild.nativeElement.addEventListener('mousedown', this.onYBarMouseDown);
            this.calculateContainerHeight();
            this.initialized = true;
        });
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
    calculateContainerHeight() {
        let container = this.containerViewChild.nativeElement;
        let content = this.contentViewChild.nativeElement;
        let xBar = this.xBarViewChild.nativeElement;
        let containerStyles = getComputedStyle(container), xBarStyles = getComputedStyle(xBar), pureContainerHeight = DomHandler.getHeight(container) - parseInt(xBarStyles['height'], 10);
        if (containerStyles['max-height'] != "none" && pureContainerHeight == 0) {
            if (content.offsetHeight + parseInt(xBarStyles['height'], 10) > parseInt(containerStyles['max-height'], 10)) {
                container.style.height = containerStyles['max-height'];
            }
            else {
                container.style.height = content.offsetHeight + parseFloat(containerStyles.paddingTop) + parseFloat(containerStyles.paddingBottom) + parseFloat(containerStyles.borderTopWidth) + parseFloat(containerStyles.borderBottomWidth) + "px";
            }
        }
    }
    moveBar() {
        let container = this.containerViewChild.nativeElement;
        let content = this.contentViewChild.nativeElement;
        /* horizontal scroll */
        let xBar = this.xBarViewChild.nativeElement;
        let totalWidth = content.scrollWidth;
        let ownWidth = content.clientWidth;
        let bottom = (container.clientHeight - xBar.clientHeight) * -1;
        this.scrollXRatio = ownWidth / totalWidth;
        /* vertical scroll */
        let yBar = this.yBarViewChild.nativeElement;
        let totalHeight = content.scrollHeight;
        let ownHeight = content.clientHeight;
        let right = (container.clientWidth - yBar.clientWidth) * -1;
        this.scrollYRatio = ownHeight / totalHeight;
        this.requestAnimationFrame(() => {
            if (this.scrollXRatio >= 1) {
                DomHandler.addClass(xBar, 'p-scrollpanel-hidden');
            }
            else {
                DomHandler.removeClass(xBar, 'p-scrollpanel-hidden');
                const xBarWidth = Math.max(this.scrollXRatio * 100, 10);
                const xBarLeft = content.scrollLeft * (100 - xBarWidth) / (totalWidth - ownWidth);
                xBar.style.cssText = 'width:' + xBarWidth + '%; left:' + xBarLeft + '%;bottom:' + bottom + 'px;';
            }
            if (this.scrollYRatio >= 1) {
                DomHandler.addClass(yBar, 'p-scrollpanel-hidden');
            }
            else {
                DomHandler.removeClass(yBar, 'p-scrollpanel-hidden');
                const yBarHeight = Math.max(this.scrollYRatio * 100, 10);
                const yBarTop = content.scrollTop * (100 - yBarHeight) / (totalHeight - ownHeight);
                yBar.style.cssText = 'height:' + yBarHeight + '%; top: calc(' + yBarTop + '% - ' + xBar.clientHeight + 'px);right:' + right + 'px;';
            }
        });
        this.cd.markForCheck();
    }
    onYBarMouseDown(e) {
        this.isYBarClicked = true;
        this.lastPageY = e.pageY;
        DomHandler.addClass(this.yBarViewChild.nativeElement, 'p-scrollpanel-grabbed');
        DomHandler.addClass(document.body, 'p-scrollpanel-grabbed');
        document.addEventListener('mousemove', this.onDocumentMouseMove);
        document.addEventListener('mouseup', this.onDocumentMouseUp);
        e.preventDefault();
    }
    onXBarMouseDown(e) {
        this.isXBarClicked = true;
        this.lastPageX = e.pageX;
        DomHandler.addClass(this.xBarViewChild.nativeElement, 'p-scrollpanel-grabbed');
        DomHandler.addClass(document.body, 'p-scrollpanel-grabbed');
        document.addEventListener('mousemove', this.onDocumentMouseMove);
        document.addEventListener('mouseup', this.onDocumentMouseUp);
        e.preventDefault();
    }
    onDocumentMouseMove(e) {
        if (this.isXBarClicked) {
            this.onMouseMoveForXBar(e);
        }
        else if (this.isYBarClicked) {
            this.onMouseMoveForYBar(e);
        }
        else {
            this.onMouseMoveForXBar(e);
            this.onMouseMoveForYBar(e);
        }
    }
    onMouseMoveForXBar(e) {
        let deltaX = e.pageX - this.lastPageX;
        this.lastPageX = e.pageX;
        this.requestAnimationFrame(() => {
            this.contentViewChild.nativeElement.scrollLeft += deltaX / this.scrollXRatio;
        });
    }
    onMouseMoveForYBar(e) {
        let deltaY = e.pageY - this.lastPageY;
        this.lastPageY = e.pageY;
        this.requestAnimationFrame(() => {
            this.contentViewChild.nativeElement.scrollTop += deltaY / this.scrollYRatio;
        });
    }
    scrollTop(scrollTop) {
        let scrollableHeight = this.contentViewChild.nativeElement.scrollHeight - this.contentViewChild.nativeElement.clientHeight;
        scrollTop = scrollTop > scrollableHeight ? scrollableHeight : scrollTop > 0 ? scrollTop : 0;
        this.contentViewChild.nativeElement.scrollTop = scrollTop;
    }
    onDocumentMouseUp(e) {
        DomHandler.removeClass(this.yBarViewChild.nativeElement, 'p-scrollpanel-grabbed');
        DomHandler.removeClass(this.xBarViewChild.nativeElement, 'p-scrollpanel-grabbed');
        DomHandler.removeClass(document.body, 'p-scrollpanel-grabbed');
        document.removeEventListener('mousemove', this.onDocumentMouseMove);
        document.removeEventListener('mouseup', this.onDocumentMouseUp);
        this.isXBarClicked = false;
        this.isYBarClicked = false;
    }
    requestAnimationFrame(f) {
        let frame = window.requestAnimationFrame || this.timeoutFrame;
        frame(f);
    }
    ngOnDestroy() {
        if (this.initialized) {
            window.removeEventListener('resize', this.moveBar);
            this.contentViewChild.nativeElement.removeEventListener('scroll', this.moveBar);
            this.contentViewChild.nativeElement.removeEventListener('mouseenter', this.moveBar);
            this.xBarViewChild.nativeElement.removeEventListener('mousedown', this.onXBarMouseDown);
            this.yBarViewChild.nativeElement.removeEventListener('mousedown', this.onYBarMouseDown);
        }
    }
    refresh() {
        this.moveBar();
    }
}
ScrollPanel.decorators = [
    { type: Component, args: [{
                selector: 'p-scrollPanel',
                template: `
        <div #container [ngClass]="'p-scrollpanel p-component'" [ngStyle]="style" [class]="styleClass">
            <div class="p-scrollpanel-wrapper">
                <div #content class="p-scrollpanel-content">
                    <ng-content></ng-content>
                    <ng-container *ngTemplateOutlet="contentTemplate"></ng-container>
                </div>
            </div>
            <div #xBar class="p-scrollpanel-bar p-scrollpanel-bar-x"></div>
            <div #yBar class="p-scrollpanel-bar p-scrollpanel-bar-y"></div>   
        </div>
    `,
                changeDetection: ChangeDetectionStrategy.OnPush,
                encapsulation: ViewEncapsulation.None,
                styles: [".p-scrollpanel-wrapper{float:left;height:100%;overflow:hidden;position:relative;width:100%;z-index:1}.p-scrollpanel-content{box-sizing:border-box;height:calc(100% + 18px);overflow:auto;padding:0 18px 18px 0;position:relative;width:calc(100% + 18px)}.p-scrollpanel-bar{background:#c1c1c1;border-radius:3px;cursor:pointer;opacity:0;position:relative;transition:opacity .25s linear;z-index:2}.p-scrollpanel-bar-y{top:0;width:9px}.p-scrollpanel-bar-x{bottom:0;height:9px}.p-scrollpanel-hidden{visibility:hidden}.p-scrollpanel:active .p-scrollpanel-bar,.p-scrollpanel:hover .p-scrollpanel-bar{opacity:1}.p-scrollpanel-grabbed{-ms-user-select:none;-webkit-user-select:none;user-select:none}"]
            },] }
];
ScrollPanel.ctorParameters = () => [
    { type: ElementRef },
    { type: NgZone },
    { type: ChangeDetectorRef }
];
ScrollPanel.propDecorators = {
    style: [{ type: Input }],
    styleClass: [{ type: Input }],
    containerViewChild: [{ type: ViewChild, args: ['container',] }],
    contentViewChild: [{ type: ViewChild, args: ['content',] }],
    xBarViewChild: [{ type: ViewChild, args: ['xBar',] }],
    yBarViewChild: [{ type: ViewChild, args: ['yBar',] }],
    templates: [{ type: ContentChildren, args: [PrimeTemplate,] }]
};
export class ScrollPanelModule {
}
ScrollPanelModule.decorators = [
    { type: NgModule, args: [{
                imports: [CommonModule],
                exports: [ScrollPanel],
                declarations: [ScrollPanel]
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Nyb2xscGFuZWwuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4vc3JjL2FwcC9jb21wb25lbnRzL3Njcm9sbHBhbmVsLyIsInNvdXJjZXMiOlsic2Nyb2xscGFuZWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUE0QixVQUFVLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSx1QkFBdUIsRUFBRSxpQkFBaUIsRUFBRSxpQkFBaUIsRUFBb0IsZUFBZSxFQUEwQixNQUFNLGVBQWUsQ0FBQztBQUM5TyxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDL0MsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUN6QyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBb0I1QyxNQUFNLE9BQU8sV0FBVztJQU1wQixZQUFtQixFQUFjLEVBQVMsSUFBWSxFQUFTLEVBQXFCO1FBQWpFLE9BQUUsR0FBRixFQUFFLENBQVk7UUFBUyxTQUFJLEdBQUosSUFBSSxDQUFRO1FBQVMsT0FBRSxHQUFGLEVBQUUsQ0FBbUI7UUFnQnBGLGlCQUFZLEdBQVEsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFoQnlDLENBQUM7SUE4QnhGLGVBQWU7UUFDWCxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsRUFBRTtZQUM3QixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDZixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdkQsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENB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RixJQUFJLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLG1CQUFtQixDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDcEYsSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsbUJBQW1CLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztZQUN4RixJQUFJLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1NBQzNGO0lBQ0wsQ0FBQztJQUVELE9BQU87UUFDSCxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDbkIsQ0FBQzs7O1lBbFBKLFNBQVMsU0FBQztnQkFDUCxRQUFRLEVBQUUsZUFBZTtnQkFDekIsUUFBUSxFQUFFOzs7Ozs7Ozs7OztLQVdUO2dCQUNGLGVBQWUsRUFBRSx1QkFBdUIsQ0FBQyxNQUFNO2dCQUM5QyxhQUFhLEVBQUUsaUJBQWlCLENBQUMsSUFBSTs7YUFFeEM7OztZQXRCOEQsVUFBVTtZQUFFLE1BQU07WUFBeUQsaUJBQWlCOzs7b0JBeUJ0SixLQUFLO3lCQUVMLEtBQUs7aUNBSUwsU0FBUyxTQUFDLFdBQVc7K0JBRXJCLFNBQVMsU0FBQyxTQUFTOzRCQUVuQixTQUFTLFNBQUMsTUFBTTs0QkFFaEIsU0FBUyxTQUFDLE1BQU07d0JBRWhCLGVBQWUsU0FBQyxhQUFhOztBQXlObEMsTUFBTSxPQUFPLGlCQUFpQjs7O1lBTDdCLFFBQVEsU0FBQztnQkFDTixPQUFPLEVBQUUsQ0FBQyxZQUFZLENBQUM7Z0JBQ3ZCLE9BQU8sRUFBRSxDQUFDLFdBQVcsQ0FBQztnQkFDdEIsWUFBWSxFQUFFLENBQUMsV0FBVyxDQUFDO2FBQzlCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmdNb2R1bGUsIENvbXBvbmVudCwgSW5wdXQsIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSwgRWxlbWVudFJlZiwgTmdab25lLCBWaWV3Q2hpbGQsIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LCBWaWV3RW5jYXBzdWxhdGlvbiwgQ2hhbmdlRGV0ZWN0b3JSZWYsIEFmdGVyQ29udGVudEluaXQsIENvbnRlbnRDaGlsZHJlbiwgUXVlcnlMaXN0LCBUZW1wbGF0ZVJlZiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBDb21tb25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xyXG5pbXBvcnQgeyBEb21IYW5kbGVyIH0gZnJvbSAncHJpbWVuZy9kb20nO1xyXG5pbXBvcnQgeyBQcmltZVRlbXBsYXRlIH0gZnJvbSAncHJpbWVuZy9hcGknO1xyXG5cclxuQENvbXBvbmVudCh7XHJcbiAgICBzZWxlY3RvcjogJ3Atc2Nyb2xsUGFuZWwnLFxyXG4gICAgdGVtcGxhdGU6IGBcclxuICAgICAgICA8ZGl2ICNjb250YWluZXIgW25nQ2xhc3NdPVwiJ3Atc2Nyb2xscGFuZWwgcC1jb21wb25lbnQnXCIgW25nU3R5bGVdPVwic3R5bGVcIiBbY2xhc3NdPVwic3R5bGVDbGFzc1wiPlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwicC1zY3JvbGxwYW5lbC13cmFwcGVyXCI+XHJcbiAgICAgICAgICAgICAgICA8ZGl2ICNjb250ZW50IGNsYXNzPVwicC1zY3JvbGxwYW5lbC1jb250ZW50XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PlxyXG4gICAgICAgICAgICAgICAgICAgIDxuZy1jb250YWluZXIgKm5nVGVtcGxhdGVPdXRsZXQ9XCJjb250ZW50VGVtcGxhdGVcIj48L25nLWNvbnRhaW5lcj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPGRpdiAjeEJhciBjbGFzcz1cInAtc2Nyb2xscGFuZWwtYmFyIHAtc2Nyb2xscGFuZWwtYmFyLXhcIj48L2Rpdj5cclxuICAgICAgICAgICAgPGRpdiAjeUJhciBjbGFzcz1cInAtc2Nyb2xscGFuZWwtYmFyIHAtc2Nyb2xscGFuZWwtYmFyLXlcIj48L2Rpdj4gICBcclxuICAgICAgICA8L2Rpdj5cclxuICAgIGAsXHJcbiAgIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxyXG4gICAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcclxuICAgIHN0eWxlVXJsczogWycuL3Njcm9sbHBhbmVsLmNzcyddXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBTY3JvbGxQYW5lbCBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQsIEFmdGVyQ29udGVudEluaXQsIE9uRGVzdHJveSB7XHJcblxyXG4gICAgQElucHV0KCkgc3R5bGU6IGFueTtcclxuXHJcbiAgICBASW5wdXQoKSBzdHlsZUNsYXNzOiBzdHJpbmc7XHJcbiAgICBcclxuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBlbDogRWxlbWVudFJlZiwgcHVibGljIHpvbmU6IE5nWm9uZSwgcHVibGljIGNkOiBDaGFuZ2VEZXRlY3RvclJlZikge31cclxuXHJcbiAgICBAVmlld0NoaWxkKCdjb250YWluZXInKSBjb250YWluZXJWaWV3Q2hpbGQ6IEVsZW1lbnRSZWY7XHJcblxyXG4gICAgQFZpZXdDaGlsZCgnY29udGVudCcpIGNvbnRlbnRWaWV3Q2hpbGQ6IEVsZW1lbnRSZWY7XHJcblxyXG4gICAgQFZpZXdDaGlsZCgneEJhcicpIHhCYXJWaWV3Q2hpbGQ6IEVsZW1lbnRSZWY7XHJcbiAgICBcclxuICAgIEBWaWV3Q2hpbGQoJ3lCYXInKSB5QmFyVmlld0NoaWxkOiBFbGVtZW50UmVmO1xyXG5cclxuICAgIEBDb250ZW50Q2hpbGRyZW4oUHJpbWVUZW1wbGF0ZSkgdGVtcGxhdGVzOiBRdWVyeUxpc3Q8YW55PjtcclxuXHJcbiAgICBzY3JvbGxZUmF0aW86IG51bWJlcjtcclxuXHJcbiAgICBzY3JvbGxYUmF0aW86IG51bWJlcjtcclxuXHJcbiAgICB0aW1lb3V0RnJhbWU6IGFueSA9IChmbikgPT4gc2V0VGltZW91dChmbiwgMCk7XHJcblxyXG4gICAgaW5pdGlhbGl6ZWQ6IGJvb2xlYW47XHJcblxyXG4gICAgbGFzdFBhZ2VZOiBudW1iZXI7XHJcblxyXG4gICAgbGFzdFBhZ2VYOiBudW1iZXI7XHJcblxyXG4gICAgaXNYQmFyQ2xpY2tlZDogYm9vbGVhbjtcclxuXHJcbiAgICBpc1lCYXJDbGlja2VkOiBib29sZWFuO1xyXG5cclxuICAgIGNvbnRlbnRUZW1wbGF0ZTogVGVtcGxhdGVSZWY8YW55PjtcclxuXHJcbiAgICBuZ0FmdGVyVmlld0luaXQoKSB7XHJcbiAgICAgICAgdGhpcy56b25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5tb3ZlQmFyKCk7XHJcbiAgICAgICAgICAgIHRoaXMubW92ZUJhciA9IHRoaXMubW92ZUJhci5iaW5kKHRoaXMpO1xyXG4gICAgICAgICAgICB0aGlzLm9uWEJhck1vdXNlRG93biA9IHRoaXMub25YQmFyTW91c2VEb3duLmJpbmQodGhpcyk7XHJcbiAgICAgICAgICAgIHRoaXMub25ZQmFyTW91c2VEb3duID0gdGhpcy5vbllCYXJNb3VzZURvd24uYmluZCh0aGlzKTtcclxuICAgICAgICAgICAgdGhpcy5vbkRvY3VtZW50TW91c2VNb3ZlID0gdGhpcy5vbkRvY3VtZW50TW91c2VNb3ZlLmJpbmQodGhpcyk7XHJcbiAgICAgICAgICAgIHRoaXMub25Eb2N1bWVudE1vdXNlVXAgPSB0aGlzLm9uRG9jdW1lbnRNb3VzZVVwLmJpbmQodGhpcyk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgdGhpcy5tb3ZlQmFyKTtcclxuICAgICAgICAgICAgdGhpcy5jb250ZW50Vmlld0NoaWxkLm5hdGl2ZUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgdGhpcy5tb3ZlQmFyKTtcclxuICAgICAgICAgICAgdGhpcy5jb250ZW50Vmlld0NoaWxkLm5hdGl2ZUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsIHRoaXMubW92ZUJhcik7XHJcbiAgICAgICAgICAgIHRoaXMueEJhclZpZXdDaGlsZC5uYXRpdmVFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIHRoaXMub25YQmFyTW91c2VEb3duKTtcclxuICAgICAgICAgICAgdGhpcy55QmFyVmlld0NoaWxkLm5hdGl2ZUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5vbllCYXJNb3VzZURvd24pO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jYWxjdWxhdGVDb250YWluZXJIZWlnaHQoKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcclxuICAgICAgICB0aGlzLnRlbXBsYXRlcy5mb3JFYWNoKChpdGVtKSA9PiB7XHJcbiAgICAgICAgICAgIHN3aXRjaChpdGVtLmdldFR5cGUoKSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnY29udGVudCc6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb250ZW50VGVtcGxhdGUgPSBpdGVtLnRlbXBsYXRlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnRlbnRUZW1wbGF0ZSA9IGl0ZW0udGVtcGxhdGU7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGNhbGN1bGF0ZUNvbnRhaW5lckhlaWdodCgpIHtcclxuICAgICAgICBsZXQgY29udGFpbmVyID0gdGhpcy5jb250YWluZXJWaWV3Q2hpbGQubmF0aXZlRWxlbWVudDtcclxuICAgICAgICBsZXQgY29udGVudCA9IHRoaXMuY29udGVudFZpZXdDaGlsZC5uYXRpdmVFbGVtZW50O1xyXG4gICAgICAgIGxldCB4QmFyID0gdGhpcy54QmFyVmlld0NoaWxkLm5hdGl2ZUVsZW1lbnQ7XHJcblxyXG4gICAgICAgIGxldCBjb250YWluZXJTdHlsZXMgPSBnZXRDb21wdXRlZFN0eWxlKGNvbnRhaW5lciksXHJcbiAgICAgICAgeEJhclN0eWxlcyA9IGdldENvbXB1dGVkU3R5bGUoeEJhciksXHJcbiAgICAgICAgcHVyZUNvbnRhaW5lckhlaWdodCA9IERvbUhhbmRsZXIuZ2V0SGVpZ2h0KGNvbnRhaW5lcikgLSBwYXJzZUludCh4QmFyU3R5bGVzWydoZWlnaHQnXSwgMTApO1xyXG5cclxuICAgICAgICBpZiAoY29udGFpbmVyU3R5bGVzWydtYXgtaGVpZ2h0J10gIT0gXCJub25lXCIgJiYgcHVyZUNvbnRhaW5lckhlaWdodCA9PSAwKSB7XHJcbiAgICAgICAgICAgIGlmIChjb250ZW50Lm9mZnNldEhlaWdodCArIHBhcnNlSW50KHhCYXJTdHlsZXNbJ2hlaWdodCddLCAxMCkgPiBwYXJzZUludChjb250YWluZXJTdHlsZXNbJ21heC1oZWlnaHQnXSwgMTApKSB7XHJcbiAgICAgICAgICAgICAgICBjb250YWluZXIuc3R5bGUuaGVpZ2h0ID0gY29udGFpbmVyU3R5bGVzWydtYXgtaGVpZ2h0J107XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb250YWluZXIuc3R5bGUuaGVpZ2h0ID0gY29udGVudC5vZmZzZXRIZWlnaHQgKyBwYXJzZUZsb2F0KGNvbnRhaW5lclN0eWxlcy5wYWRkaW5nVG9wKSArIHBhcnNlRmxvYXQoY29udGFpbmVyU3R5bGVzLnBhZGRpbmdCb3R0b20pICsgcGFyc2VGbG9hdChjb250YWluZXJTdHlsZXMuYm9yZGVyVG9wV2lkdGgpICsgcGFyc2VGbG9hdChjb250YWluZXJTdHlsZXMuYm9yZGVyQm90dG9tV2lkdGgpICsgXCJweFwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdmVCYXIoKSB7XHJcbiAgICAgICAgbGV0IGNvbnRhaW5lciA9IHRoaXMuY29udGFpbmVyVmlld0NoaWxkLm5hdGl2ZUVsZW1lbnQ7XHJcbiAgICAgICAgbGV0IGNvbnRlbnQgPSB0aGlzLmNvbnRlbnRWaWV3Q2hpbGQubmF0aXZlRWxlbWVudDtcclxuXHJcbiAgICAgICAgLyogaG9yaXpvbnRhbCBzY3JvbGwgKi9cclxuICAgICAgICBsZXQgeEJhciA9IHRoaXMueEJhclZpZXdDaGlsZC5uYXRpdmVFbGVtZW50O1xyXG4gICAgICAgIGxldCB0b3RhbFdpZHRoID0gY29udGVudC5zY3JvbGxXaWR0aDtcclxuICAgICAgICBsZXQgb3duV2lkdGggPSBjb250ZW50LmNsaWVudFdpZHRoO1xyXG4gICAgICAgIGxldCBib3R0b20gPSAoY29udGFpbmVyLmNsaWVudEhlaWdodCAtIHhCYXIuY2xpZW50SGVpZ2h0KSAqIC0xO1xyXG5cclxuICAgICAgICB0aGlzLnNjcm9sbFhSYXRpbyA9IG93bldpZHRoIC8gdG90YWxXaWR0aDtcclxuXHJcbiAgICAgICAgLyogdmVydGljYWwgc2Nyb2xsICovXHJcbiAgICAgICAgbGV0IHlCYXIgPSB0aGlzLnlCYXJWaWV3Q2hpbGQubmF0aXZlRWxlbWVudDtcclxuICAgICAgICBsZXQgdG90YWxIZWlnaHQgPSBjb250ZW50LnNjcm9sbEhlaWdodDtcclxuICAgICAgICBsZXQgb3duSGVpZ2h0ID0gY29udGVudC5jbGllbnRIZWlnaHQ7XHJcbiAgICAgICAgbGV0IHJpZ2h0ID0gKGNvbnRhaW5lci5jbGllbnRXaWR0aCAtIHlCYXIuY2xpZW50V2lkdGgpICogLTE7XHJcblxyXG4gICAgICAgIHRoaXMuc2Nyb2xsWVJhdGlvID0gb3duSGVpZ2h0IC8gdG90YWxIZWlnaHQ7XHJcblxyXG4gICAgICAgIHRoaXMucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuc2Nyb2xsWFJhdGlvID49IDEpIHtcclxuICAgICAgICAgICAgICAgIERvbUhhbmRsZXIuYWRkQ2xhc3MoeEJhciwgJ3Atc2Nyb2xscGFuZWwtaGlkZGVuJyk7XHJcbiAgICAgICAgICAgIH0gXHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgRG9tSGFuZGxlci5yZW1vdmVDbGFzcyh4QmFyLCAncC1zY3JvbGxwYW5lbC1oaWRkZW4nKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHhCYXJXaWR0aCA9IE1hdGgubWF4KHRoaXMuc2Nyb2xsWFJhdGlvICogMTAwLCAxMCk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB4QmFyTGVmdCA9IGNvbnRlbnQuc2Nyb2xsTGVmdCAqICgxMDAgLSB4QmFyV2lkdGgpIC8gKHRvdGFsV2lkdGggLSBvd25XaWR0aCk7XHJcbiAgICAgICAgICAgICAgICB4QmFyLnN0eWxlLmNzc1RleHQgPSAnd2lkdGg6JyArIHhCYXJXaWR0aCArICclOyBsZWZ0OicgKyB4QmFyTGVmdCArICclO2JvdHRvbTonICsgYm90dG9tICsgJ3B4Oyc7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNjcm9sbFlSYXRpbyA+PSAxKSB7XHJcbiAgICAgICAgICAgICAgICBEb21IYW5kbGVyLmFkZENsYXNzKHlCYXIsICdwLXNjcm9sbHBhbmVsLWhpZGRlbicpO1xyXG4gICAgICAgICAgICB9IFxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIERvbUhhbmRsZXIucmVtb3ZlQ2xhc3MoeUJhciwgJ3Atc2Nyb2xscGFuZWwtaGlkZGVuJyk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB5QmFySGVpZ2h0ID0gTWF0aC5tYXgodGhpcy5zY3JvbGxZUmF0aW8gKiAxMDAsIDEwKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHlCYXJUb3AgPSBjb250ZW50LnNjcm9sbFRvcCAqICgxMDAgLSB5QmFySGVpZ2h0KSAvICh0b3RhbEhlaWdodCAtIG93bkhlaWdodCk7XHJcbiAgICAgICAgICAgICAgICB5QmFyLnN0eWxlLmNzc1RleHQgPSAnaGVpZ2h0OicgKyB5QmFySGVpZ2h0ICsgJyU7IHRvcDogY2FsYygnICsgeUJhclRvcCArICclIC0gJyArIHhCYXIuY2xpZW50SGVpZ2h0ICsgJ3B4KTtyaWdodDonICsgcmlnaHQgKyAncHg7JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuY2QubWFya0ZvckNoZWNrKCk7XHJcbiAgICB9XHJcblxyXG4gICAgb25ZQmFyTW91c2VEb3duKGU6IE1vdXNlRXZlbnQpIHtcclxuICAgICAgICB0aGlzLmlzWUJhckNsaWNrZWQgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMubGFzdFBhZ2VZID0gZS5wYWdlWTtcclxuICAgICAgICBEb21IYW5kbGVyLmFkZENsYXNzKHRoaXMueUJhclZpZXdDaGlsZC5uYXRpdmVFbGVtZW50LCAncC1zY3JvbGxwYW5lbC1ncmFiYmVkJyk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgRG9tSGFuZGxlci5hZGRDbGFzcyhkb2N1bWVudC5ib2R5LCAncC1zY3JvbGxwYW5lbC1ncmFiYmVkJyk7XHJcblxyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMub25Eb2N1bWVudE1vdXNlTW92ZSk7XHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMub25Eb2N1bWVudE1vdXNlVXApO1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIH1cclxuXHJcbiAgICBvblhCYXJNb3VzZURvd24oZTogTW91c2VFdmVudCkge1xyXG4gICAgICAgIHRoaXMuaXNYQmFyQ2xpY2tlZCA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5sYXN0UGFnZVggPSBlLnBhZ2VYO1xyXG4gICAgICAgIERvbUhhbmRsZXIuYWRkQ2xhc3ModGhpcy54QmFyVmlld0NoaWxkLm5hdGl2ZUVsZW1lbnQsICdwLXNjcm9sbHBhbmVsLWdyYWJiZWQnKTtcclxuXHJcbiAgICAgICAgRG9tSGFuZGxlci5hZGRDbGFzcyhkb2N1bWVudC5ib2R5LCAncC1zY3JvbGxwYW5lbC1ncmFiYmVkJyk7XHJcblxyXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMub25Eb2N1bWVudE1vdXNlTW92ZSk7XHJcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMub25Eb2N1bWVudE1vdXNlVXApO1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIH1cclxuXHJcbiAgICBvbkRvY3VtZW50TW91c2VNb3ZlKGU6IE1vdXNlRXZlbnQpIHtcclxuICAgICAgICBpZiAodGhpcy5pc1hCYXJDbGlja2VkKSB7XHJcbiAgICAgICAgICAgIHRoaXMub25Nb3VzZU1vdmVGb3JYQmFyKGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICh0aGlzLmlzWUJhckNsaWNrZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5vbk1vdXNlTW92ZUZvcllCYXIoZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLm9uTW91c2VNb3ZlRm9yWEJhcihlKTtcclxuICAgICAgICAgICAgdGhpcy5vbk1vdXNlTW92ZUZvcllCYXIoZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgfVxyXG5cclxuICAgIG9uTW91c2VNb3ZlRm9yWEJhcihlOiBNb3VzZUV2ZW50KSB7XHJcbiAgICAgICAgbGV0IGRlbHRhWCA9IGUucGFnZVggLSB0aGlzLmxhc3RQYWdlWDtcclxuICAgICAgICB0aGlzLmxhc3RQYWdlWCA9IGUucGFnZVg7XHJcblxyXG4gICAgICAgIHRoaXMucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5jb250ZW50Vmlld0NoaWxkLm5hdGl2ZUVsZW1lbnQuc2Nyb2xsTGVmdCArPSBkZWx0YVggLyB0aGlzLnNjcm9sbFhSYXRpbztcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBvbk1vdXNlTW92ZUZvcllCYXIoZTogTW91c2VFdmVudCkge1xyXG4gICAgICAgIGxldCBkZWx0YVkgPSBlLnBhZ2VZIC0gdGhpcy5sYXN0UGFnZVk7XHJcbiAgICAgICAgdGhpcy5sYXN0UGFnZVkgPSBlLnBhZ2VZO1xyXG5cclxuICAgICAgICB0aGlzLnJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuY29udGVudFZpZXdDaGlsZC5uYXRpdmVFbGVtZW50LnNjcm9sbFRvcCArPSBkZWx0YVkgLyB0aGlzLnNjcm9sbFlSYXRpbztcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBzY3JvbGxUb3Aoc2Nyb2xsVG9wOiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgc2Nyb2xsYWJsZUhlaWdodCA9IHRoaXMuY29udGVudFZpZXdDaGlsZC5uYXRpdmVFbGVtZW50LnNjcm9sbEhlaWdodCAtIHRoaXMuY29udGVudFZpZXdDaGlsZC5uYXRpdmVFbGVtZW50LmNsaWVudEhlaWdodDtcclxuICAgICAgICBzY3JvbGxUb3AgPSBzY3JvbGxUb3AgPiBzY3JvbGxhYmxlSGVpZ2h0ID8gc2Nyb2xsYWJsZUhlaWdodCA6IHNjcm9sbFRvcCA+IDAgPyBzY3JvbGxUb3AgOiAwO1xyXG4gICAgICAgIHRoaXMuY29udGVudFZpZXdDaGlsZC5uYXRpdmVFbGVtZW50LnNjcm9sbFRvcCA9IHNjcm9sbFRvcDtcclxuICAgIH1cclxuXHJcbiAgICBvbkRvY3VtZW50TW91c2VVcChlOiBFdmVudCkge1xyXG4gICAgICAgIERvbUhhbmRsZXIucmVtb3ZlQ2xhc3ModGhpcy55QmFyVmlld0NoaWxkLm5hdGl2ZUVsZW1lbnQsICdwLXNjcm9sbHBhbmVsLWdyYWJiZWQnKTtcclxuICAgICAgICBEb21IYW5kbGVyLnJlbW92ZUNsYXNzKHRoaXMueEJhclZpZXdDaGlsZC5uYXRpdmVFbGVtZW50LCAncC1zY3JvbGxwYW5lbC1ncmFiYmVkJyk7XHJcbiAgICAgICAgRG9tSGFuZGxlci5yZW1vdmVDbGFzcyhkb2N1bWVudC5ib2R5LCAncC1zY3JvbGxwYW5lbC1ncmFiYmVkJyk7XHJcblxyXG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMub25Eb2N1bWVudE1vdXNlTW92ZSk7XHJcbiAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMub25Eb2N1bWVudE1vdXNlVXApO1xyXG4gICAgICAgIHRoaXMuaXNYQmFyQ2xpY2tlZCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuaXNZQmFyQ2xpY2tlZCA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShmOiBGdW5jdGlvbikge1xyXG4gICAgICAgIGxldCBmcmFtZSA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHzCoHRoaXMudGltZW91dEZyYW1lO1xyXG4gICAgICAgIGZyYW1lKGYpO1xyXG4gICAgfVxyXG5cclxuICAgIG5nT25EZXN0cm95KCkge1xyXG4gICAgICAgIGlmICh0aGlzLmluaXRpYWxpemVkKSB7XHJcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLm1vdmVCYXIpO1xyXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRWaWV3Q2hpbGQubmF0aXZlRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdzY3JvbGwnLCB0aGlzLm1vdmVCYXIpO1xyXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRWaWV3Q2hpbGQubmF0aXZlRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgdGhpcy5tb3ZlQmFyKTtcclxuICAgICAgICAgICAgdGhpcy54QmFyVmlld0NoaWxkLm5hdGl2ZUVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5vblhCYXJNb3VzZURvd24pO1xyXG4gICAgICAgICAgICB0aGlzLnlCYXJWaWV3Q2hpbGQubmF0aXZlRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB0aGlzLm9uWUJhck1vdXNlRG93bik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJlZnJlc2goKSB7XHJcbiAgICAgICAgdGhpcy5tb3ZlQmFyKCk7XHJcbiAgICB9XHJcblxyXG59XHJcblxyXG5ATmdNb2R1bGUoe1xyXG4gICAgaW1wb3J0czogW0NvbW1vbk1vZHVsZV0sXHJcbiAgICBleHBvcnRzOiBbU2Nyb2xsUGFuZWxdLFxyXG4gICAgZGVjbGFyYXRpb25zOiBbU2Nyb2xsUGFuZWxdXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBTY3JvbGxQYW5lbE1vZHVsZSB7IH1cclxuIl19