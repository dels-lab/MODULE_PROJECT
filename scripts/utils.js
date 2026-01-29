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
// Détection de support (mobile, tablette, pc) (V1 : initialisation qu'au chargement, donnée statique))
// =============================

/*
const DeviceInfo = {
    // Détection simple & stricte via userAgent + dimensions écran
        isMobile: /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) 
                || (window.innerWidth < 768),

        isTablet: /iPad|Tablet|Android(?!.*Mobile)/i.test(navigator.userAgent)
                || (window.innerWidth >= 768 && window.innerWidth < 1024),

        isDesktop: function () {
            return !this.isMobile && !this.isTablet;
        },


    // Détection affinée pour le responsive
        isMobileLike: function () {
            return this.isMobile || (this.isTablet && this.isPortrait());
        },

        isDesktopLike: function () {
            return this.isDesktop() || (this.isTablet && this.isLandscape());
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

        isPortrait: function () {
            return this.orientation.includes('portrait');
        },

        isLandscape: function () {
            return this.orientation.includes('landscape');
        },

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
            layout: this.isMobileLike() ? "compact" : "large",
            pixelRatio: this.pixelRatio,
            screenPx: `${this.screenWidthPx} × ${this.screenHeightPx}`,
            viewport: `${this.viewportWidth} × ${this.viewportHeight}`,
            orientation: this.orientation,
            touch: this.isTouchEnabled,
            estimatedPPI: Math.round(this.estimatedPPI())
        };
    }
};

const DEVICE = DeviceInfo.summary();

console.log("DEVICE INFO ===>", DEVICE);

// Place les composants en fonction du device (élement commun multi-support)
function loadComponent(target) {
    fetch('components/colorpicker.php')
        .then(r => r.text())
        .then(html => {document.querySelector(target).innerHTML += html;});
}

if (DEVICE.layout === "compact") { // Mobile ou tablet portrait
    loadComponent('#popover_colors_containers');
} else { // desktop ou tablet paysage
    loadComponent('#tools_colors');
}*/

// =============================
// Détection de support (mobile, tablette, pc) (V1 : initialisation qu'au chargement, donnée statique))
// =============================

// A supprimer : Afficher visuellement les données
const DEVICE = {

  get orientation() {
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

    return {
      isMobile,
      isTablet,
      isDesktop: !isMobile && !isTablet
    };
  },
  get layout() {
    return (window.innerWidth < 768 && this.orientation === "portrait")
      ? "compact"
      : "large";
  }
};

var showDEVICE = document.getElementById('showDEVICE');
var { orientation, layout, support } = DEVICE;

showDEVICE.innerHTML = `
  <strong>Orientation :</strong> ${orientation}<br>
  <strong>Layout :</strong> ${layout}<br>
  <strong>Support :</strong><br>
  Mobile: ${support.isMobile}<br>
  Tablet: ${support.isTablet}<br>
  Desktop: ${support.isDesktop}
`;


function onDeviceChange() {
  console.log("Orientation :", DEVICE.orientation);
  console.log("Layout :", DEVICE.layout);
  showDEVICE.innerHTML = `
  <strong>Orientation :</strong> ${orientation}<br>
  <strong>Layout :</strong> ${layout}<br>
  <strong>Support :</strong><br>
  Mobile: ${support.isMobile}<br>
  Tablet: ${support.isTablet}<br>
  Desktop: ${support.isDesktop}
`;
}

["resize", "orientationchange"].forEach(event =>
  window.addEventListener(event, onDeviceChange)
);



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
