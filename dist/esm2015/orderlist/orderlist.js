import { NgModule, Component, ElementRef, Input, Output, ContentChildren, EventEmitter, ViewChild, ChangeDetectionStrategy, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { SharedModule, PrimeTemplate, FilterService } from 'primeng/api';
import { DomHandler } from 'primeng/dom';
import { ObjectUtils, UniqueComponentId } from 'primeng/utils';
import { RippleModule } from 'primeng/ripple';
import { DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
export class OrderList {
    constructor(el, cd, filterService) {
        this.el = el;
        this.cd = cd;
        this.filterService = filterService;
        this.metaKeySelection = true;
        this.dragdrop = false;
        this.controlsPosition = 'left';
        this.filterMatchMode = "contains";
        this.breakpoint = "960px";
        this.selectionChange = new EventEmitter();
        this.trackBy = (index, item) => item;
        this.onReorder = new EventEmitter();
        this.onSelectionChange = new EventEmitter();
        this.onFilterEvent = new EventEmitter();
        this.id = UniqueComponentId();
    }
    get selection() {
        return this._selection;
    }
    set selection(val) {
        this._selection = val;
    }
    ngOnInit() {
        if (this.responsive) {
            this.createStyle();
        }
    }
    ngAfterContentInit() {
        this.templates.forEach((item) => {
            switch (item.getType()) {
                case 'item':
                    this.itemTemplate = item.template;
                    break;
                case 'empty':
                    this.emptyMessageTemplate = item.template;
                    break;
                case 'emptyfilter':
                    this.emptyFilterMessageTemplate = item.template;
                    break;
                case 'header':
                    this.headerTemplate = item.template;
                    break;
                default:
                    this.itemTemplate = item.template;
                    break;
            }
        });
    }
    ngAfterViewChecked() {
        if (this.movedUp || this.movedDown) {
            let listItems = DomHandler.find(this.listViewChild.nativeElement, 'li.p-highlight');
            let listItem;
            if (listItems.length > 0) {
                if (this.movedUp)
                    listItem = listItems[0];
                else
                    listItem = listItems[listItems.length - 1];
                DomHandler.scrollInView(this.listViewChild.nativeElement, listItem);
            }
            this.movedUp = false;
            this.movedDown = false;
        }
    }
    get value() {
        return this._value;
    }
    set value(val) {
        this._value = val;
        if (this.filterValue) {
            this.filter();
        }
    }
    onItemClick(event, item, index) {
        this.itemTouched = false;
        let selectedIndex = ObjectUtils.findIndexInList(item, this.selection);
        let selected = (selectedIndex != -1);
        let metaSelection = this.itemTouched ? false : this.metaKeySelection;
        if (metaSelection) {
            let metaKey = (event.metaKey || event.ctrlKey || event.shiftKey);
            if (selected && metaKey) {
                this._selection = this._selection.filter((val, index) => index !== selectedIndex);
            }
            else {
                this._selection = (metaKey) ? this._selection ? [...this._selection] : [] : [];
                ObjectUtils.insertIntoOrderedArray(item, index, this._selection, this.value);
            }
        }
        else {
            if (selected) {
                this._selection = this._selection.filter((val, index) => index !== selectedIndex);
            }
            else {
                this._selection = this._selection ? [...this._selection] : [];
                ObjectUtils.insertIntoOrderedArray(item, index, this._selection, this.value);
            }
        }
        //binding
        this.selectionChange.emit(this._selection);
        //event
        this.onSelectionChange.emit({ originalEvent: event, value: this._selection });
    }
    onFilterKeyup(event) {
        this.filterValue = event.target.value.trim().toLocaleLowerCase(this.filterLocale);
        this.filter();
        this.onFilterEvent.emit({
            originalEvent: event,
            value: this.visibleOptions
        });
    }
    filter() {
        let searchFields = this.filterBy.split(',');
        this.visibleOptions = this.filterService.filter(this.value, searchFields, this.filterValue, this.filterMatchMode, this.filterLocale);
    }
    isItemVisible(item) {
        if (this.filterValue && this.filterValue.trim().length) {
            for (let i = 0; i < this.visibleOptions.length; i++) {
                if (item == this.visibleOptions[i]) {
                    return true;
                }
            }
        }
        else {
            return true;
        }
    }
    onItemTouchEnd() {
        this.itemTouched = true;
    }
    isSelected(item) {
        return ObjectUtils.findIndexInList(item, this.selection) != -1;
    }
    isEmpty() {
        return this.filterValue ? (!this.visibleOptions || this.visibleOptions.length === 0) : (!this.value || this.value.length === 0);
    }
    moveUp() {
        if (this.selection) {
            for (let i = 0; i < this.selection.length; i++) {
                let selectedItem = this.selection[i];
                let selectedItemIndex = ObjectUtils.findIndexInList(selectedItem, this.value);
                if (selectedItemIndex != 0) {
                    let movedItem = this.value[selectedItemIndex];
                    let temp = this.value[selectedItemIndex - 1];
                    this.value[selectedItemIndex - 1] = movedItem;
                    this.value[selectedItemIndex] = temp;
                }
                else {
                    break;
                }
            }
            if (this.dragdrop && this.filterValue)
                this.filter();
            this.movedUp = true;
            this.onReorder.emit(this.selection);
        }
    }
    moveTop() {
        if (this.selection) {
            for (let i = this.selection.length - 1; i >= 0; i--) {
                let selectedItem = this.selection[i];
                let selectedItemIndex = ObjectUtils.findIndexInList(selectedItem, this.value);
                if (selectedItemIndex != 0) {
                    let movedItem = this.value.splice(selectedItemIndex, 1)[0];
                    this.value.unshift(movedItem);
                }
                else {
                    break;
                }
            }
            if (this.dragdrop && this.filterValue)
                this.filter();
            this.onReorder.emit(this.selection);
            this.listViewChild.nativeElement.scrollTop = 0;
        }
    }
    moveDown() {
        if (this.selection) {
            for (let i = this.selection.length - 1; i >= 0; i--) {
                let selectedItem = this.selection[i];
                let selectedItemIndex = ObjectUtils.findIndexInList(selectedItem, this.value);
                if (selectedItemIndex != (this.value.length - 1)) {
                    let movedItem = this.value[selectedItemIndex];
                    let temp = this.value[selectedItemIndex + 1];
                    this.value[selectedItemIndex + 1] = movedItem;
                    this.value[selectedItemIndex] = temp;
                }
                else {
                    break;
                }
            }
            if (this.dragdrop && this.filterValue)
                this.filter();
            this.movedDown = true;
            this.onReorder.emit(this.selection);
        }
    }
    moveBottom() {
        if (this.selection) {
            for (let i = 0; i < this.selection.length; i++) {
                let selectedItem = this.selection[i];
                let selectedItemIndex = ObjectUtils.findIndexInList(selectedItem, this.value);
                if (selectedItemIndex != (this.value.length - 1)) {
                    let movedItem = this.value.splice(selectedItemIndex, 1)[0];
                    this.value.push(movedItem);
                }
                else {
                    break;
                }
            }
            if (this.dragdrop && this.filterValue)
                this.filter();
            this.onReorder.emit(this.selection);
            this.listViewChild.nativeElement.scrollTop = this.listViewChild.nativeElement.scrollHeight;
        }
    }
    onDrop(event) {
        let previousIndex = event.previousIndex;
        let currentIndex = event.currentIndex;
        if (previousIndex !== currentIndex) {
            if (this.visibleOptions) {
                if (this.filterValue) {
                    previousIndex = ObjectUtils.findIndexInList(event.item.data, this.value);
                    currentIndex = ObjectUtils.findIndexInList(this.visibleOptions[currentIndex], this.value);
                }
                moveItemInArray(this.visibleOptions, event.previousIndex, event.currentIndex);
            }
            moveItemInArray(this.value, previousIndex, currentIndex);
            this.onReorder.emit([event.item.data]);
        }
    }
    onItemKeydown(event, item, index) {
        let listItem = event.currentTarget;
        switch (event.which) {
            //down
            case 40:
                var nextItem = this.findNextItem(listItem);
                if (nextItem) {
                    nextItem.focus();
                }
                event.preventDefault();
                break;
            //up
            case 38:
                var prevItem = this.findPrevItem(listItem);
                if (prevItem) {
                    prevItem.focus();
                }
                event.preventDefault();
                break;
            //enter
            case 13:
                this.onItemClick(event, item, index);
                event.preventDefault();
                break;
        }
    }
    findNextItem(item) {
        let nextItem = item.nextElementSibling;
        if (nextItem)
            return !DomHandler.hasClass(nextItem, 'p-orderlist-item') || DomHandler.isHidden(nextItem) ? this.findNextItem(nextItem) : nextItem;
        else
            return null;
    }
    findPrevItem(item) {
        let prevItem = item.previousElementSibling;
        if (prevItem)
            return !DomHandler.hasClass(prevItem, 'p-orderlist-item') || DomHandler.isHidden(prevItem) ? this.findPrevItem(prevItem) : prevItem;
        else
            return null;
    }
    createStyle() {
        if (!this.styleElement) {
            this.el.nativeElement.children[0].setAttribute(this.id, '');
            this.styleElement = document.createElement('style');
            this.styleElement.type = 'text/css';
            document.head.appendChild(this.styleElement);
            let innerHTML = `
                @media screen and (max-width: ${this.breakpoint}) {
                    .p-orderlist[${this.id}] {
                        flex-direction: column;
                    }

                    .p-orderlist[${this.id}] .p-orderlist-controls {
                        padding: var(--content-padding);
                        flex-direction: row;
                    }

                    .p-orderlist[${this.id}] .p-orderlist-controls .p-button {
                        margin-right: var(--inline-spacing);
                        margin-bottom: 0;
                    }

                    .p-orderlist[${this.id}] .p-orderlist-controls .p-button:last-child {
                        margin-right: 0;
                    }
                }
            `;
            this.styleElement.innerHTML = innerHTML;
        }
    }
    destroyStyle() {
        if (this.styleElement) {
            document.head.removeChild(this.styleElement);
            this.styleElement = null;
            ``;
        }
    }
    ngOnDestroy() {
        this.destroyStyle();
    }
}
OrderList.decorators = [
    { type: Component, args: [{
                selector: 'p-orderList',
                template: `
        <div [ngClass]="{'p-orderlist p-component': true, 'p-orderlist-controls-left': controlsPosition === 'left',
                    'p-orderlist-controls-right': controlsPosition === 'right'}" [ngStyle]="style" [class]="styleClass">
            <div class="p-orderlist-controls">
                <button type="button" pButton pRipple icon="pi pi-angle-up" (click)="moveUp()"></button>
                <button type="button" pButton pRipple icon="pi pi-angle-double-up" (click)="moveTop()"></button>
                <button type="button" pButton pRipple icon="pi pi-angle-down" (click)="moveDown()"></button>
                <button type="button" pButton pRipple icon="pi pi-angle-double-down" (click)="moveBottom()"></button>
            </div>
            <div class="p-orderlist-list-container">
                <div class="p-orderlist-header" *ngIf="header || headerTemplate">
                    <div class="p-orderlist-title" *ngIf="!headerTemplate">{{header}}</div>
                    <ng-container *ngTemplateOutlet="headerTemplate"></ng-container>
                </div>
                <div class="p-orderlist-filter-container" *ngIf="filterBy">
                    <div class="p-orderlist-filter">
                        <input type="text" role="textbox" (keyup)="onFilterKeyup($event)" class="p-orderlist-filter-input p-inputtext p-component" [attr.placeholder]="filterPlaceholder" [attr.aria-label]="ariaFilterLabel">
                        <span class="p-orderlist-filter-icon pi pi-search"></span>
                    </div>
                </div>
                <ul #listelement cdkDropList (cdkDropListDropped)="onDrop($event)" class="p-orderlist-list" [ngStyle]="listStyle">
                    <ng-template ngFor [ngForTrackBy]="trackBy" let-item [ngForOf]="value" let-i="index" let-l="last">
                        <li class="p-orderlist-item" tabindex="0" [ngClass]="{'p-highlight':isSelected(item)}" cdkDrag pRipple [cdkDragData]="item" [cdkDragDisabled]="!dragdrop"
                            (click)="onItemClick($event,item,i)" (touchend)="onItemTouchEnd()" (keydown)="onItemKeydown($event,item,i)"
                             *ngIf="isItemVisible(item)" role="option" [attr.aria-selected]="isSelected(item)">
                            <ng-container *ngTemplateOutlet="itemTemplate; context: {$implicit: item, index: i}"></ng-container>
                        </li>
                    </ng-template>
                    <ng-container *ngIf="isEmpty() && (emptyMessageTemplate || emptyFilterMessageTemplate)">
                        <li *ngIf="!filterValue || !emptyFilterMessageTemplate" class="p-orderlist-empty-message">
                            <ng-container *ngTemplateOutlet="emptyMessageTemplate"></ng-container>
                        </li>
                        <li *ngIf="filterValue" class="p-orderlist-empty-message">
                            <ng-container *ngTemplateOutlet="emptyFilterMessageTemplate"></ng-container>
                        </li>
                    </ng-container>
                </ul>
            </div>
        </div>
    `,
                changeDetection: ChangeDetectionStrategy.OnPush,
                encapsulation: ViewEncapsulation.None,
                styles: [".p-orderlist{display:flex}.p-orderlist-controls{display:flex;flex-direction:column;justify-content:center}.p-orderlist-list-container{flex:1 1 auto}.p-orderlist-list{list-style-type:none;margin:0;min-height:12rem;overflow:auto;padding:0}.p-orderlist-item{cursor:pointer;display:block;overflow:hidden;position:relative}.p-orderlist-item:not(.cdk-drag-disabled){cursor:move}.p-orderlist-item.cdk-drag-placeholder{opacity:0}.p-orderlist-item.cdk-drag-animating{transition:transform .25s cubic-bezier(0,0,.2,1)}.p-orderlist.p-state-disabled .p-button,.p-orderlist.p-state-disabled .p-orderlist-item{cursor:default}.p-orderlist.p-state-disabled .p-orderlist-list{overflow:hidden}.p-orderlist-filter{position:relative}.p-orderlist-filter-icon{margin-top:-.5rem;position:absolute;top:50%}.p-orderlist-filter-input{width:100%}.p-orderlist-controls-right .p-orderlist-controls{order:2}.p-orderlist-controls-right .p-orderlist-list-container{order:1}.p-orderlist-list.cdk-drop-list-dragging .p-orderlist-item:not(.cdk-drag-placeholder){transition:transform .25s cubic-bezier(0,0,.2,1)}"]
            },] }
];
OrderList.ctorParameters = () => [
    { type: ElementRef },
    { type: ChangeDetectorRef },
    { type: FilterService }
];
OrderList.propDecorators = {
    header: [{ type: Input }],
    style: [{ type: Input }],
    styleClass: [{ type: Input }],
    listStyle: [{ type: Input }],
    responsive: [{ type: Input }],
    filterBy: [{ type: Input }],
    filterPlaceholder: [{ type: Input }],
    filterLocale: [{ type: Input }],
    metaKeySelection: [{ type: Input }],
    dragdrop: [{ type: Input }],
    controlsPosition: [{ type: Input }],
    ariaFilterLabel: [{ type: Input }],
    filterMatchMode: [{ type: Input }],
    breakpoint: [{ type: Input }],
    selectionChange: [{ type: Output }],
    trackBy: [{ type: Input }],
    onReorder: [{ type: Output }],
    onSelectionChange: [{ type: Output }],
    onFilterEvent: [{ type: Output }],
    listViewChild: [{ type: ViewChild, args: ['listelement',] }],
    templates: [{ type: ContentChildren, args: [PrimeTemplate,] }],
    selection: [{ type: Input }],
    value: [{ type: Input }]
};
export class OrderListModule {
}
OrderListModule.decorators = [
    { type: NgModule, args: [{
                imports: [CommonModule, ButtonModule, SharedModule, RippleModule, DragDropModule],
                exports: [OrderList, SharedModule, DragDropModule],
                declarations: [OrderList]
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3JkZXJsaXN0LmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLy4uL3NyYy9hcHAvY29tcG9uZW50cy9vcmRlcmxpc3QvIiwic291cmNlcyI6WyJvcmRlcmxpc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFFBQVEsRUFBQyxTQUFTLEVBQUMsVUFBVSxFQUFtQyxLQUFLLEVBQUMsTUFBTSxFQUFDLGVBQWUsRUFBdUIsWUFBWSxFQUFDLFNBQVMsRUFBQyx1QkFBdUIsRUFBRSxpQkFBaUIsRUFBRSxpQkFBaUIsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN0TyxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDN0MsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQzVDLE9BQU8sRUFBQyxZQUFZLEVBQUMsYUFBYSxFQUFDLGFBQWEsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUNyRSxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQ3ZDLE9BQU8sRUFBQyxXQUFXLEVBQUUsaUJBQWlCLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDN0QsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQzVDLE9BQU8sRUFBYyxjQUFjLEVBQUUsZUFBZSxFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFnRHBGLE1BQU0sT0FBTyxTQUFTO0lBc0VsQixZQUFtQixFQUFjLEVBQVMsRUFBcUIsRUFBUyxhQUE0QjtRQUFqRixPQUFFLEdBQUYsRUFBRSxDQUFZO1FBQVMsT0FBRSxHQUFGLEVBQUUsQ0FBbUI7UUFBUyxrQkFBYSxHQUFiLGFBQWEsQ0FBZTtRQXBEM0YscUJBQWdCLEdBQVksSUFBSSxDQUFDO1FBRWpDLGFBQVEsR0FBWSxLQUFLLENBQUM7UUFFMUIscUJBQWdCLEdBQVcsTUFBTSxDQUFDO1FBSWxDLG9CQUFlLEdBQVcsVUFBVSxDQUFDO1FBRXJDLGVBQVUsR0FBVyxPQUFPLENBQUM7UUFFNUIsb0JBQWUsR0FBc0IsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUV6RCxZQUFPLEdBQWEsQ0FBQyxLQUFhLEVBQUUsSUFBUyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUM7UUFFdEQsY0FBUyxHQUFzQixJQUFJLFlBQVksRUFBRSxDQUFDO1FBRWxELHNCQUFpQixHQUFzQixJQUFJLFlBQVksRUFBRSxDQUFDO1FBRTFELGtCQUFhLEdBQXNCLElBQUksWUFBWSxFQUFFLENBQUM7UUF3QmhFLE9BQUUsR0FBVyxpQkFBaUIsRUFBRSxDQUFDO0lBUXNFLENBQUM7SUFFeEcsSUFBSSxTQUFTO1FBQ1QsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDO0lBQzNCLENBQUM7SUFFRCxJQUFhLFNBQVMsQ0FBQyxHQUFTO1FBQzVCLElBQUksQ0FBQyxVQUFVLEdBQUcsR0FBRyxDQUFDO0lBQzFCLENBQUM7SUFFRCxRQUFRO1FBQ0osSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ2pCLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztTQUN0QjtJQUNMLENBQUM7SUFFRCxrQkFBa0I7UUFDZCxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO1lBQzVCLFFBQU8sSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFO2dCQUNuQixLQUFLLE1BQU07b0JBQ1AsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO29CQUN0QyxNQUFNO2dCQUVOLEtBQUssT0FBTztvQkFDUixJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztvQkFDOUMsTUFBTTtnQkFFTixLQUFLLGFBQWE7b0JBQ2QsSUFBSSxDQUFDLDBCQUEwQixHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7b0JBQ3BELE1BQU07Z0JBRU4sS0FBSyxRQUFRO29CQUNULElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztvQkFDeEMsTUFBTTtnQkFFTjtvQkFDSSxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7b0JBQ3RDLE1BQU07YUFDVDtRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELGtCQUFrQjtRQUNkLElBQUksSUFBSSxDQUFDLE9BQU8sSUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQzlCLElBQUksU0FBUyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFhLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztZQUNwRixJQUFJLFFBQVEsQ0FBQztZQUViLElBQUksU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQ3RCLElBQUksSUFBSSxDQUFDLE9BQU87b0JBQ1osUUFBUSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7b0JBRXhCLFFBQVEsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFFL0MsVUFBVSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUMsQ0FBQzthQUN2RTtZQUNELElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1lBQ3JCLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1NBQzFCO0lBQ0wsQ0FBQztJQUVELElBQUksS0FBSztRQUNMLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUN2QixDQUFDO0lBRUQsSUFBYSxLQUFLLENBQUMsR0FBUztRQUN4QixJQUFJLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQztRQUNsQixJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDbEIsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1NBQ2pCO0lBQ0wsQ0FBQztJQUVELFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUs7UUFDMUIsSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7UUFDekIsSUFBSSxhQUFhLEdBQUcsV0FBVyxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3RFLElBQUksUUFBUSxHQUFHLENBQUMsYUFBYSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDckMsSUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7UUFFckUsSUFBSSxhQUFhLEVBQUU7WUFDZixJQUFJLE9BQU8sR0FBRyxDQUFDLEtBQUssQ0FBQyxPQUFPLElBQUUsS0FBSyxDQUFDLE9BQU8sSUFBRSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFN0QsSUFBSSxRQUFRLElBQUksT0FBTyxFQUFFO2dCQUNyQixJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBSyxLQUFLLGFBQWEsQ0FBQyxDQUFDO2FBQ3JGO2lCQUNJO2dCQUNELElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7Z0JBQy9FLFdBQVcsQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ2hGO1NBQ0o7YUFDSTtZQUNELElBQUksUUFBUSxFQUFFO2dCQUNWLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLLEtBQUssYUFBYSxDQUFDLENBQUM7YUFDckY7aUJBQ0k7Z0JBQ0QsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7Z0JBQzlELFdBQVcsQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ2hGO1NBQ0o7UUFFRCxTQUFTO1FBQ1QsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRTNDLE9BQU87UUFDUCxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEVBQUMsYUFBYSxFQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBQyxDQUFDLENBQUM7SUFDL0UsQ0FBQztJQUVELGFBQWEsQ0FBQyxLQUFLO1FBQ2YsSUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDbEYsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBRWQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUM7WUFDcEIsYUFBYSxFQUFFLEtBQUs7WUFDcEIsS0FBSyxFQUFFLElBQUksQ0FBQyxjQUFjO1NBQzdCLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxNQUFNO1FBQ0YsSUFBSSxZQUFZLEdBQWEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdEQsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLFlBQVksRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ3pJLENBQUM7SUFFRCxhQUFhLENBQUMsSUFBUztRQUNuQixJQUFJLElBQUksQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLEVBQUU7WUFDcEQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNqRCxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxFQUFFO29CQUNoQyxPQUFPLElBQUksQ0FBQztpQkFDZjthQUNKO1NBQ0o7YUFDSTtZQUNELE9BQU8sSUFBSSxDQUFDO1NBQ2Y7SUFDTCxDQUFDO0lBRUQsY0FBYztRQUNWLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO0lBQzVCLENBQUM7SUFFRCxVQUFVLENBQUMsSUFBUztRQUNoQixPQUFPLFdBQVcsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNuRSxDQUFDO0lBRUQsT0FBTztRQUNILE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxjQUFjLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3BJLENBQUM7SUFFRCxNQUFNO1FBQ0YsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ2hCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDNUMsSUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDckMsSUFBSSxpQkFBaUIsR0FBVyxXQUFXLENBQUMsZUFBZSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBRXRGLElBQUksaUJBQWlCLElBQUksQ0FBQyxFQUFFO29CQUN4QixJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7b0JBQzlDLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsaUJBQWlCLEdBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzNDLElBQUksQ0FBQyxLQUFLLENBQUMsaUJBQWlCLEdBQUMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDO29CQUM1QyxJQUFJLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLEdBQUcsSUFBSSxDQUFDO2lCQUN4QztxQkFDSTtvQkFDRCxNQUFNO2lCQUNUO2FBQ0o7WUFFRCxJQUFJLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLFdBQVc7Z0JBQ2pDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUVsQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztZQUNwQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDdkM7SUFDTCxDQUFDO0lBRUQsT0FBTztRQUNILElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNoQixLQUFLLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNqRCxJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNyQyxJQUFJLGlCQUFpQixHQUFXLFdBQVcsQ0FBQyxlQUFlLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFFdEYsSUFBSSxpQkFBaUIsSUFBSSxDQUFDLEVBQUU7b0JBQ3hCLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLGlCQUFpQixFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUMxRCxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztpQkFDakM7cUJBQ0k7b0JBQ0QsTUFBTTtpQkFDVDthQUNKO1lBRUQsSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxXQUFXO2dCQUNqQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFFbEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3BDLElBQUksQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7U0FDbEQ7SUFDTCxDQUFDO0lBRUQsUUFBUTtRQUNKLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNoQixLQUFLLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNqRCxJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNyQyxJQUFJLGlCQUFpQixHQUFXLFdBQVcsQ0FBQyxlQUFlLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFFdEYsSUFBSSxpQkFBaUIsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxFQUFFO29CQUM5QyxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7b0JBQzlDLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsaUJBQWlCLEdBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzNDLElBQUksQ0FBQyxLQUFLLENBQUMsaUJBQWlCLEdBQUMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDO29CQUM1QyxJQUFJLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLEdBQUcsSUFBSSxDQUFDO2lCQUN4QztxQkFDSTtvQkFDRCxNQUFNO2lCQUNUO2FBQ0o7WUFFRCxJQUFJLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLFdBQVc7Z0JBQ2pDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUVsQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztZQUN0QixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDdkM7SUFDTCxDQUFDO0lBRUQsVUFBVTtRQUNOLElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNoQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQzVDLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JDLElBQUksaUJBQWlCLEdBQVcsV0FBVyxDQUFDLGVBQWUsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUV0RixJQUFJLGlCQUFpQixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEVBQUU7b0JBQzlDLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLGlCQUFpQixFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUMxRCxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztpQkFDOUI7cUJBQ0k7b0JBQ0QsTUFBTTtpQkFDVDthQUNKO1lBRUQsSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxXQUFXO2dCQUNqQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFFbEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3BDLElBQUksQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUM7U0FDOUY7SUFDTCxDQUFDO0lBRUQsTUFBTSxDQUFDLEtBQTRCO1FBQy9CLElBQUksYUFBYSxHQUFJLEtBQUssQ0FBQyxhQUFhLENBQUM7UUFDekMsSUFBSSxZQUFZLEdBQUcsS0FBSyxDQUFDLFlBQVksQ0FBQztRQUV0QyxJQUFJLGFBQWEsS0FBSyxZQUFZLEVBQUU7WUFFaEMsSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFO2dCQUNyQixJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7b0JBQ2xCLGFBQWEsR0FBSSxXQUFXLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDMUUsWUFBWSxHQUFHLFdBQVcsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7aUJBQzdGO2dCQUVELGVBQWUsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLEtBQUssQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO2FBQ2pGO1lBRUQsZUFBZSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsYUFBYSxFQUFFLFlBQVksQ0FBQyxDQUFDO1lBQ3pELElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1NBQzFDO0lBQ0wsQ0FBQztJQUVELGFBQWEsQ0FBQyxLQUFvQixFQUFFLElBQUksRUFBRSxLQUFhO1FBQ25ELElBQUksUUFBUSxHQUFtQixLQUFLLENBQUMsYUFBYSxDQUFDO1FBRW5ELFFBQU8sS0FBSyxDQUFDLEtBQUssRUFBRTtZQUNoQixNQUFNO1lBQ04sS0FBSyxFQUFFO2dCQUNILElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQzNDLElBQUksUUFBUSxFQUFFO29CQUNWLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztpQkFDcEI7Z0JBRUQsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO2dCQUMzQixNQUFNO1lBRU4sSUFBSTtZQUNKLEtBQUssRUFBRTtnQkFDSCxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUMzQyxJQUFJLFFBQVEsRUFBRTtvQkFDVixRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7aUJBQ3BCO2dCQUVELEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDM0IsTUFBTTtZQUVOLE9BQU87WUFDUCxLQUFLLEVBQUU7Z0JBQ0gsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUNyQyxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7Z0JBQzNCLE1BQU07U0FDVDtJQUNMLENBQUM7SUFFRCxZQUFZLENBQUMsSUFBSTtRQUNiLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztRQUV2QyxJQUFJLFFBQVE7WUFDUixPQUFPLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsa0JBQWtCLENBQUMsSUFBSSxVQUFVLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7O1lBRXBJLE9BQU8sSUFBSSxDQUFDO0lBQ3BCLENBQUM7SUFFRCxZQUFZLENBQUMsSUFBSTtRQUNiLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQztRQUUzQyxJQUFJLFFBQVE7WUFDUixPQUFPLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsa0JBQWtCLENBQUMsSUFBSSxVQUFVLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUM7O1lBRXBJLE9BQU8sSUFBSSxDQUFDO0lBQ3BCLENBQUM7SUFFRCxXQUFXO1FBQ1AsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUU7WUFDcEIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQzVELElBQUksQ0FBQyxZQUFZLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNwRCxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksR0FBRyxVQUFVLENBQUM7WUFDcEMsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBRTdDLElBQUksU0FBUyxHQUFHO2dEQUNvQixJQUFJLENBQUMsVUFBVTttQ0FDNUIsSUFBSSxDQUFDLEVBQUU7Ozs7bUNBSVAsSUFBSSxDQUFDLEVBQUU7Ozs7O21DQUtQLElBQUksQ0FBQyxFQUFFOzs7OzttQ0FLUCxJQUFJLENBQUMsRUFBRTs7OzthQUk3QixDQUFDO1lBRUYsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO1NBQzNDO0lBQ0wsQ0FBQztJQUVELFlBQVk7UUFDUixJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUU7WUFDbkIsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQzdDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO1lBQUEsRUFBRSxDQUFBO1NBQzlCO0lBQ0wsQ0FBQztJQUVELFdBQVc7UUFDUCxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDeEIsQ0FBQzs7O1lBcmRKLFNBQVMsU0FBQztnQkFDUCxRQUFRLEVBQUUsYUFBYTtnQkFDdkIsUUFBUSxFQUFFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7S0F1Q1Q7Z0JBQ0QsZUFBZSxFQUFFLHVCQUF1QixDQUFDLE1BQU07Z0JBQy9DLGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJOzthQUV4Qzs7O1lBdEQwQixVQUFVO1lBQXlKLGlCQUFpQjtZQUc1SyxhQUFhOzs7cUJBc0QzQyxLQUFLO29CQUVMLEtBQUs7eUJBRUwsS0FBSzt3QkFFTCxLQUFLO3lCQUVMLEtBQUs7dUJBRUwsS0FBSztnQ0FFTCxLQUFLOzJCQUVMLEtBQUs7K0JBRUwsS0FBSzt1QkFFTCxLQUFLOytCQUVMLEtBQUs7OEJBRUwsS0FBSzs4QkFFTCxLQUFLO3lCQUVMLEtBQUs7OEJBRUwsTUFBTTtzQkFFTixLQUFLO3dCQUVMLE1BQU07Z0NBRU4sTUFBTTs0QkFFTixNQUFNOzRCQUVOLFNBQVMsU0FBQyxhQUFhO3dCQUV2QixlQUFlLFNBQUMsYUFBYTt3QkFrQzdCLEtBQUs7b0JBMERMLEtBQUs7O0FBeVNWLE1BQU0sT0FBTyxlQUFlOzs7WUFMM0IsUUFBUSxTQUFDO2dCQUNOLE9BQU8sRUFBRSxDQUFDLFlBQVksRUFBQyxZQUFZLEVBQUMsWUFBWSxFQUFDLFlBQVksRUFBQyxjQUFjLENBQUM7Z0JBQzdFLE9BQU8sRUFBRSxDQUFDLFNBQVMsRUFBQyxZQUFZLEVBQUMsY0FBYyxDQUFDO2dCQUNoRCxZQUFZLEVBQUUsQ0FBQyxTQUFTLENBQUM7YUFDNUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge05nTW9kdWxlLENvbXBvbmVudCxFbGVtZW50UmVmLEFmdGVyVmlld0NoZWNrZWQsQWZ0ZXJDb250ZW50SW5pdCxJbnB1dCxPdXRwdXQsQ29udGVudENoaWxkcmVuLFF1ZXJ5TGlzdCxUZW1wbGF0ZVJlZixFdmVudEVtaXR0ZXIsVmlld0NoaWxkLENoYW5nZURldGVjdGlvblN0cmF0ZWd5LCBWaWV3RW5jYXBzdWxhdGlvbiwgQ2hhbmdlRGV0ZWN0b3JSZWZ9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQge0NvbW1vbk1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcclxuaW1wb3J0IHtCdXR0b25Nb2R1bGV9IGZyb20gJ3ByaW1lbmcvYnV0dG9uJztcclxuaW1wb3J0IHtTaGFyZWRNb2R1bGUsUHJpbWVUZW1wbGF0ZSxGaWx0ZXJTZXJ2aWNlfSBmcm9tICdwcmltZW5nL2FwaSc7XHJcbmltcG9ydCB7RG9tSGFuZGxlcn0gZnJvbSAncHJpbWVuZy9kb20nO1xyXG5pbXBvcnQge09iamVjdFV0aWxzLCBVbmlxdWVDb21wb25lbnRJZH0gZnJvbSAncHJpbWVuZy91dGlscyc7XHJcbmltcG9ydCB7UmlwcGxlTW9kdWxlfSBmcm9tICdwcmltZW5nL3JpcHBsZSc7XHJcbmltcG9ydCB7Q2RrRHJhZ0Ryb3AsIERyYWdEcm9wTW9kdWxlLCBtb3ZlSXRlbUluQXJyYXl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9kcmFnLWRyb3AnO1xyXG5cclxuQENvbXBvbmVudCh7XHJcbiAgICBzZWxlY3RvcjogJ3Atb3JkZXJMaXN0JyxcclxuICAgIHRlbXBsYXRlOiBgXHJcbiAgICAgICAgPGRpdiBbbmdDbGFzc109XCJ7J3Atb3JkZXJsaXN0IHAtY29tcG9uZW50JzogdHJ1ZSwgJ3Atb3JkZXJsaXN0LWNvbnRyb2xzLWxlZnQnOiBjb250cm9sc1Bvc2l0aW9uID09PSAnbGVmdCcsXHJcbiAgICAgICAgICAgICAgICAgICAgJ3Atb3JkZXJsaXN0LWNvbnRyb2xzLXJpZ2h0JzogY29udHJvbHNQb3NpdGlvbiA9PT0gJ3JpZ2h0J31cIiBbbmdTdHlsZV09XCJzdHlsZVwiIFtjbGFzc109XCJzdHlsZUNsYXNzXCI+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwLW9yZGVybGlzdC1jb250cm9sc1wiPlxyXG4gICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgcEJ1dHRvbiBwUmlwcGxlIGljb249XCJwaSBwaS1hbmdsZS11cFwiIChjbGljayk9XCJtb3ZlVXAoKVwiPjwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgcEJ1dHRvbiBwUmlwcGxlIGljb249XCJwaSBwaS1hbmdsZS1kb3VibGUtdXBcIiAoY2xpY2spPVwibW92ZVRvcCgpXCI+PC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBwQnV0dG9uIHBSaXBwbGUgaWNvbj1cInBpIHBpLWFuZ2xlLWRvd25cIiAoY2xpY2spPVwibW92ZURvd24oKVwiPjwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgcEJ1dHRvbiBwUmlwcGxlIGljb249XCJwaSBwaS1hbmdsZS1kb3VibGUtZG93blwiIChjbGljayk9XCJtb3ZlQm90dG9tKClcIj48L2J1dHRvbj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwLW9yZGVybGlzdC1saXN0LWNvbnRhaW5lclwiPlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInAtb3JkZXJsaXN0LWhlYWRlclwiICpuZ0lmPVwiaGVhZGVyIHx8IGhlYWRlclRlbXBsYXRlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInAtb3JkZXJsaXN0LXRpdGxlXCIgKm5nSWY9XCIhaGVhZGVyVGVtcGxhdGVcIj57e2hlYWRlcn19PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPG5nLWNvbnRhaW5lciAqbmdUZW1wbGF0ZU91dGxldD1cImhlYWRlclRlbXBsYXRlXCI+PC9uZy1jb250YWluZXI+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwLW9yZGVybGlzdC1maWx0ZXItY29udGFpbmVyXCIgKm5nSWY9XCJmaWx0ZXJCeVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwLW9yZGVybGlzdC1maWx0ZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgcm9sZT1cInRleHRib3hcIiAoa2V5dXApPVwib25GaWx0ZXJLZXl1cCgkZXZlbnQpXCIgY2xhc3M9XCJwLW9yZGVybGlzdC1maWx0ZXItaW5wdXQgcC1pbnB1dHRleHQgcC1jb21wb25lbnRcIiBbYXR0ci5wbGFjZWhvbGRlcl09XCJmaWx0ZXJQbGFjZWhvbGRlclwiIFthdHRyLmFyaWEtbGFiZWxdPVwiYXJpYUZpbHRlckxhYmVsXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwicC1vcmRlcmxpc3QtZmlsdGVyLWljb24gcGkgcGktc2VhcmNoXCI+PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8dWwgI2xpc3RlbGVtZW50IGNka0Ryb3BMaXN0IChjZGtEcm9wTGlzdERyb3BwZWQpPVwib25Ecm9wKCRldmVudClcIiBjbGFzcz1cInAtb3JkZXJsaXN0LWxpc3RcIiBbbmdTdHlsZV09XCJsaXN0U3R5bGVcIj5cclxuICAgICAgICAgICAgICAgICAgICA8bmctdGVtcGxhdGUgbmdGb3IgW25nRm9yVHJhY2tCeV09XCJ0cmFja0J5XCIgbGV0LWl0ZW0gW25nRm9yT2ZdPVwidmFsdWVcIiBsZXQtaT1cImluZGV4XCIgbGV0LWw9XCJsYXN0XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxsaSBjbGFzcz1cInAtb3JkZXJsaXN0LWl0ZW1cIiB0YWJpbmRleD1cIjBcIiBbbmdDbGFzc109XCJ7J3AtaGlnaGxpZ2h0Jzppc1NlbGVjdGVkKGl0ZW0pfVwiIGNka0RyYWcgcFJpcHBsZSBbY2RrRHJhZ0RhdGFdPVwiaXRlbVwiIFtjZGtEcmFnRGlzYWJsZWRdPVwiIWRyYWdkcm9wXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChjbGljayk9XCJvbkl0ZW1DbGljaygkZXZlbnQsaXRlbSxpKVwiICh0b3VjaGVuZCk9XCJvbkl0ZW1Ub3VjaEVuZCgpXCIgKGtleWRvd24pPVwib25JdGVtS2V5ZG93bigkZXZlbnQsaXRlbSxpKVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKm5nSWY9XCJpc0l0ZW1WaXNpYmxlKGl0ZW0pXCIgcm9sZT1cIm9wdGlvblwiIFthdHRyLmFyaWEtc2VsZWN0ZWRdPVwiaXNTZWxlY3RlZChpdGVtKVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPG5nLWNvbnRhaW5lciAqbmdUZW1wbGF0ZU91dGxldD1cIml0ZW1UZW1wbGF0ZTsgY29udGV4dDogeyRpbXBsaWNpdDogaXRlbSwgaW5kZXg6IGl9XCI+PC9uZy1jb250YWluZXI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvbGk+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9uZy10ZW1wbGF0ZT5cclxuICAgICAgICAgICAgICAgICAgICA8bmctY29udGFpbmVyICpuZ0lmPVwiaXNFbXB0eSgpICYmIChlbXB0eU1lc3NhZ2VUZW1wbGF0ZSB8fCBlbXB0eUZpbHRlck1lc3NhZ2VUZW1wbGF0ZSlcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGxpICpuZ0lmPVwiIWZpbHRlclZhbHVlIHx8ICFlbXB0eUZpbHRlck1lc3NhZ2VUZW1wbGF0ZVwiIGNsYXNzPVwicC1vcmRlcmxpc3QtZW1wdHktbWVzc2FnZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPG5nLWNvbnRhaW5lciAqbmdUZW1wbGF0ZU91dGxldD1cImVtcHR5TWVzc2FnZVRlbXBsYXRlXCI+PC9uZy1jb250YWluZXI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvbGk+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxsaSAqbmdJZj1cImZpbHRlclZhbHVlXCIgY2xhc3M9XCJwLW9yZGVybGlzdC1lbXB0eS1tZXNzYWdlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bmctY29udGFpbmVyICpuZ1RlbXBsYXRlT3V0bGV0PVwiZW1wdHlGaWx0ZXJNZXNzYWdlVGVtcGxhdGVcIj48L25nLWNvbnRhaW5lcj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9saT5cclxuICAgICAgICAgICAgICAgICAgICA8L25nLWNvbnRhaW5lcj5cclxuICAgICAgICAgICAgICAgIDwvdWw+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgYCxcclxuICAgIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxyXG4gICAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcclxuICAgIHN0eWxlVXJsczogWycuL29yZGVybGlzdC5jc3MnXVxyXG59KVxyXG5leHBvcnQgY2xhc3MgT3JkZXJMaXN0IGltcGxlbWVudHMgQWZ0ZXJWaWV3Q2hlY2tlZCxBZnRlckNvbnRlbnRJbml0IHtcclxuXHJcbiAgICBASW5wdXQoKSBoZWFkZXI6IHN0cmluZztcclxuXHJcbiAgICBASW5wdXQoKSBzdHlsZTogYW55O1xyXG5cclxuICAgIEBJbnB1dCgpIHN0eWxlQ2xhc3M6IHN0cmluZztcclxuXHJcbiAgICBASW5wdXQoKSBsaXN0U3R5bGU6IGFueTtcclxuXHJcbiAgICBASW5wdXQoKSByZXNwb25zaXZlOiBib29sZWFuO1xyXG5cclxuICAgIEBJbnB1dCgpIGZpbHRlckJ5OiBzdHJpbmc7XHJcblxyXG4gICAgQElucHV0KCkgZmlsdGVyUGxhY2Vob2xkZXI6IHN0cmluZztcclxuXHJcbiAgICBASW5wdXQoKSBmaWx0ZXJMb2NhbGU6IHN0cmluZztcclxuXHJcbiAgICBASW5wdXQoKSBtZXRhS2V5U2VsZWN0aW9uOiBib29sZWFuID0gdHJ1ZTtcclxuXHJcbiAgICBASW5wdXQoKSBkcmFnZHJvcDogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICAgIEBJbnB1dCgpIGNvbnRyb2xzUG9zaXRpb246IHN0cmluZyA9ICdsZWZ0JztcclxuXHJcbiAgICBASW5wdXQoKSBhcmlhRmlsdGVyTGFiZWw6IHN0cmluZztcclxuXHJcbiAgICBASW5wdXQoKSBmaWx0ZXJNYXRjaE1vZGU6IHN0cmluZyA9IFwiY29udGFpbnNcIjtcclxuXHJcbiAgICBASW5wdXQoKSBicmVha3BvaW50OiBzdHJpbmcgPSBcIjk2MHB4XCI7XHJcblxyXG4gICAgQE91dHB1dCgpIHNlbGVjdGlvbkNoYW5nZTogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XHJcblxyXG4gICAgQElucHV0KCkgdHJhY2tCeTogRnVuY3Rpb24gPSAoaW5kZXg6IG51bWJlciwgaXRlbTogYW55KSA9PiBpdGVtO1xyXG5cclxuICAgIEBPdXRwdXQoKSBvblJlb3JkZXI6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG5cclxuICAgIEBPdXRwdXQoKSBvblNlbGVjdGlvbkNoYW5nZTogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XHJcblxyXG4gICAgQE91dHB1dCgpIG9uRmlsdGVyRXZlbnQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG5cclxuICAgIEBWaWV3Q2hpbGQoJ2xpc3RlbGVtZW50JykgbGlzdFZpZXdDaGlsZDogRWxlbWVudFJlZjtcclxuXHJcbiAgICBAQ29udGVudENoaWxkcmVuKFByaW1lVGVtcGxhdGUpIHRlbXBsYXRlczogUXVlcnlMaXN0PGFueT47XHJcblxyXG4gICAgcHVibGljIGl0ZW1UZW1wbGF0ZTogVGVtcGxhdGVSZWY8YW55PjtcclxuXHJcbiAgICBwdWJsaWMgaGVhZGVyVGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT47XHJcbiAgICBcclxuICAgIHB1YmxpYyBlbXB0eU1lc3NhZ2VUZW1wbGF0ZTogVGVtcGxhdGVSZWY8YW55PjtcclxuXHJcbiAgICBwdWJsaWMgZW1wdHlGaWx0ZXJNZXNzYWdlVGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT47XHJcblxyXG4gICAgX3NlbGVjdGlvbjogYW55W107XHJcblxyXG4gICAgbW92ZWRVcDogYm9vbGVhbjtcclxuXHJcbiAgICBtb3ZlZERvd246IGJvb2xlYW47XHJcblxyXG4gICAgaXRlbVRvdWNoZWQ6IGJvb2xlYW47XHJcblxyXG4gICAgc3R5bGVFbGVtZW50OiBhbnk7XHJcblxyXG4gICAgaWQ6IHN0cmluZyA9IFVuaXF1ZUNvbXBvbmVudElkKCk7XHJcblxyXG4gICAgcHVibGljIGZpbHRlclZhbHVlOiBzdHJpbmc7XHJcblxyXG4gICAgcHVibGljIHZpc2libGVPcHRpb25zOiBhbnlbXTtcclxuXHJcbiAgICBwdWJsaWMgX3ZhbHVlOiBhbnlbXTtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgZWw6IEVsZW1lbnRSZWYsIHB1YmxpYyBjZDogQ2hhbmdlRGV0ZWN0b3JSZWYsIHB1YmxpYyBmaWx0ZXJTZXJ2aWNlOiBGaWx0ZXJTZXJ2aWNlKSB7fVxyXG5cclxuICAgIGdldCBzZWxlY3Rpb24oKTogYW55W10ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZWxlY3Rpb247XHJcbiAgICB9XHJcblxyXG4gICAgQElucHV0KCkgc2V0IHNlbGVjdGlvbih2YWw6YW55W10pIHtcclxuICAgICAgICB0aGlzLl9zZWxlY3Rpb24gPSB2YWw7XHJcbiAgICB9XHJcblxyXG4gICAgbmdPbkluaXQoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMucmVzcG9uc2l2ZSkge1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVN0eWxlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcclxuICAgICAgICB0aGlzLnRlbXBsYXRlcy5mb3JFYWNoKChpdGVtKSA9PiB7XHJcbiAgICAgICAgICAgIHN3aXRjaChpdGVtLmdldFR5cGUoKSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnaXRlbSc6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pdGVtVGVtcGxhdGUgPSBpdGVtLnRlbXBsYXRlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICAgICAgY2FzZSAnZW1wdHknOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZW1wdHlNZXNzYWdlVGVtcGxhdGUgPSBpdGVtLnRlbXBsYXRlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICAgICAgY2FzZSAnZW1wdHlmaWx0ZXInOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZW1wdHlGaWx0ZXJNZXNzYWdlVGVtcGxhdGUgPSBpdGVtLnRlbXBsYXRlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICAgICAgY2FzZSAnaGVhZGVyJzpcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmhlYWRlclRlbXBsYXRlID0gaXRlbS50ZW1wbGF0ZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pdGVtVGVtcGxhdGUgPSBpdGVtLnRlbXBsYXRlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBuZ0FmdGVyVmlld0NoZWNrZWQoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMubW92ZWRVcHx8dGhpcy5tb3ZlZERvd24pIHtcclxuICAgICAgICAgICAgbGV0IGxpc3RJdGVtcyA9IERvbUhhbmRsZXIuZmluZCh0aGlzLmxpc3RWaWV3Q2hpbGQubmF0aXZlRWxlbWVudCwgJ2xpLnAtaGlnaGxpZ2h0Jyk7XHJcbiAgICAgICAgICAgIGxldCBsaXN0SXRlbTtcclxuXHJcbiAgICAgICAgICAgIGlmIChsaXN0SXRlbXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubW92ZWRVcClcclxuICAgICAgICAgICAgICAgICAgICBsaXN0SXRlbSA9IGxpc3RJdGVtc1swXTtcclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICBsaXN0SXRlbSA9IGxpc3RJdGVtc1tsaXN0SXRlbXMubGVuZ3RoIC0gMV07XHJcblxyXG4gICAgICAgICAgICAgICAgRG9tSGFuZGxlci5zY3JvbGxJblZpZXcodGhpcy5saXN0Vmlld0NoaWxkLm5hdGl2ZUVsZW1lbnQsIGxpc3RJdGVtKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLm1vdmVkVXAgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5tb3ZlZERvd24gPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0IHZhbHVlKCk6IGFueVtdIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fdmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgQElucHV0KCkgc2V0IHZhbHVlKHZhbDphbnlbXSkge1xyXG4gICAgICAgIHRoaXMuX3ZhbHVlID0gdmFsO1xyXG4gICAgICAgIGlmICh0aGlzLmZpbHRlclZhbHVlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZmlsdGVyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG9uSXRlbUNsaWNrKGV2ZW50LCBpdGVtLCBpbmRleCkge1xyXG4gICAgICAgIHRoaXMuaXRlbVRvdWNoZWQgPSBmYWxzZTtcclxuICAgICAgICBsZXQgc2VsZWN0ZWRJbmRleCA9IE9iamVjdFV0aWxzLmZpbmRJbmRleEluTGlzdChpdGVtLCB0aGlzLnNlbGVjdGlvbik7XHJcbiAgICAgICAgbGV0IHNlbGVjdGVkID0gKHNlbGVjdGVkSW5kZXggIT0gLTEpO1xyXG4gICAgICAgIGxldCBtZXRhU2VsZWN0aW9uID0gdGhpcy5pdGVtVG91Y2hlZCA/IGZhbHNlIDogdGhpcy5tZXRhS2V5U2VsZWN0aW9uO1xyXG5cclxuICAgICAgICBpZiAobWV0YVNlbGVjdGlvbikge1xyXG4gICAgICAgICAgICBsZXQgbWV0YUtleSA9IChldmVudC5tZXRhS2V5fHxldmVudC5jdHJsS2V5fHxldmVudC5zaGlmdEtleSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoc2VsZWN0ZWQgJiYgbWV0YUtleSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fc2VsZWN0aW9uID0gdGhpcy5fc2VsZWN0aW9uLmZpbHRlcigodmFsLCBpbmRleCkgPT4gaW5kZXggIT09IHNlbGVjdGVkSW5kZXgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fc2VsZWN0aW9uID0gKG1ldGFLZXkpID8gdGhpcy5fc2VsZWN0aW9uID8gWy4uLnRoaXMuX3NlbGVjdGlvbl0gOiBbXSA6IFtdO1xyXG4gICAgICAgICAgICAgICAgT2JqZWN0VXRpbHMuaW5zZXJ0SW50b09yZGVyZWRBcnJheShpdGVtLCBpbmRleCwgdGhpcy5fc2VsZWN0aW9uLCB0aGlzLnZhbHVlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKHNlbGVjdGVkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9zZWxlY3Rpb24gPSB0aGlzLl9zZWxlY3Rpb24uZmlsdGVyKCh2YWwsIGluZGV4KSA9PiBpbmRleCAhPT0gc2VsZWN0ZWRJbmRleCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9zZWxlY3Rpb24gPSB0aGlzLl9zZWxlY3Rpb24gPyBbLi4udGhpcy5fc2VsZWN0aW9uXSA6IFtdO1xyXG4gICAgICAgICAgICAgICAgT2JqZWN0VXRpbHMuaW5zZXJ0SW50b09yZGVyZWRBcnJheShpdGVtLCBpbmRleCwgdGhpcy5fc2VsZWN0aW9uLCB0aGlzLnZhbHVlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy9iaW5kaW5nXHJcbiAgICAgICAgdGhpcy5zZWxlY3Rpb25DaGFuZ2UuZW1pdCh0aGlzLl9zZWxlY3Rpb24pO1xyXG5cclxuICAgICAgICAvL2V2ZW50XHJcbiAgICAgICAgdGhpcy5vblNlbGVjdGlvbkNoYW5nZS5lbWl0KHtvcmlnaW5hbEV2ZW50OmV2ZW50LCB2YWx1ZTogdGhpcy5fc2VsZWN0aW9ufSk7XHJcbiAgICB9XHJcblxyXG4gICAgb25GaWx0ZXJLZXl1cChldmVudCkge1xyXG4gICAgICAgIHRoaXMuZmlsdGVyVmFsdWUgPSBldmVudC50YXJnZXQudmFsdWUudHJpbSgpLnRvTG9jYWxlTG93ZXJDYXNlKHRoaXMuZmlsdGVyTG9jYWxlKTtcclxuICAgICAgICB0aGlzLmZpbHRlcigpO1xyXG5cclxuICAgICAgICB0aGlzLm9uRmlsdGVyRXZlbnQuZW1pdCh7XHJcbiAgICAgICAgICAgIG9yaWdpbmFsRXZlbnQ6IGV2ZW50LFxyXG4gICAgICAgICAgICB2YWx1ZTogdGhpcy52aXNpYmxlT3B0aW9uc1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZpbHRlcigpIHtcclxuICAgICAgICBsZXQgc2VhcmNoRmllbGRzOiBzdHJpbmdbXSA9IHRoaXMuZmlsdGVyQnkuc3BsaXQoJywnKTtcclxuICAgICAgICB0aGlzLnZpc2libGVPcHRpb25zID0gdGhpcy5maWx0ZXJTZXJ2aWNlLmZpbHRlcih0aGlzLnZhbHVlLCBzZWFyY2hGaWVsZHMsIHRoaXMuZmlsdGVyVmFsdWUsIHRoaXMuZmlsdGVyTWF0Y2hNb2RlLCB0aGlzLmZpbHRlckxvY2FsZSk7XHJcbiAgICB9XHJcblxyXG4gICAgaXNJdGVtVmlzaWJsZShpdGVtOiBhbnkpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAodGhpcy5maWx0ZXJWYWx1ZSAmJiB0aGlzLmZpbHRlclZhbHVlLnRyaW0oKS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnZpc2libGVPcHRpb25zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXRlbSA9PSB0aGlzLnZpc2libGVPcHRpb25zW2ldKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBvbkl0ZW1Ub3VjaEVuZCgpIHtcclxuICAgICAgICB0aGlzLml0ZW1Ub3VjaGVkID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBpc1NlbGVjdGVkKGl0ZW06IGFueSkge1xyXG4gICAgICAgIHJldHVybiBPYmplY3RVdGlscy5maW5kSW5kZXhJbkxpc3QoaXRlbSwgdGhpcy5zZWxlY3Rpb24pICE9IC0xO1xyXG4gICAgfVxyXG5cclxuICAgIGlzRW1wdHkoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZmlsdGVyVmFsdWUgPyAoIXRoaXMudmlzaWJsZU9wdGlvbnMgfHwgdGhpcy52aXNpYmxlT3B0aW9ucy5sZW5ndGggPT09IDApIDogKCF0aGlzLnZhbHVlIHx8IHRoaXMudmFsdWUubGVuZ3RoID09PSAwKTtcclxuICAgIH1cclxuXHJcbiAgICBtb3ZlVXAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0aW9uKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5zZWxlY3Rpb24ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBzZWxlY3RlZEl0ZW0gPSB0aGlzLnNlbGVjdGlvbltpXTtcclxuICAgICAgICAgICAgICAgIGxldCBzZWxlY3RlZEl0ZW1JbmRleDogbnVtYmVyID0gT2JqZWN0VXRpbHMuZmluZEluZGV4SW5MaXN0KHNlbGVjdGVkSXRlbSwgdGhpcy52YWx1ZSk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHNlbGVjdGVkSXRlbUluZGV4ICE9IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbW92ZWRJdGVtID0gdGhpcy52YWx1ZVtzZWxlY3RlZEl0ZW1JbmRleF07XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRlbXAgPSB0aGlzLnZhbHVlW3NlbGVjdGVkSXRlbUluZGV4LTFdO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudmFsdWVbc2VsZWN0ZWRJdGVtSW5kZXgtMV0gPSBtb3ZlZEl0ZW07XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy52YWx1ZVtzZWxlY3RlZEl0ZW1JbmRleF0gPSB0ZW1wO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRyYWdkcm9wICYmIHRoaXMuZmlsdGVyVmFsdWUpXHJcbiAgICAgICAgICAgICAgICB0aGlzLmZpbHRlcigpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5tb3ZlZFVwID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5vblJlb3JkZXIuZW1pdCh0aGlzLnNlbGVjdGlvbik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdmVUb3AoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0aW9uKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSB0aGlzLnNlbGVjdGlvbi5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHNlbGVjdGVkSXRlbSA9IHRoaXMuc2VsZWN0aW9uW2ldO1xyXG4gICAgICAgICAgICAgICAgbGV0IHNlbGVjdGVkSXRlbUluZGV4OiBudW1iZXIgPSBPYmplY3RVdGlscy5maW5kSW5kZXhJbkxpc3Qoc2VsZWN0ZWRJdGVtLCB0aGlzLnZhbHVlKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoc2VsZWN0ZWRJdGVtSW5kZXggIT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBtb3ZlZEl0ZW0gPSB0aGlzLnZhbHVlLnNwbGljZShzZWxlY3RlZEl0ZW1JbmRleCwxKVswXTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnZhbHVlLnVuc2hpZnQobW92ZWRJdGVtKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5kcmFnZHJvcCAmJiB0aGlzLmZpbHRlclZhbHVlKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5maWx0ZXIoKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMub25SZW9yZGVyLmVtaXQodGhpcy5zZWxlY3Rpb24pO1xyXG4gICAgICAgICAgICB0aGlzLmxpc3RWaWV3Q2hpbGQubmF0aXZlRWxlbWVudC5zY3JvbGxUb3AgPSAwO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBtb3ZlRG93bigpIHtcclxuICAgICAgICBpZiAodGhpcy5zZWxlY3Rpb24pIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IHRoaXMuc2VsZWN0aW9uLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2VsZWN0ZWRJdGVtID0gdGhpcy5zZWxlY3Rpb25baV07XHJcbiAgICAgICAgICAgICAgICBsZXQgc2VsZWN0ZWRJdGVtSW5kZXg6IG51bWJlciA9IE9iamVjdFV0aWxzLmZpbmRJbmRleEluTGlzdChzZWxlY3RlZEl0ZW0sIHRoaXMudmFsdWUpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChzZWxlY3RlZEl0ZW1JbmRleCAhPSAodGhpcy52YWx1ZS5sZW5ndGggLSAxKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBtb3ZlZEl0ZW0gPSB0aGlzLnZhbHVlW3NlbGVjdGVkSXRlbUluZGV4XTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdGVtcCA9IHRoaXMudmFsdWVbc2VsZWN0ZWRJdGVtSW5kZXgrMV07XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy52YWx1ZVtzZWxlY3RlZEl0ZW1JbmRleCsxXSA9IG1vdmVkSXRlbTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnZhbHVlW3NlbGVjdGVkSXRlbUluZGV4XSA9IHRlbXA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuZHJhZ2Ryb3AgJiYgdGhpcy5maWx0ZXJWYWx1ZSlcclxuICAgICAgICAgICAgICAgIHRoaXMuZmlsdGVyKCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLm1vdmVkRG93biA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMub25SZW9yZGVyLmVtaXQodGhpcy5zZWxlY3Rpb24pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBtb3ZlQm90dG9tKCkge1xyXG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGlvbikge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuc2VsZWN0aW9uLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2VsZWN0ZWRJdGVtID0gdGhpcy5zZWxlY3Rpb25baV07XHJcbiAgICAgICAgICAgICAgICBsZXQgc2VsZWN0ZWRJdGVtSW5kZXg6IG51bWJlciA9IE9iamVjdFV0aWxzLmZpbmRJbmRleEluTGlzdChzZWxlY3RlZEl0ZW0sIHRoaXMudmFsdWUpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChzZWxlY3RlZEl0ZW1JbmRleCAhPSAodGhpcy52YWx1ZS5sZW5ndGggLSAxKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBtb3ZlZEl0ZW0gPSB0aGlzLnZhbHVlLnNwbGljZShzZWxlY3RlZEl0ZW1JbmRleCwxKVswXTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnZhbHVlLnB1c2gobW92ZWRJdGVtKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5kcmFnZHJvcCAmJiB0aGlzLmZpbHRlclZhbHVlKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5maWx0ZXIoKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMub25SZW9yZGVyLmVtaXQodGhpcy5zZWxlY3Rpb24pO1xyXG4gICAgICAgICAgICB0aGlzLmxpc3RWaWV3Q2hpbGQubmF0aXZlRWxlbWVudC5zY3JvbGxUb3AgPSB0aGlzLmxpc3RWaWV3Q2hpbGQubmF0aXZlRWxlbWVudC5zY3JvbGxIZWlnaHQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG9uRHJvcChldmVudDogQ2RrRHJhZ0Ryb3A8c3RyaW5nW10+KSB7XHJcbiAgICAgICAgbGV0IHByZXZpb3VzSW5kZXggPSAgZXZlbnQucHJldmlvdXNJbmRleDtcclxuICAgICAgICBsZXQgY3VycmVudEluZGV4ID0gZXZlbnQuY3VycmVudEluZGV4O1xyXG5cclxuICAgICAgICBpZiAocHJldmlvdXNJbmRleCAhPT0gY3VycmVudEluZGV4KSB7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy52aXNpYmxlT3B0aW9ucykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZmlsdGVyVmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICBwcmV2aW91c0luZGV4ID0gIE9iamVjdFV0aWxzLmZpbmRJbmRleEluTGlzdChldmVudC5pdGVtLmRhdGEsIHRoaXMudmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRJbmRleCA9IE9iamVjdFV0aWxzLmZpbmRJbmRleEluTGlzdCh0aGlzLnZpc2libGVPcHRpb25zW2N1cnJlbnRJbmRleF0sIHRoaXMudmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIG1vdmVJdGVtSW5BcnJheSh0aGlzLnZpc2libGVPcHRpb25zLCBldmVudC5wcmV2aW91c0luZGV4LCBldmVudC5jdXJyZW50SW5kZXgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBtb3ZlSXRlbUluQXJyYXkodGhpcy52YWx1ZSwgcHJldmlvdXNJbmRleCwgY3VycmVudEluZGV4KTtcclxuICAgICAgICAgICAgdGhpcy5vblJlb3JkZXIuZW1pdChbZXZlbnQuaXRlbS5kYXRhXSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG9uSXRlbUtleWRvd24oZXZlbnQ6IEtleWJvYXJkRXZlbnQsIGl0ZW0sIGluZGV4OiBOdW1iZXIpIHtcclxuICAgICAgICBsZXQgbGlzdEl0ZW0gPSA8SFRNTExJRWxlbWVudD4gZXZlbnQuY3VycmVudFRhcmdldDtcclxuXHJcbiAgICAgICAgc3dpdGNoKGV2ZW50LndoaWNoKSB7XHJcbiAgICAgICAgICAgIC8vZG93blxyXG4gICAgICAgICAgICBjYXNlIDQwOlxyXG4gICAgICAgICAgICAgICAgdmFyIG5leHRJdGVtID0gdGhpcy5maW5kTmV4dEl0ZW0obGlzdEl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgaWYgKG5leHRJdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV4dEl0ZW0uZm9jdXMoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgIC8vdXBcclxuICAgICAgICAgICAgY2FzZSAzODpcclxuICAgICAgICAgICAgICAgIHZhciBwcmV2SXRlbSA9IHRoaXMuZmluZFByZXZJdGVtKGxpc3RJdGVtKTtcclxuICAgICAgICAgICAgICAgIGlmIChwcmV2SXRlbSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHByZXZJdGVtLmZvY3VzKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICAvL2VudGVyXHJcbiAgICAgICAgICAgIGNhc2UgMTM6XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9uSXRlbUNsaWNrKGV2ZW50LCBpdGVtLCBpbmRleCk7XHJcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZmluZE5leHRJdGVtKGl0ZW0pIHtcclxuICAgICAgICBsZXQgbmV4dEl0ZW0gPSBpdGVtLm5leHRFbGVtZW50U2libGluZztcclxuXHJcbiAgICAgICAgaWYgKG5leHRJdGVtKVxyXG4gICAgICAgICAgICByZXR1cm4gIURvbUhhbmRsZXIuaGFzQ2xhc3MobmV4dEl0ZW0sICdwLW9yZGVybGlzdC1pdGVtJykgfHwgRG9tSGFuZGxlci5pc0hpZGRlbihuZXh0SXRlbSkgPyB0aGlzLmZpbmROZXh0SXRlbShuZXh0SXRlbSkgOiBuZXh0SXRlbTtcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGZpbmRQcmV2SXRlbShpdGVtKSB7XHJcbiAgICAgICAgbGV0IHByZXZJdGVtID0gaXRlbS5wcmV2aW91c0VsZW1lbnRTaWJsaW5nO1xyXG5cclxuICAgICAgICBpZiAocHJldkl0ZW0pXHJcbiAgICAgICAgICAgIHJldHVybiAhRG9tSGFuZGxlci5oYXNDbGFzcyhwcmV2SXRlbSwgJ3Atb3JkZXJsaXN0LWl0ZW0nKSB8fCBEb21IYW5kbGVyLmlzSGlkZGVuKHByZXZJdGVtKSA/IHRoaXMuZmluZFByZXZJdGVtKHByZXZJdGVtKSA6IHByZXZJdGVtO1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgY3JlYXRlU3R5bGUoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLnN0eWxlRWxlbWVudCkge1xyXG4gICAgICAgICAgICB0aGlzLmVsLm5hdGl2ZUVsZW1lbnQuY2hpbGRyZW5bMF0uc2V0QXR0cmlidXRlKHRoaXMuaWQsICcnKTtcclxuICAgICAgICAgICAgdGhpcy5zdHlsZUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xyXG4gICAgICAgICAgICB0aGlzLnN0eWxlRWxlbWVudC50eXBlID0gJ3RleHQvY3NzJztcclxuICAgICAgICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZCh0aGlzLnN0eWxlRWxlbWVudCk7XHJcblxyXG4gICAgICAgICAgICBsZXQgaW5uZXJIVE1MID0gYFxyXG4gICAgICAgICAgICAgICAgQG1lZGlhIHNjcmVlbiBhbmQgKG1heC13aWR0aDogJHt0aGlzLmJyZWFrcG9pbnR9KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLnAtb3JkZXJsaXN0WyR7dGhpcy5pZH1dIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC5wLW9yZGVybGlzdFske3RoaXMuaWR9XSAucC1vcmRlcmxpc3QtY29udHJvbHMge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nOiB2YXIoLS1jb250ZW50LXBhZGRpbmcpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmbGV4LWRpcmVjdGlvbjogcm93O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLnAtb3JkZXJsaXN0WyR7dGhpcy5pZH1dIC5wLW9yZGVybGlzdC1jb250cm9scyAucC1idXR0b24ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXJnaW4tcmlnaHQ6IHZhcigtLWlubGluZS1zcGFjaW5nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFyZ2luLWJvdHRvbTogMDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC5wLW9yZGVybGlzdFske3RoaXMuaWR9XSAucC1vcmRlcmxpc3QtY29udHJvbHMgLnAtYnV0dG9uOmxhc3QtY2hpbGQge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXJnaW4tcmlnaHQ6IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBgO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgdGhpcy5zdHlsZUVsZW1lbnQuaW5uZXJIVE1MID0gaW5uZXJIVE1MO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBkZXN0cm95U3R5bGUoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc3R5bGVFbGVtZW50KSB7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmhlYWQucmVtb3ZlQ2hpbGQodGhpcy5zdHlsZUVsZW1lbnQpO1xyXG4gICAgICAgICAgICB0aGlzLnN0eWxlRWxlbWVudCA9IG51bGw7YGBcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbmdPbkRlc3Ryb3koKSB7XHJcbiAgICAgICAgdGhpcy5kZXN0cm95U3R5bGUoKTtcclxuICAgIH1cclxufVxyXG5cclxuQE5nTW9kdWxlKHtcclxuICAgIGltcG9ydHM6IFtDb21tb25Nb2R1bGUsQnV0dG9uTW9kdWxlLFNoYXJlZE1vZHVsZSxSaXBwbGVNb2R1bGUsRHJhZ0Ryb3BNb2R1bGVdLFxyXG4gICAgZXhwb3J0czogW09yZGVyTGlzdCxTaGFyZWRNb2R1bGUsRHJhZ0Ryb3BNb2R1bGVdLFxyXG4gICAgZGVjbGFyYXRpb25zOiBbT3JkZXJMaXN0XVxyXG59KVxyXG5leHBvcnQgY2xhc3MgT3JkZXJMaXN0TW9kdWxlIHsgfVxyXG4iXX0=