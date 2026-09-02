const fs = require('fs');
const vm = require('vm');

const contextMenuHTML = `
    <!-- RETRO DESKTOP RIGHT-CLICK CONTEXT MENU OVERLAY -->
    <div id="desktop-context-menu" class="hidden">
        <div class="menu-item bold" onclick="contextMenuAction('open')">▶ Open / Execute</div>
        <div class="menu-divider"></div>
        <div class="menu-item" id="context-burn-item" onclick="contextMenuAction('burn')">💾 Write / Burn to Floppy Disk (A:)</div>
        <div class="menu-item" onclick="contextMenuAction('info')">ℹ System Properties</div>
        <div class="menu-divider"></div>
        <div class="menu-item" id="context-delete-item" onclick="contextMenuAction('delete')">🗑 Delete Shortcut</div>
    </div>
`;

const contextMenuCSS = `
        /* RETRO DESKTOP RIGHT-CLICK CONTEXT MENU */
        #desktop-context-menu {
            position: fixed;
            width: 210px;
            background-color: var(--win-bg);
            border: 2px solid;
            border-color: var(--win-border-light) var(--win-border-dark) var(--win-border-dark) var(--win-border-light);
            box-shadow: 4px 4px 10px rgba(0,0,0,0.5);
            z-index: 999999;
            padding: 3px;
            display: flex;
            flex-direction: column;
        }
        #desktop-context-menu.hidden { display: none; }
        #desktop-context-menu .menu-item {
            padding: 5px 12px;
            font-size: 16px;
            font-family: var(--font-sys);
            cursor: pointer;
            color: var(--text-main);
            display: flex;
            align-items: center;
            gap: 6px;
        }
        #desktop-context-menu .menu-item.bold { font-weight: bold; }
        #desktop-context-menu .menu-item:hover {
            background-color: #000080;
            color: #ffffff;
        }
        #desktop-context-menu .menu-divider {
            height: 1px;
            margin: 3px 2px;
            border-bottom: 1px solid var(--win-border-light);
            background-color: var(--win-border-dark);
        }

        .desktop-shortcut.selected {
            border: 1px dashed #ffffff !important;
            background-color: rgba(0, 0, 128, 0.6) !important;
        }
`;

const desktopIconEngineJS = `
        // DESKTOP ICON SELECTION, DOUBLE-CLICK, CONTEXT MENU, AND DRAG ENGINE
        let selectedDesktopIcon = null;
        let contextTargetIcon = null;

        function initDesktopIconEngine() {
            const desktop = document.getElementById('desktop');
            const iconsContainer = document.getElementById('desktop-icons');
            if (!desktop || !iconsContainer) return;

            const savedPos = JSON.parse(localStorage.getItem('jglovr_desktop_icon_positions') || '{}');
            const icons = Array.from(iconsContainer.querySelectorAll('.desktop-shortcut'));
            
            let defaultTop = 16;
            let defaultLeft = 16;

            icons.forEach((icon, idx) => {
                const id = icon.id || (\`icon-shortcut-\` + idx);
                icon.id = id;

                if (savedPos[id]) {
                    icon.style.position = 'absolute';
                    icon.style.top = savedPos[id].top + 'px';
                    icon.style.left = savedPos[id].left + 'px';
                } else {
                    icon.style.position = 'absolute';
                    icon.style.top = defaultTop + 'px';
                    icon.style.left = defaultLeft + 'px';
                    defaultTop += 95;
                    if (defaultTop > window.innerHeight - 150) {
                        defaultTop = 16;
                        defaultLeft += 110;
                    }
                }

                // Single Click -> Select
                icon.addEventListener('click', (e) => {
                    e.stopPropagation();
                    selectDesktopIcon(icon);
                });

                // Double Click -> Launch
                icon.addEventListener('dblclick', (e) => {
                    e.stopPropagation();
                    launchDesktopIcon(icon);
                });

                // Right Click -> Context Menu
                icon.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    selectDesktopIcon(icon);
                    showDesktopContextMenu(e.clientX, e.clientY, icon);
                });

                // Draggable Shortcut Position
                makeIconDraggable(icon);
            });

            // Deselect icons & close context menu on background click
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.desktop-shortcut') && !e.target.closest('#desktop-context-menu')) {
                    deselectAllDesktopIcons();
                    hideDesktopContextMenu();
                }
            });

            desktop.addEventListener('contextmenu', (e) => {
                if (e.target === desktop || e.target.id === 'desktop-icons') {
                    e.preventDefault();
                    deselectAllDesktopIcons();
                    showDesktopContextMenu(e.clientX, e.clientY, null);
                }
            });
        }

        function selectDesktopIcon(iconElem) {
            deselectAllDesktopIcons();
            if (!iconElem) return;
            iconElem.classList.add('selected');
            selectedDesktopIcon = iconElem;
        }

        function deselectAllDesktopIcons() {
            document.querySelectorAll('.desktop-shortcut').forEach(el => el.classList.remove('selected'));
            selectedDesktopIcon = null;
        }

        function launchDesktopIcon(iconElem) {
            if (!iconElem) return;
            playSound('launch');

            const id = iconElem.id;
            if (id === 'icon-catalog') openWindow('catalog-window');
            else if (id === 'icon-codyfrog') openGameWindow('codyfrogclassic.html', 'Cody Frog', 'window-codyfrog', 'FROG', iconElem);
            else if (id === 'icon-traingame') openGameWindow('traingame.html', 'Train Game', 'window-traingame', 'TRAIN', iconElem);
            else if (id === 'icon-gnomes') openGameWindow('gnomesinthetallgrass.html', 'Gnomes in the Tall Grass', 'window-gnomes', 'GNOMES', iconElem);
            else if (id === 'icon-sysvoid') openGameWindow('systemvoid.html', 'S Y S T E M _ V O I D', 'window-sysvoid', 'SYSVOID', iconElem);
            else if (id === 'icon-gridmix') openGameWindow('musicgridlivemix.html', 'Music Grid Synthesizer', 'window-gridmix', 'GRIDMIX', iconElem);
            else if (id === 'icon-apexcad') openGameWindow('apexcad.html', 'ApexCAD 3D Workstation', 'window-apexcad', 'CAD', iconElem);
            else if (id === 'icon-terminal') toggleWindow('terminal-window');
            else if (iconElem.onclick) {
                iconElem.onclick();
            }
        }

        function showDesktopContextMenu(x, y, iconElem) {
            contextTargetIcon = iconElem;
            const menu = document.getElementById('desktop-context-menu');
            if (!menu) return;

            const burnBtn = document.getElementById('context-burn-item');
            const deleteBtn = document.getElementById('context-delete-item');

            if (iconElem) {
                if (burnBtn) burnBtn.style.display = (typeof openFloppyBurnModal === 'function') ? 'flex' : 'none';
                if (deleteBtn) {
                    deleteBtn.style.display = iconElem.classList.contains('custom-desktop-icon') ? 'flex' : 'none';
                }
            } else {
                if (burnBtn) burnBtn.style.display = 'none';
                if (deleteBtn) deleteBtn.style.display = 'none';
            }

            const maxX = window.innerWidth - 220;
            const maxY = window.innerHeight - 190;
            menu.style.left = Math.min(x, maxX) + 'px';
            menu.style.top = Math.min(y, maxY) + 'px';
            menu.classList.remove('hidden');
        }

        function hideDesktopContextMenu() {
            const menu = document.getElementById('desktop-context-menu');
            if (menu) menu.classList.add('hidden');
        }

        function contextMenuAction(action) {
            hideDesktopContextMenu();
            const target = contextTargetIcon || selectedDesktopIcon;

            if (action === 'open') {
                if (target) launchDesktopIcon(target);
                else openWindow('catalog-window');
            } else if (action === 'burn') {
                if (typeof openFloppyBurnModal === 'function') {
                    openFloppyBurnModal();
                }
            } else if (action === 'info') {
                openAboutDialog();
            } else if (action === 'delete') {
                if (target && target.classList.contains('custom-desktop-icon')) {
                    if (confirm(\`Remove desktop shortcut for \${target.innerText}?\`)) {
                        target.remove();
                    }
                }
            }
        }

        function makeIconDraggable(iconElem) {
            let isDragging = false;
            let startX = 0, startY = 0;
            let initialLeft = 0, initialTop = 0;

            iconElem.addEventListener('mousedown', (e) => {
                if (e.button !== 0) return;
                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;
                initialLeft = iconElem.offsetLeft;
                initialTop = iconElem.offsetTop;
                iconElem.style.zIndex = 99;
            });

            document.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;

                iconElem.style.left = (initialLeft + deltaX) + 'px';
                iconElem.style.top = (initialTop + deltaY) + 'px';
            });

            document.addEventListener('mouseup', () => {
                if (!isDragging) return;
                isDragging = false;
                iconElem.style.zIndex = 5;

                // Snap to Grid (100px X, 95px Y)
                const snapLeft = Math.max(16, Math.round((iconElem.offsetLeft - 16) / 100) * 100 + 16);
                const snapTop = Math.max(16, Math.round((iconElem.offsetTop - 16) / 95) * 95 + 16);

                iconElem.style.left = snapLeft + 'px';
                iconElem.style.top = snapTop + 'px';

                const savedPos = JSON.parse(localStorage.getItem('jglovr_desktop_icon_positions') || '{}');
                savedPos[iconElem.id] = { left: snapLeft, top: snapTop };
                localStorage.setItem('jglovr_desktop_icon_positions', JSON.stringify(savedPos));
            });
        }
`;

['index.html', 'desktop-app/index.html'].forEach(filePath => {
    let fileContent = fs.readFileSync(filePath, 'utf8');

    // 1. Inject CSS
    if (!fileContent.includes('#desktop-context-menu')) {
        fileContent = fileContent.replace('</style>', contextMenuCSS + '\n</style>');
    }

    // 2. Inject HTML overlay
    if (!fileContent.includes('id="desktop-context-menu"')) {
        fileContent = fileContent.replace('</body>', contextMenuHTML + '\n</body>');
    }

    // 3. Remove single onclick attributes from default desktop shortcuts so dblclick handles launch
    fileContent = fileContent.replace(
        /class="desktop-shortcut" id="([^"]+)" onclick="[^"]+"/g,
        'class="desktop-shortcut" id="$1"'
    );

    // 4. Inject JS engine
    if (!fileContent.includes('function initDesktopIconEngine()')) {
        fileContent = fileContent.replace(
            '</script>',
            desktopIconEngineJS + '\n\n        setTimeout(initDesktopIconEngine, 200);\n    </script>'
        );
    }

    fs.writeFileSync(filePath, fileContent, 'utf8');

    // Validate JS syntax
    const scripts = fileContent.match(/<script[\s\S]*?>([\s\S]*?)<\/script>/gi) || [];
    let allValid = true;
    scripts.forEach((s, idx) => {
        const code = s.replace(/<script[\s\S]*?>/i, '').replace(/<\/script>/i, '');
        try {
            new vm.Script(code, { filename: filePath + '_script_' + idx });
            console.log(filePath, 'Script block', idx, 'SYNTAX VALIDATED CLEAN!');
        } catch(err) {
            allValid = false;
            console.error(filePath, 'Script block', idx, 'SYNTAX ERROR:', err.message);
        }
    });
});

console.log('>>> SUCCESS: Desktop Icon Double-Click, Context Menu & Drag Rearranging applied to both Web & Desktop OS!\n');
