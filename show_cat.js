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

        // Helper booleans for conditions that prevent color expression
        const isDominantWhite = inputs.Sgen === 'W/--';
        const isAlbino = inputs.Cgen === 'c/c';
        const hasColorHidden = isDominantWhite || isAlbino;
        
        // ** A. Base Color Layer **
        // Dominant White masks everything else, so it's the first priority.
        if (inputs.Sgen === 'W/--') {
            layers.push('base_white.png');
        } 
        // Colorpoint has its own special base.
        else if (inputs.Cgen === 'cs/cs' || inputs.Cgen === 'cs/cb') {
            layers.push('base_point.png');
        }
        // Otherwise, determine the base eumelanin color.
        else {
             if (inputs.Egen === 'e/e' && !isRed) {
                layers.push(isDilute ? 'base_amber_dilute.png' : 'base_amber.png');
            } else if (inputs.Bgen.includes('B')) { // Black series
                layers.push(isDilute ? 'base_blue.png' : 'base_black.png');
            } else if (inputs.Bgen.includes('b')) { // Chocolate series
                layers.push(isDilute ? 'base_lilac.png' : 'base_chocolate.png');
            } else if (inputs.Bgen.includes('bl')) { // Cinnamon series
                layers.push(isDilute ? 'base_fawn.png' : 'base_cinnamon.png');
            }
        }
        
        // ** B. Red / Tortie Overlay Layer **
        // If the cat is red or tortie, we add an overlay. This goes on top of the base eumelanin color.
        if (inputs.Sgen !== 'W/--') { // Don't add red if the cat is dominant white
            if(isTortie) {
                layers.push('overlay_tortie.png');
            } else if (isRed && !isTortie) {
                // If dilute, use cream overlay, otherwise use red
                layers.push(isDilute ? 'overlay_cream.png' : 'overlay_red.png');
            }
        }

        // ** C. Tabby Pattern Layer **
        // The pattern is only visible on Agouti cats (or red cats, which are always tabby).
        if ((isAgouti || isRed) && inputs.Sgen !== 'W/--') {
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
        
        // ** D. Wideband (Golden) Overlay Layer **
        // Golden is only visible on Agouti cats and modifies the tabby pattern.
        if (inputs.Wbgen === 'wb/wb' && isAgouti && !hasColorHidden) {
            layers.push('overlay_golden.png');
        }
        
        // ** E. Karpati (Roan) Overlay Layer **
        // Karpati adds a roaning effect over the existing coat color and pattern.
        if (inputs.Kgen === 'K/k' && !hasColorHidden) {
            layers.push('overlay_karpati.png');
        }

        // ** F. White Spotting Layer **
        if (inputs.Sgen === 'S/s') {
            layers.push('white_low.png');
        } else if (inputs.Sgen === 'S/S') {
            layers.push('white_high.png');
        }

        // ** E. Eye Color Layer **
        // The eye color is determined by a few genes, but we can use the user's direct selection.
        if (inputs.eyeColor.includes('Blue')) {
            layers.push('eyes_blue.png');
        } else if (inputs.eyeColor.includes('Aqua')) {
            layers.push('eyes_aqua.png');
        } else if (inputs.eyeColor.includes('Green')) {
            layers.push('eyes_green.png');
        } else if (inputs.eyeColor.includes('Golden') || inputs.eyeColor.includes('Yellow')) { //Done
            layers.push('eyes_yellow.png');
        } else if (inputs.eyeColor.includes('Amber') || inputs.eyeColor.includes('Copper')) {
            layers.push('eyes_copper.png');
        } else if (inputs.eyeColor.includes('Hazel')) { //Done
            layers.push('eyes_hazel.png');
        } else if (inputs.eyeColor.includes('Orange')) { //Done
            layers.push('eyes_orange.png');
        } else if (inputs.eyeColor.includes('Lilac/Pink (Albino)')) {
            layers.push('eyes_lilac.png');
        }
        // Odd eyes can be more complex, for now we can default to one color or handle it later.
        //if (inputs.eyeColor.includes('Odd Eyes')) {
        //    layers.push('eyes_odd_blue_green.png'); // Example for one combination
        //}

        // ** F. Outline Layer **
        // The outline always goes on top of everything else.
        layers.push('outline.png');
        
        // --- 3. Render the cat image ---
        // Clear any previous images
        catContainer.innerHTML = '';

        // Create and add each image layer to the container
        layers.forEach(imageFile => {
            const img = document.createElement('img');
            img.src = imageFolderPath + imageFile;
            img.className = 'cat-image-layer'; // Apply the CSS class for stacking
            img.alt = `Cat image layer: ${imageFile}`; // For accessibility
            
            // Add an error handler in case an image is missing
            img.onerror = () => { 
                console.warn(`Image not found: ${img.src}. You may need to create this file.`);
                img.style.display = 'none'; // Hide the broken image icon
            };

            catContainer.appendChild(img);
        });
    }
});