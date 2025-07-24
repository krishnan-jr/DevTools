let json2tableEditor = null;
let json2tableEditorInitialized = false;
let lastTableData = [];

export function showJson2TableScreen() {
    if (!json2tableEditorInitialized) {
        initializeJson2TableEditor();
    } else {
        setTimeout(() => {
            json2tableEditor.layout();
            renderTable();
        }, 0);
    }
}

function initializeJson2TableEditor() {
    window.require(['vs/editor/editor.main'], function () {
        json2tableEditor = window.monaco.editor.create(document.getElementById('json2table-input-editor'), {
            value: '[]',
            language: 'json',
            theme: 'vs-dark',
            fontFamily: 'Funnel Sans, Fira Mono, Consolas, monospace',
            fontSize: 15,
            minimap: { enabled: false },
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            roundedSelection: false,
            scrollbar: { vertical: 'auto', horizontal: 'auto' }
        });
        json2tableEditorInitialized = true;
        json2tableEditor.onDidChangeModelContent(renderTable);
        renderTable();
    });
}

function parseJsonInput() {
    try {
        const val = json2tableEditor.getValue();
        const arr = JSON.parse(val);
        if (!Array.isArray(arr)) return [];
        return arr;
    } catch {
        return [];
    }
}

function renderTable() {
    const arr = parseJsonInput();
    lastTableData = arr;
    const container = document.getElementById('json2table-table-container');
    container.style.maxHeight = '600px';
    container.style.overflowY = 'auto';
    if (!arr.length) {
        container.innerHTML = '<div class="text-muted">No valid JSON array</div>';
        return;
    }
    // Collect all unique keys
    const keys = Array.from(new Set(arr.flatMap(obj => Object.keys(obj))));
    let html = '<table class="table table-dark table-bordered table-sm mb-0"><thead><tr>';
    for (const k of keys) html += `<th>${escapeHtml(k)}</th>`;
    html += '</tr></thead><tbody>';
    for (const row of arr) {
        html += '<tr>';
        for (const k of keys) html += `<td>${escapeHtml(row[k] ?? '')}</td>`;
        html += '</tr>';
    }
    html += '</tbody></table>';
    container.innerHTML = html;
}

function escapeHtml(str) {
    return String(str).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

function toDelimited(data, delimiter) {
    if (!data.length) return '';
    const keys = Array.from(new Set(data.flatMap(obj => Object.keys(obj))));
    const lines = [keys.map(escapeCsv).join(delimiter)];
    for (const row of data) {
        lines.push(keys.map(k => escapeCsv(row[k] ?? '')).join(delimiter));
    }
    return lines.join('\n');
}
function escapeCsv(val) {
    if (val == null) return '';
    const s = String(val);
    if (/[",\n;]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
}

function copyToClipboard(text) {
    if (!text) return;
    navigator.clipboard.writeText(text);
}

function downloadFile(text, filename, mime) {
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

async function downloadExcel(data) {
    const res = await fetch('/api/json2table/excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data })
    });
    if (!res.ok) throw new Error('Failed to generate Excel');
    const blob = await res.blob();
    downloadFile(await blob.arrayBuffer(), 'output.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
}

export function initJson2Table() {
    const pasteBtn = document.getElementById('json2table-paste');
    const copyBtn = document.getElementById('json2table-copy');
    const clearBtn = document.getElementById('json2table-clear');
    const copyAsMenu = document.querySelectorAll('#json2table-copyas + .dropdown-menu .dropdown-item');
    const saveAsMenu = document.querySelectorAll('#json2table-saveas + .dropdown-menu .dropdown-item');

    pasteBtn.addEventListener('click', async () => {
        const text = await navigator.clipboard.readText();
        if (json2tableEditor) json2tableEditor.setValue(text);
    });
    copyBtn.addEventListener('click', () => {
        if (json2tableEditor) copyToClipboard(json2tableEditor.getValue());
    });
    clearBtn.addEventListener('click', () => {
        if (json2tableEditor) json2tableEditor.setValue('');
    });

    copyAsMenu.forEach(item => {
        item.addEventListener('click', () => {
            const data = lastTableData;
            let text = '';
            if (item.dataset.format === 'csv') text = toDelimited(data, ',');
            else if (item.dataset.format === 'tsv') text = toDelimited(data, '\t');
            else if (item.dataset.format === 'scsv') text = toDelimited(data, ';');
            copyToClipboard(text);
        });
    });
    saveAsMenu.forEach(item => {
        item.addEventListener('click', async () => {
            const data = lastTableData;
            if (item.dataset.format === 'csv') downloadFile(toDelimited(data, ','), 'output.csv', 'text/csv');
            else if (item.dataset.format === 'tsv') downloadFile(toDelimited(data, '\t'), 'output.tsv', 'text/tab-separated-values');
            else if (item.dataset.format === 'scsv') downloadFile(toDelimited(data, ';'), 'output.csv', 'text/csv');
            else if (item.dataset.format === 'excel') await downloadExcel(data);
        });
    });
} 