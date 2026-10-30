// ============================================================================
// CONTROLADOR PRINCIPAL — METAL GEAR LOGIC: PROTOCOL SHADOW CIRCUIT
// Espionatge Tàctic, Sistema Codec, Dossier d'Història, i Portes Lògiques 3D
// ============================================================================

const STORAGE_KEY = 'mgs_logic_protocol_shadow_circuit_v2';
const INITIAL_TIME_SECONDS = 50 * 60; // 50 minuts (3000 segons)
const LOGIC_ERROR_PENALTY_SEC = 30;   // -30 segons per error en porta lògica
const HAZARD_HIT_PENALTY_SEC = 60;    // -1:00 min per ser detectat per sentinella o càmera CCTV
const CHEST_BONUS_TIME_SEC = 25;      // +00:25 segons per obrir caixa de racions / municions

let appState = {
    studentName: '',
    studentGroup: '2n ESO A',
    avatar: '🐍',
    gameStarted: false,
    introSeen: false,
    currentMissionIdx: 0, // 0..9 (10 missions)
    completedMissions: [],
    remainingSeconds: INITIAL_TIME_SECONDS,
    realElapsedSeconds: 0,
    logicHits: 0,
    logicErrors: 0,
    hazardHits: 0,
    chestsOpened: 0,
    errorsByMission: {},
    gameFinished: false,
    gameOverLost: false,
    seenCodecs: {}
};

let engine3D = null;
let timerInterval = null;
let currentCrystalsCollected = 0;
let currentCrystalsTotal = 0;
let currentDoorUnlocked = false;
let missionTransitionLock = false;

// Active Gate Puzzle Modal State
let activePuzzleState = {
    mode: 'FINAL_GATE', // 'SUB_DOOR' o 'FINAL_GATE'
    activeSubDoor: null,
    stepIdx: 0,
    selectedDeduceBit: null,
    configInputs: { A: 0, B: 0, C: 0, D: 0 },
    transmittedSignalOut: null // Sortida calculada NOMÉS en prémer el botó de validació
};

// Interactive simulators inside Library Modal
let librarySimInputs = {
    NOT: { A: 0 },
    AND: { A: 0, B: 0 },
    OR: { A: 0, B: 0 },
    XOR: { A: 0, B: 0 },
    NAND: { A: 0, B: 0 },
    NOR: { A: 0, B: 0 },
    XNOR: { A: 0, B: 0 }
};

// ============================================================================
// RETRATS CODEC I DOSSIER HISTÒRIA
// ============================================================================
const CODEC_PORTRAITS = {
    'Campbell': 'assets/codec_coronel.jpg',
    'Coronel Campbell': 'assets/codec_coronel.jpg',
    'Otacon': 'assets/codec_ferrer.jpg',
    'Hal Emmerich': 'assets/codec_ferrer.jpg',
    'Mei Ling': 'assets/codec_doctora.jpg',
    'Dra. Hunter': 'assets/codec_doctora.jpg',
    'Snake': 'assets/codec_ombra.jpg',
    'Agent Ombra': 'assets/codec_ombra.jpg'
};

const STORY_SLIDES = [
    {
        title: "Fase 1: La Base Àrtica Shadow Circuit",
        subtitle: "Instal·lació Militar d'Eliminació Nuclear",
        img: "assets/story_01.jpg",
        text: "En un arxipèlag aïllat de l'Àrtic, la base secreta 'Shadow Circuit' ha estat ocupada per un escamot de forces especials rebels. Les comunicacions civils s'han tallat i han pres el control de tots els servidors centrals de la instal·lació."
    },
    {
        title: "Fase 2: L'Amenaça del Comandant Voss",
        subtitle: "Líder Terrorista i Ciber-Enginyer Dissident",
        img: "assets/story_02.jpg",
        text: "El Comandant Voss ha llançat un ultimàtum: si no es compleixen les seves demandes en menys de 50 minuts, activarà el protocol de llançament nuclear. Totes les comportes blindades han estat segellades amb protocols de xifratge basats en portes lògiques digitals (NOT, AND, OR, XOR, NAND, NOR)."
    },
    {
        title: "Fase 3: Infiltració Solitària d'Agent Ombra",
        subtitle: "Inserció Submarina pel Dic de Càrrega",
        img: "assets/story_03.jpg",
        text: "Agent Ombra (Solid Snake) s'ha infiltrat nedant sota el gel fins al dic exterior de la base. Sense armes de foc convencionals per evitar un incident radioactiu, l'única manera d'avançar és el sigil tàctic: eludir els cons de visió dels sentinelles Genome i de les càmeres CCTV, i piratar els xips lògics de cada sector."
    },
    {
        title: "Fase 4: El Tanc Bípede Nuclear: TITAN",
        subtitle: "L'Arma Definitiva al Sector 10",
        img: "assets/story_04.jpg",
        text: "A les profunditats del búnquer es troba el tanc bípede mòbil TITAN, capaç de disparar míssils nuclears indetectables per radar. Només desxifrant els circuits lògics combinacionals finals podràs introduir les targetes PAL Key i cancel·lar la seqüència d'activació abans que el compte enrere arribi a zero."
    },
    {
        title: "Fase 5: Extracció i Èxit de la Missió",
        subtitle: "Avaluació Tàctica FOXHOUND",
        img: "assets/story_05.jpg",
        text: "El Coronel Campbell i l'equip de suport científic (Otacon i la Dra. Hunter) supervisaran cada pas de la teva missió a través de la ràdio Codec (Freqüències 140.85 i 141.12). Si aconsegueixes obrir les 10 comportes a temps, salvaràs el món i rebràs el teu Diploma Oficial d'Aprofitament Tecnològic amb la qualificació FOXHOUND!"
    }
];

let activeStorySlide = 0;
let activeCodecBriefing = [];
let activeCodecIndex = 0;

// ============================================================================
// INICIALITZACIÓ I PERSISTÈNCIA
// ============================================================================
window.addEventListener('DOMContentLoaded', () => {
    loadState();

    engine3D = new Castle3DEngine('game-viewport', 'minimap-canvas', {
        onCrystalCollected: handleCrystalCollected,
        onChestOpened: handleChestOpened,
        onBridgeCreated: handleBridgeCreated,
        onNPCHint: handleNPCHint,
        onPlayerHazardHit: handlePlayerHazardHit,
        onGateProximityChange: handleGateProximityChange,
        onWorkstationProximityChange: handleWorkstationProximityChange,
        onInteractGate: openGatePuzzleModal,
        onInteractSubDoor: openSubDoorPuzzleModal,
        onWalkThroughOpenGate: handleWalkThroughOpenGate
    });

    renderLibraryModalCards();
    startGlobalTimer();
    if (window.loadCustomLevelsFromStorage) {
        window.loadCustomLevelsFromStorage();
    }
    if (engine3D && typeof updatePerfButtonUI === 'function') {
        updatePerfButtonUI(engine3D.perfMode || 'CHROMEBOOK');
    }
    loadCurrentMissionInto3D(false);

    if (!appState.studentName) {
        openProfileModal();
    } else if (!appState.introSeen) {
        openStoryModal();
    } else if (appState.gameFinished) {
        openDiplomaModal();
    } else if (appState.gameOverLost || appState.remainingSeconds <= 0) {
        triggerGameOverModal();
    }

    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;

        if (e.code === 'KeyL') toggleLibraryModal();
        if (e.code === 'KeyC') openCurrentMissionCodec();
        if (e.code === 'KeyH') openStoryModal();
        if (e.code === 'F2') {
            e.preventDefault();
            toggleLiveDebugMode();
        }
        if (e.code === 'F4') {
            e.preventDefault();
            if (typeof openLevelEditorModal === 'function') {
                const edModal = document.getElementById('level-editor-modal');
                if (edModal && (edModal.classList.contains('active') || edModal.style.display !== 'none')) {
                    closeLevelEditorModal();
                } else {
                    openLevelEditorModal();
                }
            }
        }
    });
});

function loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
        try {
            const parsed = JSON.parse(raw);
            appState = Object.assign(appState, parsed);
            if (!appState.errorsByMission) appState.errorsByMission = {};
            if (!appState.seenCodecs) appState.seenCodecs = {};
        } catch (err) {
            console.error('Error carregant estat:', err);
        }
    }
    updateTopHud();
}

function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    updateTopHud();
}

function confirmResetGame() {
    if (confirm("⚠️ ATENCIÓ FOXHOUND: Vols reiniciar la missió des de zero?\n\nS'esborrarà el progrés per reiniciar la infiltració de 50 minuts.")) {
        localStorage.removeItem(STORAGE_KEY);
        window.location.reload();
    }
}

// ============================================================================
// TEMPORITZADOR DE 50 MINUTS I PENALITZACIONS
// ============================================================================
function startGlobalTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (!appState.gameStarted || appState.gameFinished || appState.gameOverLost) return;
        const anyModalOpen = Array.from(document.querySelectorAll('.modal-overlay')).some(
            el => el.classList.contains('active')
        );
        if (anyModalOpen) return;

        appState.remainingSeconds = Math.max(0, appState.remainingSeconds - 1);
        appState.realElapsedSeconds = (appState.realElapsedSeconds || 0) + 1;

        updateTimerDisplay();

        if (appState.remainingSeconds % 5 === 0) {
            saveState();
        }

        if (appState.remainingSeconds <= 0) {
            appState.gameOverLost = true;
            saveState();
            triggerGameOverModal();
        }
    }, 1000);
}

function formatTimeMMSS(totalSec) {
    const s = Math.max(0, Math.floor(totalSec));
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function updateTimerDisplay() {
    const digitsEl = document.getElementById('hud-timer-digits');
    const boxEl = document.getElementById('hud-timer-box');
    if (digitsEl) {
        digitsEl.textContent = formatTimeMMSS(appState.remainingSeconds);
    }
    if (boxEl) {
        boxEl.classList.remove('warning', 'danger');
        if (appState.remainingSeconds <= 300) {
            boxEl.classList.add('danger');
        } else if (appState.remainingSeconds <= 900) {
            boxEl.classList.add('warning');
        }
    }
}

function applyTimePenalty(secondsLost, reasonText) {
    appState.remainingSeconds = Math.max(0, appState.remainingSeconds - secondsLost);
    saveState();
    updateTimerDisplay();

    const boxEl = document.getElementById('hud-timer-box');
    if (boxEl) {
        boxEl.classList.remove('penalty-shake');
        void boxEl.offsetWidth;
        boxEl.classList.add('penalty-shake');
    }

    const badge = document.createElement('div');
    badge.className = 'penalty-float';
    const minsStr = formatTimeMMSS(secondsLost);
    badge.textContent = `⏱️ -${minsStr} (${reasonText})`;
    document.body.appendChild(badge);
    setTimeout(() => badge.remove(), 2200);

    const vig = document.getElementById('vignette-overlay');
    if (vig) {
        vig.classList.add('damage-flash');
        setTimeout(() => vig.classList.remove('damage-flash'), 550);
    }

    if (appState.remainingSeconds <= 0 && !appState.gameOverLost) {
        appState.gameOverLost = true;
        saveState();
        triggerGameOverModal();
    }
}

function applyTimeBonus(secondsGained, reasonText) {
    appState.remainingSeconds = Math.min(INITIAL_TIME_SECONDS, appState.remainingSeconds + secondsGained);
    saveState();
    updateTimerDisplay();

    const badge = document.createElement('div');
    badge.className = 'penalty-float';
    badge.style.background = 'rgba(16, 185, 129, 0.95)';
    badge.style.borderColor = '#6ee7b7';
    badge.textContent = `📦 +00:${String(secondsGained).padStart(2, '0')} (${reasonText})`;
    document.body.appendChild(badge);
    setTimeout(() => badge.remove(), 2200);
}

// ============================================================================
// GESTIÓ DE MISSIONS I CARREGA AL MOTOR 3D
// ============================================================================
function getCurrentMission() {
    const list = window.TACTICAL_MISSIONS || window.CASTLE_MISSIONS;
    const idx = Math.min(Math.max(0, appState.currentMissionIdx), list.length - 1);
    return list[idx];
}

function loadCurrentMissionInto3D(triggerBriefing = true) {
    const mission = getCurrentMission();
    currentCrystalsCollected = 0;
    currentCrystalsTotal = 0;
    currentDoorUnlocked = false;
    missionTransitionLock = false;

    for (const row of mission.map) {
        for (const ch of row) {
            if (ch === 'K') currentCrystalsTotal++;
        }
    }

    if (engine3D) {
        engine3D.loadMission(mission);
        syncEnginePauseState();
    }

    updateMissionPanelUI();
    updateBottomStepperUI();

    // Trigger Codec briefing call on entry if mission has one
    if (triggerBriefing && mission.codecBriefing && mission.codecBriefing.length > 0) {
        setTimeout(() => {
            startCodecCall(mission.codecBriefing);
        }, 650);
    }
}

function updateTopHud() {
    const avEl = document.getElementById('hud-student-avatar');
    const nameEl = document.getElementById('hud-student-name');
    const grpEl = document.getElementById('hud-student-group');
    const hitsEl = document.getElementById('hud-hits-count');
    const errsEl = document.getElementById('hud-errors-count');

    if (avEl) avEl.textContent = appState.avatar || '🐍';
    if (nameEl) nameEl.textContent = appState.studentName || 'Agent';
    if (grpEl) grpEl.textContent = appState.studentGroup || 'FOXHOUND';
    if (hitsEl) hitsEl.textContent = appState.logicHits;
    if (errsEl) errsEl.textContent = appState.logicErrors;

    updateTimerDisplay();
}

function updateMissionPanelUI() {
    const mission = getCurrentMission();
    const badgeEl = document.getElementById('mission-badge-num');
    if (badgeEl) badgeEl.textContent = `Sector 0${mission.id} / 10`;
    const gateChipEl = document.getElementById('mission-gate-chip');
    if (gateChipEl) gateChipEl.textContent = mission.gateBadge;
    const titleEl = document.getElementById('mission-title');
    if (titleEl) titleEl.textContent = mission.title;
    const descEl = document.getElementById('mission-desc');
    if (descEl) descEl.textContent = mission.shortDesc;

    const objCrystals = document.getElementById('obj-crystals-item');
    const objCrystalsCount = document.getElementById('obj-crystals-count');
    const allCollected = currentCrystalsCollected >= currentCrystalsTotal;

    objCrystalsCount.textContent = `${currentCrystalsCollected} / ${currentCrystalsTotal}`;
    objCrystals.classList.toggle('completed', allCollected);

    const objDoor = document.getElementById('obj-door-item');
    const objDoorStatus = document.getElementById('obj-door-status');
    objDoor.classList.toggle('completed', currentDoorUnlocked);
    objDoorStatus.textContent = currentDoorUnlocked
        ? 'Desbloquejada! Creua-la ➔'
        : (allCollected ? 'Terminal Lògic Actiu ⚡' : 'Recull els Discs PAL 🔒');

    const strip = document.getElementById('hud-objective-strip');
    const stripText = document.getElementById('hud-objective-text');
    if (strip && stripText) {
        if (currentDoorUnlocked) {
            strip.className = 'hud-objective-strip unlocked no-print';
            stripText.innerHTML = '🚪 <strong style="color:#fde047;">COMPORTA OBERTA!</strong> Escapa per la sortida [G]!';
        } else if (allCollected) {
            strip.className = 'hud-objective-strip ready no-print';
            stripText.innerHTML = '⚡ <strong style="color:#4ade80;">DISCS PAL OBTINGUTS!</strong> Hackeja el terminal lògic de la comporta [G] (Tecla E)!';
        } else {
            strip.className = 'hud-objective-strip no-print';
            stripText.innerHTML = `💾 Localitza i recull els <strong>Discs PAL (${currentCrystalsCollected} / ${currentCrystalsTotal})</strong> i troba la sortida [G]`;
        }
    }
}

function jumpToMission(idx) {
    const list = window.TACTICAL_MISSIONS || window.CASTLE_MISSIONS;
    if (idx < 0 || idx >= list.length) return;
    appState.currentMissionIdx = idx;
    saveState();
    loadCurrentMissionInto3D(true);
    updateMissionPanelUI();
    updateBottomStepperUI();
    updateSectorDropdownUI();
    showCastleToast(`🚁 Infiltració al Sector ${idx + 1}: ${list[idx].title}`);
}
window.jumpToMission = jumpToMission;

function updateSectorDropdownUI() {
    const select = document.getElementById('hud-sector-select');
    if (!select) return;
    const list = window.TACTICAL_MISSIONS || window.CASTLE_MISSIONS;
    if (select.options.length !== list.length) {
        select.innerHTML = '';
        list.forEach((m, idx) => {
            const opt = document.createElement('option');
            opt.value = idx;
            opt.textContent = `Sec ${idx + 1}: ${m.gateBadge || m.gateType || 'Lògica'}`;
            select.appendChild(opt);
        });
    }
    select.value = appState.currentMissionIdx;
}
window.updateSectorDropdownUI = updateSectorDropdownUI;

function updateBottomStepperUI() {
    const container = document.getElementById('missions-stepper');
    if (!container) return;
    container.innerHTML = '';

    const list = window.TACTICAL_MISSIONS || window.CASTLE_MISSIONS;
    for (let i = 0; i < list.length; i++) {
        const dot = document.createElement('div');
        dot.className = 'step-dot';
        dot.style.cursor = 'pointer';
        dot.onclick = () => jumpToMission(i);

        if (appState.completedMissions.includes(i + 1)) {
            dot.classList.add('completed');
            dot.textContent = '✓';
        } else if (i === appState.currentMissionIdx) {
            dot.classList.add('current');
            dot.textContent = String(i + 1);
        } else {
            dot.textContent = String(i + 1);
        }
        dot.title = `Sector ${i + 1}: ${list[i].title} (Fes clic per entrar-hi)`;
        container.appendChild(dot);
    }
    updateSectorDropdownUI();
}

function handleCrystalCollected(collected, total) {
    currentCrystalsCollected = Number.isFinite(collected) ? collected : 0;
    currentCrystalsTotal = (Number.isFinite(total) && total > 0) ? total : (currentCrystalsTotal || 1);
    updateMissionPanelUI();

    if (currentCrystalsCollected >= currentCrystalsTotal) {
        showCastleToast('✨ Discs PAL recuperats! Dirigeix-te al Terminal de la Comporta Cuirassada [G]!');
    } else {
        showCastleToast(`💾 Disc PAL xifrat obtingut (${currentCrystalsCollected}/${currentCrystalsTotal})`);
    }
}

function handleChestOpened() {
    appState.chestsOpened = (appState.chestsOpened || 0) + 1;
    applyTimeBonus(CHEST_BONUS_TIME_SEC, 'Caixa de Racions i Equip');
    showCastleToast('📦 Has obtingut racions de combat! +25s de bonificació de temps!');
}

function handleBridgeCreated(hazardType) {
    if (window.castleAudio) window.castleAudio.playLogicSuccess();
    showCastleToast(`📦 Contenidor col·locat! Has creat una passarel·la segura per creuar!`);
}

function handleNPCHint() {
    openCurrentMissionCodec();
}

function handlePlayerHazardHit(hazardType) {
    appState.hazardHits = (appState.hazardHits || 0) + 1;

    if (hazardType === 'GUARD_DETECTED') {
        applyTimePenalty(HAZARD_HIT_PENALTY_SEC, 'Sentinella Genome [!]');
        showCastleToast('⚠️ [!] DETECTAT PER UN SENTINELLA! Has entrat al seu con de visió (-01:00 min)');
    } else if (hazardType === 'CAMERA_DETECTED') {
        applyTimePenalty(HAZARD_HIT_PENALTY_SEC, 'Càmera CCTV [!]');
        showCastleToast('⚠️ [!] DETECTAT PER CÀMERA DE SEGURETAT! Feix de vigilància tallat (-01:00 min)');
    } else if (hazardType === 'LASER_BARRIER') {
        applyTimePenalty(HAZARD_HIT_PENALTY_SEC, 'Barrera de Raigs Làser [!]');
        showCastleToast('⚠️ [!] BARRERA LÀSER TALLADA! Desactiva el disjuntor o bloqueja-la amb un contenidor (-01:00 min)');
    } else if (hazardType === 'ELECTRIC_GRID') {
        applyTimePenalty(HAZARD_HIT_PENALTY_SEC, 'Reixeta d’Alta Tensió');
        showCastleToast('⚡ Reixeta d’alta tensió! Salta amb [Espai] o empeny un contenidor (-01:00 min)');
    } else {
        applyTimePenalty(HAZARD_HIT_PENALTY_SEC, 'Pou de Descompressió');
        showCastleToast('🕳️ Caiguda al pou de ventilació! Salta amb [Espai] o empeny un contenidor (-01:00 min)');
    }
}

function handleGateProximityChange(isNear, allCrystalsReady) {
    const promptBtn = document.getElementById('btn-open-gate-prompt');
    if (!promptBtn) return;

    if (isNear && !currentDoorUnlocked) {
        promptBtn.classList.add('visible');
        if (allCrystalsReady) {
            promptBtn.innerHTML = '🔓 Piratar Terminal Lògic i Obrir Comporta [E]';
        } else {
            const missing = currentCrystalsTotal - currentCrystalsCollected;
            promptBtn.innerHTML = `🔒 Falten ${missing} Discs PAL per piratejar el Terminal`;
        }
    } else {
        promptBtn.classList.remove('visible');
    }
}

function handleWorkstationProximityChange(isNear, isHacked) {
    const promptBtn = document.getElementById('btn-hack-pc-prompt');
    if (!promptBtn) return;
    if (isNear && !isHacked) {
        promptBtn.style.display = 'block';
    } else {
        promptBtn.style.display = 'none';
    }
}

function handleWalkThroughOpenGate() {
    if (missionTransitionLock) return;
    missionTransitionLock = true;

    const mission = getCurrentMission();
    if (!appState.completedMissions.includes(mission.id)) {
        appState.completedMissions.push(mission.id);
    }

    if (window.castleAudio) window.castleAudio.playVictoryFanfare();

    const list = window.TACTICAL_MISSIONS || window.CASTLE_MISSIONS;
    if (appState.currentMissionIdx < list.length - 1) {
        appState.currentMissionIdx++;
        saveState();
        showCastleToast(`🎖️ ${mission.title} superat! Infiltrant-te al Sector 0${appState.currentMissionIdx + 1}...`);
        setTimeout(() => {
            loadCurrentMissionInto3D(true);
        }, 650);
    } else {
        appState.gameFinished = true;
        saveState();
        openDiplomaModal();
    }
}

function showCastleToast(msg) {
    const toast = document.getElementById('castle-toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => {
        toast.classList.remove('show');
    }, 3200);
}

function showPlayerDownModal(penaltySeconds = 45, reason = 'Neutralitzat en Combat') {
    applyTimePenalty(penaltySeconds, reason);

    const modal = document.getElementById('player-down-modal');
    const penaltyEl = document.getElementById('death-modal-penalty');
    const timerLeftEl = document.getElementById('death-modal-timer-left');

    if (penaltyEl) penaltyEl.textContent = `-${penaltySeconds} segons`;
    if (timerLeftEl) timerLeftEl.textContent = formatTimeMMSS(appState.remainingSeconds);

    if (modal) {
        modal.classList.add('active');
    }
    syncEnginePauseState();
}
window.showPlayerDownModal = showPlayerDownModal;

function handleRespawnOk() {
    const modal = document.getElementById('player-down-modal');
    if (modal) {
        modal.classList.remove('active');
    }

    const pcPrompt = document.getElementById('btn-hack-pc-prompt');
    if (pcPrompt) pcPrompt.style.display = 'none';
    const gatePrompt = document.getElementById('btn-gate-logic-prompt');
    if (gatePrompt) gatePrompt.classList.remove('visible');

    // Reaparició conservant els discs PAL i comportes obertes
    if (engine3D && engine3D.finishRespawnPlayer) {
        engine3D.finishRespawnPlayer();
    }
    updateMissionPanelUI();
    syncEnginePauseState();
    showCastleToast('🐍 Reaparegut al punt d\'infiltració [S]! Mantens els teus discs PAL i comportes obertes.');
}
window.handleRespawnOk = handleRespawnOk;

function syncEnginePauseState() {
    if (!engine3D) return;
    const anyModalOpen = Array.from(document.querySelectorAll('.modal-overlay')).some(
        el => el.classList.contains('active')
    );
    engine3D.paused = anyModalOpen;
    if (anyModalOpen) {
        engine3D.keys = { up: false, down: false, left: false, right: false };
    }
}

// ============================================================================
// SISTEMA DE DIÀLEGS CODEC (METAL GEAR SOLID STYLE)
// ============================================================================
function startCodecCall(briefingList) {
    if (!briefingList || briefingList.length === 0) return;
    activeCodecBriefing = briefingList;
    activeCodecIndex = 0;

    if (window.castleAudio) {
        window.castleAudio.playCodecCall();
    }

    renderCodecDialogueStep();
    const modal = document.getElementById('codec-modal');
    if (modal) {
        modal.classList.add('active');
    }
    syncEnginePauseState();
}

function openCurrentMissionCodec() {
    const mission = getCurrentMission();
    if (mission.codecBriefing && mission.codecBriefing.length > 0) {
        startCodecCall(mission.codecBriefing);
    } else {
        showCastleToast('📡 Freqüència en silenci de ràdio en aquest sector.');
    }
}

function renderCodecDialogueStep() {
    if (activeCodecIndex >= activeCodecBriefing.length) {
        closeCodecModal();
        return;
    }

    const step = activeCodecBriefing[activeCodecIndex];
    const portraitUrl = CODEC_PORTRAITS[step.speaker] || 'assets/codec_coronel.jpg';

    const portraitImg = document.getElementById('codec-speaker-img');
    const speakerName = document.getElementById('codec-speaker-name');
    const freqEl = document.getElementById('codec-freq-display');
    const textEl = document.getElementById('codec-dialogue-text');
    const counterEl = document.getElementById('codec-page-counter');

    if (portraitImg) portraitImg.src = portraitUrl;
    if (speakerName) speakerName.textContent = step.speaker.toUpperCase();
    if (freqEl) freqEl.textContent = step.freq || '140.85';
    if (textEl) textEl.textContent = step.text;
    if (counterEl) counterEl.textContent = `${activeCodecIndex + 1} / ${activeCodecBriefing.length}`;

    // Mostrar el dossier tècnic de la porta lògica del sector
    const currentM = getCurrentMission();
    const gateChip = document.getElementById('codec-gate-chip');
    const gateFormula = document.getElementById('codec-gate-formula');
    const gateRule = document.getElementById('codec-gate-rule');
    const gateDossier = document.getElementById('codec-gate-dossier');

    if (gateDossier) {
        if (currentM) {
            gateDossier.style.display = 'flex';
            if (gateChip) gateChip.textContent = currentM.gateBadge || 'PORTA LÒGICA';
            if (gateFormula) gateFormula.textContent = currentM.theoryFormula || '';
            if (gateRule) gateRule.textContent = currentM.shortDesc || currentM.theoryTitle || '';
        } else {
            gateDossier.style.display = 'none';
        }
    }
}

function nextCodecStep() {
    activeCodecIndex++;
    if (activeCodecIndex < activeCodecBriefing.length) {
        renderCodecDialogueStep();
    } else {
        closeCodecModal();
    }
}

function closeCodecModal() {
    const modal = document.getElementById('codec-modal');
    if (modal) modal.classList.remove('active');
    syncEnginePauseState();
}

// ============================================================================
// MODAL DE DOSSIER D'HISTÒRIA (IL·LUSTRACIONS I INTRODUCCIÓ)
// ============================================================================
function openStoryModal() {
    activeStorySlide = 0;
    renderStorySlide();
    const modal = document.getElementById('story-modal');
    if (modal) modal.classList.add('active');
    syncEnginePauseState();
}

function closeStoryModal() {
    appState.introSeen = true;
    saveState();
    const modal = document.getElementById('story-modal');
    if (modal) modal.classList.remove('active');
    if (window.castleAudio) {
        window.castleAudio.startAmbientDrone();
    }
    syncEnginePauseState();
}

function renderStorySlide() {
    const slide = STORY_SLIDES[activeStorySlide];
    const imgEl = document.getElementById('story-slide-img');
    const titleEl = document.getElementById('story-slide-title');
    const subEl = document.getElementById('story-slide-sub');
    const textEl = document.getElementById('story-slide-text');
    const counterEl = document.getElementById('story-slide-counter');

    if (imgEl) imgEl.src = slide.img;
    if (titleEl) titleEl.textContent = slide.title;
    if (subEl) subEl.textContent = slide.subtitle;
    if (textEl) textEl.textContent = slide.text;
    if (counterEl) counterEl.textContent = `Informe ${activeStorySlide + 1} de ${STORY_SLIDES.length}`;
}

function nextStorySlide() {
    if (activeStorySlide < STORY_SLIDES.length - 1) {
        activeStorySlide++;
        renderStorySlide();
    } else {
        closeStoryModal();
    }
}

function prevStorySlide() {
    if (activeStorySlide > 0) {
        activeStorySlide--;
        renderStorySlide();
    }
}

// ============================================================================
// REGISTRE DE PERFIL D'AGENT (NOM I CURS)
// ============================================================================
function openProfileModal() {
    document.getElementById('input-student-name').value = appState.studentName || '';
    document.getElementById('input-student-group').value = appState.studentGroup || '2n ESO A';
    selectProfileAvatar(appState.avatar || '🐍');
    document.getElementById('profile-modal').classList.add('active');
    syncEnginePauseState();
}

function selectProfileAvatar(emoji) {
    appState.avatar = emoji;
    document.querySelectorAll('.avatar-option').forEach(el => {
        el.classList.toggle('selected', el.dataset.avatar === emoji);
    });
}

function saveStudentProfile() {
    const nameInput = document.getElementById('input-student-name');
    const groupInput = document.getElementById('input-student-group');
    const name = nameInput.value.trim();
    const group = groupInput.value;

    if (!name) {
        alert('Si us plau, introdueix el teu Nom i Cognoms per registrar la teva fitxa FOXHOUND!');
        nameInput.focus();
        return;
    }

    appState.studentName = name;
    appState.studentGroup = group;
    appState.gameStarted = true;
    saveState();

    if (window.castleAudio) {
        window.castleAudio.startAmbientDrone();
    }

    document.getElementById('profile-modal').classList.remove('active');

    if (!appState.introSeen) {
        openStoryModal();
    } else {
        syncEnginePauseState();
    }
}

// ============================================================================
// LLIBRERIA DE PORTES LÒGIQUES DE CONSULTA (TECLA L)
// ============================================================================
function openLibraryModal() {
    document.getElementById('library-modal').classList.add('active');
    syncEnginePauseState();
}

function closeLibraryModal() {
    document.getElementById('library-modal').classList.remove('active');
    syncEnginePauseState();
}

function toggleLibraryModal() {
    const modal = document.getElementById('library-modal');
    if (modal.classList.contains('active')) {
        closeLibraryModal();
    } else {
        openLibraryModal();
    }
}

function renderLibraryModalCards() {
    const container = document.getElementById('library-cards-grid');
    if (!container) return;

    const gateOrder = ['NOT', 'AND', 'OR', 'XOR', 'NAND', 'NOR', 'XNOR'];
    container.innerHTML = gateOrder.map(gId => {
        const g = LOGIC_GATES_LIBRARY[gId];
        const isOneInput = g.inputs.length === 1;
        const simState = librarySimInputs[gId];
        const simOut = isOneInput ? g.evalFn(simState.A) : g.evalFn(simState.A, simState.B);

        const headersHtml = g.inputs.map(inp => `<th>IN ${inp}</th>`).join('') + `<th>OUT Y</th>`;
        const rowsHtml = g.truthTable.map(row => {
            const tds = row.in.map(v => `<td class="bit-${v}">${v}</td>`).join('');
            return `<tr>${tds}<td class="bit-${row.out}">${row.out}</td></tr>`;
        }).join('');

        return `
        <div class="library-gate-card">
            <div class="lib-card-top">
                <span class="lib-gate-name">${g.name}</span>
                <span class="lib-gate-formula">${g.formula}</span>
            </div>

            <div style="background:#090d16; border:1px solid #1e293b; border-radius:8px; padding:0.4rem; display:flex; justify-content:center;">
                <svg viewBox="0 0 130 56" width="130" height="52">
                    ${getGateSVGMarkup(gId, 38, 6)}
                </svg>
            </div>

            <p style="font-size:0.82rem; color:#cbd5e1; line-height:1.42;">${g.theory}</p>
            <p style="font-size:0.78rem; color:#93c5fd; background:rgba(59,130,246,0.1); padding:0.45rem 0.6rem; border-radius:6px;">${g.realWorld}</p>

            <div class="truth-table-wrap">
                <table class="truth-table">
                    <thead><tr>${headersHtml}</tr></thead>
                    <tbody>${rowsHtml}</tbody>
                </table>
            </div>

            <div class="lib-sim-box" id="lib-sim-${gId}">
                <span style="font-size:0.74rem; color:#94a3b8; font-weight:700;">Simular xip:</span>
                <div style="display:flex; gap:0.4rem;">
                    <button class="btn-hud" onclick="toggleLibSimInput('${gId}', 'A')" id="lib-btn-${gId}-A">A = ${simState.A}</button>
                    ${!isOneInput ? `<button class="btn-hud" onclick="toggleLibSimInput('${gId}', 'B')" id="lib-btn-${gId}-B">B = ${simState.B}</button>` : ''}
                </div>
                <span style="font-family:var(--font-mono); font-weight:800; font-size:0.9rem; color:${simOut ? '#34d399' : '#94a3b8'};" id="lib-out-${gId}">
                    OUT = ${simOut}
                </span>
            </div>
        </div>
        `;
    }).join('');
}

function toggleLibSimInput(gateId, inputKey) {
    const g = LOGIC_GATES_LIBRARY[gateId];
    if (!g) return;
    librarySimInputs[gateId][inputKey] = librarySimInputs[gateId][inputKey] ? 0 : 1;
    const st = librarySimInputs[gateId];
    const out = g.inputs.length === 1 ? g.evalFn(st.A) : g.evalFn(st.A, st.B);

    const btn = document.getElementById(`lib-btn-${gateId}-${inputKey}`);
    if (btn) btn.textContent = `${inputKey} = ${st[inputKey]}`;

    const outEl = document.getElementById(`lib-out-${gateId}`);
    if (outEl) {
        outEl.textContent = `OUT = ${out}`;
        outEl.style.color = out ? '#34d399' : '#94a3b8';
    }
}

// ============================================================================
// PANY LÒGIC DE LES PORTES INTERMÈDIES I COMPORTA PRINCIPAL (TEORIA + REPTES)
// ============================================================================
function openSubDoorPuzzleModal(subDoor) {
    if (!subDoor) return;
    if (subDoor.logicUnlocked) {
        if (engine3D) engine3D.toggleSubSecurityDoor(subDoor);
        return;
    }

    const mission = getCurrentMission();
    const doorIdx = subDoor.doorIdx || 0;
    const chList = mission.challenges || [];
    const chIdx = chList.length > 0 ? (doorIdx % chList.length) : 0;

    activePuzzleState.mode = 'SUB_DOOR';
    activePuzzleState.activeSubDoor = subDoor;
    activePuzzleState.stepIdx = chIdx;
    activePuzzleState.selectedDeduceBit = null;
    activePuzzleState.transmittedSignalOut = null;

    initChallengeStepInputs(mission, chIdx);
    renderGatePuzzleModalContent();

    const modal = document.getElementById('gate-puzzle-modal');
    if (modal) modal.classList.add('active');
    syncEnginePauseState();
}
window.openSubDoorPuzzleModal = openSubDoorPuzzleModal;

function openGatePuzzleModal() {
    if (currentDoorUnlocked) return;

    if (currentCrystalsCollected < currentCrystalsTotal) {
        const missing = currentCrystalsTotal - currentCrystalsCollected;
        showCastleToast(`🔒 Falten ${missing} Discs PAL per piratejar el Terminal!`);
        if (window.castleAudio) window.castleAudio.playErrorPenalty();
        return;
    }

    const mission = getCurrentMission();
    activePuzzleState.mode = 'FINAL_GATE';
    activePuzzleState.activeSubDoor = null;
    activePuzzleState.stepIdx = 0;
    activePuzzleState.selectedDeduceBit = null;
    activePuzzleState.transmittedSignalOut = null;

    const finalCh = mission.finalChallenge || (mission.challenges && mission.challenges[mission.challenges.length - 1]);
    if (finalCh) {
        if (finalCh.mode === 'CONFIGURE_IN') {
            activePuzzleState.configInputs = Object.assign({ A: 0, B: 0, C: 0, D: 0 }, finalCh.initialInputs || {});
        } else {
            activePuzzleState.configInputs = Object.assign({ A: 0, B: 0, C: 0, D: 0 }, finalCh.inputs || {});
        }
    } else {
        initChallengeStepInputs(mission, 0);
    }

    renderGatePuzzleModalContent();
    const modal = document.getElementById('gate-puzzle-modal');
    if (modal) modal.classList.add('active');
    syncEnginePauseState();
}

function closeGatePuzzleModal() {
    document.getElementById('gate-puzzle-modal').classList.remove('active');
    syncEnginePauseState();
}

function initChallengeStepInputs(mission, stepIdx) {
    const ch = (mission.challenges && mission.challenges[stepIdx]) || { mode: 'CONFIGURE_IN', initialInputs: {} };
    activePuzzleState.selectedDeduceBit = null;
    activePuzzleState.transmittedSignalOut = null;
    if (ch.mode === 'CONFIGURE_IN') {
        activePuzzleState.configInputs = Object.assign({ A: 0, B: 0, C: 0, D: 0 }, ch.initialInputs);
    } else {
        activePuzzleState.configInputs = Object.assign({ A: 0, B: 0, C: 0, D: 0 }, ch.inputs);
    }
}

function renderGatePuzzleModalContent() {
    const mission = getCurrentMission();
    const isSubDoor = activePuzzleState.mode === 'SUB_DOOR';
    const ch = (isSubDoor || !mission.finalChallenge)
        ? (mission.challenges ? mission.challenges[activePuzzleState.stepIdx] : null)
        : mission.finalChallenge;

    if (!ch) return;

    const titleEl = document.getElementById('puzzle-modal-title');
    const badgeEl = document.getElementById('puzzle-theory-badge');
    const theoryTitleEl = document.getElementById('puzzle-theory-title');
    const theoryFormulaEl = document.getElementById('puzzle-theory-formula');
    const theoryHtmlEl = document.getElementById('puzzle-theory-html');
    const rwBox = document.getElementById('puzzle-realworld-box');
    const rwText = document.getElementById('puzzle-realworld-text');
    const progTitle = document.getElementById('puzzle-progress-title');

    if (isSubDoor) {
        const doorNum = (activePuzzleState.activeSubDoor?.doorIdx ?? 0) + 1;
        if (titleEl) titleEl.textContent = `${mission.title} — Comporta de Seguretat #${doorNum}`;
        if (badgeEl) badgeEl.textContent = `🔐 Pany de Pas Intermedi: ${mission.gateBadge}`;
        if (rwBox) rwBox.style.display = 'none';
        if (progTitle) progTitle.textContent = `Desxifrar Pany Lògic (Repte de Comporta #${doorNum})`;

        for (let i = 0; i < 3; i++) {
            const pill = document.getElementById(`puzzle-step-pill-${i}`);
            if (!pill) continue;
            if (i === activePuzzleState.stepIdx) {
                pill.style.display = 'inline-block';
                pill.className = 'round-pill active';
                pill.textContent = `⚡ Repte Porta #${doorNum}`;
            } else {
                pill.style.display = 'none';
            }
        }
    } else {
        if (titleEl) titleEl.textContent = `${mission.title} — Comporta Cuirassada Principal G`;
        if (badgeEl) badgeEl.textContent = `🎯 Objectiu d'Enginyeria MGS: ${mission.gateBadge}`;
        if (rwBox && ch.realWorldContext) {
            rwBox.style.display = 'block';
            if (rwText) rwText.textContent = ch.realWorldContext;
        } else if (rwBox) {
            rwBox.style.display = 'none';
        }
        if (progTitle) progTitle.textContent = `Repte Final d'Enginyeria Aplicada`;

        for (let i = 0; i < 3; i++) {
            const pill = document.getElementById(`puzzle-step-pill-${i}`);
            if (!pill) continue;
            if (i === 0) {
                pill.style.display = 'inline-block';
                pill.className = 'round-pill active';
                pill.textContent = `⭐ Sortida Sectorial G`;
            } else {
                pill.style.display = 'none';
            }
        }
    }

    if (theoryTitleEl) theoryTitleEl.textContent = mission.theoryTitle;
    if (theoryFormulaEl) theoryFormulaEl.textContent = mission.theoryFormula;
    if (theoryHtmlEl) theoryHtmlEl.innerHTML = mission.theoryHtml;

    const thead = document.getElementById('puzzle-truth-thead');
    const tbody = document.getElementById('puzzle-truth-tbody');
    if (thead) thead.innerHTML = `<tr>${mission.truthTableHeaders.map(h => `<th>${h}</th>`).join('')}</tr>`;

    // Renderitzar taula de veritat com a guia de consulta teòrica neta (sense xivatada interactiva)
    if (tbody) {
        tbody.innerHTML = mission.truthTableRows.map(row => {
            const inputsArr = row[0];
            const inCells = inputsArr.map(v => `<td class="bit-${v}">${v}</td>`).join('');
            const extraCells = row.slice(1, row.length - 1).map(v => `<td style="color:#7dd3fc;">${v}</td>`).join('');
            const outVal = row[row.length - 1];
            return `<tr>${inCells}${extraCells}<td class="bit-${outVal}">${outVal}</td></tr>`;
        }).join('');
    }

    // El circuit SVG mostra l'estat dels cables d'entrada, però la sortida Y queda en incògnita "?"
    // fins que l'alumne fa clic a "Transmetre Senyal i Validar"
    const svgContainer = document.getElementById('puzzle-circuit-svg-box');
    if (svgContainer) {
        if (ch.mode === 'DEDUCE_OUT') {
            svgContainer.innerHTML = renderMissionCircuitSVG(mission, ch.inputs, activePuzzleState.selectedDeduceBit);
        } else {
            // No revelem la sortida interactiva immediatament mentre es toquen els interruptors
            const displayOut = (activePuzzleState.transmittedSignalOut !== null) 
                ? activePuzzleState.transmittedSignalOut 
                : null; // null renderitza com a '?'
            svgContainer.innerHTML = renderMissionCircuitSVG(mission, activePuzzleState.configInputs, displayOut);
        }
    }

    const promptEl = document.getElementById('puzzle-challenge-prompt');
    if (promptEl) {
        promptEl.innerHTML = `<span style="color:#38bdf8; margin-right:0.35rem;">⚡</span> ${ch.prompt}`;
    }

    const controlsArea = document.getElementById('puzzle-interactive-controls');
    if (controlsArea) {
        if (ch.mode === 'DEDUCE_OUT') {
            const s0 = activePuzzleState.selectedDeduceBit === 0 ? 'selected-0' : '';
            const s1 = activePuzzleState.selectedDeduceBit === 1 ? 'selected-1' : '';
            controlsArea.innerHTML = `
                <div style="font-size:0.83rem; color:#cbd5e1; margin-bottom:0.4rem; font-weight:600;">
                    Dedueix mentalment i selecciona quin estat produirà la <strong>Sortida Y</strong>:
                </div>
                <div class="io-choice-btns">
                    <button class="btn-bit-choice ${s0}" onclick="selectDeduceOutputBit(0)">
                        <span class="btn-choice-indicator">🔴</span>
                        <div class="btn-choice-texts">
                            <span class="btn-choice-main">SORTIDA Y = 0</span>
                            <span class="btn-choice-sub">Senyal Baix / Desactivat (0V)</span>
                        </div>
                    </button>
                    <button class="btn-bit-choice ${s1}" onclick="selectDeduceOutputBit(1)">
                        <span class="btn-choice-indicator">🟢</span>
                        <div class="btn-choice-texts">
                            <span class="btn-choice-main">SORTIDA Y = 1</span>
                            <span class="btn-choice-sub">Senyal Alt / Activat (+5V)</span>
                        </div>
                    </button>
                </div>
            `;
        } else {
            const btns = mission.inputs.map(inpKey => {
                const val = activePuzzleState.configInputs[inpKey] || 0;
                const isOn = val === 1;
                return `
                    <button class="btn-input-switch ${isOn ? 'on' : ''}" onclick="togglePuzzleInputSwitch('${inpKey}')">
                        <div class="switch-status-pill">${isOn ? '🟢 ON (1)' : '⚪ OFF (0)'}</div>
                        <div class="switch-label">Entrada <strong>${inpKey}</strong></div>
                        <div class="switch-hint">${isOn ? 'Prem per posar a 0' : 'Prem per posar a 1'}</div>
                    </button>
                `;
            }).join('');

            const hasTransmitted = (activePuzzleState.transmittedSignalOut !== null);
            const statusColor = hasTransmitted ? (activePuzzleState.transmittedSignalOut === ch.targetOut ? '#34d399' : '#f87171') : '#94a3b8';
            const statusText = hasTransmitted 
                ? `Últim Senyal Transmès Y = ${activePuzzleState.transmittedSignalOut}` 
                : 'Senyal en línia: PENDENT DE TRANSMISSIÓ';

            controlsArea.innerHTML = `
                <div class="gate-target-banner">
                    <span style="font-size:0.85rem; color:#e2e8f0; font-weight:700;">
                        🎯 Objectiu del Pany: <strong>Sortida Y = ${ch.targetOut}</strong>
                    </span>
                    <span class="gate-signal-status-pill ${hasTransmitted ? 'status-transmitted' : 'status-locked'}" style="color:${statusColor};">
                        ${hasTransmitted ? '📡' : '🔒'} ${statusText}
                    </span>
                </div>
                <div style="font-size:0.78rem; color:#94a3b8; margin-bottom:0.45rem;">
                    Alinea les entrades binàries del circuit i prem <strong>Transmetre Senyal i Validar</strong> per provar el pany:
                </div>
                <div class="input-toggle-grid">${btns}</div>
            `;
        }
    }

    const fb = document.getElementById('puzzle-feedback-box');
    if (fb && activePuzzleState.transmittedSignalOut === null) {
        fb.className = 'puzzle-feedback';
        fb.style.display = 'none';
    }
}

function selectDeduceOutputBit(bitVal) {
    activePuzzleState.selectedDeduceBit = bitVal;
    const mission = getCurrentMission();
    const isSubDoor = activePuzzleState.mode === 'SUB_DOOR';
    const ch = (isSubDoor || !mission.finalChallenge)
        ? (mission.challenges ? mission.challenges[activePuzzleState.stepIdx] : null)
        : mission.finalChallenge;

    if (!ch) return;

    const svgContainer = document.getElementById('puzzle-circuit-svg-box');
    if (svgContainer) {
        svgContainer.innerHTML = renderMissionCircuitSVG(mission, ch.inputs, bitVal);
    }

    document.querySelectorAll('.btn-bit-choice').forEach((btn, idx) => {
        btn.classList.toggle('selected-0', idx === 0 && bitVal === 0);
        btn.classList.toggle('selected-1', idx === 1 && bitVal === 1);
    });
}

function togglePuzzleInputSwitch(inpKey) {
    activePuzzleState.configInputs[inpKey] = activePuzzleState.configInputs[inpKey] ? 0 : 1;
    // Quan es toca un interruptor, es reseteja l'estat transmès per mantenir l'enigma fins a prémer Validar
    activePuzzleState.transmittedSignalOut = null;
    renderGatePuzzleModalContent();
}

function verifyCurrentGateStep() {
    const mission = getCurrentMission();
    const isSubDoor = activePuzzleState.mode === 'SUB_DOOR';
    const ch = (isSubDoor || !mission.finalChallenge)
        ? (mission.challenges ? mission.challenges[activePuzzleState.stepIdx] : null)
        : mission.finalChallenge;
    const fb = document.getElementById('puzzle-feedback-box');

    if (!ch) return;

    let isCorrect = false;

    if (ch.mode === 'DEDUCE_OUT') {
        if (activePuzzleState.selectedDeduceBit === null) {
            if (fb) {
                fb.className = 'puzzle-feedback error';
                fb.style.display = 'block';
                fb.innerHTML = '⚠️ Tria primer si la sortida és <strong>Y = 0</strong> o <strong>Y = 1</strong> abans de transmetre el senyal!';
            }
            return;
        }
        isCorrect = (activePuzzleState.selectedDeduceBit === ch.expectedOut);
        activePuzzleState.transmittedSignalOut = activePuzzleState.selectedDeduceBit;
    } else {
        const currentOut = mission.evalCircuit(activePuzzleState.configInputs);
        activePuzzleState.transmittedSignalOut = currentOut;
        isCorrect = (currentOut === ch.targetOut);
    }

    // Actualitzem la visualització per mostrar la sortida transmesa i el resultat
    renderGatePuzzleModalContent();

    if (isCorrect) {
        appState.logicHits++;
        saveState();

        if (fb) {
            fb.className = 'puzzle-feedback success';
            fb.style.display = 'block';
            fb.innerHTML = `✅ <strong>SENYAL VALIDAT! PANY DESBLOQUEJAT.</strong> ${ch.explanation}`;
        }

        if (isSubDoor) {
            const door = activePuzzleState.activeSubDoor;
            if (door) {
                door.logicUnlocked = true;
                if (engine3D) engine3D.toggleSubSecurityDoor(door);
            }
            if (window.castleAudio) window.castleAudio.playLogicSuccess();

            setTimeout(() => {
                closeGatePuzzleModal();
                showCastleToast(`🔓 Comporta #${(door ? door.doorIdx + 1 : '')} oberta! Ara pots obrir-la i tancar-la amb [E].`);
            }, 900);
        } else {
            currentDoorUnlocked = true;
            if (window.castleAudio) window.castleAudio.playGateOpen();
            if (engine3D) engine3D.unlockGateAnimation();
            updateMissionPanelUI();

            const vig = document.getElementById('vignette-overlay');
            if (vig) {
                vig.classList.add('success-flash');
                setTimeout(() => vig.classList.remove('success-flash'), 700);
            }

            // Transició directa al següent sector
            setTimeout(() => {
                closeGatePuzzleModal();
                showCastleToast('🎉 Protocol Lògic d\'Enginyeria Superat! Avançant al següent sector...');
                handleWalkThroughOpenGate();
            }, 950);
        }
    } else {
        appState.logicErrors++;
        appState.errorsByMission[mission.id] = (appState.errorsByMission[mission.id] || 0) + 1;
        saveState();

        if (window.castleAudio) window.castleAudio.playErrorPenalty();
        applyTimePenalty(LOGIC_ERROR_PENALTY_SEC, 'Error en Protocol Lògic');

        if (fb) {
            fb.className = 'puzzle-feedback error';
            fb.style.display = 'block';
            fb.innerHTML = `❌ <strong>Bypass Fallit (-30s).</strong> El senyal emès no desbloqueja el pany. Revisa la porta lògica!<br><span style="font-size:0.80rem; opacity:0.9;">Pista: ${ch.explanation}</span>`;
        }
    }
}

// ============================================================================
// PANTALLA DE DERROTA (TEMPS EXHAURIT)
// ============================================================================
function triggerGameOverModal() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    const modal = document.getElementById('gameover-modal');
    if (modal) {
        document.getElementById('go-missions-done').textContent = `${appState.completedMissions.length} / 10`;
        document.getElementById('go-hits').textContent = appState.logicHits;
        document.getElementById('go-errors').textContent = appState.logicErrors;
        modal.classList.add('active');
    }
    syncEnginePauseState();
}

// ============================================================================
// INFORME OFICIAL D'AVALUACIÓ TÀCTICA I DIPLOMA FOXHOUND
// ============================================================================
function calculateFinalGradeDetails() {
    const hits = appState.logicHits || 0;
    const errors = appState.logicErrors || 0;
    const hazards = appState.hazardHits || 0;
    const missionsDone = appState.completedMissions.length;
    const completionRatio = missionsDone / 10;

    const totalAttempts = Math.max(1, hits + errors);
    const accuracyPct = Math.round((hits / totalAttempts) * 100);

    const rawAccuracyScore = Math.max(0, (hits / totalAttempts) * 6.5 - errors * 0.22);
    const remRatio = Math.min(1, appState.remainingSeconds / 1500);
    const rawTimeScore = Math.max(0.5, remRatio * 3.5 - hazards * 0.12);

    let totalGrade = (rawAccuracyScore + rawTimeScore) * completionRatio;
    if (missionsDone === 10 && errors === 0 && hazards === 0 && appState.remainingSeconds >= 1200) {
        totalGrade = 10.0;
    } else {
        totalGrade = Math.min(10.0, Math.max(missionsDone === 10 ? 5.0 : 1.0, totalGrade));
    }

    const gradeFixed = totalGrade.toFixed(1);

    let rankTitle = 'BIG BOSS (Rang S)';
    let qualificationText = 'Assoliment Extraordinari FOXHOUND 🏆';
    let qualificationColor = '#16a34a';

    if (totalGrade >= 9.0 && hazards <= 2) {
        rankTitle = 'BIG BOSS (Rang S)';
        qualificationText = 'Assoliment Extraordinari FOXHOUND 🏆';
        qualificationColor = '#16a34a';
    } else if (totalGrade >= 8.0) {
        rankTitle = 'FOX (Rang A)';
        qualificationText = 'Assoliment Notable Tàctic 🎖️';
        qualificationColor = '#2563eb';
    } else if (totalGrade >= 6.5) {
        rankTitle = 'HOUND (Rang B)';
        qualificationText = 'Assoliment Satisfactori d’Operacions 🥉';
        qualificationColor = '#d97706';
    } else if (totalGrade >= 5.0) {
        rankTitle = 'SNAKE (Rang C)';
        qualificationText = 'Assoliment Bàsic Aprovat ⚠️';
        qualificationColor = '#d97706';
    } else {
        rankTitle = 'RECRUIT (Rang D)';
        qualificationText = 'Infiltració Fallida / No Assolit ❌';
        qualificationColor = '#dc2626';
    }

    return {
        gradeFixed,
        totalGrade,
        rankTitle,
        accuracyPct,
        hits,
        errors,
        hazards,
        missionsDone,
        qualificationText,
        qualificationColor
    };
}

function openDiplomaModal() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    renderDiplomaContent();
    document.getElementById('diploma-modal').classList.add('active');
    syncEnginePauseState();
}

function renderDiplomaContent() {
    const stats = calculateFinalGradeDetails();

    document.getElementById('dip-student-name').textContent = appState.studentName || 'Agent';
    document.getElementById('dip-student-group').textContent = appState.studentGroup || 'FOXHOUND';
    document.getElementById('dip-grade-value').textContent = `${stats.gradeFixed} / 10`;
    document.getElementById('dip-grade-value').style.color = stats.qualificationColor;

    const qualEl = document.getElementById('dip-qualification-badge');
    qualEl.textContent = `${stats.rankTitle} · ${stats.qualificationText}`;
    qualEl.style.color = stats.qualificationColor;

    document.getElementById('dip-missions-val').textContent = `${stats.missionsDone} / 10`;
    document.getElementById('dip-accuracy-val').textContent = `${stats.hits} correctes / ${stats.errors} errors (${stats.accuracyPct}%)`;
    document.getElementById('dip-time-used').textContent = formatTimeMMSS(appState.realElapsedSeconds);
    document.getElementById('dip-time-left').textContent = `${formatTimeMMSS(appState.remainingSeconds)} (${stats.hazards} alertes)`;

    const strengths = [];
    const weaknesses = [];

    const basicErrors = (appState.errorsByMission[1] || 0) + (appState.errorsByMission[2] || 0) + (appState.errorsByMission[3] || 0);
    const advGatesErrors = (appState.errorsByMission[4] || 0) + (appState.errorsByMission[5] || 0) + (appState.errorsByMission[6] || 0);
    const combErrors = (appState.errorsByMission[7] || 0) + (appState.errorsByMission[8] || 0) + (appState.errorsByMission[9] || 0) + (appState.errorsByMission[10] || 0);

    if (basicErrors <= 1) {
        strengths.push('⚡ <strong>Portes Fonamentals (NOT, AND, OR):</strong> Comprensió sòlida de la inversió, la conjunció en sèrie i la disjunció en paral·lel.');
    } else {
        weaknesses.push('📘 <strong>Portes Bàsiques (NOT, AND, OR):</strong> Es recomana repassar les taules de veritat bàsiques de multiplicació i suma booleana.');
    }

    if (advGatesErrors <= 1) {
        strengths.push('🔒 <strong>Portes Criptogràfiques i Universals (XOR, NAND, NOR):</strong> Domini de la comparació exclusiva i de la negació de producte/suma.');
    } else {
        weaknesses.push('🔄 <strong>Portes XOR, NAND i NOR:</strong> Recorda que el cercle a la sortida de la porta inverteix el resultat final.');
    }

    if (combErrors <= 2 && stats.missionsDone >= 10) {
        strengths.push('🧠 <strong>Circuits Combinacionals Multi-Porta:</strong> Capacitat destacada per analitzar nodes intermedis (M1, M2) fins la sortida final.');
    } else {
        weaknesses.push('🔗 <strong>Circuits Combinacionals:</strong> Resol primer el valor de sortida de cada porta individual abans d’atacar la porta final.');
    }

    if (stats.hazards <= 2 && stats.missionsDone >= 10) {
        strengths.push('🕶️ <strong>Infiltració Tàctica i Sigil MGS:</strong> Excel·lent lectura dels cons de visió dels sentinelles i càmeres CCTV.');
    } else if (stats.hazards > 3) {
        weaknesses.push('⚠️ <strong>Sigil i Consciència Espacial:</strong> Fes servir les caixes per cobrir la teva línia de visió (LOS) i vigila la rotació de les càmeres.');
    }

    const sList = document.getElementById('dip-strengths-list');
    const wList = document.getElementById('dip-weaknesses-list');

    sList.innerHTML = strengths.map(s => `<li style="margin-bottom:0.4rem;">${s}</li>`).join('');
    if (weaknesses.length === 0) {
        wList.innerHTML = `<li style="color:#15803d; font-weight:600;">✨ Rendiment exemplar! Has completat la infiltració sense errors ni alertes. Felicitats, Big Boss!</li>`;
    } else {
        wList.innerHTML = weaknesses.map(w => `<li style="margin-bottom:0.4rem;">${w}</li>`).join('');
    }

    const today = new Date();
    document.getElementById('dip-date').textContent = today.toLocaleDateString('ca-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function downloadDiplomaPNG() {
    const el = document.getElementById('printable-diploma');
    if (!el || typeof html2canvas === 'undefined') {
        window.print();
        return;
    }

    const btn = document.getElementById('btn-download-diploma-png');
    const origText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '⏳ Generant imatge PNG...';

    html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
    }).then(canvas => {
        const link = document.createElement('a');
        const safeName = (appState.studentName || 'agent').trim().toLowerCase().replace(/[^a-z0-9àèéíòóúçñ]/gi, '_');
        link.download = `diploma_foxhound_${safeName}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }).catch(err => {
        console.error('Error generant PNG:', err);
        window.print();
    }).finally(() => {
        btn.disabled = false;
        btn.innerHTML = origText;
    });
}

// ============================================================================
// CONTROLS AUXILIARS D'INTERFÍCIE (SO, CÀMERA ROTATÒRIA, SALT)
// ============================================================================
function handleToggleSound() {
    if (!window.castleAudio) return;
    window.castleAudio.startAmbientDrone();
    const muted = window.castleAudio.toggleMute();
    const btn = document.getElementById('btn-toggle-sound');
    if (btn) {
        btn.innerHTML = muted ? '🔇 So Off' : '🔊 So On';
    }
}

function handleToggleCameraAngle() {
    if (!engine3D) return;
    engine3D.toggleCameraAngle();
    const btn = document.getElementById('btn-toggle-cam');
    if (btn) {
        btn.innerHTML = '🎥 Planta Fixa [Z]';
    }
    showToast('🎥 Vista de planta fixa (10º) centrada', 'info');
}

function handleRotateCameraLeft() {
    if (engine3D) engine3D.rotateCameraLeft();
}

function handleRotateCameraRight() {
    if (engine3D) engine3D.rotateCameraRight();
}

function handlePlayerJump() {
    // Salt desactivat: el personatge no pot saltar per requisits de disseny
}

// ============================================================================
// SISTEMA D'AUDITORIA I DEBUG (FASE DEBUG - F2)
// ============================================================================
window.currentDebugFilter = 'ALL';

function togglePerformanceMode() {
    if (!engine3D) return;
    const mode = engine3D.togglePerformanceMode();
    updatePerfButtonUI(mode);
    if (mode === 'CHROMEBOOK') {
        showCastleToast('⚡ Mode Chromebook (Fluid) activat: 60 FPS estables per a l\'aula!');
    } else {
        showCastleToast('🌟 Mode Gràfics Alts activat: Ombres suaus i resolució alta.');
    }
}
window.togglePerformanceMode = togglePerformanceMode;

function updatePerfButtonUI(mode) {
    const btn = document.getElementById('btn-toggle-perf');
    if (!btn) return;
    if (mode === 'CHROMEBOOK') {
        btn.innerHTML = '⚡ Fluid (Chromebook)';
        btn.style.borderColor = '#38bdf8';
        btn.style.color = '#38bdf8';
        btn.title = 'Mode Rendiment escolar: màxima fluïdesa en Chromebooks (Clica per Gràfics Alts)';
    } else {
        btn.innerHTML = '🌟 Gràfics Alts';
        btn.style.borderColor = '#f59e0b';
        btn.style.color = '#fbbf24';
        btn.title = 'Mode Gràfics Alts: amb ombres suaus (Clica per Mode Chromebook)';
    }
}
window.updatePerfButtonUI = updatePerfButtonUI;

function toggleLiveDebugMode() {
    if (!engine3D) return;
    const isVisible = engine3D.toggleDebug3DMarkers();
    const btn = document.getElementById('btn-toggle-debug');
    if (btn) {
        if (isVisible) {
            btn.innerHTML = '🛠️ Debug: ON [F2]';
            btn.style.borderColor = '#22c55e';
            btn.style.color = '#22c55e';
            btn.style.boxShadow = '0 0 10px rgba(34, 197, 94, 0.4)';
            showCastleToast('🛠️ Mode Debug 3D ACTIVAT (Visualitzant etiquetes i coordenades)');
        } else {
            btn.innerHTML = '🛠️ Debug: OFF [F2]';
            btn.style.borderColor = '#64748b';
            btn.style.color = '#94a3b8';
            btn.style.boxShadow = 'none';
            showCastleToast('⚡ Mode Debug 3D DESACTIVAT (Rendiment màxim)');
        }
    }
}
window.toggleLiveDebugMode = toggleLiveDebugMode;

function toggleDebugModal() {
    const modal = document.getElementById('debug-modal');
    if (!modal) return;
    if (modal.classList.contains('active')) {
        closeDebugModal();
    } else {
        openDebugModal();
    }
}
window.toggleDebugModal = toggleDebugModal;

function openDebugModal() {
    const modal = document.getElementById('debug-modal');
    if (!modal) return;
    const mission = getCurrentMission();
    const titleEl = document.getElementById('debug-modal-sector-title');
    if (titleEl) titleEl.textContent = `${mission.title} (${mission.gateBadge})`;

    renderDebugTable(window.currentDebugFilter || 'ALL');

    modal.classList.add('active');
    syncEnginePauseState();
}
window.openDebugModal = openDebugModal;

function closeDebugModal() {
    const modal = document.getElementById('debug-modal');
    if (modal) modal.classList.remove('active');
    syncEnginePauseState();
}
window.closeDebugModal = closeDebugModal;

function setDebugFilter(filterType, btnEl) {
    window.currentDebugFilter = filterType;
    const container = document.getElementById('debug-filter-container');
    if (container) {
        container.querySelectorAll('.debug-filter-btn').forEach(btn => btn.classList.remove('active'));
    }
    if (btnEl) btnEl.classList.add('active');
    renderDebugTable(filterType);
}
window.setDebugFilter = setDebugFilter;

function renderDebugTable(filterType = 'ALL') {
    const tbody = document.getElementById('debug-table-body');
    if (!tbody || !engine3D) return;

    const manifest = engine3D.buildDebugManifest();
    let filtered = manifest;

    if (filterType === 'PAL_DISC') {
        filtered = manifest.filter(m => m.category === 'PAL_DISC');
    } else if (filterType === 'GUARD') {
        filtered = manifest.filter(m => m.category === 'GUARD');
    } else if (filterType === 'CCTV') {
        filtered = manifest.filter(m => m.category === 'CCTV');
    } else if (filterType === 'PC_TERMINAL') {
        filtered = manifest.filter(m => m.category === 'PC_TERMINAL');
    } else if (filterType === 'INTERACTIVE') {
        filtered = manifest.filter(m => ['GATE', 'SPAWN', 'LASER', 'SWITCH', 'SUB_DOOR', 'PUSH_CRATE'].includes(m.type));
    } else if (filterType === 'FURNITURE') {
        filtered = manifest.filter(m => m.category === 'FURNITURE');
    }

    tbody.innerHTML = '';
    filtered.forEach(item => {
        const tr = document.createElement('tr');

        let statusColor = '#94a3b8';
        if (item.statusCode === 'ok') statusColor = '#4ade80';
        else if (item.statusCode === 'alert') statusColor = '#38bdf8';
        else if (item.statusCode === 'pending') statusColor = '#facc15';
        else if (item.statusCode === 'danger') statusColor = '#f87171';

        tr.innerHTML = `
            <td><span class="debug-id-badge ${item.badgeClass}">${item.id}</span></td>
            <td><strong>${item.name}</strong></td>
            <td><code style="color:#38bdf8; font-weight:700; font-family:'JetBrains Mono',monospace;">${item.coordStr}</code></td>
            <td><span style="color:#94a3b8; font-size:0.75rem;">${item.area}</span></td>
            <td><span style="color:${statusColor}; font-weight:600;">${item.status}</span></td>
            <td style="text-align:center;">
                <button class="btn-hud" onclick="teleportPlayerTo(${item.gridX}, ${item.gridZ})" style="padding:0.25rem 0.6rem; font-size:0.72rem; border-color:#38bdf8; color:#38bdf8; cursor:pointer;" title="Teleportar Snake directament a la casella de l'element">
                    ⚡ Teleportar
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    const overlayStateEl = document.getElementById('debug-3d-overlay-state');
    if (overlayStateEl) {
        overlayStateEl.textContent = engine3D.debug3DVisible ? 'ACTIUS' : 'DESACTIVATS';
        overlayStateEl.style.color = engine3D.debug3DVisible ? '#4ade80' : '#f87171';
    }
}
window.renderDebugTable = renderDebugTable;

function toggle3DDebugOverlay() {
    if (!engine3D) return;
    const isVis = engine3D.toggleDebug3DMarkers();
    const overlayStateEl = document.getElementById('debug-3d-overlay-state');
    if (overlayStateEl) {
        overlayStateEl.textContent = isVis ? 'ACTIUS' : 'DESACTIVATS';
        overlayStateEl.style.color = isVis ? '#4ade80' : '#f87171';
    }
    showCastleToast(`👁️ Rètols 3D sobre el mapa: ${isVis ? 'ACTIUS' : 'DESACTIVATS'}`);
}
window.toggle3DDebugOverlay = toggle3DDebugOverlay;

function copyDebugManifestToClipboard() {
    if (!engine3D) return;
    const mission = getCurrentMission();
    const manifest = engine3D.buildDebugManifest();

    let md = `### 🛠️ Manifest de Debug - ${mission.title}\n\n`;
    md += `| ID Únic | Element / Tipus | Quadrícula | Àrea del Sector | Estat Actual en Viu |\n`;
    md += `|---|---|---|---|---|\n`;

    manifest.forEach(m => {
        md += `| \`${m.id}\` | ${m.name} | \`${m.coordStr}\` | ${m.area} | ${m.status} |\n`;
    });

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(md).then(() => {
            showCastleToast('📋 Manifest de debug copiat al porta-retalls! Ja el pots enganxar al xat.');
        }).catch(() => {
            console.log(md);
            showCastleToast('📋 S\'ha imprès el manifest a la consola de desenvolupador (F12).');
        });
    } else {
        console.log(md);
        showCastleToast('📋 S\'ha imprès el manifest a la consola de desenvolupador (F12).');
    }
}
window.copyDebugManifestToClipboard = copyDebugManifestToClipboard;

function teleportPlayerTo(cx, rz) {
    if (!engine3D) return;
    const wx = engine3D.gridToWorldX(cx);
    const wz = engine3D.gridToWorldZ(rz);
    engine3D.playerState.x = wx;
    engine3D.playerState.z = wz;
    engine3D.playerState.vx = 0;
    engine3D.playerState.vz = 0;
    engine3D.playerState.invulnTimer = 2.5;

    closeDebugModal();
    showCastleToast(`⚡ Snake teleportat a C${String(cx).padStart(2, '0')}:R${String(rz).padStart(2, '0')}!`);
}
window.teleportPlayerTo = teleportPlayerTo;

function DEBUG_AUDIT() {
    if (!engine3D) return [];
    const manifest = engine3D.buildDebugManifest();
    console.table(manifest);
    return manifest;
}
window.DEBUG_AUDIT = DEBUG_AUDIT;

