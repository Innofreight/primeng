import { NgModule, Component, ChangeDetectionStrategy, ViewEncapsulation, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
export class Tag {
    containerClass() {
        return {
            'p-tag p-component': true,
            'p-tag-info': this.severity === 'info',
            'p-tag-success': this.severity === 'success',
            'p-tag-warning': this.severity === 'warning',
            'p-tag-danger': this.severity === 'danger',
            'p-tag-rounded': this.rounded
        };
    }
}
Tag.decorators = [
    { type: Component, args: [{
                selector: 'p-tag',
                template: `
        <span [ngClass]="containerClass()" [class]="styleClass" [ngStyle]="style">
            <ng-content></ng-content>
            <span class="p-tag-icon" [ngClass]="icon" *ngIf="icon"></span>
            <span class="p-tag-value">{{value}}</span>
        </span>
    `,
                changeDetection: ChangeDetectionStrategy.OnPush,
                encapsulation: ViewEncapsulation.None,
                styles: [".p-tag{align-items:center;display:inline-flex;justify-content:center}.p-tag-icon,.p-tag-icon.pi,.p-tag-value{line-height:1.5}.p-tag.p-tag-rounded{border-radius:10rem}"]
            },] }
];
Tag.propDecorators = {
    styleClass: [{ type: Input }],
    style: [{ type: Input }],
    severity: [{ type: Input }],
    value: [{ type: Input }],
    icon: [{ type: Input }],
    rounded: [{ type: Input }]
};
export class TagModule {
}
TagModule.decorators = [
    { type: NgModule, args: [{
                imports: [CommonModule],
                exports: [Tag],
                declarations: [Tag]
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFnLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLy4uL3NyYy9hcHAvY29tcG9uZW50cy90YWcvIiwic291cmNlcyI6WyJ0YWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsdUJBQXVCLEVBQUUsaUJBQWlCLEVBQUUsS0FBSyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3RHLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQWUvQyxNQUFNLE9BQU8sR0FBRztJQWVaLGNBQWM7UUFDVixPQUFPO1lBQ0gsbUJBQW1CLEVBQUUsSUFBSTtZQUN6QixZQUFZLEVBQUUsSUFBSSxDQUFDLFFBQVEsS0FBSyxNQUFNO1lBQ3RDLGVBQWUsRUFBRSxJQUFJLENBQUMsUUFBUSxLQUFLLFNBQVM7WUFDNUMsZUFBZSxFQUFFLElBQUksQ0FBQyxRQUFRLEtBQUssU0FBUztZQUM1QyxjQUFjLEVBQUUsSUFBSSxDQUFDLFFBQVEsS0FBSyxRQUFRO1lBQzFDLGVBQWUsRUFBRSxJQUFJLENBQUMsT0FBTztTQUNoQyxDQUFDO0lBQ04sQ0FBQzs7O1lBckNKLFNBQVMsU0FBQztnQkFDUCxRQUFRLEVBQUUsT0FBTztnQkFDakIsUUFBUSxFQUFFOzs7Ozs7S0FNVDtnQkFDRCxlQUFlLEVBQUUsdUJBQXVCLENBQUMsTUFBTTtnQkFDL0MsYUFBYSxFQUFFLGlCQUFpQixDQUFDLElBQUk7O2FBRXhDOzs7eUJBR0ksS0FBSztvQkFFTCxLQUFLO3VCQUVMLEtBQUs7b0JBRUwsS0FBSzttQkFFTCxLQUFLO3NCQUVMLEtBQUs7O0FBb0JWLE1BQU0sT0FBTyxTQUFTOzs7WUFMckIsUUFBUSxTQUFDO2dCQUNOLE9BQU8sRUFBRSxDQUFDLFlBQVksQ0FBQztnQkFDdkIsT0FBTyxFQUFFLENBQUMsR0FBRyxDQUFDO2dCQUNkLFlBQVksRUFBRSxDQUFDLEdBQUcsQ0FBQzthQUN0QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5nTW9kdWxlLCBDb21wb25lbnQsIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LCBWaWV3RW5jYXBzdWxhdGlvbiwgSW5wdXR9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBDb21tb25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xyXG5cclxuQENvbXBvbmVudCh7XHJcbiAgICBzZWxlY3RvcjogJ3AtdGFnJyxcclxuICAgIHRlbXBsYXRlOiBgXHJcbiAgICAgICAgPHNwYW4gW25nQ2xhc3NdPVwiY29udGFpbmVyQ2xhc3MoKVwiIFtjbGFzc109XCJzdHlsZUNsYXNzXCIgW25nU3R5bGVdPVwic3R5bGVcIj5cclxuICAgICAgICAgICAgPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PlxyXG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cInAtdGFnLWljb25cIiBbbmdDbGFzc109XCJpY29uXCIgKm5nSWY9XCJpY29uXCI+PC9zcGFuPlxyXG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cInAtdGFnLXZhbHVlXCI+e3t2YWx1ZX19PC9zcGFuPlxyXG4gICAgICAgIDwvc3Bhbj5cclxuICAgIGAsXHJcbiAgICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcclxuICAgIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXHJcbiAgICBzdHlsZVVybHM6IFsnLi90YWcuY3NzJ11cclxufSlcclxuZXhwb3J0IGNsYXNzIFRhZyB7XHJcblxyXG4gICAgQElucHV0KCkgc3R5bGVDbGFzczogc3RyaW5nO1xyXG5cclxuICAgIEBJbnB1dCgpIHN0eWxlOiBhbnk7XHJcblxyXG4gICAgQElucHV0KCkgc2V2ZXJpdHk6IHN0cmluZztcclxuICAgIFxyXG4gICAgQElucHV0KCkgdmFsdWU6IHN0cmluZztcclxuXHJcbiAgICBASW5wdXQoKSBpY29uOiBzdHJpbmc7XHJcblxyXG4gICAgQElucHV0KCkgcm91bmRlZDogYm9vbGVhbjtcclxuICAgIFxyXG5cclxuICAgIGNvbnRhaW5lckNsYXNzKCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICdwLXRhZyBwLWNvbXBvbmVudCc6IHRydWUsXHJcbiAgICAgICAgICAgICdwLXRhZy1pbmZvJzogdGhpcy5zZXZlcml0eSA9PT0gJ2luZm8nLFxyXG4gICAgICAgICAgICAncC10YWctc3VjY2Vzcyc6IHRoaXMuc2V2ZXJpdHkgPT09ICdzdWNjZXNzJyxcclxuICAgICAgICAgICAgJ3AtdGFnLXdhcm5pbmcnOiB0aGlzLnNldmVyaXR5ID09PSAnd2FybmluZycsXHJcbiAgICAgICAgICAgICdwLXRhZy1kYW5nZXInOiB0aGlzLnNldmVyaXR5ID09PSAnZGFuZ2VyJyxcclxuICAgICAgICAgICAgJ3AtdGFnLXJvdW5kZWQnOiB0aGlzLnJvdW5kZWRcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59XHJcblxyXG5ATmdNb2R1bGUoe1xyXG4gICAgaW1wb3J0czogW0NvbW1vbk1vZHVsZV0sXHJcbiAgICBleHBvcnRzOiBbVGFnXSxcclxuICAgIGRlY2xhcmF0aW9uczogW1RhZ11cclxufSlcclxuZXhwb3J0IGNsYXNzIFRhZ01vZHVsZSB7IH1cclxuIl19