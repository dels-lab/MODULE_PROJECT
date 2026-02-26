// =============================
// FONCTION
// =============================
  function updateFontSize(value) {
      if (!activeObj) return;
      const policeSize = Number(value);
      if (isNaN(policeSize)) return;

      if(selectionIsActive(watchCursor(activeObj))) { // Application sur une sélection active
            var currentSelect = watchCursor(activeObj);
            setStyleOnSelection("fontSize", policeSize, currentSelect)
        } else { // Application sur l'objet global
            controlSelect(activeObj, "fontSize", policeSize)
            //setStyle("fontSize", policeSize);
        }
  }

  function synchroStyleSize(activeObj) {
    if (!activeObj || !activeObj.fontSize) {
      return;
    }

    if (DEVICE.layout === "compact") {
      inputSize.value = activeObj.fontSize;
      rangeSize.value = activeObj.fontSize;
    }

    if (DEVICE.layout === "large") {
      fontSize.value = activeObj.fontSize;
    }
  }

// =============================
// CONTROLE
// =============================
  // Control mobile
  if (DEVICE.layout === "compact") {
    const rangeSize = document.getElementById('rangeSize');
    const inputSize = document.getElementById('inputSize');

    // Initialisation : synchroniser les deux à la valeur du slider
    inputSize.value = rangeSize.value;

    // Quand on déplace le slider ...
    rangeSize.addEventListener('input', (e) => {
      inputSize.value = rangeSize.value;
      updateFontSize(e.target.value);
    });

    // Quand on modifie le champ numérique ...
    inputSize.addEventListener('input', (e) => {
      let value = inputSize.value;
      if (isNaN(value)) return;
      value = setLimitRange(value, e.target.min, e.target.max)
      rangeSize.value = value;
      updateFontSize(e.target.value);
    });
  }

  // Control Desktop
  if (DEVICE.layout === "large") {
      var fontSize = document.getElementById('txt_fontSize');
      fontSize.addEventListener('input', (e) => {
          updateFontSize(e.target.value);
          synchroStyleSize(activeObj);
      })
  }

