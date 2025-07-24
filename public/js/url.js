let urlInputEditor = null;
let urlOutputEditor = null;
let urlEditorsInitialized = false;

export function showUrlScreen() {
    if (!urlEditorsInitialized) {
        initializeUrlEditors();
    } else {
        setTimeout(() => {
            urlInputEditor.layout();
            urlOutputEditor.layout();
        }, 0);
    }
    updateUrlOutput();
}

function initializeUrlEditors() {
    window.require(['vs/editor/editor.main'], function () {
        urlInputEditor = window.monaco.editor.create(document.getElementById('url-input-editor'), {
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
        urlOutputEditor = window.monaco.editor.create(document.getElementById('url-output-editor'), {
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
            readOnly: true,
        });
        urlEditorsInitialized = true;
        urlInputEditor.onDidChangeModelContent(updateUrlOutput);
        document.getElementById('url-paste').addEventListener('click', async () => {
            const text = await navigator.clipboard.readText();
            urlInputEditor.setValue(text);
        });
        document.getElementById('url-clear').addEventListener('click', () => {
            urlInputEditor.setValue('');
        });
        document.getElementById('url-copy').addEventListener('click', () => {
            navigator.clipboard.writeText(urlOutputEditor.getValue());
        });
    });
}

function updateUrlOutput() {
    if (!urlInputEditor || !urlOutputEditor) return;
    const input = urlInputEditor.getValue();
    let output = '';
    let decoded = input;
    // Auto-detect: if input is decodable, decode; else encode
    if (isProbablyEncoded(input)) {
        try {
            decoded = decodeURIComponent(input);
            output = decoded;
        } catch {
            output = '';
        }
    } else {
        try {
            output = encodeURIComponent(input);
        } catch {
            output = '';
        }
    }
    urlOutputEditor.setValue(output);
    updateUrlDetails(decoded);
}

function isProbablyEncoded(str) {
    // Heuristic: if it contains %XX, it's probably encoded
    return /%[0-9A-Fa-f]{2}/.test(str);
}

function updateUrlDetails(input) {
    const detailsDiv = document.getElementById('url-details-params');
    let url;
    try {
        url = new URL(input);
    } catch {
        detailsDiv.innerHTML = '<div class="text-muted small">No valid URL detected.</div>';
        return;
    }
    let html = '<div class="mb-2" style="word-break:break-all;overflow-wrap:anywhere;"><span class="fw-bold">Origin:</span> ' + escapeHtml(url.origin) + '</div>';
    html += '<div class="mb-2" style="word-break:break-all;overflow-wrap:anywhere;"><span class="fw-bold">Path:</span> ' + escapeHtml(url.pathname) + '</div>';
    html += '<div class="mb-2" style="word-break:break-all;overflow-wrap:anywhere;"><span class="fw-bold">Hash:</span> ' + escapeHtml(url.hash) + '</div>';
    html += '<div class="mb-2"><span class="fw-bold">Query Parameters:</span>';
    if (url.searchParams && Array.from(url.searchParams).length > 0) {
        html += '<ul class="mb-0">';
        for (const [key, value] of url.searchParams.entries()) {
            html += '<li style="word-break:break-all;overflow-wrap:anywhere;"><span class="text-info">' + escapeHtml(key) + '</span>: ' + escapeHtml(value) + '</li>';
        }
        html += '</ul>';
    } else {
        html += ' <span class="text-muted">None</span>';
    }
    html += '</div>';
    detailsDiv.innerHTML = html;
}

function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
}

export function initUrl() {
    // No-op for now, all logic is in showUrlScreen
} 