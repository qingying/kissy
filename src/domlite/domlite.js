KISSY.add('domlite/base/api', function (S) {
    var DOMLITE = {};
    var RE_NUM = /[\-+]?(?:\d*\.|)\d+(?:[eE][\-+]?\d+|)/.source;
    var NodeType = {
        /**
         * element type
         */
        ELEMENT_NODE:1,
        /**
         * attribute node type
         */
        'ATTRIBUTE_NODE':2,
        /**
         * text node type
         */
        TEXT_NODE:3,
        /**
         * cdata node type
         */
        'CDATA_SECTION_NODE':4,
        /**
         * entity reference node type
         */
        'ENTITY_REFERENCE_NODE':5,
        /**
         * entity node type
         */
        'ENTITY_NODE':6,
        /**
         * processing instruction node type
         */
        'PROCESSING_INSTRUCTION_NODE':7,
        /**
         * comment node type
         */
        COMMENT_NODE:8,
        /**
         * document node type
         */
        DOCUMENT_NODE:9,
        /**
         * document type
         */
        'DOCUMENT_TYPE_NODE':10,
        /**
         * document fragment type
         */
        DOCUMENT_FRAGMENT_NODE:11,
        /**
         * notation type
         */
        'NOTATION_NODE':12
    };
    DOMLITE = {
        NodeType:NodeType,
        _RE_NUM_NO_PX: new RegExp("^(" + RE_NUM + ")(?!px)[a-z%]+$", "i"),
        /**
                     * Return corresponding window if elem is document or window.
                     * Return global window if elem is undefined
                     * Else return false.
                     * @param {undefined|window|HTMLDocument} elem
                     * @return {window|Boolean}
                     */
         getWindow: function (elem) {
             if (!elem) {
                 return WINDOW;
             }
             return ('scrollTo' in elem && elem['document']) ?
                 elem : elem.nodeType == NodeType.DOCUMENT_NODE ?
                 elem.defaultView || elem.parentWindow :
                 false;
         },
    };
    return DOMLITE;
});


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

KISSY.add('domlite/base/attr', function (S, DOMLITE) {
        var NodeType = DOMLITE.NodeType;
        var R_RETURN = /\r/g;
        var EMPTY = '';
        var propFix = {
            'hidefocus':'hideFocus',
            tabindex:'tabIndex',
            readonly:'readOnly',
            'for':'htmlFor',
            'class':'className',
            maxlength:'maxLength',
            'cellspacing':'cellSpacing',
            'cellpadding':'cellPadding',
            rowspan:'rowSpan',
            colspan:'colSpan',
            usemap:'useMap',
            'frameborder':'frameBorder',
            'contenteditable':'contentEditable'
        };

        var attrFn = {
                val:1,
                css:1,
                html:1,
                text:1,
                data:1,
                width:1,
                height:1,
                offset:1,
                scrollTop:1,
                scrollLeft:1
            },


            S
        .
        mix(DOMLITE,
            {
                prop:function (selector, name, value) {
                    var elems = DOMLITE.query(selector),
                        i,
                        elem,
                        hook;

                    if (S.isPlainObject(name)) {
                        S.each(name, function (v, k) {
                            DOMLITE.prop(elems, k, v);
                        });
                        return undefined;
                    }

                    name = propFix[ name ] || name;

                    if (value !== undefined) {
                        for (i = elems.length - 1; i >= 0; i--) {
                            elem = elems[i];
                            elem[ name ] = value;
                        }
                    } else {
                        if (elems.length) {
                            return elem[name];
                        }
                    }
                    return undefined;
                },
                hasProp:function (selector, name) {
                    var elems = DOMLITE.query(selector),
                        i,
                        len = elems.length,
                        el;
                    for (i = 0; i < len; i++) {
                        el = elems[i];
                        if (elem[name] !== undefined) {
                            return true;
                        }
                    }
                    return false;
                },
                removeProp:function (selector, name) {
                    name = propFix[ name ] || name;
                    var elems = DOMLITE.query(selector),
                        i,
                        el;
                    for (i = elems.length - 1; i >= 0; i--) {
                        el = elems[i];
                        try {
                            el[ name ] = undefined;
                            delete el[ name ];
                        } catch (e) {
                            // S.log('delete el property error : ');
                            // S.log(e);
                        }
                    }
                },
                attr:function (selector, name, val, pass) {
                    var els = DOMLITE.query(selector),
                        attrNormalizer,
                        i,
                        el = els[0],
                        ret;

                    // supports hash
                    if (S.isPlainObject(name)) {
                        pass = val;
                        for (var k in name) {
                            DOMLITE.attr(els, k, name[k], pass);
                        }
                        return undefined;
                    }

                    // attr functions
                    if (pass && attrFn[name]) {
                        return DOMLITE[name](selector, val);
                    }

                    // scrollLeft
                    name = name.toLowerCase();

                    if (pass && attrFn[name]) {
                        return DOM[name](selector, val);
                    }

                    if (val === undefined) {
                        if (el && el.nodeType === NodeType.ELEMENT_NODE) {
                            return el.getAttribute(name);
                        }

                    } else {
                        for (i = els.length - 1; i >= 0; i--) {
                            el = els[i];
                            if (el && el.nodeType === NodeType.ELEMENT_NODE) {
                                el.getAttribute(name, EMPTY + val);
                            }
                        }
                    }

                },

                removeAttr:function (selector, name) {
                    name = name.toLowerCase();
                    var els = DOMLITE.query(selector),
                        propName,
                        el, i;

                    for (i = els.length - 1; i >= 0; i--) {
                        el = els[i];
                        if (el.nodeType == NodeType.ELEMENT_NODE) {
                            el.removeAttribute(name);
                        }
                    }
                },

                hasAttr:function (selector, name) {
                    var elems = DOMLITE.query(selector), i,
                        len = elems.length;
                    for (i = 0; i < len; i++) {
                        //使用原生实现
                        if (elems[i].hasAttribute(name)) {
                            return true;
                        }
                    }
                    return false;
                },
                val:function (selector, value) {
                    var elem, els, i, val;
                    if (value === undefined) {
                        elem = DOMLITE.get(selector);

                        if (elem) {
                            return elem.value.replace(R_RETURN, '');
                        }
                    } else {
                        val = value;

                        // Treat null/undefined as ''; convert numbers to string
                        if (val == null) {
                            val = '';
                        } else if (typeof val === 'number') {
                            val += '';
                        } else if (S.isArray(val)) {
                            val = S.map(val, function (value) {
                                return value == null ? '' : value + '';
                            });
                        }
                        els = DOMLITE.query(selector);
                        for (i = els.length - 1; i >= 0; i--) {
                            elem = els[i];
                            if (elem.nodeType !== 1) {
                                return undefined;
                            }
                            val = value;
                            elem.value = val;
                        }
                    }
                },
                text:function (selector, val) {
                    var el, els, i, nodeType;
                    if (val === undefined) {
                        // supports css selector/Node/NodeList
                        el = DOMLITE.get(selector);
                        return el.textContent;
                    } else {
                        els = DOMLITE.query(selector);
                        for (i = els.length - 1; i >= 0; i--) {
                            el = els[i];
                            nodeType = el.nodeType;
                            if (nodeType == NodeType.ELEMENT_NODE) {
                                el.textContent = val
                            }
                            else if (nodeType == NodeType.TEXT_NODE || nodeType == NodeType.CDATA_SECTION_NODE) {
                                el.nodeValue = val;
                            }
                        }
                    }
                    return undefined;
                }
            });

        return DOMLITE;
    },
    {
        requires:['./api']
    });

KISSY.add('domlite/base/create', function (S, DOMLITE) {
    var doc = S.Env.host.document;
    var R_HTML = /<|&#?\w+;/;
    var RE_SIMPLE_TAG = /^<(\w+)\s*\/?>(?:<\/\1>)?$/;
    var R_XHTML_TAG = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig;
    var RE_TAG = /<([\w:]+)/;
    var DEFAULT_DIV = doc && doc.createElement(DIV);
    var DIV = 'div';
    var PARENT_NODE = 'parentNode';
    var NodeType = DOMLITE.nodeType;
    var R_LEADING_WHITESPACE = /^\s+/;
    var creatorsMap = {
                option: 'select',
                optgroup: 'select',
                area: 'map',
                thead: 'table',
                td: 'tr',
                th: 'tr',
                tr: 'tbody',
                tbody: 'table',
                tfoot: 'table',
                caption: 'table',
                colgroup: 'table',
                col: 'colgroup',
                legend: 'fieldset'
            };

     // 添加成员到元素中
    function attachProps(elem, props) {
        if (S.isPlainObject(props)) {
            if (elem.nodeType == NodeType.ELEMENT_NODE) {
                DOMLITE.attr(elem, props, true);
            }
            // document fragment
            else if (elem.nodeType == NodeType.DOCUMENT_FRAGMENT_NODE) {
                DOMLITE.attr(elem.childNodes, props, true);
            }
        }
        return elem;
    }
     // 将 nodeList 转换为 fragment
    function nodeListToFragment(nodes) {
            var ret = null,
                i,
                ownerDoc,
                len;
            if (nodes && (nodes.push || nodes.item) && nodes[0]) {
                ownerDoc = nodes[0].ownerDocument;
                ret = ownerDoc.createDocumentFragment();
                nodes = S.makeArray(nodes);
                for (i = 0, len = nodes.length; i < len; i++) {
                    ret.appendChild(nodes[i]);
                }
            } else {
                S.log('Unable to convert ' + nodes + ' to fragment.');
            }
            return ret;
        }

    function defaultCreator(html, ownerDoc) {
            var frag = ownerDoc && ownerDoc != doc ?
                ownerDoc.createElement(DIV) :
                DEFAULT_DIV;
            // html 为 <style></style> 时不行，必须有其他元素？
            frag.innerHTML = '<div>' + html + '<' + '/div>';
            return frag.lastChild;
        }

    function cleanData(els) {
            var DOMEvent = S.require('event/dom');
            if (DOMEvent) {
                DOMEvent.detach(els);
            }
            DOMLITE.removeData(els);
        }

    function getElementsByTagName(el, tag) {
            return el.getElementsByTagName(tag);
        }

    // 克隆除了事件的 data
    function cloneWithDataAndEvent(src, dest) {
           var DOMEvent = S.require('event/dom'),
               srcData,
               d;

           if (dest.nodeType == NodeType.ELEMENT_NODE && !DOMLITE.hasData(src)) {
               return;
           }

           srcData = DOMLITE.data(src);

           // 浅克隆，data 也放在克隆节点上
           for (d in srcData) {
               DOMLITE.data(dest, d, srcData[d]);
           }

           // 事件要特殊点
           if (DOMEvent) {
               // attach src 's event data and dom attached listener to dest
               DOMEvent.clone(src, dest);
           }
       }

    function processAll(fn, elem, clone) {
            var elemNodeType = elem.nodeType;
            if (elemNodeType == NodeType.DOCUMENT_FRAGMENT_NODE) {
                var eCs = elem.childNodes,
                    cloneCs = clone.childNodes,
                    fIndex = 0;
                while (eCs[fIndex]) {
                    if (cloneCs[fIndex]) {
                        processAll(fn, eCs[fIndex], cloneCs[fIndex]);
                    }
                    fIndex++;
                }
            } else if (elemNodeType == NodeType.ELEMENT_NODE) {
                var elemChildren = getElementsByTagName(elem, '*'),
                    cloneChildren = getElementsByTagName(clone, '*'),
                    cIndex = 0;
                while (elemChildren[cIndex]) {
                    if (cloneChildren[cIndex]) {
                        fn(elemChildren[cIndex], cloneChildren[cIndex]);
                    }
                    cIndex++;
                }
            }
        }
    S.mix(DOMLITE, {
        create:function (html, props, ownerDoc, _trim) {
            var ret = null;

            if (!html) {
                return ret;
            }

            if (html.nodeType) {
                return DOMLITE.clone(html);
            }

            if (typeof html != 'string') {
                return ret;
            }

            if (_trim === undefined) {
                _trim = true;
            }

            if (_trim) {
                html = S.trim(html);
            }

            var holder,
                context = ownerDoc || doc,
                m,
                tag = DIV,
                k,
                nodes;
            /*如果不包含html标签，创建一个文本节点*/
            if (!R_HTML.test(html)) {
                ret = context.createTextNode(html);
            }// 简单 tag, 比如 DOM.create('<p>')
            else if ((m = RE_SIMPLE_TAG.exec(html))) {
                ret = context.createElement(m[1]);
            }
             // 复杂情况，比如 DOM.create('<img src='sprite.png' />')
                else {
                    // Fix 'XHTML'-style tags in all browsers
                    html = html.replace(R_XHTML_TAG, '<$1><' + '/$2>');

                    if ((m = RE_TAG.exec(html)) && (k = m[1])) {
                        tag = k.toLowerCase();
                    }

                    holder = defaultCreator(html, context);


                    nodes = holder.childNodes;

                    if (nodes.length === 1) {
                        // return single node, breaking parentNode ref from 'fragment'
                        //removeChild 返回移除的节点
                        ret = nodes[0][PARENT_NODE].removeChild(nodes[0]);
                    } else if (nodes.length) {
                        // return multiple nodes as a fragment
                        ret = nodeListToFragment(nodes);
                    } else {
                        S.error(html + ' : create node error');
                    }
                }
                return attachProps(ret, props);
        },
        html: function (selector, htmlString, loadScripts) {
                        // supports css selector/Node/NodeList
                        var els = DOMLITE.query(selector),
                            el = els[0],
                            success = false,
                            valNode,
                            i, elem;
                        if (!el) {
                            return null;
                        }
                        // getter
                        if (htmlString === undefined) {
                            // only gets value on the first of element nodes
                            if (el.nodeType == NodeType.ELEMENT_NODE) {
                                return el.innerHTML;
                            } else {
                                return null;
                            }
                        }
                        // setter
                        else {
                            htmlString += '';

                            // faster
                            // fix #103,some html element can not be set through innerHTML
                            if (!htmlString.match(/<(?:script|style|link)/i) &&
                                (!htmlString.match(R_LEADING_WHITESPACE)) && !creatorsMap[ (htmlString.match(RE_TAG) || ['', ''])[1].toLowerCase() ]) {
                                try {
                                    for (i = els.length - 1; i >= 0; i--) {
                                        elem = els[i];
                                        if (elem.nodeType == NodeType.ELEMENT_NODE) {
                                            /*将原来的内容上面的事件绑定去掉*/
                                            cleanData(getElementsByTagName(elem, '*'));
                                            elem.innerHTML = htmlString;
                                        }
                                    }
                                    success = true;
                                } catch (e) {
                                    // a <= '<a>'
                                    // a.innerHTML='<p>1</p>';
                                }

                            }

                            if (!success) {
                                valNode = DOMLITE.create(htmlString, 0, el.ownerDocument, 0);
                                DOMLITE.empty(els);
                                DOMLITE.append(valNode, els, loadScripts);
                            }
                        }
                        return undefined;
                    },
        outerHTML: function (selector, htmlString, loadScripts) {
            var els = DOMLITE.query(selector),
                                holder,
                                i,
                                valNode,
                                ownerDoc,
                                length = els.length,
                                el = els[0];
                            if (!el) {
                                return null;
                            }
                            // getter
                            if (htmlString === undefined) {
                                if (el.nodeType == NodeType.ELEMENT_NODE) {
                                    return el.outerHTML
                                }else{
                                    return null;
                                }
                            } else {
                                htmlString += '';
                                if (!htmlString.match(/<(?:script|style|link)/i)) {
                                    for (i = length - 1; i >= 0; i--) {
                                        el = els[i];
                                        if (el.nodeType == NodeType.ELEMENT_NODE) {
                                            cleanData(el);
                                            cleanData(getElementsByTagName(el, '*'));
                                            el.outerHTML = htmlString;
                                        }
                                    }
                                } else {
                                    valNode = DOMLITE.create(htmlString, 0, el.ownerDocument, 0);
                                    DOMLITE.insertBefore(valNode, els, loadScripts);
                                    DOMLITE.remove(els);
                                }
                            }
                            return undefined;
         },
        remove: function (selector, keepData) {
            var el,
                els = DOM.query(selector),
                all,
                parent,
                DOMEvent = S.require('event/dom'),
                i;
            for (i = els.length - 1; i >= 0; i--) {
                el = els[i];
                if (!keepData && el.nodeType == NodeType.ELEMENT_NODE) {
                    all = S.makeArray(getElementsByTagName(el, '*'));
                    all.push(el);
                    DOMLITE.removeData(all);
                    if (DOMEvent) {
                        DOMEvent.detach(all);
                    }
                }
                if (parent = el.parentNode) {
                    parent.removeChild(el);
                }
            }
        },
        clone: function (selector, deep, withDataAndEvent, deepWithDataAndEvent) {
                        if (typeof deep === 'object') {
                            deepWithDataAndEvent = deep['deepWithDataAndEvent'];
                            withDataAndEvent = deep['withDataAndEvent'];
                            deep = deep['deep'];
                        }

                        var elem = DOMLITE.get(selector),
                            clone,
                            elemNodeType;

                        if (!elem) {
                            return null;
                        }

                        clone = elem.cloneNode(deep);


                        // runtime 获得事件模块
                        if (withDataAndEvent) {
                            cloneWithDataAndEvent(elem, clone);
                            if (deep && deepWithDataAndEvent) {
                                processAll(cloneWithDataAndEvent, elem, clone);
                            }
                        }
                        return clone;
                    },
        /**
                    * Remove(include data and event handlers) all child nodes of the set of matched elements from the DOM.
                    * @param {HTMLElement|String|HTMLElement[]} selector matched elements
                    */
                   empty: function (selector) {
                       var els = DOM.query(selector),
                           el, i;
                       for (i = els.length - 1; i >= 0; i--) {
                           el = els[i];
                           DOM.remove(el.childNodes);
                       }
                   },
        /**
                    * Remove(include data and event handlers) all child nodes of the set of matched elements from the DOM.
                    * @param {HTMLElement|String|HTMLElement[]} selector matched elements
                    */
                   empty: function (selector) {
                       var els = DOMLITE.query(selector),
                           el, i;
                       for (i = els.length - 1; i >= 0; i--) {
                           el = els[i];
                           DOMLITE.remove(el.childNodes);
                       }
                   },

                   _nodeListToFragment: nodeListToFragment
    });

    return DOMLITE;
}, {
    requires:['./api']
})