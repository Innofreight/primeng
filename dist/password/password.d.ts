import { ElementRef, OnDestroy, DoCheck, NgZone, OnInit, QueryList, TemplateRef, AfterContentInit, ChangeDetectorRef } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
export declare class PasswordDirective implements OnDestroy, DoCheck {
    el: ElementRef;
    zone: NgZone;
    promptLabel: string;
    weakLabel: string;
    mediumLabel: string;
    strongLabel: string;
    feedback: boolean;
    set showPassword(show: boolean);
    panel: HTMLDivElement;
    meter: any;
    info: any;
    filled: boolean;
    scrollHandler: any;
    documentResizeListener: any;
    constructor(el: ElementRef, zone: NgZone);
    ngDoCheck(): void;
    onInput(e: any): void;
    updateFilledState(): void;
    createPanel(): void;
    showOverlay(): void;
    hideOverlay(): void;
    onFocus(): void;
    onBlur(): void;
    onKeyup(e: any): void;
    testStrength(str: string): number;
    normalize(x: any, y: any): number;
    get disabled(): boolean;
    bindScrollListener(): void;
    unbindScrollListener(): void;
    bindDocumentResizeListener(): void;
    unbindDocumentResizeListener(): void;
    onWindowResize(): void;
    ngOnDestroy(): void;
}
export declare const Password_VALUE_ACCESSOR: any;
export declare class Password implements AfterContentInit, OnInit {
    private cd;
    private config;
    disabled: boolean;
    promptLabel: string;
    mediumRegex: string;
    strongRegex: string;
    weakLabel: string;
    mediumLabel: string;
    strongLabel: string;
    inputId: string;
    feedback: boolean;
    appendTo: any;
    toggleMask: boolean;
    inputStyleClass: string;
    styleClass: string;
    style: any;
    inputStyle: any;
    showTransitionOptions: string;
    hideTransitionOptions: string;
    placeholder: string;
    input: ElementRef;
    contentTemplate: TemplateRef<any>;
    footerTemplate: TemplateRef<any>;
    headerTemplate: TemplateRef<any>;
    templates: QueryList<any>;
    overlayVisible: boolean;
    meter: any;
    infoText: string;
    focused: boolean;
    unmasked: boolean;
    mediumCheckRegExp: any;
    strongCheckRegExp: any;
    resizeListener: any;
    outsideClickListener: any;
    scrollHandler: any;
    overlay: any;
    value: string;
    onModelChange: Function;
    onModelTouched: Function;
    constructor(cd: ChangeDetectorRef, config: PrimeNGConfig);
    ngAfterContentInit(): void;
    ngOnInit(): void;
    onAnimationStart(event: any): void;
    appendContainer(): void;
    alignOverlay(): void;
    onInput(event: any): void;
    onFocus(): void;
    onBlur(): void;
    onKeyUp(event: any): void;
    updateUI(value: any): void;
    onMaskToggle(): void;
    testStrength(str: any): number;
    writeValue(value: any): void;
    registerOnChange(fn: Function): void;
    registerOnTouched(fn: Function): void;
    setDisabledState(val: boolean): void;
    bindScrollListener(): void;
    bindResizeListener(): void;
    unbindScrollListener(): void;
    unbindResizeListener(): void;
    unbindOutsideClickListener(): void;
    containerClass(): {
        'p-password p-component p-inputwrapper': boolean;
        'p-input-icon-right': boolean;
    };
    inputFieldClass(): {
        'p-password-input': boolean;
        'p-disabled': boolean;
    };
    toggleIconClass(): "pi pi-eye-slash" | "pi pi-eye";
    strengthClass(): string;
    filled(): boolean;
    promptText(): any;
    weakText(): any;
    mediumText(): any;
    strongText(): any;
    restoreAppend(): void;
    inputType(): "text" | "password";
    getTranslation(option: string): any;
    ngOnDestroy(): void;
}
export declare class PasswordModule {
}
