import { Injectable } from '@angular/core';
import { ObjectUtils } from 'primeng/utils';
import * as i0 from "@angular/core";
export class FilterService {
    constructor() {
        this.filters = {
            startsWith: (value, filter, filterLocale) => {
                if (filter === undefined || filter === null || filter.trim() === '') {
                    return true;
                }
                if (value === undefined || value === null) {
                    return false;
                }
                let filterValue = ObjectUtils.removeAccents(filter.toString()).toLocaleLowerCase(filterLocale);
                let stringValue = ObjectUtils.removeAccents(value.toString()).toLocaleLowerCase(filterLocale);
                return stringValue.slice(0, filterValue.length) === filterValue;
            },
            contains: (value, filter, filterLocale) => {
                if (filter === undefined || filter === null || (typeof filter === 'string' && filter.trim() === '')) {
                    return true;
                }
                if (value === undefined || value === null) {
                    return false;
                }
                let filterValue = ObjectUtils.removeAccents(filter.toString()).toLocaleLowerCase(filterLocale);
                let stringValue = ObjectUtils.removeAccents(value.toString()).toLocaleLowerCase(filterLocale);
                return stringValue.indexOf(filterValue) !== -1;
            },
            notContains: (value, filter, filterLocale) => {
                if (filter === undefined || filter === null || (typeof filter === 'string' && filter.trim() === '')) {
                    return true;
                }
                if (value === undefined || value === null) {
                    return false;
                }
                let filterValue = ObjectUtils.removeAccents(filter.toString()).toLocaleLowerCase(filterLocale);
                let stringValue = ObjectUtils.removeAccents(value.toString()).toLocaleLowerCase(filterLocale);
                return stringValue.indexOf(filterValue) === -1;
            },
            endsWith: (value, filter, filterLocale) => {
                if (filter === undefined || filter === null || filter.trim() === '') {
                    return true;
                }
                if (value === undefined || value === null) {
                    return false;
                }
                let filterValue = ObjectUtils.removeAccents(filter.toString()).toLocaleLowerCase(filterLocale);
                let stringValue = ObjectUtils.removeAccents(value.toString()).toLocaleLowerCase(filterLocale);
                return stringValue.indexOf(filterValue, stringValue.length - filterValue.length) !== -1;
            },
            equals: (value, filter, filterLocale) => {
                if (filter === undefined || filter === null || (typeof filter === 'string' && filter.trim() === '')) {
                    return true;
                }
                if (value === undefined || value === null) {
                    return false;
                }
                if (value.getTime && filter.getTime)
                    return value.getTime() === filter.getTime();
                else
                    return ObjectUtils.removeAccents(value.toString()).toLocaleLowerCase(filterLocale) == ObjectUtils.removeAccents(filter.toString()).toLocaleLowerCase(filterLocale);
            },
            notEquals: (value, filter, filterLocale) => {
                if (filter === undefined || filter === null || (typeof filter === 'string' && filter.trim() === '')) {
                    return false;
                }
                if (value === undefined || value === null) {
                    return true;
                }
                if (value.getTime && filter.getTime)
                    return value.getTime() !== filter.getTime();
                else
                    return ObjectUtils.removeAccents(value.toString()).toLocaleLowerCase(filterLocale) != ObjectUtils.removeAccents(filter.toString()).toLocaleLowerCase(filterLocale);
            },
            in: (value, filter) => {
                if (filter === undefined || filter === null || filter.length === 0) {
                    return true;
                }
                for (let i = 0; i < filter.length; i++) {
                    if (ObjectUtils.equals(value, filter[i])) {
                        return true;
                    }
                }
                return false;
            },
            between: (value, filter) => {
                if (filter == null || filter[0] == null || filter[1] == null) {
                    return true;
                }
                if (value === undefined || value === null) {
                    return false;
                }
                if (value.getTime)
                    return filter[0].getTime() <= value.getTime() && value.getTime() <= filter[1].getTime();
                else
                    return filter[0] <= value && value <= filter[1];
            },
            lt: (value, filter, filterLocale) => {
                if (filter === undefined || filter === null) {
                    return true;
                }
                if (value === undefined || value === null) {
                    return false;
                }
                if (value.getTime && filter.getTime)
                    return value.getTime() < filter.getTime();
                else
                    return value < filter;
            },
            lte: (value, filter, filterLocale) => {
                if (filter === undefined || filter === null) {
                    return true;
                }
                if (value === undefined || value === null) {
                    return false;
                }
                if (value.getTime && filter.getTime)
                    return value.getTime() <= filter.getTime();
                else
                    return value <= filter;
            },
            gt: (value, filter, filterLocale) => {
                if (filter === undefined || filter === null) {
                    return true;
                }
                if (value === undefined || value === null) {
                    return false;
                }
                if (value.getTime && filter.getTime)
                    return value.getTime() > filter.getTime();
                else
                    return value > filter;
            },
            gte: (value, filter, filterLocale) => {
                if (filter === undefined || filter === null) {
                    return true;
                }
                if (value === undefined || value === null) {
                    return false;
                }
                if (value.getTime && filter.getTime)
                    return value.getTime() >= filter.getTime();
                else
                    return value >= filter;
            },
            is: (value, filter, filterLocale) => {
                return this.filters.equals(value, filter, filterLocale);
            },
            isNot: (value, filter, filterLocale) => {
                return this.filters.notEquals(value, filter, filterLocale);
            },
            before: (value, filter, filterLocale) => {
                return this.filters.lt(value, filter, filterLocale);
            },
            after: (value, filter, filterLocale) => {
                return this.filters.gt(value, filter, filterLocale);
            },
            dateIs: (value, filter) => {
                if (filter === undefined || filter === null) {
                    return true;
                }
                if (value === undefined || value === null) {
                    return false;
                }
                return value.toDateString() === filter.toDateString();
            },
            dateIsNot: (value, filter) => {
                if (filter === undefined || filter === null) {
                    return true;
                }
                if (value === undefined || value === null) {
                    return false;
                }
                return value.toDateString() !== filter.toDateString();
            },
            dateBefore: (value, filter) => {
                if (filter === undefined || filter === null) {
                    return true;
                }
                if (value === undefined || value === null) {
                    return false;
                }
                return value.getTime() < filter.getTime();
            },
            dateAfter: (value, filter) => {
                if (filter === undefined || filter === null) {
                    return true;
                }
                if (value === undefined || value === null) {
                    return false;
                }
                return value.getTime() > filter.getTime();
            }
        };
    }
    filter(value, fields, filterValue, filterMatchMode, filterLocale) {
        let filteredItems = [];
        if (value) {
            for (let item of value) {
                for (let field of fields) {
                    let fieldValue = ObjectUtils.resolveFieldData(item, field);
                    if (this.filters[filterMatchMode](fieldValue, filterValue, filterLocale)) {
                        filteredItems.push(item);
                        break;
                    }
                }
            }
        }
        return filteredItems;
    }
    register(rule, fn) {
        this.filters[rule] = fn;
    }
}
FilterService.ɵprov = i0.ɵɵdefineInjectable({ factory: function FilterService_Factory() { return new FilterService(); }, token: FilterService, providedIn: "root" });
FilterService.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsdGVyc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8uLi9zcmMvYXBwL2NvbXBvbmVudHMvYXBpLyIsInNvdXJjZXMiOlsiZmlsdGVyc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxlQUFlLENBQUM7O0FBRzVDLE1BQU0sT0FBTyxhQUFhO0lBRDFCO1FBc0JXLFlBQU8sR0FBRztZQUNiLFVBQVUsRUFBRSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsWUFBYSxFQUFVLEVBQUU7Z0JBQ2pELElBQUksTUFBTSxLQUFLLFNBQVMsSUFBSSxNQUFNLEtBQUssSUFBSSxJQUFJLE1BQU0sQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEVBQUU7b0JBQ2pFLE9BQU8sSUFBSSxDQUFDO2lCQUNmO2dCQUVELElBQUksS0FBSyxLQUFLLFNBQVMsSUFBSSxLQUFLLEtBQUssSUFBSSxFQUFFO29CQUN2QyxPQUFPLEtBQUssQ0FBQztpQkFDaEI7Z0JBRUQsSUFBSSxXQUFXLEdBQUcsV0FBVyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDL0YsSUFBSSxXQUFXLEdBQUcsV0FBVyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFFOUYsT0FBTyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsTUFBTSxDQUFDLEtBQUssV0FBVyxDQUFDO1lBQ3BFLENBQUM7WUFFRCxRQUFRLEVBQUUsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLFlBQWEsRUFBVSxFQUFFO2dCQUMvQyxJQUFJLE1BQU0sS0FBSyxTQUFTLElBQUksTUFBTSxLQUFLLElB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QztJQUN6QixDQUFDO0lBd1BELFFBQVEsQ0FBQyxJQUFZLEVBQUUsRUFBWTtRQUMvQixJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUM1QixDQUFDOzs7O1lBOVFKLFVBQVUsU0FBQyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IE9iamVjdFV0aWxzIH0gZnJvbSAncHJpbWVuZy91dGlscyc7XHJcblxyXG5ASW5qZWN0YWJsZSh7cHJvdmlkZWRJbjogJ3Jvb3QnfSlcclxuZXhwb3J0IGNsYXNzIEZpbHRlclNlcnZpY2Uge1xyXG5cclxuICAgIGZpbHRlcih2YWx1ZTogYW55W10sIGZpZWxkczogYW55W10sIGZpbHRlclZhbHVlOiBhbnksIGZpbHRlck1hdGNoTW9kZTogc3RyaW5nLCBmaWx0ZXJMb2NhbGU/OiBzdHJpbmcpIHtcclxuICAgICAgICBsZXQgZmlsdGVyZWRJdGVtczogYW55W10gPSBbXTtcclxuXHJcbiAgICAgICAgaWYgKHZhbHVlKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGl0ZW0gb2YgdmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGZpZWxkIG9mIGZpZWxkcykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBmaWVsZFZhbHVlID0gT2JqZWN0VXRpbHMucmVzb2x2ZUZpZWxkRGF0YShpdGVtLCBmaWVsZCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmZpbHRlcnNbZmlsdGVyTWF0Y2hNb2RlXShmaWVsZFZhbHVlLCBmaWx0ZXJWYWx1ZSwgZmlsdGVyTG9jYWxlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJlZEl0ZW1zLnB1c2goaXRlbSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZpbHRlcmVkSXRlbXM7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyBmaWx0ZXJzID0ge1xyXG4gICAgICAgIHN0YXJ0c1dpdGg6ICh2YWx1ZSwgZmlsdGVyLCBmaWx0ZXJMb2NhbGU/KTpib29sZWFuID0+ICB7XHJcbiAgICAgICAgICAgIGlmIChmaWx0ZXIgPT09IHVuZGVmaW5lZCB8fCBmaWx0ZXIgPT09IG51bGwgfHwgZmlsdGVyLnRyaW0oKSA9PT0gJycpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICBcclxuICAgICAgICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgXHJcbiAgICAgICAgICAgIGxldCBmaWx0ZXJWYWx1ZSA9IE9iamVjdFV0aWxzLnJlbW92ZUFjY2VudHMoZmlsdGVyLnRvU3RyaW5nKCkpLnRvTG9jYWxlTG93ZXJDYXNlKGZpbHRlckxvY2FsZSk7XHJcbiAgICAgICAgICAgIGxldCBzdHJpbmdWYWx1ZSA9IE9iamVjdFV0aWxzLnJlbW92ZUFjY2VudHModmFsdWUudG9TdHJpbmcoKSkudG9Mb2NhbGVMb3dlckNhc2UoZmlsdGVyTG9jYWxlKTtcclxuICAgIFxyXG4gICAgICAgICAgICByZXR1cm4gc3RyaW5nVmFsdWUuc2xpY2UoMCwgZmlsdGVyVmFsdWUubGVuZ3RoKSA9PT0gZmlsdGVyVmFsdWU7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgY29udGFpbnM6ICh2YWx1ZSwgZmlsdGVyLCBmaWx0ZXJMb2NhbGU/KTpib29sZWFuID0+IHtcclxuICAgICAgICAgICAgaWYgKGZpbHRlciA9PT0gdW5kZWZpbmVkIHx8IGZpbHRlciA9PT0gbnVsbCB8fCAodHlwZW9mIGZpbHRlciA9PT0gJ3N0cmluZycgJiYgZmlsdGVyLnRyaW0oKSA9PT0gJycpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgXHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgIFxyXG4gICAgICAgICAgICBsZXQgZmlsdGVyVmFsdWUgPSBPYmplY3RVdGlscy5yZW1vdmVBY2NlbnRzKGZpbHRlci50b1N0cmluZygpKS50b0xvY2FsZUxvd2VyQ2FzZShmaWx0ZXJMb2NhbGUpO1xyXG4gICAgICAgICAgICBsZXQgc3RyaW5nVmFsdWUgPSBPYmplY3RVdGlscy5yZW1vdmVBY2NlbnRzKHZhbHVlLnRvU3RyaW5nKCkpLnRvTG9jYWxlTG93ZXJDYXNlKGZpbHRlckxvY2FsZSk7XHJcbiAgICBcclxuICAgICAgICAgICAgcmV0dXJuIHN0cmluZ1ZhbHVlLmluZGV4T2YoZmlsdGVyVmFsdWUpICE9PSAtMTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBub3RDb250YWluczogKHZhbHVlLCBmaWx0ZXIsIGZpbHRlckxvY2FsZT8pOmJvb2xlYW4gPT4ge1xyXG4gICAgICAgICAgICBpZiAoZmlsdGVyID09PSB1bmRlZmluZWQgfHwgZmlsdGVyID09PSBudWxsIHx8ICh0eXBlb2YgZmlsdGVyID09PSAnc3RyaW5nJyAmJiBmaWx0ZXIudHJpbSgpID09PSAnJykpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICBcclxuICAgICAgICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgXHJcbiAgICAgICAgICAgIGxldCBmaWx0ZXJWYWx1ZSA9IE9iamVjdFV0aWxzLnJlbW92ZUFjY2VudHMoZmlsdGVyLnRvU3RyaW5nKCkpLnRvTG9jYWxlTG93ZXJDYXNlKGZpbHRlckxvY2FsZSk7XHJcbiAgICAgICAgICAgIGxldCBzdHJpbmdWYWx1ZSA9IE9iamVjdFV0aWxzLnJlbW92ZUFjY2VudHModmFsdWUudG9TdHJpbmcoKSkudG9Mb2NhbGVMb3dlckNhc2UoZmlsdGVyTG9jYWxlKTtcclxuICAgIFxyXG4gICAgICAgICAgICByZXR1cm4gc3RyaW5nVmFsdWUuaW5kZXhPZihmaWx0ZXJWYWx1ZSkgPT09IC0xO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGVuZHNXaXRoOiAodmFsdWUsIGZpbHRlciwgZmlsdGVyTG9jYWxlPyk6Ym9vbGVhbiA9PiB7XHJcbiAgICAgICAgICAgIGlmIChmaWx0ZXIgPT09IHVuZGVmaW5lZCB8fCBmaWx0ZXIgPT09IG51bGwgfHwgZmlsdGVyLnRyaW0oKSA9PT0gJycpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICBcclxuICAgICAgICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgXHJcbiAgICAgICAgICAgIGxldCBmaWx0ZXJWYWx1ZSA9IE9iamVjdFV0aWxzLnJlbW92ZUFjY2VudHMoZmlsdGVyLnRvU3RyaW5nKCkpLnRvTG9jYWxlTG93ZXJDYXNlKGZpbHRlckxvY2FsZSk7XHJcbiAgICAgICAgICAgIGxldCBzdHJpbmdWYWx1ZSA9IE9iamVjdFV0aWxzLnJlbW92ZUFjY2VudHModmFsdWUudG9TdHJpbmcoKSkudG9Mb2NhbGVMb3dlckNhc2UoZmlsdGVyTG9jYWxlKTtcclxuICAgIFxyXG4gICAgICAgICAgICByZXR1cm4gc3RyaW5nVmFsdWUuaW5kZXhPZihmaWx0ZXJWYWx1ZSwgc3RyaW5nVmFsdWUubGVuZ3RoIC0gZmlsdGVyVmFsdWUubGVuZ3RoKSAhPT0gLTE7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZXF1YWxzOiAodmFsdWUsIGZpbHRlciwgZmlsdGVyTG9jYWxlPyk6Ym9vbGVhbiA9PiB7XHJcbiAgICAgICAgICAgIGlmIChmaWx0ZXIgPT09IHVuZGVmaW5lZCB8fCBmaWx0ZXIgPT09IG51bGwgfHwgKHR5cGVvZiBmaWx0ZXIgPT09ICdzdHJpbmcnICYmIGZpbHRlci50cmltKCkgPT09ICcnKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgIFxyXG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICBcclxuICAgICAgICAgICAgaWYgKHZhbHVlLmdldFRpbWUgJiYgZmlsdGVyLmdldFRpbWUpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUuZ2V0VGltZSgpID09PSBmaWx0ZXIuZ2V0VGltZSgpO1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gT2JqZWN0VXRpbHMucmVtb3ZlQWNjZW50cyh2YWx1ZS50b1N0cmluZygpKS50b0xvY2FsZUxvd2VyQ2FzZShmaWx0ZXJMb2NhbGUpID09IE9iamVjdFV0aWxzLnJlbW92ZUFjY2VudHMoZmlsdGVyLnRvU3RyaW5nKCkpLnRvTG9jYWxlTG93ZXJDYXNlKGZpbHRlckxvY2FsZSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgbm90RXF1YWxzOiAodmFsdWUsIGZpbHRlciwgZmlsdGVyTG9jYWxlPyk6Ym9vbGVhbiA9PiB7XHJcbiAgICAgICAgICAgIGlmIChmaWx0ZXIgPT09IHVuZGVmaW5lZCB8fCBmaWx0ZXIgPT09IG51bGwgfHwgKHR5cGVvZiBmaWx0ZXIgPT09ICdzdHJpbmcnICYmIGZpbHRlci50cmltKCkgPT09ICcnKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICBcclxuICAgICAgICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICBcclxuICAgICAgICAgICAgaWYgKHZhbHVlLmdldFRpbWUgJiYgZmlsdGVyLmdldFRpbWUpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUuZ2V0VGltZSgpICE9PSBmaWx0ZXIuZ2V0VGltZSgpO1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gT2JqZWN0VXRpbHMucmVtb3ZlQWNjZW50cyh2YWx1ZS50b1N0cmluZygpKS50b0xvY2FsZUxvd2VyQ2FzZShmaWx0ZXJMb2NhbGUpICE9IE9iamVjdFV0aWxzLnJlbW92ZUFjY2VudHMoZmlsdGVyLnRvU3RyaW5nKCkpLnRvTG9jYWxlTG93ZXJDYXNlKGZpbHRlckxvY2FsZSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgaW46ICh2YWx1ZSwgZmlsdGVyOiBhbnlbXSk6Ym9vbGVhbiA9PiB7XHJcbiAgICAgICAgICAgIGlmIChmaWx0ZXIgPT09IHVuZGVmaW5lZCB8fCBmaWx0ZXIgPT09IG51bGwgfHwgZmlsdGVyLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgIFxyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZpbHRlci5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgaWYgKE9iamVjdFV0aWxzLmVxdWFscyh2YWx1ZSwgZmlsdGVyW2ldKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICBcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGJldHdlZW46ICh2YWx1ZSwgZmlsdGVyOiBhbnlbXSk6Ym9vbGVhbiA9PiB7XHJcbiAgICAgICAgICAgIGlmIChmaWx0ZXIgPT0gbnVsbCB8fCBmaWx0ZXJbMF0gPT0gbnVsbCB8fMKgZmlsdGVyWzFdID09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICBcclxuICAgICAgICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgXHJcbiAgICAgICAgICAgIGlmICh2YWx1ZS5nZXRUaW1lKVxyXG4gICAgICAgICAgICByZXR1cm4gZmlsdGVyWzBdLmdldFRpbWUoKSA8PSB2YWx1ZS5nZXRUaW1lKCkgJiYgdmFsdWUuZ2V0VGltZSgpIDw9IGZpbHRlclsxXS5nZXRUaW1lKCk7XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHJldHVybiBmaWx0ZXJbMF0gPD0gdmFsdWUgJiYgdmFsdWUgPD0gZmlsdGVyWzFdO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGx0OiAodmFsdWUsIGZpbHRlciwgZmlsdGVyTG9jYWxlPyk6Ym9vbGVhbiA9PiB7XHJcbiAgICAgICAgICAgIGlmIChmaWx0ZXIgPT09IHVuZGVmaW5lZCB8fCBmaWx0ZXIgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICBcclxuICAgICAgICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgXHJcbiAgICAgICAgICAgIGlmICh2YWx1ZS5nZXRUaW1lICYmIGZpbHRlci5nZXRUaW1lKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlLmdldFRpbWUoKSA8IGZpbHRlci5nZXRUaW1lKCk7XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSA8IGZpbHRlcjtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBsdGU6ICh2YWx1ZSwgZmlsdGVyLCBmaWx0ZXJMb2NhbGU/KTpib29sZWFuID0+IHtcclxuICAgICAgICAgICAgaWYgKGZpbHRlciA9PT0gdW5kZWZpbmVkIHx8IGZpbHRlciA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgIFxyXG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICBcclxuICAgICAgICAgICAgaWYgKHZhbHVlLmdldFRpbWUgJiYgZmlsdGVyLmdldFRpbWUpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUuZ2V0VGltZSgpIDw9IGZpbHRlci5nZXRUaW1lKCk7XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSA8PSBmaWx0ZXI7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZ3Q6ICh2YWx1ZSwgZmlsdGVyLCBmaWx0ZXJMb2NhbGU/KTpib29sZWFuID0+IHtcclxuICAgICAgICAgICAgaWYgKGZpbHRlciA9PT0gdW5kZWZpbmVkIHx8IGZpbHRlciA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgIFxyXG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICBcclxuICAgICAgICAgICAgaWYgKHZhbHVlLmdldFRpbWUgJiYgZmlsdGVyLmdldFRpbWUpXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUuZ2V0VGltZSgpID4gZmlsdGVyLmdldFRpbWUoKTtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlID4gZmlsdGVyO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGd0ZTogKHZhbHVlLCBmaWx0ZXIsIGZpbHRlckxvY2FsZT8pOmJvb2xlYW4gPT4ge1xyXG4gICAgICAgICAgICBpZiAoZmlsdGVyID09PSB1bmRlZmluZWQgfHwgZmlsdGVyID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgXHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgIFxyXG4gICAgICAgICAgICBpZiAodmFsdWUuZ2V0VGltZSAmJiBmaWx0ZXIuZ2V0VGltZSlcclxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZS5nZXRUaW1lKCkgPj0gZmlsdGVyLmdldFRpbWUoKTtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlID49IGZpbHRlcjtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBpczogKHZhbHVlLCBmaWx0ZXIsIGZpbHRlckxvY2FsZT8pOmJvb2xlYW4gPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5maWx0ZXJzLmVxdWFscyh2YWx1ZSwgZmlsdGVyLCBmaWx0ZXJMb2NhbGUpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGlzTm90OiAodmFsdWUsIGZpbHRlciwgZmlsdGVyTG9jYWxlPyk6IGJvb2xlYW4gPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5maWx0ZXJzLm5vdEVxdWFscyh2YWx1ZSwgZmlsdGVyLCBmaWx0ZXJMb2NhbGUpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGJlZm9yZTogKHZhbHVlLCBmaWx0ZXIsIGZpbHRlckxvY2FsZT8pOiBib29sZWFuID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmlsdGVycy5sdCh2YWx1ZSwgZmlsdGVyLCBmaWx0ZXJMb2NhbGUpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGFmdGVyOiAodmFsdWUsIGZpbHRlciwgZmlsdGVyTG9jYWxlPyk6IGJvb2xlYW4gPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5maWx0ZXJzLmd0KHZhbHVlLCBmaWx0ZXIsIGZpbHRlckxvY2FsZSk7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgZGF0ZUlzOiAodmFsdWUsIGZpbHRlcik6IGJvb2xlYW4gPT4ge1xyXG4gICAgICAgICAgICBpZiAoZmlsdGVyID09PSB1bmRlZmluZWQgfHwgZmlsdGVyID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgXHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS50b0RhdGVTdHJpbmcoKSA9PT0gZmlsdGVyLnRvRGF0ZVN0cmluZygpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICAgIGRhdGVJc05vdDogKHZhbHVlLCBmaWx0ZXIpOiBib29sZWFuID0+IHtcclxuICAgICAgICAgICAgaWYgKGZpbHRlciA9PT0gdW5kZWZpbmVkIHx8IGZpbHRlciA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgIFxyXG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWUudG9EYXRlU3RyaW5nKCkgIT09IGZpbHRlci50b0RhdGVTdHJpbmcoKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBkYXRlQmVmb3JlOiAodmFsdWUsIGZpbHRlcik6IGJvb2xlYW4gPT4gIHtcclxuICAgICAgICAgICAgaWYgKGZpbHRlciA9PT0gdW5kZWZpbmVkIHx8IGZpbHRlciA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgIFxyXG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdmFsdWUuZ2V0VGltZSgpIDwgZmlsdGVyLmdldFRpbWUoKTtcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBkYXRlQWZ0ZXI6ICh2YWx1ZSwgZmlsdGVyKTogYm9vbGVhbiA9PiAge1xyXG4gICAgICAgICAgICBpZiAoZmlsdGVyID09PSB1bmRlZmluZWQgfHwgZmlsdGVyID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgXHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS5nZXRUaW1lKCkgPiBmaWx0ZXIuZ2V0VGltZSgpO1xyXG4gICAgICAgIH1cclxuICAgIFxyXG4gICAgfVxyXG5cclxuICAgIHJlZ2lzdGVyKHJ1bGU6IHN0cmluZywgZm46IEZ1bmN0aW9uKSB7XHJcbiAgICAgICAgdGhpcy5maWx0ZXJzW3J1bGVdID0gZm47XHJcbiAgICB9XHJcbn0iXX0=