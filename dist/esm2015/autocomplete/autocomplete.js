import { NgModule, Component, ViewChild, ElementRef, Input, Output, EventEmitter, ContentChildren, Renderer2, forwardRef, ChangeDetectorRef, IterableDiffers, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, style, transition, animate } from '@angular/animations';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { SharedModule, PrimeTemplate, TranslationKeys, PrimeNGConfig } from 'primeng/api';
import { DomHandler, ConnectedOverlayScrollHandler } from 'primeng/dom';
import { ObjectUtils, UniqueComponentId } from 'primeng/utils';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
export const AUTOCOMPLETE_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => AutoComplete),
    multi: true
};
export class AutoComplete {
    constructor(el, renderer, cd, differs, config) {
        this.el = el;
        this.renderer = renderer;
        this.cd = cd;
        this.differs = differs;
        this.config = config;
        this.minLength = 1;
        this.delay = 300;
        this.type = 'text';
        this.autoZIndex = true;
        this.baseZIndex = 0;
        this.dropdownIcon = "pi pi-chevron-down";
        this.unique = true;
        this.completeOnFocus = false;
        this.completeMethod = new EventEmitter();
        this.onSelect = new EventEmitter();
        this.onUnselect = new EventEmitter();
        this.onFocus = new EventEmitter();
        this.onBlur = new EventEmitter();
        this.onDropdownClick = new EventEmitter();
        this.onClear = new EventEmitter();
        this.onKeyUp = new EventEmitter();
        this.onShow = new EventEmitter();
        this.onHide = new EventEmitter();
        this.scrollHeight = '200px';
        this.dropdownMode = 'blank';
        this.showTransitionOptions = '.12s cubic-bezier(0, 0, 0.2, 1)';
        this.hideTransitionOptions = '.1s linear';
        this.autocomplete = 'off';
        this.onModelChange = () => { };
        this.onModelTouched = () => { };
        this.overlayVisible = false;
        this.focus = false;
        this.inputFieldValue = null;
        this.differ = differs.find([]).create(null);
        this.listId = UniqueComponentId() + '_list';
    }
    get suggestions() {
        return this._suggestions;
    }
    set suggestions(val) {
        this._suggestions = val;
        this.handleSuggestionsChange();
    }
    ngAfterViewChecked() {
        //Use timeouts as since Angular 4.2, AfterViewChecked is broken and not called after panel is updated
        if (this.suggestionsUpdated && this.overlay && this.overlay.offsetParent) {
            setTimeout(() => {
                if (this.overlay) {
                    this.alignOverlay();
                }
            }, 1);
            this.suggestionsUpdated = false;
        }
        if (this.highlightOptionChanged) {
            setTimeout(() => {
                if (this.overlay && this.itemsWrapper) {
                    let listItem = DomHandler.findSingle(this.overlay, 'li.p-highlight');
                    if (listItem) {
                        DomHandler.scrollInView(this.itemsWrapper, listItem);
                    }
                    if (this.virtualScroll && this.viewPort) {
                        let range = this.viewPort.getRenderedRange();
                        this.updateVirtualScrollSelectedIndex();
                        if (range.start > this.virtualScrollSelectedIndex || range.end < this.virtualScrollSelectedIndex) {
                            this.viewPort.scrollToIndex(this.virtualScrollSelectedIndex);
                        }
                    }
                }
            }, 1);
            this.highlightOptionChanged = false;
        }
    }
    handleSuggestionsChange() {
        if (this._suggestions != null && this.loading) {
            this.highlightOption = null;
            if (this._suggestions.length) {
                this.noResults = false;
                this.show();
                this.suggestionsUpdated = true;
                if (this.autoHighlight) {
                    this.highlightOption = this._suggestions[0];
                }
            }
            else {
                this.noResults = true;
                if (this.showEmptyMessage) {
                    this.show();
                    this.suggestionsUpdated = true;
                }
                else {
                    this.hide();
                }
            }
            this.loading = false;
        }
    }
    ngAfterContentInit() {
        this.templates.forEach((item) => {
            switch (item.getType()) {
                case 'item':
                    this.itemTemplate = item.template;
                    break;
                case 'group':
                    this.groupTemplate = item.template;
                    break;
                case 'selectedItem':
                    this.selectedItemTemplate = item.template;
                    break;
                case 'header':
                    this.headerTemplate = item.template;
                    break;
                case 'empty':
                    this.emptyTemplate = item.template;
                    break;
                case 'footer':
                    this.footerTemplate = item.template;
                    break;
                default:
                    this.itemTemplate = item.template;
                    break;
            }
        });
    }
    updateVirtualScrollSelectedIndex() {
        if (this.highlightOption && this.suggestions && this.suggestions.length) {
            this.virtualScrollSelectedIndex = this.findOptionIndex(this.highlightOption, this.suggestions);
        }
    }
    writeValue(value) {
        this.value = value;
        this.filled = this.value && this.value != '';
        this.updateInputField();
        this.cd.markForCheck();
    }
    getOptionGroupChildren(optionGroup) {
        return this.optionGroupChildren ? ObjectUtils.resolveFieldData(optionGroup, this.optionGroupChildren) : optionGroup.items;
    }
    getOptionGroupLabel(optionGroup) {
        return this.optionGroupLabel ? ObjectUtils.resolveFieldData(optionGroup, this.optionGroupLabel) : (optionGroup.label != undefined ? optionGroup.label : optionGroup);
    }
    registerOnChange(fn) {
        this.onModelChange = fn;
    }
    registerOnTouched(fn) {
        this.onModelTouched = fn;
    }
    setDisabledState(val) {
        this.disabled = val;
        this.cd.markForCheck();
    }
    onInput(event) {
        // When an input element with a placeholder is clicked, the onInput event is invoked in IE.
        if (!this.inputKeyDown && DomHandler.isIE()) {
            return;
        }
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        let value = event.target.value;
        if (!this.multiple && !this.forceSelection) {
            this.onModelChange(value);
        }
        if (value.length === 0 && !this.multiple) {
            this.hide();
            this.onClear.emit(event);
            this.onModelChange(value);
        }
        if (value.length >= this.minLength) {
            this.timeout = setTimeout(() => {
                this.search(event, value);
            }, this.delay);
        }
        else {
            this.hide();
        }
        this.updateFilledState();
        this.inputKeyDown = false;
    }
    onInputClick(event) {
        if (this.documentClickListener) {
            this.inputClick = true;
        }
    }
    search(event, query) {
        //allow empty string but not undefined or null
        if (query === undefined || query === null) {
            return;
        }
        this.loading = true;
        this.completeMethod.emit({
            originalEvent: event,
            query: query
        });
    }
    selectItem(option, focus = true) {
        if (this.forceSelectionUpdateModelTimeout) {
            clearTimeout(this.forceSelectionUpdateModelTimeout);
            this.forceSelectionUpdateModelTimeout = null;
        }
        if (this.multiple) {
            this.multiInputEL.nativeElement.value = '';
            this.value = this.value || [];
            if (!this.isSelected(option) || !this.unique) {
                this.value = [...this.value, option];
                this.onModelChange(this.value);
            }
        }
        else {
            this.inputEL.nativeElement.value = this.resolveFieldData(option);
            this.value = option;
            this.onModelChange(this.value);
        }
        this.onSelect.emit(option);
        this.updateFilledState();
        if (focus) {
            this.itemClicked = true;
            this.focusInput();
        }
    }
    show() {
        if (this.multiInputEL || this.inputEL) {
            let hasFocus = this.multiple ?
                this.multiInputEL.nativeElement.ownerDocument.activeElement == this.multiInputEL.nativeElement :
                this.inputEL.nativeElement.ownerDocument.activeElement == this.inputEL.nativeElement;
            if (!this.overlayVisible && hasFocus) {
                this.overlayVisible = true;
            }
        }
    }
    onOverlayAnimationStart(event) {
        switch (event.toState) {
            case 'visible':
                this.overlay = event.element;
                this.itemsWrapper = this.virtualScroll ? DomHandler.findSingle(this.overlay, '.cdk-virtual-scroll-viewport') : this.overlay;
                this.appendOverlay();
                if (this.autoZIndex) {
                    this.overlay.style.zIndex = String(this.baseZIndex + (++DomHandler.zindex));
                }
                this.alignOverlay();
                this.bindDocumentClickListener();
                this.bindDocumentResizeListener();
                this.bindScrollListener();
                this.onShow.emit(event);
                break;
            case 'void':
                this.onOverlayHide();
                break;
        }
    }
    appendOverlay() {
        if (this.appendTo) {
            if (this.appendTo === 'body')
                document.body.appendChild(this.overlay);
            else
                DomHandler.appendChild(this.overlay, this.appendTo);
            if (!this.overlay.style.minWidth) {
                this.overlay.style.minWidth = DomHandler.getWidth(this.el.nativeElement.children[0]) + 'px';
            }
        }
    }
    resolveFieldData(value) {
        let data = this.field ? ObjectUtils.resolveFieldData(value, this.field) : value;
        return data !== (null || undefined) ? data : '';
    }
    restoreOverlayAppend() {
        if (this.overlay && this.appendTo) {
            this.el.nativeElement.appendChild(this.overlay);
        }
    }
    alignOverlay() {
        if (this.appendTo)
            DomHandler.absolutePosition(this.overlay, (this.multiple ? this.multiContainerEL.nativeElement : this.inputEL.nativeElement));
        else
            DomHandler.relativePosition(this.overlay, (this.multiple ? this.multiContainerEL.nativeElement : this.inputEL.nativeElement));
    }
    hide() {
        this.overlayVisible = false;
        this.cd.markForCheck();
    }
    handleDropdownClick(event) {
        if (!this.overlayVisible) {
            this.focusInput();
            let queryValue = this.multiple ? this.multiInputEL.nativeElement.value : this.inputEL.nativeElement.value;
            if (this.dropdownMode === 'blank')
                this.search(event, '');
            else if (this.dropdownMode === 'current')
                this.search(event, queryValue);
            this.onDropdownClick.emit({
                originalEvent: event,
                query: queryValue
            });
        }
        else {
            this.hide();
        }
    }
    focusInput() {
        if (this.multiple)
            this.multiInputEL.nativeElement.focus();
        else
            this.inputEL.nativeElement.focus();
    }
    get emptyMessageLabel() {
        return this.emptyMessage || this.config.getTranslation(TranslationKeys.EMPTY_MESSAGE);
    }
    removeItem(item) {
        let itemIndex = DomHandler.index(item);
        let removedValue = this.value[itemIndex];
        this.value = this.value.filter((val, i) => i != itemIndex);
        this.onModelChange(this.value);
        this.updateFilledState();
        this.onUnselect.emit(removedValue);
    }
    onKeydown(event) {
        if (this.overlayVisible) {
            switch (event.which) {
                //down
                case 40:
                    if (this.group) {
                        let highlightItemIndex = this.findOptionGroupIndex(this.highlightOption, this.suggestions);
                        if (highlightItemIndex !== -1) {
                            let nextItemIndex = highlightItemIndex.itemIndex + 1;
                            if (nextItemIndex < (this.getOptionGroupChildren(this.suggestions[highlightItemIndex.groupIndex]).length)) {
                                this.highlightOption = this.getOptionGroupChildren(this.suggestions[highlightItemIndex.groupIndex])[nextItemIndex];
                                this.highlightOptionChanged = true;
                            }
                            else if (this.suggestions[highlightItemIndex.groupIndex + 1]) {
                                this.highlightOption = this.getOptionGroupChildren(this.suggestions[highlightItemIndex.groupIndex + 1])[0];
                                this.highlightOptionChanged = true;
                            }
                        }
                        else {
                            this.highlightOption = this.getOptionGroupChildren(this.suggestions[0])[0];
                        }
                    }
                    else {
                        let highlightItemIndex = this.findOptionIndex(this.highlightOption, this.suggestions);
                        if (highlightItemIndex != -1) {
                            var nextItemIndex = highlightItemIndex + 1;
                            if (nextItemIndex != (this.suggestions.length)) {
                                this.highlightOption = this.suggestions[nextItemIndex];
                                this.highlightOptionChanged = true;
                            }
                        }
                        else {
                            this.highlightOption = this.suggestions[0];
                        }
                    }
                    event.preventDefault();
                    break;
                //up
                case 38:
                    if (this.group) {
                        let highlightItemIndex = this.findOptionGroupIndex(this.highlightOption, this.suggestions);
                        if (highlightItemIndex !== -1) {
                            let prevItemIndex = highlightItemIndex.itemIndex - 1;
                            if (prevItemIndex >= 0) {
                                this.highlightOption = this.getOptionGroupChildren(this.suggestions[highlightItemIndex.groupIndex])[prevItemIndex];
                                this.highlightOptionChanged = true;
                            }
                            else if (prevItemIndex < 0) {
                                let prevGroup = this.suggestions[highlightItemIndex.groupIndex - 1];
                                if (prevGroup) {
                                    this.highlightOption = this.getOptionGroupChildren(prevGroup)[this.getOptionGroupChildren(prevGroup).length - 1];
                                    this.highlightOptionChanged = true;
                                }
                            }
                        }
                    }
                    else {
                        let highlightItemIndex = this.findOptionIndex(this.highlightOption, this.suggestions);
                        if (highlightItemIndex > 0) {
                            let prevItemIndex = highlightItemIndex - 1;
                            this.highlightOption = this.suggestions[prevItemIndex];
                            this.highlightOptionChanged = true;
                        }
                    }
                    event.preventDefault();
                    break;
                //enter
                case 13:
                    if (this.highlightOption) {
                        this.selectItem(this.highlightOption);
                        this.hide();
                    }
                    event.preventDefault();
                    break;
                //escape
                case 27:
                    this.hide();
                    event.preventDefault();
                    break;
                //tab
                case 9:
                    if (this.highlightOption) {
                        this.selectItem(this.highlightOption);
                    }
                    this.hide();
                    break;
            }
        }
        else {
            if (event.which === 40 && this.suggestions) {
                this.search(event, event.target.value);
            }
        }
        if (this.multiple) {
            switch (event.which) {
                //backspace
                case 8:
                    if (this.value && this.value.length && !this.multiInputEL.nativeElement.value) {
                        this.value = [...this.value];
                        const removedValue = this.value.pop();
                        this.onModelChange(this.value);
                        this.updateFilledState();
                        this.onUnselect.emit(removedValue);
                    }
                    break;
            }
        }
        this.inputKeyDown = true;
    }
    onKeyup(event) {
        this.onKeyUp.emit(event);
    }
    onInputFocus(event) {
        if (!this.itemClicked && this.completeOnFocus) {
            let queryValue = this.multiple ? this.multiInputEL.nativeElement.value : this.inputEL.nativeElement.value;
            this.search(event, queryValue);
        }
        this.focus = true;
        this.onFocus.emit(event);
        this.itemClicked = false;
    }
    onInputBlur(event) {
        this.focus = false;
        this.onModelTouched();
        this.onBlur.emit(event);
    }
    onInputChange(event) {
        if (this.forceSelection) {
            let valid = false;
            let inputValue = event.target.value.trim();
            if (this.suggestions) {
                for (let suggestion of this.suggestions) {
                    let itemValue = this.field ? ObjectUtils.resolveFieldData(suggestion, this.field) : suggestion;
                    if (itemValue && inputValue === itemValue.trim()) {
                        valid = true;
                        this.forceSelectionUpdateModelTimeout = setTimeout(() => {
                            this.selectItem(suggestion, false);
                        }, 250);
                        break;
                    }
                }
            }
            if (!valid) {
                if (this.multiple) {
                    this.multiInputEL.nativeElement.value = '';
                }
                else {
                    this.value = null;
                    this.inputEL.nativeElement.value = '';
                }
                this.onClear.emit(event);
                this.onModelChange(this.value);
                this.updateFilledState();
            }
        }
    }
    onInputPaste(event) {
        this.onKeydown(event);
    }
    isSelected(val) {
        let selected = false;
        if (this.value && this.value.length) {
            for (let i = 0; i < this.value.length; i++) {
                if (ObjectUtils.equals(this.value[i], val, this.dataKey)) {
                    selected = true;
                    break;
                }
            }
        }
        return selected;
    }
    findOptionIndex(option, suggestions) {
        let index = -1;
        if (suggestions) {
            for (let i = 0; i < suggestions.length; i++) {
                if (ObjectUtils.equals(option, suggestions[i])) {
                    index = i;
                    break;
                }
            }
        }
        return index;
    }
    findOptionGroupIndex(val, opts) {
        let groupIndex, itemIndex;
        if (opts) {
            for (let i = 0; i < opts.length; i++) {
                groupIndex = i;
                itemIndex = this.findOptionIndex(val, this.getOptionGroupChildren(opts[i]));
                if (itemIndex !== -1) {
                    break;
                }
            }
        }
        if (itemIndex !== -1) {
            return { groupIndex: groupIndex, itemIndex: itemIndex };
        }
        else {
            return -1;
        }
    }
    updateFilledState() {
        if (this.multiple)
            this.filled = (this.value && this.value.length) || (this.multiInputEL && this.multiInputEL.nativeElement && this.multiInputEL.nativeElement.value != '');
        else
            this.filled = (this.inputFieldValue && this.inputFieldValue != '') || (this.inputEL && this.inputEL.nativeElement && this.inputEL.nativeElement.value != '');
        ;
    }
    updateInputField() {
        let formattedValue = this.resolveFieldData(this.value);
        this.inputFieldValue = formattedValue;
        if (this.inputEL && this.inputEL.nativeElement) {
            this.inputEL.nativeElement.value = formattedValue;
        }
        this.updateFilledState();
    }
    bindDocumentClickListener() {
        if (!this.documentClickListener) {
            const documentTarget = this.el ? this.el.nativeElement.ownerDocument : 'document';
            this.documentClickListener = this.renderer.listen(documentTarget, 'click', (event) => {
                if (event.which === 3) {
                    return;
                }
                if (!this.inputClick && !this.isDropdownClick(event)) {
                    this.hide();
                }
                this.inputClick = false;
                this.cd.markForCheck();
            });
        }
    }
    isDropdownClick(event) {
        if (this.dropdown) {
            let target = event.target;
            return (target === this.dropdownButton.nativeElement || target.parentNode === this.dropdownButton.nativeElement);
        }
        else {
            return false;
        }
    }
    unbindDocumentClickListener() {
        if (this.documentClickListener) {
            this.documentClickListener();
            this.documentClickListener = null;
        }
    }
    bindDocumentResizeListener() {
        this.documentResizeListener = this.onWindowResize.bind(this);
        window.addEventListener('resize', this.documentResizeListener);
    }
    unbindDocumentResizeListener() {
        if (this.documentResizeListener) {
            window.removeEventListener('resize', this.documentResizeListener);
            this.documentResizeListener = null;
        }
    }
    onWindowResize() {
        this.hide();
    }
    bindScrollListener() {
        if (!this.scrollHandler) {
            this.scrollHandler = new ConnectedOverlayScrollHandler(this.containerEL.nativeElement, () => {
                if (this.overlayVisible) {
                    this.hide();
                }
            });
        }
        this.scrollHandler.bindScrollListener();
    }
    unbindScrollListener() {
        if (this.scrollHandler) {
            this.scrollHandler.unbindScrollListener();
        }
    }
    onOverlayHide() {
        this.unbindDocumentClickListener();
        this.unbindDocumentResizeListener();
        this.unbindScrollListener();
        this.overlay = null;
        this.onHide.emit();
    }
    ngOnDestroy() {
        if (this.forceSelectionUpdateModelTimeout) {
            clearTimeout(this.forceSelectionUpdateModelTimeout);
            this.forceSelectionUpdateModelTimeout = null;
        }
        if (this.scrollHandler) {
            this.scrollHandler.destroy();
            this.scrollHandler = null;
        }
        this.restoreOverlayAppend();
        this.onOverlayHide();
    }
}
AutoComplete.decorators = [
    { type: Component, args: [{
                selector: 'p-autoComplete',
                template: `
        <span #container [ngClass]="{'p-autocomplete p-component':true,'p-autocomplete-dd':dropdown,'p-autocomplete-multiple':multiple}" [ngStyle]="style" [class]="styleClass">
            <input *ngIf="!multiple" #in [attr.type]="type" [attr.id]="inputId" [ngStyle]="inputStyle" [class]="inputStyleClass" [autocomplete]="autocomplete" [attr.required]="required" [attr.name]="name"
            class="p-autocomplete-input p-inputtext p-component" [ngClass]="{'p-autocomplete-dd-input':dropdown,'p-disabled': disabled}" [value]="inputFieldValue" aria-autocomplete="list" [attr.aria-controls]="listId" role="searchbox" [attr.aria-expanded]="overlayVisible" aria-haspopup="true" [attr.aria-activedescendant]="'p-highlighted-option'"
            (click)="onInputClick($event)" (input)="onInput($event)" (keydown)="onKeydown($event)" (keyup)="onKeyup($event)" [attr.autofocus]="autofocus" (focus)="onInputFocus($event)" (blur)="onInputBlur($event)" (change)="onInputChange($event)" (paste)="onInputPaste($event)"
            [attr.placeholder]="placeholder" [attr.size]="size" [attr.maxlength]="maxlength" [attr.tabindex]="tabindex" [readonly]="readonly" [disabled]="disabled" [attr.aria-label]="ariaLabel" [attr.aria-labelledby]="ariaLabelledBy" [attr.aria-required]="required"
            ><ul *ngIf="multiple" #multiContainer class="p-autocomplete-multiple-container p-component p-inputtext" [ngClass]="{'p-disabled':disabled,'p-focus':focus}" (click)="multiIn.focus()">
                <li #token *ngFor="let val of value" class="p-autocomplete-token">
                    <ng-container *ngTemplateOutlet="selectedItemTemplate; context: {$implicit: val}"></ng-container>
                    <span *ngIf="!selectedItemTemplate" class="p-autocomplete-token-label">{{resolveFieldData(val)}}</span>
                    <span  class="p-autocomplete-token-icon pi pi-times-circle" (click)="removeItem(token)" *ngIf="!disabled && !readonly"></span>
                </li>
                <li class="p-autocomplete-input-token">
                    <input #multiIn [attr.type]="type" [attr.id]="inputId" [disabled]="disabled" [attr.placeholder]="(value&&value.length ? null : placeholder)" [attr.tabindex]="tabindex" [attr.maxlength]="maxlength" (input)="onInput($event)"  (click)="onInputClick($event)"
                            (keydown)="onKeydown($event)" [readonly]="readonly" (keyup)="onKeyup($event)" [attr.autofocus]="autofocus" (focus)="onInputFocus($event)" (blur)="onInputBlur($event)" (change)="onInputChange($event)" (paste)="onInputPaste($event)" [autocomplete]="autocomplete"
                            [ngStyle]="inputStyle" [class]="inputStyleClass" [attr.aria-label]="ariaLabel" [attr.aria-labelledby]="ariaLabelledBy" [attr.aria-required]="required"
                            aria-autocomplete="list" [attr.aria-controls]="listId" role="searchbox" [attr.aria-expanded]="overlayVisible" aria-haspopup="true" [attr.aria-activedescendant]="'p-highlighted-option'">
                </li>
            </ul>
            <i *ngIf="loading" class="p-autocomplete-loader pi pi-spinner pi-spin"></i><button #ddBtn type="button" pButton [icon]="dropdownIcon" class="p-autocomplete-dropdown" [disabled]="disabled" pRipple
                (click)="handleDropdownClick($event)" *ngIf="dropdown" [attr.tabindex]="tabindex"></button>
            <div #panel *ngIf="overlayVisible" [ngClass]="['p-autocomplete-panel p-component']" [style.max-height]="virtualScroll ? 'auto' : scrollHeight" [ngStyle]="panelStyle" [class]="panelStyleClass"
                [@overlayAnimation]="{value: 'visible', params: {showTransitionParams: showTransitionOptions, hideTransitionParams: hideTransitionOptions}}" (@overlayAnimation.start)="onOverlayAnimationStart($event)">
                <ng-container *ngTemplateOutlet="headerTemplate"></ng-container>
                <ul role="listbox" [attr.id]="listId" class="p-autocomplete-items" [ngClass]="{'p-autocomplete-virtualscroll': virtualScroll}">
                    <ng-container *ngIf="group">
                        <ng-template ngFor let-optgroup [ngForOf]="suggestions">
                            <li class="p-autocomplete-item-group">
                                <span *ngIf="!groupTemplate">{{getOptionGroupLabel(optgroup)||'empty'}}</span>
                                <ng-container *ngTemplateOutlet="groupTemplate; context: {$implicit: optgroup}"></ng-container>
                            </li>
                            <ng-container *ngTemplateOutlet="itemslist; context: {$implicit: getOptionGroupChildren(optgroup)}"></ng-container>
                        </ng-template>
                    </ng-container>
                    <ng-container *ngIf="!group">
                            <ng-container *ngTemplateOutlet="itemslist; context: {$implicit: suggestions}"></ng-container>
                    </ng-container>
                    <ng-template #itemslist let-suggestionsToDisplay>
                        <ng-container *ngIf="!virtualScroll; else virtualScrollList">
                            <li role="option" *ngFor="let option of suggestionsToDisplay; let idx = index" class="p-autocomplete-item" pRipple [ngClass]="{'p-highlight': (option === highlightOption)}" [id]="highlightOption == option ? 'p-highlighted-option':''" (click)="selectItem(option)">
                                <span *ngIf="!itemTemplate">{{resolveFieldData(option)}}</span>
                                <ng-container *ngTemplateOutlet="itemTemplate; context: {$implicit: option, index: idx}"></ng-container>
                            </li>
                        </ng-container>
                        <ng-template #virtualScrollList>
                            <cdk-virtual-scroll-viewport [ngStyle]="{'height': scrollHeight}" [itemSize]="itemSize" *ngIf="virtualScroll && !noResults">
                                <ng-container *cdkVirtualFor="let option of suggestionsToDisplay; let i = index; let c = count; let f = first; let l = last; let e = even; let o = odd">
                                    <li role="option" class="p-autocomplete-item" pRipple [ngClass]="{'p-highlight': (option === highlightOption)}" [ngStyle]="{'height': itemSize + 'px'}" [id]="highlightOption == option ? 'p-highlighted-option':''" (click)="selectItem(option)">
                                        <span *ngIf="!itemTemplate">{{resolveFieldData(option)}}</span>
                                        <ng-container *ngTemplateOutlet="itemTemplate; context: {$implicit: option, index: i}"></ng-container>
                                    </li>
                                </ng-container>
                            </cdk-virtual-scroll-viewport>
                        </ng-template>
                        <li *ngIf="noResults && showEmptyMessage" class="p-autocomplete-empty-message">
                            <ng-container *ngIf="!emptyTemplate; else empty">
                                {{emptyMessageLabel}}
                            </ng-container>
                            <ng-container #empty *ngTemplateOutlet="emptyTemplate"></ng-container>
                        </li>
                    </ng-template>
                </ul>
                <ng-container *ngTemplateOutlet="footerTemplate"></ng-container>
            </div>
        </span>
    `,
                animations: [
                    trigger('overlayAnimation', [
                        transition(':enter', [
                            style({ opacity: 0, transform: 'scaleY(0.8)' }),
                            animate('{{showTransitionParams}}')
                        ]),
                        transition(':leave', [
                            animate('{{hideTransitionParams}}', style({ opacity: 0 }))
                        ])
                    ])
                ],
                host: {
                    '[class.p-inputwrapper-filled]': 'filled',
                    '[class.p-inputwrapper-focus]': '(focus && !disabled) || overlayVisible'
                },
                providers: [AUTOCOMPLETE_VALUE_ACCESSOR],
                changeDetection: ChangeDetectionStrategy.OnPush,
                encapsulation: ViewEncapsulation.None,
                styles: [".p-autocomplete{display:inline-flex;position:relative}.p-autocomplete-loader{margin-top:-.5rem;position:absolute;top:50%}.p-autocomplete-dd .p-autocomplete-input{flex:1 1 auto;width:1%}.p-autocomplete-dd .p-autocomplete-input,.p-autocomplete-dd .p-autocomplete-multiple-container{border-bottom-right-radius:0;border-top-right-radius:0}.p-autocomplete-dd .p-autocomplete-dropdown{border-bottom-left-radius:0;border-top-left-radius:0}.p-autocomplete .p-autocomplete-panel{min-width:100%}.p-autocomplete-panel{overflow:auto;position:absolute}.p-autocomplete-items{list-style-type:none;margin:0;padding:0}.p-autocomplete-item{cursor:pointer;overflow:hidden;position:relative;white-space:nowrap}.p-autocomplete-multiple-container{align-items:center;cursor:text;display:flex;flex-wrap:wrap;list-style-type:none;margin:0;overflow:hidden;padding:0}.p-autocomplete-token{align-items:center;cursor:default;display:inline-flex;flex:0 0 auto}.p-autocomplete-token-icon{cursor:pointer}.p-autocomplete-input-token{display:inline-flex;flex:1 1 auto}.p-autocomplete-input-token input{background-color:transparent;border:0;border-radius:0;box-shadow:none;margin:0;outline:0 none;padding:0;width:100%}.p-fluid .p-autocomplete{display:flex}.p-fluid .p-autocomplete-dd .p-autocomplete-input{width:1%}"]
            },] }
];
AutoComplete.ctorParameters = () => [
    { type: ElementRef },
    { type: Renderer2 },
    { type: ChangeDetectorRef },
    { type: IterableDiffers },
    { type: PrimeNGConfig }
];
AutoComplete.propDecorators = {
    minLength: [{ type: Input }],
    delay: [{ type: Input }],
    style: [{ type: Input }],
    panelStyle: [{ type: Input }],
    styleClass: [{ type: Input }],
    panelStyleClass: [{ type: Input }],
    inputStyle: [{ type: Input }],
    inputId: [{ type: Input }],
    inputStyleClass: [{ type: Input }],
    placeholder: [{ type: Input }],
    readonly: [{ type: Input }],
    disabled: [{ type: Input }],
    virtualScroll: [{ type: Input }],
    itemSize: [{ type: Input }],
    maxlength: [{ type: Input }],
    name: [{ type: Input }],
    required: [{ type: Input }],
    size: [{ type: Input }],
    appendTo: [{ type: Input }],
    autoHighlight: [{ type: Input }],
    forceSelection: [{ type: Input }],
    type: [{ type: Input }],
    autoZIndex: [{ type: Input }],
    baseZIndex: [{ type: Input }],
    ariaLabel: [{ type: Input }],
    ariaLabelledBy: [{ type: Input }],
    dropdownIcon: [{ type: Input }],
    unique: [{ type: Input }],
    group: [{ type: Input }],
    completeOnFocus: [{ type: Input }],
    completeMethod: [{ type: Output }],
    onSelect: [{ type: Output }],
    onUnselect: [{ type: Output }],
    onFocus: [{ type: Output }],
    onBlur: [{ type: Output }],
    onDropdownClick: [{ type: Output }],
    onClear: [{ type: Output }],
    onKeyUp: [{ type: Output }],
    onShow: [{ type: Output }],
    onHide: [{ type: Output }],
    field: [{ type: Input }],
    scrollHeight: [{ type: Input }],
    dropdown: [{ type: Input }],
    showEmptyMessage: [{ type: Input }],
    dropdownMode: [{ type: Input }],
    multiple: [{ type: Input }],
    tabindex: [{ type: Input }],
    dataKey: [{ type: Input }],
    emptyMessage: [{ type: Input }],
    showTransitionOptions: [{ type: Input }],
    hideTransitionOptions: [{ type: Input }],
    autofocus: [{ type: Input }],
    autocomplete: [{ type: Input }],
    optionGroupChildren: [{ type: Input }],
    optionGroupLabel: [{ type: Input }],
    containerEL: [{ type: ViewChild, args: ['container',] }],
    inputEL: [{ type: ViewChild, args: ['in',] }],
    multiInputEL: [{ type: ViewChild, args: ['multiIn',] }],
    multiContainerEL: [{ type: ViewChild, args: ['multiContainer',] }],
    dropdownButton: [{ type: ViewChild, args: ['ddBtn',] }],
    viewPort: [{ type: ViewChild, args: [CdkVirtualScrollViewport,] }],
    templates: [{ type: ContentChildren, args: [PrimeTemplate,] }],
    suggestions: [{ type: Input }]
};
export class AutoCompleteModule {
}
AutoCompleteModule.decorators = [
    { type: NgModule, args: [{
                imports: [CommonModule, InputTextModule, ButtonModule, SharedModule, RippleModule, ScrollingModule],
                exports: [AutoComplete, SharedModule, ScrollingModule],
                declarations: [AutoComplete]
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0b2NvbXBsZXRlLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLy4uL3NyYy9hcHAvY29tcG9uZW50cy9hdXRvY29tcGxldGUvIiwic291cmNlcyI6WyJhdXRvY29tcGxldGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFFBQVEsRUFBQyxTQUFTLEVBQUMsU0FBUyxFQUFDLFVBQVUsRUFBNkMsS0FBSyxFQUFDLE1BQU0sRUFBQyxZQUFZLEVBQUMsZUFBZSxFQUF1QixTQUFTLEVBQUMsVUFBVSxFQUFDLGlCQUFpQixFQUFDLGVBQWUsRUFBQyx1QkFBdUIsRUFBRSxpQkFBaUIsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNwUixPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDN0MsT0FBTyxFQUFDLE9BQU8sRUFBQyxLQUFLLEVBQUMsVUFBVSxFQUFDLE9BQU8sRUFBZ0IsTUFBTSxxQkFBcUIsQ0FBQztBQUNwRixPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDbEQsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQzVDLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUM1QyxPQUFPLEVBQUMsWUFBWSxFQUFDLGFBQWEsRUFBRSxlQUFlLEVBQUUsYUFBYSxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQ3ZGLE9BQU8sRUFBQyxVQUFVLEVBQUUsNkJBQTZCLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDdEUsT0FBTyxFQUFDLFdBQVcsRUFBRSxpQkFBaUIsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUM3RCxPQUFPLEVBQUMsaUJBQWlCLEVBQXVCLE1BQU0sZ0JBQWdCLENBQUM7QUFDdkUsT0FBTyxFQUFDLHdCQUF3QixFQUFFLGVBQWUsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBRWpGLE1BQU0sQ0FBQyxNQUFNLDJCQUEyQixHQUFRO0lBQzlDLE9BQU8sRUFBRSxp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QUFDLFlBQVksRUFBQyxlQUFlLENBQUM7Z0JBQ3BELFlBQVksRUFBRSxDQUFDLFlBQVksQ0FBQzthQUMvQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TmdNb2R1bGUsQ29tcG9uZW50LFZpZXdDaGlsZCxFbGVtZW50UmVmLEFmdGVyVmlld0NoZWNrZWQsQWZ0ZXJDb250ZW50SW5pdCxPbkRlc3Ryb3ksSW5wdXQsT3V0cHV0LEV2ZW50RW1pdHRlcixDb250ZW50Q2hpbGRyZW4sUXVlcnlMaXN0LFRlbXBsYXRlUmVmLFJlbmRlcmVyMixmb3J3YXJkUmVmLENoYW5nZURldGVjdG9yUmVmLEl0ZXJhYmxlRGlmZmVycyxDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSwgVmlld0VuY2Fwc3VsYXRpb259IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQge0NvbW1vbk1vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcclxuaW1wb3J0IHt0cmlnZ2VyLHN0eWxlLHRyYW5zaXRpb24sYW5pbWF0ZSxBbmltYXRpb25FdmVudH0gZnJvbSAnQGFuZ3VsYXIvYW5pbWF0aW9ucyc7XHJcbmltcG9ydCB7SW5wdXRUZXh0TW9kdWxlfSBmcm9tICdwcmltZW5nL2lucHV0dGV4dCc7XHJcbmltcG9ydCB7QnV0dG9uTW9kdWxlfSBmcm9tICdwcmltZW5nL2J1dHRvbic7XHJcbmltcG9ydCB7UmlwcGxlTW9kdWxlfSBmcm9tICdwcmltZW5nL3JpcHBsZSc7XHJcbmltcG9ydCB7U2hhcmVkTW9kdWxlLFByaW1lVGVtcGxhdGUsIFRyYW5zbGF0aW9uS2V5cywgUHJpbWVOR0NvbmZpZ30gZnJvbSAncHJpbWVuZy9hcGknO1xyXG5pbXBvcnQge0RvbUhhbmRsZXIsIENvbm5lY3RlZE92ZXJsYXlTY3JvbGxIYW5kbGVyfSBmcm9tICdwcmltZW5nL2RvbSc7XHJcbmltcG9ydCB7T2JqZWN0VXRpbHMsIFVuaXF1ZUNvbXBvbmVudElkfSBmcm9tICdwcmltZW5nL3V0aWxzJztcclxuaW1wb3J0IHtOR19WQUxVRV9BQ0NFU1NPUiwgQ29udHJvbFZhbHVlQWNjZXNzb3J9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcclxuaW1wb3J0IHtDZGtWaXJ0dWFsU2Nyb2xsVmlld3BvcnQsIFNjcm9sbGluZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY2RrL3Njcm9sbGluZyc7XHJcblxyXG5leHBvcnQgY29uc3QgQVVUT0NPTVBMRVRFX1ZBTFVFX0FDQ0VTU09SOiBhbnkgPSB7XHJcbiAgcHJvdmlkZTogTkdfVkFMVUVfQUNDRVNTT1IsXHJcbiAgdXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gQXV0b0NvbXBsZXRlKSxcclxuICBtdWx0aTogdHJ1ZVxyXG59O1xyXG5cclxuQENvbXBvbmVudCh7XHJcbiAgICBzZWxlY3RvcjogJ3AtYXV0b0NvbXBsZXRlJyxcclxuICAgIHRlbXBsYXRlOiBgXHJcbiAgICAgICAgPHNwYW4gI2NvbnRhaW5lciBbbmdDbGFzc109XCJ7J3AtYXV0b2NvbXBsZXRlIHAtY29tcG9uZW50Jzp0cnVlLCdwLWF1dG9jb21wbGV0ZS1kZCc6ZHJvcGRvd24sJ3AtYXV0b2NvbXBsZXRlLW11bHRpcGxlJzptdWx0aXBsZX1cIiBbbmdTdHlsZV09XCJzdHlsZVwiIFtjbGFzc109XCJzdHlsZUNsYXNzXCI+XHJcbiAgICAgICAgICAgIDxpbnB1dCAqbmdJZj1cIiFtdWx0aXBsZVwiICNpbiBbYXR0ci50eXBlXT1cInR5cGVcIiBbYXR0ci5pZF09XCJpbnB1dElkXCIgW25nU3R5bGVdPVwiaW5wdXRTdHlsZVwiIFtjbGFzc109XCJpbnB1dFN0eWxlQ2xhc3NcIiBbYXV0b2NvbXBsZXRlXT1cImF1dG9jb21wbGV0ZVwiIFthdHRyLnJlcXVpcmVkXT1cInJlcXVpcmVkXCIgW2F0dHIubmFtZV09XCJuYW1lXCJcclxuICAgICAgICAgICAgY2xhc3M9XCJwLWF1dG9jb21wbGV0ZS1pbnB1dCBwLWlucHV0dGV4dCBwLWNvbXBvbmVudFwiIFtuZ0NsYXNzXT1cInsncC1hdXRvY29tcGxldGUtZGQtaW5wdXQnOmRyb3Bkb3duLCdwLWRpc2FibGVkJzogZGlzYWJsZWR9XCIgW3ZhbHVlXT1cImlucHV0RmllbGRWYWx1ZVwiIGFyaWEtYXV0b2NvbXBsZXRlPVwibGlzdFwiIFthdHRyLmFyaWEtY29udHJvbHNdPVwibGlzdElkXCIgcm9sZT1cInNlYXJjaGJveFwiIFthdHRyLmFyaWEtZXhwYW5kZWRdPVwib3ZlcmxheVZpc2libGVcIiBhcmlhLWhhc3BvcHVwPVwidHJ1ZVwiIFthdHRyLmFyaWEtYWN0aXZlZGVzY2VuZGFudF09XCIncC1oaWdobGlnaHRlZC1vcHRpb24nXCJcclxuICAgICAgICAgICAgKGNsaWNrKT1cIm9uSW5wdXRDbGljaygkZXZlbnQpXCIgKGlucHV0KT1cIm9uSW5wdXQoJGV2ZW50KVwiIChrZXlkb3duKT1cIm9uS2V5ZG93bigkZXZlbnQpXCIgKGtleXVwKT1cIm9uS2V5dXAoJGV2ZW50KVwiIFthdHRyLmF1dG9mb2N1c109XCJhdXRvZm9jdXNcIiAoZm9jdXMpPVwib25JbnB1dEZvY3VzKCRldmVudClcIiAoYmx1cik9XCJvbklucHV0Qmx1cigkZXZlbnQpXCIgKGNoYW5nZSk9XCJvbklucHV0Q2hhbmdlKCRldmVudClcIiAocGFzdGUpPVwib25JbnB1dFBhc3RlKCRldmVudClcIlxyXG4gICAgICAgICAgICBbYXR0ci5wbGFjZWhvbGRlcl09XCJwbGFjZWhvbGRlclwiIFthdHRyLnNpemVdPVwic2l6ZVwiIFthdHRyLm1heGxlbmd0aF09XCJtYXhsZW5ndGhcIiBbYXR0ci50YWJpbmRleF09XCJ0YWJpbmRleFwiIFtyZWFkb25seV09XCJyZWFkb25seVwiIFtkaXNhYmxlZF09XCJkaXNhYmxlZFwiIFthdHRyLmFyaWEtbGFiZWxdPVwiYXJpYUxhYmVsXCIgW2F0dHIuYXJpYS1sYWJlbGxlZGJ5XT1cImFyaWFMYWJlbGxlZEJ5XCIgW2F0dHIuYXJpYS1yZXF1aXJlZF09XCJyZXF1aXJlZFwiXHJcbiAgICAgICAgICAgID48dWwgKm5nSWY9XCJtdWx0aXBsZVwiICNtdWx0aUNvbnRhaW5lciBjbGFzcz1cInAtYXV0b2NvbXBsZXRlLW11bHRpcGxlLWNvbnRhaW5lciBwLWNvbXBvbmVudCBwLWlucHV0dGV4dFwiIFtuZ0NsYXNzXT1cInsncC1kaXNhYmxlZCc6ZGlzYWJsZWQsJ3AtZm9jdXMnOmZvY3VzfVwiIChjbGljayk9XCJtdWx0aUluLmZvY3VzKClcIj5cclxuICAgICAgICAgICAgICAgIDxsaSAjdG9rZW4gKm5nRm9yPVwibGV0IHZhbCBvZiB2YWx1ZVwiIGNsYXNzPVwicC1hdXRvY29tcGxldGUtdG9rZW5cIj5cclxuICAgICAgICAgICAgICAgICAgICA8bmctY29udGFpbmVyICpuZ1RlbXBsYXRlT3V0bGV0PVwic2VsZWN0ZWRJdGVtVGVtcGxhdGU7IGNvbnRleHQ6IHskaW1wbGljaXQ6IHZhbH1cIj48L25nLWNvbnRhaW5lcj5cclxuICAgICAgICAgICAgICAgICAgICA8c3BhbiAqbmdJZj1cIiFzZWxlY3RlZEl0ZW1UZW1wbGF0ZVwiIGNsYXNzPVwicC1hdXRvY29tcGxldGUtdG9rZW4tbGFiZWxcIj57e3Jlc29sdmVGaWVsZERhdGEodmFsKX19PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuICBjbGFzcz1cInAtYXV0b2NvbXBsZXRlLXRva2VuLWljb24gcGkgcGktdGltZXMtY2lyY2xlXCIgKGNsaWNrKT1cInJlbW92ZUl0ZW0odG9rZW4pXCIgKm5nSWY9XCIhZGlzYWJsZWQgJiYgIXJlYWRvbmx5XCI+PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgPC9saT5cclxuICAgICAgICAgICAgICAgIDxsaSBjbGFzcz1cInAtYXV0b2NvbXBsZXRlLWlucHV0LXRva2VuXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGlucHV0ICNtdWx0aUluIFthdHRyLnR5cGVdPVwidHlwZVwiIFthdHRyLmlkXT1cImlucHV0SWRcIiBbZGlzYWJsZWRdPVwiZGlzYWJsZWRcIiBbYXR0ci5wbGFjZWhvbGRlcl09XCIodmFsdWUmJnZhbHVlLmxlbmd0aCA/IG51bGwgOiBwbGFjZWhvbGRlcilcIiBbYXR0ci50YWJpbmRleF09XCJ0YWJpbmRleFwiIFthdHRyLm1heGxlbmd0aF09XCJtYXhsZW5ndGhcIiAoaW5wdXQpPVwib25JbnB1dCgkZXZlbnQpXCIgIChjbGljayk9XCJvbklucHV0Q2xpY2soJGV2ZW50KVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoa2V5ZG93bik9XCJvbktleWRvd24oJGV2ZW50KVwiIFtyZWFkb25seV09XCJyZWFkb25seVwiIChrZXl1cCk9XCJvbktleXVwKCRldmVudClcIiBbYXR0ci5hdXRvZm9jdXNdPVwiYXV0b2ZvY3VzXCIgKGZvY3VzKT1cIm9uSW5wdXRGb2N1cygkZXZlbnQpXCIgKGJsdXIpPVwib25JbnB1dEJsdXIoJGV2ZW50KVwiIChjaGFuZ2UpPVwib25JbnB1dENoYW5nZSgkZXZlbnQpXCIgKHBhc3RlKT1cIm9uSW5wdXRQYXN0ZSgkZXZlbnQpXCIgW2F1dG9jb21wbGV0ZV09XCJhdXRvY29tcGxldGVcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgW25nU3R5bGVdPVwiaW5wdXRTdHlsZVwiIFtjbGFzc109XCJpbnB1dFN0eWxlQ2xhc3NcIiBbYXR0ci5hcmlhLWxhYmVsXT1cImFyaWFMYWJlbFwiIFthdHRyLmFyaWEtbGFiZWxsZWRieV09XCJhcmlhTGFiZWxsZWRCeVwiIFthdHRyLmFyaWEtcmVxdWlyZWRdPVwicmVxdWlyZWRcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJpYS1hdXRvY29tcGxldGU9XCJsaXN0XCIgW2F0dHIuYXJpYS1jb250cm9sc109XCJsaXN0SWRcIiByb2xlPVwic2VhcmNoYm94XCIgW2F0dHIuYXJpYS1leHBhbmRlZF09XCJvdmVybGF5VmlzaWJsZVwiIGFyaWEtaGFzcG9wdXA9XCJ0cnVlXCIgW2F0dHIuYXJpYS1hY3RpdmVkZXNjZW5kYW50XT1cIidwLWhpZ2hsaWdodGVkLW9wdGlvbidcIj5cclxuICAgICAgICAgICAgICAgIDwvbGk+XHJcbiAgICAgICAgICAgIDwvdWw+XHJcbiAgICAgICAgICAgIDxpICpuZ0lmPVwibG9hZGluZ1wiIGNsYXNzPVwicC1hdXRvY29tcGxldGUtbG9hZGVyIHBpIHBpLXNwaW5uZXIgcGktc3BpblwiPjwvaT48YnV0dG9uICNkZEJ0biB0eXBlPVwiYnV0dG9uXCIgcEJ1dHRvbiBbaWNvbl09XCJkcm9wZG93bkljb25cIiBjbGFzcz1cInAtYXV0b2NvbXBsZXRlLWRyb3Bkb3duXCIgW2Rpc2FibGVkXT1cImRpc2FibGVkXCIgcFJpcHBsZVxyXG4gICAgICAgICAgICAgICAgKGNsaWNrKT1cImhhbmRsZURyb3Bkb3duQ2xpY2soJGV2ZW50KVwiICpuZ0lmPVwiZHJvcGRvd25cIiBbYXR0ci50YWJpbmRleF09XCJ0YWJpbmRleFwiPjwvYnV0dG9uPlxyXG4gICAgICAgICAgICA8ZGl2ICNwYW5lbCAqbmdJZj1cIm92ZXJsYXlWaXNpYmxlXCIgW25nQ2xhc3NdPVwiWydwLWF1dG9jb21wbGV0ZS1wYW5lbCBwLWNvbXBvbmVudCddXCIgW3N0eWxlLm1heC1oZWlnaHRdPVwidmlydHVhbFNjcm9sbCA/ICdhdXRvJyA6IHNjcm9sbEhlaWdodFwiIFtuZ1N0eWxlXT1cInBhbmVsU3R5bGVcIiBbY2xhc3NdPVwicGFuZWxTdHlsZUNsYXNzXCJcclxuICAgICAgICAgICAgICAgIFtAb3ZlcmxheUFuaW1hdGlvbl09XCJ7dmFsdWU6ICd2aXNpYmxlJywgcGFyYW1zOiB7c2hvd1RyYW5zaXRpb25QYXJhbXM6IHNob3dUcmFuc2l0aW9uT3B0aW9ucywgaGlkZVRyYW5zaXRpb25QYXJhbXM6IGhpZGVUcmFuc2l0aW9uT3B0aW9uc319XCIgKEBvdmVybGF5QW5pbWF0aW9uLnN0YXJ0KT1cIm9uT3ZlcmxheUFuaW1hdGlvblN0YXJ0KCRldmVudClcIj5cclxuICAgICAgICAgICAgICAgIDxuZy1jb250YWluZXIgKm5nVGVtcGxhdGVPdXRsZXQ9XCJoZWFkZXJUZW1wbGF0ZVwiPjwvbmctY29udGFpbmVyPlxyXG4gICAgICAgICAgICAgICAgPHVsIHJvbGU9XCJsaXN0Ym94XCIgW2F0dHIuaWRdPVwibGlzdElkXCIgY2xhc3M9XCJwLWF1dG9jb21wbGV0ZS1pdGVtc1wiIFtuZ0NsYXNzXT1cInsncC1hdXRvY29tcGxldGUtdmlydHVhbHNjcm9sbCc6IHZpcnR1YWxTY3JvbGx9XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPG5nLWNvbnRhaW5lciAqbmdJZj1cImdyb3VwXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxuZy10ZW1wbGF0ZSBuZ0ZvciBsZXQtb3B0Z3JvdXAgW25nRm9yT2ZdPVwic3VnZ2VzdGlvbnNcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsaSBjbGFzcz1cInAtYXV0b2NvbXBsZXRlLWl0ZW0tZ3JvdXBcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiAqbmdJZj1cIiFncm91cFRlbXBsYXRlXCI+e3tnZXRPcHRpb25Hcm91cExhYmVsKG9wdGdyb3VwKXx8J2VtcHR5J319PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxuZy1jb250YWluZXIgKm5nVGVtcGxhdGVPdXRsZXQ9XCJncm91cFRlbXBsYXRlOyBjb250ZXh0OiB7JGltcGxpY2l0OiBvcHRncm91cH1cIj48L25nLWNvbnRhaW5lcj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbGk+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bmctY29udGFpbmVyICpuZ1RlbXBsYXRlT3V0bGV0PVwiaXRlbXNsaXN0OyBjb250ZXh0OiB7JGltcGxpY2l0OiBnZXRPcHRpb25Hcm91cENoaWxkcmVuKG9wdGdyb3VwKX1cIj48L25nLWNvbnRhaW5lcj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9uZy10ZW1wbGF0ZT5cclxuICAgICAgICAgICAgICAgICAgICA8L25nLWNvbnRhaW5lcj5cclxuICAgICAgICAgICAgICAgICAgICA8bmctY29udGFpbmVyICpuZ0lmPVwiIWdyb3VwXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bmctY29udGFpbmVyICpuZ1RlbXBsYXRlT3V0bGV0PVwiaXRlbXNsaXN0OyBjb250ZXh0OiB7JGltcGxpY2l0OiBzdWdnZXN0aW9uc31cIj48L25nLWNvbnRhaW5lcj5cclxuICAgICAgICAgICAgICAgICAgICA8L25nLWNvbnRhaW5lcj5cclxuICAgICAgICAgICAgICAgICAgICA8bmctdGVtcGxhdGUgI2l0ZW1zbGlzdCBsZXQtc3VnZ2VzdGlvbnNUb0Rpc3BsYXk+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxuZy1jb250YWluZXIgKm5nSWY9XCIhdmlydHVhbFNjcm9sbDsgZWxzZSB2aXJ0dWFsU2Nyb2xsTGlzdFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxpIHJvbGU9XCJvcHRpb25cIiAqbmdGb3I9XCJsZXQgb3B0aW9uIG9mIHN1Z2dlc3Rpb25zVG9EaXNwbGF5OyBsZXQgaWR4ID0gaW5kZXhcIiBjbGFzcz1cInAtYXV0b2NvbXBsZXRlLWl0ZW1cIiBwUmlwcGxlIFtuZ0NsYXNzXT1cInsncC1oaWdobGlnaHQnOiAob3B0aW9uID09PSBoaWdobGlnaHRPcHRpb24pfVwiIFtpZF09XCJoaWdobGlnaHRPcHRpb24gPT0gb3B0aW9uID8gJ3AtaGlnaGxpZ2h0ZWQtb3B0aW9uJzonJ1wiIChjbGljayk9XCJzZWxlY3RJdGVtKG9wdGlvbilcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiAqbmdJZj1cIiFpdGVtVGVtcGxhdGVcIj57e3Jlc29sdmVGaWVsZERhdGEob3B0aW9uKX19PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxuZy1jb250YWluZXIgKm5nVGVtcGxhdGVPdXRsZXQ9XCJpdGVtVGVtcGxhdGU7IGNvbnRleHQ6IHskaW1wbGljaXQ6IG9wdGlvbiwgaW5kZXg6IGlkeH1cIj48L25nLWNvbnRhaW5lcj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbGk+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvbmctY29udGFpbmVyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8bmctdGVtcGxhdGUgI3ZpcnR1YWxTY3JvbGxMaXN0PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGNkay12aXJ0dWFsLXNjcm9sbC12aWV3cG9ydCBbbmdTdHlsZV09XCJ7J2hlaWdodCc6IHNjcm9sbEhlaWdodH1cIiBbaXRlbVNpemVdPVwiaXRlbVNpemVcIiAqbmdJZj1cInZpcnR1YWxTY3JvbGwgJiYgIW5vUmVzdWx0c1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxuZy1jb250YWluZXIgKmNka1ZpcnR1YWxGb3I9XCJsZXQgb3B0aW9uIG9mIHN1Z2dlc3Rpb25zVG9EaXNwbGF5OyBsZXQgaSA9IGluZGV4OyBsZXQgYyA9IGNvdW50OyBsZXQgZiA9IGZpcnN0OyBsZXQgbCA9IGxhc3Q7IGxldCBlID0gZXZlbjsgbGV0IG8gPSBvZGRcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxpIHJvbGU9XCJvcHRpb25cIiBjbGFzcz1cInAtYXV0b2NvbXBsZXRlLWl0ZW1cIiBwUmlwcGxlIFtuZ0NsYXNzXT1cInsncC1oaWdobGlnaHQnOiAob3B0aW9uID09PSBoaWdobGlnaHRPcHRpb24pfVwiIFtuZ1N0eWxlXT1cInsnaGVpZ2h0JzogaXRlbVNpemUgKyAncHgnfVwiIFtpZF09XCJoaWdobGlnaHRPcHRpb24gPT0gb3B0aW9uID8gJ3AtaGlnaGxpZ2h0ZWQtb3B0aW9uJzonJ1wiIChjbGljayk9XCJzZWxlY3RJdGVtKG9wdGlvbilcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuICpuZ0lmPVwiIWl0ZW1UZW1wbGF0ZVwiPnt7cmVzb2x2ZUZpZWxkRGF0YShvcHRpb24pfX08L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bmctY29udGFpbmVyICpuZ1RlbXBsYXRlT3V0bGV0PVwiaXRlbVRlbXBsYXRlOyBjb250ZXh0OiB7JGltcGxpY2l0OiBvcHRpb24sIGluZGV4OiBpfVwiPjwvbmctY29udGFpbmVyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2xpPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbmctY29udGFpbmVyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9jZGstdmlydHVhbC1zY3JvbGwtdmlld3BvcnQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvbmctdGVtcGxhdGU+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxsaSAqbmdJZj1cIm5vUmVzdWx0cyAmJiBzaG93RW1wdHlNZXNzYWdlXCIgY2xhc3M9XCJwLWF1dG9jb21wbGV0ZS1lbXB0eS1tZXNzYWdlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bmctY29udGFpbmVyICpuZ0lmPVwiIWVtcHR5VGVtcGxhdGU7IGVsc2UgZW1wdHlcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7e2VtcHR5TWVzc2FnZUxhYmVsfX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbmctY29udGFpbmVyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPG5nLWNvbnRhaW5lciAjZW1wdHkgKm5nVGVtcGxhdGVPdXRsZXQ9XCJlbXB0eVRlbXBsYXRlXCI+PC9uZy1jb250YWluZXI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvbGk+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9uZy10ZW1wbGF0ZT5cclxuICAgICAgICAgICAgICAgIDwvdWw+XHJcbiAgICAgICAgICAgICAgICA8bmctY29udGFpbmVyICpuZ1RlbXBsYXRlT3V0bGV0PVwiZm9vdGVyVGVtcGxhdGVcIj48L25nLWNvbnRhaW5lcj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9zcGFuPlxyXG4gICAgYCxcclxuICAgIGFuaW1hdGlvbnM6IFtcclxuICAgICAgICB0cmlnZ2VyKCdvdmVybGF5QW5pbWF0aW9uJywgW1xyXG4gICAgICAgICAgICB0cmFuc2l0aW9uKCc6ZW50ZXInLCBbXHJcbiAgICAgICAgICAgICAgICBzdHlsZSh7b3BhY2l0eTogMCwgdHJhbnNmb3JtOiAnc2NhbGVZKDAuOCknfSksXHJcbiAgICAgICAgICAgICAgICBhbmltYXRlKCd7e3Nob3dUcmFuc2l0aW9uUGFyYW1zfX0nKVxyXG4gICAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICAgIHRyYW5zaXRpb24oJzpsZWF2ZScsIFtcclxuICAgICAgICAgICAgICAgIGFuaW1hdGUoJ3t7aGlkZVRyYW5zaXRpb25QYXJhbXN9fScsIHN0eWxlKHsgb3BhY2l0eTogMCB9KSlcclxuICAgICAgICAgICAgICBdKVxyXG4gICAgICAgIF0pXHJcbiAgICBdLFxyXG4gICAgaG9zdDoge1xyXG4gICAgICAgICdbY2xhc3MucC1pbnB1dHdyYXBwZXItZmlsbGVkXSc6ICdmaWxsZWQnLFxyXG4gICAgICAgICdbY2xhc3MucC1pbnB1dHdyYXBwZXItZm9jdXNdJzogJyhmb2N1cyAmJiAhZGlzYWJsZWQpIHx8wqBvdmVybGF5VmlzaWJsZSdcclxuICAgIH0sXHJcbiAgICBwcm92aWRlcnM6IFtBVVRPQ09NUExFVEVfVkFMVUVfQUNDRVNTT1JdLFxyXG4gICAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXHJcbiAgICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxyXG4gICAgc3R5bGVVcmxzOiBbJy4vYXV0b2NvbXBsZXRlLmNzcyddXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBBdXRvQ29tcGxldGUgaW1wbGVtZW50cyBBZnRlclZpZXdDaGVja2VkLEFmdGVyQ29udGVudEluaXQsT25EZXN0cm95LENvbnRyb2xWYWx1ZUFjY2Vzc29yIHtcclxuXHJcbiAgICBASW5wdXQoKSBtaW5MZW5ndGg6IG51bWJlciA9IDE7XHJcblxyXG4gICAgQElucHV0KCkgZGVsYXk6IG51bWJlciA9IDMwMDtcclxuXHJcbiAgICBASW5wdXQoKSBzdHlsZTogYW55O1xyXG5cclxuICAgIEBJbnB1dCgpIHBhbmVsU3R5bGU6IGFueTtcclxuXHJcbiAgICBASW5wdXQoKSBzdHlsZUNsYXNzOiBzdHJpbmc7XHJcblxyXG4gICAgQElucHV0KCkgcGFuZWxTdHlsZUNsYXNzOiBzdHJpbmc7XHJcblxyXG4gICAgQElucHV0KCkgaW5wdXRTdHlsZTogYW55O1xyXG5cclxuICAgIEBJbnB1dCgpIGlucHV0SWQ6IHN0cmluZztcclxuXHJcbiAgICBASW5wdXQoKSBpbnB1dFN0eWxlQ2xhc3M6IHN0cmluZztcclxuXHJcbiAgICBASW5wdXQoKSBwbGFjZWhvbGRlcjogc3RyaW5nO1xyXG5cclxuICAgIEBJbnB1dCgpIHJlYWRvbmx5OiBib29sZWFuO1xyXG5cclxuICAgIEBJbnB1dCgpIGRpc2FibGVkOiBib29sZWFuO1xyXG5cclxuICAgIEBJbnB1dCgpIHZpcnR1YWxTY3JvbGw6IGJvb2xlYW47XHJcblxyXG4gICAgQElucHV0KCkgaXRlbVNpemU6IG51bWJlcjtcclxuXHJcbiAgICBASW5wdXQoKSBtYXhsZW5ndGg6IG51bWJlcjtcclxuXHJcbiAgICBASW5wdXQoKSBuYW1lOiBzdHJpbmc7XHJcblxyXG4gICAgQElucHV0KCkgcmVxdWlyZWQ6IGJvb2xlYW47XHJcblxyXG4gICAgQElucHV0KCkgc2l6ZTogbnVtYmVyO1xyXG5cclxuICAgIEBJbnB1dCgpIGFwcGVuZFRvOiBhbnk7XHJcblxyXG4gICAgQElucHV0KCkgYXV0b0hpZ2hsaWdodDogYm9vbGVhbjtcclxuXHJcbiAgICBASW5wdXQoKSBmb3JjZVNlbGVjdGlvbjogYm9vbGVhbjtcclxuXHJcbiAgICBASW5wdXQoKSB0eXBlOiBzdHJpbmcgPSAndGV4dCc7XHJcblxyXG4gICAgQElucHV0KCkgYXV0b1pJbmRleDogYm9vbGVhbiA9IHRydWU7XHJcblxyXG4gICAgQElucHV0KCkgYmFzZVpJbmRleDogbnVtYmVyID0gMDtcclxuXHJcbiAgICBASW5wdXQoKSBhcmlhTGFiZWw6IHN0cmluZztcclxuXHJcbiAgICBASW5wdXQoKSBhcmlhTGFiZWxsZWRCeTogc3RyaW5nO1xyXG5cclxuICAgIEBJbnB1dCgpIGRyb3Bkb3duSWNvbjogc3RyaW5nID0gXCJwaSBwaS1jaGV2cm9uLWRvd25cIjtcclxuXHJcbiAgICBASW5wdXQoKSB1bmlxdWU6IGJvb2xlYW4gPSB0cnVlO1xyXG5cclxuICAgIEBJbnB1dCgpIGdyb3VwOiBib29sZWFuO1xyXG5cclxuICAgIEBJbnB1dCgpIGNvbXBsZXRlT25Gb2N1czogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICAgIEBPdXRwdXQoKSBjb21wbGV0ZU1ldGhvZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XHJcblxyXG4gICAgQE91dHB1dCgpIG9uU2VsZWN0OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcclxuXHJcbiAgICBAT3V0cHV0KCkgb25VbnNlbGVjdDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XHJcblxyXG4gICAgQE91dHB1dCgpIG9uRm9jdXM6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG5cclxuICAgIEBPdXRwdXQoKSBvbkJsdXI6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG5cclxuICAgIEBPdXRwdXQoKSBvbkRyb3Bkb3duQ2xpY2s6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG5cclxuXHRAT3V0cHV0KCkgb25DbGVhcjogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XHJcblxyXG4gICAgQE91dHB1dCgpIG9uS2V5VXA6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG5cclxuICAgIEBPdXRwdXQoKSBvblNob3c6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG5cclxuICAgIEBPdXRwdXQoKSBvbkhpZGU6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG5cclxuICAgIEBJbnB1dCgpIGZpZWxkOiBzdHJpbmc7XHJcblxyXG4gICAgQElucHV0KCkgc2Nyb2xsSGVpZ2h0OiBzdHJpbmcgPSAnMjAwcHgnO1xyXG5cclxuICAgIEBJbnB1dCgpIGRyb3Bkb3duOiBib29sZWFuO1xyXG5cclxuICAgIEBJbnB1dCgpIHNob3dFbXB0eU1lc3NhZ2U6IGJvb2xlYW47XHJcblxyXG4gICAgQElucHV0KCkgZHJvcGRvd25Nb2RlOiBzdHJpbmcgPSAnYmxhbmsnO1xyXG5cclxuICAgIEBJbnB1dCgpIG11bHRpcGxlOiBib29sZWFuO1xyXG5cclxuICAgIEBJbnB1dCgpIHRhYmluZGV4OiBudW1iZXI7XHJcblxyXG4gICAgQElucHV0KCkgZGF0YUtleTogc3RyaW5nO1xyXG5cclxuICAgIEBJbnB1dCgpIGVtcHR5TWVzc2FnZTogc3RyaW5nO1xyXG5cclxuICAgIEBJbnB1dCgpIHNob3dUcmFuc2l0aW9uT3B0aW9uczogc3RyaW5nID0gJy4xMnMgY3ViaWMtYmV6aWVyKDAsIDAsIDAuMiwgMSknO1xyXG5cclxuICAgIEBJbnB1dCgpIGhpZGVUcmFuc2l0aW9uT3B0aW9uczogc3RyaW5nID0gJy4xcyBsaW5lYXInO1xyXG5cclxuICAgIEBJbnB1dCgpIGF1dG9mb2N1czogYm9vbGVhbjtcclxuXHJcbiAgICBASW5wdXQoKSBhdXRvY29tcGxldGU6IHN0cmluZyA9ICdvZmYnO1xyXG5cclxuICAgIEBJbnB1dCgpIG9wdGlvbkdyb3VwQ2hpbGRyZW46IHN0cmluZztcclxuXHJcbiAgICBASW5wdXQoKSBvcHRpb25Hcm91cExhYmVsOiBzdHJpbmc7XHJcblxyXG4gICAgQFZpZXdDaGlsZCgnY29udGFpbmVyJykgY29udGFpbmVyRUw6IEVsZW1lbnRSZWY7XHJcblxyXG4gICAgQFZpZXdDaGlsZCgnaW4nKSBpbnB1dEVMOiBFbGVtZW50UmVmO1xyXG5cclxuICAgIEBWaWV3Q2hpbGQoJ211bHRpSW4nKSBtdWx0aUlucHV0RUw6IEVsZW1lbnRSZWY7XHJcblxyXG4gICAgQFZpZXdDaGlsZCgnbXVsdGlDb250YWluZXInKSBtdWx0aUNvbnRhaW5lckVMOiBFbGVtZW50UmVmO1xyXG5cclxuICAgIEBWaWV3Q2hpbGQoJ2RkQnRuJykgZHJvcGRvd25CdXR0b246IEVsZW1lbnRSZWY7XHJcblxyXG4gICAgQFZpZXdDaGlsZChDZGtWaXJ0dWFsU2Nyb2xsVmlld3BvcnQpIHZpZXdQb3J0OiBDZGtWaXJ0dWFsU2Nyb2xsVmlld3BvcnQ7XHJcblxyXG4gICAgQENvbnRlbnRDaGlsZHJlbihQcmltZVRlbXBsYXRlKSB0ZW1wbGF0ZXM6IFF1ZXJ5TGlzdDxhbnk+O1xyXG5cclxuICAgIG92ZXJsYXk6IEhUTUxEaXZFbGVtZW50O1xyXG5cclxuICAgIGl0ZW1zV3JhcHBlcjogSFRNTERpdkVsZW1lbnQ7XHJcblxyXG4gICAgaXRlbVRlbXBsYXRlOiBUZW1wbGF0ZVJlZjxhbnk+O1xyXG5cclxuICAgIGVtcHR5VGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT47XHJcblxyXG4gICAgaGVhZGVyVGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT47XHJcblxyXG4gICAgZm9vdGVyVGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT47XHJcblxyXG4gICAgc2VsZWN0ZWRJdGVtVGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT47XHJcbiAgICBcclxuICAgIGdyb3VwVGVtcGxhdGU6IFRlbXBsYXRlUmVmPGFueT47XHJcblxyXG4gICAgdmFsdWU6IGFueTtcclxuXHJcbiAgICBfc3VnZ2VzdGlvbnM6IGFueVtdO1xyXG5cclxuICAgIG9uTW9kZWxDaGFuZ2U6IEZ1bmN0aW9uID0gKCkgPT4ge307XHJcblxyXG4gICAgb25Nb2RlbFRvdWNoZWQ6IEZ1bmN0aW9uID0gKCkgPT4ge307XHJcblxyXG4gICAgdGltZW91dDogYW55O1xyXG5cclxuICAgIG92ZXJsYXlWaXNpYmxlOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gICAgZG9jdW1lbnRDbGlja0xpc3RlbmVyOiBhbnk7XHJcblxyXG4gICAgc3VnZ2VzdGlvbnNVcGRhdGVkOiBib29sZWFuO1xyXG5cclxuICAgIGhpZ2hsaWdodE9wdGlvbjogYW55O1xyXG5cclxuICAgIGhpZ2hsaWdodE9wdGlvbkNoYW5nZWQ6IGJvb2xlYW47XHJcblxyXG4gICAgZm9jdXM6IGJvb2xlYW4gPSBmYWxzZTtcclxuXHJcbiAgICBmaWxsZWQ6IGJvb2xlYW47XHJcblxyXG4gICAgaW5wdXRDbGljazogYm9vbGVhbjtcclxuXHJcbiAgICBpbnB1dEtleURvd246IGJvb2xlYW47XHJcblxyXG4gICAgbm9SZXN1bHRzOiBib29sZWFuO1xyXG5cclxuICAgIGRpZmZlcjogYW55O1xyXG5cclxuICAgIGlucHV0RmllbGRWYWx1ZTogc3RyaW5nID0gbnVsbDtcclxuXHJcbiAgICBsb2FkaW5nOiBib29sZWFuO1xyXG5cclxuICAgIHNjcm9sbEhhbmRsZXI6IGFueTtcclxuXHJcbiAgICBkb2N1bWVudFJlc2l6ZUxpc3RlbmVyOiBhbnk7XHJcblxyXG4gICAgZm9yY2VTZWxlY3Rpb25VcGRhdGVNb2RlbFRpbWVvdXQ6IGFueTtcclxuXHJcbiAgICBsaXN0SWQ6IHN0cmluZztcclxuXHJcbiAgICBpdGVtQ2xpY2tlZDogYm9vbGVhbjtcclxuXHJcbiAgICB2aXJ0dWFsU2Nyb2xsU2VsZWN0ZWRJbmRleDogbnVtYmVyO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBlbDogRWxlbWVudFJlZiwgcHVibGljIHJlbmRlcmVyOiBSZW5kZXJlcjIsIHB1YmxpYyBjZDogQ2hhbmdlRGV0ZWN0b3JSZWYsIHB1YmxpYyBkaWZmZXJzOiBJdGVyYWJsZURpZmZlcnMsIHB1YmxpYyBjb25maWc6IFByaW1lTkdDb25maWcpIHtcclxuICAgICAgICB0aGlzLmRpZmZlciA9IGRpZmZlcnMuZmluZChbXSkuY3JlYXRlKG51bGwpO1xyXG4gICAgICAgIHRoaXMubGlzdElkID0gVW5pcXVlQ29tcG9uZW50SWQoKSArICdfbGlzdCc7XHJcbiAgICB9XHJcblxyXG4gICAgQElucHV0KCkgZ2V0IHN1Z2dlc3Rpb25zKCk6IGFueVtdIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fc3VnZ2VzdGlvbnM7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IHN1Z2dlc3Rpb25zKHZhbDphbnlbXSkge1xyXG4gICAgICAgIHRoaXMuX3N1Z2dlc3Rpb25zID0gdmFsO1xyXG4gICAgICAgIHRoaXMuaGFuZGxlU3VnZ2VzdGlvbnNDaGFuZ2UoKTtcclxuICAgIH1cclxuXHJcbiAgICBuZ0FmdGVyVmlld0NoZWNrZWQoKSB7XHJcbiAgICAgICAgLy9Vc2UgdGltZW91dHMgYXMgc2luY2UgQW5ndWxhciA0LjIsIEFmdGVyVmlld0NoZWNrZWQgaXMgYnJva2VuIGFuZCBub3QgY2FsbGVkIGFmdGVyIHBhbmVsIGlzIHVwZGF0ZWRcclxuICAgICAgICBpZiAodGhpcy5zdWdnZXN0aW9uc1VwZGF0ZWQgJiYgdGhpcy5vdmVybGF5ICYmIHRoaXMub3ZlcmxheS5vZmZzZXRQYXJlbnQpIHtcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vdmVybGF5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hbGlnbk92ZXJsYXkoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSwgMSk7XHJcbiAgICAgICAgICAgIHRoaXMuc3VnZ2VzdGlvbnNVcGRhdGVkID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5oaWdobGlnaHRPcHRpb25DaGFuZ2VkKSB7XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3ZlcmxheSAmJiB0aGlzLml0ZW1zV3JhcHBlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBsaXN0SXRlbSA9IERvbUhhbmRsZXIuZmluZFNpbmdsZSh0aGlzLm92ZXJsYXksICdsaS5wLWhpZ2hsaWdodCcpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAobGlzdEl0ZW0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgRG9tSGFuZGxlci5zY3JvbGxJblZpZXcodGhpcy5pdGVtc1dyYXBwZXIsIGxpc3RJdGVtKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnZpcnR1YWxTY3JvbGwgJiYgdGhpcy52aWV3UG9ydCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcmFuZ2UgPSB0aGlzLnZpZXdQb3J0LmdldFJlbmRlcmVkUmFuZ2UoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy51cGRhdGVWaXJ0dWFsU2Nyb2xsU2VsZWN0ZWRJbmRleCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJhbmdlLnN0YXJ0ID4gdGhpcy52aXJ0dWFsU2Nyb2xsU2VsZWN0ZWRJbmRleCB8fCByYW5nZS5lbmQgPCB0aGlzLnZpcnR1YWxTY3JvbGxTZWxlY3RlZEluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnZpZXdQb3J0LnNjcm9sbFRvSW5kZXgodGhpcy52aXJ0dWFsU2Nyb2xsU2VsZWN0ZWRJbmRleCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sIDEpO1xyXG4gICAgICAgICAgICB0aGlzLmhpZ2hsaWdodE9wdGlvbkNoYW5nZWQgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaGFuZGxlU3VnZ2VzdGlvbnNDaGFuZ2UoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3N1Z2dlc3Rpb25zICE9IG51bGwgJiYgdGhpcy5sb2FkaW5nKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0T3B0aW9uID0gbnVsbDtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX3N1Z2dlc3Rpb25zLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ub1Jlc3VsdHMgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvdygpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zdWdnZXN0aW9uc1VwZGF0ZWQgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmF1dG9IaWdobGlnaHQpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmhpZ2hsaWdodE9wdGlvbiA9IHRoaXMuX3N1Z2dlc3Rpb25zWzBdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5ub1Jlc3VsdHMgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNob3dFbXB0eU1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNob3coKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnN1Z2dlc3Rpb25zVXBkYXRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5sb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcclxuICAgICAgICB0aGlzLnRlbXBsYXRlcy5mb3JFYWNoKChpdGVtKSA9PiB7XHJcbiAgICAgICAgICAgIHN3aXRjaChpdGVtLmdldFR5cGUoKSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnaXRlbSc6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pdGVtVGVtcGxhdGUgPSBpdGVtLnRlbXBsYXRlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICAgICAgY2FzZSAnZ3JvdXAnOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ3JvdXBUZW1wbGF0ZSA9IGl0ZW0udGVtcGxhdGU7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgICAgICBjYXNlICdzZWxlY3RlZEl0ZW0nOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJdGVtVGVtcGxhdGUgPSBpdGVtLnRlbXBsYXRlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICAgICAgY2FzZSAnaGVhZGVyJzpcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmhlYWRlclRlbXBsYXRlID0gaXRlbS50ZW1wbGF0ZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgIGNhc2UgJ2VtcHR5JzpcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVtcHR5VGVtcGxhdGUgPSBpdGVtLnRlbXBsYXRlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICAgICAgY2FzZSAnZm9vdGVyJzpcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmZvb3RlclRlbXBsYXRlID0gaXRlbS50ZW1wbGF0ZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pdGVtVGVtcGxhdGUgPSBpdGVtLnRlbXBsYXRlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVWaXJ0dWFsU2Nyb2xsU2VsZWN0ZWRJbmRleCgpIHtcclxuICAgICAgICBpZiAodGhpcy5oaWdobGlnaHRPcHRpb24gJiYgdGhpcy5zdWdnZXN0aW9ucyAmJiB0aGlzLnN1Z2dlc3Rpb25zLmxlbmd0aCkge1xyXG4gICAgICAgICAgICB0aGlzLnZpcnR1YWxTY3JvbGxTZWxlY3RlZEluZGV4ID0gdGhpcy5maW5kT3B0aW9uSW5kZXgodGhpcy5oaWdobGlnaHRPcHRpb24sIHRoaXMuc3VnZ2VzdGlvbnMpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB3cml0ZVZhbHVlKHZhbHVlOiBhbnkpIDogdm9pZCB7XHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xyXG4gICAgICAgIHRoaXMuZmlsbGVkID0gdGhpcy52YWx1ZSAmJiB0aGlzLnZhbHVlICE9ICcnO1xyXG4gICAgICAgIHRoaXMudXBkYXRlSW5wdXRGaWVsZCgpO1xyXG4gICAgICAgIHRoaXMuY2QubWFya0ZvckNoZWNrKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0T3B0aW9uR3JvdXBDaGlsZHJlbihvcHRpb25Hcm91cDogYW55KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9uR3JvdXBDaGlsZHJlbiA/IE9iamVjdFV0aWxzLnJlc29sdmVGaWVsZERhdGEob3B0aW9uR3JvdXAsIHRoaXMub3B0aW9uR3JvdXBDaGlsZHJlbikgOiBvcHRpb25Hcm91cC5pdGVtcztcclxuICAgIH1cclxuXHJcbiAgICBnZXRPcHRpb25Hcm91cExhYmVsKG9wdGlvbkdyb3VwOiBhbnkpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5vcHRpb25Hcm91cExhYmVsID8gT2JqZWN0VXRpbHMucmVzb2x2ZUZpZWxkRGF0YShvcHRpb25Hcm91cCwgdGhpcy5vcHRpb25Hcm91cExhYmVsKSA6IChvcHRpb25Hcm91cC5sYWJlbCAhPSB1bmRlZmluZWQgPyBvcHRpb25Hcm91cC5sYWJlbCA6IG9wdGlvbkdyb3VwKTtcclxuICAgIH1cclxuXHJcbiAgICByZWdpc3Rlck9uQ2hhbmdlKGZuOiBGdW5jdGlvbik6IHZvaWQge1xyXG4gICAgICAgIHRoaXMub25Nb2RlbENoYW5nZSA9IGZuO1xyXG4gICAgfVxyXG5cclxuICAgIHJlZ2lzdGVyT25Ub3VjaGVkKGZuOiBGdW5jdGlvbik6IHZvaWQge1xyXG4gICAgICAgIHRoaXMub25Nb2RlbFRvdWNoZWQgPSBmbjtcclxuICAgIH1cclxuXHJcbiAgICBzZXREaXNhYmxlZFN0YXRlKHZhbDogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgICAgIHRoaXMuZGlzYWJsZWQgPSB2YWw7XHJcbiAgICAgICAgdGhpcy5jZC5tYXJrRm9yQ2hlY2soKTtcclxuICAgIH1cclxuXHJcbiAgICBvbklucHV0KGV2ZW50OiBFdmVudCkge1xyXG4gICAgICAgIC8vIFdoZW4gYW4gaW5wdXQgZWxlbWVudCB3aXRoIGEgcGxhY2Vob2xkZXIgaXMgY2xpY2tlZCwgdGhlIG9uSW5wdXQgZXZlbnQgaXMgaW52b2tlZCBpbiBJRS5cclxuICAgICAgICBpZiAoIXRoaXMuaW5wdXRLZXlEb3duICYmIERvbUhhbmRsZXIuaXNJRSgpKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnRpbWVvdXQpIHtcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZW91dCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgdmFsdWUgPSAoPEhUTUxJbnB1dEVsZW1lbnQ+IGV2ZW50LnRhcmdldCkudmFsdWU7XHJcbiAgICAgICAgaWYgKCF0aGlzLm11bHRpcGxlICYmICF0aGlzLmZvcmNlU2VsZWN0aW9uKSB7XHJcbiAgICAgICAgICAgIHRoaXMub25Nb2RlbENoYW5nZSh2YWx1ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodmFsdWUubGVuZ3RoID09PSAwICYmICF0aGlzLm11bHRpcGxlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaGlkZSgpO1xyXG4gICAgICAgICAgICB0aGlzLm9uQ2xlYXIuZW1pdChldmVudCk7XHJcblx0ICAgICAgICB0aGlzLm9uTW9kZWxDaGFuZ2UodmFsdWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHZhbHVlLmxlbmd0aCA+PSB0aGlzLm1pbkxlbmd0aCkge1xyXG4gICAgICAgICAgICB0aGlzLnRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VhcmNoKGV2ZW50LCB2YWx1ZSk7XHJcbiAgICAgICAgICAgIH0sIHRoaXMuZGVsYXkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5oaWRlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMudXBkYXRlRmlsbGVkU3RhdGUoKTtcclxuICAgICAgICB0aGlzLmlucHV0S2V5RG93biA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIG9uSW5wdXRDbGljayhldmVudDogTW91c2VFdmVudCkge1xyXG4gICAgICAgIGlmICh0aGlzLmRvY3VtZW50Q2xpY2tMaXN0ZW5lcikge1xyXG4gICAgICAgICAgICB0aGlzLmlucHV0Q2xpY2sgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzZWFyY2goZXZlbnQ6IGFueSwgcXVlcnk6IHN0cmluZykge1xyXG4gICAgICAgIC8vYWxsb3cgZW1wdHkgc3RyaW5nIGJ1dCBub3QgdW5kZWZpbmVkIG9yIG51bGxcclxuICAgICAgIGlmIChxdWVyeSA9PT0gdW5kZWZpbmVkIHx8IHF1ZXJ5ID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgfVxyXG5cclxuICAgICAgIHRoaXMubG9hZGluZyA9IHRydWU7XHJcblxyXG4gICAgICAgdGhpcy5jb21wbGV0ZU1ldGhvZC5lbWl0KHtcclxuICAgICAgICAgICBvcmlnaW5hbEV2ZW50OiBldmVudCxcclxuICAgICAgICAgICBxdWVyeTogcXVlcnlcclxuICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHNlbGVjdEl0ZW0ob3B0aW9uOiBhbnksIGZvY3VzOiBib29sZWFuID0gdHJ1ZSkge1xyXG4gICAgICAgIGlmICh0aGlzLmZvcmNlU2VsZWN0aW9uVXBkYXRlTW9kZWxUaW1lb3V0KSB7XHJcbiAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLmZvcmNlU2VsZWN0aW9uVXBkYXRlTW9kZWxUaW1lb3V0KTtcclxuICAgICAgICAgICAgdGhpcy5mb3JjZVNlbGVjdGlvblVwZGF0ZU1vZGVsVGltZW91dCA9IG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5tdWx0aXBsZSkge1xyXG4gICAgICAgICAgICB0aGlzLm11bHRpSW5wdXRFTC5uYXRpdmVFbGVtZW50LnZhbHVlID0gJyc7XHJcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSB0aGlzLnZhbHVlfHxbXTtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmlzU2VsZWN0ZWQob3B0aW9uKSB8fCAhdGhpcy51bmlxdWUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudmFsdWUgPSBbLi4udGhpcy52YWx1ZSxvcHRpb25dO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vbk1vZGVsQ2hhbmdlKHRoaXMudmFsdWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmlucHV0RUwubmF0aXZlRWxlbWVudC52YWx1ZSA9ICB0aGlzLnJlc29sdmVGaWVsZERhdGEob3B0aW9uKTtcclxuICAgICAgICAgICAgdGhpcy52YWx1ZSA9IG9wdGlvbjtcclxuICAgICAgICAgICAgdGhpcy5vbk1vZGVsQ2hhbmdlKHRoaXMudmFsdWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5vblNlbGVjdC5lbWl0KG9wdGlvbik7XHJcbiAgICAgICAgdGhpcy51cGRhdGVGaWxsZWRTdGF0ZSgpO1xyXG5cclxuICAgICAgICBpZiAoZm9jdXMpIHtcclxuICAgICAgICAgICAgdGhpcy5pdGVtQ2xpY2tlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuZm9jdXNJbnB1dCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzaG93KCkge1xyXG4gICAgICAgIGlmICh0aGlzLm11bHRpSW5wdXRFTCB8fCB0aGlzLmlucHV0RUwpIHtcclxuICAgICAgICAgICAgbGV0IGhhc0ZvY3VzID0gdGhpcy5tdWx0aXBsZSA/XHJcbiAgICAgICAgICAgICAgICB0aGlzLm11bHRpSW5wdXRFTC5uYXRpdmVFbGVtZW50Lm93bmVyRG9jdW1lbnQuYWN0aXZlRWxlbWVudCA9PSB0aGlzLm11bHRpSW5wdXRFTC5uYXRpdmVFbGVtZW50IDpcclxuICAgICAgICAgICAgICAgIHRoaXMuaW5wdXRFTC5uYXRpdmVFbGVtZW50Lm93bmVyRG9jdW1lbnQuYWN0aXZlRWxlbWVudCA9PSB0aGlzLmlucHV0RUwubmF0aXZlRWxlbWVudDtcclxuXHJcbiAgICAgICAgICAgIGlmICghdGhpcy5vdmVybGF5VmlzaWJsZSAmJiBoYXNGb2N1cykge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vdmVybGF5VmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgb25PdmVybGF5QW5pbWF0aW9uU3RhcnQoZXZlbnQ6IEFuaW1hdGlvbkV2ZW50KSB7XHJcbiAgICAgICAgc3dpdGNoIChldmVudC50b1N0YXRlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgJ3Zpc2libGUnOlxyXG4gICAgICAgICAgICAgICAgdGhpcy5vdmVybGF5ID0gZXZlbnQuZWxlbWVudDtcclxuICAgICAgICAgICAgICAgIHRoaXMuaXRlbXNXcmFwcGVyID0gdGhpcy52aXJ0dWFsU2Nyb2xsID8gRG9tSGFuZGxlci5maW5kU2luZ2xlKHRoaXMub3ZlcmxheSwgJy5jZGstdmlydHVhbC1zY3JvbGwtdmlld3BvcnQnKSA6IHRoaXMub3ZlcmxheTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYXBwZW5kT3ZlcmxheSgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYXV0b1pJbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3ZlcmxheS5zdHlsZS56SW5kZXggPSBTdHJpbmcodGhpcy5iYXNlWkluZGV4ICsgKCsrRG9tSGFuZGxlci56aW5kZXgpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuYWxpZ25PdmVybGF5KCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJpbmREb2N1bWVudENsaWNrTGlzdGVuZXIoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYmluZERvY3VtZW50UmVzaXplTGlzdGVuZXIoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYmluZFNjcm9sbExpc3RlbmVyKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9uU2hvdy5lbWl0KGV2ZW50KTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICBjYXNlICd2b2lkJzpcclxuICAgICAgICAgICAgICAgIHRoaXMub25PdmVybGF5SGlkZSgpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgYXBwZW5kT3ZlcmxheSgpIHtcclxuICAgICAgICBpZiAodGhpcy5hcHBlbmRUbykge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5hcHBlbmRUbyA9PT0gJ2JvZHknKVxyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLm92ZXJsYXkpO1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICBEb21IYW5kbGVyLmFwcGVuZENoaWxkKHRoaXMub3ZlcmxheSwgdGhpcy5hcHBlbmRUbyk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIXRoaXMub3ZlcmxheS5zdHlsZS5taW5XaWR0aCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vdmVybGF5LnN0eWxlLm1pbldpZHRoID0gRG9tSGFuZGxlci5nZXRXaWR0aCh0aGlzLmVsLm5hdGl2ZUVsZW1lbnQuY2hpbGRyZW5bMF0pICsgJ3B4JztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXNvbHZlRmllbGREYXRhKHZhbHVlKSB7XHJcbiAgICAgICAgbGV0IGRhdGEgPSB0aGlzLmZpZWxkID8gT2JqZWN0VXRpbHMucmVzb2x2ZUZpZWxkRGF0YSh2YWx1ZSwgdGhpcy5maWVsZCkgOiB2YWx1ZTtcclxuICAgICAgICByZXR1cm4gZGF0YSAhPT0gKG51bGwgfHwgdW5kZWZpbmVkKSA/IGRhdGEgOiAnJztcclxuICAgIH1cclxuXHJcbiAgICByZXN0b3JlT3ZlcmxheUFwcGVuZCgpIHtcclxuICAgICAgICBpZiAodGhpcy5vdmVybGF5ICYmIHRoaXMuYXBwZW5kVG8pIHtcclxuICAgICAgICAgICAgdGhpcy5lbC5uYXRpdmVFbGVtZW50LmFwcGVuZENoaWxkKHRoaXMub3ZlcmxheSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGFsaWduT3ZlcmxheSgpIHtcclxuICAgICAgICBpZiAodGhpcy5hcHBlbmRUbylcclxuICAgICAgICAgICAgRG9tSGFuZGxlci5hYnNvbHV0ZVBvc2l0aW9uKHRoaXMub3ZlcmxheSwgKHRoaXMubXVsdGlwbGUgPyB0aGlzLm11bHRpQ29udGFpbmVyRUwubmF0aXZlRWxlbWVudCA6IHRoaXMuaW5wdXRFTC5uYXRpdmVFbGVtZW50KSk7XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICBEb21IYW5kbGVyLnJlbGF0aXZlUG9zaXRpb24odGhpcy5vdmVybGF5LCAodGhpcy5tdWx0aXBsZSA/IHRoaXMubXVsdGlDb250YWluZXJFTC5uYXRpdmVFbGVtZW50IDogdGhpcy5pbnB1dEVMLm5hdGl2ZUVsZW1lbnQpKTtcclxuICAgIH1cclxuXHJcbiAgICBoaWRlKCkge1xyXG4gICAgICAgIHRoaXMub3ZlcmxheVZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmNkLm1hcmtGb3JDaGVjaygpO1xyXG4gICAgfVxyXG5cclxuICAgIGhhbmRsZURyb3Bkb3duQ2xpY2soZXZlbnQpIHtcclxuICAgICAgICBpZiAoIXRoaXMub3ZlcmxheVZpc2libGUpIHtcclxuICAgICAgICAgICAgdGhpcy5mb2N1c0lucHV0KCk7XHJcbiAgICAgICAgICAgIGxldCBxdWVyeVZhbHVlID0gdGhpcy5tdWx0aXBsZSA/IHRoaXMubXVsdGlJbnB1dEVMLm5hdGl2ZUVsZW1lbnQudmFsdWUgOiB0aGlzLmlucHV0RUwubmF0aXZlRWxlbWVudC52YWx1ZTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRyb3Bkb3duTW9kZSA9PT0gJ2JsYW5rJylcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VhcmNoKGV2ZW50LCAnJyk7XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuZHJvcGRvd25Nb2RlID09PSAnY3VycmVudCcpXHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlYXJjaChldmVudCwgcXVlcnlWYWx1ZSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLm9uRHJvcGRvd25DbGljay5lbWl0KHtcclxuICAgICAgICAgICAgICAgIG9yaWdpbmFsRXZlbnQ6IGV2ZW50LFxyXG4gICAgICAgICAgICAgICAgcXVlcnk6IHF1ZXJ5VmFsdWVcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmhpZGUoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZm9jdXNJbnB1dCgpIHtcclxuICAgICAgICBpZiAodGhpcy5tdWx0aXBsZSlcclxuICAgICAgICAgICAgdGhpcy5tdWx0aUlucHV0RUwubmF0aXZlRWxlbWVudC5mb2N1cygpO1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICAgdGhpcy5pbnB1dEVMLm5hdGl2ZUVsZW1lbnQuZm9jdXMoKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXQgZW1wdHlNZXNzYWdlTGFiZWwoKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5lbXB0eU1lc3NhZ2UgfHwgdGhpcy5jb25maWcuZ2V0VHJhbnNsYXRpb24oVHJhbnNsYXRpb25LZXlzLkVNUFRZX01FU1NBR0UpO1xyXG4gICAgfVxyXG5cclxuICAgIHJlbW92ZUl0ZW0oaXRlbTogYW55KSB7XHJcbiAgICAgICAgbGV0IGl0ZW1JbmRleCA9IERvbUhhbmRsZXIuaW5kZXgoaXRlbSk7XHJcbiAgICAgICAgbGV0IHJlbW92ZWRWYWx1ZSA9IHRoaXMudmFsdWVbaXRlbUluZGV4XTtcclxuICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy52YWx1ZS5maWx0ZXIoKHZhbCwgaSkgPT4gaSE9aXRlbUluZGV4KTtcclxuICAgICAgICB0aGlzLm9uTW9kZWxDaGFuZ2UodGhpcy52YWx1ZSk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVGaWxsZWRTdGF0ZSgpO1xyXG4gICAgICAgIHRoaXMub25VbnNlbGVjdC5lbWl0KHJlbW92ZWRWYWx1ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgb25LZXlkb3duKGV2ZW50KSB7XHJcbiAgICAgICAgaWYgKHRoaXMub3ZlcmxheVZpc2libGUpIHtcclxuICAgICAgICAgICAgc3dpdGNoKGV2ZW50LndoaWNoKSB7XHJcbiAgICAgICAgICAgICAgICAvL2Rvd25cclxuICAgICAgICAgICAgICAgIGNhc2UgNDA6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuZ3JvdXApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGhpZ2hsaWdodEl0ZW1JbmRleCA9IHRoaXMuZmluZE9wdGlvbkdyb3VwSW5kZXgodGhpcy5oaWdobGlnaHRPcHRpb24sIHRoaXMuc3VnZ2VzdGlvbnMpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGhpZ2hsaWdodEl0ZW1JbmRleCAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBuZXh0SXRlbUluZGV4ID0gaGlnaGxpZ2h0SXRlbUluZGV4Lml0ZW1JbmRleCArIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV4dEl0ZW1JbmRleCA8ICh0aGlzLmdldE9wdGlvbkdyb3VwQ2hpbGRyZW4odGhpcy5zdWdnZXN0aW9uc1toaWdobGlnaHRJdGVtSW5kZXguZ3JvdXBJbmRleF0pLmxlbmd0aCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmhpZ2hsaWdodE9wdGlvbiA9IHRoaXMuZ2V0T3B0aW9uR3JvdXBDaGlsZHJlbih0aGlzLnN1Z2dlc3Rpb25zW2hpZ2hsaWdodEl0ZW1JbmRleC5ncm91cEluZGV4XSlbbmV4dEl0ZW1JbmRleF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5oaWdobGlnaHRPcHRpb25DaGFuZ2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuc3VnZ2VzdGlvbnNbaGlnaGxpZ2h0SXRlbUluZGV4Lmdyb3VwSW5kZXggKyAxXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0T3B0aW9uID0gdGhpcy5nZXRPcHRpb25Hcm91cENoaWxkcmVuKHRoaXMuc3VnZ2VzdGlvbnNbaGlnaGxpZ2h0SXRlbUluZGV4Lmdyb3VwSW5kZXggKyAxXSlbMF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5oaWdobGlnaHRPcHRpb25DaGFuZ2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0T3B0aW9uID0gdGhpcy5nZXRPcHRpb25Hcm91cENoaWxkcmVuKHRoaXMuc3VnZ2VzdGlvbnNbMF0pWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaGlnaGxpZ2h0SXRlbUluZGV4ID0gdGhpcy5maW5kT3B0aW9uSW5kZXgodGhpcy5oaWdobGlnaHRPcHRpb24sIHRoaXMuc3VnZ2VzdGlvbnMpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGhpZ2hsaWdodEl0ZW1JbmRleCAhPSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5leHRJdGVtSW5kZXggPSBoaWdobGlnaHRJdGVtSW5kZXggKyAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5leHRJdGVtSW5kZXggIT0gKHRoaXMuc3VnZ2VzdGlvbnMubGVuZ3RoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0T3B0aW9uID0gdGhpcy5zdWdnZXN0aW9uc1tuZXh0SXRlbUluZGV4XTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmhpZ2hsaWdodE9wdGlvbkNoYW5nZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5oaWdobGlnaHRPcHRpb24gPSB0aGlzLnN1Z2dlc3Rpb25zWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICAgICAgLy91cFxyXG4gICAgICAgICAgICAgICAgY2FzZSAzODpcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5ncm91cCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgaGlnaGxpZ2h0SXRlbUluZGV4ID0gdGhpcy5maW5kT3B0aW9uR3JvdXBJbmRleCh0aGlzLmhpZ2hsaWdodE9wdGlvbiwgdGhpcy5zdWdnZXN0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChoaWdobGlnaHRJdGVtSW5kZXggIT09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgcHJldkl0ZW1JbmRleCA9IGhpZ2hsaWdodEl0ZW1JbmRleC5pdGVtSW5kZXggLSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByZXZJdGVtSW5kZXggPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaGlnaGxpZ2h0T3B0aW9uID0gdGhpcy5nZXRPcHRpb25Hcm91cENoaWxkcmVuKHRoaXMuc3VnZ2VzdGlvbnNbaGlnaGxpZ2h0SXRlbUluZGV4Lmdyb3VwSW5kZXhdKVtwcmV2SXRlbUluZGV4XTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmhpZ2hsaWdodE9wdGlvbkNoYW5nZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAocHJldkl0ZW1JbmRleCA8IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgcHJldkdyb3VwID0gdGhpcy5zdWdnZXN0aW9uc1toaWdobGlnaHRJdGVtSW5kZXguZ3JvdXBJbmRleCAtIDFdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwcmV2R3JvdXApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5oaWdobGlnaHRPcHRpb24gPSB0aGlzLmdldE9wdGlvbkdyb3VwQ2hpbGRyZW4ocHJldkdyb3VwKVt0aGlzLmdldE9wdGlvbkdyb3VwQ2hpbGRyZW4ocHJldkdyb3VwKS5sZW5ndGggLSAxXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5oaWdobGlnaHRPcHRpb25DaGFuZ2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBoaWdobGlnaHRJdGVtSW5kZXggPSB0aGlzLmZpbmRPcHRpb25JbmRleCh0aGlzLmhpZ2hsaWdodE9wdGlvbiwgdGhpcy5zdWdnZXN0aW9ucyk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaGlnaGxpZ2h0SXRlbUluZGV4ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHByZXZJdGVtSW5kZXggPSBoaWdobGlnaHRJdGVtSW5kZXggLSAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5oaWdobGlnaHRPcHRpb24gPSB0aGlzLnN1Z2dlc3Rpb25zW3ByZXZJdGVtSW5kZXhdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5oaWdobGlnaHRPcHRpb25DaGFuZ2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vZW50ZXJcclxuICAgICAgICAgICAgICAgIGNhc2UgMTM6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuaGlnaGxpZ2h0T3B0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0SXRlbSh0aGlzLmhpZ2hsaWdodE9wdGlvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICAgICAgLy9lc2NhcGVcclxuICAgICAgICAgICAgICAgIGNhc2UgMjc6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuXHJcbiAgICAgICAgICAgICAgICAvL3RhYlxyXG4gICAgICAgICAgICAgICAgY2FzZSA5OlxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmhpZ2hsaWdodE9wdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdEl0ZW0odGhpcy5oaWdobGlnaHRPcHRpb24pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKGV2ZW50LndoaWNoID09PSA0MCAmJiB0aGlzLnN1Z2dlc3Rpb25zKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNlYXJjaChldmVudCxldmVudC50YXJnZXQudmFsdWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5tdWx0aXBsZSkge1xyXG4gICAgICAgICAgICBzd2l0Y2goZXZlbnQud2hpY2gpIHtcclxuICAgICAgICAgICAgICAgIC8vYmFja3NwYWNlXHJcbiAgICAgICAgICAgICAgICBjYXNlIDg6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMudmFsdWUgJiYgdGhpcy52YWx1ZS5sZW5ndGggJiYgIXRoaXMubXVsdGlJbnB1dEVMLm5hdGl2ZUVsZW1lbnQudmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy52YWx1ZSA9IFsuLi50aGlzLnZhbHVlXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVtb3ZlZFZhbHVlID0gdGhpcy52YWx1ZS5wb3AoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbk1vZGVsQ2hhbmdlKHRoaXMudmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUZpbGxlZFN0YXRlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMub25VbnNlbGVjdC5lbWl0KHJlbW92ZWRWYWx1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuaW5wdXRLZXlEb3duID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBvbktleXVwKGV2ZW50KSB7XHJcbiAgICAgICAgdGhpcy5vbktleVVwLmVtaXQoZXZlbnQpO1xyXG4gICAgfVxyXG5cclxuICAgIG9uSW5wdXRGb2N1cyhldmVudCkge1xyXG4gICAgICAgIGlmICghdGhpcy5pdGVtQ2xpY2tlZCAmJiB0aGlzLmNvbXBsZXRlT25Gb2N1cyApIHtcclxuICAgICAgICAgICAgbGV0IHF1ZXJ5VmFsdWUgPSB0aGlzLm11bHRpcGxlID8gdGhpcy5tdWx0aUlucHV0RUwubmF0aXZlRWxlbWVudC52YWx1ZSA6IHRoaXMuaW5wdXRFTC5uYXRpdmVFbGVtZW50LnZhbHVlO1xyXG4gICAgICAgICAgICB0aGlzLnNlYXJjaChldmVudCwgcXVlcnlWYWx1ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmZvY3VzID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLm9uRm9jdXMuZW1pdChldmVudCk7XHJcbiAgICAgICAgdGhpcy5pdGVtQ2xpY2tlZCA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIG9uSW5wdXRCbHVyKGV2ZW50KSB7XHJcbiAgICAgICAgdGhpcy5mb2N1cyA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMub25Nb2RlbFRvdWNoZWQoKTtcclxuICAgICAgICB0aGlzLm9uQmx1ci5lbWl0KGV2ZW50KTtcclxuICAgIH1cclxuXHJcbiAgICBvbklucHV0Q2hhbmdlKGV2ZW50KSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZm9yY2VTZWxlY3Rpb24pIHtcclxuICAgICAgICAgICAgbGV0IHZhbGlkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGxldCBpbnB1dFZhbHVlID0gZXZlbnQudGFyZ2V0LnZhbHVlLnRyaW0oKTtcclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLnN1Z2dlc3Rpb25zKSAge1xyXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgc3VnZ2VzdGlvbiBvZiB0aGlzLnN1Z2dlc3Rpb25zKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGl0ZW1WYWx1ZSA9IHRoaXMuZmllbGQgPyBPYmplY3RVdGlscy5yZXNvbHZlRmllbGREYXRhKHN1Z2dlc3Rpb24sIHRoaXMuZmllbGQpIDogc3VnZ2VzdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbVZhbHVlICYmIGlucHV0VmFsdWUgPT09IGl0ZW1WYWx1ZS50cmltKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZvcmNlU2VsZWN0aW9uVXBkYXRlTW9kZWxUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdEl0ZW0oc3VnZ2VzdGlvbiwgZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCAyNTApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghdmFsaWQpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm11bHRpcGxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tdWx0aUlucHV0RUwubmF0aXZlRWxlbWVudC52YWx1ZSA9ICcnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy52YWx1ZSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnB1dEVMLm5hdGl2ZUVsZW1lbnQudmFsdWUgPSAnJztcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLm9uQ2xlYXIuZW1pdChldmVudCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9uTW9kZWxDaGFuZ2UodGhpcy52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZUZpbGxlZFN0YXRlKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgb25JbnB1dFBhc3RlKGV2ZW50OiBDbGlwYm9hcmRFdmVudCkge1xyXG4gICAgICAgIHRoaXMub25LZXlkb3duKGV2ZW50KTtcclxuICAgIH1cclxuXHJcbiAgICBpc1NlbGVjdGVkKHZhbDogYW55KTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IHNlbGVjdGVkOiBib29sZWFuID0gZmFsc2U7XHJcbiAgICAgICAgaWYgKHRoaXMudmFsdWUgJiYgdGhpcy52YWx1ZS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnZhbHVlLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoT2JqZWN0VXRpbHMuZXF1YWxzKHRoaXMudmFsdWVbaV0sIHZhbCwgdGhpcy5kYXRhS2V5KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc2VsZWN0ZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgZmluZE9wdGlvbkluZGV4KG9wdGlvbiwgc3VnZ2VzdGlvbnMpOiBudW1iZXIge1xyXG4gICAgICAgIGxldCBpbmRleDogbnVtYmVyID0gLTE7XHJcbiAgICAgICAgaWYgKHN1Z2dlc3Rpb25zKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3VnZ2VzdGlvbnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGlmIChPYmplY3RVdGlscy5lcXVhbHMob3B0aW9uLCBzdWdnZXN0aW9uc1tpXSkpIHtcclxuICAgICAgICAgICAgICAgICAgICBpbmRleCA9IGk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBpbmRleDtcclxuICAgIH1cclxuXHJcbiAgICBmaW5kT3B0aW9uR3JvdXBJbmRleCh2YWw6IGFueSwgb3B0czogYW55W10pOiBhbnkge1xyXG4gICAgICAgIGxldCBncm91cEluZGV4LCBpdGVtSW5kZXg7XHJcblxyXG4gICAgICAgIGlmIChvcHRzKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3B0cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgZ3JvdXBJbmRleCA9IGk7XHJcbiAgICAgICAgICAgICAgICBpdGVtSW5kZXggPSB0aGlzLmZpbmRPcHRpb25JbmRleCh2YWwsIHRoaXMuZ2V0T3B0aW9uR3JvdXBDaGlsZHJlbihvcHRzW2ldKSk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGl0ZW1JbmRleCAhPT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGl0ZW1JbmRleCAhPT0gLTEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtncm91cEluZGV4OiBncm91cEluZGV4LCBpdGVtSW5kZXg6IGl0ZW1JbmRleH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gLTE7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZUZpbGxlZFN0YXRlKCkge1xyXG4gICAgICAgIGlmICh0aGlzLm11bHRpcGxlKVxyXG4gICAgICAgICAgICB0aGlzLmZpbGxlZCA9ICh0aGlzLnZhbHVlICYmIHRoaXMudmFsdWUubGVuZ3RoKSB8fMKgKHRoaXMubXVsdGlJbnB1dEVMICYmIHRoaXMubXVsdGlJbnB1dEVMLm5hdGl2ZUVsZW1lbnQgJiYgdGhpcy5tdWx0aUlucHV0RUwubmF0aXZlRWxlbWVudC52YWx1ZSAhPSAnJyk7XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB0aGlzLmZpbGxlZCA9ICh0aGlzLmlucHV0RmllbGRWYWx1ZSAmJiB0aGlzLmlucHV0RmllbGRWYWx1ZSAhPSAnJykgfHzCoCh0aGlzLmlucHV0RUwgJiYgdGhpcy5pbnB1dEVMLm5hdGl2ZUVsZW1lbnQgJiYgdGhpcy5pbnB1dEVMLm5hdGl2ZUVsZW1lbnQudmFsdWUgIT0gJycpOztcclxuICAgIH1cclxuXHJcbiAgICB1cGRhdGVJbnB1dEZpZWxkKCkge1xyXG4gICAgICAgIGxldCBmb3JtYXR0ZWRWYWx1ZSA9IHRoaXMucmVzb2x2ZUZpZWxkRGF0YSh0aGlzLnZhbHVlKTtcclxuICAgICAgICB0aGlzLmlucHV0RmllbGRWYWx1ZSA9IGZvcm1hdHRlZFZhbHVlO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5pbnB1dEVMICYmIHRoaXMuaW5wdXRFTC5uYXRpdmVFbGVtZW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5wdXRFTC5uYXRpdmVFbGVtZW50LnZhbHVlID0gZm9ybWF0dGVkVmFsdWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZUZpbGxlZFN0YXRlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgYmluZERvY3VtZW50Q2xpY2tMaXN0ZW5lcigpIHtcclxuICAgICAgICBpZiAoIXRoaXMuZG9jdW1lbnRDbGlja0xpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRvY3VtZW50VGFyZ2V0OiBhbnkgPSB0aGlzLmVsID8gdGhpcy5lbC5uYXRpdmVFbGVtZW50Lm93bmVyRG9jdW1lbnQgOiAnZG9jdW1lbnQnO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5kb2N1bWVudENsaWNrTGlzdGVuZXIgPSB0aGlzLnJlbmRlcmVyLmxpc3Rlbihkb2N1bWVudFRhcmdldCwgJ2NsaWNrJywgKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQud2hpY2ggPT09IDMpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmlucHV0Q2xpY2sgJiYgIXRoaXMuaXNEcm9wZG93bkNsaWNrKGV2ZW50KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMuaW5wdXRDbGljayA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jZC5tYXJrRm9yQ2hlY2soKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlzRHJvcGRvd25DbGljayhldmVudCkge1xyXG4gICAgICAgIGlmICh0aGlzLmRyb3Bkb3duKSB7XHJcbiAgICAgICAgICAgIGxldCB0YXJnZXQgPSBldmVudC50YXJnZXQ7XHJcbiAgICAgICAgICAgIHJldHVybiAodGFyZ2V0ID09PSB0aGlzLmRyb3Bkb3duQnV0dG9uLm5hdGl2ZUVsZW1lbnQgfHwgdGFyZ2V0LnBhcmVudE5vZGUgPT09IHRoaXMuZHJvcGRvd25CdXR0b24ubmF0aXZlRWxlbWVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHVuYmluZERvY3VtZW50Q2xpY2tMaXN0ZW5lcigpIHtcclxuICAgICAgICBpZiAodGhpcy5kb2N1bWVudENsaWNrTGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5kb2N1bWVudENsaWNrTGlzdGVuZXIoKTtcclxuICAgICAgICAgICAgdGhpcy5kb2N1bWVudENsaWNrTGlzdGVuZXIgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBiaW5kRG9jdW1lbnRSZXNpemVMaXN0ZW5lcigpIHtcclxuICAgICAgICB0aGlzLmRvY3VtZW50UmVzaXplTGlzdGVuZXIgPSB0aGlzLm9uV2luZG93UmVzaXplLmJpbmQodGhpcyk7XHJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMuZG9jdW1lbnRSZXNpemVMaXN0ZW5lcik7XHJcbiAgICB9XHJcblxyXG4gICAgdW5iaW5kRG9jdW1lbnRSZXNpemVMaXN0ZW5lcigpIHtcclxuICAgICAgICBpZiAodGhpcy5kb2N1bWVudFJlc2l6ZUxpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLmRvY3VtZW50UmVzaXplTGlzdGVuZXIpO1xyXG4gICAgICAgICAgICB0aGlzLmRvY3VtZW50UmVzaXplTGlzdGVuZXIgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBvbldpbmRvd1Jlc2l6ZSgpIHtcclxuICAgICAgICB0aGlzLmhpZGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBiaW5kU2Nyb2xsTGlzdGVuZXIoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLnNjcm9sbEhhbmRsZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5zY3JvbGxIYW5kbGVyID0gbmV3IENvbm5lY3RlZE92ZXJsYXlTY3JvbGxIYW5kbGVyKHRoaXMuY29udGFpbmVyRUwubmF0aXZlRWxlbWVudCwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3ZlcmxheVZpc2libGUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnNjcm9sbEhhbmRsZXIuYmluZFNjcm9sbExpc3RlbmVyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgdW5iaW5kU2Nyb2xsTGlzdGVuZXIoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuc2Nyb2xsSGFuZGxlcikge1xyXG4gICAgICAgICAgICB0aGlzLnNjcm9sbEhhbmRsZXIudW5iaW5kU2Nyb2xsTGlzdGVuZXIoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgb25PdmVybGF5SGlkZSgpIHtcclxuICAgICAgICB0aGlzLnVuYmluZERvY3VtZW50Q2xpY2tMaXN0ZW5lcigpO1xyXG4gICAgICAgIHRoaXMudW5iaW5kRG9jdW1lbnRSZXNpemVMaXN0ZW5lcigpO1xyXG4gICAgICAgIHRoaXMudW5iaW5kU2Nyb2xsTGlzdGVuZXIoKTtcclxuICAgICAgICB0aGlzLm92ZXJsYXkgPSBudWxsO1xyXG4gICAgICAgIHRoaXMub25IaWRlLmVtaXQoKTtcclxuICAgIH1cclxuXHJcbiAgICBuZ09uRGVzdHJveSgpIHtcclxuICAgICAgICBpZiAodGhpcy5mb3JjZVNlbGVjdGlvblVwZGF0ZU1vZGVsVGltZW91dCkge1xyXG4gICAgICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5mb3JjZVNlbGVjdGlvblVwZGF0ZU1vZGVsVGltZW91dCk7XHJcbiAgICAgICAgICAgIHRoaXMuZm9yY2VTZWxlY3Rpb25VcGRhdGVNb2RlbFRpbWVvdXQgPSBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuc2Nyb2xsSGFuZGxlcikge1xyXG4gICAgICAgICAgICB0aGlzLnNjcm9sbEhhbmRsZXIuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICB0aGlzLnNjcm9sbEhhbmRsZXIgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnJlc3RvcmVPdmVybGF5QXBwZW5kKCk7XHJcbiAgICAgICAgdGhpcy5vbk92ZXJsYXlIaWRlKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbkBOZ01vZHVsZSh7XHJcbiAgICBpbXBvcnRzOiBbQ29tbW9uTW9kdWxlLElucHV0VGV4dE1vZHVsZSxCdXR0b25Nb2R1bGUsU2hhcmVkTW9kdWxlLFJpcHBsZU1vZHVsZSxTY3JvbGxpbmdNb2R1bGVdLFxyXG4gICAgZXhwb3J0czogW0F1dG9Db21wbGV0ZSxTaGFyZWRNb2R1bGUsU2Nyb2xsaW5nTW9kdWxlXSxcclxuICAgIGRlY2xhcmF0aW9uczogW0F1dG9Db21wbGV0ZV1cclxufSlcclxuZXhwb3J0IGNsYXNzIEF1dG9Db21wbGV0ZU1vZHVsZSB7IH1cclxuIl19