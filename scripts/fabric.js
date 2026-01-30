// =============================
// INITIALISATION DES CANVAS
// =============================
    var canvasRecto = null;
    var canvasVerso = null;

    var activeCanvas = null;
    var activeObj = null;

    // Cible le recto et le verso
    canvasRecto = new fabric.Canvas('canvas-recto');
    canvasVerso = new fabric.Canvas('canvas-verso');

    if (DEVICE.layout === "compact")  {
        // Contrôles des popovers
        createGlobalClickManager({
            canvasList: [canvasRecto, canvasVerso],
        });
    }

    // Défini la taille des canvas
    canvasRecto.setWidth(WIDTH_SCREEN);
    canvasRecto.setHeight(HEIGHT_SCREEN);
    canvasVerso.setWidth(WIDTH_SCREEN);
    canvasVerso.setHeight(HEIGHT_SCREEN);

    // Écouteur d'événements sur les deux canvas
    canvaEvents(canvasRecto);
    canvaEvents(canvasVerso);

    // Cible l'éditeur graphique
    const editor = document.getElementById('editor');
    const editor_controls = document.getElementsByClassName('editor-controls');
    const text_editor = document.getElementsByClassName('text_editor');

// =============================
// PREALOAD FONT
// =============================
    const urlMap = {
        Pacifico : 'url(./assets/fonts/Pacifico/Pacifico-Regular.ttf)',
        Oswald : 'url(./assets/fonts/Oswald/Oswald-Regular.ttf)',
    };

    const fontPacifico = new FontFace('Pacifico', urlMap.Pacifico, {
        style: 'normal',
        weight: 'normal',
    })

    const fontOswald = new FontFace('Oswald', urlMap.Oswald, {
        style: 'normal',
        weight: 'normal',
    })

    Promise.all([
        fontPacifico.load(),
        fontOswald.load(),
    ]).then(() => {
        document.fonts.add(fontPacifico);
        document.fonts.add(fontOswald);
    })

// =============================
// CONTROLE DES ELEMENTS
// =============================
    // Sélection des boutons
    const addTextBtn = document.getElementById('addText');
    const addImgBtn = document.getElementById('addImg');

    const deleteElement = document.getElementById('deleteElement');
    const cloneElement = document.getElementById('cloneElement'); 

    const bringFrontBtn = document.getElementById('bringFrontBtn');
    const sendBackBtn = document.getElementById('sendBackBtn');

    // Ajouter du texte
    addTextBtn.addEventListener('click', () => {
        const targetCanvas = getCurrentCanva();

        //const VAR_TOKEN = '\uE001';

        const text = new fabric.Textbox('Bonjour !', {
            left: 50,
            top: 50,
            fontSize: 32,
            fontFamily: 'Oswald',
            fill: '#000000',
            lineHeight : '1.2',
            charSpacing : 0,
            textAlign : 'left',
            lockScalingY: true,
            editable: true,
            styles: {} // on initialise vide pour préparer les styles par caractère
        });

        setDefaultStyleOnChar(text, "normal");

        text.setControlsVisibility({
            mt: false,
            mb: false,
            tl: false,
            tr: false,
            bl: false,
            br: false,
        });

        if (DEVICE.layout === "compact")  {
            targetCanvas.freeDrawingBrush.width = 1; // Pression du doigt = 1px (précision)

            fabric.Object.prototype.cornerSize = 24;        // taille visible
            fabric.Object.prototype.touchCornerSize = 40;   // zone tactile réelle, invisible
            fabric.Object.prototype.cornerStyle = 'circle';
            fabric.Object.prototype.cornerColor = 'rgba(0,0,0,0.5)';
            fabric.Object.prototype.cornerStrokeColor = '#fff';


            // éviter que l’objet bouge en même temps que la sélection
            text.on('editing:entered', () => {
                setTimeout(() => {text.hiddenTextarea.focus();}, 50);
                text.lockMovementX = true;
                text.lockMovementY = true;
            });

            text.on('editing:exited', () => {
                text.lockMovementX = false;
                text.lockMovementY = false;
            });
        }

        targetCanvas.add(text);
        targetCanvas.setActiveObject(text);
        targetCanvas.requestRenderAll();
    });

    // Ajouter une image
    addImgBtn.addEventListener('click', () => {
        const targetCanvas = getCurrentCanva();
        const imgURL = "./assets/img/logo.png";
        const image = new Image();
        image.src = imgURL;

        image.onload = function () {
            const fabricImage = new fabric.Image(image, {
                left: 50,
                top: 50,
            });

            targetCanvas.add(fabricImage);
            targetCanvas.setActiveObject(fabricImage);
            targetCanvas.requestRenderAll();
        };
    });

    // Supprimer l’objet actif
    deleteElement.addEventListener('click', () => {
        const targetCanvas = getCurrentCanva();
        const activeObject = targetCanvas.getActiveObject();
        if (activeObject) {
            targetCanvas.remove(activeObject);
            targetCanvas.requestRenderAll();
        }
    });

    // Cloner l'object actif
    cloneElement.addEventListener('click', () => {
        const targetCanvas = getCurrentCanva();
                const activeObject = targetCanvas.getActiveObject();
        if (activeObject) {
            activeObject.clone((clonedObj) => {
                clonedObj.set({
                    left: activeObject.left + 20, // décalage pour ne pas superposer
                    top: activeObject.top + 20,
                });
                targetCanvas.add(clonedObj);
                targetCanvas.setActiveObject(clonedObj);
                targetCanvas.requestRenderAll();
            });
        }
    });

    // Mettre en avant
    bringFrontBtn.addEventListener('click', () => {
        const targetCanvas = getCurrentCanva();
        const activeObj = targetCanvas.getActiveObject();
        if (activeObj) {
            activeObj.bringForward();
            targetCanvas.requestRenderAll();
        }
    });

    // Envoyer à l’arrière
    sendBackBtn.addEventListener('click', () => {
        const targetCanvas = getCurrentCanva();
        const activeObj = targetCanvas.getActiveObject();
        if (activeObj) {
            activeObj.sendBackwards();
            targetCanvas.requestRenderAll();
        }
    });

// =============================
// FONCTIONS UTILITAIRES
// =============================

    function getCurrentCanva() {
        const target = addTextBtn.getAttribute('data-target');
        return target === 'verso' ? canvasVerso : canvasRecto;
    }

    function canvaEvents(canvas) {

        // Configuration : Simulation double tap mobile
        let lastTap = 0;
        let tapTimeout = null;
        const DOUBLE_TAP_DELAY = 300; // idéal mobile

        // Actions 
        canvas.on('selection:created', (e) => {
            const obj = e.selected?.[0];
            activeCanvas = canvas;
            activeObj = obj;
            displayEditor(activeObj);
            synchronizeStyles(activeObj) // Association des styles
        });

        canvas.on('selection:updated', (e) => {
            const obj = e.selected?.[0];
            activeCanvas = canvas;
            activeObj = obj;
            displayEditor(obj);
        });

        canvas.on('selection:cleared', () => {
            activeObj = null;
            displayEditor(null);
        });

        canvas.on('mouse:up', () => {
            if (!activeObj) return;
            synchronizeStyles(activeObj); // Association des styles  
        })

        canvas.on('mouse:down', (e) => {
            const now = Date.now();
            const target = canvas.findTarget(e, true);

            // ---- DOUBLE TAP DETECT ----
            if (now - lastTap < DOUBLE_TAP_DELAY && target?.type === 'textbox') {
                clearTimeout(tapTimeout);
                enterTextEditing(target, canvas, e); // double tap = entrer dans l'édition interne
            } else {
                // SINGLE TAP (+ délai pour être sûr)
                tapTimeout = setTimeout(() => {
                    handleSingleTap(target, canvas); // simple tap = selection de l'element
                }, DOUBLE_TAP_DELAY);
            }

            lastTap = now;
        });

        canvas.on('text:selection:changed', (e) => {
            //console.log('Selection changed', e.target.selectionStart, e.target.selectionEnd);
            //console.log(watchCursor(activeObj))
        });

    }

    function displayEditor(obj) {
        const editorArray = Array.from(editor_controls);
        const textEditorArray = Array.from(text_editor)

        const module = document.getElementById('module');
        const tools = document.getElementById('tools');

        if (!obj) {
            editor.classList.remove('onEdit');
            editorArray.forEach(editor => {
                editor.classList.add('hidden');
            });

            textEditorArray.forEach(editor => {
                editor.classList.add('hidden');
            });

            if (DEVICE.layout === "compact")  {
                //module.style.gridTemplateRows = "10% 40px 75% calc(0.1 * var(--screen-height))";
                module.style.gridTemplateRows = "calc(0.1 * var(--layout-height)) 40px 1fr calc(0.1 * var(--layout-height));"

                tools.style.display = "flex";
            }
        } else {
            // Afficher le menu correspondant (Menu texte ou image)
            var nameVisible = obj.text ? 'controlText' : 'controlImg';
            var nameHidden = obj.text ? 'controlImg' : 'controlText';

            document.getElementById(nameHidden).classList.add('hidden');
            document.getElementById(nameVisible).classList.remove('hidden');

            // Gestion de l'affichage général
            editor.classList.add('onEdit');
            editorArray.forEach(editor => {
                editor.classList.remove('hidden');
            });

            // Gestion de l'affichage : texte seulement
            if(nameVisible === 'controlText') {
                textEditorArray.forEach(editor => {
                    editor.classList.remove('hidden');
                });
            }

            if(nameVisible === 'controlImg') {
                textEditorArray.forEach(editor => {
                    editor.classList.add('hidden');
                });
            }

            if (DEVICE.layout === "compact")  {
                //module.style.gridTemplateRows = "10% 40px 85% 0";
                module.style.gridTemplateRows = "calc(0.1 * var(--layout-height)) 40px 1fr 0;"
                tools.style.display = "none"
            }
        }
    }

    function setDefaultStyleOnChar(textbox, fontStyle) {
        if (!textbox || !textbox.text) return;

        // Fabric.js gère les styles par ligne
        textbox._textLines.forEach((line, lineIndex) => {
            textbox.styles[lineIndex] = {};
            for (let charIndex = 0; charIndex < line.length; charIndex++) {
                textbox.styles[lineIndex][charIndex] = {
                    fontStyle: fontStyle
                };
            }
        });
    }

    function watchCursor(obj) {
        if (!obj) return null;
        const start = obj.selectionStart || 0;
        const end = obj.selectionEnd || 0;

        const position = {start, end}
        return position;
    }

    function selectionIsActive(watchCursor) {
        return watchCursor.start !== watchCursor.end;
    }

    function setStyle(attribute, value) {
        if (!activeObj) return;
        resetCharStyles(); // Reset des styles par caractère
        activeObj.set(attribute, value); // Application du style global
        activeObj.dirty = true;
        activeCanvas.requestRenderAll();
    }

    function setStyleOnSelection(attribute, value, range) {
        if (!activeObj || !range || range.start === range.end) return;

        forEachChar(activeObj, ({ lineIndex, charIndex, globalIndex }) => {
            if (globalIndex >= range.start && globalIndex < range.end) {
                activeObj.styles[lineIndex] ??= {};
                activeObj.styles[lineIndex][charIndex] ??= {};
                activeObj.styles[lineIndex][charIndex][attribute] = value;
            }
        });

        activeObj.dirty = true;
        activeCanvas.requestRenderAll();
    }

    function resetCharStyles() {
        if (!activeObj) return;
        activeObj.styles = {};
    }

    function forEachChar(activeObj, callback) {
        let lineIndex = 0;
        let charIndex = 0;

        for (let globalIndex = 0; globalIndex < activeObj._text.length; globalIndex++) {
            const char = activeObj._text[globalIndex];

            if (char === "\n") {
                lineIndex++;
                charIndex = 0;
                continue;
            }

            callback({
                char,
                lineIndex,
                charIndex,
                globalIndex
            });

            charIndex++;
        }
    }

    function setLimitRange(value, min, max) {
        const num = Number(value);
        const minNum = Number(min);
        const maxNum = Number(max);

        if (num > maxNum) return maxNum;
        if (num < minNum) return minNum;
        return num;
    }

    function synchronizeStyles(activeObj) {
        synchroStyleFont(activeObj);
        synchroStyleSize(activeObj);
        synchroStyleColor(activeObj);
        synchroStyle(activeObj);
    }

    function handleSingleTap(target, canvas) {
        if (!target) return;

        // sélection simple
        canvas.setActiveObject(target);
        canvas.renderAll();

        displayEditor(target);
        synchronizeStyles(target);
    }

    function enterTextEditing(target, canvas, event) {
        if (!target) return;

        target.enterEditing();
        target.hiddenTextarea?.focus();

        // placer le curseur
        const pointer = canvas.getPointer(event);
        const index = target.getSelectionStartFromPointer(pointer);
        target.setSelectionStart(index);
        target.setSelectionEnd(index);

        canvas.renderAll();
    }
