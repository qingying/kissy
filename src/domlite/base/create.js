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

     // ��ӳ�Ա��Ԫ����
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
     // �� nodeList ת��Ϊ fragment
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
            // html Ϊ <style></style> ʱ���У�����������Ԫ�أ�
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

    // ��¡�����¼��� data
    function cloneWithDataAndEvent(src, dest) {
           var DOMEvent = S.require('event/dom'),
               srcData,
               d;

           if (dest.nodeType == NodeType.ELEMENT_NODE && !DOMLITE.hasData(src)) {
               return;
           }

           srcData = DOMLITE.data(src);

           // ǳ��¡��data Ҳ���ڿ�¡�ڵ���
           for (d in srcData) {
               DOMLITE.data(dest, d, srcData[d]);
           }

           // �¼�Ҫ�����
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
            /*���������html��ǩ������һ���ı��ڵ�*/
            if (!R_HTML.test(html)) {
                ret = context.createTextNode(html);
            }// �� tag, ���� DOM.create('<p>')
            else if ((m = RE_SIMPLE_TAG.exec(html))) {
                ret = context.createElement(m[1]);
            }
             // ������������� DOM.create('<img src='sprite.png' />')
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
                        //removeChild �����Ƴ��Ľڵ�
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
                                            /*��ԭ��������������¼���ȥ��*/
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


                        // runtime ����¼�ģ��
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