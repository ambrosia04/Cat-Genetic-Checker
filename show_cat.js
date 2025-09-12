// Wait for the entire page to load before running the script
document.addEventListener('DOMContentLoaded', () => {

    // Get references to the button that triggers the cat drawing and the container for the image
    const checkButton = document.getElementById('checkBtn');
    const catContainer = document.getElementById('catImageContainer');
    const imageFolderPath = 'cat_image/'; // The folder where you will store your images

    // When the "Check cat plausibility" button is clicked, draw the cat
    checkButton.addEventListener('click', drawCat);

    function drawCat() {
        // --- 1. Get all genetic inputs from the expert panel ---
        const inputs = {
            sex: document.getElementById('sex').value,
            redGen: document.getElementById('redGen').value,
            Bgen: document.getElementById('Bgen').value,
            Dgen: document.getElementById('Dgen').value,
            Agen: document.getElementById('Agen').value,
            patternGen: document.getElementById('patternGen').value,
            tickedGen: document.getElementById('tickedGen').value,
            Igen: document.getElementById('Igen').value,
            Cgen: document.getElementById('Cgen').value,
            Sgen: document.getElementById('Sgen').value,
            Egen: document.getElementById('Egen').value,
            Wbgen: document.getElementById('Wbgen').value,
            Kgen: document.getElementById('Kgen').value,
            eyeColor: document.getElementById('expertEye').value
        };

        // --- 2. Determine which image layers to show ---
        const layers = [];
        const isAgouti = inputs.Agen !== 'a/a';
        const isDilute = inputs.Dgen === 'd/d';
        const isSilver = inputs.Igen !== 'i/i';
        const isRed = inputs.redGen.includes('XO');
        const isTortie = inputs.redGen === 'XO/Xo';
        const isPointed = inputs.Cgen === 'cs/cs';
        const isMink = inputs.Cgen === 'cs/cb';
        const isSepia = inputs.Cgen === 'cb/cb';
        const hasWhiteSpotting = inputs.Sgen === 'S/s' || inputs.Sgen === 'S/S';

        // Helper booleans for conditions that prevent color expression
        const isDominantWhite = inputs.Sgen === 'W/--';
        const isAlbino = inputs.Cgen === 'c/c';
        const hasColorHidden = isDominantWhite || isAlbino;
        
        // ** A. Base Color Layer **
        if (isDominantWhite || isAlbino) {
            layers.push({ src: 'base_white.png' });
        } 
        else {
             if (inputs.Egen === 'e/e' && !isRed) {
                layers.push({ src: (isDilute ? 'base_amber_dilute.png' : 'base_amber.png') });
            } else if (inputs.Bgen.includes('B')) {
                layers.push({ src: (isDilute ? 'base_blue.png' : 'base_black.png') });
            } else if (inputs.Bgen === 'bl/bl') {
                layers.push({ src: (isDilute ? 'base_fawn.png' : 'base_cinnamon.png') });
            } else if (inputs.Bgen.includes('b')) {
                layers.push({ src: (isDilute ? 'base_lilac.png' : 'base_chocolate.png') });
            }
        }
        
        // ** B. Red / Tortie / Calico Overlay Layer **
        if (!hasColorHidden) {
            if (isTortie) {
                if (isPointed && hasWhiteSpotting) {
                    layers.push({ src: 'overlay_calicopoint.png' });
                } else if (isAgouti && hasWhiteSpotting) {
                    layers.push({ src: 'overlay_caliby.png' });
                } else if (hasWhiteSpotting) {
                    layers.push({ src: 'overlay_calico.png' });
                } else if (isAgouti) {
                    layers.push({ src: 'overlay_torbie.png' });
                } else {
                    layers.push({ src: 'overlay_tortie.png' });
                }
            } else if (isRed) {
                layers.push({ src: (isDilute ? 'overlay_cream.png' : 'overlay_red.png') });
            }
        }

        // ** C. Colorpoint Overlay Layer **
        if (isPointed && !isTortie && !hasColorHidden) {
            layers.push({ src: 'overlay_point.png' });
        }
        if (isMink && !isTortie && !hasColorHidden) {
            layers.push({ src: 'overlay_mink.png' });
        }
        if (isSepia && !isTortie && !hasColorHidden) {
            layers.push({ src: 'overlay_sepia.png' });
        }
        
        // ** D. Wideband (Golden) Overlay Layer **
        // MODIFIED: This check no longer excludes silver cats.
        if (inputs.Wbgen === 'wb/wb' && isAgouti && !hasColorHidden) {
            layers.push({ src: 'overlay_golden.png' });
        }
        
        // ** E. Tabby Pattern Layer (runs AFTER golden) **
        if ((isAgouti || isRed) && !isTortie && !hasColorHidden) {
            let patternPrefix = isSilver ? 'pattern_silver_' : 'pattern_';
            let tabbyLayer = { src: '', opacity: 1.0 };

            if (inputs.Wbgen === 'Wb/wb') {
                tabbyLayer.opacity = 0.5;
            } else if (inputs.Wbgen === 'Wb/Wb') {
                tabbyLayer.opacity = 0.25;
            }

            if (inputs.tickedGen !== 'ta/ta') {
                tabbyLayer.src = patternPrefix + 'ticked.png';
            } else if (inputs.patternGen.includes('mc')) {
                tabbyLayer.src = patternPrefix + 'classic.png';
            } else if (inputs.patternGen.includes('Sp')) {
                tabbyLayer.src = patternPrefix + 'spotted.png';
            } else {
                tabbyLayer.src = patternPrefix + 'mackerel.png';
            }
            layers.push(tabbyLayer);
        }
        
        // ** F. Karpati (Roan) Overlay Layer **
        if (inputs.Kgen === 'K/k' && !hasColorHidden) {
            layers.push({ src: 'overlay_karpati.png' });
        }

        // ** G. White Spotting Layer **
        if (hasWhiteSpotting && !isTortie) {
            if (inputs.Sgen === 'S/s') {
                layers.push({ src: 'pattern_bicolor.png' }); 
            } else if (inputs.Sgen === 'S/S') {
                layers.push({ src: 'white_high.png' });
            }
        }

        // ** H. Eye Color Layer **
        let eyeLayerSrc = '';
        if (inputs.eyeColor.includes('Odd Eyes')) {
            const mapColorToFilename = (colorValue) => {
                if (!colorValue || typeof colorValue !== 'string') return 'Green'; 
                if (colorValue.includes('Blue')) return 'Blue';
                if (colorValue.includes('Green')) return 'Green';
                if (colorValue.includes('Yellow')) return 'Yellow';
                if (colorValue.includes('Copper')) return 'Copper';
                return 'Green';
            };
            const leftEyeValue = document.getElementById('leftEye').value;
            const rightEyeValue = document.getElementById('rightEye').value;
            const leftColor = mapColorToFilename(leftEyeValue);
            const rightColor = mapColorToFilename(rightEyeValue);
            
            if (leftColor === rightColor) {
                eyeLayerSrc = `eyes/eyes_${leftColor.toLowerCase()}.png`;
            } else {
                eyeLayerSrc = `eyes/${leftColor}L${rightColor}R.png`;
            }
        } else {
            if (inputs.eyeColor.includes('Blue')) eyeLayerSrc = 'eyes/eyes_blue.png';
            else if (inputs.eyeColor.includes('Aqua')) eyeLayerSrc = 'eyes/eyes_aqua.png';
            else if (inputs.eyeColor.includes('Green')) eyeLayerSrc = 'eyes/eyes_green.png';
            else if (inputs.eyeColor.includes('Golden') || inputs.eyeColor.includes('Yellow')) eyeLayerSrc = 'eyes/eyes_yellow.png';
            else if (inputs.eyeColor.includes('Amber') || inputs.eyeColor.includes('Copper')) eyeLayerSrc = 'eyes/eyes_copper.png';
            else if (inputs.eyeColor.includes('Hazel')) eyeLayerSrc = 'eyes/eyes_hazel.png';
            else if (inputs.eyeColor.includes('Orange')) eyeLayerSrc = 'eyes/eyes_orange.png';
            else if (inputs.eyeColor.includes('Pink')) eyeLayerSrc = 'eyes/eyes_pink.png';
            else if (inputs.eyeColor.includes('Lilac')) eyeLayerSrc = 'eyes/eyes_lilac.png';
        }
        if (eyeLayerSrc) layers.push({ src: eyeLayerSrc });

        // ** I. Outline Layer **
        layers.push({ src: 'outline.png' });
        
        // --- 3. Render the cat image ---
        catContainer.innerHTML = '';
        layers.forEach(layer => {
            const img = document.createElement('img');
            img.src = imageFolderPath + layer.src;
            img.style.opacity = layer.opacity || 1.0; 
            img.className = 'cat-image-layer';
            img.alt = `Cat image layer: ${layer.src}`;
            img.onerror = () => { 
                console.warn(`Image not found: ${img.src}. You may need to create this file.`);
                img.style.display = 'none';
            };
            catContainer.appendChild(img);
        });
    }
});