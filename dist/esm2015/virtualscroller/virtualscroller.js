import { NgModule, Component, ElementRef, Input, Output, ViewChild, EventEmitter, ContentChild, ContentChildren, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header, Footer, PrimeTemplate, SharedModule } from 'primeng/api';
import { ScrollingModule, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
export class VirtualScroller {
    constructor(el) {
        this.el = el;
        this.delay = 250;
        this.trackBy = (index, item) => item;
        this.onLazyLoad = new EventEmitter();
        this._totalRecords = 0;
        this.page = 0;
        this._first = 0;
    }
    get totalRecords() {
        return this._totalRecords;
    }
    set totalRecords(val) {
        this._totalRecords = val;
        console.log("totalRecords is deprecated, provide a value with the length of virtual items instead.");
    }
    get first() {
        return this._first;
    }
    set first(val) {
        this._first = val;
        console.log("first property is deprecated, use scrollToIndex function to scroll a specific item.");
    }
    get cache() {
        return this._cache;
    }
    set cache(val) {
        this._cache = val;
        console.log("cache is deprecated as it is always on.");
    }
    ngAfterContentInit() {
        this.templates.forEach((item) => {
            switch (item.getType()) {
                case 'item':
                    this.itemTemplate = item.template;
                    break;
                case 'loadingItem':
                    this.loadingItemTemplate = item.template;
                    break;
                case 'header':
                    this.headerTemplate = item.template;
                    break;
                case 'footer':
                    this.footerTemplate = item.template;
                    break;
                default:
                    this.itemTemplate = item.template;
                    break;
            }
        });
    }
    onScrollIndexChange(index) {
        if (this.lazy) {
            if (this.virtualScrollTimeout) {
                clearTimeout(this.virtualScrollTimeout);
            }
            this.virtualScrollTimeout = setTimeout(() => {
                let page = Math.floor(index / this.rows);
                let virtualScrollOffset = page === 0 ? 0 : (page - 1) * this.rows;
                let virtualScrollChunkSize = page === 0 ? this.rows * 2 : this.rows * 3;
                if (page !== this.virtualPage) {
                    this.virtualPage = page;
                    this.onLazyLoad.emit({ first: virtualScrollOffset, rows: virtualScrollChunkSize });
                }
            }, this.delay);
        }
    }
    getBlockableElement() {
        return this.el.nativeElement.children[0];
    }
    //@deprecated
    scrollTo(index, mode) {
        this.scrollToIndex(index, mode);
    }
    scrollToIndex(index, mode) {
        if (this.viewport) {
            this.viewport.scrollToIndex(index, mode);
        }
    }
}
VirtualScroller.decorators = [
    { type: Component, args: [{
                selector: 'p-virtualScroller',
                template: `
        <div [ngClass]="'p-virtualscroller p-component'" [ngStyle]="style" [class]="styleClass">
            <div class="p-virtualscroller-header" *ngIf="header || headerTemplate">
                <ng-content select="p-header"></ng-content>
                <ng-container *ngTemplateOutlet="headerTemplate"></ng-container>
            </div>
            <div #content class="p-virtualscroller-content">
                <div class="p-virtualscroller-list">
                    <cdk-virtual-scroll-viewport #viewport [ngStyle]="{'height': scrollHeight}" tabindex="0" [itemSize]="itemSize" [minBufferPx]="minBufferPx" [maxBufferPx]="maxBufferPx" (scrolledIndexChange)="onScrollIndexChange($event)">
                        <ng-container *cdkVirtualFor="let item of value; trackBy: trackBy; let i = index; let c = count; let f = first; let l = last; let e = even; let o = odd;">
                            <div [ngStyle]="{'height': itemSize + 'px'}" class="p-virtualscroller-item">
                                <ng-container *ngTemplateOutlet="item ? itemTemplate : loadingItemTemplate; context: {$implicit: item, index: i, count: c, first: f, last: l, even: e, odd: o}"></ng-container>
                            </div>
                        </ng-container>
                    </cdk-virtual-scroll-viewport>
                </div>
            </div>
            <div class="p-virtualscroller-footer" *ngIf="footer || footerTemplate">
                <ng-content select="p-footer"></ng-content>
                <ng-container *ngTemplateOutlet="footerTemplate"></ng-container>
            </div>
        </div>
    `,
                changeDetection: ChangeDetectionStrategy.Default,
                encapsulation: ViewEncapsulation.None,
                styles: ["cdk-virtual-scroll-viewport{outline:0 none}"]
            },] }
];
VirtualScroller.ctorParameters = () => [
    { type: ElementRef }
];
VirtualScroller.propDecorators = {
    value: [{ type: Input }],
    itemSize: [{ type: Input }],
    style: [{ type: Input }],
    styleClass: [{ type: Input }],
    scrollHeight: [{ type: Input }],
    lazy: [{ type: Input }],
    rows: [{ type: Input }],
    minBufferPx: [{ type: Input }],
    maxBufferPx: [{ type: Input }],
    delay: [{ type: Input }],
    trackBy: [{ type: Input }],
    header: [{ type: ContentChild, args: [Header,] }],
    footer: [{ type: ContentChild, args: [Footer,] }],
    templates: [{ type: ContentChildren, args: [PrimeTemplate,] }],
    viewport: [{ type: ViewChild, args: [CdkVirtualScrollViewport,] }],
    onLazyLoad: [{ type: Output }],
    totalRecords: [{ type: Input }],
    first: [{ type: Input }],
    cache: [{ type: Input }]
};
export class VirtualScrollerModule {
}
VirtualScrollerModule.decorators = [
    { type: NgModule, args: [{
                imports: [CommonModule, ScrollingModule],
                exports: [VirtualScroller, SharedModule, ScrollingModule],
                declarations: [VirtualScroller]
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlydHVhbHNjcm9sbGVyLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLy4uL3NyYy9hcHAvY29tcG9uZW50cy92aXJ0dWFsc2Nyb2xsZXIvIiwic291cmNlcyI6WyJ2aXJ0dWFsc2Nyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFFBQVEsRUFBQyxTQUFTLEVBQUMsVUFBVSxFQUFrQixLQUFLLEVBQUMsTUFBTSxFQUFDLFNBQVMsRUFBQyxZQUFZLEVBQUMsWUFBWSxFQUFDLGVBQWUsRUFBdUIsdUJBQXVCLEVBQUUsaUJBQWlCLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDL00sT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQzdDLE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxFQUFDLGFBQWEsRUFBQyxZQUFZLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDckUsT0FBTyxFQUFDLGVBQWUsRUFBQyx3QkFBd0IsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBZ0NoRixNQUFNLE9BQU8sZUFBZTtJQXNEeEIsWUFBbUIsRUFBYztRQUFkLE9BQUUsR0FBRixFQUFFLENBQVk7UUFsQ3hCLFVBQUssR0FBVyxHQUFHLENBQUM7UUFFcEIsWUFBTyxHQUFhLENBQUMsS0FBYSxFQUFFLElBQVMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDO1FBVXRELGVBQVUsR0FBc0IsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQVU3RCxrQkFBYSxHQUFXLENBQUMsQ0FBQztRQUUxQixTQUFJLEdBQVcsQ0FBQyxDQUFDO1FBRWpCLFdBQU0sR0FBVyxDQUFDLENBQUM7SUFRaUIsQ0FBQztJQUVyQyxJQUFhLFlBQVk7UUFDckIsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDO0lBQzlCLENBQUM7SUFDRCxJQUFJLFlBQVksQ0FBQyxHQUFXO1FBQ3hCLElBQUksQ0FBQyxhQUFhLEdBQUcsR0FBRyxDQUFDO1FBQ3pCLE9BQU8sQ0FBQyxHQUFHLENBQUMsdUZB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QUFDO0lBRUQsYUFBYSxDQUFDLEtBQWEsRUFBRSxJQUFxQjtRQUM5QyxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDZixJQUFJLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDNUM7SUFDTCxDQUFDOzs7WUF2S0osU0FBUyxTQUFDO2dCQUNQLFFBQVEsRUFBRSxtQkFBbUI7Z0JBQzdCLFFBQVEsRUFBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztLQXNCUjtnQkFDRCxlQUFlLEVBQUUsdUJBQXVCLENBQUMsT0FBTztnQkFDaEQsYUFBYSxFQUFFLGlCQUFpQixDQUFDLElBQUk7O2FBRXhDOzs7WUFsQzBCLFVBQVU7OztvQkFxQ2hDLEtBQUs7dUJBRUwsS0FBSztvQkFFTCxLQUFLO3lCQUVMLEtBQUs7MkJBRUwsS0FBSzttQkFFTCxLQUFLO21CQUVMLEtBQUs7MEJBRUwsS0FBSzswQkFFTCxLQUFLO29CQUVMLEtBQUs7c0JBRUwsS0FBSztxQkFFTCxZQUFZLFNBQUMsTUFBTTtxQkFFbkIsWUFBWSxTQUFDLE1BQU07d0JBRW5CLGVBQWUsU0FBQyxhQUFhO3VCQUU3QixTQUFTLFNBQUMsd0JBQXdCO3lCQUVsQyxNQUFNOzJCQXdCTixLQUFLO29CQVFMLEtBQUs7b0JBUUwsS0FBSzs7QUEwRVYsTUFBTSxPQUFPLHFCQUFxQjs7O1lBTGpDLFFBQVEsU0FBQztnQkFDTixPQUFPLEVBQUUsQ0FBQyxZQUFZLEVBQUMsZUFBZSxDQUFDO2dCQUN2QyxPQUFPLEVBQUUsQ0FBQyxlQUFlLEVBQUMsWUFBWSxFQUFDLGVBQWUsQ0FBQztnQkFDdkQsWUFBWSxFQUFFLENBQUMsZUFBZSxDQUFDO2FBQ2xDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtOZ01vZHVsZSxDb21wb25lbnQsRWxlbWVudFJlZixBZnRlckNvbnRlbnRJbml0LElucHV0LE91dHB1dCxWaWV3Q2hpbGQsRXZlbnRFbWl0dGVyLENvbnRlbnRDaGlsZCxDb250ZW50Q2hpbGRyZW4sUXVlcnlMaXN0LFRlbXBsYXRlUmVmLENoYW5nZURldGVjdGlvblN0cmF0ZWd5LCBWaWV3RW5jYXBzdWxhdGlvbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7Q29tbW9uTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xyXG5pbXBvcnQge0hlYWRlcixGb290ZXIsUHJpbWVUZW1wbGF0ZSxTaGFyZWRNb2R1bGV9IGZyb20gJ3ByaW1lbmcvYXBpJztcclxuaW1wb3J0IHtTY3JvbGxpbmdNb2R1bGUsQ2RrVmlydHVhbFNjcm9sbFZpZXdwb3J0fSBmcm9tICdAYW5ndWxhci9jZGsvc2Nyb2xsaW5nJztcclxuaW1wb3J0IHtCbG9ja2FibGVVSX0gZnJvbSAncHJpbWVuZy9hcGknO1xyXG5cclxuQENvbXBvbmVudCh7XHJcbiAgICBzZWxlY3RvcjogJ3AtdmlydHVhbFNjcm9sbGVyJyxcclxuICAgIHRlbXBsYXRlOmBcclxuICAgICAgICA8ZGl2IFtuZ0NsYXNzXT1cIidwLXZpcnR1YWxzY3JvbGxlciBwLWNvbXBvbmVudCdcIiBbbmdTdHlsZV09XCJzdHlsZVwiIFtjbGFzc109XCJzdHlsZUNsYXNzXCI+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwLXZpcnR1YWxzY3JvbGxlci1oZWFkZXJcIiAqbmdJZj1cImhlYWRlciB8fCBoZWFkZXJUZW1wbGF0ZVwiPlxyXG4gICAgICAgICAgICAgICAgPG5nLWNvbnRlbnQgc2VsZWN0PVwicC1oZWFkZXJcIj48L25nLWNvbnRlbnQ+XHJcbiAgICAgICAgICAgICAgICA8bmctY29udGFpbmVyICpuZ1RlbXBsYXRlT3V0bGV0PVwiaGVhZGVyVGVtcGxhdGVcIj48L25nLWNvbnRhaW5lcj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDxkaXYgI2NvbnRlbnQgY2xhc3M9XCJwLXZpcnR1YWxzY3JvbGxlci1jb250ZW50XCI+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicC12aXJ0dWFsc2Nyb2xsZXItbGlzdFwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxjZGstdmlydHVhbC1zY3JvbGwtdmlld3BvcnQgI3ZpZXdwb3J0IFtuZ1N0eWxlXT1cInsnaGVpZ2h0Jzogc2Nyb2xsSGVpZ2h0fVwiIHRhYmluZGV4PVwiMFwiIFtpdGVtU2l6ZV09XCJpdGVtU2l6ZVwiIFttaW5CdWZmZXJQeF09XCJtaW5CdWZmZXJQeFwiIFttYXhCdWZmZXJQeF09XCJtYXhCdWZmZXJQeFwiIChzY3JvbGxlZEluZGV4Q2hhbmdlKT1cIm9uU2Nyb2xsSW5kZXhDaGFuZ2UoJGV2ZW50KVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8bmctY29udGFpbmVyICpjZGtWaXJ0dWFsRm9yPVwibGV0IGl0ZW0gb2YgdmFsdWU7IHRyYWNrQnk6IHRyYWNrQnk7IGxldCBpID0gaW5kZXg7IGxldCBjID0gY291bnQ7IGxldCBmID0gZmlyc3Q7IGxldCBsID0gbGFzdDsgbGV0IGUgPSBldmVuOyBsZXQgbyA9IG9kZDtcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgW25nU3R5bGVdPVwieydoZWlnaHQnOiBpdGVtU2l6ZSArICdweCd9XCIgY2xhc3M9XCJwLXZpcnR1YWxzY3JvbGxlci1pdGVtXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG5nLWNvbnRhaW5lciAqbmdUZW1wbGF0ZU91dGxldD1cIml0ZW0gPyBpdGVtVGVtcGxhdGUgOiBsb2FkaW5nSXRlbVRlbXBsYXRlOyBjb250ZXh0OiB7JGltcGxpY2l0OiBpdGVtLCBpbmRleDogaSwgY291bnQ6IGMsIGZpcnN0OiBmLCBsYXN0OiBsLCBldmVuOiBlLCBvZGQ6IG99XCI+PC9uZy1jb250YWluZXI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9uZy1jb250YWluZXI+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9jZGstdmlydHVhbC1zY3JvbGwtdmlld3BvcnQ+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwLXZpcnR1YWxzY3JvbGxlci1mb290ZXJcIiAqbmdJZj1cImZvb3RlciB8fCBmb290ZXJUZW1wbGF0ZVwiPlxyXG4gICAgICAgICAgICAgICAgPG5nLWNvbnRlbnQgc2VsZWN0PVwicC1mb290ZXJcIj48L25nLWNvbnRlbnQ+XHJcbiAgICAgICAgICAgICAgICA8bmctY29udGFpbmVyICpuZ1RlbXBsYXRlT3V0bGV0PVwiZm9vdGVyVGVtcGxhdGVcIj48L25nLWNvbnRhaW5lcj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICBgLFxyXG4gICAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5EZWZhdWx0LFxyXG4gICAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcclxuICAgIHN0eWxlVXJsczogWycuL3ZpcnR1YWxzY3JvbGxlci5jc3MnXVxyXG59KVxyXG5leHBvcnQgY2xhc3MgVmlydHVhbFNjcm9sbGVyIGltcGxlbWVudHMgQWZ0ZXJDb250ZW50SW5pdCxCbG9ja2FibGVVSSB7XHJcblxyXG4gICAgQElucHV0KCkgdmFsdWU6IGFueVtdO1xyXG5cclxuICAgIEBJbnB1dCgpIGl0ZW1TaXplOiBudW1iZXI7IFxyXG5cclxuICAgIEBJbnB1dCgpIHN0eWxlOiBhbnk7XHJcblxyXG4gICAgQElucHV0KCkgc3R5bGVDbGFzczogc3RyaW5nO1xyXG4gICAgXHJcbiAgICBASW5wdXQoKSBzY3JvbGxIZWlnaHQ6IGFueTtcclxuXHJcbiAgICBASW5wdXQoKSBsYXp5OiBib29sZWFuO1xyXG5cclxuICAgIEBJbnB1dCgpIHJvd3M6IG51bWJlcjtcclxuXHJcbiAgICBASW5wdXQoKSBtaW5CdWZmZXJQeDogbnVtYmVyO1xyXG5cclxuICAgIEBJbnB1dCgpIG1heEJ1ZmZlclB4OiBudW1iZXI7XHJcblxyXG4gICAgQElucHV0KCkgZGVsYXk6IG51bWJlciA9IDI1MDtcclxuICBcclxuICAgIEBJbnB1dCgpIHRyYWNrQnk6IEZ1bmN0aW9uID0gKGluZGV4OiBudW1iZXIsIGl0ZW06IGFueSkgPT4gaXRlbTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgQENvbnRlbnRDaGlsZChIZWFkZXIpIGhlYWRlcjogSGVhZGVyO1xyXG5cclxuICAgIEBDb250ZW50Q2hpbGQoRm9vdGVyKSBmb290ZXI6IEZvb3RlcjtcclxuICAgIFxyXG4gICAgQENvbnRlbnRDaGlsZHJlbihQcmltZVRlbXBsYXRlKSB0ZW1wbGF0ZXM6IFF1ZXJ5TGlzdDxhbnk+O1xyXG5cclxuICAgIEBWaWV3Q2hpbGQoQ2RrVmlydHVhbFNjcm9sbFZpZXdwb3J0KSB2aWV3cG9ydDogQ2RrVmlydHVhbFNjcm9sbFZpZXdwb3J0O1xyXG5cclxuICAgIEBPdXRwdXQoKSBvbkxhenlMb2FkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcclxuXHJcbiAgICBpdGVtVGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT47XHJcblxyXG4gICAgaGVhZGVyVGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT47XHJcblxyXG4gICAgZm9vdGVyVGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT47XHJcblxyXG4gICAgbG9hZGluZ0l0ZW1UZW1wbGF0ZTogVGVtcGxhdGVSZWY8YW55PjtcclxuXHJcbiAgICBfdG90YWxSZWNvcmRzOiBudW1iZXIgPSAwO1xyXG5cclxuICAgIHBhZ2U6IG51bWJlciA9IDA7XHJcblxyXG4gICAgX2ZpcnN0OiBudW1iZXIgPSAwO1xyXG5cclxuICAgIF9jYWNoZTogYm9vbGVhbjtcclxuXHJcbiAgICB2aXJ0dWFsU2Nyb2xsVGltZW91dDogYW55O1xyXG5cclxuICAgIHZpcnR1YWxQYWdlOiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IocHVibGljIGVsOiBFbGVtZW50UmVmKSB7fVxyXG5cclxuICAgIEBJbnB1dCgpIGdldCB0b3RhbFJlY29yZHMoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fdG90YWxSZWNvcmRzO1xyXG4gICAgfVxyXG4gICAgc2V0IHRvdGFsUmVjb3Jkcyh2YWw6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuX3RvdGFsUmVjb3JkcyA9IHZhbDtcclxuICAgICAgICBjb25zb2xlLmxvZyhcInRvdGFsUmVjb3JkcyBpcyBkZXByZWNhdGVkLCBwcm92aWRlIGEgdmFsdWUgd2l0aCB0aGUgbGVuZ3RoIG9mIHZpcnR1YWwgaXRlbXMgaW5zdGVhZC5cIik7XHJcbiAgICB9XHJcblxyXG4gICAgQElucHV0KCkgZ2V0IGZpcnN0KCk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZpcnN0O1xyXG4gICAgfVxyXG4gICAgc2V0IGZpcnN0KHZhbDpudW1iZXIpIHtcclxuICAgICAgICB0aGlzLl9maXJzdCA9IHZhbDtcclxuICAgICAgICBjb25zb2xlLmxvZyhcImZpcnN0IHByb3BlcnR5IGlzIGRlcHJlY2F0ZWQsIHVzZSBzY3JvbGxUb0luZGV4IGZ1bmN0aW9uIHRvIHNjcm9sbCBhIHNwZWNpZmljIGl0ZW0uXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIEBJbnB1dCgpIGdldCBjYWNoZSgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fY2FjaGU7XHJcbiAgICB9XHJcbiAgICBzZXQgY2FjaGUodmFsOiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5fY2FjaGUgPSB2YWw7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJjYWNoZSBpcyBkZXByZWNhdGVkIGFzIGl0IGlzIGFsd2F5cyBvbi5cIik7XHJcbiAgICB9XHJcblxyXG4gICAgbmdBZnRlckNvbnRlbnRJbml0KCkge1xyXG4gICAgICAgIHRoaXMudGVtcGxhdGVzLmZvckVhY2goKGl0ZW0pID0+IHtcclxuICAgICAgICAgICAgc3dpdGNoKGl0ZW0uZ2V0VHlwZSgpKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlICdpdGVtJzpcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLml0ZW1UZW1wbGF0ZSA9IGl0ZW0udGVtcGxhdGU7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgICAgICBjYXNlICdsb2FkaW5nSXRlbSc6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2FkaW5nSXRlbVRlbXBsYXRlID0gaXRlbS50ZW1wbGF0ZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgIGNhc2UgJ2hlYWRlcic6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5oZWFkZXJUZW1wbGF0ZSA9IGl0ZW0udGVtcGxhdGU7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgICAgICBjYXNlICdmb290ZXInOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZm9vdGVyVGVtcGxhdGUgPSBpdGVtLnRlbXBsYXRlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pdGVtVGVtcGxhdGUgPSBpdGVtLnRlbXBsYXRlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBvblNjcm9sbEluZGV4Q2hhbmdlKGluZGV4OiBudW1iZXIpIHtcclxuICAgICAgICBpZiAodGhpcy5sYXp5KSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnZpcnR1YWxTY3JvbGxUaW1lb3V0KSB7XHJcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy52aXJ0dWFsU2Nyb2xsVGltZW91dCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMudmlydHVhbFNjcm9sbFRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGxldCBwYWdlID0gTWF0aC5mbG9vcihpbmRleCAvIHRoaXMucm93cyk7XHJcbiAgICAgICAgICAgICAgICBsZXQgdmlydHVhbFNjcm9sbE9mZnNldCA9IHBhZ2UgPT09IDAgPyAwIDogKHBhZ2UgLSAxKSAqIHRoaXMucm93cztcclxuICAgICAgICAgICAgICAgIGxldCB2aXJ0dWFsU2Nyb2xsQ2h1bmtTaXplID0gcGFnZSA9PT0gMCA/IHRoaXMucm93cyAqIDIgOiB0aGlzLnJvd3MgKiAzO1xyXG4gIFxyXG4gICAgICAgICAgICAgICAgaWYgKHBhZ2UgIT09IHRoaXMudmlydHVhbFBhZ2UpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnZpcnR1YWxQYWdlID0gcGFnZTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uTGF6eUxvYWQuZW1pdCh7Zmlyc3Q6IHZpcnR1YWxTY3JvbGxPZmZzZXQsIHJvd3M6IHZpcnR1YWxTY3JvbGxDaHVua1NpemV9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgdGhpcy5kZWxheSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGdldEJsb2NrYWJsZUVsZW1lbnQoKTogSFRNTEVsZW1lbnTCoHtcclxuICAgICAgICByZXR1cm4gdGhpcy5lbC5uYXRpdmVFbGVtZW50LmNoaWxkcmVuWzBdO1xyXG4gICAgfVxyXG5cclxuICAgIC8vQGRlcHJlY2F0ZWRcclxuICAgIHNjcm9sbFRvKGluZGV4OiBudW1iZXIsIG1vZGU/OiBTY3JvbGxCZWhhdmlvcik6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuc2Nyb2xsVG9JbmRleChpbmRleCwgbW9kZSk7XHJcbiAgICB9XHJcblxyXG4gICAgc2Nyb2xsVG9JbmRleChpbmRleDogbnVtYmVyLCBtb2RlPzogU2Nyb2xsQmVoYXZpb3IpOiB2b2lkIHtcclxuICAgICAgICBpZiAodGhpcy52aWV3cG9ydCkge1xyXG4gICAgICAgICAgICB0aGlzLnZpZXdwb3J0LnNjcm9sbFRvSW5kZXgoaW5kZXgsIG1vZGUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuQE5nTW9kdWxlKHtcclxuICAgIGltcG9ydHM6IFtDb21tb25Nb2R1bGUsU2Nyb2xsaW5nTW9kdWxlXSxcclxuICAgIGV4cG9ydHM6IFtWaXJ0dWFsU2Nyb2xsZXIsU2hhcmVkTW9kdWxlLFNjcm9sbGluZ01vZHVsZV0sXHJcbiAgICBkZWNsYXJhdGlvbnM6IFtWaXJ0dWFsU2Nyb2xsZXJdXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBWaXJ0dWFsU2Nyb2xsZXJNb2R1bGUgeyB9XHJcblxyXG4iXX0=