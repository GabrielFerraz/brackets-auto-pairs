/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, brackets, $ */

define(function (require, exports, module) {
    
    'use strict';
    
    var AppInit         = brackets.getModule('utils/AppInit'),
        EditorManager   = brackets.getModule('editor/EditorManager'),
        DocumentManager = brackets.getModule('document/DocumentManager');
    
    var editor, selection;
    var modifier = '';
    var supportedKeys = {
        "U+00DE": {
            'S': {
                start: '"',
                end: '"'
            },
            '': {
                start: "'",
                end: "'"
            }
        },
        "U+0039": {
            'S': {
                start: "(",
                end: ")"
            }
        },
        "U+00DB": {
            'S': {
                start: "{",
                end: "}"
            },
            '': {
                start: "[",
                end: "]"
            }
        }
    };
    
    /**
    * Performs auto pairing
    */
    function action(key) {
        // undoes write
        editor._codeMirror.undo();
        // gets last selection
        selection = editor._codeMirror.getSelection();
        // does rewrite
        selection = key.start + selection + key.end;
        editor._codeMirror.replaceSelection(selection);
        // set cursor if just pairs
        if (selection.length < 3) {
            var pos = editor._codeMirror.getCursor("start");
            pos.ch -= 1;
            editor._codeMirror.setCursor(pos);
        }
    }
    
    /**
    * Gets and validates correct key 
    */
    function getKey(keyCode) {
        var key = supportedKeys[keyCode];
        if (key !== undefined) {
            key = key[modifier];
            if (key !== undefined) {
                return key;
            }
        }
        return false;
    }
    
    /**
    * Checks which key is pressed
    */
    function keyUp(instance, event) {
        var keyCode = event.keyIdentifier;
        if (keyCode === 'Shift') {
            modifier = '';
        } else {
            var key = getKey(keyCode);
            if (key) {
                action(key);
            }
        }
    }
    
    /**
    * Checks for shift
    */
    function shiftCheck(instance, event) {
        var keyCode = event.keyIdentifier;
        if (keyCode === 'Shift') {
            modifier = 'S';
        }
    }
    
    /**
    * Sets bindings
    */
    function update() {
        editor = EditorManager.getCurrentFullEditor();
        if (editor) {
            editor._codeMirror.off('keyup', keyUp);
            editor._codeMirror.off('keydown', shiftCheck);
            editor._codeMirror.on('keyup', keyUp);
            editor._codeMirror.on('keydown', shiftCheck);
        }
    }
    
    AppInit.appReady(update);
    $(DocumentManager).on('currentDocumentChange', update);
    
});