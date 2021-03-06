/**
 * tree management utils
 * @author yiminghe@gmail.com
 */
KISSY.add("tree/tree-manager", function (S, Node, Component, Extension) {

    var KeyCode = Node.KeyCode;

    var UA = S.UA,
        ie = S.Env.host.document.documentMode || UA.ie,
        Features = S.Features,
        Gesture = Node.Gesture,
        isTouchEventSupported = Features.isTouchEventSupported();

    function TreeManager() {
    }

    TreeManager.ATTRS =
    /**
     * @lends Tree#
     */
    {
        /**
         * Whether show root node.
         * Defaults to: true.
         * @type {Boolean}
         */
        showRootNode: {
            value: true,
            view: 1
        },
        /**
         * Current selected tree node.
         * @type {KISSY.Tree.Node}
         * @readonly
         */
        selectedItem: {},

        // only root node is focusable
        focusable: {
            value: true
        }
    };

    function getIdFromNode(c) {
        var el = c.get("el");
        var id = el.attr("id");
        if (!id) {
            el.attr("id", id = S.guid("tree-node"));
        }
        return id;
    }

    S.augment(TreeManager, Extension.DelegateChildren, {

        isTree: 1,

        __bindUI: function () {

            var self = this,
                events = Gesture.start +
                    " " + Gesture.end +
                    " " + Gesture.tap;

            if (Gesture.cancel) {
                events += ' ' + Gesture.cancel;
            }

            if (!isTouchEventSupported) {
                events += (ie && ie < 9 ? "dblclick " : "");
            }

            self.get("el").on(events, self.handleChildrenEvents, self);
        },

        _register: function (c) {
            if (!c.__isRegisted) {
                getAllNodes(this)[getIdFromNode(c)] = c;
                c.__isRegisted = 1;
                //S.log("_register for " + c.get("content"));
            }
        },

        _unRegister: function (c) {
            if (c.__isRegisted) {
                delete getAllNodes(this)[getIdFromNode(c)];
                c.__isRegisted = 0;
                //S.log("_unRegister for " + c.get("content"));
            }
        },

        handleKeyEventInternal: function (e) {
            var current = this.get("selectedItem");
            if (e.keyCode == KeyCode.ENTER) {
                // 传递给真正的单个子节点
                return current.performActionInternal(e);
            }
            return current._keyNav(e);
        },


        /**
         * Get tree child node by comparing cached child nodes.
         * Faster than default mechanism.
         * @protected
         * @param e
         */
        getOwnerControl: function (e) {
            var self = this,
                target = e.target,
                n,
                allNodes = getAllNodes(self),
                elem = self.get("el")[0];
            while (target && target !== elem) {
                if (n = allNodes[target.id]) {
                    return n;
                }
                target = target.parentNode;
            }
            // 最终自己处理
            // 所以根节点不用注册！
            return self;
        },

        // 单选
        '_onSetSelectedItem': function (n, ev) {
            // 仅用于排他性
            if (n && ev.prevVal) {
                ev.prevVal.set("selected", false, {
                    data: {
                        byPassSetTreeSelectedItem: 1
                    }
                });
            }
        },

        _onSetFocused: function (v) {
            var self = this;
            Component.Controller.prototype._onSetFocused.apply(self, arguments);
            // 得到焦点时没有选择节点
            // 默认选择自己
            if (v && !self.get("selectedItem")) {
                self.select();
            }
        }
    });

    /*
     加快从事件代理获取原事件节点
     */
    function getAllNodes(self) {
        if (!self._allNodes) {
            self._allNodes = {};
        }
        return self._allNodes;
    }

    return TreeManager;
}, {
    requires: ['node', 'component/base', 'component/extension']
});