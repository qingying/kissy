KISSY.add('domlite/base/attr', function (S, DOM) {
        var NodeType = DOM.NodeType;
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
            };


            S.mix(DOM,
            {
                /**
                * Get the value of a property for the first element in the set of matched elements.
                * or
                * Set one or more properties for the set of matched elements.
                * @param {HTMLElement[]|String|HTMLElement} selector matched elements
                * @param {String|Object} name
                * The name of the property to set.
                * or
                * A map of property-value pairs to set.
                * @param [value] A value to set for the property.
                * @return {String|undefined|Boolean}
                */
                prop:function (selector, name, value) {
                    var elems = DOM.query(selector),
                        i,
                        elem,
                        hook;

                    if (S.isPlainObject(name)) {
                        S.each(name, function (v, k) {
                            DOM.prop(elems, k, v);
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
                /**
                * Whether one of the matched elements has specified property name
                * @param {HTMLElement[]|String|HTMLElement} selector 元素
                * @param {String} name The name of property to test
                * @return {Boolean}
                */
                hasProp:function (selector, name) {
                    var elems = DOM.query(selector),
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
                /**
                * Remove a property for the set of matched elements.
                * @param {HTMLElement[]|String|HTMLElement} selector matched elements
                * @param {String} name The name of the property to remove.
                */
                removeProp:function (selector, name) {
                    name = propFix[ name ] || name;
                    var elems = DOM.query(selector),
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
                /**
                * Get the value of an attribute for the first element in the set of matched elements.
                * or
                * Set one or more attributes for the set of matched elements.
                * @param {HTMLElement[]|HTMLElement|String} selector matched elements
                * @param {String|Object} name The name of the attribute to set. or A map of attribute-value pairs to set.
                * @param [val] A value to set for the attribute.
                * @param [pass] for internal use
                * @return {String}
                */
                attr:function (selector, name, val, pass) {
                    var els = DOM.query(selector),
                        attrNormalizer,
                        i,
                        el = els[0],
                        ret;

                    // supports hash
                    if (S.isPlainObject(name)) {
                        pass = val;
                        for (var k in name) {
                            DOM.attr(els, k, name[k], pass);
                        }
                        return undefined;
                    }

                    // attr functions
                    if (pass && attrFn[name]) {
                        return DOM[name](selector, val);
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

                /**
                * Remove an attribute from each element in the set of matched elements.
                * @param {HTMLElement[]|String} selector matched elements
                * @param {String} name An attribute to remove
                */
                removeAttr:function (selector, name) {
                    name = name.toLowerCase();
                    var els = DOM.query(selector),
                        propName,
                        el, i;

                    for (i = els.length - 1; i >= 0; i--) {
                        el = els[i];
                        if (el.nodeType == NodeType.ELEMENT_NODE) {
                            el.removeAttribute(name);
                        }
                    }
                },

                /**
                * Whether one of the matched elements has specified attribute
                * @method
                * @param {HTMLElement[]|String} selector matched elements
                * @param {String} name The attribute to be tested
                * @return {Boolean}
                */
                hasAttr:function (selector, name) {
                    var elems = DOM.query(selector), i,
                        len = elems.length;
                    for (i = 0; i < len; i++) {
                        //使用原生实现
                        if (elems[i].hasAttribute(name)) {
                            return true;
                        }
                    }
                    return false;
                },
                /**
                * Get the current value of the first element in the set of matched elements.
                * or
                * Set the value of each element in the set of matched elements.
                * @param {HTMLElement[]|String} selector matched elements
                * @param {String|String[]} [value] A string of text or an array of strings corresponding to the value of each matched element to set as selected/checked.
                * @return {undefined|String|String[]|Number}
                */
                val:function (selector, value) {
                    var elem, els, i, val;
                    if (value === undefined) {
                        elem = DOM.get(selector);

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
                        els = DOM.query(selector);
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
                /**
                * Get the combined text contents of each element in the set of matched elements, including their descendants.
                * or
                * Set the content of each element in the set of matched elements to the specified text.
                * @param {HTMLElement[]|HTMLElement|String} selector matched elements
                * @param {String} [val] A string of text to set as the content of each matched element.
                * @return {String|undefined}
                */
                text:function (selector, val) {
                    var el, els, i, nodeType;
                    if (val === undefined) {
                        // supports css selector/Node/NodeList
                        el = DOM.get(selector);
                        return el.textContent;
                    } else {
                        els = DOM.query(selector);
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

        return DOM;
    },
    {
        requires:['./api']
    });