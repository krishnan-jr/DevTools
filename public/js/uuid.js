let uuidMonacoEditor = null;
let uuidEditorInitialized = false;

export function setUUIDEditorValue(uuids) {
    if (!uuidMonacoEditor) return;
    const numbered = uuids.map((uuid) => `${uuid}`).join('\n');
    uuidMonacoEditor.setValue(numbered);
}

export async function fetchUUIDs(options) {
    const res = await fetch('/api/uuid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options)
    });
    if (!res.ok) throw new Error('Failed to generate UUIDs');
    const data = await res.json();
    return data.uuids || [];
}

export function getUUIDOptionsFromForm() {
    return {
        hyphens: document.getElementById('uuid-hyphens').checked,
        uppercase: document.getElementById('uuid-uppercase').checked,
        version: document.getElementById('uuid-version').value,
        count: Math.max(1, Math.min(20, parseInt(document.getElementById('uuid-count').value) || 1))
    };
}

function initializeUUIDEditor() {
    if (uuidEditorInitialized) return;
    const editorDiv = document.getElementById('uuid-editor');
    window.require(['vs/editor/editor.main'], function () {
        uuidMonacoEditor = window.monaco.editor.create(editorDiv, {
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
        uuidEditorInitialized = true;
        updateUUIDs();
    });
}

async function updateUUIDs() {
    const opts = getUUIDOptionsFromForm();
    setUUIDEditorValue(['Generating...']);
    try {
        const lines = await fetchUUIDs(opts);
        setUUIDEditorValue(lines);
    } catch (e) {
        setUUIDEditorValue(['Error generating UUIDs.']);
    }
}

export function showUUIDGeneratorScreen() {
    // Only initialize the editor if not already done
    if (!uuidEditorInitialized) {
        initializeUUIDEditor();
    } else {
        // If already initialized, force layout in case the div was hidden
        setTimeout(() => {
            uuidMonacoEditor.layout();
            updateUUIDs();
        }, 0);
    }
}

export function initUUIDGenerator() {
    const form = document.getElementById('uuid-config-form');
    const copyBtn = document.getElementById('copy-uuids');

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        updateUUIDs();
    });

    copyBtn.addEventListener('click', function () {
        if (!uuidMonacoEditor) return;
        const text = uuidMonacoEditor.getValue();
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

document.addEventListener('DOMContentLoaded', () => {
    const versionDropdown = document.getElementById('uuid-version-dropdown');
    if (versionDropdown) {
        const btn = document.getElementById('uuid-version-btn');
        const hidden = document.getElementById('uuid-version');
        versionDropdown.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                btn.textContent = this.textContent;
                hidden.value = this.getAttribute('data-value');
                versionDropdown.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }
}); 