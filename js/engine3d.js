// ============================================================================
// MOTOR GRÀFIC 3D TÀCTIC AVANÇAT (THREE.JS) — METAL GEAR LOGIC: SHADOW CIRCUIT
// Gràfiques PBR, Il·luminació Dinàmica, Físiques d'Inèrcia, Sigil Realista,
// Raigs Làser Interactius, Disjuntors, Sub-Portes, Plaques de Pressió,
// Bobines Tesla d'Alta Tensió i Pous de Ventilació amb Turbines Giratòries
// ============================================================================

class Castle3DEngine {
    constructor(containerId, minimapCanvasId, callbacks) {
        this.container = document.getElementById(containerId);
        this.minimapCanvas = document.getElementById(minimapCanvasId);
        this.minimapCtx = this.minimapCanvas ? this.minimapCanvas.getContext('2d') : null;
        this.callbacks = callbacks || {};

        this.tileSize = 3.0;
        this.gridW = 17;
        this.gridH = 17;
        this.mapData = [];

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();

        // Fixed Planta / Top-Down Camera (10º Tilt from vertical, perspective maintained)
        this.cameraYaw = 0;
        this.targetCameraYaw = 0;
        this.cameraZoom = 1.0;
        this.isTopDown = true;
        this.cameraFocusX = 0;
        this.cameraFocusZ = 0;
        this.fixedTiltDeg = 10.0;

        // Dynamic entities & groups
        this.levelGroup = null;
        this.snowParticles = null;
        this.steamParticles = [];
        this.electricArcs = [];
        this.turbineFans = [];

        this.playerMesh = null;
        this.playerParts = {};
        this.playerShadow = null;
        this.playerLight = null;

        // Realistic Momentum & Locomotion State (Tactical Stealth Pace)
        this.playerState = {
            x: 0,
            y: 0,
            z: 0,
            vx: 0,
            vz: 0,
            vy: 0,
            speed: 6.2,
            crouchSpeed: 3.6,
            isCrouching: false,
            isGrounded: true,
            spawnX: 0,
            spawnZ: 0,
            angle: Math.PI,
            targetAngle: Math.PI,
            angularVelocity: 0,
            invulnTimer: 0,
            walkCycle: 0,
            bandanaSegments: [
                { x: 0, z: 0, angle: 0 },
                { x: 0, z: 0, angle: 0 },
                { x: 0, z: 0, angle: 0 }
            ]
        };

        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false
        };

        // World Collections
        this.crystals = [];
        this.chests = [];
        this.pushCrates = [];
        this.jumpPlatforms = [];
        this.enemies = [];
        this.cameras = [];
        this.lasers = [];
        this.switches = [];
        this.workstations = [];
        this.subDoors = [];
        this.pressurePlates = [];
        this.steamPipes = [];
        this.pits = [];
        this.lavas = [];
        this.torches = [];
        this.catwalks = [];
        this.ramps = [];
        this.elevators = [];
        this.wallColliders = [];
        this.gateInfo = null;
        this.burstParticles = [];

        this.paused = false;
        this.nearGate = false;
        this.nearSwitch = null;
        this.nearWorkstation = null;
        this.nearDoor = null;
        this.nearElevator = null;
        this.bypassDoorPuzzles = false;
        this.alertState = 'NORMAL';
        this.alertTimer = 0;
        this.bullets = [];
        this.drones = [];
        this.playerHealth = 100;
        this.maxPlayerHealth = 100;
        this.lastKnownPlayerPos = null;

        this.shroudCanvas = null;
        this.shroudCtx = null;

        this.textures = {};
        this.materials = {};

        this.initThree();
        this.generateProceduralTextures();
        this.bindInputEvents();
        this.animate();
    }

    initThree() {
        this.scene = new THREE.Scene();
        // High-altitude cold Arctic military ambiance - bright & high visibility
        this.scene.background = new THREE.Color(0x182438);
        this.scene.fog = new THREE.FogExp2(0x182438, 0.005);

        const w = this.container.clientWidth || window.innerWidth;
        const h = this.container.clientHeight || window.innerHeight;

        this.camera = new THREE.PerspectiveCamera(46, w / h, 0.5, 220);
        const initTiltRad = (10.0 * Math.PI) / 180;
        const initCamH = 34;
        const initCamOffsetZ = initCamH * Math.tan(initTiltRad);
        this.camera.position.set(0, initCamH, initCamOffsetZ);
        this.camera.lookAt(0, 0, 0);

        let savedPerf = 'CHROMEBOOK';
        try {
            savedPerf = localStorage.getItem('tor_perf_mode') || 'CHROMEBOOK';
        } catch (e) {}
        this.perfMode = savedPerf;

        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        this.renderer.setSize(w, h);
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.58;

        if (this.perfMode === 'CHROMEBOOK') {
            this.renderer.setPixelRatio(1.0);
            this.renderer.shadowMap.enabled = false;
        } else {
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }

        this.container.innerHTML = '';
        this.container.appendChild(this.renderer.domElement);

        // Ambient ceiling illumination
        const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x475569, 1.45);
        this.scene.add(hemiLight);

        // General ambient fill light to eliminate pitch black corners
        const ambientFill = new THREE.AmbientLight(0x94a3b8, 0.85);
        this.scene.add(ambientFill);

        // Main military directional light with tuned soft shadows
        this.mainLight = new THREE.DirectionalLight(0xffffff, 1.65);
        this.mainLight.position.set(28, 42, 26);
        if (this.perfMode === 'HIGH') {
            this.mainLight.castShadow = true;
            this.mainLight.shadow.mapSize.width = 1024;
            this.mainLight.shadow.mapSize.height = 1024;
            this.mainLight.shadow.camera.near = 5;
            this.mainLight.shadow.camera.far = 130;
            const d = 36;
            this.mainLight.shadow.camera.left = -d;
            this.mainLight.shadow.camera.right = d;
            this.mainLight.shadow.camera.top = d;
            this.mainLight.shadow.camera.bottom = -d;
            this.mainLight.shadow.bias = -0.0003;
        } else {
            this.mainLight.castShadow = false;
        }
        this.scene.add(this.mainLight);

        this.levelGroup = new THREE.Group();
        this.scene.add(this.levelGroup);

        window.addEventListener('resize', () => this.onResize());
    }

    onResize() {
        if (!this.container || !this.renderer || !this.camera) return;
        const w = this.container.clientWidth || window.innerWidth;
        const h = this.container.clientHeight || window.innerHeight;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        const pr = this.perfMode === 'CHROMEBOOK' ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.5);
        this.renderer.setPixelRatio(pr);
        this.renderer.setSize(w, h);
    }

    setPerformanceMode(mode) {
        this.perfMode = mode === 'HIGH' ? 'HIGH' : 'CHROMEBOOK';
        try {
            localStorage.setItem('tor_perf_mode', this.perfMode);
        } catch (e) {}

        const isChromebook = this.perfMode === 'CHROMEBOOK';
        if (isChromebook) {
            this.renderer.shadowMap.enabled = false;
            if (this.mainLight) this.mainLight.castShadow = false;
            this.renderer.setPixelRatio(1.0);
            if (this.snowParticles && this.snowParticles.points) {
                this.snowParticles.points.visible = false;
            }
        } else {
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            if (this.mainLight) {
                this.mainLight.castShadow = true;
                this.mainLight.shadow.mapSize.width = 1024;
                this.mainLight.shadow.mapSize.height = 1024;
                this.mainLight.shadow.camera.near = 5;
                this.mainLight.shadow.camera.far = 130;
                const d = 36;
                this.mainLight.shadow.camera.left = -d;
                this.mainLight.shadow.camera.right = d;
                this.mainLight.shadow.camera.top = d;
                this.mainLight.shadow.camera.bottom = -d;
                this.mainLight.shadow.bias = -0.0003;
            }
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
            if (this.snowParticles && this.snowParticles.points) {
                this.snowParticles.points.visible = true;
            }
        }

        const w = this.container.clientWidth || window.innerWidth;
        const h = this.container.clientHeight || window.innerHeight;
        this.renderer.setSize(w, h);

        return this.perfMode;
    }

    togglePerformanceMode() {
        const next = this.perfMode === 'CHROMEBOOK' ? 'HIGH' : 'CHROMEBOOK';
        return this.setPerformanceMode(next);
    }

    // ========================================================================
    // TEXTURES PROCEDURALS D'ALTA DEFINICIÓ (ACER PBR, HAZARD, TESLA, VIDRE)
    // ========================================================================
    generateProceduralTextures() {
        // 1. Terra d'acer amb relleu de reblons, planxes i línies grogues de perill
        const floorCanvas = document.createElement('canvas');
        floorCanvas.width = 512;
        floorCanvas.height = 512;
        const fctx = floorCanvas.getContext('2d');
        fctx.fillStyle = '#293548';
        fctx.fillRect(0, 0, 512, 512);

        const cols = 4, rows = 4;
        const tw = 512 / cols, th = 512 / rows;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const x = c * tw;
                const y = r * th;
                fctx.fillStyle = (r + c) % 2 === 0 ? '#38465c' : '#303e54';
                fctx.fillRect(x + 2, y + 2, tw - 4, th - 4);

                // Diamond tread texture
                fctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
                for (let px = x + 10; px < x + tw - 10; px += 14) {
                    for (let py = y + 10; py < y + th - 10; py += 14) {
                        fctx.fillRect(px, py, 5, 2);
                        fctx.fillRect(px + 4, py + 7, 5, 2);
                    }
                }

                fctx.strokeStyle = '#1e293b';
                fctx.lineWidth = 3;
                fctx.strokeRect(x + 1, y + 1, tw - 2, th - 2);

                // Corner rivets
                fctx.fillStyle = '#94a3b8';
                [
                    [x + 8, y + 8], [x + tw - 8, y + 8],
                    [x + 8, y + th - 8], [x + tw - 8, y + th - 8]
                ].forEach(([rx, ry]) => {
                    fctx.beginPath();
                    fctx.arc(rx, ry, 2.5, 0, Math.PI * 2);
                    fctx.fill();
                });
            }
        }
        const floorTex = new THREE.CanvasTexture(floorCanvas);
        floorTex.wrapS = THREE.RepeatWrapping;
        floorTex.wrapT = THREE.RepeatWrapping;
        floorTex.repeat.set(17, 17);

        // 2. Murs blindats amb canonades, juntes i franges de perill inferiors
        const wallCanvas = document.createElement('canvas');
        wallCanvas.width = 512;
        wallCanvas.height = 512;
        const wctx = wallCanvas.getContext('2d');
        wctx.fillStyle = '#334155';
        wctx.fillRect(0, 0, 512, 512);

        const pw = 256, ph = 128;
        for (let y = 0; y < 512; y += ph) {
            for (let x = 0; x < 512; x += pw) {
                const shade = 70 + Math.floor(Math.random() * 20);
                wctx.fillStyle = `rgb(${shade}, ${shade + 6}, ${shade + 12})`;
                wctx.fillRect(x + 3, y + 3, pw - 6, ph - 6);
                wctx.strokeStyle = '#1e293b';
                wctx.lineWidth = 4;
                wctx.strokeRect(x + 2, y + 2, pw - 4, ph - 4);

                // Rivet row
                wctx.fillStyle = '#64748b';
                for (let rx = x + 18; rx < x + pw; rx += 32) {
                    wctx.beginPath();
                    wctx.arc(rx, y + 10, 2.5, 0, Math.PI * 2);
                    wctx.arc(rx, y + ph - 10, 2.5, 0, Math.PI * 2);
                    wctx.fill();
                }
            }
        }

        // Yellow-black warning stripe across bottom
        const stripeH = 34;
        const stripeY = 512 - stripeH - 6;
        wctx.fillStyle = '#0f172a';
        wctx.fillRect(0, stripeY, 512, stripeH);
        wctx.fillStyle = '#eab308';
        for (let sx = -50; sx < 550; sx += 36) {
            wctx.beginPath();
            wctx.moveTo(sx, stripeY + stripeH);
            wctx.lineTo(sx + 18, stripeY);
            wctx.lineTo(sx + 32, stripeY);
            wctx.lineTo(sx + 14, stripeY + stripeH);
            wctx.closePath();
            wctx.fill();
        }

        const wallTex = new THREE.CanvasTexture(wallCanvas);
        wallTex.wrapS = THREE.RepeatWrapping;
        wallTex.wrapT = THREE.RepeatWrapping;

        // 3. Contenidor de càrrega pesant militar ("SHADOW FOX")
        const crateCanvas = document.createElement('canvas');
        crateCanvas.width = 256;
        crateCanvas.height = 256;
        const cctx = crateCanvas.getContext('2d');
        cctx.fillStyle = '#223042';
        cctx.fillRect(0, 0, 256, 256);
        cctx.strokeStyle = '#0e1724';
        cctx.lineWidth = 12;
        cctx.strokeRect(6, 6, 244, 244);
        cctx.beginPath();
        cctx.moveTo(16, 16);
        cctx.lineTo(240, 240);
        cctx.moveTo(240, 16);
        cctx.lineTo(16, 240);
        cctx.lineWidth = 9;
        cctx.stroke();
        cctx.fillStyle = '#e2e8f0';
        cctx.font = 'bold 22px monospace';
        cctx.textAlign = 'center';
        cctx.fillText('SHADOW-FOX', 128, 136);
        const crateTex = new THREE.CanvasTexture(crateCanvas);

        // 4. Sub-porta cuirassada corredissa ("SECURITY DOOR")
        const subDoorCanvas = document.createElement('canvas');
        subDoorCanvas.width = 256;
        subDoorCanvas.height = 256;
        const dctx = subDoorCanvas.getContext('2d');
        dctx.fillStyle = '#334155';
        dctx.fillRect(0, 0, 256, 256);
        dctx.fillStyle = '#eab308';
        for (let x = -50; x < 300; x += 40) {
            dctx.beginPath();
            dctx.moveTo(x, 256);
            dctx.lineTo(x + 20, 0);
            dctx.lineTo(x + 36, 0);
            dctx.lineTo(x + 16, 256);
            dctx.closePath();
            dctx.fill();
        }
        dctx.fillStyle = '#0f172a';
        dctx.fillRect(20, 90, 216, 76);
        dctx.fillStyle = '#38bdf8';
        dctx.font = 'bold 18px monospace';
        dctx.textAlign = 'center';
        dctx.fillText('SECURITY GATE', 128, 136);
        const subDoorTex = new THREE.CanvasTexture(subDoorCanvas);

        this.textures = { floorTex, wallTex, crateTex, subDoorTex };

        this.materials = {
            floor: new THREE.MeshStandardMaterial({
                map: floorTex,
                roughness: 0.55,
                metalness: 0.5
            }),
            runwayStripes: new THREE.MeshStandardMaterial({
                color: 0x0284c7,
                roughness: 0.35,
                metalness: 0.65,
                transparent: true,
                opacity: 0.75
            }),
            wall: new THREE.MeshStandardMaterial({
                map: wallTex,
                roughness: 0.65,
                metalness: 0.35
            }),
            wallWindow: new THREE.MeshPhysicalMaterial({
                color: 0x93c5fd,
                roughness: 0.1,
                transmission: 0.78,
                thickness: 0.8,
                transparent: true,
                opacity: 0.85
            }),
            steelBeam: new THREE.MeshStandardMaterial({
                color: 0x334155,
                roughness: 0.4,
                metalness: 0.85
            }),
            crate: new THREE.MeshStandardMaterial({
                map: crateTex,
                roughness: 0.6,
                metalness: 0.45
            }),
            subDoor: new THREE.MeshStandardMaterial({
                map: subDoorTex,
                roughness: 0.5,
                metalness: 0.6
            }),
            supplyBox: new THREE.MeshStandardMaterial({
                color: 0x166534,
                roughness: 0.45,
                metalness: 0.35
            }),
            serverRack: new THREE.MeshStandardMaterial({
                color: 0x0f172a,
                roughness: 0.3,
                metalness: 0.85
            }),
            teslaCoil: new THREE.MeshStandardMaterial({
                color: 0x0284c7,
                emissive: 0x0369a1,
                emissiveIntensity: 0.8,
                roughness: 0.2,
                metalness: 0.95
            }),
            laserBeam: new THREE.MeshBasicMaterial({
                color: 0xef4444,
                transparent: true,
                opacity: 0.85
            }),
            pressurePlateOff: new THREE.MeshStandardMaterial({
                color: 0x1e293b,
                roughness: 0.5,
                metalness: 0.7
            }),
            pressurePlateOn: new THREE.MeshStandardMaterial({
                color: 0x10b981,
                emissive: 0x059669,
                emissiveIntensity: 0.8,
                roughness: 0.3,
                metalness: 0.8
            }),
            tableWood: new THREE.MeshStandardMaterial({
                color: 0x473322,
                roughness: 0.5,
                metalness: 0.15
            }),
            officeChair: new THREE.MeshStandardMaterial({
                color: 0x1e293b,
                roughness: 0.6,
                metalness: 0.25
            }),
            plantPot: new THREE.MeshStandardMaterial({
                color: 0x854d0e,
                roughness: 0.75,
                metalness: 0.1
            }),
            plantLeaf: new THREE.MeshStandardMaterial({
                color: 0x16a34a,
                roughness: 0.35,
                metalness: 0.15
            }),
            soil: new THREE.MeshStandardMaterial({
                color: 0x1c1917,
                roughness: 0.95
            }),
            pcCase: new THREE.MeshStandardMaterial({
                color: 0x1e293b,
                roughness: 0.35,
                metalness: 0.7
            }),
            screenCyan: new THREE.MeshBasicMaterial({
                color: 0x38bdf8
            }),
            screenGreen: new THREE.MeshBasicMaterial({
                color: 0x22c55e
            }),
            screenAmber: new THREE.MeshBasicMaterial({
                color: 0xf59e0b
            }),
            paperDoc: new THREE.MeshStandardMaterial({
                color: 0xf8fafc,
                roughness: 0.9
            }),
            lampWarm: new THREE.MeshBasicMaterial({
                color: 0xfef08a
            }),
            lampHood: new THREE.MeshStandardMaterial({
                color: 0x1e3a5f,
                metalness: 0.8,
                roughness: 0.3
            }),
            leatherCognac: new THREE.MeshStandardMaterial({
                color: 0x5c2b14,
                roughness: 0.65,
                metalness: 0.15
            }),
            leatherNavy: new THREE.MeshStandardMaterial({
                color: 0x1e293b,
                roughness: 0.6,
                metalness: 0.2
            }),
            leatherBurgundy: new THREE.MeshStandardMaterial({
                color: 0x581c24,
                roughness: 0.6,
                metalness: 0.15
            }),
            leatherEmerald: new THREE.MeshStandardMaterial({
                color: 0x064e3b,
                roughness: 0.55,
                metalness: 0.15
            }),
            leatherCharcoal: new THREE.MeshStandardMaterial({
                color: 0x18181b,
                roughness: 0.5,
                metalness: 0.25
            }),
            fabricCream: new THREE.MeshStandardMaterial({
                color: 0xfef3c7,
                roughness: 0.85,
                metalness: 0.05
            }),
            woodMahogany: new THREE.MeshStandardMaterial({
                color: 0x3d2314,
                roughness: 0.45,
                metalness: 0.2
            }),
            woodOak: new THREE.MeshStandardMaterial({
                color: 0x5c3d24,
                roughness: 0.55,
                metalness: 0.1
            }),
            woodWalnut: new THREE.MeshStandardMaterial({
                color: 0x271c19,
                roughness: 0.4,
                metalness: 0.15
            }),
            woodAsh: new THREE.MeshStandardMaterial({
                color: 0xd4c4a8,
                roughness: 0.5,
                metalness: 0.05
            }),
            marbleWhite: new THREE.MeshStandardMaterial({
                color: 0xf8fafc,
                roughness: 0.18,
                metalness: 0.3
            }),
            glassSmoked: new THREE.MeshStandardMaterial({
                color: 0x1e293b,
                roughness: 0.1,
                metalness: 0.5,
                transparent: true,
                opacity: 0.75
            }),
            brassGold: new THREE.MeshStandardMaterial({
                color: 0xd97706,
                roughness: 0.35,
                metalness: 0.85
            }),
            carpetRed: new THREE.MeshStandardMaterial({
                color: 0x7f1d1d,
                roughness: 0.9,
                metalness: 0.05
            }),
            carpetBlue: new THREE.MeshStandardMaterial({
                color: 0x1e3a8a,
                roughness: 0.9,
                metalness: 0.05
            }),
            carpetGreen: new THREE.MeshStandardMaterial({
                color: 0x064e3b,
                roughness: 0.9,
                metalness: 0.05
            }),
            carpetGold: new THREE.MeshStandardMaterial({
                color: 0xb45309,
                roughness: 0.9,
                metalness: 0.05
            }),
            carpetTeal: new THREE.MeshStandardMaterial({
                color: 0x0f766e,
                roughness: 0.9,
                metalness: 0.05
            }),
            carpetTrim: new THREE.MeshStandardMaterial({
                color: 0xd97706,
                roughness: 0.7,
                metalness: 0.3
            }),
            catwalk: new THREE.MeshStandardMaterial({
                color: 0x1e293b,
                roughness: 0.35,
                metalness: 0.85
            }),
            catwalkRailing: new THREE.MeshStandardMaterial({
                color: 0xeab308,
                roughness: 0.4,
                metalness: 0.75
            }),
            elevatorPlatform: new THREE.MeshStandardMaterial({
                color: 0x0f172a,
                roughness: 0.4,
                metalness: 0.85
            }),
            elevatorPillar: new THREE.MeshStandardMaterial({
                color: 0x334155,
                roughness: 0.3,
                metalness: 0.9
            }),
            medicalWhite: new THREE.MeshStandardMaterial({
                color: 0xf8fafc,
                roughness: 0.25,
                metalness: 0.2
            }),
            hazardYellow: new THREE.MeshStandardMaterial({
                color: 0xfacc15,
                roughness: 0.35,
                metalness: 0.35
            }),
            toxicGreen: new THREE.MeshStandardMaterial({
                color: 0x10b981,
                emissive: 0x059669,
                emissiveIntensity: 0.6,
                roughness: 0.2,
                metalness: 0.5
            }),
            bioCyan: new THREE.MeshStandardMaterial({
                color: 0x06b6d4,
                emissive: 0x0891b2,
                emissiveIntensity: 0.6,
                transparent: true,
                opacity: 0.75
            }),
            darkMetal: new THREE.MeshStandardMaterial({
                color: 0x1e293b,
                roughness: 0.45,
                metalness: 0.8
            }),
            chromeSteel: new THREE.MeshStandardMaterial({
                color: 0xe2e8f0,
                roughness: 0.15,
                metalness: 0.95
            }),
            hazardRed: new THREE.MeshStandardMaterial({
                color: 0xdc2626,
                roughness: 0.35,
                metalness: 0.35
            })
        };
    }

    getObjectRotation(cx, rz) {
        if (!this.currentMissionData) return 0;
        const key = `${cx},${rz}`;
        if (this.currentMissionData.rotations) {
            const val = this.currentMissionData.rotations[key];
            if (val !== undefined && val !== null) {
                return (Number(val) * Math.PI) / 180;
            }
        }
        // Auto-orient fallback if rotation is not explicitly defined
        const map = this.currentMissionData.map;
        if (!Array.isArray(map) || !map[rz]) return 0;
        const ch = map[rz][cx];
        const H = map.length;
        const W = map[0].length;
        const tableChars = 't123456789o';
        const chairChars = 'c!%&*+-<>^';

        if (chairChars.includes(ch)) {
            if (rz + 1 < H && tableChars.includes(map[rz + 1][cx])) return 0;
            if (cx + 1 < W && tableChars.includes(map[rz][cx + 1])) return Math.PI / 2;
            if (rz - 1 >= 0 && tableChars.includes(map[rz - 1][cx])) return Math.PI;
            if (cx - 1 >= 0 && tableChars.includes(map[rz][cx - 1])) return (3 * Math.PI) / 2;
        }

        const nWall = rz > 0 && map[rz - 1][cx] === '#';
        const sWall = rz + 1 < H && map[rz + 1][cx] === '#';
        const wWall = cx > 0 && map[rz][cx - 1] === '#';
        const eWall = cx + 1 < W && map[rz][cx + 1] === '#';

        if (nWall && !sWall) return 0;
        if (sWall && !nWall) return Math.PI;
        if (wWall && !eWall) return Math.PI / 2;
        if (eWall && !wWall) return (3 * Math.PI) / 2;
        return 0;
    }

    applyObjectRotation(group, cx, rz) {
        if (!group) return;
        const rad = this.getObjectRotation(cx, rz);
        if (rad !== 0) {
            group.rotation.y = rad;
        }
    }

    // ========================================================================
    // CARREGA DE LA MISSIÓ I CREACIÓ DEL MÓN TÀCTIC
    // ========================================================================
    loadMission(mission) {
        this.currentMissionData = mission;
        this.bypassDoorPuzzles = !!(window.appState && window.appState.bypassDoorPuzzles);
        while (this.levelGroup.children.length > 0) {
            this.levelGroup.remove(this.levelGroup.children[0]);
        }

        this.crystals = [];
        this.chests = [];
        this.pushCrates = [];
        this.jumpPlatforms = [];
        this.enemies = [];
        this.cameras = [];
        this.lasers = [];
        this.switches = [];
        this.workstations = [];
        this.subDoors = [];
        this.pressurePlates = [];
        this.steamPipes = [];
        this.pits = [];
        this.lavas = [];
        this.torches = [];
        this.catwalks = [];
        this.ramps = [];
        this.elevators = [];
        this.wallColliders = [];
        this.burstParticles = [];
        this.electricArcs = [];
        this.turbineFans = [];
        this.gateInfo = null;
        this.nearGate = false;
        this.nearSwitch = null;
        this.nearWorkstation = null;
        this.nearDoor = null;
        this.nearElevator = null;
        this.furniture = [];
        this.debug3DVisible = false;
        this.debugOverlayGroup = null;
        this.isNeutralized = false;
        this.alertState = 'NORMAL';
        this.alertTimer = 0;
        if (this.bullets) {
            for (const b of this.bullets) {
                if (b.mesh) this.scene.remove(b.mesh);
            }
        }
        this.bullets = [];
        if (this.drones) {
            for (const d of this.drones) {
                if (d.group) this.scene.remove(d.group);
            }
        }
        this.drones = [];
        this.playerHealth = 100;
        this.maxPlayerHealth = 100;
        this.lastKnownPlayerPos = null;
        if (window.castleAudio) window.castleAudio.stopAlarmSiren();
        this.updateHealthUI();
        this.updateAlertUI();

        this.mapData = mission.map;
        this.gridH = this.mapData.length;
        this.gridW = this.mapData[0].length;

        const totalW = this.gridW * this.tileSize;
        const totalH = this.gridH * this.tileSize;

        // Main industrial steel floor
        const floorMesh = new THREE.Mesh(new THREE.PlaneGeometry(totalW, totalH), this.materials.floor);
        floorMesh.rotation.x = -Math.PI / 2;
        floorMesh.receiveShadow = true;
        this.levelGroup.add(floorMesh);

        // Cold base perimeter skirt
        const skirtMesh = new THREE.Mesh(
            new THREE.BoxGeometry(totalW + 2, 4, totalH + 2),
            new THREE.MeshBasicMaterial({ color: 0x03050a })
        );
        skirtMesh.position.y = -2.05;
        this.levelGroup.add(skirtMesh);

        const furnNames = {
            '$': 'Sofà de descans',
            't': 'Taula d\'oficina',
            'c': 'Cadira executiva',
            'b': 'Llibreria d\'arxius',
            'a': 'Armari metàl·lic',
            'p': 'Planta decorativa',
            'l': 'Làmpada de peu',
            'r': 'Catifa de sala',
            'q': 'Quadre d\'operacions',
            'w': 'Finestra panoràmica'
        };

        const GENERIC_PROP_NAMES = {
            // Taules & Escriptoris (9)
            '1': { name: 'Taula de reunions executiva', cat: 'Taules' },
            '2': { name: 'Taula de laboratori químic', cat: 'Taules' },
            '3': { name: 'Taula rodona de cafè', cat: 'Taules' },
            '4': { name: 'Escriptori tàctic d\'acer', cat: 'Taules' },
            '5': { name: 'Taula d\'autòpsia / mèdica', cat: 'Taules' },
            '6': { name: 'Taula de plànols d\'arquitectura', cat: 'Taules' },
            '7': { name: 'Banc de treball mecànic', cat: 'Taules' },
            '8': { name: 'Taula baixa de vidre modern', cat: 'Taules' },
            '9': { name: 'Taula de menjador militar', cat: 'Taules' },

            // Cadires & Seients (9)
            '!': { name: 'Tamboret giratori de laboratori', cat: 'Cadires' },
            '%': { name: 'Cadira de rodes clínica', cat: 'Cadires' },
            '&': { name: 'Butaca executiva reclinable', cat: 'Cadires' },
            '*': { name: 'Fila de seients d\'espera (triple)', cat: 'Cadires' },
            '+': { name: 'Cadira plegable de campanya', cat: 'Cadires' },
            '-': { name: 'Tamboret alt de control', cat: 'Cadires' },
            '<': { name: 'Puff tàctic d\'escuma', cat: 'Cadires' },
            '>': { name: 'Banc d\'exercici i peses', cat: 'Cadires' },
            '^': { name: 'Tamboret mèdic amb rodes', cat: 'Cadires' },

            // Emmagatzematge & Armaris (9)
            'd': { name: 'Armari blindat de fusells', cat: 'Armaris' },
            'e': { name: 'Caixa forta amb dial giratori', cat: 'Armaris' },
            'f': { name: 'Armari mèdic de primers auxilis', cat: 'Armaris' },
            'g': { name: 'Nevera criogènica de mostres', cat: 'Armaris' },
            'h': { name: 'Prestatgeria d\'arxius confidencials', cat: 'Armaris' },
            'i': { name: 'Arxivador metàl·lic de 4 calaixos', cat: 'Armaris' },
            'j': { name: 'Taquilles de vestuari militar', cat: 'Armaris' },
            'k': { name: 'Banc d\'eines amb panell perforat', cat: 'Armaris' },
            'm': { name: 'Contenidor estanc de residus tòxics', cat: 'Armaris' },

            // Tecnologia & Consoles (9)
            'n': { name: 'Superordinador mainframe amb cintes', cat: 'Consoles' },
            'o': { name: 'Taula d\'hologrames tàctics 3D', cat: 'Consoles' },
            's': { name: 'Torre de servidors blade amb LEDs', cat: 'Consoles' },
            'u': { name: 'Estació d\'anàlisi d\'ADN', cat: 'Consoles' },
            'v': { name: 'Panell de commutadors d\'alta tensió', cat: 'Consoles' },
            'x': { name: 'Monitor CRT amb oscil·loscopi', cat: 'Consoles' },
            'y': { name: 'Generador dièsel d\'emergència', cat: 'Consoles' },
            'z': { name: 'Estació de ràdio HF d\'ona curta', cat: 'Consoles' },
            '0': { name: 'Bateria industrial d\'ió-liti', cat: 'Consoles' },

            // Equipament Industrial (9)
            '?': { name: 'Tanc criogènic de vidre amb líquid', cat: 'Industrial' },
            '~': { name: 'Màquina expenedora de begudes', cat: 'Industrial' },
            '|': { name: 'Extintor d\'incendis pressuritzat', cat: 'Industrial' },
            ';': { name: 'Caixa de fusibles elèctrics', cat: 'Industrial' },
            ':': { name: 'Carretó mecànic d\'eines mòbil', cat: 'Industrial' },
            '"': { name: 'Dipòsit d\'oxigen comprimit', cat: 'Industrial' },
            '\'': { name: 'Calefactor radiant d\'infrarojos', cat: 'Industrial' },
            '/': { name: 'Transpaleta hidràulica manual', cat: 'Industrial' },
            '_': { name: 'Dipòsit d\'aigua destil·lada', cat: 'Industrial' },

            // Mèdic & Recerca (9)
            '[': { name: 'Llit d\'hospital articulat', cat: 'Mèdic' },
            ']': { name: 'Suport de sèrum intravenós', cat: 'Mèdic' },
            '{': { name: 'Llum scialítica quirúrgica', cat: 'Mèdic' },
            '}': { name: 'Escàner biomètric de retina', cat: 'Mèdic' },
            '=': { name: 'Incubadora de cultius biològics', cat: 'Mèdic' },
            '\\': { name: 'Centrifugadora de sang de taula', cat: 'Mèdic' },
            '§': { name: 'Bàscula de precisió mèdica', cat: 'Mèdic' },
            '°': { name: 'Campana d\'extracció de fums', cat: 'Mèdic' },
            '±': { name: 'Llitera plegable d\'urgències', cat: 'Mèdic' },

            // Decoració & Ambient (9)
            'µ': { name: 'Pissarra blanca tàctica', cat: 'Decoració' },
            '¶': { name: 'Màquina de cafè espresso', cat: 'Decoració' },
            '¿': { name: 'Paperera d\'acer inoxidable', cat: 'Decoració' },
            '¡': { name: 'Ventilador oscil·lant de peu', cat: 'Decoració' },
            '«': { name: 'Rellotge de paret militar GMT', cat: 'Decoració' },
            '»': { name: 'Mirall convex de seguretat', cat: 'Decoració' },
            '▲': { name: 'Palet amb sacs de sorra defensius', cat: 'Decoració' },
            '■': { name: 'Barrera retràctil d\'accessos', cat: 'Decoració' },
            '●': { name: 'Globus terraqüi estratègic', cat: 'Decoració' }
        };

        // Populate grid entities
        for (let rz = 0; rz < this.gridH; rz++) {
            const rowStr = this.mapData[rz];
            for (let cx = 0; cx < this.gridW; cx++) {
                const ch = rowStr[cx];
                const wx = this.gridToWorldX(cx);
                const wz = this.gridToWorldZ(rz);

                if (ch === '#') {
                    this.createWallBlock(wx, wz, cx, rz);
                } else if (ch === '(' || ch === ')' || ch === '{' || ch === '}' || ch === '@') {
                    this.createCurvedWallBlock(wx, wz, cx, rz, ch);
                } else if (ch === 'S') {
                    this.playerState.spawnX = wx;
                    this.playerState.spawnZ = wz;
                    this.playerState.x = wx;
                    this.playerState.y = 0;
                    this.playerState.z = wz;
                    this.playerState.vx = 0;
                    this.playerState.vz = 0;
                    this.playerState.vy = 0;
                    this.createInsertionPad(wx, wz);
                } else if (ch === 'G') {
                    this.createBlastDoor(wx, wz, cx, rz);
                } else if (ch === 'K') {
                    this.createPALDisc(wx, wz, this.crystals.length, cx, rz);
                } else if (ch === 'C') {
                    this.createSupplyCrate(wx, wz, this.chests.length, cx, rz);
                } else if (ch === 'B') {
                    this.createPushableShippingCrate(wx, wz, this.pushCrates.length, cx, rz);
                } else if (ch === 'O') {
                    this.createVentilationShaft(wx, wz);
                } else if (ch === 'L') {
                    this.createTeslaElectricGrid(wx, wz);
                } else if (ch === 'Z') {
                    this.createLaserBarrier(wx, wz, cx, rz);
                } else if (ch === 'U') {
                    this.createBreakerSwitch(wx, wz, cx, rz);
                } else if (ch === 'D') {
                    this.createSubSecurityDoor(wx, wz, cx, rz);
                } else if (ch === 'F') {
                    this.createFloorPressurePlate(wx, wz, cx, rz);
                } else if (ch === 'V') {
                    this.createSteamPipe(wx, wz);
                } else if (ch === 'T') {
                    this.createAlertBeacon(wx, wz);
                } else if (ch === 'P') {
                    this.createSteelIBeam(wx, wz);
                } else if (ch === 'E') {
                    this.createServerRack(wx, wz);
                } else if (ch === 'M') {
                    this.createRadarConsole(wx, wz);
                } else if (ch === 'A') {
                    this.createArmoryLocker(wx, wz);
                } else if (ch === 'W') {
                    this.createDecontaminationStation(wx, wz);
                } else if (ch === 'Q') {
                    this.createSecurityTerminal(wx, wz);
                } else if (ch === 'N') {
                    this.createCodecStation(wx, wz);
                } else if (ch === 'Y') {
                    this.createCommandDesk(wx, wz);
                } else if (ch === 'X') {
                    this.createBioPlant(wx, wz);
                } else if (ch === 'R') {
                    this.createWorkstationPC(wx, wz, cx, rz);
                } else if (ch === 'I') {
                    this.createTacticalWallScreen(wx, wz);
                } else if (ch === 'H') {
                    this.createIndustrialCeilingLamp(wx, wz);
                } else if (ch === 'J') {
                    this.createTacticalMapDisplay(wx, wz);
                } else if ('$tcbaplrqw'.includes(ch)) {
                    const furnIdx = this.furniture.length + 1;
                    this.furniture.push({
                        id: `FURN-${String(furnIdx).padStart(2, '0')}`,
                        ch,
                        name: furnNames[ch] || 'Element de Mobiliari',
                        cx,
                        rz,
                        wx,
                        wz
                    });
                    if (ch === '$') this.createSofa(wx, wz, cx, rz);
                    else if (ch === 't') this.createTable(wx, wz, cx, rz);
                    else if (ch === 'c') this.createChair(wx, wz, cx, rz);
                    else if (ch === 'b') this.createBookshelf(wx, wz, cx, rz);
                    else if (ch === 'a') this.createWardrobe(wx, wz, cx, rz);
                    else if (ch === 'p') this.createExoticPlant(wx, wz, cx, rz);
                    else if (ch === 'l') this.createFloorLamp(wx, wz, cx, rz);
                    else if (ch === 'r') this.createFloorCarpet(wx, wz, cx, rz);
                    else if (ch === 'q') this.createWallPainting(wx, wz, cx, rz);
                    else if (ch === 'w') this.createWindowWall(wx, wz, cx, rz);
                } else if (GENERIC_PROP_NAMES[ch]) {
                    const pDef = GENERIC_PROP_NAMES[ch];
                    const furnIdx = this.furniture.length + 1;
                    this.furniture.push({
                        id: `PROP-${String(furnIdx).padStart(2, '0')}`,
                        ch,
                        name: pDef.name,
                        cx,
                        rz,
                        wx,
                        wz
                    });
                    this.createGenericProp(ch, wx, wz, cx, rz);
                }
            }
        }

        // Pair each switch 1-to-1 with its closest laser barrier or security subdoor
        this.pairSwitchesWithTargets();

        this.createOperativeCharacter();

        // Spawn Genome Sentries with FOV cones
        if (mission.enemies) {
            mission.enemies.forEach((eCfg, idx) => {
                this.createGenomePatrolSentry(eCfg, idx);
            });
        }

        // Spawn CCTV Security Cameras
        if (mission.cameras) {
            mission.cameras.forEach((camCfg, idx) => {
                this.createSecurityCCTV(camCfg, idx);
            });
        }

        // Outdoor blizzard snow particles
        this.createSnowAtmosphere(totalW, totalH);

        // Center fixed planta camera (14º tilt) immediately on player spawn
        this.cameraFocusX = this.playerState.x;
        this.cameraFocusZ = this.playerState.z;
        this.cameraYaw = 0;
        this.targetCameraYaw = 0;
        const tiltRad = (14.0 * Math.PI) / 180;
        const camHeight = 20 * this.cameraZoom;
        const camOffsetZ = camHeight * Math.tan(tiltRad);
        this.camera.position.set(this.cameraFocusX, camHeight, this.cameraFocusZ + camOffsetZ);
        this.camera.lookAt(this.cameraFocusX, 0, this.cameraFocusZ);

        // Generate debug markers only on-demand if debug mode is active [F2]
        if (this.debug3DVisible) {
            this.generateDebug3DMarkers();
        }
    }

    gridToWorldX(cx) {
        return (cx - (this.gridW - 1) / 2) * this.tileSize;
    }

    gridToWorldZ(rz) {
        return (rz - (this.gridH - 1) / 2) * this.tileSize;
    }

    worldToGridX(wx) {
        return Math.round((wx / this.tileSize) + (this.gridW - 1) / 2);
    }

    worldToGridZ(wz) {
        return Math.round((wz / this.tileSize) + (this.gridH - 1) / 2);
    }

    getGridAreaName(cx, rz) {
        const thirdW = Math.max(1, this.gridW / 3);
        const thirdH = Math.max(1, this.gridH / 3);
        const colArea = cx < thirdW ? 'Oest' : (cx >= thirdW * 2 ? 'Est' : 'Central');
        const rowArea = rz < thirdH ? 'Nord' : (rz >= thirdH * 2 ? 'Sud' : 'Centre');

        if (rowArea === 'Nord' && colArea === 'Oest') return 'ÀREA-NO [Nord-Oest]';
        if (rowArea === 'Nord' && colArea === 'Central') return 'ÀREA-N [Nord Central]';
        if (rowArea === 'Nord' && colArea === 'Est') return 'ÀREA-NE [Nord-Est]';
        if (rowArea === 'Centre' && colArea === 'Oest') return 'ÀREA-O [Oest]';
        if (rowArea === 'Centre' && colArea === 'Central') return 'ÀREA-CORE [Nucli Central]';
        if (rowArea === 'Centre' && colArea === 'Est') return 'ÀREA-E [Est]';
        if (rowArea === 'Sud' && colArea === 'Oest') return 'ÀREA-SO [Sud-Oest · Inserció]';
        if (rowArea === 'Sud' && colArea === 'Central') return 'ÀREA-S [Sud Central]';
        if (rowArea === 'Sud' && colArea === 'Est') return 'ÀREA-SE [Sud-Est]';
        return `ÀREA [${cx},${rz}]`;
    }

    getGridAreaShort(cx, rz) {
        const thirdW = Math.max(1, this.gridW / 3);
        const thirdH = Math.max(1, this.gridH / 3);
        const col = cx < thirdW ? 'O' : (cx >= thirdW * 2 ? 'E' : 'C');
        const row = rz < thirdH ? 'N' : (rz >= thirdH * 2 ? 'S' : 'C');

        if (row === 'N' && col === 'O') return 'NO';
        if (row === 'N' && col === 'C') return 'N';
        if (row === 'N' && col === 'E') return 'NE';
        if (row === 'C' && col === 'O') return 'O';
        if (row === 'C' && col === 'C') return 'CORE';
        if (row === 'C' && col === 'E') return 'E';
        if (row === 'S' && col === 'O') return 'SO';
        if (row === 'S' && col === 'C') return 'S';
        if (row === 'S' && col === 'E') return 'SE';
        return 'SEC';
    }

    getTileTypeShortTag(ch) {
        const map = {
            '#': 'MUR',
            '(': 'MUR-B',
            ')': 'MUR-B',
            '{': 'MUR-B',
            '}': 'MUR-B',
            '@': 'COLUMNA',
            'S': 'SPAWN',
            'G': 'SORTIDA',
            'K': 'PAL',
            'C': 'MEDIKIT',
            'B': 'CAIXA',
            'Z': 'LÀSER',
            'U': 'DISJUNTOR',
            'D': 'PORTA',
            'F': 'PLACA',
            'R': 'PC',
            'O': 'CONDUCTE',
            'L': 'TESLA',
            '$': 'SOFÀ',
            't': 'TAULA',
            'c': 'CADIRA',
            'b': 'LLIBRES',
            'a': 'ARMARI',
            'p': 'PLANTA',
            'l': 'LLUM',
            'r': 'CATIFA',
            'q': 'QUADRE',
            'w': 'FINESTRA'
        };
        return map[ch] || ch;
    }

    buildDebugManifest() {
        const list = [];

        // 1. Punt d'Inserció Snake [S]
        const spawnGX = this.worldToGridX(this.playerState.spawnX);
        const spawnGZ = this.worldToGridZ(this.playerState.spawnZ);
        list.push({
            id: 'SPAWN-01',
            type: 'SPAWN',
            category: 'INTERACTIVE',
            badgeClass: 'badge-spawn',
            name: 'Punt d\'Inserció Snake [S]',
            gridX: spawnGX,
            gridZ: spawnGZ,
            coordStr: `C${String(spawnGX).padStart(2, '0')}:R${String(spawnGZ).padStart(2, '0')}`,
            area: this.getGridAreaName(spawnGX, spawnGZ),
            status: 'Operatiu (Zona Segura)',
            statusCode: 'ok',
            worldX: this.playerState.spawnX,
            worldZ: this.playerState.spawnZ
        });

        // 2. Comporta Blindada [G]
        if (this.gateInfo) {
            const gateGX = this.gateInfo.cx !== undefined ? this.gateInfo.cx : this.worldToGridX(this.gateInfo.x);
            const gateGZ = this.gateInfo.rz !== undefined ? this.gateInfo.rz : this.worldToGridZ(this.gateInfo.z);
            list.push({
                id: 'GATE-01',
                type: 'GATE',
                category: 'INTERACTIVE',
                badgeClass: 'badge-gate',
                name: 'Comporta Blindada de Sortida [G]',
                gridX: gateGX,
                gridZ: gateGZ,
                coordStr: `C${String(gateGX).padStart(2, '0')}:R${String(gateGZ).padStart(2, '0')}`,
                area: this.getGridAreaName(gateGX, gateGZ),
                status: this.gateInfo.isOpen ? '🟢 Desbloquejada (Oberta)' : '🔒 Bloquejada (Requereix PAL + Bypass)',
                statusCode: this.gateInfo.isOpen ? 'ok' : 'pending',
                worldX: this.gateInfo.x,
                worldZ: this.gateInfo.z
            });
        }

        // 3. Discs PAL [K]
        this.crystals.forEach((cr, i) => {
            const gx = cr.cx !== undefined ? cr.cx : this.worldToGridX(cr.x);
            const gz = cr.rz !== undefined ? cr.rz : this.worldToGridZ(cr.z);
            list.push({
                id: `PAL-${String(i + 1).padStart(2, '0')}`,
                type: 'PAL_DISC',
                category: 'PAL_DISC',
                badgeClass: 'badge-pal',
                name: `Disc PAL xifrat #${i + 1}`,
                gridX: gx,
                gridZ: gz,
                coordStr: `C${String(gx).padStart(2, '0')}:R${String(gz).padStart(2, '0')}`,
                area: this.getGridAreaName(gx, gz),
                status: cr.collected ? '✅ Recollit' : '⏳ Pendent de recollir',
                statusCode: cr.collected ? 'ok' : 'alert',
                worldX: cr.x,
                worldZ: cr.z
            });
        });

        // 4. Sentinelles Genome
        this.enemies.forEach((en, i) => {
            const gx = this.worldToGridX(en.x);
            const gz = this.worldToGridZ(en.z);
            list.push({
                id: `GUARD-${String(i + 1).padStart(2, '0')}`,
                type: 'GUARD',
                category: 'GUARD',
                badgeClass: 'badge-guard',
                name: `Sentinella Genome #${i + 1}`,
                gridX: gx,
                gridZ: gz,
                coordStr: `C${String(gx).padStart(2, '0')}:R${String(gz).padStart(2, '0')}`,
                area: this.getGridAreaName(gx, gz),
                status: en.aiState === 'CHASE' ? '🚨 Persecució activa' : (en.aiState === 'SEARCH' ? '⚠️ Investigant zona' : '🚶 Patrulla rutinària'),
                statusCode: en.aiState === 'CHASE' ? 'danger' : 'ok',
                worldX: en.x,
                worldZ: en.z
            });
        });

        // 5. Càmeres CCTV
        this.cameras.forEach((cam, i) => {
            const gx = cam.gridX !== undefined ? cam.gridX : this.worldToGridX(cam.x);
            const gz = cam.gridZ !== undefined ? cam.gridZ : this.worldToGridZ(cam.z);
            list.push({
                id: `CCTV-${String(i + 1).padStart(2, '0')}`,
                type: 'CCTV',
                category: 'CCTV',
                badgeClass: 'badge-cctv',
                name: `Càmera CCTV #${i + 1}`,
                gridX: gx,
                gridZ: gz,
                coordStr: `C${String(gx).padStart(2, '0')}:R${String(gz).padStart(2, '0')}`,
                area: this.getGridAreaName(gx, gz),
                status: cam.deactivated ? '🔴 Desactivada (Offline)' : '👁️ Feix de vigilància actiu',
                statusCode: cam.deactivated ? 'ok' : 'alert',
                worldX: cam.x,
                worldZ: cam.z
            });
        });

        // 6. Terminals PC [R]
        this.workstations.forEach((ws, i) => {
            const gx = ws.cx !== undefined ? ws.cx : this.worldToGridX(ws.x);
            const gz = ws.rz !== undefined ? ws.rz : this.worldToGridZ(ws.z);
            list.push({
                id: `PC-${String(i + 1).padStart(2, '0')}`,
                type: 'PC_TERMINAL',
                category: 'PC_TERMINAL',
                badgeClass: 'badge-pc',
                name: `Terminal PC #${i + 1} [R]`,
                gridX: gx,
                gridZ: gz,
                coordStr: `C${String(gx).padStart(2, '0')}:R${String(gz).padStart(2, '0')}`,
                area: this.getGridAreaName(gx, gz),
                status: ws.hacked ? '✅ Hackejat (+30s / CCTV Off)' : '💻 A punt de hackejar [E]',
                statusCode: ws.hacked ? 'ok' : 'pending',
                worldX: ws.x,
                worldZ: ws.z
            });
        });

        // 7. Barreres Làser [Z]
        this.lasers.forEach((ls, i) => {
            const gx = ls.cx !== undefined ? ls.cx : this.worldToGridX(ls.x);
            const gz = ls.rz !== undefined ? ls.rz : this.worldToGridZ(ls.z);
            const blocked = ls.isBlockedByCrate || !ls.active;
            list.push({
                id: `LASER-${String(i + 1).padStart(2, '0')}`,
                type: 'LASER',
                category: 'INTERACTIVE',
                badgeClass: 'badge-laser',
                name: `Barrera Làser #${i + 1} [Z]`,
                gridX: gx,
                gridZ: gz,
                coordStr: `C${String(gx).padStart(2, '0')}:R${String(gz).padStart(2, '0')}`,
                area: this.getGridAreaName(gx, gz),
                status: blocked ? '🟢 Inactiva / Bloquejada' : '⚡ Activa (Bloqueja el pas)',
                statusCode: blocked ? 'ok' : 'danger',
                worldX: ls.x,
                worldZ: ls.z
            });
        });

        // 8. Polsadors / Disjuntors [U]
        this.switches.forEach((sw, i) => {
            const gx = sw.cx !== undefined ? sw.cx : this.worldToGridX(sw.x);
            const gz = sw.rz !== undefined ? sw.rz : this.worldToGridZ(sw.z);
            list.push({
                id: `SWITCH-${String(i + 1).padStart(2, '0')}`,
                type: 'SWITCH',
                category: 'INTERACTIVE',
                badgeClass: 'badge-switch',
                name: `Disjuntor / Polsador #${i + 1} [U]`,
                gridX: gx,
                gridZ: gz,
                coordStr: `C${String(gx).padStart(2, '0')}:R${String(gz).padStart(2, '0')}`,
                area: this.getGridAreaName(gx, gz),
                status: sw.activated ? '✅ Premut (Circuits commutats)' : '🔘 Disponible [E]',
                statusCode: sw.activated ? 'ok' : 'pending',
                worldX: sw.x,
                worldZ: sw.z
            });
        });

        // 9. Portes Secundàries [D]
        this.subDoors.forEach((dr, i) => {
            const gx = dr.cx !== undefined ? dr.cx : this.worldToGridX(dr.x);
            const gz = dr.rz !== undefined ? dr.rz : this.worldToGridZ(dr.z);
            list.push({
                id: `DOOR-${String(i + 1).padStart(2, '0')}`,
                type: 'SUB_DOOR',
                category: 'INTERACTIVE',
                badgeClass: 'badge-door',
                name: `Porta Secundària #${i + 1} [D]`,
                gridX: gx,
                gridZ: gz,
                coordStr: `C${String(gx).padStart(2, '0')}:R${String(gz).padStart(2, '0')}`,
                area: this.getGridAreaName(gx, gz),
                status: dr.isOpen ? '🟢 Oberta' : '🔒 Tancada',
                statusCode: dr.isOpen ? 'ok' : 'pending',
                worldX: dr.x,
                worldZ: dr.z
            });
        });

        // 10. Contenidors que s'empenyen [B]
        this.pushCrates.forEach((pc, i) => {
            const gx = pc.cx !== undefined ? pc.cx : this.worldToGridX(pc.x);
            const gz = pc.rz !== undefined ? pc.rz : this.worldToGridZ(pc.z);
            list.push({
                id: `CRATE-${String(i + 1).padStart(2, '0')}`,
                type: 'PUSH_CRATE',
                category: 'INTERACTIVE',
                badgeClass: 'badge-crate',
                name: `Contenidor Metàl·lic #${i + 1} [B]`,
                gridX: gx,
                gridZ: gz,
                coordStr: `C${String(gx).padStart(2, '0')}:R${String(gz).padStart(2, '0')}`,
                area: this.getGridAreaName(gx, gz),
                status: pc.inHazard ? '📦 Encastat a obstacle' : '📦 Empenyible',
                statusCode: 'ok',
                worldX: pc.x,
                worldZ: pc.z
            });
        });

        // 11. Mobiliari
        this.furniture.forEach((fn) => {
            list.push({
                id: fn.id,
                type: 'FURNITURE',
                category: 'FURNITURE',
                badgeClass: 'badge-furn',
                name: `${fn.name} ['${fn.ch}']`,
                gridX: fn.cx,
                gridZ: fn.rz,
                coordStr: `C${String(fn.cx).padStart(2, '0')}:R${String(fn.rz).padStart(2, '0')}`,
                area: this.getGridAreaName(fn.cx, fn.rz),
                status: '🏛️ Element estàtic col·locat',
                statusCode: 'ok',
                worldX: fn.wx,
                worldZ: fn.wz
            });
        });

        return list;
    }

    createDebugFloorGridMesh() {
        const pxPerTile = 96;
        const canvasW = Math.min(2560, this.gridW * pxPerTile);
        const canvasH = Math.min(2560, this.gridH * pxPerTile);
        const tileW = canvasW / this.gridW;
        const tileH = canvasH / this.gridH;

        const canvas = document.createElement('canvas');
        canvas.width = canvasW;
        canvas.height = canvasH;
        const ctx = canvas.getContext('2d');

        for (let rz = 0; rz < this.gridH; rz++) {
            const rowStr = this.mapData[rz] || '';
            for (let cx = 0; cx < this.gridW; cx++) {
                const ch = rowStr[cx] || ' ';
                const tx = cx * tileW;
                const ty = rz * tileH;

                const isWall = '#(){}@'.includes(ch);

                // Semi-translucent tactical cell floor
                ctx.fillStyle = isWall ? 'rgba(15, 23, 42, 0.72)' : 'rgba(2, 6, 23, 0.52)';
                ctx.fillRect(tx + 1, ty + 1, tileW - 2, tileH - 2);

                // Glowing tile border
                ctx.strokeStyle = isWall ? 'rgba(100, 116, 139, 0.65)' : 'rgba(56, 189, 248, 0.6)';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(tx + 1, ty + 1, tileW - 2, tileH - 2);

                // Corner tech ticks
                ctx.strokeStyle = isWall ? 'rgba(148, 163, 184, 0.85)' : 'rgba(125, 211, 252, 0.9)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(tx + 3, ty + 10); ctx.lineTo(tx + 3, ty + 3); ctx.lineTo(tx + 10, ty + 3);
                ctx.moveTo(tx + tileW - 10, ty + tileH - 3); ctx.lineTo(tx + tileW - 3, ty + tileH - 3); ctx.lineTo(tx + tileW - 3, ty + tileH - 10);
                ctx.stroke();

                // High-visibility coordinate [Cxx:Ryy] - compact clean size
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.font = 'bold 18px "JetBrains Mono", monospace';
                ctx.shadowColor = '#000000';
                ctx.shadowBlur = 4;
                ctx.fillStyle = isWall ? '#94a3b8' : '#38bdf8';
                ctx.fillText(`C${String(cx).padStart(2, '0')}:R${String(rz).padStart(2, '0')}`, tx + tileW / 2, ty + 28);

                // Area short code
                const area = this.getGridAreaShort(cx, rz);
                ctx.font = 'bold 13px "JetBrains Mono", monospace';
                ctx.fillStyle = isWall ? '#cbd5e1' : '#facc15';
                ctx.fillText(`[${area}]`, tx + tileW / 2, ty + 48);

                // Tile entity/furniture tag if any
                if (ch !== ' ' && ch !== '.') {
                    const tag = this.getTileTypeShortTag(ch);
                    ctx.font = 'bold 12px "JetBrains Mono", monospace';
                    ctx.fillStyle = isWall ? '#e2e8f0' : '#4ade80';
                    ctx.fillText(tag, tx + tileW / 2, ty + 68);
                }
                ctx.shadowBlur = 0;
            }
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        const mat = new THREE.MeshBasicMaterial({
            map: tex,
            transparent: true,
            opacity: 0.95,
            depthWrite: false
        });
        const totalW = this.gridW * this.tileSize;
        const totalH = this.gridH * this.tileSize;
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(totalW, totalH), mat);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(0, 0.045, 0); // elevated slightly above carpets and floor
        return mesh;
    }

    generateDebug3DMarkers() {
        if (!this.debugOverlayGroup) {
            this.debugOverlayGroup = new THREE.Group();
            this.levelGroup.add(this.debugOverlayGroup);
        }

        while (this.debugOverlayGroup.children.length > 0) {
            this.debugOverlayGroup.remove(this.debugOverlayGroup.children[0]);
        }

        // 1. Grid blueprint plane on the floor with every cell coordinate
        const floorGrid = this.createDebugFloorGridMesh();
        this.debugOverlayGroup.add(floorGrid);

        // 2. Snake Dynamic Live Badge (elevated above head)
        const scx = this.worldToGridX(this.playerState.x);
        const srz = this.worldToGridZ(this.playerState.z);
        this.snakeDebugBadge = this.createDebugBadgeSprite('[SNAKE]', `C${String(scx).padStart(2, '0')}:R${String(srz).padStart(2, '0')}`, '#22c55e');
        this.snakeDebugBadge.position.set(this.playerState.x, 2.65, this.playerState.z);
        this.debugOverlayGroup.add(this.snakeDebugBadge);

        // 3. Sentinels Dynamic Live Badges (elevated above sentry helmet)
        if (this.enemies) {
            this.enemies.forEach((en, i) => {
                const gcx = this.worldToGridX(en.x);
                const grz = this.worldToGridZ(en.z);
                en.debugBadge = this.createDebugBadgeSprite(`[GUARD-${String(i + 1).padStart(2, '0')}]`, `C${String(gcx).padStart(2, '0')}:R${String(grz).padStart(2, '0')}`, '#f59e0b');
                en.debugBadge.position.set(en.x, 2.8, en.z);
                this.debugOverlayGroup.add(en.debugBadge);
            });
        }

        // 4. Mini-Drones Dynamic Live Badges
        if (this.drones) {
            this.drones.forEach((dr, i) => {
                const dgx = this.worldToGridX(dr.x);
                const dgz = this.worldToGridZ(dr.z);
                dr.debugBadge = this.createDebugBadgeSprite(`[DRONE-${String(i + 1).padStart(2, '0')}]`, `C${String(dgx).padStart(2, '0')}:R${String(dgz).padStart(2, '0')}`, '#f43f5e', true);
                dr.debugBadge.position.set(dr.x, (dr.y || 2.2) + 1.45, dr.z);
                this.debugOverlayGroup.add(dr.debugBadge);
            });
        }

        // 5. Pushable Crates Dynamic Live Badges
        if (this.pushCrates) {
            this.pushCrates.forEach((cr, i) => {
                const cgx = cr.cx !== undefined ? cr.cx : this.worldToGridX(cr.x);
                const cgz = cr.rz !== undefined ? cr.rz : this.worldToGridZ(cr.z);
                cr.debugBadge = this.createDebugBadgeSprite(`[CRATE-${String(i + 1).padStart(2, '0')}]`, `C${String(cgx).padStart(2, '0')}:R${String(cgz).padStart(2, '0')}`, '#cbd5e1', true);
                cr.debugBadge.position.set(cr.x, 2.5, cr.z);
                this.debugOverlayGroup.add(cr.debugBadge);
            });
        }

        // 6. Static Gameplay Items & Furniture with Ample Clearance Height
        const manifest = this.buildDebugManifest();
        const colorMap = {
            'PAL_DISC': '#38bdf8',
            'CCTV': '#0ea5e9',
            'PC_TERMINAL': '#10b981',
            'LASER': '#ef4444',
            'SWITCH': '#facc15',
            'SUB_DOOR': '#a855f7',
            'GATE': '#fde047',
            'SPAWN': '#22c55e',
            'PUSH_CRATE': '#cbd5e1'
        };

        manifest.forEach(item => {
            if (item.type === 'GUARD') return; // Handled dynamically above!
            if (item.type === 'PUSH_CRATE') return; // Handled dynamically above!

            const isFurn = item.category === 'FURNITURE';
            const color = isFurn ? '#fb7185' : (colorMap[item.type] || '#38bdf8');
            const sprite = this.createDebugBadgeSprite(item.id, isFurn ? item.name : item.coordStr, color, isFurn);

            // Generous vertical heights so badges sit cleanly above all models
            let y = 2.5;
            if (item.type === 'CCTV') y = 3.65;
            if (item.type === 'GATE') y = 3.85;
            if (item.type === 'SUB_DOOR') y = 3.35;
            if (item.type === 'SPAWN') y = 2.0;
            if (item.type === 'PAL_DISC') y = 2.65;
            if (item.type === 'PC_TERMINAL') y = 2.65;
            if (item.type === 'LASER') y = 2.55;
            if (item.type === 'SWITCH') y = 2.6;
            if (isFurn) {
                if (item.name.includes('Llibreria') || item.name.includes('Armari') || item.name.includes('Finestra') || item.name.includes('Quadre')) {
                    y = 3.15;
                } else if (item.name.includes('Làmpada')) {
                    y = 2.85;
                } else {
                    y = 2.35;
                }
            }

            sprite.position.set(item.worldX, y, item.worldZ);
            this.debugOverlayGroup.add(sprite);
        });

        this.debugOverlayGroup.visible = this.debug3DVisible;
    }

    createDebugBadgeSprite(idText, subText, colorHex = '#38bdf8', isSmall = false) {
        const canvas = document.createElement('canvas');
        canvas.width = isSmall ? 320 : 384;
        canvas.height = isSmall ? 104 : 128;
        const ctx = canvas.getContext('2d');
        this.drawDebugBadgeOnCanvas(canvas, ctx, idText, subText, colorHex, isSmall);

        const tex = new THREE.CanvasTexture(canvas);
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        const mat = new THREE.SpriteMaterial({
            map: tex,
            transparent: true,
            depthTest: false,
            depthWrite: false
        });
        const sprite = new THREE.Sprite(mat);
        sprite.renderOrder = 9999;
        sprite.scale.set(isSmall ? 2.3 : 2.9, isSmall ? 0.75 : 0.96, 1.0);
        sprite.userData = { canvas, ctx, idText, subText, colorHex, isSmall };
        return sprite;
    }

    updateDebugBadgeContent(sprite, idText, subText, colorHex) {
        if (!sprite || !sprite.userData || !sprite.userData.canvas) return;
        const { canvas, ctx, isSmall } = sprite.userData;
        const col = colorHex || sprite.userData.colorHex;
        this.drawDebugBadgeOnCanvas(canvas, ctx, idText, subText, col, isSmall);
        if (sprite.material && sprite.material.map) {
            sprite.material.map.needsUpdate = true;
        }
    }

    drawDebugBadgeOnCanvas(canvas, ctx, idText, subText, colorHex, isSmall) {
        const W = canvas.width;
        const H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        ctx.fillStyle = 'rgba(6, 11, 25, 0.96)';
        if (ctx.roundRect) {
            ctx.roundRect(4, 4, W - 8, H - 8, 14);
        } else {
            ctx.fillRect(4, 4, W - 8, H - 8);
        }
        ctx.fill();

        ctx.strokeStyle = colorHex;
        ctx.lineWidth = 4.5;
        ctx.shadowColor = colorHex;
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Title ID (Big and Bold)
        ctx.fillStyle = colorHex;
        ctx.font = isSmall ? '800 27px "JetBrains Mono", monospace' : '800 33px "JetBrains Mono", monospace';
        ctx.fillText(idText, W / 2, isSmall ? 36 : 44);

        // Subtitle (Coordinate / Name)
        ctx.fillStyle = '#ffffff';
        ctx.font = isSmall ? '800 21px "JetBrains Mono", monospace' : '800 25px "JetBrains Mono", monospace';
        ctx.fillText(subText, W / 2, isSmall ? 74 : 88);
    }

    toggleDebug3DMarkers() {
        this.debug3DVisible = !this.debug3DVisible;
        if (this.debug3DVisible && (!this.debugOverlayGroup || this.debugOverlayGroup.children.length === 0)) {
            this.generateDebug3DMarkers();
        }
        if (this.debugOverlayGroup) {
            this.debugOverlayGroup.visible = this.debug3DVisible;
        }
        return this.debug3DVisible;
    }

    // ========================================================================
    // CONSTRUCCIÓ D'ELEMENTS D'ESCENARI
    // ========================================================================
    createWallBlock(wx, wz, cx, rz) {
        const group = new THREE.Group();
        group.position.set(wx, 0, wz);

        const wallH = 2.2;
        const isPerimeter = (cx === 0 || cx === this.gridW - 1 || rz === 0 || rz === this.gridH - 1);
        const hasWindow = isPerimeter && (cx % 3 === 0 || rz % 3 === 0) && (cx > 1 && cx < this.gridW - 2) && (rz > 1 && rz < this.gridH - 2);

        if (hasWindow) {
            const lowerWall = new THREE.Mesh(new THREE.BoxGeometry(this.tileSize, 0.7, this.tileSize), this.materials.wall);
            lowerWall.position.y = 0.35;
            group.add(lowerWall);

            const glassMesh = new THREE.Mesh(new THREE.BoxGeometry(this.tileSize * 0.9, 1.0, 0.4), this.materials.wallWindow);
            glassMesh.position.y = 1.2;
            group.add(glassMesh);

            const upperWall = new THREE.Mesh(new THREE.BoxGeometry(this.tileSize, 0.5, this.tileSize), this.materials.wall);
            upperWall.position.y = 1.95;
            group.add(upperWall);
        } else {
            const wallMesh = new THREE.Mesh(new THREE.BoxGeometry(this.tileSize, wallH, this.tileSize), this.materials.wall);
            wallMesh.position.y = wallH / 2;
            wallMesh.castShadow = true;
            wallMesh.receiveShadow = true;
            group.add(wallMesh);

            const rim = new THREE.Mesh(new THREE.BoxGeometry(this.tileSize + 0.1, 0.18, this.tileSize + 0.1), this.materials.steelBeam);
            rim.position.y = wallH + 0.09;
            group.add(rim);

            // Overhead pipe running along the top
            const pipeGeo = new THREE.CylinderGeometry(0.08, 0.08, this.tileSize, 8);
            const pipe = new THREE.Mesh(pipeGeo, this.materials.steelBeam);
            pipe.rotation.z = Math.PI / 2;
            pipe.position.set(0, 1.85, 0.48);
            group.add(pipe);
        }

        this.levelGroup.add(group);
        this.wallColliders.push({ x: wx, z: wz, half: this.tileSize * 0.49, r: this.tileSize * 0.5, isBox: true, topY: wallH, isWall: true });
    }

    createCurvedWallBlock(wx, wz, cx, rz, curveType) {
        const group = new THREE.Group();
        group.position.set(wx, 0, wz);
        const wallH = 2.2;
        const R = this.tileSize * 0.49;

        if (curveType === '@') {
            // Bastió cilíndric blindat
            const colGeo = new THREE.CylinderGeometry(R, R, wallH, 24);
            const colMesh = new THREE.Mesh(colGeo, this.materials.wall);
            colMesh.position.y = wallH / 2;
            colMesh.castShadow = true;
            colMesh.receiveShadow = true;
            group.add(colMesh);

            const rimGeo = new THREE.CylinderGeometry(R + 0.06, R + 0.06, 0.18, 24);
            const rimMesh = new THREE.Mesh(rimGeo, this.materials.steelBeam);
            rimMesh.position.y = wallH + 0.09;
            group.add(rimMesh);

            this.levelGroup.add(group);
            this.wallColliders.push({ x: wx, z: wz, r: R, isWall: true, topY: wallH });
            return;
        }

        // Parets corbes en cantonada: '(', ')', '{', '}'
        let rotY = 0;
        if (curveType === '(') rotY = 0;
        else if (curveType === ')') rotY = -Math.PI / 2;
        else if (curveType === '}') rotY = Math.PI;
        else if (curveType === '{') rotY = Math.PI / 2;

        const arcGroup = new THREE.Group();
        arcGroup.rotation.y = rotY;

        const arcGeo = new THREE.CylinderGeometry(R, R, wallH, 16, 1, false, 0, Math.PI / 2);
        const arcMesh = new THREE.Mesh(arcGeo, this.materials.wall);
        arcMesh.position.set(-R * 0.42, wallH / 2, -R * 0.42);
        arcMesh.castShadow = true;
        arcMesh.receiveShadow = true;
        arcGroup.add(arcMesh);

        const coreGeo = new THREE.BoxGeometry(this.tileSize * 0.85, wallH, this.tileSize * 0.85);
        const coreMesh = new THREE.Mesh(coreGeo, this.materials.wall);
        coreMesh.position.y = wallH / 2;
        coreMesh.castShadow = true;
        arcGroup.add(coreMesh);

        const rimGeo = new THREE.CylinderGeometry(R + 0.06, R + 0.06, 0.18, 16, 1, false, 0, Math.PI / 2);
        const rimMesh = new THREE.Mesh(rimGeo, this.materials.steelBeam);
        rimMesh.position.set(-R * 0.42, wallH + 0.09, -R * 0.42);
        arcGroup.add(rimMesh);

        group.add(arcGroup);
        this.levelGroup.add(group);
        this.wallColliders.push({ x: wx, z: wz, half: this.tileSize * 0.49, r: R, isBox: true, isWall: true, topY: wallH });
    }

    pairSwitchesWithTargets() {
        // Agrupa segments de raigs làser contigus
        const laserGroups = [];
        const visitedLasers = new Set();

        for (let i = 0; i < this.lasers.length; i++) {
            if (visitedLasers.has(i)) continue;
            const grp = [this.lasers[i]];
            visitedLasers.add(i);

            let added = true;
            while (added) {
                added = false;
                for (let j = 0; j < this.lasers.length; j++) {
                    if (visitedLasers.has(j)) continue;
                    const cand = this.lasers[j];
                    const isAdjacent = grp.some(l => Math.abs(l.cx - cand.cx) + Math.abs(l.rz - cand.rz) === 1);
                    if (isAdjacent) {
                        grp.push(cand);
                        visitedLasers.add(j);
                        added = true;
                    }
                }
            }

            const avgX = grp.reduce((sum, l) => sum + l.x, 0) / grp.length;
            const avgZ = grp.reduce((sum, l) => sum + l.z, 0) / grp.length;
            laserGroups.push({
                id: laserGroups.length + 1,
                lasers: grp,
                x: avgX,
                z: avgZ
            });
        }

        // Objectius candidats: grups de làsers i sub-comportes 'D'
        const unassignedTargets = [
            ...laserGroups.map(lg => ({ type: 'laser', obj: lg, x: lg.x, z: lg.z })),
            ...this.subDoors.map((sd, idx) => ({ type: 'door', obj: sd, x: sd.x, z: sd.z, id: idx + 1 }))
        ];

        for (const sw of this.switches) {
            if (unassignedTargets.length === 0) break;

            let bestIdx = -1;
            let bestDist = Infinity;
            for (let t = 0; t < unassignedTargets.length; t++) {
                const target = unassignedTargets[t];
                const d = Math.hypot(sw.x - target.x, sw.z - target.z);
                if (d < bestDist) {
                    bestDist = d;
                    bestIdx = t;
                }
            }

            if (bestIdx !== -1) {
                const chosen = unassignedTargets.splice(bestIdx, 1)[0];
                sw.targetType = chosen.type;
                sw.target = chosen.obj;
                chosen.obj.assignedSwitch = sw;
                if (chosen.type === 'door') {
                    chosen.obj.isLockedBySwitch = true;
                }
            }
        }
    }

    createInsertionPad(wx, wz) {
        // Terra net sense taques circulars ni anelles blaves
    }

    createBlastDoor(wx, wz, cx, rz) {
        const gridCol = cx !== undefined ? cx : this.worldToGridX(wx);
        const gridRow = rz !== undefined ? rz : this.worldToGridZ(wz);
        const group = new THREE.Group();
        group.position.set(wx, 0, wz);

        const archGeo = new THREE.BoxGeometry(this.tileSize, 2.7, 0.7);
        const archMesh = new THREE.Mesh(archGeo, this.materials.steelBeam);
        archMesh.position.y = 1.35;
        archMesh.castShadow = true;
        group.add(archMesh);

        const leafGeo = new THREE.BoxGeometry(1.25, 2.3, 0.35);
        const leafL = new THREE.Mesh(leafGeo, new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 }));
        leafL.position.set(-0.62, 1.15, 0);
        group.add(leafL);

        const leafR = new THREE.Mesh(leafGeo, new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.3 }));
        leafR.position.set(0.62, 1.15, 0);
        group.add(leafR);

        const panelMesh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.75, 0.15), new THREE.MeshStandardMaterial({ color: 0x0284c7, emissive: 0x0284c7, emissiveIntensity: 0.5 }));
        panelMesh.position.set(0, 1.4, 0.45);
        group.add(panelMesh);

        const statusLight = new THREE.PointLight(0xf59e0b, 1.2, 5.5);
        statusLight.position.set(0, 1.8, 0.5);
        group.add(statusLight);

        const gateLabel = this.createFloatingTextSprite("🚪 SORTIDA [G]", "#f59e0b");
        gateLabel.position.set(0, 3.1, 0.4);
        group.add(gateLabel);

        this.levelGroup.add(group);

        this.gateInfo = {
            x: wx,
            z: wz,
            cx: gridCol,
            rz: gridRow,
            interactZ: wz + 1.2,
            group,
            leafL,
            leafR,
            panelMesh,
            statusLight,
            isOpen: !!this.bypassDoorPuzzles,
            openProgress: this.bypassDoorPuzzles ? 1.0 : 0,
            allCrystalsReady: !!this.bypassDoorPuzzles
        };

        if (this.bypassDoorPuzzles) {
            leafL.position.x = -0.62 - 1.05;
            leafR.position.x = 0.62 + 1.05;
            if (statusLight) statusLight.color.setHex(0x10b981);
        }

        this.wallColliders.push({ x: wx, z: wz, half: this.tileSize * 0.45, isBox: true, isGateCollider: true });
    }

    createPALDisc(wx, wz, idx, cx, rz) {
        const group = new THREE.Group();
        group.position.set(wx, 0.85, wz);

        const discGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.05, 20);
        const discMesh = new THREE.Mesh(discGeo, new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0369a1, emissiveIntensity: 0.9, roughness: 0.2, metalness: 0.95 }));
        discMesh.rotation.x = Math.PI / 4;
        group.add(discMesh);

        const ringGeo = new THREE.RingGeometry(0.45, 0.55, 18);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.75 });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2;
        group.add(ringMesh);

        // Vertical cyan light pillar reaching high into the air
        const beamGeo = new THREE.CylinderGeometry(0.12, 0.28, 4.0, 16, 1, true);
        const beamMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.32, side: THREE.DoubleSide });
        const beamMesh = new THREE.Mesh(beamGeo, beamMat);
        beamMesh.position.y = 1.9;
        group.add(beamMesh);

        // 3D Billboard label: "💾 DISC PAL"
        const labelSprite = this.createFloatingTextSprite("💾 DISC PAL", "#38bdf8");
        labelSprite.position.set(0, 1.45, 0);
        group.add(labelSprite);

        const light = new THREE.PointLight(0x38bdf8, 0.7, 2.5);
        light.position.y = 0.5;
        group.add(light);

        this.levelGroup.add(group);
        this.crystals.push({ mesh: group, x: wx, z: wz, cx, rz, collected: false, idx, light, discMesh, ringMesh, floorRingMesh: null, beamMesh });
    }

    createSupplyCrate(wx, wz, idx, cx, rz) {
        const group = new THREE.Group();
        group.position.set(wx, 0, wz);

        const boxGeo = new THREE.BoxGeometry(0.95, 0.7, 0.85);
        const boxMesh = new THREE.Mesh(boxGeo, this.materials.supplyBox);
        boxMesh.position.y = 0.35;
        boxMesh.castShadow = true;
        group.add(boxMesh);

        const crossGeo = new THREE.BoxGeometry(0.42, 0.1, 0.88);
        const crossMesh = new THREE.Mesh(crossGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
        crossMesh.position.y = 0.35;
        group.add(crossMesh);

        this.levelGroup.add(group);
        this.chests.push({ group, x: wx, z: wz, cx, rz, opened: false, idx });
        this.wallColliders.push({ x: wx, z: wz, half: 0.48, isBox: true, topY: 0.7 });
    }

    createPushableShippingCrate(wx, wz, idx, cx, rz) {
        const group = new THREE.Group();
        group.position.set(wx, 0, wz);

        const size = 1.35;
        const crateGeo = new THREE.BoxGeometry(size, size, size);
        const crateMesh = new THREE.Mesh(crateGeo, this.materials.crate);
        crateMesh.position.y = size / 2;
        crateMesh.castShadow = true;
        crateMesh.receiveShadow = true;
        group.add(crateMesh);

        this.levelGroup.add(group);

        const pushItem = { group, x: wx, z: wz, cx, rz, y: 0, size, half: size / 2, idx, inPit: false, inLava: false };
        this.pushCrates.push(pushItem);

        this.jumpPlatforms.push({ x: wx, z: wz, halfW: size / 2, halfD: size / 2, topY: size, refCrate: pushItem });
    }

    // ========================================================================
    // NOU: BARRERA DE RAIGS LÀSER DE SEGURETAT ('Z')
    // ========================================================================
    createLaserBarrier(wx, wz, cx, rz) {
        const group = new THREE.Group();
        group.position.set(wx, 0, wz);

        // Analyze adjacent tiles to adapt orientation and beam continuity
        const hasLeftZ = (cx > 0 && this.mapData[rz][cx - 1] === 'Z');
        const hasRightZ = (cx < this.gridW - 1 && this.mapData[rz][cx + 1] === 'Z');
        const hasUpZ = (rz > 0 && this.mapData[rz - 1][cx] === 'Z');
        const hasDownZ = (rz < this.gridH - 1 && this.mapData[rz + 1][cx] === 'Z');

        const hasLeftWall = (cx > 0 && this.mapData[rz][cx - 1] === '#');
        const hasRightWall = (cx < this.gridW - 1 && this.mapData[rz][cx + 1] === '#');
        const hasUpWall = (rz > 0 && this.mapData[rz - 1][cx] === '#');
        const hasDownWall = (rz < this.gridH - 1 && this.mapData[rz + 1][cx] === '#');

        // Determine orientation: vertical if aligned with North-South neighbors
        const isVertical = (hasUpZ || hasDownZ || (hasUpWall && hasDownWall && !hasLeftWall && !hasRightWall));

        const postGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.8, 12);

        if (isVertical) {
            // Laser beam runs North-South (along Z)
            const beamGeo = new THREE.CylinderGeometry(0.048, 0.048, this.tileSize * 1.05, 12);
            const beamMesh = new THREE.Mesh(beamGeo, this.materials.laserBeam);
            beamMesh.rotation.x = Math.PI / 2;
            beamMesh.position.y = 0.55;
            group.add(beamMesh);

            // Emit posts only on open ends (not connecting to another Z)
            if (!hasUpZ) {
                const postN = new THREE.Mesh(postGeo, this.materials.steelBeam);
                postN.position.set(0, 0.9, -this.tileSize * 0.48);
                group.add(postN);
            }
            if (!hasDownZ) {
                const postS = new THREE.Mesh(postGeo, this.materials.steelBeam);
                postS.position.set(0, 0.9, this.tileSize * 0.48);
                group.add(postS);
            }

            const light = new THREE.PointLight(0xef4444, 1.4, 4.8);
            light.position.set(0, 0.6, 0);
            group.add(light);

            this.levelGroup.add(group);

            this.lasers.push({
                group,
                beamMesh,
                light,
                x: wx,
                z: wz,
                cx,
                rz,
                isVertical: true,
                active: true,
                isBlockedByCrate: false
            });
        } else {
            // Laser beam runs East-West (along X)
            const beamGeo = new THREE.CylinderGeometry(0.048, 0.048, this.tileSize * 1.05, 12);
            const beamMesh = new THREE.Mesh(beamGeo, this.materials.laserBeam);
            beamMesh.rotation.z = Math.PI / 2;
            beamMesh.position.y = 0.55;
            group.add(beamMesh);

            // Emit posts only on open ends (not connecting to another Z)
            if (!hasLeftZ) {
                const postL = new THREE.Mesh(postGeo, this.materials.steelBeam);
                postL.position.set(-this.tileSize * 0.48, 0.9, 0);
                group.add(postL);
            }
            if (!hasRightZ) {
                const postR = new THREE.Mesh(postGeo, this.materials.steelBeam);
                postR.position.set(this.tileSize * 0.48, 0.9, 0);
                group.add(postR);
            }

            const light = new THREE.PointLight(0xef4444, 1.4, 4.8);
            light.position.set(0, 0.6, 0);
            group.add(light);

            this.levelGroup.add(group);

            this.lasers.push({
                group,
                beamMesh,
                light,
                x: wx,
                z: wz,
                cx,
                rz,
                isVertical: false,
                active: true,
                isBlockedByCrate: false
            });
        }
    }

    // ========================================================================
    // NOU: DISJUNTOR / INTERRUPTOR DE SEGURETAT INTERACTIU ('U')
    // ========================================================================
    createBreakerSwitch(wx, wz, cx, rz) {
        const group = new THREE.Group();
        group.position.set(wx, 0, wz);

        // Wall bracket
        const box = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.85, 0.35), this.materials.steelBeam);
        box.position.y = 1.1;
        group.add(box);

        // Mechanical flip lever
        const leverPivot = new THREE.Group();
        leverPivot.position.set(0, 1.1, 0.18);
        const leverHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.38, 8), new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.8 }));
        leverHandle.position.y = 0.18;
        leverPivot.add(leverHandle);
        leverPivot.rotation.x = -0.55; // Up = active
        group.add(leverPivot);

        // Status indicator LED (Red = locked / Lasers ON, Green = unlocked / Lasers OFF)
        const led = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
        led.position.set(0, 1.45, 0.19);
        group.add(led);

        const light = new THREE.PointLight(0xef4444, 0.6, 2.5);
        light.position.set(0, 1.45, 0.3);
        group.add(light);

        const switchLabel = this.createFloatingTextSprite("⚡ POLSADOR [U]", "#fde047");
        switchLabel.position.set(0, 1.95, 0.15);
        group.add(switchLabel);

        this.levelGroup.add(group);

        this.switches.push({
            group,
            leverPivot,
            led,
            light,
            x: wx,
            z: wz,
            cx,
            rz,
            activated: false
        });

        this.wallColliders.push({ x: wx, z: wz, half: 0.32, isBox: true, topY: 1.6 });
    }

    // ========================================================================
    // NOU: SUB-COMPORTA DE SEGURETAT SECUNDÀRIA ('D')
    // ========================================================================
    createSubSecurityDoor(wx, wz, cx, rz) {
        const group = new THREE.Group();
        group.position.set(wx, 0, wz);

        // Detect if wall runs vertically (North-South) or horizontally (East-West)
        const isWallLike = (c) => (c === '#' || c === 'w' || c === '(' || c === ')' || c === '{' || c === '}' || c === '@');
        const wallNorth = (rz > 0 && isWallLike(this.mapData[rz - 1][cx]));
        const wallSouth = (rz < this.gridH - 1 && isWallLike(this.mapData[rz + 1][cx]));
        const wallWest = (cx > 0 && isWallLike(this.mapData[rz][cx - 1]));
        const wallEast = (cx < this.gridW - 1 && isWallLike(this.mapData[rz][cx + 1]));

        let isVerticalWall = (wallNorth && wallSouth) || (!wallWest && !wallEast && (wallNorth || wallSouth));
        if (isVerticalWall) {
            group.rotation.y = Math.PI / 2;
        }

        // Reinforced industrial door frame with slide guides
        const frameMat = this.materials.steelBeam;
        const postL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.4, 0.44), frameMat);
        postL.position.set(-this.tileSize * 0.47, 1.2, 0);
        group.add(postL);

        const postR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.4, 0.44), frameMat);
        postR.position.set(this.tileSize * 0.47, 1.2, 0);
        group.add(postR);

        const lintel = new THREE.Mesh(new THREE.BoxGeometry(this.tileSize * 0.98, 0.28, 0.48), frameMat);
        lintel.position.set(0, 2.34, 0);
        group.add(lintel);

        // Status indicator LED (Red when locked, Green when unlocked)
        const ledMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const ledMesh = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.08, 0.5), ledMat);
        ledMesh.position.set(0, 2.22, 0);
        group.add(ledMesh);

        // Elevating sliding door panel
        const doorGeo = new THREE.BoxGeometry(this.tileSize * 0.92, 2.2, 0.28);
        const doorMesh = new THREE.Mesh(doorGeo, this.materials.subDoor);
        doorMesh.position.y = 1.1;
        doorMesh.castShadow = true;
        group.add(doorMesh);

        this.levelGroup.add(group);

        const subDoorItem = {
            id: `door_${cx}_${rz}`,
            doorIdx: this.subDoors.length,
            doorNumber: this.subDoors.length + 1,
            group,
            doorMesh,
            ledMesh,
            ledMat,
            x: wx,
            z: wz,
            cx,
            rz,
            isVerticalWall,
            isOpen: !!this.bypassDoorPuzzles,
            openProgress: this.bypassDoorPuzzles ? 1.0 : 0,
            logicUnlocked: !!this.bypassDoorPuzzles
        };

        if (this.bypassDoorPuzzles) {
            doorMesh.position.y = 3.3;
            if (ledMat) ledMat.color.setHex(0x10b981);
        }

        this.subDoors.push(subDoorItem);
        const halfX = isVerticalWall ? 0.35 : this.tileSize * 0.46;
        const halfZ = isVerticalWall ? this.tileSize * 0.46 : 0.35;
        this.wallColliders.push({
            x: wx,
            z: wz,
            half: this.tileSize * 0.45,
            halfX,
            halfZ,
            isBox: true,
            isSubDoorCollider: true,
            refSubDoor: subDoorItem
        });
    }

    // ========================================================================
    // NOU: PLACA DE PRESSIÓ AL TERRA ('F')
    // ========================================================================
    createFloorPressurePlate(wx, wz, cx, rz) {
        const group = new THREE.Group();
        group.position.set(wx, 0.02, wz);

        const plateGeo = new THREE.BoxGeometry(1.4, 0.08, 1.4);
        const plateMesh = new THREE.Mesh(plateGeo, this.materials.pressurePlateOff);
        plateMesh.receiveShadow = true;
        group.add(plateMesh);

        const ringGeo = new THREE.RingGeometry(0.85, 0.98, 20);
        const ringMesh = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide }));
        ringMesh.rotation.x = -Math.PI / 2;
        group.add(ringMesh);

        this.levelGroup.add(group);

        this.pressurePlates.push({
            group,
            plateMesh,
            ringMesh,
            x: wx,
            z: wz,
            cx,
            rz,
            isPressed: false
        });
    }

    // ========================================================================
    // NOU: CANONADA DE VAPOR D'ALTA PRESSIÓ ('V')
    // ========================================================================
    createSteamPipe(wx, wz) {
        const group = new THREE.Group();
        group.position.set(wx, 0, wz);

        const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 2.0, 12), this.materials.steelBeam);
        pipe.position.y = 1.0;
        group.add(pipe);

        const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 0.35, 12), this.materials.steelBeam);
        nozzle.rotation.x = Math.PI / 2;
        nozzle.position.set(0, 1.2, 0.25);
        group.add(nozzle);

        this.levelGroup.add(group);

        this.steamPipes.push({
            x: wx,
            z: wz,
            steamTimer: Math.random() * 3.5
        });

        this.wallColliders.push({ x: wx, z: wz, r: 0.35, topY: 2.0 });
    }

    // ========================================================================
    // PASSAREL·LA ELEVADA / CATWALK DE SEGONA PLANTA ('=') - Y = 2.0
    // ========================================================================
    createElevatedCatwalk(wx, wz, cx, rz) {
        const group = new THREE.Group();
        group.position.set(wx, 0, wz);

        // Platform deck at Y = 2.0
        const deckGeo = new THREE.BoxGeometry(this.tileSize * 0.98, 0.14, this.tileSize * 0.98);
        const deckMesh = new THREE.Mesh(deckGeo, this.materials.catwalk);
        deckMesh.position.y = 2.0;
        deckMesh.receiveShadow = true;
        deckMesh.castShadow = true;
        group.add(deckMesh);

        // Under-deck steel support pillars
        const pillarGeo = new THREE.BoxGeometry(0.14, 2.0, 0.14);
        const pMat = this.materials.steelBeam;
        const halfT = this.tileSize * 0.42;
        const p1 = new THREE.Mesh(pillarGeo, pMat); p1.position.set(-halfT, 1.0, -halfT); group.add(p1);
        const p2 = new THREE.Mesh(pillarGeo, pMat); p2.position.set(halfT, 1.0, -halfT); group.add(p2);
        const p3 = new THREE.Mesh(pillarGeo, pMat); p3.position.set(-halfT, 1.0, halfT); group.add(p3);
        const p4 = new THREE.Mesh(pillarGeo, pMat); p4.position.set(halfT, 1.0, halfT); group.add(p4);

        // Safety Railings along edges that don't connect to another catwalk '=' or ramp '/'
        const checkTile = (c, r) => {
            if (r < 0 || r >= this.gridH || c < 0 || c >= this.gridW) return false;
            const t = this.mapData[r][c];
            return t === '=' || t === '/' || t === '^';
        };

        const railMat = this.materials.catwalkRailing;
        // North
        if (!checkTile(cx, rz - 1)) {
            const rail = new THREE.Mesh(new THREE.BoxGeometry(this.tileSize * 0.98, 0.65, 0.08), railMat);
            rail.position.set(0, 2.38, -halfT);
            group.add(rail);
        }
        // South
        if (!checkTile(cx, rz + 1)) {
            const rail = new THREE.Mesh(new THREE.BoxGeometry(this.tileSize * 0.98, 0.65, 0.08), railMat);
            rail.position.set(0, 2.38, halfT);
            group.add(rail);
        }
        // West
        if (!checkTile(cx - 1, rz)) {
            const rail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.65, this.tileSize * 0.98), railMat);
            rail.position.set(-halfT, 2.38, 0);
            group.add(rail);
        }
        // East
        if (!checkTile(cx + 1, rz)) {
            const rail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.65, this.tileSize * 0.98), railMat);
            rail.position.set(halfT, 2.38, 0);
            group.add(rail);
        }

        this.levelGroup.add(group);
        this.catwalks.push({
            x: wx,
            z: wz,
            y: 2.0,
            half: this.tileSize * 0.5,
            cx,
            rz
        });
    }

    // ========================================================================
    // RAMPA D'ACCÉS INCLINADA ('/') - Connecta Y = 0 amb Y = 2.0
    // ========================================================================
    createAccessRamp(wx, wz, cx, rz) {
        const group = new THREE.Group();
        group.position.set(wx, 0, wz);

        // Auto-detect slope orientation based on neighboring catwalk '='
        let dir = 'N'; // slope up towards -Z
        if (rz > 0 && this.mapData[rz - 1] && this.mapData[rz - 1][cx] === '=') dir = 'N';
        else if (rz < this.gridH - 1 && this.mapData[rz + 1] && this.mapData[rz + 1][cx] === '=') dir = 'S';
        else if (cx > 0 && this.mapData[rz][cx - 1] === '=') dir = 'W';
        else if (cx < this.gridW - 1 && this.mapData[rz][cx + 1] === '=') dir = 'E';

        const rampGeo = new THREE.BoxGeometry(this.tileSize * 0.92, 0.12, Math.hypot(this.tileSize, 2.0));
        const rampMesh = new THREE.Mesh(rampGeo, this.materials.catwalk);
        rampMesh.position.y = 1.0;

        const slopeAngle = Math.atan2(2.0, this.tileSize);
        if (dir === 'N') {
            rampMesh.rotation.x = slopeAngle;
        } else if (dir === 'S') {
            rampMesh.rotation.x = -slopeAngle;
        } else if (dir === 'W') {
            rampMesh.rotation.z = -slopeAngle;
        } else {
            rampMesh.rotation.z = slopeAngle;
        }
        group.add(rampMesh);

        // Warning chevrons on ramp
        const stripeGeo = new THREE.BoxGeometry(this.tileSize * 0.85, 0.14, 0.25);
        const stripe1 = new THREE.Mesh(stripeGeo, this.materials.catwalkRailing);
        stripe1.position.set(0, 0.5, 0);
        if (dir === 'N' || dir === 'S') stripe1.rotation.x = rampMesh.rotation.x;
        else stripe1.rotation.z = rampMesh.rotation.z;
        group.add(stripe1);

        this.levelGroup.add(group);
        this.ramps.push({
            x: wx,
            z: wz,
            dir,
            half: this.tileSize * 0.5,
            cx,
            rz
        });
    }

    // ========================================================================
    // ASCENSOR HIDRÀULIC DE CÀRREGA ('^') - Mou de Y = 0 a Y = 2.0
    // ========================================================================
    createElevatorLift(wx, wz, cx, rz) {
        const group = new THREE.Group();
        group.position.set(wx, 0, wz);

        // 4 Vertical hydraulic guide columns from 0 to 3.8
        const colGeo = new THREE.BoxGeometry(0.18, 3.8, 0.18);
        const colMat = this.materials.elevatorPillar;
        const halfT = this.tileSize * 0.44;

        const c1 = new THREE.Mesh(colGeo, colMat); c1.position.set(-halfT, 1.9, -halfT); group.add(c1);
        const c2 = new THREE.Mesh(colGeo, colMat); c2.position.set(halfT, 1.9, -halfT); group.add(c2);
        const c3 = new THREE.Mesh(colGeo, colMat); c3.position.set(-halfT, 1.9, halfT); group.add(c3);
        const c4 = new THREE.Mesh(colGeo, colMat); c4.position.set(halfT, 1.9, halfT); group.add(c4);

        // Top cross-beam
        const beamGeo = new THREE.BoxGeometry(this.tileSize * 0.95, 0.18, 0.18);
        const b1 = new THREE.Mesh(beamGeo, colMat); b1.position.set(0, 3.75, -halfT); group.add(b1);
        const b2 = new THREE.Mesh(beamGeo, colMat); b2.position.set(0, 3.75, halfT); group.add(b2);

        // Elevator moving platform group
        const platformGroup = new THREE.Group();
        platformGroup.position.set(0, 0.05, 0);

        const platGeo = new THREE.BoxGeometry(this.tileSize * 0.88, 0.16, this.tileSize * 0.88);
        const platMesh = new THREE.Mesh(platGeo, this.materials.elevatorPlatform);
        platMesh.receiveShadow = true;
        platformGroup.add(platMesh);

        // Hazard border on lift platform
        const platRim = new THREE.Mesh(new THREE.BoxGeometry(this.tileSize * 0.92, 0.08, this.tileSize * 0.92), this.materials.catwalkRailing);
        platRim.position.y = 0.04;
        platformGroup.add(platRim);

        // Indicator Light on elevator platform
        const lightMesh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.14), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
        lightMesh.position.set(0, 0.2, -halfT + 0.15);
        platformGroup.add(lightMesh);

        group.add(platformGroup);
        this.levelGroup.add(group);

        this.elevators.push({
            group,
            platformGroup,
            lightMesh,
            x: wx,
            z: wz,
            y: 0.0,
            targetY: 0.0,
            moving: false,
            half: this.tileSize * 0.46,
            cx,
            rz
        });
    }

    // ========================================================================
    // REIXETA D'ALTA TENSIÓ AMB BOBINES TESLA I ARCS ELÈCTRICS ('L')
    // ========================================================================
    createTeslaElectricGrid(wx, wz) {
        const group = new THREE.Group();
        group.position.set(wx, 0.015, wz);

        const size = this.tileSize * 0.95;
        const gridMesh = new THREE.Mesh(new THREE.PlaneGeometry(size, size), this.materials.runwayStripes);
        gridMesh.rotation.x = -Math.PI / 2;
        group.add(gridMesh);

        // 4 Corner Tesla Coil Insulators
        const halfS = size * 0.44;
        const coilGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.55, 10);
        [
            [-halfS, -halfS], [halfS, -halfS],
            [-halfS, halfS], [halfS, halfS]
        ].forEach(([cx, cz]) => {
            const coil = new THREE.Mesh(coilGeo, this.materials.teslaCoil);
            coil.position.set(cx, 0.28, cz);
            group.add(coil);
        });

        const light = new THREE.PointLight(0x38bdf8, 1.1, 4.5);
        light.position.y = 0.4;
        group.add(light);

        // Animated electric arc line
        const arcPoints = [];
        for (let i = 0; i < 6; i++) {
            arcPoints.push(new THREE.Vector3((Math.random() - 0.5) * size, 0.15 + Math.random() * 0.2, (Math.random() - 0.5) * size));
        }
        const arcGeo = new THREE.BufferGeometry().setFromPoints(arcPoints);
        const arcMat = new THREE.LineBasicMaterial({ color: 0x67e8f9, linewidth: 2 });
        const arcLine = new THREE.Line(arcGeo, arcMat);
        group.add(arcLine);

        this.levelGroup.add(group);
        this.lavas.push({ x: wx, z: wz, r: size / 2, bridged: false, group, light, arcLine, size });
    }

    // ========================================================================
    // POU DE VENTILACIÓ PROFUND AMB TURBINA GIRATÒRIA ('O')
    // ========================================================================
    createVentilationShaft(wx, wz) {
        const group = new THREE.Group();
        group.position.set(wx, -0.05, wz);

        const r = 1.1;
        const pitMesh = new THREE.Mesh(new THREE.CircleGeometry(r, 24), new THREE.MeshBasicMaterial({ color: 0x020408 }));
        pitMesh.rotation.x = -Math.PI / 2;
        group.add(pitMesh);

        const rimMesh = new THREE.Mesh(new THREE.RingGeometry(r - 0.08, r + 0.15, 24), new THREE.MeshBasicMaterial({ color: 0xeab308, side: THREE.DoubleSide }));
        rimMesh.rotation.x = -Math.PI / 2;
        group.add(rimMesh);

        // Deep turbine fan visible down the shaft
        const fanGroup = new THREE.Group();
        fanGroup.position.set(0, -1.8, 0);
        for (let b = 0; b < 4; b++) {
            const blade = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.04, 0.22), this.materials.steelBeam);
            blade.rotation.y = (b * Math.PI) / 2;
            fanGroup.add(blade);
        }
        group.add(fanGroup);
        this.turbineFans.push(fanGroup);

        this.levelGroup.add(group);
        this.pits.push({ x: wx, z: wz, r, bridged: false, group, fanGroup });
    }

    createAlertBeacon(wx, wz) {
        const group = new THREE.Group();
        group.position.set(wx, 0, wz);

        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.8, 8), this.materials.steelBeam);
        pole.position.y = 0.9;
        group.add(pole);

        const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.3, 12), new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xdc2626, emissiveIntensity: 0.9 }));
        beacon.position.y = 1.95;
        group.add(beacon);

        const light = new THREE.PointLight(0xef4444, 0.85, 4.5);
        light.position.y = 2.05;
        group.add(light);

        this.levelGroup.add(group);
        this.torches.push({ group, light, beacon });
        this.wallColliders.push({ x: wx, z: wz, r: 0.25 });
    }

    createSteelIBeam(wx, wz) {
        const group = new THREE.Group();
        group.position.set(wx, 0, wz);

        const col = new THREE.Mesh(new THREE.BoxGeometry(0.65, 2.2, 0.65), this.materials.steelBeam);
        col.position.y = 1.1;
        col.castShadow = true;
        group.add(col);

        this.levelGroup.add(group);
        this.wallColliders.push({ x: wx, z: wz, half: 0.35, isBox: true, topY: 2.2 });
    }

    createServerRack(wx, wz) {
        const group = new THREE.Group();
        group.position.set(wx, 0, wz);

        const rack = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.0, 0.7), this.materials.serverRack);
        rack.position.y = 1.0;
        rack.castShadow = true;
        group.add(rack);

        const ledGeo = new THREE.PlaneGeometry(0.85, 1.4);
        const ledMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
        const leds = new THREE.Mesh(ledGeo, ledMat);
        leds.position.set(0, 1.0, 0.36);
        group.add(leds);

        this.levelGroup.add(group);
        this.wallColliders.push({ x: wx, z: wz, half: 0.55, isBox: true, topY: 2.0 });
    }

    createRadarConsole(wx, wz) {
        const group = new THREE.Group();
        group.position.set(wx, 0, wz);

        const desk = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.85, 0.9), this.materials.steelBeam);
        desk.position.y = 0.425;
        group.add(desk);

        const monitor = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.55, 0.1), new THREE.MeshBasicMaterial({ color: 0x10b981 }));
        monitor.position.set(0, 1.15, 0);
        monitor.rotation.x = -0.15;
        group.add(monitor);

        this.levelGroup.add(group);
        this.wallColliders.push({ x: wx, z: wz, half: 0.55, isBox: true, topY: 0.85 });
    }

    createArmoryLocker(wx, wz) {
        const group = new THREE.Group();
        group.position.set(wx, 0, wz);

        const locker = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.1, 0.65), this.materials.steelBeam);
        locker.position.y = 1.05;
        locker.castShadow = true;
        group.add(locker);

        this.levelGroup.add(group);
        this.wallColliders.push({ x: wx, z: wz, half: 0.45, isBox: true, topY: 2.1 });
    }

    createDecontaminationStation(wx, wz) {
        const group = new THREE.Group();
        group.position.set(wx, 0, wz);

        const frame = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 2.0, 12, 1, true), new THREE.MeshStandardMaterial({ color: 0x0284c7, transparent: true, opacity: 0.45, side: THREE.DoubleSide }));
        frame.position.y = 1.0;
        group.add(frame);

        this.levelGroup.add(group);
        this.wallColliders.push({ x: wx, z: wz, r: 0.65 });
    }

    createSecurityTerminal(wx, wz) {
        const group = new THREE.Group();
        group.position.set(wx, 0, wz);

        const post = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.1, 0.5), this.materials.steelBeam);
        post.position.y = 0.55;
        group.add(post);

        const screen = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.35, 0.05), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
        screen.position.set(0, 1.15, 0.26);
        group.add(screen);

        this.levelGroup.add(group);
        this.wallColliders.push({ x: wx, z: wz, r: 0.35 });
    }

    createCodecStation(wx, wz) {
        const group = new THREE.Group();
        group.position.set(wx, 0, wz);

        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 0.15, 16), this.materials.steelBeam);
        base.position.y = 0.075;
        group.add(base);

        const holo = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.6, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.35, side: THREE.DoubleSide }));
        holo.position.y = 0.95;
        group.add(holo);

        this.levelGroup.add(group);
    }

    createCommandDesk(wx, wz) {
        const group = new THREE.Group();
        group.position.set(wx, 0, wz);

        // Desk tabletop
        const top = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 0.85), this.materials.tableWood);
        top.position.y = 0.74;
        top.castShadow = true;
        group.add(top);

        // 4 Steel legs
        const legGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.7, 8);
        [[-0.6, 0.35, -0.35], [0.6, 0.35, -0.35], [-0.6, 0.35, 0.35], [0.6, 0.35, 0.35]].forEach(pos => {
            const leg = new THREE.Mesh(legGeo, this.materials.steelBeam);
            leg.position.set(pos[0], pos[1], pos[2]);
            group.add(leg);
        });

        // Office Swivel Chair
        const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.08, 0.46), this.materials.officeChair);
        chairSeat.position.set(0, 0.48, -0.65);
        group.add(chairSeat);

        const chairBack = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.45, 0.07), this.materials.officeChair);
        chairBack.position.set(0, 0.74, -0.86);
        group.add(chairBack);

        const chairStem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.44, 8), this.materials.steelBeam);
        chairStem.position.set(0, 0.22, -0.65);
        group.add(chairStem);

        // Documents and red tactical phone on desk
        const doc = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.02, 0.26), this.materials.paperDoc);
        doc.position.set(-0.35, 0.79, 0.1);
        doc.rotation.y = 0.15;
        group.add(doc);

        const phone = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.18), new THREE.MeshStandardMaterial({ color: 0xb91c1c }));
        phone.position.set(0.42, 0.84, -0.15);
        group.add(phone);

        this.levelGroup.add(group);
        this.wallColliders.push({ x: wx, z: wz, half: 0.58, isBox: true, topY: 0.82 });
        this.jumpPlatforms.push({ x: wx, z: wz, halfW: 0.7, halfD: 0.45, topY: 0.78 });
    }

    createBioPlant(wx, wz) {
        const group = new THREE.Group();
        group.position.set(wx, 0, wz);

        // Terracotta / Ceramic pot
        const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.24, 0.62, 12), this.materials.plantPot);
        pot.position.y = 0.31;
        pot.castShadow = true;
        group.add(pot);

        // Rich soil
        const soil = new THREE.Mesh(new THREE.CircleGeometry(0.32, 12), this.materials.soil);
        soil.rotation.x = -Math.PI / 2;
        soil.position.y = 0.61;
        group.add(soil);

        // Central stem
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.7, 8), this.materials.tableWood);
        stem.position.y = 0.85;
        group.add(stem);

        // Broad biological specimen leaves
        const leafGeo = new THREE.BoxGeometry(0.12, 0.015, 0.54);
        for (let i = 0; i < 6; i++) {
            const leaf = new THREE.Mesh(leafGeo, this.materials.plantLeaf);
            leaf.position.y = 0.95 + i * 0.05;
            leaf.rotation.y = (i * Math.PI) / 3;
            leaf.rotation.x = 0.35;
            group.add(leaf);
        }

        this.levelGroup.add(group);
        this.wallColliders.push({ x: wx, z: wz, r: 0.38 });
    }

    createWorkstationPC(wx, wz, cx, rz) {
        const group = new THREE.Group();
        group.position.set(wx, 0, wz);

        // Metal Computer Desk
        const desk = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.72, 0.8), this.materials.steelBeam);
        desk.position.y = 0.36;
        desk.castShadow = true;
        group.add(desk);

        // Dual Monitors
        // Left monitor (Cyan telemetry)
        const monLFrame = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.36, 0.05), this.materials.pcCase);
        monLFrame.position.set(-0.28, 0.96, -0.08);
        monLFrame.rotation.y = 0.2;
        group.add(monLFrame);

        const monLScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.31), this.materials.screenCyan);
        monLScreen.position.set(-0.28, 0.96, -0.05);
        monLScreen.rotation.y = 0.2;
        group.add(monLScreen);

        // Right monitor (Green radar / data scan)
        const monRFrame = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.36, 0.05), this.materials.pcCase);
        monRFrame.position.set(0.28, 0.96, -0.08);
        monRFrame.rotation.y = -0.2;
        group.add(monRFrame);

        const monRScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.31), this.materials.screenGreen);
        monRScreen.position.set(0.28, 0.96, -0.05);
        monRScreen.rotation.y = -0.2;
        group.add(monRScreen);

        // Keyboard & Mouse
        const kb = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.02, 0.16), this.materials.officeChair);
        kb.position.set(0, 0.73, 0.18);
        group.add(kb);

        const mouse = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.09), this.materials.officeChair);
        mouse.position.set(0.26, 0.73, 0.18);
        group.add(mouse);

        // PC Tower under desk with glowing power LED
        const tower = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.48, 0.52), this.materials.pcCase);
        tower.position.set(0.48, 0.24, 0);
        group.add(tower);

        const pwrLed = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), this.materials.screenGreen);
        pwrLed.position.set(0.48, 0.42, 0.27);
        group.add(pwrLed);

        // Floating holographic terminal marker above workstation
        const holoGroup = new THREE.Group();
        holoGroup.position.set(0, 1.48, 0);

        const holoGeo = new THREE.OctahedronGeometry(0.18, 0);
        const holoMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true });
        const holoMesh = new THREE.Mesh(holoGeo, holoMat);
        holoGroup.add(holoMesh);

        const holoRing = new THREE.Mesh(new THREE.RingGeometry(0.22, 0.26, 16), new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide }));
        holoRing.rotation.x = Math.PI / 2;
        holoGroup.add(holoRing);

        group.add(holoGroup);

        const pcGlow = new THREE.PointLight(0x38bdf8, 0.45, 1.8);
        pcGlow.position.set(0, 1.1, 0.2);
        group.add(pcGlow);

        this.applyObjectRotation(group, cx, rz);
        this.levelGroup.add(group);
        this.wallColliders.push({ x: wx, z: wz, half: 0.58, isBox: true, topY: 0.75 });
        this.jumpPlatforms.push({ x: wx, z: wz, halfW: 0.68, halfD: 0.4, topY: 0.72 });

        this.workstations.push({
            group,
            x: wx,
            z: wz,
            cx,
            rz,
            hacked: false,
            monLScreen,
            monRScreen,
            pwrLed,
            pcGlow,
            holoGroup,
            holoMesh
        });
    }

    hackSecurityWorkstation(ws) {
        if (!ws || ws.hacked) return;
        ws.hacked = true;

        // Visual feedback on monitors & holographic marker
        ws.monLScreen.material = this.materials.screenGreen;
        ws.monRScreen.material = this.materials.screenGreen;
        ws.pwrLed.material = this.materials.screenGreen;
        if (ws.pcGlow) ws.pcGlow.color.setHex(0x10b981);
        if (ws.holoGroup) ws.holoGroup.visible = false;

        // Sound effect
        if (window.castleAudio) {
            window.castleAudio.playSwitchToggle();
            window.castleAudio.playKeyPickup();
        }

        // Deactivate all CCTV cameras in current sector
        let deactivatedCount = 0;
        for (const cam of this.cameras) {
            cam.deactivated = true;
            if (cam.coneMesh) cam.coneMesh.visible = false;
            if (cam.alertMesh) cam.alertMesh.visible = false;
            if (cam.lensMesh) {
                cam.lensMesh.material = new THREE.MeshBasicMaterial({ color: 0x1e293b });
            }
            if (cam.cameraPivot) {
                cam.cameraPivot.rotation.x = 0.95; // Droop camera head down
            }
            this.spawnBurstParticles(cam.x, cam.z, 0x38bdf8);
            deactivatedCount++;
        }

        // Grant 30s bonus time on mission timer
        if (window.applyTimeBonus) {
            window.applyTimeBonus(30, 'CCTV Hackeada');
        }

        // Spawn cyber green burst particles around terminal
        this.spawnBurstParticles(ws.x, ws.z, 0x10b981);

        const toastMsg = deactivatedCount > 0
            ? `💻 TERMINAL HACKEAT! S'han desactivat ${deactivatedCount} càmeres CCTV del sector i guanyes +30s de temps!`
            : `💻 TERMINAL HACKEAT! Xarxa de seguretat sota control (+30s de temps).`;

        if (window.showCastleToast) {
            window.showCastleToast(toastMsg);
        }

        if (this.callbacks.onCamerasDeactivated) {
            this.callbacks.onCamerasDeactivated(deactivatedCount);
        }
    }

    createTacticalWallScreen(wx, wz) {
        const group = new THREE.Group();
        group.position.set(wx, 0, wz);

        // Heavy Floor Stand
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.8, 8), this.materials.steelBeam);
        pole.position.y = 0.9;
        group.add(pole);

        // 65-inch Tactical Flat Panel
        const frame = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.95, 0.1), this.materials.pcCase);
        frame.position.y = 1.6;
        group.add(frame);

        const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.85), this.materials.screenCyan);
        screen.position.set(0, 1.6, 0.06);
        group.add(screen);

        const glow = new THREE.PointLight(0x38bdf8, 0.75, 4.0);
        glow.position.set(0, 1.6, 0.35);
        group.add(glow);

        this.levelGroup.add(group);
        this.wallColliders.push({ x: wx, z: wz, half: 0.45, isBox: true, topY: 1.8 });
    }

    createIndustrialCeilingLamp(wx, wz) {
        const group = new THREE.Group();
        group.position.set(wx, 0, wz);

        // Hanging cable from facility rafters
        const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.1, 6), this.materials.steelBeam);
        cable.position.y = 2.1;
        group.add(cable);

        // Industrial enamel dome hood
        const hood = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.42, 0.28, 12, 1, true), this.materials.lampHood);
        hood.position.y = 1.55;
        group.add(hood);

        // Glowing halogen bulb
        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 10), this.materials.lampWarm);
        bulb.position.y = 1.5;
        group.add(bulb);

        // Downward warm illumination pool
        const light = new THREE.PointLight(0xfef08a, 1.15, 6.5);
        light.position.y = 1.45;
        group.add(light);

        this.levelGroup.add(group);
        // No floor collision so Snake walks right under the hanging light!
    }

    createTacticalMapDisplay(wx, wz) {
        const group = new THREE.Group();
        group.position.set(wx, 0, wz);

        const stand = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.6, 0.12), this.materials.steelBeam);
        stand.position.y = 1.1;
        group.add(stand);

        const board = new THREE.Mesh(new THREE.PlaneGeometry(1.18, 1.35), this.materials.screenAmber);
        board.position.set(0, 1.1, 0.07);
        group.add(board);

        this.levelGroup.add(group);
        this.wallColliders.push({ x: wx, z: wz, half: 0.45, isBox: true, topY: 1.6 });
    }

    // ========================================================================
    // MOBILIARI I DECORACIÓ TÀCTICA D'INTERIOR (DIVERSITAT, PROPORCIÓ I REALISME)
    // ========================================================================
    createSofa(wx, wz, cx, rz) {
        const group = new THREE.Group();
        group.position.set(wx, 0, wz);

        const style = Math.abs(cx * 3 + rz * 7) % 4;
        const colorIdx = Math.abs(cx * 5 + rz * 11) % 5;
        const colorPalette = [
            this.materials.leatherCognac,
            this.materials.leatherNavy,
            this.materials.leatherBurgundy,
            this.materials.leatherEmerald,
            this.materials.leatherCharcoal
        ];
        const mat = colorPalette[colorIdx];

        if (style === 0) {
            // Gran Sofà 3 Places Executiu
            const seat = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.26, 0.76), mat);
            seat.position.y = 0.24;
            seat.castShadow = true;
            group.add(seat);

            [-0.48, 0, 0.48].forEach(xOff => {
                const bCush = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.44, 0.16), mat);
                bCush.position.set(xOff, 0.54, -0.28);
                group.add(bCush);
            });

            const armL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.36, 0.78), mat);
            armL.position.set(-0.76, 0.36, 0);
            group.add(armL);
            const armR = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.36, 0.78), mat);
            armR.position.set(0.76, 0.36, 0);
            group.add(armR);

            // Contrast throw pillows
            const pillowMat = (colorIdx % 2 === 0) ? this.materials.fabricCream : this.materials.carpetGold;
            const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 0.1), pillowMat);
            p1.position.set(-0.55, 0.38, -0.15);
            p1.rotation.y = 0.35;
            group.add(p1);
            const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 0.1), pillowMat);
            p2.position.set(0.55, 0.38, -0.15);
            p2.rotation.y = -0.35;
            group.add(p2);

            // Walnut plinth base
            const base = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.08, 0.74), this.materials.woodWalnut);
            base.position.y = 0.04;
            group.add(base);

        } else if (style === 1) {
            // Sofà Modular en "L" (Chaise Longue)
            const mainSeat = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.26, 0.72), mat);
            mainSeat.position.set(-0.15, 0.24, 0);
            group.add(mainSeat);

            const chaise = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.26, 0.65), mat);
            chaise.position.set(0.48, 0.24, 0.45);
            group.add(chaise);

            const backMain = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.42, 0.16), mat);
            backMain.position.set(-0.15, 0.52, -0.28);
            group.add(backMain);

            const armL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.36, 0.74), mat);
            armL.position.set(-0.84, 0.36, 0);
            group.add(armL);

            const legGeo = new THREE.CylinderGeometry(0.025, 0.02, 0.12, 8);
            [[-0.75, 0.06, -0.3], [0.75, 0.06, -0.3], [-0.75, 0.06, 0.3], [0.75, 0.06, 0.7]].forEach(p => {
                const leg = new THREE.Mesh(legGeo, this.materials.steelBeam);
                leg.position.set(p[0], p[1], p[2]);
                group.add(leg);
            });

        } else if (style === 2) {
            // Loveseat Contemporani 2 Places
            const seat = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.24, 0.68), mat);
            seat.position.y = 0.24;
            group.add(seat);

            const back = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.44, 0.14), mat);
            back.position.set(0, 0.52, -0.26);
            group.add(back);

            const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.66, 12), mat);
            armL.rotation.x = Math.PI / 2;
            armL.position.set(-0.62, 0.36, 0);
            group.add(armL);
            const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.66, 12), mat);
            armR.rotation.x = Math.PI / 2;
            armR.position.set(0.62, 0.36, 0);
            group.add(armR);

            const legMat = this.materials.brassGold;
            const legGeo = new THREE.CylinderGeometry(0.02, 0.015, 0.14, 8);
            [[-0.5, 0.07, -0.25], [0.5, 0.07, -0.25], [-0.5, 0.07, 0.25], [0.5, 0.07, 0.25]].forEach(p => {
                const leg = new THREE.Mesh(legGeo, legMat);
                leg.position.set(p[0], p[1], p[2]);
                group.add(leg);
            });

        } else {
            // Parell de Butaques Club Chesterfield
            [-0.48, 0.48].forEach((xOff, idx) => {
                const seat = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.24, 0.64), mat);
                seat.position.set(xOff, 0.24, 0);
                group.add(seat);

                const back = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.42, 0.16), mat);
                back.position.set(xOff, 0.52, -0.24);
                group.add(back);

                const arm1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.34, 0.64), mat);
                arm1.position.set(xOff - 0.32, 0.34, 0);
                group.add(arm1);
                const arm2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.34, 0.64), mat);
                arm2.position.set(xOff + 0.32, 0.34, 0);
                group.add(arm2);
            });

            // Petite center beverage table
            const sTab = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.38, 12), this.materials.woodWalnut);
            sTab.position.set(0, 0.19, -0.05);
            group.add(sTab);

            const sCup = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, 0.08, 8), this.materials.fabricCream);
            sCup.position.set(0, 0.42, -0.05);
            group.add(sCup);
        }

        this.applyObjectRotation(group, cx, rz);
        this.levelGroup.add(group);
        this.wallColliders.push({ x: wx, z: wz, half: 0.55, isBox: true, topY: 0.78 });
    }

    createTable(wx, wz, cx, rz) {
        const group = new THREE.Group();
        group.position.set(wx, 0, wz);

        const style = Math.abs(cx * 5 + rz * 3) % 4;

        if (style === 0) {
            // Taula de Juntes / Conferències (Executive Conference Table)
            const topW = 1.6;
            const topD = 0.9;
            const topH = 0.74;
            const topMat = (cx % 2 === 0) ? this.materials.marbleWhite : this.materials.woodWalnut;
            const top = new THREE.Mesh(new THREE.BoxGeometry(topW, 0.06, topD), topMat);
            top.position.y = topH;
            top.castShadow = true;
            group.add(top);

            const baseGeo = new THREE.CylinderGeometry(0.05, 0.08, topH, 12);
            [-0.45, 0.45].forEach(xPos => {
                const pLeg = new THREE.Mesh(baseGeo, this.materials.steelBeam);
                pLeg.position.set(xPos, topH / 2, 0);
                group.add(pLeg);

                const foot = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.65), this.materials.steelBeam);
                foot.position.set(xPos, 0.02, 0);
                group.add(foot);
            });

            const doc = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.02, 0.25), this.materials.paperDoc);
            doc.position.set(-0.35, topH + 0.04, 0.1);
            doc.rotation.y = 0.15;
            group.add(doc);

            const tablet = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.015, 0.16), this.materials.pcCase);
            tablet.position.set(0.35, topH + 0.04, -0.1);
            tablet.rotation.y = -0.2;
            group.add(tablet);

            const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.09, 10), this.materials.fabricCream);
            mug.position.set(0.05, topH + 0.05, 0.22);
            group.add(mug);

        } else if (style === 1) {
            // Despatx de Direcció (Presidential Desk with Laptop)
            const topW = 1.45;
            const topD = 0.8;
            const topH = 0.75;
            const deskMat = this.materials.woodMahogany;

            const top = new THREE.Mesh(new THREE.BoxGeometry(topW, 0.06, topD), deskMat);
            top.position.y = topH;
            top.castShadow = true;
            group.add(top);

            [-0.52, 0.52].forEach(xPos => {
                const pedestal = new THREE.Mesh(new THREE.BoxGeometry(0.36, topH - 0.06, topD * 0.9), this.materials.woodWalnut);
                pedestal.position.set(xPos, (topH - 0.06) / 2, 0);
                group.add(pedestal);

                [0.2, 0.42, 0.62].forEach(yPos => {
                    const pull = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.02), this.materials.brassGold);
                    pull.position.set(xPos, yPos, topD * 0.45 + 0.01);
                    group.add(pull);
                });
            });

            const laptopBase = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.015, 0.22), this.materials.steelBeam);
            laptopBase.position.set(0, topH + 0.04, 0);
            group.add(laptopBase);

            const laptopScreen = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.22, 0.015), this.materials.steelBeam);
            laptopScreen.position.set(0, topH + 0.14, -0.11);
            laptopScreen.rotation.x = 0.18;
            group.add(laptopScreen);

            const screenGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.29, 0.18), this.materials.screenCyan);
            screenGlow.position.set(0, topH + 0.14, -0.10);
            screenGlow.rotation.x = 0.18;
            group.add(screenGlow);

            const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.03, 10), this.materials.brassGold);
            lampBase.position.set(0.45, topH + 0.04, -0.22);
            group.add(lampBase);

            const bankerShade = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.16, 8), this.materials.plantLeaf);
            bankerShade.rotation.z = Math.PI / 2;
            bankerShade.position.set(0.45, topH + 0.22, -0.22);
            group.add(bankerShade);

        } else if (style === 2) {
            // Taula Baixa de Saló (Living Room Coffee Table)
            const topW = 1.35;
            const topD = 0.72;
            const topH = 0.46;
            const glassMat = (cx % 2 === 0) ? this.materials.glassSmoked : this.materials.woodAsh;

            const top = new THREE.Mesh(new THREE.BoxGeometry(topW, 0.05, topD), glassMat);
            top.position.y = topH;
            group.add(top);

            const legGeo = new THREE.CylinderGeometry(0.03, 0.018, topH, 8);
            const hW = topW * 0.42;
            const hD = topD * 0.4;
            [[-hW, topH / 2, -hD], [hW, topH / 2, -hD], [-hW, topH / 2, hD], [hW, topH / 2, hD]].forEach(p => {
                const leg = new THREE.Mesh(legGeo, this.materials.woodOak);
                leg.position.set(p[0], p[1], p[2]);
                group.add(leg);
            });

            const mag1 = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.015, 0.22), this.materials.paperDoc);
            mag1.position.set(-0.25, topH + 0.035, 0);
            mag1.rotation.y = 0.12;
            group.add(mag1);

            const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.06, 0.06, 12), this.materials.brassGold);
            bowl.position.set(0.28, topH + 0.05, 0);
            group.add(bowl);

        } else {
            // Taula Rodona de Cafè / Conversa
            const radius = 0.65;
            const topH = 0.72;
            const top = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.05, 24), this.materials.woodMahogany);
            top.position.y = topH;
            group.add(top);

            const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, topH, 12), this.materials.brassGold);
            stem.position.y = topH / 2;
            group.add(stem);

            const baseFoot = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.38, 0.04, 20), this.materials.brassGold);
            baseFoot.position.y = 0.02;
            group.add(baseFoot);

            const cup1 = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.08, 10), this.materials.fabricCream);
            cup1.position.set(-0.2, topH + 0.05, -0.1);
            group.add(cup1);
            const cup2 = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.08, 10), this.materials.fabricCream);
            cup2.position.set(0.18, topH + 0.05, 0.15);
            group.add(cup2);
        }

        this.applyObjectRotation(group, cx, rz);
        this.levelGroup.add(group);
        this.wallColliders.push({ x: wx, z: wz, half: 0.52, isBox: true, topY: 0.85 });
    }

    createChair(wx, wz, cx, rz) {
        const group = new THREE.Group();
        group.position.set(wx, 0, wz);

        const style = Math.abs(cx * 7 + rz * 3) % 3;

        if (style === 0) {
            // Cadira Ergonòmica de Direcció
            const seat = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.09, 0.5), this.materials.officeChair);
            seat.position.y = 0.48;
            group.add(seat);

            const back = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.52, 0.06), this.materials.officeChair);
            back.position.set(0, 0.78, -0.22);
            group.add(back);

            const headrest = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.14, 0.05), this.materials.officeChair);
            headrest.position.set(0, 1.1, -0.22);
            group.add(headrest);

            [-0.28, 0.28].forEach(xPos => {
                const arm = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.22, 0.32), this.materials.steelBeam);
                arm.position.set(xPos, 0.62, 0);
                group.add(arm);
            });

            const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.44, 8), this.materials.steelBeam);
            stem.position.y = 0.22;
            group.add(stem);

            const baseStar = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.28, 0.04, 5), this.materials.steelBeam);
            baseStar.position.y = 0.02;
            group.add(baseStar);

        } else if (style === 1) {
            // Butaca de Cuir Clàssica
            const mat = (cx % 2 === 0) ? this.materials.leatherCognac : this.materials.leatherBurgundy;
            const seat = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.22, 0.62), mat);
            seat.position.y = 0.24;
            group.add(seat);

            const back = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.42, 0.14), mat);
            back.position.set(0, 0.54, -0.24);
            group.add(back);

            const armL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.34, 0.62), mat);
            armL.position.set(-0.34, 0.36, 0);
            group.add(armL);
            const armR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.34, 0.62), mat);
            armR.position.set(0.34, 0.36, 0);
            group.add(armR);

            const legGeo = new THREE.CylinderGeometry(0.025, 0.02, 0.14, 8);
            [[-0.26, 0.07, -0.24], [0.26, 0.07, -0.24], [-0.26, 0.07, 0.24], [0.26, 0.07, 0.24]].forEach(p => {
                const leg = new THREE.Mesh(legGeo, this.materials.woodMahogany);
                leg.position.set(p[0], p[1], p[2]);
                group.add(leg);
            });

        } else {
            // Cadira Escandinava de Disseny
            const shellMat = this.materials.fabricCream;
            const seat = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.06, 0.46), shellMat);
            seat.position.y = 0.45;
            group.add(seat);

            const back = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.42, 0.05), shellMat);
            back.position.set(0, 0.68, -0.2);
            group.add(back);

            const legGeo = new THREE.CylinderGeometry(0.025, 0.015, 0.44, 8);
            [[-0.2, 0.22, -0.18], [0.2, 0.22, -0.18], [-0.2, 0.22, 0.18], [0.2, 0.22, 0.18]].forEach(p => {
                const leg = new THREE.Mesh(legGeo, this.materials.woodAsh);
                leg.position.set(p[0], p[1], p[2]);
                leg.rotation.z = (p[0] < 0 ? 0.08 : -0.08);
                group.add(leg);
            });
        }

        this.applyObjectRotation(group, cx, rz);
        this.levelGroup.add(group);
        this.wallColliders.push({ x: wx, z: wz, half: 0.36, isBox: true, topY: 0.72 });
    }

    createBookshelf(wx, wz, cx, rz) {
        const group = new THREE.Group();
        group.position.set(wx, 0, wz);

        const style = Math.abs(cx * 3 + rz * 5) % 3;
        const w = 1.45;
        const h = 2.15;
        const d = 0.44;

        if (style === 0) {
            // Gran Biblioteca de Fusta Massissa
            const woodMat = this.materials.woodMahogany;

            const back = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.04), woodMat);
            back.position.set(0, h / 2, -d / 2 + 0.02);
            group.add(back);

            const sideL = new THREE.Mesh(new THREE.BoxGeometry(0.06, h, d), woodMat);
            sideL.position.set(-w / 2 + 0.03, h / 2, 0);
            group.add(sideL);

            const sideR = new THREE.Mesh(new THREE.BoxGeometry(0.06, h, d), woodMat);
            sideR.position.set(w / 2 - 0.03, h / 2, 0);
            group.add(sideR);

            const cornice = new THREE.Mesh(new THREE.BoxGeometry(w + 0.08, 0.1, d + 0.06), this.materials.woodWalnut);
            cornice.position.set(0, h - 0.05, 0);
            group.add(cornice);

            const bot = new THREE.Mesh(new THREE.BoxGeometry(w, 0.08, d), woodMat);
            bot.position.set(0, 0.04, 0);
            group.add(bot);

            [0.52, 1.02, 1.54].forEach(sy => {
                const sh = new THREE.Mesh(new THREE.BoxGeometry(w - 0.12, 0.04, d - 0.04), woodMat);
                sh.position.set(0, sy, 0);
                group.add(sh);
            });

            const bookColors = [0x991b1b, 0x1e3a8a, 0x166534, 0xd97706, 0x09090b, 0xd6d3d1, 0x6b21a8, 0x0e7490, 0xb45309, 0x047857];
            [0.08, 0.56, 1.06, 1.58].forEach((sy) => {
                let curX = -w / 2 + 0.12;
                const endX = w / 2 - 0.12;
                while (curX < endX - 0.06) {
                    const bThick = 0.035 + Math.random() * 0.03;
                    const bHeight = 0.28 + Math.random() * 0.09;
                    const bDepth = 0.24 + Math.random() * 0.04;
                    const col = bookColors[Math.floor(Math.random() * bookColors.length)];
                    const bMesh = new THREE.Mesh(new THREE.BoxGeometry(bThick, bHeight, bDepth), new THREE.MeshStandardMaterial({ color: col, roughness: 0.7 }));
                    bMesh.position.set(curX + bThick / 2, sy + bHeight / 2, -0.05);
                    if (Math.random() > 0.85) {
                        bMesh.rotation.z = (Math.random() - 0.5) * 0.25;
                    }
                    group.add(bMesh);
                    curX += bThick + 0.008;
                }
            });

        } else if (style === 1) {
            // Prestatgeria Escandinava Moderna
            const oakMat = this.materials.woodAsh;
            const sideL = new THREE.Mesh(new THREE.BoxGeometry(0.05, h, d), oakMat);
            sideL.position.set(-w / 2 + 0.025, h / 2, 0);
            group.add(sideL);
            const sideR = new THREE.Mesh(new THREE.BoxGeometry(0.05, h, d), oakMat);
            sideR.position.set(w / 2 - 0.025, h / 2, 0);
            group.add(sideR);

            [0.1, 0.6, 1.1, 1.6, 2.1].forEach(sy => {
                const sh = new THREE.Mesh(new THREE.BoxGeometry(w, 0.04, d), oakMat);
                sh.position.set(0, sy, 0);
                group.add(sh);
            });

            const vase = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.32, 12), this.materials.screenCyan);
            vase.position.set(0.35, 1.3, 0);
            group.add(vase);

            const storageBox = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.35, 0.36), this.materials.fabricCream);
            storageBox.position.set(-0.35, 0.3, 0);
            group.add(storageBox);

        } else {
            // Arxiu Militar d'Acer
            const steelMat = this.materials.steelBeam;
            const frame = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), steelMat);
            frame.position.y = h / 2;
            group.add(frame);

            [0.5, 1.0, 1.5].forEach((sy, idx) => {
                const binderBlock = new THREE.Mesh(new THREE.BoxGeometry(w * 0.85, 0.34, 0.32), this.materials.supplyBox);
                binderBlock.position.set(0, sy, 0.08);
                group.add(binderBlock);
            });
        }

        this.applyObjectRotation(group, cx, rz);
        this.levelGroup.add(group);
        this.wallColliders.push({ x: wx, z: wz, half: 0.48, isBox: true, isWall: true, topY: h });
    }

    createWardrobe(wx, wz, cx, rz) {
        const group = new THREE.Group();
        group.position.set(wx, 0, wz);

        const style = Math.abs(cx * 7 + rz * 5) % 3;
        const w = 1.35;
        const h = 2.15;
        const d = 0.58;

        if (style === 0) {
            // Armari Clàssic de Dues Portes
            const woodMat = this.materials.woodMahogany;
            const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), woodMat);
            body.position.y = h / 2;
            body.castShadow = true;
            group.add(body);

            const cornice = new THREE.Mesh(new THREE.BoxGeometry(w + 0.1, 0.12, d + 0.08), this.materials.woodWalnut);
            cornice.position.y = h + 0.06;
            group.add(cornice);

            [-w * 0.24, w * 0.24].forEach(xPos => {
                const door = new THREE.Mesh(new THREE.BoxGeometry(w * 0.44, h * 0.86, 0.03), this.materials.woodOak);
                door.position.set(xPos, h / 2, d / 2 + 0.015);
                group.add(door);
            });

            [-0.08, 0.08].forEach(xPos => {
                const handle = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.012, 8, 16), this.materials.brassGold);
                handle.position.set(xPos, h / 2, d / 2 + 0.04);
                group.add(handle);
            });

        } else if (style === 1) {
            // Taquilla Cuirassada / Armari Tecnològic
            const steelMat = this.materials.steelBeam;
            const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), steelMat);
            body.position.y = h / 2;
            group.add(body);

            const keypad = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.24, 0.03), this.materials.pcCase);
            keypad.position.set(0.15, 1.25, d / 2 + 0.02);
            group.add(keypad);

            const led = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 8), this.materials.screenGreen);
            led.position.set(0.15, 1.35, d / 2 + 0.04);
            group.add(led);

            for (let l = 0; l < 4; l++) {
                const louver = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.02, 0.01), this.materials.officeChair);
                louver.position.set(-0.25, 1.8 - l * 0.06, d / 2 + 0.015);
                group.add(louver);
            }

        } else {
            // Credença / Aparador Baix
            const lowH = 1.1;
            const body = new THREE.Mesh(new THREE.BoxGeometry(w, lowH, d), this.materials.woodWalnut);
            body.position.y = lowH / 2;
            group.add(body);

            const marbleTop = new THREE.Mesh(new THREE.BoxGeometry(w + 0.06, 0.04, d + 0.06), this.materials.marbleWhite);
            marbleTop.position.y = lowH + 0.02;
            group.add(marbleTop);

            const ornament = new THREE.Mesh(new THREE.DodecahedronGeometry(0.15, 0), this.materials.brassGold);
            ornament.position.set(0, lowH + 0.18, 0);
            group.add(ornament);
        }

        this.applyObjectRotation(group, cx, rz);
        this.levelGroup.add(group);
        this.wallColliders.push({ x: wx, z: wz, half: 0.52, isBox: true, topY: h });
    }

    createExoticPlant(wx, wz, cx, rz) {
        const group = new THREE.Group();
        group.position.set(wx, 0, wz);

        const species = Math.abs(cx * 3 + rz * 7) % 5;

        if (species === 0) {
            // Monstera Deliciosa
            const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.25, 0.54, 16), this.materials.plantPot);
            pot.position.y = 0.27;
            group.add(pot);

            const leafGeo = new THREE.BoxGeometry(0.32, 0.015, 0.62);
            for (let i = 0; i < 7; i++) {
                const leaf = new THREE.Mesh(leafGeo, this.materials.plantLeaf);
                leaf.position.y = 0.65 + i * 0.08;
                leaf.rotation.y = (i * Math.PI * 2) / 7;
                leaf.rotation.x = 0.45;
                group.add(leaf);
            }

        } else if (species === 1) {
            // Ficus Lyrata
            const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.24, 0.55, 16), this.materials.fabricCream);
            pot.position.y = 0.28;
            group.add(pot);

            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, 1.1, 8), this.materials.woodMahogany);
            trunk.position.y = 1.0;
            group.add(trunk);

            const folMat = this.materials.plantLeaf;
            const f1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.42, 1), folMat);
            f1.position.set(0, 1.55, 0);
            group.add(f1);

            const f2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.28, 1), folMat);
            f2.position.set(0.22, 1.35, 0.12);
            group.add(f2);

            const f3 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.26, 1), folMat);
            f3.position.set(-0.2, 1.4, -0.12);
            group.add(f3);

        } else if (species === 2) {
            // Anturi Vermell amb Flors
            const pot = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.48, 0.52), this.materials.officeChair);
            pot.position.y = 0.24;
            group.add(pot);

            const leafGeo = new THREE.BoxGeometry(0.2, 0.015, 0.48);
            for (let i = 0; i < 6; i++) {
                const leaf = new THREE.Mesh(leafGeo, this.materials.plantLeaf);
                leaf.position.y = 0.55 + i * 0.06;
                leaf.rotation.y = (i * Math.PI) / 3;
                leaf.rotation.x = 0.38;
                group.add(leaf);
            }

            const flowerMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
            for (let f = 0; f < 4; f++) {
                const blossom = new THREE.Mesh(new THREE.OctahedronGeometry(0.1, 0), flowerMat);
                blossom.position.set(Math.sin(f * 1.8) * 0.2, 0.95 + f * 0.08, Math.cos(f * 1.8) * 0.2);
                group.add(blossom);
            }

        } else if (species === 3) {
            // Sansevièria en Test de Llautó
            const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.22, 0.52, 16), this.materials.brassGold);
            pot.position.y = 0.26;
            group.add(pot);

            const spearGeo = new THREE.BoxGeometry(0.08, 0.85, 0.02);
            for (let s = 0; s < 8; s++) {
                const ang = (s * Math.PI * 2) / 8;
                const spear = new THREE.Mesh(spearGeo, this.materials.plantLeaf);
                spear.position.set(Math.sin(ang) * 0.12, 0.8 + (s % 3) * 0.08, Math.cos(ang) * 0.12);
                spear.rotation.y = ang;
                spear.rotation.x = 0.08;
                group.add(spear);
            }

        } else {
            // Palmera Areca
            const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.26, 0.58, 16), this.materials.woodWalnut);
            pot.position.y = 0.29;
            group.add(pot);

            const frondGeo = new THREE.BoxGeometry(0.18, 0.015, 0.72);
            for (let p = 0; p < 8; p++) {
                const frond = new THREE.Mesh(frondGeo, this.materials.plantLeaf);
                frond.position.y = 0.7 + p * 0.07;
                frond.rotation.y = (p * Math.PI * 2) / 8;
                frond.rotation.x = 0.42;
                group.add(frond);
            }
        }

        this.applyObjectRotation(group, cx, rz);
        this.levelGroup.add(group);
        this.wallColliders.push({ x: wx, z: wz, r: 0.36, topY: 1.4 });
    }

    createFloorLamp(wx, wz, cx, rz) {
        const group = new THREE.Group();
        group.position.set(wx, 0, wz);

        const style = Math.abs(cx * 3 + rz * 5) % 3;

        if (style === 0) {
            // Llantió Clàssic de Llautó
            const base = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.04, 16), this.materials.brassGold);
            base.position.y = 0.02;
            group.add(base);

            const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.75, 8), this.materials.brassGold);
            pole.position.y = 0.9;
            group.add(pole);

            const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.36, 0.38, 16, 1, true), this.materials.fabricCream);
            shade.position.y = 1.75;
            group.add(shade);

        } else if (style === 1) {
            // Llum d'Arc Modern Cromat
            const base = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.08, 0.38), this.materials.marbleWhite);
            base.position.y = 0.04;
            group.add(base);

            const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.8, 8), this.materials.steelBeam);
            stem.position.set(-0.25, 0.9, 0);
            group.add(stem);

            const globe = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), this.materials.fabricCream);
            globe.position.set(0.18, 1.85, 0);
            group.add(globe);

        } else {
            // Llum Trípode Nòrdic
            const legGeo = new THREE.CylinderGeometry(0.02, 0.015, 1.75, 8);
            [-0.18, 0.18].forEach(xP => {
                [-0.18, 0.18].forEach(zP => {
                    const tLeg = new THREE.Mesh(legGeo, this.materials.woodWalnut);
                    tLeg.position.set(xP, 0.88, zP);
                    tLeg.rotation.z = -xP * 0.15;
                    tLeg.rotation.x = zP * 0.15;
                    group.add(tLeg);
                });
            });

            const drumShade = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.34, 16, 1, true), this.materials.officeChair);
            drumShade.position.y = 1.72;
            group.add(drumShade);
        }

        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), this.materials.lampWarm);
        bulb.position.y = 1.75;
        group.add(bulb);

        const lampLight = new THREE.PointLight(0xfef08a, 1.5, 6.5);
        lampLight.position.set(0, 1.75, 0);
        group.add(lampLight);

        this.applyObjectRotation(group, cx, rz);
        this.levelGroup.add(group);
        this.wallColliders.push({ x: wx, z: wz, r: 0.25, topY: 1.8 });
    }

    createFloorCarpet(wx, wz, cx, rz) {
        const group = new THREE.Group();
        group.position.set(wx, 0.012, wz);

        const style = Math.abs(cx * 7 + rz * 3) % 4;
        let mat = this.materials.carpetRed;
        let trimMat = this.materials.carpetTrim;

        if (style === 1) {
            mat = this.materials.carpetTeal;
            trimMat = this.materials.fabricCream;
        } else if (style === 2) {
            mat = this.materials.carpetBlue;
            trimMat = this.materials.carpetTrim;
        } else if (style === 3) {
            mat = this.materials.carpetGold;
            trimMat = this.materials.woodMahogany;
        }

        const carpetMesh = new THREE.Mesh(new THREE.PlaneGeometry(this.tileSize * 1.05, this.tileSize * 1.05), mat);
        carpetMesh.rotation.x = -Math.PI / 2;
        carpetMesh.receiveShadow = true;
        group.add(carpetMesh);

        const trimMesh = new THREE.Mesh(new THREE.PlaneGeometry(this.tileSize * 0.92, this.tileSize * 0.92), trimMat);
        trimMesh.rotation.x = -Math.PI / 2;
        trimMesh.position.y = 0.001;
        group.add(trimMesh);

        const innerField = new THREE.Mesh(new THREE.PlaneGeometry(this.tileSize * 0.82, this.tileSize * 0.82), mat);
        innerField.rotation.x = -Math.PI / 2;
        innerField.position.y = 0.002;
        group.add(innerField);

        this.applyObjectRotation(group, cx, rz);
        this.levelGroup.add(group);
    }

    createWallPainting(wx, wz, cx, rz) {
        const group = new THREE.Group();
        group.position.set(wx, 0, wz);

        const frame = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.68, 0.06), this.materials.woodMahogany);
        frame.position.y = 1.45;
        group.add(frame);

        const artMat = (cx % 2 === 0) ? this.materials.screenCyan : this.materials.screenAmber;
        const canvas = new THREE.Mesh(new THREE.PlaneGeometry(0.88, 0.56), artMat);
        canvas.position.set(0, 1.45, 0.035);
        group.add(canvas);

        this.applyObjectRotation(group, cx, rz);
        this.levelGroup.add(group);
    }

    createWindowWall(wx, wz, cx, rz) {
        const group = new THREE.Group();
        group.position.set(wx, 0, wz);
        const wallH = 2.2;

        const lowerWall = new THREE.Mesh(new THREE.BoxGeometry(this.tileSize, 0.7, this.tileSize), this.materials.wall);
        lowerWall.position.y = 0.35;
        group.add(lowerWall);

        const glassMesh = new THREE.Mesh(new THREE.BoxGeometry(this.tileSize * 0.92, 1.0, 0.35), this.materials.wallWindow);
        glassMesh.position.y = 1.2;
        group.add(glassMesh);

        const upperWall = new THREE.Mesh(new THREE.BoxGeometry(this.tileSize, 0.5, this.tileSize), this.materials.wall);
        upperWall.position.y = 1.95;
        group.add(upperWall);

        const winLight = new THREE.PointLight(0x93c5fd, 0.9, 4.5);
        winLight.position.set(0, 1.25, 0);
        group.add(winLight);

        this.applyObjectRotation(group, cx, rz);
        this.levelGroup.add(group);
        this.wallColliders.push({ x: wx, z: wz, half: this.tileSize * 0.49, isBox: true, isWall: true, topY: wallH });
    }

    createGenericProp(ch, wx, wz, cx, rz) {
        const group = new THREE.Group();
        group.position.set(wx, 0, wz);
        let colliderHalf = 0.5;
        let isCollider = true;
        let topY = 0.8;

        // --- TAULES & ESCRIPTORIS ('1' - '9') ---
        if (ch === '1') {
            // Taula de reunions executiva (ovalada)
            const top = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.06, 24), this.materials.woodMahogany);
            top.scale.set(1.4, 1.0, 0.75);
            top.position.y = 0.74;
            group.add(top);
            [-0.6, 0.6].forEach(xp => {
                const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.74, 8), this.materials.chromeSteel || this.materials.steelBeam);
                leg.position.set(xp, 0.37, 0);
                group.add(leg);
            });
            colliderHalf = 0.65;
            topY = 0.78;
        } else if (ch === '2') {
            // Taula de laboratori químic
            const top = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.06, 0.8), this.materials.medicalWhite);
            top.position.y = 0.78;
            group.add(top);
            const frame = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.75, 0.75), this.materials.steelBeam);
            frame.position.y = 0.375;
            group.add(frame);
            const flask = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.18, 12), this.materials.toxicGreen);
            flask.position.set(0.2, 0.9, 0.1);
            group.add(flask);
            colliderHalf = 0.6;
            topY = 0.85;
        } else if (ch === '3') {
            // Taula rodona de cafè
            const top = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.04, 16), this.materials.woodOak);
            top.position.y = 0.55;
            group.add(top);
            const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.18, 0.55, 12), this.materials.steelBeam);
            ped.position.y = 0.275;
            group.add(ped);
            colliderHalf = 0.4;
            topY = 0.6;
        } else if (ch === '4') {
            // Escriptori tàctic d'acer
            const desk = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.08, 0.75), this.materials.darkMetal);
            desk.position.y = 0.74;
            group.add(desk);
            const drawer = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.6, 0.65), this.materials.steelBeam);
            drawer.position.set(0.42, 0.35, 0);
            group.add(drawer);
            const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.7, 0.65), this.materials.steelBeam);
            leg.position.set(-0.55, 0.35, 0);
            group.add(leg);
            colliderHalf = 0.6;
            topY = 0.8;
        } else if (ch === '5') {
            // Taula d'autòpsia / mèdica metàl·lica
            const top = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 0.68), this.materials.chromeSteel);
            top.position.y = 0.82;
            group.add(top);
            const sink = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 0.3), this.materials.darkMetal);
            sink.position.set(0.5, 0.82, 0);
            group.add(sink);
            const ped = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.78, 0.35), this.materials.steelBeam);
            ped.position.y = 0.39;
            group.add(ped);
            colliderHalf = 0.6;
            topY = 0.86;
        } else if (ch === '6') {
            // Taula de plànols d'arquitectura
            const board = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.04, 0.9), this.materials.woodAsh);
            board.position.set(0, 0.85, 0);
            board.rotation.x = 0.25;
            group.add(board);
            const legs = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.75, 0.6), this.materials.steelBeam);
            legs.position.y = 0.375;
            group.add(legs);
            colliderHalf = 0.6;
            topY = 0.95;
        } else if (ch === '7') {
            // Banc de treball mecànic
            const top = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.12, 0.75), this.materials.woodWalnut);
            top.position.y = 0.82;
            group.add(top);
            const clamp = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.15, 0.18), this.materials.steelBeam);
            clamp.position.set(-0.5, 0.94, 0.25);
            group.add(clamp);
            const legs = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.76, 0.65), this.materials.darkMetal);
            legs.position.y = 0.38;
            group.add(legs);
            colliderHalf = 0.6;
            topY = 0.95;
        } else if (ch === '8') {
            // Taula baixa de vidre modern
            const glass = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.04, 0.65), this.materials.glassSmoked);
            glass.position.y = 0.42;
            group.add(glass);
            const frame = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.38, 0.55), this.materials.chromeSteel);
            frame.position.y = 0.19;
            group.add(frame);
            colliderHalf = 0.5;
            topY = 0.46;
        } else if (ch === '9') {
            // Taula de menjador militar
            const top = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.06, 0.6), this.materials.woodOak);
            top.position.y = 0.72;
            group.add(top);
            const bench1 = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.04, 0.22), this.materials.woodOak);
            bench1.position.set(0, 0.42, 0.45);
            group.add(bench1);
            const bench2 = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.04, 0.22), this.materials.woodOak);
            bench2.position.set(0, 0.42, -0.45);
            group.add(bench2);
            colliderHalf = 0.65;
            topY = 0.76;
        }

        // --- CADIRES & SEIENTS ('!' - '^') ---
        else if (ch === '!') {
            // Tamboret giratori de laboratori
            const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.06, 16), this.materials.officeChair);
            seat.position.y = 0.52;
            group.add(seat);
            const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.48, 8), this.materials.chromeSteel);
            post.position.y = 0.24;
            group.add(post);
            colliderHalf = 0.32;
            topY = 0.56;
        } else if (ch === '%') {
            // Cadira de rodes clínica
            const seat = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.08, 0.5), this.materials.leatherNavy);
            seat.position.y = 0.5;
            group.add(seat);
            const back = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.48, 0.06), this.materials.leatherNavy);
            back.position.set(0, 0.76, -0.22);
            group.add(back);
            [-0.3, 0.3].forEach(xp => {
                const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.04, 16), this.materials.chromeSteel);
                wheel.rotation.z = Math.PI / 2;
                wheel.position.set(xp, 0.3, -0.05);
                group.add(wheel);
            });
            colliderHalf = 0.42;
            topY = 1.0;
        } else if (ch === '&') {
            // Butaca executiva reclinable
            const seat = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.16, 0.62), this.materials.leatherBurgundy);
            seat.position.y = 0.38;
            group.add(seat);
            const back = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.68, 0.14), this.materials.leatherBurgundy);
            back.position.set(0, 0.72, -0.24);
            group.add(back);
            const armL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.24, 0.58), this.materials.leatherBurgundy);
            armL.position.set(-0.35, 0.52, 0);
            group.add(armL);
            const armR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.24, 0.58), this.materials.leatherBurgundy);
            armR.position.set(0.35, 0.52, 0);
            group.add(armR);
            colliderHalf = 0.45;
            topY = 1.05;
        } else if (ch === '*') {
            // Fila de seients d'espera (triple)
            const rail = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.06, 0.06), this.materials.steelBeam);
            rail.position.y = 0.38;
            group.add(rail);
            [-0.42, 0, 0.42].forEach(xp => {
                const seat = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.04, 0.38), this.materials.chromeSteel);
                seat.position.set(xp, 0.42, 0);
                group.add(seat);
                const back = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.36, 0.03), this.materials.chromeSteel);
                back.position.set(xp, 0.62, -0.18);
                group.add(back);
            });
            colliderHalf = 0.65;
            topY = 0.8;
        } else if (ch === '+') {
            // Cadira plegable de campanya
            const seat = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.04, 0.42), this.materials.supplyBox);
            seat.position.y = 0.45;
            group.add(seat);
            const back = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.35, 0.03), this.materials.supplyBox);
            back.position.set(0, 0.7, -0.19);
            group.add(back);
            colliderHalf = 0.35;
            topY = 0.88;
        } else if (ch === '-') {
            // Tamboret alt de control
            const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.08, 16), this.materials.leatherCharcoal);
            seat.position.y = 0.82;
            group.add(seat);
            const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.78, 8), this.materials.chromeSteel);
            pole.position.y = 0.39;
            group.add(pole);
            const ring = new THREE.Mesh(new THREE.RingGeometry(0.18, 0.22, 16), this.materials.chromeSteel);
            ring.rotation.x = Math.PI / 2;
            ring.position.y = 0.3;
            group.add(ring);
            colliderHalf = 0.35;
            topY = 0.88;
        } else if (ch === '<') {
            // Puff tàctic d'escuma
            const puff = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.38, 0.36, 6), this.materials.leatherEmerald);
            puff.position.y = 0.18;
            group.add(puff);
            colliderHalf = 0.36;
            topY = 0.4;
        } else if (ch === '>') {
            // Banc d'exercici i peses
            const bench = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.36), this.materials.officeChair);
            bench.position.y = 0.45;
            group.add(bench);
            const rack = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.06), this.materials.steelBeam);
            rack.position.set(0, 0.45, -0.45);
            group.add(rack);
            colliderHalf = 0.5;
            topY = 0.9;
        } else if (ch === '^') {
            // Tamboret mèdic amb rodes
            const seat = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.06, 16), this.materials.medicalWhite);
            seat.position.y = 0.52;
            group.add(seat);
            const backRing = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.02, 8, 16, Math.PI), this.materials.chromeSteel);
            backRing.position.set(0, 0.75, -0.1);
            group.add(backRing);
            colliderHalf = 0.32;
            topY = 0.78;
        }

        // --- EMMAGATZEMATGE & ARMARIS ('d' - 'm') ---
        else if (ch === 'd') {
            // Armari blindat de fusells
            const cab = new THREE.Mesh(new THREE.BoxGeometry(1.15, 2.0, 0.48), this.materials.darkMetal);
            cab.position.y = 1.0;
            group.add(cab);
            const meshDoor = new THREE.Mesh(new THREE.BoxGeometry(1.05, 1.85, 0.04), this.materials.steelBeam);
            meshDoor.position.set(0, 1.0, 0.24);
            group.add(meshDoor);
            colliderHalf = 0.52;
            topY = 2.0;
        } else if (ch === 'e') {
            // Caixa forta amb dial giratori
            const safe = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.1, 0.75), this.materials.steelBeam);
            safe.position.y = 0.55;
            group.add(safe);
            const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.05, 16), this.materials.brassGold);
            dial.rotation.x = Math.PI / 2;
            dial.position.set(0, 0.65, 0.4);
            group.add(dial);
            colliderHalf = 0.45;
            topY = 1.15;
        } else if (ch === 'f') {
            // Armari mèdic de primers auxilis
            const med = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.3, 0.4), this.materials.medicalWhite);
            med.position.y = 1.1;
            group.add(med);
            const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.08, 0.02), this.materials.hazardRed);
            crossH.position.set(0, 1.1, 0.21);
            group.add(crossH);
            const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.28, 0.02), this.materials.hazardRed);
            crossV.position.set(0, 1.1, 0.21);
            group.add(crossV);
            colliderHalf = 0.42;
            topY = 1.75;
        } else if (ch === 'g') {
            // Nevera criogènica de mostres
            const frid = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.85, 0.75), this.materials.chromeSteel);
            frid.position.y = 0.925;
            group.add(frid);
            const disp = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.15), this.materials.screenCyan);
            disp.position.set(0, 1.45, 0.38);
            group.add(disp);
            colliderHalf = 0.48;
            topY = 1.9;
        } else if (ch === 'h') {
            // Prestatgeria d'arxius confidencials
            const rack = new THREE.Mesh(new THREE.BoxGeometry(1.25, 2.0, 0.45), this.materials.steelBeam);
            rack.position.y = 1.0;
            group.add(rack);
            [0.5, 0.95, 1.4].forEach(yp => {
                const bind = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.32, 0.38), this.materials.paperDoc);
                bind.position.set(0, yp, 0.02);
                group.add(bind);
            });
            colliderHalf = 0.52;
            topY = 2.0;
        } else if (ch === 'i') {
            // Arxivador metàl·lic de 4 calaixos
            const arch = new THREE.Mesh(new THREE.BoxGeometry(0.65, 1.4, 0.65), this.materials.darkMetal);
            arch.position.y = 0.7;
            group.add(arch);
            [0.25, 0.55, 0.85, 1.15].forEach(yp => {
                const pull = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.03, 0.03), this.materials.brassGold);
                pull.position.set(0, yp, 0.34);
                group.add(pull);
            });
            colliderHalf = 0.42;
            topY = 1.45;
        } else if (ch === 'j') {
            // Taquilles de vestuari militar
            const lock = new THREE.Mesh(new THREE.BoxGeometry(1.3, 2.0, 0.55), this.materials.steelBeam);
            lock.position.y = 1.0;
            group.add(lock);
            [-0.4, 0, 0.4].forEach(xp => {
                const line = new THREE.Mesh(new THREE.BoxGeometry(0.02, 1.8, 0.02), this.materials.darkMetal);
                line.position.set(xp, 1.0, 0.28);
                group.add(line);
            });
            colliderHalf = 0.58;
            topY = 2.05;
        } else if (ch === 'k') {
            // Banc d'eines amb panell perforat
            const bench = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.8, 0.65), this.materials.steelBeam);
            bench.position.y = 0.4;
            group.add(bench);
            const board = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.0, 0.06), this.materials.darkMetal);
            board.position.set(0, 1.3, -0.3);
            group.add(board);
            colliderHalf = 0.55;
            topY = 1.85;
        } else if (ch === 'm') {
            // Contenidor estanc de residus tòxics
            const bin = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.34, 0.95, 16), this.materials.hazardYellow);
            bin.position.y = 0.475;
            group.add(bin);
            const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.08, 16), this.materials.darkMetal);
            lid.position.y = 0.96;
            group.add(lid);
            colliderHalf = 0.42;
            topY = 1.0;
        }

        // --- TECNOLOGIA, CONSOLES & COMUNICACIONS ('n' - '0') ---
        else if (ch === 'n') {
            // Superordinador mainframe amb cintes
            const frame = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.1, 0.75), this.materials.serverRack);
            frame.position.y = 1.05;
            group.add(frame);
            [-0.26, 0.26].forEach(xp => {
                const reel = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.04, 16), this.materials.chromeSteel);
                reel.rotation.x = Math.PI / 2;
                reel.position.set(xp, 1.55, 0.39);
                group.add(reel);
            });
            colliderHalf = 0.58;
            topY = 2.15;
        } else if (ch === 'o') {
            // Taula d'hologrames 3D
            const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.75, 0.72, 8), this.materials.darkMetal);
            ped.position.y = 0.36;
            group.add(ped);
            const emitter = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.04, 16), this.materials.bioCyan);
            emitter.position.y = 0.74;
            group.add(emitter);
            const holo = new THREE.Mesh(new THREE.OctahedronGeometry(0.3, 0), this.materials.bioCyan);
            holo.position.y = 1.15;
            group.add(holo);
            colliderHalf = 0.55;
            topY = 1.35;
        } else if (ch === 's') {
            // Torre de servidors blade amb LEDs
            const tower = new THREE.Mesh(new THREE.BoxGeometry(0.65, 2.1, 0.75), this.materials.serverRack);
            tower.position.y = 1.05;
            group.add(tower);
            const leds = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 1.6), this.materials.screenCyan);
            leds.position.set(0, 1.1, 0.38);
            group.add(leds);
            colliderHalf = 0.45;
            topY = 2.15;
        } else if (ch === 'u') {
            // Estació d'anàlisi d'ADN
            const base = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.78, 0.75), this.materials.medicalWhite);
            base.position.y = 0.39;
            group.add(base);
            const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.4), this.materials.screenCyan);
            scr.position.set(0, 1.05, 0.1);
            group.add(scr);
            colliderHalf = 0.55;
            topY = 1.25;
        } else if (ch === 'v') {
            // Panell de commutadors d'alta tensió
            const box = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.7, 0.35), this.materials.steelBeam);
            box.position.y = 0.85;
            group.add(box);
            const lever = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.35, 0.08), this.materials.hazardRed);
            lever.position.set(0.2, 1.1, 0.22);
            lever.rotation.x = -0.4;
            group.add(lever);
            colliderHalf = 0.45;
            topY = 1.75;
        } else if (ch === 'x') {
            // Monitor CRT amb oscil·loscopi
            const desk = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.72, 0.7), this.materials.darkMetal);
            desk.position.y = 0.36;
            group.add(desk);
            const crt = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.45, 0.5), this.materials.pcCase);
            crt.position.set(0, 0.95, 0);
            group.add(crt);
            const crtScr = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.34), this.materials.screenGreen);
            crtScr.position.set(0, 0.95, 0.26);
            group.add(crtScr);
            colliderHalf = 0.52;
            topY = 1.2;
        } else if (ch === 'y') {
            // Generador dièsel d'emergència
            const gen = new THREE.Mesh(new THREE.BoxGeometry(1.35, 1.1, 0.9), this.materials.supplyBox);
            gen.position.y = 0.55;
            group.add(gen);
            const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.6, 8), this.materials.darkMetal);
            pipe.position.set(0.45, 1.25, -0.2);
            group.add(pipe);
            colliderHalf = 0.62;
            topY = 1.4;
        } else if (ch === 'z') {
            // Estació de ràdio HF d'ona curta
            const desk = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.72, 0.7), this.materials.steelBeam);
            desk.position.y = 0.36;
            group.add(desk);
            const radio = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.32, 0.35), this.materials.pcCase);
            radio.position.set(0, 0.88, 0);
            group.add(radio);
            const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 1.3, 8), this.materials.chromeSteel);
            ant.position.set(-0.35, 1.35, 0);
            group.add(ant);
            colliderHalf = 0.55;
            topY = 2.0;
        } else if (ch === '0') {
            // Bateria industrial d'ió-liti
            const bat = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.8, 0.75), this.materials.darkMetal);
            bat.position.y = 0.9;
            group.add(bat);
            const ledBar = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 1.2), this.materials.screenGreen);
            ledBar.position.set(0, 0.9, 0.38);
            group.add(ledBar);
            colliderHalf = 0.45;
            topY = 1.85;
        }

        // --- EQUIPAMENT INDUSTRIAL ('?' - '_') ---
        else if (ch === '?') {
            // Tanc criogènic de vidre amb líquid
            const base = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.52, 0.25, 16), this.materials.steelBeam);
            base.position.y = 0.125;
            group.add(base);
            const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 1.5, 16), this.materials.bioCyan);
            glass.position.y = 1.0;
            group.add(glass);
            const topCap = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.2, 16), this.materials.steelBeam);
            topCap.position.y = 1.85;
            group.add(topCap);
            colliderHalf = 0.48;
            topY = 1.95;
        } else if (ch === '~') {
            // Màquina expenedora de begudes
            const vend = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.95, 0.75), this.materials.hazardRed);
            vend.position.y = 0.975;
            group.add(vend);
            const glowFront = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 1.1), this.materials.screenAmber);
            glowFront.position.set(0, 1.2, 0.38);
            group.add(glowFront);
            colliderHalf = 0.48;
            topY = 2.0;
        } else if (ch === '|') {
            // Extintor d'incendis pressuritzat (de paret / pal)
            const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.4, 8), this.materials.steelBeam);
            post.position.y = 0.7;
            group.add(post);
            const ext = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.65, 12), this.materials.hazardRed);
            ext.position.set(0, 0.85, 0.12);
            group.add(ext);
            colliderHalf = 0.3;
            topY = 1.4;
        } else if (ch === ';') {
            // Caixa de fusibles elèctrics
            const box = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.85, 0.28), this.materials.steelBeam);
            box.position.y = 1.1;
            group.add(box);
            const bolt = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.2), this.materials.hazardYellow);
            bolt.position.set(0, 1.1, 0.15);
            group.add(bolt);
            colliderHalf = 0.35;
            topY = 1.55;
        } else if (ch === ':') {
            // Carretó mecànic d'eines mòbil
            const cart = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.75, 0.55), this.materials.hazardRed);
            cart.position.y = 0.42;
            group.add(cart);
            const handle = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.85, 0.5), this.materials.chromeSteel);
            handle.position.set(0.44, 0.5, 0);
            group.add(handle);
            colliderHalf = 0.45;
            topY = 0.85;
        } else if (ch === '"') {
            // Dipòsit d'oxigen comprimit (parella de bombones)
            [-0.18, 0.18].forEach(xp => {
                const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 1.45, 12), this.materials.screenCyan);
                cyl.position.set(xp, 0.725, 0);
                group.add(cyl);
                const cap = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 8), this.materials.brassGold);
                cap.position.set(xp, 1.45, 0);
                group.add(cap);
            });
            colliderHalf = 0.42;
            topY = 1.6;
        } else if (ch === '\'') {
            // Calefactor radiant d'infrarojos
            const base = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.12, 0.45), this.materials.darkMetal);
            base.position.y = 0.06;
            group.add(base);
            const rad = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.75, 0.16), this.materials.screenAmber);
            rad.position.set(0, 0.5, 0);
            group.add(rad);
            colliderHalf = 0.38;
            topY = 0.9;
        } else if (ch === '/') {
            // Transpaleta hidràulica manual
            const forks = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.12, 1.15), this.materials.hazardYellow);
            forks.position.set(0, 0.08, -0.2);
            group.add(forks);
            const pump = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.65, 12), this.materials.darkMetal);
            pump.position.set(0, 0.35, 0.42);
            group.add(pump);
            colliderHalf = 0.52;
            topY = 0.85;
        } else if (ch === '_') {
            // Dipòsit d'aigua destil·lada (IBC)
            const cage = new THREE.Mesh(new THREE.BoxGeometry(1.05, 1.05, 1.05), this.materials.steelBeam);
            cage.position.y = 0.525;
            group.add(cage);
            const bottle = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.95, 0.95), this.materials.medicalWhite);
            bottle.position.y = 0.525;
            group.add(bottle);
            colliderHalf = 0.55;
            topY = 1.1;
        }

        // --- MÈDIC & RECERCA ('[' - '±') ---
        else if (ch === '[') {
            // Llit d'hospital articulat
            const bed = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.22, 1.55), this.materials.medicalWhite);
            bed.position.y = 0.55;
            group.add(bed);
            const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.1, 0.35), this.materials.fabricCream);
            pillow.position.set(0, 0.7, -0.55);
            group.add(pillow);
            const rails = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.35, 1.5), this.materials.chromeSteel);
            rails.position.y = 0.6;
            group.add(rails);
            colliderHalf = 0.65;
            topY = 0.85;
        } else if (ch === ']') {
            // Suport de sèrum intravenós
            const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.85, 8), this.materials.chromeSteel);
            pole.position.y = 0.925;
            group.add(pole);
            const bag = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.28, 0.08), this.materials.glassSmoked);
            bag.position.set(0.12, 1.6, 0);
            group.add(bag);
            colliderHalf = 0.25;
            topY = 1.9;
        } else if (ch === '{') {
            // Llum scialítica quirúrgica (sostre)
            const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.8, 8), this.materials.chromeSteel);
            arm.position.y = 2.0;
            group.add(arm);
            const head = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 0.12, 16), this.materials.medicalWhite);
            head.position.y = 1.6;
            group.add(head);
            isCollider = false;
        } else if (ch === '}') {
            // Escàner biomètric de retina
            const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.12, 1.25, 12), this.materials.darkMetal);
            stand.position.y = 0.625;
            group.add(stand);
            const eye = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 0.18), this.materials.screenCyan);
            eye.position.set(0, 1.3, 0.05);
            group.add(eye);
            colliderHalf = 0.32;
            topY = 1.45;
        } else if (ch === '=') {
            // Incubadora de cultius biològics
            const box = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.25, 0.65), this.materials.medicalWhite);
            box.position.y = 0.625;
            group.add(box);
            const win = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.75), this.materials.bioCyan);
            win.position.set(0, 0.7, 0.33);
            group.add(win);
            colliderHalf = 0.45;
            topY = 1.3;
        } else if (ch === '\\') {
            // Centrifugadora de sang de taula
            const table = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.7, 0.7), this.materials.steelBeam);
            table.position.y = 0.35;
            group.add(table);
            const cent = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.25, 16), this.materials.medicalWhite);
            cent.position.set(0, 0.82, 0);
            group.add(cent);
            colliderHalf = 0.48;
            topY = 0.95;
        } else if (ch === '§') {
            // Bàscula de precisió mèdica
            const plat = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.06, 0.48), this.materials.darkMetal);
            plat.position.y = 0.03;
            group.add(plat);
            const rod = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.5, 0.06), this.materials.chromeSteel);
            rod.position.set(0, 0.75, -0.2);
            group.add(rod);
            colliderHalf = 0.3;
            topY = 1.55;
        } else if (ch === '°') {
            // Campana d'extracció de fums
            const hood = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.0, 0.75), this.materials.steelBeam);
            hood.position.y = 1.0;
            group.add(hood);
            const sash = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.75), this.materials.glassSmoked);
            sash.position.set(0, 0.9, 0.38);
            group.add(sash);
            colliderHalf = 0.6;
            topY = 2.05;
        } else if (ch === '±') {
            // Llitera plegable d'urgències
            const cot = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.1, 1.5), this.materials.hazardYellow);
            cot.position.y = 0.48;
            group.add(cot);
            const xLegs = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.45, 1.2), this.materials.steelBeam);
            xLegs.position.y = 0.225;
            group.add(xLegs);
            colliderHalf = 0.55;
            topY = 0.65;
        }

        // --- DECORACIÓ & AMBIENT ('µ' - '●') ---
        else if (ch === 'µ') {
            // Pissarra blanca tàctica
            const board = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 0.04), this.materials.paperDoc);
            board.position.set(0, 1.2, 0);
            group.add(board);
            const stand = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.8, 0.45), this.materials.steelBeam);
            stand.position.y = 0.4;
            group.add(stand);
            colliderHalf = 0.45;
            topY = 1.7;
        } else if (ch === '¶') {
            // Màquina de cafè espresso
            const base = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.75, 0.55), this.materials.darkMetal);
            base.position.y = 0.375;
            group.add(base);
            const mch = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.45, 0.38), this.materials.chromeSteel);
            mch.position.set(0, 0.95, 0);
            group.add(mch);
            colliderHalf = 0.35;
            topY = 1.2;
        } else if (ch === '¿') {
            // Paperera d'acer inoxidable
            const can = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.48, 14), this.materials.chromeSteel);
            can.position.y = 0.24;
            group.add(can);
            colliderHalf = 0.25;
            topY = 0.5;
        } else if (ch === '¡') {
            // Ventilador oscil·lant de peu
            const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 1.3, 8), this.materials.darkMetal);
            pole.position.y = 0.65;
            group.add(pole);
            const cage = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.12, 16), this.materials.steelBeam);
            cage.rotation.x = Math.PI / 2;
            cage.position.set(0, 1.35, 0);
            group.add(cage);
            colliderHalf = 0.3;
            topY = 1.5;
        } else if (ch === '«') {
            // Rellotge de paret militar GMT
            const clock = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.04, 16), this.materials.darkMetal);
            clock.rotation.x = Math.PI / 2;
            clock.position.set(0, 1.8, 0);
            group.add(clock);
            const face = new THREE.Mesh(new THREE.CircleGeometry(0.21, 16), this.materials.paperDoc);
            face.position.set(0, 1.8, 0.025);
            group.add(face);
            isCollider = false;
        } else if (ch === '»') {
            // Mirall convex de seguretat
            const mirror = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.4), this.materials.chromeSteel);
            mirror.rotation.x = -Math.PI / 2;
            mirror.position.set(0, 1.9, 0);
            group.add(mirror);
            isCollider = false;
        } else if (ch === '▲') {
            // Palet amb sacs de sorra defensius
            const skid = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.12, 1.2), this.materials.woodOak);
            skid.position.y = 0.06;
            group.add(skid);
            for (let s = 0; s < 6; s++) {
                const bag = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.18, 0.32), this.materials.fabricCream);
                bag.position.set((s % 2 === 0 ? -0.25 : 0.25), 0.18 + Math.floor(s / 2) * 0.18, (s % 3 === 0 ? -0.2 : 0.2));
                group.add(bag);
            }
            colliderHalf = 0.62;
            topY = 0.75;
        } else if (ch === '■') {
            // Barrera retràctil d'accessos
            [-0.45, 0.45].forEach(xp => {
                const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.15, 0.95, 12), this.materials.chromeSteel);
                post.position.set(xp, 0.475, 0);
                group.add(post);
            });
            const ribbon = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.06, 0.02), this.materials.hazardYellow);
            ribbon.position.set(0, 0.85, 0);
            group.add(ribbon);
            colliderHalf = 0.5;
            topY = 0.98;
        } else if (ch === '●') {
            // Globus terraqüi estratègic
            const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.2, 0.85, 12), this.materials.woodMahogany);
            ped.position.y = 0.425;
            group.add(ped);
            const ring = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.02, 8, 16), this.materials.brassGold);
            ring.position.set(0, 1.05, 0);
            ring.rotation.z = 0.4;
            group.add(ring);
            const globe = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 16), this.materials.screenCyan);
            globe.position.set(0, 1.05, 0);
            group.add(globe);
            colliderHalf = 0.35;
            topY = 1.35;
        } else {
            // Fallback genèric
            const box = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), this.materials.steelBeam);
            box.position.y = 0.4;
            group.add(box);
            colliderHalf = 0.4;
            topY = 0.8;
        }

        this.applyObjectRotation(group, cx, rz);
        this.levelGroup.add(group);
        if (isCollider) {
            this.wallColliders.push({ x: wx, z: wz, half: colliderHalf, isBox: true, topY });
        }
    }

    // ========================================================================
    // OPERATIU SOLID SNAKE (PERSONATGE 3D AMB BANDANA DINÀMICA I RIG TÀCTIC)
    // ========================================================================
    createOperativeCharacter() {
        if (this.playerMesh) {
            this.scene.remove(this.playerMesh);
        }

        const group = new THREE.Group();
        this.playerParts = {};

        // High detail PBR materials
        const suitMat = new THREE.MeshStandardMaterial({ color: 0x1e2632, roughness: 0.5, metalness: 0.25 });
        const armorPlateMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.35, metalness: 0.65 });
        const skinMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.65 });
        const hairMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 });
        const bandanaMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.55 });
        const beltMat = new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.4, metalness: 0.5 });
        const gunMetalMat = new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 0.25, metalness: 0.9 });
        const kneeMat = new THREE.MeshStandardMaterial({ color: 0x0a0e17, roughness: 0.3, metalness: 0.7 });

        // 1. Torso & Tactical Sneaking Rig
        const torsoGroup = new THREE.Group();
        torsoGroup.position.y = 0.95;

        // Base torso shape (tapered chest to waist)
        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.58, 0.32), suitMat);
        torso.castShadow = true;
        torsoGroup.add(torso);
        this.playerParts.torso = torso;

        // Dual Pectoral Kevlar armor plates
        const pecL = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.22, 0.05), armorPlateMat);
        pecL.position.set(-0.11, 0.12, 0.16);
        torsoGroup.add(pecL);
        const pecR = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.22, 0.05), armorPlateMat);
        pecR.position.set(0.11, 0.12, 0.16);
        torsoGroup.add(pecR);

        // Abdominal segmented armor plates
        for (let a = 0; a < 3; a++) {
            const abPlate = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.06, 0.04), armorPlateMat);
            abPlate.position.set(0, -0.06 - a * 0.08, 0.155);
            torsoGroup.add(abPlate);
        }

        // Shoulder Pauldrons (curved tactical shoulder pads)
        const pauldronL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.18), armorPlateMat);
        pauldronL.position.set(-0.29, 0.24, 0);
        torsoGroup.add(pauldronL);
        const pauldronR = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.18), armorPlateMat);
        pauldronR.position.set(0.29, 0.24, 0);
        torsoGroup.add(pauldronR);

        // Tactical chest harness & comm radio with rubber antenna
        const harness = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.06, 0.34), beltMat);
        harness.position.set(0, 0.08, 0);
        torsoGroup.add(harness);

        const radio = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, 0.09), armorPlateMat);
        radio.position.set(-0.16, 0.14, 0.17);
        torsoGroup.add(radio);
        const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.22, 6), beltMat);
        antenna.position.set(-0.16, 0.28, 0.17);
        torsoGroup.add(antenna);

        // Utility Belt with tactical pouches & canteen
        const belt = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.08, 0.34), beltMat);
        belt.position.set(0, -0.28, 0);
        torsoGroup.add(belt);

        const pouch1 = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.11, 0.08), armorPlateMat);
        pouch1.position.set(-0.14, -0.28, 0.18);
        torsoGroup.add(pouch1);
        const pouch2 = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.11, 0.08), armorPlateMat);
        pouch2.position.set(0.14, -0.28, 0.18);
        torsoGroup.add(pouch2);
        const canteen = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.13, 0.09), armorPlateMat);
        canteen.position.set(0, -0.28, -0.18);
        torsoGroup.add(canteen);

        group.add(torsoGroup);

        // 2. Head, Hair Bangs, Tactical Bandana & Comm Headset
        const headGroup = new THREE.Group();
        headGroup.position.y = 1.45;

        // Neck
        const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.10, 0.12, 8), skinMat);
        neck.position.y = -0.16;
        headGroup.add(neck);

        // Head Base
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.28, 0.28), skinMat);
        head.castShadow = true;
        headGroup.add(head);
        this.playerParts.head = head;

        // Jawline & Chin
        const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.22), skinMat);
        jaw.position.set(0, -0.09, 0.03);
        headGroup.add(jaw);

        // Facial stubble & tactical shadow
        const shadowFace = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.08, 0.08), new THREE.MeshStandardMaterial({ color: 0x523628, roughness: 0.9 }));
        shadowFace.position.set(0, -0.07, 0.12);
        headGroup.add(shadowFace);

        // Eyes & Brow Line
        const brow = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.05, 0.08), new THREE.MeshStandardMaterial({ color: 0x221812, roughness: 0.8 }));
        brow.position.set(0, 0.03, 0.12);
        headGroup.add(brow);

        // Hair Bangs (sculpted Solid Snake hair under bandana)
        const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.09, 0.28), hairMat);
        hairTop.position.set(0, 0.14, 0);
        headGroup.add(hairTop);

        const hairBangs = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.08, 0.08), hairMat);
        hairBangs.position.set(0.02, 0.09, 0.14);
        hairBangs.rotation.z = -0.1;
        headGroup.add(hairBangs);

        const hairBack = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.18, 0.10), hairMat);
        hairBack.position.set(0, 0.02, -0.12);
        headGroup.add(hairBack);

        // Tactical Bandana
        const band = new THREE.Mesh(new THREE.BoxGeometry(0.29, 0.08, 0.29), bandanaMat);
        band.position.y = 0.06;
        headGroup.add(band);

        // Silver Bandana Knot Buckle
        const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.06), new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 }));
        buckle.position.set(0, 0.06, -0.15);
        headGroup.add(buckle);

        // Comm Headset & boom microphone
        const commEar = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 8), armorPlateMat);
        commEar.rotation.z = Math.PI / 2;
        commEar.position.set(-0.14, 0.02, 0);
        headGroup.add(commEar);
        const micBoom = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.14, 6), gunMetalMat);
        micBoom.rotation.x = Math.PI / 2.8;
        micBoom.position.set(-0.13, -0.04, 0.08);
        headGroup.add(micBoom);

        // Dynamic 3-Segment Bandana Tails
        const bandanaGroup = new THREE.Group();
        bandanaGroup.position.set(0, 0.06, -0.15);

        const tail1 = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.06, 0.18), bandanaMat);
        tail1.position.z = -0.09;
        bandanaGroup.add(tail1);

        const tail2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 0.18), bandanaMat);
        tail2.position.z = -0.25;
        bandanaGroup.add(tail2);

        const tail3 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.04, 0.18), bandanaMat);
        tail3.position.z = -0.41;
        bandanaGroup.add(tail3);

        headGroup.add(bandanaGroup);
        this.playerParts.bandanaGroup = bandanaGroup;
        this.playerParts.tail1 = tail1;
        this.playerParts.tail2 = tail2;
        this.playerParts.tail3 = tail3;

        group.add(headGroup);

        // 3. Articulated Arms, Elbow Pads & Tactical Combat Gloves
        const buildArm = (isLeft) => {
            const armRoot = new THREE.Group();
            const sign = isLeft ? -1 : 1;
            armRoot.position.set(sign * 0.33, 1.18, 0);

            // Bicep / Upper Arm
            const bicep = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.26, 0.13), suitMat);
            bicep.position.y = -0.13;
            bicep.castShadow = true;
            armRoot.add(bicep);

            // Reinforced Elbow Pad
            const elbow = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.10, 0.15), kneeMat);
            elbow.position.set(0, -0.27, -0.01);
            armRoot.add(elbow);

            // Forearm with telemetry display on left arm
            const forearm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.24, 0.12), suitMat);
            forearm.position.y = -0.40;
            forearm.castShadow = true;
            armRoot.add(forearm);

            if (isLeft) {
                const pda = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.10, 0.08), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
                pda.position.set(-0.06, -0.38, 0);
                armRoot.add(pda);
            }

            // Tactical Combat Glove with Knuckle Guard
            const hand = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.13, 0.11), armorPlateMat);
            hand.position.y = -0.54;
            armRoot.add(hand);

            return armRoot;
        };

        const armL = buildArm(true);
        group.add(armL);
        this.playerParts.armL = armL;

        const armR = buildArm(false);
        group.add(armR);
        this.playerParts.armR = armR;

        // Drop-leg Holster & SOCOM Handgun on right thigh
        const holster = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.26, 0.16), armorPlateMat);
        holster.position.set(0.30, 0.58, 0.02);
        group.add(holster);
        const socom = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, 0.22), gunMetalMat);
        socom.position.set(0.32, 0.62, 0.04);
        group.add(socom);

        // 4. Articulated Legs, Knee Pads & Combat Boots
        const buildLeg = (isLeft) => {
            const legRoot = new THREE.Group();
            const sign = isLeft ? -1 : 1;
            legRoot.position.set(sign * 0.16, 0.65, 0);

            // Thigh
            const thigh = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.32, 0.17), suitMat);
            thigh.position.y = -0.16;
            thigh.castShadow = true;
            legRoot.add(thigh);

            // Hardened Tactical Knee Pad
            const kneePad = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.12, 0.18), kneeMat);
            kneePad.position.set(0, -0.32, 0.02);
            legRoot.add(kneePad);

            // Lower Leg / Calf
            const calf = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.26, 0.16), suitMat);
            calf.position.y = -0.46;
            calf.castShadow = true;
            legRoot.add(calf);

            // Combat Boot with Rubber Tread Sole
            const boot = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.26), armorPlateMat);
            boot.position.set(0, -0.60, 0.04);
            boot.castShadow = true;
            legRoot.add(boot);

            return legRoot;
        };

        const legL = buildLeg(true);
        group.add(legL);
        this.playerParts.legL = legL;

        const legR = buildLeg(false);
        group.add(legR);
        this.playerParts.legR = legR;

        // Linterna eliminada: Snake opera en sigil sense feixos delators
        this.playerSpotlight = null;
        this.playerLight = null;

        // Floor Shadow Blob
        const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.45 });
        this.playerShadow = new THREE.Mesh(new THREE.CircleGeometry(0.48, 16), shadowMat);
        this.playerShadow.rotation.x = -Math.PI / 2;
        this.playerShadow.position.y = 0.02;
        this.scene.add(this.playerShadow);

        group.position.set(this.playerState.x, 0, this.playerState.z);
        this.scene.add(group);
        this.playerMesh = group;
    }

    // ========================================================================
    // SENTINELLES GENOME PATROL AMB COMPORTAMENT DE VIGILÀNCIA
    // ========================================================================
    createGenomePatrolSentry(cfg, idx) {
        const group = new THREE.Group();
        const startWP = cfg.waypoints && cfg.waypoints[0] ? cfg.waypoints[0] : [3, 3];
        const wx = this.gridToWorldX(startWP[0]);
        const wz = this.gridToWorldZ(startWP[1]);

        const camoMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.55, metalness: 0.25 });
        const armorPlateMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.65 });
        const helmetMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35, metalness: 0.6 });
        const nvgLensMat = new THREE.MeshBasicMaterial({ color: 0x22c55e }); // Glowing night-vision optics
        const gunMetalMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.25, metalness: 0.9 });
        const kneeMat = new THREE.MeshStandardMaterial({ color: 0x0a0e17, roughness: 0.3, metalness: 0.7 });

        const bodyGroup = new THREE.Group();

        // 1. Torso with Heavy MOLLE Plate Carrier
        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.64, 0.36), camoMat);
        torso.position.y = 0.95;
        torso.castShadow = true;
        bodyGroup.add(torso);

        // Plate Carrier Armor Chest Rig
        const plateCarrier = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.48, 0.42), armorPlateMat);
        plateCarrier.position.set(0, 0.98, 0);
        bodyGroup.add(plateCarrier);

        // 3 Rifle Magazine Pouches on Chest
        for (let m = -1; m <= 1; m++) {
            const pouch = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.16, 0.08), armorPlateMat);
            pouch.position.set(m * 0.14, 0.92, 0.23);
            bodyGroup.add(pouch);
        }

        // Armored Shoulder Pauldrons
        const shL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.15, 0.20), armorPlateMat);
        shL.position.set(-0.33, 1.20, 0);
        bodyGroup.add(shL);
        const shR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.15, 0.20), armorPlateMat);
        shR.position.set(0.33, 1.20, 0);
        bodyGroup.add(shR);

        // Gaze Pivot for dynamic looking left / right (head, vision cone, flashlight all follow!)
        const gazePivot = new THREE.Group();
        gazePivot.position.set(0, 0, 0);
        bodyGroup.add(gazePivot);

        // 2. Head with PASGT Military Helmet & Night-Vision Goggles (NVG)
        const headGroup = new THREE.Group();
        headGroup.position.y = 1.48;

        // Helmet Dome
        const helmet = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.26, 0.36), helmetMat);
        helmet.position.y = 0.06;
        headGroup.add(helmet);

        // Helmet Rim / Brim
        const helmetBrim = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.06, 0.38), helmetMat);
        helmetBrim.position.y = -0.02;
        headGroup.add(helmetBrim);

        // Balaclava & Face Mask
        const balaclava = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 0.28), camoMat);
        balaclava.position.y = -0.06;
        headGroup.add(balaclava);

        // Tactical Combat Goggles / Visor
        const goggles = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.08, 0.10), new THREE.MeshBasicMaterial({ color: 0x090d16 }));
        goggles.position.set(0, 0.02, 0.15);
        headGroup.add(goggles);

        // Dual Night-Vision Goggle (NVG) Mount & Optics
        const nvgMount = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.10), armorPlateMat);
        nvgMount.position.set(0, 0.10, 0.20);
        headGroup.add(nvgMount);

        const lensL = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.10, 10), nvgLensMat);
        lensL.rotation.x = Math.PI / 2;
        lensL.position.set(-0.06, 0.10, 0.26);
        headGroup.add(lensL);

        const lensR = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.10, 10), nvgLensMat);
        lensR.rotation.x = Math.PI / 2;
        lensR.position.set(0.06, 0.10, 0.26);
        headGroup.add(lensR);

        gazePivot.add(headGroup);

        // 3. FA-MAS Bullpup Assault Rifle in Carry / Aim Posture
        const rifleGroup = new THREE.Group();
        rifleGroup.position.set(0.20, 0.95, 0.26);

        // Receiver
        const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.14, 0.52), gunMetalMat);
        rifleGroup.add(receiver);

        // Carry Handle with Iron Sights
        const carryHandle = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.10, 0.32), gunMetalMat);
        carryHandle.position.set(0, 0.10, -0.04);
        rifleGroup.add(carryHandle);

        // Extended Barrel & Flash Hider
        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.24, 8), gunMetalMat);
        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(0, 0, 0.36);
        rifleGroup.add(barrel);

        // Muzzle Flash Flare & Tactical Gunfire Point Light
        const flashGeo = new THREE.OctahedronGeometry(0.12, 0);
        const flashMat = new THREE.MeshBasicMaterial({ color: 0xfff066, transparent: true, opacity: 0.95 });
        const muzzleFlash = new THREE.Mesh(flashGeo, flashMat);
        muzzleFlash.position.set(0, 0, 0.52);
        muzzleFlash.visible = false;
        rifleGroup.add(muzzleFlash);

        const muzzleLight = new THREE.PointLight(0xffaa22, 0, 4.5);
        muzzleLight.position.set(0, 0, 0.55);
        rifleGroup.add(muzzleLight);

        // Bullpup Curved Magazine behind grip
        const mag = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.15, 0.08), armorPlateMat);
        mag.position.set(0, -0.10, -0.16);
        rifleGroup.add(mag);

        bodyGroup.add(rifleGroup);

        // 4. Legs with Knee Pads & Heavy Military Boots
        const buildGuardLeg = (isLeft) => {
            const legRoot = new THREE.Group();
            const sign = isLeft ? -1 : 1;
            legRoot.position.set(sign * 0.16, 0.65, 0);

            const thigh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.32, 0.18), camoMat);
            thigh.position.y = -0.16;
            thigh.castShadow = true;
            legRoot.add(thigh);

            const knee = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.12, 0.19), kneeMat);
            knee.position.set(0, -0.32, 0.02);
            legRoot.add(knee);

            const calf = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.26, 0.17), camoMat);
            calf.position.y = -0.46;
            calf.castShadow = true;
            legRoot.add(calf);

            const boot = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.12, 0.27), armorPlateMat);
            boot.position.set(0, -0.60, 0.04);
            legRoot.add(boot);

            return legRoot;
        };

        const legL = buildGuardLeg(true);
        bodyGroup.add(legL);
        const legR = buildGuardLeg(false);
        bodyGroup.add(legR);

        // Alert [!] Icon Mesh
        const alertMesh = this.createAlertIconMesh();
        alertMesh.position.set(0, 2.35, 0);
        alertMesh.visible = false;
        bodyGroup.add(alertMesh);

        group.add(bodyGroup);

        const fovDeg = cfg.fov || 65;
        const fovRad = (fovDeg * Math.PI) / 180;
        const viewDist = cfg.viewDist || 8.0;

        const coneMesh = this.createVisionConeMesh(fovRad, viewDist, 0xeab308);
        coneMesh.position.y = 0.025;
        gazePivot.add(coneMesh);

        const flashlight = new THREE.SpotLight(0xfef08a, 1.25, viewDist * 1.2, fovRad * 0.7, 0.4, 1.2);
        flashlight.position.set(0, 1.35, 0.1);
        flashlight.target.position.set(0, 0, viewDist);
        gazePivot.add(flashlight);
        gazePivot.add(flashlight.target);

        group.position.set(wx, 0, wz);
        this.levelGroup.add(group);

        const parsedWP = (cfg.waypoints || []).map(wp => ({
            x: this.gridToWorldX(wp[0]),
            z: this.gridToWorldZ(wp[1]),
            gridX: wp[0],
            gridZ: wp[1]
        }));

        this.enemies.push({
            group,
            bodyGroup,
            gazePivot,
            headGroup,
            coneMesh,
            alertMesh,
            flashlight,
            legL,
            legR,
            type: cfg.type || 'PATROL',
            x: wx,
            z: wz,
            facingAngle: 0,
            targetAngle: 0,
            gazeAngle: 0,
            gazeTimer: Math.random() * 5,
            speed: cfg.speed || 2.4,
            fovDeg,
            fovRad,
            viewDist,
            waypoints: parsedWP,
            wpIndex: 0,
            inspectTimer: 0,
            inspectDuration: 2.2,
            inspectPhase: 0,
            r: 0.55,
            muzzleFlash,
            muzzleLight,
            muzzleTimer: 0,
            shootCooldown: 0.6 + Math.random() * 0.6,
            aiState: 'PATROL',
            lastKnownX: wx,
            lastKnownZ: wz
        });
    }

    createSecurityCCTV(cfg, idx) {
        const group = new THREE.Group();
        const wx = this.gridToWorldX(cfg.x);
        const wz = this.gridToWorldZ(cfg.z);

        // Normalize camera properties
        const camType = String(cfg.type || (cfg.fixed ? 'FIXED' : 'SWEEP')).toUpperCase();
        let baseAngle = Number(cfg.baseAngle !== undefined ? cfg.baseAngle : 0);
        if (baseAngle > 6.3) baseAngle = (baseAngle * Math.PI) / 180; // Degrees to radians if > 2*PI

        let sweepAngle = Number(cfg.sweepAngle !== undefined ? cfg.sweepAngle : (Math.PI / 2.2));
        if (sweepAngle > 6.3) sweepAngle = (sweepAngle * Math.PI) / 180;

        const sweepSpeed = Number(cfg.sweepSpeed !== undefined ? cfg.sweepSpeed : (camType === 'ROTARY_360' ? 0.65 : 0.52));
        const viewDist = Number(cfg.viewDist !== undefined ? cfg.viewDist : (camType === 'LONG_RANGE' ? 11.0 : 7.5));
        const minDist = Number(cfg.minDist !== undefined ? cfg.minDist : 0.6); // Blind spot underneath camera
        const fovDeg = Number(cfg.fov !== undefined ? cfg.fov : (camType === 'LONG_RANGE' ? 32 : (camType === 'ROTARY_360' ? 75 : 55)));
        const fovRad = (fovDeg * Math.PI) / 180;

        const cameraPivot = new THREE.Group();
        let mountMesh, lensMesh, alertMesh;

        if (camType === 'ROTARY_360' || camType === '360' || camType === 'DOME_360') {
            // 360 DOME CEILING CAMERA (Gira 360 graus contínuament a la sala central)
            mountMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.12, 24), this.materials.steelBeam);
            mountMesh.position.y = 2.45;
            group.add(mountMesh);

            cameraPivot.position.y = 2.38;

            // Internal rotating sensor mechanism
            const innerSensor = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.18, 0.38), new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9, roughness: 0.2 }));
            cameraPivot.add(innerSensor);

            lensMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.12, 12), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
            lensMesh.rotation.x = Math.PI / 2;
            lensMesh.position.set(0, -0.04, 0.20);
            cameraPivot.add(lensMesh);

            // Dark tinted transparent acrylic dome (protecting the rotating lens)
            const domeGeo = new THREE.SphereGeometry(0.42, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
            const domeMat = new THREE.MeshStandardMaterial({ color: 0x090e17, metalness: 0.8, roughness: 0.1, transparent: true, opacity: 0.65, side: THREE.DoubleSide });
            const domeMesh = new THREE.Mesh(domeGeo, domeMat);
            domeMesh.rotation.x = Math.PI;
            domeMesh.position.y = 2.42;
            group.add(domeMesh);

            // Chrome ring accent
            const ringGeo = new THREE.RingGeometry(0.44, 0.49, 24);
            const ringMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.15, side: THREE.DoubleSide });
            const ringMesh = new THREE.Mesh(ringGeo, ringMat);
            ringMesh.rotation.x = Math.PI / 2;
            ringMesh.position.y = 2.40;
            group.add(ringMesh);

        } else if (camType === 'LONG_RANGE' || camType === 'SNIPER') {
            // LONG-RANGE TELESCOPIC SURVEILLANCE CAMERA
            mountMesh = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.18, 0.4), this.materials.steelBeam);
            mountMesh.position.y = 2.2;
            group.add(mountMesh);

            cameraPivot.position.y = 2.08;

            const camBody = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.28, 0.5), new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.85, roughness: 0.25 }));
            camBody.rotation.x = 0.25;
            cameraPivot.add(camBody);

            const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.42, 16), new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.2 }));
            barrel.rotation.x = Math.PI / 2;
            barrel.position.set(0, -0.06, 0.42);
            cameraPivot.add(barrel);

            lensMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.08, 14), new THREE.MeshBasicMaterial({ color: 0xff0055 }));
            lensMesh.rotation.x = Math.PI / 2;
            lensMesh.position.set(0, -0.06, 0.63);
            cameraPivot.add(lensMesh);

        } else {
            // STANDARD INDUSTRIAL WALL / SWEEP CAMERA
            mountMesh = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.15, 0.35), this.materials.steelBeam);
            mountMesh.position.y = 2.15;
            group.add(mountMesh);

            cameraPivot.position.y = 2.05;

            const camBody = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.25, 0.55), new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.7, roughness: 0.3 }));
            camBody.rotation.x = 0.35;
            cameraPivot.add(camBody);

            lensMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.1, 12), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
            lensMesh.rotation.x = Math.PI / 2;
            lensMesh.position.set(0, -0.05, 0.28);
            cameraPivot.add(lensMesh);
        }

        alertMesh = this.createAlertIconMesh();
        alertMesh.position.set(0, 0.75, 0);
        alertMesh.visible = false;
        cameraPivot.add(alertMesh);

        group.add(cameraPivot);

        const coneColor = (camType === 'LONG_RANGE') ? 0x0ea5e9 : ((camType === 'ROTARY_360') ? 0x06b6d4 : 0x00d2ff);
        const coneMesh = this.createVisionConeMesh(fovRad, viewDist, coneColor);
        coneMesh.position.y = 0.03;
        group.add(coneMesh);

        group.position.set(wx, 0, wz);
        this.levelGroup.add(group);

        this.cameras.push({
            group,
            cameraPivot,
            coneMesh,
            alertMesh,
            lensMesh,
            x: wx,
            z: wz,
            gridX: cfg.x,
            gridZ: cfg.z,
            camType,
            type: camType,
            fixed: (camType === 'FIXED'),
            baseAngle,
            sweepAngle,
            sweepSpeed,
            currentAngle: baseAngle,
            fovDeg,
            fovRad,
            viewDist,
            minDist,
            sweepTime: Math.random() * 5
        });
    }

    createVisionConeMesh(fovRad, dist, hexColor) {
        const segments = 28;
        const halfFov = fovRad / 2;
        const numVerts = segments + 2;

        const vertices = new Float32Array(numVerts * 3);
        const uvs = new Float32Array(numVerts * 2);
        const linePoints = new Float32Array(numVerts * 3);
        const midPoints = new Float32Array((segments + 1) * 3);

        vertices[0] = 0; vertices[1] = 0; vertices[2] = 0;
        uvs[0] = 0.5; uvs[1] = 0;
        linePoints[0] = 0; linePoints[1] = 0.015; linePoints[2] = 0;

        for (let i = 0; i <= segments; i++) {
            const angle = -halfFov + (i / segments) * fovRad;
            const vx = Math.sin(angle) * dist;
            const vz = Math.cos(angle) * dist;

            const vIdx = (i + 1) * 3;
            vertices[vIdx] = vx;
            vertices[vIdx + 1] = 0;
            vertices[vIdx + 2] = vz;

            const uIdx = (i + 1) * 2;
            uvs[uIdx] = i / segments;
            uvs[uIdx + 1] = 1;

            linePoints[vIdx] = vx;
            linePoints[vIdx + 1] = 0.015;
            linePoints[vIdx + 2] = vz;

            const mIdx = i * 3;
            midPoints[mIdx] = vx * 0.55;
            midPoints[mIdx + 1] = 0.015;
            midPoints[mIdx + 2] = vz * 0.55;
        }

        const indices = [];
        for (let i = 1; i <= segments; i++) {
            indices.push(0, i, i + 1);
        }

        const geo = new THREE.BufferGeometry();
        const posAttr = new THREE.BufferAttribute(vertices, 3);
        posAttr.setUsage(THREE.DynamicDrawUsage);
        geo.setAttribute('position', posAttr);
        geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
        geo.setIndex(indices);
        geo.computeVertexNormals();

        const mat = new THREE.MeshBasicMaterial({
            color: hexColor,
            transparent: true,
            opacity: 0.48,
            side: THREE.DoubleSide,
            depthWrite: false
        });

        const coneMesh = new THREE.Mesh(geo, mat);

        // Bright laser perimeter outline
        const lineGeo = new THREE.BufferGeometry();
        const lineAttr = new THREE.BufferAttribute(linePoints, 3);
        lineAttr.setUsage(THREE.DynamicDrawUsage);
        lineGeo.setAttribute('position', lineAttr);
        const lineMat = new THREE.LineBasicMaterial({
            color: hexColor,
            transparent: true,
            opacity: 0.95,
            linewidth: 2,
            depthWrite: false
        });
        const outlineLine = new THREE.Line(lineGeo, lineMat);
        coneMesh.add(outlineLine);
        coneMesh.userData.outlineLine = outlineLine;

        // Inner tactical range arc (at 55% distance)
        const midGeo = new THREE.BufferGeometry();
        const midAttr = new THREE.BufferAttribute(midPoints, 3);
        midAttr.setUsage(THREE.DynamicDrawUsage);
        midGeo.setAttribute('position', midAttr);
        const midMat = new THREE.LineBasicMaterial({
            color: hexColor,
            transparent: true,
            opacity: 0.70,
            depthWrite: false
        });
        const midArc = new THREE.Line(midGeo, midMat);
        coneMesh.add(midArc);
        coneMesh.userData.midArcLine = midArc;

        return coneMesh;
    }

    castVisionRay(x1, z1, angle, maxDist) {
        const sinA = Math.sin(angle);
        const cosA = Math.cos(angle);
        const step = 0.28;
        let dist = 0.35;

        const halfW = (this.gridW * this.tileSize) / 2;
        const halfH = (this.gridH * this.tileSize) / 2;

        while (dist < maxDist) {
            const rx = x1 + sinA * dist;
            const rz = z1 + cosA * dist;

            // Map perimeter bounds
            if (Math.abs(rx) > halfW - 0.15 || Math.abs(rz) > halfH - 0.15) {
                return dist;
            }

            // Wall Colliders (walls, closed subdoors, blast gate)
            for (let i = 0; i < this.wallColliders.length; i++) {
                const w = this.wallColliders[i];
                if (w.isGateCollider && this.gateInfo && this.gateInfo.isOpen) continue;
                if (w.isSubDoorCollider && w.refSubDoor && w.refSubDoor.isOpen) continue;

                if (w.isBox) {
                    if (Math.abs(rx - w.x) < w.half && Math.abs(rz - w.z) < w.half) {
                        return Math.max(0.3, dist - 0.12);
                    }
                } else if (w.r) {
                    if (Math.hypot(rx - w.x, rz - w.z) < w.r) {
                        return Math.max(0.3, dist - 0.12);
                    }
                }
            }

            // Push Crates (tactical stealth cover)
            for (let i = 0; i < this.pushCrates.length; i++) {
                const cr = this.pushCrates[i];
                if (!cr.inPit && !cr.inLava) {
                    if (Math.abs(rx - cr.x) < cr.half && Math.abs(rz - cr.z) < cr.half) {
                        return Math.max(0.3, dist - 0.12);
                    }
                }
            }

            dist += step;
        }

        return maxDist;
    }

    updateRaycastedVisionCone(coneMesh, originX, originZ, centerAngle, fovRad, maxDist) {
        const segments = 28;
        const halfFov = fovRad / 2;
        const posAttr = coneMesh.geometry.attributes.position;
        const outlineAttr = coneMesh.userData.outlineLine.geometry.attributes.position;
        const midAttr = coneMesh.userData.midArcLine.geometry.attributes.position;
        const hitPoints = [];

        // Apex at local (0, 0, 0)
        posAttr.setXYZ(0, 0, 0, 0);
        outlineAttr.setXYZ(0, 0, 0.015, 0);

        for (let i = 0; i <= segments; i++) {
            const localAngle = -halfFov + (i / segments) * fovRad;
            const worldAngle = centerAngle + localAngle;
            const hitDist = this.castVisionRay(originX, originZ, worldAngle, maxDist);
            const localVx = Math.sin(localAngle) * hitDist;
            const localVz = Math.cos(localAngle) * hitDist;

            posAttr.setXYZ(i + 1, localVx, 0, localVz);
            outlineAttr.setXYZ(i + 1, localVx, 0.015, localVz);
            midAttr.setXYZ(i, localVx * 0.55, 0.015, localVz * 0.55);

            hitPoints.push({
                localVx,
                localVz,
                worldAngle,
                hitDist,
                worldX: originX + Math.sin(worldAngle) * hitDist,
                worldZ: originZ + Math.cos(worldAngle) * hitDist
            });
        }

        posAttr.needsUpdate = true;
        outlineAttr.needsUpdate = true;
        midAttr.needsUpdate = true;

        return hitPoints;
    }

    getFloorHeightAt(x, z) {
        return 0.0;
    }

    toggleSubSecurityDoor(sd) {
        sd.isOpen = !sd.isOpen;
        if (window.castleAudio && window.castleAudio.playSubDoorOpen) {
            window.castleAudio.playSubDoorOpen();
        }
        const msg = sd.isOpen
            ? '🚪 Porta de seguretat OBERTA (Línia de visió oberta)'
            : '🔒 Porta de seguretat TANCADA (Línia de visió tallada)';
        const toast = document.getElementById('castle-toast');
        if (toast) {
            toast.textContent = msg;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 2200);
        }
    }

    setBypassDoorPuzzles(bypass) {
        this.bypassDoorPuzzles = !!bypass;
        if (this.subDoors && this.subDoors.length > 0) {
            for (const sd of this.subDoors) {
                if (this.bypassDoorPuzzles) {
                    sd.logicUnlocked = true;
                    sd.isOpen = true;
                    sd.openProgress = 1.0;
                    if (sd.doorMesh) sd.doorMesh.position.y = 3.3;
                    if (sd.ledMat) sd.ledMat.color.setHex(0x10b981);
                } else {
                    sd.logicUnlocked = false;
                    sd.isOpen = false;
                    sd.openProgress = 0;
                    if (sd.doorMesh) sd.doorMesh.position.y = 1.1;
                    if (sd.ledMat) sd.ledMat.color.setHex(0xf59e0b);
                }
            }
        }
        if (this.gateInfo) {
            if (this.bypassDoorPuzzles) {
                this.gateInfo.isOpen = true;
                this.gateInfo.openProgress = 1.0;
                this.gateInfo.leafL.position.x = -0.62 - 1.05;
                this.gateInfo.leafR.position.x = 0.62 + 1.05;
                if (this.gateInfo.statusLight) this.gateInfo.statusLight.color.setHex(0x10b981);
            } else {
                this.gateInfo.isOpen = false;
                this.gateInfo.openProgress = 0;
                this.gateInfo.leafL.position.x = -0.62;
                this.gateInfo.leafR.position.x = 0.62;
                if (this.gateInfo.statusLight) this.gateInfo.statusLight.color.setHex(0xf59e0b);
            }
        }
    }

    toggleElevator(el) {
        if (el.moving) return;
        el.targetY = el.y < 1.0 ? 2.0 : 0.0;
        el.moving = true;
        if (window.castleAudio && window.castleAudio.playElevatorMove) {
            window.castleAudio.playElevatorMove();
        }
        const msg = el.targetY > 1.0 ? '🛗 Ascensor: Pujant a Planta 1 (Passarel·la Superior)' : '🛗 Ascensor: Baixant a Planta Baixa';
        const toast = document.getElementById('castle-toast');
        if (toast) {
            toast.textContent = msg;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 2200);
        }
    }

    renderSightShroud() {
        // Disabled per user request for maximum performance and full scene visibility
    }

    createFloatingTextSprite(text, colorHex = '#38bdf8') {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        if (ctx.roundRect) {
            ctx.roundRect(4, 4, 248, 56, 12);
        } else {
            ctx.fillRect(4, 4, 248, 56);
        }
        ctx.fill();
        ctx.strokeStyle = colorHex;
        ctx.lineWidth = 3.5;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 128, 32);

        const tex = new THREE.CanvasTexture(canvas);
        const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
        const sprite = new THREE.Sprite(mat);
        sprite.scale.set(1.65, 0.42, 1.0);
        return sprite;
    }

    createAlertIconMesh() {
        const group = new THREE.Group();
        const redMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const stem = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.45, 0.18), redMat);
        stem.position.y = 0.35;
        group.add(stem);

        const dot = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.18), redMat);
        dot.position.y = 0.05;
        group.add(dot);

        group.scale.set(1.4, 1.4, 1.4);
        return group;
    }

    // ========================================================================
    // PARTÍCULES DE BLIZZARD ÀRTIC I BUFADES DE VAPOR
    // ========================================================================
    createSnowAtmosphere(totalW, totalH) {
        if (this.perfMode === 'CHROMEBOOK') return; // En mode fluid / Chromebook s'elimina la neu per estalviar CPU/GPU
        const count = 500;
        const geo = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const velocities = [];

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * (totalW * 1.5);
            positions[i * 3 + 1] = Math.random() * 18 + 0.5;
            positions[i * 3 + 2] = (Math.random() - 0.5) * (totalH * 1.5);
            velocities.push({
                x: -0.4 - Math.random() * 0.8,
                y: -1.8 - Math.random() * 1.5,
                z: -0.2 - Math.random() * 0.4
            });
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const mat = new THREE.PointsMaterial({
            color: 0xe2e8f0,
            size: 0.18,
            transparent: true,
            opacity: 0.65
        });

        this.snowParticles = { points: new THREE.Points(geo, mat), velocities, count, totalW, totalH };
        this.scene.add(this.snowParticles.points);
    }

    updateSnow(dt) {
        if (!this.snowParticles || this.perfMode === 'CHROMEBOOK' || !this.snowParticles.points.visible) return;
        const pos = this.snowParticles.points.geometry.attributes.position.array;
        const vels = this.snowParticles.velocities;
        const totalW = this.snowParticles.totalW * 1.5;
        const totalH = this.snowParticles.totalH * 1.5;

        for (let i = 0; i < this.snowParticles.count; i++) {
            pos[i * 3] += vels[i].x * dt * 2.5;
            pos[i * 3 + 1] += vels[i].y * dt * 2.5;
            pos[i * 3 + 2] += vels[i].z * dt * 2.5;

            if (pos[i * 3 + 1] < 0.2) {
                pos[i * 3 + 1] = 18;
                pos[i * 3] = (Math.random() - 0.5) * totalW;
                pos[i * 3 + 2] = (Math.random() - 0.5) * totalH;
            }
        }
        this.snowParticles.points.geometry.attributes.position.needsUpdate = true;
    }

    spawnBurstParticles(x, z, color) {
        for (let i = 0; i < 15; i++) {
            const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.12), new THREE.MeshBasicMaterial({ color }));
            mesh.position.set(x, 0.5, z);
            this.scene.add(mesh);
            this.burstParticles.push({
                mesh,
                vx: (Math.random() - 0.5) * 6,
                vy: Math.random() * 5 + 1.5,
                vz: (Math.random() - 0.5) * 6,
                life: 0.65
            });
        }
    }

    updateParticles(dt) {
        for (let i = this.burstParticles.length - 1; i >= 0; i--) {
            const p = this.burstParticles[i];
            p.life -= dt;
            p.vy -= 14 * dt;
            p.mesh.position.x += p.vx * dt;
            p.mesh.position.y += p.vy * dt;
            p.mesh.position.z += p.vz * dt;
            if (p.life <= 0) {
                this.scene.remove(p.mesh);
                this.burstParticles.splice(i, 1);
            }
        }
    }

    // ========================================================================
    // ENTRADA DE TECLAT I INTERACCIÓ TÀCTICA
    // ========================================================================
    bindInputEvents() {
        window.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

            if (e.code === 'KeyW' || e.code === 'ArrowUp') this.keys.up = true;
            if (e.code === 'KeyS' || e.code === 'ArrowDown') this.keys.down = true;
            if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.keys.left = true;
            if (e.code === 'KeyD' || e.code === 'ArrowRight') this.keys.right = true;

            // Jump [Space] - ELIMINAT: El personatge no pot saltar
            if (e.code === 'Space') {
                e.preventDefault();
            }

            // Interact with Blast Door or Breaker Switch [KeyE]
            if (e.code === 'KeyE') {
                this.tryInteract();
            }

            // Camera Rotation [KeyQ] Left, [KeyR] Right
            if (e.code === 'KeyQ') this.rotateCameraLeft();
            if (e.code === 'KeyR') this.rotateCameraRight();

            // Toggle Zenital View [KeyZ]
            if (e.code === 'KeyZ') this.toggleCameraAngle();
        });

        window.addEventListener('keyup', (e) => {
            if (e.code === 'KeyW' || e.code === 'ArrowUp') this.keys.up = false;
            if (e.code === 'KeyS' || e.code === 'ArrowDown') this.keys.down = false;
            if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.keys.left = false;
            if (e.code === 'KeyD' || e.code === 'ArrowRight') this.keys.right = false;
        });
    }

    setDirectionKey(dir, isDown) {
        if (this.keys.hasOwnProperty(dir)) {
            this.keys[dir] = isDown;
        }
    }

    rotateCameraLeft() {
        // Vista de planta fixa: mantenim orientació fixa al nord
        this.cameraYaw = 0;
        this.targetCameraYaw = 0;
    }

    rotateCameraRight() {
        // Vista de planta fixa: mantenim orientació fixa al nord
        this.cameraYaw = 0;
        this.targetCameraYaw = 0;
    }

    rotateCamera(delta) {
        this.cameraYaw = 0;
        this.targetCameraYaw = 0;
    }

    toggleCameraAngle() {
        // Re-centra la càmera instantàniament sobre el jugador en vista de planta fixa 10º
        this.cameraFocusX = this.playerState.x;
        this.cameraFocusZ = this.playerState.z;
        this.cameraYaw = 0;
        this.targetCameraYaw = 0;
        this.isTopDown = true;
        return true;
    }

    toggleCameraView() {
        return this.toggleCameraAngle();
    }

    tryPlayerJump() {
        // Salt eliminat per requisits de disseny tàctic
        return;
    }

    triggerJump() {
        return;
    }

    // Interacció amb botó 'E': terminal PC, polsador 1-a-1, porta de seguretat o ascensor
    tryInteract() {
        if (this.nearWorkstation) {
            this.hackSecurityWorkstation(this.nearWorkstation);
            return;
        }

        if (this.nearSwitch) {
            this.toggleBreakerSwitch(this.nearSwitch);
            return;
        }

        if (this.nearDoor) {
            if (this.bypassDoorPuzzles) {
                this.toggleSubSecurityDoor(this.nearDoor);
                return;
            }
            if (this.nearDoor.assignedSwitch && !this.nearDoor.assignedSwitch.activated) {
                if (window.showCastleToast) {
                    window.showCastleToast('🔒 Comporta bloquejada pel circuit hidràulic! Acciona el polsador de seguretat proper.');
                }
                if (window.castleAudio) window.castleAudio.playErrorPenalty();
                return;
            }
            if (!this.nearDoor.logicUnlocked) {
                if (this.callbacks.onInteractSubDoor) {
                    this.callbacks.onInteractSubDoor(this.nearDoor);
                } else if (window.openSubDoorPuzzleModal) {
                    window.openSubDoorPuzzleModal(this.nearDoor);
                }
                return;
            }
            this.toggleSubSecurityDoor(this.nearDoor);
            return;
        }

        if (this.nearGate) {
            if (this.bypassDoorPuzzles) {
                if (this.gateInfo && !this.gateInfo.isOpen) this.unlockGateAnimation();
                return;
            }
            if (this.callbacks.onInteractGate) {
                this.callbacks.onInteractGate();
            }
        }
    }

    toggleBreakerSwitch(sw) {
        sw.activated = !sw.activated;
        sw.leverPivot.rotation.x = sw.activated ? 0.55 : -0.55;
        const colorHex = sw.activated ? 0x10b981 : 0xef4444;
        sw.led.material.color.setHex(colorHex);
        sw.light.color.setHex(colorHex);

        if (window.castleAudio) {
            window.castleAudio.playSwitchToggle();
        }

        let statusMsg = '';
        if (sw.targetType === 'laser' && sw.target) {
            const isOff = sw.activated;
            sw.target.lasers.forEach(l => {
                l.active = !isOff;
                l.beamMesh.visible = l.active;
                l.light.visible = l.active;
            });
            statusMsg = isOff
                ? '⚡ Polsador de seguretat: Barrera làser DESACTIVADA!'
                : '⚠️ Polsador de seguretat: Barrera làser REACTIVADA!';
        } else if (sw.targetType === 'door' && sw.target) {
            sw.target.isOpen = sw.activated;
            statusMsg = sw.activated
                ? '🚪 Polsador de seguretat: Comporta DESBLOQUEJADA i OBERTA!'
                : '🔒 Polsador de seguretat: Comporta TANCADA!';
        } else {
            statusMsg = sw.activated
                ? '⚡ Polsador auxiliar connectat!'
                : '⚠️ Polsador auxiliar desconnectat!';
        }

        if (window.showCastleToast) {
            window.showCastleToast(statusMsg);
        }
    }

    unlockGateAnimation() {
        if (this.gateInfo) {
            this.gateInfo.isOpen = true;
            if (this.gateInfo.statusLight) {
                this.gateInfo.statusLight.color.setHex(0x10b981);
            }
        }
    }

    // ========================================================================
    // DETECCIÓ DE LÍNIA DE VISIÓ (LOS) I ALERTA MGS
    // ========================================================================
    checkLineOfSight(x1, z1, x2, z2) {
        const dx = x2 - x1;
        const dz = z2 - z1;
        const dist = Math.hypot(dx, dz);
        if (dist < 0.1) return true;

        const steps = Math.ceil(dist / 0.5);
        for (let i = 1; i < steps; i++) {
            const t = i / steps;
            const rx = x1 + dx * t;
            const rz = z1 + dz * t;

            // Blast walls & Security Doors
            for (const w of this.wallColliders) {
                if (w.isGateCollider && this.gateInfo && this.gateInfo.isOpen) continue;
                if (w.isSubDoorCollider && w.refSubDoor && w.refSubDoor.isOpen) continue;
                if (w.isBox) {
                    if (Math.abs(rx - w.x) < w.half && Math.abs(rz - w.z) < w.half) {
                        return false;
                    }
                } else if (w.r) {
                    if (Math.hypot(rx - w.x, rz - w.z) < w.r) {
                        return false;
                    }
                }
            }

            // Pushable crates provide tactical stealth cover!
            for (const cr of this.pushCrates) {
                if (!cr.inPit && !cr.inLava) {
                    if (Math.abs(rx - cr.x) < cr.half && Math.abs(rz - cr.z) < cr.half) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    worldToGridX(wx) {
        return Math.max(0, Math.min(this.gridW - 1, Math.round(wx / this.tileSize + (this.gridW - 1) / 2)));
    }

    worldToGridZ(wz) {
        return Math.max(0, Math.min(this.gridH - 1, Math.round(wz / this.tileSize + (this.gridH - 1) / 2)));
    }

    canSentryMoveTo(x, z, r = 0.44) {
        const halfW = (this.gridW * this.tileSize) / 2;
        const halfH = (this.gridH * this.tileSize) / 2;
        if (Math.abs(x) > halfW - 0.35 || Math.abs(z) > halfH - 0.35) return false;

        for (let i = 0; i < this.wallColliders.length; i++) {
            const w = this.wallColliders[i];
            if (w.isGateCollider && this.gateInfo && this.gateInfo.isOpen) continue;
            if (w.isSubDoorCollider && w.refSubDoor && w.refSubDoor.isOpen) continue;

            if (w.isBox) {
                const halfX = w.halfX || w.half;
                const halfZ = w.halfZ || w.half;
                if (Math.abs(x - w.x) < (halfX + r) && Math.abs(z - w.z) < (halfZ + r)) {
                    return false;
                }
            } else if (w.r) {
                if (Math.hypot(x - w.x, z - w.z) < (w.r + r)) {
                    return false;
                }
            }
        }

        for (let i = 0; i < this.pushCrates.length; i++) {
            const cr = this.pushCrates[i];
            if (!cr.inPit && !cr.inLava) {
                if (Math.abs(x - cr.x) < (cr.half + r) && Math.abs(z - cr.z) < (cr.half + r)) {
                    return false;
                }
            }
        }

        for (let i = 0; i < this.pits.length; i++) {
            const pit = this.pits[i];
            if (!pit.bridged && Math.hypot(x - pit.x, z - pit.z) < (pit.r + r)) {
                return false;
            }
        }

        for (let i = 0; i < this.lavas.length; i++) {
            const lv = this.lavas[i];
            if (!lv.bridged && Math.abs(x - lv.x) < (lv.half + r) && Math.abs(z - lv.z) < (lv.half + r)) {
                return false;
            }
        }

        return true;
    }

    resolveSentryCollisions(en) {
        const r = en.r || 0.45;

        // Resolve against walls and props
        for (let i = 0; i < this.wallColliders.length; i++) {
            const w = this.wallColliders[i];
            if (w.isGateCollider && this.gateInfo && this.gateInfo.isOpen) continue;
            if (w.isSubDoorCollider && w.refSubDoor && w.refSubDoor.isOpen) continue;

            if (w.isBox) {
                const halfX = w.halfX || w.half;
                const halfZ = w.halfZ || w.half;
                const minX = w.x - halfX - r;
                const maxX = w.x + halfX + r;
                const minZ = w.z - halfZ - r;
                const maxZ = w.z + halfZ + r;

                if (en.x > minX && en.x < maxX && en.z > minZ && en.z < maxZ) {
                    const penLeft = en.x - minX;
                    const penRight = maxX - en.x;
                    const penDown = en.z - minZ;
                    const penUp = maxZ - en.z;
                    const minPen = Math.min(penLeft, penRight, penDown, penUp);

                    if (minPen === penLeft) en.x = minX;
                    else if (minPen === penRight) en.x = maxX;
                    else if (minPen === penDown) en.z = minZ;
                    else en.z = maxZ;
                }
            } else if (w.r) {
                const dx = en.x - w.x;
                const dz = en.z - w.z;
                const dist = Math.hypot(dx, dz);
                const minDist = w.r + r;
                if (dist < minDist && dist > 0.0001) {
                    const push = minDist - dist;
                    en.x += (dx / dist) * push;
                    en.z += (dz / dist) * push;
                }
            }
        }

        // Resolve against crates
        for (let i = 0; i < this.pushCrates.length; i++) {
            const cr = this.pushCrates[i];
            if (cr.inPit || cr.inLava) continue;
            const minX = cr.x - cr.half - r;
            const maxX = cr.x + cr.half + r;
            const minZ = cr.z - cr.half - r;
            const maxZ = cr.z + cr.half + r;

            if (en.x > minX && en.x < maxX && en.z > minZ && en.z < maxZ) {
                const penLeft = en.x - minX;
                const penRight = maxX - en.x;
                const penDown = en.z - minZ;
                const penUp = maxZ - en.z;
                const minPen = Math.min(penLeft, penRight, penDown, penUp);

                if (minPen === penLeft) en.x = minX;
                else if (minPen === penRight) en.x = maxX;
                else if (minPen === penDown) en.z = minZ;
                else en.z = maxZ;
            }
        }

        // Sentry-to-sentry soft separation
        for (let i = 0; i < this.enemies.length; i++) {
            const other = this.enemies[i];
            if (other === en) continue;
            const dx = en.x - other.x;
            const dz = en.z - other.z;
            const dist = Math.hypot(dx, dz);
            const minDist = (en.r || 0.45) + (other.r || 0.45);
            if (dist < minDist && dist > 0.001) {
                const push = (minDist - dist) * 0.5;
                en.x += (dx / dist) * push;
                en.z += (dz / dist) * push;
            }
        }
    }

    isTileWalkableForSentry(cx, rz) {
        if (cx < 0 || cx >= this.gridW || rz < 0 || rz >= this.gridH) return false;
        if (!this.mapData || !this.mapData[rz]) return false;
        const ch = this.mapData[rz][cx];

        if (ch === '#' || ch === '(' || ch === ')' || ch === '{' || ch === '}' || ch === '@' || ch === 'w') return false;
        if (ch === '$' || ch === 't' || ch === 'c' || ch === 'b' || ch === 'a' || ch === 'p' || ch === 'l') return false;
        if (ch === 'G' && (!this.gateInfo || !this.gateInfo.isOpen)) return false;
        if (ch === 'D') {
            const sd = this.subDoors.find(d => d.cx === cx && d.rz === rz);
            if (sd && sd.isLockedBySwitch && !sd.isOpen) return false;
        }
        if (ch === 'Z') {
            const lb = this.lasers.find(l => l.cx === cx && l.rz === rz);
            if (lb && lb.active && !lb.isBlockedByCrate) return false;
        }

        const wx = this.gridToWorldX(cx);
        const wz = this.gridToWorldZ(rz);
        return this.canSentryMoveTo(wx, wz, 0.35);
    }

    checkSentryStraightLineClearance(x0, z0, x1, z1, radius = 0.44) {
        const dist = Math.hypot(x1 - x0, z1 - z0);
        const steps = Math.ceil(dist / 0.35);
        for (let s = 1; s <= steps; s++) {
            const t = s / steps;
            const sx = x0 + (x1 - x0) * t;
            const sz = z0 + (z1 - z0) * t;
            if (!this.canSentryMoveTo(sx, sz, radius)) {
                return false;
            }
        }
        return true;
    }

    findSentryAStarPath(startX, startZ, targetX, targetZ) {
        let sgx = this.worldToGridX(startX);
        let sgz = this.worldToGridZ(startZ);
        let tgx = this.worldToGridX(targetX);
        let tgz = this.worldToGridZ(targetZ);

        if (!this.isTileWalkableForSentry(sgx, sgz)) {
            let found = false;
            for (let rad = 1; rad <= 2 && !found; rad++) {
                for (let dy = -rad; dy <= rad && !found; dy++) {
                    for (let dx = -rad; dx <= rad && !found; dx++) {
                        if (this.isTileWalkableForSentry(sgx + dx, sgz + dy)) {
                            sgx += dx; sgz += dy; found = true;
                        }
                    }
                }
            }
        }

        if (!this.isTileWalkableForSentry(tgx, tgz)) {
            let found = false;
            for (let rad = 1; rad <= 2 && !found; rad++) {
                for (let dy = -rad; dy <= rad && !found; dy++) {
                    for (let dx = -rad; dx <= rad && !found; dx++) {
                        if (this.isTileWalkableForSentry(tgx + dx, tgz + dy)) {
                            tgx += dx; tgz += dy; found = true;
                        }
                    }
                }
            }
        }

        if (sgx === tgx && sgz === tgz) {
            return [{ x: targetX, z: targetZ }];
        }

        const openSet = [{ gx: sgx, gz: sgz, g: 0, f: Math.hypot(tgx - sgx, tgz - sgz) }];
        const cameFrom = new Map();
        const gScore = new Map();
        const key = (x, z) => `${x},${z}`;
        gScore.set(key(sgx, sgz), 0);

        const DIRS = [
            { dx: 0, dz: 1, cost: 1.0 },
            { dx: 0, dz: -1, cost: 1.0 },
            { dx: 1, dz: 0, cost: 1.0 },
            { dx: -1, dz: 0, cost: 1.0 },
            { dx: 1, dz: 1, cost: 1.414, diag: true },
            { dx: 1, dz: -1, cost: 1.414, diag: true },
            { dx: -1, dz: 1, cost: 1.414, diag: true },
            { dx: -1, dz: -1, cost: 1.414, diag: true }
        ];

        let iterations = 0;
        const MAX_ITER = 350;

        while (openSet.length > 0 && iterations++ < MAX_ITER) {
            openSet.sort((a, b) => a.f - b.f);
            const curr = openSet.shift();

            if (curr.gx === tgx && curr.gz === tgz) {
                const path = [];
                let cKey = key(tgx, tgz);
                while (cameFrom.has(cKey)) {
                    const node = cameFrom.get(cKey);
                    path.unshift({
                        x: this.gridToWorldX(node.gx),
                        z: this.gridToWorldZ(node.gz)
                    });
                    cKey = key(node.gx, node.gz);
                }
                path.push({ x: targetX, z: targetZ });
                return path;
            }

            const currG = gScore.get(key(curr.gx, curr.gz));

            for (const dir of DIRS) {
                const nx = curr.gx + dir.dx;
                const nz = curr.gz + dir.dz;
                if (!this.isTileWalkableForSentry(nx, nz)) continue;

                if (dir.diag) {
                    if (!this.isTileWalkableForSentry(curr.gx + dir.dx, curr.gz) || !this.isTileWalkableForSentry(curr.gx, curr.gz + dir.dz)) {
                        continue;
                    }
                }

                const tentativeG = currG + dir.cost;
                const nKey = key(nx, nz);
                if (!gScore.has(nKey) || tentativeG < gScore.get(nKey)) {
                    gScore.set(nKey, tentativeG);
                    cameFrom.set(nKey, { gx: curr.gx, gz: curr.gz });
                    const h = Math.hypot(tgx - nx, tgz - nz);
                    openSet.push({ gx: nx, gz: nz, g: tentativeG, f: tentativeG + h });
                }
            }
        }

        return [{ x: targetX, z: targetZ }];
    }

    triggerAlert(sourceName, x, z) {
        if (sourceName === 'PIT_HAZARD' || sourceName === 'ELECTRIC_GRID') {
            this.spawnBurstParticles(x, z, 0xef4444);
            this.respawnPlayerAtCheckpoint();
            if (this.callbacks.onPlayerHazardHit) {
                this.callbacks.onPlayerHazardHit(sourceName);
            }
            return;
        }

        const isNewAlert = this.alertState !== 'ALERT';
        this.alertState = 'ALERT';
        this.alertTimer = 15.0;
        this.lastKnownPlayerPos = { x: this.playerState.x, z: this.playerState.z };

        this.updateAlertUI();

        if (isNewAlert) {
            if (window.castleAudio) {
                window.castleAudio.playAlert();
                window.castleAudio.startAlarmSiren();
            }

            const vignette = document.getElementById('vignette-overlay');
            if (vignette) {
                vignette.classList.add('damage-flash');
                setTimeout(() => vignette.classList.remove('damage-flash'), 650);
            }

            this.spawnBurstParticles(x, z, 0xef4444);

            if (window.showCastleToast) {
                if (sourceName === 'CAMERA_DETECTED') {
                    window.showCastleToast('🚨 [!] ALERTA! Una càmera t\'ha detectat! Patrulles i dron Cypher activats!');
                } else if (sourceName === 'GUARD_DETECTED') {
                    window.showCastleToast('🚨 [!] ALERTA! T\'han descobert! Sentinelles en persecució!');
                } else {
                    window.showCastleToast('🚨 [!] ALERTA! Tripwire làser tallat! Tota la base està en alerta!');
                }
            }
        }

        // Desplegar Dron Cypher des d'una cantonada exterior del perímetre
        if (sourceName === 'CAMERA_DETECTED' || sourceName === 'GUARD_DETECTED') {
            this.deployAttackDrones(x, z);
        }

        for (const en of this.enemies) {
            en.aiState = 'CHASE';
            en.lastKnownX = this.playerState.x;
            en.lastKnownZ = this.playerState.z;
            en.alertMesh.visible = true;
            en.coneMesh.material.color.setHex(0xff1744);
            en.coneMesh.material.opacity = 0.65;
        }
    }

    deployAttackDrones(sourceX, sourceZ) {
        if (!this.drones) this.drones = [];
        const activeCount = this.drones.filter(d => d.state === 'ATTACK').length;
        if (activeCount >= 1) return; // màxim 1 dron aeri actiu per no aclaparar

        // Cercar les 4 cantonades del perímetre exterior del mapa
        const corners = [
            { x: this.gridToWorldX(1), z: this.gridToWorldZ(1) },
            { x: this.gridToWorldX(this.gridW - 2), z: this.gridToWorldZ(1) },
            { x: this.gridToWorldX(1), z: this.gridToWorldZ(this.gridH - 2) },
            { x: this.gridToWorldX(this.gridW - 2), z: this.gridToWorldZ(this.gridH - 2) }
        ];

        // Seleccionar la cantonada més allunyada d'Snake
        corners.sort((a, b) => {
            const dA = Math.hypot(a.x - this.playerState.x, a.z - this.playerState.z);
            const dB = Math.hypot(b.x - this.playerState.x, b.z - this.playerState.z);
            return dB - dA;
        });
        const spawnCorner = corners[0];

        if (window.castleAudio && window.castleAudio.playDroneDeploy) {
            window.castleAudio.playDroneDeploy();
        }

        if (window.showCastleToast) {
            window.showCastleToast('🛸 [!] Dron Cypher desplegat des del perímetre! S\'està apropant...');
        }

        this.spawnMiniDrone(spawnCorner.x, spawnCorner.z);
    }

    spawnMiniDrone(spawnX, spawnZ) {
        const group = new THREE.Group();
        group.position.set(spawnX, 3.8, spawnZ);

        // 1. Xassís aerodinàmic d'acer fosc
        const bodyGeo = new THREE.OctahedronGeometry(0.32, 1);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.25 });
        const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
        bodyMesh.scale.set(1.15, 0.45, 1.35);
        bodyMesh.castShadow = (this.perfMode === 'HIGH');
        group.add(bodyMesh);

        // 2. Sensor òptic ocular vermell brillant
        const eyeGeo = new THREE.SphereGeometry(0.09, 12, 12);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff1744 });
        const eyeMesh = new THREE.Mesh(eyeGeo, eyeMat);
        eyeMesh.position.set(0, -0.02, 0.38);
        group.add(eyeMesh);

        const eyeLight = new THREE.PointLight(0xff1744, 1.4, 4.5);
        eyeLight.position.set(0, -0.02, 0.45);
        group.add(eyeLight);

        // 3. 4 Aspes VTOL giratòries
        const armMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.4 });
        const rotorMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.65 });
        const rotorBlades = [];
        const offsets = [
            [-0.45, 0.45],
            [0.45, 0.45],
            [-0.45, -0.45],
            [0.45, -0.45]
        ];

        for (let i = 0; i < 4; i++) {
            const [ox, oz] = offsets[i];
            const podGroup = new THREE.Group();
            podGroup.position.set(ox, 0.08, oz);

            const hubGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.12, 8);
            const hubMesh = new THREE.Mesh(hubGeo, bodyMat);
            podGroup.add(hubMesh);

            const bladeGeo = new THREE.BoxGeometry(0.28, 0.015, 0.04);
            const blade1 = new THREE.Mesh(bladeGeo, rotorMat);
            const blade2 = new THREE.Mesh(bladeGeo, rotorMat);
            blade2.rotation.y = Math.PI / 2;
            const bladeGroup = new THREE.Group();
            bladeGroup.add(blade1);
            bladeGroup.add(blade2);
            podGroup.add(bladeGroup);
            rotorBlades.push(bladeGroup);

            group.add(podGroup);
        }

        // 4. Canó inferior de polsos
        const cannonGroup = new THREE.Group();
        cannonGroup.position.set(0, -0.22, 0.2);
        const barrelGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.42, 8);
        barrelGeo.rotateX(Math.PI / 2);
        const cannonMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.15 });
        const barrel = new THREE.Mesh(barrelGeo, cannonMat);
        cannonGroup.add(barrel);

        const muzzleGeo = new THREE.OctahedronGeometry(0.14, 0);
        const muzzleMat = new THREE.MeshBasicMaterial({ color: 0xff0055, transparent: true, opacity: 0.9 });
        const muzzleFlash = new THREE.Mesh(muzzleGeo, muzzleMat);
        muzzleFlash.position.set(0, 0, 0.28);
        muzzleFlash.visible = false;
        cannonGroup.add(muzzleFlash);

        const muzzleLight = new THREE.PointLight(0xff0055, 0, 6.0);
        muzzleLight.position.set(0, 0, 0.32);
        cannonGroup.add(muzzleLight);
        group.add(cannonGroup);

        this.scene.add(group);

        const drone = {
            group,
            rotorBlades,
            muzzleFlash,
            muzzleLight,
            muzzleTimer: 0,
            x: spawnX,
            y: 3.8,
            z: spawnZ,
            targetY: 3.2,
            fireCooldown: 2.2, // Temps inicial abans del primer tret
            state: 'ATTACK',
            bobPhase: Math.random() * Math.PI * 2
        };

        this.drones.push(drone);
        return drone;
    }

    updateDrones(dt, elapsed) {
        if (!this.drones || this.drones.length === 0) return;

        const isAlert = (this.alertState === 'ALERT' || this.alertState === 'EVASION');

        for (let i = this.drones.length - 1; i >= 0; i--) {
            const d = this.drones[i];

            // Girar aspes
            for (const b of d.rotorBlades) {
                b.rotation.y += dt * 36.0;
            }

            // Flaix de tret
            if (d.muzzleTimer > 0) {
                d.muzzleTimer -= dt;
                if (d.muzzleTimer <= 0) {
                    d.muzzleFlash.visible = false;
                    d.muzzleLight.intensity = 0;
                }
            }

            // Si l'alerta s'acaba, ascens cap a l'estratosfera
            if (!isAlert) {
                d.state = 'RETREAT';
            }

            if (d.state === 'RETREAT') {
                d.y += dt * 7.0;
                d.group.position.y = d.y;
                if (d.y > 22.0) {
                    this.scene.remove(d.group);
                    this.drones.splice(i, 1);
                    continue;
                }
                continue;
            }

            // Navegació tàctica del dron:
            // En ALERT: persegueix la posició en temps real del jugador
            // En EVASION: es dirigeix cap a l'última posició coneguda i rastreja la zona
            const isFullAlert = (this.alertState === 'ALERT');
            const targetX = isFullAlert ? this.playerState.x : (this.lastKnownPlayerPos ? this.lastKnownPlayerPos.x : this.playerState.x);
            const targetZ = isFullAlert ? this.playerState.z : (this.lastKnownPlayerPos ? this.lastKnownPlayerPos.z : this.playerState.z);

            const dx = targetX - d.x;
            const dz = targetZ - d.z;
            const dist2D = Math.hypot(dx, dz);

            // Oscil·lació de vol
            d.bobPhase += dt * 3.2;
            d.y = 3.2 + Math.sin(d.bobPhase) * 0.24;

            // Velocitat sostinguda (arriba de veritat fins a la posició)
            const speed = 3.4;
            const stopDist = isFullAlert ? 2.0 : 0.8;

            if (dist2D > stopDist) {
                const normX = dx / dist2D;
                const normZ = dz / dist2D;
                d.x += normX * speed * dt;
                d.z += normZ * speed * dt;
            } else if (dist2D < 1.4 && isFullAlert) {
                // Si és massa a sobre, s'aparta lleugerament per mantenir angle de tret
                const normX = dx / Math.max(0.01, dist2D);
                const normZ = dz / Math.max(0.01, dist2D);
                d.x -= normX * (speed * 0.4) * dt;
                d.z -= normZ * (speed * 0.4) * dt;
            }

            d.group.position.set(d.x, d.y, d.z);

            // Orientació del dron cap a Snake
            const px = this.playerState.x;
            const pz = this.playerState.z;
            const toSnakeX = px - d.x;
            const toSnakeZ = pz - d.z;
            const distToSnake = Math.hypot(toSnakeX, toSnakeZ);

            if (distToSnake > 0.1) {
                const targetYaw = Math.atan2(toSnakeX, toSnakeZ);
                d.group.rotation.y = targetYaw;
            }

            // Detecció per sensor del dron: si el dron veu en Snake en EVASIÓ, reactiva l'alerta!
            const hasLOS = (distToSnake < 8.5) && this.checkSentryStraightLineClearance(d.x, d.z, px, pz, 0.25);
            if (hasLOS) {
                this.lastKnownPlayerPos = { x: px, z: pz };
                if (this.alertState === 'EVASION') {
                    this.alertState = 'ALERT';
                    this.alertTimer = Math.max(this.alertTimer, 8.0);
                    this.updateAlertUI();
                    if (window.showCastleToast) {
                        window.showCastleToast("🚨 [!] El dron Cypher t'ha localitzat amb l'escàner de calor!");
                    }
                    if (window.castleAudio) window.castleAudio.playAlert();
                }
            }

            // Foc del dron només si té visió directa i estem en alerta
            d.fireCooldown -= dt;
            if (d.fireCooldown <= 0 && distToSnake < 8.0 && hasLOS && this.alertState === 'ALERT') {
                d.fireCooldown = 1.5 + Math.random() * 0.4;

                d.muzzleFlash.visible = true;
                d.muzzleLight.intensity = 3.6;
                d.muzzleTimer = 0.09;

                if (window.castleAudio && window.castleAudio.playDroneLaser) {
                    window.castleAudio.playDroneLaser();
                }

                this.spawnBullet(
                    d.x, d.y - 0.15, d.z,
                    this.playerState.x, this.playerState.y + 0.85, this.playerState.z
                );
            }
        }
    }

    spawnBullet(fromX, fromY, fromZ, targetX, targetY, targetZ) {
        const dx = targetX - fromX;
        const dy = targetY - fromY;
        const dz = targetZ - fromZ;
        const dist = Math.hypot(dx, dy, dz);
        if (dist < 0.01) return;

        // Spread for aim inaccuracy (allows player dodging)
        const spread = (Math.random() - 0.5) * 0.16;
        const normX = dx / dist + spread * (dz / dist);
        const normZ = dz / dist - spread * (dx / dist);
        const normY = dy / dist;

        const bulletGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.55, 6);
        bulletGeo.rotateX(Math.PI / 2);
        const bulletMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
        const bulletMesh = new THREE.Mesh(bulletGeo, bulletMat);
        bulletMesh.position.set(fromX, fromY, fromZ);

        const lookTarget = new THREE.Vector3(fromX + normX, fromY + normY, fromZ + normZ);
        bulletMesh.lookAt(lookTarget);
        this.scene.add(bulletMesh);

        const speed = 26.0;
        this.bullets.push({
            mesh: bulletMesh,
            x: fromX,
            y: fromY,
            z: fromZ,
            vx: normX * speed,
            vy: normY * speed,
            vz: normZ * speed,
            life: 1.1
        });
    }

    damagePlayerFromGunfire(amount = 25) {
        if (this.playerState.invulnTimer > 0) return;
        this.playerState.invulnTimer = 0.75;

        this.playerHealth = Math.max(0, this.playerHealth - amount);
        this.updateHealthUI();

        if (window.castleAudio) {
            window.castleAudio.playPlayerHit();
        }

        const vignette = document.getElementById('vignette-overlay');
        if (vignette) {
            vignette.classList.add('damage-flash');
            setTimeout(() => vignette.classList.remove('damage-flash'), 450);
        }

        this.spawnBurstParticles(this.playerState.x, this.playerState.z, 0xef4444);

        if (this.playerHealth <= 0) {
            this.onPlayerNeutralized();
        }
    }

    onPlayerNeutralized() {
        if (this.isNeutralized) return;
        this.isNeutralized = true;

        if (window.castleAudio) {
            window.castleAudio.stopAlarmSiren();
            window.castleAudio.playAlert();
        }

        if (window.showPlayerDownModal) {
            window.showPlayerDownModal(45, 'Neutralitzat en Combat');
        } else {
            this.finishRespawnPlayer();
        }
    }

    finishRespawnPlayer() {
        this.isNeutralized = false;
        this.playerHealth = 100;
        this.updateHealthUI();
        this.alertState = 'NORMAL';
        this.alertTimer = 0;
        this.updateAlertUI();

        this.respawnPlayerAtCheckpoint();
        this.playerState.invulnTimer = 3.0;

        if (this.drones && this.drones.length > 0) {
            for (const d of this.drones) {
                if (d.group) this.scene.remove(d.group);
            }
            this.drones = [];
        }

        for (const en of this.enemies) {
            en.aiState = 'PATROL';
            if (en.alertMesh) en.alertMesh.visible = false;
            if (en.coneMesh && en.coneMesh.material) {
                en.coneMesh.material.color.setHex(0xf59e0b);
                en.coneMesh.material.opacity = 0.44;
            }
        }

        // Discs PAL: es conserven els que ja estaven recollits!
        if (this.crystals && this.crystals.length > 0) {
            for (const c of this.crystals) {
                if (c.collected) {
                    if (c.group) c.group.visible = false;
                } else {
                    if (c.group) c.group.visible = true;
                }
            }
        }

        if (this.workstations && this.workstations.length > 0) {
            for (const ws of this.workstations) {
                // Si el PC ja estava hackejat, es manté hackejat
                if (ws.hacked) {
                    if (ws.monLScreen) ws.monLScreen.material = this.materials.screenGreen;
                    if (ws.monRScreen) ws.monRScreen.material = this.materials.screenGreen;
                    if (ws.pwrLed) ws.pwrLed.material = this.materials.laserGreen;
                    if (ws.pcGlow) ws.pcGlow.color.setHex(0x10b981);
                    if (ws.holoGroup) ws.holoGroup.visible = false;
                }
            }
        }

        // Comportes intermèdies: les ja desbloquejades es mantenen obertes i lliures!
        if (this.subDoors && this.subDoors.length > 0) {
            for (const sd of this.subDoors) {
                if (this.bypassDoorPuzzles || sd.logicUnlocked) {
                    sd.logicUnlocked = true;
                    sd.isOpen = true;
                    sd.openProgress = 1.0;
                    if (sd.doorMesh) sd.doorMesh.position.y = 3.2;
                    if (sd.ledMat) sd.ledMat.color.setHex(0x10b981);
                } else {
                    sd.isOpen = false;
                    sd.openProgress = 0;
                    if (sd.doorMesh) sd.doorMesh.position.y = 1.1;
                    if (sd.ledMat) sd.ledMat.color.setHex(0xf59e0b);
                }
            }
        }

        if (this.bypassDoorPuzzles && this.gateInfo) {
            this.unlockGateAnimation();
        }

        if (window.showCastleToast) {
            window.showCastleToast('🐍 Reaparegut al punt d\'infiltració [S]! Mantens els discs PAL i comportes obertes.');
        }
    }

    updateHealthUI() {
        const fill = document.getElementById('hud-life-fill');
        if (fill) {
            const pct = Math.max(0, Math.min(100, this.playerHealth));
            fill.style.width = pct + '%';
            fill.classList.remove('warning', 'danger');
            if (pct <= 25) {
                fill.classList.add('danger');
            } else if (pct <= 50) {
                fill.classList.add('warning');
            }
        }
    }

    updateAlertUI() {
        const alertBox = document.getElementById('hud-alert-box');
        const badge = document.getElementById('hud-alert-badge');
        const gauge = document.getElementById('hud-alert-countdown');
        if (!alertBox || !badge || !gauge) return;

        alertBox.classList.remove('alert-normal', 'alert-evasion', 'alert-active');

        if (this.alertState === 'ALERT') {
            alertBox.classList.add('alert-active');
            badge.textContent = '🚨 ALERTA';
            gauge.textContent = Math.ceil(this.alertTimer) + 's';
        } else if (this.alertState === 'EVASION') {
            alertBox.classList.add('alert-evasion');
            badge.textContent = '⚠️ EVASIÓ';
            gauge.textContent = Math.ceil(this.alertTimer) + 's';
        } else {
            alertBox.classList.add('alert-normal');
            badge.textContent = 'NORMAL';
            gauge.textContent = '99.99';
        }
    }

    updateBullets(dt) {
        if (!this.bullets || !this.bullets.length) return;

        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            b.life -= dt;
            b.x += b.vx * dt;
            b.y += b.vy * dt;
            b.z += b.vz * dt;
            b.mesh.position.set(b.x, b.y, b.z);

            let removed = false;

            // Hit Snake check
            const px = this.playerState.x;
            const py = this.playerState.y + 0.85;
            const pz = this.playerState.z;
            const distToPlayer = Math.hypot(b.x - px, b.z - pz);

            if (distToPlayer < 0.55 && Math.abs(b.y - py) < 1.15) {
                this.damagePlayerFromGunfire(25);
                this.scene.remove(b.mesh);
                this.bullets.splice(i, 1);
                continue;
            }

            // Hit Walls, Closed Subdoors, Blast Gate
            for (let w = 0; w < this.wallColliders.length; w++) {
                const wc = this.wallColliders[w];
                if (wc.isGateCollider && this.gateInfo && this.gateInfo.isOpen) continue;
                if (wc.isSubDoorCollider && wc.refSubDoor && wc.refSubDoor.isOpen) continue;

                if (wc.isBox) {
                    if (Math.abs(b.x - wc.x) < wc.half && Math.abs(b.z - wc.z) < wc.half && b.y < (wc.topY || 2.4)) {
                        removed = true;
                        break;
                    }
                } else if (wc.r) {
                    if (Math.hypot(b.x - wc.x, b.z - wc.z) < wc.r && b.y < (wc.topY || 2.4)) {
                        removed = true;
                        break;
                    }
                }
            }

            // Hit Pushable Cover Crates
            if (!removed) {
                for (let c = 0; c < this.pushCrates.length; c++) {
                    const cr = this.pushCrates[c];
                    if (!cr.inPit && !cr.inLava) {
                        if (Math.abs(b.x - cr.x) < cr.half && Math.abs(b.z - cr.z) < cr.half && b.y < cr.size) {
                            removed = true;
                            break;
                        }
                    }
                }
            }

            if (removed || b.life <= 0) {
                if (removed && window.castleAudio) window.castleAudio.playBulletImpact();
                this.spawnBurstParticles(b.x, b.z, 0xfde047);
                this.scene.remove(b.mesh);
                this.bullets.splice(i, 1);
            }
        }
    }

    respawnPlayerAtCheckpoint() {
        this.playerState.x = this.playerState.spawnX;
        this.playerState.y = 0;
        this.playerState.z = this.playerState.spawnZ;
        this.playerState.vx = 0;
        this.playerState.vz = 0;
        this.playerState.vy = 0;
        this.playerState.isGrounded = true;
    }

    // ========================================================================
    // FÍSIQUES DE MOVIMENT AMB INÈRCIA I COL·LISIONS
    // ========================================================================
    canMoveTo(x, z, r = 0.38) {
        // Walls, Sub-doors, Pillars
        for (const w of this.wallColliders) {
            if (w.isGateCollider && this.gateInfo && this.gateInfo.isOpen) continue;
            if (w.isSubDoorCollider && w.refSubDoor && w.refSubDoor.isOpen) continue;

            if (w.isBox) {
                const hX = w.halfX || w.half;
                const hZ = w.halfZ || w.half;
                if (Math.abs(x - w.x) < (hX + r) && Math.abs(z - w.z) < (hZ + r)) {
                    if (w.isWall) return false;
                    if (this.playerState.y < (w.topY || 2.2) - 0.15) {
                        return false;
                    }
                }
            } else if (w.r) {
                if (Math.hypot(x - w.x, z - w.z) < (w.r + r)) {
                    if (w.isWall) return false;
                    if (this.playerState.y < (w.topY || 2.2) - 0.15) {
                        return false;
                    }
                }
            }
        }

        // Pushable shipping crates
        for (const cr of this.pushCrates) {
            if (cr.inPit || cr.inLava) continue;
            if (Math.abs(x - cr.x) < (cr.half + r) && Math.abs(z - cr.z) < (cr.half + r)) {
                if (this.playerState.y < cr.size - 0.15) {
                    return false;
                }
            }
        }

        return true;
    }

    tryPushCrate(dirX, dirZ, dt) {
        const px = this.playerState.x;
        const pz = this.playerState.z;
        const pushReach = 1.05;

        for (const cr of this.pushCrates) {
            if (cr.inPit || cr.inLava) continue;
            const dist = Math.hypot(px - cr.x, pz - cr.z);
            if (dist < cr.half + pushReach) {
                const nx = cr.x + dirX * 5.2 * dt;
                const nz = cr.z + dirZ * 5.2 * dt;

                let blocked = false;
                for (const w of this.wallColliders) {
                    if (w.isBox) {
                        if (Math.abs(nx - w.x) < (w.half + cr.half) && Math.abs(nz - w.z) < (w.half + cr.half)) {
                            blocked = true;
                            break;
                        }
                    }
                }

                if (!blocked) {
                    cr.x = nx;
                    cr.z = nz;
                    cr.group.position.set(cr.x, cr.y, cr.z);

                    if (window.castleAudio) window.castleAudio.playPush();

                    // Check if crate falls into ventilation pit
                    for (const pit of this.pits) {
                        if (!pit.bridged && Math.hypot(cr.x - pit.x, cr.z - pit.z) < pit.r * 0.75) {
                            pit.bridged = true;
                            cr.inPit = true;
                            cr.y = -0.55;
                            cr.group.position.set(cr.x, cr.y, cr.z);
                            if (this.callbacks.onBridgeCreated) this.callbacks.onBridgeCreated('PIT');
                            break;
                        }
                    }

                    // Check if crate is placed on a floor pressure plate
                    for (const plate of this.pressurePlates) {
                        if (Math.hypot(cr.x - plate.x, cr.z - plate.z) < 0.85) {
                            plate.isPressed = true;
                            plate.plateMesh.position.y = -0.06;
                            plate.plateMesh.material = this.materials.pressurePlateOn;
                            // Keep sub-doors open
                            this.subDoors.forEach(sd => sd.isOpen = true);
                            if (window.castleAudio) window.castleAudio.playPressurePlate();
                        }
                    }
                }
            }
        }
    }

    // ========================================================================
    // BUCLE PRINCIPAL D'ACTUALITZACIÓ (UPDATE DT)
    // ========================================================================
    update(dt) {
        if (this.paused) return;
        const elapsed = this.clock.getElapsedTime();

        // Update Snake's live grid position in HUD and debug displays
        const curGX = this.worldToGridX(this.playerState.x);
        const curGZ = this.worldToGridZ(this.playerState.z);
        if (this._lastReportedGX !== curGX || this._lastReportedGZ !== curGZ) {
            this._lastReportedGX = curGX;
            this._lastReportedGZ = curGZ;
            const coordStr = `C${String(curGX).padStart(2, '0')}:R${String(curGZ).padStart(2, '0')}`;
            const areaStr = this.getGridAreaName(curGX, curGZ);

            const curCoordEl = document.getElementById('hud-snake-coord');
            if (curCoordEl) curCoordEl.textContent = coordStr;
            const curAreaEl = document.getElementById('hud-snake-area');
            if (curAreaEl) curAreaEl.textContent = `(${areaStr})`;

            const dbgPosEl = document.getElementById('debug-snake-pos');
            if (dbgPosEl) dbgPosEl.textContent = coordStr;
            const dbgAreaEl = document.getElementById('debug-snake-area');
            if (dbgAreaEl) dbgAreaEl.textContent = areaStr;
        }

        const dbgLifeEl = document.getElementById('debug-snake-life');
        if (dbgLifeEl) dbgLifeEl.textContent = Math.round(this.playerHealth) + '%';
        const dbgAlertEl = document.getElementById('debug-snake-alert');
        if (dbgAlertEl) dbgAlertEl.textContent = this.alertState;

        // Dynamic Live In-Game Badges for Characters (Snake, Guards, Drones)
        if (this.debug3DVisible) {
            // 1. Snake Live Badge
            if (this.snakeDebugBadge) {
                this.snakeDebugBadge.position.set(this.playerState.x, 2.65, this.playerState.z);
                if (this._lastSnakeBadgeGX !== curGX || this._lastSnakeBadgeGZ !== curGZ) {
                    this._lastSnakeBadgeGX = curGX;
                    this._lastSnakeBadgeGZ = curGZ;
                    const coordStr = `C${String(curGX).padStart(2, '0')}:R${String(curGZ).padStart(2, '0')}`;
                    this.updateDebugBadgeContent(this.snakeDebugBadge, '[SNAKE]', coordStr, '#22c55e');
                }
            }

            // 2. Sentinels Live Badges (Enemies)
            if (this.enemies) {
                for (let i = 0; i < this.enemies.length; i++) {
                    const en = this.enemies[i];
                    if (en.debugBadge) {
                        en.debugBadge.position.set(en.x, 2.8, en.z);
                        const egx = this.worldToGridX(en.x);
                        const egz = this.worldToGridZ(en.z);
                        if (en._dbgGX !== egx || en._dbgGZ !== egz || en._dbgState !== en.state) {
                            en._dbgGX = egx;
                            en._dbgGZ = egz;
                            en._dbgState = en.state;
                            const stateTxt = en.state === 'ALERT' ? '🚨ALERTA' : (en.state === 'SUSPICIOUS' ? '❓SOSPITA' : '👁️PATRULLA');
                            const coordStr = `C${String(egx).padStart(2, '0')}:R${String(egz).padStart(2, '0')}`;
                            const col = en.state === 'ALERT' ? '#ef4444' : (en.state === 'SUSPICIOUS' ? '#f59e0b' : '#38bdf8');
                            this.updateDebugBadgeContent(en.debugBadge, `[GUARD-${String(i + 1).padStart(2, '0')}] ${stateTxt}`, coordStr, col);
                        }
                    }
                }
            }

            // 3. Mini-Drones Live Badges
            if (this.drones) {
                for (let i = 0; i < this.drones.length; i++) {
                    const dr = this.drones[i];
                    if (dr.debugBadge) {
                        dr.debugBadge.position.set(dr.x, (dr.y || 2.2) + 1.45, dr.z);
                        const dgx = this.worldToGridX(dr.x);
                        const dgz = this.worldToGridZ(dr.z);
                        if (dr._dbgGX !== dgx || dr._dbgGZ !== dgz) {
                            dr._dbgGX = dgx;
                            dr._dbgGZ = dgz;
                            const coordStr = `C${String(dgx).padStart(2, '0')}:R${String(dgz).padStart(2, '0')}`;
                            this.updateDebugBadgeContent(dr.debugBadge, `[DRONE-${String(i + 1).padStart(2, '0')}]`, coordStr, '#f43f5e');
                        }
                    }
                }
            }

            // 4. Pushable Crates Live Badges
            if (this.pushCrates) {
                for (let i = 0; i < this.pushCrates.length; i++) {
                    const cr = this.pushCrates[i];
                    if (cr.debugBadge) {
                        cr.debugBadge.position.set(cr.x, 2.5, cr.z);
                        const cgx = this.worldToGridX(cr.x);
                        const cgz = this.worldToGridZ(cr.z);
                        if (cr._dbgGX !== cgx || cr._dbgGZ !== cgz) {
                            cr._dbgGX = cgx;
                            cr._dbgGZ = cgz;
                            const coordStr = `C${String(cgx).padStart(2, '0')}:R${String(cgz).padStart(2, '0')}`;
                            this.updateDebugBadgeContent(cr.debugBadge, `[CRATE-${String(i + 1).padStart(2, '0')}]`, coordStr, '#cbd5e1');
                        }
                    }
                }
            }
        }

        // 1. Alert Decay & Evasion Transition (15s total sense ser vist per escapar)
        if (this.alertTimer > 0) {
            this.alertTimer -= dt;
            if (this.alertState === 'ALERT' && this.alertTimer <= 7.0) {
                this.alertState = 'EVASION';
                for (const en of this.enemies) {
                    if (en.coneMesh && en.coneMesh.material) {
                        en.coneMesh.material.color.setHex(0xf59e0b);
                        en.coneMesh.material.opacity = 0.50;
                    }
                }
                if (window.showCastleToast) {
                    window.showCastleToast('⚠️ EVASIÓ: Els sentinelles han perdut el teu rastre! Roman amagat...');
                }
            }
            if (this.alertTimer <= 0) {
                this.alertState = 'NORMAL';
                this.alertTimer = 0;
                if (window.castleAudio) {
                    window.castleAudio.stopAlarmSiren();
                }
                for (const en of this.enemies) {
                    en.aiState = 'RETURN_TO_PATROL';
                    en.alertMesh.visible = false;
                    if (en.coneMesh && en.coneMesh.material) {
                        en.coneMesh.material.color.setHex(0xf59e0b);
                        en.coneMesh.material.opacity = 0.44;
                    }
                    // Cercar el waypoint de patrulla més proper i generar camí A* per tornar-hi
                    if (en.waypoints && en.waypoints.length > 0) {
                        let closestIdx = 0;
                        let minDist = Infinity;
                        for (let w = 0; w < en.waypoints.length; w++) {
                            const d = Math.hypot(en.waypoints[w].x - en.x, en.waypoints[w].z - en.z);
                            if (d < minDist) {
                                minDist = d;
                                closestIdx = w;
                            }
                        }
                        en.wpIndex = closestIdx;
                        const targetWp = en.waypoints[closestIdx];
                        en.returnPath = this.findSentryAStarPath(en.x, en.z, targetWp.x, targetWp.z);
                        en.returnPathIndex = 0;
                    }
                }
                if (window.showCastleToast) {
                    window.showCastleToast('🌿 Has aconseguit escapar! Alerta cancel·lada.');
                }
            }
            this.updateAlertUI();
        } else {
            if (this.alertState !== 'NORMAL') {
                this.alertState = 'NORMAL';
                this.updateAlertUI();
                if (window.castleAudio) window.castleAudio.stopAlarmSiren();
            }
        }

        // Natural health regeneration when safe (8 HP/sec)
        if (this.alertState === 'NORMAL' && this.playerHealth < 100) {
            this.playerHealth = Math.min(100, this.playerHealth + dt * 8.0);
            this.updateHealthUI();
        }

        // Update active combat bullets
        this.updateBullets(dt);

        // Update aerial attack drones
        this.updateDrones(dt, elapsed);

        // 2. Weather & Particles
        this.updateSnow(dt);
        this.updateParticles(dt);

        // Spin ventilation shaft turbine fans
        for (const fan of this.turbineFans) {
            fan.rotation.y += dt * 6.5;
        }

        // Animate Tesla electric arcs
        for (const lv of this.lavas) {
            if (!lv.bridged && lv.arcLine) {
                const pos = lv.arcLine.geometry.attributes.position.array;
                for (let p = 0; p < pos.length; p += 3) {
                    pos[p] = (Math.random() - 0.5) * lv.size * 0.85;
                    pos[p + 1] = 0.12 + Math.random() * 0.25;
                    pos[p + 2] = (Math.random() - 0.5) * lv.size * 0.85;
                }
                lv.arcLine.geometry.attributes.position.needsUpdate = true;
                lv.light.intensity = 0.8 + Math.random() * 0.6;
            }
        }

        // Periodic Steam Vents
        for (const sv of this.steamPipes) {
            sv.steamTimer -= dt;
            if (sv.steamTimer <= 0) {
                sv.steamTimer = 3.5 + Math.random() * 2.5;
                this.spawnBurstParticles(sv.x, sv.z + 0.35, 0xe2e8f0);
                if (window.castleAudio) window.castleAudio.playSteamHiss();
            }
        }

        // 3. Player Movement Inputs with Direct Tactical Response (No skating / slip)
        let inputX = 0;
        let inputZ = 0;
        if (this.keys.up) inputZ -= 1;
        if (this.keys.down) inputZ += 1;
        if (this.keys.left) inputX -= 1;
        if (this.keys.right) inputX += 1;

        const isMoving = (inputX !== 0 || inputZ !== 0);

        if (isMoving) {
            const inputLen = Math.hypot(inputX, inputZ);
            inputX /= inputLen;
            inputZ /= inputLen;

            // Direct screen-aligned movement (fixed planta)
            const moveX = inputX;
            const moveZ = inputZ;

            const targetSpeed = this.playerState.speed;
            // Instant crisp directional velocity: zero ice-skating, zero sliding
            this.playerState.vx = moveX * targetSpeed;
            this.playerState.vz = moveZ * targetSpeed;

            // Target facing angle
            this.playerState.targetAngle = Math.atan2(moveX, moveZ);
            this.playerState.walkCycle += dt * 11.5;

            if (this.playerState.isGrounded && window.castleAudio) {
                window.castleAudio.playStep();
            }
        } else {
            // Immediate crisp stop when grounded: zero skidding or inertia drifting
            if (this.playerState.isGrounded) {
                this.playerState.vx = 0;
                this.playerState.vz = 0;
            }
        }

        // Fast, responsive angular turn without sluggish turning circles
        let diffAngle = this.playerState.targetAngle - this.playerState.angle;
        while (diffAngle < -Math.PI) diffAngle += Math.PI * 2;
        while (diffAngle > Math.PI) diffAngle -= Math.PI * 2;
        this.playerState.angle += diffAngle * Math.min(1.0, dt * 26.0);

        // Position update with collision resolution
        const targetX = this.playerState.x + this.playerState.vx * dt;
        const targetZ = this.playerState.z + this.playerState.vz * dt;

        if (this.canMoveTo(targetX, this.playerState.z)) {
            this.playerState.x = targetX;
        } else {
            this.tryPushCrate(Math.sign(this.playerState.vx), 0, dt);
            this.playerState.vx = 0;
        }

        if (this.canMoveTo(this.playerState.x, targetZ)) {
            this.playerState.z = targetZ;
        } else {
            this.tryPushCrate(0, Math.sign(this.playerState.vz), dt);
            this.playerState.vz = 0;
        }

        // 4. Grounded Floor (Strictly flat ground level)
        this.playerState.y = 0.0;
        this.playerState.vy = 0;
        this.playerState.isGrounded = true;

        // 5. Update Snake Mesh & Dynamic Bandana Physics
        if (this.playerMesh) {
            this.playerMesh.position.set(this.playerState.x, this.playerState.y, this.playerState.z);
            this.playerMesh.rotation.y = this.playerState.angle;

            // Walk animations
            if (isMoving && this.playerState.isGrounded) {
                const walkPhase = Math.sin(this.playerState.walkCycle);
                if (this.playerParts.armL) this.playerParts.armL.rotation.x = walkPhase * 0.58;
                if (this.playerParts.armR) this.playerParts.armR.rotation.x = -walkPhase * 0.58;
                if (this.playerParts.legL) this.playerParts.legL.rotation.x = -walkPhase * 0.68;
                if (this.playerParts.legR) this.playerParts.legR.rotation.x = walkPhase * 0.68;
            } else {
                if (this.playerParts.armL) this.playerParts.armL.rotation.x = 0;
                if (this.playerParts.armR) this.playerParts.armR.rotation.x = 0;
                if (this.playerParts.legL) this.playerParts.legL.rotation.x = 0;
                if (this.playerParts.legR) this.playerParts.legR.rotation.x = 0;
            }

            // Bandana trailing inertia
            if (this.playerParts.bandanaGroup) {
                const trailFlutter = Math.sin(elapsed * 16) * 0.35;
                const runOffset = isMoving ? -0.45 : -0.15;
                this.playerParts.bandanaGroup.rotation.x = runOffset + trailFlutter * 0.25;
                this.playerParts.bandanaGroup.rotation.y = (diffAngle * 0.45) + Math.sin(elapsed * 12) * 0.15;
            }

            // Invulnerability blinking
            if (this.playerState.invulnTimer > 0) {
                this.playerState.invulnTimer -= dt;
                this.playerMesh.visible = Math.floor(elapsed * 12) % 2 === 0;
            } else {
                this.playerMesh.visible = true;
            }

            if (this.playerShadow) {
                this.playerShadow.position.set(this.playerState.x, 0.02, this.playerState.z);
                this.playerShadow.scale.set(1.0, 1.0, 1.0);
            }
        }

        // 6. Update PAL Discs (Float & Rotate)
        for (const c of this.crystals) {
            if (!c.collected) {
                c.mesh.rotation.y += dt * 2.2;
                c.mesh.position.y = 0.85 + Math.sin(elapsed * 3.5 + c.idx) * 0.15;

                const dist = Math.hypot(this.playerState.x - c.x, this.playerState.z - c.z);
                if (dist < 1.25) {
                    c.collected = true;
                    c.mesh.visible = false;
                    if (c.mesh.parent) {
                        c.mesh.parent.remove(c.mesh);
                    }
                    if (c.light) c.light.intensity = 0;
                    this.spawnBurstParticles(c.x, c.z, 0x38bdf8);
                    if (window.castleAudio) window.castleAudio.playPickup();
                    if (this.callbacks.onCrystalCollected) {
                        const collectedCount = this.crystals.filter(cr => cr.collected).length;
                        const totalCount = this.crystals.length;
                        this.callbacks.onCrystalCollected(collectedCount, totalCount);
                    }
                }
            }
        }

        // 7. Update Supply Crates (Chests)
        for (const ch of this.chests) {
            if (!ch.opened) {
                const dist = Math.hypot(this.playerState.x - ch.x, this.playerState.z - ch.z);
                if (dist < 1.25) {
                    ch.opened = true;
                    ch.group.scale.set(1.15, 1.15, 1.15);
                    this.spawnBurstParticles(ch.x, ch.z, 0x22c55e);
                    if (window.castleAudio) window.castleAudio.playChestOpen();
                    if (this.callbacks.onChestOpened) {
                        this.callbacks.onChestOpened(ch.idx);
                    }
                }
            }
        }

        // 8. Update Security Sub-Doors (Open / Close Animation & Status LED)
        for (const sd of this.subDoors) {
            if (sd.isOpen && sd.openProgress < 1.0) {
                sd.openProgress = Math.min(1.0, sd.openProgress + dt * 2.2);
                sd.doorMesh.position.y = 1.1 + sd.openProgress * 2.2; // Slide up into ceiling
                if (sd.ledMat) sd.ledMat.color.setHex(0x22c55e); // Green
            } else if (!sd.isOpen && sd.openProgress > 0) {
                sd.openProgress = Math.max(0, sd.openProgress - dt * 2.2);
                sd.doorMesh.position.y = 1.1 + sd.openProgress * 2.2;
                if (sd.ledMat) sd.ledMat.color.setHex(sd.logicUnlocked ? 0xef4444 : 0xf59e0b); // Amber if locked by logic, Red if closed
            } else if (!sd.isOpen && sd.openProgress === 0) {
                if (sd.ledMat) sd.ledMat.color.setHex(sd.logicUnlocked ? 0xef4444 : 0xf59e0b);
            }
        }

        // 9. Update Floor Pressure Plates
        let anyPlatePressedByPlayer = false;
        for (const plate of this.pressurePlates) {
            const dist = Math.hypot(this.playerState.x - plate.x, this.playerState.z - plate.z);
            let isPressedNow = (dist < 0.85);

            // Check if crate is on top of plate
            for (const cr of this.pushCrates) {
                if (Math.hypot(cr.x - plate.x, cr.z - plate.z) < 0.85) {
                    isPressedNow = true;
                    break;
                }
            }

            if (isPressedNow && !plate.isPressed) {
                plate.isPressed = true;
                plate.plateMesh.position.y = -0.06;
                plate.plateMesh.material = this.materials.pressurePlateOn;
                if (window.castleAudio) window.castleAudio.playPressurePlate();
                this.subDoors.forEach(sd => sd.isOpen = true);
            } else if (!isPressedNow && plate.isPressed) {
                plate.isPressed = false;
                plate.plateMesh.position.y = 0.02;
                plate.plateMesh.material = this.materials.pressurePlateOff;
            }

            if (isPressedNow) anyPlatePressedByPlayer = true;
        }

        // 10. Check Laser Barrier Collisions & Occlusion by Crates (Vertical or Horizontal)
        for (const laser of this.lasers) {
            if (!laser.active) continue;

            // Check if laser is blocked by any pushable shipping container
            let isBlocked = false;
            for (const cr of this.pushCrates) {
                if (laser.isVertical) {
                    if (Math.abs(cr.x - laser.x) < 0.85 && Math.abs(cr.z - laser.z) < this.tileSize * 0.48) {
                        isBlocked = true;
                        break;
                    }
                } else {
                    if (Math.abs(cr.z - laser.z) < 0.85 && Math.abs(cr.x - laser.x) < this.tileSize * 0.48) {
                        isBlocked = true;
                        break;
                    }
                }
            }

            laser.isBlockedByCrate = isBlocked;
            laser.beamMesh.visible = !isBlocked;

            // Player collision with active laser (can jump over if high enough)
            if (!isBlocked && this.playerState.invulnTimer <= 0 && this.playerState.y < 0.85) {
                const distZ = Math.abs(this.playerState.z - laser.z);
                const distX = Math.abs(this.playerState.x - laser.x);
                let hit = false;
                if (laser.isVertical) {
                    hit = (distX < 0.55 && distZ < this.tileSize * 0.52);
                } else {
                    hit = (distZ < 0.55 && distX < this.tileSize * 0.52);
                }

                if (hit) {
                    if (window.castleAudio) window.castleAudio.playLaserZap();
                    this.triggerAlert('LASER_BARRIER', laser.x, laser.z);
                    break;
                }
            }
        }

        // 11. Check Proximity to Breaker Switches & Security Workstations
        let nearestSwitch = null;
        for (const sw of this.switches) {
            if (Math.hypot(this.playerState.x - sw.x, this.playerState.z - sw.z) < 1.65) {
                nearestSwitch = sw;
                break;
            }
        }
        this.nearSwitch = nearestSwitch;

        // Animate & check proximity to PC Workstations
        let nearestWS = null;
        for (const ws of this.workstations) {
            if (!ws.hacked) {
                if (ws.holoMesh) {
                    ws.holoMesh.rotation.y += dt * 2.5;
                    ws.holoMesh.rotation.x += dt * 1.2;
                    ws.holoGroup.position.y = 1.48 + Math.sin(elapsed * 4.0) * 0.08;
                }
                const d = Math.hypot(this.playerState.x - ws.x, this.playerState.z - ws.z);
                if (d < 2.0) {
                    nearestWS = ws;
                }
            }
        }
        const wasNearWS = this.nearWorkstation;
        this.nearWorkstation = nearestWS;

        if (this.nearWorkstation !== wasNearWS && this.callbacks.onWorkstationProximityChange) {
            this.callbacks.onWorkstationProximityChange(!!this.nearWorkstation, this.nearWorkstation ? this.nearWorkstation.hacked : false);
        }

        // Check Door proximity
        let foundDoor = null;
        for (const sd of this.subDoors) {
            if (Math.hypot(this.playerState.x - sd.x, this.playerState.z - sd.z) < 1.85) {
                foundDoor = sd;
                break;
            }
        }
        this.nearDoor = foundDoor;

        // Update HUD interaction prompt buttons
        const btnDoor = document.getElementById('btn-door-prompt');
        if (btnDoor) {
            if (this.nearDoor) {
                btnDoor.style.display = 'block';
                if (!this.nearDoor.logicUnlocked && !this.bypassDoorPuzzles) {
                    btnDoor.style.background = 'linear-gradient(135deg, #b45309, #d97706)';
                    btnDoor.style.borderColor = '#fde047';
                    btnDoor.innerHTML = '🔐 Desxifrar Pany Lògic [E]';
                } else {
                    btnDoor.style.background = 'linear-gradient(135deg, #0d9488, #14b8a6)';
                    btnDoor.style.borderColor = '#2dd4bf';
                    btnDoor.innerHTML = this.nearDoor.isOpen ? '🔒 Tancar Porta [E]' : '🚪 Obrir Porta [E]';
                }
            } else {
                btnDoor.style.display = 'none';
            }
        }

        // 12. Update Genome Patrol Sentries with Dynamic Gaze Sweep (looking left & right)
        // Sentry Gun Muzzle Timers
        for (const en of this.enemies) {
            if (en.muzzleTimer > 0) {
                en.muzzleTimer -= dt;
                if (en.muzzleTimer <= 0) {
                    if (en.muzzleFlash) en.muzzleFlash.visible = false;
                    if (en.muzzleLight) en.muzzleLight.intensity = 0;
                }
            }
        }

        // 12. Update Genome Patrol Sentries with Chase & Shooting Combat AI
        for (const en of this.enemies) {
            en.gazeTimer = (en.gazeTimer || 0) + dt;

            // Sentry Floor Height & Multi-level vertical awareness
            const enFloorY = this.getFloorHeightAt(en.x, en.z);
            en.floorY = enFloorY;
            en.y = enFloorY;
            en.group.position.y = en.y;

            // Height difference: guards on ground floor cannot see player on upper catwalk, and vice versa!
            const isDifferentFloor = Math.abs(en.floorY - this.playerState.y) > 0.8;

            // Distance & Vector to Solid Snake
            const toPlayerX = this.playerState.x - en.x;
            const toPlayerZ = this.playerState.z - en.z;
            const distToPlayer = Math.hypot(toPlayerX, toPlayerZ);

            // Direct Line-of-sight Check (blocked by walls, closed doors, crates, and different floors)
            const hasDirectLOS = !isDifferentFloor && this.checkLineOfSight(en.x, en.z, this.playerState.x, this.playerState.z);

            // Sentry Cone Spotting Check
            const effectiveFacing = en.facingAngle + (en.gazeAngle || 0);
            let spotted = false;

            if (!isDifferentFloor && distToPlayer <= en.viewDist) {
                const angleToPlayer = Math.atan2(toPlayerX, toPlayerZ);
                let angleDiff = Math.abs(angleToPlayer - effectiveFacing);
                while (angleDiff > Math.PI) angleDiff = Math.abs(angleDiff - Math.PI * 2);

                if (angleDiff <= en.fovRad / 2) {
                    const rayDist = this.castVisionRay(en.x, en.z, angleToPlayer, distToPlayer + 0.1);
                    if (rayDist >= distToPlayer - 0.28) {
                        spotted = true;
                    }
                }
            }
            if (!isDifferentFloor && distToPlayer < en.r + 0.42 && hasDirectLOS) spotted = true;

            // If spotted in line-of-sight, trigger or refresh alert
            if (spotted) {
                this.triggerAlert('GUARD_DETECTED', en.x, en.z);
            }

            let isInspecting = false;

            // Combat State Machine: CHASE & SHOOT vs. PATROL
            if (this.alertState === 'ALERT' || this.alertState === 'EVASION') {
                en.aiState = 'CHASE';

                // Target position: player's live position if LOS, or last known position
                if (hasDirectLOS) {
                    en.lastKnownX = this.playerState.x;
                    en.lastKnownZ = this.playerState.z;
                }
                const targetX = en.lastKnownX != null ? en.lastKnownX : this.playerState.x;
                const targetZ = en.lastKnownZ != null ? en.lastKnownZ : this.playerState.z;

                const toTargetX = targetX - en.x;
                const toTargetZ = targetZ - en.z;
                const distToTarget = Math.hypot(toTargetX, toTargetZ);

                en.gazeAngle = 0; // Focus gaze forward on Snake

                // High speed combat sprint
                const chaseSpeed = en.speed * 1.55;

                // Pathfinding AI: dynamically find route through rooms, corridors & doors
                en.pathRecalcTimer = (en.pathRecalcTimer || 0) - dt;
                const currTargetGx = this.worldToGridX(targetX);
                const currTargetGz = this.worldToGridZ(targetZ);
                const targetCellChanged = (en.lastTargetGx !== currTargetGx || en.lastTargetGz !== currTargetGz);

                if (en.pathRecalcTimer <= 0 || targetCellChanged || !en.chasePath || en.chasePath.length === 0) {
                    en.pathRecalcTimer = 0.35 + Math.random() * 0.15;
                    en.lastTargetGx = currTargetGx;
                    en.lastTargetGz = currTargetGz;
                    en.chasePath = this.findSentryAStarPath(en.x, en.z, targetX, targetZ);
                    en.chasePathIndex = 0;
                }

                // Check if sentry has direct straight-line obstacle-free clearance to player
                const canDirectSprint = hasDirectLOS && distToTarget < 6.5 && this.checkSentryStraightLineClearance(en.x, en.z, targetX, targetZ, en.r);

                let nextX = targetX;
                let nextZ = targetZ;

                if (!canDirectSprint && en.chasePath && en.chasePath.length > 0) {
                    // Follow A* path waypoints
                    while (en.chasePathIndex < en.chasePath.length) {
                        const wp = en.chasePath[en.chasePathIndex];
                        const dWp = Math.hypot(wp.x - en.x, wp.z - en.z);
                        if (dWp < 0.55 && en.chasePathIndex < en.chasePath.length - 1) {
                            en.chasePathIndex++;
                        } else {
                            nextX = wp.x;
                            nextZ = wp.z;
                            break;
                        }
                    }
                }

                const dirX = nextX - en.x;
                const dirZ = nextZ - en.z;
                const distToNext = Math.hypot(dirX, dirZ);

                if (distToNext > 0.05) {
                    en.targetAngle = Math.atan2(dirX, dirZ);
                }

                // Security Clearance: Sentry badges sub-doors open while pursuing if unlocked
                for (let s = 0; s < this.subDoors.length; s++) {
                    const sd = this.subDoors[s];
                    if (!sd.isOpen && sd.logicUnlocked && Math.hypot(en.x - sd.x, en.z - sd.z) < 1.35) {
                        sd.isOpen = true;
                    }
                }

                // Move closer along path if not in direct contact
                if (distToTarget > 1.2 || !hasDirectLOS) {
                    const step = Math.min(distToNext, chaseSpeed * dt);
                    const moveX = (dirX / Math.max(0.001, distToNext)) * step;
                    const moveZ = (dirZ / Math.max(0.001, distToNext)) * step;

                    if (this.canSentryMoveTo(en.x + moveX, en.z + moveZ, en.r)) {
                        en.x += moveX;
                        en.z += moveZ;
                    } else if (this.canSentryMoveTo(en.x + moveX, en.z, en.r)) {
                        en.x += moveX;
                    } else if (this.canSentryMoveTo(en.x, en.z + moveZ, en.r)) {
                        en.z += moveZ;
                    }
                    this.resolveSentryCollisions(en);
                }

                // Sentries Shoot at Snake when in Line-of-Sight!
                if (hasDirectLOS && distToPlayer <= 11.5) {
                    en.shootCooldown = (en.shootCooldown || 0) - dt;
                    if (en.shootCooldown <= 0) {
                        en.shootCooldown = 0.85 + Math.random() * 0.45;

                        // Visual Muzzle Flash & Light Flare
                        if (en.muzzleFlash) {
                            en.muzzleFlash.visible = true;
                            if (en.muzzleLight) en.muzzleLight.intensity = 3.8;
                            en.muzzleTimer = 0.12;
                        }

                        // Gunfire Audio
                        if (window.castleAudio) {
                            window.castleAudio.playAssaultRifleBurst();
                        }

                        // Spawn high-speed tracer bullet towards Snake
                        const muzzlePos = new THREE.Vector3();
                        if (en.muzzleFlash) {
                            en.muzzleFlash.getWorldPosition(muzzlePos);
                        } else {
                            muzzlePos.set(en.x, en.y + 0.95, en.z);
                        }

                        this.spawnBullet(
                            muzzlePos.x, muzzlePos.y, muzzlePos.z,
                            this.playerState.x, this.playerState.y + 0.85, this.playerState.z
                        );
                    }
                }
            } else {
                en.chasePath = null;
                en.chasePathIndex = 0;

                // Si el sentinella té una ruta de retorn A* cap a la seva patrulla
                if (en.returnPath && en.returnPath.length > 0) {
                    en.aiState = 'RETURN_TO_PATROL';
                    while (en.returnPathIndex < en.returnPath.length) {
                        const wp = en.returnPath[en.returnPathIndex];
                        const dWp = Math.hypot(wp.x - en.x, wp.z - en.z);
                        if (dWp < 0.55 && en.returnPathIndex < en.returnPath.length - 1) {
                            en.returnPathIndex++;
                        } else {
                            break;
                        }
                    }

                    const nextTarget = en.returnPath[en.returnPathIndex];
                    const rdx = nextTarget.x - en.x;
                    const rdz = nextTarget.z - en.z;
                    const distR = Math.hypot(rdx, rdz);

                    if (distR > 0.05) {
                        en.targetAngle = Math.atan2(rdx, rdz);
                        const step = Math.min(distR, en.speed * dt);
                        const moveX = (rdx / distR) * step;
                        const moveZ = (rdz / distR) * step;
                        if (this.canSentryMoveTo(en.x + moveX, en.z + moveZ, en.r)) {
                            en.x += moveX;
                            en.z += moveZ;
                        } else if (this.canSentryMoveTo(en.x + moveX, en.z, en.r)) {
                            en.x += moveX;
                        } else if (this.canSentryMoveTo(en.x, en.z + moveZ, en.r)) {
                            en.z += moveZ;
                        }
                        this.resolveSentryCollisions(en);
                    }

                    // Obri sub-portes que ja estan desbloquejades durant el retorn
                    for (let s = 0; s < this.subDoors.length; s++) {
                        const sd = this.subDoors[s];
                        if (!sd.isOpen && sd.logicUnlocked && Math.hypot(en.x - sd.x, en.z - sd.z) < 1.35) {
                            sd.isOpen = true;
                        }
                    }

                    // En arribar a l'últim punt, reprèn la patrulla normal
                    if (en.returnPathIndex >= en.returnPath.length - 1 && distR < 0.45) {
                        en.returnPath = null;
                        en.aiState = 'PATROL';
                    }
                } else {
                    // PATRULLA NORMAL I ERRÀTICA AL VOLTANT DELS WAYPOINTS
                    en.aiState = 'PATROL';
                    en.unpredictableTimer = (en.unpredictableTimer || (2.0 + Math.random() * 3.0)) - dt;

                    if (en.unpredictableTimer <= 0) {
                        en.unpredictableTimer = 2.5 + Math.random() * 4.0;
                        const roll = Math.random();
                        if (roll < 0.38) {
                            // Parada sobtada i escaneig
                            en.isPausedErratic = true;
                            en.erraticPauseTimer = 1.2 + Math.random() * 1.5;
                            en.targetGazeAngle = (Math.random() > 0.5 ? 1 : -1) * (0.6 + Math.random() * 0.4);
                        } else if (roll < 0.65) {
                            // Canvi de sentit de patrulla
                            en.patrolDir = (en.patrolDir || 1) * -1;
                        } else if (roll < 0.85 && en.waypoints && en.waypoints.length > 2) {
                            // Waypoint alternatiu
                            en.wpIndex = Math.floor(Math.random() * en.waypoints.length);
                        } else {
                            // Mirada 180° enrere
                            en.targetAngle += Math.PI;
                            while (en.targetAngle > Math.PI) en.targetAngle -= Math.PI * 2;
                            while (en.targetAngle < -Math.PI) en.targetAngle += Math.PI * 2;
                        }
                    }

                    // Escombrats visuals de mirada
                    en.gazeJerkTimer = (en.gazeJerkTimer || 0) - dt;
                    if (en.gazeJerkTimer <= 0) {
                        en.gazeJerkTimer = 0.8 + Math.random() * 1.2;
                        en.targetGazeAngle = (Math.random() - 0.5) * 1.35;
                    }
                    en.gazeAngle += ((en.targetGazeAngle || 0) - (en.gazeAngle || 0)) * Math.min(1.0, dt * 7.0);

                    if (en.isPausedErratic) {
                        en.erraticPauseTimer -= dt;
                        if (en.erraticPauseTimer <= 0) {
                            en.isPausedErratic = false;
                        }
                        isInspecting = true;
                    } else if (en.waypoints && en.waypoints.length > 0) {
                        const wp = en.waypoints[en.wpIndex];
                        const dx = wp.x - en.x;
                        const dz = wp.z - en.z;
                        const distToWp = Math.hypot(dx, dz);

                        // Si hi ha obstacle pel mig cap al waypoint, generar ruta A* de retorn
                        const hasClearance = this.checkSentryStraightLineClearance(en.x, en.z, wp.x, wp.z, en.r);
                        if (!hasClearance && distToWp > 1.0) {
                            en.returnPath = this.findSentryAStarPath(en.x, en.z, wp.x, wp.z);
                            en.returnPathIndex = 0;
                        } else if (distToWp < 0.35) {
                            isInspecting = true;
                            en.inspectTimer += dt;
                            en.inspectPhase += dt * 3.0;

                            if (en.inspectTimer >= en.inspectDuration) {
                                en.inspectTimer = 0;
                                en.inspectPhase = 0;
                                const dir = en.patrolDir || 1;
                                en.wpIndex = (en.wpIndex + dir + en.waypoints.length) % en.waypoints.length;
                            }
                        } else {
                            const step = en.speed * dt;
                            const moveX = (dx / distToWp) * step;
                            const moveZ = (dz / distToWp) * step;
                            if (this.canSentryMoveTo(en.x + moveX, en.z + moveZ, en.r)) {
                                en.x += moveX;
                                en.z += moveZ;
                            } else if (this.canSentryMoveTo(en.x + moveX, en.z, en.r)) {
                                en.x += moveX;
                            } else if (this.canSentryMoveTo(en.x, en.z + moveZ, en.r)) {
                                en.z += moveZ;
                            }
                            this.resolveSentryCollisions(en);
                            en.targetAngle = Math.atan2(dx, dz);
                        }
                    } else {
                        en.gazeAngle = (en.targetGazeAngle || 0);
                    }
                }
            }

            // Head and vision cone rotate with gaze
            if (en.gazePivot) {
                en.gazePivot.rotation.y = en.gazeAngle || 0;
            }

            // Smooth body turning
            let diffEnAngle = en.targetAngle - en.facingAngle;
            while (diffEnAngle < -Math.PI) diffEnAngle += Math.PI * 2;
            while (diffEnAngle > Math.PI) diffEnAngle -= Math.PI * 2;
            en.facingAngle += diffEnAngle * Math.min(1.0, dt * 6.5);

            en.group.position.set(en.x, en.y, en.z);
            en.bodyGroup.rotation.y = en.facingAngle;

            // Leg animation (sprint frequency in chase, walking in patrol)
            const walkFrequency = en.aiState === 'CHASE' ? 14.0 : 9.0;
            const guardWalk = Math.sin(elapsed * walkFrequency);
            if (en.legL) en.legL.rotation.x = isInspecting ? 0 : guardWalk * 0.45;
            if (en.legR) en.legR.rotation.x = isInspecting ? 0 : -guardWalk * 0.45;

            // Sentry Dynamic Raycast Vision Cone
            const currentFacing = en.facingAngle + (en.gazeAngle || 0);
            en.coneMesh.rotation.y = en.gazeAngle || 0;
            const sentryHits = this.updateRaycastedVisionCone(en.coneMesh, en.x, en.z, currentFacing, en.fovRad, en.viewDist);
            en.raycastHits = sentryHits;

            // Cone Color & Alert Mesh State
            if (this.alertState === 'ALERT') {
                en.coneMesh.material.color.setHex(0xff1744);
                en.coneMesh.material.opacity = 0.65;
                if (en.coneMesh.userData.outlineLine) {
                    en.coneMesh.userData.outlineLine.material.color.setHex(0xff3366);
                    en.coneMesh.userData.outlineLine.material.opacity = 1.0;
                }
                if (en.coneMesh.userData.midArcLine) {
                    en.coneMesh.userData.midArcLine.material.color.setHex(0xff5252);
                    en.coneMesh.userData.midArcLine.material.opacity = 0.9;
                }
                en.alertMesh.visible = true;
                en.alertMesh.scale.set(1.6 + Math.sin(elapsed * 20) * 0.2, 1.6 + Math.sin(elapsed * 20) * 0.2, 1.6);
            } else if (this.alertState === 'EVASION') {
                en.coneMesh.material.color.setHex(0xf59e0b);
                en.coneMesh.material.opacity = 0.50;
                if (en.coneMesh.userData.outlineLine) {
                    en.coneMesh.userData.outlineLine.material.color.setHex(0xfbbf24);
                    en.coneMesh.userData.outlineLine.material.opacity = 0.95;
                }
                en.alertMesh.visible = false;
            } else {
                en.coneMesh.material.color.setHex(0xf59e0b);
                en.coneMesh.material.opacity = 0.44;
                if (en.coneMesh.userData.outlineLine) {
                    en.coneMesh.userData.outlineLine.material.color.setHex(0xfde047);
                    en.coneMesh.userData.outlineLine.material.opacity = 0.95;
                }
                if (en.coneMesh.userData.midArcLine) {
                    en.coneMesh.userData.midArcLine.material.color.setHex(0xfde047);
                    en.coneMesh.userData.midArcLine.material.opacity = 0.70;
                }
                en.alertMesh.visible = false;
            }
        }

        // 13. Update CCTV Surveillance Cameras (all move slowly and smoothly!)
        for (const cam of this.cameras) {
            if (cam.deactivated) {
                cam.coneMesh.visible = false;
                cam.alertMesh.visible = false;
                continue;
            }

            const camType = (cam.camType || cam.type || (cam.fixed ? 'FIXED' : 'SWEEP')).toUpperCase();
            const speed = cam.sweepSpeed !== undefined ? cam.sweepSpeed : 0.52;

            if (camType === 'ROTARY_360' || camType === '360' || camType === 'DOME_360') {
                // Continuous 360-degree rotation (sala central MGS!)
                cam.currentAngle = (cam.currentAngle + dt * speed) % (Math.PI * 2);
            } else if (camType === 'FIXED') {
                cam.currentAngle = cam.baseAngle;
            } else if (camType === 'PULSE') {
                cam.sweepTime += dt * speed;
                const cycle = cam.sweepTime % 4.0;
                if (cycle < 2.2) {
                    cam.currentAngle = cam.baseAngle;
                } else {
                    const t = (cycle - 2.2) / 1.8;
                    cam.currentAngle = cam.baseAngle + Math.sin(t * Math.PI) * (cam.sweepAngle || 1.2);
                }
            } else {
                // Default: SWEEP
                const sweepRange = cam.sweepAngle !== undefined ? cam.sweepAngle : (Math.PI / 2.2);
                cam.sweepTime += dt * speed;
                cam.currentAngle = cam.baseAngle + Math.sin(cam.sweepTime) * (sweepRange / 2);
            }

            cam.cameraPivot.rotation.y = cam.currentAngle;
            cam.coneMesh.rotation.y = cam.currentAngle;

            // Camera Dynamic Raycast Vision Cone (stops at walls and obstacles!)
            const camHits = this.updateRaycastedVisionCone(cam.coneMesh, cam.x, cam.z, cam.currentAngle, cam.fovRad, cam.viewDist);
            cam.raycastHits = camHits;

            const toPlayerX = this.playerState.x - cam.x;
            const toPlayerZ = this.playerState.z - cam.z;
            const distToPlayer = Math.hypot(toPlayerX, toPlayerZ);

            const camFloorY = cam.floorY != null ? cam.floorY : this.getFloorHeightAt(cam.x, cam.z);
            const isCamDifferentFloor = Math.abs(camFloorY - this.playerState.y) > 0.8;

            let camSpotted = false;
            const minDist = (cam.minDist !== undefined) ? cam.minDist : 0.6;

            // Blind spot: si Snake està a menys de minDist (just a sota la càmara), no el veu!
            if (!isCamDifferentFloor && distToPlayer >= minDist && distToPlayer <= cam.viewDist) {
                const angleToPlayer = Math.atan2(toPlayerX, toPlayerZ);
                let angleDiff = Math.abs(angleToPlayer - cam.currentAngle);
                while (angleDiff > Math.PI) angleDiff = Math.abs(angleDiff - Math.PI * 2);

                if (angleDiff <= cam.fovRad / 2) {
                    const rayDist = this.castVisionRay(cam.x, cam.z, angleToPlayer, distToPlayer + 0.1);
                    if (rayDist >= distToPlayer - 0.28) {
                        camSpotted = true;
                    }
                }
            }

            if (camSpotted) {
                cam.coneMesh.material.color.setHex(0xff1744);
                cam.coneMesh.material.opacity = 0.70;
                if (cam.coneMesh.userData.outlineLine) {
                    cam.coneMesh.userData.outlineLine.material.color.setHex(0xff3366);
                    cam.coneMesh.userData.outlineLine.material.opacity = 1.0;
                }
                if (cam.coneMesh.userData.midArcLine) {
                    cam.coneMesh.userData.midArcLine.material.color.setHex(0xff5252);
                    cam.coneMesh.userData.midArcLine.material.opacity = 0.9;
                }
                cam.alertMesh.visible = true;
                this.triggerAlert('CAMERA_DETECTED', cam.x, cam.z);
            } else {
                cam.coneMesh.material.color.setHex(0x00d2ff);
                cam.coneMesh.material.opacity = 0.48;
                if (cam.coneMesh.userData.outlineLine) {
                    cam.coneMesh.userData.outlineLine.material.color.setHex(0x38bdf8);
                    cam.coneMesh.userData.outlineLine.material.opacity = 0.95;
                }
                if (cam.coneMesh.userData.midArcLine) {
                    cam.coneMesh.userData.midArcLine.material.color.setHex(0x67e8f9);
                    cam.coneMesh.userData.midArcLine.material.opacity = 0.75;
                }
                cam.alertMesh.visible = false;
            }
        }

        // 14. Check Tesla Electric Floor & Deep Ventilation Pit Collisions
        if (this.playerState.invulnTimer <= 0 && this.playerState.y < 0.42) {
            for (const p of this.pits) {
                if (!p.bridged && Math.hypot(this.playerState.x - p.x, this.playerState.z - p.z) < p.r) {
                    this.triggerAlert('PIT_HAZARD', p.x, p.z);
                    break;
                }
            }
            for (const lv of this.lavas) {
                if (!lv.bridged && Math.hypot(this.playerState.x - lv.x, this.playerState.z - lv.z) < lv.r) {
                    if (window.castleAudio) window.castleAudio.playLaserZap();
                    this.triggerAlert('ELECTRIC_GRID', lv.x, lv.z);
                    break;
                }
            }
        }

        // 15. Check Blast Door Proximity & Animation
        if (this.gateInfo) {
            const distToSeal = Math.hypot(this.playerState.x - this.gateInfo.x, this.playerState.z - this.gateInfo.interactZ);
            const wasNear = this.nearGate;
            this.nearGate = distToSeal < 2.45 && !this.gateInfo.isOpen;

            if (this.nearGate !== wasNear && this.callbacks.onGateProximityChange) {
                this.callbacks.onGateProximityChange(this.nearGate, this.gateInfo.allCrystalsReady);
            }

            if (this.gateInfo.isOpen && this.gateInfo.openProgress < 1.0) {
                this.gateInfo.openProgress = Math.min(1.0, this.gateInfo.openProgress + dt * 1.8);
                const slideDist = this.gateInfo.openProgress * 1.05;
                this.gateInfo.leafL.position.x = -0.62 - slideDist;
                this.gateInfo.leafR.position.x = 0.62 + slideDist;
            }

            if (this.gateInfo.isOpen) {
                const distToArch = Math.hypot(this.playerState.x - this.gateInfo.x, this.playerState.z - this.gateInfo.z);
                if (distToArch < 1.65 && this.callbacks.onWalkThroughOpenGate) {
                    this.callbacks.onWalkThroughOpenGate();
                }
            }
        }

        // 16. Vista Tàctica Heroica Centrada en Snake (Inclinació de 14º)
        // Perspectiva 3D immersiva, càmera propera per donar gran protagonisme a Snake i als escenaris
        this.cameraYaw = 0;
        this.targetCameraYaw = 0;

        const tiltRad = (14.0 * Math.PI) / 180; // Inclinació immersiva de 14º
        const camHeight = 20 * this.cameraZoom;
        const camOffsetZ = camHeight * Math.tan(tiltRad);

        // Assegurem focus inicial
        if (typeof this.cameraFocusX === 'undefined' || Number.isNaN(this.cameraFocusX)) {
            this.cameraFocusX = this.playerState.x;
            this.cameraFocusZ = this.playerState.z;
        }

        // Seguiment suau i fluid centrat exclusivament en el jugador
        // Sense look-ahead ni desviacions de velocitat (elimina qualsevol basculació incòmoda)
        const lerpFactor = 1.0 - Math.exp(-14 * dt);
        this.cameraFocusX += (this.playerState.x - this.cameraFocusX) * lerpFactor;
        this.cameraFocusZ += (this.playerState.z - this.cameraFocusZ) * lerpFactor;

        // Posició de càmera: sempre a (focusX, camHeight, focusZ + camOffsetZ)
        this.camera.position.set(
            this.cameraFocusX,
            camHeight,
            this.cameraFocusZ + camOffsetZ
        );

        // Vector de visió rígid: mira sempre a (focusX, 0, focusZ) a nivell del terra
        // Vector direccional (Target - Camera) = (0, -camHeight, -camOffsetZ) -> constant al 100%
        this.camera.lookAt(this.cameraFocusX, 0, this.cameraFocusZ);

        // 17. Render Soliton Radar Minimap
        this.renderSolitonRadar();
    }

    // ========================================================================
    // SOLITON RADAR TÀCTIC (RENDERITZAT MGS)
    // ========================================================================
    renderSolitonRadar() {
        if (!this.minimapCtx || !this.mapData.length) return;

        // Optimització Mode Fluid (Chromebook): refresc alternat a 30 FPS per alliberar la CPU
        if (this.perfMode === 'CHROMEBOOK') {
            this._radarFrameSkip = (this._radarFrameSkip || 0) + 1;
            if (this._radarFrameSkip % 2 !== 0) return;
        }

        const ctx = this.minimapCtx;
        const W = this.minimapCanvas.width;
        const H = this.minimapCanvas.height;
        const cw = W / this.gridW;
        const ch = H / this.gridH;

        ctx.fillStyle = '#03080e';
        ctx.fillRect(0, 0, W, H);

        // Grid lines
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.12)';
        ctx.lineWidth = 1;
        for (let x = 0; x <= W; x += cw * 2) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, H);
            ctx.stroke();
        }
        for (let y = 0; y <= H; y += ch * 2) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(W, y);
            ctx.stroke();
        }

        // Walls and static props
        for (let rz = 0; rz < this.gridH; rz++) {
            for (let cx = 0; cx < this.gridW; cx++) {
                const cell = this.mapData[rz][cx];
                if (cell === '#' || cell === '(' || cell === ')' || cell === '{' || cell === '}' || cell === '@' || cell === 'w') {
                    ctx.fillStyle = '#166534';
                    ctx.fillRect(cx * cw, rz * ch, cw, ch);
                    if (cell === 'w') {
                        ctx.fillStyle = '#93c5fd';
                        ctx.fillRect(cx * cw + 2, rz * ch + 2, cw - 4, ch - 4);
                    }
                } else if (cell === '$' || cell === 't' || cell === 'b' || cell === 'a') {
                    ctx.fillStyle = '#0f766e';
                    ctx.fillRect(cx * cw + 1, rz * ch + 1, cw - 2, ch - 2);
                } else if (cell === 'r') {
                    ctx.fillStyle = 'rgba(127, 29, 29, 0.45)';
                    ctx.fillRect(cx * cw, rz * ch, cw, ch);
                } else if (cell === 'B') {
                    ctx.fillStyle = '#3b82f6';
                    ctx.fillRect(cx * cw + 1, rz * ch + 1, cw - 2, ch - 2);
                } else if (cell === 'L') {
                    ctx.fillStyle = '#0284c7';
                    ctx.fillRect(cx * cw + 1, rz * ch + 1, cw - 2, ch - 2);
                } else if (cell === 'G') {
                    ctx.fillStyle = (this.gateInfo && this.gateInfo.isOpen) ? '#22c55e' : '#f59e0b';
                    ctx.fillRect(cx * cw, rz * ch, cw, ch);
                }
            }
        }

        // Draw Sub Security Doors with orientation and open/closed state
        for (const sd of this.subDoors) {
            const gx = (sd.x / this.tileSize) + (this.gridW - 1) / 2;
            const gz = (sd.z / this.tileSize) + (this.gridH - 1) / 2;
            ctx.fillStyle = sd.isOpen ? '#22c55e' : '#f59e0b';
            ctx.strokeStyle = sd.isOpen ? '#86efac' : '#fbbf24';
            ctx.lineWidth = 1.5;
            if (sd.isVerticalWall) {
                // Vertical door in N-S wall: bar runs along Z axis
                ctx.fillRect((gx + 0.35) * cw, gz * ch, cw * 0.3, ch);
                ctx.strokeRect((gx + 0.35) * cw, gz * ch, cw * 0.3, ch);
            } else {
                // Horizontal door in W-E wall: bar runs along X axis
                ctx.fillRect(gx * cw, (gz + 0.35) * ch, cw, ch * 0.3);
                ctx.strokeRect(gx * cw, (gz + 0.35) * ch, cw, ch * 0.3);
            }
        }

        // Draw PAL Discs
        for (const c of this.crystals) {
            if (!c.collected) {
                const gx = (c.x / this.tileSize) + (this.gridW - 1) / 2;
                const gz = (c.z / this.tileSize) + (this.gridH - 1) / 2;
                ctx.fillStyle = '#38bdf8';
                ctx.beginPath();
                ctx.arc((gx + 0.5) * cw, (gz + 0.5) * ch, cw * 0.38, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Draw PC Security Workstations on Radar (Cyan / Green square)
        for (const ws of this.workstations) {
            const gx = (ws.x / this.tileSize) + (this.gridW - 1) / 2;
            const gz = (ws.z / this.tileSize) + (this.gridH - 1) / 2;
            ctx.fillStyle = ws.hacked ? '#10b981' : '#38bdf8';
            ctx.fillRect((gx + 0.2) * cw, (gz + 0.2) * ch, cw * 0.6, ch * 0.6);
            ctx.strokeStyle = '#f8fafc';
            ctx.lineWidth = 1;
            ctx.strokeRect((gx + 0.2) * cw, (gz + 0.2) * ch, cw * 0.6, ch * 0.6);
        }

        // Draw Lasers on Radar (Red lines, vertical or horizontal)
        for (const laser of this.lasers) {
            if (laser.active && !laser.isBlockedByCrate) {
                const gx = (laser.x / this.tileSize) + (this.gridW - 1) / 2;
                const gz = (laser.z / this.tileSize) + (this.gridH - 1) / 2;
                ctx.strokeStyle = '#ef4444';
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                if (laser.isVertical) {
                    ctx.moveTo((gx + 0.5) * cw, gz * ch);
                    ctx.lineTo((gx + 0.5) * cw, (gz + 1) * ch);
                } else {
                    ctx.moveTo(gx * cw, (gz + 0.5) * ch);
                    ctx.lineTo((gx + 1) * cw, (gz + 0.5) * ch);
                }
                ctx.stroke();
            }
        }

        // Draw Cameras on Radar
        for (const cam of this.cameras) {
            const gx = (cam.x / this.tileSize) + (this.gridW - 1) / 2;
            const gz = (cam.z / this.tileSize) + (this.gridH - 1) / 2;
            const screenX = (gx + 0.5) * cw;
            const screenZ = (gz + 0.5) * ch;

            if (cam.deactivated) {
                // Offline camera
                ctx.fillStyle = '#64748b';
                ctx.beginPath();
                ctx.arc(screenX, screenZ, cw * 0.28, 0, Math.PI * 2);
                ctx.fill();
                continue;
            }

            if (cam.raycastHits && cam.raycastHits.length > 0) {
                // Raycasted Vision Polygon (stops at walls and obstacles!)
                ctx.fillStyle = 'rgba(6, 182, 212, 0.45)';
                ctx.beginPath();
                ctx.moveTo(screenX, screenZ);
                for (let i = 0; i < cam.raycastHits.length; i++) {
                    const h = cam.raycastHits[i];
                    const hgx = (h.worldX / this.tileSize) + (this.gridW - 1) / 2;
                    const hgz = (h.worldZ / this.tileSize) + (this.gridH - 1) / 2;
                    ctx.lineTo((hgx + 0.5) * cw, (hgz + 0.5) * ch);
                }
                ctx.closePath();
                ctx.fill();

                // Crisp perimeter stroke
                ctx.strokeStyle = '#22d3ee';
                ctx.lineWidth = 1.8;
                ctx.stroke();

                // Mid-range indicator arc
                ctx.strokeStyle = 'rgba(103, 232, 249, 0.55)';
                ctx.lineWidth = 1.0;
                ctx.beginPath();
                for (let i = 0; i < cam.raycastHits.length; i++) {
                    const h = cam.raycastHits[i];
                    const mx = cam.x + Math.sin(h.worldAngle) * (h.hitDist * 0.55);
                    const mz = cam.z + Math.cos(h.worldAngle) * (h.hitDist * 0.55);
                    const mgx = (mx / this.tileSize) + (this.gridW - 1) / 2;
                    const mgz = (mz / this.tileSize) + (this.gridH - 1) / 2;
                    if (i === 0) ctx.moveTo((mgx + 0.5) * cw, (mgz + 0.5) * ch);
                    else ctx.lineTo((mgx + 0.5) * cw, (mgz + 0.5) * ch);
                }
                ctx.stroke();
            }

            // Camera dot with crisp rim
            ctx.fillStyle = '#06b6d4';
            ctx.beginPath();
            ctx.arc(screenX, screenZ, cw * 0.38, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.2;
            ctx.stroke();
        }

        // Draw Sentries on Radar
        for (const en of this.enemies) {
            const gx = (en.x / this.tileSize) + (this.gridW - 1) / 2;
            const gz = (en.z / this.tileSize) + (this.gridH - 1) / 2;
            const screenX = (gx + 0.5) * cw;
            const screenZ = (gz + 0.5) * ch;

            const isAlert = en.alertMesh && en.alertMesh.visible;
            if (en.raycastHits && en.raycastHits.length > 0) {
                ctx.fillStyle = isAlert ? 'rgba(239, 68, 68, 0.55)' : 'rgba(245, 158, 11, 0.45)';
                ctx.beginPath();
                ctx.moveTo(screenX, screenZ);
                for (let i = 0; i < en.raycastHits.length; i++) {
                    const h = en.raycastHits[i];
                    const hgx = (h.worldX / this.tileSize) + (this.gridW - 1) / 2;
                    const hgz = (h.worldZ / this.tileSize) + (this.gridH - 1) / 2;
                    ctx.lineTo((hgx + 0.5) * cw, (hgz + 0.5) * ch);
                }
                ctx.closePath();
                ctx.fill();

                // Outline for sentry vision cone
                ctx.strokeStyle = isAlert ? '#ff1744' : '#f59e0b';
                ctx.lineWidth = 1.8;
                ctx.stroke();
            }

            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(screenX, screenZ, cw * 0.42, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.2;
            ctx.stroke();
        }

        // Draw Player on Radar
        const px = (this.playerState.x / this.tileSize) + (this.gridW - 1) / 2;
        const pz = (this.playerState.z / this.tileSize) + (this.gridH - 1) / 2;
        const pScreenX = (px + 0.5) * cw;
        const pScreenZ = (pz + 0.5) * ch;

        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(pScreenX, pScreenZ, cw * 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(pScreenX, pScreenZ);
        ctx.lineTo(
            pScreenX + Math.sin(this.playerState.angle) * cw * 0.85,
            pScreenZ + Math.cos(this.playerState.angle) * ch * 0.85
        );
        ctx.stroke();

        // ====================================================================
        // DEBUG ENUMERATION OVERLAY ON SOLITON RADAR
        // ====================================================================
        if (this.debug3DVisible) {
            ctx.save();
            ctx.font = 'bold 7px "JetBrains Mono", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // 1. Column indicators at top edge
            ctx.fillStyle = 'rgba(56, 189, 248, 0.85)';
            const colStep = this.gridW > 25 ? 5 : (this.gridW > 15 ? 4 : 2);
            for (let cx = 0; cx < this.gridW; cx += colStep) {
                ctx.fillText(`C${cx}`, (cx + 0.5) * cw, 5);
            }
            // 2. Row indicators at left edge
            ctx.textAlign = 'left';
            const rowStep = this.gridH > 25 ? 5 : (this.gridH > 15 ? 4 : 2);
            for (let rz = 0; rz < this.gridH; rz += rowStep) {
                ctx.fillText(`R${rz}`, 2, (rz + 0.5) * ch);
            }

            // 3. Compact labels on interactive gameplay items
            // Crystals (PAL Discs)
            ctx.textAlign = 'center';
            (this.crystals || []).forEach((c, idx) => {
                if (!c.collected) {
                    const gx = (c.x / this.tileSize) + (this.gridW - 1) / 2;
                    const gz = (c.z / this.tileSize) + (this.gridH - 1) / 2;
                    ctx.fillStyle = '#38bdf8';
                    ctx.fillText(`P${idx + 1}`, (gx + 0.5) * cw, (gz + 0.5) * ch - cw * 0.65);
                }
            });

            // Sentinels (Enemies)
            (this.enemies || []).forEach((s, idx) => {
                const gx = (s.x / this.tileSize) + (this.gridW - 1) / 2;
                const gz = (s.z / this.tileSize) + (this.gridH - 1) / 2;
                ctx.fillStyle = '#fbbf24';
                ctx.fillText(`G${idx + 1}`, (gx + 0.5) * cw, (gz + 0.5) * ch - cw * 0.65);
            });

            // CCTV Cameras
            (this.cameras || []).forEach((cam, idx) => {
                const gx = (cam.x / this.tileSize) + (this.gridW - 1) / 2;
                const gz = (cam.z / this.tileSize) + (this.gridH - 1) / 2;
                ctx.fillStyle = '#38bdf8';
                ctx.fillText(`C${idx + 1}`, (gx + 0.5) * cw, (gz + 0.5) * ch - cw * 0.65);
            });

            // PC Terminals
            (this.workstations || []).forEach((ws, idx) => {
                const gx = (ws.x / this.tileSize) + (this.gridW - 1) / 2;
                const gz = (ws.z / this.tileSize) + (this.gridH - 1) / 2;
                ctx.fillStyle = '#34d399';
                ctx.fillText(`PC${idx + 1}`, (gx + 0.5) * cw, (gz + 0.5) * ch - cw * 0.65);
            });

            // Sub-doors
            (this.subDoors || []).forEach((dr, idx) => {
                const gx = (dr.x / this.tileSize) + (this.gridW - 1) / 2;
                const gz = (dr.z / this.tileSize) + (this.gridH - 1) / 2;
                ctx.fillStyle = '#c084fc';
                ctx.fillText(`D${idx + 1}`, (gx + 0.5) * cw, (gz + 0.5) * ch - cw * 0.65);
            });

            // Switches
            (this.switches || []).forEach((sw, idx) => {
                const gx = sw.cx !== undefined ? sw.cx : this.worldToGridX(sw.x);
                const gz = sw.rz !== undefined ? sw.rz : this.worldToGridZ(sw.z);
                ctx.fillStyle = '#facc15';
                ctx.fillText(`U${idx + 1}`, (gx + 0.5) * cw, (gz + 0.5) * ch - cw * 0.65);
            });

            // Top-right DEBUG HUD marker on radar
            ctx.textAlign = 'right';
            ctx.fillStyle = '#f59e0b';
            ctx.fillText('DBG', W - 3, 7);

            ctx.restore();
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        const dt = Math.min(this.clock.getDelta(), 0.1);
        this.update(dt);
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }
}

window.Castle3DEngine = Castle3DEngine;
