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