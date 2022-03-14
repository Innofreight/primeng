import { NgModule, Component, ElementRef, Input, Output, EventEmitter, forwardRef, Renderer2, ViewChild, ChangeDetectorRef, ContentChildren, NgZone, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { DomHandler, ConnectedOverlayScrollHandler } from 'primeng/dom';
import { SharedModule, PrimeTemplate, PrimeNGConfig, TranslationKeys } from 'primeng/api';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
export const CALENDAR_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => Calendar),
    multi: true
};
export class Calendar {
    constructor(el, renderer, cd, zone, config) {
        this.el = el;
        this.renderer = renderer;
        this.cd = cd;
        this.zone = zone;
        this.config = config;
        this.dateFormat = 'mm/dd/yy';
        this.multipleSeparator = ',';
        this.rangeSeparator = '-';
        this.inline = false;
        this.showOtherMonths = true;
        this.icon = 'pi pi-calendar';
        this.shortYearCutoff = '+10';
        this.hourFormat = '24';
        this.stepHour = 1;
        this.stepMinute = 1;
        this.stepSecond = 1;
        this.showSeconds = false;
        this.showOnFocus = true;
        this.showWeek = false;
        this.dataType = 'date';
        this.selectionMode = 'single';
        this.todayButtonStyleClass = 'p-button-text';
        this.clearButtonStyleClass = 'p-button-text';
        this.autoZIndex = true;
        this.baseZIndex = 0;
        this.keepInvalid = false;
        this.hideOnDateTimeSelect = true;
        this.numberOfMonths = 1;
        this.view = 'date';
        this.timeSeparator = ":";
        this.focusTrap = true;
        this.firstDayOfWeek = 0;
        this.showTransitionOptions = '.12s cubic-bezier(0, 0, 0.2, 1)';
        this.hideTransitionOptions = '.1s linear';
        this.onFocus = new EventEmitter();
        this.onBlur = new EventEmitter();
        this.onClose = new EventEmitter();
        this.onSelect = new EventEmitter();
        this.onInput = new EventEmitter();
        this.onTodayClick = new EventEmitter();
        this.onClearClick = new EventEmitter();
        this.onMonthChange = new EventEmitter();
        this.onYearChange = new EventEmitter();
        this.onClickOutside = new EventEmitter();
        this.onShow = new EventEmitter();
        this.onModelChange = () => { };
        this.onModelTouched = () => { };
        this.inputFieldValue = null;
        this.navigationState = null;
        this.convertTo24Hour = function (hours, pm) {
            if (this.hourFormat == '12') {
                if (hours === 12) {
                    return (pm ? 12 : 0);
                }
                else {
                    return (pm ? hours + 12 : hours);
                }
            }
            return hours;
        };
    }
    set content(content) {
        this.contentViewChild = content;
        if (this.contentViewChild) {
            if (this.isMonthNavigate) {
                Promise.resolve(null).then(() => this.updateFocus());
                this.isMonthNavigate = false;
            }
            else {
                this.initFocusableCell();
            }
        }
    }
    ;
    get defaultDate() {
        return this._defaultDate;
    }
    ;
    set defaultDate(defaultDate) {
        this._defaultDate = defaultDate;
        if (this.initialized) {
            const date = defaultDate || new Date();
            this.currentMonth = date.getMonth();
            this.currentYear = date.getFullYear();
            this.initTime(date);
            this.createMonths(this.currentMonth, this.currentYear);
        }
    }
    get minDate() {
        return this._minDate;
    }
    set minDate(date) {
        this._minDate = date;
        if (this.currentMonth != undefined && this.currentMonth != null && this.currentYear) {
            this.createMonths(this.currentMonth, this.currentYear);
        }
    }
    get maxDate() {
        return this._maxDate;
    }
    set maxDate(date) {
        this._maxDate = date;
        if (this.currentMonth != undefined && this.currentMonth != null && this.currentYear) {
            this.createMonths(this.currentMonth, this.currentYear);
        }
    }
    get disabledDates() {
        return this._disabledDates;
    }
    set disabledDates(disabledDates) {
        this._disabledDates = disabledDates;
        if (this.currentMonth != undefined && this.currentMonth != null && this.currentYear) {
            this.createMonths(this.currentMonth, this.currentYear);
        }
    }
    get disabledDays() {
        return this._disabledDays;
    }
    set disabledDays(disabledDays) {
        this._disabledDays = disabledDays;
        if (this.currentMonth != undefined && this.currentMonth != null && this.currentYear) {
            this.createMonths(this.currentMonth, this.currentYear);
        }
    }
    get yearRange() {
        return this._yearRange;
    }
    set yearRange(yearRange) {
        this._yearRange = yearRange;
        if (yearRange) {
            const years = yearRange.split(':');
            const yearStart = parseInt(years[0]);
            const yearEnd = parseInt(years[1]);
            this.populateYearOptions(yearStart, yearEnd);
        }
    }
    get showTime() {
        return this._showTime;
    }
    set showTime(showTime) {
        this._showTime = showTime;
        if (this.currentHour === undefined) {
            this.initTime(this.value || new Date());
        }
        this.updateInputfield();
    }
    get locale() {
        return this._locale;
    }
    set locale(newLocale) {
        console.warn("Locale property has no effect, use new i18n API instead.");
    }
    ngOnInit() {
        const date = this.defaultDate || new Date();
        this.currentMonth = date.getMonth();
        this.currentYear = date.getFullYear();
        if (this.view === 'date') {
            this.createWeekDays();
            this.initTime(date);
            this.createMonths(this.currentMonth, this.currentYear);
            this.ticksTo1970 = (((1970 - 1) * 365 + Math.floor(1970 / 4) - Math.floor(1970 / 100) + Math.floor(1970 / 400)) * 24 * 60 * 60 * 10000000);
        }
        else if (this.view === 'month') {
            this.createMonthPickerValues();
        }
        this.translationSubscription = this.config.translationObserver.subscribe(() => {
            this.createWeekDays();
        });
        this.initialized = true;
    }
    ngAfterContentInit() {
        this.templates.forEach((item) => {
            switch (item.getType()) {
                case 'date':
                    this.dateTemplate = item.template;
                    break;
                case 'disabledDate':
                    this.disabledDateTemplate = item.template;
                    break;
                case 'header':
                    this.headerTemplate = item.template;
                    break;
                case 'footer':
                    this.footerTemplate = item.template;
                    break;
                default:
                    this.dateTemplate = item.template;
                    break;
            }
        });
    }
    getTranslation(option) {
        return this.config.getTranslation(option);
    }
    populateYearOptions(start, end) {
        this.yearOptions = [];
        for (let i = start; i <= end; i++) {
            this.yearOptions.push(i);
        }
    }
    createWeekDays() {
        this.weekDays = [];
        let dayIndex = this.firstDayOfWeek;
        let dayLabels = this.getTranslation(TranslationKeys.DAY_NAMES_MIN);
        for (let i = 0; i < 7; i++) {
            this.weekDays.push(dayLabels[dayIndex]);
            dayIndex = (dayIndex == 6) ? 0 : ++dayIndex;
        }
    }
    createMonthPickerValues() {
        this.monthPickerValues = [];
        let monthLabels = this.getTranslation(TranslationKeys.MONTH_NAMES_SHORT);
        for (let i = 0; i <= 11; i++) {
            this.monthPickerValues.push(monthLabels[i]);
        }
    }
    createMonths(month, year) {
        this.months = this.months = [];
        for (let i = 0; i < this.numberOfMonths; i++) {
            let m = month + i;
            let y = year;
            if (m > 11) {
                m = m % 11 - 1;
                y = year + 1;
            }
            this.months.push(this.createMonth(m, y));
        }
    }
    getWeekNumber(date) {
        let checkDate = new Date(date.getTime());
        checkDate.setDate(checkDate.getDate() + 4 - (checkDate.getDay() || 7));
        let time = checkDate.getTime();
        checkDate.setMonth(0);
        checkDate.setDate(1);
        return Math.floor(Math.round((time - checkDate.getTime()) / 86400000) / 7) + 1;
    }
    createMonth(month, year) {
        let dates = [];
        let firstDay = this.getFirstDayOfMonthIndex(month, year);
        let daysLength = this.getDaysCountInMonth(month, year);
        let prevMonthDaysLength = this.getDaysCountInPrevMonth(month, year);
        let dayNo = 1;
        let today = new Date();
        let weekNumbers = [];
        let monthRows = Math.ceil((daysLength + firstDay) / 7);
        for (let i = 0; i < monthRows; i++) {
            let week = [];
            if (i == 0) {
                for (let j = (prevMonthDaysLength - firstDay + 1); j <= prevMonthDaysLength; j++) {
                    let prev = this.getPreviousMonthAndYear(month, year);
                    week.push({ day: j, month: prev.month, year: prev.year, otherMonth: true,
                        today: this.isToday(today, j, prev.month, prev.year), selectable: this.isSelectable(j, prev.month, prev.year, true) });
                }
                let remainingDaysLength = 7 - week.length;
                for (let j = 0; j < remainingDaysLength; j++) {
                    week.push({ day: dayNo, month: month, year: year, today: this.isToday(today, dayNo, month, year),
                        selectable: this.isSelectable(dayNo, month, year, false) });
                    dayNo++;
                }
            }
            else {
                for (let j = 0; j < 7; j++) {
                    if (dayNo > daysLength) {
                        let next = this.getNextMonthAndYear(month, year);
                        week.push({ day: dayNo - daysLength, month: next.month, year: next.year, otherMonth: true,
                            today: this.isToday(today, dayNo - daysLength, next.month, next.year),
                            selectable: this.isSelectable((dayNo - daysLength), next.month, next.year, true) });
                    }
                    else {
                        week.push({ day: dayNo, month: month, year: year, today: this.isToday(today, dayNo, month, year),
                            selectable: this.isSelectable(dayNo, month, year, false) });
                    }
                    dayNo++;
                }
            }
            if (this.showWeek) {
                weekNumbers.push(this.getWeekNumber(new Date(week[0].year, week[0].month, week[0].day)));
            }
            dates.push(week);
        }
        return {
            month: month,
            year: year,
            dates: dates,
            weekNumbers: weekNumbers
        };
    }
    initTime(date) {
        this.pm = date.getHours() > 11;
        if (this.showTime) {
            this.currentMinute = date.getMinutes();
            this.currentSecond = date.getSeconds();
            this.setCurrentHourPM(date.getHours());
        }
        else if (this.timeOnly) {
            this.currentMinute = 0;
            this.currentHour = 0;
            this.currentSecond = 0;
        }
    }
    navBackward(event) {
        event.stopPropagation();
        if (this.disabled) {
            event.preventDefault();
            return;
        }
        this.isMonthNavigate = true;
        if (this.view === 'month') {
            this.decrementYear();
            setTimeout(() => {
                this.updateFocus();
            }, 1);
        }
        else {
            if (this.currentMonth === 0) {
                this.currentMonth = 11;
                this.decrementYear();
            }
            else {
                this.currentMonth--;
            }
            this.onMonthChange.emit({ month: this.currentMonth + 1, year: this.currentYear });
            this.createMonths(this.currentMonth, this.currentYear);
        }
    }
    navForward(event) {
        event.stopPropagation();
        if (this.disabled) {
            event.preventDefault();
            return;
        }
        this.isMonthNavigate = true;
        if (this.view === 'month') {
            this.incrementYear();
            setTimeout(() => {
                this.updateFocus();
            }, 1);
        }
        else {
            if (this.currentMonth === 11) {
                this.currentMonth = 0;
                this.incrementYear();
            }
            else {
                this.currentMonth++;
            }
            this.onMonthChange.emit({ month: this.currentMonth + 1, year: this.currentYear });
            this.createMonths(this.currentMonth, this.currentYear);
        }
    }
    decrementYear() {
        this.currentYear--;
        if (this.yearNavigator && this.currentYear < this.yearOptions[0]) {
            let difference = this.yearOptions[this.yearOptions.length - 1] - this.yearOptions[0];
            this.populateYearOptions(this.yearOptions[0] - difference, this.yearOptions[this.yearOptions.length - 1] - difference);
        }
    }
    incrementYear() {
        this.currentYear++;
        if (this.yearNavigator && this.currentYear > this.yearOptions[this.yearOptions.length - 1]) {
            let difference = this.yearOptions[this.yearOptions.length - 1] - this.yearOptions[0];
            this.populateYearOptions(this.yearOptions[0] + difference, this.yearOptions[this.yearOptions.length - 1] + difference);
        }
    }
    onDateSelect(event, dateMeta) {
        if (this.disabled || !dateMeta.selectable) {
            event.preventDefault();
            return;
        }
        if (this.isMultipleSelection() && this.isSelected(dateMeta)) {
            this.value = this.value.filter((date, i) => {
                return !this.isDateEquals(date, dateMeta);
            });
            if (this.value.length === 0) {
                this.value = null;
            }
            this.updateModel(this.value);
        }
        else {
            if (this.shouldSelectDate(dateMeta)) {
                this.selectDate(dateMeta);
            }
        }
        if (this.isSingleSelection() && this.hideOnDateTimeSelect) {
            setTimeout(() => {
                event.preventDefault();
                this.hideOverlay();
                if (this.mask) {
                    this.disableModality();
                }
                this.cd.markForCheck();
            }, 150);
        }
        this.updateInputfield();
        event.preventDefault();
    }
    shouldSelectDate(dateMeta) {
        if (this.isMultipleSelection())
            return this.maxDateCount != null ? this.maxDateCount > (this.value ? this.value.length : 0) : true;
        else
            return true;
    }
    onMonthSelect(event, index) {
        if (!DomHandler.hasClass(event.target, 'p-disabled')) {
            this.onDateSelect(event, { year: this.currentYear, month: index, day: 1, selectable: true });
        }
    }
    updateInputfield() {
        let formattedValue = '';
        if (this.value) {
            if (this.isSingleSelection()) {
                formattedValue = this.formatDateTime(this.value);
            }
            else if (this.isMultipleSelection()) {
                for (let i = 0; i < this.value.length; i++) {
                    let dateAsString = this.formatDateTime(this.value[i]);
                    formattedValue += dateAsString;
                    if (i !== (this.value.length - 1)) {
                        formattedValue += this.multipleSeparator + ' ';
                    }
                }
            }
            else if (this.isRangeSelection()) {
                if (this.value && this.value.length) {
                    let startDate = this.value[0];
                    let endDate = this.value[1];
                    formattedValue = this.formatDateTime(startDate);
                    if (endDate) {
                        formattedValue += ' ' + this.rangeSeparator + ' ' + this.formatDateTime(endDate);
                    }
                }
            }
        }
        this.inputFieldValue = formattedValue;
        this.updateFilledState();
        if (this.inputfieldViewChild && this.inputfieldViewChild.nativeElement) {
            this.inputfieldViewChild.nativeElement.value = this.inputFieldValue;
        }
    }
    formatDateTime(date) {
        let formattedValue = null;
        if (date) {
            if (this.timeOnly) {
                formattedValue = this.formatTime(date);
            }
            else {
                formattedValue = this.formatDate(date, this.getDateFormat());
                if (this.showTime) {
                    formattedValue += ' ' + this.formatTime(date);
                }
            }
        }
        return formattedValue;
    }
    setCurrentHourPM(hours) {
        if (this.hourFormat == '12') {
            this.pm = hours > 11;
            if (hours >= 12) {
                this.currentHour = (hours == 12) ? 12 : hours - 12;
            }
            else {
                this.currentHour = (hours == 0) ? 12 : hours;
            }
        }
        else {
            this.currentHour = hours;
        }
    }
    selectDate(dateMeta) {
        let date = new Date(dateMeta.year, dateMeta.month, dateMeta.day);
        if (this.showTime) {
            if (this.hourFormat == '12') {
                if (this.currentHour === 12)
                    date.setHours(this.pm ? 12 : 0);
                else
                    date.setHours(this.pm ? this.currentHour + 12 : this.currentHour);
            }
            else {
                date.setHours(this.currentHour);
            }
            date.setMinutes(this.currentMinute);
            date.setSeconds(this.currentSecond);
        }
        if (this.minDate && this.minDate > date) {
            date = this.minDate;
            this.setCurrentHourPM(date.getHours());
            this.currentMinute = date.getMinutes();
            this.currentSecond = date.getSeconds();
        }
        if (this.maxDate && this.maxDate < date) {
            date = this.maxDate;
            this.setCurrentHourPM(date.getHours());
            this.currentMinute = date.getMinutes();
            this.currentSecond = date.getSeconds();
        }
        if (this.isSingleSelection()) {
            this.updateModel(date);
        }
        else if (this.isMultipleSelection()) {
            this.updateModel(this.value ? [...this.value, date] : [date]);
        }
        else if (this.isRangeSelection()) {
            if (this.value && this.value.length) {
                let startDate = this.value[0];
                let endDate = this.value[1];
                if (!endDate && date.getTime() >= startDate.getTime()) {
                    endDate = date;
                }
                else {
                    startDate = date;
                    endDate = null;
                }
                this.updateModel([startDate, endDate]);
            }
            else {
                this.updateModel([date, null]);
            }
        }
        this.onSelect.emit(date);
    }
    updateModel(value) {
        this.value = value;
        if (this.dataType == 'date') {
            this.onModelChange(this.value);
        }
        else if (this.dataType == 'string') {
            if (this.isSingleSelection()) {
                this.onModelChange(this.formatDateTime(this.value));
            }
            else {
                let stringArrValue = null;
                if (this.value) {
                    stringArrValue = this.value.map(date => this.formatDateTime(date));
                }
                this.onModelChange(stringArrValue);
            }
        }
    }
    getFirstDayOfMonthIndex(month, year) {
        let day = new Date();
        day.setDate(1);
        day.setMonth(month);
        day.setFullYear(year);
        let dayIndex = day.getDay() + this.getSundayIndex();
        return dayIndex >= 7 ? dayIndex - 7 : dayIndex;
    }
    getDaysCountInMonth(month, year) {
        return 32 - this.daylightSavingAdjust(new Date(year, month, 32)).getDate();
    }
    getDaysCountInPrevMonth(month, year) {
        let prev = this.getPreviousMonthAndYear(month, year);
        return this.getDaysCountInMonth(prev.month, prev.year);
    }
    getPreviousMonthAndYear(month, year) {
        let m, y;
        if (month === 0) {
            m = 11;
            y = year - 1;
        }
        else {
            m = month - 1;
            y = year;
        }
        return { 'month': m, 'year': y };
    }
    getNextMonthAndYear(month, year) {
        let m, y;
        if (month === 11) {
            m = 0;
            y = year + 1;
        }
        else {
            m = month + 1;
            y = year;
        }
        return { 'month': m, 'year': y };
    }
    getSundayIndex() {
        return this.firstDayOfWeek > 0 ? 7 - this.firstDayOfWeek : 0;
    }
    isSelected(dateMeta) {
        if (this.value) {
            if (this.isSingleSelection()) {
                return this.isDateEquals(this.value, dateMeta);
            }
            else if (this.isMultipleSelection()) {
                let selected = false;
                for (let date of this.value) {
                    selected = this.isDateEquals(date, dateMeta);
                    if (selected) {
                        break;
                    }
                }
                return selected;
            }
            else if (this.isRangeSelection()) {
                if (this.value[1])
                    return this.isDateEquals(this.value[0], dateMeta) || this.isDateEquals(this.value[1], dateMeta) || this.isDateBetween(this.value[0], this.value[1], dateMeta);
                else
                    return this.isDateEquals(this.value[0], dateMeta);
            }
        }
        else {
            return false;
        }
    }
    isMonthSelected(month) {
        let day = this.value ? (Array.isArray(this.value) ? this.value[0].getDate() : this.value.getDate()) : 1;
        return this.isSelected({ year: this.currentYear, month: month, day: day, selectable: true });
    }
    isDateEquals(value, dateMeta) {
        if (value)
            return value.getDate() === dateMeta.day && value.getMonth() === dateMeta.month && value.getFullYear() === dateMeta.year;
        else
            return false;
    }
    isDateBetween(start, end, dateMeta) {
        let between = false;
        if (start && end) {
            let date = new Date(dateMeta.year, dateMeta.month, dateMeta.day);
            return start.getTime() <= date.getTime() && end.getTime() >= date.getTime();
        }
        return between;
    }
    isSingleSelection() {
        return this.selectionMode === 'single';
    }
    isRangeSelection() {
        return this.selectionMode === 'range';
    }
    isMultipleSelection() {
        return this.selectionMode === 'multiple';
    }
    isToday(today, day, month, year) {
        return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
    }
    isSelectable(day, month, year, otherMonth) {
        let validMin = true;
        let validMax = true;
        let validDate = true;
        let validDay = true;
        if (otherMonth && !this.selectOtherMonths) {
            return false;
        }
        if (this.minDate) {
            if (this.minDate.getFullYear() > year) {
                validMin = false;
            }
            else if (this.minDate.getFullYear() === year) {
                if (this.minDate.getMonth() > month) {
                    validMin = false;
                }
                else if (this.minDate.getMonth() === month) {
                    if (this.minDate.getDate() > day) {
                        validMin = false;
                    }
                }
            }
        }
        if (this.maxDate) {
            if (this.maxDate.getFullYear() < year) {
                validMax = false;
            }
            else if (this.maxDate.getFullYear() === year) {
                if (this.maxDate.getMonth() < month) {
                    validMax = false;
                }
                else if (this.maxDate.getMonth() === month) {
                    if (this.maxDate.getDate() < day) {
                        validMax = false;
                    }
                }
            }
        }
        if (this.disabledDates) {
            validDate = !this.isDateDisabled(day, month, year);
        }
        if (this.disabledDays) {
            validDay = !this.isDayDisabled(day, month, year);
        }
        return validMin && validMax && validDate && validDay;
    }
    isDateDisabled(day, month, year) {
        if (this.disabledDates) {
            for (let disabledDate of this.disabledDates) {
                if (disabledDate.getFullYear() === year && disabledDate.getMonth() === month && disabledDate.getDate() === day) {
                    return true;
                }
            }
        }
        return false;
    }
    isDayDisabled(day, month, year) {
        if (this.disabledDays) {
            let weekday = new Date(year, month, day);
            let weekdayNumber = weekday.getDay();
            return this.disabledDays.indexOf(weekdayNumber) !== -1;
        }
        return false;
    }
    onInputFocus(event) {
        this.focus = true;
        if (this.showOnFocus) {
            this.showOverlay();
        }
        this.onFocus.emit(event);
    }
    onInputClick() {
        if (this.overlay && this.autoZIndex) {
            this.overlay.style.zIndex = String(this.baseZIndex + (++DomHandler.zindex));
        }
        if (this.showOnFocus && !this.overlayVisible) {
            this.showOverlay();
        }
    }
    onInputBlur(event) {
        this.focus = false;
        this.onBlur.emit(event);
        if (!this.keepInvalid) {
            this.updateInputfield();
        }
        this.onModelTouched();
    }
    onButtonClick(event, inputfield) {
        if (!this.overlayVisible) {
            inputfield.focus();
            this.showOverlay();
        }
        else {
            this.hideOverlay();
        }
    }
    onPrevButtonClick(event) {
        this.navigationState = { backward: true, button: true };
        this.navBackward(event);
    }
    onNextButtonClick(event) {
        this.navigationState = { backward: false, button: true };
        this.navForward(event);
    }
    onContainerButtonKeydown(event) {
        switch (event.which) {
            //tab
            case 9:
                if (!this.inline) {
                    this.trapFocus(event);
                }
                break;
            //escape
            case 27:
                this.overlayVisible = false;
                event.preventDefault();
                break;
            default:
                //Noop
                break;
        }
    }
    onInputKeydown(event) {
        this.isKeydown = true;
        if (event.keyCode === 40 && this.contentViewChild) {
            this.trapFocus(event);
        }
        else if (event.keyCode === 27) {
            if (this.overlayVisible) {
                this.overlayVisible = false;
                event.preventDefault();
            }
        }
        else if (event.keyCode === 13) {
            if (this.overlayVisible) {
                this.overlayVisible = false;
                event.preventDefault();
            }
        }
        else if (event.keyCode === 9 && this.contentViewChild) {
            DomHandler.getFocusableElements(this.contentViewChild.nativeElement).forEach(el => el.tabIndex = '-1');
            if (this.overlayVisible) {
                this.overlayVisible = false;
            }
        }
    }
    onDateCellKeydown(event, date, groupIndex) {
        const cellContent = event.currentTarget;
        const cell = cellContent.parentElement;
        switch (event.which) {
            //down arrow
            case 40: {
                cellContent.tabIndex = '-1';
                let cellIndex = DomHandler.index(cell);
                let nextRow = cell.parentElement.nextElementSibling;
                if (nextRow) {
                    let focusCell = nextRow.children[cellIndex].children[0];
                    if (DomHandler.hasClass(focusCell, 'p-disabled')) {
                        this.navigationState = { backward: false };
                        this.navForward(event);
                    }
                    else {
                        nextRow.children[cellIndex].children[0].tabIndex = '0';
                        nextRow.children[cellIndex].children[0].focus();
                    }
                }
                else {
                    this.navigationState = { backward: false };
                    this.navForward(event);
                }
                event.preventDefault();
                break;
            }
            //up arrow
            case 38: {
                cellContent.tabIndex = '-1';
                let cellIndex = DomHandler.index(cell);
                let prevRow = cell.parentElement.previousElementSibling;
                if (prevRow) {
                    let focusCell = prevRow.children[cellIndex].children[0];
                    if (DomHandler.hasClass(focusCell, 'p-disabled')) {
                        this.navigationState = { backward: true };
                        this.navBackward(event);
                    }
                    else {
                        focusCell.tabIndex = '0';
                        focusCell.focus();
                    }
                }
                else {
                    this.navigationState = { backward: true };
                    this.navBackward(event);
                }
                event.preventDefault();
                break;
            }
            //left arrow
            case 37: {
                cellContent.tabIndex = '-1';
                let prevCell = cell.previousElementSibling;
                if (prevCell) {
                    let focusCell = prevCell.children[0];
                    if (DomHandler.hasClass(focusCell, 'p-disabled') || DomHandler.hasClass(focusCell.parentElement, 'p-datepicker-weeknumber')) {
                        this.navigateToMonth(true, groupIndex);
                    }
                    else {
                        focusCell.tabIndex = '0';
                        focusCell.focus();
                    }
                }
                else {
                    this.navigateToMonth(true, groupIndex);
                }
                event.preventDefault();
                break;
            }
            //right arrow
            case 39: {
                cellContent.tabIndex = '-1';
                let nextCell = cell.nextElementSibling;
                if (nextCell) {
                    let focusCell = nextCell.children[0];
                    if (DomHandler.hasClass(focusCell, 'p-disabled')) {
                        this.navigateToMonth(false, groupIndex);
                    }
                    else {
                        focusCell.tabIndex = '0';
                        focusCell.focus();
                    }
                }
                else {
                    this.navigateToMonth(false, groupIndex);
                }
                event.preventDefault();
                break;
            }
            //enter
            case 13: {
                this.onDateSelect(event, date);
                event.preventDefault();
                break;
            }
            //escape
            case 27: {
                this.overlayVisible = false;
                event.preventDefault();
                break;
            }
            //tab
            case 9: {
                if (!this.inline) {
                    this.trapFocus(event);
                }
                break;
            }
            default:
                //no op
                break;
        }
    }
    onMonthCellKeydown(event, index) {
        const cell = event.currentTarget;
        switch (event.which) {
            //arrows
            case 38:
            case 40: {
                cell.tabIndex = '-1';
                var cells = cell.parentElement.children;
                var cellIndex = DomHandler.index(cell);
                let nextCell = cells[event.which === 40 ? cellIndex + 3 : cellIndex - 3];
                if (nextCell) {
                    nextCell.tabIndex = '0';
                    nextCell.focus();
                }
                event.preventDefault();
                break;
            }
            //left arrow
            case 37: {
                cell.tabIndex = '-1';
                let prevCell = cell.previousElementSibling;
                if (prevCell) {
                    prevCell.tabIndex = '0';
                    prevCell.focus();
                }
                event.preventDefault();
                break;
            }
            //right arrow
            case 39: {
                cell.tabIndex = '-1';
                let nextCell = cell.nextElementSibling;
                if (nextCell) {
                    nextCell.tabIndex = '0';
                    nextCell.focus();
                }
                event.preventDefault();
                break;
            }
            //enter
            case 13: {
                this.onMonthSelect(event, index);
                event.preventDefault();
                break;
            }
            //escape
            case 27: {
                this.overlayVisible = false;
                event.preventDefault();
                break;
            }
            //tab
            case 9: {
                if (!this.inline) {
                    this.trapFocus(event);
                }
                break;
            }
            default:
                //no op
                break;
        }
    }
    navigateToMonth(prev, groupIndex) {
        if (prev) {
            if (this.numberOfMonths === 1 || (groupIndex === 0)) {
                this.navigationState = { backward: true };
                this.navBackward(event);
            }
            else {
                let prevMonthContainer = this.contentViewChild.nativeElement.children[groupIndex - 1];
                let cells = DomHandler.find(prevMonthContainer, '.p-datepicker-calendar td span:not(.p-disabled):not(.p-ink)');
                let focusCell = cells[cells.length - 1];
                focusCell.tabIndex = '0';
                focusCell.focus();
            }
        }
        else {
            if (this.numberOfMonths === 1 || (groupIndex === this.numberOfMonths - 1)) {
                this.navigationState = { backward: false };
                this.navForward(event);
            }
            else {
                let nextMonthContainer = this.contentViewChild.nativeElement.children[groupIndex + 1];
                let focusCell = DomHandler.findSingle(nextMonthContainer, '.p-datepicker-calendar td span:not(.p-disabled):not(.p-ink)');
                focusCell.tabIndex = '0';
                focusCell.focus();
            }
        }
    }
    updateFocus() {
        let cell;
        if (this.navigationState) {
            if (this.navigationState.button) {
                this.initFocusableCell();
                if (this.navigationState.backward)
                    DomHandler.findSingle(this.contentViewChild.nativeElement, '.p-datepicker-prev').focus();
                else
                    DomHandler.findSingle(this.contentViewChild.nativeElement, '.p-datepicker-next').focus();
            }
            else {
                if (this.navigationState.backward) {
                    let cells = DomHandler.find(this.contentViewChild.nativeElement, '.p-datepicker-calendar td span:not(.p-disabled):not(.p-ink)');
                    cell = cells[cells.length - 1];
                }
                else {
                    cell = DomHandler.findSingle(this.contentViewChild.nativeElement, '.p-datepicker-calendar td span:not(.p-disabled):not(.p-ink)');
                }
                if (cell) {
                    cell.tabIndex = '0';
                    cell.focus();
                }
            }
            this.navigationState = null;
        }
        else {
            this.initFocusableCell();
        }
    }
    initFocusableCell() {
        let cell;
        if (this.view === 'month') {
            let cells = DomHandler.find(this.contentViewChild.nativeElement, '.p-monthpicker .p-monthpicker-month:not(.p-disabled)');
            let selectedCell = DomHandler.findSingle(this.contentViewChild.nativeElement, '.p-monthpicker .p-monthpicker-month.p-highlight');
            cells.forEach(cell => cell.tabIndex = -1);
            cell = selectedCell || cells[0];
            if (cells.length === 0) {
                let disabledCells = DomHandler.find(this.contentViewChild.nativeElement, '.p-monthpicker .p-monthpicker-month.p-disabled[tabindex = "0"]');
                disabledCells.forEach(cell => cell.tabIndex = -1);
            }
        }
        else {
            cell = DomHandler.findSingle(this.contentViewChild.nativeElement, 'span.p-highlight');
            if (!cell) {
                let todayCell = DomHandler.findSingle(this.contentViewChild.nativeElement, 'td.p-datepicker-today span:not(.p-disabled):not(.p-ink)');
                if (todayCell)
                    cell = todayCell;
                else
                    cell = DomHandler.findSingle(this.contentViewChild.nativeElement, '.p-datepicker-calendar td span:not(.p-disabled):not(.p-ink)');
            }
        }
        if (cell) {
            cell.tabIndex = '0';
        }
    }
    trapFocus(event) {
        let focusableElements = DomHandler.getFocusableElements(this.contentViewChild.nativeElement);
        if (focusableElements && focusableElements.length > 0) {
            if (!focusableElements[0].ownerDocument.activeElement) {
                focusableElements[0].focus();
            }
            else {
                let focusedIndex = focusableElements.indexOf(focusableElements[0].ownerDocument.activeElement);
                if (event.shiftKey) {
                    if (focusedIndex == -1 || focusedIndex === 0) {
                        if (this.focusTrap) {
                            focusableElements[focusableElements.length - 1].focus();
                        }
                        else {
                            if (focusedIndex === -1)
                                return this.hideOverlay();
                            else if (focusedIndex === 0)
                                return;
                        }
                    }
                    else {
                        focusableElements[focusedIndex - 1].focus();
                    }
                }
                else {
                    if (focusedIndex == -1 || focusedIndex === (focusableElements.length - 1)) {
                        if (!this.focusTrap && focusedIndex != -1)
                            return this.hideOverlay();
                        else
                            focusableElements[0].focus();
                    }
                    else {
                        focusableElements[focusedIndex + 1].focus();
                    }
                }
            }
        }
        event.preventDefault();
    }
    onMonthDropdownChange(m) {
        this.currentMonth = parseInt(m);
        this.onMonthChange.emit({ month: this.currentMonth + 1, year: this.currentYear });
        this.createMonths(this.currentMonth, this.currentYear);
    }
    onYearDropdownChange(y) {
        this.currentYear = parseInt(y);
        this.onYearChange.emit({ month: this.currentMonth + 1, year: this.currentYear });
        this.createMonths(this.currentMonth, this.currentYear);
    }
    validateTime(hour, minute, second, pm) {
        let value = this.value;
        const convertedHour = this.convertTo24Hour(hour, pm);
        if (this.isRangeSelection()) {
            value = this.value[1] || this.value[0];
        }
        if (this.isMultipleSelection()) {
            value = this.value[this.value.length - 1];
        }
        const valueDateString = value ? value.toDateString() : null;
        if (this.minDate && valueDateString && this.minDate.toDateString() === valueDateString) {
            if (this.minDate.getHours() > convertedHour) {
                return false;
            }
            if (this.minDate.getHours() === convertedHour) {
                if (this.minDate.getMinutes() > minute) {
                    return false;
                }
                if (this.minDate.getMinutes() === minute) {
                    if (this.minDate.getSeconds() > second) {
                        return false;
                    }
                }
            }
        }
        if (this.maxDate && valueDateString && this.maxDate.toDateString() === valueDateString) {
            if (this.maxDate.getHours() < convertedHour) {
                return false;
            }
            if (this.maxDate.getHours() === convertedHour) {
                if (this.maxDate.getMinutes() < minute) {
                    return false;
                }
                if (this.maxDate.getMinutes() === minute) {
                    if (this.maxDate.getSeconds() < second) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    incrementHour(event) {
        const prevHour = this.currentHour;
        let newHour = this.currentHour + this.stepHour;
        let newPM = this.pm;
        if (this.hourFormat == '24')
            newHour = (newHour >= 24) ? (newHour - 24) : newHour;
        else if (this.hourFormat == '12') {
            // Before the AM/PM break, now after
            if (prevHour < 12 && newHour > 11) {
                newPM = !this.pm;
            }
            newHour = (newHour >= 13) ? (newHour - 12) : newHour;
        }
        if (this.validateTime(newHour, this.currentMinute, this.currentSecond, newPM)) {
            this.currentHour = newHour;
            this.pm = newPM;
        }
        event.preventDefault();
    }
    onTimePickerElementMouseDown(event, type, direction) {
        if (!this.disabled) {
            this.repeat(event, null, type, direction);
            event.preventDefault();
        }
    }
    onTimePickerElementMouseUp(event) {
        if (!this.disabled) {
            this.clearTimePickerTimer();
            this.updateTime();
        }
    }
    onTimePickerElementMouseLeave() {
        if (!this.disabled && this.timePickerTimer) {
            this.clearTimePickerTimer();
            this.updateTime();
        }
    }
    repeat(event, interval, type, direction) {
        let i = interval || 500;
        this.clearTimePickerTimer();
        this.timePickerTimer = setTimeout(() => {
            this.repeat(event, 100, type, direction);
            this.cd.markForCheck();
        }, i);
        switch (type) {
            case 0:
                if (direction === 1)
                    this.incrementHour(event);
                else
                    this.decrementHour(event);
                break;
            case 1:
                if (direction === 1)
                    this.incrementMinute(event);
                else
                    this.decrementMinute(event);
                break;
            case 2:
                if (direction === 1)
                    this.incrementSecond(event);
                else
                    this.decrementSecond(event);
                break;
        }
        this.updateInputfield();
    }
    clearTimePickerTimer() {
        if (this.timePickerTimer) {
            clearTimeout(this.timePickerTimer);
            this.timePickerTimer = null;
        }
    }
    decrementHour(event) {
        let newHour = this.currentHour - this.stepHour;
        let newPM = this.pm;
        if (this.hourFormat == '24')
            newHour = (newHour < 0) ? (24 + newHour) : newHour;
        else if (this.hourFormat == '12') {
            // If we were at noon/midnight, then switch
            if (this.currentHour === 12) {
                newPM = !this.pm;
            }
            newHour = (newHour <= 0) ? (12 + newHour) : newHour;
        }
        if (this.validateTime(newHour, this.currentMinute, this.currentSecond, newPM)) {
            this.currentHour = newHour;
            this.pm = newPM;
        }
        event.preventDefault();
    }
    incrementMinute(event) {
        let newMinute = this.currentMinute + this.stepMinute;
        newMinute = (newMinute > 59) ? newMinute - 60 : newMinute;
        if (this.validateTime(this.currentHour, newMinute, this.currentSecond, this.pm)) {
            this.currentMinute = newMinute;
        }
        event.preventDefault();
    }
    decrementMinute(event) {
        let newMinute = this.currentMinute - this.stepMinute;
        newMinute = (newMinute < 0) ? 60 + newMinute : newMinute;
        if (this.validateTime(this.currentHour, newMinute, this.currentSecond, this.pm)) {
            this.currentMinute = newMinute;
        }
        event.preventDefault();
    }
    incrementSecond(event) {
        let newSecond = this.currentSecond + this.stepSecond;
        newSecond = (newSecond > 59) ? newSecond - 60 : newSecond;
        if (this.validateTime(this.currentHour, this.currentMinute, newSecond, this.pm)) {
            this.currentSecond = newSecond;
        }
        event.preventDefault();
    }
    decrementSecond(event) {
        let newSecond = this.currentSecond - this.stepSecond;
        newSecond = (newSecond < 0) ? 60 + newSecond : newSecond;
        if (this.validateTime(this.currentHour, this.currentMinute, newSecond, this.pm)) {
            this.currentSecond = newSecond;
        }
        event.preventDefault();
    }
    updateTime() {
        let value = this.value;
        if (this.isRangeSelection()) {
            value = this.value[1] || this.value[0];
        }
        if (this.isMultipleSelection()) {
            value = this.value[this.value.length - 1];
        }
        value = value ? new Date(value.getTime()) : new Date();
        if (this.hourFormat == '12') {
            if (this.currentHour === 12)
                value.setHours(this.pm ? 12 : 0);
            else
                value.setHours(this.pm ? this.currentHour + 12 : this.currentHour);
        }
        else {
            value.setHours(this.currentHour);
        }
        value.setMinutes(this.currentMinute);
        value.setSeconds(this.currentSecond);
        if (this.isRangeSelection()) {
            if (this.value[1])
                value = [this.value[0], value];
            else
                value = [value, null];
        }
        if (this.isMultipleSelection()) {
            value = [...this.value.slice(0, -1), value];
        }
        this.updateModel(value);
        this.onSelect.emit(value);
        this.updateInputfield();
    }
    toggleAMPM(event) {
        const newPM = !this.pm;
        if (this.validateTime(this.currentHour, this.currentMinute, this.currentSecond, newPM)) {
            this.pm = newPM;
            this.updateTime();
        }
        event.preventDefault();
    }
    onUserInput(event) {
        // IE 11 Workaround for input placeholder : https://github.com/primefaces/primeng/issues/2026
        if (!this.isKeydown) {
            return;
        }
        this.isKeydown = false;
        let val = event.target.value;
        try {
            let value = this.parseValueFromString(val);
            if (this.isValidSelection(value)) {
                this.updateModel(value);
                this.updateUI();
            }
        }
        catch (err) {
            //invalid date
            this.updateModel(null);
        }
        this.filled = val != null && val.length;
        this.onInput.emit(event);
    }
    isValidSelection(value) {
        let isValid = true;
        if (this.isSingleSelection()) {
            if (!this.isSelectable(value.getDate(), value.getMonth(), value.getFullYear(), false)) {
                isValid = false;
            }
        }
        else if (value.every(v => this.isSelectable(v.getDate(), v.getMonth(), v.getFullYear(), false))) {
            if (this.isRangeSelection()) {
                isValid = value.length > 1 && value[1] > value[0] ? true : false;
            }
        }
        return isValid;
    }
    parseValueFromString(text) {
        if (!text || text.trim().length === 0) {
            return null;
        }
        let value;
        if (this.isSingleSelection()) {
            value = this.parseDateTime(text);
        }
        else if (this.isMultipleSelection()) {
            let tokens = text.split(this.multipleSeparator);
            value = [];
            for (let token of tokens) {
                value.push(this.parseDateTime(token.trim()));
            }
        }
        else if (this.isRangeSelection()) {
            let tokens = text.split(' ' + this.rangeSeparator + ' ');
            value = [];
            for (let i = 0; i < tokens.length; i++) {
                value[i] = this.parseDateTime(tokens[i].trim());
            }
        }
        return value;
    }
    parseDateTime(text) {
        let date;
        let parts = text.split(' ');
        if (this.timeOnly) {
            date = new Date();
            this.populateTime(date, parts[0], parts[1]);
        }
        else {
            const dateFormat = this.getDateFormat();
            if (this.showTime) {
                let ampm = this.hourFormat == '12' ? parts.pop() : null;
                let timeString = parts.pop();
                date = this.parseDate(parts.join(' '), dateFormat);
                this.populateTime(date, timeString, ampm);
            }
            else {
                date = this.parseDate(text, dateFormat);
            }
        }
        return date;
    }
    populateTime(value, timeString, ampm) {
        if (this.hourFormat == '12' && !ampm) {
            throw 'Invalid Time';
        }
        this.pm = (ampm === 'PM' || ampm === 'pm');
        let time = this.parseTime(timeString);
        value.setHours(time.hour);
        value.setMinutes(time.minute);
        value.setSeconds(time.second);
    }
    updateUI() {
        let val = this.value || this.defaultDate || new Date();
        if (Array.isArray(val)) {
            val = val[0];
        }
        this.currentMonth = val.getMonth();
        this.currentYear = val.getFullYear();
        this.createMonths(this.currentMonth, this.currentYear);
        if (this.showTime || this.timeOnly) {
            this.setCurrentHourPM(val.getHours());
            this.currentMinute = val.getMinutes();
            this.currentSecond = val.getSeconds();
        }
    }
    showOverlay() {
        if (!this.overlayVisible) {
            this.updateUI();
            this.overlayVisible = true;
        }
    }
    hideOverlay() {
        this.overlayVisible = false;
        this.clearTimePickerTimer();
        if (this.touchUI) {
            this.disableModality();
        }
        this.cd.markForCheck();
    }
    toggle() {
        if (!this.inline) {
            if (!this.overlayVisible) {
                this.showOverlay();
                this.inputfieldViewChild.nativeElement.focus();
            }
            else {
                this.hideOverlay();
            }
        }
    }
    onOverlayAnimationStart(event) {
        switch (event.toState) {
            case 'visible':
            case 'visibleTouchUI':
                if (!this.inline) {
                    this.overlay = event.element;
                    this.appendOverlay();
                    if (this.autoZIndex) {
                        this.overlay.style.zIndex = String(this.baseZIndex + (++DomHandler.zindex));
                    }
                    this.alignOverlay();
                    this.onShow.emit(event);
                }
                break;
            case 'void':
                this.onOverlayHide();
                this.onClose.emit(event);
                break;
        }
    }
    onOverlayAnimationDone(event) {
        switch (event.toState) {
            case 'visible':
            case 'visibleTouchUI':
                if (!this.inline) {
                    this.bindDocumentClickListener();
                    this.bindDocumentResizeListener();
                    this.bindScrollListener();
                }
                break;
        }
    }
    appendOverlay() {
        if (this.appendTo) {
            if (this.appendTo === 'body')
                document.body.appendChild(this.overlay);
            else
                DomHandler.appendChild(this.overlay, this.appendTo);
        }
    }
    restoreOverlayAppend() {
        if (this.overlay && this.appendTo) {
            this.el.nativeElement.appendChild(this.overlay);
        }
    }
    alignOverlay() {
        if (this.touchUI) {
            this.enableModality(this.overlay);
        }
        else {
            if (this.appendTo)
                DomHandler.absolutePosition(this.overlay, this.inputfieldViewChild.nativeElement);
            else
                DomHandler.relativePosition(this.overlay, this.inputfieldViewChild.nativeElement);
        }
    }
    enableModality(element) {
        if (!this.mask) {
            this.mask = document.createElement('div');
            this.mask.style.zIndex = String(parseInt(element.style.zIndex) - 1);
            let maskStyleClass = 'p-component-overlay p-datepicker-mask p-datepicker-mask-scrollblocker';
            DomHandler.addMultipleClasses(this.mask, maskStyleClass);
            this.maskClickListener = this.renderer.listen(this.mask, 'click', (event) => {
                this.disableModality();
            });
            document.body.appendChild(this.mask);
            DomHandler.addClass(document.body, 'p-overflow-hidden');
        }
    }
    disableModality() {
        if (this.mask) {
            document.body.removeChild(this.mask);
            let bodyChildren = document.body.children;
            let hasBlockerMasks;
            for (let i = 0; i < bodyChildren.length; i++) {
                let bodyChild = bodyChildren[i];
                if (DomHandler.hasClass(bodyChild, 'p-datepicker-mask-scrollblocker')) {
                    hasBlockerMasks = true;
                    break;
                }
            }
            if (!hasBlockerMasks) {
                DomHandler.removeClass(document.body, 'p-overflow-hidden');
            }
            this.unbindMaskClickListener();
            this.mask = null;
        }
    }
    unbindMaskClickListener() {
        if (this.maskClickListener) {
            this.maskClickListener();
            this.maskClickListener = null;
        }
    }
    writeValue(value) {
        this.value = value;
        if (this.value && typeof this.value === 'string') {
            this.value = this.parseValueFromString(this.value);
        }
        this.updateInputfield();
        this.updateUI();
        this.cd.markForCheck();
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
    getDateFormat() {
        return this.dateFormat;
    }
    // Ported from jquery-ui datepicker formatDate
    formatDate(date, format) {
        if (!date) {
            return '';
        }
        let iFormat;
        const lookAhead = (match) => {
            const matches = (iFormat + 1 < format.length && format.charAt(iFormat + 1) === match);
            if (matches) {
                iFormat++;
            }
            return matches;
        }, formatNumber = (match, value, len) => {
            let num = '' + value;
            if (lookAhead(match)) {
                while (num.length < len) {
                    num = '0' + num;
                }
            }
            return num;
        }, formatName = (match, value, shortNames, longNames) => {
            return (lookAhead(match) ? longNames[value] : shortNames[value]);
        };
        let output = '';
        let literal = false;
        if (date) {
            for (iFormat = 0; iFormat < format.length; iFormat++) {
                if (literal) {
                    if (format.charAt(iFormat) === '\'' && !lookAhead('\'')) {
                        literal = false;
                    }
                    else {
                        output += format.charAt(iFormat);
                    }
                }
                else {
                    switch (format.charAt(iFormat)) {
                        case 'd':
                            output += formatNumber('d', date.getDate(), 2);
                            break;
                        case 'D':
                            output += formatName('D', date.getDay(), this.getTranslation(TranslationKeys.DAY_NAMES_SHORT), this.getTranslation(TranslationKeys.DAY_NAMES));
                            break;
                        case 'o':
                            output += formatNumber('o', Math.round((new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() -
                                new Date(date.getFullYear(), 0, 0).getTime()) / 86400000), 3);
                            break;
                        case 'm':
                            output += formatNumber('m', date.getMonth() + 1, 2);
                            break;
                        case 'M':
                            output += formatName('M', date.getMonth(), this.getTranslation(TranslationKeys.MONTH_NAMES_SHORT), this.getTranslation(TranslationKeys.MONTH_NAMES));
                            break;
                        case 'y':
                            output += lookAhead('y') ? date.getFullYear() : (date.getFullYear() % 100 < 10 ? '0' : '') + (date.getFullYear() % 100);
                            break;
                        case '@':
                            output += date.getTime();
                            break;
                        case '!':
                            output += date.getTime() * 10000 + this.ticksTo1970;
                            break;
                        case '\'':
                            if (lookAhead('\'')) {
                                output += '\'';
                            }
                            else {
                                literal = true;
                            }
                            break;
                        default:
                            output += format.charAt(iFormat);
                    }
                }
            }
        }
        return output;
    }
    formatTime(date) {
        if (!date) {
            return '';
        }
        let output = '';
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();
        if (this.hourFormat == '12' && hours > 11 && hours != 12) {
            hours -= 12;
        }
        if (this.hourFormat == '12') {
            output += hours === 0 ? 12 : (hours < 10) ? '0' + hours : hours;
        }
        else {
            output += (hours < 10) ? '0' + hours : hours;
        }
        output += ':';
        output += (minutes < 10) ? '0' + minutes : minutes;
        if (this.showSeconds) {
            output += ':';
            output += (seconds < 10) ? '0' + seconds : seconds;
        }
        if (this.hourFormat == '12') {
            output += date.getHours() > 11 ? ' PM' : ' AM';
        }
        return output;
    }
    parseTime(value) {
        let tokens = value.split(':');
        let validTokenLength = this.showSeconds ? 3 : 2;
        if (tokens.length !== validTokenLength) {
            throw "Invalid time";
        }
        let h = parseInt(tokens[0]);
        let m = parseInt(tokens[1]);
        let s = this.showSeconds ? parseInt(tokens[2]) : null;
        if (isNaN(h) || isNaN(m) || h > 23 || m > 59 || (this.hourFormat == '12' && h > 12) || (this.showSeconds && (isNaN(s) || s > 59))) {
            throw "Invalid time";
        }
        else {
            if (this.hourFormat == '12') {
                if (h !== 12 && this.pm) {
                    h += 12;
                }
                else if (!this.pm && h === 12) {
                    h -= 12;
                }
            }
            return { hour: h, minute: m, second: s };
        }
    }
    // Ported from jquery-ui datepicker parseDate
    parseDate(value, format) {
        if (format == null || value == null) {
            throw "Invalid arguments";
        }
        value = (typeof value === "object" ? value.toString() : value + "");
        if (value === "") {
            return null;
        }
        let iFormat, dim, extra, iValue = 0, shortYearCutoff = (typeof this.shortYearCutoff !== "string" ? this.shortYearCutoff : new Date().getFullYear() % 100 + parseInt(this.shortYearCutoff, 10)), year = -1, month = -1, day = -1, doy = -1, literal = false, date, lookAhead = (match) => {
            let matches = (iFormat + 1 < format.length && format.charAt(iFormat + 1) === match);
            if (matches) {
                iFormat++;
            }
            return matches;
        }, getNumber = (match) => {
            let isDoubled = lookAhead(match), size = (match === "@" ? 14 : (match === "!" ? 20 :
                (match === "y" && isDoubled ? 4 : (match === "o" ? 3 : 2)))), minSize = (match === "y" ? size : 1), digits = new RegExp("^\\d{" + minSize + "," + size + "}"), num = value.substring(iValue).match(digits);
            if (!num) {
                throw "Missing number at position " + iValue;
            }
            iValue += num[0].length;
            return parseInt(num[0], 10);
        }, getName = (match, shortNames, longNames) => {
            let index = -1;
            let arr = lookAhead(match) ? longNames : shortNames;
            let names = [];
            for (let i = 0; i < arr.length; i++) {
                names.push([i, arr[i]]);
            }
            names.sort((a, b) => {
                return -(a[1].length - b[1].length);
            });
            for (let i = 0; i < names.length; i++) {
                let name = names[i][1];
                if (value.substr(iValue, name.length).toLowerCase() === name.toLowerCase()) {
                    index = names[i][0];
                    iValue += name.length;
                    break;
                }
            }
            if (index !== -1) {
                return index + 1;
            }
            else {
                throw "Unknown name at position " + iValue;
            }
        }, checkLiteral = () => {
            if (value.charAt(iValue) !== format.charAt(iFormat)) {
                throw "Unexpected literal at position " + iValue;
            }
            iValue++;
        };
        if (this.view === 'month') {
            day = 1;
        }
        for (iFormat = 0; iFormat < format.length; iFormat++) {
            if (literal) {
                if (format.charAt(iFormat) === "'" && !lookAhead("'")) {
                    literal = false;
                }
                else {
                    checkLiteral();
                }
            }
            else {
                switch (format.charAt(iFormat)) {
                    case "d":
                        day = getNumber("d");
                        break;
                    case "D":
                        getName("D", this.getTranslation(TranslationKeys.DAY_NAMES_SHORT), this.getTranslation(TranslationKeys.DAY_NAMES));
                        break;
                    case "o":
                        doy = getNumber("o");
                        break;
                    case "m":
                        month = getNumber("m");
                        break;
                    case "M":
                        month = getName("M", this.getTranslation(TranslationKeys.MONTH_NAMES_SHORT), this.getTranslation(TranslationKeys.MONTH_NAMES));
                        break;
                    case "y":
                        year = getNumber("y");
                        break;
                    case "@":
                        date = new Date(getNumber("@"));
                        year = date.getFullYear();
                        month = date.getMonth() + 1;
                        day = date.getDate();
                        break;
                    case "!":
                        date = new Date((getNumber("!") - this.ticksTo1970) / 10000);
                        year = date.getFullYear();
                        month = date.getMonth() + 1;
                        day = date.getDate();
                        break;
                    case "'":
                        if (lookAhead("'")) {
                            checkLiteral();
                        }
                        else {
                            literal = true;
                        }
                        break;
                    default:
                        checkLiteral();
                }
            }
        }
        if (iValue < value.length) {
            extra = value.substr(iValue);
            if (!/^\s+/.test(extra)) {
                throw "Extra/unparsed characters found in date: " + extra;
            }
        }
        if (year === -1) {
            year = new Date().getFullYear();
        }
        else if (year < 100) {
            year += new Date().getFullYear() - new Date().getFullYear() % 100 +
                (year <= shortYearCutoff ? 0 : -100);
        }
        if (doy > -1) {
            month = 1;
            day = doy;
            do {
                dim = this.getDaysCountInMonth(year, month - 1);
                if (day <= dim) {
                    break;
                }
                month++;
                day -= dim;
            } while (true);
        }
        date = this.daylightSavingAdjust(new Date(year, month - 1, day));
        if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
            throw "Invalid date"; // E.g. 31/02/00
        }
        return date;
    }
    daylightSavingAdjust(date) {
        if (!date) {
            return null;
        }
        date.setHours(date.getHours() > 12 ? date.getHours() + 2 : 0);
        return date;
    }
    updateFilledState() {
        this.filled = this.inputFieldValue && this.inputFieldValue != '';
    }
    onTodayButtonClick(event) {
        let date = new Date();
        let dateMeta = { day: date.getDate(), month: date.getMonth(), year: date.getFullYear(), otherMonth: date.getMonth() !== this.currentMonth || date.getFullYear() !== this.currentYear, today: true, selectable: true };
        this.onDateSelect(event, dateMeta);
        this.onTodayClick.emit(event);
    }
    onClearButtonClick(event) {
        this.updateModel(null);
        this.updateInputfield();
        this.hideOverlay();
        this.onClearClick.emit(event);
    }
    bindDocumentClickListener() {
        if (!this.documentClickListener) {
            this.zone.runOutsideAngular(() => {
                const documentTarget = this.el ? this.el.nativeElement.ownerDocument : 'document';
                this.documentClickListener = this.renderer.listen(documentTarget, 'click', (event) => {
                    if (this.isOutsideClicked(event) && this.overlayVisible) {
                        this.zone.run(() => {
                            this.hideOverlay();
                            this.onClickOutside.emit(event);
                            this.cd.markForCheck();
                        });
                    }
                });
            });
        }
    }
    unbindDocumentClickListener() {
        if (this.documentClickListener) {
            this.documentClickListener();
            this.documentClickListener = null;
        }
    }
    bindDocumentResizeListener() {
        if (!this.documentResizeListener && !this.touchUI) {
            this.documentResizeListener = this.onWindowResize.bind(this);
            window.addEventListener('resize', this.documentResizeListener);
        }
    }
    unbindDocumentResizeListener() {
        if (this.documentResizeListener) {
            window.removeEventListener('resize', this.documentResizeListener);
            this.documentResizeListener = null;
        }
    }
    bindScrollListener() {
        if (!this.scrollHandler) {
            this.scrollHandler = new ConnectedOverlayScrollHandler(this.containerViewChild.nativeElement, () => {
                if (this.overlayVisible) {
                    this.hideOverlay();
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
    isOutsideClicked(event) {
        return !(this.el.nativeElement.isSameNode(event.target) || this.isNavIconClicked(event) ||
            this.el.nativeElement.contains(event.target) || (this.overlay && this.overlay.contains(event.target)));
    }
    isNavIconClicked(event) {
        return (DomHandler.hasClass(event.target, 'p-datepicker-prev') || DomHandler.hasClass(event.target, 'p-datepicker-prev-icon')
            || DomHandler.hasClass(event.target, 'p-datepicker-next') || DomHandler.hasClass(event.target, 'p-datepicker-next-icon'));
    }
    onWindowResize() {
        if (this.overlayVisible && !DomHandler.isAndroid()) {
            this.hideOverlay();
        }
    }
    onOverlayHide() {
        this.unbindDocumentClickListener();
        this.unbindMaskClickListener();
        this.unbindDocumentResizeListener();
        this.unbindScrollListener();
        this.overlay = null;
        this.disableModality();
    }
    ngOnDestroy() {
        if (this.scrollHandler) {
            this.scrollHandler.destroy();
            this.scrollHandler = null;
        }
        if (this.translationSubscription) {
            this.translationSubscription.unsubscribe();
        }
        this.clearTimePickerTimer();
        this.restoreOverlayAppend();
        this.onOverlayHide();
    }
}
Calendar.decorators = [
    { type: Component, args: [{
                selector: 'p-calendar',
                template: `
        <span #container [ngClass]="{'p-calendar':true, 'p-calendar-w-btn': showIcon, 'p-calendar-timeonly': timeOnly, 'p-calendar-disabled':disabled, 'p-focus': focus}" [ngStyle]="style" [class]="styleClass">
            <ng-template [ngIf]="!inline">
                <input #inputfield type="text" [attr.id]="inputId" [attr.name]="name" [attr.required]="required" [attr.aria-required]="required" [value]="inputFieldValue" (focus)="onInputFocus($event)" (keydown)="onInputKeydown($event)" (click)="onInputClick()" (blur)="onInputBlur($event)"
                    [readonly]="readonlyInput" (input)="onUserInput($event)" [ngStyle]="inputStyle" [class]="inputStyleClass" [placeholder]="placeholder||''" [disabled]="disabled" [attr.tabindex]="tabindex" [attr.inputmode]="touchUI ? 'off' : null"
                    [ngClass]="'p-inputtext p-component'" autocomplete="off" [attr.aria-labelledby]="ariaLabelledBy"
                    ><button type="button" [icon]="icon" pButton pRipple *ngIf="showIcon" (click)="onButtonClick($event,inputfield)" class="p-datepicker-trigger"
                    [disabled]="disabled" tabindex="0"></button>
            </ng-template>
            <div #contentWrapper [class]="panelStyleClass" [ngStyle]="panelStyle" [ngClass]="{'p-datepicker p-component': true, 'p-datepicker-inline':inline,
                'p-disabled':disabled,'p-datepicker-timeonly':timeOnly,'p-datepicker-multiple-month': this.numberOfMonths > 1, 'p-datepicker-monthpicker': (view === 'month'), 'p-datepicker-touch-ui': touchUI}"
                [@overlayAnimation]="touchUI ? {value: 'visibleTouchUI', params: {showTransitionParams: showTransitionOptions, hideTransitionParams: hideTransitionOptions}}:
                                            {value: 'visible', params: {showTransitionParams: showTransitionOptions, hideTransitionParams: hideTransitionOptions}}"
                                            [@.disabled]="inline === true" (@overlayAnimation.start)="onOverlayAnimationStart($event)" (@overlayAnimation.done)="onOverlayAnimationDone($event)" *ngIf="inline || overlayVisible">
                <ng-content select="p-header"></ng-content>
                <ng-container *ngTemplateOutlet="headerTemplate"></ng-container>
                <ng-container *ngIf="!timeOnly">
                    <div class="p-datepicker-group-container">
                        <div class="p-datepicker-group" *ngFor="let month of months; let i = index;">
                            <div class="p-datepicker-header">
                                <button (keydown)="onContainerButtonKeydown($event)" class="p-datepicker-prev p-link" (click)="onPrevButtonClick($event)" *ngIf="i === 0" type="button" pRipple>
                                    <span class="p-datepicker-prev-icon pi pi-chevron-left"></span>
                                </button>
                                <div class="p-datepicker-title">
                                    <span class="p-datepicker-month" *ngIf="!monthNavigator && (view !== 'month')">{{getTranslation('monthNames')[month.month]}}</span>
                                    <select tabindex="0" class="p-datepicker-month" *ngIf="monthNavigator && (view !== 'month') && numberOfMonths === 1" (change)="onMonthDropdownChange($event.target.value)">
                                        <option [value]="i" *ngFor="let monthName of getTranslation('monthNames');let i = index" [selected]="i === month.month">{{monthName}}</option>
                                    </select>
                                    <select tabindex="0" class="p-datepicker-year" *ngIf="yearNavigator && numberOfMonths === 1" (change)="onYearDropdownChange($event.target.value)">
                                        <option [value]="year" *ngFor="let year of yearOptions" [selected]="year === currentYear">{{year}}</option>
                                    </select>
                                    <span class="p-datepicker-year" *ngIf="!yearNavigator">{{view === 'month' ? currentYear : month.year}}</span>
                                </div>
                                <button (keydown)="onContainerButtonKeydown($event)" class="p-datepicker-next p-link" (click)="onNextButtonClick($event)" *ngIf="numberOfMonths === 1 ? true : (i === numberOfMonths -1)" type="button" pRipple>
                                    <span class="p-datepicker-next-icon pi pi-chevron-right"></span>
                                </button>
                            </div>
                            <div class="p-datepicker-calendar-container" *ngIf="view ==='date'">
                                <table class="p-datepicker-calendar">
                                    <thead>
                                        <tr>
                                            <th *ngIf="showWeek" class="p-datepicker-weekheader p-disabled">
                                                <span>{{getTranslation('weekHeader')}}</span>
                                            </th>
                                            <th scope="col" *ngFor="let weekDay of weekDays;let begin = first; let end = last">
                                                <span>{{weekDay}}</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr *ngFor="let week of month.dates; let j = index;">
                                            <td *ngIf="showWeek" class="p-datepicker-weeknumber">
                                                <span class="p-disabled">
                                                    {{month.weekNumbers[j]}}
                                                </span>
                                            </td>
                                            <td *ngFor="let date of week" [ngClass]="{'p-datepicker-other-month': date.otherMonth,'p-datepicker-today':date.today}">
                                                <ng-container *ngIf="date.otherMonth ? showOtherMonths : true">
                                                    <span [ngClass]="{'p-highlight':isSelected(date), 'p-disabled': !date.selectable}"
                                                        (click)="onDateSelect($event,date)" draggable="false" (keydown)="onDateCellKeydown($event,date,i)" pRipple>
                                                        <ng-container *ngIf="!dateTemplate">{{date.day}}</ng-container>
                                                        <ng-container *ngTemplateOutlet="dateTemplate; context: {$implicit: date}"></ng-container>
                                                    </span>
                                                </ng-container>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div class="p-monthpicker" *ngIf="view === 'month'">
                        <span *ngFor="let m of monthPickerValues; let i = index" (click)="onMonthSelect($event, i)" (keydown)="onMonthCellKeydown($event,i)" class="p-monthpicker-month" [ngClass]="{'p-highlight': isMonthSelected(i), 'p-disabled':!isSelectable(1, i, this.currentYear, false)}" pRipple>
                            {{m}}
                        </span>
                    </div>
                </ng-container>
                <div class="p-timepicker" *ngIf="showTime||timeOnly">
                    <div class="p-hour-picker">
                        <button class="p-link" type="button" (keydown)="onContainerButtonKeydown($event)" (keydown.enter)="incrementHour($event)" (mousedown)="onTimePickerElementMouseDown($event, 0, 1)" (mouseup)="onTimePickerElementMouseUp($event)" (mouseleave)="onTimePickerElementMouseLeave()" pRipple>
                            <span class="pi pi-chevron-up"></span>
                        </button>
                        <span><ng-container *ngIf="currentHour < 10">0</ng-container>{{currentHour}}</span>
                        <button class="p-link" type="button" (keydown)="onContainerButtonKeydown($event)" (keydown.enter)="decrementHour($event)" (mousedown)="onTimePickerElementMouseDown($event, 0, -1)" (mouseup)="onTimePickerElementMouseUp($event)" (mouseleave)="onTimePickerElementMouseLeave()" pRipple>
                            <span class="pi pi-chevron-down"></span>
                        </button>
                    </div>
                    <div class="p-separator">
                        <span>{{timeSeparator}}</span>
                    </div>
                    <div class="p-minute-picker">
                        <button class="p-link" type="button" (keydown)="onContainerButtonKeydown($event)" (keydown.enter)="incrementMinute($event)" (mousedown)="onTimePickerElementMouseDown($event, 1, 1)" (mouseup)="onTimePickerElementMouseUp($event)" (mouseleave)="onTimePickerElementMouseLeave()" pRipple>
                            <span class="pi pi-chevron-up"></span>
                        </button>
                        <span><ng-container *ngIf="currentMinute < 10">0</ng-container>{{currentMinute}}</span>
                        <button class="p-link" type="button" (keydown)="onContainerButtonKeydown($event)" (keydown.enter)="decrementMinute($event)" (mousedown)="onTimePickerElementMouseDown($event, 1, -1)" (mouseup)="onTimePickerElementMouseUp($event)" (mouseleave)="onTimePickerElementMouseLeave()" pRipple>
                            <span class="pi pi-chevron-down"></span>
                        </button>
                    </div>
                    <div class="p-separator" *ngIf="showSeconds">
                        <span>{{timeSeparator}}</span>
                    </div>
                    <div class="p-second-picker" *ngIf="showSeconds">
                        <button class="p-link" type="button" (keydown)="onContainerButtonKeydown($event)" (keydown.enter)="incrementSecond($event)" (mousedown)="onTimePickerElementMouseDown($event, 2, 1)" (mouseup)="onTimePickerElementMouseUp($event)" (mouseleave)="onTimePickerElementMouseLeave()" pRipple>
                            <span class="pi pi-chevron-up"></span>
                        </button>
                        <span><ng-container *ngIf="currentSecond < 10">0</ng-container>{{currentSecond}}</span>
                        <button class="p-link" type="button" (keydown)="onContainerButtonKeydown($event)" (keydown.enter)="decrementSecond($event)" (mousedown)="onTimePickerElementMouseDown($event, 2, -1)" (mouseup)="onTimePickerElementMouseUp($event)" (mouseleave)="onTimePickerElementMouseLeave()" pRipple>
                            <span class="pi pi-chevron-down"></span>
                        </button>
                    </div>
                    <div class="p-ampm-picker" *ngIf="hourFormat=='12'">
                        <button class="p-link" type="button" (keydown)="onContainerButtonKeydown($event)" (click)="toggleAMPM($event)" (keydown.enter)="toggleAMPM($event)" pRipple>
                            <span class="pi pi-chevron-up"></span>
                        </button>
                        <span>{{pm ? 'PM' : 'AM'}}</span>
                        <button class="p-link" type="button" (keydown)="onContainerButtonKeydown($event)" (click)="toggleAMPM($event)" (keydown.enter)="toggleAMPM($event)" pRipple>
                            <span class="pi pi-chevron-down"></span>
                        </button>
                    </div>
                </div>
                <div class="p-datepicker-buttonbar" *ngIf="showButtonBar">
                    <button type="button" [label]="getTranslation('today')" (keydown)="onContainerButtonKeydown($event)" (click)="onTodayButtonClick($event)" pButton pRipple [ngClass]="[todayButtonStyleClass]"></button>
                    <button type="button" [label]="getTranslation('clear')" (keydown)="onContainerButtonKeydown($event)" (click)="onClearButtonClick($event)" pButton pRipple [ngClass]="[clearButtonStyleClass]"></button>
                </div>
                <ng-content select="p-footer"></ng-content>
                <ng-container *ngTemplateOutlet="footerTemplate"></ng-container>
            </div>
        </span>
    `,
                animations: [
                    trigger('overlayAnimation', [
                        state('visibleTouchUI', style({
                            transform: 'translate(-50%,-50%)',
                            opacity: 1
                        })),
                        transition('void => visible', [
                            style({ opacity: 0, transform: 'scaleY(0.8)' }),
                            animate('{{showTransitionParams}}', style({ opacity: 1, transform: '*' }))
                        ]),
                        transition('visible => void', [
                            animate('{{hideTransitionParams}}', style({ opacity: 0 }))
                        ]),
                        transition('void => visibleTouchUI', [
                            style({ opacity: 0, transform: 'translate3d(-50%, -40%, 0) scale(0.9)' }),
                            animate('{{showTransitionParams}}')
                        ]),
                        transition('visibleTouchUI => void', [
                            animate(('{{hideTransitionParams}}'), style({
                                opacity: 0,
                                transform: 'translate3d(-50%, -40%, 0) scale(0.9)'
                            }))
                        ])
                    ])
                ],
                host: {
                    '[class.p-inputwrapper-filled]': 'filled',
                    '[class.p-inputwrapper-focus]': 'focus'
                },
                providers: [CALENDAR_VALUE_ACCESSOR],
                changeDetection: ChangeDetectionStrategy.OnPush,
                encapsulation: ViewEncapsulation.None,
                styles: [".p-calendar{display:inline-flex;position:relative}.p-calendar .p-inputtext{flex:1 1 auto;width:1%}.p-calendar-w-btn .p-inputtext{border-bottom-right-radius:0;border-top-right-radius:0}.p-calendar-w-btn .p-datepicker-trigger{border-bottom-left-radius:0;border-top-left-radius:0}.p-fluid .p-calendar{display:flex}.p-fluid .p-calendar .p-inputtext{width:1%}.p-calendar .p-datepicker{min-width:100%}.p-datepicker{position:absolute;width:auto}.p-datepicker-inline{position:static}.p-datepicker-header{align-items:center;display:flex;justify-content:space-between}.p-datepicker-header .p-datepicker-title{margin:0 auto}.p-datepicker-next,.p-datepicker-prev{align-items:center;cursor:pointer;display:inline-flex;justify-content:center;overflow:hidden;position:relative}.p-datepicker-multiple-month .p-datepicker-group-container{display:flex}.p-datepicker table{border-collapse:collapse;width:100%}.p-datepicker td>span{display:flex;margin:0 auto}.p-datepicker td>span,.p-monthpicker-month{align-items:center;cursor:pointer;justify-content:center;overflow:hidden;position:relative}.p-monthpicker-month{display:inline-flex;width:33.3%}.p-datepicker-buttonbar{align-items:center;display:flex;justify-content:space-between}.p-timepicker,.p-timepicker button{align-items:center;display:flex;justify-content:center}.p-timepicker button{cursor:pointer;overflow:hidden;position:relative}.p-timepicker>div{align-items:center;display:flex;flex-direction:column}.p-calendar .p-datepicker-touch-ui,.p-datepicker-touch-ui{left:50%;min-width:80vw;position:fixed;top:50%;transform:translate(-50%,-50%)}"]
            },] }
];
Calendar.ctorParameters = () => [
    { type: ElementRef },
    { type: Renderer2 },
    { type: ChangeDetectorRef },
    { type: NgZone },
    { type: PrimeNGConfig }
];
Calendar.propDecorators = {
    style: [{ type: Input }],
    styleClass: [{ type: Input }],
    inputStyle: [{ type: Input }],
    inputId: [{ type: Input }],
    name: [{ type: Input }],
    inputStyleClass: [{ type: Input }],
    placeholder: [{ type: Input }],
    ariaLabelledBy: [{ type: Input }],
    disabled: [{ type: Input }],
    dateFormat: [{ type: Input }],
    multipleSeparator: [{ type: Input }],
    rangeSeparator: [{ type: Input }],
    inline: [{ type: Input }],
    showOtherMonths: [{ type: Input }],
    selectOtherMonths: [{ type: Input }],
    showIcon: [{ type: Input }],
    icon: [{ type: Input }],
    appendTo: [{ type: Input }],
    readonlyInput: [{ type: Input }],
    shortYearCutoff: [{ type: Input }],
    monthNavigator: [{ type: Input }],
    yearNavigator: [{ type: Input }],
    hourFormat: [{ type: Input }],
    timeOnly: [{ type: Input }],
    stepHour: [{ type: Input }],
    stepMinute: [{ type: Input }],
    stepSecond: [{ type: Input }],
    showSeconds: [{ type: Input }],
    required: [{ type: Input }],
    showOnFocus: [{ type: Input }],
    showWeek: [{ type: Input }],
    dataType: [{ type: Input }],
    selectionMode: [{ type: Input }],
    maxDateCount: [{ type: Input }],
    showButtonBar: [{ type: Input }],
    todayButtonStyleClass: [{ type: Input }],
    clearButtonStyleClass: [{ type: Input }],
    autoZIndex: [{ type: Input }],
    baseZIndex: [{ type: Input }],
    panelStyleClass: [{ type: Input }],
    panelStyle: [{ type: Input }],
    keepInvalid: [{ type: Input }],
    hideOnDateTimeSelect: [{ type: Input }],
    numberOfMonths: [{ type: Input }],
    view: [{ type: Input }],
    touchUI: [{ type: Input }],
    timeSeparator: [{ type: Input }],
    focusTrap: [{ type: Input }],
    firstDayOfWeek: [{ type: Input }],
    showTransitionOptions: [{ type: Input }],
    hideTransitionOptions: [{ type: Input }],
    onFocus: [{ type: Output }],
    onBlur: [{ type: Output }],
    onClose: [{ type: Output }],
    onSelect: [{ type: Output }],
    onInput: [{ type: Output }],
    onTodayClick: [{ type: Output }],
    onClearClick: [{ type: Output }],
    onMonthChange: [{ type: Output }],
    onYearChange: [{ type: Output }],
    onClickOutside: [{ type: Output }],
    onShow: [{ type: Output }],
    templates: [{ type: ContentChildren, args: [PrimeTemplate,] }],
    tabindex: [{ type: Input }],
    containerViewChild: [{ type: ViewChild, args: ['container', { static: false },] }],
    inputfieldViewChild: [{ type: ViewChild, args: ['inputfield', { static: false },] }],
    content: [{ type: ViewChild, args: ['contentWrapper', { static: false },] }],
    defaultDate: [{ type: Input }],
    minDate: [{ type: Input }],
    maxDate: [{ type: Input }],
    disabledDates: [{ type: Input }],
    disabledDays: [{ type: Input }],
    yearRange: [{ type: Input }],
    showTime: [{ type: Input }],
    locale: [{ type: Input }]
};
export class CalendarModule {
}
CalendarModule.decorators = [
    { type: NgModule, args: [{
                imports: [CommonModule, ButtonModule, SharedModule, RippleModule],
                exports: [Calendar, ButtonModule, SharedModule],
                declarations: [Calendar]
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsZW5kYXIuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4vc3JjL2FwcC9jb21wb25lbnRzL2NhbGVuZGFyLyIsInNvdXJjZXMiOlsiY2FsZW5kYXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFFBQVEsRUFBQyxTQUFTLEVBQUMsVUFBVSxFQUFrQixLQUFLLEVBQUMsTUFBTSxFQUFDLFlBQVksRUFBQyxVQUFVLEVBQUMsU0FBUyxFQUM3RixTQUFTLEVBQUMsaUJBQWlCLEVBQWEsZUFBZSxFQUFXLE1BQU0sRUFBQyx1QkFBdUIsRUFBRSxpQkFBaUIsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUNsSixPQUFPLEVBQUMsT0FBTyxFQUFDLEtBQUssRUFBQyxLQUFLLEVBQUMsVUFBVSxFQUFDLE9BQU8sRUFBZ0IsTUFBTSxxQkFBcUIsQ0FBQztBQUMxRixPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDN0MsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQzVDLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUM1QyxPQUFPLEVBQUMsVUFBVSxFQUFFLDZCQUE2QixFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQ3RFLE9BQU8sRUFBQyxZQUFZLEVBQUMsYUFBYSxFQUFDLGFBQWEsRUFBQyxlQUFlLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDckYsT0FBTyxFQUFDLGlCQUFpQixFQUF1QixNQUFNLGdCQUFnQixDQUFDO0FBR3ZFLE1BQU0sQ0FBQyxNQUFNLHVCQUF1QixHQUFRO0lBQ3hDLE9BQU8sRUFBRSxpQkFBaUI7SUFDMUIsV0FBVyxFQUFFLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUM7SUFDdkMsS0FBSyxFQUFFLElBQUk7Q0FDZCxDQUFDO0FBc0xGLE1BQU0sT0FBTyxRQUFRO0lBNFZqQixZQUFtQixFQUFjLEVBQVMsUUFBbUIsRUFBUyxFQUFxQixFQUFV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QUUsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUN6RCxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUU7WUFDN0UsSUFBSSxDQUFDLGFBQWEsR0FBRyxTQUFTLENBQUM7U0FDbEM7UUFFRCxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7SUFDM0IsQ0FBQztJQUVELGVBQWUsQ0FBQyxLQUFLO1FBQ2pCLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUNyRCxTQUFTLEdBQUcsQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUMxRCxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUU7WUFDN0UsSUFBSSxDQUFDLGFBQWEsR0FBRyxTQUFTLENBQUM7U0FDbEM7UUFFRCxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7SUFDM0IsQ0FBQztJQUVELGVBQWUsQ0FBQyxLQUFLO1FBQ2pCLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztRQUNyRCxTQUFTLEdBQUcsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUN6RCxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUU7WUFDN0UsSUFBSSxDQUFDLGFBQWEsR0FB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O2dCQUNOLE9BQU8sRUFBRSxDQUFDLFlBQVksRUFBQyxZQUFZLEVBQUMsWUFBWSxFQUFDLFlBQVksQ0FBQztnQkFDOUQsT0FBTyxFQUFFLENBQUMsUUFBUSxFQUFDLFlBQVksRUFBQyxZQUFZLENBQUM7Z0JBQzdDLFlBQVksRUFBRSxDQUFDLFFBQVEsQ0FBQzthQUMzQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TmdNb2R1bGUsQ29tcG9uZW50LEVsZW1lbnRSZWYsT25EZXN0cm95LE9uSW5pdCxJbnB1dCxPdXRwdXQsRXZlbnRFbWl0dGVyLGZvcndhcmRSZWYsUmVuZGVyZXIyLFxyXG4gICAgICAgIFZpZXdDaGlsZCxDaGFuZ2VEZXRlY3RvclJlZixUZW1wbGF0ZVJlZixDb250ZW50Q2hpbGRyZW4sUXVlcnlMaXN0LE5nWm9uZSxDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSwgVmlld0VuY2Fwc3VsYXRpb259IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQge3RyaWdnZXIsc3RhdGUsc3R5bGUsdHJhbnNpdGlvbixhbmltYXRlLEFuaW1hdGlvbkV2ZW50fSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zJztcclxuaW1wb3J0IHtDb21tb25Nb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XHJcbmltcG9ydCB7QnV0dG9uTW9kdWxlfSBmcm9tICdwcmltZW5nL2J1dHRvbic7XHJcbmltcG9ydCB7UmlwcGxlTW9kdWxlfSBmcm9tICdwcmltZW5nL3JpcHBsZSc7XHJcbmltcG9ydCB7RG9tSGFuZGxlciwgQ29ubmVjdGVkT3ZlcmxheVNjcm9sbEhhbmRsZXJ9IGZyb20gJ3ByaW1lbmcvZG9tJztcclxuaW1wb3J0IHtTaGFyZWRNb2R1bGUsUHJpbWVUZW1wbGF0ZSxQcmltZU5HQ29uZmlnLFRyYW5zbGF0aW9uS2V5c30gZnJvbSAncHJpbWVuZy9hcGknO1xyXG5pbXBvcnQge05HX1ZBTFVFX0FDQ0VTU09SLCBDb250cm9sVmFsdWVBY2Nlc3Nvcn0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xyXG5pbXBvcnQge1N1YnNjcmlwdGlvbn0gZnJvbSAncnhqcyc7XHJcblxyXG5leHBvcnQgY29uc3QgQ0FMRU5EQVJfVkFMVUVfQUNDRVNTT1I6IGFueSA9IHtcclxuICAgIHByb3ZpZGU6IE5HX1ZBTFVFX0FDQ0VTU09SLFxyXG4gICAgdXNlRXhpc3Rpbmc6IGZvcndhcmRSZWYoKCkgPT4gQ2FsZW5kYXIpLFxyXG4gICAgbXVsdGk6IHRydWVcclxufTtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgTG9jYWxlU2V0dGluZ3Mge1xyXG4gICAgZmlyc3REYXlPZldlZWs/OiBudW1iZXI7XHJcbiAgICBkYXlOYW1lcz86IHN0cmluZ1tdO1xyXG4gICAgZGF5TmFtZXNTaG9ydD86IHN0cmluZ1tdO1xyXG4gICAgZGF5TmFtZXNNaW4/OiBzdHJpbmdbXTtcclxuICAgIG1vbnRoTmFtZXM/OiBzdHJpbmdbXTtcclxuICAgIG1vbnRoTmFtZXNTaG9ydD86IHN0cmluZ1tdO1xyXG4gICAgdG9kYXk/OiBzdHJpbmc7XHJcbiAgICBjbGVhcj86IHN0cmluZztcclxuICAgIGRhdGVGb3JtYXQ/OiBzdHJpbmc7XHJcbiAgICB3ZWVrSGVhZGVyPzogc3RyaW5nO1xyXG59XHJcblxyXG5AQ29tcG9uZW50KHtcclxuICAgIHNlbGVjdG9yOiAncC1jYWxlbmRhcicsXHJcbiAgICB0ZW1wbGF0ZTogIGBcclxuICAgICAgICA8c3BhbiAjY29udGFpbmVyIFtuZ0NsYXNzXT1cInsncC1jYWxlbmRhcic6dHJ1ZSwgJ3AtY2FsZW5kYXItdy1idG4nOiBzaG93SWNvbiwgJ3AtY2FsZW5kYXItdGltZW9ubHknOiB0aW1lT25seSwgJ3AtY2FsZW5kYXItZGlzYWJsZWQnOmRpc2FibGVkLCAncC1mb2N1cyc6IGZvY3VzfVwiIFtuZ1N0eWxlXT1cInN0eWxlXCIgW2NsYXNzXT1cInN0eWxlQ2xhc3NcIj5cclxuICAgICAgICAgICAgPG5nLXRlbXBsYXRlIFtuZ0lmXT1cIiFpbmxpbmVcIj5cclxuICAgICAgICAgICAgICAgIDxpbnB1dCAjaW5wdXRmaWVsZCB0eXBlPVwidGV4dFwiIFthdHRyLmlkXT1cImlucHV0SWRcIiBbYXR0ci5uYW1lXT1cIm5hbWVcIiBbYXR0ci5yZXF1aXJlZF09XCJyZXF1aXJlZFwiIFthdHRyLmFyaWEtcmVxdWlyZWRdPVwicmVxdWlyZWRcIiBbdmFsdWVdPVwiaW5wdXRGaWVsZFZhbHVlXCIgKGZvY3VzKT1cIm9uSW5wdXRGb2N1cygkZXZlbnQpXCIgKGtleWRvd24pPVwib25JbnB1dEtleWRvd24oJGV2ZW50KVwiIChjbGljayk9XCJvbklucHV0Q2xpY2soKVwiIChibHVyKT1cIm9uSW5wdXRCbHVyKCRldmVudClcIlxyXG4gICAgICAgICAgICAgICAgICAgIFtyZWFkb25seV09XCJyZWFkb25seUlucHV0XCIgKGlucHV0KT1cIm9uVXNlcklucHV0KCRldmVudClcIiBbbmdTdHlsZV09XCJpbnB1dFN0eWxlXCIgW2NsYXNzXT1cImlucHV0U3R5bGVDbGFzc1wiIFtwbGFjZWhvbGRlcl09XCJwbGFjZWhvbGRlcnx8JydcIiBbZGlzYWJsZWRdPVwiZGlzYWJsZWRcIiBbYXR0ci50YWJpbmRleF09XCJ0YWJpbmRleFwiIFthdHRyLmlucHV0bW9kZV09XCJ0b3VjaFVJID8gJ29mZicgOiBudWxsXCJcclxuICAgICAgICAgICAgICAgICAgICBbbmdDbGFzc109XCIncC1pbnB1dHRleHQgcC1jb21wb25lbnQnXCIgYXV0b2NvbXBsZXRlPVwib2ZmXCIgW2F0dHIuYXJpYS1sYWJlbGxlZGJ5XT1cImFyaWFMYWJlbGxlZEJ5XCJcclxuICAgICAgICAgICAgICAgICAgICA+PGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgW2ljb25dPVwiaWNvblwiIHBCdXR0b24gcFJpcHBsZSAqbmdJZj1cInNob3dJY29uXCIgKGNsaWNrKT1cIm9uQnV0dG9uQ2xpY2soJGV2ZW50LGlucHV0ZmllbGQpXCIgY2xhc3M9XCJwLWRhdGVwaWNrZXItdHJpZ2dlclwiXHJcbiAgICAgICAgICAgICAgICAgICAgW2Rpc2FibGVkXT1cImRpc2FibGVkXCIgdGFiaW5kZXg9XCIwXCI+PC9idXR0b24+XHJcbiAgICAgICAgICAgIDwvbmctdGVtcGxhdGU+XHJcbiAgICAgICAgICAgIDxkaXYgI2NvbnRlbnRXcmFwcGVyIFtjbGFzc109XCJwYW5lbFN0eWxlQ2xhc3NcIiBbbmdTdHlsZV09XCJwYW5lbFN0eWxlXCIgW25nQ2xhc3NdPVwieydwLWRhdGVwaWNrZXIgcC1jb21wb25lbnQnOiB0cnVlLCAncC1kYXRlcGlja2VyLWlubGluZSc6aW5saW5lLFxyXG4gICAgICAgICAgICAgICAgJ3AtZGlzYWJsZWQnOmRpc2FibGVkLCdwLWRhdGVwaWNrZXItdGltZW9ubHknOnRpbWVPbmx5LCdwLWRhdGVwaWNrZXItbXVsdGlwbGUtbW9udGgnOiB0aGlzLm51bWJlck9mTW9udGhzID4gMSwgJ3AtZGF0ZXBpY2tlci1tb250aHBpY2tlcic6ICh2aWV3ID09PSAnbW9udGgnKSwgJ3AtZGF0ZXBpY2tlci10b3VjaC11aSc6IHRvdWNoVUl9XCJcclxuICAgICAgICAgICAgICAgIFtAb3ZlcmxheUFuaW1hdGlvbl09XCJ0b3VjaFVJID8ge3ZhbHVlOiAndmlzaWJsZVRvdWNoVUknLCBwYXJhbXM6IHtzaG93VHJhbnNpdGlvblBhcmFtczogc2hvd1RyYW5zaXRpb25PcHRpb25zLCBoaWRlVHJhbnNpdGlvblBhcmFtczogaGlkZVRyYW5zaXRpb25PcHRpb25zfX06XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3ZhbHVlOiAndmlzaWJsZScsIHBhcmFtczoge3Nob3dUcmFuc2l0aW9uUGFyYW1zOiBzaG93VHJhbnNpdGlvbk9wdGlvbnMsIGhpZGVUcmFuc2l0aW9uUGFyYW1zOiBoaWRlVHJhbnNpdGlvbk9wdGlvbnN9fVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW0AuZGlzYWJsZWRdPVwiaW5saW5lID09PSB0cnVlXCIgKEBvdmVybGF5QW5pbWF0aW9uLnN0YXJ0KT1cIm9uT3ZlcmxheUFuaW1hdGlvblN0YXJ0KCRldmVudClcIiAoQG92ZXJsYXlBbmltYXRpb24uZG9uZSk9XCJvbk92ZXJsYXlBbmltYXRpb25Eb25lKCRldmVudClcIiAqbmdJZj1cImlubGluZSB8fCBvdmVybGF5VmlzaWJsZVwiPlxyXG4gICAgICAgICAgICAgICAgPG5nLWNvbnRlbnQgc2VsZWN0PVwicC1oZWFkZXJcIj48L25nLWNvbnRlbnQ+XHJcbiAgICAgICAgICAgICAgICA8bmctY29udGFpbmVyICpuZ1RlbXBsYXRlT3V0bGV0PVwiaGVhZGVyVGVtcGxhdGVcIj48L25nLWNvbnRhaW5lcj5cclxuICAgICAgICAgICAgICAgIDxuZy1jb250YWluZXIgKm5nSWY9XCIhdGltZU9ubHlcIj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicC1kYXRlcGlja2VyLWdyb3VwLWNvbnRhaW5lclwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicC1kYXRlcGlja2VyLWdyb3VwXCIgKm5nRm9yPVwibGV0IG1vbnRoIG9mIG1vbnRoczsgbGV0IGkgPSBpbmRleDtcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwLWRhdGVwaWNrZXItaGVhZGVyXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiAoa2V5ZG93bik9XCJvbkNvbnRhaW5lckJ1dHRvbktleWRvd24oJGV2ZW50KVwiIGNsYXNzPVwicC1kYXRlcGlja2VyLXByZXYgcC1saW5rXCIgKGNsaWNrKT1cIm9uUHJldkJ1dHRvbkNsaWNrKCRldmVudClcIiAqbmdJZj1cImkgPT09IDBcIiB0eXBlPVwiYnV0dG9uXCIgcFJpcHBsZT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJwLWRhdGVwaWNrZXItcHJldi1pY29uIHBpIHBpLWNoZXZyb24tbGVmdFwiPjwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicC1kYXRlcGlja2VyLXRpdGxlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwicC1kYXRlcGlja2VyLW1vbnRoXCIgKm5nSWY9XCIhbW9udGhOYXZpZ2F0b3IgJiYgKHZpZXcgIT09ICdtb250aCcpXCI+e3tnZXRUcmFuc2xhdGlvbignbW9udGhOYW1lcycpW21vbnRoLm1vbnRoXX19PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c2VsZWN0IHRhYmluZGV4PVwiMFwiIGNsYXNzPVwicC1kYXRlcGlja2VyLW1vbnRoXCIgKm5nSWY9XCJtb250aE5hdmlnYXRvciAmJiAodmlldyAhPT0gJ21vbnRoJykgJiYgbnVtYmVyT2ZNb250aHMgPT09IDFcIiAoY2hhbmdlKT1cIm9uTW9udGhEcm9wZG93bkNoYW5nZSgkZXZlbnQudGFyZ2V0LnZhbHVlKVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiBbdmFsdWVdPVwiaVwiICpuZ0Zvcj1cImxldCBtb250aE5hbWUgb2YgZ2V0VHJhbnNsYXRpb24oJ21vbnRoTmFtZXMnKTtsZXQgaSA9IGluZGV4XCIgW3NlbGVjdGVkXT1cImkgPT09IG1vbnRoLm1vbnRoXCI+e3ttb250aE5hbWV9fTwvb3B0aW9uPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NlbGVjdD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNlbGVjdCB0YWJpbmRleD1cIjBcIiBjbGFzcz1cInAtZGF0ZXBpY2tlci15ZWFyXCIgKm5nSWY9XCJ5ZWFyTmF2aWdhdG9yICYmIG51bWJlck9mTW9udGhzID09PSAxXCIgKGNoYW5nZSk9XCJvblllYXJEcm9wZG93bkNoYW5nZSgkZXZlbnQudGFyZ2V0LnZhbHVlKVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiBbdmFsdWVdPVwieWVhclwiICpuZ0Zvcj1cImxldCB5ZWFyIG9mIHllYXJPcHRpb25zXCIgW3NlbGVjdGVkXT1cInllYXIgPT09IGN1cnJlbnRZZWFyXCI+e3t5ZWFyfX08L29wdGlvbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zZWxlY3Q+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwicC1kYXRlcGlja2VyLXllYXJcIiAqbmdJZj1cIiF5ZWFyTmF2aWdhdG9yXCI+e3t2aWV3ID09PSAnbW9udGgnID8gY3VycmVudFllYXIgOiBtb250aC55ZWFyfX08L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiAoa2V5ZG93bik9XCJvbkNvbnRhaW5lckJ1dHRvbktleWRvd24oJGV2ZW50KVwiIGNsYXNzPVwicC1kYXRlcGlja2VyLW5leHQgcC1saW5rXCIgKGNsaWNrKT1cIm9uTmV4dEJ1dHRvbkNsaWNrKCRldmVudClcIiAqbmdJZj1cIm51bWJlck9mTW9udGhzID09PSAxID8gdHJ1ZSA6IChpID09PSBudW1iZXJPZk1vbnRocyAtMSlcIiB0eXBlPVwiYnV0dG9uXCIgcFJpcHBsZT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJwLWRhdGVwaWNrZXItbmV4dC1pY29uIHBpIHBpLWNoZXZyb24tcmlnaHRcIj48L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwLWRhdGVwaWNrZXItY2FsZW5kYXItY29udGFpbmVyXCIgKm5nSWY9XCJ2aWV3ID09PSdkYXRlJ1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0YWJsZSBjbGFzcz1cInAtZGF0ZXBpY2tlci1jYWxlbmRhclwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGhlYWQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dHI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRoICpuZ0lmPVwic2hvd1dlZWtcIiBjbGFzcz1cInAtZGF0ZXBpY2tlci13ZWVraGVhZGVyIHAtZGlzYWJsZWRcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4+e3tnZXRUcmFuc2xhdGlvbignd2Vla0hlYWRlcicpfX08L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90aD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGggc2NvcGU9XCJjb2xcIiAqbmdGb3I9XCJsZXQgd2Vla0RheSBvZiB3ZWVrRGF5cztsZXQgYmVnaW4gPSBmaXJzdDsgbGV0IGVuZCA9IGxhc3RcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4+e3t3ZWVrRGF5fX08L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC90aD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdHI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGhlYWQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0Ym9keT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0ciAqbmdGb3I9XCJsZXQgd2VlayBvZiBtb250aC5kYXRlczsgbGV0IGogPSBpbmRleDtcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgKm5nSWY9XCJzaG93V2Vla1wiIGNsYXNzPVwicC1kYXRlcGlja2VyLXdlZWtudW1iZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJwLWRpc2FibGVkXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7e21vbnRoLndlZWtOdW1iZXJzW2pdfX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkICpuZ0Zvcj1cImxldCBkYXRlIG9mIHdlZWtcIiBbbmdDbGFzc109XCJ7J3AtZGF0ZXBpY2tlci1vdGhlci1tb250aCc6IGRhdGUub3RoZXJNb250aCwncC1kYXRlcGlja2VyLXRvZGF5JzpkYXRlLnRvZGF5fVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bmctY29udGFpbmVyICpuZ0lmPVwiZGF0ZS5vdGhlck1vbnRoID8gc2hvd090aGVyTW9udGhzIDogdHJ1ZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gW25nQ2xhc3NdPVwieydwLWhpZ2hsaWdodCc6aXNTZWxlY3RlZChkYXRlKSwgJ3AtZGlzYWJsZWQnOiAhZGF0ZS5zZWxlY3RhYmxlfVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKGNsaWNrKT1cIm9uRGF0ZVNlbGVjdCgkZXZlbnQsZGF0ZSlcIiBkcmFnZ2FibGU9XCJmYWxzZVwiIChrZXlkb3duKT1cIm9uRGF0ZUNlbGxLZXlkb3duKCRldmVudCxkYXRlLGkpXCIgcFJpcHBsZT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bmctY29udGFpbmVyICpuZ0lmPVwiIWRhdGVUZW1wbGF0ZVwiPnt7ZGF0ZS5kYXl9fTwvbmctY29udGFpbmVyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxuZy1jb250YWluZXIgKm5nVGVtcGxhdGVPdXRsZXQ9XCJkYXRlVGVtcGxhdGU7IGNvbnRleHQ6IHskaW1wbGljaXQ6IGRhdGV9XCI+PC9uZy1jb250YWluZXI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbmctY29udGFpbmVyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3Rib2R5PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvdGFibGU+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInAtbW9udGhwaWNrZXJcIiAqbmdJZj1cInZpZXcgPT09ICdtb250aCdcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gKm5nRm9yPVwibGV0IG0gb2YgbW9udGhQaWNrZXJWYWx1ZXM7IGxldCBpID0gaW5kZXhcIiAoY2xpY2spPVwib25Nb250aFNlbGVjdCgkZXZlbnQsIGkpXCIgKGtleWRvd24pPVwib25Nb250aENlbGxLZXlkb3duKCRldmVudCxpKVwiIGNsYXNzPVwicC1tb250aHBpY2tlci1tb250aFwiIFtuZ0NsYXNzXT1cInsncC1oaWdobGlnaHQnOiBpc01vbnRoU2VsZWN0ZWQoaSksICdwLWRpc2FibGVkJzohaXNTZWxlY3RhYmxlKDEsIGksIHRoaXMuY3VycmVudFllYXIsIGZhbHNlKX1cIiBwUmlwcGxlPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge3ttfX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9uZy1jb250YWluZXI+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicC10aW1lcGlja2VyXCIgKm5nSWY9XCJzaG93VGltZXx8dGltZU9ubHlcIj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicC1ob3VyLXBpY2tlclwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwicC1saW5rXCIgdHlwZT1cImJ1dHRvblwiIChrZXlkb3duKT1cIm9uQ29udGFpbmVyQnV0dG9uS2V5ZG93bigkZXZlbnQpXCIgKGtleWRvd24uZW50ZXIpPVwiaW5jcmVtZW50SG91cigkZXZlbnQpXCIgKG1vdXNlZG93bik9XCJvblRpbWVQaWNrZXJFbGVtZW50TW91c2VEb3duKCRldmVudCwgMCwgMSlcIiAobW91c2V1cCk9XCJvblRpbWVQaWNrZXJFbGVtZW50TW91c2VVcCgkZXZlbnQpXCIgKG1vdXNlbGVhdmUpPVwib25UaW1lUGlja2VyRWxlbWVudE1vdXNlTGVhdmUoKVwiIHBSaXBwbGU+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInBpIHBpLWNoZXZyb24tdXBcIj48L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj48bmctY29udGFpbmVyICpuZ0lmPVwiY3VycmVudEhvdXIgPCAxMFwiPjA8L25nLWNvbnRhaW5lcj57e2N1cnJlbnRIb3VyfX08L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJwLWxpbmtcIiB0eXBlPVwiYnV0dG9uXCIgKGtleWRvd24pPVwib25Db250YWluZXJCdXR0b25LZXlkb3duKCRldmVudClcIiAoa2V5ZG93bi5lbnRlcik9XCJkZWNyZW1lbnRIb3VyKCRldmVudClcIiAobW91c2Vkb3duKT1cIm9uVGltZVBpY2tlckVsZW1lbnRNb3VzZURvd24oJGV2ZW50LCAwLCAtMSlcIiAobW91c2V1cCk9XCJvblRpbWVQaWNrZXJFbGVtZW50TW91c2VVcCgkZXZlbnQpXCIgKG1vdXNlbGVhdmUpPVwib25UaW1lUGlja2VyRWxlbWVudE1vdXNlTGVhdmUoKVwiIHBSaXBwbGU+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInBpIHBpLWNoZXZyb24tZG93blwiPjwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInAtc2VwYXJhdG9yXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuPnt7dGltZVNlcGFyYXRvcn19PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwLW1pbnV0ZS1waWNrZXJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cInAtbGlua1wiIHR5cGU9XCJidXR0b25cIiAoa2V5ZG93bik9XCJvbkNvbnRhaW5lckJ1dHRvbktleWRvd24oJGV2ZW50KVwiIChrZXlkb3duLmVudGVyKT1cImluY3JlbWVudE1pbnV0ZSgkZXZlbnQpXCIgKG1vdXNlZG93bik9XCJvblRpbWVQaWNrZXJFbGVtZW50TW91c2VEb3duKCRldmVudCwgMSwgMSlcIiAobW91c2V1cCk9XCJvblRpbWVQaWNrZXJFbGVtZW50TW91c2VVcCgkZXZlbnQpXCIgKG1vdXNlbGVhdmUpPVwib25UaW1lUGlja2VyRWxlbWVudE1vdXNlTGVhdmUoKVwiIHBSaXBwbGU+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInBpIHBpLWNoZXZyb24tdXBcIj48L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj48bmctY29udGFpbmVyICpuZ0lmPVwiY3VycmVudE1pbnV0ZSA8IDEwXCI+MDwvbmctY29udGFpbmVyPnt7Y3VycmVudE1pbnV0ZX19PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwicC1saW5rXCIgdHlwZT1cImJ1dHRvblwiIChrZXlkb3duKT1cIm9uQ29udGFpbmVyQnV0dG9uS2V5ZG93bigkZXZlbnQpXCIgKGtleWRvd24uZW50ZXIpPVwiZGVjcmVtZW50TWludXRlKCRldmVudClcIiAobW91c2Vkb3duKT1cIm9uVGltZVBpY2tlckVsZW1lbnRNb3VzZURvd24oJGV2ZW50LCAxLCAtMSlcIiAobW91c2V1cCk9XCJvblRpbWVQaWNrZXJFbGVtZW50TW91c2VVcCgkZXZlbnQpXCIgKG1vdXNlbGVhdmUpPVwib25UaW1lUGlja2VyRWxlbWVudE1vdXNlTGVhdmUoKVwiIHBSaXBwbGU+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInBpIHBpLWNoZXZyb24tZG93blwiPjwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInAtc2VwYXJhdG9yXCIgKm5nSWY9XCJzaG93U2Vjb25kc1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj57e3RpbWVTZXBhcmF0b3J9fTwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicC1zZWNvbmQtcGlja2VyXCIgKm5nSWY9XCJzaG93U2Vjb25kc1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwicC1saW5rXCIgdHlwZT1cImJ1dHRvblwiIChrZXlkb3duKT1cIm9uQ29udGFpbmVyQnV0dG9uS2V5ZG93bigkZXZlbnQpXCIgKGtleWRvd24uZW50ZXIpPVwiaW5jcmVtZW50U2Vjb25kKCRldmVudClcIiAobW91c2Vkb3duKT1cIm9uVGltZVBpY2tlckVsZW1lbnRNb3VzZURvd24oJGV2ZW50LCAyLCAxKVwiIChtb3VzZXVwKT1cIm9uVGltZVBpY2tlckVsZW1lbnRNb3VzZVVwKCRldmVudClcIiAobW91c2VsZWF2ZSk9XCJvblRpbWVQaWNrZXJFbGVtZW50TW91c2VMZWF2ZSgpXCIgcFJpcHBsZT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwicGkgcGktY2hldnJvbi11cFwiPjwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuPjxuZy1jb250YWluZXIgKm5nSWY9XCJjdXJyZW50U2Vjb25kIDwgMTBcIj4wPC9uZy1jb250YWluZXI+e3tjdXJyZW50U2Vjb25kfX08L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJwLWxpbmtcIiB0eXBlPVwiYnV0dG9uXCIgKGtleWRvd24pPVwib25Db250YWluZXJCdXR0b25LZXlkb3duKCRldmVudClcIiAoa2V5ZG93bi5lbnRlcik9XCJkZWNyZW1lbnRTZWNvbmQoJGV2ZW50KVwiIChtb3VzZWRvd24pPVwib25UaW1lUGlja2VyRWxlbWVudE1vdXNlRG93bigkZXZlbnQsIDIsIC0xKVwiIChtb3VzZXVwKT1cIm9uVGltZVBpY2tlckVsZW1lbnRNb3VzZVVwKCRldmVudClcIiAobW91c2VsZWF2ZSk9XCJvblRpbWVQaWNrZXJFbGVtZW50TW91c2VMZWF2ZSgpXCIgcFJpcHBsZT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwicGkgcGktY2hldnJvbi1kb3duXCI+PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicC1hbXBtLXBpY2tlclwiICpuZ0lmPVwiaG91ckZvcm1hdD09JzEyJ1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwicC1saW5rXCIgdHlwZT1cImJ1dHRvblwiIChrZXlkb3duKT1cIm9uQ29udGFpbmVyQnV0dG9uS2V5ZG93bigkZXZlbnQpXCIgKGNsaWNrKT1cInRvZ2dsZUFNUE0oJGV2ZW50KVwiIChrZXlkb3duLmVudGVyKT1cInRvZ2dsZUFNUE0oJGV2ZW50KVwiIHBSaXBwbGU+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInBpIHBpLWNoZXZyb24tdXBcIj48L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj57e3BtID8gJ1BNJyA6ICdBTSd9fTwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cInAtbGlua1wiIHR5cGU9XCJidXR0b25cIiAoa2V5ZG93bik9XCJvbkNvbnRhaW5lckJ1dHRvbktleWRvd24oJGV2ZW50KVwiIChjbGljayk9XCJ0b2dnbGVBTVBNKCRldmVudClcIiAoa2V5ZG93bi5lbnRlcik9XCJ0b2dnbGVBTVBNKCRldmVudClcIiBwUmlwcGxlPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJwaSBwaS1jaGV2cm9uLWRvd25cIj48L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwicC1kYXRlcGlja2VyLWJ1dHRvbmJhclwiICpuZ0lmPVwic2hvd0J1dHRvbkJhclwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIFtsYWJlbF09XCJnZXRUcmFuc2xhdGlvbigndG9kYXknKVwiIChrZXlkb3duKT1cIm9uQ29udGFpbmVyQnV0dG9uS2V5ZG93bigkZXZlbnQpXCIgKGNsaWNrKT1cIm9uVG9kYXlCdXR0b25DbGljaygkZXZlbnQpXCIgcEJ1dHRvbiBwUmlwcGxlIFtuZ0NsYXNzXT1cIlt0b2RheUJ1dHRvblN0eWxlQ2xhc3NdXCI+PC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgW2xhYmVsXT1cImdldFRyYW5zbGF0aW9uKCdjbGVhcicpXCIgKGtleWRvd24pPVwib25Db250YWluZXJCdXR0b25LZXlkb3duKCRldmVudClcIiAoY2xpY2spPVwib25DbGVhckJ1dHRvbkNsaWNrKCRldmVudClcIiBwQnV0dG9uIHBSaXBwbGUgW25nQ2xhc3NdPVwiW2NsZWFyQnV0dG9uU3R5bGVDbGFzc11cIj48L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgPG5nLWNvbnRlbnQgc2VsZWN0PVwicC1mb290ZXJcIj48L25nLWNvbnRlbnQ+XHJcbiAgICAgICAgICAgICAgICA8bmctY29udGFpbmVyICpuZ1RlbXBsYXRlT3V0bGV0PVwiZm9vdGVyVGVtcGxhdGVcIj48L25nLWNvbnRhaW5lcj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9zcGFuPlxyXG4gICAgYCxcclxuICAgIGFuaW1hdGlvbnM6IFtcclxuICAgICAgICB0cmlnZ2VyKCdvdmVybGF5QW5pbWF0aW9uJywgW1xyXG4gICAgICAgICAgICBzdGF0ZSgndmlzaWJsZVRvdWNoVUknLCBzdHlsZSh7XHJcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm06ICd0cmFuc2xhdGUoLTUwJSwtNTAlKScsXHJcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAxXHJcbiAgICAgICAgICAgIH0pKSxcclxuICAgICAgICAgICAgdHJhbnNpdGlvbigndm9pZCA9PiB2aXNpYmxlJywgW1xyXG4gICAgICAgICAgICAgICAgc3R5bGUoe29wYWNpdHk6IDAsIHRyYW5zZm9ybTogJ3NjYWxlWSgwLjgpJ30pLFxyXG4gICAgICAgICAgICAgICAgYW5pbWF0ZSgne3tzaG93VHJhbnNpdGlvblBhcmFtc319Jywgc3R5bGUoeyBvcGFjaXR5OiAxLCB0cmFuc2Zvcm06ICcqJyB9KSlcclxuICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgIHRyYW5zaXRpb24oJ3Zpc2libGUgPT4gdm9pZCcsIFtcclxuICAgICAgICAgICAgICAgIGFuaW1hdGUoJ3t7aGlkZVRyYW5zaXRpb25QYXJhbXN9fScsIHN0eWxlKHsgb3BhY2l0eTogMCB9KSlcclxuICAgICAgICAgICAgXSksXHJcbiAgICAgICAgICAgIHRyYW5zaXRpb24oJ3ZvaWQgPT4gdmlzaWJsZVRvdWNoVUknLCBbXHJcbiAgICAgICAgICAgICAgICBzdHlsZSh7b3BhY2l0eTogMCwgdHJhbnNmb3JtOiAndHJhbnNsYXRlM2QoLTUwJSwgLTQwJSwgMCkgc2NhbGUoMC45KSd9KSxcclxuICAgICAgICAgICAgICAgIGFuaW1hdGUoJ3t7c2hvd1RyYW5zaXRpb25QYXJhbXN9fScpXHJcbiAgICAgICAgICAgIF0pLFxyXG4gICAgICAgICAgICB0cmFuc2l0aW9uKCd2aXNpYmxlVG91Y2hVSSA9PiB2b2lkJywgW1xyXG4gICAgICAgICAgICAgICAgYW5pbWF0ZSgoJ3t7aGlkZVRyYW5zaXRpb25QYXJhbXN9fScpLFxyXG4gICAgICAgICAgICAgICAgc3R5bGUoe1xyXG4gICAgICAgICAgICAgICAgICAgIG9wYWNpdHk6IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtOiAndHJhbnNsYXRlM2QoLTUwJSwgLTQwJSwgMCkgc2NhbGUoMC45KSdcclxuICAgICAgICAgICAgICAgIH0pKVxyXG4gICAgICAgICAgICBdKVxyXG4gICAgICAgIF0pXHJcbiAgICBdLFxyXG4gICAgaG9zdDoge1xyXG4gICAgICAgICdbY2xhc3MucC1pbnB1dHdyYXBwZXItZmlsbGVkXSc6ICdmaWxsZWQnLFxyXG4gICAgICAgICdbY2xhc3MucC1pbnB1dHdyYXBwZXItZm9jdXNdJzogJ2ZvY3VzJ1xyXG4gICAgfSxcclxuICAgIHByb3ZpZGVyczogW0NBTEVOREFSX1ZBTFVFX0FDQ0VTU09SXSxcclxuICAgIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxyXG4gICAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcclxuICAgIHN0eWxlVXJsczogWycuL2NhbGVuZGFyLmNzcyddXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBDYWxlbmRhciBpbXBsZW1lbnRzIE9uSW5pdCxPbkRlc3Ryb3ksQ29udHJvbFZhbHVlQWNjZXNzb3Ige1xyXG5cclxuICAgIEBJbnB1dCgpIHN0eWxlOiBhbnk7XHJcblxyXG4gICAgQElucHV0KCkgc3R5bGVDbGFzczogc3RyaW5nO1xyXG5cclxuICAgIEBJbnB1dCgpIGlucHV0U3R5bGU6IGFueTtcclxuXHJcbiAgICBASW5wdXQoKSBpbnB1dElkOiBzdHJpbmc7XHJcblxyXG4gICAgQElucHV0KCkgbmFtZTogc3RyaW5nO1xyXG5cclxuICAgIEBJbnB1dCgpIGlucHV0U3R5bGVDbGFzczogc3RyaW5nO1xyXG5cclxuICAgIEBJbnB1dCgpIHBsYWNlaG9sZGVyOiBzdHJpbmc7XHJcblxyXG4gICAgQElucHV0KCkgYXJpYUxhYmVsbGVkQnk6IHN0cmluZztcclxuXHJcbiAgICBASW5wdXQoKSBkaXNhYmxlZDogYW55O1xyXG5cclxuICAgIEBJbnB1dCgpIGRhdGVGb3JtYXQ6IHN0cmluZyA9ICdtbS9kZC95eSc7XHJcblxyXG4gICAgQElucHV0KCkgbXVsdGlwbGVTZXBhcmF0b3I6IHN0cmluZyA9ICcsJztcclxuXHJcbiAgICBASW5wdXQoKSByYW5nZVNlcGFyYXRvcjogc3RyaW5nID0gJy0nO1xyXG5cclxuICAgIEBJbnB1dCgpIGlubGluZTogYm9vbGVhbiA9IGZhbHNlO1xyXG5cclxuICAgIEBJbnB1dCgpIHNob3dPdGhlck1vbnRoczogYm9vbGVhbiA9IHRydWU7XHJcblxyXG4gICAgQElucHV0KCkgc2VsZWN0T3RoZXJNb250aHM6IGJvb2xlYW47XHJcblxyXG4gICAgQElucHV0KCkgc2hvd0ljb246IGJvb2xlYW47XHJcblxyXG4gICAgQElucHV0KCkgaWNvbjogc3RyaW5nID0gJ3BpIHBpLWNhbGVuZGFyJztcclxuXHJcbiAgICBASW5wdXQoKSBhcHBlbmRUbzogYW55O1xyXG5cclxuICAgIEBJbnB1dCgpIHJlYWRvbmx5SW5wdXQ6IGJvb2xlYW47XHJcblxyXG4gICAgQElucHV0KCkgc2hvcnRZZWFyQ3V0b2ZmOiBhbnkgPSAnKzEwJztcclxuXHJcbiAgICBASW5wdXQoKSBtb250aE5hdmlnYXRvcjogYm9vbGVhbjtcclxuXHJcbiAgICBASW5wdXQoKSB5ZWFyTmF2aWdhdG9yOiBib29sZWFuO1xyXG5cclxuICAgIEBJbnB1dCgpIGhvdXJGb3JtYXQ6IHN0cmluZyA9ICcyNCc7XHJcblxyXG4gICAgQElucHV0KCkgdGltZU9ubHk6IGJvb2xlYW47XHJcblxyXG4gICAgQElucHV0KCkgc3RlcEhvdXI6IG51bWJlciA9IDE7XHJcblxyXG4gICAgQElucHV0KCkgc3RlcE1pbnV0ZTogbnVtYmVyID0gMTtcclxuXHJcbiAgICBASW5wdXQoKSBzdGVwU2Vjb25kOiBudW1iZXIgPSAxO1xyXG5cclxuICAgIEBJbnB1dCgpIHNob3dTZWNvbmRzOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gICAgQElucHV0KCkgcmVxdWlyZWQ6IGJvb2xlYW47XHJcblxyXG4gICAgQElucHV0KCkgc2hvd09uRm9jdXM6IGJvb2xlYW4gPSB0cnVlO1xyXG5cclxuICAgIEBJbnB1dCgpIHNob3dXZWVrOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gICAgQElucHV0KCkgZGF0YVR5cGU6IHN0cmluZyA9ICdkYXRlJztcclxuXHJcbiAgICBASW5wdXQoKSBzZWxlY3Rpb25Nb2RlOiBzdHJpbmcgPSAnc2luZ2xlJztcclxuXHJcbiAgICBASW5wdXQoKSBtYXhEYXRlQ291bnQ6IG51bWJlcjtcclxuXHJcbiAgICBASW5wdXQoKSBzaG93QnV0dG9uQmFyOiBib29sZWFuO1xyXG5cclxuICAgIEBJbnB1dCgpIHRvZGF5QnV0dG9uU3R5bGVDbGFzczogc3RyaW5nID0gJ3AtYnV0dG9uLXRleHQnO1xyXG5cclxuICAgIEBJbnB1dCgpIGNsZWFyQnV0dG9uU3R5bGVDbGFzczogc3RyaW5nID0gJ3AtYnV0dG9uLXRleHQnO1xyXG5cclxuICAgIEBJbnB1dCgpIGF1dG9aSW5kZXg6IGJvb2xlYW4gPSB0cnVlO1xyXG5cclxuICAgIEBJbnB1dCgpIGJhc2VaSW5kZXg6IG51bWJlciA9IDA7XHJcblxyXG4gICAgQElucHV0KCkgcGFuZWxTdHlsZUNsYXNzOiBzdHJpbmc7XHJcblxyXG4gICAgQElucHV0KCkgcGFuZWxTdHlsZTogYW55O1xyXG5cclxuICAgIEBJbnB1dCgpIGtlZXBJbnZhbGlkOiBib29sZWFuID0gZmFsc2U7XHJcblxyXG4gICAgQElucHV0KCkgaGlkZU9uRGF0ZVRpbWVTZWxlY3Q6IGJvb2xlYW4gPSB0cnVlO1xyXG5cclxuICAgIEBJbnB1dCgpIG51bWJlck9mTW9udGhzOiBudW1iZXIgPSAxO1xyXG5cclxuICAgIEBJbnB1dCgpIHZpZXc6IHN0cmluZyA9ICdkYXRlJztcclxuXHJcbiAgICBASW5wdXQoKSB0b3VjaFVJOiBib29sZWFuO1xyXG5cclxuICAgIEBJbnB1dCgpIHRpbWVTZXBhcmF0b3I6IHN0cmluZyA9IFwiOlwiO1xyXG5cclxuICAgIEBJbnB1dCgpIGZvY3VzVHJhcDogYm9vbGVhbiA9IHRydWU7XHJcblxyXG4gICAgQElucHV0KCkgZmlyc3REYXlPZldlZWs6IG51bWJlciA9IDA7XHJcblxyXG4gICAgQElucHV0KCkgc2hvd1RyYW5zaXRpb25PcHRpb25zOiBzdHJpbmcgPSAnLjEycyBjdWJpYy1iZXppZXIoMCwgMCwgMC4yLCAxKSc7XHJcblxyXG4gICAgQElucHV0KCkgaGlkZVRyYW5zaXRpb25PcHRpb25zOiBzdHJpbmcgPSAnLjFzIGxpbmVhcic7XHJcblxyXG4gICAgQE91dHB1dCgpIG9uRm9jdXM6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG5cclxuICAgIEBPdXRwdXQoKSBvbkJsdXI6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG5cclxuICAgIEBPdXRwdXQoKSBvbkNsb3NlOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcclxuXHJcbiAgICBAT3V0cHV0KCkgb25TZWxlY3Q6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xyXG5cclxuICAgIEBPdXRwdXQoKSBvbklucHV0OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcclxuXHJcbiAgICBAT3V0cHV0KCkgb25Ub2RheUNsaWNrOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcclxuXHJcbiAgICBAT3V0cHV0KCkgb25DbGVhckNsaWNrOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcclxuXHJcbiAgICBAT3V0cHV0KCkgb25Nb250aENoYW5nZTogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XHJcblxyXG4gICAgQE91dHB1dCgpIG9uWWVhckNoYW5nZTogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyKCk7XHJcblxyXG4gICAgQE91dHB1dCgpIG9uQ2xpY2tPdXRzaWRlOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcclxuXHJcbiAgICBAT3V0cHV0KCkgb25TaG93OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcclxuXHJcbiAgICBAQ29udGVudENoaWxkcmVuKFByaW1lVGVtcGxhdGUpIHRlbXBsYXRlczogUXVlcnlMaXN0PGFueT47XHJcblxyXG4gICAgQElucHV0KCkgdGFiaW5kZXg6IG51bWJlcjtcclxuXHJcbiAgICBAVmlld0NoaWxkKCdjb250YWluZXInLCB7IHN0YXRpYzogZmFsc2UgfSkgY29udGFpbmVyVmlld0NoaWxkOiBFbGVtZW50UmVmO1xyXG5cclxuICAgIEBWaWV3Q2hpbGQoJ2lucHV0ZmllbGQnLCB7IHN0YXRpYzogZmFsc2UgfSkgaW5wdXRmaWVsZFZpZXdDaGlsZDogRWxlbWVudFJlZjtcclxuXHJcbiAgICBAVmlld0NoaWxkKCdjb250ZW50V3JhcHBlcicsIHsgc3RhdGljOiBmYWxzZSB9KSBzZXQgY29udGVudCAoY29udGVudDogRWxlbWVudFJlZikge1xyXG4gICAgICAgIHRoaXMuY29udGVudFZpZXdDaGlsZCA9IGNvbnRlbnQ7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmNvbnRlbnRWaWV3Q2hpbGQpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuaXNNb250aE5hdmlnYXRlKSB7XHJcbiAgICAgICAgICAgICAgICBQcm9taXNlLnJlc29sdmUobnVsbCkudGhlbigoKSA9PiB0aGlzLnVwZGF0ZUZvY3VzKCkpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pc01vbnRoTmF2aWdhdGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW5pdEZvY3VzYWJsZUNlbGwoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgY29udGVudFZpZXdDaGlsZDogRWxlbWVudFJlZjtcclxuXHJcbiAgICB2YWx1ZTogYW55O1xyXG5cclxuICAgIGRhdGVzOiBhbnlbXTtcclxuXHJcbiAgICBtb250aHM6IGFueVtdO1xyXG5cclxuICAgIG1vbnRoUGlja2VyVmFsdWVzOiBhbnlbXTtcclxuXHJcbiAgICB3ZWVrRGF5czogc3RyaW5nW107XHJcblxyXG4gICAgY3VycmVudE1vbnRoOiBudW1iZXI7XHJcblxyXG4gICAgY3VycmVudFllYXI6IG51bWJlcjtcclxuXHJcbiAgICBjdXJyZW50SG91cjogbnVtYmVyO1xyXG5cclxuICAgIGN1cnJlbnRNaW51dGU6IG51bWJlcjtcclxuXHJcbiAgICBjdXJyZW50U2Vjb25kOiBudW1iZXI7XHJcblxyXG4gICAgcG06IGJvb2xlYW47XHJcblxyXG4gICAgbWFzazogSFRNTERpdkVsZW1lbnQ7XHJcblxyXG4gICAgbWFza0NsaWNrTGlzdGVuZXI6IEZ1bmN0aW9uO1xyXG5cclxuICAgIG92ZXJsYXk6IEhUTUxEaXZFbGVtZW50O1xyXG5cclxuICAgIG92ZXJsYXlWaXNpYmxlOiBib29sZWFuO1xyXG5cclxuICAgIG9uTW9kZWxDaGFuZ2U6IEZ1bmN0aW9uID0gKCkgPT4ge307XHJcblxyXG4gICAgb25Nb2RlbFRvdWNoZWQ6IEZ1bmN0aW9uID0gKCkgPT4ge307XHJcblxyXG4gICAgY2FsZW5kYXJFbGVtZW50OiBhbnk7XHJcblxyXG4gICAgdGltZVBpY2tlclRpbWVyOmFueTtcclxuXHJcbiAgICBkb2N1bWVudENsaWNrTGlzdGVuZXI6IGFueTtcclxuXHJcbiAgICB0aWNrc1RvMTk3MDogbnVtYmVyO1xyXG5cclxuICAgIHllYXJPcHRpb25zOiBudW1iZXJbXTtcclxuXHJcbiAgICBmb2N1czogYm9vbGVhbjtcclxuXHJcbiAgICBpc0tleWRvd246IGJvb2xlYW47XHJcblxyXG4gICAgZmlsbGVkOiBib29sZWFuO1xyXG5cclxuICAgIGlucHV0RmllbGRWYWx1ZTogc3RyaW5nID0gbnVsbDtcclxuXHJcbiAgICBfbWluRGF0ZTogRGF0ZTtcclxuXHJcbiAgICBfbWF4RGF0ZTogRGF0ZTtcclxuXHJcbiAgICBfc2hvd1RpbWU6IGJvb2xlYW47XHJcblxyXG4gICAgX3llYXJSYW5nZTogc3RyaW5nO1xyXG5cclxuICAgIHByZXZlbnREb2N1bWVudExpc3RlbmVyOiBib29sZWFuO1xyXG5cclxuICAgIGRhdGVUZW1wbGF0ZTogVGVtcGxhdGVSZWY8YW55PjtcclxuXHJcbiAgICBoZWFkZXJUZW1wbGF0ZTogVGVtcGxhdGVSZWY8YW55PjtcclxuXHJcbiAgICBmb290ZXJUZW1wbGF0ZTogVGVtcGxhdGVSZWY8YW55PjtcclxuXHJcbiAgICBkaXNhYmxlZERhdGVUZW1wbGF0ZTogVGVtcGxhdGVSZWY8YW55PjtcclxuXHJcbiAgICBfZGlzYWJsZWREYXRlczogQXJyYXk8RGF0ZT47XHJcblxyXG4gICAgX2Rpc2FibGVkRGF5czogQXJyYXk8bnVtYmVyPjtcclxuXHJcbiAgICBzZWxlY3RFbGVtZW50OiBhbnk7XHJcblxyXG4gICAgdG9kYXlFbGVtZW50OiBhbnk7XHJcblxyXG4gICAgZm9jdXNFbGVtZW50OiBhbnk7XHJcblxyXG4gICAgc2Nyb2xsSGFuZGxlcjogYW55O1xyXG5cclxuICAgIGRvY3VtZW50UmVzaXplTGlzdGVuZXI6IGFueTtcclxuXHJcbiAgICBuYXZpZ2F0aW9uU3RhdGU6IGFueSA9IG51bGw7XHJcblxyXG4gICAgaXNNb250aE5hdmlnYXRlOiBib29sZWFuO1xyXG5cclxuICAgIGluaXRpYWxpemVkOiBib29sZWFuO1xyXG5cclxuICAgIHRyYW5zbGF0aW9uU3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb247XHJcblxyXG4gICAgX2xvY2FsZTogTG9jYWxlU2V0dGluZ3M7XHJcblxyXG4gICAgQElucHV0KCkgZ2V0IGRlZmF1bHREYXRlKCk6IERhdGUge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9kZWZhdWx0RGF0ZTtcclxuICAgIH07XHJcblxyXG4gICAgc2V0IGRlZmF1bHREYXRlKGRlZmF1bHREYXRlOiBEYXRlKSB7XHJcbiAgICAgICAgdGhpcy5fZGVmYXVsdERhdGUgPSBkZWZhdWx0RGF0ZTtcclxuICAgICAgICBcclxuICAgICAgICBpZiAodGhpcy5pbml0aWFsaXplZCkge1xyXG4gICAgICAgICAgICBjb25zdCBkYXRlID0gZGVmYXVsdERhdGV8fG5ldyBEYXRlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudE1vbnRoID0gZGF0ZS5nZXRNb250aCgpO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRZZWFyID0gZGF0ZS5nZXRGdWxsWWVhcigpO1xyXG4gICAgICAgICAgICB0aGlzLmluaXRUaW1lKGRhdGUpO1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZU1vbnRocyh0aGlzLmN1cnJlbnRNb250aCwgdGhpcy5jdXJyZW50WWVhcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIF9kZWZhdWx0RGF0ZTogRGF0ZTtcclxuXHJcbiAgICBASW5wdXQoKSBnZXQgbWluRGF0ZSgpOiBEYXRlIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fbWluRGF0ZTtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgbWluRGF0ZShkYXRlOiBEYXRlKSB7XHJcbiAgICAgICAgdGhpcy5fbWluRGF0ZSA9IGRhdGU7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRNb250aCAhPSB1bmRlZmluZWQgJiYgdGhpcy5jdXJyZW50TW9udGggIT0gbnVsbCAmJiB0aGlzLmN1cnJlbnRZZWFyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlTW9udGhzKHRoaXMuY3VycmVudE1vbnRoLCB0aGlzLmN1cnJlbnRZZWFyKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgQElucHV0KCkgZ2V0IG1heERhdGUoKTogRGF0ZSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX21heERhdGU7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IG1heERhdGUoZGF0ZTogRGF0ZSkge1xyXG4gICAgICAgIHRoaXMuX21heERhdGUgPSBkYXRlO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50TW9udGggIT0gdW5kZWZpbmVkICYmIHRoaXMuY3VycmVudE1vbnRoICE9IG51bGwgICYmIHRoaXMuY3VycmVudFllYXIpIHtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVNb250aHModGhpcy5jdXJyZW50TW9udGgsIHRoaXMuY3VycmVudFllYXIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBASW5wdXQoKSBnZXQgZGlzYWJsZWREYXRlcygpOiBEYXRlW10ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9kaXNhYmxlZERhdGVzO1xyXG4gICAgfVxyXG5cclxuICAgIHNldCBkaXNhYmxlZERhdGVzKGRpc2FibGVkRGF0ZXM6IERhdGVbXSkge1xyXG4gICAgICAgIHRoaXMuX2Rpc2FibGVkRGF0ZXMgPSBkaXNhYmxlZERhdGVzO1xyXG4gICAgICAgIGlmICh0aGlzLmN1cnJlbnRNb250aCAhPSB1bmRlZmluZWQgJiYgdGhpcy5jdXJyZW50TW9udGggIT0gbnVsbCAgJiYgdGhpcy5jdXJyZW50WWVhcikge1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVNb250aHModGhpcy5jdXJyZW50TW9udGgsIHRoaXMuY3VycmVudFllYXIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBASW5wdXQoKSBnZXQgZGlzYWJsZWREYXlzKCk6IG51bWJlcltdIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fZGlzYWJsZWREYXlzO1xyXG4gICAgfVxyXG5cclxuICAgIHNldCBkaXNhYmxlZERheXMoZGlzYWJsZWREYXlzOiBudW1iZXJbXSkge1xyXG4gICAgICAgIHRoaXMuX2Rpc2FibGVkRGF5cyA9IGRpc2FibGVkRGF5cztcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudE1vbnRoICE9IHVuZGVmaW5lZCAmJiB0aGlzLmN1cnJlbnRNb250aCAhPSBudWxsICAmJiB0aGlzLmN1cnJlbnRZZWFyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlTW9udGhzKHRoaXMuY3VycmVudE1vbnRoLCB0aGlzLmN1cnJlbnRZZWFyKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgQElucHV0KCkgZ2V0IHllYXJSYW5nZSgpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl95ZWFyUmFuZ2U7XHJcbiAgICB9XHJcblxyXG4gICAgc2V0IHllYXJSYW5nZSh5ZWFyUmFuZ2U6IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuX3llYXJSYW5nZSA9IHllYXJSYW5nZTtcclxuXHJcbiAgICAgICAgaWYgKHllYXJSYW5nZSkge1xyXG4gICAgICAgICAgICBjb25zdCB5ZWFycyA9IHllYXJSYW5nZS5zcGxpdCgnOicpO1xyXG4gICAgICAgICAgICBjb25zdCB5ZWFyU3RhcnQgPSBwYXJzZUludCh5ZWFyc1swXSk7XHJcbiAgICAgICAgICAgIGNvbnN0IHllYXJFbmQgPSBwYXJzZUludCh5ZWFyc1sxXSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLnBvcHVsYXRlWWVhck9wdGlvbnMoeWVhclN0YXJ0LCB5ZWFyRW5kKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgQElucHV0KCkgZ2V0IHNob3dUaW1lKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zaG93VGltZTtcclxuICAgIH1cclxuXHJcbiAgICBzZXQgc2hvd1RpbWUoc2hvd1RpbWU6IGJvb2xlYW4pIHtcclxuICAgICAgICB0aGlzLl9zaG93VGltZSA9IHNob3dUaW1lO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5jdXJyZW50SG91ciA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5pdFRpbWUodGhpcy52YWx1ZXx8bmV3IERhdGUoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMudXBkYXRlSW5wdXRmaWVsZCgpO1xyXG4gICAgfVxyXG5cclxuICAgIGdldCBsb2NhbGUoKSB7XHJcbiAgICAgICByZXR1cm4gdGhpcy5fbG9jYWxlO1xyXG4gICAgfVxyXG5cclxuICAgIEBJbnB1dCgpXHJcbiAgICBzZXQgbG9jYWxlKG5ld0xvY2FsZTogTG9jYWxlU2V0dGluZ3MpIHtcclxuICAgICAgICBjb25zb2xlLndhcm4oXCJMb2NhbGUgcHJvcGVydHkgaGFzIG5vIGVmZmVjdCwgdXNlIG5ldyBpMThuIEFQSSBpbnN0ZWFkLlwiKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgZWw6IEVsZW1lbnRSZWYsIHB1YmxpYyByZW5kZXJlcjogUmVuZGVyZXIyLCBwdWJsaWMgY2Q6IENoYW5nZURldGVjdG9yUmVmLCBwcml2YXRlIHpvbmU6IE5nWm9uZSwgcHJpdmF0ZSBjb25maWc6IFByaW1lTkdDb25maWcpIHt9XHJcblxyXG4gICAgbmdPbkluaXQoKSB7XHJcbiAgICAgICAgY29uc3QgZGF0ZSA9IHRoaXMuZGVmYXVsdERhdGV8fG5ldyBEYXRlKCk7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50TW9udGggPSBkYXRlLmdldE1vbnRoKCk7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50WWVhciA9IGRhdGUuZ2V0RnVsbFllYXIoKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMudmlldyA9PT0gJ2RhdGUnKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlV2Vla0RheXMoKTtcclxuICAgICAgICAgICAgdGhpcy5pbml0VGltZShkYXRlKTtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVNb250aHModGhpcy5jdXJyZW50TW9udGgsIHRoaXMuY3VycmVudFllYXIpO1xyXG4gICAgICAgICAgICB0aGlzLnRpY2tzVG8xOTcwID0gKCgoMTk3MCAtIDEpICogMzY1ICsgTWF0aC5mbG9vcigxOTcwIC8gNCkgLSBNYXRoLmZsb29yKDE5NzAgLyAxMDApICsgTWF0aC5mbG9vcigxOTcwIC8gNDAwKSkgKiAyNCAqIDYwICogNjAgKiAxMDAwMDAwMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMudmlldyA9PT0gJ21vbnRoJykge1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZU1vbnRoUGlja2VyVmFsdWVzKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnRyYW5zbGF0aW9uU3Vic2NyaXB0aW9uID0gdGhpcy5jb25maWcudHJhbnNsYXRpb25PYnNlcnZlci5zdWJzY3JpYmUoKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZVdlZWtEYXlzKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcclxuICAgICAgICB0aGlzLnRlbXBsYXRlcy5mb3JFYWNoKChpdGVtKSA9PiB7XHJcbiAgICAgICAgICAgIHN3aXRjaCAoaXRlbS5nZXRUeXBlKCkpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgJ2RhdGUnOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0ZVRlbXBsYXRlID0gaXRlbS50ZW1wbGF0ZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgIGNhc2UgJ2Rpc2FibGVkRGF0ZSc6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXNhYmxlZERhdGVUZW1wbGF0ZSA9IGl0ZW0udGVtcGxhdGU7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgICAgICBjYXNlICdoZWFkZXInOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaGVhZGVyVGVtcGxhdGUgPSBpdGVtLnRlbXBsYXRlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICAgICAgY2FzZSAnZm9vdGVyJzpcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmZvb3RlclRlbXBsYXRlID0gaXRlbS50ZW1wbGF0ZTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRlVGVtcGxhdGUgPSBpdGVtLnRlbXBsYXRlO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRUcmFuc2xhdGlvbihvcHRpb246IHN0cmluZykge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmNvbmZpZy5nZXRUcmFuc2xhdGlvbihvcHRpb24pO1xyXG4gICAgfVxyXG5cclxuICAgIHBvcHVsYXRlWWVhck9wdGlvbnMoc3RhcnQsIGVuZCkge1xyXG4gICAgICAgIHRoaXMueWVhck9wdGlvbnMgPSBbXTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IHN0YXJ0OyBpIDw9IGVuZDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMueWVhck9wdGlvbnMucHVzaChpKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY3JlYXRlV2Vla0RheXMoKSB7XHJcbiAgICAgICAgdGhpcy53ZWVrRGF5cyA9IFtdO1xyXG4gICAgICAgIGxldCBkYXlJbmRleCA9IHRoaXMuZmlyc3REYXlPZldlZWs7XHJcbiAgICAgICAgbGV0IGRheUxhYmVscyA9IHRoaXMuZ2V0VHJhbnNsYXRpb24oVHJhbnNsYXRpb25LZXlzLkRBWV9OQU1FU19NSU4pO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNzsgaSsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMud2Vla0RheXMucHVzaChkYXlMYWJlbHNbZGF5SW5kZXhdKTtcclxuICAgICAgICAgICAgZGF5SW5kZXggPSAoZGF5SW5kZXggPT0gNikgPyAwIDogKytkYXlJbmRleDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY3JlYXRlTW9udGhQaWNrZXJWYWx1ZXMoKSB7XHJcbiAgICAgICAgdGhpcy5tb250aFBpY2tlclZhbHVlcyA9IFtdO1xyXG4gICAgICAgIGxldCBtb250aExhYmVscyA9IHRoaXMuZ2V0VHJhbnNsYXRpb24oVHJhbnNsYXRpb25LZXlzLk1PTlRIX05BTUVTX1NIT1JUKTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8PSAxMTsgaSsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMubW9udGhQaWNrZXJWYWx1ZXMucHVzaChtb250aExhYmVsc1tpXSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZU1vbnRocyhtb250aDogbnVtYmVyLCB5ZWFyOiBudW1iZXIpIHtcclxuICAgICAgICB0aGlzLm1vbnRocyA9IHRoaXMubW9udGhzID0gW107XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDAgOyBpIDwgdGhpcy5udW1iZXJPZk1vbnRoczsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBtID0gbW9udGggKyBpO1xyXG4gICAgICAgICAgICBsZXQgeSA9IHllYXI7XHJcbiAgICAgICAgICAgIGlmIChtID4gMTEpIHtcclxuICAgICAgICAgICAgICAgIG0gPSBtICUgMTEgLSAxO1xyXG4gICAgICAgICAgICAgICAgeSA9IHllYXIgKyAxO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLm1vbnRocy5wdXNoKHRoaXMuY3JlYXRlTW9udGgobSwgeSkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBnZXRXZWVrTnVtYmVyKGRhdGU6IERhdGUpIHtcclxuICAgICAgICBsZXQgY2hlY2tEYXRlID0gbmV3IERhdGUoZGF0ZS5nZXRUaW1lKCkpO1xyXG5cdFx0Y2hlY2tEYXRlLnNldERhdGUoY2hlY2tEYXRlLmdldERhdGUoKSArIDQgLSAoIGNoZWNrRGF0ZS5nZXREYXkoKSB8fCA3ICkpO1xyXG5cdFx0bGV0IHRpbWUgPSBjaGVja0RhdGUuZ2V0VGltZSgpO1xyXG5cdFx0Y2hlY2tEYXRlLnNldE1vbnRoKCAwICk7XHJcblx0XHRjaGVja0RhdGUuc2V0RGF0ZSggMSApO1xyXG5cdFx0cmV0dXJuIE1hdGguZmxvb3IoIE1hdGgucm91bmQoKHRpbWUgLSBjaGVja0RhdGUuZ2V0VGltZSgpKSAvIDg2NDAwMDAwICkgLyA3ICkgKyAxO1xyXG4gICAgfVxyXG5cclxuICAgIGNyZWF0ZU1vbnRoKG1vbnRoOiBudW1iZXIsIHllYXI6IG51bWJlcikge1xyXG4gICAgICAgIGxldCBkYXRlcyA9IFtdO1xyXG4gICAgICAgIGxldCBmaXJzdERheSA9IHRoaXMuZ2V0Rmlyc3REYXlPZk1vbnRoSW5kZXgobW9udGgsIHllYXIpO1xyXG4gICAgICAgIGxldCBkYXlzTGVuZ3RoID0gdGhpcy5nZXREYXlzQ291bnRJbk1vbnRoKG1vbnRoLCB5ZWFyKTtcclxuICAgICAgICBsZXQgcHJldk1vbnRoRGF5c0xlbmd0aCA9IHRoaXMuZ2V0RGF5c0NvdW50SW5QcmV2TW9udGgobW9udGgsIHllYXIpO1xyXG4gICAgICAgIGxldCBkYXlObyA9IDE7XHJcbiAgICAgICAgbGV0IHRvZGF5ID0gbmV3IERhdGUoKTtcclxuICAgICAgICBsZXQgd2Vla051bWJlcnMgPSBbXTtcclxuICAgICAgICBsZXQgbW9udGhSb3dzID0gTWF0aC5jZWlsKChkYXlzTGVuZ3RoICsgZmlyc3REYXkpIC8gNyk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbW9udGhSb3dzOyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IHdlZWsgPSBbXTtcclxuXHJcbiAgICAgICAgICAgIGlmIChpID09IDApIHtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGogPSAocHJldk1vbnRoRGF5c0xlbmd0aCAtIGZpcnN0RGF5ICsgMSk7IGogPD0gcHJldk1vbnRoRGF5c0xlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHByZXYgPSB0aGlzLmdldFByZXZpb3VzTW9udGhBbmRZZWFyKG1vbnRoLCB5ZWFyKTtcclxuICAgICAgICAgICAgICAgICAgICB3ZWVrLnB1c2goe2RheTogaiwgbW9udGg6IHByZXYubW9udGgsIHllYXI6IHByZXYueWVhciwgb3RoZXJNb250aDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvZGF5OiB0aGlzLmlzVG9kYXkodG9kYXksIGosIHByZXYubW9udGgsIHByZXYueWVhciksIHNlbGVjdGFibGU6IHRoaXMuaXNTZWxlY3RhYmxlKGosIHByZXYubW9udGgsIHByZXYueWVhciwgdHJ1ZSl9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgcmVtYWluaW5nRGF5c0xlbmd0aCA9IDcgLSB3ZWVrLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgcmVtYWluaW5nRGF5c0xlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgd2Vlay5wdXNoKHtkYXk6IGRheU5vLCBtb250aDogbW9udGgsIHllYXI6IHllYXIsIHRvZGF5OiB0aGlzLmlzVG9kYXkodG9kYXksIGRheU5vLCBtb250aCwgeWVhciksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RhYmxlOiB0aGlzLmlzU2VsZWN0YWJsZShkYXlObywgbW9udGgsIHllYXIsIGZhbHNlKX0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGRheU5vKys7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IDc7IGorKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChkYXlObyA+IGRheXNMZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG5leHQgPSB0aGlzLmdldE5leHRNb250aEFuZFllYXIobW9udGgsIHllYXIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3ZWVrLnB1c2goe2RheTogZGF5Tm8gLSBkYXlzTGVuZ3RoLCBtb250aDogbmV4dC5tb250aCwgeWVhcjogbmV4dC55ZWFyLCBvdGhlck1vbnRoOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b2RheTogdGhpcy5pc1RvZGF5KHRvZGF5LCBkYXlObyAtIGRheXNMZW5ndGgsIG5leHQubW9udGgsIG5leHQueWVhciksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGFibGU6IHRoaXMuaXNTZWxlY3RhYmxlKChkYXlObyAtIGRheXNMZW5ndGgpLCBuZXh0Lm1vbnRoLCBuZXh0LnllYXIsIHRydWUpfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3ZWVrLnB1c2goe2RheTogZGF5Tm8sIG1vbnRoOiBtb250aCwgeWVhcjogeWVhciwgdG9kYXk6IHRoaXMuaXNUb2RheSh0b2RheSwgZGF5Tm8sIG1vbnRoLCB5ZWFyKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdGFibGU6IHRoaXMuaXNTZWxlY3RhYmxlKGRheU5vLCBtb250aCwgeWVhciwgZmFsc2UpfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBkYXlObysrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy5zaG93V2Vlaykge1xyXG4gICAgICAgICAgICAgICAgd2Vla051bWJlcnMucHVzaCh0aGlzLmdldFdlZWtOdW1iZXIobmV3IERhdGUod2Vla1swXS55ZWFyLCB3ZWVrWzBdLm1vbnRoLCB3ZWVrWzBdLmRheSkpKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZGF0ZXMucHVzaCh3ZWVrKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIG1vbnRoOiBtb250aCxcclxuICAgICAgICAgICAgeWVhcjogeWVhcixcclxuICAgICAgICAgICAgZGF0ZXM6IGRhdGVzLFxyXG4gICAgICAgICAgICB3ZWVrTnVtYmVyczogd2Vla051bWJlcnNcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGluaXRUaW1lKGRhdGU6IERhdGUpIHtcclxuICAgICAgICB0aGlzLnBtID0gZGF0ZS5nZXRIb3VycygpID4gMTE7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnNob3dUaW1lKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudE1pbnV0ZSA9IGRhdGUuZ2V0TWludXRlcygpO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTZWNvbmQgPSBkYXRlLmdldFNlY29uZHMoKTtcclxuICAgICAgICAgICAgdGhpcy5zZXRDdXJyZW50SG91clBNKGRhdGUuZ2V0SG91cnMoKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMudGltZU9ubHkpIHtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50TWludXRlID0gMDtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50SG91ciA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFNlY29uZCA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG5hdkJhY2t3YXJkKGV2ZW50KSB7XHJcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkKSB7XHJcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuaXNNb250aE5hdmlnYXRlID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMudmlldyA9PT0gJ21vbnRoJykge1xyXG4gICAgICAgICAgICB0aGlzLmRlY3JlbWVudFllYXIoKTtcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKT0+IHtcclxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlRm9jdXMoKTtcclxuICAgICAgICAgICAgfSwxKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRNb250aCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50TW9udGggPSAxMTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZGVjcmVtZW50WWVhcigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50TW9udGgtLTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5vbk1vbnRoQ2hhbmdlLmVtaXQoeyBtb250aDogdGhpcy5jdXJyZW50TW9udGggKyAxLCB5ZWFyOiB0aGlzLmN1cnJlbnRZZWFyIH0pO1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZU1vbnRocyh0aGlzLmN1cnJlbnRNb250aCwgdGhpcy5jdXJyZW50WWVhcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG5hdkZvcndhcmQoZXZlbnQpIHtcclxuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWQpIHtcclxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5pc01vbnRoTmF2aWdhdGUgPSB0cnVlO1xyXG5cclxuICAgICAgICBpZiAodGhpcy52aWV3ID09PSAnbW9udGgnKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5jcmVtZW50WWVhcigpO1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVGb2N1cygpO1xyXG4gICAgICAgICAgICB9LDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudE1vbnRoID09PSAxMSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50TW9udGggPSAwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5pbmNyZW1lbnRZZWFyKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRNb250aCsrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLm9uTW9udGhDaGFuZ2UuZW1pdCh7bW9udGg6IHRoaXMuY3VycmVudE1vbnRoICsgMSwgeWVhcjogdGhpcy5jdXJyZW50WWVhcn0pO1xyXG4gICAgICAgICAgICB0aGlzLmNyZWF0ZU1vbnRocyh0aGlzLmN1cnJlbnRNb250aCwgdGhpcy5jdXJyZW50WWVhcik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGRlY3JlbWVudFllYXIoKSB7XHJcbiAgICAgICAgdGhpcy5jdXJyZW50WWVhci0tO1xyXG5cclxuICAgICAgICBpZiAodGhpcy55ZWFyTmF2aWdhdG9yICYmIHRoaXMuY3VycmVudFllYXIgPCB0aGlzLnllYXJPcHRpb25zWzBdKSB7XHJcbiAgICAgICAgICAgIGxldCBkaWZmZXJlbmNlID0gdGhpcy55ZWFyT3B0aW9uc1t0aGlzLnllYXJPcHRpb25zLmxlbmd0aCAtIDFdIC0gdGhpcy55ZWFyT3B0aW9uc1swXTtcclxuICAgICAgICAgICAgdGhpcy5wb3B1bGF0ZVllYXJPcHRpb25zKHRoaXMueWVhck9wdGlvbnNbMF0gLSBkaWZmZXJlbmNlLCB0aGlzLnllYXJPcHRpb25zW3RoaXMueWVhck9wdGlvbnMubGVuZ3RoIC0gMV0gLSBkaWZmZXJlbmNlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaW5jcmVtZW50WWVhcigpIHtcclxuICAgICAgICB0aGlzLmN1cnJlbnRZZWFyKys7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnllYXJOYXZpZ2F0b3IgJiYgdGhpcy5jdXJyZW50WWVhciA+IHRoaXMueWVhck9wdGlvbnNbdGhpcy55ZWFyT3B0aW9ucy5sZW5ndGggLSAxXSkge1xyXG4gICAgICAgICAgICBsZXQgZGlmZmVyZW5jZSA9IHRoaXMueWVhck9wdGlvbnNbdGhpcy55ZWFyT3B0aW9ucy5sZW5ndGggLSAxXSAtIHRoaXMueWVhck9wdGlvbnNbMF07XHJcbiAgICAgICAgICAgIHRoaXMucG9wdWxhdGVZZWFyT3B0aW9ucyh0aGlzLnllYXJPcHRpb25zWzBdICsgZGlmZmVyZW5jZSwgdGhpcy55ZWFyT3B0aW9uc1t0aGlzLnllYXJPcHRpb25zLmxlbmd0aCAtIDFdICsgZGlmZmVyZW5jZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG9uRGF0ZVNlbGVjdChldmVudCwgZGF0ZU1ldGEpIHtcclxuICAgICAgICBpZiAodGhpcy5kaXNhYmxlZCB8fCAhZGF0ZU1ldGEuc2VsZWN0YWJsZSkge1xyXG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5pc011bHRpcGxlU2VsZWN0aW9uKCkgJiYgdGhpcy5pc1NlbGVjdGVkKGRhdGVNZXRhKSkge1xyXG4gICAgICAgICAgICB0aGlzLnZhbHVlID0gdGhpcy52YWx1ZS5maWx0ZXIoKGRhdGUsIGkpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAhdGhpcy5pc0RhdGVFcXVhbHMoZGF0ZSwgZGF0ZU1ldGEpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgaWYgKHRoaXMudmFsdWUubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnZhbHVlID0gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZU1vZGVsKHRoaXMudmFsdWUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuc2hvdWxkU2VsZWN0RGF0ZShkYXRlTWV0YSkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0RGF0ZShkYXRlTWV0YSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmlzU2luZ2xlU2VsZWN0aW9uKCkgJiYgdGhpcy5oaWRlT25EYXRlVGltZVNlbGVjdCkge1xyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhpZGVPdmVybGF5KCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubWFzaykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGlzYWJsZU1vZGFsaXR5KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jZC5tYXJrRm9yQ2hlY2soKTtcclxuICAgICAgICAgICAgfSwgMTUwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMudXBkYXRlSW5wdXRmaWVsZCgpO1xyXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgc2hvdWxkU2VsZWN0RGF0ZShkYXRlTWV0YSkge1xyXG4gICAgICAgIGlmICh0aGlzLmlzTXVsdGlwbGVTZWxlY3Rpb24oKSlcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubWF4RGF0ZUNvdW50ICE9IG51bGwgP8KgdGhpcy5tYXhEYXRlQ291bnQgPiAodGhpcy52YWx1ZSA/IHRoaXMudmFsdWUubGVuZ3RoIDogMCkgOiB0cnVlO1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgb25Nb250aFNlbGVjdChldmVudCwgaW5kZXgpIHtcclxuICAgICAgICBpZiAoIURvbUhhbmRsZXIuaGFzQ2xhc3MoZXZlbnQudGFyZ2V0LCAncC1kaXNhYmxlZCcpKSB7XHJcbiAgICAgICAgICAgIHRoaXMub25EYXRlU2VsZWN0KGV2ZW50LCB7eWVhcjogdGhpcy5jdXJyZW50WWVhciwgbW9udGg6IGluZGV4LCBkYXk6IDEsIHNlbGVjdGFibGU6IHRydWV9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlSW5wdXRmaWVsZCgpIHtcclxuICAgICAgICBsZXQgZm9ybWF0dGVkVmFsdWUgPSAnJztcclxuXHJcbiAgICAgICAgaWYgKHRoaXMudmFsdWUpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuaXNTaW5nbGVTZWxlY3Rpb24oKSkge1xyXG4gICAgICAgICAgICAgICAgZm9ybWF0dGVkVmFsdWUgPSB0aGlzLmZvcm1hdERhdGVUaW1lKHRoaXMudmFsdWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuaXNNdWx0aXBsZVNlbGVjdGlvbigpKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMudmFsdWUubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgZGF0ZUFzU3RyaW5nID0gdGhpcy5mb3JtYXREYXRlVGltZSh0aGlzLnZhbHVlW2ldKTtcclxuICAgICAgICAgICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZSArPSBkYXRlQXNTdHJpbmc7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgIT09ICh0aGlzLnZhbHVlLmxlbmd0aCAtIDEpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlICs9IHRoaXMubXVsdGlwbGVTZXBhcmF0b3IrJyAnO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmICh0aGlzLmlzUmFuZ2VTZWxlY3Rpb24oKSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudmFsdWUgJiYgdGhpcy52YWx1ZS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgc3RhcnREYXRlID0gdGhpcy52YWx1ZVswXTtcclxuICAgICAgICAgICAgICAgICAgICBsZXQgZW5kRGF0ZSA9IHRoaXMudmFsdWVbMV07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlID0gdGhpcy5mb3JtYXREYXRlVGltZShzdGFydERhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlbmREYXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlICs9ICcgJyt0aGlzLnJhbmdlU2VwYXJhdG9yICsnICcgKyB0aGlzLmZvcm1hdERhdGVUaW1lKGVuZERhdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5pbnB1dEZpZWxkVmFsdWUgPSBmb3JtYXR0ZWRWYWx1ZTtcclxuICAgICAgICB0aGlzLnVwZGF0ZUZpbGxlZFN0YXRlKCk7XHJcbiAgICAgICAgaWYgKHRoaXMuaW5wdXRmaWVsZFZpZXdDaGlsZCAmJiB0aGlzLmlucHV0ZmllbGRWaWV3Q2hpbGQubmF0aXZlRWxlbWVudCkge1xyXG4gICAgICAgICAgICB0aGlzLmlucHV0ZmllbGRWaWV3Q2hpbGQubmF0aXZlRWxlbWVudC52YWx1ZSA9IHRoaXMuaW5wdXRGaWVsZFZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmb3JtYXREYXRlVGltZShkYXRlKSB7XHJcbiAgICAgICAgbGV0IGZvcm1hdHRlZFZhbHVlID0gbnVsbDtcclxuICAgICAgICBpZiAoZGF0ZSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy50aW1lT25seSkge1xyXG4gICAgICAgICAgICAgICAgZm9ybWF0dGVkVmFsdWUgPSB0aGlzLmZvcm1hdFRpbWUoZGF0ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBmb3JtYXR0ZWRWYWx1ZSA9IHRoaXMuZm9ybWF0RGF0ZShkYXRlLCB0aGlzLmdldERhdGVGb3JtYXQoKSk7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zaG93VGltZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdHRlZFZhbHVlICs9ICcgJyArIHRoaXMuZm9ybWF0VGltZShkYXRlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZvcm1hdHRlZFZhbHVlO1xyXG4gICAgfVxyXG5cclxuICAgIHNldEN1cnJlbnRIb3VyUE0oaG91cnM6IG51bWJlcikge1xyXG4gICAgICAgIGlmICh0aGlzLmhvdXJGb3JtYXQgPT0gJzEyJykge1xyXG4gICAgICAgICAgICB0aGlzLnBtID0gaG91cnMgPiAxMTtcclxuICAgICAgICAgICAgaWYgKGhvdXJzID49IDEyKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRIb3VyID0gKGhvdXJzID09IDEyKSA/IDEyIDogaG91cnMgLSAxMjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudEhvdXIgPSAoaG91cnMgPT0gMCkgPyAxMiA6IGhvdXJzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRIb3VyID0gaG91cnM7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNlbGVjdERhdGUoZGF0ZU1ldGEpIHtcclxuICAgICAgICBsZXQgZGF0ZSA9IG5ldyBEYXRlKGRhdGVNZXRhLnllYXIsIGRhdGVNZXRhLm1vbnRoLCBkYXRlTWV0YS5kYXkpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5zaG93VGltZSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5ob3VyRm9ybWF0ID09ICcxMicpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRIb3VyID09PSAxMilcclxuICAgICAgICAgICAgICAgICAgICBkYXRlLnNldEhvdXJzKHRoaXMucG0gPyAxMiA6IDApO1xyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGUuc2V0SG91cnModGhpcy5wbSA/IHRoaXMuY3VycmVudEhvdXIgKyAxMiA6IHRoaXMuY3VycmVudEhvdXIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZGF0ZS5zZXRIb3Vycyh0aGlzLmN1cnJlbnRIb3VyKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZGF0ZS5zZXRNaW51dGVzKHRoaXMuY3VycmVudE1pbnV0ZSk7XHJcbiAgICAgICAgICAgIGRhdGUuc2V0U2Vjb25kcyh0aGlzLmN1cnJlbnRTZWNvbmQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMubWluRGF0ZSAmJiB0aGlzLm1pbkRhdGUgPiBkYXRlKSB7XHJcbiAgICAgICAgICAgIGRhdGUgPSB0aGlzLm1pbkRhdGU7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0Q3VycmVudEhvdXJQTShkYXRlLmdldEhvdXJzKCkpO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRNaW51dGUgPSBkYXRlLmdldE1pbnV0ZXMoKTtcclxuICAgICAgICAgICAgdGhpcy5jdXJyZW50U2Vjb25kID0gZGF0ZS5nZXRTZWNvbmRzKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5tYXhEYXRlICYmIHRoaXMubWF4RGF0ZSA8IGRhdGUpIHtcclxuICAgICAgICAgICAgZGF0ZSA9IHRoaXMubWF4RGF0ZTtcclxuICAgICAgICAgICAgdGhpcy5zZXRDdXJyZW50SG91clBNKGRhdGUuZ2V0SG91cnMoKSk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudE1pbnV0ZSA9IGRhdGUuZ2V0TWludXRlcygpO1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTZWNvbmQgPSBkYXRlLmdldFNlY29uZHMoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmlzU2luZ2xlU2VsZWN0aW9uKCkpIHtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVNb2RlbChkYXRlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodGhpcy5pc011bHRpcGxlU2VsZWN0aW9uKCkpIHtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVNb2RlbCh0aGlzLnZhbHVlID8gWy4uLnRoaXMudmFsdWUsIGRhdGVdIDogW2RhdGVdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSBpZiAodGhpcy5pc1JhbmdlU2VsZWN0aW9uKCkpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMudmFsdWUgJiYgdGhpcy52YWx1ZS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGxldCBzdGFydERhdGUgPSB0aGlzLnZhbHVlWzBdO1xyXG4gICAgICAgICAgICAgICAgbGV0IGVuZERhdGUgPSB0aGlzLnZhbHVlWzFdO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICghZW5kRGF0ZSAmJiBkYXRlLmdldFRpbWUoKSA+PSBzdGFydERhdGUuZ2V0VGltZSgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZW5kRGF0ZSA9IGRhdGU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBzdGFydERhdGUgPSBkYXRlO1xyXG4gICAgICAgICAgICAgICAgICAgIGVuZERhdGUgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlTW9kZWwoW3N0YXJ0RGF0ZSwgZW5kRGF0ZV0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVNb2RlbChbZGF0ZSwgbnVsbF0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLm9uU2VsZWN0LmVtaXQoZGF0ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlTW9kZWwodmFsdWUpIHtcclxuICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmRhdGFUeXBlID09ICdkYXRlJykge1xyXG4gICAgICAgICAgICB0aGlzLm9uTW9kZWxDaGFuZ2UodGhpcy52YWx1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMuZGF0YVR5cGUgPT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuaXNTaW5nbGVTZWxlY3Rpb24oKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vbk1vZGVsQ2hhbmdlKHRoaXMuZm9ybWF0RGF0ZVRpbWUodGhpcy52YWx1ZSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbGV0IHN0cmluZ0FyclZhbHVlID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RyaW5nQXJyVmFsdWUgPSB0aGlzLnZhbHVlLm1hcChkYXRlID0+IHRoaXMuZm9ybWF0RGF0ZVRpbWUoZGF0ZSkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhpcy5vbk1vZGVsQ2hhbmdlKHN0cmluZ0FyclZhbHVlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBnZXRGaXJzdERheU9mTW9udGhJbmRleChtb250aDogbnVtYmVyLCB5ZWFyOiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgZGF5ID0gbmV3IERhdGUoKTtcclxuICAgICAgICBkYXkuc2V0RGF0ZSgxKTtcclxuICAgICAgICBkYXkuc2V0TW9udGgobW9udGgpO1xyXG4gICAgICAgIGRheS5zZXRGdWxsWWVhcih5ZWFyKTtcclxuXHJcbiAgICAgICAgbGV0IGRheUluZGV4ID0gZGF5LmdldERheSgpICsgdGhpcy5nZXRTdW5kYXlJbmRleCgpO1xyXG4gICAgICAgIHJldHVybiBkYXlJbmRleCA+PSA3ID8gZGF5SW5kZXggLSA3IDogZGF5SW5kZXg7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0RGF5c0NvdW50SW5Nb250aChtb250aDogbnVtYmVyLCB5ZWFyOiBudW1iZXIpIHtcclxuICAgICAgICByZXR1cm4gMzIgLSB0aGlzLmRheWxpZ2h0U2F2aW5nQWRqdXN0KG5ldyBEYXRlKHllYXIsIG1vbnRoLCAzMikpLmdldERhdGUoKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXREYXlzQ291bnRJblByZXZNb250aChtb250aDogbnVtYmVyLCB5ZWFyOiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgcHJldiA9IHRoaXMuZ2V0UHJldmlvdXNNb250aEFuZFllYXIobW9udGgsIHllYXIpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldERheXNDb3VudEluTW9udGgocHJldi5tb250aCwgcHJldi55ZWFyKTtcclxuICAgIH1cclxuXHJcbiAgICBnZXRQcmV2aW91c01vbnRoQW5kWWVhcihtb250aDogbnVtYmVyLCB5ZWFyOiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgbSwgeTtcclxuXHJcbiAgICAgICAgaWYgKG1vbnRoID09PSAwKSB7XHJcbiAgICAgICAgICAgIG0gPSAxMTtcclxuICAgICAgICAgICAgeSA9IHllYXIgLSAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgbSA9IG1vbnRoIC0gMTtcclxuICAgICAgICAgICAgeSA9IHllYXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4geydtb250aCc6bSwneWVhcic6eX07XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0TmV4dE1vbnRoQW5kWWVhcihtb250aDogbnVtYmVyLCB5ZWFyOiBudW1iZXIpIHtcclxuICAgICAgICBsZXQgbSwgeTtcclxuXHJcbiAgICAgICAgaWYgKG1vbnRoID09PSAxMSkge1xyXG4gICAgICAgICAgICBtID0gMDtcclxuICAgICAgICAgICAgeSA9IHllYXIgKyAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgbSA9IG1vbnRoICsgMTtcclxuICAgICAgICAgICAgeSA9IHllYXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4geydtb250aCc6bSwneWVhcic6eX07XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0U3VuZGF5SW5kZXgoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZmlyc3REYXlPZldlZWsgPiAwID8gNyAtIHRoaXMuZmlyc3REYXlPZldlZWsgOiAwO1xyXG4gICAgfVxyXG5cclxuICAgIGlzU2VsZWN0ZWQoZGF0ZU1ldGEpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAodGhpcy52YWx1ZSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5pc1NpbmdsZVNlbGVjdGlvbigpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5pc0RhdGVFcXVhbHModGhpcy52YWx1ZSwgZGF0ZU1ldGEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuaXNNdWx0aXBsZVNlbGVjdGlvbigpKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2VsZWN0ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGZvciAobGV0IGRhdGUgb2YgdGhpcy52YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkID0gdGhpcy5pc0RhdGVFcXVhbHMoZGF0ZSwgZGF0ZU1ldGEpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChzZWxlY3RlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGVjdGVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuaXNSYW5nZVNlbGVjdGlvbigpKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy52YWx1ZVsxXSlcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5pc0RhdGVFcXVhbHModGhpcy52YWx1ZVswXSwgZGF0ZU1ldGEpIHx8IHRoaXMuaXNEYXRlRXF1YWxzKHRoaXMudmFsdWVbMV0sIGRhdGVNZXRhKSB8fCB0aGlzLmlzRGF0ZUJldHdlZW4odGhpcy52YWx1ZVswXSwgdGhpcy52YWx1ZVsxXSwgZGF0ZU1ldGEpO1xyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmlzRGF0ZUVxdWFscyh0aGlzLnZhbHVlWzBdLCBkYXRlTWV0YSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpc01vbnRoU2VsZWN0ZWQobW9udGg6IG51bWJlcik6IGJvb2xlYW4ge1xyXG4gICAgICAgIGxldCBkYXkgPSB0aGlzLnZhbHVlID8gKEFycmF5LmlzQXJyYXkodGhpcy52YWx1ZSkgPyB0aGlzLnZhbHVlWzBdLmdldERhdGUoKSA6IHRoaXMudmFsdWUuZ2V0RGF0ZSgpKSA6IDE7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNTZWxlY3RlZCh7eWVhcjogdGhpcy5jdXJyZW50WWVhciwgbW9udGg6IG1vbnRoLCBkYXk6IGRheSwgc2VsZWN0YWJsZTogdHJ1ZX0pO1xyXG4gICAgfVxyXG5cclxuICAgIGlzRGF0ZUVxdWFscyh2YWx1ZSwgZGF0ZU1ldGEpIHtcclxuICAgICAgICBpZiAodmFsdWUpXHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS5nZXREYXRlKCkgPT09IGRhdGVNZXRhLmRheSAmJiB2YWx1ZS5nZXRNb250aCgpID09PSBkYXRlTWV0YS5tb250aCAmJiB2YWx1ZS5nZXRGdWxsWWVhcigpID09PSBkYXRlTWV0YS55ZWFyO1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlzRGF0ZUJldHdlZW4oc3RhcnQsIGVuZCwgZGF0ZU1ldGEpIHtcclxuICAgICAgICBsZXQgYmV0d2VlbiA6IGJvb2xlYW4gPSBmYWxzZTtcclxuICAgICAgICBpZiAoc3RhcnQgJiYgZW5kKSB7XHJcbiAgICAgICAgICAgIGxldCBkYXRlOiBEYXRlID0gbmV3IERhdGUoZGF0ZU1ldGEueWVhciwgZGF0ZU1ldGEubW9udGgsIGRhdGVNZXRhLmRheSk7XHJcbiAgICAgICAgICAgIHJldHVybiBzdGFydC5nZXRUaW1lKCkgPD0gZGF0ZS5nZXRUaW1lKCkgJiYgZW5kLmdldFRpbWUoKSA+PSBkYXRlLmdldFRpbWUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBiZXR3ZWVuO1xyXG4gICAgfVxyXG5cclxuICAgIGlzU2luZ2xlU2VsZWN0aW9uKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnNlbGVjdGlvbk1vZGUgPT09ICdzaW5nbGUnO1xyXG4gICAgfVxyXG5cclxuICAgIGlzUmFuZ2VTZWxlY3Rpb24oKTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0aW9uTW9kZSA9PT0gJ3JhbmdlJztcclxuICAgIH1cclxuXHJcbiAgICBpc011bHRpcGxlU2VsZWN0aW9uKCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0aGlzLnNlbGVjdGlvbk1vZGUgPT09ICdtdWx0aXBsZSc7XHJcbiAgICB9XHJcblxyXG4gICAgaXNUb2RheSh0b2RheSwgZGF5LCBtb250aCwgeWVhcik6IGJvb2xlYW4ge1xyXG4gICAgICAgIHJldHVybiB0b2RheS5nZXREYXRlKCkgPT09IGRheSAmJiB0b2RheS5nZXRNb250aCgpID09PSBtb250aCAmJiB0b2RheS5nZXRGdWxsWWVhcigpID09PSB5ZWFyO1xyXG4gICAgfVxyXG5cclxuICAgIGlzU2VsZWN0YWJsZShkYXksIG1vbnRoLCB5ZWFyLCBvdGhlck1vbnRoKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IHZhbGlkTWluID0gdHJ1ZTtcclxuICAgICAgICBsZXQgdmFsaWRNYXggPSB0cnVlO1xyXG4gICAgICAgIGxldCB2YWxpZERhdGUgPSB0cnVlO1xyXG4gICAgICAgIGxldCB2YWxpZERheSA9IHRydWU7XHJcblxyXG4gICAgICAgIGlmIChvdGhlck1vbnRoICYmICF0aGlzLnNlbGVjdE90aGVyTW9udGhzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLm1pbkRhdGUpIHtcclxuICAgICAgICAgICAgIGlmICh0aGlzLm1pbkRhdGUuZ2V0RnVsbFllYXIoKSA+IHllYXIpIHtcclxuICAgICAgICAgICAgICAgICB2YWxpZE1pbiA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5taW5EYXRlLmdldEZ1bGxZZWFyKCkgPT09IHllYXIpIHtcclxuICAgICAgICAgICAgICAgICBpZiAodGhpcy5taW5EYXRlLmdldE1vbnRoKCkgPiBtb250aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICB2YWxpZE1pbiA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICBlbHNlIGlmICh0aGlzLm1pbkRhdGUuZ2V0TW9udGgoKSA9PT0gbW9udGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMubWluRGF0ZS5nZXREYXRlKCkgPiBkYXkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkTWluID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5tYXhEYXRlKSB7XHJcbiAgICAgICAgICAgICBpZiAodGhpcy5tYXhEYXRlLmdldEZ1bGxZZWFyKCkgPCB5ZWFyKSB7XHJcbiAgICAgICAgICAgICAgICAgdmFsaWRNYXggPSBmYWxzZTtcclxuICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMubWF4RGF0ZS5nZXRGdWxsWWVhcigpID09PSB5ZWFyKSB7XHJcbiAgICAgICAgICAgICAgICAgaWYgKHRoaXMubWF4RGF0ZS5nZXRNb250aCgpIDwgbW9udGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgdmFsaWRNYXggPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5tYXhEYXRlLmdldE1vbnRoKCkgPT09IG1vbnRoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm1heERhdGUuZ2V0RGF0ZSgpIDwgZGF5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICB2YWxpZE1heCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWREYXRlcykge1xyXG4gICAgICAgICAgIHZhbGlkRGF0ZSA9ICF0aGlzLmlzRGF0ZURpc2FibGVkKGRheSxtb250aCx5ZWFyKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmRpc2FibGVkRGF5cykge1xyXG4gICAgICAgICAgIHZhbGlkRGF5ID0gIXRoaXMuaXNEYXlEaXNhYmxlZChkYXksbW9udGgseWVhcilcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB2YWxpZE1pbiAmJiB2YWxpZE1heCAmJiB2YWxpZERhdGUgJiYgdmFsaWREYXk7XHJcbiAgICB9XHJcblxyXG4gICAgaXNEYXRlRGlzYWJsZWQoZGF5Om51bWJlciwgbW9udGg6bnVtYmVyLCB5ZWFyOm51bWJlcik6Ym9vbGVhbiB7XHJcbiAgICAgICAgaWYgKHRoaXMuZGlzYWJsZWREYXRlcykge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBkaXNhYmxlZERhdGUgb2YgdGhpcy5kaXNhYmxlZERhdGVzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGlzYWJsZWREYXRlLmdldEZ1bGxZZWFyKCkgPT09IHllYXIgJiYgZGlzYWJsZWREYXRlLmdldE1vbnRoKCkgPT09IG1vbnRoICYmIGRpc2FibGVkRGF0ZS5nZXREYXRlKCkgPT09IGRheSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgaXNEYXlEaXNhYmxlZChkYXk6bnVtYmVyLCBtb250aDpudW1iZXIsIHllYXI6bnVtYmVyKTpib29sZWFuIHtcclxuICAgICAgICBpZiAodGhpcy5kaXNhYmxlZERheXMpIHtcclxuICAgICAgICAgICAgbGV0IHdlZWtkYXkgPSBuZXcgRGF0ZSh5ZWFyLCBtb250aCwgZGF5KTtcclxuICAgICAgICAgICAgbGV0IHdlZWtkYXlOdW1iZXIgPSB3ZWVrZGF5LmdldERheSgpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kaXNhYmxlZERheXMuaW5kZXhPZih3ZWVrZGF5TnVtYmVyKSAhPT0gLTE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBvbklucHV0Rm9jdXMoZXZlbnQ6IEV2ZW50KSB7XHJcbiAgICAgICAgdGhpcy5mb2N1cyA9IHRydWU7XHJcbiAgICAgICAgaWYgKHRoaXMuc2hvd09uRm9jdXMpIHtcclxuICAgICAgICAgICAgdGhpcy5zaG93T3ZlcmxheSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLm9uRm9jdXMuZW1pdChldmVudCk7XHJcbiAgICB9XHJcblxyXG4gICAgb25JbnB1dENsaWNrKCkge1xyXG4gICAgICAgIGlmICh0aGlzLm92ZXJsYXkgJiYgdGhpcy5hdXRvWkluZGV4KSB7XHJcbiAgICAgICAgICAgIHRoaXMub3ZlcmxheS5zdHlsZS56SW5kZXggPSBTdHJpbmcodGhpcy5iYXNlWkluZGV4ICsgKCsrRG9tSGFuZGxlci56aW5kZXgpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnNob3dPbkZvY3VzICYmICF0aGlzLm92ZXJsYXlWaXNpYmxlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2hvd092ZXJsYXkoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgb25JbnB1dEJsdXIoZXZlbnQ6IEV2ZW50KSB7XHJcbiAgICAgICAgdGhpcy5mb2N1cyA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMub25CbHVyLmVtaXQoZXZlbnQpO1xyXG4gICAgICAgIGlmICghdGhpcy5rZWVwSW52YWxpZCkge1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUlucHV0ZmllbGQoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5vbk1vZGVsVG91Y2hlZCgpO1xyXG4gICAgfVxyXG5cclxuICAgIG9uQnV0dG9uQ2xpY2soZXZlbnQsIGlucHV0ZmllbGQpIHtcclxuICAgICAgICBpZiAoIXRoaXMub3ZlcmxheVZpc2libGUpIHtcclxuICAgICAgICAgICAgaW5wdXRmaWVsZC5mb2N1cygpO1xyXG4gICAgICAgICAgICB0aGlzLnNob3dPdmVybGF5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmhpZGVPdmVybGF5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG9uUHJldkJ1dHRvbkNsaWNrKGV2ZW50KSB7XHJcbiAgICAgICAgdGhpcy5uYXZpZ2F0aW9uU3RhdGUgPSB7YmFja3dhcmQ6IHRydWUsIGJ1dHRvbjogdHJ1ZX07XHJcbiAgICAgICAgdGhpcy5uYXZCYWNrd2FyZChldmVudCk7XHJcbiAgICB9XHJcblxyXG4gICAgb25OZXh0QnV0dG9uQ2xpY2soZXZlbnQpIHtcclxuICAgICAgICB0aGlzLm5hdmlnYXRpb25TdGF0ZSA9IHtiYWNrd2FyZDogZmFsc2UsIGJ1dHRvbjogdHJ1ZX07XHJcbiAgICAgICAgdGhpcy5uYXZGb3J3YXJkKGV2ZW50KTtcclxuICAgIH1cclxuXHJcbiAgICBvbkNvbnRhaW5lckJ1dHRvbktleWRvd24oZXZlbnQpIHtcclxuICAgICAgICBzd2l0Y2ggKGV2ZW50LndoaWNoKSB7XHJcbiAgICAgICAgICAgLy90YWJcclxuICAgICAgICAgICBjYXNlIDk6XHJcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuaW5saW5lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50cmFwRm9jdXMoZXZlbnQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAvL2VzY2FwZVxyXG4gICAgICAgICAgIGNhc2UgMjc6XHJcbiAgICAgICAgICAgICAgIHRoaXMub3ZlcmxheVZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgLy9Ob29wXHJcbiAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICB9XHJcblxyXG4gICAgb25JbnB1dEtleWRvd24oZXZlbnQpIHtcclxuICAgICAgICB0aGlzLmlzS2V5ZG93biA9IHRydWU7XHJcbiAgICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IDQwICYmIHRoaXMuY29udGVudFZpZXdDaGlsZCkge1xyXG4gICAgICAgICAgICB0aGlzLnRyYXBGb2N1cyhldmVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGV2ZW50LmtleUNvZGUgPT09IDI3KSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm92ZXJsYXlWaXNpYmxlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm92ZXJsYXlWaXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGV2ZW50LmtleUNvZGUgPT09IDEzKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm92ZXJsYXlWaXNpYmxlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm92ZXJsYXlWaXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKGV2ZW50LmtleUNvZGUgPT09IDkgJiYgdGhpcy5jb250ZW50Vmlld0NoaWxkKSB7XHJcbiAgICAgICAgICAgIERvbUhhbmRsZXIuZ2V0Rm9jdXNhYmxlRWxlbWVudHModGhpcy5jb250ZW50Vmlld0NoaWxkLm5hdGl2ZUVsZW1lbnQpLmZvckVhY2goZWwgPT4gZWwudGFiSW5kZXggPSAnLTEnKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMub3ZlcmxheVZpc2libGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMub3ZlcmxheVZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBvbkRhdGVDZWxsS2V5ZG93bihldmVudCwgZGF0ZSwgZ3JvdXBJbmRleCkge1xyXG4gICAgICAgIGNvbnN0IGNlbGxDb250ZW50ID0gZXZlbnQuY3VycmVudFRhcmdldDtcclxuICAgICAgICBjb25zdCBjZWxsID0gY2VsbENvbnRlbnQucGFyZW50RWxlbWVudDtcclxuXHJcbiAgICAgICAgc3dpdGNoIChldmVudC53aGljaCkge1xyXG4gICAgICAgICAgICAvL2Rvd24gYXJyb3dcclxuICAgICAgICAgICAgY2FzZSA0MDoge1xyXG4gICAgICAgICAgICAgICAgY2VsbENvbnRlbnQudGFiSW5kZXggPSAnLTEnO1xyXG4gICAgICAgICAgICAgICAgbGV0IGNlbGxJbmRleCA9IERvbUhhbmRsZXIuaW5kZXgoY2VsbCk7XHJcbiAgICAgICAgICAgICAgICBsZXQgbmV4dFJvdyA9IGNlbGwucGFyZW50RWxlbWVudC5uZXh0RWxlbWVudFNpYmxpbmc7XHJcbiAgICAgICAgICAgICAgICBpZiAobmV4dFJvdykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBmb2N1c0NlbGwgPSBuZXh0Um93LmNoaWxkcmVuW2NlbGxJbmRleF0uY2hpbGRyZW5bMF07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKERvbUhhbmRsZXIuaGFzQ2xhc3MoZm9jdXNDZWxsLCAncC1kaXNhYmxlZCcpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubmF2aWdhdGlvblN0YXRlID0ge2JhY2t3YXJkOiBmYWxzZX07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubmF2Rm9yd2FyZChldmVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0Um93LmNoaWxkcmVuW2NlbGxJbmRleF0uY2hpbGRyZW5bMF0udGFiSW5kZXggPSAnMCc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHRSb3cuY2hpbGRyZW5bY2VsbEluZGV4XS5jaGlsZHJlblswXS5mb2N1cygpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubmF2aWdhdGlvblN0YXRlID0ge2JhY2t3YXJkOiBmYWxzZX07XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5uYXZGb3J3YXJkKGV2ZW50KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy91cCBhcnJvd1xyXG4gICAgICAgICAgICBjYXNlIDM4OiB7XHJcbiAgICAgICAgICAgICAgICBjZWxsQ29udGVudC50YWJJbmRleCA9ICctMSc7XHJcbiAgICAgICAgICAgICAgICBsZXQgY2VsbEluZGV4ID0gRG9tSGFuZGxlci5pbmRleChjZWxsKTtcclxuICAgICAgICAgICAgICAgIGxldCBwcmV2Um93ID0gY2VsbC5wYXJlbnRFbGVtZW50LnByZXZpb3VzRWxlbWVudFNpYmxpbmc7XHJcbiAgICAgICAgICAgICAgICBpZiAocHJldlJvdykge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBmb2N1c0NlbGwgPSBwcmV2Um93LmNoaWxkcmVuW2NlbGxJbmRleF0uY2hpbGRyZW5bMF07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKERvbUhhbmRsZXIuaGFzQ2xhc3MoZm9jdXNDZWxsLCAncC1kaXNhYmxlZCcpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubmF2aWdhdGlvblN0YXRlID0ge2JhY2t3YXJkOiB0cnVlfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5uYXZCYWNrd2FyZChldmVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb2N1c0NlbGwudGFiSW5kZXggPSAnMCc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvY3VzQ2VsbC5mb2N1cygpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubmF2aWdhdGlvblN0YXRlID0ge2JhY2t3YXJkOiB0cnVlfTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLm5hdkJhY2t3YXJkKGV2ZW50KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy9sZWZ0IGFycm93XHJcbiAgICAgICAgICAgIGNhc2UgMzc6IHtcclxuICAgICAgICAgICAgICAgIGNlbGxDb250ZW50LnRhYkluZGV4ID0gJy0xJztcclxuICAgICAgICAgICAgICAgIGxldCBwcmV2Q2VsbCA9IGNlbGwucHJldmlvdXNFbGVtZW50U2libGluZztcclxuICAgICAgICAgICAgICAgIGlmIChwcmV2Q2VsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBmb2N1c0NlbGwgPSBwcmV2Q2VsbC5jaGlsZHJlblswXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoRG9tSGFuZGxlci5oYXNDbGFzcyhmb2N1c0NlbGwsICdwLWRpc2FibGVkJykgfHwgRG9tSGFuZGxlci5oYXNDbGFzcyhmb2N1c0NlbGwucGFyZW50RWxlbWVudCwgJ3AtZGF0ZXBpY2tlci13ZWVrbnVtYmVyJykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5uYXZpZ2F0ZVRvTW9udGgodHJ1ZSwgZ3JvdXBJbmRleCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb2N1c0NlbGwudGFiSW5kZXggPSAnMCc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvY3VzQ2VsbC5mb2N1cygpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubmF2aWdhdGVUb01vbnRoKHRydWUsIGdyb3VwSW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL3JpZ2h0IGFycm93XHJcbiAgICAgICAgICAgIGNhc2UgMzk6IHtcclxuICAgICAgICAgICAgICAgIGNlbGxDb250ZW50LnRhYkluZGV4ID0gJy0xJztcclxuICAgICAgICAgICAgICAgIGxldCBuZXh0Q2VsbCA9IGNlbGwubmV4dEVsZW1lbnRTaWJsaW5nO1xyXG4gICAgICAgICAgICAgICAgaWYgKG5leHRDZWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGZvY3VzQ2VsbCA9IG5leHRDZWxsLmNoaWxkcmVuWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChEb21IYW5kbGVyLmhhc0NsYXNzKGZvY3VzQ2VsbCwgJ3AtZGlzYWJsZWQnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm5hdmlnYXRlVG9Nb250aChmYWxzZSwgZ3JvdXBJbmRleCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb2N1c0NlbGwudGFiSW5kZXggPSAnMCc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvY3VzQ2VsbC5mb2N1cygpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubmF2aWdhdGVUb01vbnRoKGZhbHNlLCBncm91cEluZGV4KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy9lbnRlclxyXG4gICAgICAgICAgICBjYXNlIDEzOiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9uRGF0ZVNlbGVjdChldmVudCwgZGF0ZSk7XHJcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vZXNjYXBlXHJcbiAgICAgICAgICAgIGNhc2UgMjc6IHtcclxuICAgICAgICAgICAgICAgIHRoaXMub3ZlcmxheVZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy90YWJcclxuICAgICAgICAgICAgY2FzZSA5OiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuaW5saW5lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50cmFwRm9jdXMoZXZlbnQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAvL25vIG9wXHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBvbk1vbnRoQ2VsbEtleWRvd24oZXZlbnQsIGluZGV4KSB7XHJcbiAgICAgICAgY29uc3QgY2VsbCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQ7XHJcbiAgICAgICAgc3dpdGNoIChldmVudC53aGljaCkge1xyXG4gICAgICAgICAgICAvL2Fycm93c1xyXG4gICAgICAgICAgICBjYXNlIDM4OlxyXG4gICAgICAgICAgICBjYXNlIDQwOiB7XHJcbiAgICAgICAgICAgICAgICBjZWxsLnRhYkluZGV4ID0gJy0xJztcclxuICAgICAgICAgICAgICAgIHZhciBjZWxscyA9IGNlbGwucGFyZW50RWxlbWVudC5jaGlsZHJlbjtcclxuICAgICAgICAgICAgICAgIHZhciBjZWxsSW5kZXggPSBEb21IYW5kbGVyLmluZGV4KGNlbGwpO1xyXG4gICAgICAgICAgICAgICAgbGV0IG5leHRDZWxsID0gY2VsbHNbZXZlbnQud2hpY2ggPT09IDQwID8gY2VsbEluZGV4ICsgMyA6IGNlbGxJbmRleCAtM107XHJcbiAgICAgICAgICAgICAgICBpZiAobmV4dENlbGwpIHtcclxuICAgICAgICAgICAgICAgICAgICBuZXh0Q2VsbC50YWJJbmRleCA9ICcwJztcclxuICAgICAgICAgICAgICAgICAgICBuZXh0Q2VsbC5mb2N1cygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL2xlZnQgYXJyb3dcclxuICAgICAgICAgICAgY2FzZSAzNzoge1xyXG4gICAgICAgICAgICAgICAgY2VsbC50YWJJbmRleCA9ICctMSc7XHJcbiAgICAgICAgICAgICAgICBsZXQgcHJldkNlbGwgPSBjZWxsLnByZXZpb3VzRWxlbWVudFNpYmxpbmc7XHJcbiAgICAgICAgICAgICAgICBpZiAocHJldkNlbGwpIHtcclxuICAgICAgICAgICAgICAgICAgICBwcmV2Q2VsbC50YWJJbmRleCA9ICcwJztcclxuICAgICAgICAgICAgICAgICAgICBwcmV2Q2VsbC5mb2N1cygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL3JpZ2h0IGFycm93XHJcbiAgICAgICAgICAgIGNhc2UgMzk6IHtcclxuICAgICAgICAgICAgICAgIGNlbGwudGFiSW5kZXggPSAnLTEnO1xyXG4gICAgICAgICAgICAgICAgbGV0IG5leHRDZWxsID0gY2VsbC5uZXh0RWxlbWVudFNpYmxpbmc7XHJcbiAgICAgICAgICAgICAgICBpZiAobmV4dENlbGwpIHtcclxuICAgICAgICAgICAgICAgICAgICBuZXh0Q2VsbC50YWJJbmRleCA9ICcwJztcclxuICAgICAgICAgICAgICAgICAgICBuZXh0Q2VsbC5mb2N1cygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL2VudGVyXHJcbiAgICAgICAgICAgIGNhc2UgMTM6IHtcclxuICAgICAgICAgICAgICAgIHRoaXMub25Nb250aFNlbGVjdChldmVudCwgaW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvL2VzY2FwZVxyXG4gICAgICAgICAgICBjYXNlIDI3OiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm92ZXJsYXlWaXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vdGFiXHJcbiAgICAgICAgICAgIGNhc2UgOToge1xyXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmlubGluZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHJhcEZvY3VzKGV2ZW50KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgLy9ubyBvcFxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbmF2aWdhdGVUb01vbnRoKHByZXYsIGdyb3VwSW5kZXgpIHtcclxuICAgICAgICBpZiAocHJldikge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5udW1iZXJPZk1vbnRocyA9PT0gMSB8fCAoZ3JvdXBJbmRleCA9PT0gMCkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubmF2aWdhdGlvblN0YXRlID0ge2JhY2t3YXJkOiB0cnVlfTtcclxuICAgICAgICAgICAgICAgIHRoaXMubmF2QmFja3dhcmQoZXZlbnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbGV0IHByZXZNb250aENvbnRhaW5lciA9IHRoaXMuY29udGVudFZpZXdDaGlsZC5uYXRpdmVFbGVtZW50LmNoaWxkcmVuW2dyb3VwSW5kZXggLSAxXTtcclxuICAgICAgICAgICAgICAgIGxldCBjZWxscyA9IERvbUhhbmRsZXIuZmluZChwcmV2TW9udGhDb250YWluZXIsICcucC1kYXRlcGlja2VyLWNhbGVuZGFyIHRkIHNwYW46bm90KC5wLWRpc2FibGVkKTpub3QoLnAtaW5rKScpO1xyXG4gICAgICAgICAgICAgICAgbGV0IGZvY3VzQ2VsbCA9IGNlbGxzW2NlbGxzLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgICAgICAgICAgZm9jdXNDZWxsLnRhYkluZGV4ID0gJzAnO1xyXG4gICAgICAgICAgICAgICAgZm9jdXNDZWxsLmZvY3VzKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm51bWJlck9mTW9udGhzID09PSAxIHx8IChncm91cEluZGV4ID09PSB0aGlzLm51bWJlck9mTW9udGhzIC0gMSkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubmF2aWdhdGlvblN0YXRlID0ge2JhY2t3YXJkOiBmYWxzZX07XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5hdkZvcndhcmQoZXZlbnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbGV0IG5leHRNb250aENvbnRhaW5lciA9IHRoaXMuY29udGVudFZpZXdDaGlsZC5uYXRpdmVFbGVtZW50LmNoaWxkcmVuW2dyb3VwSW5kZXggKyAxXTtcclxuICAgICAgICAgICAgICAgIGxldCBmb2N1c0NlbGwgPSBEb21IYW5kbGVyLmZpbmRTaW5nbGUobmV4dE1vbnRoQ29udGFpbmVyLCAnLnAtZGF0ZXBpY2tlci1jYWxlbmRhciB0ZCBzcGFuOm5vdCgucC1kaXNhYmxlZCk6bm90KC5wLWluayknKTtcclxuICAgICAgICAgICAgICAgIGZvY3VzQ2VsbC50YWJJbmRleCA9ICcwJztcclxuICAgICAgICAgICAgICAgIGZvY3VzQ2VsbC5mb2N1cygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZUZvY3VzKCkge1xyXG4gICAgICAgIGxldCBjZWxsO1xyXG4gICAgICAgIGlmICh0aGlzLm5hdmlnYXRpb25TdGF0ZSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5uYXZpZ2F0aW9uU3RhdGUuYnV0dG9uKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmluaXRGb2N1c2FibGVDZWxsKCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubmF2aWdhdGlvblN0YXRlLmJhY2t3YXJkKVxyXG4gICAgICAgICAgICAgICAgICAgIERvbUhhbmRsZXIuZmluZFNpbmdsZSh0aGlzLmNvbnRlbnRWaWV3Q2hpbGQubmF0aXZlRWxlbWVudCwgJy5wLWRhdGVwaWNrZXItcHJldicpLmZvY3VzKCk7XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgRG9tSGFuZGxlci5maW5kU2luZ2xlKHRoaXMuY29udGVudFZpZXdDaGlsZC5uYXRpdmVFbGVtZW50LCAnLnAtZGF0ZXBpY2tlci1uZXh0JykuZm9jdXMoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm5hdmlnYXRpb25TdGF0ZS5iYWNrd2FyZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBjZWxscyA9IERvbUhhbmRsZXIuZmluZCh0aGlzLmNvbnRlbnRWaWV3Q2hpbGQubmF0aXZlRWxlbWVudCwgJy5wLWRhdGVwaWNrZXItY2FsZW5kYXIgdGQgc3Bhbjpub3QoLnAtZGlzYWJsZWQpOm5vdCgucC1pbmspJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2VsbCA9IGNlbGxzW2NlbGxzLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2VsbCA9IERvbUhhbmRsZXIuZmluZFNpbmdsZSh0aGlzLmNvbnRlbnRWaWV3Q2hpbGQubmF0aXZlRWxlbWVudCwgJy5wLWRhdGVwaWNrZXItY2FsZW5kYXIgdGQgc3Bhbjpub3QoLnAtZGlzYWJsZWQpOm5vdCgucC1pbmspJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGNlbGwpIHtcclxuICAgICAgICAgICAgICAgICAgICBjZWxsLnRhYkluZGV4ID0gJzAnO1xyXG4gICAgICAgICAgICAgICAgICAgIGNlbGwuZm9jdXMoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5uYXZpZ2F0aW9uU3RhdGUgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5pbml0Rm9jdXNhYmxlQ2VsbCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpbml0Rm9jdXNhYmxlQ2VsbCgpIHtcclxuICAgICAgICBsZXQgY2VsbDtcclxuICAgICAgICBpZiAodGhpcy52aWV3ID09PSAnbW9udGgnKSB7XHJcbiAgICAgICAgICAgIGxldCBjZWxscyA9IERvbUhhbmRsZXIuZmluZCh0aGlzLmNvbnRlbnRWaWV3Q2hpbGQubmF0aXZlRWxlbWVudCwgJy5wLW1vbnRocGlja2VyIC5wLW1vbnRocGlja2VyLW1vbnRoOm5vdCgucC1kaXNhYmxlZCknKTtcclxuICAgICAgICAgICAgbGV0IHNlbGVjdGVkQ2VsbD0gRG9tSGFuZGxlci5maW5kU2luZ2xlKHRoaXMuY29udGVudFZpZXdDaGlsZC5uYXRpdmVFbGVtZW50LCAnLnAtbW9udGhwaWNrZXIgLnAtbW9udGhwaWNrZXItbW9udGgucC1oaWdobGlnaHQnKTtcclxuICAgICAgICAgICAgY2VsbHMuZm9yRWFjaChjZWxsID0+IGNlbGwudGFiSW5kZXggPSAtMSk7XHJcbiAgICAgICAgICAgIGNlbGwgPSBzZWxlY3RlZENlbGwgfHwgY2VsbHNbMF07XHJcblxyXG4gICAgICAgICAgICBpZiAoY2VsbHMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgZGlzYWJsZWRDZWxscyA9IERvbUhhbmRsZXIuZmluZCh0aGlzLmNvbnRlbnRWaWV3Q2hpbGQubmF0aXZlRWxlbWVudCwgJy5wLW1vbnRocGlja2VyIC5wLW1vbnRocGlja2VyLW1vbnRoLnAtZGlzYWJsZWRbdGFiaW5kZXggPSBcIjBcIl0nKTtcclxuICAgICAgICAgICAgICAgIGRpc2FibGVkQ2VsbHMuZm9yRWFjaChjZWxsID0+IGNlbGwudGFiSW5kZXggPSAtMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGNlbGwgPSBEb21IYW5kbGVyLmZpbmRTaW5nbGUodGhpcy5jb250ZW50Vmlld0NoaWxkLm5hdGl2ZUVsZW1lbnQsICdzcGFuLnAtaGlnaGxpZ2h0Jyk7XHJcbiAgICAgICAgICAgIGlmICghY2VsbCkge1xyXG4gICAgICAgICAgICAgICAgbGV0IHRvZGF5Q2VsbCA9IERvbUhhbmRsZXIuZmluZFNpbmdsZSh0aGlzLmNvbnRlbnRWaWV3Q2hpbGQubmF0aXZlRWxlbWVudCwgJ3RkLnAtZGF0ZXBpY2tlci10b2RheSBzcGFuOm5vdCgucC1kaXNhYmxlZCk6bm90KC5wLWluayknKTtcclxuICAgICAgICAgICAgICAgIGlmICh0b2RheUNlbGwpXHJcbiAgICAgICAgICAgICAgICAgICAgY2VsbCA9IHRvZGF5Q2VsbDtcclxuICAgICAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgICAgICBjZWxsID0gRG9tSGFuZGxlci5maW5kU2luZ2xlKHRoaXMuY29udGVudFZpZXdDaGlsZC5uYXRpdmVFbGVtZW50LCAnLnAtZGF0ZXBpY2tlci1jYWxlbmRhciB0ZCBzcGFuOm5vdCgucC1kaXNhYmxlZCk6bm90KC5wLWluayknKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGNlbGwpIHtcclxuICAgICAgICAgICAgY2VsbC50YWJJbmRleCA9ICcwJztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdHJhcEZvY3VzKGV2ZW50KSB7XHJcbiAgICAgICAgbGV0IGZvY3VzYWJsZUVsZW1lbnRzID0gRG9tSGFuZGxlci5nZXRGb2N1c2FibGVFbGVtZW50cyh0aGlzLmNvbnRlbnRWaWV3Q2hpbGQubmF0aXZlRWxlbWVudCk7XHJcblxyXG4gICAgICAgIGlmIChmb2N1c2FibGVFbGVtZW50cyAmJiBmb2N1c2FibGVFbGVtZW50cy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGlmICghZm9jdXNhYmxlRWxlbWVudHNbMF0ub3duZXJEb2N1bWVudC5hY3RpdmVFbGVtZW50KSB7XHJcbiAgICAgICAgICAgICAgICBmb2N1c2FibGVFbGVtZW50c1swXS5mb2N1cygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbGV0IGZvY3VzZWRJbmRleCA9IGZvY3VzYWJsZUVsZW1lbnRzLmluZGV4T2YoZm9jdXNhYmxlRWxlbWVudHNbMF0ub3duZXJEb2N1bWVudC5hY3RpdmVFbGVtZW50KTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQuc2hpZnRLZXkpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZm9jdXNlZEluZGV4ID09IC0xIHx8IGZvY3VzZWRJbmRleCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5mb2N1c1RyYXApe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9jdXNhYmxlRWxlbWVudHNbZm9jdXNhYmxlRWxlbWVudHMubGVuZ3RoIC0gMV0uZm9jdXMoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmb2N1c2VkSW5kZXggPT09IC0xKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmhpZGVPdmVybGF5KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChmb2N1c2VkSW5kZXggPT09IDApXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb2N1c2FibGVFbGVtZW50c1tmb2N1c2VkSW5kZXggLSAxXS5mb2N1cygpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChmb2N1c2VkSW5kZXggPT0gLTEgfHwgZm9jdXNlZEluZGV4ID09PSAoZm9jdXNhYmxlRWxlbWVudHMubGVuZ3RoIC0gMSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLmZvY3VzVHJhcCAmJiBmb2N1c2VkSW5kZXggIT0gLTEpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5oaWRlT3ZlcmxheSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb2N1c2FibGVFbGVtZW50c1swXS5mb2N1cygpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9jdXNhYmxlRWxlbWVudHNbZm9jdXNlZEluZGV4ICsgMV0uZm9jdXMoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgb25Nb250aERyb3Bkb3duQ2hhbmdlKG06IHN0cmluZykge1xyXG4gICAgICAgIHRoaXMuY3VycmVudE1vbnRoID0gcGFyc2VJbnQobSk7XHJcbiAgICAgICAgdGhpcy5vbk1vbnRoQ2hhbmdlLmVtaXQoeyBtb250aDogdGhpcy5jdXJyZW50TW9udGggKyAxLCB5ZWFyOiB0aGlzLmN1cnJlbnRZZWFyIH0pO1xyXG4gICAgICAgIHRoaXMuY3JlYXRlTW9udGhzKHRoaXMuY3VycmVudE1vbnRoLCB0aGlzLmN1cnJlbnRZZWFyKTtcclxuICAgIH1cclxuXHJcbiAgICBvblllYXJEcm9wZG93bkNoYW5nZSh5OiBzdHJpbmcpIHtcclxuICAgICAgICB0aGlzLmN1cnJlbnRZZWFyID0gcGFyc2VJbnQoeSk7XHJcbiAgICAgICAgdGhpcy5vblllYXJDaGFuZ2UuZW1pdCh7IG1vbnRoOiB0aGlzLmN1cnJlbnRNb250aCArIDEsIHllYXI6IHRoaXMuY3VycmVudFllYXIgfSk7XHJcbiAgICAgICAgdGhpcy5jcmVhdGVNb250aHModGhpcy5jdXJyZW50TW9udGgsIHRoaXMuY3VycmVudFllYXIpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnZlcnRUbzI0SG91ciA9IGZ1bmN0aW9uIChob3VyczogbnVtYmVyLCBwbTogYm9vbGVhbikge1xyXG4gICAgICAgIGlmICh0aGlzLmhvdXJGb3JtYXQgPT0gJzEyJykge1xyXG4gICAgICAgICAgICBpZiAoaG91cnMgPT09IDEyKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKHBtID8gMTIgOiAwKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAocG0gPyBob3VycyArIDEyIDogaG91cnMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBob3VycztcclxuICAgIH1cclxuXHJcbiAgICB2YWxpZGF0ZVRpbWUoaG91cjogbnVtYmVyLCBtaW51dGU6IG51bWJlciwgc2Vjb25kOiBudW1iZXIsIHBtOiBib29sZWFuKSB7XHJcbiAgICAgICAgbGV0IHZhbHVlID0gdGhpcy52YWx1ZTtcclxuICAgICAgICBjb25zdCBjb252ZXJ0ZWRIb3VyID0gdGhpcy5jb252ZXJ0VG8yNEhvdXIoaG91ciwgcG0pO1xyXG4gICAgICAgIGlmICh0aGlzLmlzUmFuZ2VTZWxlY3Rpb24oKSkge1xyXG4gICAgICAgICAgICB2YWx1ZSA9IHRoaXMudmFsdWVbMV0gfHwgdGhpcy52YWx1ZVswXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKHRoaXMuaXNNdWx0aXBsZVNlbGVjdGlvbigpKSB7XHJcbiAgICAgICAgICAgIHZhbHVlID0gdGhpcy52YWx1ZVt0aGlzLnZhbHVlLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCB2YWx1ZURhdGVTdHJpbmcgPSB2YWx1ZSA/IHZhbHVlLnRvRGF0ZVN0cmluZygpIDogbnVsbDtcclxuICAgICAgICBpZiAodGhpcy5taW5EYXRlICYmIHZhbHVlRGF0ZVN0cmluZyAmJiB0aGlzLm1pbkRhdGUudG9EYXRlU3RyaW5nKCkgPT09IHZhbHVlRGF0ZVN0cmluZykge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5taW5EYXRlLmdldEhvdXJzKCkgPiBjb252ZXJ0ZWRIb3VyKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMubWluRGF0ZS5nZXRIb3VycygpID09PSBjb252ZXJ0ZWRIb3VyKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5taW5EYXRlLmdldE1pbnV0ZXMoKSA+IG1pbnV0ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1pbkRhdGUuZ2V0TWludXRlcygpID09PSBtaW51dGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5taW5EYXRlLmdldFNlY29uZHMoKSA+IHNlY29uZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgaWYgKHRoaXMubWF4RGF0ZSAmJiB2YWx1ZURhdGVTdHJpbmcgJiYgdGhpcy5tYXhEYXRlLnRvRGF0ZVN0cmluZygpID09PSB2YWx1ZURhdGVTdHJpbmcpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMubWF4RGF0ZS5nZXRIb3VycygpIDwgY29udmVydGVkSG91cikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm1heERhdGUuZ2V0SG91cnMoKSA9PT0gY29udmVydGVkSG91cikge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubWF4RGF0ZS5nZXRNaW51dGVzKCkgPCBtaW51dGUpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tYXhEYXRlLmdldE1pbnV0ZXMoKSA9PT0gbWludXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgIGlmICh0aGlzLm1heERhdGUuZ2V0U2Vjb25kcygpIDwgc2Vjb25kKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgaW5jcmVtZW50SG91cihldmVudCkge1xyXG4gICAgICAgIGNvbnN0IHByZXZIb3VyID0gdGhpcy5jdXJyZW50SG91cjtcclxuICAgICAgICBsZXQgbmV3SG91ciA9IHRoaXMuY3VycmVudEhvdXIgKyB0aGlzLnN0ZXBIb3VyO1xyXG4gICAgICAgIGxldCBuZXdQTSA9IHRoaXMucG07XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmhvdXJGb3JtYXQgPT0gJzI0JylcclxuICAgICAgICAgICAgbmV3SG91ciA9IChuZXdIb3VyID49IDI0KSA/IChuZXdIb3VyIC0gMjQpIDogbmV3SG91cjtcclxuICAgICAgICBlbHNlIGlmICh0aGlzLmhvdXJGb3JtYXQgPT0gJzEyJykge1xyXG4gICAgICAgICAgICAvLyBCZWZvcmUgdGhlIEFNL1BNIGJyZWFrLCBub3cgYWZ0ZXJcclxuICAgICAgICAgICAgaWYgKHByZXZIb3VyIDwgMTIgJiYgbmV3SG91ciA+IDExKSB7XHJcbiAgICAgICAgICAgICAgICBuZXdQTT0gIXRoaXMucG07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbmV3SG91ciA9IChuZXdIb3VyID49IDEzKSA/IChuZXdIb3VyIC0gMTIpIDogbmV3SG91cjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnZhbGlkYXRlVGltZShuZXdIb3VyLCB0aGlzLmN1cnJlbnRNaW51dGUsIHRoaXMuY3VycmVudFNlY29uZCwgbmV3UE0pKSB7XHJcbiAgICAgICAgICB0aGlzLmN1cnJlbnRIb3VyID0gbmV3SG91cjtcclxuICAgICAgICAgIHRoaXMucG0gPSBuZXdQTTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIH1cclxuXHJcbiAgICBvblRpbWVQaWNrZXJFbGVtZW50TW91c2VEb3duKGV2ZW50OiBFdmVudCwgdHlwZTogbnVtYmVyLCBkaXJlY3Rpb246IG51bWJlcikge1xyXG4gICAgICAgIGlmICghdGhpcy5kaXNhYmxlZCkge1xyXG4gICAgICAgICAgICB0aGlzLnJlcGVhdChldmVudCwgbnVsbCwgdHlwZSwgZGlyZWN0aW9uKTtcclxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgb25UaW1lUGlja2VyRWxlbWVudE1vdXNlVXAoZXZlbnQ6IEV2ZW50KSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmRpc2FibGVkKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY2xlYXJUaW1lUGlja2VyVGltZXIoKTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVUaW1lKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG9uVGltZVBpY2tlckVsZW1lbnRNb3VzZUxlYXZlKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5kaXNhYmxlZCAmJiB0aGlzLnRpbWVQaWNrZXJUaW1lcikge1xyXG4gICAgICAgICAgICB0aGlzLmNsZWFyVGltZVBpY2tlclRpbWVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlVGltZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXBlYXQoZXZlbnQ6IEV2ZW50LCBpbnRlcnZhbDogbnVtYmVyLCB0eXBlOiBudW1iZXIsIGRpcmVjdGlvbjogbnVtYmVyKSB7XHJcbiAgICAgICAgbGV0IGkgPSBpbnRlcnZhbHx8NTAwO1xyXG5cclxuICAgICAgICB0aGlzLmNsZWFyVGltZVBpY2tlclRpbWVyKCk7XHJcbiAgICAgICAgdGhpcy50aW1lUGlja2VyVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5yZXBlYXQoZXZlbnQsIDEwMCwgdHlwZSwgZGlyZWN0aW9uKTtcclxuICAgICAgICAgICAgdGhpcy5jZC5tYXJrRm9yQ2hlY2soKTtcclxuICAgICAgICB9LCBpKTtcclxuXHJcbiAgICAgICAgc3dpdGNoKHR5cGUpIHtcclxuICAgICAgICAgICAgY2FzZSAwOlxyXG4gICAgICAgICAgICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gMSlcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmluY3JlbWVudEhvdXIoZXZlbnQpO1xyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVjcmVtZW50SG91cihldmVudCk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgaWYgKGRpcmVjdGlvbiA9PT0gMSlcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmluY3JlbWVudE1pbnV0ZShldmVudCk7XHJcbiAgICAgICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kZWNyZW1lbnRNaW51dGUoZXZlbnQpO1xyXG4gICAgICAgICAgICBicmVhaztcclxuXHJcbiAgICAgICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgICAgIGlmIChkaXJlY3Rpb24gPT09IDEpXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmNyZW1lbnRTZWNvbmQoZXZlbnQpO1xyXG4gICAgICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGVjcmVtZW50U2Vjb25kKGV2ZW50KTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZUlucHV0ZmllbGQoKTtcclxuICAgIH1cclxuXHJcbiAgICBjbGVhclRpbWVQaWNrZXJUaW1lcigpIHtcclxuICAgICAgICBpZiAodGhpcy50aW1lUGlja2VyVGltZXIpIHtcclxuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMudGltZVBpY2tlclRpbWVyKTtcclxuICAgICAgICAgICAgdGhpcy50aW1lUGlja2VyVGltZXIgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBkZWNyZW1lbnRIb3VyKGV2ZW50KSB7XHJcbiAgICAgICAgbGV0IG5ld0hvdXIgPSB0aGlzLmN1cnJlbnRIb3VyIC0gdGhpcy5zdGVwSG91cjtcclxuICAgICAgICBsZXQgbmV3UE0gPSB0aGlzLnBtXHJcblxyXG4gICAgICAgIGlmICh0aGlzLmhvdXJGb3JtYXQgPT0gJzI0JylcclxuICAgICAgICAgICAgbmV3SG91ciA9IChuZXdIb3VyIDwgMCkgPyAoMjQgKyBuZXdIb3VyKSA6IG5ld0hvdXI7XHJcbiAgICAgICAgZWxzZSBpZiAodGhpcy5ob3VyRm9ybWF0ID09ICcxMicpIHtcclxuICAgICAgICAgICAgLy8gSWYgd2Ugd2VyZSBhdCBub29uL21pZG5pZ2h0LCB0aGVuIHN3aXRjaFxyXG4gICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50SG91ciA9PT0gMTIpIHtcclxuICAgICAgICAgICAgICAgIG5ld1BNID0gIXRoaXMucG07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbmV3SG91ciA9IChuZXdIb3VyIDw9IDApID8gKDEyICsgbmV3SG91cikgOiBuZXdIb3VyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMudmFsaWRhdGVUaW1lKG5ld0hvdXIsIHRoaXMuY3VycmVudE1pbnV0ZSwgdGhpcy5jdXJyZW50U2Vjb25kLCBuZXdQTSkpIHtcclxuICAgICAgICAgIHRoaXMuY3VycmVudEhvdXIgPSBuZXdIb3VyO1xyXG4gICAgICAgICAgdGhpcy5wbSA9IG5ld1BNO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIH1cclxuXHJcbiAgICBpbmNyZW1lbnRNaW51dGUoZXZlbnQpIHtcclxuICAgICAgICBsZXQgbmV3TWludXRlID0gdGhpcy5jdXJyZW50TWludXRlICsgdGhpcy5zdGVwTWludXRlO1xyXG4gICAgICAgIG5ld01pbnV0ZSA9IChuZXdNaW51dGUgPiA1OSkgPyBuZXdNaW51dGUgLSA2MCA6IG5ld01pbnV0ZTtcclxuICAgICAgICBpZiAodGhpcy52YWxpZGF0ZVRpbWUodGhpcy5jdXJyZW50SG91ciwgbmV3TWludXRlLCB0aGlzLmN1cnJlbnRTZWNvbmQsIHRoaXMucG0pKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudE1pbnV0ZSA9IG5ld01pbnV0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgZGVjcmVtZW50TWludXRlKGV2ZW50KSB7XHJcbiAgICAgICAgbGV0IG5ld01pbnV0ZSA9IHRoaXMuY3VycmVudE1pbnV0ZSAtIHRoaXMuc3RlcE1pbnV0ZTtcclxuICAgICAgICBuZXdNaW51dGUgPSAobmV3TWludXRlIDwgMCkgPyA2MCArIG5ld01pbnV0ZSA6IG5ld01pbnV0ZTtcclxuICAgICAgICBpZiAodGhpcy52YWxpZGF0ZVRpbWUodGhpcy5jdXJyZW50SG91ciwgbmV3TWludXRlLCB0aGlzLmN1cnJlbnRTZWNvbmQsIHRoaXMucG0pKSB7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudE1pbnV0ZSA9IG5ld01pbnV0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgaW5jcmVtZW50U2Vjb25kKGV2ZW50KSB7XHJcbiAgICAgICAgbGV0IG5ld1NlY29uZCA9IHRoaXMuY3VycmVudFNlY29uZCArIHRoaXMuc3RlcFNlY29uZDtcclxuICAgICAgICBuZXdTZWNvbmQgPSAobmV3U2Vjb25kID4gNTkpID8gbmV3U2Vjb25kIC0gNjAgOiBuZXdTZWNvbmQ7XHJcbiAgICAgICAgaWYgKHRoaXMudmFsaWRhdGVUaW1lKHRoaXMuY3VycmVudEhvdXIsIHRoaXMuY3VycmVudE1pbnV0ZSwgbmV3U2Vjb25kLCB0aGlzLnBtKSkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTZWNvbmQgPSBuZXdTZWNvbmQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgfVxyXG5cclxuICAgIGRlY3JlbWVudFNlY29uZChldmVudCkge1xyXG4gICAgICAgIGxldCBuZXdTZWNvbmQgPSB0aGlzLmN1cnJlbnRTZWNvbmQgLSB0aGlzLnN0ZXBTZWNvbmQ7XHJcbiAgICAgICAgbmV3U2Vjb25kID0gKG5ld1NlY29uZCA8IDApID8gNjAgKyBuZXdTZWNvbmQgOiBuZXdTZWNvbmQ7XHJcbiAgICAgICAgaWYgKHRoaXMudmFsaWRhdGVUaW1lKHRoaXMuY3VycmVudEhvdXIsIHRoaXMuY3VycmVudE1pbnV0ZSwgbmV3U2Vjb25kLCB0aGlzLnBtKSkge1xyXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTZWNvbmQgPSBuZXdTZWNvbmQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZVRpbWUoKSB7XHJcbiAgICAgICAgbGV0IHZhbHVlID0gdGhpcy52YWx1ZTtcclxuICAgICAgICBpZiAodGhpcy5pc1JhbmdlU2VsZWN0aW9uKCkpIHtcclxuICAgICAgICAgICAgdmFsdWUgPSB0aGlzLnZhbHVlWzFdIHx8IHRoaXMudmFsdWVbMF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLmlzTXVsdGlwbGVTZWxlY3Rpb24oKSkge1xyXG4gICAgICAgICAgICB2YWx1ZSA9IHRoaXMudmFsdWVbdGhpcy52YWx1ZS5sZW5ndGggLSAxXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFsdWUgPSB2YWx1ZSA/IG5ldyBEYXRlKHZhbHVlLmdldFRpbWUoKSkgOiBuZXcgRGF0ZSgpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5ob3VyRm9ybWF0ID09ICcxMicpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudEhvdXIgPT09IDEyKVxyXG4gICAgICAgICAgICAgICAgdmFsdWUuc2V0SG91cnModGhpcy5wbSA/IDEyIDogMCk7XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHZhbHVlLnNldEhvdXJzKHRoaXMucG0gPyB0aGlzLmN1cnJlbnRIb3VyICsgMTIgOiB0aGlzLmN1cnJlbnRIb3VyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHZhbHVlLnNldEhvdXJzKHRoaXMuY3VycmVudEhvdXIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFsdWUuc2V0TWludXRlcyh0aGlzLmN1cnJlbnRNaW51dGUpO1xyXG4gICAgICAgIHZhbHVlLnNldFNlY29uZHModGhpcy5jdXJyZW50U2Vjb25kKTtcclxuICAgICAgICBpZiAodGhpcy5pc1JhbmdlU2VsZWN0aW9uKCkpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMudmFsdWVbMV0pXHJcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IFt0aGlzLnZhbHVlWzBdLCB2YWx1ZV07XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gW3ZhbHVlLCBudWxsXTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmlzTXVsdGlwbGVTZWxlY3Rpb24oKSl7XHJcbiAgICAgICAgICAgIHZhbHVlID0gWy4uLnRoaXMudmFsdWUuc2xpY2UoMCwgLTEpLCB2YWx1ZV07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnVwZGF0ZU1vZGVsKHZhbHVlKTtcclxuICAgICAgICB0aGlzLm9uU2VsZWN0LmVtaXQodmFsdWUpO1xyXG4gICAgICAgIHRoaXMudXBkYXRlSW5wdXRmaWVsZCgpO1xyXG4gICAgfVxyXG5cclxuICAgIHRvZ2dsZUFNUE0oZXZlbnQpIHtcclxuICAgICAgICBjb25zdCBuZXdQTSA9ICF0aGlzLnBtO1xyXG4gICAgICAgIGlmICh0aGlzLnZhbGlkYXRlVGltZSh0aGlzLmN1cnJlbnRIb3VyLCB0aGlzLmN1cnJlbnRNaW51dGUsIHRoaXMuY3VycmVudFNlY29uZCwgbmV3UE0pKSB7XHJcbiAgICAgICAgICB0aGlzLnBtID0gbmV3UE07XHJcbiAgICAgICAgICB0aGlzLnVwZGF0ZVRpbWUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIH1cclxuXHJcbiAgICBvblVzZXJJbnB1dChldmVudCkge1xyXG4gICAgICAgIC8vIElFIDExIFdvcmthcm91bmQgZm9yIGlucHV0IHBsYWNlaG9sZGVyIDogaHR0cHM6Ly9naXRodWIuY29tL3ByaW1lZmFjZXMvcHJpbWVuZy9pc3N1ZXMvMjAyNlxyXG4gICAgICAgIGlmICghdGhpcy5pc0tleWRvd24pIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmlzS2V5ZG93biA9IGZhbHNlO1xyXG5cclxuICAgICAgICBsZXQgdmFsID0gZXZlbnQudGFyZ2V0LnZhbHVlO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGxldCB2YWx1ZSA9IHRoaXMucGFyc2VWYWx1ZUZyb21TdHJpbmcodmFsKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuaXNWYWxpZFNlbGVjdGlvbih2YWx1ZSkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlTW9kZWwodmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVVSSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhdGNoKGVycikge1xyXG4gICAgICAgICAgICAvL2ludmFsaWQgZGF0ZVxyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZU1vZGVsKG51bGwpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5maWxsZWQgPSB2YWwgIT0gbnVsbCAmJiB2YWwubGVuZ3RoO1xyXG4gICAgICAgIHRoaXMub25JbnB1dC5lbWl0KGV2ZW50KTtcclxuICAgIH1cclxuXHJcbiAgICBpc1ZhbGlkU2VsZWN0aW9uKHZhbHVlKTogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IGlzVmFsaWQgPSB0cnVlO1xyXG4gICAgICAgIGlmICh0aGlzLmlzU2luZ2xlU2VsZWN0aW9uKCkpIHtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLmlzU2VsZWN0YWJsZSh2YWx1ZS5nZXREYXRlKCksIHZhbHVlLmdldE1vbnRoKCksIHZhbHVlLmdldEZ1bGxZZWFyKCksIGZhbHNlKSkge1xyXG4gICAgICAgICAgICAgICAgaXNWYWxpZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmICh2YWx1ZS5ldmVyeSh2ID0+IHRoaXMuaXNTZWxlY3RhYmxlKHYuZ2V0RGF0ZSgpLCB2LmdldE1vbnRoKCksIHYuZ2V0RnVsbFllYXIoKSwgZmFsc2UpKSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5pc1JhbmdlU2VsZWN0aW9uKCkpIHtcclxuICAgICAgICAgICAgICAgIGlzVmFsaWQgPSB2YWx1ZS5sZW5ndGggPiAxICYmIHZhbHVlWzFdID4gdmFsdWVbMF0gPyB0cnVlIDogZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGlzVmFsaWQ7XHJcbiAgICB9XHJcblxyXG4gICAgcGFyc2VWYWx1ZUZyb21TdHJpbmcodGV4dDogc3RyaW5nKTogRGF0ZSB8IERhdGVbXXtcclxuICAgICAgICBpZiAoIXRleHQgfHwgdGV4dC50cmltKCkubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IHZhbHVlOiBhbnk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmlzU2luZ2xlU2VsZWN0aW9uKCkpIHtcclxuICAgICAgICAgICAgdmFsdWUgPSB0aGlzLnBhcnNlRGF0ZVRpbWUodGV4dCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMuaXNNdWx0aXBsZVNlbGVjdGlvbigpKSB7XHJcbiAgICAgICAgICAgIGxldCB0b2tlbnMgPSB0ZXh0LnNwbGl0KHRoaXMubXVsdGlwbGVTZXBhcmF0b3IpO1xyXG4gICAgICAgICAgICB2YWx1ZSA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKGxldCB0b2tlbiBvZiB0b2tlbnMpIHtcclxuICAgICAgICAgICAgICAgIHZhbHVlLnB1c2godGhpcy5wYXJzZURhdGVUaW1lKHRva2VuLnRyaW0oKSkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKHRoaXMuaXNSYW5nZVNlbGVjdGlvbigpKSB7XHJcbiAgICAgICAgICAgIGxldCB0b2tlbnMgPSB0ZXh0LnNwbGl0KCcgJyt0aGlzLnJhbmdlU2VwYXJhdG9yICsnICcpO1xyXG4gICAgICAgICAgICB2YWx1ZSA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRva2Vucy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgdmFsdWVbaV0gPSB0aGlzLnBhcnNlRGF0ZVRpbWUodG9rZW5zW2ldLnRyaW0oKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICBwYXJzZURhdGVUaW1lKHRleHQpOiBEYXRlIHtcclxuICAgICAgICBsZXQgZGF0ZTogRGF0ZTtcclxuICAgICAgICBsZXQgcGFydHM6IHN0cmluZ1tdID0gdGV4dC5zcGxpdCgnICcpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy50aW1lT25seSkge1xyXG4gICAgICAgICAgICBkYXRlID0gbmV3IERhdGUoKTtcclxuICAgICAgICAgICAgdGhpcy5wb3B1bGF0ZVRpbWUoZGF0ZSwgcGFydHNbMF0sIHBhcnRzWzFdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRhdGVGb3JtYXQgPSB0aGlzLmdldERhdGVGb3JtYXQoKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuc2hvd1RpbWUpIHtcclxuICAgICAgICAgICAgICAgIGxldCBhbXBtID0gdGhpcy5ob3VyRm9ybWF0ID09ICcxMicgPyBwYXJ0cy5wb3AoKSA6IG51bGw7XHJcbiAgICAgICAgICAgICAgICBsZXQgdGltZVN0cmluZyA9IHBhcnRzLnBvcCgpO1xyXG5cclxuICAgICAgICAgICAgICAgIGRhdGUgPSB0aGlzLnBhcnNlRGF0ZShwYXJ0cy5qb2luKCcgJyksIGRhdGVGb3JtYXQpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wb3B1bGF0ZVRpbWUoZGF0ZSwgdGltZVN0cmluZywgYW1wbSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgZGF0ZSA9IHRoaXMucGFyc2VEYXRlKHRleHQsIGRhdGVGb3JtYXQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gZGF0ZTtcclxuICAgIH1cclxuXHJcbiAgICBwb3B1bGF0ZVRpbWUodmFsdWUsIHRpbWVTdHJpbmcsIGFtcG0pIHtcclxuICAgICAgICBpZiAodGhpcy5ob3VyRm9ybWF0ID09ICcxMicgJiYgIWFtcG0pIHtcclxuICAgICAgICAgICAgdGhyb3cgJ0ludmFsaWQgVGltZSc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnBtID0gKGFtcG0gPT09ICdQTScgfHwgYW1wbSA9PT0gJ3BtJyk7XHJcbiAgICAgICAgbGV0IHRpbWUgPSB0aGlzLnBhcnNlVGltZSh0aW1lU3RyaW5nKTtcclxuICAgICAgICB2YWx1ZS5zZXRIb3Vycyh0aW1lLmhvdXIpO1xyXG4gICAgICAgIHZhbHVlLnNldE1pbnV0ZXModGltZS5taW51dGUpO1xyXG4gICAgICAgIHZhbHVlLnNldFNlY29uZHModGltZS5zZWNvbmQpO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZVVJKCkge1xyXG4gICAgICAgIGxldCB2YWwgPSB0aGlzLnZhbHVlfHx0aGlzLmRlZmF1bHREYXRlfHxuZXcgRGF0ZSgpO1xyXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbCkpe1xyXG4gICAgICAgICAgICB2YWwgPSB2YWxbMF07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmN1cnJlbnRNb250aCA9IHZhbC5nZXRNb250aCgpO1xyXG4gICAgICAgIHRoaXMuY3VycmVudFllYXIgPSB2YWwuZ2V0RnVsbFllYXIoKTtcclxuICAgICAgICB0aGlzLmNyZWF0ZU1vbnRocyh0aGlzLmN1cnJlbnRNb250aCwgdGhpcy5jdXJyZW50WWVhcik7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnNob3dUaW1lfHx0aGlzLnRpbWVPbmx5KSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0Q3VycmVudEhvdXJQTSh2YWwuZ2V0SG91cnMoKSk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudE1pbnV0ZSA9IHZhbC5nZXRNaW51dGVzKCk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFNlY29uZCA9IHZhbC5nZXRTZWNvbmRzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNob3dPdmVybGF5KCkge1xyXG4gICAgICAgIGlmICghdGhpcy5vdmVybGF5VmlzaWJsZSkge1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVVJKCk7XHJcbiAgICAgICAgICAgIHRoaXMub3ZlcmxheVZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBoaWRlT3ZlcmxheSgpIHtcclxuICAgICAgICB0aGlzLm92ZXJsYXlWaXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5jbGVhclRpbWVQaWNrZXJUaW1lcigpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy50b3VjaFVJKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzYWJsZU1vZGFsaXR5KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmNkLm1hcmtGb3JDaGVjaygpO1xyXG4gICAgfVxyXG5cclxuICAgIHRvZ2dsZSgpIHtcclxuICAgICAgICBpZiAoIXRoaXMuaW5saW5lKXtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLm92ZXJsYXlWaXNpYmxlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNob3dPdmVybGF5KCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmlucHV0ZmllbGRWaWV3Q2hpbGQubmF0aXZlRWxlbWVudC5mb2N1cygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5oaWRlT3ZlcmxheSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG9uT3ZlcmxheUFuaW1hdGlvblN0YXJ0KGV2ZW50OiBBbmltYXRpb25FdmVudCkge1xyXG4gICAgICAgIHN3aXRjaCAoZXZlbnQudG9TdGF0ZSkge1xyXG4gICAgICAgICAgICBjYXNlICd2aXNpYmxlJzpcclxuICAgICAgICAgICAgY2FzZSAndmlzaWJsZVRvdWNoVUknOlxyXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmlubGluZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3ZlcmxheSA9IGV2ZW50LmVsZW1lbnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hcHBlbmRPdmVybGF5KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuYXV0b1pJbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm92ZXJsYXkuc3R5bGUuekluZGV4ID0gU3RyaW5nKHRoaXMuYmFzZVpJbmRleCArICgrK0RvbUhhbmRsZXIuemluZGV4KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWxpZ25PdmVybGF5KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vblNob3cuZW1pdChldmVudCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgY2FzZSAndm9pZCc6XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9uT3ZlcmxheUhpZGUoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMub25DbG9zZS5lbWl0KGV2ZW50KTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG9uT3ZlcmxheUFuaW1hdGlvbkRvbmUoZXZlbnQ6IEFuaW1hdGlvbkV2ZW50KSB7XHJcbiAgICAgICAgc3dpdGNoIChldmVudC50b1N0YXRlKSB7XHJcbiAgICAgICAgICAgIGNhc2UgJ3Zpc2libGUnOlxyXG4gICAgICAgICAgICBjYXNlICd2aXNpYmxlVG91Y2hVSSc6XHJcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuaW5saW5lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5iaW5kRG9jdW1lbnRDbGlja0xpc3RlbmVyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5iaW5kRG9jdW1lbnRSZXNpemVMaXN0ZW5lcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYmluZFNjcm9sbExpc3RlbmVyKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBhcHBlbmRPdmVybGF5KCkge1xyXG4gICAgICAgIGlmICh0aGlzLmFwcGVuZFRvKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmFwcGVuZFRvID09PSAnYm9keScpXHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMub3ZlcmxheSk7XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIERvbUhhbmRsZXIuYXBwZW5kQ2hpbGQodGhpcy5vdmVybGF5LCB0aGlzLmFwcGVuZFRvKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmVzdG9yZU92ZXJsYXlBcHBlbmQoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMub3ZlcmxheSAmJiB0aGlzLmFwcGVuZFRvKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWwubmF0aXZlRWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLm92ZXJsYXkpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBhbGlnbk92ZXJsYXkoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMudG91Y2hVSSkge1xyXG4gICAgICAgICAgICB0aGlzLmVuYWJsZU1vZGFsaXR5KHRoaXMub3ZlcmxheSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5hcHBlbmRUbylcclxuICAgICAgICAgICAgICAgIERvbUhhbmRsZXIuYWJzb2x1dGVQb3NpdGlvbih0aGlzLm92ZXJsYXksIHRoaXMuaW5wdXRmaWVsZFZpZXdDaGlsZC5uYXRpdmVFbGVtZW50KTtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgRG9tSGFuZGxlci5yZWxhdGl2ZVBvc2l0aW9uKHRoaXMub3ZlcmxheSwgdGhpcy5pbnB1dGZpZWxkVmlld0NoaWxkLm5hdGl2ZUVsZW1lbnQpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBlbmFibGVNb2RhbGl0eShlbGVtZW50KSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLm1hc2spIHtcclxuICAgICAgICAgICAgdGhpcy5tYXNrID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcbiAgICAgICAgICAgIHRoaXMubWFzay5zdHlsZS56SW5kZXggPSBTdHJpbmcocGFyc2VJbnQoZWxlbWVudC5zdHlsZS56SW5kZXgpIC0gMSk7XHJcbiAgICAgICAgICAgIGxldCBtYXNrU3R5bGVDbGFzcyA9ICdwLWNvbXBvbmVudC1vdmVybGF5IHAtZGF0ZXBpY2tlci1tYXNrIHAtZGF0ZXBpY2tlci1tYXNrLXNjcm9sbGJsb2NrZXInO1xyXG4gICAgICAgICAgICBEb21IYW5kbGVyLmFkZE11bHRpcGxlQ2xhc3Nlcyh0aGlzLm1hc2ssIG1hc2tTdHlsZUNsYXNzKTtcclxuXHJcblx0XHRcdHRoaXMubWFza0NsaWNrTGlzdGVuZXIgPSB0aGlzLnJlbmRlcmVyLmxpc3Rlbih0aGlzLm1hc2ssICdjbGljaycsIChldmVudDogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRpc2FibGVNb2RhbGl0eSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLm1hc2spO1xyXG4gICAgICAgICAgICBEb21IYW5kbGVyLmFkZENsYXNzKGRvY3VtZW50LmJvZHksICdwLW92ZXJmbG93LWhpZGRlbicpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBkaXNhYmxlTW9kYWxpdHkoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMubWFzaykge1xyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKHRoaXMubWFzayk7XHJcbiAgICAgICAgICAgIGxldCBib2R5Q2hpbGRyZW4gPSBkb2N1bWVudC5ib2R5LmNoaWxkcmVuO1xyXG4gICAgICAgICAgICBsZXQgaGFzQmxvY2tlck1hc2tzOiBib29sZWFuO1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJvZHlDaGlsZHJlbi5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgbGV0IGJvZHlDaGlsZCA9IGJvZHlDaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgICAgIGlmIChEb21IYW5kbGVyLmhhc0NsYXNzKGJvZHlDaGlsZCwgJ3AtZGF0ZXBpY2tlci1tYXNrLXNjcm9sbGJsb2NrZXInKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGhhc0Jsb2NrZXJNYXNrcyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICghaGFzQmxvY2tlck1hc2tzKSB7XHJcbiAgICAgICAgICAgICAgICBEb21IYW5kbGVyLnJlbW92ZUNsYXNzKGRvY3VtZW50LmJvZHksICdwLW92ZXJmbG93LWhpZGRlbicpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLnVuYmluZE1hc2tDbGlja0xpc3RlbmVyKCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLm1hc2sgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1bmJpbmRNYXNrQ2xpY2tMaXN0ZW5lcigpIHtcclxuICAgICAgICBpZiAodGhpcy5tYXNrQ2xpY2tMaXN0ZW5lcikge1xyXG4gICAgICAgICAgICB0aGlzLm1hc2tDbGlja0xpc3RlbmVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMubWFza0NsaWNrTGlzdGVuZXIgPSBudWxsO1xyXG5cdFx0fVxyXG4gICAgfVxyXG5cclxuICAgIHdyaXRlVmFsdWUodmFsdWU6IGFueSkgOiB2b2lkIHtcclxuICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XHJcbiAgICAgICAgaWYgKHRoaXMudmFsdWUgJiYgdHlwZW9mIHRoaXMudmFsdWUgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSB0aGlzLnBhcnNlVmFsdWVGcm9tU3RyaW5nKHRoaXMudmFsdWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy51cGRhdGVJbnB1dGZpZWxkKCk7XHJcbiAgICAgICAgdGhpcy51cGRhdGVVSSgpO1xyXG4gICAgICAgIHRoaXMuY2QubWFya0ZvckNoZWNrKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmVnaXN0ZXJPbkNoYW5nZShmbjogRnVuY3Rpb24pOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm9uTW9kZWxDaGFuZ2UgPSBmbjtcclxuICAgIH1cclxuXHJcbiAgICByZWdpc3Rlck9uVG91Y2hlZChmbjogRnVuY3Rpb24pOiB2b2lkIHtcclxuICAgICAgICB0aGlzLm9uTW9kZWxUb3VjaGVkID0gZm47XHJcbiAgICB9XHJcblxyXG4gICAgc2V0RGlzYWJsZWRTdGF0ZSh2YWw6IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgICAgICB0aGlzLmRpc2FibGVkID0gdmFsO1xyXG4gICAgICAgIHRoaXMuY2QubWFya0ZvckNoZWNrKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZ2V0RGF0ZUZvcm1hdCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5kYXRlRm9ybWF0O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFBvcnRlZCBmcm9tIGpxdWVyeS11aSBkYXRlcGlja2VyIGZvcm1hdERhdGVcclxuICAgIGZvcm1hdERhdGUoZGF0ZSwgZm9ybWF0KSB7XHJcbiAgICAgICAgaWYgKCFkYXRlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAnJztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBpRm9ybWF0O1xyXG4gICAgICAgIGNvbnN0IGxvb2tBaGVhZCA9IChtYXRjaCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBtYXRjaGVzID0gKGlGb3JtYXQgKyAxIDwgZm9ybWF0Lmxlbmd0aCAmJiBmb3JtYXQuY2hhckF0KGlGb3JtYXQgKyAxKSA9PT0gbWF0Y2gpO1xyXG4gICAgICAgICAgICBpZiAobWF0Y2hlcykge1xyXG4gICAgICAgICAgICAgICAgaUZvcm1hdCsrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBtYXRjaGVzO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgICAgIGZvcm1hdE51bWJlciA9IChtYXRjaCwgdmFsdWUsIGxlbikgPT4ge1xyXG4gICAgICAgICAgICAgICAgbGV0IG51bSA9ICcnICsgdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBpZiAobG9va0FoZWFkKG1hdGNoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChudW0ubGVuZ3RoIDwgbGVuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG51bSA9ICcwJyArIG51bTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVtO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBmb3JtYXROYW1lID0gKG1hdGNoLCB2YWx1ZSwgc2hvcnROYW1lcywgbG9uZ05hbWVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKGxvb2tBaGVhZChtYXRjaCkgPyBsb25nTmFtZXNbdmFsdWVdIDogc2hvcnROYW1lc1t2YWx1ZV0pO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIGxldCBvdXRwdXQgPSAnJztcclxuICAgICAgICBsZXQgbGl0ZXJhbCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBpZiAoZGF0ZSkge1xyXG4gICAgICAgICAgICBmb3IgKGlGb3JtYXQgPSAwOyBpRm9ybWF0IDwgZm9ybWF0Lmxlbmd0aDsgaUZvcm1hdCsrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobGl0ZXJhbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChmb3JtYXQuY2hhckF0KGlGb3JtYXQpID09PSAnXFwnJyAmJiAhbG9va0FoZWFkKCdcXCcnKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsaXRlcmFsID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0ICs9IGZvcm1hdC5jaGFyQXQoaUZvcm1hdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKGZvcm1hdC5jaGFyQXQoaUZvcm1hdCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnZCc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXQgKz0gZm9ybWF0TnVtYmVyKCdkJywgZGF0ZS5nZXREYXRlKCksIDIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ0QnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0ICs9IGZvcm1hdE5hbWUoJ0QnLCBkYXRlLmdldERheSgpLCB0aGlzLmdldFRyYW5zbGF0aW9uKFRyYW5zbGF0aW9uS2V5cy5EQVlfTkFNRVNfU0hPUlQpLCB0aGlzLmdldFRyYW5zbGF0aW9uKFRyYW5zbGF0aW9uS2V5cy5EQVlfTkFNRVMpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdvJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dCArPSBmb3JtYXROdW1iZXIoJ28nLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTWF0aC5yb3VuZCgoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpLCBkYXRlLmdldE1vbnRoKCksIGRhdGUuZ2V0RGF0ZSgpKS5nZXRUaW1lKCkgLVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgMCwgMCkuZ2V0VGltZSgpKSAvIDg2NDAwMDAwKSwgMyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnbSc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXQgKz0gZm9ybWF0TnVtYmVyKCdtJywgZGF0ZS5nZXRNb250aCgpICsgMSwgMik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAnTSc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXQgKz0gZm9ybWF0TmFtZSgnTScsZGF0ZS5nZXRNb250aCgpLCB0aGlzLmdldFRyYW5zbGF0aW9uKFRyYW5zbGF0aW9uS2V5cy5NT05USF9OQU1FU19TSE9SVCksIHRoaXMuZ2V0VHJhbnNsYXRpb24oVHJhbnNsYXRpb25LZXlzLk1PTlRIX05BTUVTKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FzZSAneSc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXQgKz0gbG9va0FoZWFkKCd5JykgPyBkYXRlLmdldEZ1bGxZZWFyKCkgOiAoZGF0ZS5nZXRGdWxsWWVhcigpICUgMTAwIDwgMTAgPyAnMCcgOiAnJykgKyAoZGF0ZS5nZXRGdWxsWWVhcigpICUgMTAwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdAJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dCArPSBkYXRlLmdldFRpbWUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICchJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dCArPSBkYXRlLmdldFRpbWUoKSAqIDEwMDAwICsgdGhpcy50aWNrc1RvMTk3MDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdcXCcnOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxvb2tBaGVhZCgnXFwnJykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXQgKz0gJ1xcJyc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpdGVyYWwgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXQgKz0gZm9ybWF0LmNoYXJBdChpRm9ybWF0KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG91dHB1dDtcclxuICAgIH1cclxuXHJcbiAgICBmb3JtYXRUaW1lKGRhdGUpIHtcclxuICAgICAgICBpZiAoIWRhdGUpIHtcclxuICAgICAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IG91dHB1dCA9ICcnO1xyXG4gICAgICAgIGxldCBob3VycyA9IGRhdGUuZ2V0SG91cnMoKTtcclxuICAgICAgICBsZXQgbWludXRlcyA9IGRhdGUuZ2V0TWludXRlcygpO1xyXG4gICAgICAgIGxldCBzZWNvbmRzID0gZGF0ZS5nZXRTZWNvbmRzKCk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmhvdXJGb3JtYXQgPT0gJzEyJyAmJiBob3VycyA+IDExICYmIGhvdXJzICE9IDEyKSB7XHJcbiAgICAgICAgICAgIGhvdXJzLT0xMjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLmhvdXJGb3JtYXQgPT0gJzEyJykge1xyXG4gICAgICAgICAgICBvdXRwdXQgKz0gaG91cnMgPT09IDAgPyAxMiA6IChob3VycyA8IDEwKSA/ICcwJyArIGhvdXJzIDogaG91cnM7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgb3V0cHV0ICs9IChob3VycyA8IDEwKSA/ICcwJyArIGhvdXJzIDogaG91cnM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG91dHB1dCArPSAnOic7XHJcbiAgICAgICAgb3V0cHV0ICs9IChtaW51dGVzIDwgMTApID8gJzAnICsgbWludXRlcyA6IG1pbnV0ZXM7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLnNob3dTZWNvbmRzKSB7XHJcbiAgICAgICAgICAgIG91dHB1dCArPSAnOic7XHJcbiAgICAgICAgICAgIG91dHB1dCArPSAoc2Vjb25kcyA8IDEwKSA/ICcwJyArIHNlY29uZHMgOiBzZWNvbmRzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuaG91ckZvcm1hdCA9PSAnMTInKSB7XHJcbiAgICAgICAgICAgIG91dHB1dCArPSBkYXRlLmdldEhvdXJzKCkgPiAxMSA/ICcgUE0nIDogJyBBTSc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gb3V0cHV0O1xyXG4gICAgfVxyXG5cclxuICAgIHBhcnNlVGltZSh2YWx1ZSkge1xyXG4gICAgICAgIGxldCB0b2tlbnM6IHN0cmluZ1tdID0gdmFsdWUuc3BsaXQoJzonKTtcclxuICAgICAgICBsZXQgdmFsaWRUb2tlbkxlbmd0aCA9IHRoaXMuc2hvd1NlY29uZHMgPyAzIDogMjtcclxuXHJcbiAgICAgICAgaWYgKHRva2Vucy5sZW5ndGggIT09IHZhbGlkVG9rZW5MZW5ndGgpIHtcclxuICAgICAgICAgICAgdGhyb3cgXCJJbnZhbGlkIHRpbWVcIjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBoID0gcGFyc2VJbnQodG9rZW5zWzBdKTtcclxuICAgICAgICBsZXQgbSA9IHBhcnNlSW50KHRva2Vuc1sxXSk7XHJcbiAgICAgICAgbGV0IHMgPSB0aGlzLnNob3dTZWNvbmRzID8gcGFyc2VJbnQodG9rZW5zWzJdKSA6IG51bGw7XHJcblxyXG4gICAgICAgIGlmIChpc05hTihoKSB8fCBpc05hTihtKSB8fCBoID4gMjMgfHwgbSA+IDU5IHx8ICh0aGlzLmhvdXJGb3JtYXQgPT0gJzEyJyAmJiBoID4gMTIpIHx8ICh0aGlzLnNob3dTZWNvbmRzICYmIChpc05hTihzKSB8fCBzID4gNTkpKSkge1xyXG4gICAgICAgICAgICB0aHJvdyBcIkludmFsaWQgdGltZVwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuaG91ckZvcm1hdCA9PSAnMTInKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaCAhPT0gMTIgJiYgdGhpcy5wbSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGggKz0gMTI7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmICghdGhpcy5wbSAmJiBoID09PSAxMikge1xyXG4gICAgICAgICAgICAgICAgICAgIGggLT0gMTI7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiB7aG91cjogaCwgbWludXRlOiBtLCBzZWNvbmQ6IHN9O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBQb3J0ZWQgZnJvbSBqcXVlcnktdWkgZGF0ZXBpY2tlciBwYXJzZURhdGVcclxuICAgIHBhcnNlRGF0ZSh2YWx1ZSwgZm9ybWF0KSB7XHJcbiAgICAgICAgaWYgKGZvcm1hdCA9PSBudWxsIHx8IHZhbHVlID09IG51bGwpIHtcclxuICAgICAgICAgICAgdGhyb3cgXCJJbnZhbGlkIGFyZ3VtZW50c1wiO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFsdWUgPSAodHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiID8gdmFsdWUudG9TdHJpbmcoKSA6IHZhbHVlICsgXCJcIik7XHJcbiAgICAgICAgaWYgKHZhbHVlID09PSBcIlwiKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGV0IGlGb3JtYXQsIGRpbSwgZXh0cmEsXHJcbiAgICAgICAgaVZhbHVlID0gMCxcclxuICAgICAgICBzaG9ydFllYXJDdXRvZmYgPSAodHlwZW9mIHRoaXMuc2hvcnRZZWFyQ3V0b2ZmICE9PSBcInN0cmluZ1wiID8gdGhpcy5zaG9ydFllYXJDdXRvZmYgOiBuZXcgRGF0ZSgpLmdldEZ1bGxZZWFyKCkgJSAxMDAgKyBwYXJzZUludCh0aGlzLnNob3J0WWVhckN1dG9mZiwgMTApKSxcclxuICAgICAgICB5ZWFyID0gLTEsXHJcbiAgICAgICAgbW9udGggPSAtMSxcclxuICAgICAgICBkYXkgPSAtMSxcclxuICAgICAgICBkb3kgPSAtMSxcclxuICAgICAgICBsaXRlcmFsID0gZmFsc2UsXHJcbiAgICAgICAgZGF0ZSxcclxuICAgICAgICBsb29rQWhlYWQgPSAobWF0Y2gpID0+IHtcclxuICAgICAgICAgICAgbGV0IG1hdGNoZXMgPSAoaUZvcm1hdCArIDEgPCBmb3JtYXQubGVuZ3RoICYmIGZvcm1hdC5jaGFyQXQoaUZvcm1hdCArIDEpID09PSBtYXRjaCk7XHJcbiAgICAgICAgICAgIGlmIChtYXRjaGVzKSB7XHJcbiAgICAgICAgICAgICAgICBpRm9ybWF0Kys7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG1hdGNoZXM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXROdW1iZXIgPSAobWF0Y2gpID0+IHtcclxuICAgICAgICAgICAgbGV0IGlzRG91YmxlZCA9IGxvb2tBaGVhZChtYXRjaCksXHJcbiAgICAgICAgICAgICAgICBzaXplID0gKG1hdGNoID09PSBcIkBcIiA/IDE0IDogKG1hdGNoID09PSBcIiFcIiA/IDIwIDpcclxuICAgICAgICAgICAgICAgIChtYXRjaCA9PT0gXCJ5XCIgJiYgaXNEb3VibGVkID8gNCA6IChtYXRjaCA9PT0gXCJvXCIgPyAzIDogMikpKSksXHJcbiAgICAgICAgICAgICAgICBtaW5TaXplID0gKG1hdGNoID09PSBcInlcIiA/IHNpemUgOiAxKSxcclxuICAgICAgICAgICAgICAgIGRpZ2l0cyA9IG5ldyBSZWdFeHAoXCJeXFxcXGR7XCIgKyBtaW5TaXplICsgXCIsXCIgKyBzaXplICsgXCJ9XCIpLFxyXG4gICAgICAgICAgICAgICAgbnVtID0gdmFsdWUuc3Vic3RyaW5nKGlWYWx1ZSkubWF0Y2goZGlnaXRzKTtcclxuICAgICAgICAgICAgaWYgKCFudW0pIHtcclxuICAgICAgICAgICAgICAgIHRocm93IFwiTWlzc2luZyBudW1iZXIgYXQgcG9zaXRpb24gXCIgKyBpVmFsdWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaVZhbHVlICs9IG51bVsgMCBdLmxlbmd0aDtcclxuICAgICAgICAgICAgcmV0dXJuIHBhcnNlSW50KG51bVsgMCBdLCAxMCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXROYW1lID0gKG1hdGNoLCBzaG9ydE5hbWVzLCBsb25nTmFtZXMpID0+IHtcclxuICAgICAgICAgICAgbGV0IGluZGV4ID0gLTE7XHJcbiAgICAgICAgICAgIGxldCBhcnIgPSBsb29rQWhlYWQobWF0Y2gpID8gbG9uZ05hbWVzIDogc2hvcnROYW1lcztcclxuICAgICAgICAgICAgbGV0IG5hbWVzID0gW107XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgbmFtZXMucHVzaChbaSxhcnJbaV1dKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBuYW1lcy5zb3J0KChhLGIpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAtKGFbIDEgXS5sZW5ndGggLSBiWyAxIF0ubGVuZ3RoKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5hbWVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbmFtZSA9IG5hbWVzW2ldWzFdO1xyXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlLnN1YnN0cihpVmFsdWUsIG5hbWUubGVuZ3RoKS50b0xvd2VyQ2FzZSgpID09PSBuYW1lLnRvTG93ZXJDYXNlKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBpbmRleCA9IG5hbWVzW2ldWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgIGlWYWx1ZSArPSBuYW1lLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGluZGV4ICsgMTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRocm93IFwiVW5rbm93biBuYW1lIGF0IHBvc2l0aW9uIFwiICsgaVZhbHVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBjaGVja0xpdGVyYWwgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZS5jaGFyQXQoaVZhbHVlKSAhPT0gZm9ybWF0LmNoYXJBdChpRm9ybWF0KSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgXCJVbmV4cGVjdGVkIGxpdGVyYWwgYXQgcG9zaXRpb24gXCIgKyBpVmFsdWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaVZhbHVlKys7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMudmlldyA9PT0gJ21vbnRoJykge1xyXG4gICAgICAgICAgICBkYXkgPSAxO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZm9yIChpRm9ybWF0ID0gMDsgaUZvcm1hdCA8IGZvcm1hdC5sZW5ndGg7IGlGb3JtYXQrKykge1xyXG4gICAgICAgICAgICBpZiAobGl0ZXJhbCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGZvcm1hdC5jaGFyQXQoaUZvcm1hdCkgPT09IFwiJ1wiICYmICFsb29rQWhlYWQoXCInXCIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGl0ZXJhbCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjaGVja0xpdGVyYWwoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHN3aXRjaCAoZm9ybWF0LmNoYXJBdChpRm9ybWF0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJkXCI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRheSA9IGdldE51bWJlcihcImRcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJEXCI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldE5hbWUoXCJEXCIsIHRoaXMuZ2V0VHJhbnNsYXRpb24oVHJhbnNsYXRpb25LZXlzLkRBWV9OQU1FU19TSE9SVCksIHRoaXMuZ2V0VHJhbnNsYXRpb24oVHJhbnNsYXRpb25LZXlzLkRBWV9OQU1FUykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIFwib1wiOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkb3kgPSBnZXROdW1iZXIoXCJvXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIFwibVwiOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBtb250aCA9IGdldE51bWJlcihcIm1cIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgXCJNXCI6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vbnRoID0gZ2V0TmFtZShcIk1cIiwgdGhpcy5nZXRUcmFuc2xhdGlvbihUcmFuc2xhdGlvbktleXMuTU9OVEhfTkFNRVNfU0hPUlQpLCB0aGlzLmdldFRyYW5zbGF0aW9uKFRyYW5zbGF0aW9uS2V5cy5NT05USF9OQU1FUykpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIFwieVwiOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB5ZWFyID0gZ2V0TnVtYmVyKFwieVwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcIkBcIjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0ZSA9IG5ldyBEYXRlKGdldE51bWJlcihcIkBcIikpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB5ZWFyID0gZGF0ZS5nZXRGdWxsWWVhcigpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtb250aCA9IGRhdGUuZ2V0TW9udGgoKSArIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRheSA9IGRhdGUuZ2V0RGF0ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIFwiIVwiOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRlID0gbmV3IERhdGUoKGdldE51bWJlcihcIiFcIikgLSB0aGlzLnRpY2tzVG8xOTcwKSAvIDEwMDAwKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeWVhciA9IGRhdGUuZ2V0RnVsbFllYXIoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbW9udGggPSBkYXRlLmdldE1vbnRoKCkgKyAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXkgPSBkYXRlLmdldERhdGUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBcIidcIjpcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxvb2tBaGVhZChcIidcIikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrTGl0ZXJhbCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGl0ZXJhbCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tMaXRlcmFsKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpVmFsdWUgPCB2YWx1ZS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgZXh0cmEgPSB2YWx1ZS5zdWJzdHIoaVZhbHVlKTtcclxuICAgICAgICAgICAgaWYgKCEvXlxccysvLnRlc3QoZXh0cmEpKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvdyBcIkV4dHJhL3VucGFyc2VkIGNoYXJhY3RlcnMgZm91bmQgaW4gZGF0ZTogXCIgKyBleHRyYTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHllYXIgPT09IC0xKSB7XHJcbiAgICAgICAgICAgIHllYXIgPSBuZXcgRGF0ZSgpLmdldEZ1bGxZZWFyKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh5ZWFyIDwgMTAwKSB7XHJcbiAgICAgICAgICAgIHllYXIgKz0gbmV3IERhdGUoKS5nZXRGdWxsWWVhcigpIC0gbmV3IERhdGUoKS5nZXRGdWxsWWVhcigpICUgMTAwICtcclxuICAgICAgICAgICAgICAgICh5ZWFyIDw9IHNob3J0WWVhckN1dG9mZiA/IDAgOiAtMTAwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChkb3kgPiAtMSkge1xyXG4gICAgICAgICAgICBtb250aCA9IDE7XHJcbiAgICAgICAgICAgIGRheSA9IGRveTtcclxuICAgICAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICAgICAgZGltID0gdGhpcy5nZXREYXlzQ291bnRJbk1vbnRoKHllYXIsIG1vbnRoIC0gMSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF5IDw9IGRpbSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbW9udGgrKztcclxuICAgICAgICAgICAgICAgIGRheSAtPSBkaW07XHJcbiAgICAgICAgICAgIH0gd2hpbGUgKHRydWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZGF0ZSA9IHRoaXMuZGF5bGlnaHRTYXZpbmdBZGp1c3QobmV3IERhdGUoeWVhciwgbW9udGggLSAxLCBkYXkpKTtcclxuICAgICAgICAgICAgICAgIGlmIChkYXRlLmdldEZ1bGxZZWFyKCkgIT09IHllYXIgfHwgZGF0ZS5nZXRNb250aCgpICsgMSAhPT0gbW9udGggfHwgZGF0ZS5nZXREYXRlKCkgIT09IGRheSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IFwiSW52YWxpZCBkYXRlXCI7IC8vIEUuZy4gMzEvMDIvMDBcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGRhdGU7XHJcbiAgICB9XHJcblxyXG4gICAgZGF5bGlnaHRTYXZpbmdBZGp1c3QoZGF0ZSkge1xyXG4gICAgICAgIGlmICghZGF0ZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGRhdGUuc2V0SG91cnMoZGF0ZS5nZXRIb3VycygpID4gMTIgPyBkYXRlLmdldEhvdXJzKCkgKyAyIDogMCk7XHJcblxyXG4gICAgICAgIHJldHVybiBkYXRlO1xyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZUZpbGxlZFN0YXRlKCkge1xyXG4gICAgICAgIHRoaXMuZmlsbGVkID0gdGhpcy5pbnB1dEZpZWxkVmFsdWUgJiYgdGhpcy5pbnB1dEZpZWxkVmFsdWUgIT0gJyc7XHJcbiAgICB9XHJcblxyXG4gICAgb25Ub2RheUJ1dHRvbkNsaWNrKGV2ZW50KSB7XHJcbiAgICAgICAgbGV0IGRhdGU6IERhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICAgIGxldCBkYXRlTWV0YSA9IHtkYXk6IGRhdGUuZ2V0RGF0ZSgpLCBtb250aDogZGF0ZS5nZXRNb250aCgpLCB5ZWFyOiBkYXRlLmdldEZ1bGxZZWFyKCksIG90aGVyTW9udGg6IGRhdGUuZ2V0TW9udGgoKSAhPT0gdGhpcy5jdXJyZW50TW9udGggfHwgZGF0ZS5nZXRGdWxsWWVhcigpICE9PSB0aGlzLmN1cnJlbnRZZWFyLCB0b2RheTogdHJ1ZSwgc2VsZWN0YWJsZTogdHJ1ZX07XHJcblxyXG4gICAgICAgIHRoaXMub25EYXRlU2VsZWN0KGV2ZW50LCBkYXRlTWV0YSk7XHJcbiAgICAgICAgdGhpcy5vblRvZGF5Q2xpY2suZW1pdChldmVudCk7XHJcbiAgICB9XHJcblxyXG4gICAgb25DbGVhckJ1dHRvbkNsaWNrKGV2ZW50KSB7XHJcbiAgICAgICAgdGhpcy51cGRhdGVNb2RlbChudWxsKTtcclxuICAgICAgICB0aGlzLnVwZGF0ZUlucHV0ZmllbGQoKTtcclxuICAgICAgICB0aGlzLmhpZGVPdmVybGF5KCk7XHJcbiAgICAgICAgdGhpcy5vbkNsZWFyQ2xpY2suZW1pdChldmVudCk7XHJcbiAgICB9XHJcblxyXG4gICAgYmluZERvY3VtZW50Q2xpY2tMaXN0ZW5lcigpIHtcclxuICAgICAgICBpZiAoIXRoaXMuZG9jdW1lbnRDbGlja0xpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuem9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBkb2N1bWVudFRhcmdldDogYW55ID0gdGhpcy5lbCA/IHRoaXMuZWwubmF0aXZlRWxlbWVudC5vd25lckRvY3VtZW50IDogJ2RvY3VtZW50JztcclxuXHJcbiAgICAgICAgICAgICAgICB0aGlzLmRvY3VtZW50Q2xpY2tMaXN0ZW5lciA9IHRoaXMucmVuZGVyZXIubGlzdGVuKGRvY3VtZW50VGFyZ2V0LCAnY2xpY2snLCAoZXZlbnQpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5pc091dHNpZGVDbGlja2VkKGV2ZW50KSAmJiB0aGlzLm92ZXJsYXlWaXNpYmxlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuem9uZS5ydW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5oaWRlT3ZlcmxheSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbkNsaWNrT3V0c2lkZS5lbWl0KGV2ZW50KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNkLm1hcmtGb3JDaGVjaygpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1bmJpbmREb2N1bWVudENsaWNrTGlzdGVuZXIoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZG9jdW1lbnRDbGlja0xpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZG9jdW1lbnRDbGlja0xpc3RlbmVyKCk7XHJcbiAgICAgICAgICAgIHRoaXMuZG9jdW1lbnRDbGlja0xpc3RlbmVyID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgYmluZERvY3VtZW50UmVzaXplTGlzdGVuZXIoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmRvY3VtZW50UmVzaXplTGlzdGVuZXIgJiYgIXRoaXMudG91Y2hVSSkge1xyXG4gICAgICAgICAgICB0aGlzLmRvY3VtZW50UmVzaXplTGlzdGVuZXIgPSB0aGlzLm9uV2luZG93UmVzaXplLmJpbmQodGhpcyk7XHJcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLmRvY3VtZW50UmVzaXplTGlzdGVuZXIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB1bmJpbmREb2N1bWVudFJlc2l6ZUxpc3RlbmVyKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmRvY3VtZW50UmVzaXplTGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHRoaXMuZG9jdW1lbnRSZXNpemVMaXN0ZW5lcik7XHJcbiAgICAgICAgICAgIHRoaXMuZG9jdW1lbnRSZXNpemVMaXN0ZW5lciA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGJpbmRTY3JvbGxMaXN0ZW5lcigpIHtcclxuICAgICAgICBpZiAoIXRoaXMuc2Nyb2xsSGFuZGxlcikge1xyXG4gICAgICAgICAgICB0aGlzLnNjcm9sbEhhbmRsZXIgPSBuZXcgQ29ubmVjdGVkT3ZlcmxheVNjcm9sbEhhbmRsZXIodGhpcy5jb250YWluZXJWaWV3Q2hpbGQubmF0aXZlRWxlbWVudCwgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3ZlcmxheVZpc2libGUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmhpZGVPdmVybGF5KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5zY3JvbGxIYW5kbGVyLmJpbmRTY3JvbGxMaXN0ZW5lcigpO1xyXG4gICAgfVxyXG5cclxuICAgIHVuYmluZFNjcm9sbExpc3RlbmVyKCkge1xyXG4gICAgICAgIGlmICh0aGlzLnNjcm9sbEhhbmRsZXIpIHtcclxuICAgICAgICAgICAgdGhpcy5zY3JvbGxIYW5kbGVyLnVuYmluZFNjcm9sbExpc3RlbmVyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlzT3V0c2lkZUNsaWNrZWQoZXZlbnQ6IEV2ZW50KSB7XHJcbiAgICAgICAgcmV0dXJuICEodGhpcy5lbC5uYXRpdmVFbGVtZW50LmlzU2FtZU5vZGUoZXZlbnQudGFyZ2V0KSB8fCB0aGlzLmlzTmF2SWNvbkNsaWNrZWQoZXZlbnQpIHx8wqBcclxuICAgICAgICAgICAgICAgIHRoaXMuZWwubmF0aXZlRWxlbWVudC5jb250YWlucyhldmVudC50YXJnZXQpIHx8ICh0aGlzLm92ZXJsYXkgJiYgdGhpcy5vdmVybGF5LmNvbnRhaW5zKDxOb2RlPiBldmVudC50YXJnZXQpKSk7XHJcbiAgICB9XHJcblxyXG4gICAgaXNOYXZJY29uQ2xpY2tlZChldmVudDogRXZlbnQpIHtcclxuICAgICAgICByZXR1cm4gKERvbUhhbmRsZXIuaGFzQ2xhc3MoZXZlbnQudGFyZ2V0LCAncC1kYXRlcGlja2VyLXByZXYnKSB8fCBEb21IYW5kbGVyLmhhc0NsYXNzKGV2ZW50LnRhcmdldCwgJ3AtZGF0ZXBpY2tlci1wcmV2LWljb24nKVxyXG4gICAgICAgICAgICAgICAgfHwgRG9tSGFuZGxlci5oYXNDbGFzcyhldmVudC50YXJnZXQsICdwLWRhdGVwaWNrZXItbmV4dCcpIHx8IERvbUhhbmRsZXIuaGFzQ2xhc3MoZXZlbnQudGFyZ2V0LCAncC1kYXRlcGlja2VyLW5leHQtaWNvbicpKTtcclxuICAgIH1cclxuXHJcbiAgICBvbldpbmRvd1Jlc2l6ZSgpIHtcclxuICAgICAgICBpZiAodGhpcy5vdmVybGF5VmlzaWJsZSAmJiAhRG9tSGFuZGxlci5pc0FuZHJvaWQoKSkge1xyXG4gICAgICAgICAgICB0aGlzLmhpZGVPdmVybGF5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG9uT3ZlcmxheUhpZGUoKSB7XHJcbiAgICAgICAgdGhpcy51bmJpbmREb2N1bWVudENsaWNrTGlzdGVuZXIoKTtcclxuICAgICAgICB0aGlzLnVuYmluZE1hc2tDbGlja0xpc3RlbmVyKCk7XHJcbiAgICAgICAgdGhpcy51bmJpbmREb2N1bWVudFJlc2l6ZUxpc3RlbmVyKCk7XHJcbiAgICAgICAgdGhpcy51bmJpbmRTY3JvbGxMaXN0ZW5lcigpO1xyXG4gICAgICAgIHRoaXMub3ZlcmxheSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5kaXNhYmxlTW9kYWxpdHkoKTtcclxuICAgIH1cclxuXHJcbiAgICBuZ09uRGVzdHJveSgpIHtcclxuICAgICAgICBpZiAodGhpcy5zY3JvbGxIYW5kbGVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2Nyb2xsSGFuZGxlci5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgIHRoaXMuc2Nyb2xsSGFuZGxlciA9IG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy50cmFuc2xhdGlvblN1YnNjcmlwdGlvbikge1xyXG4gICAgICAgICAgICB0aGlzLnRyYW5zbGF0aW9uU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmNsZWFyVGltZVBpY2tlclRpbWVyKCk7XHJcbiAgICAgICAgdGhpcy5yZXN0b3JlT3ZlcmxheUFwcGVuZCgpO1xyXG4gICAgICAgIHRoaXMub25PdmVybGF5SGlkZSgpO1xyXG4gICAgfVxyXG59XHJcblxyXG5ATmdNb2R1bGUoe1xyXG4gICAgaW1wb3J0czogW0NvbW1vbk1vZHVsZSxCdXR0b25Nb2R1bGUsU2hhcmVkTW9kdWxlLFJpcHBsZU1vZHVsZV0sXHJcbiAgICBleHBvcnRzOiBbQ2FsZW5kYXIsQnV0dG9uTW9kdWxlLFNoYXJlZE1vZHVsZV0sXHJcbiAgICBkZWNsYXJhdGlvbnM6IFtDYWxlbmRhcl1cclxufSlcclxuZXhwb3J0IGNsYXNzIENhbGVuZGFyTW9kdWxlIHsgfVxyXG4iXX0=