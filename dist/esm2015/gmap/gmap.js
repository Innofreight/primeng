import { NgModule, Component, ElementRef, Input, Output, EventEmitter, IterableDiffers, ChangeDetectorRef, NgZone, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
export class GMap {
    constructor(el, differs, cd, zone) {
        this.el = el;
        this.cd = cd;
        this.zone = zone;
        this.onMapClick = new EventEmitter();
        this.onOverlayClick = new EventEmitter();
        this.onOverlayDblClick = new EventEmitter();
        this.onOverlayDragStart = new EventEmitter();
        this.onOverlayDrag = new EventEmitter();
        this.onOverlayDragEnd = new EventEmitter();
        this.onMapReady = new EventEmitter();
        this.onMapDragEnd = new EventEmitter();
        this.onZoomChanged = new EventEmitter();
        this.differ = differs.find([]).create(null);
    }
    ngAfterViewChecked() {
        if (!this.map && this.el.nativeElement.offsetParent) {
            this.initialize();
        }
    }
    initialize() {
        this.map = new google.maps.Map(this.el.nativeElement.children[0], this.options);
        this.onMapReady.emit({
            map: this.map
        });
        if (this.overlays) {
            for (let overlay of this.overlays) {
                overlay.setMap(this.map);
                this.bindOverlayEvents(overlay);
            }
        }
        this.map.addListener('click', (event) => {
            this.zone.run(() => {
                this.onMapClick.emit(event);
            });
        });
        this.map.addListener('dragend', (event) => {
            this.zone.run(() => {
                this.onMapDragEnd.emit(event);
            });
        });
        this.map.addListener('zoom_changed', (event) => {
            this.zone.run(() => {
                this.onZoomChanged.emit(event);
            });
        });
    }
    bindOverlayEvents(overlay) {
        overlay.addListener('click', (event) => {
            this.zone.run(() => {
                this.onOverlayClick.emit({
                    originalEvent: event,
                    'overlay': overlay,
                    map: this.map
                });
            });
        });
        overlay.addListener('dblclick', (event) => {
            this.zone.run(() => {
                this.onOverlayDblClick.emit({
                    originalEvent: event,
                    'overlay': overlay,
                    map: this.map
                });
            });
        });
        if (overlay.getDraggable()) {
            this.bindDragEvents(overlay);
        }
    }
    ngDoCheck() {
        let changes = this.differ.diff(this.overlays);
        if (changes && this.map) {
            changes.forEachRemovedItem((record) => {
                google.maps.event.clearInstanceListeners(record.item);
                record.item.setMap(null);
            });
            changes.forEachAddedItem((record) => {
                record.item.setMap(this.map);
                record.item.addListener('click', (event) => {
                    this.zone.run(() => {
                        this.onOverlayClick.emit({
                            originalEvent: event,
                            overlay: record.item,
                            map: this.map
                        });
                    });
                });
                if (record.item.getDraggable()) {
                    this.bindDragEvents(record.item);
                }
            });
        }
    }
    bindDragEvents(overlay) {
        overlay.addListener('dragstart', (event) => {
            this.zone.run(() => {
                this.onOverlayDragStart.emit({
                    originalEvent: event,
                    overlay: overlay,
                    map: this.map
                });
            });
        });
        overlay.addListener('drag', (event) => {
            this.zone.run(() => {
                this.onOverlayDrag.emit({
                    originalEvent: event,
                    overlay: overlay,
                    map: this.map
                });
            });
        });
        overlay.addListener('dragend', (event) => {
            this.zone.run(() => {
                this.onOverlayDragEnd.emit({
                    originalEvent: event,
                    overlay: overlay,
                    map: this.map
                });
            });
        });
    }
    getMap() {
        return this.map;
    }
}
GMap.decorators = [
    { type: Component, args: [{
                selector: 'p-gmap',
                template: `<div [ngStyle]="style" [class]="styleClass"></div>`,
                changeDetection: ChangeDetectionStrategy.OnPush,
                encapsulation: ViewEncapsulation.None
            },] }
];
GMap.ctorParameters = () => [
    { type: ElementRef },
    { type: IterableDiffers },
    { type: ChangeDetectorRef },
    { type: NgZone }
];
GMap.propDecorators = {
    style: [{ type: Input }],
    styleClass: [{ type: Input }],
    options: [{ type: Input }],
    overlays: [{ type: Input }],
    onMapClick: [{ type: Output }],
    onOverlayClick: [{ type: Output }],
    onOverlayDblClick: [{ type: Output }],
    onOverlayDragStart: [{ type: Output }],
    onOverlayDrag: [{ type: Output }],
    onOverlayDragEnd: [{ type: Output }],
    onMapReady: [{ type: Output }],
    onMapDragEnd: [{ type: Output }],
    onZoomChanged: [{ type: Output }]
};
export class GMapModule {
}
GMapModule.decorators = [
    { type: NgModule, args: [{
                imports: [CommonModule],
                exports: [GMap],
                declarations: [GMap]
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ21hcC5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8uLi9zcmMvYXBwL2NvbXBvbmVudHMvZ21hcC8iLCJzb3VyY2VzIjpbImdtYXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFFBQVEsRUFBQyxTQUFTLEVBQUMsVUFBVSxFQUEwQixLQUFLLEVBQUMsTUFBTSxFQUFDLFlBQVksRUFBQyxlQUFlLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxFQUFDLHVCQUF1QixFQUFFLGlCQUFpQixFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ25NLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQVU3QyxNQUFNLE9BQU8sSUFBSTtJQWdDYixZQUFtQixFQUFjLEVBQUMsT0FBd0IsRUFBUyxFQUFxQixFQUFTLElBQVc7UUFBekYsT0FBRSxHQUFGLEVBQUUsQ0FBWTtRQUFrQyxPQUFFLEdBQUYsRUFBRSxDQUFtQjtRQUFTLFNBQUksR0FBSixJQUFJLENBQU87UUF0QmxHLGVBQVUsR0FBc0IsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUVuRCxtQkFBYyxHQUFzQixJQUFJLFlBQVksRUFBRSxDQUFDO1FBRXZELHNCQUFpQixHQUFzQixJQUFJLFlBQVksRUFBRSxDQUFDO1FBRTFELHVCQUFrQixHQUFzQixJQUFJLFlBQVksRUFBRSxDQUFDO1FBRTNELGtCQUFhLEdBQXNCLElBQUksWUFBWSxFQUFFLENBQUM7UUFFdEQscUJBQWdCLEdBQXNCLElBQUksWUFBWSxFQUFFLENBQUM7UUFFekQsZUFBVSxHQUFzQixJQUFJLFlBQVksRUFBRSxDQUFDO1FBRW5ELGlCQUFZLEdBQXNCLElBQUksWUFBWSxFQUFFLENBQUM7UUFFckQsa0JBQWEsR0FBc0IsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQU81RCxJQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2hELENB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UyxTQUFDO2dCQUNQLFFBQVEsRUFBRSxRQUFRO2dCQUNsQixRQUFRLEVBQUUsb0RBQW9EO2dCQUM5RCxlQUFlLEVBQUUsdUJBQXVCLENBQUMsTUFBTTtnQkFDL0MsYUFBYSxFQUFFLGlCQUFpQixDQUFDLElBQUk7YUFDeEM7OztZQVYwQixVQUFVO1lBQW9ELGVBQWU7WUFBQyxpQkFBaUI7WUFBQyxNQUFNOzs7b0JBYTVILEtBQUs7eUJBRUwsS0FBSztzQkFFTCxLQUFLO3VCQUVMLEtBQUs7eUJBRUwsTUFBTTs2QkFFTixNQUFNO2dDQUVOLE1BQU07aUNBRU4sTUFBTTs0QkFFTixNQUFNOytCQUVOLE1BQU07eUJBRU4sTUFBTTsyQkFFTixNQUFNOzRCQUVOLE1BQU07O0FBZ0pYLE1BQU0sT0FBTyxVQUFVOzs7WUFMdEIsUUFBUSxTQUFDO2dCQUNOLE9BQU8sRUFBRSxDQUFDLFlBQVksQ0FBQztnQkFDdkIsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDO2dCQUNmLFlBQVksRUFBRSxDQUFDLElBQUksQ0FBQzthQUN2QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TmdNb2R1bGUsQ29tcG9uZW50LEVsZW1lbnRSZWYsQWZ0ZXJWaWV3Q2hlY2tlZCxEb0NoZWNrLElucHV0LE91dHB1dCxFdmVudEVtaXR0ZXIsSXRlcmFibGVEaWZmZXJzLENoYW5nZURldGVjdG9yUmVmLE5nWm9uZSxDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSwgVmlld0VuY2Fwc3VsYXRpb259IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQge0NvbW1vbk1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcclxuXHJcbmRlY2xhcmUgdmFyIGdvb2dsZTogYW55O1xyXG5cclxuQENvbXBvbmVudCh7XHJcbiAgICBzZWxlY3RvcjogJ3AtZ21hcCcsXHJcbiAgICB0ZW1wbGF0ZTogYDxkaXYgW25nU3R5bGVdPVwic3R5bGVcIiBbY2xhc3NdPVwic3R5bGVDbGFzc1wiPjwvZGl2PmAsXHJcbiAgICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcclxuICAgIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmVcclxufSlcclxuZXhwb3J0IGNsYXNzIEdNYXAgaW1wbGVtZW50cyBBZnRlclZpZXdDaGVja2VkLERvQ2hlY2sge1xyXG5cclxuICAgIEBJbnB1dCgpIHN0eWxlOiBhbnk7XHJcbiAgICAgICAgXHJcbiAgICBASW5wdXQoKSBzdHlsZUNsYXNzOiBzdHJpbmc7XHJcbiAgICBcclxuICAgIEBJbnB1dCgpIG9wdGlvbnM6IGFueTtcclxuICAgIFxyXG4gICAgQElucHV0KCkgb3ZlcmxheXM6IGFueVtdO1xyXG4gICAgXHJcbiAgICBAT3V0cHV0KCkgb25NYXBDbGljazogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XHJcbiAgICBcclxuICAgIEBPdXRwdXQoKSBvbk92ZXJsYXlDbGljazogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XHJcblxyXG4gICAgQE91dHB1dCgpIG9uT3ZlcmxheURibENsaWNrOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcclxuICAgIFxyXG4gICAgQE91dHB1dCgpIG9uT3ZlcmxheURyYWdTdGFydDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XHJcbiAgICBcclxuICAgIEBPdXRwdXQoKSBvbk92ZXJsYXlEcmFnOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcclxuICAgIFxyXG4gICAgQE91dHB1dCgpIG9uT3ZlcmxheURyYWdFbmQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG4gICAgXHJcbiAgICBAT3V0cHV0KCkgb25NYXBSZWFkeTogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XHJcblxyXG4gICAgQE91dHB1dCgpIG9uTWFwRHJhZ0VuZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XHJcbiAgIFxyXG4gICAgQE91dHB1dCgpIG9uWm9vbUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG5cclxuICAgIGRpZmZlcjogYW55O1xyXG4gICAgXHJcbiAgICBtYXA6IGFueTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgZWw6IEVsZW1lbnRSZWYsZGlmZmVyczogSXRlcmFibGVEaWZmZXJzLCBwdWJsaWMgY2Q6IENoYW5nZURldGVjdG9yUmVmLCBwdWJsaWMgem9uZTpOZ1pvbmUpIHtcclxuICAgICAgICB0aGlzLmRpZmZlciA9IGRpZmZlcnMuZmluZChbXSkuY3JlYXRlKG51bGwpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBuZ0FmdGVyVmlld0NoZWNrZWQoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLm1hcCAmJiB0aGlzLmVsLm5hdGl2ZUVsZW1lbnQub2Zmc2V0UGFyZW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5pdGlhbGl6ZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIFxyXG4gICAgaW5pdGlhbGl6ZSgpIHtcclxuICAgICAgICB0aGlzLm1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAodGhpcy5lbC5uYXRpdmVFbGVtZW50LmNoaWxkcmVuWzBdLCB0aGlzLm9wdGlvbnMpO1xyXG4gICAgICAgIHRoaXMub25NYXBSZWFkeS5lbWl0KHtcclxuICAgICAgICAgICAgbWFwOiB0aGlzLm1hcFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICh0aGlzLm92ZXJsYXlzKSB7XHJcbiAgICAgICAgICAgIGZvcihsZXQgb3ZlcmxheSBvZiB0aGlzLm92ZXJsYXlzKSB7XHJcbiAgICAgICAgICAgICAgICBvdmVybGF5LnNldE1hcCh0aGlzLm1hcCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJpbmRPdmVybGF5RXZlbnRzKG92ZXJsYXkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHRoaXMubWFwLmFkZExpc3RlbmVyKCdjbGljaycsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnpvbmUucnVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMub25NYXBDbGljay5lbWl0KGV2ZW50KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMubWFwLmFkZExpc3RlbmVyKCdkcmFnZW5kJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuem9uZS5ydW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vbk1hcERyYWdFbmQuZW1pdChldmVudCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB0aGlzLm1hcC5hZGRMaXN0ZW5lcignem9vbV9jaGFuZ2VkJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuem9uZS5ydW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vblpvb21DaGFuZ2VkLmVtaXQoZXZlbnQpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgYmluZE92ZXJsYXlFdmVudHMob3ZlcmxheTogYW55KSB7XHJcbiAgICAgICAgb3ZlcmxheS5hZGRMaXN0ZW5lcignY2xpY2snLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgdGhpcy56b25lLnJ1bigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9uT3ZlcmxheUNsaWNrLmVtaXQoe1xyXG4gICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsRXZlbnQ6IGV2ZW50LFxyXG4gICAgICAgICAgICAgICAgICAgICdvdmVybGF5Jzogb3ZlcmxheSxcclxuICAgICAgICAgICAgICAgICAgICBtYXA6IHRoaXMubWFwXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIG92ZXJsYXkuYWRkTGlzdGVuZXIoJ2RibGNsaWNrJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuem9uZS5ydW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vbk92ZXJsYXlEYmxDbGljay5lbWl0KHtcclxuICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbEV2ZW50OiBldmVudCxcclxuICAgICAgICAgICAgICAgICAgICAnb3ZlcmxheSc6IG92ZXJsYXksXHJcbiAgICAgICAgICAgICAgICAgICAgbWFwOiB0aGlzLm1hcFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmIChvdmVybGF5LmdldERyYWdnYWJsZSgpKSB7XHJcbiAgICAgICAgICAgIHRoaXMuYmluZERyYWdFdmVudHMob3ZlcmxheSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBuZ0RvQ2hlY2soKSB7XHJcbiAgICAgICAgbGV0IGNoYW5nZXMgPSB0aGlzLmRpZmZlci5kaWZmKHRoaXMub3ZlcmxheXMpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmIChjaGFuZ2VzICYmIHRoaXMubWFwKSB7XHJcbiAgICAgICAgICAgIGNoYW5nZXMuZm9yRWFjaFJlbW92ZWRJdGVtKChyZWNvcmQpID0+IHtcclxuICAgICAgICAgICAgICAgIGdvb2dsZS5tYXBzLmV2ZW50LmNsZWFySW5zdGFuY2VMaXN0ZW5lcnMocmVjb3JkLml0ZW0pO1xyXG4gICAgICAgICAgICAgICAgcmVjb3JkLml0ZW0uc2V0TWFwKG51bGwpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGNoYW5nZXMuZm9yRWFjaEFkZGVkSXRlbSgocmVjb3JkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZWNvcmQuaXRlbS5zZXRNYXAodGhpcy5tYXApO1xyXG4gICAgICAgICAgICAgICAgcmVjb3JkLml0ZW0uYWRkTGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy56b25lLnJ1bigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25PdmVybGF5Q2xpY2suZW1pdCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbEV2ZW50OiBldmVudCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG92ZXJsYXk6IHJlY29yZC5pdGVtLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFwOiB0aGlzLm1hcFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBpZiAocmVjb3JkLml0ZW0uZ2V0RHJhZ2dhYmxlKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmJpbmREcmFnRXZlbnRzKHJlY29yZC5pdGVtKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBiaW5kRHJhZ0V2ZW50cyhvdmVybGF5KSB7XHJcbiAgICAgICAgb3ZlcmxheS5hZGRMaXN0ZW5lcignZHJhZ3N0YXJ0JywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuem9uZS5ydW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vbk92ZXJsYXlEcmFnU3RhcnQuZW1pdCh7XHJcbiAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWxFdmVudDogZXZlbnQsXHJcbiAgICAgICAgICAgICAgICAgICAgb3ZlcmxheTogb3ZlcmxheSxcclxuICAgICAgICAgICAgICAgICAgICBtYXA6IHRoaXMubWFwXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgb3ZlcmxheS5hZGRMaXN0ZW5lcignZHJhZycsIChldmVudCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnpvbmUucnVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMub25PdmVybGF5RHJhZy5lbWl0KHtcclxuICAgICAgICAgICAgICAgICAgICBvcmlnaW5hbEV2ZW50OiBldmVudCxcclxuICAgICAgICAgICAgICAgICAgICBvdmVybGF5OiBvdmVybGF5LFxyXG4gICAgICAgICAgICAgICAgICAgIG1hcDogdGhpcy5tYXBcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBcclxuICAgICAgICBvdmVybGF5LmFkZExpc3RlbmVyKCdkcmFnZW5kJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuem9uZS5ydW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vbk92ZXJsYXlEcmFnRW5kLmVtaXQoe1xyXG4gICAgICAgICAgICAgICAgICAgIG9yaWdpbmFsRXZlbnQ6IGV2ZW50LFxyXG4gICAgICAgICAgICAgICAgICAgIG92ZXJsYXk6IG92ZXJsYXksXHJcbiAgICAgICAgICAgICAgICAgICAgbWFwOiB0aGlzLm1hcFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBnZXRNYXAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWFwO1xyXG4gICAgfVxyXG59XHJcblxyXG5ATmdNb2R1bGUoe1xyXG4gICAgaW1wb3J0czogW0NvbW1vbk1vZHVsZV0sXHJcbiAgICBleHBvcnRzOiBbR01hcF0sXHJcbiAgICBkZWNsYXJhdGlvbnM6IFtHTWFwXVxyXG59KVxyXG5leHBvcnQgY2xhc3MgR01hcE1vZHVsZSB7IH0iXX0=