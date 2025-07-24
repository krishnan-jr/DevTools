let filereaderEditor = null;
let filereaderEditorInitialized = false;
let filereaderDomInitialized = false;
let lastFile = null;

export function showFileReaderScreen() {
    if (!filereaderDomInitialized) {
        initFileReaderDom();
    }
    if (!filereaderEditorInitialized) {
        initializeFileReaderEditor();
    } else {
        setTimeout(() => filereaderEditor.layout(), 0);
    }
}

function initializeFileReaderEditor() {
    window.require(['vs/editor/editor.main'], function () {
        filereaderEditor = window.monaco.editor.create(document.getElementById('filereader-output-editor'), {
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
            scrollbar: { vertical: 'auto', horizontal: 'auto' }
        });
        filereaderEditorInitialized = true;
    });
}

export function initFileReader() {
    // No-op: all DOM event listeners are set up in showFileReaderScreen via initFileReaderDom
}

function initFileReaderDom() {
    const dropArea = document.getElementById('filereader-drop-area');
    const fileInput = document.getElementById('filereader-file-input');
    const selectedFilename = document.getElementById('filereader-selected-filename');
    const readMode = document.getElementById('filereader-readmode');
    const generateBtn = document.getElementById('filereader-generate');

    if (!dropArea || !fileInput || !readMode || !generateBtn) return;

    // Drag & drop
    dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropArea.classList.add('border-primary');
    });
    dropArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropArea.classList.remove('border-primary');
    });
    dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dropArea.classList.remove('border-primary');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            lastFile = e.dataTransfer.files[0];
            generateBtn.disabled = false;
        }
    });
    // Browse
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            if (selectedFilename) selectedFilename.textContent = file.name;
            lastFile = file;
            generateBtn.disabled = false;
        } else {
            if (selectedFilename) selectedFilename.textContent = '';
            lastFile = null;
            generateBtn.disabled = true;
        }
    });

    // Disable generate if no file
    generateBtn.disabled = true;

    generateBtn.addEventListener('click', () => {
        if (!lastFile) {
            setOutput('No file selected.');
            return;
        }
        handleFile(lastFile, readMode.value);
    });

    filereaderDomInitialized = true;
}

document.addEventListener('DOMContentLoaded', () => {
    const readmodeDropdown = document.getElementById('filereader-readmode-dropdown');
    if (readmodeDropdown) {
        const btn = document.getElementById('filereader-readmode-btn');
        const hidden = document.getElementById('filereader-readmode');
        readmodeDropdown.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                btn.textContent = this.textContent;
                hidden.value = this.getAttribute('data-value');
                readmodeDropdown.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }
});

function handleFile(file, mode) {
    const reader = new FileReader();
    reader.onerror = () => {
        setOutput('Error reading file.');
    };
    reader.onload = (e) => {
        let val = e.target.result;
        if (mode === 'readAsArrayBuffer') {
            val = arrayBufferToHex(val);
        }
        setOutput(val);
    };
    if (mode === 'readAsDataURL') reader.readAsDataURL(file);
    else if (mode === 'readAsArrayBuffer') reader.readAsArrayBuffer(file);
    else if (mode === 'readAsText') reader.readAsText(file);
    else if (mode === 'readAsBinaryString') reader.readAsBinaryString(file);
}

function setOutput(val) {
    if (filereaderEditor) filereaderEditor.setValue(typeof val === 'string' ? val : '');
}

function arrayBufferToHex(buffer) {
    const arr = new Uint8Array(buffer);
    return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join(' ');
} 