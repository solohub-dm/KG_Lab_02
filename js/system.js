const canvasMain = getElement("#canvas-main");

class Pair {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    
    sub (pair) {
      this.x -= pair.x, 
      this.y -= pair.y
    }
    subO (coef) {
      return new Pair(
        this.x - coef, 
        this.y - coef
      );
    }
    mul (coef) {
      this.x *= coef, 
      this.y *= coef
    }
    div (coef) {
      this.x /= coef, 
      this.y /= coef
    }
    divO (coef) {
      return new Pair(
        this.x / coef, 
        this.y / coef
      );
    }
    mulO (coef) {
      return new Pair(
        this.x * coef, 
        this.y * coef
      );
    }
    add (pair) {
      this.x += pair.x, 
      this.y += pair.y
    }
    addO (pair) {
      return new Pair(
        this.x + pair.x, 
        this.y + pair.y
      );
    }
}

const canvasBuffer = document.createElement("canvas");
const сtxBuffer = canvasBuffer.getContext("2d");

let coefM = 2;
window.addEventListener("load", () => {


    sizeR = new Pair(
        canvasMain.offsetWidth, 
        canvasMain.offsetHeight
    );
    sizeM = sizeR.mulO(coefM);
    canvasMain.width = sizeM.x;
    canvasMain.height = sizeM.y;

    canvasBuffer.width = sizeM.x;
    canvasBuffer.height = sizeM.y;

    drawSystem();
});


let sizeR;
let sizeM;

let maxDivsStep = 29 * coefM;
let minDivsStep = 14 * coefM;

let curDivsStep = (maxDivsStep + minDivsStep) / 2;

let curDivsNumbr = 0;
let curDivsValue = 1;

let midl;
let lineOffset;
let dragOffset = new Pair(0, 0);
let startNum;

let colorGridLineNormal = "rgb(219, 219, 219)";
let colorGridLineDark   = " rgb(143, 143, 143)";
let colorLineSystem   = "rgb(104, 104, 104)";

const ctx = canvasMain?.getContext("2d");


let isDragging = false; 
let isSpacePressed = false;  
let startDragCoords;  
let deltaDragCoords = new Pair(0, 0);

document.addEventListener("keydown", (event) => {
  if (
    event.key === "c" || event.key === "C" || 
    event.key === "с" || event.key === "С"
  ) {
    dragOffset = new Pair(0, 0);
    drawSystem();
  }
});

document.addEventListener("keydown", (event) => {
  if (
    event.key === "r" || event.key === "R" || 
    event.key === "к" || event.key === "К"
  ) {
    dragOffset = new Pair(0, 0);  
    curDivsNumbr = 0;
    curDivsStep = (maxDivsStep + minDivsStep) / 2;
    curDivsValue = 1;
    drawSystem();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
      isSpacePressed = true;
      if (!isDragging)
        canvasMain.style.cursor = "grab";
      console.log("Space down");
  }
});
document.addEventListener("keyup", (event) => {
  if (event.code === "Space") {
      isSpacePressed = false;
      canvasMain.style.cursor = "default"; 
      console.log("Space up");
  }
});

canvasMain.addEventListener("mousedown", (event) => {
  if (event.button === 0 && isSpacePressed) {  
    canvasMain.style.cursor = "grabbing";        
      isDragging = true;
      startDragCoords = new Pair(
        event.clientX, 
        event.clientY
      );
  }
});

canvasMain.addEventListener("mousemove", (event) => {
  if (isDragging) {   
    deltaDragCoords = new Pair(
      event.clientX - startDragCoords.x,
      event.clientY - startDragCoords.y
    );
    deltaDragCoords.mul(coefM);
    dragOffset.add(deltaDragCoords);
    // console.log(`Зміщення: X=${deltaDragCoords.x}, Y=${deltaDragCoords.y}`);
    startDragCoords = new Pair(
      event.clientX, 
      event.clientY
    );
    drawSystem();
  }
});

canvasMain.addEventListener("mouseup", () => {
  isDragging = false;
});
canvasMain.addEventListener("mouseleave", () => {
  isDragging = false;
});

let curPos;

let isCtrlPressed = false;

document.addEventListener("keydown", (event) => {
  if (event.ctrlKey) {  
    console.log("ctrlKey down");
    isCtrlPressed = true;
  }
});

document.addEventListener("keyup", (event) => {
  if (event.code === "ControlLeft" || event.code === "ControlRight") {  
    console.log("ctrlKey up");
    isCtrlPressed = false;
  }
});

const minDivsValue = 0.01;
const maxDivsValue = 100; 
canvasMain.addEventListener("wheel", (event) => {
  event.preventDefault();

  const rect = canvasMain.getBoundingClientRect();

  if (event.deltaY < 0) {
    // Прокрутка вгору → курсор "zoomin"
    

    if (curDivsValue <= minDivsValue && curDivsStep === minDivsStep) return;
    canvasMain.style.cursor = "zoom-in";
    if (isCtrlPressed) {
      reSizeSystem(false, true);

    } else {

      curPos = new Pair(event.clientX - rect.left, event.clientY - rect.top);
      reSizeSystem(false);
    }

  } else {
    // Прокрутка вниз → курсор "zoomout"

    if (curDivsValue >= maxDivsValue && curDivsStep === maxDivsStep) return;
    canvasMain.style.cursor = "zoom-out";

    if (isCtrlPressed) {
      reSizeSystem(true, true);
      
    } else {

      curPos = new Pair(event.clientX - rect.left, event.clientY - rect.top);
      reSizeSystem(true);
    }

  }

  // Повертаємо стандартний курсор через 300 мс
  setTimeout(() => {
    canvasMain.style.cursor = "default";
  }, 350);
});


function reSizeSystem(isScaleDown, isCentred) {
  let stepDiff = maxDivsStep - minDivsStep;
  let stepDelta;
  
  let isThird = (curDivsNumbr - 1) % 3 === 0;
  if (isThird) 
    stepDelta = stepDiff / 15;
  else 
    stepDelta = stepDiff / 10;

   
  
  let oldDivsStep = curDivsStep;
  let mult = 1;
  if (isScaleDown) {
    if (curDivsStep <= minDivsStep) {
      curDivsStep = maxDivsStep;
      if (isThird)  {
        curDivsValue *= 2.5;
        mult = 2.5;
      } else {
        mult = 2;
        curDivsValue *= 2;
      }
      curDivsNumbr++;
    } else {
      curDivsStep -= stepDelta;
    }
      
  } else {
    
    if (curDivsStep >= maxDivsStep) {
      curDivsStep = minDivsStep;

      isThird = (curDivsNumbr + 1) % 3 === 0;
      if (isThird) 
        stepDelta = stepDiff / 15;
      else 
        stepDelta = stepDiff / 10;

      if (isThird) {
        curDivsValue /= 2.5;
        mult = 2.5;
      } else {
        curDivsValue /= 2;
        mult = 2;
      }
      curDivsNumbr--; 
    } else {
      curDivsStep += stepDelta;
    }
  }

  if (!isCentred) {
    let curDist = new Pair(
      (curPos.x * coefM - midlDrag.x),
      (curPos.y * coefM - midlDrag.y)
    );
    let curDiff = oldDivsStep - curDivsStep;
  
    let curOff = new Pair(
        (curDist.x / oldDivsStep) * curDiff,
        (curDist.y / oldDivsStep) * curDiff
    );
  
    dragOffset.add(curOff);
  
    if (mult !== 1) {
      let asd = midl.addO(dragOffset);
      let abs = new Pair(
        curPos.x * coefM - asd.x,
        curPos.y * coefM - asd.y
      );
  
      if (isScaleDown) {
        dragOffset.add(abs.mulO((mult - 1) / 2));
      }  else {
        dragOffset.sub(abs.mulO((mult - 1) ));
      }
    }
  }
  


  
// console.log("curDist:         ", roundAfterPoint(curDist.x, 2) + " " + roundAfterPoint(curDist.y, 2));
// console.log("curDiff:         ", curDiff);
// console.log("curOff:        ", roundAfterPoint(curOff.x, 2) + " " + roundAfterPoint(curOff.y, 2));
// console.log("dragOffset:", dragOffset);

  drawSystem();
}

function calcCurNum(midlDrag, midl) {
  let num;
  if (midlDrag < 0) 
    num =  - Math.floor(midlDrag / curDivsStep) % 4;
  else
    num = 4 -  Math.floor(midlDrag / curDivsStep) % 4;

  return num;
}

function calcCurOff(midlDrag) {
  let off;

  if (midlDrag < 0) 
    off = curDivsStep + midlDrag % curDivsStep;
  else 
    off = midlDrag % curDivsStep;


  return off;
}

let midlDrag;

function toCtxX() {
  return;
}



function drawSystem() {

  сtxBuffer.clearRect(0, 0, canvasBuffer.width, canvasBuffer.height);

  midl = new Pair(
    Math.floor(sizeM.x / 2),
    Math.floor(sizeM.y / 2)
  );  

  midlDrag = midl.addO(dragOffset);
  // console.log("midlDrag.x: " + midlDrag.x);
  // console.log("midlDrag.x: " + midlDrag.x);


  lineOffset = new Pair(
    calcCurOff(midlDrag.x),
    calcCurOff(midlDrag.y)
  );
  startNum = new Pair(
    calcCurNum(midlDrag.x, midl.x),
    calcCurNum(midlDrag.y, midl.y)
  );

  // console.log("lineOffset.x: " + lineOffset.x);
  // console.log("lineOffset.y: " + lineOffset.y);

  // console.log("startNum.x: " + startNum.x);
  // console.log("startNum.y: " + startNum.y);

  // Розмірна сітка
  сtxBuffer.lineWidth = 1;
  сtxBuffer.strokeStyle = colorGridLineNormal;

  for (
    let num = startNum.x, cur = lineOffset.x; 
    cur < sizeM.x; 
    (num++) % 4, cur += curDivsStep
  ) {
    let isDark = num % 4 === 0;
    сtxBuffer.strokeStyle = isDark ? colorGridLineDark : colorGridLineNormal;

    сtxBuffer.beginPath();
    сtxBuffer.moveTo(cur, 0);
    сtxBuffer.lineTo(cur, sizeM.y);
    сtxBuffer.stroke();
  }
  
  for (
    let num = startNum.y, cur = lineOffset.y; 
    cur < sizeM.y; 
    (num++) % 4, cur += curDivsStep
  ) {
    let isDark = num % 4 === 0;
    сtxBuffer.strokeStyle = isDark ? colorGridLineDark : colorGridLineNormal;

    сtxBuffer.beginPath();
    сtxBuffer.moveTo(0, cur);
    сtxBuffer.lineTo(sizeM.x, cur);
    сtxBuffer.stroke();
  }
  
  // Осі координат
  сtxBuffer.strokeStyle = colorLineSystem;
  сtxBuffer.lineWidth = 4;
  сtxBuffer.beginPath();

  let isLineOnSystem = new Pair (
    Math.abs(deltaDragCoords.x) < sizeM.x,
    Math.abs(deltaDragCoords.y) < sizeM.y
  );

  if (isLineOnSystem.x) {
    сtxBuffer.moveTo(midlDrag.x, 0);
    сtxBuffer.lineTo(midlDrag.x, sizeM.y);
  }

  if (isLineOnSystem.y) {
    сtxBuffer.moveTo(0, midlDrag.y);
    сtxBuffer.lineTo(sizeM.x, midlDrag.y);
  }

  сtxBuffer.stroke();

  // Точка на перетині осей
  if (isLineOnSystem.x && isLineOnSystem.y) {
    сtxBuffer.beginPath();
    сtxBuffer.arc(midlDrag.x, midlDrag .y, 5, 0, Math.PI * 2);
    сtxBuffer.fill();
  }


  // // Стрілки осей
  // let shrt = 7;
  // let long = 27;
  
  // ctx.beginPath();
  // ctx.moveTo(midl.x - shrt, long);
  // ctx.lineTo(midl.x, 0);
  // ctx.lineTo(midl.x + shrt, long);
  // ctx.moveTo(sizeM.x - long, midl.y - shrt);
  // ctx.lineTo(sizeM.x, midl.y);
  // ctx.lineTo(sizeM.x - long, midl.y + shrt);
  // ctx.fill();

  // Підпис поділок додатнії осей
  let cnt = Math.floor(-curDivsNumbr / 3) + 1; 
  let cntNum = Math.pow(10, cnt);
  let cnt2 = Math.floor((-curDivsNumbr - 1) / 3) + 1; 
  if (curDivsNumbr >= 0)
    cnt2 = 0; 

  // console.log("curDivsNumbr: " + curDivsNumbr);

  сtxBuffer.textAlign = "center";
  сtxBuffer.font = "28px Arial";

  if (midlDrag.y < 39 * coefM ) {
    сtxBuffer.fillText("X", sizeM.x  - 12 * coefM, 0 + 32   * coefM);
  } else if (midlDrag.y > sizeM.y  ) {
    сtxBuffer.fillText("X", sizeM.x - 12 * coefM, sizeM .y - 6 * coefM );
  } else 
    сtxBuffer.fillText("X", sizeM.x - 12 * coefM , midlDrag.y - 6 * coefM);
  
  if (midlDrag.x < 0 ) {
    сtxBuffer.fillText("Y", 0 + 10  * coefM, 17 * coefM );
  } else if (midlDrag.x > sizeM.x  - 39   * coefM) {
    сtxBuffer.fillText("Y", sizeM.x - 28 * coefM, 17  * coefM);
  } else  
  сtxBuffer.fillText("Y ", midlDrag.x + 12 * coefM, 17 * coefM);

  сtxBuffer.font = "22px Arial";
  сtxBuffer.textAlign = "center";

  for (
    let cur = lineOffset.x + (4 - startNum.x) * curDivsStep - curDivsStep * 4, num = - Math.floor((midlDrag.x + curDivsStep * 4) / (4 * curDivsStep)) * curDivsValue;
    cur < sizeM.x + curDivsStep * 4;
    cur += curDivsStep * 4, num += curDivsValue
  ) {
    if (cur === midlDrag.x) continue; 
    if (midlDrag.y < 0 && cur <  30 * coefM) continue; 
    if (midlDrag.y < 0 && cur  > sizeM.x - 45  * coefM) continue; 
    if (midlDrag.y > sizeM.y && cur > sizeM.x - 30   * coefM) continue; 

    
    if (midlDrag.y < 0 ) {
      сtxBuffer.fillText(num.toFixed(cnt2), cur, 0 + 17  * coefM);
    } else if (midlDrag.y > sizeM.y - 23 * coefM ) {
      сtxBuffer.fillText(num.toFixed(cnt2), cur, sizeM.y - 6 * coefM);
    } else 
    сtxBuffer.fillText(num.toFixed(cnt2), cur, midlDrag.y + 17 * coefM);
  }

  

  for (
    let cur = lineOffset.y + (4 - startNum.y ) * curDivsStep - curDivsStep * 4 , 
    num = Math.floor((midlDrag.y + curDivsStep * 4) / (4 * curDivsStep)) * curDivsValue,
    width = Math.max(сtxBuffer.measureText(roundAfterPoint(num, cntNum)).width, сtxBuffer.measureText(roundAfterPoint(num +  curDivsValue, cntNum)).width);

    cur < sizeM.y + curDivsStep * 4 ;
    cur += curDivsStep * 4, num -= curDivsValue
  ) {
    if (cur === midlDrag.y) continue; 
    if (midlDrag.x < 27 * coefM && cur < 33 * coefM) continue; 
    if (midlDrag.x > sizeM.x && cur < 45 * coefM) continue; 
    if (midlDrag.x > sizeM.x && cur > sizeM.y - 27  * coefM) continue;  
     
    сtxBuffer.textAlign = "right";

    if (midlDrag.x < width + 16   * coefM) {
      сtxBuffer.textAlign = "left";
      сtxBuffer.fillText(num.toFixed(cnt2), 0 + 8   * coefM , cur + 3 * coefM);
    } else if (midlDrag.x > sizeM.x) {
      сtxBuffer.fillText(num.toFixed(cnt2), sizeM.x - 8 * coefM, cur + 3 * coefM);
    } else  
    сtxBuffer.fillText(num.toFixed(cnt2), midlDrag.x - 8  * coefM, cur + 3 * coefM); 

  } 

  сtxBuffer.strokeStyle = colorLineSystem;
  сtxBuffer.lineWidth = 4;

  let markLen = 3 * coefM;
  let markS;
  let markE;

  сtxBuffer.beginPath();
  for (
    let cur = lineOffset.x + (4 - startNum.x) * curDivsStep - 4 * curDivsStep, num = - Math.floor(midlDrag .x / (4 * curDivsStep)) * curDivsValue;
    cur < sizeM.x + curDivsStep;
    cur += curDivsStep * 4, num += curDivsValue
  ) {
    if (cur === midlDrag.x) continue; 
    if (midlDrag.y < 0 && cur <  30 * coefM) continue; 
    if (midlDrag.y < 0 && cur > sizeM.x - 45  * coefM) continue; 
    if (midlDrag.y > sizeM.y && cur > sizeM.x - 30   * coefM) continue; 
    
    if (midlDrag.y < 0 ) {
      markS = 0;
      markE = markLen;
    } else if (midlDrag.y > sizeM.y) {
      markS = sizeM.y - markLen;
      markE = sizeM.y;
    } else {
      markS = midlDrag.y - markLen;
      markE = midlDrag.y + markLen;
    }

    сtxBuffer.moveTo(cur, markS);
    сtxBuffer.lineTo(cur, markE); 
  }
  сtxBuffer.stroke();

  сtxBuffer.beginPath();
  for (
    let cur = lineOffset.y + (4 - startNum.y ) * curDivsStep - curDivsStep * 4, num = Math.floor(midlDrag .y / (4 * curDivsStep)) * curDivsValue;
    cur < sizeM.y + curDivsStep;
    cur += curDivsStep * 4, num -= curDivsValue
  ) {
    if (cur === midlDrag.y) continue; 
    if (midlDrag.x < 27 * coefM && cur < 33 * coefM) continue; 
    if (midlDrag.x > sizeM.x && cur < 45 * coefM) continue; 
    if (midlDrag.x > sizeM.x && cur > sizeM.y - 27  * coefM) continue;  

    if (midlDrag.x < 0) {
      markS = 0;
      markE = markLen;
    } else if (midlDrag.x > sizeM.x) {
      markS = sizeM.x - markLen;
      markE = sizeM.x;
    } else {
      markS = midlDrag.x - markLen;
      markE = midlDrag.x + markLen;
    }

    сtxBuffer.moveTo(markS, cur);
    сtxBuffer.lineTo(markE, cur); 
  } 
  сtxBuffer.stroke();  

  ctx.clearRect(0, 0, canvasMain.width, canvasMain.height);
  ctx.drawImage(canvasBuffer, 0, 0);
}



function roundAfterPoint(num, cntNum) {
  if (curDivsNumbr < 0) 
    return Math.round(num * cntNum) / cntNum;
  else 
    return Math.floor(num);
  

}