KISSY.add('domlite/base/style',function(S,DOMLITE){
    var WINDOW = S.Env.host;
    var doc = WINDOW.document;
    var R_UPPER = /([A-Z]|^ms)/g;/*ie9 hack*/
    var cssProps = {
                'float': 'cssFloat'
            };
    var STYLE = 'style';
    var RE_MARGIN = /^margin/;
    var RE_DASH = /-([a-z])/ig;
    var EMPTY = '';
    var cssNumber = {
                'fillOpacity': 1,
                'fontWeight': 1,
                'lineHeight': 1,
                'opacity': 1,
                'orphans': 1,
                'widows': 1,
                'zIndex': 1,
                'zoom': 1
            };
    var UA= S.UA;
    var DEFAULT_UNIT = 'px';
    var DISPLAY = 'display';
    var OLD_DISPLAY = DISPLAY + S.now();
    var NONE = 'none';
    var defaultDisplay = {};


    function upperCase() {
        return arguments[1].toUpperCase();
    }
    function camelCase(name) {
        return name.replace(RE_DASH, upperCase);
    }

    function style(elem, name, val) {
            var style,
                ret;
            if (elem.nodeType === 3 || elem.nodeType === 8 || !(style = elem[STYLE])) {
                return undefined;
            }
            name = camelCase(name);
            name = cssProps[name] || name;
            // setter
            if (val !== undefined) {
                // normalize unset
                if (val === null || val === EMPTY) {
                    val = EMPTY;
                }
                // number values may need a unit
                else if (!isNaN(Number(val)) && !cssNumber[name]) {
                    val += DEFAULT_UNIT;
                }
                if (val !== undefined) {
                    // ie 无效值报错
                    try {
                        // EMPTY will unset style!
                        style[name] = val;
                    } catch (e) {
                        S.log('css set error :' + e);
                    }
                    // #80 fix,font-family
                    if (val === EMPTY && style.removeAttribute) {
                        style.removeAttribute(name);
                    }
                }
                if (!style.cssText) {
                    // weird for chrome, safari is ok?
                    // https://github.com/kissyteam/kissy/issues/231
                    UA.webkit && (style = elem.outerHTML);
                    elem.removeAttribute('style');
                }
                return undefined;
            }
            //getter
            else {
                    ret = style[ name ];
                return ret === undefined ? '' : ret;
            }
        }


    function getDefaultDisplay(tagName) {
            var body,
                oldDisplay = defaultDisplay[ tagName ],
                elem;
            if (!defaultDisplay[ tagName ]) {
                body = doc.body;
                elem = doc.createElement(tagName);
                DOMLITE.prepend(elem, body);
                oldDisplay = DOMLITE.css(elem, 'display');
                body.removeChild(elem);
                defaultDisplay[ tagName ] = oldDisplay;
            }
            return oldDisplay;
        }


    S.mix(DOMLITE,
        {

            _getComputedStyle: function (elem, name) {
                            var val = '',
                                computedStyle,
                                width,
                                minWidth,
                                maxWidth,
                                style,
                                d = elem.ownerDocument;

                            name = name.replace(R_UPPER, '-$1').toLowerCase();

                            // https://github.com/kissyteam/kissy/issues/61
                            if (computedStyle = d.defaultView.getComputedStyle(elem, null)) {
                                val = computedStyle.getPropertyValue(name) || computedStyle[name];
                            }

                            // 还没有加入到 document，就取行内
                            if (val === '' && !DOMLITE.contains(d, elem)) {
                                name = cssProps[name] || name;
                                val = elem[STYLE][name];
                            }

                            // Safari 5.1 returns percentage for margin
                            /*看不懂*/
                            if (DOMLITE._RE_NUM_NO_PX.test(val) && RE_MARGIN.test(name)) {
                                style = elem.style;
                                width = style.width;
                                minWidth = style.minWidth;
                                maxWidth = style.maxWidth;

                                style.minWidth = style.maxWidth = style.width = val;
                                val = computedStyle.width;

                                style.width = width;
                                style.minWidth = minWidth;
                                style.maxWidth = maxWidth;
                            }

                            return val;
                        },
            style: function (selector, name, val) {
                            var els = DOMLITE.query(selector),
                                k,
                                ret,
                                elem = els[0], i;
                            // supports hash
                            if (S.isPlainObject(name)) {
                                for (k in name) {
                                    for (i = els.length - 1; i >= 0; i--) {
                                        style(els[i], k, name[k]);
                                    }
                                }
                                return undefined;
                            }
                            if (val === undefined) {
                                ret = '';
                                if (elem) {
                                    ret = style(elem, name, val);
                                }
                                return ret;
                            } else {
                                for (i = els.length - 1; i >= 0; i--) {
                                    style(els[i], name, val);
                                }
                            }
                            return undefined;
                        },
            css: function (selector, name, val) {
                var els = DOMLITE.query(selector),
                                    elem = els[0],
                                    k,
                                    hook,
                                    ret,
                                    i;
                                // supports hash
                                if (S.isPlainObject(name)) {
                                    for (k in name) {
                                        for (i = els.length - 1; i >= 0; i--) {
                                            style(els[i], k, name[k]);
                                        }
                                    }
                                    return undefined;
                                }

                                name = camelCase(name);
                                // getter
                                if (val === undefined) {
                                    // supports css selector/Node/NodeList
                                    ret = '';
                                    if (elem) {
                                        ret = DOMLITE._getComputedStyle(elem, name);
                                    }
                                    return (typeof ret == 'undefined') ? '' : ret;
                                }
                                // setter
                                else {
                                    for (i = els.length - 1; i >= 0; i--) {
                                        style(els[i], name, val);
                                    }
                                }
                                return undefined;
            },

            show:function(selector){
                var els = DOMLITE.query(selector),
                    tagName,
                    old,
                    elem, i;
                for (i = els.length - 1; i >= 0; i--) {
                    elem = els[i];
                    elem[STYLE][DISPLAY] = DOMLITE.data(elem, OLD_DISPLAY) || EMPTY;
                    // 可能元素还处于隐藏状态，比如 css 里设置了 display: none
                    if (DOMLITE.css(elem, DISPLAY) === NONE) {
                        tagName = elem.tagName.toLowerCase();
                        old = getDefaultDisplay(tagName);
                        DOMLITE.data(elem, OLD_DISPLAY, old);
                        elem[STYLE][DISPLAY] = old;
                    }
                }
            },

            hide: function (selector) {
                var els = DOMLITE.query(selector),
                    elem, i;
                for (i = els.length - 1; i >= 0; i--) {
                    elem = els[i];
                    var style = elem[STYLE],
                        old = style[DISPLAY];
                    if (old !== NONE) {
                        if (old) {
                            DOMLITE.data(elem, OLD_DISPLAY, old);
                        }
                        style[DISPLAY] = NONE;
                    }
                }
            },
            toggle: function (selector) {
                           var els = DOMLITE.query(selector),
                               elem, i;
                           for (i = els.length - 1; i >= 0; i--) {
                               elem = els[i];
                               if (DOMLITE.css(elem, DISPLAY) === NONE) {
                                   DOMLITE.show(elem);
                               } else {
                                   DOMLITE.hide(elem);
                               }
                           }
                       },

            addStyleSheet: function (refWin, cssText, id) {
                refWin = refWin || WINDOW;

                if (typeof refWin == 'string') {
                    id = cssText;
                    cssText = refWin;
                    refWin = WINDOW;
                }

                refWin = DOMLITE.get(refWin);

                var win = DOMLITE.getWindow(refWin),
                    doc = win.document,
                    elem;

                if (id && (id = id.replace('#', EMPTY))) {
                    elem = DOMLITE.get('#' + id, doc);
                }

                // 仅添加一次，不重复添加
                if (elem) {
                    return;
                }

                elem = DOMLITE.create('<style>', { id: id }, doc);

                // 先添加到 DOM 树中，再给 cssText 赋值，否则 css hack 会失效
                DOMLITE.get('head', doc).appendChild(elem);

               elem.appendChild(doc.createTextNode(cssText));

            },
            /**
             * Make matched elements unselectable
             * @param {HTMLElement[]|String|HTMLElement} selector  Matched elements.
             */
            unselectable: function (selector) {
                var _els = DOMLITE.query(selector),
                    elem,
                    j,
                    e,
                    i = 0,
                    excludes,
                    style,
                    els;
                for (j = _els.length - 1; j >= 0; j--) {
                    elem = _els[j];
                    style = elem[STYLE];
                    style['UserSelect'] = 'none';
                    style['WebkitUserSelect'] = 'none';

                    /*
                    if (UA['gecko']) {
                        style['MozUserSelect'] = 'none';
                    } else if (UA['webkit']) {
                        style['WebkitUserSelect'] = 'none';
                    } else if (UA['ie'] || UA['opera']) {
                        els = elem.getElementsByTagName('*');
                        elem.setAttribute('unselectable', 'on');
                        excludes = ['iframe', 'textarea', 'input', 'select'];
                        while (e = els[i++]) {
                            if (!S.inArray(getNodeName(e), excludes)) {
                                e.setAttribute('unselectable', 'on');
                            }
                        }
                    }*/

                }
            },
            /**
             * Get the current computed width for the first element in the set of matched elements, including padding but not border.
             * @method
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @return {Number}
             */
            innerWidth: 0,
            /**
             * Get the current computed height for the first element in the set of matched elements, including padding but not border.
             * @method
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @return {Number}
             */
            innerHeight: 0,
            /**
             *  Get the current computed width for the first element in the set of matched elements, including padding and border, and optionally margin.
             * @method
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {Boolean} [includeMargin] A Boolean indicating whether to include the element's margin in the calculation.
             * @return {Number}
             */
            outerWidth: 0,
            /**
             * Get the current computed height for the first element in the set of matched elements, including padding, border, and optionally margin.
             * @method
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {Boolean} [includeMargin] A Boolean indicating whether to include the element's margin in the calculation.
             * @return {Number}
             */
            outerHeight: 0,
            /**
             * Get the current computed width for the first element in the set of matched elements.
             * or
             * Set the CSS width of each element in the set of matched elements.
             * @method
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {String|Number} [value]
             * An integer representing the number of pixels, or an integer along with an optional unit of measure appended (as a string).
             * @return {Number|undefined}
             */
            width: 0,
            /**
             * Get the current computed height for the first element in the set of matched elements.
             * or
             * Set the CSS height of each element in the set of matched elements.
             * @method
             * @param {HTMLElement[]|String|HTMLElement} selector Matched elements
             * @param {String|Number} [value]
             * An integer representing the number of pixels, or an integer along with an optional unit of measure appended (as a string).
             * @return {Number|undefined}
             */
            height: 0
        });
    var WIDTH='width';
    var HEIGHT = 'height';
    var cssShow = { position: 'absolute', visibility: 'hidden', display: 'block' };

    /***********************************************************************************************************************/
    function swap(elem, options, callback) {
            var old = {}, name;

            // Remember the old values, and insert the new ones
            for (name in options) {
                old[ name ] = elem[STYLE][ name ];
                elem[STYLE][ name ] = options[ name ];
            }

            callback.call(elem);

            // Revert the old values
            for (name in options) {
                elem[STYLE][ name ] = old[ name ];
            }
        }


      /*
     得到元素的大小信息
     @param elem
     @param name
     @param {String} [extra]  'padding' : (css width) + padding
     'border' : (css width) + padding + border
     'margin' : (css width) + padding + border + margin
     */
    function getWH(elem, name, extra) {
        if (S.isWindow(elem)) {
            return name == WIDTH ? DOMLITE.viewportWidth(elem) : DOMLITE.viewportHeight(elem);
        } else if (elem.nodeType == 9) {
            return name == WIDTH ? DOMLITE.docWidth(elem) : DOMLITE.docHeight(elem);
        }
        var which = name === WIDTH ? ['Left', 'Right'] : ['Top', 'Bottom'],
            val = name === WIDTH ? elem.offsetWidth : elem.offsetHeight;

        if (val > 0) {
            if (extra !== 'border') {
                S.each(which, function (w) {
                    /*offset = content+padding+border*/
                    if (!extra) {
                        /*content:offset-border-padding*/
                        val -= parseFloat(DOMLITE.css(elem, 'padding' + w)) || 0;
                    }
                    if (extra === 'margin') {
                         /*content+padding+border+margin:offset+margin*/
                        val += parseFloat(DOMLITE.css(elem, extra + w)) || 0;
                    } else {
                         /*content+padding:offset-border*/
                        val -= parseFloat(DOM.css(elem, 'border' + w + 'Width')) || 0;
                    }
                });
            }
            return val;
        }

        // Fall back to computed then un computed css if necessary
        val = DOM._getComputedStyle(elem, name);
        if (val == null || (Number(val)) < 0) {
            val = elem.style[ name ] || 0;
        }
        // Normalize '', auto, and prepare for extra
        val = parseFloat(val) || 0;

        // Add padding, border, margin
        if (extra) {
            S.each(which, function (w) {
                val += parseFloat(DOM.css(elem, 'padding' + w)) || 0;
                if (extra !== 'padding') {
                    val += parseFloat(DOM.css(elem, 'border' + w + 'Width')) || 0;
                }
                if (extra === 'margin') {
                    val += parseFloat(DOM.css(elem, extra + w)) || 0;
                }
            });
        }

        return val;
    }

    function getWHIgnoreDisplay(elem) {
            var val, args = arguments;
            // in case elem is window
            // elem.offsetWidth === undefined
            if (elem.offsetWidth !== 0) {
                val = getWH.apply(undefined, args);
            } else {
                swap(elem, cssShow, function () {
                    val = getWH.apply(undefined, args);
                });
            }
            return val;
        }

    S.each([WIDTH, HEIGHT], function (name) {
           /*ucfirst:第一个字母大写*/
            DOMLITE['inner' + S.ucfirst(name)] = function (selector) {
                var el = DOMLITE.get(selector);
                return el && getWHIgnoreDisplay(el, name, 'padding');
            };

            DOMLITE['outer' + S.ucfirst(name)] = function (selector, includeMargin) {
                var el = DOMLITE.get(selector);
                return el && getWHIgnoreDisplay(el, name, includeMargin ? 'margin' : 'border');
            };

            DOMLITE[name] = function (selector, val) {
                var ret = DOMLITE.css(selector, name, val);
                if (ret) {
                    ret = parseFloat(ret);
                }
                return ret;
            };
        });
    return DOMLITE;
},{
    requiress:['./api']
})