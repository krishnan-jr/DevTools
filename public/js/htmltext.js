let htmltextInputEditor = null;
let htmltextOutputEditor = null;
let htmltextEditorsInitialized = false;

export function showHtmltextScreen() {
    if (!htmltextEditorsInitialized) {
        initializeHtmltextEditors();
    } else {
        setTimeout(() => {
            htmltextInputEditor.layout();
            htmltextOutputEditor.layout();
        }, 0);
    }
    updateHtmltextOutput();
}

function initializeHtmltextEditors() {
    window.require(['vs/editor/editor.main'], function () {
        htmltextInputEditor = window.monaco.editor.create(document.getElementById('htmltext-input-editor'), {
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
        htmltextOutputEditor = window.monaco.editor.create(document.getElementById('htmltext-output-editor'), {
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
        htmltextEditorsInitialized = true;
        htmltextInputEditor.onDidChangeModelContent(updateHtmltextOutput);
        document.getElementById('htmltext-paste').addEventListener('click', async () => {
            const text = await navigator.clipboard.readText();
            htmltextInputEditor.setValue(text);
        });
        document.getElementById('htmltext-clear').addEventListener('click', () => {
            htmltextInputEditor.setValue('');
        });
        document.getElementById('htmltext-copy').addEventListener('click', () => {
            navigator.clipboard.writeText(htmltextOutputEditor.getValue());
        });
    });
}

async function updateHtmltextOutput() {
    if (!htmltextInputEditor || !htmltextOutputEditor) return;
    const input = htmltextInputEditor.getValue();
    
    if (!input.trim()) {
        htmltextOutputEditor.setValue('');
        updateHtmlEntityDetails('', '');
        return;
    }
    
    try {
        const response = await fetch('/api/htmltext', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: input,
                operation: 'auto'
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        htmltextOutputEditor.setValue(result.output);
        updateHtmlEntityDetails(result);
    } catch (error) {
        console.error('Error processing HTML text:', error);
        htmltextOutputEditor.setValue('Error: ' + error.message);
        updateHtmlEntityDetails({ input: input, output: 'Error occurred', entities: [] });
    }
}



function updateHtmlEntityDetails(result) {
    const detailsDiv = document.getElementById('htmltext-details-entities');
    let html = '';
    
    if (!result || !result.input) {
        detailsDiv.innerHTML = '<div class="text-muted small">Enter text to see details.</div>';
        return;
    }
    
    html += '<div class="mb-2"><span class="fw-bold">Operation:</span> ' + (result.operation || 'auto') + '</div>';
    html += '<div class="mb-2"><span class="fw-bold">Input:</span><br><pre style="white-space:pre-wrap;word-break:break-all;overflow-wrap:anywhere;">' + escapeHtml(result.input) + '</pre></div>';
    html += '<div class="mb-2"><span class="fw-bold">Output:</span><br><pre style="white-space:pre-wrap;word-break:break-all;overflow-wrap:anywhere;">' + escapeHtml(result.output) + '</pre></div>';
    
    if (result.entities && result.entities.length > 0) {
        html += '<div class="mb-2"><span class="fw-bold">Entities Found (' + result.entityCount + '):</span>';
        html += '<table class="table table-dark table-sm mb-0"><thead><tr><th>Character</th><th>Entity</th><th>Count</th></tr></thead><tbody>';
        for (const entity of result.entities) {
            const char = entity.character || entity.entity;
            const ent = entity.entity || entity.character;
            const count = entity.count || 1;
            html += '<tr><td>' + escapeHtml(char) + '</td><td>' + escapeHtml(ent) + '</td><td>' + count + '</td></tr>';
        }
        html += '</tbody></table></div>';
    } else {
        html += '<div class="text-muted small">No HTML entities detected.</div>';
    }
    
    detailsDiv.innerHTML = html;
}

function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
}

export function initHtmltext() {
    // No-op for now, all logic is in showHtmltextScreen
} 