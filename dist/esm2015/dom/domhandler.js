/**
 * @dynamic is for runtime initializing DomHandler.browser
 *
 * If delete below comment, we can see this error message:
 *  Metadata collected contains an error that will be reported at runtime:
 *  Only initialized variables and constants can be referenced
 *  because the value of this variable is needed by the template compiler.
 */
// @dynamic
export class DomHandler {
    static addClass(element, className) {
        if (element.classList)
            element.classList.add(className);
        else
            element.className += ' ' + className;
    }
    static addMultipleClasses(element, className) {
        if (element.classList) {
            let styles = className.trim().split(' ');
            for (let i = 0; i < styles.length; i++) {
                element.classList.add(styles[i]);
            }
        }
        else {
            let styles = className.split(' ');
            for (let i = 0; i < styles.length; i++) {
                element.className += ' ' + styles[i];
            }
        }
    }
    static removeClass(element, className) {
        if (element.classList)
            element.classList.remove(className);
        else
            element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }
    static hasClass(element, className) {
        if (element.classList)
            return element.classList.contains(className);
        else
            return new RegExp('(^| )' + className + '( |$)', 'gi').test(element.className);
    }
    static siblings(element) {
        return Array.prototype.filter.call(element.parentNode.children, function (child) {
            return child !== element;
        });
    }
    static find(element, selector) {
        return Array.from(element.querySelectorAll(selector));
    }
    static findSingle(element, selector) {
        if (element) {
            return element.querySelector(selector);
        }
        return null;
    }
    static index(element) {
        let children = element.parentNode.childNodes;
        let num = 0;
        for (var i = 0; i < children.length; i++) {
            if (children[i] == element)
                return num;
            if (children[i].nodeType == 1)
                num++;
        }
        return -1;
    }
    static indexWithinGroup(element, attributeName) {
        let children = element.parentNode ? element.parentNode.childNodes : [];
        let num = 0;
        for (var i = 0; i < children.length; i++) {
            if (children[i] == element)
                return num;
            if (children[i].attributes && children[i].attributes[attributeName] && children[i].nodeType == 1)
                num++;
        }
        return -1;
    }
    static relativePosition(element, target) {
        let elementDimensions = element.offsetParent ? { width: element.offsetWidth, height: element.offsetHeight } : this.getHiddenElementDimensions(element);
        const targetHeight = target.offsetHeight;
        const targetOffset = target.getBoundingClientRect();
        const viewport = this.getViewport();
        let top, left;
        if ((targetOffset.top + targetHeight + elementDimensions.height) > viewport.height) {
            top = -1 * (elementDimensions.height);
            element.style.transformOrigin = 'bottom';
            if (targetOffset.top + top < 0) {
                top = -1 * targetOffset.top;
            }
        }
        else {
            top = targetHeight;
            element.style.transformOrigin = 'top';
        }
        if (elementDimensions.width > viewport.width) {
            // element wider then viewport and cannot fit on screen (align at left side of viewport)
            left = targetOffset.left * -1;
        }
        else if ((targetOffset.left + elementDimensions.width) > viewport.width) {
            // element wider then viewport but can be fit on screen (align at right side of viewport)
            left = (targetOffset.left + elementDimensions.width - viewport.width) * -1;
        }
        else {
            // element fits on screen (align with target)
            left = 0;
        }
        element.style.top = top + 'px';
        element.style.left = left + 'px';
    }
    static absolutePosition(element, target) {
        let elementDimensions = element.offsetParent ? { width: element.offsetWidth, height: element.offsetHeight } : this.getHiddenElementDimensions(element);
        let elementOuterHeight = elementDimensions.height;
        let elementOuterWidth = elementDimensions.width;
        let targetOuterHeight = target.offsetHeight;
        let targetOuterWidth = target.offsetWidth;
        let targetOffset = target.getBoundingClientRect();
        let windowScrollTop = this.getWindowScrollTop();
        let windowScrollLeft = this.getWindowScrollLeft();
        let viewport = this.getViewport();
        let top, left;
        if (targetOffset.top + targetOuterHeight + elementOuterHeight > viewport.height) {
            top = targetOffset.top + windowScrollTop - elementOuterHeight;
            element.style.transformOrigin = 'bottom';
            if (top < 0) {
                top = windowScrollTop;
            }
        }
        else {
            top = targetOuterHeight + targetOffset.top + windowScrollTop;
            element.style.transformOrigin = 'top';
        }
        if (targetOffset.left + elementOuterWidth > viewport.width)
            left = Math.max(0, targetOffset.left + windowScrollLeft + targetOuterWidth - elementOuterWidth);
        else
            left = targetOffset.left + windowScrollLeft;
        element.style.top = top + 'px';
        element.style.left = left + 'px';
    }
    static getParents(element, parents = []) {
        return element['parentNode'] === null ? parents : this.getParents(element.parentNode, parents.concat([element.parentNode]));
    }
    static getScrollableParents(element) {
        let scrollableParents = [];
        if (element) {
            let parents = this.getParents(element);
            const overflowRegex = /(auto|scroll)/;
            const overflowCheck = (node) => {
                let styleDeclaration = window['getComputedStyle'](node, null);
                return overflowRegex.test(styleDeclaration.getPropertyValue('overflow')) || overflowRegex.test(styleDeclaration.getPropertyValue('overflowX')) || overflowRegex.test(styleDeclaration.getPropertyValue('overflowY'));
            };
            for (let parent of parents) {
                let scrollSelectors = parent.nodeType === 1 && parent.dataset['scrollselectors'];
                if (scrollSelectors) {
                    let selectors = scrollSelectors.split(',');
                    for (let selector of selectors) {
                        let el = this.findSingle(parent, selector);
                        if (el && overflowCheck(el)) {
                            scrollableParents.push(el);
                        }
                    }
                }
                if (parent.nodeType !== 9 && overflowCheck(parent)) {
                    scrollableParents.push(parent);
                }
            }
        }
        return scrollableParents;
    }
    static getHiddenElementOuterHeight(element) {
        element.style.visibility = 'hidden';
        element.style.display = 'block';
        let elementHeight = element.offsetHeight;
        element.style.display = 'none';
        element.style.visibility = 'visible';
        return elementHeight;
    }
    static getHiddenElementOuterWidth(element) {
        element.style.visibility = 'hidden';
        element.style.display = 'block';
        let elementWidth = element.offsetWidth;
        element.style.display = 'none';
        element.style.visibility = 'visible';
        return elementWidth;
    }
    static getHiddenElementDimensions(element) {
        let dimensions = {};
        element.style.visibility = 'hidden';
        element.style.display = 'block';
        dimensions.width = element.offsetWidth;
        dimensions.height = element.offsetHeight;
        element.style.display = 'none';
        element.style.visibility = 'visible';
        return dimensions;
    }
    static scrollInView(container, item) {
        let borderTopValue = getComputedStyle(container).getPropertyValue('borderTopWidth');
        let borderTop = borderTopValue ? parseFloat(borderTopValue) : 0;
        let paddingTopValue = getComputedStyle(container).getPropertyValue('paddingTop');
        let paddingTop = paddingTopValue ? parseFloat(paddingTopValue) : 0;
        let containerRect = container.getBoundingClientRect();
        let itemRect = item.getBoundingClientRect();
        let offset = (itemRect.top + document.body.scrollTop) - (containerRect.top + document.body.scrollTop) - borderTop - paddingTop;
        let scroll = container.scrollTop;
        let elementHeight = container.clientHeight;
        let itemHeight = this.getOuterHeight(item);
        if (offset < 0) {
            container.scrollTop = scroll + offset;
        }
        else if ((offset + itemHeight) > elementHeight) {
            container.scrollTop = scroll + offset - elementHeight + itemHeight;
        }
    }
    static fadeIn(element, duration) {
        element.style.opacity = 0;
        let last = +new Date();
        let opacity = 0;
        let tick = function () {
            opacity = +element.style.opacity.replace(",", ".") + (new Date().getTime() - last) / duration;
            element.style.opacity = opacity;
            last = +new Date();
            if (+opacity < 1) {
                (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16);
            }
        };
        tick();
    }
    static fadeOut(element, ms) {
        var opacity = 1, interval = 50, duration = ms, gap = interval / duration;
        let fading = setInterval(() => {
            opacity = opacity - gap;
            if (opacity <= 0) {
                opacity = 0;
                clearInterval(fading);
            }
            element.style.opacity = opacity;
        }, interval);
    }
    static getWindowScrollTop() {
        let doc = document.documentElement;
        return (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
    }
    static getWindowScrollLeft() {
        let doc = document.documentElement;
        return (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
    }
    static matches(element, selector) {
        var p = Element.prototype;
        var f = p['matches'] || p.webkitMatchesSelector || p['mozMatchesSelector'] || p['msMatchesSelector'] || function (s) {
            return [].indexOf.call(document.querySelectorAll(s), this) !== -1;
        };
        return f.call(element, selector);
    }
    static getOuterWidth(el, margin) {
        let width = el.offsetWidth;
        if (margin) {
            let style = getComputedStyle(el);
            width += parseFloat(style.marginLeft) + parseFloat(style.marginRight);
        }
        return width;
    }
    static getHorizontalPadding(el) {
        let style = getComputedStyle(el);
        return parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    }
    static getHorizontalMargin(el) {
        let style = getComputedStyle(el);
        return parseFloat(style.marginLeft) + parseFloat(style.marginRight);
    }
    static innerWidth(el) {
        let width = el.offsetWidth;
        let style = getComputedStyle(el);
        width += parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
        return width;
    }
    static width(el) {
        let width = el.offsetWidth;
        let style = getComputedStyle(el);
        width -= parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
        return width;
    }
    static getInnerHeight(el) {
        let height = el.offsetHeight;
        let style = getComputedStyle(el);
        height += parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
        return height;
    }
    static getOuterHeight(el, margin) {
        let height = el.offsetHeight;
        if (margin) {
            let style = getComputedStyle(el);
            height += parseFloat(style.marginTop) + parseFloat(style.marginBottom);
        }
        return height;
    }
    static getHeight(el) {
        let height = el.offsetHeight;
        let style = getComputedStyle(el);
        height -= parseFloat(style.paddingTop) + parseFloat(style.paddingBottom) + parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
        return height;
    }
    static getWidth(el) {
        let width = el.offsetWidth;
        let style = getComputedStyle(el);
        width -= parseFloat(style.paddingLeft) + parseFloat(style.paddingRight) + parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);
        return width;
    }
    static getViewport() {
        let win = window, d = document, e = d.documentElement, g = d.getElementsByTagName('body')[0], w = win.innerWidth || e.clientWidth || g.clientWidth, h = win.innerHeight || e.clientHeight || g.clientHeight;
        return { width: w, height: h };
    }
    static getOffset(el) {
        var rect = el.getBoundingClientRect();
        return {
            top: rect.top + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0),
            left: rect.left + (window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0),
        };
    }
    static replaceElementWith(element, replacementElement) {
        let parentNode = element.parentNode;
        if (!parentNode)
            throw `Can't replace element`;
        return parentNode.replaceChild(replacementElement, element);
    }
    static getUserAgent() {
        return navigator.userAgent;
    }
    static isIE() {
        var ua = window.navigator.userAgent;
        var msie = ua.indexOf('MSIE ');
        if (msie > 0) {
            // IE 10 or older => return version number
            return true;
        }
        var trident = ua.indexOf('Trident/');
        if (trident > 0) {
            // IE 11 => return version number
            var rv = ua.indexOf('rv:');
            return true;
        }
        var edge = ua.indexOf('Edge/');
        if (edge > 0) {
            // Edge (IE 12+) => return version number
            return true;
        }
        // other browser
        return false;
    }
    static isIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window['MSStream'];
    }
    static isAndroid() {
        return /(android)/i.test(navigator.userAgent);
    }
    static appendChild(element, target) {
        if (this.isElement(target))
            target.appendChild(element);
        else if (target.el && target.el.nativeElement)
            target.el.nativeElement.appendChild(element);
        else
            throw 'Cannot append ' + target + ' to ' + element;
    }
    static removeChild(element, target) {
        if (this.isElement(target))
            target.removeChild(element);
        else if (target.el && target.el.nativeElement)
            target.el.nativeElement.removeChild(element);
        else
            throw 'Cannot remove ' + element + ' from ' + target;
    }
    static removeElement(element) {
        if (!('remove' in Element.prototype))
            element.parentNode.removeChild(element);
        else
            element.remove();
    }
    static isElement(obj) {
        return (typeof HTMLElement === "object" ? obj instanceof HTMLElement :
            obj && typeof obj === "object" && obj !== null && obj.nodeType === 1 && typeof obj.nodeName === "string");
    }
    static calculateScrollbarWidth(el) {
        if (el) {
            let style = getComputedStyle(el);
            return (el.offsetWidth - el.clientWidth - parseFloat(style.borderLeftWidth) - parseFloat(style.borderRightWidth));
        }
        else {
            if (this.calculatedScrollbarWidth !== null)
                return this.calculatedScrollbarWidth;
            let scrollDiv = document.createElement("div");
            scrollDiv.className = "p-scrollbar-measure";
            document.body.appendChild(scrollDiv);
            let scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
            document.body.removeChild(scrollDiv);
            this.calculatedScrollbarWidth = scrollbarWidth;
            return scrollbarWidth;
        }
    }
    static calculateScrollbarHeight() {
        if (this.calculatedScrollbarHeight !== null)
            return this.calculatedScrollbarHeight;
        let scrollDiv = document.createElement("div");
        scrollDiv.className = "p-scrollbar-measure";
        document.body.appendChild(scrollDiv);
        let scrollbarHeight = scrollDiv.offsetHeight - scrollDiv.clientHeight;
        document.body.removeChild(scrollDiv);
        this.calculatedScrollbarWidth = scrollbarHeight;
        return scrollbarHeight;
    }
    static invokeElementMethod(element, methodName, args) {
        element[methodName].apply(element, args);
    }
    static clearSelection() {
        if (window.getSelection) {
            if (window.getSelection().empty) {
                window.getSelection().empty();
            }
            else if (window.getSelection().removeAllRanges && window.getSelection().rangeCount > 0 && window.getSelection().getRangeAt(0).getClientRects().length > 0) {
                window.getSelection().removeAllRanges();
            }
        }
        else if (document['selection'] && document['selection'].empty) {
            try {
                document['selection'].empty();
            }
            catch (error) {
                //ignore IE bug
            }
        }
    }
    static getBrowser() {
        if (!this.browser) {
            let matched = this.resolveUserAgent();
            this.browser = {};
            if (matched.browser) {
                this.browser[matched.browser] = true;
                this.browser['version'] = matched.version;
            }
            if (this.browser['chrome']) {
                this.browser['webkit'] = true;
            }
            else if (this.browser['webkit']) {
                this.browser['safari'] = true;
            }
        }
        return this.browser;
    }
    static resolveUserAgent() {
        let ua = navigator.userAgent.toLowerCase();
        let match = /(chrome)[ \/]([\w.]+)/.exec(ua) ||
            /(webkit)[ \/]([\w.]+)/.exec(ua) ||
            /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) ||
            /(msie) ([\w.]+)/.exec(ua) ||
            ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) ||
            [];
        return {
            browser: match[1] || "",
            version: match[2] || "0"
        };
    }
    static isInteger(value) {
        if (Number.isInteger) {
            return Number.isInteger(value);
        }
        else {
            return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
        }
    }
    static isHidden(element) {
        return element.offsetParent === null;
    }
    static getFocusableElements(element) {
        let focusableElements = DomHandler.find(element, `button:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden]),
                [href][clientHeight][clientWidth]:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden]),
                input:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden]), select:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden]),
                textarea:not([tabindex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden]), [tabIndex]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden]),
                [contenteditable]:not([tabIndex = "-1"]):not([disabled]):not([style*="display:none"]):not([hidden])`);
        let visibleFocusableElements = [];
        for (let focusableElement of focusableElements) {
            if (getComputedStyle(focusableElement).display != "none" && getComputedStyle(focusableElement).visibility != "hidden")
                visibleFocusableElements.push(focusableElement);
        }
        return visibleFocusableElements;
    }
    static generateZIndex() {
        this.zindex = this.zindex || 999;
        return ++this.zindex;
    }
}
DomHandler.zindex = 1000;
DomHandler.calculatedScrollbarWidth = null;
DomHandler.calculatedScrollbarHeight = null;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9taGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8uLi9zcmMvYXBwL2NvbXBvbmVudHMvZG9tLyIsInNvdXJjZXMiOlsiZG9taGFuZGxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7OztHQU9HO0FBQ0gsV0FBVztBQUNYLE1BQU0sT0FBTyxVQUFVO0lBVVosTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFZLEVBQUUsU0FBaUI7UUFDbEQsSUFBSSxPQUFPLENBQUMsU0FBUztZQUNqQixPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQzs7WUFFakMsT0FBTyxDQUFDLFNBQVMsSUFBSSxHQUFHLEdBQUcsU0FBUyxDQUFDO0lBQzdDLENBQUM7SUFFTSxNQUFNLENBQUMsa0JBQWtCLENBQUMsT0FBWSxFQUFFLFNBQWlCO1FBQzVELElBQUksT0FBTyxDQUFDLFNBQVMsRUFBRTtZQUNuQixJQUFJLE1BQU0sR0FBYSxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ25ELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNwQyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNwQztTQUVKO2FBQ0k7WUFDRCxJQUFJLE1BQU0sR0FBYSxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQzVDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO2dCQUNwQyxPQUFPLENBQUMsU0FBUyxJQUFJLEdBQUcsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDeEM7U0FDSjtJQUNMLENBQUM7SUFFTSxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQVksRUFBRSxTQUFpQjtRQUNyRCxJQUFJLE9BQU8sQ0FBQyxTQUFTO1lBQ2pCLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDOztZQUVwQyxPQUFPLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksTUFBTSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxTQUFTLEVBQUUsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDckksQ0FBQztJQUVNLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBWSxFQUFFLFNBQWlCO1FBQ2xELElBQUksT0FBTyxDQUFDLFNBQVM7WUFDakIsT0FBTyxPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQzs7WUFFN0MsT0FBTyxJQUFJLE1BQU0sQ0FBQyxPQUFPLEdBQUcsU0FBUyxHQUFHLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3ZGLENBQUM7SUFFTSxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQVk7UUFDL0IsT0FBTyxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsVUFBVSxLQUFLO1lBQzNFLE9BQU8sS0FBSyxLQUFLLE9BQU8sQ0FBQztRQUM3QixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQVksRUFBRSxRQUFnQjtRQUM3QyxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDMUQsQ0FBQztJQUVNLE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBWSxFQUFFLFFBQWdCO1FBQ25ELElBQUksT0FBTyxFQUFFO1lBQ1QsT0FBTyxPQUFPLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQzFDO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVNLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBWTtRQUM1QixJQUFJLFFBQVEsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQztRQUM3QyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7UUFDWixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUN0QyxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxPQUFPO2dCQUFFLE9BQU8sR0FBRyxDQUFDO1lBQ3ZDLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsSUFBSSxDQUFDO2dCQUFFLEdBQUcsRUFBRSxDQUFDO1NBQ3hDO1FBQ0QsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUNkLENBQUM7SUFFTSxNQUFNLENBQUMsZ0JBQWdCLENBQUMsT0FBWSxFQUFFLGFBQXFCO1FBQzlELElBQUksUUFBUSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDdkUsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDO1FBQ1osS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDdEMsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksT0FBTztnQkFBRSxPQUFPLEdBQUcsQ0FBQztZQUN2QyxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxJQUFJLENBQUM7Z0JBQUUsR0FBRyxFQUFFLENBQUM7U0FDM0c7UUFDRCxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQ2QsQ0FBQztJQUVNLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFZLEVBQUUsTUFBVztRQUNwRCxJQUFJLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxXQUFXLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3ZKLE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUM7UUFDekMsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLHFCQUFxQixFQUFFLENBQUM7UUFDcEQsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ3BDLElBQUksR0FBVyxFQUFFLElBQVksQ0FBQztRQUU5QixJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsR0FBRyxZQUFZLEdBQUcsaUJBQWlCLENBQUMsTUFBTSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRTtZQUNoRixHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN0QyxPQUFPLENBQUMsS0FBSyxDQUFDLGVBQWUsR0FBRyxRQUFRLENBQUM7WUFDekMsSUFBSSxZQUFZLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLEVBQUU7Z0JBQzVCLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxZQUFZLENBQUMsR0FBRyxDQUFDO2FBQy9CO1NBQ0o7YUFDSTtZQUNELEdBQUcsR0FBRyxZQUFZLENBQUM7WUFDbkIsT0FBTyxDQUFDLEtBQUssQ0FBQyxlQUFlLEdBQUcsS0FBSyxDQUFDO1NBQ3pDO1FBRUQsSUFBSSxpQkFBaUIsQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLEtBQUssRUFBRTtZQUMxQyx3RkFBd0Y7WUFDeEYsSUFBSSxHQUFHLFlBQVksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUM7U0FDakM7YUFDSSxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksR0FBRyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsR0FBRyxRQUFRLENBQUMsS0FBSyxFQUFFO1lBQ3JFLHlGQUF5RjtZQUN6RixJQUFJLEdBQUcsQ0FBQyxZQUFZLENBQUMsSUFBSSxHQUFHLGlCQUFpQixDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7U0FDOUU7YUFDSTtZQUNELDZDQUE2QztZQUM3QyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1NBQ1o7UUFFRCxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDO1FBQy9CLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUM7SUFDckMsQ0FBQztJQUVNLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFZLEVBQUUsTUFBVztRQUNwRCxJQUFJLGlCQUFpQixHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxXQUFXLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3ZKLElBQUksa0JBQWtCLEdBQUcsaUJBQWlCLENBQUMsTUFBTSxDQUFDO1FBQ2xELElBQUksaUJBQWlCLEdBQUcsaUJBQWlCLENBQUMsS0FBSyxDQUFDO1FBQ2hELElBQUksaUJBQWlCLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQztRQUM1QyxJQUFJLGdCQUFnQixHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUM7UUFDMUMsSUFBSSxZQUFZLEdBQUcsTUFBTSxDQUFDLHFCQUFxQixFQUFFLENBQUM7UUFDbEQsSUFBSSxlQUFlLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDaEQsSUFBSSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUNsRCxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDbEMsSUFBSSxHQUFHLEVBQUUsSUFBSSxDQUFDO1FBRWQsSUFBSSxZQUFZLENBQUMsR0FBRyxHQUFHLGlCQUFpQixHQUFHLGtCQUFrQixHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUU7WUFDN0UsR0FBRyxHQUFHLFlBQVksQ0FBQyxHQUFHLEdBQUcsZUFBZSxHQUFHLGtCQUFrQixDQUFDO1lBQzlELE9BQU8sQ0FBQyxLQUFLLENBQUMsZUFBZSxHQUFHLFFBQVEsQ0FBQztZQUV6QyxJQUFJLEdBQUcsR0FBRyxDQUFDLEVBQUU7Z0JBQ1QsR0FBRyxHQUFHLGVBQWUsQ0FBQzthQUN6QjtTQUNKO2FBQ0k7WUFDRCxHQUFHLEdBQUcsaUJBQWlCLEdBQUcsWUFBWSxDQUFDLEdBQUcsR0FBRyxlQUFlLENBQUM7WUFDN0QsT0FBTyxDQUFDLEtBQUssQ0FBQyxlQUFlLEdBQUcsS0FBSyxDQUFDO1NBQ3pDO1FBRUQsSUFBSSxZQUFZLENBQUMsSUFBSSxHQUFHLGlCQUFpQixHQUFHLFFBQVEsQ0FBQyxLQUFLO1lBQ3RELElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxZQUFZLENBQUMsSUFBSSxHQUFHLGdCQUFnQixHQUFHLGdCQUFnQixHQUFHLGlCQUFpQixDQUFDLENBQUM7O1lBRWhHLElBQUksR0FBRyxZQUFZLENBQUMsSUFBSSxHQUFHLGdCQUFnQixDQUFDO1FBRWhELE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUM7UUFDL0IsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQztJQUNyQyxDQUFDO0lBRUQsTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFZLEVBQUUsVUFBYyxFQUFFO1FBQzVDLE9BQU8sT0FBTyxDQUFDLFlBQVksQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDaEksQ0FBQztJQUVELE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxPQUFZO1FBQ3BDLElBQUksaUJBQWlCLEdBQUcsRUFBRSxDQUFDO1FBRTNCLElBQUksT0FBTyxFQUFFO1lBQ1QsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN2QyxNQUFNLGFBQWEsR0FBRyxlQUFlLENBQUM7WUFDdEMsTUFBTSxhQUFhLEdBQUcsQ0FBQyxJQUFTLEVBQUUsRUFBRTtnQkFDaEMsSUFBSSxnQkFBZ0IsR0FBRyxNQUFNLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQzlELE9BQU8sYUFBYSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLGFBQWEsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLENBQUMsSUFBSSxhQUFhLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDek4sQ0FBQyxDQUFDO1lBRUYsS0FBSyxJQUFJLE1BQU0sSUFBSSxPQUFPLEVBQUU7Z0JBQ3hCLElBQUksZUFBZSxHQUFHLE1BQU0sQ0FBQyxRQUFRLEtBQUssQ0FBQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQztnQkFDakYsSUFBSSxlQUFlLEVBQUU7b0JBQ2pCLElBQUksU0FBUyxHQUFHLGVBQWUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQzNDLEtBQUssSUFBSSxRQUFRLElBQUksU0FBUyxFQUFFO3dCQUM1QixJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQzt3QkFDM0MsSUFBSSxFQUFFLElBQUksYUFBYSxDQUFDLEVBQUUsQ0FBQyxFQUFFOzRCQUN6QixpQkFBaUIsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7eUJBQzlCO3FCQUNKO2lCQUNKO2dCQUVELElBQUksTUFBTSxDQUFDLFFBQVEsS0FBSyxDQUFDLElBQUksYUFBYSxDQUFDLE1BQU0sQ0FBQyxFQUFFO29CQUNoRCxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7aUJBQ2xDO2FBQ0o7U0FDSjtRQUVELE9BQU8saUJBQWlCLENBQUM7SUFDN0IsQ0FBQztJQUVNLE1BQU0sQ0FBQywyQkFBMkIsQ0FBQyxPQUFZO1FBQ2xELE9BQU8sQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQztRQUNwQyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDaEMsSUFBSSxhQUFhLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQztRQUN6QyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7UUFDL0IsT0FBTyxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO1FBRXJDLE9BQU8sYUFBYSxDQUFDO0lBQ3pCLENBQUM7SUFFTSxNQUFNLENBQUMsMEJBQTBCLENBQUMsT0FBWTtRQUNqRCxPQUFPLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUM7UUFDcEMsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBQ2hDLElBQUksWUFBWSxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUM7UUFDdkMsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO1FBQy9CLE9BQU8sQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztRQUVyQyxPQUFPLFlBQVksQ0FBQztJQUN4QixDQUFDO0lBRU0sTUFBTSxDQUFDLDBCQUEwQixDQUFDLE9BQVk7UUFDakQsSUFBSSxVQUFVLEdBQVEsRUFBRSxDQUFDO1FBQ3pCLE9BQU8sQ0FBQyxLQUFLLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQztRQUNwQyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDaEMsVUFBVSxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDO1FBQ3ZDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQztRQUN6QyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7UUFDL0IsT0FBTyxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO1FBRXJDLE9BQU8sVUFBVSxDQUFDO0lBQ3RCLENBQUM7SUFFTSxNQUFNLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxJQUFJO1FBQ3RDLElBQUksY0FBYyxHQUFXLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDNUYsSUFBSSxTQUFTLEdBQVcsY0FBYyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN4RSxJQUFJLGVBQWUsR0FBVyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUN6RixJQUFJLFVBQVUsR0FBVyxlQUFlLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzNFLElBQUksYUFBYSxHQUFHLFNBQVMsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1FBQ3RELElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1FBQzVDLElBQUksTUFBTSxHQUFHLENBQUMsUUFBUSxDQUFDLEdBQUcsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLEdBQUcsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLFNBQVMsR0FBRyxVQUFVLENBQUM7UUFDL0gsSUFBSSxNQUFNLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQztRQUNqQyxJQUFJLGFBQWEsR0FBRyxTQUFTLENBQUMsWUFBWSxDQUFDO1FBQzNDLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFM0MsSUFBSSxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ1osU0FBUyxDQUFDLFNBQVMsR0FBRyxNQUFNLEdBQUcsTUFBTSxDQUFDO1NBQ3pDO2FBQ0ksSUFBSSxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUMsR0FBRyxhQUFhLEVBQUU7WUFDNUMsU0FBUyxDQUFDLFNBQVMsR0FBRyxNQUFNLEdBQUcsTUFBTSxHQUFHLGFBQWEsR0FBRyxVQUFVLENBQUM7U0FDdEU7SUFDTCxDQUFDO0lBRU0sTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsUUFBZ0I7UUFDMUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO1FBRTFCLElBQUksSUFBSSxHQUFHLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQztRQUN2QixJQUFJLE9BQU8sR0FBRyxDQUFDLENBQUM7UUFDaEIsSUFBSSxJQUFJLEdBQUc7WUFDUCxPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxRQUFRLENBQUM7WUFDOUYsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1lBQ2hDLElBQUksR0FBRyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUM7WUFFbkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLEVBQUU7Z0JBQ2QsQ0FBQyxNQUFNLENBQUMscUJBQXFCLElBQUkscUJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO2FBQ3pGO1FBQ0wsQ0FBQyxDQUFDO1FBRUYsSUFBSSxFQUFFLENBQUM7SUFDWCxDQUFDO0lBRU0sTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFBRTtRQUM3QixJQUFJLE9BQU8sR0FBRyxDQUFDLEVBQ1gsUUFBUSxHQUFHLEVBQUUsRUFDYixRQUFRLEdBQUcsRUFBRSxFQUNiLEdBQUcsR0FBRyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBRTlCLElBQUksTUFBTSxHQUFHLFdBQVcsQ0FBQyxHQUFHLEVBQUU7WUFDMUIsT0FBTyxHQUFHLE9BQU8sR0FBRyxHQUFHLENBQUM7WUFFeEIsSUFBSSxPQUFPLElBQUksQ0FBQyxFQUFFO2dCQUNkLE9BQU8sR0FBRyxDQUFDLENBQUM7Z0JBQ1osYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQ3pCO1lBRUQsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBQ3BDLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNqQixDQUFDO0lBRU0sTUFBTSxDQUFDLGtCQUFrQjtRQUM1QixJQUFJLEdBQUcsR0FBRyxRQUFRLENBQUMsZUFBZSxDQUFDO1FBQ25DLE9BQU8sQ0FBQyxNQUFNLENBQUMsV0FBVyxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxTQUFTLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDeEUsQ0FBQztJQUVNLE1BQU0sQ0FBQyxtQkFBbUI7UUFDN0IsSUFBSSxHQUFHLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQztRQUNuQyxPQUFPLENBQUMsTUFBTSxDQUFDLFdBQVcsSUFBSSxHQUFHLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsVUFBVSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQzFFLENBQUM7SUFFTSxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxRQUFnQjtRQUMzQyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDO1FBQzFCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMscUJBQXFCLElBQUksQ0FBQyxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxDQUFDLG1CQUFtQixDQUFDLElBQUksVUFBVSxDQUFDO1lBQy9HLE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ3RFLENBQUMsQ0FBQztRQUNGLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUVNLE1BQU0sQ0FBQyxhQUFhLENBQUMsRUFBRSxFQUFFLE1BQU87UUFDbkMsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQztRQUUzQixJQUFJLE1BQU0sRUFBRTtZQUNSLElBQUksS0FBSyxHQUFHLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ2pDLEtBQUssSUFBSSxVQUFVLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7U0FDekU7UUFFRCxPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBRU0sTUFBTSxDQUFDLG9CQUFvQixDQUFDLEVBQUU7UUFDakMsSUFBSSxLQUFLLEdBQUcsZ0JBQWdCLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDakMsT0FBTyxVQUFVLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDMUUsQ0FBQztJQUVNLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFO1FBQ2hDLElBQUksS0FBSyxHQUFHLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2pDLE9BQU8sVUFBVSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ3hFLENBQUM7SUFFTSxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQUU7UUFDdkIsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQztRQUMzQixJQUFJLEtBQUssR0FBRyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUVqQyxLQUFLLElBQUksVUFBVSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3hFLE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFFTSxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFDbEIsSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQztRQUMzQixJQUFJLEtBQUssR0FBRyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUVqQyxLQUFLLElBQUksVUFBVSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3hFLE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFFTSxNQUFNLENBQUMsY0FBYyxDQUFDLEVBQUU7UUFDM0IsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQztRQUM3QixJQUFJLEtBQUssR0FBRyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUVqQyxNQUFNLElBQUksVUFBVSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3pFLE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFFTSxNQUFNLENBQUMsY0FBYyxDQUFDLEVBQUUsRUFBRSxNQUFPO1FBQ3BDLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUM7UUFFN0IsSUFBSSxNQUFNLEVBQUU7WUFDUixJQUFJLEtBQUssR0FBRyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNqQyxNQUFNLElBQUksVUFBVSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO1NBQzFFO1FBRUQsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUVNLE1BQU0sQ0FBQyxTQUFTLENBQUMsRUFBRTtRQUN0QixJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDO1FBQzdCLElBQUksS0FBSyxHQUFHLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRWpDLE1BQU0sSUFBSSxVQUFVLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFFbEosT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUVNLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRTtRQUNyQixJQUFJLEtBQUssR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDO1FBQzNCLElBQUksS0FBSyxHQUFHLGdCQUFnQixDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRWpDLEtBQUssSUFBSSxVQUFVLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFFakosT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUVNLE1BQU0sQ0FBQyxXQUFXO1FBQ3JCLElBQUksR0FBRyxHQUFHLE1BQU0sRUFDWixDQUFDLEdBQUcsUUFBUSxFQUNaLENBQUMsR0FBRyxDQUFDLENBQUMsZUFBZSxFQUNyQixDQUFDLEdBQUcsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUNyQyxDQUFDLEdBQUcsR0FBRyxDQUFDLFVBQVUsSUFBSSxDQUFDLENBQUMsV0FBVyxJQUFJLENBQUMsQ0FBQyxXQUFXLEVBQ3BELENBQUMsR0FBRyxHQUFHLENBQUMsV0FBVyxJQUFJLENBQUMsQ0FBQyxZQUFZLElBQUksQ0FBQyxDQUFDLFlBQVksQ0FBQztRQUU1RCxPQUFPLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDbkMsQ0FBQztJQUVNLE1BQU0sQ0FBQyxTQUFTLENBQUMsRUFBRTtRQUN0QixJQUFJLElBQUksR0FBRyxFQUFFLENBQUMscUJBQXFCLEVBQUUsQ0FBQztRQUV0QyxPQUFPO1lBQ0gsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsV0FBVyxJQUFJLFFBQVEsQ0FBQyxlQUFlLENBQUMsU0FBUyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxJQUFJLENBQUMsQ0FBQztZQUMxRyxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLE1BQU0sQ0FBQyxXQUFXLElBQUksUUFBUSxDQUFDLGVBQWUsQ0FBQyxVQUFVLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxDQUFDO1NBQ2pILENBQUM7SUFDTixDQUFDO0lBRU0sTUFBTSxDQUFDLGtCQUFrQixDQUFDLE9BQVksRUFBRSxrQkFBdUI7UUFDbEUsSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQztRQUNwQyxJQUFJLENBQUMsVUFBVTtZQUNYLE1BQU0sdUJBQXVCLENBQUM7UUFDbEMsT0FBTyxVQUFVLENBQUMsWUFBWSxDQUFDLGtCQUFrQixFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ2hFLENBQUM7SUFFTSxNQUFNLENBQUMsWUFBWTtRQUN0QixPQUFPLFNBQVMsQ0FBQyxTQUFTLENBQUM7SUFDL0IsQ0FBQztJQUVNLE1BQU0sQ0FBRSxJQUFJO1FBQ2YsSUFBSSxFQUFFLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUM7UUFFcEMsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMvQixJQUFJLElBQUksR0FBRyxDQUFDLEVBQUU7WUFDViwwQ0FBMEM7WUFDMUMsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUVELElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDckMsSUFBSSxPQUFPLEdBQUcsQ0FBQyxFQUFFO1lBQ2IsaUNBQWlDO1lBQ2pDLElBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDM0IsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUVELElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDL0IsSUFBSSxJQUFJLEdBQUcsQ0FBQyxFQUFFO1lBQ1gseUNBQXlDO1lBQ3pDLE9BQU8sSUFBSSxDQUFDO1NBQ2Q7UUFFRCxnQkFBZ0I7UUFDaEIsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUVNLE1BQU0sQ0FBQyxLQUFLO1FBQ2YsT0FBTyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQy9FLENBQUM7SUFFTSxNQUFNLENBQUMsU0FBUztRQUNuQixPQUFPLFlBQVksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFTSxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQVksRUFBRSxNQUFXO1FBQy9DLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUM7WUFDdEIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUMzQixJQUFJLE1BQU0sQ0FBQyxFQUFFLElBQUksTUFBTSxDQUFDLEVBQUUsQ0FBQyxhQUFhO1lBQ3pDLE1BQU0sQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQzs7WUFFN0MsTUFBTSxnQkFBZ0IsR0FBRyxNQUFNLEdBQUcsTUFBTSxHQUFHLE9BQU8sQ0FBQztJQUMzRCxDQUFDO0lBRU0sTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFZLEVBQUUsTUFBVztRQUMvQyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDO1lBQ3RCLE1BQU0sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7YUFDM0IsSUFBSSxNQUFNLENBQUMsRUFBRSxJQUFJLE1BQU0sQ0FBQyxFQUFFLENBQUMsYUFBYTtZQUN6QyxNQUFNLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7O1lBRTdDLE1BQU0sZ0JBQWdCLEdBQUcsT0FBTyxHQUFHLFFBQVEsR0FBRyxNQUFNLENBQUM7SUFDN0QsQ0FBQztJQUVNLE1BQU0sQ0FBQyxhQUFhLENBQUMsT0FBZ0I7UUFDeEMsSUFBSSxDQUFDLENBQUMsUUFBUSxJQUFJLE9BQU8sQ0FBQyxTQUFTLENBQUM7WUFDaEMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7O1lBRXhDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUN6QixDQUFDO0lBRU0sTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFRO1FBQzVCLE9BQU8sQ0FBQyxPQUFPLFdBQVcsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsWUFBWSxXQUFXLENBQUMsQ0FBQztZQUNsRSxHQUFHLElBQUksT0FBTyxHQUFHLEtBQUssUUFBUSxJQUFJLEdBQUcsS0FBSyxJQUFJLElBQUksR0FBRyxDQUFDLFFBQVEsS0FBSyxDQUFDLElBQUksT0FBTyxHQUFHLENBQUMsUUFBUSxLQUFLLFFBQVEsQ0FDM0csQ0FBQztJQUNOLENBQUM7SUFFTSxNQUFNLENBQUMsdUJBQXVCLENBQUMsRUFBZ0I7UUFDbEQsSUFBSSxFQUFFLEVBQUU7WUFDSixJQUFJLEtBQUssR0FBRyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNqQyxPQUFPLENBQUMsRUFBRSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7U0FDckg7YUFDSTtZQUNELElBQUksSUFBSSxDQUFDLHdCQUF3QixLQUFLLElBQUk7Z0JBQ3RDLE9BQU8sSUFBSSxDQUFDLHdCQUF3QixDQUFDO1lBRXpDLElBQUksU0FBUyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDOUMsU0FBUyxDQUFDLFNBQVMsR0FBRyxxQkFBcUIsQ0FBQztZQUM1QyxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUVyQyxJQUFJLGNBQWMsR0FBRyxTQUFTLENBQUMsV0FBVyxHQUFHLFNBQVMsQ0FBQyxXQUFXLENBQUM7WUFDbkUsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7WUFFckMsSUFBSSxDQUFDLHdCQUF3QixHQUFHLGNBQWMsQ0FBQztZQUUvQyxPQUFPLGNBQWMsQ0FBQztTQUN6QjtJQUNMLENBQUM7SUFFTSxNQUFNLENBQUMsd0JBQXdCO1FBQ2xDLElBQUksSUFBSSxDQUFDLHlCQUF5QixLQUFLLElBQUk7WUFDdkMsT0FBTyxJQUFJLENBQUMseUJBQXlCLENBQUM7UUFFMUMsSUFBSSxTQUFTLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM5QyxTQUFTLENBQUMsU0FBUyxHQUFHLHFCQUFxQixDQUFDO1FBQzVDLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRXJDLElBQUksZUFBZSxHQUFHLFNBQVMsQ0FBQyxZQUFZLEdBQUcsU0FBUyxDQUFDLFlBQVksQ0FBQztRQUN0RSxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUVyQyxJQUFJLENBQUMsd0JBQXdCLEdBQUcsZUFBZSxDQUFDO1FBRWhELE9BQU8sZUFBZSxDQUFDO0lBQzNCLENBQUM7SUFFTSxNQUFNLENBQUMsbUJBQW1CLENBQUMsT0FBWSxFQUFFLFVBQWtCLEVBQUUsSUFBWTtRQUMzRSxPQUFlLENBQUMsVUFBVSxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRU0sTUFBTSxDQUFDLGNBQWM7UUFDeEIsSUFBSSxNQUFNLENBQUMsWUFBWSxFQUFFO1lBQ3JCLElBQUksTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDLEtBQUssRUFBRTtnQkFDN0IsTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDO2FBQ2pDO2lCQUFNLElBQUksTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDLGVBQWUsSUFBSSxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUMsVUFBVSxHQUFHLENBQUMsSUFBSSxNQUFNLENBQUMsWUFBWSxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQ3pKLE1BQU0sQ0FBQyxZQUFZLEVBQUUsQ0FBQyxlQUFlLEVBQUUsQ0FBQzthQUMzQztTQUNKO2FBQ0ksSUFBSSxRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEtBQUssRUFBRTtZQUMzRCxJQUFJO2dCQUNBLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQzthQUNqQztZQUFDLE9BQU0sS0FBSyxFQUFFO2dCQUNYLGVBQWU7YUFDbEI7U0FDSjtJQUNMLENBQUM7SUFFTSxNQUFNLENBQUMsVUFBVTtRQUNwQixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNmLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQ3RDLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1lBRWxCLElBQUksT0FBTyxDQUFDLE9BQU8sRUFBRTtnQkFDakIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDO2dCQUNyQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUM7YUFDN0M7WUFFRCxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUU7Z0JBQ3hCLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsSUFBSSxDQUFDO2FBQ2pDO2lCQUFNLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDL0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxJQUFJLENBQUM7YUFDakM7U0FDSjtRQUVELE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUN4QixDQUFDO0lBRU0sTUFBTSxDQUFDLGdCQUFnQjtRQUMxQixJQUFJLEVBQUUsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzNDLElBQUksS0FBSyxHQUFHLHVCQUF1QixDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDeEMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUNoQyxvQ0FBb0MsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQzdDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDMUIsRUFBRSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksK0JBQStCLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUN4RSxFQUFFLENBQUM7UUFFUCxPQUFPO1lBQ0gsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFO1lBQ3ZCLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRztTQUMzQixDQUFDO0lBQ04sQ0FBQztJQUVNLE1BQU0sQ0FBQyxTQUFTLENBQUMsS0FBSztRQUN6QixJQUFJLE1BQU0sQ0FBQyxTQUFTLEVBQUU7WUFDbEIsT0FBTyxNQUFNLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ2xDO2FBQ0k7WUFDRCxPQUFPLE9BQU8sS0FBSyxLQUFLLFFBQVEsSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxLQUFLLENBQUM7U0FDdkY7SUFDTCxDQUFDO0lBRU0sTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFvQjtRQUN2QyxPQUFPLE9BQU8sQ0FBQyxZQUFZLEtBQUssSUFBSSxDQUFDO0lBQ3pDLENBQUM7SUFFTSxNQUFNLENBQUMsb0JBQW9CLENBQUMsT0FBbUI7UUFDbEQsSUFBSSxpQkFBaUIsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBQzs7OztvSEFJNEQsQ0FDdkcsQ0FBQztRQUVGLElBQUksd0JBQXdCLEdBQUcsRUFBRSxDQUFDO1FBQ2xDLEtBQUksSUFBSSxnQkFBZ0IsSUFBSSxpQkFBaUIsRUFBRTtZQUMzQyxJQUFJLGdCQUFnQixDQUFDLGdCQUFnQixDQUFDLENBQUMsT0FBTyxJQUFJLE1BQU0sSUFBSSxnQkFBZ0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLFVBQVUsSUFBSSxRQUFRO2dCQUNqSCx3QkFBd0IsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztTQUN2RDtRQUNMLE9BQU8sd0JBQXdCLENBQUM7SUFDcEMsQ0FBQztJQUVELE1BQU0sQ0FBQyxjQUFjO1FBQ2pCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sSUFBRSxHQUFHLENBQUM7UUFDL0IsT0FBTyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDekIsQ0FBQzs7QUE5a0JhLGlCQUFNLEdBQVcsSUFBSSxDQUFDO0FBRXJCLG1DQUF3QixHQUFXLElBQUksQ0FBQztBQUV4QyxvQ0FBeUIsR0FBVyxJQUFJLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQGR5bmFtaWMgaXMgZm9yIHJ1bnRpbWUgaW5pdGlhbGl6aW5nIERvbUhhbmRsZXIuYnJvd3NlclxyXG4gKlxyXG4gKiBJZiBkZWxldGUgYmVsb3cgY29tbWVudCwgd2UgY2FuIHNlZSB0aGlzIGVycm9yIG1lc3NhZ2U6XHJcbiAqICBNZXRhZGF0YSBjb2xsZWN0ZWQgY29udGFpbnMgYW4gZXJyb3IgdGhhdCB3aWxsIGJlIHJlcG9ydGVkIGF0IHJ1bnRpbWU6XHJcbiAqICBPbmx5IGluaXRpYWxpemVkIHZhcmlhYmxlcyBhbmQgY29uc3RhbnRzIGNhbiBiZSByZWZlcmVuY2VkXHJcbiAqICBiZWNhdXNlIHRoZSB2YWx1ZSBvZiB0aGlzIHZhcmlhYmxlIGlzIG5lZWRlZCBieSB0aGUgdGVtcGxhdGUgY29tcGlsZXIuXHJcbiAqL1xyXG4vLyBAZHluYW1pY1xyXG5leHBvcnQgY2xhc3MgRG9tSGFuZGxlciB7XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyB6aW5kZXg6IG51bWJlciA9IDEwMDA7XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgY2FsY3VsYXRlZFNjcm9sbGJhcldpZHRoOiBudW1iZXIgPSBudWxsO1xyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIGNhbGN1bGF0ZWRTY3JvbGxiYXJIZWlnaHQ6IG51bWJlciA9IG51bGw7XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgYnJvd3NlcjogYW55O1xyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgYWRkQ2xhc3MoZWxlbWVudDogYW55LCBjbGFzc05hbWU6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIGlmIChlbGVtZW50LmNsYXNzTGlzdClcclxuICAgICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKGNsYXNzTmFtZSk7XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICBlbGVtZW50LmNsYXNzTmFtZSArPSAnICcgKyBjbGFzc05hbWU7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBhZGRNdWx0aXBsZUNsYXNzZXMoZWxlbWVudDogYW55LCBjbGFzc05hbWU6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgICAgIGlmIChlbGVtZW50LmNsYXNzTGlzdCkge1xyXG4gICAgICAgICAgICBsZXQgc3R5bGVzOiBzdHJpbmdbXSA9IGNsYXNzTmFtZS50cmltKCkuc3BsaXQoJyAnKTtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdHlsZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChzdHlsZXNbaV0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgbGV0IHN0eWxlczogc3RyaW5nW10gPSBjbGFzc05hbWUuc3BsaXQoJyAnKTtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdHlsZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NOYW1lICs9ICcgJyArIHN0eWxlc1tpXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIHJlbW92ZUNsYXNzKGVsZW1lbnQ6IGFueSwgY2xhc3NOYW1lOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgICAgICBpZiAoZWxlbWVudC5jbGFzc0xpc3QpXHJcbiAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShjbGFzc05hbWUpO1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICAgZWxlbWVudC5jbGFzc05hbWUgPSBlbGVtZW50LmNsYXNzTmFtZS5yZXBsYWNlKG5ldyBSZWdFeHAoJyhefFxcXFxiKScgKyBjbGFzc05hbWUuc3BsaXQoJyAnKS5qb2luKCd8JykgKyAnKFxcXFxifCQpJywgJ2dpJyksICcgJyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBoYXNDbGFzcyhlbGVtZW50OiBhbnksIGNsYXNzTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKGVsZW1lbnQuY2xhc3NMaXN0KVxyXG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoY2xhc3NOYW1lKTtcclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgUmVnRXhwKCcoXnwgKScgKyBjbGFzc05hbWUgKyAnKCB8JCknLCAnZ2knKS50ZXN0KGVsZW1lbnQuY2xhc3NOYW1lKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIHNpYmxpbmdzKGVsZW1lbnQ6IGFueSk6IGFueSB7XHJcbiAgICAgICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5maWx0ZXIuY2FsbChlbGVtZW50LnBhcmVudE5vZGUuY2hpbGRyZW4sIGZ1bmN0aW9uIChjaGlsZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gY2hpbGQgIT09IGVsZW1lbnQ7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBmaW5kKGVsZW1lbnQ6IGFueSwgc2VsZWN0b3I6IHN0cmluZyk6IGFueVtdIHtcclxuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbShlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGZpbmRTaW5nbGUoZWxlbWVudDogYW55LCBzZWxlY3Rvcjogc3RyaW5nKTogYW55IHtcclxuICAgICAgICBpZiAoZWxlbWVudCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBpbmRleChlbGVtZW50OiBhbnkpOiBudW1iZXIge1xyXG4gICAgICAgIGxldCBjaGlsZHJlbiA9IGVsZW1lbnQucGFyZW50Tm9kZS5jaGlsZE5vZGVzO1xyXG4gICAgICAgIGxldCBudW0gPSAwO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKGNoaWxkcmVuW2ldID09IGVsZW1lbnQpIHJldHVybiBudW07XHJcbiAgICAgICAgICAgIGlmIChjaGlsZHJlbltpXS5ub2RlVHlwZSA9PSAxKSBudW0rKztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgaW5kZXhXaXRoaW5Hcm91cChlbGVtZW50OiBhbnksIGF0dHJpYnV0ZU5hbWU6IHN0cmluZyk6IG51bWJlciB7XHJcbiAgICAgICAgbGV0IGNoaWxkcmVuID0gZWxlbWVudC5wYXJlbnROb2RlID8gZWxlbWVudC5wYXJlbnROb2RlLmNoaWxkTm9kZXMgOiBbXTtcclxuICAgICAgICBsZXQgbnVtID0gMDtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChjaGlsZHJlbltpXSA9PSBlbGVtZW50KSByZXR1cm4gbnVtO1xyXG4gICAgICAgICAgICBpZiAoY2hpbGRyZW5baV0uYXR0cmlidXRlcyAmJiBjaGlsZHJlbltpXS5hdHRyaWJ1dGVzW2F0dHJpYnV0ZU5hbWVdICYmIGNoaWxkcmVuW2ldLm5vZGVUeXBlID09IDEpIG51bSsrO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gLTE7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyByZWxhdGl2ZVBvc2l0aW9uKGVsZW1lbnQ6IGFueSwgdGFyZ2V0OiBhbnkpOiB2b2lkIHtcclxuICAgICAgICBsZXQgZWxlbWVudERpbWVuc2lvbnMgPSBlbGVtZW50Lm9mZnNldFBhcmVudCA/IHsgd2lkdGg6IGVsZW1lbnQub2Zmc2V0V2lkdGgsIGhlaWdodDogZWxlbWVudC5vZmZzZXRIZWlnaHQgfSA6IHRoaXMuZ2V0SGlkZGVuRWxlbWVudERpbWVuc2lvbnMoZWxlbWVudCk7XHJcbiAgICAgICAgY29uc3QgdGFyZ2V0SGVpZ2h0ID0gdGFyZ2V0Lm9mZnNldEhlaWdodDtcclxuICAgICAgICBjb25zdCB0YXJnZXRPZmZzZXQgPSB0YXJnZXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcbiAgICAgICAgY29uc3Qgdmlld3BvcnQgPSB0aGlzLmdldFZpZXdwb3J0KCk7XHJcbiAgICAgICAgbGV0IHRvcDogbnVtYmVyLCBsZWZ0OiBudW1iZXI7XHJcblxyXG4gICAgICAgIGlmICgodGFyZ2V0T2Zmc2V0LnRvcCArIHRhcmdldEhlaWdodCArIGVsZW1lbnREaW1lbnNpb25zLmhlaWdodCkgPiB2aWV3cG9ydC5oZWlnaHQpIHtcclxuICAgICAgICAgICAgdG9wID0gLTEgKiAoZWxlbWVudERpbWVuc2lvbnMuaGVpZ2h0KTtcclxuICAgICAgICAgICAgZWxlbWVudC5zdHlsZS50cmFuc2Zvcm1PcmlnaW4gPSAnYm90dG9tJztcclxuICAgICAgICAgICAgaWYgKHRhcmdldE9mZnNldC50b3AgKyB0b3AgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICB0b3AgPSAtMSAqIHRhcmdldE9mZnNldC50b3A7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRvcCA9IHRhcmdldEhlaWdodDtcclxuICAgICAgICAgICAgZWxlbWVudC5zdHlsZS50cmFuc2Zvcm1PcmlnaW4gPSAndG9wJztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChlbGVtZW50RGltZW5zaW9ucy53aWR0aCA+IHZpZXdwb3J0LndpZHRoKSB7XHJcbiAgICAgICAgICAgIC8vIGVsZW1lbnQgd2lkZXIgdGhlbiB2aWV3cG9ydCBhbmQgY2Fubm90IGZpdCBvbiBzY3JlZW4gKGFsaWduIGF0IGxlZnQgc2lkZSBvZiB2aWV3cG9ydClcclxuICAgICAgICAgICAgbGVmdCA9IHRhcmdldE9mZnNldC5sZWZ0ICogLTE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2UgaWYgKCh0YXJnZXRPZmZzZXQubGVmdCArIGVsZW1lbnREaW1lbnNpb25zLndpZHRoKSA+IHZpZXdwb3J0LndpZHRoKSB7XHJcbiAgICAgICAgICAgIC8vIGVsZW1lbnQgd2lkZXIgdGhlbiB2aWV3cG9ydCBidXQgY2FuIGJlIGZpdCBvbiBzY3JlZW4gKGFsaWduIGF0IHJpZ2h0IHNpZGUgb2Ygdmlld3BvcnQpXHJcbiAgICAgICAgICAgIGxlZnQgPSAodGFyZ2V0T2Zmc2V0LmxlZnQgKyBlbGVtZW50RGltZW5zaW9ucy53aWR0aCAtIHZpZXdwb3J0LndpZHRoKSAqIC0xO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgLy8gZWxlbWVudCBmaXRzIG9uIHNjcmVlbiAoYWxpZ24gd2l0aCB0YXJnZXQpXHJcbiAgICAgICAgICAgIGxlZnQgPSAwO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZWxlbWVudC5zdHlsZS50b3AgPSB0b3AgKyAncHgnO1xyXG4gICAgICAgIGVsZW1lbnQuc3R5bGUubGVmdCA9IGxlZnQgKyAncHgnO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgYWJzb2x1dGVQb3NpdGlvbihlbGVtZW50OiBhbnksIHRhcmdldDogYW55KTogdm9pZCB7XHJcbiAgICAgICAgbGV0IGVsZW1lbnREaW1lbnNpb25zID0gZWxlbWVudC5vZmZzZXRQYXJlbnQgPyB7IHdpZHRoOiBlbGVtZW50Lm9mZnNldFdpZHRoLCBoZWlnaHQ6IGVsZW1lbnQub2Zmc2V0SGVpZ2h0IH0gOiB0aGlzLmdldEhpZGRlbkVsZW1lbnREaW1lbnNpb25zKGVsZW1lbnQpO1xyXG4gICAgICAgIGxldCBlbGVtZW50T3V0ZXJIZWlnaHQgPSBlbGVtZW50RGltZW5zaW9ucy5oZWlnaHQ7XHJcbiAgICAgICAgbGV0IGVsZW1lbnRPdXRlcldpZHRoID0gZWxlbWVudERpbWVuc2lvbnMud2lkdGg7XHJcbiAgICAgICAgbGV0IHRhcmdldE91dGVySGVpZ2h0ID0gdGFyZ2V0Lm9mZnNldEhlaWdodDtcclxuICAgICAgICBsZXQgdGFyZ2V0T3V0ZXJXaWR0aCA9IHRhcmdldC5vZmZzZXRXaWR0aDtcclxuICAgICAgICBsZXQgdGFyZ2V0T2Zmc2V0ID0gdGFyZ2V0LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgIGxldCB3aW5kb3dTY3JvbGxUb3AgPSB0aGlzLmdldFdpbmRvd1Njcm9sbFRvcCgpO1xyXG4gICAgICAgIGxldCB3aW5kb3dTY3JvbGxMZWZ0ID0gdGhpcy5nZXRXaW5kb3dTY3JvbGxMZWZ0KCk7XHJcbiAgICAgICAgbGV0IHZpZXdwb3J0ID0gdGhpcy5nZXRWaWV3cG9ydCgpO1xyXG4gICAgICAgIGxldCB0b3AsIGxlZnQ7XHJcblxyXG4gICAgICAgIGlmICh0YXJnZXRPZmZzZXQudG9wICsgdGFyZ2V0T3V0ZXJIZWlnaHQgKyBlbGVtZW50T3V0ZXJIZWlnaHQgPiB2aWV3cG9ydC5oZWlnaHQpIHtcclxuICAgICAgICAgICAgdG9wID0gdGFyZ2V0T2Zmc2V0LnRvcCArIHdpbmRvd1Njcm9sbFRvcCAtIGVsZW1lbnRPdXRlckhlaWdodDtcclxuICAgICAgICAgICAgZWxlbWVudC5zdHlsZS50cmFuc2Zvcm1PcmlnaW4gPSAnYm90dG9tJztcclxuXHJcbiAgICAgICAgICAgIGlmICh0b3AgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICB0b3AgPSB3aW5kb3dTY3JvbGxUb3A7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRvcCA9IHRhcmdldE91dGVySGVpZ2h0ICsgdGFyZ2V0T2Zmc2V0LnRvcCArIHdpbmRvd1Njcm9sbFRvcDtcclxuICAgICAgICAgICAgZWxlbWVudC5zdHlsZS50cmFuc2Zvcm1PcmlnaW4gPSAndG9wJztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0YXJnZXRPZmZzZXQubGVmdCArIGVsZW1lbnRPdXRlcldpZHRoID4gdmlld3BvcnQud2lkdGgpXHJcbiAgICAgICAgICAgIGxlZnQgPSBNYXRoLm1heCgwLCB0YXJnZXRPZmZzZXQubGVmdCArIHdpbmRvd1Njcm9sbExlZnQgKyB0YXJnZXRPdXRlcldpZHRoIC0gZWxlbWVudE91dGVyV2lkdGgpO1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICAgbGVmdCA9IHRhcmdldE9mZnNldC5sZWZ0ICsgd2luZG93U2Nyb2xsTGVmdDtcclxuXHJcbiAgICAgICAgZWxlbWVudC5zdHlsZS50b3AgPSB0b3AgKyAncHgnO1xyXG4gICAgICAgIGVsZW1lbnQuc3R5bGUubGVmdCA9IGxlZnQgKyAncHgnO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBnZXRQYXJlbnRzKGVsZW1lbnQ6IGFueSwgcGFyZW50czphbnkgPSBbXSk6IGFueSB7XHJcbiAgICAgICAgcmV0dXJuIGVsZW1lbnRbJ3BhcmVudE5vZGUnXSA9PT0gbnVsbCA/IHBhcmVudHMgOiB0aGlzLmdldFBhcmVudHMoZWxlbWVudC5wYXJlbnROb2RlLCBwYXJlbnRzLmNvbmNhdChbZWxlbWVudC5wYXJlbnROb2RlXSkpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBnZXRTY3JvbGxhYmxlUGFyZW50cyhlbGVtZW50OiBhbnkpIHtcclxuICAgICAgICBsZXQgc2Nyb2xsYWJsZVBhcmVudHMgPSBbXTtcclxuXHJcbiAgICAgICAgaWYgKGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgbGV0IHBhcmVudHMgPSB0aGlzLmdldFBhcmVudHMoZWxlbWVudCk7XHJcbiAgICAgICAgICAgIGNvbnN0IG92ZXJmbG93UmVnZXggPSAvKGF1dG98c2Nyb2xsKS87XHJcbiAgICAgICAgICAgIGNvbnN0IG92ZXJmbG93Q2hlY2sgPSAobm9kZTogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBsZXQgc3R5bGVEZWNsYXJhdGlvbiA9IHdpbmRvd1snZ2V0Q29tcHV0ZWRTdHlsZSddKG5vZGUsIG51bGwpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG92ZXJmbG93UmVnZXgudGVzdChzdHlsZURlY2xhcmF0aW9uLmdldFByb3BlcnR5VmFsdWUoJ292ZXJmbG93JykpIHx8IG92ZXJmbG93UmVnZXgudGVzdChzdHlsZURlY2xhcmF0aW9uLmdldFByb3BlcnR5VmFsdWUoJ292ZXJmbG93WCcpKSB8fCBvdmVyZmxvd1JlZ2V4LnRlc3Qoc3R5bGVEZWNsYXJhdGlvbi5nZXRQcm9wZXJ0eVZhbHVlKCdvdmVyZmxvd1knKSk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxldCBwYXJlbnQgb2YgcGFyZW50cykge1xyXG4gICAgICAgICAgICAgICAgbGV0IHNjcm9sbFNlbGVjdG9ycyA9IHBhcmVudC5ub2RlVHlwZSA9PT0gMSAmJiBwYXJlbnQuZGF0YXNldFsnc2Nyb2xsc2VsZWN0b3JzJ107XHJcbiAgICAgICAgICAgICAgICBpZiAoc2Nyb2xsU2VsZWN0b3JzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNlbGVjdG9ycyA9IHNjcm9sbFNlbGVjdG9ycy5zcGxpdCgnLCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IHNlbGVjdG9yIG9mIHNlbGVjdG9ycykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZWwgPSB0aGlzLmZpbmRTaW5nbGUocGFyZW50LCBzZWxlY3Rvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbCAmJiBvdmVyZmxvd0NoZWNrKGVsKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2Nyb2xsYWJsZVBhcmVudHMucHVzaChlbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHBhcmVudC5ub2RlVHlwZSAhPT0gOSAmJiBvdmVyZmxvd0NoZWNrKHBhcmVudCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBzY3JvbGxhYmxlUGFyZW50cy5wdXNoKHBhcmVudCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBzY3JvbGxhYmxlUGFyZW50cztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGdldEhpZGRlbkVsZW1lbnRPdXRlckhlaWdodChlbGVtZW50OiBhbnkpOiBudW1iZXIge1xyXG4gICAgICAgIGVsZW1lbnQuc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nO1xyXG4gICAgICAgIGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XHJcbiAgICAgICAgbGV0IGVsZW1lbnRIZWlnaHQgPSBlbGVtZW50Lm9mZnNldEhlaWdodDtcclxuICAgICAgICBlbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgZWxlbWVudC5zdHlsZS52aXNpYmlsaXR5ID0gJ3Zpc2libGUnO1xyXG5cclxuICAgICAgICByZXR1cm4gZWxlbWVudEhlaWdodDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGdldEhpZGRlbkVsZW1lbnRPdXRlcldpZHRoKGVsZW1lbnQ6IGFueSk6IG51bWJlciB7XHJcbiAgICAgICAgZWxlbWVudC5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbic7XHJcbiAgICAgICAgZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuICAgICAgICBsZXQgZWxlbWVudFdpZHRoID0gZWxlbWVudC5vZmZzZXRXaWR0aDtcclxuICAgICAgICBlbGVtZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XHJcbiAgICAgICAgZWxlbWVudC5zdHlsZS52aXNpYmlsaXR5ID0gJ3Zpc2libGUnO1xyXG5cclxuICAgICAgICByZXR1cm4gZWxlbWVudFdpZHRoO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0SGlkZGVuRWxlbWVudERpbWVuc2lvbnMoZWxlbWVudDogYW55KTogYW55IHtcclxuICAgICAgICBsZXQgZGltZW5zaW9uczogYW55ID0ge307XHJcbiAgICAgICAgZWxlbWVudC5zdHlsZS52aXNpYmlsaXR5ID0gJ2hpZGRlbic7XHJcbiAgICAgICAgZWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcclxuICAgICAgICBkaW1lbnNpb25zLndpZHRoID0gZWxlbWVudC5vZmZzZXRXaWR0aDtcclxuICAgICAgICBkaW1lbnNpb25zLmhlaWdodCA9IGVsZW1lbnQub2Zmc2V0SGVpZ2h0O1xyXG4gICAgICAgIGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgICAgICBlbGVtZW50LnN0eWxlLnZpc2liaWxpdHkgPSAndmlzaWJsZSc7XHJcblxyXG4gICAgICAgIHJldHVybiBkaW1lbnNpb25zO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgc2Nyb2xsSW5WaWV3KGNvbnRhaW5lciwgaXRlbSkge1xyXG4gICAgICAgIGxldCBib3JkZXJUb3BWYWx1ZTogc3RyaW5nID0gZ2V0Q29tcHV0ZWRTdHlsZShjb250YWluZXIpLmdldFByb3BlcnR5VmFsdWUoJ2JvcmRlclRvcFdpZHRoJyk7XHJcbiAgICAgICAgbGV0IGJvcmRlclRvcDogbnVtYmVyID0gYm9yZGVyVG9wVmFsdWUgPyBwYXJzZUZsb2F0KGJvcmRlclRvcFZhbHVlKSA6IDA7XHJcbiAgICAgICAgbGV0IHBhZGRpbmdUb3BWYWx1ZTogc3RyaW5nID0gZ2V0Q29tcHV0ZWRTdHlsZShjb250YWluZXIpLmdldFByb3BlcnR5VmFsdWUoJ3BhZGRpbmdUb3AnKTtcclxuICAgICAgICBsZXQgcGFkZGluZ1RvcDogbnVtYmVyID0gcGFkZGluZ1RvcFZhbHVlID8gcGFyc2VGbG9hdChwYWRkaW5nVG9wVmFsdWUpIDogMDtcclxuICAgICAgICBsZXQgY29udGFpbmVyUmVjdCA9IGNvbnRhaW5lci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuICAgICAgICBsZXQgaXRlbVJlY3QgPSBpdGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xyXG4gICAgICAgIGxldCBvZmZzZXQgPSAoaXRlbVJlY3QudG9wICsgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3ApIC0gKGNvbnRhaW5lclJlY3QudG9wICsgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3ApIC0gYm9yZGVyVG9wIC0gcGFkZGluZ1RvcDtcclxuICAgICAgICBsZXQgc2Nyb2xsID0gY29udGFpbmVyLnNjcm9sbFRvcDtcclxuICAgICAgICBsZXQgZWxlbWVudEhlaWdodCA9IGNvbnRhaW5lci5jbGllbnRIZWlnaHQ7XHJcbiAgICAgICAgbGV0IGl0ZW1IZWlnaHQgPSB0aGlzLmdldE91dGVySGVpZ2h0KGl0ZW0pO1xyXG5cclxuICAgICAgICBpZiAob2Zmc2V0IDwgMCkge1xyXG4gICAgICAgICAgICBjb250YWluZXIuc2Nyb2xsVG9wID0gc2Nyb2xsICsgb2Zmc2V0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmICgob2Zmc2V0ICsgaXRlbUhlaWdodCkgPiBlbGVtZW50SGVpZ2h0KSB7XHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5zY3JvbGxUb3AgPSBzY3JvbGwgKyBvZmZzZXQgLSBlbGVtZW50SGVpZ2h0ICsgaXRlbUhlaWdodDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBmYWRlSW4oZWxlbWVudCwgZHVyYXRpb246IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAgIGVsZW1lbnQuc3R5bGUub3BhY2l0eSA9IDA7XHJcblxyXG4gICAgICAgIGxldCBsYXN0ID0gK25ldyBEYXRlKCk7XHJcbiAgICAgICAgbGV0IG9wYWNpdHkgPSAwO1xyXG4gICAgICAgIGxldCB0aWNrID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBvcGFjaXR5ID0gK2VsZW1lbnQuc3R5bGUub3BhY2l0eS5yZXBsYWNlKFwiLFwiLCBcIi5cIikgKyAobmV3IERhdGUoKS5nZXRUaW1lKCkgLSBsYXN0KSAvIGR1cmF0aW9uO1xyXG4gICAgICAgICAgICBlbGVtZW50LnN0eWxlLm9wYWNpdHkgPSBvcGFjaXR5O1xyXG4gICAgICAgICAgICBsYXN0ID0gK25ldyBEYXRlKCk7XHJcblxyXG4gICAgICAgICAgICBpZiAoK29wYWNpdHkgPCAxKSB7XHJcbiAgICAgICAgICAgICAgICAod2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSAmJiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGljaykpIHx8IHNldFRpbWVvdXQodGljaywgMTYpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGljaygpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgZmFkZU91dChlbGVtZW50LCBtcykge1xyXG4gICAgICAgIHZhciBvcGFjaXR5ID0gMSxcclxuICAgICAgICAgICAgaW50ZXJ2YWwgPSA1MCxcclxuICAgICAgICAgICAgZHVyYXRpb24gPSBtcyxcclxuICAgICAgICAgICAgZ2FwID0gaW50ZXJ2YWwgLyBkdXJhdGlvbjtcclxuXHJcbiAgICAgICAgbGV0IGZhZGluZyA9IHNldEludGVydmFsKCgpID0+IHtcclxuICAgICAgICAgICAgb3BhY2l0eSA9IG9wYWNpdHkgLSBnYXA7XHJcblxyXG4gICAgICAgICAgICBpZiAob3BhY2l0eSA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBvcGFjaXR5ID0gMDtcclxuICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoZmFkaW5nKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZWxlbWVudC5zdHlsZS5vcGFjaXR5ID0gb3BhY2l0eTtcclxuICAgICAgICB9LCBpbnRlcnZhbCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBnZXRXaW5kb3dTY3JvbGxUb3AoKTogbnVtYmVyIHtcclxuICAgICAgICBsZXQgZG9jID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xyXG4gICAgICAgIHJldHVybiAod2luZG93LnBhZ2VZT2Zmc2V0IHx8IGRvYy5zY3JvbGxUb3ApIC0gKGRvYy5jbGllbnRUb3AgfHwgMCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBnZXRXaW5kb3dTY3JvbGxMZWZ0KCk6IG51bWJlciB7XHJcbiAgICAgICAgbGV0IGRvYyA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcclxuICAgICAgICByZXR1cm4gKHdpbmRvdy5wYWdlWE9mZnNldCB8fCBkb2Muc2Nyb2xsTGVmdCkgLSAoZG9jLmNsaWVudExlZnQgfHwgMCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBtYXRjaGVzKGVsZW1lbnQsIHNlbGVjdG9yOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgICAgICB2YXIgcCA9IEVsZW1lbnQucHJvdG90eXBlO1xyXG4gICAgICAgIHZhciBmID0gcFsnbWF0Y2hlcyddIHx8IHAud2Via2l0TWF0Y2hlc1NlbGVjdG9yIHx8IHBbJ21vek1hdGNoZXNTZWxlY3RvciddIHx8IHBbJ21zTWF0Y2hlc1NlbGVjdG9yJ10gfHwgZnVuY3Rpb24gKHMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFtdLmluZGV4T2YuY2FsbChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHMpLCB0aGlzKSAhPT0gLTE7XHJcbiAgICAgICAgfTtcclxuICAgICAgICByZXR1cm4gZi5jYWxsKGVsZW1lbnQsIHNlbGVjdG9yKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGdldE91dGVyV2lkdGgoZWwsIG1hcmdpbj8pIHtcclxuICAgICAgICBsZXQgd2lkdGggPSBlbC5vZmZzZXRXaWR0aDtcclxuXHJcbiAgICAgICAgaWYgKG1hcmdpbikge1xyXG4gICAgICAgICAgICBsZXQgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKGVsKTtcclxuICAgICAgICAgICAgd2lkdGggKz0gcGFyc2VGbG9hdChzdHlsZS5tYXJnaW5MZWZ0KSArIHBhcnNlRmxvYXQoc3R5bGUubWFyZ2luUmlnaHQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHdpZHRoO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0SG9yaXpvbnRhbFBhZGRpbmcoZWwpIHtcclxuICAgICAgICBsZXQgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKGVsKTtcclxuICAgICAgICByZXR1cm4gcGFyc2VGbG9hdChzdHlsZS5wYWRkaW5nTGVmdCkgKyBwYXJzZUZsb2F0KHN0eWxlLnBhZGRpbmdSaWdodCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBnZXRIb3Jpem9udGFsTWFyZ2luKGVsKSB7XHJcbiAgICAgICAgbGV0IHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShlbCk7XHJcbiAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoc3R5bGUubWFyZ2luTGVmdCkgKyBwYXJzZUZsb2F0KHN0eWxlLm1hcmdpblJpZ2h0KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGlubmVyV2lkdGgoZWwpIHtcclxuICAgICAgICBsZXQgd2lkdGggPSBlbC5vZmZzZXRXaWR0aDtcclxuICAgICAgICBsZXQgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKGVsKTtcclxuXHJcbiAgICAgICAgd2lkdGggKz0gcGFyc2VGbG9hdChzdHlsZS5wYWRkaW5nTGVmdCkgKyBwYXJzZUZsb2F0KHN0eWxlLnBhZGRpbmdSaWdodCk7XHJcbiAgICAgICAgcmV0dXJuIHdpZHRoO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgd2lkdGgoZWwpIHtcclxuICAgICAgICBsZXQgd2lkdGggPSBlbC5vZmZzZXRXaWR0aDtcclxuICAgICAgICBsZXQgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKGVsKTtcclxuXHJcbiAgICAgICAgd2lkdGggLT0gcGFyc2VGbG9hdChzdHlsZS5wYWRkaW5nTGVmdCkgKyBwYXJzZUZsb2F0KHN0eWxlLnBhZGRpbmdSaWdodCk7XHJcbiAgICAgICAgcmV0dXJuIHdpZHRoO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0SW5uZXJIZWlnaHQoZWwpIHtcclxuICAgICAgICBsZXQgaGVpZ2h0ID0gZWwub2Zmc2V0SGVpZ2h0O1xyXG4gICAgICAgIGxldCBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoZWwpO1xyXG5cclxuICAgICAgICBoZWlnaHQgKz0gcGFyc2VGbG9hdChzdHlsZS5wYWRkaW5nVG9wKSArIHBhcnNlRmxvYXQoc3R5bGUucGFkZGluZ0JvdHRvbSk7XHJcbiAgICAgICAgcmV0dXJuIGhlaWdodDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGdldE91dGVySGVpZ2h0KGVsLCBtYXJnaW4/KSB7XHJcbiAgICAgICAgbGV0IGhlaWdodCA9IGVsLm9mZnNldEhlaWdodDtcclxuXHJcbiAgICAgICAgaWYgKG1hcmdpbikge1xyXG4gICAgICAgICAgICBsZXQgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKGVsKTtcclxuICAgICAgICAgICAgaGVpZ2h0ICs9IHBhcnNlRmxvYXQoc3R5bGUubWFyZ2luVG9wKSArIHBhcnNlRmxvYXQoc3R5bGUubWFyZ2luQm90dG9tKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBoZWlnaHQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBnZXRIZWlnaHQoZWwpOiBudW1iZXIge1xyXG4gICAgICAgIGxldCBoZWlnaHQgPSBlbC5vZmZzZXRIZWlnaHQ7XHJcbiAgICAgICAgbGV0IHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShlbCk7XHJcblxyXG4gICAgICAgIGhlaWdodCAtPSBwYXJzZUZsb2F0KHN0eWxlLnBhZGRpbmdUb3ApICsgcGFyc2VGbG9hdChzdHlsZS5wYWRkaW5nQm90dG9tKSArIHBhcnNlRmxvYXQoc3R5bGUuYm9yZGVyVG9wV2lkdGgpICsgcGFyc2VGbG9hdChzdHlsZS5ib3JkZXJCb3R0b21XaWR0aCk7XHJcblxyXG4gICAgICAgIHJldHVybiBoZWlnaHQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBnZXRXaWR0aChlbCk6IG51bWJlciB7XHJcbiAgICAgICAgbGV0IHdpZHRoID0gZWwub2Zmc2V0V2lkdGg7XHJcbiAgICAgICAgbGV0IHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShlbCk7XHJcblxyXG4gICAgICAgIHdpZHRoIC09IHBhcnNlRmxvYXQoc3R5bGUucGFkZGluZ0xlZnQpICsgcGFyc2VGbG9hdChzdHlsZS5wYWRkaW5nUmlnaHQpICsgcGFyc2VGbG9hdChzdHlsZS5ib3JkZXJMZWZ0V2lkdGgpICsgcGFyc2VGbG9hdChzdHlsZS5ib3JkZXJSaWdodFdpZHRoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHdpZHRoO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0Vmlld3BvcnQoKTogYW55IHtcclxuICAgICAgICBsZXQgd2luID0gd2luZG93LFxyXG4gICAgICAgICAgICBkID0gZG9jdW1lbnQsXHJcbiAgICAgICAgICAgIGUgPSBkLmRvY3VtZW50RWxlbWVudCxcclxuICAgICAgICAgICAgZyA9IGQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2JvZHknKVswXSxcclxuICAgICAgICAgICAgdyA9IHdpbi5pbm5lcldpZHRoIHx8IGUuY2xpZW50V2lkdGggfHwgZy5jbGllbnRXaWR0aCxcclxuICAgICAgICAgICAgaCA9IHdpbi5pbm5lckhlaWdodCB8fCBlLmNsaWVudEhlaWdodCB8fCBnLmNsaWVudEhlaWdodDtcclxuXHJcbiAgICAgICAgcmV0dXJuIHsgd2lkdGg6IHcsIGhlaWdodDogaCB9O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0T2Zmc2V0KGVsKSB7XHJcbiAgICAgICAgdmFyIHJlY3QgPSBlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgdG9wOiByZWN0LnRvcCArICh3aW5kb3cucGFnZVlPZmZzZXQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCB8fCBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCB8fCAwKSxcclxuICAgICAgICAgICAgbGVmdDogcmVjdC5sZWZ0ICsgKHdpbmRvdy5wYWdlWE9mZnNldCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsTGVmdCB8fCBkb2N1bWVudC5ib2R5LnNjcm9sbExlZnQgfHwgMCksXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIHJlcGxhY2VFbGVtZW50V2l0aChlbGVtZW50OiBhbnksIHJlcGxhY2VtZW50RWxlbWVudDogYW55KTogYW55IHtcclxuICAgICAgICBsZXQgcGFyZW50Tm9kZSA9IGVsZW1lbnQucGFyZW50Tm9kZTtcclxuICAgICAgICBpZiAoIXBhcmVudE5vZGUpXHJcbiAgICAgICAgICAgIHRocm93IGBDYW4ndCByZXBsYWNlIGVsZW1lbnRgO1xyXG4gICAgICAgIHJldHVybiBwYXJlbnROb2RlLnJlcGxhY2VDaGlsZChyZXBsYWNlbWVudEVsZW1lbnQsIGVsZW1lbnQpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0VXNlckFnZW50KCk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIG5hdmlnYXRvci51c2VyQWdlbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyAgaXNJRSgpIHtcclxuICAgICAgICB2YXIgdWEgPSB3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudDtcclxuXHJcbiAgICAgICAgdmFyIG1zaWUgPSB1YS5pbmRleE9mKCdNU0lFICcpO1xyXG4gICAgICAgIGlmIChtc2llID4gMCkge1xyXG4gICAgICAgICAgICAvLyBJRSAxMCBvciBvbGRlciA9PiByZXR1cm4gdmVyc2lvbiBudW1iZXJcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgdHJpZGVudCA9IHVhLmluZGV4T2YoJ1RyaWRlbnQvJyk7XHJcbiAgICAgICAgaWYgKHRyaWRlbnQgPiAwKSB7XHJcbiAgICAgICAgICAgIC8vIElFIDExID0+IHJldHVybiB2ZXJzaW9uIG51bWJlclxyXG4gICAgICAgICAgICB2YXIgcnYgPSB1YS5pbmRleE9mKCdydjonKTtcclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgZWRnZSA9IHVhLmluZGV4T2YoJ0VkZ2UvJyk7XHJcbiAgICAgICAgaWYgKGVkZ2UgPiAwKSB7XHJcbiAgICAgICAgICAgLy8gRWRnZSAoSUUgMTIrKSA9PiByZXR1cm4gdmVyc2lvbiBudW1iZXJcclxuICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIG90aGVyIGJyb3dzZXJcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBpc0lPUygpIHtcclxuICAgICAgICByZXR1cm4gL2lQYWR8aVBob25lfGlQb2QvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkgJiYgIXdpbmRvd1snTVNTdHJlYW0nXTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGlzQW5kcm9pZCgpIHtcclxuICAgICAgICByZXR1cm4gLyhhbmRyb2lkKS9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBhcHBlbmRDaGlsZChlbGVtZW50OiBhbnksIHRhcmdldDogYW55KSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNFbGVtZW50KHRhcmdldCkpXHJcbiAgICAgICAgICAgIHRhcmdldC5hcHBlbmRDaGlsZChlbGVtZW50KTtcclxuICAgICAgICBlbHNlIGlmICh0YXJnZXQuZWwgJiYgdGFyZ2V0LmVsLm5hdGl2ZUVsZW1lbnQpXHJcbiAgICAgICAgICAgIHRhcmdldC5lbC5uYXRpdmVFbGVtZW50LmFwcGVuZENoaWxkKGVsZW1lbnQpO1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICAgdGhyb3cgJ0Nhbm5vdCBhcHBlbmQgJyArIHRhcmdldCArICcgdG8gJyArIGVsZW1lbnQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyByZW1vdmVDaGlsZChlbGVtZW50OiBhbnksIHRhcmdldDogYW55KSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNFbGVtZW50KHRhcmdldCkpXHJcbiAgICAgICAgICAgIHRhcmdldC5yZW1vdmVDaGlsZChlbGVtZW50KTtcclxuICAgICAgICBlbHNlIGlmICh0YXJnZXQuZWwgJiYgdGFyZ2V0LmVsLm5hdGl2ZUVsZW1lbnQpXHJcbiAgICAgICAgICAgIHRhcmdldC5lbC5uYXRpdmVFbGVtZW50LnJlbW92ZUNoaWxkKGVsZW1lbnQpO1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICAgdGhyb3cgJ0Nhbm5vdCByZW1vdmUgJyArIGVsZW1lbnQgKyAnIGZyb20gJyArIHRhcmdldDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIHJlbW92ZUVsZW1lbnQoZWxlbWVudDogRWxlbWVudCkge1xyXG4gICAgICAgIGlmICghKCdyZW1vdmUnIGluIEVsZW1lbnQucHJvdG90eXBlKSlcclxuICAgICAgICAgICAgZWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGVsZW1lbnQpO1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgICAgZWxlbWVudC5yZW1vdmUoKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGlzRWxlbWVudChvYmo6IGFueSkge1xyXG4gICAgICAgIHJldHVybiAodHlwZW9mIEhUTUxFbGVtZW50ID09PSBcIm9iamVjdFwiID8gb2JqIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQgOlxyXG4gICAgICAgICAgICBvYmogJiYgdHlwZW9mIG9iaiA9PT0gXCJvYmplY3RcIiAmJiBvYmogIT09IG51bGwgJiYgb2JqLm5vZGVUeXBlID09PSAxICYmIHR5cGVvZiBvYmoubm9kZU5hbWUgPT09IFwic3RyaW5nXCJcclxuICAgICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgY2FsY3VsYXRlU2Nyb2xsYmFyV2lkdGgoZWw/OiBIVE1MRWxlbWVudCk6IG51bWJlciB7XHJcbiAgICAgICAgaWYgKGVsKSB7XHJcbiAgICAgICAgICAgIGxldCBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoZWwpO1xyXG4gICAgICAgICAgICByZXR1cm4gKGVsLm9mZnNldFdpZHRoIC0gZWwuY2xpZW50V2lkdGggLSBwYXJzZUZsb2F0KHN0eWxlLmJvcmRlckxlZnRXaWR0aCkgLSBwYXJzZUZsb2F0KHN0eWxlLmJvcmRlclJpZ2h0V2lkdGgpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmNhbGN1bGF0ZWRTY3JvbGxiYXJXaWR0aCAhPT0gbnVsbClcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNhbGN1bGF0ZWRTY3JvbGxiYXJXaWR0aDtcclxuXHJcbiAgICAgICAgICAgIGxldCBzY3JvbGxEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgICAgICAgICBzY3JvbGxEaXYuY2xhc3NOYW1lID0gXCJwLXNjcm9sbGJhci1tZWFzdXJlXCI7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc2Nyb2xsRGl2KTtcclxuXHJcbiAgICAgICAgICAgIGxldCBzY3JvbGxiYXJXaWR0aCA9IHNjcm9sbERpdi5vZmZzZXRXaWR0aCAtIHNjcm9sbERpdi5jbGllbnRXaWR0aDtcclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChzY3JvbGxEaXYpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jYWxjdWxhdGVkU2Nyb2xsYmFyV2lkdGggPSBzY3JvbGxiYXJXaWR0aDtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzY3JvbGxiYXJXaWR0aDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBjYWxjdWxhdGVTY3JvbGxiYXJIZWlnaHQoKTogbnVtYmVyIHtcclxuICAgICAgICBpZiAodGhpcy5jYWxjdWxhdGVkU2Nyb2xsYmFySGVpZ2h0ICE9PSBudWxsKVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jYWxjdWxhdGVkU2Nyb2xsYmFySGVpZ2h0O1xyXG5cclxuICAgICAgICBsZXQgc2Nyb2xsRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgICAgICBzY3JvbGxEaXYuY2xhc3NOYW1lID0gXCJwLXNjcm9sbGJhci1tZWFzdXJlXCI7XHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzY3JvbGxEaXYpO1xyXG5cclxuICAgICAgICBsZXQgc2Nyb2xsYmFySGVpZ2h0ID0gc2Nyb2xsRGl2Lm9mZnNldEhlaWdodCAtIHNjcm9sbERpdi5jbGllbnRIZWlnaHQ7XHJcbiAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChzY3JvbGxEaXYpO1xyXG5cclxuICAgICAgICB0aGlzLmNhbGN1bGF0ZWRTY3JvbGxiYXJXaWR0aCA9IHNjcm9sbGJhckhlaWdodDtcclxuXHJcbiAgICAgICAgcmV0dXJuIHNjcm9sbGJhckhlaWdodDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGludm9rZUVsZW1lbnRNZXRob2QoZWxlbWVudDogYW55LCBtZXRob2ROYW1lOiBzdHJpbmcsIGFyZ3M/OiBhbnlbXSk6IHZvaWQge1xyXG4gICAgICAgIChlbGVtZW50IGFzIGFueSlbbWV0aG9kTmFtZV0uYXBwbHkoZWxlbWVudCwgYXJncyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBjbGVhclNlbGVjdGlvbigpOiB2b2lkIHtcclxuICAgICAgICBpZiAod2luZG93LmdldFNlbGVjdGlvbikge1xyXG4gICAgICAgICAgICBpZiAod2luZG93LmdldFNlbGVjdGlvbigpLmVtcHR5KSB7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cuZ2V0U2VsZWN0aW9uKCkuZW1wdHkoKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh3aW5kb3cuZ2V0U2VsZWN0aW9uKCkucmVtb3ZlQWxsUmFuZ2VzICYmIHdpbmRvdy5nZXRTZWxlY3Rpb24oKS5yYW5nZUNvdW50ID4gMCAmJiB3aW5kb3cuZ2V0U2VsZWN0aW9uKCkuZ2V0UmFuZ2VBdCgwKS5nZXRDbGllbnRSZWN0cygpLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIHdpbmRvdy5nZXRTZWxlY3Rpb24oKS5yZW1vdmVBbGxSYW5nZXMoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIGlmIChkb2N1bWVudFsnc2VsZWN0aW9uJ10gJiYgZG9jdW1lbnRbJ3NlbGVjdGlvbiddLmVtcHR5KSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudFsnc2VsZWN0aW9uJ10uZW1wdHkoKTtcclxuICAgICAgICAgICAgfSBjYXRjaChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgLy9pZ25vcmUgSUUgYnVnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBnZXRCcm93c2VyKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5icm93c2VyKSB7XHJcbiAgICAgICAgICAgIGxldCBtYXRjaGVkID0gdGhpcy5yZXNvbHZlVXNlckFnZW50KCk7XHJcbiAgICAgICAgICAgIHRoaXMuYnJvd3NlciA9IHt9O1xyXG5cclxuICAgICAgICAgICAgaWYgKG1hdGNoZWQuYnJvd3Nlcikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5icm93c2VyW21hdGNoZWQuYnJvd3Nlcl0gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5icm93c2VyWyd2ZXJzaW9uJ10gPSBtYXRjaGVkLnZlcnNpb247XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmJyb3dzZXJbJ2Nocm9tZSddKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJyb3dzZXJbJ3dlYmtpdCddID0gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLmJyb3dzZXJbJ3dlYmtpdCddKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJyb3dzZXJbJ3NhZmFyaSddID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMuYnJvd3NlcjtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIHJlc29sdmVVc2VyQWdlbnQoKSB7XHJcbiAgICAgICAgbGV0IHVhID0gbmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgIGxldCBtYXRjaCA9IC8oY2hyb21lKVsgXFwvXShbXFx3Ll0rKS8uZXhlYyh1YSkgfHxcclxuICAgICAgICAgICAgLyh3ZWJraXQpWyBcXC9dKFtcXHcuXSspLy5leGVjKHVhKSB8fFxyXG4gICAgICAgICAgICAvKG9wZXJhKSg/Oi4qdmVyc2lvbnwpWyBcXC9dKFtcXHcuXSspLy5leGVjKHVhKSB8fFxyXG4gICAgICAgICAgICAvKG1zaWUpIChbXFx3Ll0rKS8uZXhlYyh1YSkgfHxcclxuICAgICAgICAgICAgdWEuaW5kZXhPZihcImNvbXBhdGlibGVcIikgPCAwICYmIC8obW96aWxsYSkoPzouKj8gcnY6KFtcXHcuXSspfCkvLmV4ZWModWEpIHx8XHJcbiAgICAgICAgICAgIFtdO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBicm93c2VyOiBtYXRjaFsxXSB8fCBcIlwiLFxyXG4gICAgICAgICAgICB2ZXJzaW9uOiBtYXRjaFsyXSB8fCBcIjBcIlxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0YXRpYyBpc0ludGVnZXIodmFsdWUpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoTnVtYmVyLmlzSW50ZWdlcikge1xyXG4gICAgICAgICAgICByZXR1cm4gTnVtYmVyLmlzSW50ZWdlcih2YWx1ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSBcIm51bWJlclwiICYmIGlzRmluaXRlKHZhbHVlKSAmJiAgTWF0aC5mbG9vcih2YWx1ZSkgPT09IHZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc3RhdGljIGlzSGlkZGVuKGVsZW1lbnQ6IEhUTUxFbGVtZW50KTogYm9vbGVhbiB7XHJcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQub2Zmc2V0UGFyZW50ID09PSBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0Rm9jdXNhYmxlRWxlbWVudHMoZWxlbWVudDpIVE1MRWxlbWVudCkge1xyXG4gICAgICAgIGxldCBmb2N1c2FibGVFbGVtZW50cyA9IERvbUhhbmRsZXIuZmluZChlbGVtZW50LGBidXR0b246bm90KFt0YWJpbmRleCA9IFwiLTFcIl0pOm5vdChbZGlzYWJsZWRdKTpub3QoW3N0eWxlKj1cImRpc3BsYXk6bm9uZVwiXSk6bm90KFtoaWRkZW5dKSxcclxuICAgICAgICAgICAgICAgIFtocmVmXVtjbGllbnRIZWlnaHRdW2NsaWVudFdpZHRoXTpub3QoW3RhYmluZGV4ID0gXCItMVwiXSk6bm90KFtkaXNhYmxlZF0pOm5vdChbc3R5bGUqPVwiZGlzcGxheTpub25lXCJdKTpub3QoW2hpZGRlbl0pLFxyXG4gICAgICAgICAgICAgICAgaW5wdXQ6bm90KFt0YWJpbmRleCA9IFwiLTFcIl0pOm5vdChbZGlzYWJsZWRdKTpub3QoW3N0eWxlKj1cImRpc3BsYXk6bm9uZVwiXSk6bm90KFtoaWRkZW5dKSwgc2VsZWN0Om5vdChbdGFiaW5kZXggPSBcIi0xXCJdKTpub3QoW2Rpc2FibGVkXSk6bm90KFtzdHlsZSo9XCJkaXNwbGF5Om5vbmVcIl0pOm5vdChbaGlkZGVuXSksXHJcbiAgICAgICAgICAgICAgICB0ZXh0YXJlYTpub3QoW3RhYmluZGV4ID0gXCItMVwiXSk6bm90KFtkaXNhYmxlZF0pOm5vdChbc3R5bGUqPVwiZGlzcGxheTpub25lXCJdKTpub3QoW2hpZGRlbl0pLCBbdGFiSW5kZXhdOm5vdChbdGFiSW5kZXggPSBcIi0xXCJdKTpub3QoW2Rpc2FibGVkXSk6bm90KFtzdHlsZSo9XCJkaXNwbGF5Om5vbmVcIl0pOm5vdChbaGlkZGVuXSksXHJcbiAgICAgICAgICAgICAgICBbY29udGVudGVkaXRhYmxlXTpub3QoW3RhYkluZGV4ID0gXCItMVwiXSk6bm90KFtkaXNhYmxlZF0pOm5vdChbc3R5bGUqPVwiZGlzcGxheTpub25lXCJdKTpub3QoW2hpZGRlbl0pYFxyXG4gICAgICAgICAgICApO1xyXG5cclxuICAgICAgICAgICAgbGV0IHZpc2libGVGb2N1c2FibGVFbGVtZW50cyA9IFtdO1xyXG4gICAgICAgICAgICBmb3IobGV0IGZvY3VzYWJsZUVsZW1lbnQgb2YgZm9jdXNhYmxlRWxlbWVudHMpIHtcclxuICAgICAgICAgICAgICAgIGlmIChnZXRDb21wdXRlZFN0eWxlKGZvY3VzYWJsZUVsZW1lbnQpLmRpc3BsYXkgIT0gXCJub25lXCIgJiYgZ2V0Q29tcHV0ZWRTdHlsZShmb2N1c2FibGVFbGVtZW50KS52aXNpYmlsaXR5ICE9IFwiaGlkZGVuXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgdmlzaWJsZUZvY3VzYWJsZUVsZW1lbnRzLnB1c2goZm9jdXNhYmxlRWxlbWVudCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdmlzaWJsZUZvY3VzYWJsZUVsZW1lbnRzO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBnZW5lcmF0ZVpJbmRleCgpIHtcclxuICAgICAgICB0aGlzLnppbmRleCA9IHRoaXMuemluZGV4fHw5OTk7XHJcbiAgICAgICAgcmV0dXJuICsrdGhpcy56aW5kZXg7XHJcbiAgICB9XHJcbn1cclxuIl19