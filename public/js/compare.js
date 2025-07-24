let compareOriginalEditor = null;
let compareModifiedEditor = null;
let compareDiffEditor = null;
let compareEditorsInitialized = false;

export function showCompareScreen() {
    if (!compareEditorsInitialized) {
        initializeCompareEditors();
    } else {
        setTimeout(() => {
            if (compareOriginalEditor) compareOriginalEditor.layout();
            if (compareModifiedEditor) compareModifiedEditor.layout();
            if (compareDiffEditor) compareDiffEditor.layout();
        }, 0);
    }
    updateCompareDiff();
}

function initializeCompareEditors() {
    window.require(['vs/editor/editor.main'], function () {
        const originalElem = document.getElementById('compare-original-editor');
        const modifiedElem = document.getElementById('compare-modified-editor');
        const diffElem = document.getElementById('compare-diff-editor');
        if (!originalElem || !modifiedElem || !diffElem) {
            console.error('Compare editor elements not found');
            return;
        }
        compareOriginalEditor = window.monaco.editor.create(originalElem, {
            value: '',
            language: 'plaintext',
            theme: 'vs-dark',
            fontFamily: 'Funnel Sans, Fira Mono, Consolas, monospace',
            fontSize: 15,
            minimap: { enabled: false },
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            roundedSelection: false,
        });
        compareModifiedEditor = window.monaco.editor.create(modifiedElem, {
            value: '',
            language: 'plaintext',
            theme: 'vs-dark',
            fontFamily: 'Funnel Sans, Fira Mono, Consolas, monospace',
            fontSize: 15,
            minimap: { enabled: false },
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            roundedSelection: false,
        });
        compareDiffEditor = window.monaco.editor.createDiffEditor(diffElem, {
            theme: 'vs-dark',
            fontFamily: 'Funnel Sans, Fira Mono, Consolas, monospace',
            fontSize: 15,
            minimap: { enabled: false },
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            roundedSelection: false,
            readOnly: true,
            renderSideBySide: true,
            originalEditable: false,
        });
        compareEditorsInitialized = true;
        compareOriginalEditor.onDidChangeModelContent(updateCompareDiff);
        compareModifiedEditor.onDidChangeModelContent(updateCompareDiff);
        // Paste/Copy buttons
        const origPaste = document.getElementById('compare-original-paste');
        const origCopy = document.getElementById('compare-original-copy');
        const modPaste = document.getElementById('compare-modified-paste');
        const modCopy = document.getElementById('compare-modified-copy');
        if (origPaste) origPaste.addEventListener('click', async () => {
            const text = await navigator.clipboard.readText();
            compareOriginalEditor.setValue(text);
        });
        if (origCopy) origCopy.addEventListener('click', () => {
            navigator.clipboard.writeText(compareOriginalEditor.getValue());
        });
        if (modPaste) modPaste.addEventListener('click', async () => {
            const text = await navigator.clipboard.readText();
            compareModifiedEditor.setValue(text);
        });
        if (modCopy) modCopy.addEventListener('click', () => {
            navigator.clipboard.writeText(compareModifiedEditor.getValue());
        });
    });
}

function updateCompareDiff() {
    if (!compareOriginalEditor || !compareModifiedEditor || !compareDiffEditor) return;
    const original = compareOriginalEditor.getValue();
    const modified = compareModifiedEditor.getValue();
    compareDiffEditor.setModel({
        original: window.monaco.editor.createModel(original, 'plaintext'),
        modified: window.monaco.editor.createModel(modified, 'plaintext'),
    });
}

export function initCompare() {
    // No-op for now
} 