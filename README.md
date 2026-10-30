# 🐍 Metal Gear Logic: Protocol Shadow Circuit 3D

Videojoc d'espionatge tàctic, sigil i arcade educatiu en **3D (Three.js / WebGL)** amb estètica i jugabilitat inspirades en **Metal Gear Solid (MGS)** per a l'aprenentatge curricular de l'**Electrònica Digital i les Portes Lògiques** a l'assignatura de Tecnologia (ESO i Batxillerat).

Accés local: **`http://localhost:8090/`**

---

## 🌟 Característiques Tàctiques Avançades

1. **Gràfiques, Il·luminació PBR i Ambientació Militar Realista**:
   - Murs de formigó i acer blindat amb perfils metàl·lics, canonades d'alta pressió i finestres amb vistes a una **tempesta de neu àrtica en temps real**.
   - Terra metàl·lic d'alta definició amb relleu de diamant (*diamond-plate*), juntes, reblons i franges diagonals de perill grogues-negres (*hazard stripes*).
   - Il·luminació dinàmica amb focus cònics per als sentinelles, càmeres CCTV i llums d'alerta vermelles.
   - Pous de ventilació profunda (`O`) amb **turbines industrials de 4 pales giratòries en 3D** visibles al fons.
   - Reixetes d'alta tensió (`L`) amb **4 bobines Tesla ceràmiques i arcs elèctrics blaus procedurals** que espurnegen en temps real.
   - Canonades de vapor industrial (`V`) amb bufades periòdiques de vapor d'alta pressió.

2. **Personatges i Moviment Realista (Físiques d'Inèrcia)**:
   - **Solid Snake (Agent Ombra)**:
     - Model 3D amb armilla de combat Kevlar, arnès tàctic, porta-carregadors, genolleres, pistolera a la cuixa dreta i botes de combat.
     - **Bandana dinàmica multi-segment**: Simula inèrcia i moviment del vent, onejant fluidament darrere el cap segons la velocitat i els girs de l'agent.
     - **Locomoció amb inèrcia**: Acceleració, frenada amb fricció i girs suaus angulars (*slerp*) en comptes de talls instantanis.
   - **Sentinelles Genome Patrol**:
     - Uniformes de camuflatge àrtic, armilla d'assalt, casc tàctic amb ulleres de visió nocturna (NVG) il·luminades i rifle d'assalt.
     - **IA de vigilància avançada**: Quan arriben a un punt de control de la seva ruta, **s'aturen durant uns segons i giren el cap i la llanterna a esquerra i dreta** per inspeccionar els passadissos abans de reprendre la marxa.

3. **Mecàniques d'Interacció, Raigs Làser i Puzles de Seguretat**:
   - **Barreres de Raigs Làser (`Z`)**:
     - Feixos làser infrarojos vermells que creuen els passadissos.
     - Si creues el làser actiu: xoc elèctric, so de curtcircuit, alarma general `[!]` i penalització de temps (-01:00 min).
     - **Bloqueig tàctic amb caixes**: Si empenys un contenidor pesant (`B`) davant del feix làser, **el làser queda bloquejat i interromput**, permetent-te creuar amb seguretat pel darrere!
     - **Desactivació per disjuntor**: També pots desactivar els làsers apagant el disjuntor elèctric de la sala!
   - **Disjuntors i Consoles de Seguretat (`U`)**:
     - Consoles a les parets amb palanca mecànica i indicador LED (vermell = làsers actius, verd = desactivats).
     - En acostar-t'hi, prem **`E`** per commutar el disjuntor: la palanca s'acciona mecànicament, sona el clic elèctric i els làsers del sector es desconnecten!
   - **Sub-portes Cuirassades (`D`) i Plaques de Pressió (`F`)**:
     - Comportes secundàries corredisses que bloquegen passadissos alternatius o accés a discs PAL.
     - S'obren en prémer el disjuntor `U`, o trepitjant la **placa de pressió (`F`)**.
     - **Puzle de pressió permanent**: Si empenys una caixa de càrrega (`B`) a sobre de la placa `F`, la placa s'enfonsa i **la sub-porta es manté oberta permanentment**!

4. **Motor de So Tàctic Sintètic (Web Audio API)**:
   - Passes amortides de botes de combat sobre metall i formigó.
   - So clàssic d'alerta MGS `[!]`.
   - To de trucada de ràdio Codec (*beep-beep, beep-beep*).
   - Espurneig elèctric i descàrrega de làser (*zap*).
   - Acció mecànica de palanca de disjuntor (*clack-clonk*).
   - Hiss de vapor a pressió per canonades industrials.
   - Depressió hidràulica de plaques de pressió i obertura de comportes.

5. **Càmera Tàctica sense Oclusió i Soliton Radar**:
   - Murs ajustats a **2.2m** d'alçada per garantir que cap enemic ni passadís quedi amagat.
   - Rotació de càmera 360° en 45° (`Q` / `R`).
   - Vista zenital directa (`Z`) per a planificació tàctica superior.
   - Soliton Radar en directe amb mapa, fletxa de Snake, **cons de visió de sentinelles i càmeres CCTV en temps real**, i traçat de làsers vermells.

6. **10 Sectors de Portes Lògiques i Història Codec**:
   - Circuits digitals: NOT, AND, OR, XOR, NAND, NOR i combinacionals multi-porta.
   - Dossier d'història (`H`) amb il·lustracions HD sobre la base *Shadow Circuit* i el tanc nuclear *Metal Gear TITAN*.
   - Ràdio Codec (`C`) amb el Coronel Campbell, Otacon, Dra. Hunter i Snake.
   - Diploma Oficial FOXHOUND amb càlcul de nota sobre 10, rang de sigil (BIG BOSS, FOX, HOUND, SNAKE, RECRUIT) i descàrrega en PDF i PNG.

---

## 🕹️ Taula de Controls de Sigil i Combat

| Acció | Teclat | Pantalla / HUD |
| :--- | :--- | :--- |
| **Moure Agent (Snake)** | `W`, `A`, `S`, `D` o Fletxes | D-Pad virtual |
| **Saltar Obstacles / Fossa** | `Espai` | Botó `🦘 SALTAR` |
| **Interacció (Porta / Disjuntor)** | `E` (a prop de l'objecte) | Botó `XIP` / Prompt `[E]` |
| **Girar Càmera 3D** | `Q` (Esquerra) / `R` (Dreta) | Botons `↺ [Q]` / `↻ [R]` |
| **Alternar Vista Zenital** | `Z` | Botó `🎥 Vista [Z]` |
| **Ràdio Codec** | `C` | Botó `📞 Codec [C]` |
| **Dossier d'Història** | `H` | Botó `📁 Dossier [H]` |
| **Llibreria de Portes** | `L` | Botó `📖 Llibreria [L]` |
| **Empènyer Caixes** | Caminar contra caixa `B` | Caminar contra caixa `B` |
| **Bloquejar Làsers** | Empènyer caixa `B` al feix | Empènyer caixa `B` al feix |
| **Obrir Sub-porta `D`** | Caixa `B` sobre placa `F` o disjuntor `U` | Caixa `B` sobre placa `F` o disjuntor `U` |
