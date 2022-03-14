import { NgModule, Component, ElementRef, Input, Output, EventEmitter, ContentChildren, ViewContainerRef, ChangeDetectorRef, ChangeDetectionStrategy, ViewEncapsulation, ViewChild, forwardRef, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';
import { SharedModule, PrimeTemplate } from 'primeng/api';
import { DomHandler } from 'primeng/dom';
let idx = 0;
export class TabPanel {
    constructor(tabView, viewContainer, cd) {
        this.viewContainer = viewContainer;
        this.cd = cd;
        this.cache = true;
        this.tooltipPosition = 'top';
        this.tooltipPositionStyle = 'absolute';
        this.id = `p-tabpanel-${idx++}`;
        this.tabView = tabView;
    }
    ngAfterContentInit() {
        this.templates.forEach((item) => {
            switch (item.getType()) {
                case 'header':
                    this.headerTemplate = item.template;
                    break;
                case 'content':
                    this.contentTemplate = item.template;
                    break;
                default:
                    this.contentTemplate = item.template;
                    break;
            }
        });
    }
    get selected() {
        return this._selected;
    }
    set selected(val) {
        this._selected = val;
        if (!this.loaded) {
            this.cd.detectChanges();
        }
        if (val)
            this.loaded = true;
    }
    get disabled() {
        return this._disabled;
    }
    ;
    set disabled(disabled) {
        this._disabled = disabled;
        this.tabView.cd.markForCheck();
    }
    get header() {
        return this._header;
    }
    set header(header) {
        this._header = header;
        this.tabView.cd.markForCheck();
    }
    get leftIcon() {
        return this._leftIcon;
    }
    set leftIcon(leftIcon) {
        this._leftIcon = leftIcon;
        this.tabView.cd.markForCheck();
    }
    get rightIcon() {
        return this._rightIcon;
    }
    set rightIcon(rightIcon) {
        this._rightIcon = rightIcon;
        this.tabView.cd.markForCheck();
    }
    ngOnDestroy() {
        this.view = null;
    }
}
TabPanel.decorators = [
    { type: Component, args: [{
                selector: 'p-tabPanel',
                template: `
        <div [attr.id]="id" class="p-tabview-panel" [hidden]="!selected"
            role="tabpanel" [attr.aria-hidden]="!selected" [attr.aria-labelledby]="id + '-label'" *ngIf="!closed">
            <ng-content></ng-content>
            <ng-container *ngIf="contentTemplate && (cache ? loaded : selected)">
                <ng-container *ngTemplateOutlet="contentTemplate"></ng-container>
            </ng-container>
        </div>
    `
            },] }
];
TabPanel.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Inject, args: [forwardRef(() => TabView),] }] },
    { type: ViewContainerRef },
    { type: ChangeDetectorRef }
];
TabPanel.propDecorators = {
    closable: [{ type: Input }],
    headerStyle: [{ type: Input }],
    headerStyleClass: [{ type: Input }],
    cache: [{ type: Input }],
    tooltip: [{ type: Input }],
    tooltipPosition: [{ type: Input }],
    tooltipPositionStyle: [{ type: Input }],
    tooltipStyleClass: [{ type: Input }],
    templates: [{ type: ContentChildren, args: [PrimeTemplate,] }],
    selected: [{ type: Input }],
    disabled: [{ type: Input }],
    header: [{ type: Input }],
    leftIcon: [{ type: Input }],
    rightIcon: [{ type: Input }]
};
export class TabView {
    constructor(el, cd) {
        this.el = el;
        this.cd = cd;
        this.orientation = 'top';
        this.onChange = new EventEmitter();
        this.onClose = new EventEmitter();
        this.activeIndexChange = new EventEmitter();
    }
    ngAfterContentInit() {
        this.initTabs();
        this.tabPanels.changes.subscribe(_ => {
            this.initTabs();
        });
    }
    ngAfterViewChecked() {
        if (this.tabChanged) {
            this.updateInkBar();
            this.tabChanged = false;
        }
    }
    initTabs() {
        this.tabs = this.tabPanels.toArray();
        let selectedTab = this.findSelectedTab();
        if (!selectedTab && this.tabs.length) {
            if (this.activeIndex != null && this.tabs.length > this.activeIndex)
                this.tabs[this.activeIndex].selected = true;
            else
                this.tabs[0].selected = true;
            this.tabChanged = true;
        }
        this.cd.markForCheck();
    }
    open(event, tab) {
        if (tab.disabled) {
            if (event) {
                event.preventDefault();
            }
            return;
        }
        if (!tab.selected) {
            let selectedTab = this.findSelectedTab();
            if (selectedTab) {
                selectedTab.selected = false;
            }
            this.tabChanged = true;
            tab.selected = true;
            let selectedTabIndex = this.findTabIndex(tab);
            this.preventActiveIndexPropagation = true;
            this.activeIndexChange.emit(selectedTabIndex);
            this.onChange.emit({ originalEvent: event, index: selectedTabIndex });
        }
        if (event) {
            event.preventDefault();
        }
    }
    close(event, tab) {
        if (this.controlClose) {
            this.onClose.emit({
                originalEvent: event,
                index: this.findTabIndex(tab),
                close: () => {
                    this.closeTab(tab);
                }
            });
        }
        else {
            this.closeTab(tab);
            this.onClose.emit({
                originalEvent: event,
                index: this.findTabIndex(tab)
            });
        }
        event.stopPropagation();
    }
    closeTab(tab) {
        if (tab.disabled) {
            return;
        }
        if (tab.selected) {
            this.tabChanged = true;
            tab.selected = false;
            for (let i = 0; i < this.tabs.length; i++) {
                let tabPanel = this.tabs[i];
                if (!tabPanel.closed && !tab.disabled) {
                    tabPanel.selected = true;
                    break;
                }
            }
        }
        tab.closed = true;
    }
    findSelectedTab() {
        for (let i = 0; i < this.tabs.length; i++) {
            if (this.tabs[i].selected) {
                return this.tabs[i];
            }
        }
        return null;
    }
    findTabIndex(tab) {
        let index = -1;
        for (let i = 0; i < this.tabs.length; i++) {
            if (this.tabs[i] == tab) {
                index = i;
                break;
            }
        }
        return index;
    }
    getBlockableElement() {
        return this.el.nativeElement.children[0];
    }
    get activeIndex() {
        return this._activeIndex;
    }
    set activeIndex(val) {
        this._activeIndex = val;
        if (this.preventActiveIndexPropagation) {
            this.preventActiveIndexPropagation = false;
            return;
        }
        if (this.tabs && this.tabs.length && this._activeIndex != null && this.tabs.length > this._activeIndex) {
            this.findSelectedTab().selected = false;
            this.tabs[this._activeIndex].selected = true;
            this.tabChanged = true;
        }
    }
    updateInkBar() {
        let tabHeader = DomHandler.findSingle(this.navbar.nativeElement, 'li.p-highlight');
        this.inkbar.nativeElement.style.width = DomHandler.getWidth(tabHeader) + 'px';
        this.inkbar.nativeElement.style.left = DomHandler.getOffset(tabHeader).left - DomHandler.getOffset(this.navbar.nativeElement).left + 'px';
    }
}
TabView.decorators = [
    { type: Component, args: [{
                selector: 'p-tabView',
                template: `
        <div [ngClass]="'p-tabview p-component'" [ngStyle]="style" [class]="styleClass">
            <ul #navbar class="p-tabview-nav" role="tablist">
                <ng-template ngFor let-tab [ngForOf]="tabs">
                    <li role="presentation" [ngClass]="{'p-highlight': tab.selected, 'p-disabled': tab.disabled}" [ngStyle]="tab.headerStyle" [class]="tab.headerStyleClass" *ngIf="!tab.closed">
                        <a role="tab" class="p-tabview-nav-link" [attr.id]="tab.id + '-label'" [attr.aria-selected]="tab.selected" [attr.aria-controls]="tab.id" [pTooltip]="tab.tooltip" [tooltipPosition]="tab.tooltipPosition"
                            [attr.aria-selected]="tab.selected" [positionStyle]="tab.tooltipPositionStyle" [tooltipStyleClass]="tab.tooltipStyleClass"
                            (click)="open($event,tab)" (keydown.enter)="open($event,tab)" pRipple [attr.tabindex]="tab.disabled ? null : '0'">
                            <ng-container *ngIf="!tab.headerTemplate">
                                <span class="p-tabview-left-icon" [ngClass]="tab.leftIcon" *ngIf="tab.leftIcon"></span>
                                <span class="p-tabview-title">{{tab.header}}</span>
                                <span class="p-tabview-right-icon" [ngClass]="tab.rightIcon" *ngIf="tab.rightIcon"></span>
                            </ng-container>
                            <ng-container *ngTemplateOutlet="tab.headerTemplate"></ng-container>
                            <span *ngIf="tab.closable" class="p-tabview-close pi pi-times" (click)="close($event,tab)"></span>
                        </a>
                    </li>
                </ng-template>
                <li #inkbar class="p-tabview-ink-bar"></li>
            </ul>
            <div class="p-tabview-panels">
                <ng-content></ng-content>
            </div>
        </div>
    `,
                changeDetection: ChangeDetectionStrategy.OnPush,
                encapsulation: ViewEncapsulation.None,
                styles: [".p-tabview-nav{display:flex;flex-wrap:wrap;list-style-type:none;margin:0;padding:0}.p-tabview-nav-link{-ms-user-select:none;-webkit-user-select:none;align-items:center;cursor:pointer;display:flex;overflow:hidden;position:relative;text-decoration:none;user-select:none}.p-tabview-ink-bar{display:none;z-index:1}.p-tabview-nav-link:focus{z-index:1}.p-tabview-title{line-height:1}.p-tabview-close{z-index:1}"]
            },] }
];
TabView.ctorParameters = () => [
    { type: ElementRef },
    { type: ChangeDetectorRef }
];
TabView.propDecorators = {
    orientation: [{ type: Input }],
    style: [{ type: Input }],
    styleClass: [{ type: Input }],
    controlClose: [{ type: Input }],
    navbar: [{ type: ViewChild, args: ['navbar',] }],
    inkbar: [{ type: ViewChild, args: ['inkbar',] }],
    tabPanels: [{ type: ContentChildren, args: [TabPanel,] }],
    onChange: [{ type: Output }],
    onClose: [{ type: Output }],
    activeIndexChange: [{ type: Output }],
    activeIndex: [{ type: Input }]
};
export class TabViewModule {
}
TabViewModule.decorators = [
    { type: NgModule, args: [{
                imports: [CommonModule, SharedModule, TooltipModule, RippleModule],
                exports: [TabView, TabPanel, SharedModule],
                declarations: [TabView, TabPanel]
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFidmlldy5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8uLi9zcmMvYXBwL2NvbXBvbmVudHMvdGFidmlldy8iLCJzb3VyY2VzIjpbInRhYnZpZXcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFFBQVEsRUFBQyxTQUFTLEVBQUMsVUFBVSxFQUFXLEtBQUssRUFBQyxNQUFNLEVBQUMsWUFBWSxFQUNqRSxlQUFlLEVBQXVDLGdCQUFnQixFQUFDLGlCQUFpQixFQUFDLHVCQUF1QixFQUFFLGlCQUFpQixFQUFFLFNBQVMsRUFBb0IsVUFBVSxFQUFFLE1BQU0sRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNuTixPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDN0MsT0FBTyxFQUFDLGFBQWEsRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQzlDLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUM1QyxPQUFPLEVBQUMsWUFBWSxFQUFDLGFBQWEsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUV2RCxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBRXZDLElBQUksR0FBRyxHQUFXLENBQUMsQ0FBQztBQWNwQixNQUFNLE9BQU8sUUFBUTtJQTRDakIsWUFBK0MsT0FBTyxFQUFTLGFBQStCLEVBQVMsRUFBcUI7UUFBN0Qsa0JBQWEsR0FBYixhQUFhLENBQWtCO1FBQVMsT0FBRSxHQUFGLEVBQUUsQ0FBbUI7UUFwQ25ILFVBQUssR0FBWSxJQUFJLENBQUM7UUFJdEIsb0JBQWUsR0FBVyxLQUFLLENBQUM7UUFFaEMseUJBQW9CLEdBQVcsVUFBVSxDQUFDO1FBc0JuRCxPQUFFLEdBQVcsY0FBYyxHQUFHLEVBQUUsRUFBRSxDQUFDO1FBUy9CLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBa0IsQ0FBQztJQUN0QyxDQUFDO0lBRUQsa0JBQWtCO1FBQ2QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMs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QUMvRCxPQUFPLEVBQUUsQ0FBQyxPQUFPLEVBQUMsUUFBUSxFQUFDLFlBQVksQ0FBQztnQkFDeEMsWUFBWSxFQUFFLENBQUMsT0FBTyxFQUFDLFFBQVEsQ0FBQzthQUNuQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TmdNb2R1bGUsQ29tcG9uZW50LEVsZW1lbnRSZWYsT25EZXN0cm95LElucHV0LE91dHB1dCxFdmVudEVtaXR0ZXIsQWZ0ZXJDb250ZW50SW5pdCxcclxuICAgICAgICBDb250ZW50Q2hpbGRyZW4sUXVlcnlMaXN0LFRlbXBsYXRlUmVmLEVtYmVkZGVkVmlld1JlZixWaWV3Q29udGFpbmVyUmVmLENoYW5nZURldGVjdG9yUmVmLENoYW5nZURldGVjdGlvblN0cmF0ZWd5LCBWaWV3RW5jYXBzdWxhdGlvbiwgVmlld0NoaWxkLCBBZnRlclZpZXdDaGVja2VkLCBmb3J3YXJkUmVmLCBJbmplY3R9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQge0NvbW1vbk1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcclxuaW1wb3J0IHtUb29sdGlwTW9kdWxlfSBmcm9tICdwcmltZW5nL3Rvb2x0aXAnO1xyXG5pbXBvcnQge1JpcHBsZU1vZHVsZX0gZnJvbSAncHJpbWVuZy9yaXBwbGUnO1xyXG5pbXBvcnQge1NoYXJlZE1vZHVsZSxQcmltZVRlbXBsYXRlfSBmcm9tICdwcmltZW5nL2FwaSc7XHJcbmltcG9ydCB7QmxvY2thYmxlVUl9IGZyb20gJ3ByaW1lbmcvYXBpJztcclxuaW1wb3J0IHtEb21IYW5kbGVyfSBmcm9tICdwcmltZW5nL2RvbSc7XHJcblxyXG5sZXQgaWR4OiBudW1iZXIgPSAwO1xyXG5cclxuQENvbXBvbmVudCh7XHJcbiAgICBzZWxlY3RvcjogJ3AtdGFiUGFuZWwnLFxyXG4gICAgdGVtcGxhdGU6IGBcclxuICAgICAgICA8ZGl2IFthdHRyLmlkXT1cImlkXCIgY2xhc3M9XCJwLXRhYnZpZXctcGFuZWxcIiBbaGlkZGVuXT1cIiFzZWxlY3RlZFwiXHJcbiAgICAgICAgICAgIHJvbGU9XCJ0YWJwYW5lbFwiIFthdHRyLmFyaWEtaGlkZGVuXT1cIiFzZWxlY3RlZFwiIFthdHRyLmFyaWEtbGFiZWxsZWRieV09XCJpZCArICctbGFiZWwnXCIgKm5nSWY9XCIhY2xvc2VkXCI+XHJcbiAgICAgICAgICAgIDxuZy1jb250ZW50PjwvbmctY29udGVudD5cclxuICAgICAgICAgICAgPG5nLWNvbnRhaW5lciAqbmdJZj1cImNvbnRlbnRUZW1wbGF0ZSAmJiAoY2FjaGUgPyBsb2FkZWQgOiBzZWxlY3RlZClcIj5cclxuICAgICAgICAgICAgICAgIDxuZy1jb250YWluZXIgKm5nVGVtcGxhdGVPdXRsZXQ9XCJjb250ZW50VGVtcGxhdGVcIj48L25nLWNvbnRhaW5lcj5cclxuICAgICAgICAgICAgPC9uZy1jb250YWluZXI+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICBgXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBUYWJQYW5lbCBpbXBsZW1lbnRzIEFmdGVyQ29udGVudEluaXQsT25EZXN0cm95IHtcclxuICAgIFxyXG4gICAgQElucHV0KCkgY2xvc2FibGU6IGJvb2xlYW47XHJcbiAgICBcclxuICAgIEBJbnB1dCgpIGhlYWRlclN0eWxlOiBhbnk7XHJcbiAgICBcclxuICAgIEBJbnB1dCgpIGhlYWRlclN0eWxlQ2xhc3M6IHN0cmluZztcclxuICAgIFxyXG4gICAgQElucHV0KCkgY2FjaGU6IGJvb2xlYW4gPSB0cnVlO1xyXG5cclxuICAgIEBJbnB1dCgpIHRvb2x0aXA6IGFueTtcclxuICAgIFxyXG4gICAgQElucHV0KCkgdG9vbHRpcFBvc2l0aW9uOiBzdHJpbmcgPSAndG9wJztcclxuXHJcbiAgICBASW5wdXQoKSB0b29sdGlwUG9zaXRpb25TdHlsZTogc3RyaW5nID0gJ2Fic29sdXRlJztcclxuXHJcbiAgICBASW5wdXQoKSB0b29sdGlwU3R5bGVDbGFzczogc3RyaW5nO1xyXG5cclxuICAgIEBDb250ZW50Q2hpbGRyZW4oUHJpbWVUZW1wbGF0ZSkgdGVtcGxhdGVzOiBRdWVyeUxpc3Q8YW55PjtcclxuICAgIFxyXG4gICAgY2xvc2VkOiBib29sZWFuO1xyXG4gICAgXHJcbiAgICB2aWV3OiBFbWJlZGRlZFZpZXdSZWY8YW55PjtcclxuICAgIFxyXG4gICAgX3NlbGVjdGVkOiBib29sZWFuO1xyXG5cclxuICAgIF9kaXNhYmxlZDogYm9vbGVhbjtcclxuICAgIFxyXG4gICAgX2hlYWRlcjogc3RyaW5nO1xyXG5cclxuICAgIF9sZWZ0SWNvbjogc3RyaW5nO1xyXG5cclxuICAgIF9yaWdodEljb246IHN0cmluZztcclxuICAgIFxyXG4gICAgbG9hZGVkOiBib29sZWFuO1xyXG4gICAgXHJcbiAgICBpZDogc3RyaW5nID0gYHAtdGFicGFuZWwtJHtpZHgrK31gO1xyXG4gICAgXHJcbiAgICBjb250ZW50VGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT47XHJcblxyXG4gICAgaGVhZGVyVGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT47XHJcblxyXG4gICAgdGFiVmlldzogVGFiVmlldztcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihASW5qZWN0KGZvcndhcmRSZWYoKCkgPT4gVGFiVmlldykpIHRhYlZpZXcsIHB1YmxpYyB2aWV3Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmLCBwdWJsaWMgY2Q6IENoYW5nZURldGVjdG9yUmVmKSB7XHJcbiAgICAgICAgdGhpcy50YWJWaWV3ID0gdGFiVmlldyBhcyBUYWJWaWV3O1xyXG4gICAgfVxyXG5cclxuICAgIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcclxuICAgICAgICB0aGlzLnRlbXBsYXRlcy5mb3JFYWNoKChpdGVtKSA9PiB7XHJcbiAgICAgICAgICAgIHN3aXRjaChpdGVtLmdldFR5cGUoKSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnaGVhZGVyJzpcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmhlYWRlclRlbXBsYXRlID0gaXRlbS50ZW1wbGF0ZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgIGNhc2UgJ2NvbnRlbnQnOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29udGVudFRlbXBsYXRlID0gaXRlbS50ZW1wbGF0ZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29udGVudFRlbXBsYXRlID0gaXRlbS50ZW1wbGF0ZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIEBJbnB1dCgpIGdldCBzZWxlY3RlZCgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc2VsZWN0ZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IHNlbGVjdGVkKHZhbDogYm9vbGVhbikge1xyXG4gICAgICAgIHRoaXMuX3NlbGVjdGVkID0gdmFsO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICghdGhpcy5sb2FkZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5jZC5kZXRlY3RDaGFuZ2VzKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodmFsKVxyXG4gICAgICAgICAgICB0aGlzLmxvYWRlZCA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgQElucHV0KCkgZ2V0IGRpc2FibGVkKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9kaXNhYmxlZDtcclxuICAgIH07XHJcblxyXG4gICAgc2V0IGRpc2FibGVkKGRpc2FibGVkOiBib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5fZGlzYWJsZWQgPSBkaXNhYmxlZDtcclxuICAgICAgICB0aGlzLnRhYlZpZXcuY2QubWFya0ZvckNoZWNrKCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIEBJbnB1dCgpIGdldCBoZWFkZXIoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5faGVhZGVyO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBzZXQgaGVhZGVyKGhlYWRlcjogc3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5faGVhZGVyID0gaGVhZGVyO1xyXG4gICAgICAgIHRoaXMudGFiVmlldy5jZC5tYXJrRm9yQ2hlY2soKTtcclxuICAgIH1cclxuXHJcbiAgICBASW5wdXQoKSBnZXQgbGVmdEljb24oKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbGVmdEljb247XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IGxlZnRJY29uKGxlZnRJY29uIDpzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLl9sZWZ0SWNvbiA9IGxlZnRJY29uO1xyXG4gICAgICAgIHRoaXMudGFiVmlldy5jZC5tYXJrRm9yQ2hlY2soKTtcclxuICAgIH1cclxuXHJcbiAgICBASW5wdXQoKSBnZXQgcmlnaHRJY29uKCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX3JpZ2h0SWNvbjtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgcmlnaHRJY29uKHJpZ2h0SWNvbiA6c3RyaW5nKSB7XHJcbiAgICAgICAgdGhpcy5fcmlnaHRJY29uID0gcmlnaHRJY29uO1xyXG4gICAgICAgIHRoaXMudGFiVmlldy5jZC5tYXJrRm9yQ2hlY2soKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgbmdPbkRlc3Ryb3koKSB7XHJcbiAgICAgICAgdGhpcy52aWV3ID0gbnVsbDtcclxuICAgIH1cclxufVxyXG5cclxuQENvbXBvbmVudCh7XHJcbiAgICBzZWxlY3RvcjogJ3AtdGFiVmlldycsXHJcbiAgICB0ZW1wbGF0ZTogYFxyXG4gICAgICAgIDxkaXYgW25nQ2xhc3NdPVwiJ3AtdGFidmlldyBwLWNvbXBvbmVudCdcIiBbbmdTdHlsZV09XCJzdHlsZVwiIFtjbGFzc109XCJzdHlsZUNsYXNzXCI+XHJcbiAgICAgICAgICAgIDx1bCAjbmF2YmFyIGNsYXNzPVwicC10YWJ2aWV3LW5hdlwiIHJvbGU9XCJ0YWJsaXN0XCI+XHJcbiAgICAgICAgICAgICAgICA8bmctdGVtcGxhdGUgbmdGb3IgbGV0LXRhYiBbbmdGb3JPZl09XCJ0YWJzXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGxpIHJvbGU9XCJwcmVzZW50YXRpb25cIiBbbmdDbGFzc109XCJ7J3AtaGlnaGxpZ2h0JzogdGFiLnNlbGVjdGVkLCAncC1kaXNhYmxlZCc6IHRhYi5kaXNhYmxlZH1cIiBbbmdTdHlsZV09XCJ0YWIuaGVhZGVyU3R5bGVcIiBbY2xhc3NdPVwidGFiLmhlYWRlclN0eWxlQ2xhc3NcIiAqbmdJZj1cIiF0YWIuY2xvc2VkXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxhIHJvbGU9XCJ0YWJcIiBjbGFzcz1cInAtdGFidmlldy1uYXYtbGlua1wiIFthdHRyLmlkXT1cInRhYi5pZCArICctbGFiZWwnXCIgW2F0dHIuYXJpYS1zZWxlY3RlZF09XCJ0YWIuc2VsZWN0ZWRcIiBbYXR0ci5hcmlhLWNvbnRyb2xzXT1cInRhYi5pZFwiIFtwVG9vbHRpcF09XCJ0YWIudG9vbHRpcFwiIFt0b29sdGlwUG9zaXRpb25dPVwidGFiLnRvb2x0aXBQb3NpdGlvblwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbYXR0ci5hcmlhLXNlbGVjdGVkXT1cInRhYi5zZWxlY3RlZFwiIFtwb3NpdGlvblN0eWxlXT1cInRhYi50b29sdGlwUG9zaXRpb25TdHlsZVwiIFt0b29sdGlwU3R5bGVDbGFzc109XCJ0YWIudG9vbHRpcFN0eWxlQ2xhc3NcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKGNsaWNrKT1cIm9wZW4oJGV2ZW50LHRhYilcIiAoa2V5ZG93bi5lbnRlcik9XCJvcGVuKCRldmVudCx0YWIpXCIgcFJpcHBsZSBbYXR0ci50YWJpbmRleF09XCJ0YWIuZGlzYWJsZWQgPyBudWxsIDogJzAnXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bmctY29udGFpbmVyICpuZ0lmPVwiIXRhYi5oZWFkZXJUZW1wbGF0ZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwicC10YWJ2aWV3LWxlZnQtaWNvblwiIFtuZ0NsYXNzXT1cInRhYi5sZWZ0SWNvblwiICpuZ0lmPVwidGFiLmxlZnRJY29uXCI+PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwicC10YWJ2aWV3LXRpdGxlXCI+e3t0YWIuaGVhZGVyfX08L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJwLXRhYnZpZXctcmlnaHQtaWNvblwiIFtuZ0NsYXNzXT1cInRhYi5yaWdodEljb25cIiAqbmdJZj1cInRhYi5yaWdodEljb25cIj48L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L25nLWNvbnRhaW5lcj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxuZy1jb250YWluZXIgKm5nVGVtcGxhdGVPdXRsZXQ9XCJ0YWIuaGVhZGVyVGVtcGxhdGVcIj48L25nLWNvbnRhaW5lcj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuICpuZ0lmPVwidGFiLmNsb3NhYmxlXCIgY2xhc3M9XCJwLXRhYnZpZXctY2xvc2UgcGkgcGktdGltZXNcIiAoY2xpY2spPVwiY2xvc2UoJGV2ZW50LHRhYilcIj48L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYT5cclxuICAgICAgICAgICAgICAgICAgICA8L2xpPlxyXG4gICAgICAgICAgICAgICAgPC9uZy10ZW1wbGF0ZT5cclxuICAgICAgICAgICAgICAgIDxsaSAjaW5rYmFyIGNsYXNzPVwicC10YWJ2aWV3LWluay1iYXJcIj48L2xpPlxyXG4gICAgICAgICAgICA8L3VsPlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwicC10YWJ2aWV3LXBhbmVsc1wiPlxyXG4gICAgICAgICAgICAgICAgPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgIGAsXHJcbiAgIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxyXG4gICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxyXG4gICBzdHlsZVVybHM6IFsnLi90YWJ2aWV3LmNzcyddXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBUYWJWaWV3IGltcGxlbWVudHMgQWZ0ZXJDb250ZW50SW5pdCxBZnRlclZpZXdDaGVja2VkLEJsb2NrYWJsZVVJIHtcclxuXHJcbiAgICBASW5wdXQoKSBvcmllbnRhdGlvbjogc3RyaW5nID0gJ3RvcCc7XHJcbiAgICBcclxuICAgIEBJbnB1dCgpIHN0eWxlOiBhbnk7XHJcbiAgICBcclxuICAgIEBJbnB1dCgpIHN0eWxlQ2xhc3M6IHN0cmluZztcclxuICAgIFxyXG4gICAgQElucHV0KCkgY29udHJvbENsb3NlOiBib29sZWFuO1xyXG5cclxuICAgIEBWaWV3Q2hpbGQoJ25hdmJhcicpIG5hdmJhcjogRWxlbWVudFJlZjtcclxuXHJcbiAgICBAVmlld0NoaWxkKCdpbmtiYXInKSBpbmtiYXI6IEVsZW1lbnRSZWY7XHJcbiAgICBcclxuICAgIEBDb250ZW50Q2hpbGRyZW4oVGFiUGFuZWwpIHRhYlBhbmVsczogUXVlcnlMaXN0PFRhYlBhbmVsPjtcclxuXHJcbiAgICBAT3V0cHV0KCkgb25DaGFuZ2U6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG5cclxuICAgIEBPdXRwdXQoKSBvbkNsb3NlOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcclxuXHJcbiAgICBAT3V0cHV0KCkgYWN0aXZlSW5kZXhDaGFuZ2U6IEV2ZW50RW1pdHRlcjxudW1iZXI+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG4gICAgXHJcbiAgICBpbml0aWFsaXplZDogYm9vbGVhbjtcclxuICAgIFxyXG4gICAgdGFiczogVGFiUGFuZWxbXTtcclxuICAgIFxyXG4gICAgX2FjdGl2ZUluZGV4OiBudW1iZXI7XHJcbiAgICBcclxuICAgIHByZXZlbnRBY3RpdmVJbmRleFByb3BhZ2F0aW9uOiBib29sZWFuO1xyXG5cclxuICAgIHRhYkNoYW5nZWQ6IGJvb2xlYW47XHJcblxyXG4gICAgY29uc3RydWN0b3IocHVibGljIGVsOiBFbGVtZW50UmVmLCBwdWJsaWMgY2Q6IENoYW5nZURldGVjdG9yUmVmKSB7fVxyXG4gICAgICBcclxuICAgIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcclxuICAgICAgICB0aGlzLmluaXRUYWJzKCk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy50YWJQYW5lbHMuY2hhbmdlcy5zdWJzY3JpYmUoXyA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5pdFRhYnMoKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBuZ0FmdGVyVmlld0NoZWNrZWQoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMudGFiQ2hhbmdlZCkge1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUlua0JhcigpO1xyXG4gICAgICAgICAgICB0aGlzLnRhYkNoYW5nZWQgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGluaXRUYWJzKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMudGFicyA9IHRoaXMudGFiUGFuZWxzLnRvQXJyYXkoKTtcclxuICAgICAgICBsZXQgc2VsZWN0ZWRUYWI6IFRhYlBhbmVsID0gdGhpcy5maW5kU2VsZWN0ZWRUYWIoKTtcclxuICAgICAgICBpZiAoIXNlbGVjdGVkVGFiICYmIHRoaXMudGFicy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuYWN0aXZlSW5kZXggIT0gbnVsbCAmJiB0aGlzLnRhYnMubGVuZ3RoID4gdGhpcy5hY3RpdmVJbmRleClcclxuICAgICAgICAgICAgICAgIHRoaXMudGFic1t0aGlzLmFjdGl2ZUluZGV4XS5zZWxlY3RlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHRoaXMudGFic1swXS5zZWxlY3RlZCA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnRhYkNoYW5nZWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5jZC5tYXJrRm9yQ2hlY2soKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgb3BlbihldmVudDogRXZlbnQsIHRhYjogVGFiUGFuZWwpIHtcclxuICAgICAgICBpZiAodGFiLmRpc2FibGVkKSB7XHJcbiAgICAgICAgICAgIGlmIChldmVudCkge1xyXG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIGlmICghdGFiLnNlbGVjdGVkKSB7XHJcbiAgICAgICAgICAgIGxldCBzZWxlY3RlZFRhYjogVGFiUGFuZWwgPSB0aGlzLmZpbmRTZWxlY3RlZFRhYigpO1xyXG4gICAgICAgICAgICBpZiAoc2VsZWN0ZWRUYWIpIHtcclxuICAgICAgICAgICAgICAgIHNlbGVjdGVkVGFiLnNlbGVjdGVkID0gZmFsc2VcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy50YWJDaGFuZ2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGFiLnNlbGVjdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgbGV0IHNlbGVjdGVkVGFiSW5kZXggPSB0aGlzLmZpbmRUYWJJbmRleCh0YWIpO1xyXG4gICAgICAgICAgICB0aGlzLnByZXZlbnRBY3RpdmVJbmRleFByb3BhZ2F0aW9uID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5hY3RpdmVJbmRleENoYW5nZS5lbWl0KHNlbGVjdGVkVGFiSW5kZXgpO1xyXG4gICAgICAgICAgICB0aGlzLm9uQ2hhbmdlLmVtaXQoe29yaWdpbmFsRXZlbnQ6IGV2ZW50LCBpbmRleDogc2VsZWN0ZWRUYWJJbmRleH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBpZiAoZXZlbnQpIHtcclxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGNsb3NlKGV2ZW50OiBFdmVudCwgdGFiOiBUYWJQYW5lbCkge1xyXG4gICAgICAgIGlmICh0aGlzLmNvbnRyb2xDbG9zZSkge1xyXG4gICAgICAgICAgICB0aGlzLm9uQ2xvc2UuZW1pdCh7XHJcbiAgICAgICAgICAgICAgICBvcmlnaW5hbEV2ZW50OiBldmVudCxcclxuICAgICAgICAgICAgICAgIGluZGV4OiB0aGlzLmZpbmRUYWJJbmRleCh0YWIpLFxyXG4gICAgICAgICAgICAgICAgY2xvc2U6ICgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNsb3NlVGFiKHRhYik7XHJcbiAgICAgICAgICAgICAgICB9fVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5jbG9zZVRhYih0YWIpO1xyXG4gICAgICAgICAgICB0aGlzLm9uQ2xvc2UuZW1pdCh7XHJcbiAgICAgICAgICAgICAgICBvcmlnaW5hbEV2ZW50OiBldmVudCxcclxuICAgICAgICAgICAgICAgIGluZGV4OiB0aGlzLmZpbmRUYWJJbmRleCh0YWIpXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgY2xvc2VUYWIodGFiOiBUYWJQYW5lbCkge1xyXG4gICAgICAgIGlmICh0YWIuZGlzYWJsZWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGFiLnNlbGVjdGVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMudGFiQ2hhbmdlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIHRhYi5zZWxlY3RlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgdGhpcy50YWJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgdGFiUGFuZWwgPSB0aGlzLnRhYnNbaV07XHJcbiAgICAgICAgICAgICAgICBpZiAoIXRhYlBhbmVsLmNsb3NlZCYmIXRhYi5kaXNhYmxlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRhYlBhbmVsLnNlbGVjdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICB0YWIuY2xvc2VkID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZmluZFNlbGVjdGVkVGFiKCkge1xyXG4gICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCB0aGlzLnRhYnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMudGFic1tpXS5zZWxlY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudGFic1tpXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZmluZFRhYkluZGV4KHRhYjogVGFiUGFuZWwpIHtcclxuICAgICAgICBsZXQgaW5kZXggPSAtMTtcclxuICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgdGhpcy50YWJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnRhYnNbaV0gPT0gdGFiKSB7XHJcbiAgICAgICAgICAgICAgICBpbmRleCA9IGk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaW5kZXg7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIGdldEJsb2NrYWJsZUVsZW1lbnQoKTogSFRNTEVsZW1lbnTCoHtcclxuICAgICAgICByZXR1cm4gdGhpcy5lbC5uYXRpdmVFbGVtZW50LmNoaWxkcmVuWzBdO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBASW5wdXQoKSBnZXQgYWN0aXZlSW5kZXgoKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fYWN0aXZlSW5kZXg7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IGFjdGl2ZUluZGV4KHZhbDpudW1iZXIpIHtcclxuICAgICAgICB0aGlzLl9hY3RpdmVJbmRleCA9IHZhbDtcclxuICAgICAgICBpZiAodGhpcy5wcmV2ZW50QWN0aXZlSW5kZXhQcm9wYWdhdGlvbikge1xyXG4gICAgICAgICAgICB0aGlzLnByZXZlbnRBY3RpdmVJbmRleFByb3BhZ2F0aW9uID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnRhYnMgJiYgdGhpcy50YWJzLmxlbmd0aCAmJiB0aGlzLl9hY3RpdmVJbmRleCAhPSBudWxsICYmIHRoaXMudGFicy5sZW5ndGggPiB0aGlzLl9hY3RpdmVJbmRleCkge1xyXG4gICAgICAgICAgICB0aGlzLmZpbmRTZWxlY3RlZFRhYigpLnNlbGVjdGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMudGFic1t0aGlzLl9hY3RpdmVJbmRleF0uc2VsZWN0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLnRhYkNoYW5nZWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVJbmtCYXIoKSB7XHJcbiAgICAgICAgbGV0IHRhYkhlYWRlciA9IERvbUhhbmRsZXIuZmluZFNpbmdsZSh0aGlzLm5hdmJhci5uYXRpdmVFbGVtZW50LCAnbGkucC1oaWdobGlnaHQnKTtcclxuICAgICAgICB0aGlzLmlua2Jhci5uYXRpdmVFbGVtZW50LnN0eWxlLndpZHRoID0gRG9tSGFuZGxlci5nZXRXaWR0aCh0YWJIZWFkZXIpICsgJ3B4JztcclxuICAgICAgICB0aGlzLmlua2Jhci5uYXRpdmVFbGVtZW50LnN0eWxlLmxlZnQgPSAgRG9tSGFuZGxlci5nZXRPZmZzZXQodGFiSGVhZGVyKS5sZWZ0IC0gRG9tSGFuZGxlci5nZXRPZmZzZXQodGhpcy5uYXZiYXIubmF0aXZlRWxlbWVudCkubGVmdCArICdweCc7XHJcbiAgICB9XHJcbn1cclxuXHJcblxyXG5ATmdNb2R1bGUoe1xyXG4gICAgaW1wb3J0czogW0NvbW1vbk1vZHVsZSxTaGFyZWRNb2R1bGUsVG9vbHRpcE1vZHVsZSxSaXBwbGVNb2R1bGVdLFxyXG4gICAgZXhwb3J0czogW1RhYlZpZXcsVGFiUGFuZWwsU2hhcmVkTW9kdWxlXSxcclxuICAgIGRlY2xhcmF0aW9uczogW1RhYlZpZXcsVGFiUGFuZWxdXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBUYWJWaWV3TW9kdWxlIHsgfVxyXG4iXX0=