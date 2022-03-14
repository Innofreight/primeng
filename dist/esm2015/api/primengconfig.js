import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { FilterMatchMode } from './filtermatchmode';
import * as i0 from "@angular/core";
export class PrimeNGConfig {
    constructor() {
        this.ripple = false;
        this.filterMatchModeOptions = {
            text: [
                FilterMatchMode.STARTS_WITH,
                FilterMatchMode.CONTAINS,
                FilterMatchMode.NOT_CONTAINS,
                FilterMatchMode.ENDS_WITH,
                FilterMatchMode.EQUALS,
                FilterMatchMode.NOT_EQUALS
            ],
            numeric: [
                FilterMatchMode.EQUALS,
                FilterMatchMode.NOT_EQUALS,
                FilterMatchMode.LESS_THAN,
                FilterMatchMode.LESS_THAN_OR_EQUAL_TO,
                FilterMatchMode.GREATER_THAN,
                FilterMatchMode.GREATER_THAN_OR_EQUAL_TO
            ],
            date: [
                FilterMatchMode.DATE_IS,
                FilterMatchMode.DATE_IS_NOT,
                FilterMatchMode.DATE_BEFORE,
                FilterMatchMode.DATE_AFTER
            ]
        };
        this.translation = {
            startsWith: 'Starts with',
            contains: 'Contains',
            notContains: 'Not contains',
            endsWith: 'Ends with',
            equals: 'Equals',
            notEquals: 'Not equals',
            noFilter: 'No Filter',
            lt: 'Less than',
            lte: 'Less than or equal to',
            gt: 'Greater than',
            gte: 'Greater than or equal to',
            is: 'Is',
            isNot: 'Is not',
            before: 'Before',
            after: 'After',
            dateIs: 'Date is',
            dateIsNot: 'Date is not',
            dateBefore: 'Date is before',
            dateAfter: 'Date is after',
            clear: 'Clear',
            apply: 'Apply',
            matchAll: 'Match All',
            matchAny: 'Match Any',
            addRule: 'Add Rule',
            removeRule: 'Remove Rule',
            accept: 'Yes',
            reject: 'No',
            choose: 'Choose',
            upload: 'Upload',
            cancel: 'Cancel',
            dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            dayNamesShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            dayNamesMin: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
            monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            monthNamesShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            today: 'Today',
            weekHeader: 'Wk',
            weak: 'Weak',
            medium: 'Medium',
            strong: 'Strong',
            passwordPrompt: 'Enter a password',
            emptyMessage: 'No results found',
            emptyFilterMessage: 'No results found'
        };
        this.translationSource = new Subject();
        this.translationObserver = this.translationSource.asObservable();
    }
    getTranslation(key) {
        return this.translation[key];
    }
    setTranslation(value) {
        this.translation = Object.assign(Object.assign({}, this.translation), value);
        this.translationSource.next(this.translation);
    }
}
PrimeNGConfig.ɵprov = i0.ɵɵdefineInjectable({ factory: function PrimeNGConfig_Factory() { return new PrimeNGConfig(); }, token: PrimeNGConfig, providedIn: "root" });
PrimeNGConfig.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJpbWVuZ2NvbmZpZy5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8uLi9zcmMvYXBwL2NvbXBvbmVudHMvYXBpLyIsInNvdXJjZXMiOlsicHJpbWVuZ2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDL0IsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLG1CQUFtQixDQUFDOztBQUlwRCxNQUFNLE9BQU8sYUFBYTtJQUQxQjtRQUdJLFdBQU0sR0FBWSxLQUFLLENBQUM7UUFFeEIsMkJBQXNCLEdBQUc7WUFDckIsSUFBSSxFQUFFO2dCQUNGLGVBQWUsQ0FBQyxXQUFXO2dCQUMzQixlQUFlLENBQUMsUUFBUTtnQkFDeEIsZUFBZSxDQUFDLFlBQVk7Z0JBQzVCLGVBQWUsQ0FBQyxTQUFTO2dCQUN6QixlQUFlLENBQUMsTUFBTTtnQkFDdEIsZUFBZSxDQUFDLFVBQVU7YUFDN0I7WUFDRCxPQUFPLEVBQUU7Z0JBQ0wsZUFBZSxDQUFDLE1BQU07Z0JBQ3RCLGVBQWUsQ0FBQyxVQUFVO2dCQUMxQixlQUFlLENBQUMsU0FBUztnQkFDekIsZUFBZSxDQUFDLHFCQUFxQjtnQkFDckMsZUFBZSxDQUFDLFlBQVk7Z0JBQzVCLGVBQWUsQ0FBQyx3QkFBd0I7YUFDM0M7WUFDRCxJQUFJLEVBQUU7Z0JBQ0YsZUFBZSxDQUFDLE9BQU87Z0JBQ3ZCLGVBQWUsQ0FBQyxXQUFXO2dCQUMzQixlQUFlLENBQUMsV0FBVztnQkFDM0IsZUFBZSxDQUFDLFVBQVU7YUFDN0I7U0FDSixDQUFDO1FBRU0sZ0JBQVcsR0FBZ0I7WUFDL0IsVUFBVSxFQUFFLGFBQWE7WUFDekIsUUFBUSxFQUFFLFVBQVU7WUFDcEIsV0FBVyxFQUFFLGNBQWM7WUFDM0IsUUFBUSxFQUFFLFdBQVc7WUFDckIsTUFBTSxFQUFFLFFBQVE7WUFDaEIsU0FBUyxFQUFFLFlBQVk7WUFDdkIsUUFBUSxFQUFFLFdBQVc7WUFDckIsRUFBRSxFQUFFLFdBQVc7WUFDZixHQUFHLEVBQUUsdUJBQXVCO1lBQzVCLEVBQUUsRUFBRSxjQUFjO1lBQ2xCLEdBQUcsRUFBRSwwQkFBMEI7WUFDL0IsRUFBRSxFQUFFLElBQUk7WUFDUixLQUFLLEVBQUUsUUFBUTtZQUNmLE1BQU0sRUFBRSxRQUFRO1lBQ2hCLEtBQUssRUFBRSxPQUFPO1lBQ2QsTUFBTSxFQUFFLFNBQVM7WUFDakIsU0FBUyxFQUFFLGFBQWE7WUFDeEIsVUFBVSxFQUFFLGdCQUFnQjtZQUM1QixTQUFTLEVBQUUsZUFBZTtZQUMxQixLQUFLLEVBQUUsT0FBTztZQUNkLEtBQUssRUFBRSxPQUFPO1lBQ2QsUUFBUSxFQUFFLFdBQVc7WUFDckIsUUFBUSxFQUFFLFdBQVc7WUFDckIsT0FBTyxFQUFFLFVBQVU7WUFDbkIsVUFBVSxFQUFFLGFBQWE7WUFDekIsTUFBTSxFQUFFLEtBQUs7WUFDYixNQUFNLEVBQUUsSUFBSTtZQUNaLE1BQU0sRUFBRSxRQUFRO1lBQ2hCLE1BQU0sRUFBRSxRQUFRO1lBQ2hCLE1BQU0sRUFBRSxRQUFRO1lBQ2hCLFFBQVEsRUFBRSxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFVBQVUsQ0FBQztZQUN4RixhQUFhLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUM7WUFDaEUsV0FBVyxFQUFFLENBQUMsSUFBSSxFQUFDLElBQUksRUFBQyxJQUFJLEVBQUMsSUFBSSxFQUFDLElBQUksRUFBQyxJQUFJLEVBQUMsSUFBSSxDQUFDO1lBQ2pELFVBQVUsRUFBRSxDQUFDLFNBQVMsRUFBQyxVQUFVLEVBQUMsT0FBTyxFQUFDLE9BQU8sRUFBQyxLQUFLLEVBQUMsTUFBTSxFQUFDLE1BQU0sRUFBQyxRQUFRLEVBQUMsV0FBVyxFQUFDLFNBQVMsRUFBQyxVQUFVLEVBQUMsVUFBVSxDQUFDO1lBQzNILGVBQWUsRUFBRSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDO1lBQ3BHLEtBQUssRUFBRSxPQUFPO1lBQ2QsVUFBVSxFQUFFLElBQUk7WUFDaEIsSUFBSSxFQUFFLE1BQU07WUFDWixNQUFNLEVBQUUsUUFBUTtZQUNoQixNQUFNLEVBQUUsUUFBUTtZQUNoQixjQUFjLEVBQUUsa0JBQWtCO1lBQ2xDLFlBQVksRUFBRSxrQkFBa0I7WUFDaEMsa0JBQWtCLEVBQUUsa0JBQWtCO1NBQ3pDLENBQUE7UUFFTyxzQkFBaUIsR0FBRyxJQUFJLE9BQU8sRUFBTyxDQUFDO1FBRS9DLHdCQUFtQixHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxZQUFZLEVBQUUsQ0FBQztLQVUvRDtJQVJHLGNBQWMsQ0FBQyxHQUFXO1FBQ3RCLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNqQyxDQUFDO0lBRUQsY0FBYyxDQUFDLEtBQWtCO1FBQzdCLElBQUksQ0FBQyxXQUFXLG1DQUFPLElBQUksQ0FBQyxXQUFXLEdBQUssS0FBSyxDQUFDLENBQUM7UUFDbkQsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDbEQsQ0FBQzs7OztZQXZGSixVQUFVLFNBQUMsRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBTdWJqZWN0IH0gZnJvbSAncnhqcyc7XHJcbmltcG9ydCB7IEZpbHRlck1hdGNoTW9kZSB9IGZyb20gJy4vZmlsdGVybWF0Y2htb2RlJztcclxuaW1wb3J0IHsgVHJhbnNsYXRpb24gfSBmcm9tICcuL3RyYW5zbGF0aW9uJztcclxuXHJcbkBJbmplY3RhYmxlKHtwcm92aWRlZEluOiAncm9vdCd9KVxyXG5leHBvcnQgY2xhc3MgUHJpbWVOR0NvbmZpZyB7XHJcblxyXG4gICAgcmlwcGxlOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gICAgZmlsdGVyTWF0Y2hNb2RlT3B0aW9ucyA9IHtcclxuICAgICAgICB0ZXh0OiBbXHJcbiAgICAgICAgICAgIEZpbHRlck1hdGNoTW9kZS5TVEFSVFNfV0lUSCxcclxuICAgICAgICAgICAgRmlsdGVyTWF0Y2hNb2RlLkNPTlRBSU5TLFxyXG4gICAgICAgICAgICBGaWx0ZXJNYXRjaE1vZGUuTk9UX0NPTlRBSU5TLFxyXG4gICAgICAgICAgICBGaWx0ZXJNYXRjaE1vZGUuRU5EU19XSVRILFxyXG4gICAgICAgICAgICBGaWx0ZXJNYXRjaE1vZGUuRVFVQUxTLFxyXG4gICAgICAgICAgICBGaWx0ZXJNYXRjaE1vZGUuTk9UX0VRVUFMU1xyXG4gICAgICAgIF0sXHJcbiAgICAgICAgbnVtZXJpYzogW1xyXG4gICAgICAgICAgICBGaWx0ZXJNYXRjaE1vZGUuRVFVQUxTLFxyXG4gICAgICAgICAgICBGaWx0ZXJNYXRjaE1vZGUuTk9UX0VRVUFMUyxcclxuICAgICAgICAgICAgRmlsdGVyTWF0Y2hNb2RlLkxFU1NfVEhBTixcclxuICAgICAgICAgICAgRmlsdGVyTWF0Y2hNb2RlLkxFU1NfVEhBTl9PUl9FUVVBTF9UTyxcclxuICAgICAgICAgICAgRmlsdGVyTWF0Y2hNb2RlLkdSRUFURVJfVEhBTixcclxuICAgICAgICAgICAgRmlsdGVyTWF0Y2hNb2RlLkdSRUFURVJfVEhBTl9PUl9FUVVBTF9UT1xyXG4gICAgICAgIF0sXHJcbiAgICAgICAgZGF0ZTogW1xyXG4gICAgICAgICAgICBGaWx0ZXJNYXRjaE1vZGUuREFURV9JUyxcclxuICAgICAgICAgICAgRmlsdGVyTWF0Y2hNb2RlLkRBVEVfSVNfTk9ULFxyXG4gICAgICAgICAgICBGaWx0ZXJNYXRjaE1vZGUuREFURV9CRUZPUkUsXHJcbiAgICAgICAgICAgIEZpbHRlck1hdGNoTW9kZS5EQVRFX0FGVEVSXHJcbiAgICAgICAgXVxyXG4gICAgfTtcclxuXHJcbiAgICBwcml2YXRlIHRyYW5zbGF0aW9uOiBUcmFuc2xhdGlvbiA9IHtcclxuICAgICAgICBzdGFydHNXaXRoOiAnU3RhcnRzIHdpdGgnLFxyXG4gICAgICAgIGNvbnRhaW5zOiAnQ29udGFpbnMnLFxyXG4gICAgICAgIG5vdENvbnRhaW5zOiAnTm90IGNvbnRhaW5zJyxcclxuICAgICAgICBlbmRzV2l0aDogJ0VuZHMgd2l0aCcsXHJcbiAgICAgICAgZXF1YWxzOiAnRXF1YWxzJyxcclxuICAgICAgICBub3RFcXVhbHM6ICdOb3QgZXF1YWxzJyxcclxuICAgICAgICBub0ZpbHRlcjogJ05vIEZpbHRlcicsXHJcbiAgICAgICAgbHQ6ICdMZXNzIHRoYW4nLFxyXG4gICAgICAgIGx0ZTogJ0xlc3MgdGhhbiBvciBlcXVhbCB0bycsXHJcbiAgICAgICAgZ3Q6ICdHcmVhdGVyIHRoYW4nLFxyXG4gICAgICAgIGd0ZTogJ0dyZWF0ZXIgdGhhbiBvciBlcXVhbCB0bycsXHJcbiAgICAgICAgaXM6ICdJcycsXHJcbiAgICAgICAgaXNOb3Q6ICdJcyBub3QnLFxyXG4gICAgICAgIGJlZm9yZTogJ0JlZm9yZScsXHJcbiAgICAgICAgYWZ0ZXI6ICdBZnRlcicsXHJcbiAgICAgICAgZGF0ZUlzOiAnRGF0ZSBpcycsXHJcbiAgICAgICAgZGF0ZUlzTm90OiAnRGF0ZSBpcyBub3QnLFxyXG4gICAgICAgIGRhdGVCZWZvcmU6ICdEYXRlIGlzIGJlZm9yZScsXHJcbiAgICAgICAgZGF0ZUFmdGVyOiAnRGF0ZSBpcyBhZnRlcicsXHJcbiAgICAgICAgY2xlYXI6ICdDbGVhcicsXHJcbiAgICAgICAgYXBwbHk6ICdBcHBseScsXHJcbiAgICAgICAgbWF0Y2hBbGw6ICdNYXRjaCBBbGwnLFxyXG4gICAgICAgIG1hdGNoQW55OiAnTWF0Y2ggQW55JyxcclxuICAgICAgICBhZGRSdWxlOiAnQWRkIFJ1bGUnLFxyXG4gICAgICAgIHJlbW92ZVJ1bGU6ICdSZW1vdmUgUnVsZScsXHJcbiAgICAgICAgYWNjZXB0OiAnWWVzJyxcclxuICAgICAgICByZWplY3Q6ICdObycsXHJcbiAgICAgICAgY2hvb3NlOiAnQ2hvb3NlJyxcclxuICAgICAgICB1cGxvYWQ6ICdVcGxvYWQnLFxyXG4gICAgICAgIGNhbmNlbDogJ0NhbmNlbCcsXHJcbiAgICAgICAgZGF5TmFtZXM6IFtcIlN1bmRheVwiLCBcIk1vbmRheVwiLCBcIlR1ZXNkYXlcIiwgXCJXZWRuZXNkYXlcIiwgXCJUaHVyc2RheVwiLCBcIkZyaWRheVwiLCBcIlNhdHVyZGF5XCJdLFxyXG4gICAgICAgIGRheU5hbWVzU2hvcnQ6IFtcIlN1blwiLCBcIk1vblwiLCBcIlR1ZVwiLCBcIldlZFwiLCBcIlRodVwiLCBcIkZyaVwiLCBcIlNhdFwiXSxcclxuICAgICAgICBkYXlOYW1lc01pbjogW1wiU3VcIixcIk1vXCIsXCJUdVwiLFwiV2VcIixcIlRoXCIsXCJGclwiLFwiU2FcIl0sXHJcbiAgICAgICAgbW9udGhOYW1lczogW1wiSmFudWFyeVwiLFwiRmVicnVhcnlcIixcIk1hcmNoXCIsXCJBcHJpbFwiLFwiTWF5XCIsXCJKdW5lXCIsXCJKdWx5XCIsXCJBdWd1c3RcIixcIlNlcHRlbWJlclwiLFwiT2N0b2JlclwiLFwiTm92ZW1iZXJcIixcIkRlY2VtYmVyXCJdLFxyXG4gICAgICAgIG1vbnRoTmFtZXNTaG9ydDogW1wiSmFuXCIsIFwiRmViXCIsIFwiTWFyXCIsIFwiQXByXCIsIFwiTWF5XCIsIFwiSnVuXCIsXCJKdWxcIiwgXCJBdWdcIiwgXCJTZXBcIiwgXCJPY3RcIiwgXCJOb3ZcIiwgXCJEZWNcIl0sXHJcbiAgICAgICAgdG9kYXk6ICdUb2RheScsXHJcbiAgICAgICAgd2Vla0hlYWRlcjogJ1drJyxcclxuICAgICAgICB3ZWFrOiAnV2VhaycsXHJcbiAgICAgICAgbWVkaXVtOiAnTWVkaXVtJyxcclxuICAgICAgICBzdHJvbmc6ICdTdHJvbmcnLFxyXG4gICAgICAgIHBhc3N3b3JkUHJvbXB0OiAnRW50ZXIgYSBwYXNzd29yZCcsXHJcbiAgICAgICAgZW1wdHlNZXNzYWdlOiAnTm8gcmVzdWx0cyBmb3VuZCcsXHJcbiAgICAgICAgZW1wdHlGaWx0ZXJNZXNzYWdlOiAnTm8gcmVzdWx0cyBmb3VuZCdcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHRyYW5zbGF0aW9uU291cmNlID0gbmV3IFN1YmplY3Q8YW55PigpO1xyXG4gICAgXHJcbiAgICB0cmFuc2xhdGlvbk9ic2VydmVyID0gdGhpcy50cmFuc2xhdGlvblNvdXJjZS5hc09ic2VydmFibGUoKTtcclxuICAgIFxyXG4gICAgZ2V0VHJhbnNsYXRpb24oa2V5OiBzdHJpbmcpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy50cmFuc2xhdGlvbltrZXldO1xyXG4gICAgfVxyXG5cclxuICAgIHNldFRyYW5zbGF0aW9uKHZhbHVlOiBUcmFuc2xhdGlvbikge1xyXG4gICAgICAgIHRoaXMudHJhbnNsYXRpb24gPSB7Li4udGhpcy50cmFuc2xhdGlvbiwgLi4udmFsdWV9O1xyXG4gICAgICAgIHRoaXMudHJhbnNsYXRpb25Tb3VyY2UubmV4dCh0aGlzLnRyYW5zbGF0aW9uKTtcclxuICAgIH1cclxufSJdfQ==