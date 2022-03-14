import { NgModule, Directive, ElementRef, HostListener, Input, Output, EventEmitter, Optional, ChangeDetectorRef } from '@angular/core';
import { NgModel, NgControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
export class InputTextarea {
    constructor(el, ngModel, control, cd) {
        this.el = el;
        this.ngModel = ngModel;
        this.control = control;
        this.cd = cd;
        this.onResize = new EventEmitter();
    }
    ngOnInit() {
        if (this.ngModel) {
            this.ngModelSubscription = this.ngModel.valueChanges.subscribe(() => {
                this.updateState();
            });
        }
        if (this.control) {
            this.ngControlSubscription = this.control.valueChanges.subscribe(() => {
                this.updateState();
            });
        }
    }
    ngAfterViewInit() {
        if (this.autoResize)
            this.resize();
        this.updateFilledState();
        this.cd.detectChanges();
    }
    onInput(e) {
        this.updateState();
    }
    updateFilledState() {
        this.filled = this.el.nativeElement.value && this.el.nativeElement.value.length;
    }
    onFocus(e) {
        if (this.autoResize) {
            this.resize(e);
        }
    }
    onBlur(e) {
        if (this.autoResize) {
            this.resize(e);
        }
    }
    resize(event) {
        this.el.nativeElement.style.height = 'auto';
        this.el.nativeElement.style.height = this.el.nativeElement.scrollHeight + 'px';
        if (parseFloat(this.el.nativeElement.style.height) >= parseFloat(this.el.nativeElement.style.maxHeight)) {
            this.el.nativeElement.style.overflowY = "scroll";
            this.el.nativeElement.style.height = this.el.nativeElement.style.maxHeight;
        }
        else {
            this.el.nativeElement.style.overflow = "hidden";
        }
        this.onResize.emit(event || {});
    }
    updateState() {
        this.updateFilledState();
        if (this.autoResize) {
            this.resize();
        }
    }
    ngOnDestroy() {
        if (this.ngModelSubscription) {
            this.ngModelSubscription.unsubscribe();
        }
        if (this.ngControlSubscription) {
            this.ngControlSubscription.unsubscribe();
        }
    }
}
InputTextarea.decorators = [
    { type: Directive, args: [{
                selector: '[pInputTextarea]',
                host: {
                    '[class.p-inputtextarea]': 'true',
                    '[class.p-inputtext]': 'true',
                    '[class.p-component]': 'true',
                    '[class.p-filled]': 'filled',
                    '[class.p-inputtextarea-resizable]': 'autoResize'
                }
            },] }
];
InputTextarea.ctorParameters = () => [
    { type: ElementRef },
    { type: NgModel, decorators: [{ type: Optional }] },
    { type: NgControl, decorators: [{ type: Optional }] },
    { type: ChangeDetectorRef }
];
InputTextarea.propDecorators = {
    autoResize: [{ type: Input }],
    onResize: [{ type: Output }],
    onInput: [{ type: HostListener, args: ['input', ['$event'],] }],
    onFocus: [{ type: HostListener, args: ['focus', ['$event'],] }],
    onBlur: [{ type: HostListener, args: ['blur', ['$event'],] }]
};
export class InputTextareaModule {
}
InputTextareaModule.decorators = [
    { type: NgModule, args: [{
                imports: [CommonModule],
                exports: [InputTextarea],
                declarations: [InputTextarea]
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXR0ZXh0YXJlYS5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8uLi9zcmMvYXBwL2NvbXBvbmVudHMvaW5wdXR0ZXh0YXJlYS8iLCJzb3VyY2VzIjpbImlucHV0dGV4dGFyZWEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFFBQVEsRUFBQyxTQUFTLEVBQUMsVUFBVSxFQUFDLFlBQVksRUFBQyxLQUFLLEVBQUMsTUFBTSxFQUFFLFlBQVksRUFBQyxRQUFRLEVBQW9DLGlCQUFpQixFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ2xLLE9BQU8sRUFBQyxPQUFPLEVBQUUsU0FBUyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDbEQsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBYTdDLE1BQU0sT0FBTyxhQUFhO0lBY3RCLFlBQW1CLEVBQWMsRUFBcUIsT0FBZ0IsRUFBcUIsT0FBbUIsRUFBVSxFQUFxQjtRQUExSCxPQUFFLEdBQUYsRUFBRSxDQUFZO1FBQXFCLFlBQU8sR0FBUCxPQUFPLENBQVM7UUFBcUIsWUFBTyxHQUFQLE9BQU8sQ0FBWTtRQUFVLE9BQUUsR0FBRixFQUFFLENBQW1CO1FBVm5JLGFBQVEsR0FBc0IsSUFBSSxZQUFZLEVBQUUsQ0FBQztJQVVxRixDQUFDO0lBRWpKLFFBQVE7UUFDSixJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDZCxJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRTtnQkFDaEUsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1lBQ3ZCLENBQUMsQ0FBQyxDQUFBO1NBQ0w7UUFFRCxJQUFJLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDZCxJQUFJLENBQUMscUJBQXFCLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRTtnQkFDbEUsSUFBSSxDQUFDLFdBQVcs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QixTQUFTLHVCQTRCbUQsUUFBUTtZQTdCcUMsaUJBQWlCOzs7eUJBaUJ0SSxLQUFLO3VCQUVMLE1BQU07c0JBa0NOLFlBQVksU0FBQyxPQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUM7c0JBU2hDLFlBQVksU0FBQyxPQUFPLEVBQUUsQ0FBQyxRQUFRLENBQUM7cUJBT2hDLFlBQVksU0FBQyxNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUM7O0FBOENwQyxNQUFNLE9BQU8sbUJBQW1COzs7WUFML0IsUUFBUSxTQUFDO2dCQUNOLE9BQU8sRUFBRSxDQUFDLFlBQVksQ0FBQztnQkFDdkIsT0FBTyxFQUFFLENBQUMsYUFBYSxDQUFDO2dCQUN4QixZQUFZLEVBQUUsQ0FBQyxhQUFhLENBQUM7YUFDaEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge05nTW9kdWxlLERpcmVjdGl2ZSxFbGVtZW50UmVmLEhvc3RMaXN0ZW5lcixJbnB1dCxPdXRwdXQsIEV2ZW50RW1pdHRlcixPcHRpb25hbCwgQWZ0ZXJWaWV3SW5pdCwgT25Jbml0LCBPbkRlc3Ryb3ksIENoYW5nZURldGVjdG9yUmVmfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHtOZ01vZGVsLCBOZ0NvbnRyb2x9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcclxuaW1wb3J0IHtDb21tb25Nb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XHJcbmltcG9ydCB7IFN1YnNjcmlwdGlvbiB9IGZyb20gJ3J4anMnO1xyXG5cclxuQERpcmVjdGl2ZSh7XHJcbiAgICBzZWxlY3RvcjogJ1twSW5wdXRUZXh0YXJlYV0nLFxyXG4gICAgaG9zdDoge1xyXG4gICAgICAgICdbY2xhc3MucC1pbnB1dHRleHRhcmVhXSc6ICd0cnVlJyxcclxuICAgICAgICAnW2NsYXNzLnAtaW5wdXR0ZXh0XSc6ICd0cnVlJyxcclxuICAgICAgICAnW2NsYXNzLnAtY29tcG9uZW50XSc6ICd0cnVlJyxcclxuICAgICAgICAnW2NsYXNzLnAtZmlsbGVkXSc6ICdmaWxsZWQnLFxyXG4gICAgICAgICdbY2xhc3MucC1pbnB1dHRleHRhcmVhLXJlc2l6YWJsZV0nOiAnYXV0b1Jlc2l6ZSdcclxuICAgIH1cclxufSlcclxuZXhwb3J0IGNsYXNzIElucHV0VGV4dGFyZWEgaW1wbGVtZW50cyBPbkluaXQsIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSAge1xyXG4gICAgXHJcbiAgICBASW5wdXQoKSBhdXRvUmVzaXplOiBib29sZWFuO1xyXG4gICAgXHJcbiAgICBAT3V0cHV0KCkgb25SZXNpemU6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG4gICAgICAgIFxyXG4gICAgZmlsbGVkOiBib29sZWFuO1xyXG5cclxuICAgIGNhY2hlZFNjcm9sbEhlaWdodDpudW1iZXI7XHJcblxyXG4gICAgbmdNb2RlbFN1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uO1xyXG5cclxuICAgIG5nQ29udHJvbFN1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBlbDogRWxlbWVudFJlZiwgQE9wdGlvbmFsKCkgcHVibGljIG5nTW9kZWw6IE5nTW9kZWwsIEBPcHRpb25hbCgpIHB1YmxpYyBjb250cm9sIDogTmdDb250cm9sLCBwcml2YXRlIGNkOiBDaGFuZ2VEZXRlY3RvclJlZikge31cclxuICAgICAgICBcclxuICAgIG5nT25Jbml0KCkge1xyXG4gICAgICAgIGlmICh0aGlzLm5nTW9kZWwpIHtcclxuICAgICAgICAgICAgdGhpcy5uZ01vZGVsU3Vic2NyaXB0aW9uID0gdGhpcy5uZ01vZGVsLnZhbHVlQ2hhbmdlcy5zdWJzY3JpYmUoKCkgPT57XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVN0YXRlKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5jb250cm9sKSB7XHJcbiAgICAgICAgICAgIHRoaXMubmdDb250cm9sU3Vic2NyaXB0aW9uID0gdGhpcy5jb250cm9sLnZhbHVlQ2hhbmdlcy5zdWJzY3JpYmUoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVTdGF0ZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbmdBZnRlclZpZXdJbml0KCkge1xyXG4gICAgICAgIGlmICh0aGlzLmF1dG9SZXNpemUpXHJcbiAgICAgICAgICAgIHRoaXMucmVzaXplKCk7XHJcblxyXG4gICAgICAgIHRoaXMudXBkYXRlRmlsbGVkU3RhdGUoKTtcclxuICAgICAgICB0aGlzLmNkLmRldGVjdENoYW5nZXMoKTtcclxuICAgIH1cclxuXHJcbiAgICBASG9zdExpc3RlbmVyKCdpbnB1dCcsIFsnJGV2ZW50J10pXHJcbiAgICBvbklucHV0KGUpIHtcclxuICAgICAgICB0aGlzLnVwZGF0ZVN0YXRlKCk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHVwZGF0ZUZpbGxlZFN0YXRlKCkge1xyXG4gICAgICAgIHRoaXMuZmlsbGVkID0gdGhpcy5lbC5uYXRpdmVFbGVtZW50LnZhbHVlICYmIHRoaXMuZWwubmF0aXZlRWxlbWVudC52YWx1ZS5sZW5ndGg7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIEBIb3N0TGlzdGVuZXIoJ2ZvY3VzJywgWyckZXZlbnQnXSlcclxuICAgIG9uRm9jdXMoZSkge1xyXG4gICAgICAgIGlmICh0aGlzLmF1dG9SZXNpemUpIHtcclxuICAgICAgICAgICAgdGhpcy5yZXNpemUoZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICBASG9zdExpc3RlbmVyKCdibHVyJywgWyckZXZlbnQnXSlcclxuICAgIG9uQmx1cihlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuYXV0b1Jlc2l6ZSkge1xyXG4gICAgICAgICAgICB0aGlzLnJlc2l6ZShlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHJlc2l6ZShldmVudD86IEV2ZW50KSB7XHJcbiAgICAgICAgdGhpcy5lbC5uYXRpdmVFbGVtZW50LnN0eWxlLmhlaWdodCA9ICdhdXRvJztcclxuICAgICAgICB0aGlzLmVsLm5hdGl2ZUVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gdGhpcy5lbC5uYXRpdmVFbGVtZW50LnNjcm9sbEhlaWdodCArICdweCc7XHJcblxyXG4gICAgICAgIGlmIChwYXJzZUZsb2F0KHRoaXMuZWwubmF0aXZlRWxlbWVudC5zdHlsZS5oZWlnaHQpID49IHBhcnNlRmxvYXQodGhpcy5lbC5uYXRpdmVFbGVtZW50LnN0eWxlLm1heEhlaWdodCkpIHtcclxuICAgICAgICAgICAgdGhpcy5lbC5uYXRpdmVFbGVtZW50LnN0eWxlLm92ZXJmbG93WSA9IFwic2Nyb2xsXCI7XHJcbiAgICAgICAgICAgIHRoaXMuZWwubmF0aXZlRWxlbWVudC5zdHlsZS5oZWlnaHQgPSB0aGlzLmVsLm5hdGl2ZUVsZW1lbnQuc3R5bGUubWF4SGVpZ2h0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5lbC5uYXRpdmVFbGVtZW50LnN0eWxlLm92ZXJmbG93ID0gXCJoaWRkZW5cIjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMub25SZXNpemUuZW1pdChldmVudHx8e30pO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZVN0YXRlKCkge1xyXG4gICAgICAgIHRoaXMudXBkYXRlRmlsbGVkU3RhdGUoKTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgaWYgKHRoaXMuYXV0b1Jlc2l6ZSkge1xyXG4gICAgICAgICAgICB0aGlzLnJlc2l6ZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBuZ09uRGVzdHJveSgpIHtcclxuICAgICAgICBpZiAodGhpcy5uZ01vZGVsU3Vic2NyaXB0aW9uKSB7XHJcbiAgICAgICAgICAgIHRoaXMubmdNb2RlbFN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMubmdDb250cm9sU3Vic2NyaXB0aW9uKSB7XHJcbiAgICAgICAgICAgIHRoaXMubmdDb250cm9sU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5ATmdNb2R1bGUoe1xyXG4gICAgaW1wb3J0czogW0NvbW1vbk1vZHVsZV0sXHJcbiAgICBleHBvcnRzOiBbSW5wdXRUZXh0YXJlYV0sXHJcbiAgICBkZWNsYXJhdGlvbnM6IFtJbnB1dFRleHRhcmVhXVxyXG59KVxyXG5leHBvcnQgY2xhc3MgSW5wdXRUZXh0YXJlYU1vZHVsZSB7IH1cclxuIl19