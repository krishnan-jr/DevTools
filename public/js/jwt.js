let jwtInputEditor = null;
let jwtOutputEditor = null;
let jwtEditorsInitialized = false;

export function showJwtScreen() {
    if (!jwtEditorsInitialized) {
        initializeJwtEditors();
    } else {
        setTimeout(() => {
            if (jwtInputEditor) jwtInputEditor.layout();
            if (jwtOutputEditor) jwtOutputEditor.layout();
        }, 0);
    }
    updateJwtOutput();
}

function initializeJwtEditors() {
    window.require(['vs/editor/editor.main'], function () {
        const inputElement = document.getElementById('jwt-input-editor');
        const outputElement = document.getElementById('jwt-output-editor');
        
        if (!inputElement || !outputElement) {
            console.error('JWT editor elements not found');
            return;
        }
        
        jwtInputEditor = window.monaco.editor.create(inputElement, {
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
        jwtOutputEditor = window.monaco.editor.create(outputElement, {
            value: '',
            language: 'json',
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
        jwtEditorsInitialized = true;
        if (jwtInputEditor) {
            jwtInputEditor.onDidChangeModelContent(updateJwtOutput);
        }
        
        const pasteBtn = document.getElementById('jwt-paste');
        const clearBtn = document.getElementById('jwt-clear');
        const copyBtn = document.getElementById('jwt-copy');
        
        if (pasteBtn) {
            pasteBtn.addEventListener('click', async () => {
                const text = await navigator.clipboard.readText();
                if (jwtInputEditor) jwtInputEditor.setValue(text);
            });
        }
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (jwtInputEditor) jwtInputEditor.setValue('');
            });
        }
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                if (jwtOutputEditor) navigator.clipboard.writeText(jwtOutputEditor.getValue());
            });
        }
    });
}

function updateJwtOutput() {
    if (!jwtInputEditor || !jwtOutputEditor) {
        console.warn('JWT editors not initialized');
        return;
    }
    const input = jwtInputEditor.getValue().trim();
    let decoded = { header: null, payload: null, signature: null };
    let output = '';
    let claimsHtml = '';
    if (input.split('.').length === 3) {
        const [headerB64, payloadB64, signatureB64] = input.split('.');
        try {
            decoded.header = JSON.parse(atobUrlSafe(headerB64));
        } catch { decoded.header = null; }
        try {
            decoded.payload = JSON.parse(atobUrlSafe(payloadB64));
        } catch { decoded.payload = null; }
        decoded.signature = signatureB64 || null;
        output = JSON.stringify({ header: decoded.header, payload: decoded.payload }, null, 2);
        claimsHtml = renderClaims(decoded);
    } else {
        output = '';
        claimsHtml = '<div class="text-muted small">No valid JWT detected.</div>';
    }
    if (jwtOutputEditor) {
        jwtOutputEditor.setValue(output);
    }
    const claimsElement = document.getElementById('jwt-details-claims');
    if (claimsElement) {
        claimsElement.innerHTML = claimsHtml;
    }
}

function atobUrlSafe(str) {
    // Convert base64url to base64
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) str += '=';
    return atob(str);
}

function renderClaims(decoded) {
    let html = '';
    if (decoded.header) {
        html += '<div class="mb-2"><span class="fw-bold">Header:</span><br><pre style="white-space:pre-wrap;word-break:break-all;overflow-wrap:anywhere;">' + escapeHtml(JSON.stringify(decoded.header, null, 2)) + '</pre></div>';
    }
    if (decoded.payload) {
        html += '<div class="mb-2"><span class="fw-bold">Payload (Claims):</span><br><pre style="white-space:pre-wrap;word-break:break-all;overflow-wrap:anywhere;">' + escapeHtml(JSON.stringify(decoded.payload, null, 2)) + '</pre></div>';
    }
    if (decoded.signature) {
        html += '<div class="mb-2"><span class="fw-bold">Signature:</span> <span class="text-info">' + escapeHtml(decoded.signature) + '</span></div>';
    }
    if (!decoded.header && !decoded.payload) {
        html += '<div class="text-muted small">No valid JWT detected.</div>';
    }
    return html;
}

function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
}

export function initJwt() {
    // No-op for now, all logic is in showJwtScreen
} 