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
            synchroColorPicker(activeObj.fill);
        }
    }

    function synchroColorPicker(COLORCODE) {
        var TYPE = null;
        var RVB = null;
        var HSL = null;

        // 1. Détecte le type de code
        switch (typeof COLORCODE) {
            case "string":
                if(COLORCODE.charAt(0) == "#") {
                    TYPE = 'HEX';
                }
                break;

            case "object":
                if ("R" in COLORCODE && "V" in COLORCODE && "B" in COLORCODE) {
                    console.log("Type détecté : RVB");
                    TYPE = "RVB";
                }

                if ("H" in COLORCODE && "S" in COLORCODE && "L" in COLORCODE) {
                    console.log("Type détecté : HSL");
                    TYPE = "HSL";
                }

                break;
        
            default:
                console.log("COLORCODE : entrée inconnue");
                return false;
                break;
        }

        if(TYPE) {
            switch (TYPE) {
                case "HEX":

                    // Attribution HEX
                    HEX.value = COLORCODE;

                    // Attribution RVB 
                    RVB = getRVBbyHEXA(COLORCODE);
                    R.value = RVB.R;
                    V.value = RVB.V;
                    B.value = RVB.B;

                    // Attribution HSL
                    HSL = getHSLbyRVB(RVB)
                    H.value = HSL.H;
                    S.value = HSL.S;
                    L.value = HSL.L;

                    break;

                case "RVB":
                    // Attribution HEX
                    HEX.value = getHEXbyRVB(COLORCODE);

                    // Attribution RVB 
                    RVB = COLORCODE;

                    // Attribution HSL
                    HSL = getHSLbyRVB(COLORCODE)
                    H.value = HSL.H;
                    S.value = HSL.S;
                    L.value = HSL.L;

                    break;
            
                case "HSL":
                    // Attribution HSL
                    HSL = COLORCODE;

                    // Attribution RVB 
                    RVB = getRVBbyHSL(COLORCODE);
                    R.value = RVB.R;
                    V.value = RVB.V;
                    B.value = RVB.B;

                    // Attribution HEX
                    HEX.value = getHEXbyRVB(RVB)
                    break;
            }

            circleColor.style.backgroundColor = HEX.value;
            console.log("INITIALISATION COLORPICKER ICI")
            updateColor(HEX.value);
        }

    }

    function showColorContainer(input) {
        selectedColorPicker = input.id.split('_')[1];
        colorPickercontainers.forEach(container => {
            var key = container.id.split('_')[1];
            if(key === selectedColorPicker) {
                container.classList.remove('hidden')
            } else {
                container.classList.add('hidden')
            }
        });
    }

    // TEST
    function resizeCanvas() {
        var rect = square.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        drawSquare();

        // Repositionnement curseur
        cursor.style.left = (saturation / 100) * rect.width + "px";
        cursor.style.top = ((100 - lightness) / 100) * rect.height + "px";
    }

    function drawSquare() {
        const w = canvas.width;
        const h = canvas.height;

        ctx.clearRect(0, 0, w, h);

        // Couleur base (Hue)
        ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        ctx.fillRect(0, 0, w, h);

        // Dégradé blanc (saturation)
        const whiteGradient = ctx.createLinearGradient(0, 0, w, 0);
        whiteGradient.addColorStop(0, "white");
        whiteGradient.addColorStop(1, "transparent");
        ctx.fillStyle = whiteGradient;
        ctx.fillRect(0, 0, w, h);

        // Dégradé noir (lightness)
        const blackGradient = ctx.createLinearGradient(0, 0, 0, h);
        blackGradient.addColorStop(0, "transparent");
        blackGradient.addColorStop(1, "black");
        ctx.fillStyle = blackGradient;
        ctx.fillRect(0, 0, w, h);
    }

    function hslToRgb(h, s, l) {
        s /= 100;
        l /= 100;

        const k = n => (n + h / 30) % 12;
        const a = s * Math.min(l, 1 - l);
        const f = n =>
            l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));

        return [
            Math.round(255 * f(0)),
            Math.round(255 * f(8)),
            Math.round(255 * f(4))
        ];
    }

    function rgbToHex(r, g, b) {
        return "#" + [r, g, b]
            .map(x => x.toString(16).padStart(2, "0"))
            .join("");
    }

    function updateAll() {
        S.value = Math.round(saturation);
        L.value = Math.round(lightness);

        const [r, g, b] = hslToRgb(hue, saturation, lightness);

        R.value = r;
        V.value = g;
        B.value = b;

        HEX.value = rgbToHex(r, g, b);
    }

    function updateFromPointer(e) {
        var rect = canvas.getBoundingClientRect();

        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;

        x = Math.max(0, Math.min(x, rect.width));
        y = Math.max(0, Math.min(y, rect.height));

        saturation = (x / rect.width) * 100;
        lightness = 100 - (y / rect.height) * 100;

        cursor.style.left = x + "px";
        cursor.style.top = y + "px";

        updateAll();
    }
    // FIN TEST

  
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

    const circleColor = document.getElementById("txt_color");

    var HEX = document.getElementById("hex");

    var H = document.getElementById("hslH");
    var S = document.getElementById("hslS");
    var L = document.getElementById("hslL");

    var R = document.getElementById("rvbR");
    var V = document.getElementById("rvbV");
    var B = document.getElementById("rvbB");

    // Surveiller le switcher
    const colorpickerColors = document.getElementById('colorpicker_color'); // Container colorpicker
    var colorPickercontainers = colorpickerColors.querySelectorAll("div[id^='container_']")

    const toolsColors = document.getElementById('tools_colors'); // Container du colorpicker sur desktop
    const popoverColorsContainers = document.getElementById('popover_colors_containers'); // Container du colorpicker sur mobile

    var counter_colorHexa = 0;

    // Switcher
        var selectedColorPicker = "palette" // Initialisation

        // Cible les inputs 
        const colorPickerType = Array.from(document.getElementsByName('colorPickerType'));
        colorPickerType.forEach(input => {
            input.addEventListener('change', (e) => {showColorContainer(e.target)})
            if(input.checked) {showColorContainer(input)}
        });

    // Remplir la palette
        const containerPalette = document.getElementById('grid_palette');

        for (const colorName in colors) {
            if (!Object.hasOwn(colors, colorName)) continue;

            const colorHexa = colors[colorName];

            colorHexa.forEach((color, index) => {
                counter_colorHexa += 1;

                const createColor = document.createElement('input');
                createColor.setAttribute('type', 'radio');
                createColor.dataset.color = color;
                createColor.dataset.colorGroup = colorName;
                createColor.classList.add('radio_color');
                createColor.style.backgroundColor = color;

                containerPalette.appendChild(createColor);

                createColor.addEventListener('focus', (e) => {
                    synchroColorPicker(e.target.dataset.color) 
                });
            });
        }

    // Placer le colorpicker dans le bon container en fonction du support
        if (DEVICE.layout === "compact") {
            containerPalette.style.gridTemplateColumns = `repeat(${counter_colorHexa}, 40px)`
            popoverColorsContainers.appendChild(colorpickerColors);
        } else {
            toolsColors.appendChild(colorpickerColors);
        }

    // Synchronisation des inputs
    const allInputColors = Array.from(colorpickerColors.querySelectorAll("input.colorInput"));
    allInputColors.forEach(input => {
        input.addEventListener('input', (e) => {
            switch (e.target.dataset.colorgroup) {
                case "hex":
                    synchroColorPicker(e.target.value)  
                    break;

                case "hsl":
                    const groupHSL = {
                        H: H.value,
                        S: S.value,
                        L: L.value
                    };
                    synchroColorPicker(groupHSL)  
                    break;

                case "rvb":
                    const groupRVB = {
                        R: R.value,
                        V: V.value,
                        B: B.value
                    };

                    synchroColorPicker(groupRVB)  
                    break;
            }
        })
    });


    // COLORPICKER NUANCIER
    const container = document.getElementById("subcontainer_nuancier");

    // Création du carré
    const square = document.createElement("div");
    square.className = "color-square";

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const cursor = document.createElement("div");
    cursor.className = "color-cursor";

    square.appendChild(canvas);
    square.appendChild(cursor);
    container.appendChild(square);

    let hue = parseFloat(H.value) || 0;
    let saturation = 100;
    let lightness = 50;

    let isDown = false;

    square.addEventListener("pointerdown", e => {
        isDown = true;
        square.setPointerCapture(e.pointerId);
        updateFromPointer(e);
    });

    square.addEventListener("pointermove", e => {
        if (isDown) updateFromPointer(e);
    });

    square.addEventListener("pointerup", e => {
        square.releasePointerCapture(e.pointerId);
        isDown = false;
    });

    H.addEventListener("input", e => {
        hue = parseFloat(e.target.value);
        drawSquare();
        updateAll();
    });

    window.addEventListener("resize", resizeCanvas);

    window.addEventListener("load", () => {
        resizeCanvas();
        updateAll();
    });