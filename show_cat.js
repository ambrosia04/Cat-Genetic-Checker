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
        const isPointed = inputs.Cgen === 'cs/cs' || inputs.Cgen === 'cs/cb';
        const hasWhiteSpotting = inputs.Sgen === 'S/s' || inputs.Sgen === 'S/S';

        // Helper booleans for conditions that prevent color expression
        const isDominantWhite = inputs.Sgen === 'W/--';
        const isAlbino = inputs.Cgen === 'c/c';
        const hasColorHidden = isDominantWhite || isAlbino;
        
        // ** A. Base Color Layer **
        if (isDominantWhite || isAlbino) {
            layers.push('base_white.png');
        } 
        else {
             if (inputs.Egen === 'e/e' && !isRed) {
                layers.push(isDilute ? 'base_amber_dilute.png' : 'base_amber.png');
            } else if (inputs.Bgen.includes('B')) {
                layers.push(isDilute ? 'base_blue.png' : 'base_black.png');
            } else if (inputs.Bgen === 'bl/bl') {
                layers.push(isDilute ? 'base_fawn.png' : 'base_cinnamon.png');
            } else if (inputs.Bgen.includes('b')) {
                layers.push(isDilute ? 'base_lilac.png' : 'base_chocolate.png');
            }
        }
        
        // ** B. Red / Tortie / Calico Overlay Layer (UPGRADED LOGIC) **
        if (!hasColorHidden) {
            if (isTortie) {
                // Check for the most complex combinations first
                if (isPointed && hasWhiteSpotting) {
                    layers.push('overlay_calicopoint.png');
                } else if (isAgouti && hasWhiteSpotting) {
                    layers.push('overlay_caliby.png'); // Tabby Calico
                } else if (hasWhiteSpotting) {
                    layers.push('overlay_calico.png'); // Standard Calico
                } else if (isAgouti) {
                    layers.push('overlay_torbie.png'); // Tabby Tortie
                } else {
                    layers.push('overlay_tortie.png'); // Standard Tortie
                }
            } else if (isRed) {
                // This handles non-tortie red cats
                layers.push(isDilute ? 'overlay_cream.png' : 'overlay_red.png');
            }
        }

        // ** C. Tabby Pattern Layer **
        // This still runs for red/cream cats, but the tortie-tabby patterns are now handled above.
        if ((isAgouti || isRed) && !isTortie && !hasColorHidden) {
            let patternPrefix = isSilver ? 'pattern_silver_' : 'pattern_';

            if (inputs.tickedGen !== 'ta/ta') {
                layers.push(patternPrefix + 'ticked.png');
            } else if (inputs.patternGen.includes('mc')) {
                layers.push(patternPrefix + 'classic.png');
            } else if (inputs.patternGen.includes('Sp')) {
                layers.push(patternPrefix + 'spotted.png');
            } else { // Mackerel is the default tabby
                layers.push(patternPrefix + 'mackerel.png');
            }
        }

        // ** D. Colorpoint Overlay Layer **
        // This only runs for NON-TORTIE pointed cats. Calico points are handled by their own special overlay.
        if (isPointed && !isTortie && !hasColorHidden) {
            layers.push('overlay_point.png');
        }
        
        // ** E. Wideband (Golden) Overlay Layer **
        if (inputs.Wbgen === 'wb/wb' && isAgouti && !hasColorHidden) {
            layers.push('overlay_golden.png');
        }
        
        // ** F. Karpati (Roan) Overlay Layer **
        if (inputs.Kgen === 'K/k' && !hasColorHidden) {
            layers.push('overlay_karpati.png');
        }

        // ** G. White Spotting Layer **
        // This logic is now simpler: it only adds white if the cat has white spotting AND is NOT a tortie/calico,
        // because the calico overlays already include their own white patches.
        if (hasWhiteSpotting && !isTortie) {
            if (inputs.Sgen === 'S/s') {
                layers.push('pattern_bicolor.png'); 
            } else if (inputs.Sgen === 'S/S') {
                layers.push('white_high.png');
            }
        }

        // ** H. Eye Color Layer **
if (inputs.eyeColor.includes('Odd Eyes')) {
            // Helper function to get a clean color name from the dropdown value
            const mapColorToFilename = (colorValue) => {
                // SAFETY CHECK: If the value is undefined or not a string, return a default.
                if (!colorValue || typeof colorValue !== 'string') return 'Green'; 
                
                if (colorValue.includes('Blue')) return 'Blue';
                if (colorValue.includes('Green')) return 'Green';
                if (colorValue.includes('Yellow')) return 'Yellow';
                if (colorValue.includes('Copper')) return 'Copper';
                return 'Green'; // Default fallback
            };
            
            // Read the left and right eye values HERE, only when needed.
            const leftEyeValue = document.getElementById('leftEye').value;
            const rightEyeValue = document.getElementById('rightEye').value;

            const leftColor = mapColorToFilename(leftEyeValue);
            const rightColor = mapColorToFilename(rightEyeValue);
            
            // Construct the filename dynamically
            const eyeImageFile = `eyes/${leftColor}L${rightColor}R.png`;
            layers.push(eyeImageFile);

            //Same color selected for both eyes
            if (leftColor === rightColor) {
                // If they are the same, use the standard single-color eye image.
                const eyeImageFile = `eyes/eyes_${leftColor.toLowerCase()}.png`;
                layers.push(eyeImageFile);
            } else {
                // If they are different, construct the dynamic odd-eye filename.
                const eyeImageFile = `eyes/${leftColor}L${rightColor}R.png`;
                layers.push(eyeImageFile);
            }

        } else { // Fallback to original logic for single-colored eyes
            if (inputs.eyeColor.includes('Blue')) {
                layers.push('eyes/eyes_blue.png');
            } else if (inputs.eyeColor.includes('Aqua')) {
                layers.push('eyes/eyes_aqua.png');
            } else if (inputs.eyeColor.includes('Green')) {
                layers.push('eyes/eyes_green.png');
            } else if (inputs.eyeColor.includes('Golden') || inputs.eyeColor.includes('Yellow')) {
                layers.push('eyes/eyes_yellow.png');
            } else if (inputs.eyeColor.includes('Amber') || inputs.eyeColor.includes('Copper')) {
                layers.push('eyes/eyes_copper.png');
            } else if (inputs.eyeColor.includes('Hazel')) {
                layers.push('eyes/eyes_hazel.png');
            } else if (inputs.eyeColor.includes('Orange')) {
                layers.push('eyes/eyes_orange.png');
            } else if (inputs.eyeColor.includes('Pink')) {
                 layers.push('eyes/eyes_pink.png');
            } else if (inputs.eyeColor.includes('Lilac')) {
                 layers.push('eyes/eyes_lilac.png');
            }
        }

        // ** I. Outline Layer **
        layers.push('outline.png');
        
        // --- 3. Render the cat image ---
        catContainer.innerHTML = '';
        layers.forEach(imageFile => {
            const img = document.createElement('img');
            img.src = imageFolderPath + imageFile;
            img.className = 'cat-image-layer';
            img.alt = `Cat image layer: ${imageFile}`;
            img.onerror = () => { 
                console.warn(`Image not found: ${img.src}. You may need to create this file.`);
                img.style.display = 'none';
            };
            catContainer.appendChild(img);
        });
    }
});