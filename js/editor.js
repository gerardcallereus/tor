// ============================================================================
// EDITOR DE NIVELLS I MAPES — TOR: PORTES LÒGIQUES I SIGIL 3D
// ESTUDI VISUAL TÀCTIC COMPLETAMENT REDISSENYAT I REPROGRAMAT
// - Edició 100% gràfica i intuïtiva directament sobre el mapa 2D
// - Càmeres CCTV: Clic al mapa per ubicar, brúixola 3x3 de direccions, projecció de con de visió en viu
// - Sentinelles: Clic al mapa per afegir/treure fites (❶➔❷➔❸), presets d'1 clic, velocitats i tipus
// - Disseny de Mapa: Llapis, Caixa, Cubell d'omplir, Goma, Girar [R] i paleta visual de 73 mobles
// - Prova directa al joc 3D en 1 clic i exportació de codi simplificada
// ============================================================================

(function() {
    'use strict';

    // PALETA COMPLETA D'ELEMENTS DE JOC I MOBILIARI (73 ELEMENTS EN 10 CATEGORIES)
    const TILE_PALETTE = [
        // 1. Bàsics & Estructures (5)
        { ch: '.', name: 'Terra lliure transitable', cat: 'Bàsics', color: '#94a3b8', bg: '#0f172a', icon: '·', rotatable: false },
        { ch: '#', name: 'Mur d\'acer sòlid', cat: 'Bàsics', color: '#f8fafc', bg: '#1e293b', icon: '🧱', rotatable: false },
        { ch: 'S', name: 'Punt d\'Inserció Snake', cat: 'Bàsics', color: '#22c55e', bg: '#064e3b', icon: '🐍', rotatable: false },
        { ch: 'G', name: 'Comporta Sortida Blast Gate', cat: 'Bàsics', color: '#facc15', bg: '#78350f', icon: '🚪', rotatable: true },
        { ch: '@', name: 'Columna d\'acer massissa', cat: 'Bàsics', color: '#94a3b8', bg: '#334155', icon: '🏛️', rotatable: false },

        // 2. Sistemes Tàctics & Lògica (6)
        { ch: 'K', name: 'Disc PAL xifrat [K]', cat: 'Lògica', color: '#38bdf8', bg: '#0c4a6e', icon: '💾', rotatable: true },
        { ch: 'R', name: 'Terminal PC de seguretat [R]', cat: 'Lògica', color: '#34d399', bg: '#064e3b', icon: '💻', rotatable: true },
        { ch: 'D', name: 'Porta Secundària [D]', cat: 'Lògica', color: '#c084fc', bg: '#581c87', icon: '🚪', rotatable: true },
        { ch: 'Z', name: 'Barrera de Raigs Làser [Z]', cat: 'Lògica', color: '#f87171', bg: '#7f1d1d', icon: '⚡', rotatable: true },
        { ch: 'U', name: 'Disjuntor / Polsador [U]', cat: 'Lògica', color: '#fde047', bg: '#713f12', icon: '🔘', rotatable: true },
        { ch: 'F', name: 'Placa de Pressió al Terra [F]', cat: 'Lògica', color: '#2dd4bf', bg: '#134e4a', icon: '⬚', rotatable: false },

        // 3. Obstacles & Cobertura (4)
        { ch: 'B', name: 'Contenidor metàl·lic empenyible [B]', cat: 'Obstacles', color: '#cbd5e1', bg: '#334155', icon: '📦', rotatable: false },
        { ch: 'C', name: 'Caixa de Subministraments [C]', cat: 'Obstacles', color: '#f43f5e', bg: '#881337', icon: '➕', rotatable: true },
        { ch: 'L', name: 'Terra Elèctric Tesla [L]', cat: 'Obstacles', color: '#38bdf8', bg: '#075985', icon: '⚡', rotatable: false },
        { ch: 'O', name: 'Conducte de Ventilació [O]', cat: 'Obstacles', color: '#94a3b8', bg: '#1e293b', icon: '🕳️', rotatable: false },

        // 4. Taules & Escriptoris (10)
        { ch: 't', name: 'Taula d\'oficina militar [t]', cat: 'Taules', color: '#fcd34d', bg: '#451a03', icon: '🪑', rotatable: true },
        { ch: '1', name: 'Taula de reunions executiva [1]', cat: 'Taules', color: '#f59e0b', bg: '#3b1c04', icon: '💼', rotatable: true },
        { ch: '2', name: 'Taula de laboratori químic [2]', cat: 'Taules', color: '#34d399', bg: '#064e3b', icon: '🧪', rotatable: true },
        { ch: '3', name: 'Taula rodona de cafè [3]', cat: 'Taules', color: '#fdba74', bg: '#431407', icon: '☕', rotatable: true },
        { ch: '4', name: 'Escriptori tàctic d\'acer [4]', cat: 'Taules', color: '#94a3b8', bg: '#1e293b', icon: '🖥️', rotatable: true },
        { ch: '5', name: 'Taula d\'autòpsia / mèdica [5]', cat: 'Taules', color: '#38bdf8', bg: '#0c4a6e', icon: '🩺', rotatable: true },
        { ch: '6', name: 'Taula de plànols i arquitectura [6]', cat: 'Taules', color: '#fde047', bg: '#713f12', icon: '📐', rotatable: true },
        { ch: '7', name: 'Banc de treball mecànic [7]', cat: 'Taules', color: '#fb923c', bg: '#431407', icon: '🔧', rotatable: true },
        { ch: '8', name: 'Taula baixa de vidre modern [8]', cat: 'Taules', color: '#93c5fd', bg: '#1e3a8a', icon: '🧊', rotatable: true },
        { ch: '9', name: 'Taula de menjador militar [9]', cat: 'Taules', color: '#a3e635', bg: '#14532d', icon: '🍽️', rotatable: true },

        // 5. Cadires & Seients (10)
        { ch: 'c', name: 'Cadira executiva ergonòmica [c]', cat: 'Cadires', color: '#93c5fd', bg: '#1e3a8a', icon: '💺', rotatable: true },
        { ch: '!', name: 'Tamboret giratori de lab [!]', cat: 'Cadires', color: '#38bdf8', bg: '#0c4a6e', icon: '🪑', rotatable: true },
        { ch: '%', name: 'Cadira de rodes clínica [%]', cat: 'Cadires', color: '#60a5fa', bg: '#1e3a8a', icon: '🧑‍🦽', rotatable: true },
        { ch: '&', name: 'Butaca executiva reclinable [&]', cat: 'Cadires', color: '#f43f5e', bg: '#4c0519', icon: '🛋️', rotatable: true },
        { ch: '*', name: 'Fila de seients d\'espera [*]', cat: 'Cadires', color: '#cbd5e1', bg: '#334155', icon: '💺', rotatable: true },
        { ch: '+', name: 'Cadira plegable de campanya [+]', cat: 'Cadires', color: '#4ade80', bg: '#14532d', icon: '⛺', rotatable: true },
        { ch: '-', name: 'Tamboret alt de control [-]', cat: 'Cadires', color: '#fcd34d', bg: '#713f12', icon: '🪜', rotatable: true },
        { ch: '<', name: 'Puff tàctic d\'escuma [<]', cat: 'Cadires', color: '#2dd4bf', bg: '#134e4a', icon: '⏹️', rotatable: true },
        { ch: '>', name: 'Banc d\'exercici i peses [>]', cat: 'Cadires', color: '#f87171', bg: '#450a0a', icon: '🏋️', rotatable: true },
        { ch: '^', name: 'Tamboret mèdic amb rodes [^]', cat: 'Cadires', color: '#e2e8f0', bg: '#1e293b', icon: '💺', rotatable: true },

        // 6. Emmagatzematge & Armaris (11)
        { ch: 'a', name: 'Armari blindat metàl·lic [a]', cat: 'Armaris', color: '#cbd5e1', bg: '#1e293b', icon: '🗄️', rotatable: true },
        { ch: 'b', name: 'Llibreria d\'arxius i manuals [b]', cat: 'Armaris', color: '#fdba74', bg: '#7c2d12', icon: '📚', rotatable: true },
        { ch: 'd', name: 'Armari blindat de fusells [d]', cat: 'Armaris', color: '#94a3b8', bg: '#0f172a', icon: '🔫', rotatable: true },
        { ch: 'e', name: 'Caixa forta blindada amb dial [e]', cat: 'Armaris', color: '#fbbf24', bg: '#451a03', icon: '🔒', rotatable: true },
        { ch: 'f', name: 'Armari mèdic primers auxilis [f]', cat: 'Armaris', color: '#f87171', bg: '#7f1d1d', icon: '🩹', rotatable: true },
        { ch: 'g', name: 'Nevera criogènica de mostres [g]', cat: 'Armaris', color: '#38bdf8', bg: '#0369a1', icon: '❄️', rotatable: true },
        { ch: 'h', name: 'Prestatgeria d\'arxius top secret [h]', cat: 'Armaris', color: '#fdba74', bg: '#431407', icon: '📁', rotatable: true },
        { ch: 'i', name: 'Arxivador metàl·lic 4 calaixos [i]', cat: 'Armaris', color: '#64748b', bg: '#1e293b', icon: '🗃️', rotatable: true },
        { ch: 'j', name: 'Taquilles de vestuari militar [j]', cat: 'Armaris', color: '#94a3b8', bg: '#334155', icon: '🚪', rotatable: true },
        { ch: 'k', name: 'Banc d\'eines amb panell [k]', cat: 'Armaris', color: '#fb923c', bg: '#7c2d12', icon: '🛠️', rotatable: true },
        { ch: 'm', name: 'Contenidor estanc de tòxics [m]', cat: 'Armaris', color: '#facc15', bg: '#713f12', icon: '☢️', rotatable: false },

        // 7. Tecnologia, Consoles & Comunicacions (9)
        { ch: 'n', name: 'Superordinador mainframe tapes [n]', cat: 'Consoles', color: '#38bdf8', bg: '#0c4a6e', icon: '💾', rotatable: true },
        { ch: 'o', name: 'Taula d\'hologrames tàctics 3D [o]', cat: 'Consoles', color: '#06b6d4', bg: '#083344', icon: '🌐', rotatable: true },
        { ch: 's', name: 'Torre de servidors blade [s]', cat: 'Consoles', color: '#22c55e', bg: '#052e16', icon: '🗄️', rotatable: true },
        { ch: 'u', name: 'Estació d\'anàlisi genòmica ADN [u]', cat: 'Consoles', color: '#a855f7', bg: '#3b0764', icon: '🧬', rotatable: true },
        { ch: 'v', name: 'Panell commutadors alta tensió [v]', cat: 'Consoles', color: '#fde047', bg: '#451a03', icon: '⚡', rotatable: true },
        { ch: 'x', name: 'Monitor CRT oscil·loscopi [x]', cat: 'Consoles', color: '#4ade80', bg: '#14532d', icon: '📺', rotatable: true },
        { ch: 'y', name: 'Generador dièsel auxiliar [y]', cat: 'Consoles', color: '#ca8a04', bg: '#422006', icon: '⚙️', rotatable: true },
        { ch: 'z', name: 'Estació de ràdio HF d\'ona curta [z]', cat: 'Consoles', color: '#38bdf8', bg: '#0c4a6e', icon: '📻', rotatable: true },
        { ch: '0', name: 'Bateria industrial d\'ió-liti [0]', cat: 'Consoles', color: '#10b981', bg: '#064e3b', icon: '🔋', rotatable: true },

        // 8. Equipament Industrial & Serveis (9)
        { ch: '?', name: 'Tanc criogènic de vidre [?]', cat: 'Industrial', color: '#06b6d4', bg: '#0e7490', icon: '🧪', rotatable: false },
        { ch: '~', name: 'Màquina expenedora begudes [~]', cat: 'Industrial', color: '#ef4444', bg: '#450a0a', icon: '🥤', rotatable: true },
        { ch: '|', name: 'Extintor d\'incendis de paret [|]', cat: 'Industrial', color: '#f87171', bg: '#7f1d1d', icon: '🧯', rotatable: true },
        { ch: ';', name: 'Caixa de fusibles elèctrics [;]', cat: 'Industrial', color: '#facc15', bg: '#713f12', icon: '🔌', rotatable: true },
        { ch: ':', name: 'Carretó mecànic d\'eines mòbil [:]', cat: 'Industrial', color: '#f87171', bg: '#450a0a', icon: '🛒', rotatable: true },
        { ch: '"', name: 'Dipòsit d\'oxigen comprimit ["]', cat: 'Industrial', color: '#38bdf8', bg: '#0c4a6e', icon: '🤿', rotatable: true },
        { ch: '\'', name: 'Calefactor radiant infrarojos [\']', cat: 'Industrial', color: '#fb923c', bg: '#7c2d12', icon: '🔥', rotatable: true },
        { ch: '/', name: 'Transpaleta hidràulica manual [/]', cat: 'Industrial', color: '#facc15', bg: '#78350f', icon: '🚜', rotatable: true },
        { ch: '_', name: 'Dipòsit aigua destil·lada IBC [_]', cat: 'Industrial', color: '#93c5fd', bg: '#1e3a8a', icon: '💧', rotatable: false },

        // 9. Mèdic & Recerca (9)
        { ch: '[', name: 'Llit d\'hospital articulat [[]', cat: 'Mèdic', color: '#e2e8f0', bg: '#1e293b', icon: '🛏️', rotatable: true },
        { ch: ']', name: 'Suport de sèrum intravenós []]', cat: 'Mèdic', color: '#38bdf8', bg: '#0c4a6e', icon: '💉', rotatable: true },
        { ch: '{', name: 'Llum scialítica de cirurgia [{]', cat: 'Mèdic', color: '#fef08a', bg: '#713f12', icon: '💡', rotatable: false },
        { ch: '}', name: 'Escàner biomètric de retina [}]', cat: 'Mèdic', color: '#06b6d4', bg: '#083344', icon: '👁️', rotatable: true },
        { ch: '=', name: 'Incubadora cultius biològics [=]', cat: 'Mèdic', color: '#34d399', bg: '#064e3b', icon: '🧫', rotatable: true },
        { ch: '\\', name: 'Centrifugadora de sang [\\\\]', cat: 'Mèdic', color: '#e2e8f0', bg: '#334155', icon: '🔬', rotatable: true },
        { ch: '§', name: 'Bàscula de precisió mèdica [§]', cat: 'Mèdic', color: '#94a3b8', bg: '#1e293b', icon: '⚖️', rotatable: true },
        { ch: '°', name: 'Campana d\'extracció de fums [°]', cat: 'Mèdic', color: '#cbd5e1', bg: '#334155', icon: '💨', rotatable: true },
        { ch: '±', name: 'Llitera plegable d\'urgències [±]', cat: 'Mèdic', color: '#facc15', bg: '#713f12', icon: '🚑', rotatable: true },

        // 10. Decoració & Ambient (11)
        { ch: '$', name: 'Sofà executiu de descans [$]', cat: 'Decoració', color: '#fb7185', bg: '#4c0519', icon: '🛋️', rotatable: true },
        { ch: 'p', name: 'Planta exòtica decorativa [p]', cat: 'Decoració', color: '#4ade80', bg: '#14532d', icon: '🪴', rotatable: true },
        { ch: 'l', name: 'Làmpada de peu de llautó [l]', cat: 'Decoració', color: '#fef08a', bg: '#713f12', icon: '💡', rotatable: true },
        { ch: 'r', name: 'Catifa tàctica persa/militar [r]', cat: 'Decoració', color: '#f43f5e', bg: '#4c0519', icon: '🧶', rotatable: true },
        { ch: 'q', name: 'Quadre / Plànol emmarcat [q]', cat: 'Decoració', color: '#a78bfa', bg: '#2e1065', icon: '🖼️', rotatable: true },
        { ch: 'w', name: 'Finestral àrtic de vidre [w]', cat: 'Decoració', color: '#93c5fd', bg: '#0c4a6e', icon: '🪟', rotatable: true },
        { ch: 'µ', name: 'Pissarra blanca amb fórmules [µ]', cat: 'Decoració', color: '#f8fafc', bg: '#1e293b', icon: '📋', rotatable: true },
        { ch: '¶', name: 'Màquina de cafè espresso [¶]', cat: 'Decoració', color: '#fb923c', bg: '#431407', icon: '☕', rotatable: true },
        { ch: '¿', name: 'Paperera d\'acer inoxidable [¿]', cat: 'Decoració', color: '#cbd5e1', bg: '#1e293b', icon: '🗑️', rotatable: true },
        { ch: '¡', name: 'Ventilador oscil·lant de peu [¡]', cat: 'Decoració', color: '#94a3b8', bg: '#334155', icon: '🌪️', rotatable: true },
        { ch: '«', name: 'Rellotge militar GMT [«]', cat: 'Decoració', color: '#fde047', bg: '#713f12', icon: '⏰', rotatable: true },
        { ch: '»', name: 'Mirall convex de seguretat [»]', cat: 'Decoració', color: '#38bdf8', bg: '#0369a1', icon: '🪞', rotatable: true },
        { ch: '▲', name: 'Palet amb sacs de sorra [▲]', cat: 'Decoració', color: '#d97706', bg: '#451a03', icon: '🧱', rotatable: true },
        { ch: '■', name: 'Barrera retràctil d\'accés [■]', cat: 'Decoració', color: '#facc15', bg: '#78350f', icon: '🚧', rotatable: true },
        { ch: '●', name: 'Globus terraqüi estratègic [●]', cat: 'Decoració', color: '#38bdf8', bg: '#0c4a6e', icon: '🌍', rotatable: true }
    ];

    const PALETTE_CATEGORIES = [
        'Tots', 'Bàsics', 'Lògica', 'Obstacles', 'Taules', 'Cadires',
        'Armaris', 'Consoles', 'Industrial', 'Mèdic', 'Decoració'
    ];

    // Estat centralitzat de l'Estudi Visual
    const editorState = {
        sectorId: 1,
        activeSubTab: 'MAP', // 'MAP', 'CAMERAS', 'SENTINELS'
        activeBrush: '#',
        activeTool: 'PAINT', // 'PAINT', 'BOX', 'FILL', 'ROTATE', 'ERASE'
        boxStart: null,      // Per eina Caixa {r, c}
        brushRotation: 0,    // 0, 90, 180, 270
        activeCat: 'Tots',
        searchQuery: '',
        isMouseDown: false,
        gridMatrix: [],      // Array de línies: ['###...', ...]
        rotations: {},       // "c,r": deg
        cameras: [],
        enemies: [],
        selectedCamIdx: 0,
        selectedGuardIdx: 0
    };

    function radToDeg(rad) {
        let deg = Math.round((Number(rad || 0) * 180) / Math.PI) % 360;
        if (deg < 0) deg += 360;
        return deg;
    }

    function degToRad(deg) {
        return (Number(deg || 0) * Math.PI) / 180;
    }

    function getDirectionArrow(radOrDeg) {
        let deg = (typeof radOrDeg === 'number' && radOrDeg <= Math.PI * 2 && radOrDeg > 0) ? radToDeg(radOrDeg) : Math.round(Number(radOrDeg || 0)) % 360;
        if (deg < 0) deg += 360;
        if (deg >= 337.5 || deg < 22.5) return '↓';
        if (deg >= 22.5 && deg < 67.5) return '↘';
        if (deg >= 67.5 && deg < 112.5) return '→';
        if (deg >= 112.5 && deg < 157.5) return '↗';
        if (deg >= 157.5 && deg < 202.5) return '↑';
        if (deg >= 202.5 && deg < 247.5) return '↖';
        if (deg >= 247.5 && deg < 292.5) return '←';
        return '↙';
    }

    function getRotationSymbol(deg) {
        const d = (Number(deg || 0) % 360 + 360) % 360;
        if (d === 90) return '→';
        if (d === 180) return '↑';
        if (d === 270) return '←';
        return '↓';
    }

    // Inicialització global de l'editor
    function initLevelEditor() {
        loadCustomLevelsFromStorage();
        window.addEventListener('keydown', (e) => {
            if (e.key === 'r' || e.key === 'R') {
                if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
                    return;
                }
                const modal = document.getElementById('level-editor-modal');
                if (modal && modal.style.display !== 'none') {
                    e.preventDefault();
                    editorCycleRotation();
                }
            }
        });
    }

    function loadCustomLevelsFromStorage() {
        const REDESIGN_VERSION = '20261026_sectors3to10_v1';
        const raw = localStorage.getItem('TOR_CUSTOM_LEVELS');
        if (!raw) {
            localStorage.setItem('TOR_LEVELS_REDESIGN_VER', REDESIGN_VERSION);
            return;
        }
        try {
            const data = JSON.parse(raw);
            if (localStorage.getItem('TOR_LEVELS_REDESIGN_VER') !== REDESIGN_VERSION) {
                for (let s = 3; s <= 10; s++) {
                    delete data[String(s)];
                    delete data[s];
                }
                localStorage.setItem('TOR_CUSTOM_LEVELS', JSON.stringify(data));
                localStorage.setItem('TOR_LEVELS_REDESIGN_VER', REDESIGN_VERSION);
            }
            const missions = window.TACTICAL_MISSIONS || [];
            for (const [secId, custom] of Object.entries(data)) {
                const m = missions.find(tm => tm.id === parseInt(secId));
                if (m) {
                    if (Array.isArray(custom.map) && custom.map.length > 0) m.map = custom.map;
                    if (custom.rotations) m.rotations = custom.rotations;
                    if (Array.isArray(custom.cameras)) m.cameras = custom.cameras;
                    if (Array.isArray(custom.enemies)) m.enemies = custom.enemies;
                }
            }
        } catch (e) {
            console.warn('Error carregant nivells desats:', e);
        }
    }

    function editorRenderSectorTabs() {
        const container = document.getElementById('editor-sector-tabs');
        if (!container) return;
        container.innerHTML = '';
        const missions = window.TACTICAL_MISSIONS || [];
        missions.forEach(m => {
            const btn = document.createElement('button');
            btn.className = `editor-sector-btn ${m.id === editorState.sectorId ? 'active' : ''}`;
            btn.textContent = `Sec 0${m.id}: ${m.gateBadge}`;
            btn.title = `${m.title} (${m.gateBadge})`;
            btn.onclick = () => editorSelectSector(m.id);
            container.appendChild(btn);
        });
    }

    function openLevelEditorModal(sectorId) {
        const modal = document.getElementById('level-editor-modal');
        if (!modal) return;

        if (sectorId !== undefined && sectorId >= 1 && sectorId <= 10) {
            editorState.sectorId = sectorId;
        } else if (window.appState && window.appState.currentMissionIdx !== undefined) {
            editorState.sectorId = window.appState.currentMissionIdx + 1;
        } else {
            editorState.sectorId = 1;
        }

        editorRenderSectorTabs();
        editorLoadSector(editorState.sectorId);
        editorSetSubTab('MAP');
        editorRenderCategoryPills();
        editorRenderPalette();

        modal.style.display = 'flex';
        modal.classList.add('active');
        if (window.syncEnginePauseState) window.syncEnginePauseState();
    }

    function closeLevelEditorModal() {
        const modal = document.getElementById('level-editor-modal');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('active');
        }
        editorState.boxStart = null;
        if (window.syncEnginePauseState) window.syncEnginePauseState();
    }

    function editorSelectSector(secId) {
        editorState.sectorId = secId;
        editorState.selectedCamIdx = 0;
        editorState.selectedGuardIdx = 0;
        editorState.boxStart = null;
        editorRenderSectorTabs();
        editorLoadSector(secId);
    }

    function editorLoadSector(secId) {
        const missions = window.TACTICAL_MISSIONS || [];
        const m = missions.find(tm => tm.id === secId);
        if (!m) return;

        editorState.gridMatrix = m.map ? JSON.parse(JSON.stringify(m.map)) : [];
        editorState.rotations = m.rotations ? JSON.parse(JSON.stringify(m.rotations)) : {};
        editorState.cameras = m.cameras ? JSON.parse(JSON.stringify(m.cameras)) : [];
        editorState.enemies = m.enemies ? JSON.parse(JSON.stringify(m.enemies)) : [];

        editorRenderGrid();
        editorUpdateStats();

        if (editorState.activeSubTab === 'CAMERAS') {
            editorRenderCamerasInspector();
        } else if (editorState.activeSubTab === 'SENTINELS') {
            editorRenderSentinelsInspector();
        }
    }

    // Canvi de mode principal: 'MAP', 'CAMERAS', 'SENTINELS'
    function editorSetSubTab(tab) {
        editorState.activeSubTab = tab;
        editorState.boxStart = null;

        // Actualitza botons de mode
        const btnMap = document.getElementById('btn-mode-map');
        const btnCams = document.getElementById('btn-mode-cameras');
        const btnGuards = document.getElementById('btn-mode-sentinels');
        if (btnMap) btnMap.classList.toggle('active', tab === 'MAP');
        if (btnCams) btnCams.classList.toggle('active', tab === 'CAMERAS');
        if (btnGuards) btnGuards.classList.toggle('active', tab === 'SENTINELS');

        // Canvia la barra d'eines sobre el mapa
        const tbMap = document.getElementById('canvas-toolbar-map');
        const tbCams = document.getElementById('canvas-toolbar-cameras');
        const tbGuards = document.getElementById('canvas-toolbar-sentinels');
        if (tbMap) tbMap.style.display = (tab === 'MAP') ? 'flex' : 'none';
        if (tbCams) tbCams.style.display = (tab === 'CAMERAS') ? 'flex' : 'none';
        if (tbGuards) tbGuards.style.display = (tab === 'SENTINELS') ? 'flex' : 'none';

        // Canvia la columna de l'inspector
        const inspMap = document.getElementById('editor-inspector-map');
        const inspCams = document.getElementById('editor-inspector-cameras');
        const inspGuards = document.getElementById('editor-inspector-sentinels');
        if (inspMap) inspMap.style.display = (tab === 'MAP') ? 'flex' : 'none';
        if (inspCams) inspCams.style.display = (tab === 'CAMERAS') ? 'flex' : 'none';
        if (inspGuards) inspGuards.style.display = (tab === 'SENTINELS') ? 'flex' : 'none';

        if (tab === 'CAMERAS') {
            editorRenderCamerasInspector();
        } else if (tab === 'SENTINELS') {
            editorRenderSentinelsInspector();
        }

        editorRenderGrid();
        editorUpdateStats();
    }

    // ========================================================================
    // EINES DE DIBUIX DE MAPA (PINZELL, CAIXA, CUBELL, ROTAR, GOMA)
    // ========================================================================
    function editorSetTool(tool) {
        editorState.activeTool = tool;
        editorState.boxStart = null;
        document.querySelectorAll('.editor-tool-btn').forEach(b => b.classList.remove('active'));
        const btn = document.getElementById(`btn-tool-${tool.toLowerCase()}`);
        if (btn) btn.classList.add('active');
        if (tool === 'ERASE') {
            editorState.activeBrush = '.';
        }
        if (window.showCastleToast) {
            const toolNames = { PAINT: '✏️ Pinzell', BOX: '⏹️ Caixa/Habitació (clica 2 cantonades)', FILL: '🪣 Cubell d\'omplir', ROTATE: '🔄 Mode Girar [R]', ERASE: '🧹 Goma' };
            window.showCastleToast(`Eina activa: ${toolNames[tool] || tool}`);
        }
    }

    function editorSetBrushRotation(deg) {
        editorState.brushRotation = deg;
        document.querySelectorAll('.editor-rot-btn').forEach(b => b.classList.remove('active'));
        const btn = document.getElementById(`btn-rot-${deg}`);
        if (btn) btn.classList.add('active');
        if (window.showCastleToast) {
            window.showCastleToast(`Orientació del pinzell: ${deg}° (${getRotationSymbol(deg)})`);
        }
    }

    function editorCycleRotation() {
        const next = (editorState.brushRotation + 90) % 360;
        editorSetBrushRotation(next);
    }

    // ========================================================================
    // PALETA VISUAL DE MOBLES I ELEMENTS
    // ========================================================================
    function editorRenderCategoryPills() {
        const container = document.getElementById('editor-cat-pills');
        if (!container) return;
        container.innerHTML = '';

        PALETTE_CATEGORIES.forEach(cat => {
            const pill = document.createElement('button');
            pill.className = `editor-cat-pill ${editorState.activeCat === cat ? 'active' : ''}`;
            pill.textContent = cat;
            pill.onclick = () => {
                editorState.activeCat = cat;
                editorRenderCategoryPills();
                editorRenderPalette();
            };
            container.appendChild(pill);
        });
    }

    function editorFilterPalette(query) {
        editorState.searchQuery = (query || '').toLowerCase().trim();
        editorRenderPalette();
    }

    function editorRenderPalette() {
        const bar = document.getElementById('editor-palette-container');
        if (!bar) return;
        bar.innerHTML = '';

        let items = TILE_PALETTE;
        if (editorState.activeCat !== 'Tots') {
            items = items.filter(t => t.cat === editorState.activeCat);
        }
        if (editorState.searchQuery) {
            items = items.filter(t => t.name.toLowerCase().includes(editorState.searchQuery) || t.ch.toLowerCase() === editorState.searchQuery);
        }

        if (!items.length) {
            bar.innerHTML = `<div style="color:#64748b; font-size:0.75rem; padding:0.5rem; text-align:center; grid-column:1/-1;">Cap element coincideix amb la cerca.</div>`;
            return;
        }

        items.forEach(t => {
            const btn = document.createElement('button');
            btn.className = `editor-tile-btn ${editorState.activeBrush === t.ch ? 'active' : ''}`;
            btn.title = `${t.name} ('${t.ch}') [${t.cat}]`;
            btn.style.borderColor = t.color;
            btn.innerHTML = `<span class="editor-tile-char-badge" style="color:${t.color};">${t.ch}</span> <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${t.icon} ${t.name}</span>`;

            btn.onclick = () => {
                editorState.activeBrush = t.ch;
                if (editorState.activeTool === 'ERASE') {
                    editorSetTool('PAINT');
                }
                document.querySelectorAll('.editor-tile-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const badge = document.getElementById('editor-active-tile-name');
                if (badge) {
                    badge.innerHTML = `<span style="color:${t.color};">${t.icon} ${t.name} [${t.ch}]</span>`;
                }
            };

            bar.appendChild(btn);
        });

        const activeT = TILE_PALETTE.find(t => t.ch === editorState.activeBrush) || TILE_PALETTE[0];
        const badge = document.getElementById('editor-active-tile-name');
        if (badge) {
            badge.innerHTML = `<span style="color:${activeT.color};">${activeT.icon} ${activeT.name} [${activeT.ch}]</span>`;
        }
    }

    // ========================================================================
    // INSPECTOR VISUAL DE CÀMERES CCTV
    // ========================================================================
    function editorRenderCamerasInspector() {
        const box = document.getElementById('editor-cameras-inspector');
        if (!box) return;
        box.innerHTML = '';

        const cams = editorState.cameras || [];
        if (!cams.length) {
            box.innerHTML = `
                <div style="color:#94a3b8; font-size:0.85rem; padding:1.2rem; text-align:center; background:#050a14; border-radius:8px; border:1px dashed #334155;">
                    <div style="font-size:2rem; margin-bottom:0.4rem;">📹</div>
                    Cap càmera de seguretat en aquest sector.<br>
                    <button class="btn-hud btn-hud-gold" onclick="editorAddCamera()" style="margin-top:0.75rem; padding:0.4rem 0.9rem; font-size:0.82rem;">
                        ➕ Afegir la Primera Càmara
                    </button>
                </div>`;
            return;
        }

        if (editorState.selectedCamIdx >= cams.length) {
            editorState.selectedCamIdx = 0;
        }
        const activeCam = cams[editorState.selectedCamIdx];

        // Pills de càmeres
        const pillsWrap = document.createElement('div');
        pillsWrap.className = 'editor-list-pills';
        cams.forEach((c, idx) => {
            const btn = document.createElement('button');
            const typeStr = (c.type || (c.fixed ? 'FIXED' : 'SWEEP')).toUpperCase();
            const typeTag = typeStr === 'ROTARY_360' ? '360º' : (typeStr === 'LONG_RANGE' ? 'LONG' : (typeStr === 'FIXED' ? 'FIXA' : 'OSC'));
            btn.className = `editor-pill-btn ${idx === editorState.selectedCamIdx ? 'active' : ''}`;
            btn.innerHTML = `📹 #${idx + 1} (${typeTag} C${c.x}:R${c.z})`;
            btn.onclick = () => {
                editorState.selectedCamIdx = idx;
                editorRenderCamerasInspector();
                editorRenderGrid();
            };
            pillsWrap.appendChild(btn);
        });
        box.appendChild(pillsWrap);

        const camType = (activeCam.type || (activeCam.fixed ? 'FIXED' : 'SWEEP')).toUpperCase();
        const baseAngleDeg = radToDeg(activeCam.baseAngle);
        const sweepAngleDeg = radToDeg(activeCam.sweepAngle || 1.57);
        const sweepSpeed = activeCam.sweepSpeed !== undefined ? activeCam.sweepSpeed : 0.6;
        const viewDist = activeCam.viewDist !== undefined ? activeCam.viewDist : 7.5;
        const minDist = activeCam.minDist !== undefined ? activeCam.minDist : 0.6;
        const fov = activeCam.fov !== undefined ? activeCam.fov : (camType === 'LONG_RANGE' ? 32 : 55);

        // 1. Targetes de tipus de càmara
        const typeCardsHtml = `
            <div>
                <label style="font-size:0.72rem; color:#94a3b8; font-weight:700; text-transform:uppercase; margin-bottom:0.25rem; display:block;">
                    1. Tipus de Càmara:
                </label>
                <div class="editor-type-cards">
                    <div class="editor-type-card ${camType === 'ROTARY_360' ? 'active' : ''}" onclick="editorUpdateCamProp('type', 'ROTARY_360')">
                        <span class="editor-type-card-icon">🔄</span>
                        <div class="editor-type-card-title">Cúpula 360º</div>
                        <div class="editor-type-card-desc">Gira continuament</div>
                    </div>
                    <div class="editor-type-card ${camType === 'SWEEP' ? 'active' : ''}" onclick="editorUpdateCamProp('type', 'SWEEP')">
                        <span class="editor-type-card-icon">↔️</span>
                        <div class="editor-type-card-title">Oscil·lant</div>
                        <div class="editor-type-card-desc">Escombratge anada/tornada</div>
                    </div>
                    <div class="editor-type-card ${camType === 'FIXED' ? 'active' : ''}" onclick="editorUpdateCamProp('type', 'FIXED')">
                        <span class="editor-type-card-icon">🎯</span>
                        <div class="editor-type-card-title">Fixa</div>
                        <div class="editor-type-card-desc">Angle estàtic</div>
                    </div>
                    <div class="editor-type-card ${camType === 'LONG_RANGE' ? 'active' : ''}" onclick="editorUpdateCamProp('type', 'LONG_RANGE')">
                        <span class="editor-type-card-icon">🔭</span>
                        <div class="editor-type-card-title">Llarg Abast</div>
                        <div class="editor-type-card-desc">Con estret llunyà</div>
                    </div>
                    <div class="editor-type-card ${camType === 'PULSE' ? 'active' : ''}" onclick="editorUpdateCamProp('type', 'PULSE')">
                        <span class="editor-type-card-icon">📡</span>
                        <div class="editor-type-card-title">Radar Polsos</div>
                        <div class="editor-type-card-desc">Intermitent</div>
                    </div>
                </div>
            </div>
        `;

        // 2. Brúixola 3x3 Interactiva (9 botons visuals fàcils)
        const is360 = (camType === 'ROTARY_360');
        const compassHtml = `
            <div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem;">
                    <label style="font-size:0.72rem; color:#94a3b8; font-weight:700; text-transform:uppercase;">
                        2. Orientació Visual:
                    </label>
                    <span style="font-size:0.78rem; color:#38bdf8; font-weight:800;">
                        ${is360 ? '🔄 360° Rotació Total' : `${baseAngleDeg}° (${getDirectionArrow(activeCam.baseAngle)})`}
                    </span>
                </div>

                <div class="editor-compass-grid">
                    <button class="compass-cell-btn ${!is360 && Math.abs(baseAngleDeg - 225) < 25 ? 'active' : ''}" onclick="editorUpdateCamAngle(225)" title="Nord-Oest">↖️ NO</button>
                    <button class="compass-cell-btn ${!is360 && Math.abs(baseAngleDeg - 180) < 25 ? 'active' : ''}" onclick="editorUpdateCamAngle(180)" title="Nord">⬆️ N</button>
                    <button class="compass-cell-btn ${!is360 && Math.abs(baseAngleDeg - 135) < 25 ? 'active' : ''}" onclick="editorUpdateCamAngle(135)" title="Nord-Est">↗️ NE</button>

                    <button class="compass-cell-btn ${!is360 && Math.abs(baseAngleDeg - 270) < 25 ? 'active' : ''}" onclick="editorUpdateCamAngle(270)" title="Oest">⬅️ O</button>
                    <button class="compass-cell-btn ${is360 ? 'active' : ''}" onclick="editorUpdateCamProp('type', 'ROTARY_360')" title="Cúpula 360 graus">🔄 360°</button>
                    <button class="compass-cell-btn ${!is360 && Math.abs(baseAngleDeg - 90) < 25 ? 'active' : ''}" onclick="editorUpdateCamAngle(90)" title="Est">➡️ E</button>

                    <button class="compass-cell-btn ${!is360 && Math.abs(baseAngleDeg - 315) < 25 ? 'active' : ''}" onclick="editorUpdateCamAngle(315)" title="Sud-Oest">↙️ SO</button>
                    <button class="compass-cell-btn ${!is360 && (baseAngleDeg < 25 || baseAngleDeg >= 340) ? 'active' : ''}" onclick="editorUpdateCamAngle(0)" title="Sud">⬇️ S</button>
                    <button class="compass-cell-btn ${!is360 && Math.abs(baseAngleDeg - 45) < 25 ? 'active' : ''}" onclick="editorUpdateCamAngle(45)" title="Sud-Est">↘️ SE</button>
                </div>
            </div>
        `;

        // 3. Paràmetres amb Presets Ràpids i Sliders
        const paramsHtml = `
            <!-- Abast Màxim -->
            <div class="editor-slider-box">
                <div class="editor-slider-header">
                    <span>Abast Màxim de Detecció:</span>
                    <span class="editor-slider-val" id="cam-viewdist-val">${viewDist} caselles</span>
                </div>
                <div class="editor-btn-row">
                    <button class="editor-preset-pill ${viewDist === 5 ? 'active' : ''}" onclick="editorUpdateCamProp('viewDist', 5)">Curta (5)</button>
                    <button class="editor-preset-pill ${viewDist === 7.5 ? 'active' : ''}" onclick="editorUpdateCamProp('viewDist', 7.5)">Mitjana (7.5)</button>
                    <button class="editor-preset-pill ${viewDist === 11 ? 'active' : ''}" onclick="editorUpdateCamProp('viewDist', 11)">Llarga (11)</button>
                    <button class="editor-preset-pill ${viewDist === 15 ? 'active' : ''}" onclick="editorUpdateCamProp('viewDist', 15)">Passadís (15)</button>
                </div>
                <input type="range" min="3" max="16" step="0.5" value="${viewDist}" oninput="editorUpdateCamProp('viewDist', parseFloat(this.value)); document.getElementById('cam-viewdist-val').textContent=this.value+' caselles';">
            </div>

            <!-- Punt Cec -->
            <div class="editor-slider-box">
                <div class="editor-slider-header">
                    <span>Punt Cec Mínim (Passar per sota):</span>
                    <span class="editor-slider-val" id="cam-mindist-val">${minDist} caselles</span>
                </div>
                <div class="editor-btn-row">
                    <button class="editor-preset-pill ${minDist === 0 ? 'active' : ''}" onclick="editorUpdateCamProp('minDist', 0)">Sense Punt Cec (0)</button>
                    <button class="editor-preset-pill ${minDist === 0.8 ? 'active' : ''}" onclick="editorUpdateCamProp('minDist', 0.8)">Normal (0.8)</button>
                    <button class="editor-preset-pill ${minDist === 1.6 ? 'active' : ''}" onclick="editorUpdateCamProp('minDist', 1.6)">Gran (1.6)</button>
                </div>
                <input type="range" min="0" max="3" step="0.1" value="${minDist}" oninput="editorUpdateCamProp('minDist', parseFloat(this.value)); document.getElementById('cam-mindist-val').textContent=this.value+' caselles';">
            </div>

            <!-- Obertura del Con (FOV) & Velocitat -->
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.4rem;">
                <div class="editor-slider-box">
                    <div class="editor-slider-header">
                        <span>Obertura FOV:</span>
                        <span class="editor-slider-val" id="cam-fov-val">${fov}°</span>
                    </div>
                    <input type="range" min="20" max="110" step="5" value="${fov}" oninput="editorUpdateCamProp('fov', parseInt(this.value)); document.getElementById('cam-fov-val').textContent=this.value+'°';">
                </div>
                <div class="editor-slider-box">
                    <div class="editor-slider-header">
                        <span>Velocitat:</span>
                        <span class="editor-slider-val" id="cam-speed-val">${sweepSpeed}</span>
                    </div>
                    <input type="range" min="0.1" max="2.0" step="0.05" value="${sweepSpeed}" oninput="editorUpdateCamProp('sweepSpeed', parseFloat(this.value)); document.getElementById('cam-speed-val').textContent=this.value;">
                </div>
            </div>

            ${(camType === 'SWEEP' || camType === 'PULSE') ? `
            <div class="editor-slider-box">
                <div class="editor-slider-header">
                    <span>Arc d'Escombrat (Graus):</span>
                    <span class="editor-slider-val" id="cam-sweep-val">${sweepAngleDeg}°</span>
                </div>
                <input type="range" min="30" max="180" step="5" value="${sweepAngleDeg}" oninput="editorUpdateCamSweepAngle(this.value)">
            </div>` : ''}

            <!-- Botons d'acció de la càmara -->
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.35rem; padding-top:0.45rem; border-top:1px dashed #1e293b;">
                <span style="font-size:0.75rem; color:#94a3b8;">Ubicació: <strong style="color:#38bdf8;">C${String(activeCam.x).padStart(2,'0')}:R${String(activeCam.z).padStart(2,'0')}</strong></span>
                <button class="btn-hud btn-hud-danger" onclick="editorDeleteCamera(${editorState.selectedCamIdx})" style="padding:0.3rem 0.65rem; font-size:0.75rem;">
                    🗑️ Eliminar Aquesta Càmara
                </button>
            </div>
        `;

        const form = document.createElement('div');
        form.style.display = 'flex';
        form.style.flexDirection = 'column';
        form.style.gap = '0.65rem';
        form.innerHTML = typeCardsHtml + compassHtml + paramsHtml;
        box.appendChild(form);
    }

    function editorUpdateCamProp(prop, val) {
        const cam = editorState.cameras[editorState.selectedCamIdx];
        if (!cam) return;
        cam[prop] = val;
        if (prop === 'type') {
            cam.fixed = (val === 'FIXED');
            if (val === 'ROTARY_360') {
                cam.sweepAngle = 6.28;
                if (!cam.sweepSpeed) cam.sweepSpeed = 0.65;
                if (!cam.fov) cam.fov = 75;
                if (!cam.minDist) cam.minDist = 0.8;
            } else if (val === 'LONG_RANGE') {
                if (!cam.fov) cam.fov = 32;
                if (!cam.viewDist) cam.viewDist = 12.0;
            } else if (val === 'FIXED') {
                cam.sweepAngle = 0;
            } else if (val === 'SWEEP') {
                if (!cam.sweepAngle || cam.sweepAngle >= 6.0) cam.sweepAngle = 1.57;
            }
        }
        editorRenderCamerasInspector();
        editorRenderGrid();
        editorUpdateCodeBox();
    }

    function editorUpdateCamAngle(deg) {
        const cam = editorState.cameras[editorState.selectedCamIdx];
        if (!cam) return;
        if (cam.type === 'ROTARY_360') {
            cam.type = 'SWEEP';
            cam.fixed = false;
        }
        cam.baseAngle = degToRad(deg);
        editorRenderCamerasInspector();
        editorRenderGrid();
        editorUpdateCodeBox();
    }

    function editorUpdateCamSweepAngle(deg) {
        const cam = editorState.cameras[editorState.selectedCamIdx];
        if (!cam) return;
        cam.sweepAngle = degToRad(deg);
        const lbl = document.getElementById('cam-sweep-val');
        if (lbl) lbl.textContent = `${deg}°`;
        editorUpdateCodeBox();
    }

    function editorAddCamera(atX, atZ) {
        const newCam = {
            x: atX !== undefined ? atX : 8,
            z: atZ !== undefined ? atZ : 8,
            type: 'ROTARY_360',
            fixed: false,
            baseAngle: 0,
            sweepAngle: 6.28,
            sweepSpeed: 0.65,
            fov: 75,
            viewDist: 7.5,
            minDist: 0.8
        };
        editorState.cameras.push(newCam);
        editorState.selectedCamIdx = editorState.cameras.length - 1;
        editorRenderCamerasInspector();
        editorRenderGrid();
        editorUpdateCodeBox();
        editorUpdateStats();
        if (window.showCastleToast) window.showCastleToast('📹 Nova càmara afegida al sector!');
    }

    function editorDeleteCamera(idx) {
        if (!confirm(`Vols eliminar la càmara #${idx + 1}?`)) return;
        editorState.cameras.splice(idx, 1);
        if (editorState.selectedCamIdx >= editorState.cameras.length) {
            editorState.selectedCamIdx = Math.max(0, editorState.cameras.length - 1);
        }
        editorRenderCamerasInspector();
        editorRenderGrid();
        editorUpdateCodeBox();
        editorUpdateStats();
    }

    function editorDeleteSelectedCamera() {
        if (editorState.cameras && editorState.cameras.length > 0) {
            editorDeleteCamera(editorState.selectedCamIdx);
        }
    }

    // ========================================================================
    // INSPECTOR VISUAL DE SENTINELLES I RECORREGUTS
    // ========================================================================
    function editorRenderSentinelsInspector() {
        const box = document.getElementById('editor-sentinels-inspector');
        if (!box) return;
        box.innerHTML = '';

        const guards = editorState.enemies || [];
        if (!guards.length) {
            box.innerHTML = `
                <div style="color:#94a3b8; font-size:0.85rem; padding:1.2rem; text-align:center; background:#050a14; border-radius:8px; border:1px dashed #334155;">
                    <div style="font-size:2rem; margin-bottom:0.4rem;">💂</div>
                    Cap sentinella en aquest sector.<br>
                    <button class="btn-hud btn-hud-gold" onclick="editorAddSentinel()" style="margin-top:0.75rem; padding:0.4rem 0.9rem; font-size:0.82rem; border-color:#f59e0b; color:#fde047;">
                        ➕ Afegir el Primer Sentinella
                    </button>
                </div>`;
            return;
        }

        if (editorState.selectedGuardIdx >= guards.length) {
            editorState.selectedGuardIdx = 0;
        }
        const activeGuard = guards[editorState.selectedGuardIdx];

        // Pills de sentinelles
        const pillsWrap = document.createElement('div');
        pillsWrap.className = 'editor-list-pills';
        guards.forEach((g, idx) => {
            const btn = document.createElement('button');
            const startCoord = (g.waypoints && g.waypoints[0]) ? `C${g.waypoints[0][0]}:R${g.waypoints[0][1]}` : 'Estàtic';
            const icon = g.type === 'DRONE' ? '🛸' : (g.type === 'ELITE' ? '🎖️' : '💂');
            btn.className = `editor-pill-btn ${idx === editorState.selectedGuardIdx ? 'active' : ''}`;
            btn.innerHTML = `${icon} #${idx + 1} (${startCoord})`;
            btn.onclick = () => {
                editorState.selectedGuardIdx = idx;
                editorRenderSentinelsInspector();
                editorRenderGrid();
            };
            pillsWrap.appendChild(btn);
        });
        box.appendChild(pillsWrap);

        const waypoints = activeGuard.waypoints || [];
        const speed = activeGuard.speed !== undefined ? activeGuard.speed : 2.1;
        const fov = activeGuard.fov !== undefined ? activeGuard.fov : 65;
        const viewDist = activeGuard.viewDist !== undefined ? activeGuard.viewDist : 7.5;
        const guardType = activeGuard.type || 'PATROL';

        // 1. Tipus d'Unitat (3 Targetes)
        const typeCardsHtml = `
            <div>
                <label style="font-size:0.72rem; color:#94a3b8; font-weight:700; text-transform:uppercase; margin-bottom:0.25rem; display:block;">
                    1. Tipus d'Enemic:
                </label>
                <div class="editor-type-cards">
                    <div class="editor-type-card ${guardType === 'PATROL' ? 'active' : ''}" onclick="editorUpdateGuardProp('type', 'PATROL')">
                        <span class="editor-type-card-icon">💂</span>
                        <div class="editor-type-card-title">Soldat Normal</div>
                        <div class="editor-type-card-desc">Patrulla de rutina</div>
                    </div>
                    <div class="editor-type-card ${guardType === 'ELITE' ? 'active' : ''}" onclick="editorUpdateGuardProp('type', 'ELITE')">
                        <span class="editor-type-card-icon">🎖️</span>
                        <div class="editor-type-card-title">Guàrdia d'Elit</div>
                        <div class="editor-type-card-desc">Visió més àmplia</div>
                    </div>
                    <div class="editor-type-card ${guardType === 'DRONE' ? 'active' : ''}" onclick="editorUpdateGuardProp('type', 'DRONE')">
                        <span class="editor-type-card-icon">🛸</span>
                        <div class="editor-type-card-title">Dron Cypher</div>
                        <div class="editor-type-card-desc">Vol ràpid aeri</div>
                    </div>
                </div>
            </div>
        `;

        // 2. Presets de Recorregut Ràpid (1 Clic)
        const presetsHtml = `
            <div>
                <label style="font-size:0.72rem; color:#94a3b8; font-weight:700; text-transform:uppercase; margin-bottom:0.25rem; display:block;">
                    2. Presets de Patrulla (1 Clic):
                </label>
                <div class="editor-btn-row">
                    <button class="editor-preset-pill" onclick="editorApplyPatrolPreset('VERTICAL')">↕️ Vertical</button>
                    <button class="editor-preset-pill" onclick="editorApplyPatrolPreset('HORIZONTAL')">↔️ Horitzontal</button>
                    <button class="editor-preset-pill" onclick="editorApplyPatrolPreset('SQUARE')">🔄 Bucle Quadrat</button>
                    <button class="editor-preset-pill" onclick="editorApplyPatrolPreset('STATIC')">🧍 Estàtic</button>
                    <button class="editor-preset-pill" onclick="editorClearSentinelRoute()" style="color:#f87171;">🧹 Buidar</button>
                </div>
            </div>
        `;

        // 3. Velocitat & Detecció
        const paramsHtml = `
            <!-- Velocitat -->
            <div class="editor-slider-box">
                <div class="editor-slider-header">
                    <span>Velocitat de Marxa:</span>
                    <span class="editor-slider-val" id="guard-speed-val">${speed} m/s</span>
                </div>
                <div class="editor-btn-row">
                    <button class="editor-preset-pill ${speed === 1.5 ? 'active' : ''}" onclick="editorUpdateGuardProp('speed', 1.5)">Sigil (1.5)</button>
                    <button class="editor-preset-pill ${speed === 2.1 ? 'active' : ''}" onclick="editorUpdateGuardProp('speed', 2.1)">Estàndard (2.1)</button>
                    <button class="editor-preset-pill ${speed === 2.8 ? 'active' : ''}" onclick="editorUpdateGuardProp('speed', 2.8)">Àgil (2.8)</button>
                    <button class="editor-preset-pill ${speed === 3.4 ? 'active' : ''}" onclick="editorUpdateGuardProp('speed', 3.4)">Esprint (3.4)</button>
                </div>
                <input type="range" min="1.0" max="3.5" step="0.1" value="${speed}" oninput="editorUpdateGuardProp('speed', parseFloat(this.value)); document.getElementById('guard-speed-val').textContent=this.value+' m/s';">
            </div>

            <!-- Abast i FOV -->
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.4rem;">
                <div class="editor-slider-box">
                    <div class="editor-slider-header">
                        <span>Abast Visió:</span>
                        <span class="editor-slider-val" id="guard-viewdist-val">${viewDist}</span>
                    </div>
                    <input type="range" min="4" max="14" step="0.5" value="${viewDist}" oninput="editorUpdateGuardProp('viewDist', parseFloat(this.value)); document.getElementById('guard-viewdist-val').textContent=this.value;">
                </div>
                <div class="editor-slider-box">
                    <div class="editor-slider-header">
                        <span>Angle FOV:</span>
                        <span class="editor-slider-val" id="guard-fov-val">${fov}°</span>
                    </div>
                    <input type="range" min="40" max="90" step="5" value="${fov}" oninput="editorUpdateGuardProp('fov', parseInt(this.value)); document.getElementById('guard-fov-val').textContent=this.value+'°';">
                </div>
            </div>
        `;

        // 4. Llista Gràfica de Fites (Waypoints)
        const waypointsHtml = `
            <div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem;">
                    <label style="font-size:0.72rem; color:#94a3b8; font-weight:700; text-transform:uppercase;">
                        3. Fites Connectades (${waypoints.length}):
                    </label>
                    <span style="font-size:0.72rem; color:#fde047;">💡 Clica al mapa per afegir-ne</span>
                </div>

                <div class="editor-wp-grid">
                    ${waypoints.map((wp, i) => `
                        <div class="editor-wp-row">
                            <div>
                                <span class="editor-wp-badge">${i + 1}</span>
                                <strong>C${String(wp[0]).padStart(2, '0')}:R${String(wp[1]).padStart(2, '0')}</strong>
                            </div>
                            <button onclick="editorRemoveWaypoint(${i})" class="btn-hud btn-hud-danger" style="padding:0.15rem 0.4rem; font-size:0.7rem;" title="Eliminar fita">
                                🗑️ Treure
                            </button>
                        </div>
                    `).join('')}
                    ${!waypoints.length ? '<div style="color:#64748b; font-size:0.75rem; text-align:center; padding:0.4rem;">Sense fites de ruta. El sentinella vigilarà en posició fixa.</div>' : ''}
                </div>
            </div>

            <!-- Botons d'acció del sentinella -->
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.35rem; padding-top:0.45rem; border-top:1px dashed #1e293b;">
                <button class="btn-hud" onclick="editorAddSentinel()" style="border-color:#f59e0b; color:#fde047; font-size:0.75rem; padding:0.3rem 0.65rem;">
                    ➕ Nou Sentinella
                </button>
                <button class="btn-hud btn-hud-danger" onclick="editorDeleteSentinel(${editorState.selectedGuardIdx})" style="padding:0.3rem 0.65rem; font-size:0.75rem;">
                    🗑️ Eliminar Aquest Sentinella
                </button>
            </div>
        `;

        const form = document.createElement('div');
        form.style.display = 'flex';
        form.style.flexDirection = 'column';
        form.style.gap = '0.65rem';
        form.innerHTML = typeCardsHtml + presetsHtml + paramsHtml + waypointsHtml;
        box.appendChild(form);
    }

    function editorApplyPatrolPreset(preset) {
        const guard = editorState.enemies[editorState.selectedGuardIdx];
        if (!guard) return;
        const curWp = (guard.waypoints && guard.waypoints[0]) ? guard.waypoints[0] : [8, 8];
        const cx = curWp[0];
        const rz = curWp[1];

        if (preset === 'VERTICAL') {
            guard.waypoints = [[cx, Math.max(1, rz - 3)], [cx, Math.min(15, rz + 3)]];
        } else if (preset === 'HORIZONTAL') {
            guard.waypoints = [[Math.max(1, cx - 3), rz], [Math.min(15, cx + 3), rz]];
        } else if (preset === 'SQUARE') {
            guard.waypoints = [
                [cx, rz],
                [Math.min(15, cx + 3), rz],
                [Math.min(15, cx + 3), Math.min(15, rz + 3)],
                [cx, Math.min(15, rz + 3)]
            ];
        } else if (preset === 'STATIC') {
            guard.waypoints = [[cx, rz]];
        }

        editorRenderSentinelsInspector();
        editorRenderGrid();
        editorUpdateCodeBox();
        if (window.showCastleToast) window.showCastleToast(`⚡ Preset de patrulla [${preset}] aplicat!`);
    }

    function editorClearSentinelRoute() {
        const guard = editorState.enemies[editorState.selectedGuardIdx];
        if (!guard) return;
        const start = (guard.waypoints && guard.waypoints[0]) ? guard.waypoints[0] : [8, 8];
        guard.waypoints = [start];
        editorRenderSentinelsInspector();
        editorRenderGrid();
        editorUpdateCodeBox();
        if (window.showCastleToast) window.showCastleToast('🧹 Ruta netejada: el sentinella queda en posició estàtica.');
    }

    function editorUpdateGuardProp(prop, val) {
        const guard = editorState.enemies[editorState.selectedGuardIdx];
        if (!guard) return;
        guard[prop] = val;
        editorRenderSentinelsInspector();
        editorRenderGrid();
        editorUpdateCodeBox();
    }

    function editorAddWaypointToSentinel(c, r) {
        const guard = editorState.enemies[editorState.selectedGuardIdx];
        if (!guard) return;
        if (!Array.isArray(guard.waypoints)) guard.waypoints = [];

        // Si la cel·la ja és una fita, l'esborra
        const existingIdx = guard.waypoints.findIndex(wp => wp[0] === c && wp[1] === r);
        if (existingIdx !== -1) {
            guard.waypoints.splice(existingIdx, 1);
            if (window.showCastleToast) window.showCastleToast(`Fita #${existingIdx + 1} esborrada de la ruta.`);
        } else {
            guard.waypoints.push([c, r]);
            if (window.showCastleToast) {
                window.showCastleToast(`📍 Fita #${guard.waypoints.length} connectada a C${String(c).padStart(2, '0')}:R${String(r).padStart(2, '0')}`);
            }
        }

        editorRenderSentinelsInspector();
        editorRenderGrid();
        editorUpdateCodeBox();
    }

    function editorRemoveWaypoint(idx) {
        const guard = editorState.enemies[editorState.selectedGuardIdx];
        if (!guard || !guard.waypoints) return;
        guard.waypoints.splice(idx, 1);
        editorRenderSentinelsInspector();
        editorRenderGrid();
        editorUpdateCodeBox();
    }

    function editorAddSentinel(atX, atZ) {
        const x = atX !== undefined ? atX : 7;
        const z = atZ !== undefined ? atZ : 7;
        const newGuard = {
            type: 'PATROL',
            waypoints: [
                [x, z],
                [Math.min(15, x + 3), z],
                [Math.min(15, x + 3), Math.min(15, z + 3)],
                [x, Math.min(15, z + 3)]
            ],
            speed: 2.1,
            fov: 65,
            viewDist: 7.5
        };
        editorState.enemies.push(newGuard);
        editorState.selectedGuardIdx = editorState.enemies.length - 1;
        editorRenderSentinelsInspector();
        editorRenderGrid();
        editorUpdateCodeBox();
        editorUpdateStats();
        if (window.showCastleToast) window.showCastleToast('💂 Nou sentinella afegit al sector!');
    }

    function editorDeleteSentinel(idx) {
        if (!confirm(`Vols eliminar el sentinella #${idx + 1}?`)) return;
        editorState.enemies.splice(idx, 1);
        if (editorState.selectedGuardIdx >= editorState.enemies.length) {
            editorState.selectedGuardIdx = Math.max(0, editorState.enemies.length - 1);
        }
        editorRenderSentinelsInspector();
        editorRenderGrid();
        editorUpdateCodeBox();
        editorUpdateStats();
    }

    function editorDeleteSelectedSentinel() {
        if (editorState.enemies && editorState.enemies.length > 0) {
            editorDeleteSentinel(editorState.selectedGuardIdx);
        }
    }

    // ========================================================================
    // CÀLCUL DE CON DE VISIÓ EN TEMPS REAL PER A LA GRAELLA 2D
    // ========================================================================
    function calculateCameraVisionCells(cam) {
        const visionSet = new Set();
        const blindSet = new Set();
        if (!cam) return { visionSet, blindSet };

        const map = editorState.gridMatrix;
        if (!map || !map.length) return { visionSet, blindSet };
        const numRows = map.length;
        const numCols = map[0].length;

        const cx = cam.x;
        const cz = cam.z;
        const maxDist = cam.viewDist || 7.5;
        const minDist = cam.minDist || 0.6;
        const is360 = (cam.type === 'ROTARY_360');
        const baseAngle = cam.baseAngle || 0;
        const fovRad = degToRad(cam.fov || 65);

        for (let r = 0; r < numRows; r++) {
            for (let c = 0; c < numCols; c++) {
                if (c === cx && r === cz) continue;
                const dx = c - cx;
                const dz = r - cz;
                const dist = Math.sqrt(dx * dx + dz * dz);
                if (dist > maxDist) continue;

                let cellAngle = Math.atan2(dx, dz);
                if (cellAngle < 0) cellAngle += Math.PI * 2;

                let inFrustum = false;
                if (is360) {
                    inFrustum = true;
                } else {
                    let diff = Math.abs(cellAngle - baseAngle);
                    if (diff > Math.PI) diff = Math.PI * 2 - diff;
                    inFrustum = (diff <= fovRad / 2);
                }

                if (inFrustum) {
                    // Raycast 2D simple contra murs '#'
                    let blocked = false;
                    const steps = Math.ceil(dist * 2);
                    for (let s = 1; s < steps; s++) {
                        const checkX = Math.round(cx + (dx * s) / steps);
                        const checkZ = Math.round(cz + (dz * s) / steps);
                        if (checkX === c && checkZ === r) break;
                        if (map[checkZ] && map[checkZ][checkX] === '#') {
                            blocked = true;
                            break;
                        }
                    }

                    if (!blocked) {
                        const key = `${c},${r}`;
                        if (dist <= minDist) {
                            blindSet.add(key);
                        } else {
                            visionSet.add(key);
                        }
                    }
                }
            }
        }

        return { visionSet, blindSet };
    }

    // ========================================================================
    // RENDERITZACIÓ DE LA GRAELLA VISUAL 2D
    // ========================================================================
    function editorRenderGrid() {
        const container = document.getElementById('editor-grid-container');
        if (!container) return;
        container.innerHTML = '';

        const map = editorState.gridMatrix;
        if (!map || !map.length) return;

        const numRows = map.length;
        const numCols = map[0].length;

        const table = document.createElement('table');
        table.className = 'editor-grid-table';

        // Capçalera de columnes
        const headerRow = document.createElement('tr');
        const cornerTh = document.createElement('th');
        cornerTh.className = 'editor-coord-header';
        cornerTh.textContent = 'C\\R';
        headerRow.appendChild(cornerTh);

        for (let c = 0; c < numCols; c++) {
            const th = document.createElement('th');
            th.className = 'editor-coord-header';
            th.textContent = c < 10 ? `0${c}` : `${c}`;
            headerRow.appendChild(th);
        }
        table.appendChild(headerRow);

        // Con de visió de càmera activa
        const activeCam = (editorState.cameras && editorState.cameras[editorState.selectedCamIdx]) || null;
        const { visionSet, blindSet } = (editorState.activeSubTab === 'CAMERAS' && activeCam) ? calculateCameraVisionCells(activeCam) : { visionSet: new Set(), blindSet: new Set() };

        // Camí del sentinella actiu
        const activeGuard = (editorState.enemies && editorState.enemies[editorState.selectedGuardIdx]) || null;
        const activeWaypoints = activeGuard ? (activeGuard.waypoints || []) : [];
        const pathSet = new Set();
        if (editorState.activeSubTab === 'SENTINELS' && activeWaypoints.length > 1) {
            for (let i = 0; i < activeWaypoints.length; i++) {
                const wpA = activeWaypoints[i];
                const wpB = activeWaypoints[(i + 1) % activeWaypoints.length];
                const dX = wpB[0] - wpA[0];
                const dZ = wpB[1] - wpA[1];
                const steps = Math.max(Math.abs(dX), Math.abs(dZ));
                for (let s = 0; s <= steps; s++) {
                    const stepC = Math.round(wpA[0] + (dX * s) / (steps || 1));
                    const stepR = Math.round(wpA[1] + (dZ * s) / (steps || 1));
                    pathSet.add(`${stepC},${stepR}`);
                }
            }
        }

        // Dibuix de files i cel·les
        for (let r = 0; r < numRows; r++) {
            const tr = document.createElement('tr');

            const th = document.createElement('th');
            th.className = 'editor-coord-row-header';
            th.textContent = r < 10 ? `0${r}` : `${r}`;
            tr.appendChild(th);

            const rowStr = map[r] || '';
            for (let c = 0; c < numCols; c++) {
                const ch = rowStr[c] || '.';
                const td = document.createElement('td');
                td.className = 'editor-cell';
                td.dataset.row = r;
                td.dataset.col = c;

                const tileInfo = TILE_PALETTE.find(t => t.ch === ch) || {
                    ch,
                    name: `Element '${ch}'`,
                    color: '#cbd5e1',
                    bg: '#0f172a',
                    icon: ch,
                    rotatable: true
                };

                td.style.backgroundColor = tileInfo.bg;
                td.style.color = tileInfo.color;
                td.innerHTML = `<span class="cell-glyph">${tileInfo.icon}</span>`;
                td.title = `C${String(c).padStart(2, '0')}:R${String(r).padStart(2, '0')} — ${tileInfo.name}`;

                const coordKey = `${c},${r}`;

                // Indicador de rotació
                const cellRot = editorState.rotations[coordKey];
                if (cellRot !== undefined && cellRot !== null && cellRot !== 0) {
                    const rotInd = document.createElement('span');
                    rotInd.className = 'cell-rot-indicator';
                    rotInd.textContent = getRotationSymbol(cellRot);
                    rotInd.title = `Orientació: ${cellRot}°`;
                    td.appendChild(rotInd);
                }

                // Ressaltat de visió en mode càmeres
                if (visionSet.has(coordKey)) {
                    td.classList.add('cell-cam-vision');
                } else if (blindSet.has(coordKey)) {
                    td.classList.add('cell-cam-blindspot');
                }

                // Ressaltat de camí de patrulla en mode sentinelles
                if (pathSet.has(coordKey) && !activeWaypoints.some(wp => wp[0] === c && wp[1] === r)) {
                    td.classList.add('cell-wp-path-highlight');
                }

                // Càmera overlay
                const camIdx = editorState.cameras.findIndex(cam => cam.x === c && cam.z === r);
                if (camIdx !== -1) {
                    const cam = editorState.cameras[camIdx];
                    const camTypeStr = (cam.type || (cam.fixed ? 'FIXED' : 'SWEEP')).toUpperCase();
                    const arrow = camTypeStr === 'ROTARY_360' ? '🔄' : getDirectionArrow(cam.baseAngle);

                    const badge = document.createElement('span');
                    badge.className = 'cell-cam-badge';
                    if (camIdx === editorState.selectedCamIdx && editorState.activeSubTab === 'CAMERAS') {
                        badge.style.background = '#e11d48';
                        badge.style.boxShadow = '0 0 10px #e11d48';
                        td.style.outline = '2px solid #e11d48';
                        td.style.zIndex = '8';
                    }
                    badge.textContent = `📹${arrow}`;
                    badge.title = `Càmera #${camIdx + 1} (${camTypeStr}) - Clic per seleccionar`;
                    td.appendChild(badge);
                }

                // Sentinella origin overlay
                const guardIdx = editorState.enemies.findIndex(e => e.waypoints && e.waypoints[0] && e.waypoints[0][0] === c && e.waypoints[0][1] === r);
                if (guardIdx !== -1) {
                    const g = editorState.enemies[guardIdx];
                    const gIcon = g.type === 'DRONE' ? '🛸' : (g.type === 'ELITE' ? '🎖️' : '💂');
                    const gBadge = document.createElement('span');
                    gBadge.className = 'cell-guard-badge';
                    if (guardIdx === editorState.selectedGuardIdx && editorState.activeSubTab === 'SENTINELS') {
                        gBadge.style.background = '#eab308';
                        gBadge.style.color = '#000';
                        gBadge.style.boxShadow = '0 0 10px #eab308';
                        td.style.outline = '2px solid #eab308';
                        td.style.zIndex = '8';
                    }
                    gBadge.textContent = gIcon;
                    gBadge.title = `Sentinella #${guardIdx + 1} (Origen)`;
                    td.appendChild(gBadge);
                }

                // Fites de patrulla numerades
                if (editorState.activeSubTab === 'SENTINELS') {
                    const wpOrder = activeWaypoints.findIndex(wp => wp[0] === c && wp[1] === r);
                    if (wpOrder !== -1) {
                        const wpMarker = document.createElement('span');
                        wpMarker.className = 'cell-wp-marker';
                        wpMarker.textContent = `${wpOrder + 1}`;
                        wpMarker.title = `Fita #${wpOrder + 1} (Clic per eliminar)`;
                        td.appendChild(wpMarker);
                    }
                }

                // GESTIÓ D'INTERACCIÓ DIRECTA SOBRE LA GRAELLA
                td.onpointerdown = (e) => {
                    e.preventDefault();

                    // 1. MODE DIBUIXAR MAPA
                    if (editorState.activeSubTab === 'MAP') {
                        if (e.button === 2) {
                            editorPaintCell(r, c, '.');
                            return;
                        }
                        if (editorState.activeTool === 'ROTATE') {
                            editorRotateCell(r, c);
                            return;
                        }
                        if (editorState.activeTool === 'FILL') {
                            editorFloodFill(r, c, editorState.activeBrush);
                            return;
                        }
                        if (editorState.activeTool === 'BOX') {
                            if (!editorState.boxStart) {
                                editorState.boxStart = { r, c };
                                if (window.showCastleToast) window.showCastleToast(`Punt inicial de la caixa marcat a C${c}:R${r}. Clica ara l'extrem oposat!`);
                            } else {
                                editorDrawBox(editorState.boxStart.r, editorState.boxStart.c, r, c, editorState.activeBrush);
                                editorState.boxStart = null;
                            }
                            return;
                        }
                        // Pinzell normal o Goma: NOMÉS pinta quan es fa clic directe
                        editorPaintCell(r, c, editorState.activeTool === 'ERASE' ? '.' : editorState.activeBrush);
                    }
                    // 2. MODE CÀMERES CCTV
                    else if (editorState.activeSubTab === 'CAMERAS') {
                        if (camIdx !== -1) {
                            // Clic sobre una càmara existent: la selecciona o la gira amb clic dret
                            editorState.selectedCamIdx = camIdx;
                            if (e.button === 2) {
                                const cam = editorState.cameras[camIdx];
                                const curDeg = radToDeg(cam.baseAngle);
                                editorUpdateCamAngle((curDeg + 45) % 360);
                            } else {
                                editorRenderCamerasInspector();
                                editorRenderGrid();
                            }
                        } else {
                            // Clic sobre una cel·la buida: mou la càmara seleccionada aquí
                            const curCam = editorState.cameras[editorState.selectedCamIdx];
                            if (curCam) {
                                curCam.x = c;
                                curCam.z = r;
                                editorRenderCamerasInspector();
                                editorRenderGrid();
                                editorUpdateCodeBox();
                                if (window.showCastleToast) window.showCastleToast(`📹 Càmera moguda a C${String(c).padStart(2, '0')}:R${String(r).padStart(2, '0')}`);
                            } else {
                                editorAddCamera(c, r);
                            }
                        }
                    }
                    // 3. MODE SENTINELLES & RUTES
                    else if (editorState.activeSubTab === 'SENTINELS') {
                        if (guardIdx !== -1 && !activeWaypoints.some(wp => wp[0] === c && wp[1] === r)) {
                            // Clic sobre un altre sentinella el selecciona
                            editorState.selectedGuardIdx = guardIdx;
                            editorRenderSentinelsInspector();
                            editorRenderGrid();
                        } else {
                            // Clic a qualsevol cel·la afegeix o treu fita de patrulla en temps real!
                            editorAddWaypointToSentinel(c, r);
                        }
                    }
                };

                // Passar per sobre només actualitza la informació de coordenades, MAI pinta
                td.onpointerenter = () => {
                    editorUpdateCursorHover(r, c, ch);
                };

                td.oncontextmenu = (e) => {
                    e.preventDefault();
                };

                tr.appendChild(td);
            }
            table.appendChild(tr);
        }

        container.appendChild(table);

        window.onpointerup = () => {
            editorState.isMouseDown = false;
        };
    }

    // Rotació de rajola
    function editorRotateCell(r, c) {
        const key = `${c},${r}`;
        const curRot = editorState.rotations[key] || 0;
        const nextRot = (curRot + 90) % 360;
        if (nextRot === 0) {
            delete editorState.rotations[key];
        } else {
            editorState.rotations[key] = nextRot;
        }
        editorRenderGrid();
        editorUpdateCodeBox();
        if (window.showCastleToast) {
            window.showCastleToast(`🔄 Objecte a C${String(c).padStart(2, '0')}:R${String(r).padStart(2, '0')} girat a ${nextRot}° (${getRotationSymbol(nextRot)})`);
        }
    }

    // Pintar una casella
    function editorPaintCell(r, c, newChar) {
        if (!editorState.gridMatrix[r]) return;
        const row = editorState.gridMatrix[r];
        if (c < 0 || c >= row.length) return;

        const key = `${c},${r}`;
        if (newChar === '.') {
            delete editorState.rotations[key];
        } else if (editorState.brushRotation !== 0) {
            editorState.rotations[key] = editorState.brushRotation;
        }

        const newRow = row.substring(0, c) + newChar + row.substring(c + 1);
        editorState.gridMatrix[r] = newRow;

        editorRenderGrid();
        editorUpdateCodeBox();
        editorUpdateStats();
    }

    // Eina Caixa / Rectangle d'habitacions
    function editorDrawBox(r1, c1, r2, c2, char) {
        const minR = Math.min(r1, r2);
        const maxR = Math.max(r1, r2);
        const minC = Math.min(c1, c2);
        const maxC = Math.max(c1, c2);

        for (let r = minR; r <= maxR; r++) {
            for (let c = minC; c <= maxC; c++) {
                // Per murs fem contorn, per terra fem farcit
                const isBorder = (r === minR || r === maxR || c === minC || c === maxC);
                if (char === '#' ? isBorder : true) {
                    if (editorState.gridMatrix[r]) {
                        const row = editorState.gridMatrix[r];
                        editorState.gridMatrix[r] = row.substring(0, c) + char + row.substring(c + 1);
                    }
                }
            }
        }

        editorRenderGrid();
        editorUpdateCodeBox();
        editorUpdateStats();
        if (window.showCastleToast) window.showCastleToast(`⏹️ Caixa rectangular dibuixada (${maxC - minC + 1}x${maxR - minR + 1})!`);
    }

    // Eina Cubell d'omplir (Flood fill)
    function editorFloodFill(startR, startC, newChar) {
        if (!editorState.gridMatrix[startR]) return;
        const targetChar = editorState.gridMatrix[startR][startC];
        if (targetChar === newChar) return;

        const numRows = editorState.gridMatrix.length;
        const numCols = editorState.gridMatrix[0].length;
        const queue = [[startR, startC]];
        const visited = new Set();

        while (queue.length > 0) {
            const [r, c] = queue.pop();
            const key = `${c},${r}`;
            if (visited.has(key)) continue;
            visited.add(key);

            if (r < 0 || r >= numRows || c < 0 || c >= numCols) continue;
            if (editorState.gridMatrix[r][c] !== targetChar) continue;

            const row = editorState.gridMatrix[r];
            editorState.gridMatrix[r] = row.substring(0, c) + newChar + row.substring(c + 1);

            queue.push([r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]);
        }

        editorRenderGrid();
        editorUpdateCodeBox();
        editorUpdateStats();
        if (window.showCastleToast) window.showCastleToast('🪣 Àrea omplerta amb èxit!');
    }

    function editorUpdateCursorHover(r, c, ch) {
        const label = document.getElementById('editor-cursor-pos');
        if (!label) return;
        const tile = TILE_PALETTE.find(t => t.ch === ch);
        const name = tile ? tile.name : `Element '${ch}'`;
        const rot = editorState.rotations[`${c},${r}`];
        const rotStr = (rot !== undefined && rot !== 0) ? ` · ${rot}° (${getRotationSymbol(rot)})` : '';
        label.innerHTML = `📍 Coordenada: <strong style="color:#38bdf8;">C${String(c).padStart(2, '0')}:R${String(r).padStart(2, '0')}</strong> (${name}${rotStr})`;
    }

    function editorUpdateStats() {
        const map = editorState.gridMatrix;
        if (!map || !map.length) return;

        const numRows = map.length;
        const numCols = map[0].length;

        let spawnCount = 0;
        let gateCount = 0;
        let palCount = 0;
        let pcCount = 0;

        for (let r = 0; r < numRows; r++) {
            for (let c = 0; c < numCols; c++) {
                const ch = map[r][c];
                if (ch === 'S') spawnCount++;
                if (ch === 'G') gateCount++;
                if (ch === 'K') palCount++;
                if (ch === 'R') pcCount++;
            }
        }

        const dimsEl = document.getElementById('editor-grid-dimensions');
        if (dimsEl) {
            dimsEl.textContent = `Mida: ${numCols}x${numRows} | [S]: ${spawnCount} | [G]: ${gateCount} | Discs: ${palCount} | PCs: ${pcCount}`;
        }

        const camCountBadge = document.getElementById('editor-badge-cam-count');
        if (camCountBadge) camCountBadge.textContent = editorState.cameras.length;

        const guardCountBadge = document.getElementById('editor-badge-guard-count');
        if (guardCountBadge) guardCountBadge.textContent = editorState.enemies.length;

        const sourceInd = document.getElementById('editor-source-indicator');
        if (sourceInd) {
            let isCustom = false;
            const raw = localStorage.getItem('TOR_CUSTOM_LEVELS');
            if (raw) {
                try {
                    const data = JSON.parse(raw);
                    if (data[editorState.sectorId]) isCustom = true;
                } catch (e) {}
            }
            if (isCustom) {
                sourceInd.innerHTML = `💾 Modificat a l'editor (desat al navegador) · <a href="javascript:void(0)" onclick="editorRestoreDefaults()" style="color:#fde047; text-decoration:underline;">Restaurar al fitxer js/levels.js</a>`;
                sourceInd.style.background = 'rgba(234, 179, 8, 0.2)';
                sourceInd.style.border = '1px solid #eab308';
                sourceInd.style.color = '#fde047';
            } else {
                sourceInd.innerHTML = `📄 Fitxer original carregat (js/levels.js)`;
                sourceInd.style.background = 'rgba(34, 197, 94, 0.15)';
                sourceInd.style.border = '1px solid #22c55e';
                sourceInd.style.color = '#86efac';
            }
        }
    }

    // ========================================================================
    // APLICACIÓ AL MOTOR 3D EN VIU (1 CLIC)
    // ========================================================================
    function editorApplyTo3DGame() {
        const missions = window.TACTICAL_MISSIONS || [];
        const m = missions.find(tm => tm.id === editorState.sectorId);
        if (!m) return;

        m.map = JSON.parse(JSON.stringify(editorState.gridMatrix));
        m.rotations = JSON.parse(JSON.stringify(editorState.rotations));
        m.cameras = JSON.parse(JSON.stringify(editorState.cameras));
        m.enemies = JSON.parse(JSON.stringify(editorState.enemies));

        // Desa a LocalStorage
        editorSaveToStorage(false);

        if (window.appState) {
            window.appState.currentMissionIdx = editorState.sectorId - 1;
            if (window.saveState) window.saveState();
        }

        closeLevelEditorModal();

        if (window.loadCurrentMissionInto3D) {
            window.loadCurrentMissionInto3D(false);
        }

        if (window.showCastleToast) {
            window.showCastleToast(`⚡ Sector 0${editorState.sectorId} carregat en viu al motor 3D!`);
        }
    }

    // ========================================================================
    // MODAL D'IMPORTACIÓ I EXPORTACIÓ DE CODI
    // ========================================================================
    function editorOpenCodeModal() {
        const modal = document.getElementById('editor-code-modal');
        if (!modal) return;
        editorUpdateCodeBox();
        modal.style.display = 'flex';
        modal.classList.add('active');
    }

    function editorCloseCodeModal() {
        const modal = document.getElementById('editor-code-modal');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('active');
        }
    }

    function editorGetFormat() {
        const sel = document.getElementById('editor-code-format');
        if (sel) return sel.value;
        return 'json';
    }

    function editorUpdateCodeBox() {
        const textarea = document.getElementById('editor-code-textarea');
        if (!textarea) return;

        const format = editorGetFormat();
        if (format === 'ascii') {
            textarea.value = editorState.gridMatrix.join('\n');
        } else {
            const payload = {
                sector: editorState.sectorId,
                map: editorState.gridMatrix,
                rotations: editorState.rotations,
                cameras: editorState.cameras,
                enemies: editorState.enemies
            };
            textarea.value = JSON.stringify(payload, null, 2);
        }

        editorValidateCodeBox();
    }

    function editorValidateCodeBox() {
        const textarea = document.getElementById('editor-code-textarea');
        const badge = document.getElementById('editor-status-msg');
        if (!textarea || !badge) return;

        const text = textarea.value.trim();
        if (!text) {
            badge.style.display = 'none';
            return;
        }

        const format = editorGetFormat();
        if (format === 'ascii') {
            const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith('//') && !l.startsWith('==='));
            if (!lines.length) return;
            badge.style.display = 'block';
            badge.style.background = 'rgba(34, 197, 94, 0.2)';
            badge.style.border = '1px solid #22c55e';
            badge.style.color = '#86efac';
            badge.innerHTML = `✅ Matriu vàlida (${lines[0].length}x${lines.length})`;
        } else {
            try {
                JSON.parse(text);
                badge.style.display = 'block';
                badge.style.background = 'rgba(34, 197, 94, 0.2)';
                badge.style.border = '1px solid #22c55e';
                badge.style.color = '#86efac';
                badge.innerHTML = `✅ JSON complet vàlid`;
            } catch (e) {
                badge.style.display = 'block';
                badge.style.background = 'rgba(239, 68, 68, 0.2)';
                badge.style.border = '1px solid #ef4444';
                badge.style.color = '#fca5a5';
                badge.innerHTML = `⚠️ Error de sintaxi JSON`;
            }
        }
    }

    function editorParseCodeBox() {
        const textarea = document.getElementById('editor-code-textarea');
        if (!textarea) return;
        const text = textarea.value.trim();
        if (!text) return;

        if (text.startsWith('{') || text.startsWith('[')) {
            try {
                const parsed = JSON.parse(text);
                if (Array.isArray(parsed.map) && parsed.map.length > 0) editorState.gridMatrix = parsed.map;
                if (parsed.rotations) editorState.rotations = parsed.rotations;
                if (Array.isArray(parsed.cameras)) editorState.cameras = parsed.cameras;
                if (Array.isArray(parsed.enemies)) editorState.enemies = parsed.enemies;
                editorRenderGrid();
                editorUpdateStats();
                editorValidateCodeBox();
                if (editorState.activeSubTab === 'CAMERAS') editorRenderCamerasInspector();
                if (editorState.activeSubTab === 'SENTINELS') editorRenderSentinelsInspector();
                editorCloseCodeModal();
                if (window.showCastleToast) window.showCastleToast('📥 Codi complet carregat amb èxit a l\'editor!');
                return;
            } catch (e) {
                console.error('Error carregant JSON:', e);
            }
        }

        // Si és matriu ASCII
        const rawLines = text.split('\n');
        const mapLines = [];
        for (const line of rawLines) {
            const cleaned = line.trim().replace(/^["']/, '').replace(/["'],?$/, '');
            if (!cleaned || cleaned.startsWith('//') || cleaned.startsWith('===') || cleaned.startsWith('```') || cleaned.startsWith('[') || cleaned.startsWith('{')) {
                continue;
            }
            mapLines.push(cleaned);
        }

        if (mapLines.length > 0) {
            editorState.gridMatrix = mapLines;
            editorRenderGrid();
            editorUpdateStats();
            editorValidateCodeBox();
            editorCloseCodeModal();
            if (window.showCastleToast) window.showCastleToast(`📥 Matriu ASCII de ${mapLines[0].length}x${mapLines.length} carregada!`);
        }
    }

    function editorCopyCode() {
        const payload = {
            sector: editorState.sectorId,
            map: editorState.gridMatrix,
            rotations: editorState.rotations,
            cameras: editorState.cameras,
            enemies: editorState.enemies
        };
        const exportText = `=== TOR TACTICAL BUNDLE: SECTOR 0${editorState.sectorId} ===\n` + JSON.stringify(payload, null, 2);

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(exportText).then(() => {
                if (window.showCastleToast) window.showCastleToast('📋 Codi complet copiat al portapapers! Ja el pots enganxar al xat.');
            }).catch(() => {
                prompt('Copia aquest codi:', exportText);
            });
        } else {
            prompt('Copia aquest codi:', exportText);
        }
    }

    function editorSaveToStorage(showToast = true) {
        let storageData = {};
        const raw = localStorage.getItem('TOR_CUSTOM_LEVELS');
        if (raw) {
            try { storageData = JSON.parse(raw); } catch (e) {}
        }

        storageData[editorState.sectorId] = {
            map: editorState.gridMatrix,
            rotations: editorState.rotations,
            cameras: editorState.cameras,
            enemies: editorState.enemies
        };

        localStorage.setItem('TOR_CUSTOM_LEVELS', JSON.stringify(storageData));

        const missions = window.TACTICAL_MISSIONS || [];
        const m = missions.find(tm => tm.id === editorState.sectorId);
        if (m) {
            m.map = JSON.parse(JSON.stringify(editorState.gridMatrix));
            m.rotations = JSON.parse(JSON.stringify(editorState.rotations));
            m.cameras = JSON.parse(JSON.stringify(editorState.cameras));
            m.enemies = JSON.parse(JSON.stringify(editorState.enemies));
        }

        if (showToast && window.showCastleToast) {
            window.showCastleToast(`💾 Sector 0${editorState.sectorId} desat permanentment al navegador!`);
        }

        editorUpdateStats();
    }

    function editorRestoreDefaults() {
        if (!confirm(`⚠️ Segur que vols restaurar el Sector 0${editorState.sectorId} al disseny original de fàbrica?`)) {
            return;
        }

        const raw = localStorage.getItem('TOR_CUSTOM_LEVELS');
        if (raw) {
            try {
                const storageData = JSON.parse(raw);
                delete storageData[editorState.sectorId];
                localStorage.setItem('TOR_CUSTOM_LEVELS', JSON.stringify(storageData));
            } catch (e) {}
        }

        const defaults = window.DEFAULT_TACTICAL_MISSIONS || [];
        const orig = defaults.find(tm => tm.id === editorState.sectorId);
        const missions = window.TACTICAL_MISSIONS || [];
        const current = missions.find(tm => tm.id === editorState.sectorId);

        if (orig && current) {
            current.map = JSON.parse(JSON.stringify(orig.map));
            current.rotations = JSON.parse(JSON.stringify(orig.rotations || {}));
            current.cameras = JSON.parse(JSON.stringify(orig.cameras || []));
            current.enemies = JSON.parse(JSON.stringify(orig.enemies || []));

            editorState.gridMatrix = JSON.parse(JSON.stringify(orig.map));
            editorState.rotations = JSON.parse(JSON.stringify(orig.rotations || {}));
            editorState.cameras = JSON.parse(JSON.stringify(orig.cameras || []));
            editorState.enemies = JSON.parse(JSON.stringify(orig.enemies || []));

            editorRenderGrid();
            editorUpdateStats();
            if (editorState.activeSubTab === 'CAMERAS') editorRenderCamerasInspector();
            if (editorState.activeSubTab === 'SENTINELS') editorRenderSentinelsInspector();

            if (window.showCastleToast) {
                window.showCastleToast(`🔄 Sector 0${editorState.sectorId} restaurat a l'original.`);
            }
        }
    }

    // Exportacions globals a window
    window.initLevelEditor = initLevelEditor;
    window.loadCustomLevelsFromStorage = loadCustomLevelsFromStorage;
    window.openLevelEditorModal = openLevelEditorModal;
    window.closeLevelEditorModal = closeLevelEditorModal;
    window.editorSelectSector = editorSelectSector;
    window.editorSetSubTab = editorSetSubTab;
    window.editorSetTool = editorSetTool;
    window.editorSetBrushRotation = editorSetBrushRotation;
    window.editorCycleRotation = editorCycleRotation;
    window.editorFilterPalette = editorFilterPalette;
    window.editorApplyTo3DGame = editorApplyTo3DGame;
    window.editorOpenCodeModal = editorOpenCodeModal;
    window.editorCloseCodeModal = editorCloseCodeModal;
    window.editorUpdateCodeBox = editorUpdateCodeBox;
    window.editorParseCodeBox = editorParseCodeBox;
    window.editorCopyCode = editorCopyCode;
    window.editorSaveToStorage = editorSaveToStorage;
    window.editorRestoreDefaults = editorRestoreDefaults;
    window.editorUpdateCamProp = editorUpdateCamProp;
    window.editorUpdateCamAngle = editorUpdateCamAngle;
    window.editorUpdateCamSweepAngle = editorUpdateCamSweepAngle;
    window.editorAddCamera = editorAddCamera;
    window.editorDeleteCamera = editorDeleteCamera;
    window.editorDeleteSelectedCamera = editorDeleteSelectedCamera;
    window.editorApplyPatrolPreset = editorApplyPatrolPreset;
    window.editorClearSentinelRoute = editorClearSentinelRoute;
    window.editorUpdateGuardProp = editorUpdateGuardProp;
    window.editorAddWaypointToSentinel = editorAddWaypointToSentinel;
    window.editorRemoveWaypoint = editorRemoveWaypoint;
    window.editorAddSentinel = editorAddSentinel;
    window.editorDeleteSentinel = editorDeleteSentinel;
    window.editorDeleteSelectedSentinel = editorDeleteSelectedSentinel;

    window.addEventListener('DOMContentLoaded', initLevelEditor);

})();
