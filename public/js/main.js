import { initPasswordGenerator } from './password.js';
import { initUUIDGenerator, showUUIDGeneratorScreen } from './uuid.js';
import { initTextAnalyzer, showTextAnalyzerScreen } from './text.js';
import { initExcel2Json, showExcel2JsonScreen } from './excel2json.js';
import { initJson2Table, showJson2TableScreen } from './json2table.js';
import { initFileReader, showFileReaderScreen } from './filereader.js';
import { initUrl, showUrlScreen } from './url.js';
import { initJwt, showJwtScreen } from './jwt.js';
import { initHtmltext, showHtmltextScreen } from './htmltext.js';
import { initCompare, showCompareScreen } from './compare.js';

document.addEventListener('DOMContentLoaded', () => {
    // Init all editors
    initPasswordGenerator();
    initUUIDGenerator();
    initTextAnalyzer();
    initExcel2Json();
    initJson2Table();
    initUrl();
    initJwt();
    initHtmltext();
    initCompare();

    // Tool metadata for grid
    const tools = [
        {
            id: 'password',
            name: 'Password Generator',
            desc: 'Generate secure passwords with custom options.',
            icon: 'bi-shield-lock',
            screen: 'password-generator-screen',
        },
        {
            id: 'uuid',
            name: 'UUID Generator',
            desc: 'Generate UUIDs (v1, v4, v7) with options.',
            icon: 'bi-123',
            screen: 'uuid-generator-screen',
        },
        {
            id: 'text',
            name: 'Text Analyzer & Utilities',
            desc: 'Analyze, transform, and format text.',
            icon: 'bi-fonts',
            screen: 'text-analyzer-screen',
        },
        {
            id: 'compare',
            name: 'Text Compare',
            desc: 'Compare two texts and see differences.',
            icon: 'bi-arrow-left-right',
            screen: 'compare-screen',
        },
        {
            id: 'excel2json',
            name: 'Excel/CSV to JSON',
            desc: 'Convert Excel or CSV files to JSON.',
            icon: 'bi-filetype-xlsx',
            screen: 'excel2json-screen',
        },
        {
            id: 'json2table',
            name: 'JSON Array to Table',
            desc: 'Convert JSON arrays to tables and export.',
            icon: 'bi-table',
            screen: 'json2table-screen',
        },
        {
            id: 'filereader',
            name: 'File Reader',
            desc: 'Read files as text, binary, or data URL.',
            icon: 'bi-file-earmark-arrow-down',
            screen: 'filereader-screen',
        },
        {
            id: 'url',
            name: 'URL Encoder / Decoder',
            desc: 'Encode and decode URLs.',
            icon: 'bi-link-45deg',
            screen: 'url-screen',
        },
        {
            id: 'jwt',
            name: 'JWT Decoder',
            desc: 'Decode and inspect JSON Web Tokens.',
            icon: 'bi-shield-lock',
            screen: 'jwt-screen',
        },
        {
            id: 'htmltext',
            name: 'HTML Text Encoder / Decoder',
            desc: 'Encode and decode HTML entities.',
            icon: 'bi-filetype-html',
            screen: 'htmltext-screen',
        },
    ];

    // Hide all tool screens
    function hideAllToolScreens() {
        tools.forEach(tool => {
            const el = document.getElementById(tool.screen);
            if (el) el.style.display = 'none';
        });
    }

    // Render all tools grid
    function renderAllToolsGrid() {
        const grid = document.getElementById('all-tools-grid');
        if (!grid) return;
        grid.innerHTML = '';
        tools.forEach(tool => {
            const card = document.createElement('div');
            card.className = 'tool-card';
            card.innerHTML = `
                <i class="tool-icon bi ${tool.icon}"></i>
                <h3>${tool.name}</h3>
                <p>${tool.desc}</p>
            `;
            card.addEventListener('click', () => {
                grid.style.display = 'none';
                hideAllToolScreens();
                const el = document.getElementById(tool.screen);
                if (el) el.style.display = '';
                // Call show*Screen function if available
                if (tool.id === 'uuid' && typeof showUUIDGeneratorScreen === 'function') showUUIDGeneratorScreen();
                if (tool.id === 'text' && typeof showTextAnalyzerScreen === 'function') showTextAnalyzerScreen();
                if (tool.id === 'excel2json' && typeof showExcel2JsonScreen === 'function') showExcel2JsonScreen();
                if (tool.id === 'json2table' && typeof showJson2TableScreen === 'function') showJson2TableScreen();
                if (tool.id === 'filereader' && typeof showFileReaderScreen === 'function') showFileReaderScreen();
                if (tool.id === 'url' && typeof showUrlScreen === 'function') showUrlScreen();
                if (tool.id === 'jwt' && typeof showJwtScreen === 'function') showJwtScreen();
                if (tool.id === 'htmltext' && typeof showHtmltextScreen === 'function') showHtmltextScreen();
                if (tool.id === 'compare' && typeof showCompareScreen === 'function') showCompareScreen();
                // For password, force Monaco layout if needed
                if (tool.id === 'password' && window.monaco && document.getElementById('password-editor')) {
                    setTimeout(() => {
                        const editors = window.monaco.editor.getEditors ? window.monaco.editor.getEditors() : [];
                        if (editors.length > 0) editors[0].layout();
                    }, 0);
                }
            });
            grid.appendChild(card);
        });
        grid.style.display = '';
    }

    // Sidebar navigation logic
    const passwordScreen = document.getElementById('password-generator-screen');
    const uuidScreen = document.getElementById('uuid-generator-screen');
    const textScreen = document.getElementById('text-analyzer-screen');
    const excel2jsonScreen = document.getElementById('excel2json-screen');
    const json2tableScreen = document.getElementById('json2table-screen');
    const filereaderScreen = document.getElementById('filereader-screen');
    const urlScreen = document.getElementById('url-screen');
    const jwtScreen = document.getElementById('jwt-screen');
    const htmltextScreen = document.getElementById('htmltext-screen');
    const compareScreen = document.getElementById('compare-screen');
    const sidebarPassword = document.getElementById('sidebar-password');
    const sidebarUUID = document.getElementById('sidebar-uuid');
    const sidebarTextAnalyzer = document.getElementById('sidebar-text-analyzer');
    const sidebarExcel2Json = document.getElementById('sidebar-excel2json');
    const sidebarJson2Table = document.getElementById('sidebar-json2table');
    const sidebarFileReader = document.getElementById('sidebar-filereader');
    const sidebarUrl = document.getElementById('sidebar-url');
    const sidebarJwt = document.getElementById('sidebar-jwt');
    const sidebarHtmltext = document.getElementById('sidebar-htmltext');
    const sidebarTextCompare = document.getElementById('sidebar-text-compare');

    function showScreen(screen) {
        // Hide all tools grid when showing a tool
        const grid = document.getElementById('all-tools-grid');
        if (grid) grid.style.display = 'none';
        // Check if all elements exist before accessing them
        if (passwordScreen) passwordScreen.style.display = screen === 'password' ? '' : 'none';
        if (uuidScreen) uuidScreen.style.display = screen === 'uuid' ? '' : 'none';
        if (textScreen) textScreen.style.display = screen === 'text' ? '' : 'none';
        if (excel2jsonScreen) excel2jsonScreen.style.display = screen === 'excel2json' ? '' : 'none';
        if (json2tableScreen) json2tableScreen.style.display = screen === 'json2table' ? '' : 'none';
        if (filereaderScreen) filereaderScreen.style.display = screen === 'filereader' ? '' : 'none';
        if (urlScreen) urlScreen.style.display = screen === 'url' ? '' : 'none';
        if (jwtScreen) jwtScreen.style.display = screen === 'jwt' ? '' : 'none';
        if (htmltextScreen) htmltextScreen.style.display = screen === 'htmltext' ? '' : 'none';
        if (compareScreen) compareScreen.style.display = screen === 'compare' ? '' : 'none';
        
        if (sidebarPassword) sidebarPassword.classList.toggle('active', screen === 'password');
        if (sidebarUUID) sidebarUUID.classList.toggle('active', screen === 'uuid');
        if (sidebarTextAnalyzer) sidebarTextAnalyzer.classList.toggle('active', screen === 'text');
        if (sidebarExcel2Json) sidebarExcel2Json.classList.toggle('active', screen === 'excel2json');
        if (sidebarJson2Table) sidebarJson2Table.classList.toggle('active', screen === 'json2table');
        if (sidebarFileReader) sidebarFileReader.classList.toggle('active', screen === 'filereader');
        if (sidebarUrl) sidebarUrl.classList.toggle('active', screen === 'url');
        if (sidebarJwt) sidebarJwt.classList.toggle('active', screen === 'jwt');
        if (sidebarHtmltext) sidebarHtmltext.classList.toggle('active', screen === 'htmltext');
        if (sidebarTextCompare) sidebarTextCompare.classList.toggle('active', screen === 'compare');
        if (screen === 'uuid') {
            showUUIDGeneratorScreen();
        }
        if (screen === 'text') {
            showTextAnalyzerScreen();
        }
        if (screen === 'excel2json') {
            showExcel2JsonScreen();
        }
        if (screen === 'json2table') {
            showJson2TableScreen();
        }
        if (screen === 'filereader') {
            showFileReaderScreen();
        }
        if (screen === 'url') {
            showUrlScreen();
        }
        if (screen === 'jwt') {
            showJwtScreen();
        }
        if (screen === 'htmltext') {
            showHtmltextScreen();
        }
        if (screen === 'compare') {
            showCompareScreen();
        }
        // For password, force Monaco layout if needed (optional)
        if (screen === 'password' && window.monaco && document.getElementById('password-editor')) {
            setTimeout(() => {
                const editors = window.monaco.editor.getEditors ? window.monaco.editor.getEditors() : [];
                if (editors.length > 0) editors[0].layout();
            }, 0);
        }
    }

    if (sidebarPassword) {
        sidebarPassword.addEventListener('click', (e) => {
            e.preventDefault();
            showScreen('password');
        });
    }
    if (sidebarUUID) {
        sidebarUUID.addEventListener('click', (e) => {
            e.preventDefault();
            showScreen('uuid');
        });
    }
    if (sidebarTextAnalyzer) {
        sidebarTextAnalyzer.addEventListener('click', (e) => {
            e.preventDefault();
            showScreen('text');
        });
    }
    if (sidebarExcel2Json) {
        sidebarExcel2Json.addEventListener('click', (e) => {
            e.preventDefault();
            showScreen('excel2json');
        });
    }
    if (sidebarJson2Table) {
        sidebarJson2Table.addEventListener('click', (e) => {
            e.preventDefault();
            showScreen('json2table');
        });
    }
    if (sidebarFileReader) {
        sidebarFileReader.addEventListener('click', (e) => {
            e.preventDefault();
            showScreen('filereader');
        });
    }
    if (sidebarUrl) {
        sidebarUrl.addEventListener('click', (e) => {
            e.preventDefault();
            showScreen('url');
        });
    }
    if (sidebarJwt) {
        sidebarJwt.addEventListener('click', (e) => {
            e.preventDefault();
            showScreen('jwt');
        });
    }
    if (sidebarHtmltext) {
        sidebarHtmltext.addEventListener('click', (e) => {
            e.preventDefault();
            showScreen('htmltext');
        });
    }
    if (sidebarTextCompare) {
        sidebarTextCompare.addEventListener('click', (e) => {
            e.preventDefault();
            showScreen('compare');
        });
    }

    // DevTools anchor click: show all tools grid and animate lightning
    const devtoolsAnchor = document.querySelector('.sidebar a.d-flex.align-items-center');
    const lightningIcon = devtoolsAnchor ? devtoolsAnchor.querySelector('.bi-lightning-charge-fill') : null;
    if (devtoolsAnchor) {
        devtoolsAnchor.addEventListener('click', (e) => {
            e.preventDefault();
            hideAllToolScreens();
            const grid = document.getElementById('all-tools-grid');
            if (grid) grid.style.display = '';
            // Animate lightning icon
            if (lightningIcon) {
                lightningIcon.classList.remove('lightning-animate');
                // Force reflow to restart animation
                void lightningIcon.offsetWidth;
                lightningIcon.classList.add('lightning-animate');
            }
        });
    }

    // Replace default tool with all tools grid
    hideAllToolScreens();
    renderAllToolsGrid();
}); 