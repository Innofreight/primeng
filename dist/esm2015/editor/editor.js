import { NgModule, Component, ElementRef, Input, Output, EventEmitter, ContentChild, forwardRef, ChangeDetectionStrategy, ViewEncapsulation, ContentChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule, Header, PrimeTemplate } from 'primeng/api';
import { DomHandler } from 'primeng/dom';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import * as Quill from "quill";
export const EDITOR_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => Editor),
    multi: true
};
export class Editor {
    constructor(el) {
        this.el = el;
        this.onTextChange = new EventEmitter();
        this.onSelectionChange = new EventEmitter();
        this.onInit = new EventEmitter();
        this.onModelChange = () => { };
        this.onModelTouched = () => { };
    }
    ngAfterViewInit() {
        let editorElement = DomHandler.findSingle(this.el.nativeElement, 'div.p-editor-content');
        let toolbarElement = DomHandler.findSingle(this.el.nativeElement, 'div.p-editor-toolbar');
        let defaultModule = { toolbar: toolbarElement };
        let modules = this.modules ? Object.assign(Object.assign({}, defaultModule), this.modules) : defaultModule;
        this.quill = new Quill(editorElement, {
            modules: modules,
            placeholder: this.placeholder,
            readOnly: this.readonly,
            theme: 'snow',
            formats: this.formats,
            bounds: this.bounds,
            debug: this.debug,
            scrollingContainer: this.scrollingContainer
        });
        if (this.value) {
            this.quill.setContents(this.quill.clipboard.convert(this.value));
        }
        this.quill.on('text-change', (delta, oldContents, source) => {
            if (source === 'user') {
                let html = DomHandler.findSingle(editorElement, '.ql-editor').innerHTML;
                let text = this.quill.getText().trim();
                if (html === '<p><br></p>') {
                    html = null;
                }
                this.onTextChange.emit({
                    htmlValue: html,
                    textValue: text,
                    delta: delta,
                    source: source
                });
                this.onModelChange(html);
                this.onModelTouched();
            }
        });
        this.quill.on('selection-change', (range, oldRange, source) => {
            this.onSelectionChange.emit({
                range: range,
                oldRange: oldRange,
                source: source
            });
        });
        this.onInit.emit({
            editor: this.quill
        });
    }
    ngAfterContentInit() {
        this.templates.forEach((item) => {
            switch (item.getType()) {
                case 'header':
                    this.headerTemplate = item.template;
                    break;
            }
        });
    }
    writeValue(value) {
        this.value = value;
        if (this.quill) {
            if (value)
                this.quill.setContents(this.quill.clipboard.convert(value));
            else
                this.quill.setText('');
        }
    }
    registerOnChange(fn) {
        this.onModelChange = fn;
    }
    registerOnTouched(fn) {
        this.onModelTouched = fn;
    }
    getQuill() {
        return this.quill;
    }
    get readonly() {
        return this._readonly;
    }
    set readonly(val) {
        this._readonly = val;
        if (this.quill) {
            if (this._readonly)
                this.quill.disable();
            else
                this.quill.enable();
        }
    }
}
Editor.decorators = [
    { type: Component, args: [{
                selector: 'p-editor',
                template: `
        <div [ngClass]="'p-editor-container'" [class]="styleClass">
            <div class="p-editor-toolbar" *ngIf="toolbar || headerTemplate">
                <ng-content select="p-header"></ng-content>
                <ng-container *ngTemplateOutlet="headerTemplate"></ng-container>
            </div>
            <div class="p-editor-toolbar" *ngIf="!toolbar && !headerTemplate">
                <span class="ql-formats">
                    <select class="ql-header">
                      <option value="1">Heading</option>
                      <option value="2">Subheading</option>
                      <option selected>Normal</option>
                    </select>
                    <select class="ql-font">
                      <option selected>Sans Serif</option>
                      <option value="serif">Serif</option>
                      <option value="monospace">Monospace</option>
                    </select>
                </span>
                <span class="ql-formats">
                    <button class="ql-bold" aria-label="Bold" type="button"></button>
                    <button class="ql-italic" aria-label="Italic" type="button"></button>
                    <button class="ql-underline" aria-label="Underline" type="button"></button>
                </span>
                <span class="ql-formats">
                    <select class="ql-color"></select>
                    <select class="ql-background"></select>
                </span>
                <span class="ql-formats">
                    <button class="ql-list" value="ordered" aria-label="Ordered List" type="button"></button>
                    <button class="ql-list" value="bullet" aria-label="Unordered List" type="button"></button>
                    <select class="ql-align">
                        <option selected></option>
                        <option value="center"></option>
                        <option value="right"></option>
                        <option value="justify"></option>
                    </select>
                </span>
                <span class="ql-formats">
                    <button class="ql-link" aria-label="Insert Link" type="button"></button>
                    <button class="ql-image" aria-label="Insert Image" type="button"></button>
                    <button class="ql-code-block" aria-label="Insert Code Block" type="button"></button>
                </span>
                <span class="ql-formats">
                    <button class="ql-clean" aria-label="Remove Styles" type="button"></button>
                </span>
            </div>
            <div class="p-editor-content" [ngStyle]="style"></div>
        </div>
    `,
                providers: [EDITOR_VALUE_ACCESSOR],
                changeDetection: ChangeDetectionStrategy.OnPush,
                encapsulation: ViewEncapsulation.None,
                styles: [".p-editor-container .p-editor-toolbar.ql-snow .ql-picker.ql-expanded .ql-picker-options .ql-picker-item{height:auto;width:auto}"]
            },] }
];
Editor.ctorParameters = () => [
    { type: ElementRef }
];
Editor.propDecorators = {
    onTextChange: [{ type: Output }],
    onSelectionChange: [{ type: Output }],
    toolbar: [{ type: ContentChild, args: [Header,] }],
    style: [{ type: Input }],
    styleClass: [{ type: Input }],
    placeholder: [{ type: Input }],
    formats: [{ type: Input }],
    modules: [{ type: Input }],
    bounds: [{ type: Input }],
    scrollingContainer: [{ type: Input }],
    debug: [{ type: Input }],
    onInit: [{ type: Output }],
    templates: [{ type: ContentChildren, args: [PrimeTemplate,] }],
    readonly: [{ type: Input }]
};
export class EditorModule {
}
EditorModule.decorators = [
    { type: NgModule, args: [{
                imports: [CommonModule],
                exports: [Editor, SharedModule],
                declarations: [Editor]
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWRpdG9yLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLy4uL3NyYy9hcHAvY29tcG9uZW50cy9lZGl0b3IvIiwic291cmNlcyI6WyJlZGl0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFFBQVEsRUFBQyxTQUFTLEVBQUMsVUFBVSxFQUFlLEtBQUssRUFBQyxNQUFNLEVBQUMsWUFBWSxFQUFDLFlBQVksRUFBQyxVQUFVLEVBQUMsdUJBQXVCLEVBQUUsaUJBQWlCLEVBQUUsZUFBZSxFQUEyQyxNQUFNLGVBQWUsQ0FBQztBQUNsTyxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDN0MsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLEVBQUUsYUFBYSxFQUFDLE1BQU0sYUFBYSxDQUFBO0FBQzlELE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDdkMsT0FBTyxFQUFDLGlCQUFpQixFQUF1QixNQUFNLGdCQUFnQixDQUFDO0FBQ3ZFLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFDO0FBRS9CLE1BQU0sQ0FBQyxNQUFNLHFCQUFxQixHQUFRO0lBQ3hDLE9BQU8sRUFBRSxpQkFBaUI7SUFDMUIsV0FBVyxFQUFFLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUM7SUFDckMsS0FBSyxFQUFFLElBQUk7Q0FDWixDQUFDO0FBMkRGLE1BQU0sT0FBTyxNQUFNO0lBd0NmLFlBQW1CLEVBQWM7UUFBZCxPQUFFLEdBQUYsRUFBRSxDQUFZO1FBdEN2QixpQkFBWSxHQUFzQixJQUFJLFlBQVksRUFBRSxDQUFDO1FBRXJELHNCQUFpQixHQUFzQixJQUFJLFlBQVksRUFBRSxDQUFDO1FBb0IxRCxXQUFNLEdBQXNCLElBQUksWUFBWSxFQUFFLENBQUM7UUFRekQsa0JBQWEsR0FBYSxHQUFHLEVBQUUsR0FBRSxDQUFDLENBQUM7UUFFbkMsbUJBQWMsR0FBYSxHQUFHLEVBQUUsR0FBRSxDQUFDLENB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Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0tBaURUO2dCQUNELFNBQVMsRUFBRSxDQUFDLHFCQUFxQixDQUFDO2dCQUNsQyxlQUFlLEVBQUUsdUJBQXVCLENBQUMsTUFBTTtnQkFFL0MsYUFBYSxFQUFFLGlCQUFpQixDQUFDLElBQUk7O2FBQ3hDOzs7WUFyRTBCLFVBQVU7OzsyQkF3RWhDLE1BQU07Z0NBRU4sTUFBTTtzQkFFTixZQUFZLFNBQUMsTUFBTTtvQkFFbkIsS0FBSzt5QkFFTCxLQUFLOzBCQUVMLEtBQUs7c0JBRUwsS0FBSztzQkFFTCxLQUFLO3FCQUVMLEtBQUs7aUNBRUwsS0FBSztvQkFFTCxLQUFLO3FCQUVMLE1BQU07d0JBRU4sZUFBZSxTQUFDLGFBQWE7dUJBdUc3QixLQUFLOztBQXFCVixNQUFNLE9BQU8sWUFBWTs7O1lBTHhCLFFBQVEsU0FBQztnQkFDTixPQUFPLEVBQUUsQ0FBQyxZQUFZLENBQUM7Z0JBQ3ZCLE9BQU8sRUFBRSxDQUFDLE1BQU0sRUFBQyxZQUFZLENBQUM7Z0JBQzlCLFlBQVksRUFBRSxDQUFDLE1BQU0sQ0FBQzthQUN6QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TmdNb2R1bGUsQ29tcG9uZW50LEVsZW1lbnRSZWYsQWZ0ZXJWaWV3SW5pdCxJbnB1dCxPdXRwdXQsRXZlbnRFbWl0dGVyLENvbnRlbnRDaGlsZCxmb3J3YXJkUmVmLENoYW5nZURldGVjdGlvblN0cmF0ZWd5LCBWaWV3RW5jYXBzdWxhdGlvbiwgQ29udGVudENoaWxkcmVuLCBRdWVyeUxpc3QsIEFmdGVyQ29udGVudEluaXQsIFRlbXBsYXRlUmVmfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHtDb21tb25Nb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XHJcbmltcG9ydCB7U2hhcmVkTW9kdWxlLEhlYWRlciwgUHJpbWVUZW1wbGF0ZX0gZnJvbSAncHJpbWVuZy9hcGknXHJcbmltcG9ydCB7RG9tSGFuZGxlcn0gZnJvbSAncHJpbWVuZy9kb20nO1xyXG5pbXBvcnQge05HX1ZBTFVFX0FDQ0VTU09SLCBDb250cm9sVmFsdWVBY2Nlc3Nvcn0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xyXG5pbXBvcnQgKiBhcyBRdWlsbCBmcm9tIFwicXVpbGxcIjtcclxuXHJcbmV4cG9ydCBjb25zdCBFRElUT1JfVkFMVUVfQUNDRVNTT1I6IGFueSA9IHtcclxuICBwcm92aWRlOiBOR19WQUxVRV9BQ0NFU1NPUixcclxuICB1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiBFZGl0b3IpLFxyXG4gIG11bHRpOiB0cnVlXHJcbn07XHJcblxyXG5AQ29tcG9uZW50KHtcclxuICAgIHNlbGVjdG9yOiAncC1lZGl0b3InLFxyXG4gICAgdGVtcGxhdGU6IGBcclxuICAgICAgICA8ZGl2IFtuZ0NsYXNzXT1cIidwLWVkaXRvci1jb250YWluZXInXCIgW2NsYXNzXT1cInN0eWxlQ2xhc3NcIj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInAtZWRpdG9yLXRvb2xiYXJcIiAqbmdJZj1cInRvb2xiYXIgfHwgaGVhZGVyVGVtcGxhdGVcIj5cclxuICAgICAgICAgICAgICAgIDxuZy1jb250ZW50IHNlbGVjdD1cInAtaGVhZGVyXCI+PC9uZy1jb250ZW50PlxyXG4gICAgICAgICAgICAgICAgPG5nLWNvbnRhaW5lciAqbmdUZW1wbGF0ZU91dGxldD1cImhlYWRlclRlbXBsYXRlXCI+PC9uZy1jb250YWluZXI+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwicC1lZGl0b3ItdG9vbGJhclwiICpuZ0lmPVwiIXRvb2xiYXIgJiYgIWhlYWRlclRlbXBsYXRlXCI+XHJcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInFsLWZvcm1hdHNcIj5cclxuICAgICAgICAgICAgICAgICAgICA8c2VsZWN0IGNsYXNzPVwicWwtaGVhZGVyXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiMVwiPkhlYWRpbmc8L29wdGlvbj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCIyXCI+U3ViaGVhZGluZzwvb3B0aW9uPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiBzZWxlY3RlZD5Ob3JtYWw8L29wdGlvbj5cclxuICAgICAgICAgICAgICAgICAgICA8L3NlbGVjdD5cclxuICAgICAgICAgICAgICAgICAgICA8c2VsZWN0IGNsYXNzPVwicWwtZm9udFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiBzZWxlY3RlZD5TYW5zIFNlcmlmPC9vcHRpb24+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwic2VyaWZcIj5TZXJpZjwvb3B0aW9uPlxyXG4gICAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIm1vbm9zcGFjZVwiPk1vbm9zcGFjZTwvb3B0aW9uPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvc2VsZWN0PlxyXG4gICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJxbC1mb3JtYXRzXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cInFsLWJvbGRcIiBhcmlhLWxhYmVsPVwiQm9sZFwiIHR5cGU9XCJidXR0b25cIj48L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwicWwtaXRhbGljXCIgYXJpYS1sYWJlbD1cIkl0YWxpY1wiIHR5cGU9XCJidXR0b25cIj48L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwicWwtdW5kZXJsaW5lXCIgYXJpYS1sYWJlbD1cIlVuZGVybGluZVwiIHR5cGU9XCJidXR0b25cIj48L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwicWwtZm9ybWF0c1wiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzZWxlY3QgY2xhc3M9XCJxbC1jb2xvclwiPjwvc2VsZWN0PlxyXG4gICAgICAgICAgICAgICAgICAgIDxzZWxlY3QgY2xhc3M9XCJxbC1iYWNrZ3JvdW5kXCI+PC9zZWxlY3Q+XHJcbiAgICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInFsLWZvcm1hdHNcIj5cclxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwicWwtbGlzdFwiIHZhbHVlPVwib3JkZXJlZFwiIGFyaWEtbGFiZWw9XCJPcmRlcmVkIExpc3RcIiB0eXBlPVwiYnV0dG9uXCI+PC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cInFsLWxpc3RcIiB2YWx1ZT1cImJ1bGxldFwiIGFyaWEtbGFiZWw9XCJVbm9yZGVyZWQgTGlzdFwiIHR5cGU9XCJidXR0b25cIj48L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgICA8c2VsZWN0IGNsYXNzPVwicWwtYWxpZ25cIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiBzZWxlY3RlZD48L29wdGlvbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cImNlbnRlclwiPjwvb3B0aW9uPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwicmlnaHRcIj48L29wdGlvbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cImp1c3RpZnlcIj48L29wdGlvbj5cclxuICAgICAgICAgICAgICAgICAgICA8L3NlbGVjdD5cclxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwicWwtZm9ybWF0c1wiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJxbC1saW5rXCIgYXJpYS1sYWJlbD1cIkluc2VydCBMaW5rXCIgdHlwZT1cImJ1dHRvblwiPjwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJxbC1pbWFnZVwiIGFyaWEtbGFiZWw9XCJJbnNlcnQgSW1hZ2VcIiB0eXBlPVwiYnV0dG9uXCI+PC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cInFsLWNvZGUtYmxvY2tcIiBhcmlhLWxhYmVsPVwiSW5zZXJ0IENvZGUgQmxvY2tcIiB0eXBlPVwiYnV0dG9uXCI+PC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInFsLWZvcm1hdHNcIj5cclxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwicWwtY2xlYW5cIiBhcmlhLWxhYmVsPVwiUmVtb3ZlIFN0eWxlc1wiIHR5cGU9XCJidXR0b25cIj48L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwLWVkaXRvci1jb250ZW50XCIgW25nU3R5bGVdPVwic3R5bGVcIj48L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgIGAsXHJcbiAgICBwcm92aWRlcnM6IFtFRElUT1JfVkFMVUVfQUNDRVNTT1JdLFxyXG4gICAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5PblB1c2gsXHJcbiAgICBzdHlsZVVybHM6IFsnLi9lZGl0b3IuY3NzJ10sXHJcbiAgICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBFZGl0b3IgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0LEFmdGVyQ29udGVudEluaXQsQ29udHJvbFZhbHVlQWNjZXNzb3Ige1xyXG4gICAgICAgIFxyXG4gICAgQE91dHB1dCgpIG9uVGV4dENoYW5nZTogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XHJcbiAgICBcclxuICAgIEBPdXRwdXQoKSBvblNlbGVjdGlvbkNoYW5nZTogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XHJcbiAgICBcclxuICAgIEBDb250ZW50Q2hpbGQoSGVhZGVyKSB0b29sYmFyO1xyXG4gICAgXHJcbiAgICBASW5wdXQoKSBzdHlsZTogYW55O1xyXG4gICAgICAgIFxyXG4gICAgQElucHV0KCkgc3R5bGVDbGFzczogc3RyaW5nO1xyXG4gICAgXHJcbiAgICBASW5wdXQoKSBwbGFjZWhvbGRlcjogc3RyaW5nO1xyXG4gICAgXHJcbiAgICBASW5wdXQoKSBmb3JtYXRzOiBzdHJpbmdbXTtcclxuXHJcbiAgICBASW5wdXQoKSBtb2R1bGVzOiBhbnk7XHJcblxyXG4gICAgQElucHV0KCkgYm91bmRzOiBhbnk7XHJcblxyXG4gICAgQElucHV0KCkgc2Nyb2xsaW5nQ29udGFpbmVyOiBhbnk7XHJcblxyXG4gICAgQElucHV0KCkgZGVidWc6IHN0cmluZztcclxuICAgIFxyXG4gICAgQE91dHB1dCgpIG9uSW5pdDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XHJcblxyXG4gICAgQENvbnRlbnRDaGlsZHJlbihQcmltZVRlbXBsYXRlKSB0ZW1wbGF0ZXM6IFF1ZXJ5TGlzdDxhbnk+O1xyXG4gICAgXHJcbiAgICB2YWx1ZTogc3RyaW5nO1xyXG4gICAgXHJcbiAgICBfcmVhZG9ubHk6IGJvb2xlYW47XHJcbiAgICBcclxuICAgIG9uTW9kZWxDaGFuZ2U6IEZ1bmN0aW9uID0gKCkgPT4ge307XHJcbiAgICBcclxuICAgIG9uTW9kZWxUb3VjaGVkOiBGdW5jdGlvbiA9ICgpID0+IHt9O1xyXG4gICAgXHJcbiAgICBxdWlsbDogYW55O1xyXG5cclxuICAgIGhlYWRlclRlbXBsYXRlOiBUZW1wbGF0ZVJlZjxhbnk+O1xyXG4gICAgXHJcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgZWw6IEVsZW1lbnRSZWYpIHt9XHJcblxyXG4gICAgbmdBZnRlclZpZXdJbml0KCkge1xyXG4gICAgICAgIGxldCBlZGl0b3JFbGVtZW50ID0gRG9tSGFuZGxlci5maW5kU2luZ2xlKHRoaXMuZWwubmF0aXZlRWxlbWVudCAsJ2Rpdi5wLWVkaXRvci1jb250ZW50Jyk7IFxyXG4gICAgICAgIGxldCB0b29sYmFyRWxlbWVudCA9IERvbUhhbmRsZXIuZmluZFNpbmdsZSh0aGlzLmVsLm5hdGl2ZUVsZW1lbnQgLCdkaXYucC1lZGl0b3ItdG9vbGJhcicpOyBcclxuICAgICAgICBsZXQgZGVmYXVsdE1vZHVsZSAgPSB7dG9vbGJhcjogdG9vbGJhckVsZW1lbnR9O1xyXG4gICAgICAgIGxldCBtb2R1bGVzID0gdGhpcy5tb2R1bGVzID8gey4uLmRlZmF1bHRNb2R1bGUsIC4uLnRoaXMubW9kdWxlc30gOiBkZWZhdWx0TW9kdWxlO1xyXG5cclxuICAgICAgICB0aGlzLnF1aWxsID0gbmV3IFF1aWxsKGVkaXRvckVsZW1lbnQsIHtcclxuICAgICAgICAgICAgbW9kdWxlczogbW9kdWxlcyxcclxuICAgICAgICAgICAgcGxhY2Vob2xkZXI6IHRoaXMucGxhY2Vob2xkZXIsXHJcbiAgICAgICAgICAgIHJlYWRPbmx5OiB0aGlzLnJlYWRvbmx5LFxyXG4gICAgICAgICAgICB0aGVtZTogJ3Nub3cnLFxyXG4gICAgICAgICAgICBmb3JtYXRzOiB0aGlzLmZvcm1hdHMsXHJcbiAgICAgICAgICAgIGJvdW5kczogdGhpcy5ib3VuZHMsXHJcbiAgICAgICAgICAgIGRlYnVnOiB0aGlzLmRlYnVnLFxyXG4gICAgICAgICAgICBzY3JvbGxpbmdDb250YWluZXI6IHRoaXMuc2Nyb2xsaW5nQ29udGFpbmVyXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBcclxuICAgICAgICBpZiAodGhpcy52YWx1ZSkge1xyXG4gICAgICAgICAgICB0aGlzLnF1aWxsLnNldENvbnRlbnRzKHRoaXMucXVpbGwuY2xpcGJvYXJkLmNvbnZlcnQodGhpcy52YWx1ZSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICB0aGlzLnF1aWxsLm9uKCd0ZXh0LWNoYW5nZScsIChkZWx0YSwgb2xkQ29udGVudHMsIHNvdXJjZSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAoc291cmNlID09PSAndXNlcicpIHtcclxuICAgICAgICAgICAgICAgIGxldCBodG1sID0gRG9tSGFuZGxlci5maW5kU2luZ2xlKGVkaXRvckVsZW1lbnQsICcucWwtZWRpdG9yJykuaW5uZXJIVE1MO1xyXG4gICAgICAgICAgICAgICAgbGV0IHRleHQgPSB0aGlzLnF1aWxsLmdldFRleHQoKS50cmltKCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoaHRtbCA9PT0gJzxwPjxicj48L3A+Jykge1xyXG4gICAgICAgICAgICAgICAgICAgIGh0bWwgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMub25UZXh0Q2hhbmdlLmVtaXQoe1xyXG4gICAgICAgICAgICAgICAgICAgIGh0bWxWYWx1ZTogaHRtbCxcclxuICAgICAgICAgICAgICAgICAgICB0ZXh0VmFsdWU6IHRleHQsXHJcbiAgICAgICAgICAgICAgICAgICAgZGVsdGE6IGRlbHRhLFxyXG4gICAgICAgICAgICAgICAgICAgIHNvdXJjZTogc291cmNlXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgdGhpcy5vbk1vZGVsQ2hhbmdlKGh0bWwpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vbk1vZGVsVG91Y2hlZCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5xdWlsbC5vbignc2VsZWN0aW9uLWNoYW5nZScsIChyYW5nZSwgb2xkUmFuZ2UsIHNvdXJjZSkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLm9uU2VsZWN0aW9uQ2hhbmdlLmVtaXQoe1xyXG4gICAgICAgICAgICAgICAgcmFuZ2U6IHJhbmdlLFxyXG4gICAgICAgICAgICAgICAgb2xkUmFuZ2U6IG9sZFJhbmdlLFxyXG4gICAgICAgICAgICAgICAgc291cmNlOiBzb3VyY2VcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgXHJcbiAgICAgICAgdGhpcy5vbkluaXQuZW1pdCh7XHJcbiAgICAgICAgICAgIGVkaXRvcjogdGhpcy5xdWlsbFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcclxuICAgICAgICB0aGlzLnRlbXBsYXRlcy5mb3JFYWNoKChpdGVtKSA9PiB7XHJcbiAgICAgICAgICAgIHN3aXRjaChpdGVtLmdldFR5cGUoKSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAnaGVhZGVyJzpcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmhlYWRlclRlbXBsYXRlID0gaXRlbS50ZW1wbGF0ZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICAgICAgXHJcbiAgICB3cml0ZVZhbHVlKHZhbHVlOiBhbnkpIDogdm9pZCB7XHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMucXVpbGwpIHtcclxuICAgICAgICAgICAgaWYgKHZhbHVlKVxyXG4gICAgICAgICAgICAgICAgdGhpcy5xdWlsbC5zZXRDb250ZW50cyh0aGlzLnF1aWxsLmNsaXBib2FyZC5jb252ZXJ0KHZhbHVlKSk7XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHRoaXMucXVpbGwuc2V0VGV4dCgnJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICByZWdpc3Rlck9uQ2hhbmdlKGZuOiBGdW5jdGlvbik6IHZvaWQge1xyXG4gICAgICAgIHRoaXMub25Nb2RlbENoYW5nZSA9IGZuO1xyXG4gICAgfVxyXG5cclxuICAgIHJlZ2lzdGVyT25Ub3VjaGVkKGZuOiBGdW5jdGlvbik6IHZvaWQge1xyXG4gICAgICAgIHRoaXMub25Nb2RlbFRvdWNoZWQgPSBmbjtcclxuICAgIH1cclxuICAgIFxyXG4gICAgZ2V0UXVpbGwoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMucXVpbGw7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIEBJbnB1dCgpIGdldCByZWFkb25seSgpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fcmVhZG9ubHk7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IHJlYWRvbmx5KHZhbDpib29sZWFuKSB7XHJcbiAgICAgICAgdGhpcy5fcmVhZG9ubHkgPSB2YWw7XHJcbiAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMucXVpbGwpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX3JlYWRvbmx5KVxyXG4gICAgICAgICAgICAgICAgdGhpcy5xdWlsbC5kaXNhYmxlKCk7XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHRoaXMucXVpbGwuZW5hYmxlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5ATmdNb2R1bGUoe1xyXG4gICAgaW1wb3J0czogW0NvbW1vbk1vZHVsZV0sXHJcbiAgICBleHBvcnRzOiBbRWRpdG9yLFNoYXJlZE1vZHVsZV0sXHJcbiAgICBkZWNsYXJhdGlvbnM6IFtFZGl0b3JdXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBFZGl0b3JNb2R1bGUgeyB9XHJcbiJdfQ==