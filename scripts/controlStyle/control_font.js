// =============================
// FONCTION
// =============================
    function updateFontFamily(value) {
        if (!activeObj) return;

        if(selectionIsActive(watchCursor(activeObj))) { // Application sur une sélection active
            var currentSelect = watchCursor(activeObj);
            setStyleOnSelection("fontFamily", value, currentSelect)
        } else { // Application sur l'objet global
            setStyle("fontFamily", value);
        }

    }

    function synchroStyleFont(activeObj) {
        if (!activeObj || !activeObj.fontFamily) {return;}

        if (DEVICE.layout === "compact") {
            const policesAvailable = Array.from(availableFont.children);
            const policesSelected = Array.from(selectedFont.children);
            const allPolices = policesAvailable.concat(policesSelected);

            // Isole la typo sélectionnée
            allPolices.forEach(police => {
                if(police.id === activeObj.fontFamily) {
                    let index = allPolices.indexOf(police);
                    selectedFont.innerHTML = ""; // reset
                    allPolices.splice(index, 1); // Retire le typo sélectionnée des font dispo
                    selectedFont.appendChild(police);
                }
            });

            // Tri les polices disponibles par ordre alphabetique
            allPolices.sort((a, b) => {return a.id.localeCompare(b.id);});

            // Ajoute les polices disponibles
            allPolices.forEach(police => {availableFont.appendChild(police);})
        }

        if (!DeviceInfo.isMobile) {
            var selectOptions = Array.from(selectFont.children);
            selectOptions.forEach(option => {
                if(option.value === activeObj.fontFamily) {
                    option.selected = true;
                } else {
                    option.selected = false;
                }
            })
        }

    }

// =============================
// CONTROL
// =============================
    // Control mobile
    if (DEVICE.layout === "compact") {
        const optionPolice = document.getElementById('option_police');
        var selectedFont = optionPolice.children[0].children[0]
        var availableFont = optionPolice.children[0].children[1];

        const polices = optionPolice.getElementsByTagName('button');

        for (let index = 0; index < polices.length; index++) {
            const fontBtn = polices[index];
            fontBtn.addEventListener('click', (e) => {
                updateFontFamily(e.target.id);
                synchroStyleFont(activeObj);
            })  
        }
    }

    // Control Desktop
    if (!DeviceInfo.isMobile) {
        var selectFont = document.getElementById('txt_font');
        selectFont.addEventListener('change', (e) => {
            updateFontFamily(e.target.value);
            synchroStyleFont(activeObj);
        })
    }
