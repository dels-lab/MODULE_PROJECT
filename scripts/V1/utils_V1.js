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
// CONFIGURATION DU FORMAT
// =============================
    const DPI_SCREEN = 96;
    const DPI_PRINT = 300;

    const WIDTH_PRINT = parseFloat(document.getElementById('largeur').value); // cm
    const HEIGHT_PRINT = parseFloat(document.getElementById('hauteur').value); // cm

    const WIDTH_SCREEN = CMtoPX(WIDTH_PRINT, DPI_SCREEN);
    const HEIGHT_SCREEN = CMtoPX(HEIGHT_PRINT, DPI_SCREEN);

    const CM_TO_PT = 72 / 2.54;
    const WIDTH_PDF_PT = WIDTH_PRINT * CM_TO_PT;
    const HEIGHT_PDF_PT = HEIGHT_PRINT * CM_TO_PT;

// =============================
// BORD PERDU
// =============================
    const BLEED_CM = 0.5; // bord perdu 0.5cm
    const BLEED_PX = CMtoPX(BLEED_CM, DPI_SCREEN);
    const BLEED_PT = BLEED_CM * CM_TO_PT;

// =============================
// REDIMENSIONNEMENT DES CANVAS : taille réel de l'écran
// =============================

    function resizeCanvasToScreen() {
        const availableWidth = window.innerWidth * 0.9;  // 90% de la largeur de l'écran
        const availableHeight = window.innerHeight * 0.9; // 90% de la hauteur

        const scaleW = availableWidth / WIDTH_SCREEN;
        const scaleH = availableHeight / HEIGHT_SCREEN;
        const scale = Math.min(scaleW, scaleH); // on conserve le ratio

        const allCanvas = document.getElementsByClassName('canvas');

        for (let index = 0; index < allCanvas.length; index++) {
            const canvas = allCanvas[index];
            canvas.style.height = HEIGHT_SCREEN + 'px';
            canvas.style.width = WIDTH_SCREEN + 'px';

            // Réinitialise d’abord la transformation (important si l’écran a grandi)
            canvas.style.transform = '';

            // Applique la réduction si nécessaire
            if (scale < 1) {
                canvas.style.transform = `scale(${scale})`;
            }

            // Centre le canvas visuellement (optionnel)
            canvas.style.transformOrigin = 'center center';
            canvas.style.margin = 'auto';
            canvas.style.display = 'block';
        }
    }

    function getScreenHeightWithoutUrlBar() {
        const screenHeight = window.screen.height; // hauteur totale de l'écran
        const windowHeight = window.innerHeight; // hauteur de la fenêtre visible (inclut la barre d'adresse sur mobile)
        
        // Si la hauteur de la fenêtre visible est plus petite que la hauteur totale de l'écran, cela signifie qu'une barre d'URL est présente
        if (screenHeight > windowHeight) {
            return windowHeight; // Cela donne la hauteur visible de la fenêtre sans la barre d'URL
        } else {
            return screenHeight; // Pas de barre d'URL visible
        }
    }

    const availableHeight = getScreenHeightWithoutUrlBar();
    document.documentElement.style.height = availableHeight + "px"; // Attribution à la balise <html>, le reste sera calculé en % en css
    document.documentElement.style.setProperty('--screen-height', `${availableHeight}px`); // mise à dispo CSS

    // Appel initial au chargement
    resizeCanvasToScreen();

    // Événement sur le redimensionnement de la fenêtre
    let resizeTimer; // Stock le timer

    window.addEventListener('resize', () => {
        // Annule le timer précédent si la fenêtre continue à être redimensionnée
        clearTimeout(resizeTimer);

        // Crée un nouveau timer pour exécuter la fonction après 150ms d’inactivité
        resizeTimer = setTimeout(() => {
            resizeCanvasToScreen(); // ta fonction qui ajuste le canvas
        }, 150);
    });

// =============================
// Détection de support (mobile, tablette, pc)
// =============================

const DeviceInfo = {
    // Détection simple via userAgent + dimensions écran
    isMobile: /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) 
              || (window.innerWidth < 768),

    isTablet: /iPad|Tablet|Android(?!.*Mobile)/i.test(navigator.userAgent)
              || (window.innerWidth >= 768 && window.innerWidth < 1024),

    isDesktop: function () {
        return !this.isMobile && !this.isTablet;
    },

    // Ratio Retina / DPR
    pixelRatio: window.devicePixelRatio || 1,

    // Taille réelle de l'écran en pixels (physiques)
    screenWidthPx: screen.width * (window.devicePixelRatio || 1),
    screenHeightPx: screen.height * (window.devicePixelRatio || 1),

    // Taille CSS
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,

    // Orientation (portrait / landscape)
    orientation: (screen.orientation || {}).type || 
                 (window.innerWidth > window.innerHeight ? "landscape" : "portrait"),

    // Peut-on toucher ?
    isTouchEnabled: 'ontouchstart' in window || navigator.maxTouchPoints > 0,

    // PPI/densité estimée (variable selon navigateur, mais utile)
    estimatedPPI: function () {
        // Valeur approximative uniquement pour adaptation
        // On compare la diagonale CSS à la diagonale physique
        const diagonalPx = Math.sqrt(this.screenWidthPx**2 + this.screenHeightPx**2);
        const diagonalInch = Math.sqrt(screen.width**2 + screen.height**2) / 96;

        return diagonalPx / diagonalInch;
    },

    // Méthode utilitaire
    summary: function () {
        return {
            device: this.isMobile ? "mobile" : this.isTablet ? "tablet" : "desktop",
            pixelRatio: this.pixelRatio,
            screenPx: `${this.screenWidthPx} × ${this.screenHeightPx}`,
            viewport: `${this.viewportWidth} × ${this.viewportHeight}`,
            orientation: this.orientation,
            touch: this.isTouchEnabled,
            estimatedPPI: Math.round(this.estimatedPPI())
        };
    }
};


console.log("DEVICE INFO ===>", DeviceInfo.summary());

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
