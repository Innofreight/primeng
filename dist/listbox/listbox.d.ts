import { ElementRef, EventEmitter, AfterContentInit, QueryList, TemplateRef, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { FilterService, PrimeNGConfig } from 'primeng/api';
import { ControlValueAccessor } from '@angular/forms';
import { Subscription } from 'rxjs';
export declare const LISTBOX_VALUE_ACCESSOR: any;
export declare class Listbox implements AfterContentInit, OnInit, ControlValueAccessor, OnDestroy {
    el: ElementRef;
    cd: ChangeDetectorRef;
    filterService: FilterService;
    config: PrimeNGConfig;
    multiple: boolean;
    style: any;
    styleClass: string;
    listStyle: any;
    listStyleClass: string;
    readonly: boolean;
    disabled: boolean;
    checkbox: boolean;
    filter: boolean;
    filterMatchMode: string;
    filterLocale: string;
    metaKeySelection: boolean;
    dataKey: string;
    showToggleAll: boolean;
    optionLabel: string;
    optionValue: string;
    optionGroupChildren: string;
    optionGroupLabel: string;
    optionDisabled: string;
    ariaFilterLabel: string;
    filterPlaceHolder: string;
    emptyFilterMessage: string;
    emptyMessage: string;
    group: boolean;
    onChange: EventEmitter<any>;
    onClick: EventEmitter<any>;
    onDblClick: EventEmitter<any>;
    headerCheckboxViewChild: ElementRef;
    headerFacet: any;
    footerFacet: any;
    templates: QueryList<any>;
    _options: any[];
    itemTemplate: TemplateRef<any>;
    groupTemplate: TemplateRef<any>;
    headerTemplate: TemplateRef<any>;
    footerTemplate: TemplateRef<any>;
    emptyFilterTemplate: TemplateRef<any>;
    emptyTemplate: TemplateRef<any>;
    _filterValue: string;
    _filteredOptions: any[];
    filtered: boolean;
    value: any;
    onModelChange: Function;
    onModelTouched: Function;
    optionTouched: boolean;
    focus: boolean;
    headerCheckboxFocus: boolean;
    translationSubscription: Subscription;
    constructor(el: ElementRef, cd: ChangeDetectorRef, filterService: FilterService, config: PrimeNGConfig);
    get options(): any[];
    set options(val: any[]);
    get filterValue(): string;
    set filterValue(val: string);
    ngOnInit(): void;
    ngAfterContentInit(): void;
    getOptionLabel(option: any): any;
    getOptionGroupChildren(optionGroup: any): any;
    getOptionGroupLabel(optionGroup: any): any;
    getOptionValue(option: any): any;
    isOptionDisabled(option: any): any;
    writeValue(value: any): void;
    registerOnChange(fn: Function): void;
    registerOnTouched(fn: Function): void;
    setDisabledState(val: boolean): void;
    onOptionClick(event: Event, option: any): void;
    onOptionTouchEnd(option: any): void;
    onOptionDoubleClick(event: Event, option: any): any;
    onOptionClickSingle(event: any, option: any): void;
    onOptionClickMultiple(event: any, option: any): void;
    onOptionClickCheckbox(event: any, option: any): void;
    removeOption(option: any): void;
    isSelected(option: any): boolean;
    get allChecked(): boolean;
    get optionsToRender(): any[];
    get emptyMessageLabel(): string;
    get emptyFilterMessageLabel(): string;
    hasFilter(): boolean;
    isEmpty(optionsToDisplay: any): boolean;
    onFilter(event: KeyboardEvent): void;
    activateFilter(): void;
    get toggleAllDisabled(): boolean;
    toggleAll(event: any): void;
    checkAll(): void;
    uncheckAll(): void;
    onOptionKeyDown(event: KeyboardEvent, option: any): void;
    findNextItem(item: any): any;
    findPrevItem(item: any): any;
    onHeaderCheckboxFocus(): void;
    onHeaderCheckboxBlur(): void;
    ngOnDestroy(): void;
}
export declare class ListboxModule {
}