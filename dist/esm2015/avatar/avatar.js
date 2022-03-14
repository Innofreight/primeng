import { NgModule, Component, ChangeDetectionStrategy, ViewEncapsulation, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
export class Avatar {
    constructor() {
        this.size = "normal";
        this.shape = "square";
    }
    containerClass() {
        return {
            'p-avatar p-component': true,
            'p-avatar-image': this.image != null,
            'p-avatar-circle': this.shape === 'circle',
            'p-avatar-lg': this.size === 'large',
            'p-avatar-xl': this.size === 'xlarge'
        };
    }
}
Avatar.decorators = [
    { type: Component, args: [{
                selector: 'p-avatar',
                template: `
        <div [ngClass]="containerClass()" [class]="styleClass" [ngStyle]="style">
            <ng-content></ng-content>
            <span class="p-avatar-text" *ngIf="label; else iconTemplate">{{label}}</span>
            <ng-template #iconTemplate><span [class]="icon" [ngClass]="'p-avatar-icon'" *ngIf="icon; else imageTemplate"></span></ng-template>
            <ng-template #imageTemplate><img [src]="image" *ngIf="image"></ng-template>
        </div>
    `,
                changeDetection: ChangeDetectionStrategy.OnPush,
                encapsulation: ViewEncapsulation.None,
                styles: [".p-avatar{align-items:center;display:inline-flex;font-size:1rem;height:2rem;justify-content:center;width:2rem}.p-avatar.p-avatar-image{background-color:transparent}.p-avatar.p-avatar-circle{border-radius:50%;overflow:hidden}.p-avatar .p-avatar-icon{font-size:1rem}.p-avatar img{height:100%;width:100%}"]
            },] }
];
Avatar.propDecorators = {
    label: [{ type: Input }],
    icon: [{ type: Input }],
    image: [{ type: Input }],
    size: [{ type: Input }],
    shape: [{ type: Input }],
    style: [{ type: Input }],
    styleClass: [{ type: Input }]
};
export class AvatarModule {
}
AvatarModule.decorators = [
    { type: NgModule, args: [{
                imports: [CommonModule],
                exports: [Avatar],
                declarations: [Avatar]
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXZhdGFyLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLy4uL3NyYy9hcHAvY29tcG9uZW50cy9hdmF0YXIvIiwic291cmNlcyI6WyJhdmF0YXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsdUJBQXVCLEVBQUUsaUJBQWlCLEVBQUUsS0FBSyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3ZHLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQWdCL0MsTUFBTSxPQUFPLE1BQU07SUFkbkI7UUFzQmEsU0FBSSxHQUFXLFFBQVEsQ0FBQztRQUV4QixVQUFLLEdBQVcsUUFBUSxDQUFDO0lBZXRDLENBQUM7SUFURyxjQUFjO1FBQ1YsT0FBTztZQUNILHNCQUFzQixFQUFFLElBQUk7WUFDNUIsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJO1lBQ3BDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxLQUFLLEtBQUssUUFBUTtZQUMxQyxhQUFhLEVBQUUsSUFBSSxDQUFDLElBQUksS0FBSyxPQUFPO1lBQ3BDLGFBQWEsRUFBRSxJQUFJLENBQUMsSUFBSSxLQUFLLFFBQVE7U0FDeEMsQ0FBQztJQUNOLENBQUM7OztZQXRDSixTQUFTLFNBQUM7Z0JBQ1AsUUFBUSxFQUFFLFVBQVU7Z0JBQ3BCLFFBQVEsRUFBRTs7Ozs7OztLQU9UO2dCQUNELGVBQWUsRUFBRSx1QkFBdUIsQ0FBQyxNQUFNO2dCQUMvQyxhQUFhLEVBQUUsaUJBQWlCLENBQUMsSUFBSTs7YUFFeEM7OztvQkFHSSxLQUFLO21CQUVMLEtBQUs7b0JBRUwsS0FBSzttQkFFTCxLQUFLO29CQUVMLEtBQUs7b0JBRUwsS0FBSzt5QkFFTCxLQUFLOztBQWtCVixNQUFNLE9BQU8sWUFBWTs7O1lBTHhCLFFBQVEsU0FBQztnQkFDTixPQUFPLEVBQUUsQ0FBQyxZQUFZLENBQUM7Z0JBQ3ZCLE9BQU8sRUFBRSxDQUFDLE1BQU0sQ0FBQztnQkFDakIsWUFBWSxFQUFFLENBQUMsTUFBTSxDQUFDO2FBQ3pCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmdNb2R1bGUsIENvbXBvbmVudCwgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksIFZpZXdFbmNhcHN1bGF0aW9uLCBJbnB1dCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBDb21tb25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xyXG5cclxuQENvbXBvbmVudCh7XHJcbiAgICBzZWxlY3RvcjogJ3AtYXZhdGFyJyxcclxuICAgIHRlbXBsYXRlOiBgXHJcbiAgICAgICAgPGRpdiBbbmdDbGFzc109XCJjb250YWluZXJDbGFzcygpXCIgW2NsYXNzXT1cInN0eWxlQ2xhc3NcIiBbbmdTdHlsZV09XCJzdHlsZVwiPlxyXG4gICAgICAgICAgICA8bmctY29udGVudD48L25nLWNvbnRlbnQ+XHJcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwicC1hdmF0YXItdGV4dFwiICpuZ0lmPVwibGFiZWw7IGVsc2UgaWNvblRlbXBsYXRlXCI+e3tsYWJlbH19PC9zcGFuPlxyXG4gICAgICAgICAgICA8bmctdGVtcGxhdGUgI2ljb25UZW1wbGF0ZT48c3BhbiBbY2xhc3NdPVwiaWNvblwiIFtuZ0NsYXNzXT1cIidwLWF2YXRhci1pY29uJ1wiICpuZ0lmPVwiaWNvbjsgZWxzZSBpbWFnZVRlbXBsYXRlXCI+PC9zcGFuPjwvbmctdGVtcGxhdGU+XHJcbiAgICAgICAgICAgIDxuZy10ZW1wbGF0ZSAjaW1hZ2VUZW1wbGF0ZT48aW1nIFtzcmNdPVwiaW1hZ2VcIiAqbmdJZj1cImltYWdlXCI+PC9uZy10ZW1wbGF0ZT5cclxuICAgICAgICA8L2Rpdj5cclxuICAgIGAsXHJcbiAgICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcclxuICAgIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXHJcbiAgICBzdHlsZVVybHM6IFsnLi9hdmF0YXIuY3NzJ11cclxufSlcclxuZXhwb3J0IGNsYXNzIEF2YXRhciB7XHJcblxyXG4gICAgQElucHV0KCkgbGFiZWw6IHN0cmluZztcclxuXHJcbiAgICBASW5wdXQoKSBpY29uOiBzdHJpbmc7XHJcblxyXG4gICAgQElucHV0KCkgaW1hZ2U6IHN0cmluZztcclxuXHJcbiAgICBASW5wdXQoKSBzaXplOiBzdHJpbmcgPSBcIm5vcm1hbFwiO1xyXG5cclxuICAgIEBJbnB1dCgpIHNoYXBlOiBzdHJpbmcgPSBcInNxdWFyZVwiO1xyXG5cclxuICAgIEBJbnB1dCgpIHN0eWxlOiBhbnk7XHJcblxyXG4gICAgQElucHV0KCkgc3R5bGVDbGFzczogc3RyaW5nO1xyXG5cclxuICAgIGNvbnRhaW5lckNsYXNzKCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICdwLWF2YXRhciBwLWNvbXBvbmVudCc6IHRydWUsXHJcbiAgICAgICAgICAgICdwLWF2YXRhci1pbWFnZSc6IHRoaXMuaW1hZ2UgIT0gbnVsbCxcclxuICAgICAgICAgICAgJ3AtYXZhdGFyLWNpcmNsZSc6IHRoaXMuc2hhcGUgPT09ICdjaXJjbGUnLFxyXG4gICAgICAgICAgICAncC1hdmF0YXItbGcnOiB0aGlzLnNpemUgPT09ICdsYXJnZScsXHJcbiAgICAgICAgICAgICdwLWF2YXRhci14bCc6IHRoaXMuc2l6ZSA9PT0gJ3hsYXJnZSdcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59XHJcblxyXG5ATmdNb2R1bGUoe1xyXG4gICAgaW1wb3J0czogW0NvbW1vbk1vZHVsZV0sXHJcbiAgICBleHBvcnRzOiBbQXZhdGFyXSxcclxuICAgIGRlY2xhcmF0aW9uczogW0F2YXRhcl1cclxufSlcclxuZXhwb3J0IGNsYXNzIEF2YXRhck1vZHVsZSB7IH1cclxuIl19