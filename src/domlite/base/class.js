KISSY.add('domlite/base/class', function (S, DOMLITE) {
    var RE_SPLIT = /[\.\s]\s*\.?/;
    var NodeType = DOMLITE.NodeType;

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
            DOMLITE.query(selector).each(function (elem) {
                if (elem.nodeType == NodeType.ELEMENT_NODE) {
                    var classNames = strToArray(className);
                    for (var i = 0; i < classsNames.length; i++) {
                        elem.classList[method](cls);
                    }
                }
            });
        }
    }

    S.mix(DOMLITE,
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

            hasClass:function (selector, className) {
                var elem = DOMLITE.get(selector);
                return elem && elem.nodeType == NodeType.ELEMENT_NODE && DOMLITE._hasClass(elem, strToArray(className));
            },
            addClass:batchClassList('add'),
            removeClass:batchClassList('remove'),
            toggleClass:batchClassList('toggleClass'),
            replaceClass:function (selector, oldCls, newCls) {
                DOMLITE.removeClass(selector, oldCls);
                DOMLITE.addClass(selector, newCls);
            }

        });
    return DOMLITE;
}, {
    requires:['./api']
});