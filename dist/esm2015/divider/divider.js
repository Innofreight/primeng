import { NgModule, Component, ChangeDetectionStrategy, ViewEncapsulation, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
export class Divider {
    constructor() {
        this.layout = "horizontal";
        this.type = "solid";
    }
    containerClass() {
        return {
            'p-divider p-component': true,
            'p-divider-horizontal': this.layout === "horizontal",
            'p-divider-vertical': this.layout === "vertical",
            'p-divider-solid': this.type === "solid",
            'p-divider-dashed': this.type === "dashed",
            'p-divider-dotted': this.type === "dotted",
            'p-divider-left': this.layout === 'horizontal' && (!this.align || this.align === 'left'),
            'p-divider-center': (this.layout === 'horizontal' && this.align === 'center') || (this.layout === 'vertical' && (!this.align || this.align === 'center')),
            'p-divider-right': this.layout === 'horizontal' && this.align === 'right',
            'p-divider-top': this.layout === 'vertical' && (this.align === 'top'),
            'p-divider-bottom': this.layout === 'vertical' && this.align === 'bottom'
        };
    }
}
Divider.decorators = [
    { type: Component, args: [{
                selector: 'p-divider',
                template: `
        <div [ngClass]="containerClass()" [class]="styleClass" [ngStyle]="style" role="separator">
            <div class="p-divider-content">
                <ng-content></ng-content>
            </div>
        </div>
    `,
                changeDetection: ChangeDetectionStrategy.OnPush,
                encapsulation: ViewEncapsulation.None,
                styles: [".p-divider-horizontal{align-items:center;display:flex;position:relative;width:100%}.p-divider-horizontal:before{content:\"\";display:block;left:0;position:absolute;top:50%;width:100%}.p-divider-horizontal.p-divider-left{justify-content:flex-start}.p-divider-horizontal.p-divider-right{justify-content:flex-end}.p-divider-horizontal.p-divider-center{justify-content:center}.p-divider-content{z-index:1}.p-divider-vertical{display:flex;justify-content:center;margin:0 1rem;min-height:100%;position:relative}.p-divider-vertical:before{content:\"\";display:block;height:100%;left:50%;position:absolute;top:0}.p-divider-vertical.p-divider-top{align-items:flex-start}.p-divider-vertical.p-divider-center{align-items:center}.p-divider-vertical.p-divider-bottom{align-items:flex-end}.p-divider-solid.p-divider-horizontal:before{border-top-style:solid}.p-divider-solid.p-divider-vertical:before{border-left-style:solid}.p-divider-dashed.p-divider-horizontal:before{border-top-style:dashed}.p-divider-dashed.p-divider-vertical:before{border-left-style:dashed}.p-divider-dotted.p-divider-horizontal:before{border-left-style:dotted;border-top-style:dotted}"]
            },] }
];
Divider.propDecorators = {
    styleClass: [{ type: Input }],
    style: [{ type: Input }],
    layout: [{ type: Input }],
    type: [{ type: Input }],
    align: [{ type: Input }]
};
export class DividerModule {
}
DividerModule.decorators = [
    { type: NgModule, args: [{
                imports: [CommonModule],
                exports: [Divider],
                declarations: [Divider]
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGl2aWRlci5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8uLi9zcmMvYXBwL2NvbXBvbmVudHMvZGl2aWRlci8iLCJzb3VyY2VzIjpbImRpdmlkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsdUJBQXVCLEVBQUUsaUJBQWlCLEVBQUUsS0FBSyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3RHLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQWUvQyxNQUFNLE9BQU8sT0FBTztJQWJwQjtRQW1CYSxXQUFNLEdBQVcsWUFBWSxDQUFDO1FBRTlCLFNBQUksR0FBVyxPQUFPLENBQUM7SUFxQnBDLENBQUM7SUFmRyxjQUFjO1FBQ1YsT0FBTztZQUNILHVCQUF1QixFQUFFLElBQUk7WUFDN0Isc0JBQXNCLEVBQUUsSUFBSSxDQUFDLE1BQU0sS0FBSyxZQUFZO1lBQ3BELG9CQUFvQixFQUFFLElBQUksQ0FBQyxNQUFNLEtBQUssVUFBVTtZQUNoRCxpQkFBaUIsRUFBRSxJQUFJLENBQUMsSUFBSSxLQUFLLE9BQU87WUFDeEMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLElBQUksS0FBSyxRQUFRO1lBQzFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxJQUFJLEtBQUssUUFBUTtZQUMxQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsTUFBTSxLQUFLLFlBQVksSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLE1BQU0sQ0FBQztZQUN4RixrQkFBa0IsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssWUFBWSxJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLFVBQVUsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLFFBQVEsQ0FBQyxDQUFDO1lBQ3pKLGlCQUFpQixFQUFFLElBQUksQ0FBQyxNQUFNLEtBQUssWUFBWSxJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssT0FBTztZQUN6RSxlQUFlLEVBQUUsSUFBSSxDQUFDLE1BQU0sS0FBSyxVQUFVLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxLQUFLLEtBQUssQ0FBQztZQUNyRSxrQkFBa0IsRUFBRSxJQUFJLENBQUMsTUFBTSxLQUFLLFVBQVUsSUFBSSxJQUFJLENBQUMsS0FBSyxLQUFLLFFBQVE7U0FDNUUsQ0FBQztJQUNOLENBQUM7OztZQXpDSixTQUFTLFNBQUM7Z0JBQ1AsUUFBUSxFQUFFLFdBQVc7Z0JBQ3JCLFFBQVEsRUFBRTs7Ozs7O0tBTVQ7Z0JBQ0QsZUFBZSxFQUFFLHVCQUF1QixDQUFDLE1BQU07Z0JBQy9DLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJOzthQUV4Qzs7O3lCQUdJLEtBQUs7b0JBRUwsS0FBSztxQkFFTCxLQUFLO21CQUVMLEtBQUs7b0JBRUwsS0FBSzs7QUEwQlYsTUFBTSxPQUFPLGFBQWE7OztZQUx6QixRQUFRLFNBQUM7Z0JBQ04sT0FBTyxFQUFFLENBQUMsWUFBWSxDQUFDO2dCQUN2QixPQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUM7Z0JBQ2xCLFlBQVksRUFBRSxDQUFDLE9BQU8sQ0FBQzthQUMxQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5nTW9kdWxlLCBDb21wb25lbnQsIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LCBWaWV3RW5jYXBzdWxhdGlvbiwgSW5wdXR9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBDb21tb25Nb2R1bGUgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xyXG5cclxuQENvbXBvbmVudCh7XHJcbiAgICBzZWxlY3RvcjogJ3AtZGl2aWRlcicsXHJcbiAgICB0ZW1wbGF0ZTogYFxyXG4gICAgICAgIDxkaXYgW25nQ2xhc3NdPVwiY29udGFpbmVyQ2xhc3MoKVwiIFtjbGFzc109XCJzdHlsZUNsYXNzXCIgW25nU3R5bGVdPVwic3R5bGVcIiByb2xlPVwic2VwYXJhdG9yXCI+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwLWRpdmlkZXItY29udGVudFwiPlxyXG4gICAgICAgICAgICAgICAgPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgIGAsXHJcbiAgICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcclxuICAgIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXHJcbiAgICBzdHlsZVVybHM6IFsnLi9kaXZpZGVyLmNzcyddXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBEaXZpZGVyIHtcclxuXHJcbiAgICBASW5wdXQoKSBzdHlsZUNsYXNzOiBzdHJpbmc7XHJcblxyXG4gICAgQElucHV0KCkgc3R5bGU6IGFueTtcclxuXHJcbiAgICBASW5wdXQoKSBsYXlvdXQ6IHN0cmluZyA9IFwiaG9yaXpvbnRhbFwiO1xyXG4gICAgXHJcbiAgICBASW5wdXQoKSB0eXBlOiBzdHJpbmcgPSBcInNvbGlkXCI7XHJcblxyXG4gICAgQElucHV0KCkgYWxpZ246IHN0cmluZztcclxuXHJcbiAgICBcclxuXHJcbiAgICBjb250YWluZXJDbGFzcygpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAncC1kaXZpZGVyIHAtY29tcG9uZW50JzogdHJ1ZSxcclxuICAgICAgICAgICAgJ3AtZGl2aWRlci1ob3Jpem9udGFsJzogdGhpcy5sYXlvdXQgPT09IFwiaG9yaXpvbnRhbFwiLFxyXG4gICAgICAgICAgICAncC1kaXZpZGVyLXZlcnRpY2FsJzogdGhpcy5sYXlvdXQgPT09IFwidmVydGljYWxcIixcclxuICAgICAgICAgICAgJ3AtZGl2aWRlci1zb2xpZCc6IHRoaXMudHlwZSA9PT0gXCJzb2xpZFwiLFxyXG4gICAgICAgICAgICAncC1kaXZpZGVyLWRhc2hlZCc6IHRoaXMudHlwZSA9PT0gXCJkYXNoZWRcIixcclxuICAgICAgICAgICAgJ3AtZGl2aWRlci1kb3R0ZWQnOiB0aGlzLnR5cGUgPT09IFwiZG90dGVkXCIsXHJcbiAgICAgICAgICAgICdwLWRpdmlkZXItbGVmdCc6IHRoaXMubGF5b3V0ID09PSAnaG9yaXpvbnRhbCcgJiYgKCF0aGlzLmFsaWduIHx8IHRoaXMuYWxpZ24gPT09ICdsZWZ0JyksXHJcbiAgICAgICAgICAgICdwLWRpdmlkZXItY2VudGVyJzogKHRoaXMubGF5b3V0ID09PSAnaG9yaXpvbnRhbCcgJiYgdGhpcy5hbGlnbiA9PT0gJ2NlbnRlcicpIHx8ICh0aGlzLmxheW91dCA9PT0gJ3ZlcnRpY2FsJyAmJiAoIXRoaXMuYWxpZ24gfHwgdGhpcy5hbGlnbiA9PT0gJ2NlbnRlcicpKSxcclxuICAgICAgICAgICAgJ3AtZGl2aWRlci1yaWdodCc6IHRoaXMubGF5b3V0ID09PSAnaG9yaXpvbnRhbCcgJiYgdGhpcy5hbGlnbiA9PT0gJ3JpZ2h0JyxcclxuICAgICAgICAgICAgJ3AtZGl2aWRlci10b3AnOiB0aGlzLmxheW91dCA9PT0gJ3ZlcnRpY2FsJyAmJiAodGhpcy5hbGlnbiA9PT0gJ3RvcCcpLFxyXG4gICAgICAgICAgICAncC1kaXZpZGVyLWJvdHRvbSc6IHRoaXMubGF5b3V0ID09PSAndmVydGljYWwnICYmIHRoaXMuYWxpZ24gPT09ICdib3R0b20nXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufVxyXG5cclxuQE5nTW9kdWxlKHtcclxuICAgIGltcG9ydHM6IFtDb21tb25Nb2R1bGVdLFxyXG4gICAgZXhwb3J0czogW0RpdmlkZXJdLFxyXG4gICAgZGVjbGFyYXRpb25zOiBbRGl2aWRlcl1cclxufSlcclxuZXhwb3J0IGNsYXNzIERpdmlkZXJNb2R1bGUgeyB9XHJcbiJdfQ==