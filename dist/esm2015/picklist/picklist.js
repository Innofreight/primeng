import { NgModule, Component, ElementRef, Input, Output, ContentChildren, EventEmitter, ViewChild, ChangeDetectionStrategy, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { SharedModule, PrimeTemplate, FilterService } from 'primeng/api';
import { DomHandler } from 'primeng/dom';
import { RippleModule } from 'primeng/ripple';
import { DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ObjectUtils, UniqueComponentId } from 'primeng/utils';
export class PickList {
    constructor(el, cd, filterService) {
        this.el = el;
        this.cd = cd;
        this.filterService = filterService;
        this.trackBy = (index, item) => item;
        this.showSourceFilter = true;
        this.showTargetFilter = true;
        this.metaKeySelection = true;
        this.dragdrop = false;
        this.showSourceControls = true;
        this.showTargetControls = true;
        this.disabled = false;
        this.filterMatchMode = "contains";
        this.breakpoint = "960px";
        this.onMoveToSource = new EventEmitter();
        this.onMoveAllToSource = new EventEmitter();
        this.onMoveAllToTarget = new EventEmitter();
        this.onMoveToTarget = new EventEmitter();
        this.onSourceReorder = new EventEmitter();
        this.onTargetReorder = new EventEmitter();
        this.onSourceSelect = new EventEmitter();
        this.onTargetSelect = new EventEmitter();
        this.onSourceFilter = new EventEmitter();
        this.onTargetFilter = new EventEmitter();
        this.selectedItemsSource = [];
        this.selectedItemsTarget = [];
        this.id = UniqueComponentId();
        this.SOURCE_LIST = -1;
        this.TARGET_LIST = 1;
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
                case 'sourceHeader':
                    this.sourceHeaderTemplate = item.template;
                    break;
                case 'targetHeader':
                    this.targetHeaderTemplate = item.template;
                    break;
                case 'emptymessagesource':
                    this.emptyMessageSourceTemplate = item.template;
                    break;
                case 'emptyfiltermessagesource':
                    this.emptyFilterMessageSourceTemplate = item.template;
                    break;
                case 'emptymessagetarget':
                    this.emptyMessageTargetTemplate = item.template;
                    break;
                case 'emptyfiltermessagetarget':
                    this.emptyFilterMessageTargetTemplate = item.template;
                    break;
                default:
                    this.itemTemplate = item.template;
                    break;
            }
        });
    }
    ngAfterViewChecked() {
        if (this.movedUp || this.movedDown) {
            let listItems = DomHandler.find(this.reorderedListElement, 'li.p-highlight');
            let listItem;
            if (this.movedUp)
                listItem = listItems[0];
            else
                listItem = listItems[listItems.length - 1];
            DomHandler.scrollInView(this.reorderedListElement, listItem);
            this.movedUp = false;
            this.movedDown = false;
            this.reorderedListElement = null;
        }
    }
    onItemClick(event, item, selectedItems, callback) {
        if (this.disabled) {
            return;
        }
        let index = this.findIndexInSelection(item, selectedItems);
        let selected = (index != -1);
        let metaSelection = this.itemTouched ? false : this.metaKeySelection;
        if (metaSelection) {
            let metaKey = (event.metaKey || event.ctrlKey || event.shiftKey);
            if (selected && metaKey) {
                selectedItems.splice(index, 1);
            }
            else {
                if (!metaKey) {
                    selectedItems.length = 0;
                }
                selectedItems.push(item);
            }
        }
        else {
            if (selected)
                selectedItems.splice(index, 1);
            else
                selectedItems.push(item);
        }
        callback.emit({ originalEvent: event, items: selectedItems });
        this.itemTouched = false;
    }
    onSourceItemDblClick() {
        if (this.disabled) {
            return;
        }
        this.moveRight();
    }
    onTargetItemDblClick() {
        if (this.disabled) {
            return;
        }
        this.moveLeft();
    }
    onFilter(event, data, listType) {
        let query = event.target.value.trim().toLocaleLowerCase(this.filterLocale);
        if (listType === this.SOURCE_LIST)
            this.filterValueSource = query;
        else if (listType === this.TARGET_LIST)
            this.filterValueTarget = query;
        this.filter(data, listType);
    }
    filter(data, listType) {
        let searchFields = this.filterBy.split(',');
        if (listType === this.SOURCE_LIST) {
            this.visibleOptionsSource = this.filterService.filter(data, searchFields, this.filterValueSource, this.filterMatchMode, this.filterLocale);
            this.onSourceFilter.emit({ query: this.filterValueSource, value: this.visibleOptionsSource });
        }
        else if (listType === this.TARGET_LIST) {
            this.visibleOptionsTarget = this.filterService.filter(data, searchFields, this.filterValueTarget, this.filterMatchMode, this.filterLocale);
            this.onTargetFilter.emit({ query: this.filterValueTarget, value: this.visibleOptionsTarget });
        }
    }
    isItemVisible(item, listType) {
        if (listType == this.SOURCE_LIST)
            return this.isVisibleInList(this.visibleOptionsSource, item, this.filterValueSource);
        else
            return this.isVisibleInList(this.visibleOptionsTarget, item, this.filterValueTarget);
    }
    isEmpty(listType) {
        if (listType == this.SOURCE_LIST)
            return this.filterValueSource ? (!this.visibleOptionsSource || this.visibleOptionsSource.length === 0) : (!this.source || this.source.length === 0);
        else
            return this.filterValueTarget ? (!this.visibleOptionsTarget || this.visibleOptionsTarget.length === 0) : (!this.target || this.target.length === 0);
    }
    isVisibleInList(data, item, filterValue) {
        if (filterValue && filterValue.trim().length) {
            for (let i = 0; i < data.length; i++) {
                if (item == data[i]) {
                    return true;
                }
            }
        }
        else {
            return true;
        }
    }
    onItemTouchEnd() {
        if (this.disabled) {
            return;
        }
        this.itemTouched = true;
    }
    sortByIndexInList(items, list) {
        return items.sort((item1, item2) => ObjectUtils.findIndexInList(item1, list) - ObjectUtils.findIndexInList(item2, list));
    }
    moveUp(listElement, list, selectedItems, callback, listType) {
        if (selectedItems && selectedItems.length) {
            selectedItems = this.sortByIndexInList(selectedItems, list);
            for (let i = 0; i < selectedItems.length; i++) {
                let selectedItem = selectedItems[i];
                let selectedItemIndex = ObjectUtils.findIndexInList(selectedItem, list);
                if (selectedItemIndex != 0) {
                    let movedItem = list[selectedItemIndex];
                    let temp = list[selectedItemIndex - 1];
                    list[selectedItemIndex - 1] = movedItem;
                    list[selectedItemIndex] = temp;
                }
                else {
                    break;
                }
            }
            if (this.dragdrop && ((this.filterValueSource && listType === this.SOURCE_LIST) || (this.filterValueTarget && listType === this.TARGET_LIST)))
                this.filter(list, listType);
            this.movedUp = true;
            this.reorderedListElement = listElement;
            callback.emit({ items: selectedItems });
        }
    }
    moveTop(listElement, list, selectedItems, callback, listType) {
        if (selectedItems && selectedItems.length) {
            selectedItems = this.sortByIndexInList(selectedItems, list);
            for (let i = 0; i < selectedItems.length; i++) {
                let selectedItem = selectedItems[i];
                let selectedItemIndex = ObjectUtils.findIndexInList(selectedItem, list);
                if (selectedItemIndex != 0) {
                    let movedItem = list.splice(selectedItemIndex, 1)[0];
                    list.unshift(movedItem);
                }
                else {
                    break;
                }
            }
            if (this.dragdrop && ((this.filterValueSource && listType === this.SOURCE_LIST) || (this.filterValueTarget && listType === this.TARGET_LIST)))
                this.filter(list, listType);
            listElement.scrollTop = 0;
            callback.emit({ items: selectedItems });
        }
    }
    moveDown(listElement, list, selectedItems, callback, listType) {
        if (selectedItems && selectedItems.length) {
            selectedItems = this.sortByIndexInList(selectedItems, list);
            for (let i = selectedItems.length - 1; i >= 0; i--) {
                let selectedItem = selectedItems[i];
                let selectedItemIndex = ObjectUtils.findIndexInList(selectedItem, list);
                if (selectedItemIndex != (list.length - 1)) {
                    let movedItem = list[selectedItemIndex];
                    let temp = list[selectedItemIndex + 1];
                    list[selectedItemIndex + 1] = movedItem;
                    list[selectedItemIndex] = temp;
                }
                else {
                    break;
                }
            }
            if (this.dragdrop && ((this.filterValueSource && listType === this.SOURCE_LIST) || (this.filterValueTarget && listType === this.TARGET_LIST)))
                this.filter(list, listType);
            this.movedDown = true;
            this.reorderedListElement = listElement;
            callback.emit({ items: selectedItems });
        }
    }
    moveBottom(listElement, list, selectedItems, callback, listType) {
        if (selectedItems && selectedItems.length) {
            selectedItems = this.sortByIndexInList(selectedItems, list);
            for (let i = selectedItems.length - 1; i >= 0; i--) {
                let selectedItem = selectedItems[i];
                let selectedItemIndex = ObjectUtils.findIndexInList(selectedItem, list);
                if (selectedItemIndex != (list.length - 1)) {
                    let movedItem = list.splice(selectedItemIndex, 1)[0];
                    list.push(movedItem);
                }
                else {
                    break;
                }
            }
            if (this.dragdrop && ((this.filterValueSource && listType === this.SOURCE_LIST) || (this.filterValueTarget && listType === this.TARGET_LIST)))
                this.filter(list, listType);
            listElement.scrollTop = listElement.scrollHeight;
            callback.emit({ items: selectedItems });
        }
    }
    moveRight() {
        if (this.selectedItemsSource && this.selectedItemsSource.length) {
            for (let i = 0; i < this.selectedItemsSource.length; i++) {
                let selectedItem = this.selectedItemsSource[i];
                if (ObjectUtils.findIndexInList(selectedItem, this.target) == -1) {
                    this.target.push(this.source.splice(ObjectUtils.findIndexInList(selectedItem, this.source), 1)[0]);
                    if (this.visibleOptionsSource)
                        this.visibleOptionsSource.splice(ObjectUtils.findIndexInList(selectedItem, this.visibleOptionsSource), 1);
                }
            }
            this.onMoveToTarget.emit({
                items: this.selectedItemsSource
            });
            this.selectedItemsSource = [];
            if (this.filterValueTarget) {
                this.filter(this.target, this.TARGET_LIST);
            }
        }
    }
    moveAllRight() {
        if (this.source) {
            let movedItems = [];
            for (let i = 0; i < this.source.length; i++) {
                if (this.isItemVisible(this.source[i], this.SOURCE_LIST)) {
                    let removedItem = this.source.splice(i, 1)[0];
                    this.target.push(removedItem);
                    movedItems.push(removedItem);
                    i--;
                }
            }
            this.onMoveAllToTarget.emit({
                items: movedItems
            });
            this.selectedItemsSource = [];
            if (this.filterValueTarget) {
                this.filter(this.target, this.TARGET_LIST);
            }
            this.visibleOptionsSource = [];
        }
    }
    moveLeft() {
        if (this.selectedItemsTarget && this.selectedItemsTarget.length) {
            for (let i = 0; i < this.selectedItemsTarget.length; i++) {
                let selectedItem = this.selectedItemsTarget[i];
                if (ObjectUtils.findIndexInList(selectedItem, this.source) == -1) {
                    this.source.push(this.target.splice(ObjectUtils.findIndexInList(selectedItem, this.target), 1)[0]);
                    if (this.visibleOptionsTarget)
                        this.visibleOptionsTarget.splice(ObjectUtils.findIndexInList(selectedItem, this.visibleOptionsTarget), 1)[0];
                }
            }
            this.onMoveToSource.emit({
                items: this.selectedItemsTarget
            });
            this.selectedItemsTarget = [];
            if (this.filterValueSource) {
                this.filter(this.source, this.SOURCE_LIST);
            }
        }
    }
    moveAllLeft() {
        if (this.target) {
            let movedItems = [];
            for (let i = 0; i < this.target.length; i++) {
                if (this.isItemVisible(this.target[i], this.TARGET_LIST)) {
                    let removedItem = this.target.splice(i, 1)[0];
                    this.source.push(removedItem);
                    movedItems.push(removedItem);
                    i--;
                }
            }
            this.onMoveAllToSource.emit({
                items: movedItems
            });
            this.selectedItemsTarget = [];
            if (this.filterValueSource) {
                this.filter(this.source, this.SOURCE_LIST);
            }
            this.visibleOptionsTarget = [];
        }
    }
    isSelected(item, selectedItems) {
        return this.findIndexInSelection(item, selectedItems) != -1;
    }
    findIndexInSelection(item, selectedItems) {
        return ObjectUtils.findIndexInList(item, selectedItems);
    }
    onDrop(event, listType) {
        let isTransfer = event.previousContainer !== event.container;
        let dropIndexes = this.getDropIndexes(event.previousIndex, event.currentIndex, listType, isTransfer, event.item.data);
        if (listType === this.SOURCE_LIST) {
            if (isTransfer) {
                transferArrayItem(event.previousContainer.data, event.container.data, dropIndexes.previousIndex, dropIndexes.currentIndex);
                if (this.visibleOptionsTarget)
                    this.visibleOptionsTarget.splice(event.previousIndex, 1);
                this.onMoveToSource.emit({ items: event.item.data });
            }
            else {
                moveItemInArray(event.container.data, dropIndexes.previousIndex, dropIndexes.currentIndex);
                this.onSourceReorder.emit({ items: event.item.data });
            }
            if (this.filterValueSource) {
                this.filter(this.source, this.SOURCE_LIST);
            }
        }
        else {
            if (isTransfer) {
                transferArrayItem(event.previousContainer.data, event.container.data, dropIndexes.previousIndex, dropIndexes.currentIndex);
                if (this.visibleOptionsSource)
                    this.visibleOptionsSource.splice(event.previousIndex, 1);
                this.onMoveToTarget.emit({ items: event.item.data });
            }
            else {
                moveItemInArray(event.container.data, dropIndexes.previousIndex, dropIndexes.currentIndex);
                this.onTargetReorder.emit({ items: event.item.data });
            }
            if (this.filterValueTarget) {
                this.filter(this.target, this.TARGET_LIST);
            }
        }
    }
    getDropIndexes(fromIndex, toIndex, droppedList, isTransfer, data) {
        let previousIndex, currentIndex;
        if (droppedList === this.SOURCE_LIST) {
            previousIndex = isTransfer ? this.filterValueTarget ? ObjectUtils.findIndexInList(data, this.target) : fromIndex : this.filterValueSource ? ObjectUtils.findIndexInList(data, this.source) : fromIndex;
            currentIndex = this.filterValueSource ? this.findFilteredCurrentIndex(this.visibleOptionsSource, toIndex, this.source) : toIndex;
        }
        else {
            previousIndex = isTransfer ? this.filterValueSource ? ObjectUtils.findIndexInList(data, this.source) : fromIndex : this.filterValueTarget ? ObjectUtils.findIndexInList(data, this.target) : fromIndex;
            currentIndex = this.filterValueTarget ? this.findFilteredCurrentIndex(this.visibleOptionsTarget, toIndex, this.target) : toIndex;
        }
        return { previousIndex, currentIndex };
    }
    findFilteredCurrentIndex(visibleOptions, index, options) {
        if (visibleOptions.length === index) {
            let toIndex = ObjectUtils.findIndexInList(visibleOptions[index - 1], options);
            return toIndex + 1;
        }
        else {
            return ObjectUtils.findIndexInList(visibleOptions[index], options);
        }
    }
    resetFilter() {
        this.visibleOptionsSource = null;
        this.filterValueSource = null;
        this.visibleOptionsTarget = null;
        this.filterValueTarget = null;
        this.sourceFilterViewChild.nativeElement.value = '';
        this.targetFilterViewChild.nativeElement.value = '';
    }
    onItemKeydown(event, item, selectedItems, callback) {
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
                this.onItemClick(event, item, selectedItems, callback);
                event.preventDefault();
                break;
        }
    }
    findNextItem(item) {
        let nextItem = item.nextElementSibling;
        if (nextItem)
            return !DomHandler.hasClass(nextItem, 'p-picklist-item') || DomHandler.isHidden(nextItem) ? this.findNextItem(nextItem) : nextItem;
        else
            return null;
    }
    findPrevItem(item) {
        let prevItem = item.previousElementSibling;
        if (prevItem)
            return !DomHandler.hasClass(prevItem, 'p-picklist-item') || DomHandler.isHidden(prevItem) ? this.findPrevItem(prevItem) : prevItem;
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
                .p-picklist[${this.id}] {
                    flex-direction: column;
                }
            
                .p-picklist[${this.id}] .p-picklist-buttons {
                    padding: var(--content-padding);
                    flex-direction: row;
                }
            
                .p-picklist[${this.id}] .p-picklist-buttons .p-button {
                    margin-right: var(--inline-spacing);
                    margin-bottom: 0;
                }
            
                .p-picklist[${this.id}] .p-picklist-buttons .p-button:last-child {
                    margin-right: 0;
                }
            
                .p-picklist[${this.id}] .pi-angle-right:before {
                    content: "\\e930"
                }
            
                .p-picklist[${this.id}] .pi-angle-double-right:before {
                    content: "\\e92c"
                }
            
                .p-picklist[${this.id}] .pi-angle-left:before {
                    content: "\\e933"
                }
            
                .p-picklist[${this.id}] .pi-angle-double-left:before {
                    content: "\\e92f"
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
PickList.decorators = [
    { type: Component, args: [{
                selector: 'p-pickList',
                template: `
        <div [class]="styleClass" [ngStyle]="style" [ngClass]="'p-picklist p-component'" cdkDropListGroup>
            <div class="p-picklist-buttons p-picklist-source-controls" *ngIf="showSourceControls">
                <button type="button" pButton pRipple icon="pi pi-angle-up" [disabled]="disabled" (click)="moveUp(sourcelist,source,selectedItemsSource,onSourceReorder,SOURCE_LIST)"></button>
                <button type="button" pButton pRipple icon="pi pi-angle-double-up" [disabled]="disabled" (click)="moveTop(sourcelist,source,selectedItemsSource,onSourceReorder,SOURCE_LIST)"></button>
                <button type="button" pButton pRipple icon="pi pi-angle-down" [disabled]="disabled" (click)="moveDown(sourcelist,source,selectedItemsSource,onSourceReorder,SOURCE_LIST)"></button>
                <button type="button" pButton pRipple icon="pi pi-angle-double-down" [disabled]="disabled" (click)="moveBottom(sourcelist,source,selectedItemsSource,onSourceReorder,SOURCE_LIST)"></button>
            </div>
            <div class="p-picklist-list-wrapper p-picklist-source-wrapper">
                <div class="p-picklist-header" *ngIf="sourceHeader || sourceHeaderTemplate">
                    <div class="p-picklist-title" *ngIf="!sourceHeaderTemplate">{{sourceHeader}}</div>
                    <ng-container *ngTemplateOutlet="sourceHeaderTemplate"></ng-container>
                </div>
                <div class="p-picklist-filter-container" *ngIf="filterBy && showSourceFilter !== false">
                    <div class="p-picklist-filter">
                        <input #sourceFilter type="text" role="textbox" (keyup)="onFilter($event,source,SOURCE_LIST)" class="p-picklist-filter-input p-inputtext p-component" [disabled]="disabled" [attr.placeholder]="sourceFilterPlaceholder" [attr.aria-label]="ariaSourceFilterLabel">
                        <span class="p-picklist-filter-icon pi pi-search"></span>
                    </div>
                </div>
                
                <ul #sourcelist class="p-picklist-list p-picklist-source" cdkDropList [cdkDropListData]="source" (cdkDropListDropped)="onDrop($event, SOURCE_LIST)"
                    [ngStyle]="sourceStyle" role="listbox" aria-multiselectable="multiple">
                    <ng-template ngFor let-item [ngForOf]="source" [ngForTrackBy]="sourceTrackBy || trackBy" let-i="index" let-l="last">
                        <li [ngClass]="{'p-picklist-item':true,'p-highlight':isSelected(item,selectedItemsSource),'p-disabled': disabled}" pRipple cdkDrag [cdkDragData]="item" [cdkDragDisabled]="!dragdrop"
                            (click)="onItemClick($event,item,selectedItemsSource,onSourceSelect)" (dblclick)="onSourceItemDblClick()" (touchend)="onItemTouchEnd()" (keydown)="onItemKeydown($event,item,selectedItemsSource,onSourceSelect)"
                            *ngIf="isItemVisible(item, SOURCE_LIST)" tabindex="0" role="option" [attr.aria-selected]="isSelected(item, selectedItemsSource)">
                            <ng-container *ngTemplateOutlet="itemTemplate; context: {$implicit: item, index: i}"></ng-container>
                        </li>
                    </ng-template>
                    <ng-container *ngIf="isEmpty(SOURCE_LIST) && (emptyMessageSourceTemplate || emptyFilterMessageSourceTemplate)">
                        <li class="p-picklist-empty-message" *ngIf="!filterValueSource || !emptyFilterMessageSourceTemplate">
                            <ng-container *ngTemplateOutlet="emptyMessageSourceTemplate"></ng-container>
                        </li>
                        <li class="p-picklist-empty-message" *ngIf="filterValueSource">
                            <ng-container *ngTemplateOutlet="emptyFilterMessageSourceTemplate"></ng-container>
                        </li>
                    </ng-container>
                </ul>
            </div>
            <div class="p-picklist-buttons p-picklist-transfer-buttons">
                <button type="button" pButton pRipple icon="pi pi-angle-right" [disabled]="disabled" (click)="moveRight()"></button>
                <button type="button" pButton pRipple icon="pi pi-angle-double-right" [disabled]="disabled" (click)="moveAllRight()"></button>
                <button type="button" pButton pRipple icon="pi pi-angle-left" [disabled]="disabled" (click)="moveLeft()"></button>
                <button type="button" pButton pRipple icon="pi pi-angle-double-left" [disabled]="disabled" (click)="moveAllLeft()"></button>
            </div>
            <div class="p-picklist-list-wrapper p-picklist-target-wrapper">
                <div class="p-picklist-header" *ngIf="targetHeader || targetHeaderTemplate">
                    <div class="p-picklist-title" *ngIf="!targetHeaderTemplate">{{targetHeader}}</div>
                    <ng-container *ngTemplateOutlet="targetHeaderTemplate"></ng-container>
                </div>
                <div class="p-picklist-filter-container" *ngIf="filterBy && showTargetFilter !== false">
                    <div class="p-picklist-filter">
                        <input #targetFilter type="text" role="textbox" (keyup)="onFilter($event,target,TARGET_LIST)" class="p-picklist-filter-input p-inputtext p-component" [disabled]="disabled" [attr.placeholder]="targetFilterPlaceholder" [attr.aria-label]="ariaTargetFilterLabel">
                        <span class="p-picklist-filter-icon pi pi-search"></span>
                    </div>
                </div>
                <ul #targetlist class="p-picklist-list p-picklist-target" cdkDropList [cdkDropListData]="target" (cdkDropListDropped)="onDrop($event, TARGET_LIST)"
                    [ngStyle]="targetStyle" role="listbox" aria-multiselectable="multiple">
                    <ng-template ngFor let-item [ngForOf]="target" [ngForTrackBy]="targetTrackBy || trackBy" let-i="index" let-l="last">
                        <li [ngClass]="{'p-picklist-item':true,'p-highlight':isSelected(item,selectedItemsTarget), 'p-disabled': disabled}" pRipple cdkDrag [cdkDragData]="item" [cdkDragDisabled]="!dragdrop"
                            (click)="onItemClick($event,item,selectedItemsTarget,onTargetSelect)" (dblclick)="onTargetItemDblClick()" (touchend)="onItemTouchEnd()" (keydown)="onItemKeydown($event,item,selectedItemsTarget,onTargetSelect)"
                            *ngIf="isItemVisible(item, TARGET_LIST)" tabindex="0" role="option" [attr.aria-selected]="isSelected(item, selectedItemsTarget)">
                            <ng-container *ngTemplateOutlet="itemTemplate; context: {$implicit: item, index: i}"></ng-container>
                        </li>
                    </ng-template>
                    <ng-container *ngIf="isEmpty(TARGET_LIST) && (emptyMessageTargetTemplate || emptyFilterMessageTargetTemplate)">
                        <li class="p-picklist-empty-message" *ngIf="!filterValueTarget || !emptyFilterMessageTargetTemplate">
                            <ng-container *ngTemplateOutlet="emptyMessageTargetTemplate"></ng-container>
                        </li>
                        <li class="p-picklist-empty-message" *ngIf="filterValueTarget">
                            <ng-container *ngTemplateOutlet="emptyFilterMessageTargetTemplate"></ng-container>
                        </li>
                    </ng-container>
                </ul>
            </div>
            <div class="p-picklist-buttons p-picklist-target-controls" *ngIf="showTargetControls">
                <button type="button" pButton pRipple icon="pi pi-angle-up" [disabled]="disabled" (click)="moveUp(targetlist,target,selectedItemsTarget,onTargetReorder,TARGET_LIST)"></button>
                <button type="button" pButton pRipple icon="pi pi-angle-double-up" [disabled]="disabled" (click)="moveTop(targetlist,target,selectedItemsTarget,onTargetReorder,TARGET_LIST)"></button>
                <button type="button" pButton pRipple icon="pi pi-angle-down" [disabled]="disabled" (click)="moveDown(targetlist,target,selectedItemsTarget,onTargetReorder,TARGET_LIST)"></button>
                <button type="button" pButton pRipple icon="pi pi-angle-double-down" [disabled]="disabled" (click)="moveBottom(targetlist,target,selectedItemsTarget,onTargetReorder,TARGET_LIST)"></button>
            </div>
        </div>
    `,
                changeDetection: ChangeDetectionStrategy.OnPush,
                encapsulation: ViewEncapsulation.None,
                styles: [".p-picklist{display:flex}.p-picklist-buttons{display:flex;flex-direction:column;justify-content:center}.p-picklist-list-wrapper{flex:1 1 50%}.p-picklist-list{list-style-type:none;margin:0;min-height:12rem;overflow:auto;padding:0}.p-picklist-item{cursor:pointer;display:block;overflow:hidden;position:relative}.p-picklist-item:not(.cdk-drag-disabled){cursor:move}.p-picklist-item.cdk-drag-placeholder{opacity:0}.p-picklist-item.cdk-drag-animating{transition:transform .25s cubic-bezier(0,0,.2,1)}.p-picklist-filter{position:relative}.p-picklist-filter-icon{margin-top:-.5rem;position:absolute;top:50%}.p-picklist-filter-input{width:100%}.p-picklist-list.cdk-drop-list-dragging .p-picklist-item:not(.cdk-drag-placeholder){transition:transform .25s cubic-bezier(0,0,.2,1)}"]
            },] }
];
PickList.ctorParameters = () => [
    { type: ElementRef },
    { type: ChangeDetectorRef },
    { type: FilterService }
];
PickList.propDecorators = {
    source: [{ type: Input }],
    target: [{ type: Input }],
    sourceHeader: [{ type: Input }],
    targetHeader: [{ type: Input }],
    responsive: [{ type: Input }],
    filterBy: [{ type: Input }],
    filterLocale: [{ type: Input }],
    trackBy: [{ type: Input }],
    sourceTrackBy: [{ type: Input }],
    targetTrackBy: [{ type: Input }],
    showSourceFilter: [{ type: Input }],
    showTargetFilter: [{ type: Input }],
    metaKeySelection: [{ type: Input }],
    dragdrop: [{ type: Input }],
    style: [{ type: Input }],
    styleClass: [{ type: Input }],
    sourceStyle: [{ type: Input }],
    targetStyle: [{ type: Input }],
    showSourceControls: [{ type: Input }],
    showTargetControls: [{ type: Input }],
    sourceFilterPlaceholder: [{ type: Input }],
    targetFilterPlaceholder: [{ type: Input }],
    disabled: [{ type: Input }],
    ariaSourceFilterLabel: [{ type: Input }],
    ariaTargetFilterLabel: [{ type: Input }],
    filterMatchMode: [{ type: Input }],
    breakpoint: [{ type: Input }],
    onMoveToSource: [{ type: Output }],
    onMoveAllToSource: [{ type: Output }],
    onMoveAllToTarget: [{ type: Output }],
    onMoveToTarget: [{ type: Output }],
    onSourceReorder: [{ type: Output }],
    onTargetReorder: [{ type: Output }],
    onSourceSelect: [{ type: Output }],
    onTargetSelect: [{ type: Output }],
    onSourceFilter: [{ type: Output }],
    onTargetFilter: [{ type: Output }],
    listViewSourceChild: [{ type: ViewChild, args: ['sourcelist',] }],
    listViewTargetChild: [{ type: ViewChild, args: ['targetlist',] }],
    sourceFilterViewChild: [{ type: ViewChild, args: ['sourceFilter',] }],
    targetFilterViewChild: [{ type: ViewChild, args: ['targetFilter',] }],
    templates: [{ type: ContentChildren, args: [PrimeTemplate,] }]
};
export class PickListModule {
}
PickListModule.decorators = [
    { type: NgModule, args: [{
                imports: [CommonModule, ButtonModule, SharedModule, RippleModule, DragDropModule],
                exports: [PickList, SharedModule, DragDropModule],
                declarations: [PickList]
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGlja2xpc3QuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4vc3JjL2FwcC9jb21wb25lbnRzL3BpY2tsaXN0LyIsInNvdXJjZXMiOlsicGlja2xpc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFzQyxLQUFLLEVBQUUsTUFBTSxFQUFFLGVBQWUsRUFBMEIsWUFBWSxFQUFFLFNBQVMsRUFBRSx1QkFBdUIsRUFBRSxpQkFBaUIsRUFBRSxpQkFBaUIsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNuUCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDN0MsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQzVDLE9BQU8sRUFBQyxZQUFZLEVBQUMsYUFBYSxFQUFDLGFBQWEsRUFBQyxNQUFNLGFBQWEsQ0FBQztBQUNyRSxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQ3ZDLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUM1QyxPQUFPLEVBQWMsY0FBYyxFQUFFLGVBQWUsRUFBRSxpQkFBaUIsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQ3ZHLE9BQU8sRUFBQyxXQUFXLEVBQUUsaUJBQWlCLEVBQUMsTUFBTSxlQUFlLENBQUM7QUEyRjdELE1BQU0sT0FBTyxRQUFRO0lBa0lqQixZQUFtQixFQUFjLEVBQVMsRUFBcUIsRUFBUyxhQUE0QjtRQUFqRixPQUFFLEdBQUYsRUFBRSxDQUFZO1FBQVMsT0FBRSxHQUFGLEVBQUUsQ0FBbUI7UUFBUyxrQkFBYSxHQUFiLGFBQWEsQ0FBZTtRQWxIM0YsWUFBTyxHQUFhLENBQUMsS0FBYSxFQUFFLElBQVMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDO1FBTXZELHFCQUFnQixHQUFZLElBQUksQ0FBQztRQUVqQyxxQkFBZ0IsR0FBWSxJQUFJLENBQUM7UUFFakMscUJB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WUFMMUIsUUFBUSxTQUFDO2dCQUNOLE9BQU8sRUFBRSxDQUFDLFlBQVksRUFBQyxZQUFZLEVBQUMsWUFBWSxFQUFDLFlBQVksRUFBQyxjQUFjLENBQUM7Z0JBQzdFLE9BQU8sRUFBRSxDQUFDLFFBQVEsRUFBQyxZQUFZLEVBQUMsY0FBYyxDQUFDO2dCQUMvQyxZQUFZLEVBQUUsQ0FBQyxRQUFRLENBQUM7YUFDM0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOZ01vZHVsZSwgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBBZnRlckNvbnRlbnRJbml0LCBBZnRlclZpZXdDaGVja2VkLCBJbnB1dCwgT3V0cHV0LCBDb250ZW50Q2hpbGRyZW4sIFF1ZXJ5TGlzdCwgVGVtcGxhdGVSZWYsIEV2ZW50RW1pdHRlciwgVmlld0NoaWxkLCBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSwgVmlld0VuY2Fwc3VsYXRpb24sIENoYW5nZURldGVjdG9yUmVmfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHtDb21tb25Nb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XHJcbmltcG9ydCB7QnV0dG9uTW9kdWxlfSBmcm9tICdwcmltZW5nL2J1dHRvbic7XHJcbmltcG9ydCB7U2hhcmVkTW9kdWxlLFByaW1lVGVtcGxhdGUsRmlsdGVyU2VydmljZX0gZnJvbSAncHJpbWVuZy9hcGknO1xyXG5pbXBvcnQge0RvbUhhbmRsZXJ9IGZyb20gJ3ByaW1lbmcvZG9tJztcclxuaW1wb3J0IHtSaXBwbGVNb2R1bGV9IGZyb20gJ3ByaW1lbmcvcmlwcGxlJztcclxuaW1wb3J0IHtDZGtEcmFnRHJvcCwgRHJhZ0Ryb3BNb2R1bGUsIG1vdmVJdGVtSW5BcnJheSwgdHJhbnNmZXJBcnJheUl0ZW19IGZyb20gJ0Bhbmd1bGFyL2Nkay9kcmFnLWRyb3AnO1xyXG5pbXBvcnQge09iamVjdFV0aWxzLCBVbmlxdWVDb21wb25lbnRJZH0gZnJvbSAncHJpbWVuZy91dGlscyc7XHJcblxyXG5AQ29tcG9uZW50KHtcclxuICAgIHNlbGVjdG9yOiAncC1waWNrTGlzdCcsXHJcbiAgICB0ZW1wbGF0ZTogYFxyXG4gICAgICAgIDxkaXYgW2NsYXNzXT1cInN0eWxlQ2xhc3NcIiBbbmdTdHlsZV09XCJzdHlsZVwiIFtuZ0NsYXNzXT1cIidwLXBpY2tsaXN0IHAtY29tcG9uZW50J1wiIGNka0Ryb3BMaXN0R3JvdXA+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwLXBpY2tsaXN0LWJ1dHRvbnMgcC1waWNrbGlzdC1zb3VyY2UtY29udHJvbHNcIiAqbmdJZj1cInNob3dTb3VyY2VDb250cm9sc1wiPlxyXG4gICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgcEJ1dHRvbiBwUmlwcGxlIGljb249XCJwaSBwaS1hbmdsZS11cFwiIFtkaXNhYmxlZF09XCJkaXNhYmxlZFwiIChjbGljayk9XCJtb3ZlVXAoc291cmNlbGlzdCxzb3VyY2Usc2VsZWN0ZWRJdGVtc1NvdXJjZSxvblNvdXJjZVJlb3JkZXIsU09VUkNFX0xJU1QpXCI+PC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBwQnV0dG9uIHBSaXBwbGUgaWNvbj1cInBpIHBpLWFuZ2xlLWRvdWJsZS11cFwiIFtkaXNhYmxlZF09XCJkaXNhYmxlZFwiIChjbGljayk9XCJtb3ZlVG9wKHNvdXJjZWxpc3Qsc291cmNlLHNlbGVjdGVkSXRlbXNTb3VyY2Usb25Tb3VyY2VSZW9yZGVyLFNPVVJDRV9MSVNUKVwiPjwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgcEJ1dHRvbiBwUmlwcGxlIGljb249XCJwaSBwaS1hbmdsZS1kb3duXCIgW2Rpc2FibGVkXT1cImRpc2FibGVkXCIgKGNsaWNrKT1cIm1vdmVEb3duKHNvdXJjZWxpc3Qsc291cmNlLHNlbGVjdGVkSXRlbXNTb3VyY2Usb25Tb3VyY2VSZW9yZGVyLFNPVVJDRV9MSVNUKVwiPjwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgcEJ1dHRvbiBwUmlwcGxlIGljb249XCJwaSBwaS1hbmdsZS1kb3VibGUtZG93blwiIFtkaXNhYmxlZF09XCJkaXNhYmxlZFwiIChjbGljayk9XCJtb3ZlQm90dG9tKHNvdXJjZWxpc3Qsc291cmNlLHNlbGVjdGVkSXRlbXNTb3VyY2Usb25Tb3VyY2VSZW9yZGVyLFNPVVJDRV9MSVNUKVwiPjwvYnV0dG9uPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInAtcGlja2xpc3QtbGlzdC13cmFwcGVyIHAtcGlja2xpc3Qtc291cmNlLXdyYXBwZXJcIj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwLXBpY2tsaXN0LWhlYWRlclwiICpuZ0lmPVwic291cmNlSGVhZGVyIHx8IHNvdXJjZUhlYWRlclRlbXBsYXRlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInAtcGlja2xpc3QtdGl0bGVcIiAqbmdJZj1cIiFzb3VyY2VIZWFkZXJUZW1wbGF0ZVwiPnt7c291cmNlSGVhZGVyfX08L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8bmctY29udGFpbmVyICpuZ1RlbXBsYXRlT3V0bGV0PVwic291cmNlSGVhZGVyVGVtcGxhdGVcIj48L25nLWNvbnRhaW5lcj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInAtcGlja2xpc3QtZmlsdGVyLWNvbnRhaW5lclwiICpuZ0lmPVwiZmlsdGVyQnkgJiYgc2hvd1NvdXJjZUZpbHRlciAhPT0gZmFsc2VcIj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicC1waWNrbGlzdC1maWx0ZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0ICNzb3VyY2VGaWx0ZXIgdHlwZT1cInRleHRcIiByb2xlPVwidGV4dGJveFwiIChrZXl1cCk9XCJvbkZpbHRlcigkZXZlbnQsc291cmNlLFNPVVJDRV9MSVNUKVwiIGNsYXNzPVwicC1waWNrbGlzdC1maWx0ZXItaW5wdXQgcC1pbnB1dHRleHQgcC1jb21wb25lbnRcIiBbZGlzYWJsZWRdPVwiZGlzYWJsZWRcIiBbYXR0ci5wbGFjZWhvbGRlcl09XCJzb3VyY2VGaWx0ZXJQbGFjZWhvbGRlclwiIFthdHRyLmFyaWEtbGFiZWxdPVwiYXJpYVNvdXJjZUZpbHRlckxhYmVsXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwicC1waWNrbGlzdC1maWx0ZXItaWNvbiBwaSBwaS1zZWFyY2hcIj48L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgPHVsICNzb3VyY2VsaXN0IGNsYXNzPVwicC1waWNrbGlzdC1saXN0IHAtcGlja2xpc3Qtc291cmNlXCIgY2RrRHJvcExpc3QgW2Nka0Ryb3BMaXN0RGF0YV09XCJzb3VyY2VcIiAoY2RrRHJvcExpc3REcm9wcGVkKT1cIm9uRHJvcCgkZXZlbnQsIFNPVVJDRV9MSVNUKVwiXHJcbiAgICAgICAgICAgICAgICAgICAgW25nU3R5bGVdPVwic291cmNlU3R5bGVcIiByb2xlPVwibGlzdGJveFwiIGFyaWEtbXVsdGlzZWxlY3RhYmxlPVwibXVsdGlwbGVcIj5cclxuICAgICAgICAgICAgICAgICAgICA8bmctdGVtcGxhdGUgbmdGb3IgbGV0LWl0ZW0gW25nRm9yT2ZdPVwic291cmNlXCIgW25nRm9yVHJhY2tCeV09XCJzb3VyY2VUcmFja0J5IHx8IHRyYWNrQnlcIiBsZXQtaT1cImluZGV4XCIgbGV0LWw9XCJsYXN0XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxsaSBbbmdDbGFzc109XCJ7J3AtcGlja2xpc3QtaXRlbSc6dHJ1ZSwncC1oaWdobGlnaHQnOmlzU2VsZWN0ZWQoaXRlbSxzZWxlY3RlZEl0ZW1zU291cmNlKSwncC1kaXNhYmxlZCc6IGRpc2FibGVkfVwiIHBSaXBwbGUgY2RrRHJhZyBbY2RrRHJhZ0RhdGFdPVwiaXRlbVwiIFtjZGtEcmFnRGlzYWJsZWRdPVwiIWRyYWdkcm9wXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIChjbGljayk9XCJvbkl0ZW1DbGljaygkZXZlbnQsaXRlbSxzZWxlY3RlZEl0ZW1zU291cmNlLG9uU291cmNlU2VsZWN0KVwiIChkYmxjbGljayk9XCJvblNvdXJjZUl0ZW1EYmxDbGljaygpXCIgKHRvdWNoZW5kKT1cIm9uSXRlbVRvdWNoRW5kKClcIiAoa2V5ZG93bik9XCJvbkl0ZW1LZXlkb3duKCRldmVudCxpdGVtLHNlbGVjdGVkSXRlbXNTb3VyY2Usb25Tb3VyY2VTZWxlY3QpXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICpuZ0lmPVwiaXNJdGVtVmlzaWJsZShpdGVtLCBTT1VSQ0VfTElTVClcIiB0YWJpbmRleD1cIjBcIiByb2xlPVwib3B0aW9uXCIgW2F0dHIuYXJpYS1zZWxlY3RlZF09XCJpc1NlbGVjdGVkKGl0ZW0sIHNlbGVjdGVkSXRlbXNTb3VyY2UpXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bmctY29udGFpbmVyICpuZ1RlbXBsYXRlT3V0bGV0PVwiaXRlbVRlbXBsYXRlOyBjb250ZXh0OiB7JGltcGxpY2l0OiBpdGVtLCBpbmRleDogaX1cIj48L25nLWNvbnRhaW5lcj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9saT5cclxuICAgICAgICAgICAgICAgICAgICA8L25nLXRlbXBsYXRlPlxyXG4gICAgICAgICAgICAgICAgICAgIDxuZy1jb250YWluZXIgKm5nSWY9XCJpc0VtcHR5KFNPVVJDRV9MSVNUKSAmJiAoZW1wdHlNZXNzYWdlU291cmNlVGVtcGxhdGUgfHwgZW1wdHlGaWx0ZXJNZXNzYWdlU291cmNlVGVtcGxhdGUpXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxsaSBjbGFzcz1cInAtcGlja2xpc3QtZW1wdHktbWVzc2FnZVwiICpuZ0lmPVwiIWZpbHRlclZhbHVlU291cmNlIHx8ICFlbXB0eUZpbHRlck1lc3NhZ2VTb3VyY2VUZW1wbGF0ZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPG5nLWNvbnRhaW5lciAqbmdUZW1wbGF0ZU91dGxldD1cImVtcHR5TWVzc2FnZVNvdXJjZVRlbXBsYXRlXCI+PC9uZy1jb250YWluZXI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvbGk+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxsaSBjbGFzcz1cInAtcGlja2xpc3QtZW1wdHktbWVzc2FnZVwiICpuZ0lmPVwiZmlsdGVyVmFsdWVTb3VyY2VcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxuZy1jb250YWluZXIgKm5nVGVtcGxhdGVPdXRsZXQ9XCJlbXB0eUZpbHRlck1lc3NhZ2VTb3VyY2VUZW1wbGF0ZVwiPjwvbmctY29udGFpbmVyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2xpPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvbmctY29udGFpbmVyPlxyXG4gICAgICAgICAgICAgICAgPC91bD5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwLXBpY2tsaXN0LWJ1dHRvbnMgcC1waWNrbGlzdC10cmFuc2Zlci1idXR0b25zXCI+XHJcbiAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBwQnV0dG9uIHBSaXBwbGUgaWNvbj1cInBpIHBpLWFuZ2xlLXJpZ2h0XCIgW2Rpc2FibGVkXT1cImRpc2FibGVkXCIgKGNsaWNrKT1cIm1vdmVSaWdodCgpXCI+PC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBwQnV0dG9uIHBSaXBwbGUgaWNvbj1cInBpIHBpLWFuZ2xlLWRvdWJsZS1yaWdodFwiIFtkaXNhYmxlZF09XCJkaXNhYmxlZFwiIChjbGljayk9XCJtb3ZlQWxsUmlnaHQoKVwiPjwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgcEJ1dHRvbiBwUmlwcGxlIGljb249XCJwaSBwaS1hbmdsZS1sZWZ0XCIgW2Rpc2FibGVkXT1cImRpc2FibGVkXCIgKGNsaWNrKT1cIm1vdmVMZWZ0KClcIj48L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIHBCdXR0b24gcFJpcHBsZSBpY29uPVwicGkgcGktYW5nbGUtZG91YmxlLWxlZnRcIiBbZGlzYWJsZWRdPVwiZGlzYWJsZWRcIiAoY2xpY2spPVwibW92ZUFsbExlZnQoKVwiPjwvYnV0dG9uPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInAtcGlja2xpc3QtbGlzdC13cmFwcGVyIHAtcGlja2xpc3QtdGFyZ2V0LXdyYXBwZXJcIj5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwLXBpY2tsaXN0LWhlYWRlclwiICpuZ0lmPVwidGFyZ2V0SGVhZGVyIHx8IHRhcmdldEhlYWRlclRlbXBsYXRlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInAtcGlja2xpc3QtdGl0bGVcIiAqbmdJZj1cIiF0YXJnZXRIZWFkZXJUZW1wbGF0ZVwiPnt7dGFyZ2V0SGVhZGVyfX08L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8bmctY29udGFpbmVyICpuZ1RlbXBsYXRlT3V0bGV0PVwidGFyZ2V0SGVhZGVyVGVtcGxhdGVcIj48L25nLWNvbnRhaW5lcj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInAtcGlja2xpc3QtZmlsdGVyLWNvbnRhaW5lclwiICpuZ0lmPVwiZmlsdGVyQnkgJiYgc2hvd1RhcmdldEZpbHRlciAhPT0gZmFsc2VcIj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicC1waWNrbGlzdC1maWx0ZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0ICN0YXJnZXRGaWx0ZXIgdHlwZT1cInRleHRcIiByb2xlPVwidGV4dGJveFwiIChrZXl1cCk9XCJvbkZpbHRlcigkZXZlbnQsdGFyZ2V0LFRBUkdFVF9MSVNUKVwiIGNsYXNzPVwicC1waWNrbGlzdC1maWx0ZXItaW5wdXQgcC1pbnB1dHRleHQgcC1jb21wb25lbnRcIiBbZGlzYWJsZWRdPVwiZGlzYWJsZWRcIiBbYXR0ci5wbGFjZWhvbGRlcl09XCJ0YXJnZXRGaWx0ZXJQbGFjZWhvbGRlclwiIFthdHRyLmFyaWEtbGFiZWxdPVwiYXJpYVRhcmdldEZpbHRlckxhYmVsXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwicC1waWNrbGlzdC1maWx0ZXItaWNvbiBwaSBwaS1zZWFyY2hcIj48L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIDx1bCAjdGFyZ2V0bGlzdCBjbGFzcz1cInAtcGlja2xpc3QtbGlzdCBwLXBpY2tsaXN0LXRhcmdldFwiIGNka0Ryb3BMaXN0IFtjZGtEcm9wTGlzdERhdGFdPVwidGFyZ2V0XCIgKGNka0Ryb3BMaXN0RHJvcHBlZCk9XCJvbkRyb3AoJGV2ZW50LCBUQVJHRVRfTElTVClcIlxyXG4gICAgICAgICAgICAgICAgICAgIFtuZ1N0eWxlXT1cInRhcmdldFN0eWxlXCIgcm9sZT1cImxpc3Rib3hcIiBhcmlhLW11bHRpc2VsZWN0YWJsZT1cIm11bHRpcGxlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPG5nLXRlbXBsYXRlIG5nRm9yIGxldC1pdGVtIFtuZ0Zvck9mXT1cInRhcmdldFwiIFtuZ0ZvclRyYWNrQnldPVwidGFyZ2V0VHJhY2tCeSB8fCB0cmFja0J5XCIgbGV0LWk9XCJpbmRleFwiIGxldC1sPVwibGFzdFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8bGkgW25nQ2xhc3NdPVwieydwLXBpY2tsaXN0LWl0ZW0nOnRydWUsJ3AtaGlnaGxpZ2h0Jzppc1NlbGVjdGVkKGl0ZW0sc2VsZWN0ZWRJdGVtc1RhcmdldCksICdwLWRpc2FibGVkJzogZGlzYWJsZWR9XCIgcFJpcHBsZSBjZGtEcmFnIFtjZGtEcmFnRGF0YV09XCJpdGVtXCIgW2Nka0RyYWdEaXNhYmxlZF09XCIhZHJhZ2Ryb3BcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKGNsaWNrKT1cIm9uSXRlbUNsaWNrKCRldmVudCxpdGVtLHNlbGVjdGVkSXRlbXNUYXJnZXQsb25UYXJnZXRTZWxlY3QpXCIgKGRibGNsaWNrKT1cIm9uVGFyZ2V0SXRlbURibENsaWNrKClcIiAodG91Y2hlbmQpPVwib25JdGVtVG91Y2hFbmQoKVwiIChrZXlkb3duKT1cIm9uSXRlbUtleWRvd24oJGV2ZW50LGl0ZW0sc2VsZWN0ZWRJdGVtc1RhcmdldCxvblRhcmdldFNlbGVjdClcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKm5nSWY9XCJpc0l0ZW1WaXNpYmxlKGl0ZW0sIFRBUkdFVF9MSVNUKVwiIHRhYmluZGV4PVwiMFwiIHJvbGU9XCJvcHRpb25cIiBbYXR0ci5hcmlhLXNlbGVjdGVkXT1cImlzU2VsZWN0ZWQoaXRlbSwgc2VsZWN0ZWRJdGVtc1RhcmdldClcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxuZy1jb250YWluZXIgKm5nVGVtcGxhdGVPdXRsZXQ9XCJpdGVtVGVtcGxhdGU7IGNvbnRleHQ6IHskaW1wbGljaXQ6IGl0ZW0sIGluZGV4OiBpfVwiPjwvbmctY29udGFpbmVyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2xpPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvbmctdGVtcGxhdGU+XHJcbiAgICAgICAgICAgICAgICAgICAgPG5nLWNvbnRhaW5lciAqbmdJZj1cImlzRW1wdHkoVEFSR0VUX0xJU1QpICYmIChlbXB0eU1lc3NhZ2VUYXJnZXRUZW1wbGF0ZSB8fCBlbXB0eUZpbHRlck1lc3NhZ2VUYXJnZXRUZW1wbGF0ZSlcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGxpIGNsYXNzPVwicC1waWNrbGlzdC1lbXB0eS1tZXNzYWdlXCIgKm5nSWY9XCIhZmlsdGVyVmFsdWVUYXJnZXQgfHwgIWVtcHR5RmlsdGVyTWVzc2FnZVRhcmdldFRlbXBsYXRlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bmctY29udGFpbmVyICpuZ1RlbXBsYXRlT3V0bGV0PVwiZW1wdHlNZXNzYWdlVGFyZ2V0VGVtcGxhdGVcIj48L25nLWNvbnRhaW5lcj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9saT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGxpIGNsYXNzPVwicC1waWNrbGlzdC1lbXB0eS1tZXNzYWdlXCIgKm5nSWY9XCJmaWx0ZXJWYWx1ZVRhcmdldFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPG5nLWNvbnRhaW5lciAqbmdUZW1wbGF0ZU91dGxldD1cImVtcHR5RmlsdGVyTWVzc2FnZVRhcmdldFRlbXBsYXRlXCI+PC9uZy1jb250YWluZXI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvbGk+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9uZy1jb250YWluZXI+XHJcbiAgICAgICAgICAgICAgICA8L3VsPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInAtcGlja2xpc3QtYnV0dG9ucyBwLXBpY2tsaXN0LXRhcmdldC1jb250cm9sc1wiICpuZ0lmPVwic2hvd1RhcmdldENvbnRyb2xzXCI+XHJcbiAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBwQnV0dG9uIHBSaXBwbGUgaWNvbj1cInBpIHBpLWFuZ2xlLXVwXCIgW2Rpc2FibGVkXT1cImRpc2FibGVkXCIgKGNsaWNrKT1cIm1vdmVVcCh0YXJnZXRsaXN0LHRhcmdldCxzZWxlY3RlZEl0ZW1zVGFyZ2V0LG9uVGFyZ2V0UmVvcmRlcixUQVJHRVRfTElTVClcIj48L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIHBCdXR0b24gcFJpcHBsZSBpY29uPVwicGkgcGktYW5nbGUtZG91YmxlLXVwXCIgW2Rpc2FibGVkXT1cImRpc2FibGVkXCIgKGNsaWNrKT1cIm1vdmVUb3AodGFyZ2V0bGlzdCx0YXJnZXQsc2VsZWN0ZWRJdGVtc1RhcmdldCxvblRhcmdldFJlb3JkZXIsVEFSR0VUX0xJU1QpXCI+PC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBwQnV0dG9uIHBSaXBwbGUgaWNvbj1cInBpIHBpLWFuZ2xlLWRvd25cIiBbZGlzYWJsZWRdPVwiZGlzYWJsZWRcIiAoY2xpY2spPVwibW92ZURvd24odGFyZ2V0bGlzdCx0YXJnZXQsc2VsZWN0ZWRJdGVtc1RhcmdldCxvblRhcmdldFJlb3JkZXIsVEFSR0VUX0xJU1QpXCI+PC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBwQnV0dG9uIHBSaXBwbGUgaWNvbj1cInBpIHBpLWFuZ2xlLWRvdWJsZS1kb3duXCIgW2Rpc2FibGVkXT1cImRpc2FibGVkXCIgKGNsaWNrKT1cIm1vdmVCb3R0b20odGFyZ2V0bGlzdCx0YXJnZXQsc2VsZWN0ZWRJdGVtc1RhcmdldCxvblRhcmdldFJlb3JkZXIsVEFSR0VUX0xJU1QpXCI+PC9idXR0b24+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgYCxcclxuICAgIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxyXG4gICAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcclxuICAgIHN0eWxlVXJsczogWycuL3BpY2tsaXN0LmNzcyddXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBQaWNrTGlzdCBpbXBsZW1lbnRzIEFmdGVyVmlld0NoZWNrZWQsQWZ0ZXJDb250ZW50SW5pdCB7XHJcblxyXG4gICAgQElucHV0KCkgc291cmNlOiBhbnlbXTtcclxuXHJcbiAgICBASW5wdXQoKSB0YXJnZXQ6IGFueVtdO1xyXG5cclxuICAgIEBJbnB1dCgpIHNvdXJjZUhlYWRlcjogc3RyaW5nO1xyXG5cclxuICAgIEBJbnB1dCgpIHRhcmdldEhlYWRlcjogc3RyaW5nO1xyXG5cclxuICAgIEBJbnB1dCgpIHJlc3BvbnNpdmU6IGJvb2xlYW47XHJcblxyXG4gICAgQElucHV0KCkgZmlsdGVyQnk6IHN0cmluZztcclxuXHJcbiAgICBASW5wdXQoKSBmaWx0ZXJMb2NhbGU6IHN0cmluZztcclxuXHJcbiAgICBASW5wdXQoKSB0cmFja0J5OiBGdW5jdGlvbiA9IChpbmRleDogbnVtYmVyLCBpdGVtOiBhbnkpID0+IGl0ZW07XHJcblxyXG4gICAgQElucHV0KCkgc291cmNlVHJhY2tCeTogRnVuY3Rpb247XHJcblxyXG4gICAgQElucHV0KCkgdGFyZ2V0VHJhY2tCeTogRnVuY3Rpb247XHJcblxyXG4gICAgQElucHV0KCkgc2hvd1NvdXJjZUZpbHRlcjogYm9vbGVhbiA9IHRydWU7XHJcblxyXG4gICAgQElucHV0KCkgc2hvd1RhcmdldEZpbHRlcjogYm9vbGVhbiA9IHRydWU7XHJcblxyXG4gICAgQElucHV0KCkgbWV0YUtleVNlbGVjdGlvbjogYm9vbGVhbiA9IHRydWU7XHJcblxyXG4gICAgQElucHV0KCkgZHJhZ2Ryb3A6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgICBASW5wdXQoKSBzdHlsZTogYW55O1xyXG5cclxuICAgIEBJbnB1dCgpIHN0eWxlQ2xhc3M6IHN0cmluZztcclxuXHJcbiAgICBASW5wdXQoKSBzb3VyY2VTdHlsZTogYW55O1xyXG5cclxuICAgIEBJbnB1dCgpIHRhcmdldFN0eWxlOiBhbnk7XHJcblxyXG4gICAgQElucHV0KCkgc2hvd1NvdXJjZUNvbnRyb2xzOiBib29sZWFuID0gdHJ1ZTtcclxuXHJcbiAgICBASW5wdXQoKSBzaG93VGFyZ2V0Q29udHJvbHM6IGJvb2xlYW4gPSB0cnVlO1xyXG5cclxuICAgIEBJbnB1dCgpIHNvdXJjZUZpbHRlclBsYWNlaG9sZGVyOiBzdHJpbmc7XHJcblxyXG4gICAgQElucHV0KCkgdGFyZ2V0RmlsdGVyUGxhY2Vob2xkZXI6IHN0cmluZztcclxuXHJcbiAgICBASW5wdXQoKSBkaXNhYmxlZDogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICAgIEBJbnB1dCgpIGFyaWFTb3VyY2VGaWx0ZXJMYWJlbDogc3RyaW5nO1xyXG5cclxuICAgIEBJbnB1dCgpIGFyaWFUYXJnZXRGaWx0ZXJMYWJlbDogc3RyaW5nO1xyXG5cclxuICAgIEBJbnB1dCgpIGZpbHRlck1hdGNoTW9kZTogc3RyaW5nID0gXCJjb250YWluc1wiO1xyXG5cclxuICAgIEBJbnB1dCgpIGJyZWFrcG9pbnQ6IHN0cmluZyA9IFwiOTYwcHhcIjtcclxuXHJcbiAgICBAT3V0cHV0KCkgb25Nb3ZlVG9Tb3VyY2U6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG5cclxuICAgIEBPdXRwdXQoKSBvbk1vdmVBbGxUb1NvdXJjZTogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XHJcblxyXG4gICAgQE91dHB1dCgpIG9uTW92ZUFsbFRvVGFyZ2V0OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcclxuXHJcbiAgICBAT3V0cHV0KCkgb25Nb3ZlVG9UYXJnZXQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG5cclxuICAgIEBPdXRwdXQoKSBvblNvdXJjZVJlb3JkZXI6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG5cclxuICAgIEBPdXRwdXQoKSBvblRhcmdldFJlb3JkZXI6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG5cclxuICAgIEBPdXRwdXQoKSBvblNvdXJjZVNlbGVjdDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XHJcblxyXG4gICAgQE91dHB1dCgpIG9uVGFyZ2V0U2VsZWN0OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcclxuXHJcbiAgICBAT3V0cHV0KCkgb25Tb3VyY2VGaWx0ZXI6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG5cclxuICAgIEBPdXRwdXQoKSBvblRhcmdldEZpbHRlcjogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XHJcblxyXG4gICAgQFZpZXdDaGlsZCgnc291cmNlbGlzdCcpIGxpc3RWaWV3U291cmNlQ2hpbGQ6IEVsZW1lbnRSZWY7XHJcblxyXG4gICAgQFZpZXdDaGlsZCgndGFyZ2V0bGlzdCcpIGxpc3RWaWV3VGFyZ2V0Q2hpbGQ6IEVsZW1lbnRSZWY7XHJcblxyXG4gICAgQFZpZXdDaGlsZCgnc291cmNlRmlsdGVyJykgc291cmNlRmlsdGVyVmlld0NoaWxkOiBFbGVtZW50UmVmO1xyXG5cclxuICAgIEBWaWV3Q2hpbGQoJ3RhcmdldEZpbHRlcicpIHRhcmdldEZpbHRlclZpZXdDaGlsZDogRWxlbWVudFJlZjtcclxuXHJcbiAgICBAQ29udGVudENoaWxkcmVuKFByaW1lVGVtcGxhdGUpIHRlbXBsYXRlczogUXVlcnlMaXN0PGFueT47XHJcblxyXG4gICAgcHVibGljIGl0ZW1UZW1wbGF0ZTogVGVtcGxhdGVSZWY8YW55PjtcclxuXHJcbiAgICBwdWJsaWMgdmlzaWJsZU9wdGlvbnNTb3VyY2U6IGFueVtdO1xyXG5cclxuICAgIHB1YmxpYyB2aXNpYmxlT3B0aW9uc1RhcmdldDogYW55W107XHJcblxyXG4gICAgc2VsZWN0ZWRJdGVtc1NvdXJjZTogYW55W10gPSBbXTtcclxuXHJcbiAgICBzZWxlY3RlZEl0ZW1zVGFyZ2V0OiBhbnlbXSA9IFtdO1xyXG5cclxuICAgIHJlb3JkZXJlZExpc3RFbGVtZW50OiBhbnk7XHJcblxyXG4gICAgbW92ZWRVcDogYm9vbGVhbjtcclxuXHJcbiAgICBtb3ZlZERvd246IGJvb2xlYW47XHJcblxyXG4gICAgaXRlbVRvdWNoZWQ6IGJvb2xlYW47XHJcblxyXG4gICAgc3R5bGVFbGVtZW50OiBhbnk7XHJcblxyXG4gICAgaWQ6IHN0cmluZyA9IFVuaXF1ZUNvbXBvbmVudElkKCk7XHJcblxyXG4gICAgZmlsdGVyVmFsdWVTb3VyY2U6IHN0cmluZztcclxuXHJcbiAgICBmaWx0ZXJWYWx1ZVRhcmdldDogc3RyaW5nO1xyXG5cclxuICAgIGZyb21MaXN0VHlwZTogbnVtYmVyO1xyXG5cclxuICAgIGVtcHR5TWVzc2FnZVNvdXJjZVRlbXBsYXRlOiBUZW1wbGF0ZVJlZjxhbnk+O1xyXG5cclxuICAgIGVtcHR5RmlsdGVyTWVzc2FnZVNvdXJjZVRlbXBsYXRlOiBUZW1wbGF0ZVJlZjxhbnk+O1xyXG5cclxuICAgIGVtcHR5TWVzc2FnZVRhcmdldFRlbXBsYXRlOiBUZW1wbGF0ZVJlZjxhbnk+O1xyXG5cclxuICAgIGVtcHR5RmlsdGVyTWVzc2FnZVRhcmdldFRlbXBsYXRlOiBUZW1wbGF0ZVJlZjxhbnk+O1xyXG5cclxuICAgIHNvdXJjZUhlYWRlclRlbXBsYXRlOiBUZW1wbGF0ZVJlZjxhbnk+O1xyXG5cclxuICAgIHRhcmdldEhlYWRlclRlbXBsYXRlOiBUZW1wbGF0ZVJlZjxhbnk+O1xyXG5cclxuICAgIHJlYWRvbmx5IFNPVVJDRV9MSVNUID0gLTE7XHJcblxyXG4gICAgcmVhZG9ubHkgVEFSR0VUX0xJU1QgPSAxO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBlbDogRWxlbWVudFJlZiwgcHVibGljIGNkOiBDaGFuZ2VEZXRlY3RvclJlZiwgcHVibGljIGZpbHRlclNlcnZpY2U6IEZpbHRlclNlcnZpY2UpIHt9XHJcblxyXG5cclxuICAgIG5nT25Jbml0KCkge1xyXG4gICAgICAgIGlmICh0aGlzLnJlc3BvbnNpdmUpIHtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVTdHlsZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBuZ0FmdGVyQ29udGVudEluaXQoKSB7XHJcbiAgICAgICAgdGhpcy50ZW1wbGF0ZXMuZm9yRWFjaCgoaXRlbSkgPT4ge1xyXG4gICAgICAgICAgICBzd2l0Y2goaXRlbS5nZXRUeXBlKCkpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2l0ZW0nOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXRlbVRlbXBsYXRlID0gaXRlbS50ZW1wbGF0ZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgIGNhc2UgJ3NvdXJjZUhlYWRlcic6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zb3VyY2VIZWFkZXJUZW1wbGF0ZSA9IGl0ZW0udGVtcGxhdGU7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgICAgICBjYXNlICd0YXJnZXRIZWFkZXInOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGFyZ2V0SGVhZGVyVGVtcGxhdGUgPSBpdGVtLnRlbXBsYXRlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICAgICAgY2FzZSAnZW1wdHltZXNzYWdlc291cmNlJzpcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVtcHR5TWVzc2FnZVNvdXJjZVRlbXBsYXRlID0gaXRlbS50ZW1wbGF0ZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgIGNhc2UgJ2VtcHR5ZmlsdGVybWVzc2FnZXNvdXJjZSc6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbXB0eUZpbHRlck1lc3NhZ2VTb3VyY2VUZW1wbGF0ZSA9IGl0ZW0udGVtcGxhdGU7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgICAgICBjYXNlICdlbXB0eW1lc3NhZ2V0YXJnZXQnOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZW1wdHlNZXNzYWdlVGFyZ2V0VGVtcGxhdGUgPSBpdGVtLnRlbXBsYXRlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICAgICAgY2FzZSAnZW1wdHlmaWx0ZXJtZXNzYWdldGFyZ2V0JzpcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVtcHR5RmlsdGVyTWVzc2FnZVRhcmdldFRlbXBsYXRlID0gaXRlbS50ZW1wbGF0ZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pdGVtVGVtcGxhdGUgPSBpdGVtLnRlbXBsYXRlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBuZ0FmdGVyVmlld0NoZWNrZWQoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMubW92ZWRVcHx8dGhpcy5tb3ZlZERvd24pIHtcclxuICAgICAgICAgICAgbGV0IGxpc3RJdGVtcyA9IERvbUhhbmRsZXIuZmluZCh0aGlzLnJlb3JkZXJlZExpc3RFbGVtZW50LCAnbGkucC1oaWdobGlnaHQnKTtcclxuICAgICAgICAgICAgbGV0IGxpc3RJdGVtO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMubW92ZWRVcClcclxuICAgICAgICAgICAgICAgIGxpc3RJdGVtID0gbGlzdEl0ZW1zWzBdO1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICBsaXN0SXRlbSA9IGxpc3RJdGVtc1tsaXN0SXRlbXMubGVuZ3RoIC0gMV07XHJcblxyXG4gICAgICAgICAgICBEb21IYW5kbGVyLnNjcm9sbEluVmlldyh0aGlzLnJlb3JkZXJlZExpc3RFbGVtZW50LCBsaXN0SXRlbSk7XHJcbiAgICAgICAgICAgIHRoaXMubW92ZWRVcCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLm1vdmVkRG93biA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLnJlb3JkZXJlZExpc3RFbGVtZW50ID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgb25JdGVtQ2xpY2soZXZlbnQsIGl0ZW06IGFueSwgc2VsZWN0ZWRJdGVtczogYW55W10sIGNhbGxiYWNrOiBFdmVudEVtaXR0ZXI8YW55Pikge1xyXG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBpbmRleCA9IHRoaXMuZmluZEluZGV4SW5TZWxlY3Rpb24oaXRlbSxzZWxlY3RlZEl0ZW1zKTtcclxuICAgICAgICBsZXQgc2VsZWN0ZWQgPSAoaW5kZXggIT0gLTEpO1xyXG4gICAgICAgIGxldCBtZXRhU2VsZWN0aW9uID0gdGhpcy5pdGVtVG91Y2hlZCA/IGZhbHNlIDogdGhpcy5tZXRhS2V5U2VsZWN0aW9uO1xyXG5cclxuICAgICAgICBpZiAobWV0YVNlbGVjdGlvbikge1xyXG4gICAgICAgICAgICBsZXQgbWV0YUtleSA9IChldmVudC5tZXRhS2V5fHxldmVudC5jdHJsS2V5fHxldmVudC5zaGlmdEtleSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoc2VsZWN0ZWQgJiYgbWV0YUtleSkge1xyXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRJdGVtcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFtZXRhS2V5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRJdGVtcy5sZW5ndGggPSAwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRJdGVtcy5wdXNoKGl0ZW0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAoc2VsZWN0ZWQpXHJcbiAgICAgICAgICAgICAgICBzZWxlY3RlZEl0ZW1zLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHNlbGVjdGVkSXRlbXMucHVzaChpdGVtKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNhbGxiYWNrLmVtaXQoe29yaWdpbmFsRXZlbnQ6IGV2ZW50LCBpdGVtczogc2VsZWN0ZWRJdGVtc30pO1xyXG5cclxuICAgICAgICB0aGlzLml0ZW1Ub3VjaGVkID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgb25Tb3VyY2VJdGVtRGJsQ2xpY2soKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5tb3ZlUmlnaHQoKTtcclxuICAgIH1cclxuXHJcbiAgICBvblRhcmdldEl0ZW1EYmxDbGljaygpIHtcclxuICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLm1vdmVMZWZ0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgb25GaWx0ZXIoZXZlbnQ6IEtleWJvYXJkRXZlbnQsIGRhdGE6IGFueVtdLCBsaXN0VHlwZTogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IHF1ZXJ5ID0gKCg8SFRNTElucHV0RWxlbWVudD4gZXZlbnQudGFyZ2V0KS52YWx1ZS50cmltKCkgYXMgYW55KS50b0xvY2FsZUxvd2VyQ2FzZSh0aGlzLmZpbHRlckxvY2FsZSk7XHJcbiAgICAgICAgaWYgKGxpc3RUeXBlID09PSB0aGlzLlNPVVJDRV9MSVNUKVxyXG4gICAgICAgICAgICB0aGlzLmZpbHRlclZhbHVlU291cmNlID0gcXVlcnk7XHJcbiAgICAgICAgZWxzZSBpZiAobGlzdFR5cGUgPT09IHRoaXMuVEFSR0VUX0xJU1QpXHJcbiAgICAgICAgICAgIHRoaXMuZmlsdGVyVmFsdWVUYXJnZXQgPSBxdWVyeTtcclxuICAgICAgICBcclxuICAgICAgICB0aGlzLmZpbHRlcihkYXRhLCBsaXN0VHlwZSk7XHJcbiAgICB9XHJcblxyXG4gICAgZmlsdGVyKGRhdGE6IGFueVtdLCBsaXN0VHlwZTogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IHNlYXJjaEZpZWxkcyA9IHRoaXMuZmlsdGVyQnkuc3BsaXQoJywnKTtcclxuXHJcbiAgICAgICAgaWYgKGxpc3RUeXBlID09PSB0aGlzLlNPVVJDRV9MSVNUKSB7XHJcbiAgICAgICAgICAgIHRoaXMudmlzaWJsZU9wdGlvbnNTb3VyY2UgPSB0aGlzLmZpbHRlclNlcnZpY2UuZmlsdGVyKGRhdGEsIHNlYXJjaEZpZWxkcywgdGhpcy5maWx0ZXJWYWx1ZVNvdXJjZSwgdGhpcy5maWx0ZXJNYXRjaE1vZGUsIHRoaXMuZmlsdGVyTG9jYWxlKTtcclxuICAgICAgICAgICAgdGhpcy5vblNvdXJjZUZpbHRlci5lbWl0KHtxdWVyeTogdGhpcy5maWx0ZXJWYWx1ZVNvdXJjZSwgdmFsdWU6IHRoaXMudmlzaWJsZU9wdGlvbnNTb3VyY2V9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAobGlzdFR5cGUgPT09IHRoaXMuVEFSR0VUX0xJU1QpIHtcclxuICAgICAgICAgICAgdGhpcy52aXNpYmxlT3B0aW9uc1RhcmdldCA9IHRoaXMuZmlsdGVyU2VydmljZS5maWx0ZXIoZGF0YSwgc2VhcmNoRmllbGRzLCB0aGlzLmZpbHRlclZhbHVlVGFyZ2V0LCB0aGlzLmZpbHRlck1hdGNoTW9kZSwgdGhpcy5maWx0ZXJMb2NhbGUpO1xyXG4gICAgICAgICAgICB0aGlzLm9uVGFyZ2V0RmlsdGVyLmVtaXQoe3F1ZXJ5OiB0aGlzLmZpbHRlclZhbHVlVGFyZ2V0LCB2YWx1ZTogdGhpcy52aXNpYmxlT3B0aW9uc1RhcmdldH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpc0l0ZW1WaXNpYmxlKGl0ZW06IGFueSwgbGlzdFR5cGU6IG51bWJlcik6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmIChsaXN0VHlwZSA9PSB0aGlzLlNPVVJDRV9MSVNUKVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5pc1Zpc2libGVJbkxpc3QodGhpcy52aXNpYmxlT3B0aW9uc1NvdXJjZSwgaXRlbSwgdGhpcy5maWx0ZXJWYWx1ZVNvdXJjZSk7XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5pc1Zpc2libGVJbkxpc3QodGhpcy52aXNpYmxlT3B0aW9uc1RhcmdldCwgaXRlbSwgdGhpcy5maWx0ZXJWYWx1ZVRhcmdldCk7XHJcbiAgICB9XHJcblxyXG4gICAgaXNFbXB0eShsaXN0VHlwZTogbnVtYmVyKSB7XHJcbiAgICAgICAgaWYgKGxpc3RUeXBlID09IHRoaXMuU09VUkNFX0xJU1QpXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZpbHRlclZhbHVlU291cmNlID8gKCF0aGlzLnZpc2libGVPcHRpb25zU291cmNlIHx8IHRoaXMudmlzaWJsZU9wdGlvbnNTb3VyY2UubGVuZ3RoID09PSAwKSA6ICghdGhpcy5zb3VyY2UgfHwgdGhpcy5zb3VyY2UubGVuZ3RoID09PSAwKTtcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZpbHRlclZhbHVlVGFyZ2V0ID8gKCF0aGlzLnZpc2libGVPcHRpb25zVGFyZ2V0IHx8IHRoaXMudmlzaWJsZU9wdGlvbnNUYXJnZXQubGVuZ3RoID09PSAwKSA6ICghdGhpcy50YXJnZXQgfHwgdGhpcy50YXJnZXQubGVuZ3RoID09PSAwKTtcclxuICAgIH1cclxuICAgIFxyXG5cclxuICAgIGlzVmlzaWJsZUluTGlzdChkYXRhOiBhbnlbXSwgaXRlbTogYW55LCBmaWx0ZXJWYWx1ZTogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKGZpbHRlclZhbHVlICYmIGZpbHRlclZhbHVlLnRyaW0oKS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGlmIChpdGVtID09IGRhdGFbaV0pIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG9uSXRlbVRvdWNoRW5kKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuaXRlbVRvdWNoZWQgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc29ydEJ5SW5kZXhJbkxpc3QoaXRlbXM6IGFueVtdLCBsaXN0OiBhbnkpIHtcclxuICAgICAgICByZXR1cm4gaXRlbXMuc29ydCgoaXRlbTEsIGl0ZW0yKSA9PlxyXG4gICAgICAgICAgICBPYmplY3RVdGlscy5maW5kSW5kZXhJbkxpc3QoaXRlbTEsIGxpc3QpIC0gT2JqZWN0VXRpbHMuZmluZEluZGV4SW5MaXN0KGl0ZW0yLCBsaXN0KSk7XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZVVwKGxpc3RFbGVtZW50LCBsaXN0LCBzZWxlY3RlZEl0ZW1zLCBjYWxsYmFjaywgbGlzdFR5cGUpIHtcclxuICAgICAgICBpZiAoc2VsZWN0ZWRJdGVtcyAmJiBzZWxlY3RlZEl0ZW1zLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBzZWxlY3RlZEl0ZW1zID0gdGhpcy5zb3J0QnlJbmRleEluTGlzdChzZWxlY3RlZEl0ZW1zLCBsaXN0KTtcclxuICAgICAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHNlbGVjdGVkSXRlbXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBzZWxlY3RlZEl0ZW0gPSBzZWxlY3RlZEl0ZW1zW2ldO1xyXG4gICAgICAgICAgICAgICAgbGV0IHNlbGVjdGVkSXRlbUluZGV4OiBudW1iZXIgPSBPYmplY3RVdGlscy5maW5kSW5kZXhJbkxpc3Qoc2VsZWN0ZWRJdGVtLCBsaXN0KTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoc2VsZWN0ZWRJdGVtSW5kZXggIT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBtb3ZlZEl0ZW0gPSBsaXN0W3NlbGVjdGVkSXRlbUluZGV4XTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgdGVtcCA9IGxpc3Rbc2VsZWN0ZWRJdGVtSW5kZXgtMV07XHJcbiAgICAgICAgICAgICAgICAgICAgbGlzdFtzZWxlY3RlZEl0ZW1JbmRleC0xXSA9IG1vdmVkSXRlbTtcclxuICAgICAgICAgICAgICAgICAgICBsaXN0W3NlbGVjdGVkSXRlbUluZGV4XSA9IHRlbXA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuZHJhZ2Ryb3AgJiYgKCh0aGlzLmZpbHRlclZhbHVlU291cmNlICYmIGxpc3RUeXBlID09PSB0aGlzLlNPVVJDRV9MSVNUKSB8fCAodGhpcy5maWx0ZXJWYWx1ZVRhcmdldCAmJiBsaXN0VHlwZSA9PT0gdGhpcy5UQVJHRVRfTElTVCkpKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5maWx0ZXIobGlzdCwgbGlzdFR5cGUpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5tb3ZlZFVwID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5yZW9yZGVyZWRMaXN0RWxlbWVudCA9IGxpc3RFbGVtZW50O1xyXG4gICAgICAgICAgICBjYWxsYmFjay5lbWl0KHtpdGVtczogc2VsZWN0ZWRJdGVtc30pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBtb3ZlVG9wKGxpc3RFbGVtZW50LCBsaXN0LCBzZWxlY3RlZEl0ZW1zLCBjYWxsYmFjaywgbGlzdFR5cGUpIHtcclxuICAgICAgICBpZiAoc2VsZWN0ZWRJdGVtcyAmJiBzZWxlY3RlZEl0ZW1zLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBzZWxlY3RlZEl0ZW1zID0gdGhpcy5zb3J0QnlJbmRleEluTGlzdChzZWxlY3RlZEl0ZW1zLCBsaXN0KTtcclxuICAgICAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHNlbGVjdGVkSXRlbXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBzZWxlY3RlZEl0ZW0gPSBzZWxlY3RlZEl0ZW1zW2ldO1xyXG4gICAgICAgICAgICAgICAgbGV0IHNlbGVjdGVkSXRlbUluZGV4OiBudW1iZXIgPSBPYmplY3RVdGlscy5maW5kSW5kZXhJbkxpc3Qoc2VsZWN0ZWRJdGVtLCBsaXN0KTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoc2VsZWN0ZWRJdGVtSW5kZXggIT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBtb3ZlZEl0ZW0gPSBsaXN0LnNwbGljZShzZWxlY3RlZEl0ZW1JbmRleCwxKVswXTtcclxuICAgICAgICAgICAgICAgICAgICBsaXN0LnVuc2hpZnQobW92ZWRJdGVtKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5kcmFnZHJvcCAmJiAoKHRoaXMuZmlsdGVyVmFsdWVTb3VyY2UgJiYgbGlzdFR5cGUgPT09IHRoaXMuU09VUkNFX0xJU1QpIHx8ICh0aGlzLmZpbHRlclZhbHVlVGFyZ2V0ICYmIGxpc3RUeXBlID09PSB0aGlzLlRBUkdFVF9MSVNUKSkpXHJcbiAgICAgICAgICAgICAgICB0aGlzLmZpbHRlcihsaXN0LCBsaXN0VHlwZSk7XHJcblxyXG4gICAgICAgICAgICBsaXN0RWxlbWVudC5zY3JvbGxUb3AgPSAwO1xyXG4gICAgICAgICAgICBjYWxsYmFjay5lbWl0KHtpdGVtczogc2VsZWN0ZWRJdGVtc30pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBtb3ZlRG93bihsaXN0RWxlbWVudCwgbGlzdCwgc2VsZWN0ZWRJdGVtcywgY2FsbGJhY2ssIGxpc3RUeXBlKSB7XHJcbiAgICAgICAgaWYgKHNlbGVjdGVkSXRlbXMgJiYgc2VsZWN0ZWRJdGVtcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgc2VsZWN0ZWRJdGVtcyA9IHRoaXMuc29ydEJ5SW5kZXhJbkxpc3Qoc2VsZWN0ZWRJdGVtcywgbGlzdCk7XHJcbiAgICAgICAgICAgIGZvcihsZXQgaSA9IHNlbGVjdGVkSXRlbXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcclxuICAgICAgICAgICAgICAgIGxldCBzZWxlY3RlZEl0ZW0gPSBzZWxlY3RlZEl0ZW1zW2ldO1xyXG4gICAgICAgICAgICAgICAgbGV0IHNlbGVjdGVkSXRlbUluZGV4OiBudW1iZXIgPSBPYmplY3RVdGlscy5maW5kSW5kZXhJbkxpc3Qoc2VsZWN0ZWRJdGVtLCBsaXN0KTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoc2VsZWN0ZWRJdGVtSW5kZXggIT0gKGxpc3QubGVuZ3RoIC0gMSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgbW92ZWRJdGVtID0gbGlzdFtzZWxlY3RlZEl0ZW1JbmRleF07XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHRlbXAgPSBsaXN0W3NlbGVjdGVkSXRlbUluZGV4KzFdO1xyXG4gICAgICAgICAgICAgICAgICAgIGxpc3Rbc2VsZWN0ZWRJdGVtSW5kZXgrMV0gPSBtb3ZlZEl0ZW07XHJcbiAgICAgICAgICAgICAgICAgICAgbGlzdFtzZWxlY3RlZEl0ZW1JbmRleF0gPSB0ZW1wO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRyYWdkcm9wICYmICgodGhpcy5maWx0ZXJWYWx1ZVNvdXJjZSAmJiBsaXN0VHlwZSA9PT0gdGhpcy5TT1VSQ0VfTElTVCkgfHwgKHRoaXMuZmlsdGVyVmFsdWVUYXJnZXQgJiYgbGlzdFR5cGUgPT09IHRoaXMuVEFSR0VUX0xJU1QpKSlcclxuICAgICAgICAgICAgICAgIHRoaXMuZmlsdGVyKGxpc3QsIGxpc3RUeXBlKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubW92ZWREb3duID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5yZW9yZGVyZWRMaXN0RWxlbWVudCA9IGxpc3RFbGVtZW50O1xyXG4gICAgICAgICAgICBjYWxsYmFjay5lbWl0KHtpdGVtczogc2VsZWN0ZWRJdGVtc30pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBtb3ZlQm90dG9tKGxpc3RFbGVtZW50LCBsaXN0LCBzZWxlY3RlZEl0ZW1zLCBjYWxsYmFjaywgbGlzdFR5cGUpIHtcclxuICAgICAgICBpZiAoc2VsZWN0ZWRJdGVtcyAmJiBzZWxlY3RlZEl0ZW1zLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBzZWxlY3RlZEl0ZW1zID0gdGhpcy5zb3J0QnlJbmRleEluTGlzdChzZWxlY3RlZEl0ZW1zLCBsaXN0KTtcclxuICAgICAgICAgICAgZm9yKGxldCBpID0gc2VsZWN0ZWRJdGVtcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHNlbGVjdGVkSXRlbSA9IHNlbGVjdGVkSXRlbXNbaV07XHJcbiAgICAgICAgICAgICAgICBsZXQgc2VsZWN0ZWRJdGVtSW5kZXg6IG51bWJlciA9IE9iamVjdFV0aWxzLmZpbmRJbmRleEluTGlzdChzZWxlY3RlZEl0ZW0sIGxpc3QpO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChzZWxlY3RlZEl0ZW1JbmRleCAhPSAobGlzdC5sZW5ndGggLSAxKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBtb3ZlZEl0ZW0gPSBsaXN0LnNwbGljZShzZWxlY3RlZEl0ZW1JbmRleCwxKVswXTtcclxuICAgICAgICAgICAgICAgICAgICBsaXN0LnB1c2gobW92ZWRJdGVtKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5kcmFnZHJvcCAmJiAoKHRoaXMuZmlsdGVyVmFsdWVTb3VyY2UgJiYgbGlzdFR5cGUgPT09IHRoaXMuU09VUkNFX0xJU1QpIHx8ICh0aGlzLmZpbHRlclZhbHVlVGFyZ2V0ICYmIGxpc3RUeXBlID09PSB0aGlzLlRBUkdFVF9MSVNUKSkpXHJcbiAgICAgICAgICAgICAgICB0aGlzLmZpbHRlcihsaXN0LCBsaXN0VHlwZSk7XHJcblxyXG4gICAgICAgICAgICBsaXN0RWxlbWVudC5zY3JvbGxUb3AgPSBsaXN0RWxlbWVudC5zY3JvbGxIZWlnaHQ7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrLmVtaXQoe2l0ZW1zOiBzZWxlY3RlZEl0ZW1zfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG1vdmVSaWdodCgpIHtcclxuICAgICAgICBpZiAodGhpcy5zZWxlY3RlZEl0ZW1zU291cmNlICYmIHRoaXMuc2VsZWN0ZWRJdGVtc1NvdXJjZS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHRoaXMuc2VsZWN0ZWRJdGVtc1NvdXJjZS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IHNlbGVjdGVkSXRlbSA9IHRoaXMuc2VsZWN0ZWRJdGVtc1NvdXJjZVtpXTtcclxuICAgICAgICAgICAgICAgIGlmIChPYmplY3RVdGlscy5maW5kSW5kZXhJbkxpc3Qoc2VsZWN0ZWRJdGVtLCB0aGlzLnRhcmdldCkgPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnRhcmdldC5wdXNoKHRoaXMuc291cmNlLnNwbGljZShPYmplY3RVdGlscy5maW5kSW5kZXhJbkxpc3Qoc2VsZWN0ZWRJdGVtLCB0aGlzLnNvdXJjZSksMSlbMF0pO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy52aXNpYmxlT3B0aW9uc1NvdXJjZSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy52aXNpYmxlT3B0aW9uc1NvdXJjZS5zcGxpY2UoT2JqZWN0VXRpbHMuZmluZEluZGV4SW5MaXN0KHNlbGVjdGVkSXRlbSwgdGhpcy52aXNpYmxlT3B0aW9uc1NvdXJjZSksMSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5vbk1vdmVUb1RhcmdldC5lbWl0KHtcclxuICAgICAgICAgICAgICAgIGl0ZW1zOiB0aGlzLnNlbGVjdGVkSXRlbXNTb3VyY2VcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJdGVtc1NvdXJjZSA9IFtdO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuZmlsdGVyVmFsdWVUYXJnZXQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZmlsdGVyKHRoaXMudGFyZ2V0LCB0aGlzLlRBUkdFVF9MSVNUKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBtb3ZlQWxsUmlnaHQoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc291cmNlKSB7XHJcbiAgICAgICAgICAgIGxldCBtb3ZlZEl0ZW1zID0gW107XHJcblxyXG4gICAgICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgdGhpcy5zb3VyY2UubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzSXRlbVZpc2libGUodGhpcy5zb3VyY2VbaV0sIHRoaXMuU09VUkNFX0xJU1QpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJlbW92ZWRJdGVtID0gdGhpcy5zb3VyY2Uuc3BsaWNlKGksIDEpWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGFyZ2V0LnB1c2gocmVtb3ZlZEl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgICAgIG1vdmVkSXRlbXMucHVzaChyZW1vdmVkSXRlbSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaS0tO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLm9uTW92ZUFsbFRvVGFyZ2V0LmVtaXQoe1xyXG4gICAgICAgICAgICAgICAgaXRlbXM6IG1vdmVkSXRlbXNcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkSXRlbXNTb3VyY2UgPSBbXTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmZpbHRlclZhbHVlVGFyZ2V0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZpbHRlcih0aGlzLnRhcmdldCwgdGhpcy5UQVJHRVRfTElTVCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMudmlzaWJsZU9wdGlvbnNTb3VyY2UgPSBbXTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZUxlZnQoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWRJdGVtc1RhcmdldCAmJiB0aGlzLnNlbGVjdGVkSXRlbXNUYXJnZXQubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCB0aGlzLnNlbGVjdGVkSXRlbXNUYXJnZXQubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGxldCBzZWxlY3RlZEl0ZW0gPSB0aGlzLnNlbGVjdGVkSXRlbXNUYXJnZXRbaV07XHJcbiAgICAgICAgICAgICAgICBpZiAoT2JqZWN0VXRpbHMuZmluZEluZGV4SW5MaXN0KHNlbGVjdGVkSXRlbSwgdGhpcy5zb3VyY2UpID09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zb3VyY2UucHVzaCh0aGlzLnRhcmdldC5zcGxpY2UoT2JqZWN0VXRpbHMuZmluZEluZGV4SW5MaXN0KHNlbGVjdGVkSXRlbSwgdGhpcy50YXJnZXQpLDEpWzBdKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMudmlzaWJsZU9wdGlvbnNUYXJnZXQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudmlzaWJsZU9wdGlvbnNUYXJnZXQuc3BsaWNlKE9iamVjdFV0aWxzLmZpbmRJbmRleEluTGlzdChzZWxlY3RlZEl0ZW0sIHRoaXMudmlzaWJsZU9wdGlvbnNUYXJnZXQpLDEpWzBdXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5vbk1vdmVUb1NvdXJjZS5lbWl0KHtcclxuICAgICAgICAgICAgICAgIGl0ZW1zOiB0aGlzLnNlbGVjdGVkSXRlbXNUYXJnZXRcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkSXRlbXNUYXJnZXQgPSBbXTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmZpbHRlclZhbHVlU291cmNlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZpbHRlcih0aGlzLnNvdXJjZSwgdGhpcy5TT1VSQ0VfTElTVCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbW92ZUFsbExlZnQoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMudGFyZ2V0KSB7XHJcbiAgICAgICAgICAgIGxldCBtb3ZlZEl0ZW1zID0gW107XHJcblxyXG4gICAgICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgdGhpcy50YXJnZXQubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzSXRlbVZpc2libGUodGhpcy50YXJnZXRbaV0sIHRoaXMuVEFSR0VUX0xJU1QpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJlbW92ZWRJdGVtID0gdGhpcy50YXJnZXQuc3BsaWNlKGksIDEpWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc291cmNlLnB1c2gocmVtb3ZlZEl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgICAgIG1vdmVkSXRlbXMucHVzaChyZW1vdmVkSXRlbSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaS0tO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLm9uTW92ZUFsbFRvU291cmNlLmVtaXQoe1xyXG4gICAgICAgICAgICAgICAgaXRlbXM6IG1vdmVkSXRlbXNcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkSXRlbXNUYXJnZXQgPSBbXTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmZpbHRlclZhbHVlU291cmNlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmZpbHRlcih0aGlzLnNvdXJjZSwgdGhpcy5TT1VSQ0VfTElTVCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMudmlzaWJsZU9wdGlvbnNUYXJnZXQgPSBbXTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaXNTZWxlY3RlZChpdGVtOiBhbnksIHNlbGVjdGVkSXRlbXM6IGFueVtdKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZmluZEluZGV4SW5TZWxlY3Rpb24oaXRlbSwgc2VsZWN0ZWRJdGVtcykgIT0gLTE7XHJcbiAgICB9XHJcblxyXG4gICAgZmluZEluZGV4SW5TZWxlY3Rpb24oaXRlbTogYW55LCBzZWxlY3RlZEl0ZW1zOiBhbnlbXSk6IG51bWJlciB7XHJcbiAgICAgICAgcmV0dXJuIE9iamVjdFV0aWxzLmZpbmRJbmRleEluTGlzdChpdGVtLCBzZWxlY3RlZEl0ZW1zKTtcclxuICAgIH1cclxuXHJcbiAgICBvbkRyb3AoZXZlbnQ6IENka0RyYWdEcm9wPHN0cmluZ1tdPiwgbGlzdFR5cGU6IG51bWJlcikge1xyXG4gICAgICAgIGxldCBpc1RyYW5zZmVyID0gZXZlbnQucHJldmlvdXNDb250YWluZXIgIT09IGV2ZW50LmNvbnRhaW5lcjtcclxuICAgICAgICBsZXQgZHJvcEluZGV4ZXMgPSB0aGlzLmdldERyb3BJbmRleGVzKGV2ZW50LnByZXZpb3VzSW5kZXgsIGV2ZW50LmN1cnJlbnRJbmRleCwgbGlzdFR5cGUsIGlzVHJhbnNmZXIsIGV2ZW50Lml0ZW0uZGF0YSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKGxpc3RUeXBlID09PSB0aGlzLlNPVVJDRV9MSVNUKSB7XHJcbiAgICAgICAgICAgIGlmIChpc1RyYW5zZmVyKSB7XHJcbiAgICAgICAgICAgICAgICB0cmFuc2ZlckFycmF5SXRlbShldmVudC5wcmV2aW91c0NvbnRhaW5lci5kYXRhLCBldmVudC5jb250YWluZXIuZGF0YSwgZHJvcEluZGV4ZXMucHJldmlvdXNJbmRleCwgZHJvcEluZGV4ZXMuY3VycmVudEluZGV4KTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudmlzaWJsZU9wdGlvbnNUYXJnZXQpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy52aXNpYmxlT3B0aW9uc1RhcmdldC5zcGxpY2UoZXZlbnQucHJldmlvdXNJbmRleCwgMSk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIHRoaXMub25Nb3ZlVG9Tb3VyY2UuZW1pdCh7aXRlbXM6IGV2ZW50Lml0ZW0uZGF0YX0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbW92ZUl0ZW1JbkFycmF5KGV2ZW50LmNvbnRhaW5lci5kYXRhLCBkcm9wSW5kZXhlcy5wcmV2aW91c0luZGV4LCBkcm9wSW5kZXhlcy5jdXJyZW50SW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vblNvdXJjZVJlb3JkZXIuZW1pdCh7aXRlbXM6IGV2ZW50Lml0ZW0uZGF0YX0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5maWx0ZXJWYWx1ZVNvdXJjZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5maWx0ZXIodGhpcy5zb3VyY2UsIHRoaXMuU09VUkNFX0xJU1QpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAoaXNUcmFuc2Zlcikge1xyXG4gICAgICAgICAgICAgICAgdHJhbnNmZXJBcnJheUl0ZW0oZXZlbnQucHJldmlvdXNDb250YWluZXIuZGF0YSwgZXZlbnQuY29udGFpbmVyLmRhdGEsIGRyb3BJbmRleGVzLnByZXZpb3VzSW5kZXgsIGRyb3BJbmRleGVzLmN1cnJlbnRJbmRleCk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnZpc2libGVPcHRpb25zU291cmNlKVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudmlzaWJsZU9wdGlvbnNTb3VyY2Uuc3BsaWNlKGV2ZW50LnByZXZpb3VzSW5kZXgsIDEpO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICB0aGlzLm9uTW92ZVRvVGFyZ2V0LmVtaXQoe2l0ZW1zOiBldmVudC5pdGVtLmRhdGF9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG1vdmVJdGVtSW5BcnJheShldmVudC5jb250YWluZXIuZGF0YSwgZHJvcEluZGV4ZXMucHJldmlvdXNJbmRleCwgZHJvcEluZGV4ZXMuY3VycmVudEluZGV4KTtcclxuICAgICAgICAgICAgICAgIHRoaXMub25UYXJnZXRSZW9yZGVyLmVtaXQoe2l0ZW1zOiBldmVudC5pdGVtLmRhdGF9KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuZmlsdGVyVmFsdWVUYXJnZXQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuZmlsdGVyKHRoaXMudGFyZ2V0LCB0aGlzLlRBUkdFVF9MSVNUKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBnZXREcm9wSW5kZXhlcyhmcm9tSW5kZXgsIHRvSW5kZXgsIGRyb3BwZWRMaXN0LCBpc1RyYW5zZmVyLCBkYXRhKSB7XHJcbiAgICAgICAgbGV0IHByZXZpb3VzSW5kZXgsIGN1cnJlbnRJbmRleDtcclxuXHJcbiAgICAgICAgaWYgKGRyb3BwZWRMaXN0ID09PSB0aGlzLlNPVVJDRV9MSVNUKSB7XHJcbiAgICAgICAgICAgIHByZXZpb3VzSW5kZXggPSBpc1RyYW5zZmVyID8gdGhpcy5maWx0ZXJWYWx1ZVRhcmdldCA/IE9iamVjdFV0aWxzLmZpbmRJbmRleEluTGlzdChkYXRhLCB0aGlzLnRhcmdldCkgOiBmcm9tSW5kZXggOiB0aGlzLmZpbHRlclZhbHVlU291cmNlID8gT2JqZWN0VXRpbHMuZmluZEluZGV4SW5MaXN0KGRhdGEsIHRoaXMuc291cmNlKSA6IGZyb21JbmRleDtcclxuICAgICAgICAgICAgY3VycmVudEluZGV4ID0gdGhpcy5maWx0ZXJWYWx1ZVNvdXJjZSA/IHRoaXMuZmluZEZpbHRlcmVkQ3VycmVudEluZGV4KHRoaXMudmlzaWJsZU9wdGlvbnNTb3VyY2UsIHRvSW5kZXgsIHRoaXMuc291cmNlKSA6IHRvSW5kZXg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBwcmV2aW91c0luZGV4ID0gaXNUcmFuc2ZlciA/IHRoaXMuZmlsdGVyVmFsdWVTb3VyY2UgPyBPYmplY3RVdGlscy5maW5kSW5kZXhJbkxpc3QoZGF0YSwgdGhpcy5zb3VyY2UpIDogZnJvbUluZGV4IDogdGhpcy5maWx0ZXJWYWx1ZVRhcmdldCA/IE9iamVjdFV0aWxzLmZpbmRJbmRleEluTGlzdChkYXRhLCB0aGlzLnRhcmdldCkgOiBmcm9tSW5kZXg7XHJcbiAgICAgICAgICAgIGN1cnJlbnRJbmRleCA9IHRoaXMuZmlsdGVyVmFsdWVUYXJnZXQgPyB0aGlzLmZpbmRGaWx0ZXJlZEN1cnJlbnRJbmRleCh0aGlzLnZpc2libGVPcHRpb25zVGFyZ2V0LCB0b0luZGV4LCB0aGlzLnRhcmdldCkgOiB0b0luZGV4O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHtwcmV2aW91c0luZGV4LCBjdXJyZW50SW5kZXh9O1xyXG4gICAgfVxyXG5cclxuICAgIGZpbmRGaWx0ZXJlZEN1cnJlbnRJbmRleCh2aXNpYmxlT3B0aW9ucywgaW5kZXgsIG9wdGlvbnMpIHtcclxuICAgICAgICBpZiAodmlzaWJsZU9wdGlvbnMubGVuZ3RoID09PSBpbmRleCkge1xyXG4gICAgICAgICAgICBsZXQgdG9JbmRleCA9IE9iamVjdFV0aWxzLmZpbmRJbmRleEluTGlzdCh2aXNpYmxlT3B0aW9uc1tpbmRleC0xXSwgb3B0aW9ucyk7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICByZXR1cm4gdG9JbmRleCArIDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gT2JqZWN0VXRpbHMuZmluZEluZGV4SW5MaXN0KHZpc2libGVPcHRpb25zW2luZGV4XSwgb3B0aW9ucyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJlc2V0RmlsdGVyKCkge1xyXG4gICAgICAgIHRoaXMudmlzaWJsZU9wdGlvbnNTb3VyY2UgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuZmlsdGVyVmFsdWVTb3VyY2UgPSBudWxsO1xyXG4gICAgICAgIHRoaXMudmlzaWJsZU9wdGlvbnNUYXJnZXQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuZmlsdGVyVmFsdWVUYXJnZXQgPSBudWxsO1xyXG5cclxuICAgICAgICAoPEhUTUxJbnB1dEVsZW1lbnQ+IHRoaXMuc291cmNlRmlsdGVyVmlld0NoaWxkLm5hdGl2ZUVsZW1lbnQpLnZhbHVlID0gJyc7XHJcbiAgICAgICAgKDxIVE1MSW5wdXRFbGVtZW50PiB0aGlzLnRhcmdldEZpbHRlclZpZXdDaGlsZC5uYXRpdmVFbGVtZW50KS52YWx1ZSA9ICcnO1xyXG4gICAgfVxyXG5cclxuICAgIG9uSXRlbUtleWRvd24oZXZlbnQ6IEtleWJvYXJkRXZlbnQsIGl0ZW06IGFueSwgc2VsZWN0ZWRJdGVtczogYW55W10sIGNhbGxiYWNrOiBFdmVudEVtaXR0ZXI8YW55Pikge1xyXG4gICAgICAgIGxldCBsaXN0SXRlbSA9IDxIVE1MTElFbGVtZW50PiBldmVudC5jdXJyZW50VGFyZ2V0O1xyXG5cclxuICAgICAgICBzd2l0Y2goZXZlbnQud2hpY2gpIHtcclxuICAgICAgICAgICAgLy9kb3duXHJcbiAgICAgICAgICAgIGNhc2UgNDA6XHJcbiAgICAgICAgICAgICAgICB2YXIgbmV4dEl0ZW0gPSB0aGlzLmZpbmROZXh0SXRlbShsaXN0SXRlbSk7XHJcbiAgICAgICAgICAgICAgICBpZiAobmV4dEl0ZW0pIHtcclxuICAgICAgICAgICAgICAgICAgICBuZXh0SXRlbS5mb2N1cygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgLy91cFxyXG4gICAgICAgICAgICBjYXNlIDM4OlxyXG4gICAgICAgICAgICAgICAgdmFyIHByZXZJdGVtID0gdGhpcy5maW5kUHJldkl0ZW0obGlzdEl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgaWYgKHByZXZJdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJldkl0ZW0uZm9jdXMoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgIC8vZW50ZXJcclxuICAgICAgICAgICAgY2FzZSAxMzpcclxuICAgICAgICAgICAgICAgIHRoaXMub25JdGVtQ2xpY2soZXZlbnQsIGl0ZW0sIHNlbGVjdGVkSXRlbXMsIGNhbGxiYWNrKTtcclxuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmaW5kTmV4dEl0ZW0oaXRlbSkge1xyXG4gICAgICAgIGxldCBuZXh0SXRlbSA9IGl0ZW0ubmV4dEVsZW1lbnRTaWJsaW5nO1xyXG5cclxuICAgICAgICBpZiAobmV4dEl0ZW0pXHJcbiAgICAgICAgICAgIHJldHVybiAhRG9tSGFuZGxlci5oYXNDbGFzcyhuZXh0SXRlbSwgJ3AtcGlja2xpc3QtaXRlbScpIHx8IERvbUhhbmRsZXIuaXNIaWRkZW4obmV4dEl0ZW0pID8gdGhpcy5maW5kTmV4dEl0ZW0obmV4dEl0ZW0pIDogbmV4dEl0ZW07XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBmaW5kUHJldkl0ZW0oaXRlbSkge1xyXG4gICAgICAgIGxldCBwcmV2SXRlbSA9IGl0ZW0ucHJldmlvdXNFbGVtZW50U2libGluZztcclxuXHJcbiAgICAgICAgaWYgKHByZXZJdGVtKVxyXG4gICAgICAgICAgICByZXR1cm4gIURvbUhhbmRsZXIuaGFzQ2xhc3MocHJldkl0ZW0sICdwLXBpY2tsaXN0LWl0ZW0nKSB8fCBEb21IYW5kbGVyLmlzSGlkZGVuKHByZXZJdGVtKSA/IHRoaXMuZmluZFByZXZJdGVtKHByZXZJdGVtKSA6IHByZXZJdGVtO1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgY3JlYXRlU3R5bGUoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLnN0eWxlRWxlbWVudCkge1xyXG4gICAgICAgICAgICB0aGlzLmVsLm5hdGl2ZUVsZW1lbnQuY2hpbGRyZW5bMF0uc2V0QXR0cmlidXRlKHRoaXMuaWQsICcnKTtcclxuICAgICAgICAgICAgdGhpcy5zdHlsZUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpO1xyXG4gICAgICAgICAgICB0aGlzLnN0eWxlRWxlbWVudC50eXBlID0gJ3RleHQvY3NzJztcclxuICAgICAgICAgICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZCh0aGlzLnN0eWxlRWxlbWVudCk7XHJcblxyXG4gICAgICAgICAgICBsZXQgaW5uZXJIVE1MID0gYFxyXG4gICAgICAgICAgICBAbWVkaWEgc2NyZWVuIGFuZCAobWF4LXdpZHRoOiAke3RoaXMuYnJlYWtwb2ludH0pIHtcclxuICAgICAgICAgICAgICAgIC5wLXBpY2tsaXN0WyR7dGhpcy5pZH1dIHtcclxuICAgICAgICAgICAgICAgICAgICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIC5wLXBpY2tsaXN0WyR7dGhpcy5pZH1dIC5wLXBpY2tsaXN0LWJ1dHRvbnMge1xyXG4gICAgICAgICAgICAgICAgICAgIHBhZGRpbmc6IHZhcigtLWNvbnRlbnQtcGFkZGluZyk7XHJcbiAgICAgICAgICAgICAgICAgICAgZmxleC1kaXJlY3Rpb246IHJvdztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAucC1waWNrbGlzdFske3RoaXMuaWR9XSAucC1waWNrbGlzdC1idXR0b25zIC5wLWJ1dHRvbiB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luLXJpZ2h0OiB2YXIoLS1pbmxpbmUtc3BhY2luZyk7XHJcbiAgICAgICAgICAgICAgICAgICAgbWFyZ2luLWJvdHRvbTogMDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAucC1waWNrbGlzdFske3RoaXMuaWR9XSAucC1waWNrbGlzdC1idXR0b25zIC5wLWJ1dHRvbjpsYXN0LWNoaWxkIHtcclxuICAgICAgICAgICAgICAgICAgICBtYXJnaW4tcmlnaHQ6IDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgLnAtcGlja2xpc3RbJHt0aGlzLmlkfV0gLnBpLWFuZ2xlLXJpZ2h0OmJlZm9yZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGVudDogXCJcXFxcZTkzMFwiXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgLnAtcGlja2xpc3RbJHt0aGlzLmlkfV0gLnBpLWFuZ2xlLWRvdWJsZS1yaWdodDpiZWZvcmUge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ6IFwiXFxcXGU5MmNcIlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgIC5wLXBpY2tsaXN0WyR7dGhpcy5pZH1dIC5waS1hbmdsZS1sZWZ0OmJlZm9yZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGVudDogXCJcXFxcZTkzM1wiXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgLnAtcGlja2xpc3RbJHt0aGlzLmlkfV0gLnBpLWFuZ2xlLWRvdWJsZS1sZWZ0OmJlZm9yZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGVudDogXCJcXFxcZTkyZlwiXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYDtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHRoaXMuc3R5bGVFbGVtZW50LmlubmVySFRNTCA9IGlubmVySFRNTDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZGVzdHJveVN0eWxlKCkge1xyXG4gICAgICAgIGlmICh0aGlzLnN0eWxlRWxlbWVudCkge1xyXG4gICAgICAgICAgICBkb2N1bWVudC5oZWFkLnJlbW92ZUNoaWxkKHRoaXMuc3R5bGVFbGVtZW50KTtcclxuICAgICAgICAgICAgdGhpcy5zdHlsZUVsZW1lbnQgPSBudWxsO2BgXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG5nT25EZXN0cm95KCkge1xyXG4gICAgICAgIHRoaXMuZGVzdHJveVN0eWxlKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbkBOZ01vZHVsZSh7XHJcbiAgICBpbXBvcnRzOiBbQ29tbW9uTW9kdWxlLEJ1dHRvbk1vZHVsZSxTaGFyZWRNb2R1bGUsUmlwcGxlTW9kdWxlLERyYWdEcm9wTW9kdWxlXSxcclxuICAgIGV4cG9ydHM6IFtQaWNrTGlzdCxTaGFyZWRNb2R1bGUsRHJhZ0Ryb3BNb2R1bGVdLFxyXG4gICAgZGVjbGFyYXRpb25zOiBbUGlja0xpc3RdXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBQaWNrTGlzdE1vZHVsZSB7IH1cclxuIl19