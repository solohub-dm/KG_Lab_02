



const colorInputs = document.querySelectorAll('input[type="color"]');

let colors;
function getColors() {
    return {
        curve: colorInputs[0].value,
        basePoint: colorInputs[1].value,
        controlPoint: colorInputs[2].value,
        tangentLine: colorInputs[3].value,
        nonTangentLine: colorInputs[4].value
    }
}

windows.pallete.controlButton.addEventListener("click", resetColors);

function resetColors() {
    console.log("resetColors done");
    colorInputs[0].value = "#000000"; 
    colorInputs[1].value = "#000000";
    colorInputs[2].value = "#000000";
    colorInputs[3].value = "#000000";
    colorInputs[4].value = "#000000"; 
}