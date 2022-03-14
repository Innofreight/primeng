import { NgModule, Component, ChangeDetectionStrategy, ViewEncapsulation, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
export class AvatarGroup {
}
AvatarGroup.decorators = [
    { type: Component, args: [{
                selector: 'p-avatarGroup',
                template: `
        <div [ngClass]="'p-avatar-group p-component'" [class]="styleClass" [ngStyle]="style">
            <ng-content></ng-content>
        </div>
    `,
                changeDetection: ChangeDetectionStrategy.OnPush,
                encapsulation: ViewEncapsulation.None,
                styles: [".p-avatar-group p-avatar+p-avatar{margin-left:-1rem}.p-avatar-group{align-items:center;display:flex}"]
            },] }
];
AvatarGroup.propDecorators = {
    styleClass: [{ type: Input }],
    style: [{ type: Input }]
};
export class AvatarGroupModule {
}
AvatarGroupModule.decorators = [
    { type: NgModule, args: [{
                imports: [CommonModule],
                exports: [AvatarGroup],
                declarations: [AvatarGroup]
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXZhdGFyZ3JvdXAuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4vc3JjL2FwcC9jb21wb25lbnRzL2F2YXRhcmdyb3VwLyIsInNvdXJjZXMiOlsiYXZhdGFyZ3JvdXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsdUJBQXVCLEVBQUUsaUJBQWlCLEVBQUUsS0FBSyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3ZHLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQWEvQyxNQUFNLE9BQU8sV0FBVzs7O1lBWHZCLFNBQVMsU0FBQztnQkFDUCxRQUFRLEVBQUUsZUFBZTtnQkFDekIsUUFBUSxFQUFFOzs7O0tBSVQ7Z0JBQ0QsZUFBZSxFQUFFLHVCQUF1QixDQUFDLE1BQU07Z0JBQy9DLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJOzthQUV4Qzs7O3lCQUdJLEtBQUs7b0JBRUwsS0FBSzs7QUFRVixNQUFNLE9BQU8saUJBQWlCOzs7WUFMN0IsUUFBUSxTQUFDO2dCQUNOLE9BQU8sRUFBRSxDQUFDLFlBQVksQ0FBQztnQkFDdkIsT0FBTyxFQUFFLENBQUMsV0FBVyxDQUFDO2dCQUN0QixZQUFZLEVBQUUsQ0FBQyxXQUFXLENBQUM7YUFDOUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZ01vZHVsZSwgQ29tcG9uZW50LCBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSwgVmlld0VuY2Fwc3VsYXRpb24sIElucHV0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IENvbW1vbk1vZHVsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XHJcblxyXG5AQ29tcG9uZW50KHtcclxuICAgIHNlbGVjdG9yOiAncC1hdmF0YXJHcm91cCcsXHJcbiAgICB0ZW1wbGF0ZTogYFxyXG4gICAgICAgIDxkaXYgW25nQ2xhc3NdPVwiJ3AtYXZhdGFyLWdyb3VwIHAtY29tcG9uZW50J1wiIFtjbGFzc109XCJzdHlsZUNsYXNzXCIgW25nU3R5bGVdPVwic3R5bGVcIj5cclxuICAgICAgICAgICAgPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgYCxcclxuICAgIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxyXG4gICAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcclxuICAgIHN0eWxlVXJsczogWycuL2F2YXRhcmdyb3VwLmNzcyddXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBBdmF0YXJHcm91cCB7XHJcblxyXG4gICAgQElucHV0KCkgc3R5bGVDbGFzczogc3RyaW5nO1xyXG4gICAgXHJcbiAgICBASW5wdXQoKSBzdHlsZTogYW55O1xyXG59XHJcblxyXG5ATmdNb2R1bGUoe1xyXG4gICAgaW1wb3J0czogW0NvbW1vbk1vZHVsZV0sXHJcbiAgICBleHBvcnRzOiBbQXZhdGFyR3JvdXBdLFxyXG4gICAgZGVjbGFyYXRpb25zOiBbQXZhdGFyR3JvdXBdXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBBdmF0YXJHcm91cE1vZHVsZSB7IH1cclxuIl19