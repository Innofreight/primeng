import { NgModule, Component, ChangeDetectionStrategy, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
export class Chip {
    constructor() {
        this.removeIcon = "pi pi-times-circle";
        this.onRemove = new EventEmitter();
        this.visible = true;
    }
    containerClass() {
        return {
            'p-chip p-component': true,
            'p-chip-image': this.image != null
        };
    }
    close(event) {
        this.visible = false;
        this.onRemove.emit(event);
    }
}
Chip.decorators = [
    { type: Component, args: [{
                selector: 'p-chip',
                template: `
        <div [ngClass]="containerClass()" [class]="styleClass" [ngStyle]="style" *ngIf="visible">
            <ng-content></ng-content>
            <img [src]="image" *ngIf="image;else iconTemplate">
            <ng-template #iconTemplate><span *ngIf="icon" [class]="icon" [ngClass]="'p-chip-icon'"></span></ng-template>
            <div class="p-chip-text" *ngIf="label">{{label}}</div>
            <span *ngIf="removable" tabindex="0" [class]="removeIcon" [ngClass]="'pi-chip-remove-icon'" (click)="close($event)" (keydown.enter)="close($event)"></span>
        </div>
    `,
                changeDetection: ChangeDetectionStrategy.OnPush,
                encapsulation: ViewEncapsulation.None,
                styles: [".p-chip{align-items:center;display:inline-flex}.p-chip-icon.pi,.p-chip-text{line-height:1.5}.pi-chip-remove-icon{cursor:pointer;line-height:1.5}.p-chip img{border-radius:50%}"]
            },] }
];
Chip.propDecorators = {
    label: [{ type: Input }],
    icon: [{ type: Input }],
    image: [{ type: Input }],
    style: [{ type: Input }],
    styleClass: [{ type: Input }],
    removable: [{ type: Input }],
    removeIcon: [{ type: Input }],
    onRemove: [{ type: Output }]
};
export class ChipModule {
}
ChipModule.decorators = [
    { type: NgModule, args: [{
                imports: [CommonModule],
                exports: [Chip],
                declarations: [Chip]
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hpcC5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8uLi9zcmMvYXBwL2NvbXBvbmVudHMvY2hpcC8iLCJzb3VyY2VzIjpbImNoaXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsdUJBQXVCLEVBQUUsaUJBQWlCLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDN0gsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBaUIvQyxNQUFNLE9BQU8sSUFBSTtJQWZqQjtRQTZCYSxlQUFVLEdBQVcsb0JBQW9CLENBQUM7UUFFekMsYUFBUSxHQUFzQixJQUFJLFlBQVksRUFBRSxDQUFDO1FBRTNELFlBQU8sR0FBWSxJQUFJLENBQUM7SUFhNUIsQ0FBQztJQVhHLGNBQWM7UUFDVixPQUFPO1lBQ0gsb0JBQW9CLEVBQUUsSUFBSTtZQUMxQixjQUFjLEVBQUUsSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJO1NBQ3JDLENBQUM7SUFDTixDQUFDO0lBRUQsS0FBSyxDQUFDLEtBQUs7UUFDUCxJQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztRQUNyQixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUM3QixDQUFDOzs7WUE3Q0osU0FBUyxTQUFDO2dCQUNQLFFBQVEsRUFBRSxRQUFRO2dCQUNsQixRQUFRLEVBQUU7Ozs7Ozs7O0tBUVQ7Z0JBQ0QsZUFBZSxFQUFFLHVCQUF1QixDQUFDLE1BQU07Z0JBQy9DLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJOzthQUV4Qzs7O29CQUdJLEtBQUs7bUJBRUwsS0FBSztvQkFFTCxLQUFLO29CQUVMLEtBQUs7eUJBRUwsS0FBSzt3QkFFTCxLQUFLO3lCQUVMLEtBQUs7dUJBRUwsTUFBTTs7QUFzQlgsTUFBTSxPQUFPLFVBQVU7OztZQUx0QixRQUFRLFNBQUM7Z0JBQ04sT0FBTyxFQUFFLENBQUMsWUFBWSxDQUFDO2dCQUN2QixPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUM7Z0JBQ2YsWUFBWSxFQUFFLENBQUMsSUFBSSxDQUFDO2FBQ3ZCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmdNb2R1bGUsIENvbXBvbmVudCwgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksIFZpZXdFbmNhcHN1bGF0aW9uLCBJbnB1dCwgT3V0cHV0LCBFdmVudEVtaXR0ZXIgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgQ29tbW9uTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcclxuXHJcbkBDb21wb25lbnQoe1xyXG4gICAgc2VsZWN0b3I6ICdwLWNoaXAnLFxyXG4gICAgdGVtcGxhdGU6IGBcclxuICAgICAgICA8ZGl2IFtuZ0NsYXNzXT1cImNvbnRhaW5lckNsYXNzKClcIiBbY2xhc3NdPVwic3R5bGVDbGFzc1wiIFtuZ1N0eWxlXT1cInN0eWxlXCIgKm5nSWY9XCJ2aXNpYmxlXCI+XHJcbiAgICAgICAgICAgIDxuZy1jb250ZW50PjwvbmctY29udGVudD5cclxuICAgICAgICAgICAgPGltZyBbc3JjXT1cImltYWdlXCIgKm5nSWY9XCJpbWFnZTtlbHNlIGljb25UZW1wbGF0ZVwiPlxyXG4gICAgICAgICAgICA8bmctdGVtcGxhdGUgI2ljb25UZW1wbGF0ZT48c3BhbiAqbmdJZj1cImljb25cIiBbY2xhc3NdPVwiaWNvblwiIFtuZ0NsYXNzXT1cIidwLWNoaXAtaWNvbidcIj48L3NwYW4+PC9uZy10ZW1wbGF0ZT5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInAtY2hpcC10ZXh0XCIgKm5nSWY9XCJsYWJlbFwiPnt7bGFiZWx9fTwvZGl2PlxyXG4gICAgICAgICAgICA8c3BhbiAqbmdJZj1cInJlbW92YWJsZVwiIHRhYmluZGV4PVwiMFwiIFtjbGFzc109XCJyZW1vdmVJY29uXCIgW25nQ2xhc3NdPVwiJ3BpLWNoaXAtcmVtb3ZlLWljb24nXCIgKGNsaWNrKT1cImNsb3NlKCRldmVudClcIiAoa2V5ZG93bi5lbnRlcik9XCJjbG9zZSgkZXZlbnQpXCI+PC9zcGFuPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgYCxcclxuICAgIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxyXG4gICAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcclxuICAgIHN0eWxlVXJsczogWycuL2NoaXAuY3NzJ11cclxufSlcclxuZXhwb3J0IGNsYXNzIENoaXAge1xyXG5cclxuICAgIEBJbnB1dCgpIGxhYmVsOiBzdHJpbmc7XHJcblxyXG4gICAgQElucHV0KCkgaWNvbjogc3RyaW5nO1xyXG5cclxuICAgIEBJbnB1dCgpIGltYWdlOiBzdHJpbmc7XHJcblxyXG4gICAgQElucHV0KCkgc3R5bGU6IGFueTtcclxuXHJcbiAgICBASW5wdXQoKSBzdHlsZUNsYXNzOiBzdHJpbmc7XHJcblxyXG4gICAgQElucHV0KCkgcmVtb3ZhYmxlOiBib29sZWFuO1xyXG5cclxuICAgIEBJbnB1dCgpIHJlbW92ZUljb246IHN0cmluZyA9IFwicGkgcGktdGltZXMtY2lyY2xlXCI7XHJcblxyXG4gICAgQE91dHB1dCgpIG9uUmVtb3ZlOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcclxuXHJcbiAgICB2aXNpYmxlOiBib29sZWFuID0gdHJ1ZTtcclxuXHJcbiAgICBjb250YWluZXJDbGFzcygpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAncC1jaGlwIHAtY29tcG9uZW50JzogdHJ1ZSxcclxuICAgICAgICAgICAgJ3AtY2hpcC1pbWFnZSc6IHRoaXMuaW1hZ2UgIT0gbnVsbFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgY2xvc2UoZXZlbnQpIHtcclxuICAgICAgICB0aGlzLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLm9uUmVtb3ZlLmVtaXQoZXZlbnQpXHJcbiAgICB9XHJcbn1cclxuXHJcbkBOZ01vZHVsZSh7XHJcbiAgICBpbXBvcnRzOiBbQ29tbW9uTW9kdWxlXSxcclxuICAgIGV4cG9ydHM6IFtDaGlwXSxcclxuICAgIGRlY2xhcmF0aW9uczogW0NoaXBdXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBDaGlwTW9kdWxlIHsgfVxyXG4iXX0=