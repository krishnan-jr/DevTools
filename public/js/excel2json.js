let excelJsonEditor = null;
let excelJsonEditorInitialized = false;

export function showExcel2JsonScreen() {
    if (!excelJsonEditorInitialized) {
        initializeExcelJsonEditor();
    } else {
        setTimeout(() => {
            excelJsonEditor.layout();
        }, 0);
    }
}

function stripBomAndInvisible(str) {
    // Remove BOM and invisible chars at start
    return str.replace(/^[\uFEFF\u200B\u200C\u200D\u200E\u200F]+/, '');
}

function initializeExcelJsonEditor() {
    window.require(['vs/editor/editor.main'], function () {
        excelJsonEditor = window.monaco.editor.create(document.getElementById('excel-json-editor'), {
            value: '',
            language: 'json',
            theme: 'vs-dark',
            fontFamily: 'Funnel Sans, Fira Mono, Consolas, monospace',
            fontSize: 15,
            minimap: { enabled: false },
            lineNumbers: 'on',
            readOnly: true,
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            roundedSelection: false,
            scrollbar: { vertical: 'auto', horizontal: 'auto' }
        });
        excelJsonEditorInitialized = true;
    });
}

function setJsonOutput(json) {
    if (excelJsonEditor) {
        let str = typeof json === 'string' ? json : JSON.stringify(json, null, 2);
        str = stripBomAndInvisible(str);
        excelJsonEditor.setValue(str);
    }
}

async function uploadFile(file, headerRow) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('headerRow', headerRow);
    const res = await fetch('/api/excel2json', {
        method: 'POST',
        body: formData
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to convert file');
    }
    const data = await res.json();
    return data.json;
}

export function initExcel2Json() {
    const dropArea = document.getElementById('excel-drop-area');
    const fileInput = document.getElementById('excel-file-input');
    const selectedFilename = document.getElementById('excel-selected-filename');
    const headerRowInput = document.getElementById('excel-header-row');
    const copyBtn = document.getElementById('excel-json-copy');
    const downloadBtn = document.getElementById('excel-json-download');

    // Drag & drop
    dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropArea.classList.add('border-primary');
    });
    dropArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropArea.classList.remove('border-primary');
    });
    dropArea.addEventListener('drop', async (e) => {
        e.preventDefault();
        dropArea.classList.remove('border-primary');
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    });

    // Browse
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            if (selectedFilename) selectedFilename.textContent = file.name;
            handleFile(file);
        } else {
            if (selectedFilename) selectedFilename.textContent = '';
        }
    });
    // Only rely on label's default behavior, do not add extra click handler

    // Header row change triggers re-upload if file is present
    let lastFile = null;
    headerRowInput.addEventListener('change', () => {
        if (lastFile) handleFile(lastFile);
    });

    // Copy JSON
    copyBtn.addEventListener('click', () => {
        if (!excelJsonEditor) return;
        const text = excelJsonEditor.getValue();
        if (!text.trim()) return;
        navigator.clipboard.writeText(text);
    });

    // Download JSON
    downloadBtn.addEventListener('click', () => {
        if (!excelJsonEditor) return;
        const text = excelJsonEditor.getValue();
        if (!text.trim()) return;
        const blob = new Blob([text], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'output.json';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    });

    async function handleFile(file) {
        lastFile = file;
        setJsonOutput(['Converting...']);
        try {
            const headerRow = headerRowInput.value || 1;
            const json = await uploadFile(file, headerRow);
            setJsonOutput(json);
        } catch (e) {
            setJsonOutput([e.message]);
        }
    }
} 