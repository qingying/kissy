KISSY.add('domlite/base/class', function (S, DOM) {
    var RE_SPLIT = /[\.\s]\s*\.?/;
    var NodeType = DOM.NodeType;

    function strToArray(str) {
        str = S.trim(str || '');
        var arr = str.split(RE_SPLIT),
            newArr = [], v,
            l = arr.length,
            i = 0;
        for (; i < l; i++) {
            if (v = arr[i]) {
                newArr.push(v);
            }
        }
        return newArr;
    }

    function batchClassList(method) {
        return function (selector, className) {
            DOM.query(selector).each(function (elem) {
                if (elem.nodeType == NodeType.ELEMENT_NODE) {
                    var classNames = strToArray(className);
                    for (var i = 0; i < classsNames.length; i++) {
                        elem.classList[method](cls);
                    }
                }
            });
        }
    }

    S.mix(DOM,
        {

            _hasClass:function (elem, classNames) {
                var i, l, className, classList = elem.classList;
                if (classList.length) {
                    for (i = 0, l = classNames.length; i < l; i++) {
                        className = classNames[i];
                        if (className && !classList.contains(className)) {
                            return false;
                        }
                    }
                    return true;
                }
                return false;
            },
            _addClass:batchClassList('add'),
            /**
            * Determine whether any of the matched elements are assigned the given classes.
            * @param {HTMLElement|String|HTMLElement[]} selector matched elements
            * @param {String} className One or more class names to search for.
            * multiple class names is separated by space
            * @return {Boolean}
            */
            hasClass:function (selector, className) {
                var elem = DOM.get(selector);
                return elem && elem.nodeType == NodeType.ELEMENT_NODE && DOM._hasClass(elem, strToArray(className));
            },
            /**
            * Adds the specified class(es) to each of the set of matched elements.
            * @param {HTMLElement|String|HTMLElement[]} selector matched elements
            * @param {String} className One or more class names to be added to the class attribute of each matched element.
            * multiple class names is separated by space
            */
            addClass:batchClassList('add'),
            /**
            * Remove a single class, multiple classes, or all classes from each element in the set of matched elements.
            * @param {HTMLElement|String|HTMLElement[]} selector matched elements
            * @param {String} className One or more class names to be removed from the class attribute of each matched element.
            * multiple class names is separated by space
            */
            removeClass:batchClassList('remove'),
            /**
            * Add or remove one or more classes from each element in the set of
            * matched elements, depending on either the class's presence or the
            * value of the switch argument.
            * @param {HTMLElement|String|HTMLElement[]} selector matched elements
            * @param {String} className One or more class names to be added to the class attribute of each matched element.
            * multiple class names is separated by space
            * @param [state] {Boolean} optional boolean to indicate whether class
            *        should be added or removed regardless of current state.
            */
            toggleClass:batchClassList('toggleClass'),

            /*
            * Replace a class with another class for matched elements.
            * If no oldClassName is present, the newClassName is simply added.
            * @param {HTMLElement|String|HTMLElement[]} selector matched elements
            * @param {String} oldClassName One or more class names to be removed from the class attribute of each matched element.
            * multiple class names is separated by space
            * @param {String} newClassName One or more class names to be added to the class attribute of each matched element.
            * multiple class names is separated by space
            */
            replaceClass:function (selector, oldCls, newCls) {
                DOM.removeClass(selector, oldCls);
                DOM.addClass(selector, newCls);
            }

        });
    return DOM;
}, {
    requires:['./api']
});