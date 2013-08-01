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