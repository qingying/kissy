KISSY.add('domlite/base/create', function (S, DOM) {
    var doc = S.Env.host.document;
    var R_HTML = /<|&#?\w+;/;
    var RE_SIMPLE_TAG = /^<(\w+)\s*\/?>(?:<\/\1>)?$/;
    var R_XHTML_TAG = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig;
    var RE_TAG = /<([\w:]+)/;
    var DEFAULT_DIV = doc && doc.createElement(DIV);
    var DIV = 'div';
    var PARENT_NODE = 'parentNode';
    var NodeType = DOM.nodeType;
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
                DOM.attr(elem, props, true);
            }
            // document fragment
            else if (elem.nodeType == NodeType.DOCUMENT_FRAGMENT_NODE) {
                DOM.attr(elem.childNodes, props, true);
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
            DOM.removeData(els);
        }

    function getElementsByTagName(el, tag) {
            return el.getElementsByTagName(tag);
        }

    // 克隆除了事件的 data
    function cloneWithDataAndEvent(src, dest) {
           var DOMEvent = S.require('event/dom'),
               srcData,
               d;

           if (dest.nodeType == NodeType.ELEMENT_NODE && !DOM.hasData(src)) {
               return;
           }

           srcData = DOM.data(src);

           // 浅克隆，data 也放在克隆节点上
           for (d in srcData) {
               DOM.data(dest, d, srcData[d]);
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
    S.mix(DOM, {

        /*
        * Creates DOM elements on the fly from the provided string of raw HTML.
        * @param {String} html A string of HTML to create on the fly. Note that this parses HTML, not XML.
        * @param {Object} [props] An map of attributes on the newly-created element.
        * @param {HTMLDocument} [ownerDoc] A document in which the new elements will be created
        * @return {DocumentFragment|HTMLElement}
        */
        create:function (html, props, ownerDoc, _trim) {
            var ret = null;

            if (!html) {
                return ret;
            }

            if (html.nodeType) {
                return DOM.clone(html);
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
        /**
        * Get the HTML contents of the first element in the set of matched elements.
        * or
        * Set the HTML contents of each element in the set of matched elements.
        * @param {HTMLElement|String|HTMLElement[]} selector matched elements
        * @param {String} htmlString  A string of HTML to set as the content of each matched element.
        * @param {Boolean} [loadScripts=false] True to look for and process scripts
        */
        html: function (selector, htmlString, loadScripts) {
                        // supports css selector/Node/NodeList
                        var els = DOM.query(selector),
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
                                valNode = DOM.create(htmlString, 0, el.ownerDocument, 0);
                                DOM.empty(els);
                                DOM.append(valNode, els, loadScripts);
                            }
                        }
                        return undefined;
                    },
        /**
        * Get the outerHTML of the first element in the set of matched elements.
        * or
        * Set the outerHTML of each element in the set of matched elements.
        * @param {HTMLElement|String|HTMLElement[]} selector matched elements
        * @param {String} htmlString  A string of HTML to set as outerHTML of each matched element.
        * @param {Boolean} [loadScripts=false] True to look for and process scripts
        */
        outerHTML: function (selector, htmlString, loadScripts) {
            var els = DOM.query(selector),
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
                                    valNode = DOM.create(htmlString, 0, el.ownerDocument, 0);
                                    DOM.insertBefore(valNode, els, loadScripts);
                                    DOM.remove(els);
                                }
                            }
                            return undefined;
         },
        /**
        * Remove the set of matched elements from the DOM.
        * @param {HTMLElement|String|HTMLElement[]} selector matched elements
        * @param {Boolean} [keepData=false] whether keep bound events and jQuery data associated with the elements from removed.
        */
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
                    DOM.removeData(all);
                    if (DOMEvent) {
                        DOMEvent.detach(all);
                    }
                }
                if (parent = el.parentNode) {
                    parent.removeChild(el);
                }
            }
        },
        /**
        * Create a deep copy of the first of matched elements.
        * @param {HTMLElement|String|HTMLElement[]} selector matched elements
        * @param {Boolean|Object} [deep=false] whether perform deep copy or copy config.
        * @param {Boolean} [deep.deep] whether perform deep copy
        * @param {Boolean} [deep.withDataAndEvent=false] A Boolean indicating
        * whether event handlers and data should be copied along with the elements.
        * @param {Boolean} [deep.deepWithDataAndEvent=false]
        * A Boolean indicating whether event handlers and data for all children of the cloned element should be copied.
        * if set true then deep argument must be set true as well.
        * @param {Boolean} [withDataAndEvent=false] A Boolean indicating
        * whether event handlers and data should be copied along with the elements.
        * @param {Boolean} [deepWithDataAndEvent=false]
        * A Boolean indicating whether event handlers and data for all children of the cloned element should be copied.
        * if set true then deep argument must be set true as well.
        * https://developer.mozilla.org/En/DOM/Node.cloneNode
        * @return {HTMLElement}
        * @member KISSY.DOM
        */
        clone: function (selector, deep, withDataAndEvent, deepWithDataAndEvent) {
                        if (typeof deep === 'object') {
                            deepWithDataAndEvent = deep['deepWithDataAndEvent'];
                            withDataAndEvent = deep['withDataAndEvent'];
                            deep = deep['deep'];
                        }

                        var elem = DOM.get(selector),
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
                   _nodeListToFragment: nodeListToFragment
    });

    return DOM;
}, {
    requires:['./api']
})