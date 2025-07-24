let textMonacoEditor = null;
let textEditorInitialized = false;
let originalText = '';
let originalTextSet = false;

function getText() {
    return textMonacoEditor ? textMonacoEditor.getValue() : '';
}
function setText(val) {
    if (textMonacoEditor) textMonacoEditor.setValue(val);
}

function updateStats() {
    if (!textMonacoEditor) return;
    const text = getText();
    const selection = textMonacoEditor.getSelection();
    const model = textMonacoEditor.getModel();
    const stats = {
        length: text.length,
        start: model.getOffsetAt(selection.getStartPosition()),
        end: model.getOffsetAt(selection.getEndPosition()),
        line: selection.startLineNumber,
        column: selection.startColumn,
        bytes: new TextEncoder().encode(text).length,
        chars: text.length,
        words: (text.match(/\b\w+\b/g) || []).length,
        sentences: (text.match(/[.!?]+/g) || []).length,
        paragraphs: (text.match(/\n{2,}/g) || []).length + 1,
        lines: model.getLineCount(),
        linebreak: text.includes('\r\n') ? 'CRLF (\r\n)' : (text.includes('\n') ? 'LF (\n)' : 'Unknown')
    };
    document.getElementById('stat-length').textContent = stats.length;
    document.getElementById('stat-start').textContent = stats.start;
    document.getElementById('stat-end').textContent = stats.end;
    document.getElementById('stat-line').textContent = stats.line;
    document.getElementById('stat-column').textContent = stats.column;
    document.getElementById('stat-bytes').textContent = stats.bytes;
    document.getElementById('stat-chars').textContent = stats.chars;
    document.getElementById('stat-words').textContent = stats.words;
    document.getElementById('stat-sentences').textContent = stats.sentences;
    document.getElementById('stat-paragraphs').textContent = stats.paragraphs;
    document.getElementById('stat-lines').textContent = stats.lines;
    document.getElementById('stat-linebreak').textContent = stats.linebreak;
}

function setOriginalTextIfNeeded() {
    if (!originalTextSet && getText().trim() !== '') {
        originalText = getText();
        originalTextSet = true;
        document.getElementById('btn-show-original').disabled = false;
    }
}

function transformText(type) {
    setOriginalTextIfNeeded();
    let text = getText();
    switch (type) {
        case 'lower': return text.toLowerCase();
        case 'upper': return text.toUpperCase();
        case 'sentence': return text.replace(/(^|[.!?]\s+)([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase());
        case 'title': return text.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase());
        case 'camel': return text.replace(/(?:^|\s|_|-)(\w)/g, (m, c, o) => c ? c.toUpperCase() : '').replace(/^./, c => c.toLowerCase());
        case 'pascal': return text.replace(/(?:^|\s|_|-)(\w)/g, (m, c) => c ? c.toUpperCase() : '');
        case 'snake': return text.replace(/\W+/g, '_').replace(/^_+|_+$/g, '').toLowerCase();
        case 'constant': return text.replace(/\W+/g, '_').replace(/^_+|_+$/g, '').toUpperCase();
        case 'kebab': return text.replace(/\W+/g, '-').replace(/^-+|-+$/g, '').toLowerCase();
        case 'cobol': return text.replace(/\W+/g, '-').replace(/^-+|-+$/g, '').toUpperCase();
        case 'train': return text.replace(/\W+/g, '-').replace(/^-+|-+$/g, '').replace(/\b\w/g, c => c.toUpperCase());
        case 'alt': return text.split('').map((c, i) => i % 2 ? c.toUpperCase() : c.toLowerCase()).join('');
        case 'inverse': return text.split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join('');
        case 'random': return text.split('').map(c => Math.random() > 0.5 ? c.toUpperCase() : c.toLowerCase()).join('');
        default: return text;
    }
}

function sortLines(type) {
    setOriginalTextIfNeeded();
    let lines = getText().split(/\r?\n/);
    switch (type) {
        case 'alpha': lines.sort((a, b) => a.localeCompare(b)); break;
        case 'reverse-alpha': lines.sort((a, b) => b.localeCompare(a)); break;
        case 'last-word': lines.sort((a, b) => {
            const la = a.trim().split(/\s+/).pop() || '';
            const lb = b.trim().split(/\s+/).pop() || '';
            return la.localeCompare(lb);
        }); break;
        case 'reverse-last-word': lines.sort((a, b) => {
            const la = a.trim().split(/\s+/).pop() || '';
            const lb = b.trim().split(/\s+/).pop() || '';
            return lb.localeCompare(la);
        }); break;
        case 'reverse': lines.reverse(); break;
        case 'random': for (let i = lines.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [lines[i], lines[j]] = [lines[j], lines[i]]; } break;
        default: break;
    }
    return lines.join('\n');
}

function convertLineBreak(type) {
    setOriginalTextIfNeeded();
    let text = getText();
    if (type === 'lf') return text.replace(/\r\n/g, '\n');
    if (type === 'crlf') return text.replace(/(?<!\r)\n/g, '\r\n');
    return text;
}

export function showTextAnalyzerScreen() {
    if (!textEditorInitialized) {
        initializeTextEditor();
    } else {
        setTimeout(() => {
            textMonacoEditor.layout();
            updateStats();
        }, 0);
    }
}

function initializeTextEditor() {
    const editorDiv = document.getElementById('text-editor');
    window.require(['vs/editor/editor.main'], function () {
        textMonacoEditor = window.monaco.editor.create(editorDiv, {
            value: '',
            language: 'plaintext',
            theme: 'vs-dark',
            fontFamily: 'Funnel Sans, Fira Mono, Consolas, monospace',
            fontSize: 16,
            minimap: { enabled: false },
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            roundedSelection: false,
            scrollbar: { vertical: 'auto', horizontal: 'auto' }
        });
        textEditorInitialized = true;
        textMonacoEditor.onDidChangeModelContent(updateStats);
        textMonacoEditor.onDidChangeCursorSelection(updateStats);
        updateStats();
    });
}

export function initTextAnalyzer() {
    // Line break buttons
    document.getElementById('btn-lf').onclick = () => setText(convertLineBreak('lf'));
    document.getElementById('btn-crlf').onclick = () => setText(convertLineBreak('crlf'));

    // Case buttons
    document.querySelectorAll('[data-case]').forEach(btn => {
        btn.onclick = () => setText(transformText(btn.getAttribute('data-case')));
    });

    // Sort buttons
    document.querySelectorAll('[data-sort]').forEach(btn => {
        btn.onclick = () => setText(sortLines(btn.getAttribute('data-sort')));
    });

    // Paste
    document.getElementById('btn-paste').onclick = async () => {
        const text = await navigator.clipboard.readText();
        setText(text);
        setOriginalTextIfNeeded();
    };
    // Copy
    document.getElementById('btn-copy').onclick = () => {
        const text = getText();
        if (!text.trim()) return;
        navigator.clipboard.writeText(text);
    };
    // Clear
    document.getElementById('btn-clear').onclick = () => setText('');
    // Show original
    document.getElementById('btn-show-original').onclick = () => {
        if (originalTextSet && originalText) {
            setText(originalText);
            document.getElementById('btn-show-original').disabled = true;
            originalTextSet = false;
        }
    };
} 