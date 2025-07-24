// Password Generator Module
let monacoEditor = null;

export function setPasswordEditorValue(passwords) {
    if (!monacoEditor) return;
    const numbered = passwords.map((pw, i) => `${pw}`).join('\n');
    monacoEditor.setValue(numbered);
}

export async function fetchPasswords(options) {
    const res = await fetch('/api/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options)
    });
    if (!res.ok) throw new Error('Failed to generate passwords');
    const data = await res.json();
    return data.passwords || [];
}

export function getPasswordOptionsFromForm() {
    return {
        length: parseInt(document.getElementById('password-length').value) || 16,
        lowercase: document.getElementById('lowercase').checked,
        uppercase: document.getElementById('uppercase').checked,
        digits: document.getElementById('digits').checked,
        special: document.getElementById('special').checked,
        excluded: document.getElementById('excluded-chars').value,
        count: Math.max(1, Math.min(20, parseInt(document.getElementById('password-count').value) || 1))
    };
}

export function initPasswordGenerator() {
    const form = document.getElementById('password-config-form');
    const copyBtn = document.getElementById('copy-passwords');
    const editorDiv = document.getElementById('password-editor');

    // Monaco loader
    window.require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' } });
    window.require(['vs/editor/editor.main'], function () {
        monacoEditor = window.monaco.editor.create(editorDiv, {
            value: '',
            language: 'plaintext',
            theme: 'vs-dark',
            fontFamily: 'Funnel Sans, Fira Mono, Consolas, monospace',
            fontSize: 16,
            minimap: { enabled: false },
            lineNumbers: 'on',
            readOnly: true,
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            roundedSelection: false,
            scrollbar: { vertical: 'auto', horizontal: 'auto' }
        });
        updatePasswords();
    });

    async function updatePasswords() {
        const opts = getPasswordOptionsFromForm();
        setPasswordEditorValue(['Generating...']);
        try {
            const lines = await fetchPasswords(opts);
            setPasswordEditorValue(lines);
        } catch (e) {
            setPasswordEditorValue(['Error generating passwords.']);
        }
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        updatePasswords();
    });

    copyBtn.addEventListener('click', function () {
        if (!monacoEditor) return;
        const text = monacoEditor.getValue();
        if (!text.trim()) return;
        navigator.clipboard.writeText(text)
            .then(() => {
                copyBtn.innerHTML = '<i class="bi bi-clipboard-check"></i> Copied!';
                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="bi bi-clipboard"></i> Copy';
                }, 1200);
            });
    });
} 