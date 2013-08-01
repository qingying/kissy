KISSY.add('domlite/base/insertion',function(S,DOMLITE){

    var PARENT_NODE = 'parentNode';
    var getNodeName = DOMLITE.nodeName;
    var NodeType = DOMLITE.NodeType;
    var makeArray = S.makeArray;
    var R_SCRIPT_TYPE = /\/(java|ecma)script/i;
    var RE_FORM_EL = /^(?:button|input|object|select|textarea)$/i;

    function isJs(el) {
            return !el.type || R_SCRIPT_TYPE.test(el.type);
        }

    // extract script nodes and execute alone later
        function filterScripts(nodes, scripts) {
            var ret = [], i, el, nodeName;
            for (i = 0; nodes[i]; i++) {
                el = nodes[i];
                nodeName = getNodeName(el);
                if (el.nodeType == NodeType.DOCUMENT_FRAGMENT_NODE) {
                    ret.push.apply(ret, filterScripts(makeArray(el.childNodes), scripts));
                } else if (nodeName === 'script' && isJs(el)) {
                    // remove script to make sure ie9 does not invoke when append
                    if (el.parentNode) {
                        el.parentNode.removeChild(el)
                    }
                    if (scripts) {
                        scripts.push(el);
                    }
                } else {
                    if (el.nodeType == NodeType.ELEMENT_NODE &&
                        // ie checkbox getElementsByTagName 后造成 checked 丢失
                        !RE_FORM_EL.test(nodeName)) {
                        var tmp = [],
                            s,
                            j,
                            ss = el.getElementsByTagName('script');
                        for (j = 0; j < ss.length; j++) {
                            s = ss[j];
                            if (isJs(s)) {
                                tmp.push(s);
                            }
                        }
                        splice.apply(nodes, [i + 1, 0].concat(tmp));
                    }
                    ret.push(el);
                }
            }
            return ret;
        }

    // fragment is easier than nodelist
        function insertion(newNodes, refNodes, fn, scripts) {
            newNodes = DOMLITE.query(newNodes);

            if (scripts) {
                scripts = [];
            }

            // filter script nodes ,process script separately if needed
            newNodes = filterScripts(newNodes, scripts);

            // Resets defaultChecked for any radios and checkboxes
            // about to be appended to the DOM in IE 6/7
            if (DOM._fixInsertionChecked) {
                DOM._fixInsertionChecked(newNodes);
            }

            refNodes = DOM.query(refNodes);

            var newNodesLength = newNodes.length,
                newNode,
                i,
                refNode,
                node,
                clonedNode,
                refNodesLength = refNodes.length;

            if ((!newNodesLength && (!scripts || !scripts.length)) || !refNodesLength) {
                return;
            }

            // fragment 插入速度快点
            // 而且能够一个操作达到批量插入
            // refer: http://www.w3.org/TR/REC-DOM-Level-1/level-one-core.html#ID-B63ED1A3
            newNode = DOM._nodeListToFragment(newNodes);
            //fragment 一旦插入里面就空了，先复制下
            if (refNodesLength > 1) {
                clonedNode = DOM.clone(newNode, true);
                refNodes = S.makeArray(refNodes)
            }

            for (i = 0; i < refNodesLength; i++) {
                refNode = refNodes[i];
                if (newNode) {
                    //refNodes 超过一个，clone
                    node = i > 0 ? DOM.clone(clonedNode, true) : newNode;
                    fn(node, refNode);
                }
                if (scripts && scripts.length) {
                    S.each(scripts, evalScript);
                }
            }
        }

    S.mix(DOMLITE,{
        /**
         * Insert every element in the set of newNodes before every element in the set of refNodes.
         * @param {HTMLElement|HTMLElement[]} newNodes Nodes to be inserted
         * @param {HTMLElement|HTMLElement[]|String} refNodes Nodes to be referred
         * @param {Boolean} [loadScripts] whether execute script node
         */
        insertBefore: function (newNodes, refNodes, loadScripts) {
            insertion(newNodes, refNodes, function (newNode, refNode) {
                if (refNode[PARENT_NODE]) {
                    refNode[PARENT_NODE].insertBefore(newNode, refNode);
                }
            }, loadScripts);
        },

    })
},{
    requires:['./api']
});