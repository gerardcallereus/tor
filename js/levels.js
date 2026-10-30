// ============================================================================
// METAL GEAR LOGIC: PROTOCOL SHADOW CIRCUIT
// LLIBRERIA DE PORTES LÒGIQUES, GUIONS CODEC, 10 SECTORS MILITARS I CÀMERES
// ============================================================================

const LOGIC_GATES_LIBRARY = {
    NOT: {
        id: 'NOT',
        name: 'Porta NOT (Inversora de Senyals)',
        shortName: 'NOT',
        formula: 'Y = ¬A  (o  Y = Ā)',
        inputs: ['A'],
        summary: 'Inverteix el bit binari: si entra un 0 surt un 1, i si entra un 1 surt un 0.',
        theory: 'La porta lògica <strong>NOT</strong> (inversor lògic) és el bloc fonamental de la cibernètica militar. Té <strong>1 entrada (A)</strong> i <strong>1 sortida (Y)</strong>. Inverteix l’estat lògic del xip de seguretat: quan el sensor rep tensió positiva (1), la porta talla la sortida (0). Si el feix de seguretat es talla (0), la sortida commuta a 1. El cercle a la punta del triangle representa la negació lògica.',
        realWorld: '🎯 Aplicació militar MGS: Sistema de contramesures chaff i sensors perimetrals d’infrarojos: quan es detecta llum ambiental (A = 1), el sensor apaga els fars tàctics (Y = 0).',
        evalFn: (a) => (a ? 0 : 1),
        truthTable: [
            { in: [0], out: 1 },
            { in: [1], out: 0 }
        ]
    },
    AND: {
        id: 'AND',
        name: 'Porta AND (Interlock de Seguretat en Sèrie)',
        shortName: 'AND',
        formula: 'Y = A · B',
        inputs: ['A', 'B'],
        summary: 'La sortida només és 1 quan TOTES les entrades reben senyal simultani (1 i 1).',
        theory: 'La porta <strong>AND</strong> funciona com un protocol d’autorització dual: dos interruptors connectats <strong>en sèrie</strong>. Perquè s’activi el mecanisme d’obertura hidràulica (Y = 1), cal que el terminal biomètric A <strong>i</strong> la targeta xifrada B estiguin validats alhora (A = 1 i B = 1). Si qualsevol dels dos falla (0), el sistema roman bloquejat.',
        realWorld: '🛡️ Aplicació militar MGS: Mòdul de llançament de míssils nuclears que requereix la clau de comandament A i el codi d’activació B introduïts al mateix mil·lisegon.',
        evalFn: (a, b) => (a && b ? 1 : 0),
        truthTable: [
            { in: [0, 0], out: 0 },
            { in: [0, 1], out: 0 },
            { in: [1, 0], out: 0 },
            { in: [1, 1], out: 1 }
        ]
    },
    OR: {
        id: 'OR',
        name: 'Porta OR (Xarxa de Redundància en Paral·lel)',
        shortName: 'OR',
        formula: 'Y = A + B',
        inputs: ['A', 'B'],
        summary: 'La sortida és 1 si QUALSEVOL de les entrades està activa (o totes dues).',
        theory: 'La porta <strong>OR</strong> implementa tolerància a fallades amb circuits <strong>en paral·lel</strong>. N’hi ha prou que el generador auxiliar A <strong>o</strong> la bateria de reserva B subministrin energia perquè els sistemes vitals de la base continuïn operatius (Y = 1). Només s’apaga (Y = 0) si tots dos sistemes queden neutralitzats (0 i 0).',
        realWorld: '🔔 Aplicació militar MGS: Circuit d’alarma d’intrusió que dispara les sirenes si el detector de moviment A o el sensor làser B es trenquen.',
        evalFn: (a, b) => (a || b ? 1 : 0),
        truthTable: [
            { in: [0, 0], out: 0 },
            { in: [0, 1], out: 1 },
            { in: [1, 0], out: 1 },
            { in: [1, 1], out: 1 }
        ]
    },
    XOR: {
        id: 'XOR',
        name: 'Porta XOR (Verificació Diferencial Exclusiva)',
        shortName: 'XOR',
        formula: 'Y = A ⊕ B',
        inputs: ['A', 'B'],
        summary: 'La sortida és 1 només quan les dues entrades són DIFERENTS entre si (0,1 o 1,0).',
        theory: 'La porta <strong>XOR</strong> (<em>OR Exclusiva</em>) és el cor dels algoritmes criptogràfics militars de clau simètrica (One-Time Pad) i dels sumadors binaris de la CPU. Compara dos bits: si són diferents (A ≠ B), la sortida val <strong>1</strong>. Si són idèntics (tots dos 0 o tots dos 1), la sortida cau a <strong>0</strong>.',
        realWorld: '🔑 Aplicació militar MGS: Desxifrador de dades militars d’alta seguretat i xarxes neuronals d’intel·ligència artificial.',
        evalFn: (a, b) => (a !== b ? 1 : 0),
        truthTable: [
            { in: [0, 0], out: 0 },
            { in: [0, 1], out: 1 },
            { in: [1, 0], out: 1 },
            { in: [1, 1], out: 0 }
        ]
    },
    NAND: {
        id: 'NAND',
        name: 'Porta NAND (Porta Universal de Memòria)',
        shortName: 'NAND',
        formula: 'Y = ¬(A · B)',
        inputs: ['A', 'B'],
        summary: 'Inversa de l’AND: la sortida sempre és 1, EXCEPTE quan totes les entrades són 1 alhora.',
        theory: 'La porta <strong>NAND</strong> és la porta lògica més important del món industrial militar: és una <strong>porta universal</strong> amb la qual es pot construir qualsevol altre circuit digital, memòries Flash militars i microprocessadors sencers. La sortida només cau a <strong>0 quan A = 1 i B = 1</strong>.',
        realWorld: '💾 Aplicació militar MGS: Xips de memòria d’estat sòlid del tanc bípede Metal Gear Rex i sistemes de protecció contra atacs EMP.',
        evalFn: (a, b) => (!(a && b) ? 1 : 0),
        truthTable: [
            { in: [0, 0], out: 1 },
            { in: [0, 1], out: 1 },
            { in: [1, 0], out: 1 },
            { in: [1, 1], out: 0 }
        ]
    },
    NOR: {
        id: 'NOR',
        name: 'Porta NOR (Bloqueig de Quarantena Zero)',
        shortName: 'NOR',
        formula: 'Y = ¬(A + B)',
        inputs: ['A', 'B'],
        summary: 'Inversa de l’OR: la sortida només és 1 quan TOTES dues entrades són 0.',
        theory: 'La porta <strong>NOR</strong> és el protocol de quarantena absolut. Només manté el segell obert (Y = 1) quan el nivell de radiació A és 0 <strong>i</strong> la pressió de gas tòxic B és 0. Si qualsevol amenaça s’activa (val 1), la sortida cau immediatament a 0 per segellar hermèticament el sector.',
        realWorld: '🔒 Aplicació militar MGS: Comporta d’aïllament del reactor nuclear subterrani i sistemes de despressurització automàtica.',
        evalFn: (a, b) => (!(a || b) ? 1 : 0),
        truthTable: [
            { in: [0, 0], out: 1 },
            { in: [0, 1], out: 0 },
            { in: [1, 0], out: 0 },
            { in: [1, 1], out: 0 }
        ]
    },
    XNOR: {
        id: 'XNOR',
        name: 'Porta XNOR (Comparador d’Identitat Binària)',
        shortName: 'XNOR',
        formula: 'Y = ¬(A ⊕ B)',
        inputs: ['A', 'B'],
        summary: 'Inversa de la XOR: la sortida és 1 quan les entrades són IGUALS (0,0 o 1,1).',
        theory: 'La porta <strong>XNOR</strong> actua com un sensor d’equivalència. Dona <strong>1 només quan les dues entrades coincideixen</strong> exactament en el seu valor lògic. S’utilitza per comparar codis de seguretat entre l’escàner i la base de dades xifrada.',
        realWorld: '📡 Aplicació militar MGS: Escàner d’empremtes genètiques i verificadors de paritat en transmissions de dades per satèl·lit.',
        evalFn: (a, b) => (a === b ? 1 : 0),
        truthTable: [
            { in: [0, 0], out: 1 },
            { in: [0, 1], out: 0 },
            { in: [1, 0], out: 0 },
            { in: [1, 1], out: 1 }
        ]
    }
};

function getGateSVGMarkup(type, x, y) {
    const stroke = '#38bdf8';
    const fill = '#09131f';
    let shape = '';

    if (type === 'NOT') {
        shape = `
            <polygon points="${x},${y} ${x},${y + 44} ${x + 42},${y + 22}" fill="${fill}" stroke="${stroke}" stroke-width="2.5"/>
            <circle cx="${x + 48}" cy="${y + 22}" r="5.5" fill="${fill}" stroke="${stroke}" stroke-width="2.5"/>
            <text x="${x + 15}" y="${y + 26}" fill="#f8fafc" font-family="JetBrains Mono" font-size="11" font-weight="800">NOT</text>
        `;
    } else if (type === 'AND' || type === 'NAND') {
        shape = `
            <path d="M ${x} ${y} L ${x + 26} ${y} A 22 22 0 0 1 ${x + 26} ${y + 44} L ${x} ${y + 44} Z" fill="${fill}" stroke="${stroke}" stroke-width="2.5"/>
            ${type === 'NAND' ? `<circle cx="${x + 54}" cy="${y + 22}" r="5.5" fill="${fill}" stroke="${stroke}" stroke-width="2.5"/>` : ''}
            <text x="${x + 24}" y="${y + 26}" text-anchor="middle" fill="#f8fafc" font-family="JetBrains Mono" font-size="11" font-weight="800">${type}</text>
        `;
    } else if (type === 'OR' || type === 'NOR' || type === 'XOR' || type === 'XNOR') {
        const isX = (type === 'XOR' || type === 'XNOR');
        const isN = (type === 'NOR' || type === 'XNOR');
        shape = `
            ${isX ? `<path d="M ${x - 7} ${y} Q ${x + 5} ${y + 22} ${x - 7} ${y + 44}" fill="none" stroke="${stroke}" stroke-width="2.5"/>` : ''}
            <path d="M ${x} ${y} Q ${x + 28} ${y} ${x + 48} ${y + 22} Q ${x + 28} ${y + 44} ${x} ${y + 44} Q ${x + 12} ${y + 22} ${x} ${y} Z" fill="${fill}" stroke="${stroke}" stroke-width="2.5"/>
            ${isN ? `<circle cx="${x + 54}" cy="${y + 22}" r="5.5" fill="${fill}" stroke="${stroke}" stroke-width="2.5"/>` : ''}
            <text x="${x + 23}" y="${y + 26}" text-anchor="middle" fill="#f8fafc" font-family="JetBrains Mono" font-size="10.5" font-weight="800">${type}</text>
        `;
    }
    return shape;
}

function renderMissionCircuitSVG(mission, inValues, showOutputValue = null) {
    const wireColor = (val) => (val === 1 ? '#10b981' : '#334155');
    const wireWidth = (val) => (val === 1 ? '3.5' : '2.5');
    const badgeFill = (val) => (val === 1 ? '#064e3b' : '#0f172a');
    const badgeStroke = (val) => (val === 1 ? '#34d399' : '#475569');

    const A = inValues.A ?? 0;
    const B = inValues.B ?? 0;
    const C = inValues.C ?? 0;
    const D = inValues.D ?? 0;

    const cType = mission.circuitType;
    const outDisplay = showOutputValue === null ? '?' : showOutputValue;
    const outFill = showOutputValue === null ? '#1e293b' : badgeFill(showOutputValue);
    const outStroke = showOutputValue === null ? '#38bdf8' : badgeStroke(showOutputValue);
    const outWire = showOutputValue === 1 ? '#10b981' : '#38bdf8';

    if (cType === 'SINGLE_NOT') {
        return `
        <svg viewBox="0 0 420 150" width="100%" height="175">
            <line x1="65" y1="75" x2="170" y2="75" stroke="${wireColor(A)}" stroke-width="${wireWidth(A)}"/>
            <rect x="20" y="57" width="46" height="36" rx="8" fill="${badgeFill(A)}" stroke="${badgeStroke(A)}" stroke-width="2"/>
            <text x="43" y="80" text-anchor="middle" fill="#fff" font-family="JetBrains Mono" font-size="14" font-weight="800">A=${A}</text>
            ${getGateSVGMarkup('NOT', 170, 53)}
            <line x1="224" y1="75" x2="325" y2="75" stroke="${outWire}" stroke-width="3.5"/>
            <rect x="325" y="53" width="76" height="44" rx="10" fill="${outFill}" stroke="${outStroke}" stroke-width="2.5"/>
            <text x="363" y="80" text-anchor="middle" fill="#fff" font-family="JetBrains Mono" font-size="15" font-weight="800">Y=${outDisplay}</text>
        </svg>`;
    }

    if (cType.startsWith('SINGLE_')) {
        const gName = cType.replace('SINGLE_', '');
        const outX = (gName === 'NAND' || gName === 'NOR' || gName === 'XNOR') ? 230 : 218;
        return `
        <svg viewBox="0 0 430 165" width="100%" height="185">
            <line x1="68" y1="52" x2="140" y2="52" stroke="${wireColor(A)}" stroke-width="${wireWidth(A)}"/>
            <line x1="140" y1="52" x2="140" y2="70" stroke="${wireColor(A)}" stroke-width="${wireWidth(A)}"/>
            <line x1="140" y1="70" x2="172" y2="70" stroke="${wireColor(A)}" stroke-width="${wireWidth(A)}"/>

            <line x1="68" y1="114" x2="140" y2="114" stroke="${wireColor(B)}" stroke-width="${wireWidth(B)}"/>
            <line x1="140" y1="114" x2="140" y2="96" stroke="${wireColor(B)}" stroke-width="${wireWidth(B)}"/>
            <line x1="140" y1="96" x2="172" y2="96" stroke="${wireColor(B)}" stroke-width="${wireWidth(B)}"/>

            <rect x="18" y="34" width="50" height="34" rx="7" fill="${badgeFill(A)}" stroke="${badgeStroke(A)}" stroke-width="2"/>
            <text x="43" y="56" text-anchor="middle" fill="#fff" font-family="JetBrains Mono" font-size="13.5" font-weight="800">A=${A}</text>

            <rect x="18" y="96" width="50" height="34" rx="7" fill="${badgeFill(B)}" stroke="${badgeStroke(B)}" stroke-width="2"/>
            <text x="43" y="118" text-anchor="middle" fill="#fff" font-family="JetBrains Mono" font-size="13.5" font-weight="800">B=${B}</text>

            ${getGateSVGMarkup(gName, 170, 61)}

            <line x1="${outX}" y1="83" x2="328" y2="83" stroke="${outWire}" stroke-width="3.5"/>
            <rect x="328" y="61" width="80" height="44" rx="10" fill="${outFill}" stroke="${outStroke}" stroke-width="2.5"/>
            <text x="368" y="88" text-anchor="middle" fill="#fff" font-family="JetBrains Mono" font-size="15" font-weight="800">Y=${outDisplay}</text>
        </svg>`;
    }

    if (cType === 'COMB_AND_OR') {
        const mVal = (A && B) ? 1 : 0;
        const mText = showOutputValue === null ? 'M=?' : `M=${mVal}`;
        return `
        <svg viewBox="0 0 490 190" width="100%" height="200">
            <line x1="64" y1="42" x2="125" y2="42" stroke="${wireColor(A)}" stroke-width="${wireWidth(A)}"/>
            <line x1="125" y1="42" x2="125" y2="54" stroke="${wireColor(A)}" stroke-width="${wireWidth(A)}"/>
            <line x1="125" y1="54" x2="145" y2="54" stroke="${wireColor(A)}" stroke-width="${wireWidth(A)}"/>

            <line x1="64" y1="92" x2="125" y2="92" stroke="${wireColor(B)}" stroke-width="${wireWidth(B)}"/>
            <line x1="125" y1="92" x2="125" y2="80" stroke="${wireColor(B)}" stroke-width="${wireWidth(B)}"/>
            <line x1="125" y1="80" x2="145" y2="80" stroke="${wireColor(B)}" stroke-width="${wireWidth(B)}"/>

            <rect x="14" y="26" width="50" height="30" rx="6" fill="${badgeFill(A)}" stroke="${badgeStroke(A)}" stroke-width="2"/>
            <text x="39" y="46" text-anchor="middle" fill="#fff" font-family="JetBrains Mono" font-size="13" font-weight="800">A=${A}</text>

            <rect x="14" y="76" width="50" height="30" rx="6" fill="${badgeFill(B)}" stroke="${badgeStroke(B)}" stroke-width="2"/>
            <text x="39" y="96" text-anchor="middle" fill="#fff" font-family="JetBrains Mono" font-size="13" font-weight="800">B=${B}</text>

            ${getGateSVGMarkup('AND', 145, 45)}

            <line x1="193" y1="67" x2="265" y2="67" stroke="#38bdf8" stroke-width="2.5"/>
            <line x1="265" y1="67" x2="265" y2="95" stroke="#38bdf8" stroke-width="2.5"/>
            <line x1="265" y1="95" x2="288" y2="95" stroke="#38bdf8" stroke-width="2.5"/>
            <text x="230" y="58" text-anchor="middle" fill="#7dd3fc" font-family="JetBrains Mono" font-size="11" font-weight="700">${mText}</text>

            <line x1="64" y1="145" x2="265" y2="145" stroke="${wireColor(C)}" stroke-width="${wireWidth(C)}"/>
            <line x1="265" y1="145" x2="265" y2="121" stroke="${wireColor(C)}" stroke-width="${wireWidth(C)}"/>
            <line x1="265" y1="121" x2="288" y2="121" stroke="${wireColor(C)}" stroke-width="${wireWidth(C)}"/>

            <rect x="14" y="130" width="50" height="30" rx="6" fill="${badgeFill(C)}" stroke="${badgeStroke(C)}" stroke-width="2"/>
            <text x="39" y="150" text-anchor="middle" fill="#fff" font-family="JetBrains Mono" font-size="13" font-weight="800">C=${C}</text>

            ${getGateSVGMarkup('OR', 284, 86)}

            <line x1="332" y1="108" x2="392" y2="108" stroke="${outWire}" stroke-width="3.5"/>
            <rect x="392" y="86" width="82" height="44" rx="10" fill="${outFill}" stroke="${outStroke}" stroke-width="2.5"/>
            <text x="433" y="113" text-anchor="middle" fill="#fff" font-family="JetBrains Mono" font-size="15" font-weight="800">Y=${outDisplay}</text>
        </svg>`;
    }

    if (cType === 'COMB_NOR_AND') {
        const mVal = (!(A || B)) ? 1 : 0;
        const mText = showOutputValue === null ? 'M=?' : `M=${mVal}`;
        return `
        <svg viewBox="0 0 490 190" width="100%" height="200">
            <line x1="64" y1="42" x2="125" y2="42" stroke="${wireColor(A)}" stroke-width="${wireWidth(A)}"/>
            <line x1="125" y1="42" x2="125" y2="54" stroke="${wireColor(A)}" stroke-width="${wireWidth(A)}"/>
            <line x1="125" y1="54" x2="148" y2="54" stroke="${wireColor(A)}" stroke-width="${wireWidth(A)}"/>

            <line x1="64" y1="92" x2="125" y2="92" stroke="${wireColor(B)}" stroke-width="${wireWidth(B)}"/>
            <line x1="125" y1="92" x2="125" y2="80" stroke="${wireColor(B)}" stroke-width="${wireWidth(B)}"/>
            <line x1="125" y1="80" x2="148" y2="80" stroke="${wireColor(B)}" stroke-width="${wireWidth(B)}"/>

            <rect x="14" y="26" width="50" height="30" rx="6" fill="${badgeFill(A)}" stroke="${badgeStroke(A)}" stroke-width="2"/>
            <text x="39" y="46" text-anchor="middle" fill="#fff" font-family="JetBrains Mono" font-size="13" font-weight="800">A=${A}</text>

            <rect x="14" y="76" width="50" height="30" rx="6" fill="${badgeFill(B)}" stroke="${badgeStroke(B)}" stroke-width="2"/>
            <text x="39" y="96" text-anchor="middle" fill="#fff" font-family="JetBrains Mono" font-size="13" font-weight="800">B=${B}</text>

            ${getGateSVGMarkup('NOR', 145, 45)}

            <line x1="205" y1="67" x2="265" y2="67" stroke="#38bdf8" stroke-width="2.5"/>
            <line x1="265" y1="67" x2="265" y2="95" stroke="#38bdf8" stroke-width="2.5"/>
            <line x1="265" y1="95" x2="286" y2="95" stroke="#38bdf8" stroke-width="2.5"/>
            <text x="235" y="58" text-anchor="middle" fill="#7dd3fc" font-family="JetBrains Mono" font-size="11" font-weight="700">${mText}</text>

            <line x1="64" y1="145" x2="265" y2="145" stroke="${wireColor(C)}" stroke-width="${wireWidth(C)}"/>
            <line x1="265" y1="145" x2="265" y2="121" stroke="${wireColor(C)}" stroke-width="${wireWidth(C)}"/>
            <line x1="265" y1="121" x2="286" y2="121" stroke="${wireColor(C)}" stroke-width="${wireWidth(C)}"/>

            <rect x="14" y="130" width="50" height="30" rx="6" fill="${badgeFill(C)}" stroke="${badgeStroke(C)}" stroke-width="2"/>
            <text x="39" y="150" text-anchor="middle" fill="#fff" font-family="JetBrains Mono" font-size="13" font-weight="800">C=${C}</text>

            ${getGateSVGMarkup('AND', 286, 86)}

            <line x1="334" y1="108" x2="392" y2="108" stroke="${outWire}" stroke-width="3.5"/>
            <rect x="392" y="86" width="82" height="44" rx="10" fill="${outFill}" stroke="${outStroke}" stroke-width="2.5"/>
            <text x="433" y="113" text-anchor="middle" fill="#fff" font-family="JetBrains Mono" font-size="15" font-weight="800">Y=${outDisplay}</text>
        </svg>`;
    }

    if (cType === 'COMB_XOR_NOT_AND') {
        const m1 = (A !== B) ? 1 : 0;
        const m2 = (!C) ? 1 : 0;
        const m1Text = showOutputValue === null ? 'M1=?' : `M1=${m1}`;
        const m2Text = showOutputValue === null ? 'M2=?' : `M2=${m2}`;
        return `
        <svg viewBox="0 0 500 200" width="100%" height="205">
            <line x1="64" y1="38" x2="120" y2="38" stroke="${wireColor(A)}" stroke-width="${wireWidth(A)}"/>
            <line x1="120" y1="38" x2="120" y2="50" stroke="${wireColor(A)}" stroke-width="${wireWidth(A)}"/>
            <line x1="120" y1="50" x2="145" y2="50" stroke="${wireColor(A)}" stroke-width="${wireWidth(A)}"/>

            <line x1="64" y1="86" x2="120" y2="86" stroke="${wireColor(B)}" stroke-width="${wireWidth(B)}"/>
            <line x1="120" y1="86" x2="120" y2="74" stroke="${wireColor(B)}" stroke-width="${wireWidth(B)}"/>
            <line x1="120" y1="74" x2="145" y2="74" stroke="${wireColor(B)}" stroke-width="${wireWidth(B)}"/>

            <rect x="14" y="23" width="50" height="30" rx="6" fill="${badgeFill(A)}" stroke="${badgeStroke(A)}" stroke-width="2"/>
            <text x="39" y="43" text-anchor="middle" fill="#fff" font-family="JetBrains Mono" font-size="13" font-weight="800">A=${A}</text>

            <rect x="14" y="71" width="50" height="30" rx="6" fill="${badgeFill(B)}" stroke="${badgeStroke(B)}" stroke-width="2"/>
            <text x="39" y="91" text-anchor="middle" fill="#fff" font-family="JetBrains Mono" font-size="13" font-weight="800">B=${B}</text>

            ${getGateSVGMarkup('XOR', 142, 40)}

            <line x1="190" y1="62" x2="265" y2="62" stroke="#38bdf8" stroke-width="2.5"/>
            <line x1="265" y1="62" x2="265" y2="94" stroke="#38bdf8" stroke-width="2.5"/>
            <line x1="265" y1="94" x2="292" y2="94" stroke="#38bdf8" stroke-width="2.5"/>
            <text x="232" y="54" text-anchor="middle" fill="#7dd3fc" font-family="JetBrains Mono" font-size="10.5" font-weight="700">${m1Text}</text>

            <line x1="64" y1="150" x2="142" y2="150" stroke="${wireColor(C)}" stroke-width="${wireWidth(C)}"/>
            <rect x="14" y="135" width="50" height="30" rx="6" fill="${badgeFill(C)}" stroke="${badgeStroke(C)}" stroke-width="2"/>
            <text x="39" y="155" text-anchor="middle" fill="#fff" font-family="JetBrains Mono" font-size="13" font-weight="800">C=${C}</text>

            ${getGateSVGMarkup('NOT', 142, 128)}

            <line x1="196" y1="150" x2="265" y2="150" stroke="#38bdf8" stroke-width="2.5"/>
            <line x1="265" y1="150" x2="265" y2="120" stroke="#38bdf8" stroke-width="2.5"/>
            <line x1="265" y1="120" x2="292" y2="120" stroke="#38bdf8" stroke-width="2.5"/>
            <text x="232" y="166" text-anchor="middle" fill="#7dd3fc" font-family="JetBrains Mono" font-size="10.5" font-weight="700">${m2Text}</text>

            ${getGateSVGMarkup('AND', 292, 85)}

            <line x1="340" y1="107" x2="398" y2="107" stroke="${outWire}" stroke-width="3.5"/>
            <rect x="398" y="85" width="82" height="44" rx="10" fill="${outFill}" stroke="${outStroke}" stroke-width="2.5"/>
            <text x="439" y="112" text-anchor="middle" fill="#fff" font-family="JetBrains Mono" font-size="15" font-weight="800">Y=${outDisplay}</text>
        </svg>`;
    }

    if (cType === 'COMB_MASTER_4') {
        const m1 = (A && B) ? 1 : 0;
        const m2 = (C || D) ? 1 : 0;
        const m1Text = showOutputValue === null ? 'M1=?' : `M1=${m1}`;
        const m2Text = showOutputValue === null ? 'M2=?' : `M2=${m2}`;
        return `
        <svg viewBox="0 0 510 215" width="100%" height="215">
            <line x1="64" y1="32" x2="122" y2="32" stroke="${wireColor(A)}" stroke-width="${wireWidth(A)}"/>
            <line x1="122" y1="32" x2="122" y2="45" stroke="${wireColor(A)}" stroke-width="${wireWidth(A)}"/>
            <line x1="122" y1="45" x2="145" y2="45" stroke="${wireColor(A)}" stroke-width="${wireWidth(A)}"/>

            <line x1="64" y1="76" x2="122" y2="76" stroke="${wireColor(B)}" stroke-width="${wireWidth(B)}"/>
            <line x1="122" y1="76" x2="122" y2="67" stroke="${wireColor(B)}" stroke-width="${wireWidth(B)}"/>
            <line x1="122" y1="67" x2="145" y2="67" stroke="${wireColor(B)}" stroke-width="${wireWidth(B)}"/>

            <rect x="14" y="18" width="50" height="28" rx="6" fill="${badgeFill(A)}" stroke="${badgeStroke(A)}" stroke-width="2"/>
            <text x="39" y="37" text-anchor="middle" fill="#fff" font-family="JetBrains Mono" font-size="12.5" font-weight="800">A=${A}</text>

            <rect x="14" y="62" width="50" height="28" rx="6" fill="${badgeFill(B)}" stroke="${badgeStroke(B)}" stroke-width="2"/>
            <text x="39" y="81" text-anchor="middle" fill="#fff" font-family="JetBrains Mono" font-size="12.5" font-weight="800">B=${B}</text>

            ${getGateSVGMarkup('AND', 145, 34)}

            <line x1="64" y1="132" x2="122" y2="132" stroke="${wireColor(C)}" stroke-width="${wireWidth(C)}"/>
            <line x1="122" y1="132" x2="122" y2="145" stroke="${wireColor(C)}" stroke-width="${wireWidth(C)}"/>
            <line x1="122" y1="145" x2="148" y2="145" stroke="${wireColor(C)}" stroke-width="${wireWidth(C)}"/>

            <line x1="64" y1="176" x2="122" y2="176" stroke="${wireColor(D)}" stroke-width="${wireWidth(D)}"/>
            <line x1="122" y1="176" x2="122" y2="167" stroke="${wireColor(D)}" stroke-width="${wireWidth(D)}"/>
            <line x1="122" y1="167" x2="148" y2="167" stroke="${wireColor(D)}" stroke-width="${wireWidth(D)}"/>

            <rect x="14" y="118" width="50" height="28" rx="6" fill="${badgeFill(C)}" stroke="${badgeStroke(C)}" stroke-width="2"/>
            <text x="39" y="137" text-anchor="middle" fill="#fff" font-family="JetBrains Mono" font-size="12.5" font-weight="800">C=${C}</text>

            <rect x="14" y="162" width="50" height="28" rx="6" fill="${badgeFill(D)}" stroke="${badgeStroke(D)}" stroke-width="2"/>
            <text x="39" y="181" text-anchor="middle" fill="#fff" font-family="JetBrains Mono" font-size="12.5" font-weight="800">D=${D}</text>

            ${getGateSVGMarkup('OR', 145, 134)}

            <line x1="193" y1="56" x2="268" y2="56" stroke="#38bdf8" stroke-width="2.5"/>
            <line x1="268" y1="56" x2="268" y2="95" stroke="#38bdf8" stroke-width="2.5"/>
            <line x1="268" y1="95" x2="298" y2="95" stroke="#38bdf8" stroke-width="2.5"/>
            <text x="234" y="48" text-anchor="middle" fill="#7dd3fc" font-family="JetBrains Mono" font-size="10.5" font-weight="700">${m1Text}</text>

            <line x1="193" y1="156" x2="268" y2="156" stroke="#38bdf8" stroke-width="2.5"/>
            <line x1="268" y1="156" x2="268" y2="121" stroke="#38bdf8" stroke-width="2.5"/>
            <line x1="268" y1="121" x2="298" y2="121" stroke="#38bdf8" stroke-width="2.5"/>
            <text x="234" y="172" text-anchor="middle" fill="#7dd3fc" font-family="JetBrains Mono" font-size="10.5" font-weight="700">${m2Text}</text>

            ${getGateSVGMarkup('XOR', 295, 86)}

            <line x1="343" y1="108" x2="402" y2="108" stroke="${outWire}" stroke-width="3.5"/>
            <rect x="402" y="86" width="86" height="44" rx="10" fill="${outFill}" stroke="${outStroke}" stroke-width="2.5"/>
            <text x="445" y="113" text-anchor="middle" fill="#fff" font-family="JetBrains Mono" font-size="15" font-weight="800">Y=${outDisplay}</text>
        </svg>`;
    }

    return '';
}

// ============================================================================
// 10 SECTORS MILITARS DE LA BASE "SHADOW CIRCUIT" (ESTIL METAL GEAR SOLID)
// Llegenda tàctica interactiva:
// '#' = Mur blindat de formigó i acer (amb finestres d'observació a la tempesta)
// '.' = Terra industrial de planxes metàl·liques amb línies de precaució
// 'S' = Punt d'inserció de Snake (Infiltration Point)
// 'G' = Comporta Principal hidràulica amb Terminal Lògic de Firewall
// 'K' = Disc PAL xifrat hologràfic (recollir per desbloquejar el terminal)
// 'C' = Caixa de subministraments i racions (+25s temps extra, cobertura)
// 'B' = Contenidor pesant de càrrega (empènyer per cobrir-se, tapar rases o bloquejar feixos làser!)
// 'O' = Pou de descompressió obert amb ventilador industrial gegant giratori al fons
// 'L' = Reixeta d'alta tensió amb bobines Tesla i arcs elèctrics blaus animats
// 'Z' = Barrera de Raigs Làser de Seguretat (tripwire infraroig; bloqueja passadissos claus!)
// 'U' = Disjuntor / Interruptor elèctric de seguretat (prémer E per desactivar làsers o obrir portes D)
// 'D' = Porta de seguretat secundària corredissa (prémer E per obrir/tancar, o interruptor U / placa F)
// 'F' = Placa de pressió al terra (pujar-hi o col·locar caixa B per obrir la comporta D)
// 'V' = Canonada de vapor d'alta pressió amb bufades periòdiques
// 'T' = Balisa d'emergència giratòria vermella
// 'P' = Columna d'acer estructural
// 'E' = Servidor mainframe militar amb LEDs intermitents
// 'M' = Consola de radar tàctic
// 'A' = Armari de blindatge i municions
// 'W' = Estació de descontaminació química
// 'Q' = Terminal de control de càmeres CCTV
// 'N' = Enllaç Codec hologràfic (Otacon / Meryl)
// 'Y' = Taula d'operacions / Despatx amb cadires, telèfon tàctic i documents
// 'X' = Planta biològica d'interior de laboratori en test
// 'R' = Estació de treball PC amb monitors dobles i torre amb LED (hackejar amb E per desactivar càmeres)
// 'I' = Pantalla gegant d'informació tàctica i telemetria
// 'H' = Fanal / Làmpada de sostre industrial amb con de llum càlid
// 'J' = Quadre / Tauler de mapes i plànols tàctics FOXHOUND
// '$' = Sofà de pell (confort militar, cuir de diferents colors)
// 't' = Taula de reunions / cafè amb documents i tasses
// 'c' = Cadira d'oficina / Butaca de descans
// 'b' = Estanteria / Llibreria de fusta plena de llibres de colors
// 'a' = Armari / Guarda-roba de fusta amb portes i tiradors de llautó
// 'p' = Plantes exòtiques variades (ficus, monstera, anthurium amb flors vermelles, sansevieria)
// 'l' = Làmpada de peu de llautó amb pantalla càlida i llum ambiental
// 'r' = Catifa decorativa persa/militar de vellut amb rivets daurats (transitable)
// 'q' = Quadre / Pintura emmarcada a la paret
// 'w' = Mur amb finestral panoràmic a la tempesta àrtica
// ============================================================================

const TACTICAL_MISSIONS = [
    // ------------------------------------------------------------------------
    // SECTOR 01: HELIPORT I DIC EXTERIOR
    // ------------------------------------------------------------------------
    {
        id: 1,
        title: "Sector 01: Heliport i Dic de Càrrega",
        gateBadge: "Porta NOT",
        circuitType: "SINGLE_NOT",
        gateIds: ["NOT"],
        inputs: ["A"],
        evalCircuit: ({ A }) => (A ? 0 : 1),
        zoneName: "Heliport Exterior (Nevada Àrtica)",
        codecBriefing: [
            { speaker: "Campbell", freq: "140.85", text: "Snake, has aconseguit infiltrar-te a la base Shadow Circuit pel dic de càrrega. Els terroristes han bloquejat la comporta d'accés amb un inversor lògic NOT." },
            { speaker: "Otacon", freq: "141.12", text: "Snake! La porta NOT inverteix el senyal binari. Si el sensor de seguretat envia un 1, el pany el commuta a 0 i es bloqueja. Per obrir-lo, has d'aconseguir que la sortida Y sigui 1!" },
            { speaker: "Snake", freq: "140.85", text: "Entès. Vigilaré els sentinelles i les càmeres de seguretat. Si entro al seu con de visió, sonarà l'alarma general." }
        ],
        shortDesc: "Infiltra't pel dic nevat sense ser vist pels cons de visió dels sentinelles ni per la càmera de seguretat. Recull els 2 discs òptics i pirategia el terminal NOT.",
        theoryTitle: "Porta Lògica NOT (Inversor de Senyal)",
        theoryFormula: "Y = ¬A   (Si A=0 → Y=1 | Si A=1 → Y=0)",
        theoryHtml: `
            <p>El terminal de la comporta d'accés utilitza un <strong>xip inversor NOT</strong>.</p>
            <p style="margin-top:0.45rem;">Només té <strong>1 línia d'entrada (A)</strong> i <strong>1 sortida de control (Y)</strong>. La sortida sempre és l'estat oposat al senyal transmès.</p>
        `,
        truthTableHeaders: ["Entrada A", "Sortida Y (¬A)"],
        truthTableRows: [
            [[0], 1],
            [[1], 0]
        ],
        challenges: [
            {
                mode: "DEDUCE_OUT",
                prompt: "Fase 1/3: El sensor de seguretat emet A = 1. Quin estat transmetrà l'inversor NOT a la comporta Y?",
                inputs: { A: 1 },
                expectedOut: 0,
                explanation: "L'inversor NOT nega el senyal binari: 1 es converteix en Y = 0."
            },
            {
                mode: "DEDUCE_OUT",
                prompt: "Fase 2/3: Si desconnectem el feix làser a A = 0, quina serà la sortida Y del terminal?",
                inputs: { A: 0 },
                expectedOut: 1,
                explanation: "Quan l'entrada és 0, la porta NOT emet un senyal alt actiu: Y = 1."
            },
            {
                mode: "CONFIGURE_IN",
                prompt: "Fase 3/3: Configura l'entrada A per enviar Y = 1 i desactivar el segell hidràulic de la comporta!",
                initialInputs: { A: 1 },
                targetOut: 1,
                explanation: "Per obtenir Y = 1 en una porta NOT, cal commutar l'interruptor a A = 0."
            }
        ],
        finalChallenge: {
            title: "Comporta Cuirassada del Dic: Vàlvula de Descompressió Hidràulica",
            realWorldContext: "🎯 Aplicació d'Enginyeria MGS: El dic d'infiltració està sotmès a pressió criogènica sota zero. La vàlvula d'alleujament de seguretat utilitza un inversor NOT connectat al sensor de gel crític A. Si el sensor detecta bloqueig per gel (A = 1), l'inversor tanca la vàlvula (Y = 0) per evitar danys mecànics. Perquè el sistema d'evacuació permeti la sortida segura d'Snake, cal activar la vàlvula de purga (Y = 1).",
            prompt: "Repte Final d'Enginyeria: Configura l'estat del sensor de control A necessari perquè l'inversor NOT obri la vàlvula de descompressió (Y = 1) i desbloquegi la sortida G!",
            mode: "CONFIGURE_IN",
            initialInputs: { A: 1 },
            targetOut: 1,
            explanation: "Excel·lent, Snake! En un inversor NOT (Y = ¬A), per activar la sortida Y = 1 cal que el senyal de control A sigui 0. La comporta cuirassada s'ha desbloquejat!"
        },
        map: [
            "##########G######",
            "#...R#«.p..l#pRb#",
            "#..6.#......#..t#",
            "#...p#......#..c#",
            "#p...D..¡..¿D.a.#",
            "####.#####.######",
            "#....#{..Z.....¿#",
            "#.$..#.3.#U.....#",
            "#...e#K.|#...p..#",
            "#....#####.####D#",
            "#l..p#.....#..b.#",
            "###D##.p.p.#....#",
            "#bb.p#..r..D.K.l#",
            "#....D.p.p.######",
            "#p...#.....#●...#",
            "#S..¶#.....D...R#",
            "#################"
        ],
        enemies: [
            {
                type: "PATROL",
                waypoints: [
                    [6, 10],
                    [10, 10],
                    [10, 15],
                    [6, 15]
                ],
                speed: 2.1,
                fov: 65,
                viewDist: 7.2
            },
            {
                type: "PATROL",
                waypoints: [
                    [1, 6],
                    [4, 6],
                    [4, 7],
                    [3, 7],
                    [3, 10],
                    [2, 10],
                    [1, 9]
                ],
                speed: 2.3,
                fov: 65,
                viewDist: 7.5
            }
        ],
        cameras: [
            {
                x: 1,
                z: 1,
                type: "SWEEP",
                fixed: false,
                baseAngle: 0.785,
                sweepAngle: 1.57,
                sweepSpeed: 0.45,
                fov: 50,
                viewDist: 12,
                minDist: 0.6
            },
            {
                x: 9,
                z: 2,
                type: "ROTARY_360",
                fixed: false,
                baseAngle: 0,
                sweepAngle: 6.28,
                sweepSpeed: 1.05,
                fov: 65,
                viewDist: 11,
                minDist: 0
            },
            {
                x: 12,
                z: 6,
                type: "SWEEP",
                fixed: false,
                baseAngle: 0,
                sweepAngle: 1.4835298641951802,
                sweepSpeed: 0.48,
                fov: 55,
                viewDist: 10.5,
                minDist: 0.6
            },
            {
                x: 12,
                z: 10,
                type: "SWEEP",
                fixed: false,
                baseAngle: 0.7853981633974483,
                sweepAngle: 6.28,
                sweepSpeed: 0.65,
                fov: 75,
                viewDist: 7.5,
                minDist: 0
            }
        ],
        rotations: {
            "4,1": 180,
            "3,2": 90,
            "15,2": 270,
            "15,3": 270,
            "2,7": 0,
            "15,15": 270,
            "11,15": 270,
            "15,9": 270,
            "4,8": 270,
            "12,5": 270,
            "10,7": 90,
            "15,6": 90,
            "11,4": 90,
            "8,4": 90,
            "8,1": 90,
            "13,8": 90,
            "7,13": 90,
            "7,11": 90,
            "9,11": 90,
            "9,13": 90,
            "4,12": 90,
            "1,14": 90,
            "4,3": 90,
            "6,6": 90,
            "8,8": 90
        }
    },

    // ------------------------------------------------------------------------
    // SECTOR 02: HANGAR DE BLINDATS I TANCS
    // ------------------------------------------------------------------------
    {
        id: 2,
        title: "Sector 02: Hangar de Blindats i Tancs",
        gateBadge: "Porta AND",
        circuitType: "SINGLE_AND",
        gateIds: ["AND"],
        inputs: ["A", "B"],
        evalCircuit: ({ A, B }) => (A && B ? 1 : 0),
        zoneName: "Hangar de Tancs i Transport Pesant",
        codecBriefing: [
            { speaker: "Campbell", freq: "140.85", text: "Snake, estàs a l'hangar de vehicles de combat. La següent comporta està protegida per un interlock AND." },
            { speaker: "Otacon", freq: "141.12", text: "Una porta AND equival a dos interruptors de seguretat en sèrie. Només obrirà el circuit si les dues línies A i B estan alimentades a 1 alhora!" },
            { speaker: "Mei Ling", freq: "140.96", text: "Compte amb les càmeres del sostre, Snake. El Soliton Radar t'indicarà la seva zona d'escombrada en color groc." }
        ],
        shortDesc: "Esquiva els cons de vigilància dels sentinelles armats i les càmeres mòbils. Recull els 2 discs xifrats per desbloquejar l'interlock AND.",
        theoryTitle: "Porta Lògica AND (Interlock en Sèrie)",
        theoryFormula: "Y = A · B   (Només Y=1 si A=1 i B=1)",
        theoryHtml: `
            <p>La <strong>Porta AND</strong> és el sistema de protecció militar per excel·lència. Exigeix coincidència dual simultània.</p>
            <p style="margin-top:0.45rem;">Si la línia A o la línia B és 0, el corrent s'interromp i la comporta roman tancada a 0.</p>
        `,
        truthTableHeaders: ["Entrada A", "Entrada B", "Sortida Y (A · B)"],
        truthTableRows: [
            [[0, 0], 0],
            [[0, 1], 0],
            [[1, 0], 0],
            [[1, 1], 1]
        ],
        challenges: [
            {
                mode: "DEDUCE_OUT",
                prompt: "Fase 1/3: Si l'escàner A = 1 però la clau B = 0, quina serà la sortida Y de la porta AND?",
                inputs: { A: 1, B: 0 },
                expectedOut: 0,
                explanation: "En una porta AND cal que TOTES DUES entrades siguin 1. Com que B = 0, la sortida és Y = 0."
            },
            {
                mode: "DEDUCE_OUT",
                prompt: "Fase 2/3: Si sincronitzem A = 1 i B = 1 alhora, quina sortida generarà el circuit?",
                inputs: { A: 1, B: 1 },
                expectedOut: 1,
                explanation: "Totes dues condicions es compleixen: 1 · 1 genera Y = 1."
            },
            {
                mode: "CONFIGURE_IN",
                prompt: "Fase 3/3: Configura les entrades (A, B) necessàries per fer que el circuit AND doni Y = 1!",
                initialInputs: { A: 0, B: 1 },
                targetOut: 1,
                explanation: "La porta AND només activa la sortida quan A = 1 i B = 1 simultàniament."
            }
        ],
        finalChallenge: {
            title: "Protocol d'Autorització Dual de la Comporta dels Tancs",
            realWorldContext: "🛡️ Aplicació d'Enginyeria MGS: La sortida de l'hangar de vehicles de combat utilitza un circuit AND amb interruptors en sèrie. Per seguretat balística militar, la comporta exigeix la concurrència de dues claus alhora: l'escàner d'empremta dactilar d'Snake (A) i la targeta xifrada de desarmament (B). Només quan A=1 i B=1, el pany hidràulic s'obre (Y = 1).",
            prompt: "Repte Final d'Enginyeria: Configura les entrades (A, B) de la comporta cuirassada perquè el circuit AND generi el senyal d'obertura Y = 1!",
            mode: "CONFIGURE_IN",
            initialInputs: { A: 0, B: 1 },
            targetOut: 1,
            explanation: "Molt bé! En un interlock AND (Y = A · B), els dos interruptors estan connectats en sèrie i és imprescindible que TOTES DUES entrades (A=1 i B=1) estiguin activades simultàniament."
        },
        map: [
            "#####G###########",
            "#.Kb#.~.#8....#R#",
            "#...#...D..$c.D.#",
            "#p..#...#.....#.#",
            "#...###D#.l...#p#",
            "##D##...#####.###",
            "#...#...#R.Z..#R#",
            "#..p#...#..#U.#.#",
            "#...#.4.#.8#..#.#",
            "#...#...####..D.#",
            "#d.p#...#8....#.#",
            "##D###D##.....#.#",
            "#...D.....#...#.#",
            "#...#.5..p#..p#b#",
            "#####.....#######",
            "#S..D.........DK#",
            "#################"
        ],
        enemies: [
            {
                type: "PATROL",
                waypoints: [
                    [5, 12],
                    [9, 12],
                    [9, 15],
                    [5, 15]
                ],
                speed: 2.2,
                fov: 65,
                viewDist: 7.5
            },
            {
                type: "PATROL",
                waypoints: [
                    [5, 5],
                    [7, 5],
                    [7, 10],
                    [5, 10]
                ],
                speed: 2.1,
                fov: 65,
                viewDist: 7.5
            },
            {
                type: "PATROL",
                waypoints: [
                    [13, 1],
                    [10, 1],
                    [10, 3],
                    [13, 3],
                    [13, 13]
                ],
                speed: 2.1,
                fov: 65,
                viewDist: 7.5
            }
        ],
        cameras: [
            {
                x: 1,
                z: 8,
                fixed: false,
                baseAngle: 1.5707963267948966,
                sweepAngle: 3.141592653589793,
                sweepSpeed: 0.6,
                fov: 35,
                viewDist: 9.5,
                type: "SWEEP",
                minDist: 0
            },
            {
                x: 12,
                z: 11,
                fixed: false,
                baseAngle: 1.57,
                sweepAngle: 6.28,
                sweepSpeed: 0.75,
                fov: 55,
                viewDist: 7.5,
                type: "ROTARY_360",
                minDist: 0.8
            }
        ],
        rotations: {
            "3,1": 180,
            "14,2": 270,
            "1,10": 90,
            "4,13": 90,
            "9,6": 90,
            "2,1": 90,
            "14,8": 90,
            "14,7": 90,
            "14,10": 90,
            "14,11": 90,
            "14,12": 90,
            "14,13": 90,
            "10,13": 90,
            "10,12": 90,
            "13,14": 90,
            "14,6": 90,
            "11,7": 90,
            "11,8": 90,
            "11,6": 90,
            "12,7": 90,
            "12,5": 90,
            "15,13": 180
        }
    },

    // ------------------------------------------------------------------------
    // SECTOR 03: MAGATZEM DE CAPS NUCLEAR
    // ------------------------------------------------------------------------
    {
        id: 3,
        title: "Sector 03: Magatzem de Caps Nuclears",
        gateBadge: "Porta OR",
        circuitType: "SINGLE_OR",
        gateIds: ["OR"],
        inputs: ["A", "B"],
        evalCircuit: ({ A, B }) => (A || B ? 1 : 0),
        zoneName: "Dipòsit Nuclear Subterrani",
        codecBriefing: [
            { speaker: "Otacon", freq: "141.12", text: "Snake, aquest és el magatzem de caps nuclears! No disparis cap arma de foc aquí dins!" },
            { speaker: "Campbell", freq: "140.85", text: "El sistema de ventilació d'emergència està controlat per una porta OR en paral·lel. Amb que una sola línia funcioni, el flux d'aire es manté." }
        ],
        shortDesc: "Infiltra't pel magatzem de caps nuclears. Recull els 2 discs PAL xifrats i hackeja el terminal de control de la comporta OR.",
        theoryTitle: "Porta Lògica OR (Circuit en Paral·lel)",
        theoryFormula: "Y = A + B   (Y=1 si A=1 o B=1 o tots dos)",
        theoryHtml: `
            <p>La <strong>Porta OR</strong> proporciona redundància operativa: n'hi ha prou que <strong>almenys una de les línies valgui 1</strong> perquè la sortida Y s'activi a 1.</p>
        `,
        truthTableHeaders: ["Entrada A", "Entrada B", "Sortida Y (A + B)"],
        truthTableRows: [
            [[0, 0], 0],
            [[0, 1], 1],
            [[1, 0], 1],
            [[1, 1], 1]
        ],
        challenges: [
            {
                mode: "DEDUCE_OUT",
                prompt: "Fase 1/3: Si l'alimentació A = 0 però el generador B = 1, quina és la sortida Y de la porta OR?",
                inputs: { A: 0, B: 1 },
                expectedOut: 1,
                explanation: "En una porta OR n'hi ha prou que una entrada sigui 1 perquè la sortida sigui Y = 1."
            },
            {
                mode: "DEDUCE_OUT",
                prompt: "Fase 2/3: Si totes dues fonts estan a zero (A = 0 i B = 0), quina serà la sortida Y?",
                inputs: { A: 0, B: 0 },
                expectedOut: 0,
                explanation: "Quan cap entrada té corrent, la porta OR genera Y = 0."
            },
            {
                mode: "CONFIGURE_IN",
                prompt: "Fase 3/3: El protocol de simulació demana apagar el circuit OR. Configura A i B per obtenir Y = 0!",
                initialInputs: { A: 1, B: 1 },
                targetOut: 0,
                explanation: "L'única combinació on una porta OR dóna 0 és quan A = 0 i B = 0."
            }
        ],
        finalChallenge: {
            title: "Xarxa de Redundància de Suport Vital i Extracció Nuclear",
            realWorldContext: "🔔 Aplicació d'Enginyeria MGS: El magatzem de caps atòmics utilitza una porta OR per garantir la ventilació d'emergència en paral·lel. N'hi ha prou que la línia de la xarxa elèctrica principal (A) o el generador auxiliar dièsel (B) proporcionin energia (valor 1) perquè els extractors mantinguin la cambra segura (Y = 1).",
            prompt: "Repte Final d'Enginyeria: Configura les línies d'alimentació (A, B) de manera que la porta OR mantingui actiu el subministrament (Y = 1) i obri la sortida nuclear!",
            mode: "CONFIGURE_IN",
            initialInputs: { A: 0, B: 0 },
            targetOut: 1,
            explanation: "Perfecte! La porta OR (Y = A + B) ofereix tolerància a fallades: amb que una sola de les fonts d'energia (A o B) valgui 1, la sortida Y s'activa i la comporta nuclear s'obre!"
        },
        map: [
            "########G########",
            "#R.s#..r.r..#m.K#",
            "#...D..r.r..D...#",
            "#x.v#.......#..m#",
            "#####.#####.#####",
            "#2.!#.#K.e#.#7.k#",
            "#...D.D...D.D...#",
            "#g.f#.#...#.#../#",
            "#####.......#####",
            "#...D..▲.▲..D...#",
            "#._.#.......#.y.#",
            "#...#.#####.#...#",
            "###D#.#R.c#.#D###",
            "#j..#.#..4D.#.~.#",
            "#...D.......D.¶.#",
            "#S.p#..U.Z..#..C#",
            "#################"
        ],
        enemies: [
                    {
                                "type": "PATROL",
                                "waypoints": [
                                            [
                                                        5,
                                                        3
                                            ],
                                            [
                                                        11,
                                                        3
                                            ],
                                            [
                                                        11,
                                                        8
                                            ],
                                            [
                                                        5,
                                                        8
                                            ]
                                ],
                                "speed": 2.1,
                                "fov": 65,
                                "viewDist": 7.5
                    },
                    {
                                "type": "PATROL",
                                "waypoints": [
                                            [
                                                        5,
                                                        10
                                            ],
                                            [
                                                        11,
                                                        10
                                            ],
                                            [
                                                        11,
                                                        14
                                            ],
                                            [
                                                        5,
                                                        14
                                            ]
                                ],
                                "speed": 2.2,
                                "fov": 65,
                                "viewDist": 7.5
                    }
        ],
        cameras: [
                    {
                                "x": 5,
                                "z": 1,
                                "type": "SWEEP",
                                "fixed": false,
                                "baseAngle": 0.785,
                                "sweepAngle": 1.57,
                                "sweepSpeed": 0.5,
                                "fov": 55,
                                "viewDist": 10.0,
                                "minDist": 0.6
                    },
                    {
                                "x": 8,
                                "z": 8,
                                "type": "ROTARY_360",
                                "fixed": false,
                                "baseAngle": 0,
                                "sweepAngle": 6.28,
                                "sweepSpeed": 0.85,
                                "fov": 60,
                                "viewDist": 9.0,
                                "minDist": 0.6
                    },
                    {
                                "x": 11,
                                "z": 14,
                                "type": "SWEEP",
                                "fixed": false,
                                "baseAngle": 3.1416,
                                "sweepAngle": 1.4,
                                "sweepSpeed": 0.55,
                                "fov": 50,
                                "viewDist": 9.5,
                                "minDist": 0.6
                    }
        ],
        rotations: {
            "1,1": 0,
            "3,1": 0,
            "15,1": 0,
            "4,2": 90,
            "12,2": 90,
            "1,3": 180,
            "3,3": 180,
            "1,5": 0,
            "3,5": 0,
            "7,5": 0,
            "9,5": 0,
            "13,5": 0,
            "15,5": 0,
            "4,6": 90,
            "6,6": 90,
            "10,6": 90,
            "12,6": 90,
            "1,7": 180,
            "3,7": 180,
            "15,7": 180,
            "4,9": 90,
            "7,9": 0,
            "9,9": 0,
            "12,9": 90,
            "14,10": 0,
            "3,12": 0,
            "7,12": 0,
            "9,12": 0,
            "13,12": 0,
            "1,13": 0,
            "9,13": 0,
            "10,13": 0,
            "14,13": 0,
            "4,14": 90,
            "12,14": 90,
            "14,14": 0,
            "3,15": 180,
            "7,15": 180,
            "9,15": 180,
            "15,15": 180
        }
    },

    // ------------------------------------------------------------------------
    // SECTOR 04: POLVORÍ I DIPÒSIT D'ARMAMENT (XOR)
    // ------------------------------------------------------------------------
    {
        id: 4,
        title: "Sector 04: Polvorí i Dipòsit d'Armament",
        gateBadge: "Porta XOR",
        circuitType: "SINGLE_XOR",
        gateIds: ["XOR"],
        inputs: ["A", "B"],
        evalCircuit: ({ A, B }) => (A !== B ? 1 : 0),
        zoneName: "Dipòsit d'Armes i Càrregues C4",
        codecBriefing: [
            { speaker: "Otacon", freq: "141.12", text: "Snake, la comporta del polvorí està blindada amb un comparador exclusiu XOR!" },
            { speaker: "Snake", freq: "140.85", text: "XOR... si els dos senyals són iguals, es bloqueja?" },
            { speaker: "Otacon", freq: "141.12", text: "Exacte! Només dóna sortida 1 quan les entrades són diferents (0 i 1 o 1 i 0). Si reben el mateix codi, dona 0." }
        ],
        shortDesc: "Infiltra't pel polvorí militar. Recull els 2 discs PAL xifrats i resol el xifratge XOR de la comporta.",
        theoryTitle: "Porta Lògica XOR (OR Exclusiva)",
        theoryFormula: "Y = A ⊕ B   (Y=1 només quan A ≠ B)",
        theoryHtml: `
            <p>La <strong>Porta XOR</strong> detecta disparitat binària: dona <strong>Y = 1 quan una entrada és 1 i l'altra és 0</strong>.</p>
            <p style="margin-top:0.45rem;">Si totes dues entrades són iguals (0 i 0, o 1 i 1), la sortida cau a <strong>0</strong>.</p>
        `,
        truthTableHeaders: ["Entrada A", "Entrada B", "Sortida Y (A ⊕ B)"],
        truthTableRows: [
            [[0, 0], 0],
            [[0, 1], 1],
            [[1, 0], 1],
            [[1, 1], 0]
        ],
        challenges: [
            {
                mode: "DEDUCE_OUT",
                prompt: "Fase 1/3: Què passa si les dues entrades reben senyal actiu alhora (A = 1 i B = 1)?",
                inputs: { A: 1, B: 1 },
                expectedOut: 0,
                explanation: "La porta XOR dona Y = 0 quan les dues entrades són iguals."
            },
            {
                mode: "DEDUCE_OUT",
                prompt: "Fase 2/3: Si l'entrada A = 1 i l'entrada B = 0, quina serà la sortida Y?",
                inputs: { A: 1, B: 0 },
                expectedOut: 1,
                explanation: "Com que A i B són diferents (1 i 0), la porta XOR genera Y = 1."
            },
            {
                mode: "CONFIGURE_IN",
                prompt: "Fase 3/3: Configura els terminals A i B per obrir la comporta del polvorí (Y = 1)!",
                initialInputs: { A: 1, B: 1 },
                targetOut: 1,
                explanation: "Per obtenir Y = 1 cal que les entrades siguin diferents (A=1, B=0 o bé A=0, B=1)."
            }
        ],
        finalChallenge: {
            title: "Comparador Criptogràfic i Detector Diferencial del Polvorí",
            realWorldContext: "🔑 Aplicació d'Enginyeria MGS: El polvorí d'armament pesant utilitza una porta XOR com a detector de desfasament diferencial. La comporta només autoritza l'obertura (Y = 1) si hi ha una discrepància de paritat entre el codificador d'Snake (A) i el receptor de la base (B) (A ≠ B).",
            prompt: "Repte Final d'Enginyeria: Ajusta les claus d'accés (A, B) perquè la porta XOR detecti una combinació asimètrica que generi Y = 1!",
            mode: "CONFIGURE_IN",
            initialInputs: { A: 1, B: 1 },
            targetOut: 1,
            explanation: "Brillant! La porta XOR (Y = A ⊕ B) és un detector de discrepància: només dona Y = 1 quan les entrades són diferents (1,0 o 0,1)."
        },
        map: [
            "#####G###########",
            "#d.K#...#1.c#R.e#",
            "#...D...#...#...#",
            "#a..#.r.#●.qD..b#",
            "###D#...#####.###",
            "#...#...#d.d#...#",
            "#.7.#...D...#.▲.#",
            "#...#####...#...#",
            "#k.:D.......D.K.#",
            "#####...#####...#",
            "#R..#...#Z.U#...#",
            "#...D...#...###D#",
            "#4.c#...#..C#...#",
            "#####...#####.9.#",
            "#j..D.......D.c.#",
            "#S.p#.▲...▲.#~¶.#",
            "#################"
        ],
        enemies: [
                    {
                                "type": "PATROL",
                                "waypoints": [
                                            [
                                                        5,
                                                        2
                                            ],
                                            [
                                                        7,
                                                        2
                                            ],
                                            [
                                                        7,
                                                        14
                                            ],
                                            [
                                                        5,
                                                        14
                                            ]
                                ],
                                "speed": 2.2,
                                "fov": 65,
                                "viewDist": 7.5
                    },
                    {
                                "type": "PATROL",
                                "waypoints": [
                                            [
                                                        5,
                                                        8
                                            ],
                                            [
                                                        13,
                                                        8
                                            ],
                                            [
                                                        13,
                                                        5
                                            ],
                                            [
                                                        13,
                                                        10
                                            ]
                                ],
                                "speed": 2.1,
                                "fov": 65,
                                "viewDist": 7.2
                    }
        ],
        cameras: [
                    {
                                "x": 6,
                                "z": 1,
                                "type": "SWEEP",
                                "fixed": false,
                                "baseAngle": 0.0,
                                "sweepAngle": 1.2,
                                "sweepSpeed": 0.5,
                                "fov": 50,
                                "viewDist": 11.0,
                                "minDist": 0.6
                    },
                    {
                                "x": 7,
                                "z": 8,
                                "type": "ROTARY_360",
                                "fixed": false,
                                "baseAngle": 0,
                                "sweepAngle": 6.28,
                                "sweepSpeed": 0.8,
                                "fov": 60,
                                "viewDist": 8.5,
                                "minDist": 0.6
                    },
                    {
                                "x": 15,
                                "z": 5,
                                "type": "SWEEP",
                                "fixed": false,
                                "baseAngle": -0.5,
                                "sweepAngle": 1.4,
                                "sweepSpeed": 0.55,
                                "fov": 55,
                                "viewDist": 9.0,
                                "minDist": 0.6
                    }
        ],
        rotations: {
            "1,1": 0,
            "3,1": 0,
            "9,1": 0,
            "11,1": 0,
            "13,1": 0,
            "15,1": 0,
            "4,2": 90,
            "1,3": 180,
            "9,3": 180,
            "11,3": 180,
            "12,3": 90,
            "15,3": 180,
            "3,4": 0,
            "9,5": 0,
            "11,5": 0,
            "2,6": 0,
            "8,6": 90,
            "14,6": 0,
            "1,8": 180,
            "3,8": 180,
            "4,8": 90,
            "12,8": 90,
            "14,8": 0,
            "1,10": 0,
            "9,10": 0,
            "11,10": 0,
            "4,11": 90,
            "15,11": 0,
            "1,12": 180,
            "3,12": 180,
            "11,12": 180,
            "14,13": 0,
            "1,14": 90,
            "4,14": 90,
            "12,14": 90,
            "14,14": 180,
            "3,15": 180,
            "6,15": 180,
            "10,15": 180,
            "13,15": 180,
            "14,15": 180
        }
    },

    // ------------------------------------------------------------------------
    // SECTOR 05: SALA DE SERVIDORS I MAINFRAME (NAND)
    // ------------------------------------------------------------------------
    {
        id: 5,
        title: "Sector 05: Sala de Servidors i Mainframe AI",
        gateBadge: "Porta NAND",
        circuitType: "SINGLE_NAND",
        gateIds: ["NAND"],
        inputs: ["A", "B"],
        evalCircuit: ({ A, B }) => (!(A && B) ? 1 : 0),
        zoneName: "Mainframe Central de Seguretat",
        codecBriefing: [
            { speaker: "Otacon", freq: "141.12", text: "Snake! Hem arribat als servidors de la xarxa neural. Aquest mainframe està construït íntegrament amb portes NAND!" },
            { speaker: "Campbell", freq: "140.85", text: "La porta NAND només es bloqueja quan les dues entrades són 1. En tots els altres casos manté el corrent a 1." }
        ],
        shortDesc: "Evita les càmeres d'alta definició i els sentinelles del mainframe. Recull els 2 discs PAL xifrats i hackeja la porta NAND.",
        theoryTitle: "Porta Lògica NAND (Universal)",
        theoryFormula: "Y = ¬(A · B)   (Només Y=0 quan A=1 i B=1)",
        theoryHtml: `
            <p>La <strong>Porta NAND</strong> és la negació de l'AND: només genera <strong>0 quan totes dues entrades són 1 alhora</strong>.</p>
        `,
        truthTableHeaders: ["Entrada A", "Entrada B", "Sortida Y ¬(A·B)"],
        truthTableRows: [
            [[0, 0], 1],
            [[0, 1], 1],
            [[1, 0], 1],
            [[1, 1], 0]
        ],
        challenges: [
            {
                mode: "DEDUCE_OUT",
                prompt: "Fase 1/3: Si cap línia està activa (A = 0 i B = 0), què emet la porta NAND?",
                inputs: { A: 0, B: 0 },
                expectedOut: 1,
                explanation: "0 AND 0 és 0, que invertit per la NAND dóna Y = 1."
            },
            {
                mode: "DEDUCE_OUT",
                prompt: "Fase 2/3: Si activem A = 1 i B = 1 alhora, quina serà la sortida Y?",
                inputs: { A: 1, B: 1 },
                expectedOut: 0,
                explanation: "1 AND 1 és 1; en invertir-se produeix Y = 0."
            },
            {
                mode: "CONFIGURE_IN",
                prompt: "Fase 3/3: Configura A i B per activar el bloqueig de seguretat (Y = 0)!",
                initialInputs: { A: 0, B: 1 },
                targetOut: 0,
                explanation: "L'única combinació on la NAND dóna 0 és A = 1 i B = 1."
            }
        ],
        finalChallenge: {
            title: "Circuit Fail-Safe de Segellat del Mainframe d'Intel·ligència Artificial",
            realWorldContext: "💾 Aplicació d'Enginyeria MGS: El supercomputador militar de la base utilitza una porta universal NAND per mantenir la porta oberta (Y = 1) durant totes les operacions normals. Únicament en la situació crítica de sabotatge coordinat (atac tèrmic A = 1 I atac de virus B = 1 alhora) la sortida cau a 0 per aïllar el recinte.",
            prompt: "Repte Final d'Enginyeria: Configura les entrades (A, B) per restablir el canal de dades del servidor amb Y = 1 i escapar de la sala de servidors!",
            mode: "CONFIGURE_IN",
            initialInputs: { A: 1, B: 1 },
            targetOut: 1,
            explanation: "Exacte! La porta NAND (Y = ¬(A · B)) només emet 0 quan totes dues entrades són 1. En configurar qualsevol entrada a 0, la sortida commuta a Y = 1 i la comporta s'obre!"
        },
        map: [
            "##########G######",
            "#s.n#R..#.r.#v.0#",
            "#...#.o.#...#...#",
            "#s.xD...D.r.D..y#",
            "#####.###...#####",
            "#6.-#...#...#s.s#",
            "#...D...#.n.#...#",
            "#µ.p#...#...D..K#",
            "#####...#####.###",
            "#K..#.......#R.c#",
            "#..Z#.......#..4#",
            "#.U.D.......D..b#",
            "#####.#####.#####",
            "#}..#.#~..¶.#.0.#",
            "#...D.#.....D...#",
            "#S.*#.#p..C.#.v.#",
            "#################"
        ],
        enemies: [
                    {
                                "type": "PATROL",
                                "waypoints": [
                                            [
                                                        6,
                                                        5
                                            ],
                                            [
                                                        6,
                                                        11
                                            ],
                                            [
                                                        10,
                                                        11
                                            ],
                                            [
                                                        10,
                                                        9
                                            ]
                                ],
                                "speed": 2.2,
                                "fov": 65,
                                "viewDist": 7.5
                    },
                    {
                                "type": "PATROL",
                                "waypoints": [
                                            [
                                                        9,
                                                        2
                                            ],
                                            [
                                                        11,
                                                        2
                                            ],
                                            [
                                                        11,
                                                        4
                                            ],
                                            [
                                                        9,
                                                        4
                                            ],
                                            [
                                                        9,
                                                        7
                                            ],
                                            [
                                                        6,
                                                        7
                                            ]
                                ],
                                "speed": 2.1,
                                "fov": 65,
                                "viewDist": 7.5
                    }
        ],
        cameras: [
                    {
                                "x": 9,
                                "z": 5,
                                "type": "SWEEP",
                                "fixed": false,
                                "baseAngle": 0.0,
                                "sweepAngle": 1.5,
                                "sweepSpeed": 0.5,
                                "fov": 55,
                                "viewDist": 10.0,
                                "minDist": 0.6
                    },
                    {
                                "x": 8,
                                "z": 10,
                                "type": "ROTARY_360",
                                "fixed": false,
                                "baseAngle": 0,
                                "sweepAngle": 6.28,
                                "sweepSpeed": 0.9,
                                "fov": 60,
                                "viewDist": 8.5,
                                "minDist": 0.6
                    },
                    {
                                "x": 9,
                                "z": 1,
                                "type": "SWEEP",
                                "fixed": false,
                                "baseAngle": 0.3,
                                "sweepAngle": 1.57,
                                "sweepSpeed": 0.55,
                                "fov": 55,
                                "viewDist": 9.0,
                                "minDist": 0.6
                    }
        ],
        rotations: {
            "1,1": 0,
            "3,1": 0,
            "5,1": 0,
            "13,1": 0,
            "15,1": 0,
            "6,2": 0,
            "1,3": 180,
            "3,3": 180,
            "4,3": 90,
            "8,3": 90,
            "12,3": 90,
            "15,3": 180,
            "1,5": 0,
            "3,5": 0,
            "13,5": 0,
            "15,5": 0,
            "4,6": 90,
            "10,6": 0,
            "1,7": 180,
            "3,7": 180,
            "12,7": 90,
            "15,7": 180,
            "1,9": 0,
            "13,9": 90,
            "15,9": 0,
            "3,10": 270,
            "15,10": 270,
            "2,11": 180,
            "4,11": 90,
            "12,11": 90,
            "15,11": 270,
            "1,13": 0,
            "7,13": 0,
            "10,13": 0,
            "14,13": 0,
            "4,14": 90,
            "12,14": 90,
            "3,15": 180,
            "7,15": 180,
            "10,15": 180,
            "14,15": 180
        }
    },

    // ------------------------------------------------------------------------
    // SECTOR 06: LABORATORI DE ROBÒTICA I CIBERNETICA (NOR)
    // ------------------------------------------------------------------------
    {
        id: 6,
        title: "Sector 06: Laboratori de Robòtica i Ciberimplements",
        gateBadge: "Porta NOR",
        circuitType: "SINGLE_NOR",
        gateIds: ["NOR"],
        inputs: ["A", "B"],
        evalCircuit: ({ A, B }) => (!(A || B) ? 1 : 0),
        zoneName: "Laboratori d'Intel·ligència Artificial",
        codecBriefing: [
            { speaker: "Otacon", freq: "141.12", text: "Snake, aquesta és la unitat de recerca cibernètica. La comporta utilitza una porta NOR com a protocol d'aturada d'emergència." },
            { speaker: "Snake", freq: "140.85", text: "Si qualsevol sensor detecta presència, la sortida cau a zero." },
            { speaker: "Campbell", freq: "140.85", text: "Exacte. Només obriràs la porta si aconsegueixes que cap senyal d'alarma estigui disparat (A = 0 i B = 0)." }
        ],
        shortDesc: "Infiltra't pel laboratori d'alta tecnologia. Recull els 2 discs PAL xifrats i resol la porta NOR de la comporta.",
        theoryTitle: "Porta Lògica NOR (Quarantena Zero)",
        theoryFormula: "Y = ¬(A + B)   (Només Y=1 quan A=0 i B=0)",
        theoryHtml: `
            <p>La <strong>Porta NOR</strong> és la negació de l'OR: només emet <strong>1 quan cap entrada està activa (A = 0 i B = 0)</strong>.</p>
        `,
        truthTableHeaders: ["Entrada A", "Entrada B", "Sortida Y ¬(A+B)"],
        truthTableRows: [
            [[0, 0], 1],
            [[0, 1], 0],
            [[1, 0], 0],
            [[1, 1], 0]
        ],
        challenges: [
            {
                mode: "DEDUCE_OUT",
                prompt: "Fase 1/3: Si el sensor A detecta un intrús (A = 1) i B = 0, quina és la sortida Y de la NOR?",
                inputs: { A: 1, B: 0 },
                expectedOut: 0,
                explanation: "1 OR 0 és 1; en negar-se per la NOR la sortida cau a Y = 0."
            },
            {
                mode: "DEDUCE_OUT",
                prompt: "Fase 2/3: Si l'àrea està neta de senyals (A = 0 i B = 0), què emet la porta NOR?",
                inputs: { A: 0, B: 0 },
                expectedOut: 1,
                explanation: "Quan totes dues entrades són 0, la porta NOR genera Y = 1."
            },
            {
                mode: "CONFIGURE_IN",
                prompt: "Fase 3/3: Configura A i B per autoritzar l'accés pel circuit NOR (Y = 1)!",
                initialInputs: { A: 1, B: 1 },
                targetOut: 1,
                explanation: "Una porta NOR només dóna Y = 1 quan A = 0 i B = 0."
            }
        ],
        finalChallenge: {
            title: "Comporta de Contenció de Quarantena Zero del Laboratori",
            realWorldContext: "🔒 Aplicació d'Enginyeria MGS: El laboratori de ciberimplements compta amb una comporta de contenció biològica governada per una porta NOR. El protocol militar exigeix que tant la radiació gamma A com la presència de toxines B siguin exactament 0 per desactivar el bloqueig de quarantena (Y = 1).",
            prompt: "Repte Final d'Enginyeria: Modifica els nivells dels sensors (A, B) perquè la porta NOR certifiqui que l'ambient està net i activi la sortida Y = 1!",
            mode: "CONFIGURE_IN",
            initialInputs: { A: 0, B: 1 },
            targetOut: 1,
            explanation: "Impecable! La porta NOR (Y = ¬(A + B)) és un protocol de tolerància zero: només emet Y = 1 quan cap amenaça està present (A = 0 i B = 0)."
        },
        map: [
            "#######G#########",
            "#?.?#..r..#5.{#K#",
            "#...D..r..D...#Z#",
            "#u.g#.....#[.]D.#",
            "#####.###.#####.#",
            "#2.!#.#R#.#=..\\.#",
            "#...D.#.#.#.....#",
            "#°..#.#.#.#..g.U#",
            "###D#.#D#.#D#####",
            "#...#.....#...#R#",
            "#.4.#.....#.7.#.#",
            "#.c.D.....D.k.D.#",
            "#####.###.#####.#",
            "#f..#.#K#.#...#.#",
            "#...D.#D#.#.C.#.#",
            "#S.j#.....#...#p#",
            "#################"
        ],
        enemies: [
                    {
                                "type": "PATROL",
                                "waypoints": [
                                            [
                                                        5,
                                                        9
                                            ],
                                            [
                                                        9,
                                                        9
                                            ],
                                            [
                                                        9,
                                                        11
                                            ],
                                            [
                                                        5,
                                                        11
                                            ]
                                ],
                                "speed": 2.1,
                                "fov": 65,
                                "viewDist": 7.5
                    },
                    {
                                "type": "PATROL",
                                "waypoints": [
                                            [
                                                        5,
                                                        3
                                            ],
                                            [
                                                        9,
                                                        3
                                            ],
                                            [
                                                        9,
                                                        1
                                            ],
                                            [
                                                        5,
                                                        1
                                            ]
                                ],
                                "speed": 2.2,
                                "fov": 65,
                                "viewDist": 7.5
                    },
                    {
                                "type": "PATROL",
                                "waypoints": [
                                            [
                                                        5,
                                                        15
                                            ],
                                            [
                                                        9,
                                                        15
                                            ],
                                            [
                                                        9,
                                                        11
                                            ],
                                            [
                                                        5,
                                                        11
                                            ]
                                ],
                                "speed": 2.1,
                                "fov": 65,
                                "viewDist": 7.2
                    }
        ],
        cameras: [
                    {
                                "x": 6,
                                "z": 1,
                                "type": "SWEEP",
                                "fixed": false,
                                "baseAngle": 0.5,
                                "sweepAngle": 1.57,
                                "sweepSpeed": 0.5,
                                "fov": 55,
                                "viewDist": 9.5,
                                "minDist": 0.6
                    },
                    {
                                "x": 7,
                                "z": 10,
                                "type": "ROTARY_360",
                                "fixed": false,
                                "baseAngle": 0,
                                "sweepAngle": 6.28,
                                "sweepSpeed": 0.85,
                                "fov": 60,
                                "viewDist": 8.5,
                                "minDist": 0.6
                    },
                    {
                                "x": 15,
                                "z": 5,
                                "type": "SWEEP",
                                "fixed": false,
                                "baseAngle": -0.785,
                                "sweepAngle": 1.57,
                                "sweepSpeed": 0.55,
                                "fov": 55,
                                "viewDist": 8.5,
                                "minDist": 0.6
                    }
        ],
        rotations: {
            "11,1": 0,
            "15,1": 0,
            "4,2": 90,
            "10,2": 90,
            "15,2": 90,
            "1,3": 180,
            "3,3": 180,
            "11,3": 180,
            "13,3": 180,
            "14,3": 90,
            "1,5": 0,
            "3,5": 0,
            "7,5": 0,
            "11,5": 0,
            "14,5": 0,
            "4,6": 90,
            "1,7": 180,
            "13,7": 180,
            "15,7": 180,
            "3,8": 0,
            "7,8": 0,
            "11,8": 0,
            "15,9": 0,
            "2,10": 0,
            "12,10": 0,
            "2,11": 180,
            "4,11": 90,
            "10,11": 90,
            "12,11": 180,
            "14,11": 90,
            "1,13": 0,
            "7,13": 0,
            "4,14": 90,
            "7,14": 0,
            "12,14": 0,
            "3,15": 180,
            "15,15": 180
        }
    },

    // ------------------------------------------------------------------------
    // SECTOR 07: TORRE DE COMUNICACIONS I RADAR (AND + OR)
    // ------------------------------------------------------------------------
    {
        id: 7,
        title: "Sector 07: Torre de Comunicacions i Radar",
        gateBadge: "AND + OR",
        circuitType: "COMB_AND_OR",
        gateIds: ["AND", "OR"],
        inputs: ["A", "B", "C"],
        evalCircuit: ({ A, B, C }) => ((A && B) || C ? 1 : 0),
        zoneName: "Torre de Transmissió per Satèl·lit",
        codecBriefing: [
            { speaker: "Otacon", freq: "141.12", text: "Snake, a partir d'aquí els panys són circuits combinacionals de diverses portes en cascada!" },
            { speaker: "Campbell", freq: "140.85", text: "Primer el cable intermedi M multiplica A i B amb una porta AND, i després suma el resultat amb C mitjançant una porta OR: (A · B) + C." }
        ],
        shortDesc: "Supera la xarxa de vigilància de la Torre de Comunicacions. Recull els 2 discs PAL xifrats i resol el circuit combinacional (A · B) + C.",
        theoryTitle: "Circuit Combinacional: (A · B) + C",
        theoryFormula: "M = A · B   →   Y = M + C",
        theoryHtml: `
            <p><strong>1r Pas:</strong> Calcula el senyal intermedi <code>M = A · B</code> (porta AND).</p>
            <p><strong>2n Pas:</strong> La porta OR final rep <code>M</code> i <code>C</code> per generar <code>Y = M + C</code>.</p>
        `,
        truthTableHeaders: ["A", "B", "C", "M (A·B)", "Sortida Y (M+C)"],
        truthTableRows: [
            [[0, 0, 0], "0", 0],
            [[0, 1, 0], "0", 0],
            [[1, 0, 0], "0", 0],
            [[1, 1, 0], "1", 1],
            [[0, 0, 1], "0", 1],
            [[1, 0, 1], "0", 1],
            [[1, 1, 1], "1", 1]
        ],
        challenges: [
            {
                mode: "DEDUCE_OUT",
                prompt: "Fase 1/3: Amb A = 1, B = 0 i C = 0, quina serà la sortida final Y?",
                inputs: { A: 1, B: 0, C: 0 },
                expectedOut: 0,
                explanation: "A AND B dóna M = 0. Després, 0 OR 0 dóna Y = 0."
            },
            {
                mode: "DEDUCE_OUT",
                prompt: "Fase 2/3: Si A = 1, B = 0 i la línia auxiliar C = 1, què sortirà per Y?",
                inputs: { A: 1, B: 0, C: 1 },
                expectedOut: 1,
                explanation: "Tot i que M = 0, com que C = 1 entra a la porta OR final, el resultat és Y = 1."
            },
            {
                mode: "CONFIGURE_IN",
                prompt: "Fase 3/3: Configura les entrades (A, B, C) per activar el senyal d'antena (Y = 1)!",
                initialInputs: { A: 0, B: 1, C: 0 },
                targetOut: 1,
                explanation: "Pots activar Y = 1 fent A=1 i B=1, o bé activant directament C=1."
            }
        ],
        finalChallenge: {
            title: "Matriu de Telecomunicacions per Satèl·lit de la Torre de Control",
            realWorldContext: "📡 Aplicació d'Enginyeria MGS: El radar principal emet mitjançant el circuit combinat Y = (A · B) + C. Per transmetre les coordenades de vol i obrir la comporta superior (Y = 1), cal sincronitzar la portadora A i el xifratge B (A · B = 1), O BÉ activar la línia física d'emergència C = 1.",
            prompt: "Repte Final d'Enginyeria: Configura el vector d'entrades (A, B, C) perquè el circuit combinat AND + OR emeti el senyal d'autorització Y = 1!",
            mode: "CONFIGURE_IN",
            initialInputs: { A: 1, B: 0, C: 0 },
            targetOut: 1,
            explanation: "Molt ben calculat! Com que l'etapa final és una porta OR, activar C = 1 o aconseguir que A=1 i B=1 simultàniament fa que la sortida total sigui Y = 1."
        },
        map: [
            "#########G#######",
            "#z.x#...r...#y.0#",
            "#...D...r...D...#",
            "#R.n#.......#v.:#",
            "#####.#####.#####",
            "#...#.#o.●#.#K.Z#",
            "#.6.#.#...#.#...#",
            "#.-.D.D...D.D.U.#",
            "#####.......#####",
            "#...D.......D...#",
            "#.4.#.#####.#.z.#",
            "#.c.#.#K.e#.#.x.#",
            "###D#.#...#.#D###",
            "#'.j#.#R.D#.#~..#",
            "#...D.#...#.D.¶.#",
            "#S.p#.......#..C#",
            "#################"
        ],
        enemies: [
                    {
                                "type": "PATROL",
                                "waypoints": [
                                            [
                                                        5,
                                                        3
                                            ],
                                            [
                                                        11,
                                                        3
                                            ],
                                            [
                                                        11,
                                                        9
                                            ],
                                            [
                                                        5,
                                                        9
                                            ]
                                ],
                                "speed": 2.2,
                                "fov": 65,
                                "viewDist": 7.5
                    },
                    {
                                "type": "PATROL",
                                "waypoints": [
                                            [
                                                        5,
                                                        9
                                            ],
                                            [
                                                        11,
                                                        9
                                            ],
                                            [
                                                        11,
                                                        15
                                            ],
                                            [
                                                        5,
                                                        15
                                            ]
                                ],
                                "speed": 2.2,
                                "fov": 65,
                                "viewDist": 7.5
                    }
        ],
        cameras: [
                    {
                                "x": 5,
                                "z": 1,
                                "type": "SWEEP",
                                "fixed": false,
                                "baseAngle": 0.785,
                                "sweepAngle": 1.57,
                                "sweepSpeed": 0.5,
                                "fov": 55,
                                "viewDist": 10.0,
                                "minDist": 0.6
                    },
                    {
                                "x": 8,
                                "z": 8,
                                "type": "ROTARY_360",
                                "fixed": false,
                                "baseAngle": 0,
                                "sweepAngle": 6.28,
                                "sweepSpeed": 0.9,
                                "fov": 60,
                                "viewDist": 9.0,
                                "minDist": 0.6
                    },
                    {
                                "x": 11,
                                "z": 15,
                                "type": "SWEEP",
                                "fixed": false,
                                "baseAngle": 3.1416,
                                "sweepAngle": 1.3,
                                "sweepSpeed": 0.55,
                                "fov": 55,
                                "viewDist": 9.0,
                                "minDist": 0.6
                    }
        ],
        rotations: {
            "1,1": 0,
            "3,1": 0,
            "13,1": 0,
            "15,1": 0,
            "4,2": 90,
            "12,2": 90,
            "1,3": 180,
            "3,3": 180,
            "13,3": 180,
            "15,3": 180,
            "7,5": 0,
            "9,5": 0,
            "13,5": 0,
            "15,5": 0,
            "2,6": 0,
            "2,7": 180,
            "4,7": 90,
            "6,7": 0,
            "10,7": 0,
            "12,7": 90,
            "14,7": 180,
            "4,9": 90,
            "12,9": 90,
            "2,10": 0,
            "14,10": 0,
            "2,11": 180,
            "7,11": 0,
            "9,11": 0,
            "14,11": 180,
            "3,12": 0,
            "13,12": 0,
            "1,13": 0,
            "3,13": 270,
            "7,13": 90,
            "9,13": 0,
            "13,13": 90,
            "4,14": 90,
            "12,14": 90,
            "14,14": 0,
            "3,15": 180,
            "15,15": 180
        }
    },

    // ------------------------------------------------------------------------
    // SECTOR 08: FOSA INDUSTRIAL I REACTOR TÈRMIC (NOR + AND)
    // ------------------------------------------------------------------------
    {
        id: 8,
        title: "Sector 08: Fosa Industrial i Reactor Tèrmic",
        gateBadge: "NOR + AND",
        circuitType: "COMB_NOR_AND",
        gateIds: ["NOR", "AND"],
        inputs: ["A", "B", "C"],
        evalCircuit: ({ A, B, C }) => ((!(A || B)) && C ? 1 : 0),
        zoneName: "Reactor de Fosa d'Acer",
        codecBriefing: [
            { speaker: "Otacon", freq: "141.12", text: "Snake, estàs a la zona del reactor tèrmic! El terra té rius de metall fos roent!" },
            { speaker: "Campbell", freq: "140.85", text: "El circuit de refrigeració combina una porta NOR amb una porta AND: ¬(A + B) · C." }
        ],
        shortDesc: "Infiltra't per la fosa industrial i el reactor tèrmic. Recull els 2 discs PAL xifrats i hackeja el circuit ¬(A + B) · C.",
        theoryTitle: "Circuit Combinacional: ¬(A + B) · C",
        theoryFormula: "M = ¬(A + B)   →   Y = M · C",
        theoryHtml: `
            <p><strong>1r Pas:</strong> La porta NOR calcula <code>M = ¬(A + B)</code> (només val 1 si A=0 i B=0).</p>
            <p><strong>2n Pas:</strong> La porta AND final exigeix que <code>M = 1</code> <strong>i</strong> <code>C = 1</code> alhora per donar <strong>Y = 1</strong>.</p>
        `,
        truthTableHeaders: ["A", "B", "C", "M ¬(A+B)", "Sortida Y (M·C)"],
        truthTableRows: [
            [[0, 0, 0], "1", 0],
            [[0, 0, 1], "1", 1],
            [[0, 1, 1], "0", 0],
            [[1, 0, 1], "0", 0],
            [[1, 1, 1], "0", 0]
        ],
        challenges: [
            {
                mode: "DEDUCE_OUT",
                prompt: "Fase 1/3: Si A = 1, B = 0 i C = 1, quina és la sortida final Y?",
                inputs: { A: 1, B: 0, C: 1 },
                expectedOut: 0,
                explanation: "La porta NOR dóna M = 0 perquè A = 1. Després, 0 AND 1 dóna Y = 0."
            },
            {
                mode: "DEDUCE_OUT",
                prompt: "Fase 2/3: Si A = 0, B = 0 i C = 1, què generarà el circuit?",
                inputs: { A: 0, B: 0, C: 1 },
                expectedOut: 1,
                explanation: "La NOR dóna M = 1 (A=0, B=0), i amb C = 1, la porta AND final genera 1 · 1 = 1."
            },
            {
                mode: "CONFIGURE_IN",
                prompt: "Fase 3/3: Troba la combinació necessària per obrir la comporta del reactor (Y = 1)!",
                initialInputs: { A: 1, B: 1, C: 0 },
                targetOut: 1,
                explanation: "Cal que la NOR doni M = 1 (A=0, B=0) i que C = 1."
            }
        ],
        finalChallenge: {
            title: "Refrigeració Criogènica del Reactor Tèrmic",
            realWorldContext: "⚡ Aplicació d'Enginyeria MGS: La comporta de la fosa industrial està regulada per Y = ¬(A + B) · C. Perquè el refrigerant s'injecti i la sortida s'obri (Y = 1), cal que no hi hagi fuita de gas (A = 0), no hi hagi sobrepressió (B = 0), i la bomba d'impulsió C estigui engegada (C = 1).",
            prompt: "Repte Final d'Enginyeria: Calibra els sensors (A, B, C) per activar la refrigeració criogènica amb Y = 1 i obrir la comporta del reactor!",
            mode: "CONFIGURE_IN",
            initialInputs: { A: 1, B: 0, C: 1 },
            targetOut: 1,
            explanation: "Magnífic, Snake! La primera etapa NOR produeix un 1 només si A=0 i B=0, i la segona etapa AND el multiplica per C=1 per obtenir Y = 1!"
        },
        map: [
            "######G##########",
            "#y.v#...#R.4#K.m#",
            "#...D...D..cD...#",
            "#0.'#...#.p.#.._#",
            "###D###.#####.###",
            "#...#.......#...#",
            "#.7.D..y.y..D./.#",
            "#.k.#.......#.m.#",
            "#####.......#####",
            "#K.Z#..0.0..#R..#",
            "#...#.......#...#",
            "#.U.D.......D.t.#",
            "#####.#####.#####",
            "#;..#.#...#.#...#",
            "#...D.#.C.#.D.8.#",
            "#S.|#.#...#.#.$.#",
            "#################"
        ],
        enemies: [
                    {
                                "type": "PATROL",
                                "waypoints": [
                                            [
                                                        5,
                                                        5
                                            ],
                                            [
                                                        11,
                                                        5
                                            ],
                                            [
                                                        11,
                                                        11
                                            ],
                                            [
                                                        5,
                                                        11
                                            ]
                                ],
                                "speed": 2.2,
                                "fov": 65,
                                "viewDist": 7.5
                    },
                    {
                                "type": "PATROL",
                                "waypoints": [
                                            [
                                                        6,
                                                        1
                                            ],
                                            [
                                                        6,
                                                        8
                                            ],
                                            [
                                                        10,
                                                        8
                                            ],
                                            [
                                                        10,
                                                        5
                                            ]
                                ],
                                "speed": 2.1,
                                "fov": 65,
                                "viewDist": 7.5
                    }
        ],
        cameras: [
                    {
                                "x": 5,
                                "z": 1,
                                "type": "SWEEP",
                                "fixed": false,
                                "baseAngle": 0.0,
                                "sweepAngle": 1.4,
                                "sweepSpeed": 0.5,
                                "fov": 55,
                                "viewDist": 10.0,
                                "minDist": 0.6
                    },
                    {
                                "x": 8,
                                "z": 8,
                                "type": "ROTARY_360",
                                "fixed": false,
                                "baseAngle": 0,
                                "sweepAngle": 6.28,
                                "sweepSpeed": 0.95,
                                "fov": 65,
                                "viewDist": 9.5,
                                "minDist": 0.6
                    },
                    {
                                "x": 11,
                                "z": 11,
                                "type": "SWEEP",
                                "fixed": false,
                                "baseAngle": -2.356,
                                "sweepAngle": 1.57,
                                "sweepSpeed": 0.55,
                                "fov": 55,
                                "viewDist": 9.5,
                                "minDist": 0.6
                    }
        ],
        rotations: {
            "1,1": 0,
            "3,1": 0,
            "9,1": 0,
            "11,1": 270,
            "13,1": 0,
            "4,2": 90,
            "8,2": 90,
            "11,2": 180,
            "12,2": 90,
            "1,3": 180,
            "3,3": 270,
            "10,3": 180,
            "3,4": 0,
            "2,6": 0,
            "4,6": 90,
            "7,6": 0,
            "9,6": 0,
            "12,6": 90,
            "14,6": 0,
            "2,7": 180,
            "1,9": 0,
            "3,9": 0,
            "7,9": 0,
            "9,9": 0,
            "13,9": 0,
            "2,11": 180,
            "4,11": 90,
            "12,11": 90,
            "14,11": 180,
            "1,13": 0,
            "4,14": 90,
            "8,14": 0,
            "12,14": 90,
            "14,14": 0,
            "3,15": 180,
            "14,15": 180
        }
    },

    // ------------------------------------------------------------------------
    // SECTOR 09: CONDUCTES D'AIGUA I DRENATGE SUBTERRANI
    // ------------------------------------------------------------------------
    {
        id: 9,
        title: "Sector 09: Conductes d'Aigua i Clavegueram Militar",
        gateBadge: "XOR + NOT + AND",
        circuitType: "COMB_XOR_NOT_AND",
        gateIds: ["XOR", "NOT", "AND"],
        inputs: ["A", "B", "C"],
        evalCircuit: ({ A, B, C }) => ((A !== B) && (!C) ? 1 : 0),
        zoneName: "Aqüeducte i Drenatge de Seguretat",
        codecBriefing: [
            { speaker: "Otacon", freq: "141.12", text: "Snake, ets a l'aqüeducte just sota l'hangar de Metal Gear Rex! Aquest circuit de comporta combina 3 portes lògiques: XOR, NOT i AND." },
            { speaker: "Snake", freq: "140.85", text: "(A ⊕ B) · ¬C. La branca superior comprova disparitat i la inferior inverteix C." }
        ],
        shortDesc: "Navega pels conductes d'evacuació i clavegueram militar. Recull els 2 discs PAL xifrats i hackeja el circuit (A ⊕ B) · ¬C.",
        theoryTitle: "Circuit de 3 Portes: (A ⊕ B) · ¬C",
        theoryFormula: "M1 = A ⊕ B  |  M2 = ¬C  →  Y = M1 · M2",
        theoryHtml: `
            <p><strong>Branca XOR:</strong> <code>M1 = A ⊕ B</code> val 1 quan A i B són diferents.</p>
            <p><strong>Branca NOT:</strong> <code>M2 = ¬C</code> val 1 quan C val 0.</p>
            <p><strong>Porta final AND:</strong> <code>Y = M1 · M2</code> val 1 només quan <code>M1=1</code> i <code>M2=1</code>.</p>
        `,
        truthTableHeaders: ["A", "B", "C", "M1 (A⊕B)", "M2 (¬C)", "Sortida Y"],
        truthTableRows: [
            [[0, 0, 0], "0", "1", 0],
            [[0, 1, 0], "1", "1", 1],
            [[1, 0, 0], "1", "1", 1],
            [[1, 1, 0], "0", "1", 0],
            [[0, 1, 1], "1", "0", 0],
            [[1, 0, 1], "1", "0", 0]
        ],
        challenges: [
            {
                mode: "DEDUCE_OUT",
                prompt: "Fase 1/3: Si A = 1, B = 0 i C = 1, quin serà el resultat a la sortida Y?",
                inputs: { A: 1, B: 0, C: 1 },
                expectedOut: 0,
                explanation: "A XOR B dóna M1 = 1, però com que C = 1, NOT C dóna M2 = 0. Per tant, 1 · 0 = 0."
            },
            {
                mode: "DEDUCE_OUT",
                prompt: "Fase 2/3: Si A = 0, B = 1 i C = 0, quina serà la sortida Y?",
                inputs: { A: 0, B: 1, C: 0 },
                expectedOut: 1,
                explanation: "A XOR B dóna M1 = 1, i NOT C dóna M2 = 1. Com que 1 · 1 = 1, la sortida és Y = 1."
            },
            {
                mode: "CONFIGURE_IN",
                prompt: "Fase 3/3: Configura (A, B, C) per activar la comporta de desguàs (Y = 1)!",
                initialInputs: { A: 1, B: 1, C: 1 },
                targetOut: 1,
                explanation: "Cal que A i B siguin diferents (M1 = 1) i que C = 0 (M2 = 1)."
            }
        ],
        finalChallenge: {
            title: "Bomba de Drenatge Hidràulic del Clavegueram Militar",
            realWorldContext: "🌊 Aplicació d'Enginyeria MGS: El sistema de bombeig submarí funciona amb el circuit combinat de 3 etapes: Y = (A ⊕ B) · ¬C. La vàlvula de descàrrega s'obre (Y = 1) quan els dos sensors de pressió A i B estan desequilibrats (A ⊕ B = 1) I la comporta d'inundació exterior no té fuita (C = 0).",
            prompt: "Repte Final d'Enginyeria: Configura els sensors (A, B, C) perquè el circuit de tres etapes activi la bomba de drenatge Y = 1!",
            mode: "CONFIGURE_IN",
            initialInputs: { A: 1, B: 1, C: 0 },
            targetOut: 1,
            explanation: "Formidable! En configurar entrades diferents per a la XOR (A=1, B=0) i mantenir C=0 per a la NOT, les dues branques alimenten la porta AND amb 1 · 1, generant Y = 1!"
        },
        map: [
            "##########G######",
            "#_._#R.4#...#K.m#",
            "#...#..cD...D...#",
            "#m..D...#...#..=#",
            "#####.###...#####",
            "#2.!#...#...#y.v#",
            "#...D...#._.#...#",
            "#°..#...#...D..0#",
            "#####...###D#.###",
            "#K.Z#.......#d.a#",
            "#...#.......#...#",
            "#.U.D.......D.C.#",
            "#####.#####.#####",
            "#▲..#.#R..#.#~..#",
            "#...D.D...#.D.9.#",
            "#S.\"#.#..p#.#.+.#",
            "#################"
        ],
        enemies: [
                    {
                                "type": "PATROL",
                                "waypoints": [
                                            [
                                                        5,
                                                        4
                                            ],
                                            [
                                                        5,
                                                        11
                                            ],
                                            [
                                                        11,
                                                        11
                                            ],
                                            [
                                                        11,
                                                        9
                                            ]
                                ],
                                "speed": 2.2,
                                "fov": 65,
                                "viewDist": 7.5
                    },
                    {
                                "type": "PATROL",
                                "waypoints": [
                                            [
                                                        9,
                                                        2
                                            ],
                                            [
                                                        11,
                                                        2
                                            ],
                                            [
                                                        11,
                                                        9
                                            ],
                                            [
                                                        6,
                                                        9
                                            ]
                                ],
                                "speed": 2.2,
                                "fov": 65,
                                "viewDist": 7.5
                    }
        ],
        cameras: [
                    {
                                "x": 9,
                                "z": 1,
                                "type": "SWEEP",
                                "fixed": false,
                                "baseAngle": 0.0,
                                "sweepAngle": 1.4,
                                "sweepSpeed": 0.55,
                                "fov": 55,
                                "viewDist": 10.0,
                                "minDist": 0.6
                    },
                    {
                                "x": 8,
                                "z": 10,
                                "type": "ROTARY_360",
                                "fixed": false,
                                "baseAngle": 0,
                                "sweepAngle": 6.28,
                                "sweepSpeed": 0.9,
                                "fov": 60,
                                "viewDist": 9.0,
                                "minDist": 0.6
                    },
                    {
                                "x": 5,
                                "z": 5,
                                "type": "SWEEP",
                                "fixed": false,
                                "baseAngle": 0.5,
                                "sweepAngle": 1.57,
                                "sweepSpeed": 0.5,
                                "fov": 55,
                                "viewDist": 9.5,
                                "minDist": 0.6
                    }
        ],
        rotations: {
            "5,1": 0,
            "7,1": 270,
            "13,1": 0,
            "7,2": 180,
            "8,2": 90,
            "12,2": 90,
            "4,3": 90,
            "15,3": 180,
            "1,5": 0,
            "3,5": 0,
            "13,5": 0,
            "15,5": 0,
            "4,6": 90,
            "1,7": 180,
            "12,7": 90,
            "15,7": 180,
            "11,8": 0,
            "1,9": 0,
            "3,9": 0,
            "13,9": 90,
            "15,9": 0,
            "2,11": 180,
            "4,11": 90,
            "12,11": 90,
            "14,11": 180,
            "1,13": 0,
            "7,13": 0,
            "13,13": 0,
            "4,14": 90,
            "6,14": 90,
            "12,14": 90,
            "14,14": 0,
            "3,15": 180,
            "9,15": 180,
            "14,15": 180
        }
    },

    // ------------------------------------------------------------------------
    // SECTOR 10: HANGAR CENTRAL DE METAL GEAR REX (GRAN CIRCUIT MESTRE)
    // ------------------------------------------------------------------------
    {
        id: 10,
        title: "Sector 10: Hangar Central de Metal Gear",
        gateBadge: "AND + OR → XOR",
        circuitType: "COMB_MASTER_4",
        gateIds: ["AND", "OR", "XOR"],
        inputs: ["A", "B", "C", "D"],
        evalCircuit: ({ A, B, C, D }) => (((A && B) ? 1 : 0) !== ((C || D) ? 1 : 0) ? 1 : 0),
        zoneName: "Hangar del Tanc Bípede Metal Gear",
        codecBriefing: [
            { speaker: "Otacon", freq: "141.12", text: "Snake! Aquest és l'hangar principal! El tanc bípede Metal Gear és just al centre!" },
            { speaker: "Campbell", freq: "140.85", text: "Per desactivar el llançament del míssil nuclear has de hackejar el Gran Circuit Mestre de 4 entrades: (A · B) ⊕ (C + D)." },
            { speaker: "Snake", freq: "140.85", text: "Aquesta és l'última missió. Ho faré, Coronel!" }
        ],
        shortDesc: "Missió Final! Infiltra't a l'Hangar de Metal Gear evitant la patrulla d'elit. Recull els 3 discs PAL xifrats i hackeja el Gran Circuit Mestre per salvar el món!",
        theoryTitle: "Gran Circuit Mestre: (A · B) ⊕ (C + D)",
        theoryFormula: "M1 = A · B  |  M2 = C + D  →  Y = M1 ⊕ M2",
        theoryHtml: `
            <p><strong>Porta superior AND:</strong> <code>M1 = A · B</code> (val 1 només si A=1 i B=1).</p>
            <p><strong>Porta inferior OR:</strong> <code>M2 = C + D</code> (val 1 si C=1 o D=1).</p>
            <p><strong>Porta final XOR:</strong> <code>Y = M1 ⊕ M2</code> (val 1 quan <code>M1</code> i <code>M2</code> són <strong>diferents</strong>!).</p>
        `,
        truthTableHeaders: ["A, B", "C, D", "M1 (A·B)", "M2 (C+D)", "Sortida Y (M1⊕M2)"],
        truthTableRows: [
            [["0, 1"], "0, 0", "0", "0", 0],
            [["1, 1"], "0, 0", "1", "0", 1],
            [["0, 0"], "1, 0", "0", "1", 1],
            [["1, 0"], "0, 1", "0", "1", 1],
            [["1, 1"], "1, 0", "1", "1", 0],
            [["1, 1"], "1, 1", "1", "1", 0]
        ],
        challenges: [
            {
                mode: "DEDUCE_OUT",
                prompt: "Fase 1/3: Si A = 1, B = 1, C = 1 i D = 0, quina serà la sortida final Y?",
                inputs: { A: 1, B: 1, C: 1, D: 0 },
                expectedOut: 0,
                explanation: "A AND B dóna M1 = 1. C OR D dóna M2 = 1. Com que 1 ⊕ 1 = 0 (són iguals), la sortida és Y = 0."
            },
            {
                mode: "DEDUCE_OUT",
                prompt: "Fase 2/3: Si A = 1, B = 1, C = 0 i D = 0, quin valor s'obté a Y?",
                inputs: { A: 1, B: 1, C: 0, D: 0 },
                expectedOut: 1,
                explanation: "A AND B dóna M1 = 1, mentre que C OR D dóna M2 = 0. Com que 1 ⊕ 0 són diferents, la sortida és Y = 1!"
            },
            {
                mode: "CONFIGURE_IN",
                prompt: "Fase 3/3: Configura les 4 claus (A, B, C, D) per aturar Metal Gear i obrir la comporta final (Y = 1)!",
                initialInputs: { A: 1, B: 1, C: 1, D: 1 },
                targetOut: 1,
                explanation: "Perquè la porta XOR final doni 1 cal que M1 i M2 siguin diferents (ex: A=1, B=1, C=0, D=0 o bé A=0, B=0, C=1, D=0)."
            }
        ],
        finalChallenge: {
            title: "Protocol de Bloqueig de Seguretat de Metal Gear Rex",
            realWorldContext: "🦾 Aplicació d'Enginyeria MGS: L'hangar central de Metal Gear utilitza el circuit quàdruple de màxima seguretat: Y = (A · B) ⊕ (C + D). Snake ha de sincronitzar el vector binari d'entrades per generar una discrepància exacta entre el bloc d'ignició (A · B) i el bloc de suport auxiliar (C + D) perquè la porta XOR final emeti Y = 1.",
            prompt: "Repte Final d'Enginyeria: Sincronitza el vector de control (A, B, C, D) perquè la porta XOR final s'activi a 1 i desbloquegi la comporta de Metal Gear!",
            mode: "CONFIGURE_IN",
            initialInputs: { A: 1, B: 1, C: 1, D: 0 },
            targetOut: 1,
            explanation: "Missió complerta, Snake! Has desactivat l'últim segell quàdruple de Metal Gear resolent el circuit combinat complet. La comporta principal s'ha obert!"
        },
        map: [
            "########G########",
            "#n.s#..r.r..#R.e#",
            "#...D..r.r..D...#",
            "#x.v#.......#4.c#",
            "#####.#####.#####",
            "#K.Z#.#o.●#.#Z.K#",
            "#...#.#...#.#...#",
            "#.U.D.D...D.D.U.#",
            "#####.......#####",
            "#7.kD.......D.d.#",
            "#...#.#####.#...#",
            "#.:.#.#R.1#.#.a.#",
            "###D#.#..c#.#D###",
            "#$..#.#..K#.#..$#",
            "#.8.D.D...D.D.l.#",
            "#S.p#.......#.C.#",
            "#################"
        ],
        enemies: [
                    {
                                "type": "PATROL",
                                "waypoints": [
                                            [
                                                        5,
                                                        3
                                            ],
                                            [
                                                        11,
                                                        3
                                            ],
                                            [
                                                        11,
                                                        8
                                            ],
                                            [
                                                        5,
                                                        8
                                            ]
                                ],
                                "speed": 2.3,
                                "fov": 65,
                                "viewDist": 7.8
                    },
                    {
                                "type": "PATROL",
                                "waypoints": [
                                            [
                                                        5,
                                                        9
                                            ],
                                            [
                                                        11,
                                                        9
                                            ],
                                            [
                                                        11,
                                                        15
                                            ],
                                            [
                                                        5,
                                                        15
                                            ]
                                ],
                                "speed": 2.2,
                                "fov": 65,
                                "viewDist": 7.5
                    },
                    {
                                "type": "PATROL",
                                "waypoints": [
                                            [
                                                        7,
                                                        1
                                            ],
                                            [
                                                        9,
                                                        1
                                            ],
                                            [
                                                        9,
                                                        3
                                            ],
                                            [
                                                        7,
                                                        3
                                            ]
                                ],
                                "speed": 2.2,
                                "fov": 65,
                                "viewDist": 7.5
                    }
        ],
        cameras: [
                    {
                                "x": 5,
                                "z": 1,
                                "type": "SWEEP",
                                "fixed": false,
                                "baseAngle": 0.785,
                                "sweepAngle": 1.57,
                                "sweepSpeed": 0.55,
                                "fov": 55,
                                "viewDist": 10.5,
                                "minDist": 0.6
                    },
                    {
                                "x": 11,
                                "z": 1,
                                "type": "SWEEP",
                                "fixed": false,
                                "baseAngle": -0.785,
                                "sweepAngle": 1.57,
                                "sweepSpeed": 0.55,
                                "fov": 55,
                                "viewDist": 10.5,
                                "minDist": 0.6
                    },
                    {
                                "x": 8,
                                "z": 8,
                                "type": "ROTARY_360",
                                "fixed": false,
                                "baseAngle": 0,
                                "sweepAngle": 6.28,
                                "sweepSpeed": 1.0,
                                "fov": 65,
                                "viewDist": 9.5,
                                "minDist": 0.6
                    },
                    {
                                "x": 11,
                                "z": 15,
                                "type": "SWEEP",
                                "fixed": false,
                                "baseAngle": -1.57,
                                "sweepAngle": 1.4,
                                "sweepSpeed": 0.55,
                                "fov": 55,
                                "viewDist": 9.5,
                                "minDist": 0.6
                    }
        ],
        rotations: {
            "1,1": 0,
            "3,1": 0,
            "13,1": 0,
            "15,1": 0,
            "4,2": 90,
            "12,2": 90,
            "1,3": 180,
            "3,3": 180,
            "13,3": 180,
            "15,3": 180,
            "1,5": 0,
            "3,5": 0,
            "7,5": 0,
            "9,5": 0,
            "13,5": 0,
            "15,5": 0,
            "2,7": 180,
            "4,7": 90,
            "6,7": 0,
            "10,7": 0,
            "12,7": 90,
            "14,7": 180,
            "1,9": 0,
            "3,9": 0,
            "4,9": 90,
            "12,9": 90,
            "14,9": 0,
            "2,11": 180,
            "7,11": 0,
            "9,11": 270,
            "14,11": 180,
            "3,12": 0,
            "9,12": 180,
            "13,12": 0,
            "1,13": 0,
            "9,13": 270,
            "15,13": 0,
            "2,14": 0,
            "4,14": 90,
            "6,14": 0,
            "10,14": 0,
            "12,14": 90,
            "14,14": 0,
            "3,15": 180,
            "14,15": 180
        }
    }
];

// Backwards compatibility aliases
const CASTLE_MISSIONS = TACTICAL_MISSIONS;

window.LOGIC_GATES_LIBRARY = LOGIC_GATES_LIBRARY;
window.TACTICAL_MISSIONS = TACTICAL_MISSIONS;
window.CASTLE_MISSIONS = CASTLE_MISSIONS;
window.DEFAULT_TACTICAL_MISSIONS = JSON.parse(JSON.stringify(TACTICAL_MISSIONS));
window.renderMissionCircuitSVG = renderMissionCircuitSVG;
window.getGateSVGMarkup = getGateSVGMarkup;

