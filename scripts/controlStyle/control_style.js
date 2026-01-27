// =============================
// FONCTION
// =============================

    function synchroStyle(activeObj) {
        if (!activeObj) return;

        const selected = document.querySelector(`input[name="fontStyle_alignement"][value="${activeObj.textAlign}"]`);
        if (selected) {selected.checked = true;}

        btnStyle.forEach(option => {
            option.checked = (option.value === activeObj[option.dataset.style]);
        });

        if (DEVICE.layout === "compact") {
            var iconName = "fa-align-" + activeObj.textAlign;
            icon.classList = ""; // reset
            icon.classList.add('fa-solid');
            icon.classList.add(iconName);
        }

    }

    function showSubContainers(key){
        for (let index = 0; index < configText.childElementCount; index++) {
            const subcontainers = configText.children[index];
            let matchKey = subcontainers.id.split('_')[1];

            if(key === matchKey) {
                subcontainers.classList.remove('hidden')
            } else {
                subcontainers.classList.add('hidden')
            }
        }
    }

    function updateAvanceStyle(attributes,value) {
        if (!activeObj) return;
        const val = Number(value);
        if (isNaN(val)) return;
        setStyle(attributes, val);
    }

    function synchroStyleAvance(activeObj) {
        if (!activeObj) return;
        const lineHeight = document.getElementById('lineHeight');
        const charSpacing = document.getElementById('charSpacing');
        
        lineHeight.value = activeObj.lineHeight;
        charSpacing.value = activeObj.charSpacing;
    }

// =============================
// CONTROL
// =============================
const btnAlignement = document.getElementsByName('fontStyle_alignement');
btnAlignement.forEach(option => {
    option.addEventListener('click', (e) => {
        setStyle(e.target.dataset.style, e.target.value);
    })
});

const btnStyle = document.getElementsByName('fontStyle_style');
btnStyle.forEach(option => {
    option.addEventListener('click', (e) => {
        if(e.target.checked === true) {
            switch (e.target.value) {
                case "italic":
                    setDefaultStyleOnChar(activeObj, "italic");
                    setStyle(e.target.dataset.style, e.target.value);
                    break;

                default:
                    setStyle(e.target.dataset.style, e.target.value);
                    break;
            }
        } else {
            switch (e.target.value) {
                case "italic":
                    setDefaultStyleOnChar(activeObj, "normal");
                    setStyle(e.target.dataset.style, "normal");
                    break;

                case "bold":
                    setStyle(e.target.dataset.style, "normal");
                    break;

                default:
                    setStyle(e.target.dataset.style, false);
                    break;
            }
        }

    })
});

// Change de parent en fonction du support
if (DEVICE.layout === "compact") {
    const containerParent = document.getElementById('styleContainer');
    const style = document.getElementById('style');
    containerParent.appendChild(style);

    const selectContainer = document.getElementById('selectContainer');
    const configText = document.getElementById('configText');

    const inputs = selectContainer.querySelectorAll('input');
    let onFocus = null;


    // RECUPERATION D'ELEMENT DESKTOP => MOBILE
        // Recupération des boutons alignement
        const selectAlignement = document.getElementById('select_alignement'); // Cible
        const alignement = document.getElementById('alignement'); // Source
        selectAlignement.appendChild(alignement);

        // Récupération lineSpacing & charSpacing
            // Source
            const customLinespacing = document.getElementById('custom_linespacing');
            const customCharspacing = document.getElementById('custom_charspacing');

            // Cible
            const selectLineSpacing = document.getElementById('select_lineSpacing');
            const selectCharspacing = document.getElementById('select_letterSpacing');

            selectLineSpacing.appendChild(customLinespacing);
            selectCharspacing.appendChild(customCharspacing);

    // SYNCHRONISATION D'ELEMENT
    const txtAlignement = document.getElementById('txt_alignement');
    var icon = txtAlignement.getElementsByTagName('i')[0];

    btnAlignement.forEach(option => {
        option.addEventListener('click', (e) => {
            var iconName = "fa-align-" + e.target.value;
            icon.classList = ""; // reset
            icon.classList.add('fa-solid');
            icon.classList.add(iconName);
        })
    });

    // Gestion focus sur input
    inputs.forEach(input => {
        input.addEventListener('focus', (e) => {
            selectContainer.parentElement.style.gridTemplateRows = "repeat(3,40px)";
            configText.classList.remove('hidden');

            onFocus = e.target.parentElement.id.split('_')[1];

            if (onFocus) {
                showSubContainers(onFocus);
            }
        });
    });

    // Gestion du click extérieur
    document.addEventListener('mousedown', (event) => {
        var clickInsideInput = selectContainer.contains(event.target);
        var clickInsideConfig = configText.contains(event.target);

        if (!clickInsideInput && !clickInsideConfig) {
            selectContainer.parentElement.style.gridTemplateRows = "repeat(2,40px)";
            configText.classList.add('hidden');
            onFocus = null;
        }
    });

} 

