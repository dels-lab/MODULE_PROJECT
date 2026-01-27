const selectVariable = document.getElementById('selectVariable');
const addVariable = document.getElementById('addVariable');

// Initialisation de la variable à ajouter
addVariable.dataset.value = selectVariable.options[0].value;

// Mise à jour lors du changement de sélection
selectVariable.addEventListener('change', (e) => {
    addVariable.dataset.value = e.target.value;
})


// Gestion du bouton
addVariable.addEventListener('click', (e) => {
    insertVariable(e.target.dataset.value);
});

// Fonction pour insérer la variable et rafraîchir immédiatement
function insertVariable(variable) {
    if (!variable || !activeObj) return;
    
    var cursorPosition = watchCursor(activeObj);  
    if (!cursorPosition || cursorPosition.start === undefined) return; 

    var varFormated = "{{" + variable + "}}"
    var text = activeObj._text; 
    var varArray = varFormated.split('');  // Convertir la variable en tableau de caractères

    if (cursorPosition.start > 0) {
        var firstPart = [];
        var lastPart = [];

        for (let i = 0; i < text.length; i++) {
            if(i < cursorPosition.start) {
                firstPart.push(text[i]);
            }
        }

        for (let i = 0; i < text.length; i++) {
            if(i >= cursorPosition.start) {
                lastPart.push(text[i]);
            }
        }

        activeObj._text = firstPart.concat(varArray, lastPart);
        activeObj.text = activeObj._text.join("");

    } else {
        activeObj._text = text.concat(varArray);
        activeObj.text = activeObj._text.join("");
    }

    activeObj._textLines = null; // Vide le cache des lignes calculées
    activeObj._unwrappedTextLines = null; // Vide le cache du texte brut
    activeObj.initDimensions(); // Recalcule totalement le texte interne
    activeObj.dirty = true; // Forcer le rerendu
    activeCanvas.requestRenderAll();
}


