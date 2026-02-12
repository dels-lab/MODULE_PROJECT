// =============================
// FONCTION
// =============================
    function updateColor(color) {
        if (!activeObj) return;

        if(selectionIsActive(watchCursor(activeObj))) { // Application sur une sélection active
            var currentSelect = watchCursor(activeObj);
            setStyleOnSelection("fill", color, currentSelect)
        } else { // Application sur l'objet global
            setStyle("fill", color);
        }
        
    }

    function synchroStyleColor(activeObj) {
        if (activeObj.fill) {
            txt_color.value = activeObj.fill;
            txt_color.style.color = activeObj.fill;
            txt_color.style.background = activeObj.fill;
        }
    }

    function centerElement(element, container) {
        const elementWidth = element.offsetWidth;
        const elementLeft = element.offsetLeft;
        const containerWidth = container.offsetWidth;

        const scrollPosition = elementLeft - (containerWidth / 2) + (elementWidth / 2);

        container.scrollTo({
            left: scrollPosition,
            behavior: 'smooth'
        });
    }

  
// =============================
// CONTROL
// =============================

    const colors = {
        "rouge": [
            "#ffcdd2",
            "#ef9a9a",
            "#e57373",
            "#ef5350",
            "#f44336",
            "#e53935",
            "#d32f2f",
            "#c62828",
            "#b71c1c"
        ]
        ,
        "orange": [
            "#ffe0b2",
            "#ffcc80",
            "#ffb74d",
            "#ffa726",
            "#ff9800",
            "#fb8c00",
            "#f57c00",
            "#ef6c00",
            "#e65100"
        ]
        ,
        "jaune": [
            "#fff9c4",
            "#fff59d",
            "#fff176",
            "#ffee58",
            "#ffeb3b",
            "#fdd835",
            "#fbc02d",
            "#f9a825",
            "#f57f17"
        ]
        ,
        "vert": [
            "#c8e6c9",
            "#a5d6a7",
            "#81c784",
            "#66bb6a",
            "#4caf50",
            "#43a047",
            "#388e3c",
            "#2e7d32",
            "#1b5e20"
        ]
        ,
        "bleu": [
            "#bbdefb",
            "#90caf9",
            "#64b5f6",
            "#42a5f5",
            "#2196f3",
            "#1e88e5",
            "#1976d2",
            "#1565c0",
            "#0d47a1"
        ]
        ,
        "violet": [
            "#e1bee7",
            "#ce93d8",
            "#ba68c8",
            "#ab47bc",
            "#9c27b0",
            "#8e24aa",
            "#7b1fa2",
            "#6a1b9a",
            "#4a148c"
        ]
    }

    // Surveiller le switcher
    const colorpickerColors = document.getElementById('colorpicker_color'); // Container colorpicker
    var colorPickercontainers = colorpickerColors.querySelectorAll("div[id^='container_']")

    const toolsColors = document.getElementById('tools_colors'); // Container du colorpicker sur desktop
    const popoverColorsContainers = document.getElementById('popover_colors_containers'); // Container du colorpicker sur mobile

    var counter_colorType = 0;
    var counter_colorHexa = 0;

    // Switcher
        var selectedColorPicker = "palette" // Initialisation

        // Cible les inputs 
        const colorPickerType = Array.from(document.getElementsByName('colorPickerType'));
        colorPickerType.forEach(input => {
            input.addEventListener('change', (e) => {
                selectedColorPicker = e.target.id.split('_')[1];

                colorPickercontainers.forEach(container => {
                    var key = container.id.split('_')[1];
                    if(key === selectedColorPicker) {
                        container.classList.remove('hidden')
                    } else {
                        container.classList.add('hidden')
                    }
                });
            })
            
        });

    // Remplir la palette
        const containerPalette = document.getElementById('grid_palette');
        const containerAnchor = document.getElementById('container_anchor');

        for (const colorName in colors) {
            if (!Object.hasOwn(colors, colorName)) continue;

            const colorHexa = colors[colorName];
            counter_colorType += 1;

            const middleIndex = Math.floor(colorHexa.length / 2);

            colorHexa.forEach((color, index) => {
                counter_colorHexa += 1;

                const createColor = document.createElement('input');
                createColor.setAttribute('type', 'radio');
                createColor.dataset.color = color;
                createColor.dataset.colorGroup = colorName;
                createColor.classList.add('radio_color');
                createColor.style.backgroundColor = color;

                // Ancre couleur
                if (index === middleIndex) {
                    // Création du lien
                    const anchor = document.createElement('a');
                    anchor.setAttribute('href',`#anchor-${colorName}`);
                    anchor.innerHTML = `${colorName}`;
                    containerAnchor.appendChild(anchor);

                    containerAnchor.style.gridTemplateColumns = `repeat(${counter_colorType}, 1fr)`

                    // Encrage de la couleur médiane
                    createColor.id = `anchor-${colorName}`;

                    // Class active sur la 1ere occurence
                    if(colorName == 'rouge') {
                        anchor.classList.add('active');
                    }
                }

                containerPalette.appendChild(createColor);

                createColor.addEventListener('focus', (e) => {
                    updateColor(e.target.dataset.color);
                    synchroStyleColor(activeObj);

                    // Centrage au clic
                    const anchor = document.getElementById(`anchor-${e.target.dataset.colorGroup}`);
                    const anchors = Array.from(containerAnchor.children);

                    anchors.forEach(anchorLink => {
                        anchorLink.classList.remove('active')
                    });

                    if (anchor) {
                        anchors.forEach(anchorLink => {
                            if(anchorLink.innerHTML == anchor.dataset.colorGroup) {
                                anchorLink.classList.add('active');
                            }
                        });

                        //Empêche le scroll automatique + ajout du #
                        e.preventDefault(); // Désactive le scroll natif
                        centerElement(anchor, containerPalette);
                        history.replaceState(null, null, window.location.pathname + window.location.search); // retirer l'encre de l'url
                    }
                });
            });
        }

    // Placer le colorpicker dans le bon container en fonction du support
    if (DEVICE.layout === "compact") {
        containerPalette.style.gridTemplateColumns = `repeat(${counter_colorHexa}, 30px)`
        popoverColorsContainers.appendChild(colorpickerColors);
    } else {
        toolsColors.appendChild(colorpickerColors);
    }

    // Contrôle HSL 
    const HSL = {
        H : 0,
        S : 100,
        L : 50
    }

    const hslInput = document.getElementById("hsl");
    hslInput.addEventListener("input", e => {
        HSL.H = e.target.value;
        var RVB = getRVBbyHSL(HSL);
        var HEXA = getHEXbyRVB(RVB)
        updateColor(HEXA);
        synchroStyleColor(activeObj);

    });
