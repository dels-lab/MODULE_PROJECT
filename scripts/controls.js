document.addEventListener("DOMContentLoaded", (event) => {
    console.log('DOM Loaded');

    // SWITCHER FACE
    var canvaFace = "recto";
    const switcherCanva = document.getElementById('switcherCanva').children[0];
    switcherCanva.checked = false; // Recto par défault
    
    switcherCanva.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        var hiddenCanva = isChecked ? 'verso' : 'recto';
        var visibleCanva = isChecked ? 'recto' : 'verso';
        
        // Affiche la zone canva concernée
        var canvaElementVisible = document.getElementById('face-' + visibleCanva);
        var canvaElementHidden = document.getElementById('face-' + hiddenCanva);
        canvaElementVisible.style.display = 'none';
        canvaElementHidden.style.display = 'flex';

        // Configure les boutons 
        var btnAddTxt = document.getElementById('addText');
        btnAddTxt.setAttribute("data-target", hiddenCanva)

        // Sauvegarder l'état
        canvaFace = hiddenCanva;
        console.log('Face visble : ' + canvaFace)
    })

    // INPUT NUMBERS
        //const tools = document.getElementById('tools');
        const fieldNumbers = Array.from(document.getElementsByClassName('field_number'));

        fieldNumbers.forEach(field => {
            var input = field.getElementsByTagName('input')[0];
            var buttons = Array.from(field.getElementsByTagName('button'));
            
            buttons.forEach(button => {
                button.addEventListener('click', (e) => {
                    const step = parseFloat(input.step) || 1;
                    const min = parseFloat(input.min);
                    const max = parseFloat(input.max);
                    const currentValue = parseFloat(input.value) || 0;
                    let newValue = currentValue;
                    switch (e.target.getAttribute('name')) {
                        case 'up':
                            newValue = currentValue + step;
                            if (!isNaN(max)) {
                                newValue = Math.min(newValue, max);
                            }
                            break;
                        case 'down':
                            newValue = currentValue - step;
                            if (!isNaN(min)) {
                                newValue = Math.max(newValue, min);
                            }
                            break;
                    }
                    // Impact l'objet actif
                    input.value = newValue;
                    var inputAction = input.id.split("_")[1];
                    switch (inputAction) {
                        case "fontSize":
                            updateFontSize(newValue);
                            break;
                        case "linespacing":
                            updateAvanceStyle("lineHeight", newValue);
                            break;
                        case "charspacing":
                            updateAvanceStyle("charSpacing", newValue);
                            break;
                    }
                });

                if (DEVICE.layout === "compact") {
                    switch (button.getAttribute('name')) {
                        case 'up':
                            var iconName = "plus";
                            break;
                        case 'down':
                            var iconName = "minus";
                            break;
                    }

                    var iconName = "fa-" + iconName;
                    var icon = button.firstChild;
                    icon.style.fontSize = "14px";
                    icon.classList = ""; // reset
                    icon.classList.add('fa-solid');
                    icon.classList.add(iconName);
                }
            });
        })

    // OUVERTUR / FERMETURE PANNEAU EDITION
        const control_toolsPanel_visibility = Array.from(document.getElementsByClassName('control_toolsPanel_visibility'));
        control_toolsPanel_visibility.forEach(input => {

            input.addEventListener('input', (e) => {
                const parent = e.target.parentElement;
                const grandParent = e.target.parentElement.parentElement;
                const ico = parent.getElementsByTagName('span')[0].firstChild;

                // ouverture / fermeture
                if (input.checked) {
                    grandParent.classList.add('open');
                    grandParent.classList.remove('close');

                    ico.classList.add('fa-caret-down');
                    ico.classList.remove('fa-caret-right');
                } else {
                    grandParent.classList.add('close');
                    grandParent.classList.remove('open');

                    ico.classList.add('fa-caret-right');
                    ico.classList.remove('fa-caret-down');
                }
            })        
        });

    // POPOVERS 
        // --- Ouverture ---
        document.querySelectorAll(".openPopover").forEach(btn => {
            btn.addEventListener("click", e => {
                e.stopPropagation();

                const selector = btn.dataset.target;
                const target = document.querySelector(`#${selector}`);

                // Ferme les autres
                document.querySelectorAll(".popover").forEach(p => p.classList.add("hidden"));

                // Affiche le bon
                if (target) target.classList.toggle("hidden");
            });
        });

        // --- Empêcher la fermeture lorsque l'on clique dans le popover ---
        document.querySelectorAll(".popover").forEach(pop => {
            pop.addEventListener("click", e => {
                e.stopPropagation(); // <-- essentiel
            });
        });

        // --- Global click manager ---
        document.addEventListener("click", (e) => {
            const isPopover = e.target.closest(".popover");
            const isOpenPopoverBtn = e.target.closest(".openPopover");
            const isLayerControl = e.target.closest(".layerControl");

            // Si on clique dans un popover, un bouton popover ou un bouton calques → ne rien fermer
            if (isPopover || isOpenPopoverBtn || isLayerControl) {return;}

            // Sinon : tout fermer
            document.querySelectorAll(".popover").forEach(p => p.classList.add("hidden"));
        });
});
