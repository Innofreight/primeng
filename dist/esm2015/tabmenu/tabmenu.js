import { NgModule, Component, Input, ContentChildren, ChangeDetectionStrategy, ViewEncapsulation, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RippleModule } from 'primeng/ripple';
import { PrimeTemplate, SharedModule } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { DomHandler } from 'primeng/dom';
export class TabMenu {
    ngAfterContentInit() {
        this.templates.forEach((item) => {
            switch (item.getType()) {
                case 'item':
                    this.itemTemplate = item.template;
                    break;
                default:
                    this.itemTemplate = item.template;
                    break;
            }
        });
    }
    ngAfterViewInit() {
        this.updateInkBar();
    }
    ngAfterViewChecked() {
        if (this.tabChanged) {
            this.updateInkBar();
            this.tabChanged = false;
        }
    }
    itemClick(event, item) {
        if (item.disabled) {
            event.preventDefault();
            return;
        }
        if (item.command) {
            item.command({
                originalEvent: event,
                item: item
            });
        }
        this.activeItem = item;
        this.tabChanged = true;
    }
    updateInkBar() {
        let tabHeader = DomHandler.findSingle(this.navbar.nativeElement, 'li.p-highlight');
        if (tabHeader) {
            this.inkbar.nativeElement.style.width = DomHandler.getWidth(tabHeader) + 'px';
            this.inkbar.nativeElement.style.left = DomHandler.getOffset(tabHeader).left - DomHandler.getOffset(this.navbar.nativeElement).left + 'px';
        }
    }
}
TabMenu.decorators = [
    { type: Component, args: [{
                selector: 'p-tabMenu',
                template: `
        <div [ngClass]="'p-tabmenu p-component'" [ngStyle]="style" [class]="styleClass">
            <ul #navbar class="p-tabmenu-nav p-reset" role="tablist">
                <li *ngFor="let item of model; let i = index" role="tab" [ngStyle]="item.style" [class]="item.styleClass" [attr.aria-selected]="activeItem==item" [attr.aria-expanded]="activeItem==item"
                    [ngClass]="{'p-tabmenuitem':true,'p-disabled':item.disabled,'p-highlight':activeItem==item,'p-hidden': item.visible === false}">
                    <a *ngIf="!item.routerLink" [attr.href]="item.url" class="p-menuitem-link" role="presentation" (click)="itemClick($event,item)" (keydown.enter)="itemClick($event,item)" [attr.tabindex]="item.disabled ? null : '0'"
                        [attr.target]="item.target" [attr.title]="item.title" [attr.id]="item.id" pRipple>
                        <ng-container *ngIf="!itemTemplate">
                            <span class="p-menuitem-icon" [ngClass]="item.icon" *ngIf="item.icon"></span>
                            <span class="p-menuitem-text" *ngIf="item.escape !== false; else htmlLabel">{{item.label}}</span>
                            <ng-template #htmlLabel><span class="p-menuitem-text" [innerHTML]="item.label"></span></ng-template>
                        </ng-container>
                        <ng-container *ngTemplateOutlet="itemTemplate; context: {$implicit: item, index: i}"></ng-container>
                    </a>
                    <a *ngIf="item.routerLink" [routerLink]="item.routerLink" [queryParams]="item.queryParams" [routerLinkActive]="'p-menuitem-link-active'" [routerLinkActiveOptions]="item.routerLinkActiveOptions||{exact:false}"
                        role="presentation" class="p-menuitem-link" (click)="itemClick($event,item)" (keydown.enter)="itemClick($event,item)" [attr.tabindex]="item.disabled ? null : '0'"
                        [attr.target]="item.target" [attr.title]="item.title" [attr.id]="item.id"
                        [fragment]="item.fragment" [queryParamsHandling]="item.queryParamsHandling" [preserveFragment]="item.preserveFragment" [skipLocationChange]="item.skipLocationChange" [replaceUrl]="item.replaceUrl" [state]="item.state" pRipple>
                        <ng-container *ngIf="!itemTemplate">
                            <span class="p-menuitem-icon" [ngClass]="item.icon" *ngIf="item.icon"></span>
                            <span class="p-menuitem-text" *ngIf="item.escape !== false; else htmlRouteLabel">{{item.label}}</span>
                            <ng-template #htmlRouteLabel><span class="p-menuitem-text" [innerHTML]="item.label"></span></ng-template>
                        </ng-container>
                        <ng-container *ngTemplateOutlet="itemTemplate; context: {$implicit: item, index: i}"></ng-container>
                    </a>
                </li>
                <li #inkbar class="p-tabmenu-ink-bar"></li>
            </ul>
        </div>
    `,
                changeDetection: ChangeDetectionStrategy.OnPush,
                encapsulation: ViewEncapsulation.None,
                styles: [".p-tabmenu{overflow-x:auto}.p-tabmenu-nav{display:flex;flex-wrap:nowrap;list-style-type:none;margin:0;padding:0}.p-tabmenu-nav a{-ms-user-select:none;-webkit-user-select:none;align-items:center;cursor:pointer;display:flex;overflow:hidden;position:relative;text-decoration:none;user-select:none}.p-tabmenu-nav a:focus{z-index:1}.p-tabmenu-nav .p-menuitem-text{line-height:1}.p-tabmenu-ink-bar{display:none;z-index:1}"]
            },] }
];
TabMenu.propDecorators = {
    model: [{ type: Input }],
    activeItem: [{ type: Input }],
    popup: [{ type: Input }],
    style: [{ type: Input }],
    styleClass: [{ type: Input }],
    navbar: [{ type: ViewChild, args: ['navbar',] }],
    inkbar: [{ type: ViewChild, args: ['inkbar',] }],
    templates: [{ type: ContentChildren, args: [PrimeTemplate,] }]
};
export class TabMenuModule {
}
TabMenuModule.decorators = [
    { type: NgModule, args: [{
                imports: [CommonModule, RouterModule, SharedModule, RippleModule],
                exports: [TabMenu, RouterModule, SharedModule],
                declarations: [TabMenu]
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibWVudS5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8uLi9zcmMvYXBwL2NvbXBvbmVudHMvdGFibWVudS8iLCJzb3VyY2VzIjpbInRhYm1lbnUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFFBQVEsRUFBQyxTQUFTLEVBQUMsS0FBSyxFQUFDLGVBQWUsRUFBdUUsdUJBQXVCLEVBQUUsaUJBQWlCLEVBQUUsU0FBUyxFQUFhLE1BQU0sZUFBZSxDQUFDO0FBQy9NLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUU3QyxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDNUMsT0FBTyxFQUFDLGFBQWEsRUFBRSxZQUFZLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDeEQsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQzdDLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFzQ3ZDLE1BQU0sT0FBTyxPQUFPO0lBc0JoQixrQkFBa0I7UUFDZCxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO1lBQzVCLFFBQU8sSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFO2dCQUNuQixLQUFLLE1BQU07b0JBQ1AsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO29CQUN0QyxNQUFNO2dCQUVOO29CQUNJLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztvQkFDdEMsTUFBTTthQUNUO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsZUFBZTtRQUNYLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztJQUN4QixDQUFDO0lBRUQsa0JBQWtCO1FBQ2QsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ2pCLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUNwQixJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztTQUMzQjtJQUNMLENBQUM7SUFFRCxTQUFTLENBQUMsS0FBWSxFQUFFLElBQWM7UUFDbEMsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2YsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ3ZCLE9BQU87U0FDVjtRQUVELElBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNkLElBQUksQ0FBQyxPQUFPLENBQUM7Z0JBQ1QsYUFBYSxFQUFFLEtBQUs7Z0JBQ3BCLElBQUksRUFBRSxJQUFJO2FBQ2IsQ0FBQyxDQUFDO1NBQ047UUFFRCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztRQUN2QixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQztJQUMzQixDQUFDO0lBRUQsWUFBWTtRQUNSLElBQUksU0FBUyxHQUFHLFVBQVUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztRQUNuRixJQUFJLFNBQVMsRUFBRTtZQUNYLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxJQUFJLENBQUM7WUFDOUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztTQUM3STtJQUNMLENBQUM7OztZQTFHSixTQUFTLFNBQUM7Z0JBQ1AsUUFBUSxFQUFFLFdBQVc7Z0JBQ3JCLFFBQVEsRUFBRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7S0E2QlQ7Z0JBQ0QsZUFBZSxFQUFFLHVCQUF1QixDQUFDLE1BQU07Z0JBQy9DLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJOzthQUV4Qzs7O29CQUdJLEtBQUs7eUJBRUwsS0FBSztvQkFFTCxLQUFLO29CQUVMLEtBQUs7eUJBRUwsS0FBSztxQkFFTCxTQUFTLFNBQUMsUUFBUTtxQkFFbEIsU0FBUyxTQUFDLFFBQVE7d0JBRWxCLGVBQWUsU0FBQyxhQUFhOztBQThEbEMsTUFBTSxPQUFPLGFBQWE7OztZQUx6QixRQUFRLFNBQUM7Z0JBQ04sT0FBTyxFQUFFLENBQUMsWUFBWSxFQUFDLFlBQVksRUFBQyxZQUFZLEVBQUMsWUFBWSxDQUFDO2dCQUM5RCxPQUFPLEVBQUUsQ0FBQyxPQUFPLEVBQUMsWUFBWSxFQUFDLFlBQVksQ0FBQztnQkFDNUMsWUFBWSxFQUFFLENBQUMsT0FBTyxDQUFDO2FBQzFCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtOZ01vZHVsZSxDb21wb25lbnQsSW5wdXQsQ29udGVudENoaWxkcmVuLFF1ZXJ5TGlzdCxBZnRlckNvbnRlbnRJbml0LEFmdGVyVmlld0luaXQsQWZ0ZXJWaWV3Q2hlY2tlZCxUZW1wbGF0ZVJlZixDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSwgVmlld0VuY2Fwc3VsYXRpb24sIFZpZXdDaGlsZCwgRWxlbWVudFJlZn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7Q29tbW9uTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xyXG5pbXBvcnQge01lbnVJdGVtfSBmcm9tICdwcmltZW5nL2FwaSc7XHJcbmltcG9ydCB7UmlwcGxlTW9kdWxlfSBmcm9tICdwcmltZW5nL3JpcHBsZSc7XHJcbmltcG9ydCB7UHJpbWVUZW1wbGF0ZSwgU2hhcmVkTW9kdWxlfSBmcm9tICdwcmltZW5nL2FwaSc7XHJcbmltcG9ydCB7Um91dGVyTW9kdWxlfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xyXG5pbXBvcnQge0RvbUhhbmRsZXJ9IGZyb20gJ3ByaW1lbmcvZG9tJztcclxuXHJcbkBDb21wb25lbnQoe1xyXG4gICAgc2VsZWN0b3I6ICdwLXRhYk1lbnUnLFxyXG4gICAgdGVtcGxhdGU6IGBcclxuICAgICAgICA8ZGl2IFtuZ0NsYXNzXT1cIidwLXRhYm1lbnUgcC1jb21wb25lbnQnXCIgW25nU3R5bGVdPVwic3R5bGVcIiBbY2xhc3NdPVwic3R5bGVDbGFzc1wiPlxyXG4gICAgICAgICAgICA8dWwgI25hdmJhciBjbGFzcz1cInAtdGFibWVudS1uYXYgcC1yZXNldFwiIHJvbGU9XCJ0YWJsaXN0XCI+XHJcbiAgICAgICAgICAgICAgICA8bGkgKm5nRm9yPVwibGV0IGl0ZW0gb2YgbW9kZWw7IGxldCBpID0gaW5kZXhcIiByb2xlPVwidGFiXCIgW25nU3R5bGVdPVwiaXRlbS5zdHlsZVwiIFtjbGFzc109XCJpdGVtLnN0eWxlQ2xhc3NcIiBbYXR0ci5hcmlhLXNlbGVjdGVkXT1cImFjdGl2ZUl0ZW09PWl0ZW1cIiBbYXR0ci5hcmlhLWV4cGFuZGVkXT1cImFjdGl2ZUl0ZW09PWl0ZW1cIlxyXG4gICAgICAgICAgICAgICAgICAgIFtuZ0NsYXNzXT1cInsncC10YWJtZW51aXRlbSc6dHJ1ZSwncC1kaXNhYmxlZCc6aXRlbS5kaXNhYmxlZCwncC1oaWdobGlnaHQnOmFjdGl2ZUl0ZW09PWl0ZW0sJ3AtaGlkZGVuJzogaXRlbS52aXNpYmxlID09PSBmYWxzZX1cIj5cclxuICAgICAgICAgICAgICAgICAgICA8YSAqbmdJZj1cIiFpdGVtLnJvdXRlckxpbmtcIiBbYXR0ci5ocmVmXT1cIml0ZW0udXJsXCIgY2xhc3M9XCJwLW1lbnVpdGVtLWxpbmtcIiByb2xlPVwicHJlc2VudGF0aW9uXCIgKGNsaWNrKT1cIml0ZW1DbGljaygkZXZlbnQsaXRlbSlcIiAoa2V5ZG93bi5lbnRlcik9XCJpdGVtQ2xpY2soJGV2ZW50LGl0ZW0pXCIgW2F0dHIudGFiaW5kZXhdPVwiaXRlbS5kaXNhYmxlZCA/IG51bGwgOiAnMCdcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBbYXR0ci50YXJnZXRdPVwiaXRlbS50YXJnZXRcIiBbYXR0ci50aXRsZV09XCJpdGVtLnRpdGxlXCIgW2F0dHIuaWRdPVwiaXRlbS5pZFwiIHBSaXBwbGU+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxuZy1jb250YWluZXIgKm5nSWY9XCIhaXRlbVRlbXBsYXRlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInAtbWVudWl0ZW0taWNvblwiIFtuZ0NsYXNzXT1cIml0ZW0uaWNvblwiICpuZ0lmPVwiaXRlbS5pY29uXCI+PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJwLW1lbnVpdGVtLXRleHRcIiAqbmdJZj1cIml0ZW0uZXNjYXBlICE9PSBmYWxzZTsgZWxzZSBodG1sTGFiZWxcIj57e2l0ZW0ubGFiZWx9fTwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxuZy10ZW1wbGF0ZSAjaHRtbExhYmVsPjxzcGFuIGNsYXNzPVwicC1tZW51aXRlbS10ZXh0XCIgW2lubmVySFRNTF09XCJpdGVtLmxhYmVsXCI+PC9zcGFuPjwvbmctdGVtcGxhdGU+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvbmctY29udGFpbmVyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8bmctY29udGFpbmVyICpuZ1RlbXBsYXRlT3V0bGV0PVwiaXRlbVRlbXBsYXRlOyBjb250ZXh0OiB7JGltcGxpY2l0OiBpdGVtLCBpbmRleDogaX1cIj48L25nLWNvbnRhaW5lcj5cclxuICAgICAgICAgICAgICAgICAgICA8L2E+XHJcbiAgICAgICAgICAgICAgICAgICAgPGEgKm5nSWY9XCJpdGVtLnJvdXRlckxpbmtcIiBbcm91dGVyTGlua109XCJpdGVtLnJvdXRlckxpbmtcIiBbcXVlcnlQYXJhbXNdPVwiaXRlbS5xdWVyeVBhcmFtc1wiIFtyb3V0ZXJMaW5rQWN0aXZlXT1cIidwLW1lbnVpdGVtLWxpbmstYWN0aXZlJ1wiIFtyb3V0ZXJMaW5rQWN0aXZlT3B0aW9uc109XCJpdGVtLnJvdXRlckxpbmtBY3RpdmVPcHRpb25zfHx7ZXhhY3Q6ZmFsc2V9XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgcm9sZT1cInByZXNlbnRhdGlvblwiIGNsYXNzPVwicC1tZW51aXRlbS1saW5rXCIgKGNsaWNrKT1cIml0ZW1DbGljaygkZXZlbnQsaXRlbSlcIiAoa2V5ZG93bi5lbnRlcik9XCJpdGVtQ2xpY2soJGV2ZW50LGl0ZW0pXCIgW2F0dHIudGFiaW5kZXhdPVwiaXRlbS5kaXNhYmxlZCA/IG51bGwgOiAnMCdcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBbYXR0ci50YXJnZXRdPVwiaXRlbS50YXJnZXRcIiBbYXR0ci50aXRsZV09XCJpdGVtLnRpdGxlXCIgW2F0dHIuaWRdPVwiaXRlbS5pZFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFtmcmFnbWVudF09XCJpdGVtLmZyYWdtZW50XCIgW3F1ZXJ5UGFyYW1zSGFuZGxpbmddPVwiaXRlbS5xdWVyeVBhcmFtc0hhbmRsaW5nXCIgW3ByZXNlcnZlRnJhZ21lbnRdPVwiaXRlbS5wcmVzZXJ2ZUZyYWdtZW50XCIgW3NraXBMb2NhdGlvbkNoYW5nZV09XCJpdGVtLnNraXBMb2NhdGlvbkNoYW5nZVwiIFtyZXBsYWNlVXJsXT1cIml0ZW0ucmVwbGFjZVVybFwiIFtzdGF0ZV09XCJpdGVtLnN0YXRlXCIgcFJpcHBsZT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPG5nLWNvbnRhaW5lciAqbmdJZj1cIiFpdGVtVGVtcGxhdGVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwicC1tZW51aXRlbS1pY29uXCIgW25nQ2xhc3NdPVwiaXRlbS5pY29uXCIgKm5nSWY9XCJpdGVtLmljb25cIj48L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInAtbWVudWl0ZW0tdGV4dFwiICpuZ0lmPVwiaXRlbS5lc2NhcGUgIT09IGZhbHNlOyBlbHNlIGh0bWxSb3V0ZUxhYmVsXCI+e3tpdGVtLmxhYmVsfX08L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bmctdGVtcGxhdGUgI2h0bWxSb3V0ZUxhYmVsPjxzcGFuIGNsYXNzPVwicC1tZW51aXRlbS10ZXh0XCIgW2lubmVySFRNTF09XCJpdGVtLmxhYmVsXCI+PC9zcGFuPjwvbmctdGVtcGxhdGU+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvbmctY29udGFpbmVyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8bmctY29udGFpbmVyICpuZ1RlbXBsYXRlT3V0bGV0PVwiaXRlbVRlbXBsYXRlOyBjb250ZXh0OiB7JGltcGxpY2l0OiBpdGVtLCBpbmRleDogaX1cIj48L25nLWNvbnRhaW5lcj5cclxuICAgICAgICAgICAgICAgICAgICA8L2E+XHJcbiAgICAgICAgICAgICAgICA8L2xpPlxyXG4gICAgICAgICAgICAgICAgPGxpICNpbmtiYXIgY2xhc3M9XCJwLXRhYm1lbnUtaW5rLWJhclwiPjwvbGk+XHJcbiAgICAgICAgICAgIDwvdWw+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICBgLFxyXG4gICAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXHJcbiAgICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxyXG4gICAgc3R5bGVVcmxzOiBbJy4vdGFibWVudS5jc3MnXVxyXG59KVxyXG5leHBvcnQgY2xhc3MgVGFiTWVudSBpbXBsZW1lbnRzIEFmdGVyQ29udGVudEluaXQsQWZ0ZXJWaWV3SW5pdCxBZnRlclZpZXdDaGVja2VkIHtcclxuXHJcbiAgICBASW5wdXQoKSBtb2RlbDogTWVudUl0ZW1bXTtcclxuXHJcbiAgICBASW5wdXQoKSBhY3RpdmVJdGVtOiBNZW51SXRlbTtcclxuXHJcbiAgICBASW5wdXQoKSBwb3B1cDogYm9vbGVhbjtcclxuXHJcbiAgICBASW5wdXQoKSBzdHlsZTogYW55O1xyXG5cclxuICAgIEBJbnB1dCgpIHN0eWxlQ2xhc3M6IHN0cmluZztcclxuXHJcbiAgICBAVmlld0NoaWxkKCduYXZiYXInKSBuYXZiYXI6IEVsZW1lbnRSZWY7XHJcblxyXG4gICAgQFZpZXdDaGlsZCgnaW5rYmFyJykgaW5rYmFyOiBFbGVtZW50UmVmO1xyXG5cclxuICAgIEBDb250ZW50Q2hpbGRyZW4oUHJpbWVUZW1wbGF0ZSkgdGVtcGxhdGVzOiBRdWVyeUxpc3Q8YW55PjtcclxuXHJcbiAgICBpdGVtVGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT47XHJcblxyXG4gICAgdGFiQ2hhbmdlZDogYm9vbGVhbjtcclxuXHJcbiAgICBuZ0FmdGVyQ29udGVudEluaXQoKSB7XHJcbiAgICAgICAgdGhpcy50ZW1wbGF0ZXMuZm9yRWFjaCgoaXRlbSkgPT4ge1xyXG4gICAgICAgICAgICBzd2l0Y2goaXRlbS5nZXRUeXBlKCkpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2l0ZW0nOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXRlbVRlbXBsYXRlID0gaXRlbS50ZW1wbGF0ZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXRlbVRlbXBsYXRlID0gaXRlbS50ZW1wbGF0ZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgbmdBZnRlclZpZXdJbml0KCkge1xyXG4gICAgICAgIHRoaXMudXBkYXRlSW5rQmFyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgbmdBZnRlclZpZXdDaGVja2VkKCkge1xyXG4gICAgICAgIGlmICh0aGlzLnRhYkNoYW5nZWQpIHtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVJbmtCYXIoKTtcclxuICAgICAgICAgICAgdGhpcy50YWJDaGFuZ2VkID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGl0ZW1DbGljayhldmVudDogRXZlbnQsIGl0ZW06IE1lbnVJdGVtKcKge1xyXG4gICAgICAgIGlmIChpdGVtLmRpc2FibGVkKSB7XHJcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpdGVtLmNvbW1hbmQpIHtcclxuICAgICAgICAgICAgaXRlbS5jb21tYW5kKHtcclxuICAgICAgICAgICAgICAgIG9yaWdpbmFsRXZlbnQ6IGV2ZW50LFxyXG4gICAgICAgICAgICAgICAgaXRlbTogaXRlbVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuYWN0aXZlSXRlbSA9IGl0ZW07XHJcbiAgICAgICAgdGhpcy50YWJDaGFuZ2VkID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVJbmtCYXIoKSB7XHJcbiAgICAgICAgbGV0IHRhYkhlYWRlciA9IERvbUhhbmRsZXIuZmluZFNpbmdsZSh0aGlzLm5hdmJhci5uYXRpdmVFbGVtZW50LCAnbGkucC1oaWdobGlnaHQnKTtcclxuICAgICAgICBpZiAodGFiSGVhZGVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5rYmFyLm5hdGl2ZUVsZW1lbnQuc3R5bGUud2lkdGggPSBEb21IYW5kbGVyLmdldFdpZHRoKHRhYkhlYWRlcikgKyAncHgnO1xyXG4gICAgICAgICAgICB0aGlzLmlua2Jhci5uYXRpdmVFbGVtZW50LnN0eWxlLmxlZnQgPSBEb21IYW5kbGVyLmdldE9mZnNldCh0YWJIZWFkZXIpLmxlZnQgLSBEb21IYW5kbGVyLmdldE9mZnNldCh0aGlzLm5hdmJhci5uYXRpdmVFbGVtZW50KS5sZWZ0ICsgJ3B4JztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbkBOZ01vZHVsZSh7XHJcbiAgICBpbXBvcnRzOiBbQ29tbW9uTW9kdWxlLFJvdXRlck1vZHVsZSxTaGFyZWRNb2R1bGUsUmlwcGxlTW9kdWxlXSxcclxuICAgIGV4cG9ydHM6IFtUYWJNZW51LFJvdXRlck1vZHVsZSxTaGFyZWRNb2R1bGVdLFxyXG4gICAgZGVjbGFyYXRpb25zOiBbVGFiTWVudV1cclxufSlcclxuZXhwb3J0IGNsYXNzIFRhYk1lbnVNb2R1bGUgeyB9XHJcbiJdfQ==