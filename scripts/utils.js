// =============================
// Conversion unités
// =============================

    // 1 pouce = 2.54 cm
    function CMtoPX(value, resolution) {
        // 1 pouce = 2.54 cm
        return (value / 2.54) * resolution;
    }

    function PXtoPT(value, resolution) {
        // 1 pt = 1/72 inch
        return (value * 72) / resolution;
    }

// =============================
// Conversion de couleurs
// =============================
    function getRVBbyHEXA(HEX) {
        // Code Hexa : #RRVVBB = RVB (Rouge, Vert, Blue)
        // Valeurs possibles : 0 1 2 3 4 5 6 7 8 9 A B C D E F
        // BASE 16 (Hexadécimal)

        const hex = HEX.replace("#", ""); // Retire #
        if (hex.length !== 6) {return "Code hexadécimal invalide";} // 6 caractères obligatoire

        // Convertit chaque paire comme un nombre hexadécimal (base 16)
        const R = parseInt(hex.substring(0, 2), 16);
        const V = parseInt(hex.substring(2, 4), 16);
        const B = parseInt(hex.substring(4, 6), 16);

        return { R, V, B};
    }

    function getCMJNbyRVB(RVB) {
        // Convertir les valeurs RVB (qui vont de 0 à 255) en valeurs comprises entre 0 et 1 (normalisation)
        const R = RVB.R / 255;
        const V = RVB.V / 255;
        const B = RVB.B / 255;

        var C = 0, M = 0, J = 0, N = 0;

        // 1. CALCULER N
            // Si la valeur maximale (RVB) est proche de 1 = couleur dominante plus est proche du blanc
            // Si la valeur maximale (RVB) est proche de 0 = couleur dominante plus est proche du noir
            N = 1 - Math.max(R, V, B);

        // 2. CALCULER C M J
            // Exemple pratique : R = 0.6 / N = 0.2

            if (N < 1) { // Si ce n'est pas noir pur
                // (1 - R               → quantité de C si on ignore N                              (1 - 0.6 = 0.4 => 40% de C (hors N))
                // - N)                 → on retire la partie qui sera déjà fournie par le noir     (0.4 - 0.2 = 0.2 => 20% de C (avec N))
                // / (1 - N)            → on normalise par la proportion de couleur (hors N)        (0.2 / 0.8 = 0.25 => 25% de C)
                C = (1 - R - N) / (1 - N);
                M = (1 - V - N) / (1 - N);
                J = (1 - B - N) / (1 - N);
            }

        // 3. CONVERTIR EN POURCENTAGE
            return {
                C: Math.round(C * 100),
                M: Math.round(M * 100),
                J: Math.round(J * 100),
                N: Math.round(N * 100)
            };

    }

    function getHSLbyRVB(RVB) {

        // 1. Normalisation (0 → 1)
        const R = RVB.R / 255;
        const V = RVB.V / 255;
        const B = RVB.B / 255;

        const max = Math.max(R, V, B);
        const min = Math.min(R, V, B);
        const delta = max - min;

        let H = 0;
        let S = 0;
        let L = (max + min) / 2;

        // 2. Saturation
        if (delta !== 0) {
            S = delta / (1 - Math.abs(2 * L - 1));
        }

        // 3. Teinte (Hue)
        if (delta !== 0) {
            switch (max) {
                case R:
                    H = ((V - B) / delta) % 6;
                    break;
                case V:
                    H = (B - R) / delta + 2;
                    break;
                case B:
                    H = (R - V) / delta + 4;
                    break;
            }
            H *= 60;
            if (H < 0) H += 360;
        }

        // 4. Conversion en %
        return {
            H: Math.round(H),
            S: Math.round(S * 100),
            L: Math.round(L * 100)
        };
    } 

// =============================
// CONFIGURATION DU FORMAT
// =============================
    const DPI_SCREEN = 96;
    const DPI_PRINT = 300;

    const CM_TO_PT = 72 / 2.54;

    // Pixel Ratio
    const DPR = window.devicePixelRatio || 1; // 1 par défaut

    // Format faire-part
    const WIDTH_PRINT = parseFloat(document.getElementById('largeur').value); // cm
    const HEIGHT_PRINT = parseFloat(document.getElementById('hauteur').value); // cm

    const WIDTH_SCREEN = CMtoPX(WIDTH_PRINT, DPI_SCREEN);
    const HEIGHT_SCREEN = CMtoPX(HEIGHT_PRINT, DPI_SCREEN);

    const WIDTH_PDF_PT = WIDTH_PRINT * CM_TO_PT;
    const HEIGHT_PDF_PT = HEIGHT_PRINT * CM_TO_PT;

    // Format feuille production
    const PROD_WIDTH_PRINT = parseFloat(document.getElementById('print_largeur').value); // cm
    const PROD_HEIGHT_PRINT = parseFloat(document.getElementById('print_hauteur').value); // cm

    const PROD_WIDTH_SCREEN = CMtoPX(PROD_WIDTH_PRINT, DPI_SCREEN);
    const PROD_HEIGHT_SCREEN = CMtoPX(PROD_HEIGHT_PRINT, DPI_SCREEN);

    const PROD_WIDTH_PDF_PT = PROD_WIDTH_PRINT * CM_TO_PT;
    const PROD_HEIGHT_PDF_PT = PROD_HEIGHT_PRINT * CM_TO_PT;

    // Zoom export PDF
    const EXPORT_SCALE = DPI_PRINT / DPI_SCREEN; // 300 / 96 ≈ 3.125

// =============================
// BORD PERDU
// =============================
    const BLEED_CM = 0.5; // bord perdu 0.5cm
    const BLEED_PX = CMtoPX(BLEED_CM, DPI_SCREEN);
    const BLEED_PT = BLEED_CM * CM_TO_PT;

// =============================
// IMPOSITION
// =============================
    const PROD_IMPOSITION = document.getElementById('imposition').value; // ex: 4

// =============================
// Détection de support (mobile, tablette, pc) (V1 : initialisation qu'au chargement, donnée statique))
// =============================
    const DEVICE = {
        get deviceOrientation() {
            return window.innerWidth > window.innerHeight ? "landscape" : "portrait";
        },

        get support() {
            const ua = navigator.userAgent;

            const isMobile =
            /Android|iPhone|iPod|Mobile/i.test(ua) ||
            window.innerWidth < 768;

            const isTablet =
            /iPad|Tablet|Android(?!.*Mobile)/i.test(ua) ||
            (window.innerWidth >= 768 && window.innerWidth < 1024);

            const isDesktop = !isMobile && !isTablet;

            const isMobileLike =
            isMobile || (isTablet && this.deviceOrientation === "portrait");

            return { isMobile, isTablet, isDesktop, isMobileLike };
        },

        get layout() {
            return this.support.isMobileLike ? "compact" : "large";
        }

    };

    // Synchronisation CSS
    function syncLayout() {
    document.documentElement.dataset.layout = DEVICE.layout;
    }

    // Ajustement dynamique en fonction du support (rotation etc.)
    function onViewportChange() {
    syncLayout();
    }

    ["resize", "orientationchange"].forEach(event =>
    window.addEventListener(event, onViewportChange) // Au changement
    );

    onViewportChange(); // Appel initial

    // Afficher visuellement les infos responsive
    const showDEVICE = document.getElementById("showDEVICE");
    function renderDevice() {
    const support = DEVICE.support;

    showDEVICE.innerHTML = `
        <strong>V1:</strong><br>
        <strong>deviceOrientation :</strong> ${DEVICE.deviceOrientation}<br>
        <strong>Layout :</strong> ${DEVICE.layout}<br>
        <strong>Support :</strong><br>
        Mobile: ${support.isMobile}<br>
        Tablet: ${support.isTablet}<br>
        Desktop: ${support.isDesktop}<br><br>
        isMobileLike: ${support.isMobileLike}
    `;
    }

    ["resize", "orientationchange"].forEach(event =>
    window.addEventListener(event, renderDevice)
    );

    renderDevice();

// =============================
// Module de gestion des popovers (click)
// Déselectionne et masque les popovers en cas de click en dehors du canva
// =============================
function createGlobalClickManager({ canvasList, popoverSelector = "[data-popover]" }) {

    const popovers = document.querySelectorAll(popoverSelector);

    function closeAllPopovers() {
        popovers.forEach(p => p.classList.add("hidden"));
    }

    function openPopover(id) {
        closeAllPopovers();
        const pop = document.getElementById(id);
        if (pop) pop.classList.remove("hidden");
    }

    function isInPopover(el) {
        return el.closest(popoverSelector) !== null;
    }

    function isPopoverButton(el) {
        return el.closest(".openPopover") !== null;
    }

    function isLayerControl(el) {
        return el.closest(".layerControl") !== null;
    }

    function isInAnyCanvas(x, y) {
        return canvasList.some(canvas => {
            const el = canvas.lowerCanvasEl;
            const r = el.getBoundingClientRect();
            return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
        });
    }

    function handlePointer(e) {
        const target = e.target;
        const x = e.clientX ?? e.touches?.[0]?.clientX;
        const y = e.clientY ?? e.touches?.[0]?.clientY;

        // 1. bouton popover → ouvrir
        if (isPopoverButton(target)) {
            const btn = target.closest(".openPopover");
            const id = btn.getAttribute("data-target");
            openPopover(id);
            return;
        }

            // Boutons gestion des calques
            if (isLayerControl(target)) {
                return; // Ne rien fermer 
            }

        // 2. clic DANS un popover → ne rien faire
        if (isInPopover(target)) return;

        // 3. clic dans un canvas → fermer popovers
        if (isInAnyCanvas(x, y)) {
            closeAllPopovers();
            return;
        }

        // 4. clic extérieur → fermer + désélectionner
        closeAllPopovers();

        canvasList.forEach(c => {
            c.discardActiveObject();
            c.requestRenderAll();
        });
    }

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("touchstart", handlePointer);
}
