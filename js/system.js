const canvasMain = getElement("#canvas-main");
const canvasMainCurve = getElement("#canvas-main-curve");



class Pair {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    
    roundAfterPoint(cnt) {
      let num = Math.pow(10, cnt);
      this.x = Math.floor(this.x * num) / num;
      this.y = Math.floor(this.y * num) / num;
    }

    vecRev(pair) {
      let vec = pair.subPO(this);
      let vecRev = vec.mulO(-1);
      return vecRev;
    }
    sub (pair) {
      this.x -= pair.x, 
      this.y -= pair.y
    }
    subPO (pair) {
      return new Pair(
        this.x - pair.x, 
        this.y - pair.y
      );
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

    rotate90() {
      return new Pair(
        -this.y,
        this.x
      )
    }

    cpy() {
      return new Pair(
        this.x, 
        this.y
      );
    }
    len() {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    dist(point) {
      let diff = point.subPO(this);
      return diff.len();
    }

    posToCoords() {
      return new Pair(
        (this.x - midlDrag.x) / (curDivsStep * 4) * curDivsValue,
        (midlDrag.y - this.y) / (curDivsStep * 4) * curDivsValue
      )
    }
    coordsToPos() {
      let posX = midlDrag.x + (this.x * (curDivsStep * 4)) / curDivsValue;
      let posY = midlDrag.y - (this.y * (curDivsStep * 4)) / curDivsValue;

      return new Pair(posX, posY);
  }
}

const canvasBuffer = document.createElement("canvas");
const сtxBuffer = canvasBuffer.getContext("2d");

let coefM = 2;

const resizeObserver = new ResizeObserver(() => {
  if (!currentProject) return;
  updateCanvasSize();
  drawSystem(canvasMain, ctx);
  drawCurve();
});

resizeObserver.observe(canvasMain);



const errorMessagePoint = getElement("#error-message-point");
const calcPointInput = getElement("#step-x-size-point");

let isErrorPoint = false;
let prevValuePoint = 0.1;
calcPointInput.value = prevValuePoint;

calcPointInput.addEventListener("input", () => {
    let value = calcPointInput.value;

  value = Number(value);
  let maxVal = Math.max(
    sizeM.x / curDivsStep * 4 * curDivsValue,
    sizeM.y / curDivsStep * 4 * curDivsValue
  )
  isErrorPoint = true;
  if (value < 0) {
    errorMessagePoint.textContent = "Число не може бути меншим за нуль.";
  } else if (value === 0 && calcPointInput.value.trim() !== "") {
    errorMessagePoint.textContent = "Число не може бути рівним нулеві.";
  } else if (value > maxVal) {
    errorMessagePoint.textContent = "Число не може бути більшим за " + maxVal + ".";
  } else {
    errorMessagePoint.textContent = "";
    isErrorPoint = false;
  }
});

function checkErrorTChange(input, prevValue, isError) {

  if (isError) return;
  if (input.value.trim() === "") {
    input.value = prevValue;
  } else {
    prevValue = value;
  }
}
calcPointInput.addEventListener("change", () => {
  checkErrorTChange(calcPointInput, prevValuePoint, isErrorPoint);
});

const calcPointButton = getElement("#control-button-calc-points");
calcPointButton.addEventListener("click", calcPoint);

function calcPoint() {


  if (isErrorPoint) return;
  if (canvasMainCurve.style.pointerEvents === "none") return;

  if (!currentSegment || currentSegment.isLine) {
    if (!currentSegment)
      errorMessagePoint.textContent = "Оберіть сегмент для обчислення";
    else 
    errorMessagePoint.textContent = "Оберіть криволінійний сегмент";

    setTimeout(() => {
      errorMessagePoint.textContent = "";
    }, 2500);
    return;
  }

  errorMessagePoint.textContent = "";

  let temp = [];
  currentSegment.controls.forEach((control) => {
    temp.push(control.cpy());
  });
  
  tableBodyPoint.innerHTML = '';
  
  xs = Number(calcPointInput.value);
  xb = new Pair(Number.MAX_VALUE, Number.MIN_VALUE);
  temp.forEach((point) => {
    if (point.x < xb.x) 
      xb.x = point.x;
    
    if (point.x > xb.x) 
      xb.y = point.x;
  })

  currentSegment.setMaxDist(xs);
  let pres = xs / 10;

  let mapSegm = currentSegment.calcMap(xs, pres);
  let mapLine = new Map();
  getLinePoints(temp[0], temp[1], xs, mapLine);
  getLinePoints(temp[1], temp[2], xs, mapLine);
  getLinePoints(temp[2], temp[3], xs, mapLine, true);

  let x = xb.x;
  let start = Math.floor(x / xs) * xs;
  if (x < 0) start += xs;

  x = start;
  let sortedKeys = Array.from(mapLine.keys()).sort((a, b) => a - b);

  sortedKeys.forEach((key) => {
    
    let newRow = document.createElement('tr');

    let newCell = document.createElement('td');
    newCell.textContent = x.toFixed(2);
    newRow.appendChild(newCell); 

    newCell = document.createElement('td');
    let text = "";
    mapLine.get(key).forEach((point) => {
      text += " " + point.y.toFixed(3);
    })
    newCell.textContent = text;
    newRow.appendChild(newCell); 

    newCell = document.createElement('td');
    text = "";
    if (mapSegm.has(Number(key).toFixed(4))) {

      let arr = mapSegm.get(Number(key).toFixed(4));
      arr.forEach((point) => {

        text += " " + point.y.toFixed(3);
      })
    }
    newCell.textContent = text;
    newRow.appendChild(newCell); 

    tableBodyPoint.appendChild(newRow);
    x += xs;
});

}

const tableBodyPoint = getElement("#table-point-body");

function getLinePoints(po1, po2, xs, map, isE = false) {


  let min = Math.min(po1.x, po2.x);
  let p1;
  let p2;
  if (min === po1.x) {
    p1 = po1;
    p2 = po2;
  } else {
    p1 = po2;
    p2 = po1;
  }



  let start = Math.floor(min / xs) * xs;
  if (min < 0) start += xs;


  let m = (p2.y - p1.y) / (p2.x - p1.x); 
  let b = p1.y - m * p1.x;

  if (!isE) {
    for (let x = start; x < p2.x; x += xs) {
      let y = m * x + b;
      if (!map.has(x.toFixed(4))) {
        map.set(x.toFixed(4), []);
      }

      map.get(x.toFixed(4)).push(new Pair(x, y));
    }
  } else {

    for (let x = start; x <= p2.x; x += xs) {
      let y = m * x + b;
      if (!map.has(x.toFixed(4))) {
        map.set(x.toFixed(4), []);
      }

      map.get(x.toFixed(4)).push(new Pair(x, y));
    }
  }
}


let xs;
let xb;


const errorMessagePolynom = getElement("#error-message-polynom");
const calcPolynomInput = getElement("#step-t-size-polynom");

let isErrorPolynom = false;
let prevValuePolynom = 0.01;
calcPolynomInput.value = prevValuePolynom;

function checkErrorTInput(input, errorMessage, isError) {
  let value = input.value;
  // buildRecursiveInput.value = value.replace(/[^.0-9]/g, "");
  value = Number(value);
  isError = true;
  if (value < 0) {
    errorMessage.textContent = "Число не може бути меншим за нуль.";
  } else if (value === 0 && input.value.trim() !== "") {
    errorMessage.textContent = "Число не може бути рівним нулеві.";
  } else if (value > 0.1) {
    errorMessage.textContent = "Число не може бути більшим за 0.1";
  } else {
    errorMessage.textContent = "";
    isError = false;
  }
}
calcPolynomInput.addEventListener("input", () => {
  checkErrorTInput(calcPolynomInput, errorMessagePolynom, isErrorPolynom);
});

function checkErrorTChange(input, prevValue, isError) {

  if (isError) return;
  if (input.value.trim() === "") {
    input.value = prevValue;
  } else {
    prevValue = value;
  }
}
calcPolynomInput.addEventListener("change", () => {
  checkErrorTChange(calcPolynomInput, prevValuePolynom, isErrorPolynom);
});
let recout = 0;
const calcPolynomButton = getElement("#control-button-calc-polynom");
calcPolynomButton.addEventListener("click", calcPolynom);

function findIntersection(temp) {
  [p1, p2, p3, p4] = temp;

  const m1 = (p3.y - p1.y) / (p3.x - p1.x); 
  const m2 = (p4.y - p2.y) / (p4.x - p2.x); 

  if (m1 === m2)
    return undefined;
  
 
  const b1 = p1.y - m1 * p1.x;
  const b2 = p2.y - m2 * p2.x;
  
  const x = (b2 - b1) / (m1 - m2);
  const y = m1 * x + b1;

  return new Pair (x, y);
}

let inter;

function calcPolynom() {


  if (isErrorPolynom) return;
  if (canvasMainCurve.style.pointerEvents === "none") return;

  if (!currentSegment || currentSegment.isLine) {
    if (!currentSegment)
      errorMessagePolynom.textContent = "Оберіть сегмент для обчислення";
    else 
      errorMessagePolynom.textContent = "Оберіть криволінійний сегмент";

    setTimeout(() => {
      errorMessagePolynom.textContent = "";
    }, 2500);
    return;
  }

  errorMessagePolynom.textContent = "";
  canvasMainCurve.style.pointerEvents = "none";
  calcPolynomButton.style.pointerEvents = "none";
  calcPolynomInput.style.pointerEvents = "none";

  let temp = [];

  currentSegment.controls.forEach((control) => {
    temp.push(control.cpy());
  });

  // inter = findIntersection(temp);
  // console.log("temp: ", temp);

  // let isOk;
  // if (inter) {
  //   let maxDist = Math.max(temp[0].dist(temp[2]), temp[1].dist(temp[3]));
  //   isBad = temp.some((control) => {
  //     return control.dist(inter) > maxDist;
  //   })
  // }
  
  tableBody.innerHTML = '';
  inter = temp[0].addO(temp[3]);
  inter.mul(1 / 2);
  
  
  ts = Number(calcPolynomInput.value);
  tm = 3500 * ts;
  t = 0;

  let vec = [];
  temp.forEach((control) => {
    vec.push(control.subPO(inter));
  })

  let i;
  currentCurve.some((point, index) => {
    if (
      point.isBase && 
      (point.segment[0] === currentSegment || point.segment[1] === currentSegment)) {
        i = index;
        return true;
      }
  })

  let curve = currentCurve.slice(i, i + 4);


  let points = [];

  let isEnd = false;
  let interval = setInterval(() => {
    if (t >= 1) {
      if (isEnd) {
        clearInterval(interval);
        canvasMainCurve.style.pointerEvents = "auto";
        calcPolynomButton.style.pointerEvents = "auto";
        calcPolynomInput.style.pointerEvents = "auto";

        clear();
        for(let i = 0; i < points.length - 1; i++) {
          drawRecLine(points[i], points[i + 1], 1);
        }
        drawCurveOne(curve, 1);
        drawCurve();
        return;
      }
      isEnd = true;
      t = 1;
    }

    clear();
    drawCurveOne(curve, 1);

    points.push(calcPolynomOne(vec, t).coordsToPos());  
    for(let i = 0; i < points.length - 1; i++) {
      drawRecLine(points[i], points[i + 1], 1);
    }

    drawPoint(temp[0]);
    drawPoint(temp[1], temp[0]);
    drawPoint(temp[2], temp[3]);
    drawPoint(temp[3]);
  
    t += ts;
  }, tm);  
}


const tableBody = getElement("#table-polynom-body");
const tablePanel = getElement("#table-panel-polynom");
function calcPolynomOne(vec, t) {
  let B = [
    Math.pow(1 - t, 3),
    3 * t * Math.pow(1 - t, 2),
    3 * Math.pow(t, 2) * (1 - t),
    Math.pow(t, 3)
  ]

  let newRow = document.createElement('tr');

  let newCell = document.createElement('td');
  newCell.textContent = t.toFixed(2);
  newRow.appendChild(newCell); 


  B.forEach(b => {
    newCell = document.createElement('td');
    newCell.textContent = b.toFixed(2);
    newRow.appendChild(newCell); 
  });

  tableBody.appendChild(newRow);

  tablePanel.scrollTop = tablePanel.scrollHeight;

  let point = inter.cpy();
  vec.forEach((vec, index) => {
    let pointPrev = point.cpy();
    let vecCur = vec.mulO(B[index])
    point.add(vecCur);

    drawRecLine(pointPrev.coordsToPos(), point.coordsToPos());
  })
  drawRecPoint(point.coordsToPos(), 2);
  drawRecPoint(inter.coordsToPos());


  return point;
}


const errorMessageRecursive = getElement("#error-message-recurcive");
const buildRecursiveInput = getElement("#step-t-size-recursive");

let isErrorRecurcive = false;
let prevValueRecursive = 0.01;
buildRecursiveInput.value = prevValueRecursive;

buildRecursiveInput.addEventListener("input", () => {
  checkErrorTInput(buildRecursiveInput, errorMessageRecursive, isErrorRecurcive);
});

buildRecursiveInput.addEventListener("change", () => {
  checkErrorTChange(buildRecursiveInput, prevValueRecursive, isErrorRecurcive);
});

const buildRecursiveButton = getElement("#control-button-start-recursive");
buildRecursiveButton.addEventListener("click", buildRecurcive);

function buildRecurcive() {
  if (isErrorRecurcive) return;
  if (canvasMainCurve.style.pointerEvents === "none") return;

  if (!currentCurve) {
    errorMessageRecursive.textContent = "Оберіть криву для побудови";
    setTimeout(() => {
      errorMessageRecursive.textContent = "";
    }, 2500);
    return
  }
  errorMessageRecursive.textContent = "";
  canvasMainCurve.style.pointerEvents = "none";
  buildRecursiveButton.style.pointerEvents = "none";
  buildRecursiveInput.style.pointerEvents = "none";
  p = currentPoint;
  currentPoint = undefined;

  ts = Number(buildRecursiveInput.value);
  tm = 1500 * ts;

  let off = 1;
  if (!currentCurve.at(-1).isBase)
    off = 2;

  segments = [];
  let cnt = 0;
  for (let i = 0; i < currentCurve.length - off; i++) {
    if (currentCurve[i].isBase) {
      

      if (
        cnt && 
        segments[cnt - 1] === 
        currentCurve[i].segment[0]) {

        segments.push(currentCurve[i].segment[1]);
      } else {
        segments.push(currentCurve[i].segment[0]);
      }
      cnt++;
    }
  }

  index = 0;
  t = 0;
  points = [];

  // let time = tm / 3000
  // progressTBar.style.transition = `all ${tm / 3000}s ease`;


  drawRecRec();  


}

let p;
let segments;
let index;
let ts;
let t;
let points;
let tm;

let progressTText = getElement("#text-cur-t-value");
let progressSText = getElement("#text-cur-segment");

let progressTBar = getElement("#progress-t");
let progressSBar = getElement("#progress-s");

function drawRecRec() {
  if (segments.length <= index) {
    canvasMainCurve.style.pointerEvents = "auto";
    buildRecursiveButton.style.pointerEvents = "auto";
    buildRecursiveInput.style.pointerEvents = "auto";

    setTimeout(() => {
      progressTBar.style.width = 0;
      progressSBar.style.width = 0;
  
      progressTText.textContent = "0.00";
      progressSText.textContent = "0/0";
    }, 1500); 



    return;
  }
  let segment = segments[index];
  // t %= 1;
  t = 0;




  let isEnd = false;
  let interval = setInterval(() => {
    if (t > 1) {
      if (isEnd) {
        clearInterval(interval);
        index++;

        setTimeout(() => {
          drawRecRec();

        }, tm); 

        clear();
        for(let i = 0; i < points.length - 1; i++) {
          drawLine(points[i], points[i + 1], 2);
        }
        drawCurveOne(currentCurve, 1);

        currentPoint = p;
        return;
      }
      isEnd = true;
      t = 1;
    }
    let temp = [];
    segment.controls.forEach((control) => {
      temp.push(control.cpy().coordsToPos());
    });

    clear();
    drawCurveOne(currentCurve, 1);

    points.push(buildRecurciveOne(temp, t));  
    for(let i = 0; i < points.length - 1; i++) {
      drawLine(points[i], points[i + 1], 2);
    }

    drawPoint(temp[0]);
    if (segment.isLine) {
      drawPoint(temp[1]);
    } else {
      drawPoint(temp[1], temp[0]);
      drawPoint(temp[2], temp[3]);
      drawPoint(temp[3]);
    }


  
    progressTBar.style.width = (t * 100) + "%";
    progressSBar.style.width = ((index + 1) / segments.length * 100) + "%";

    progressTText.textContent = t.toFixed(2);
    progressSText.textContent = (index + 1) + "/" + segments.length;

    t += ts;
  }, tm);  
}

function buildRecurciveOne(controls, t) {
  let temp = [];
  controls.forEach((control) => {
    temp.push(control.cpy());
  });

  let n = temp.length;

  for (let r = 1; r < n; r++) {
    if (r !== 1)
      for (let i = 0; i < n - r; i++) 
          drawRecLine(temp[i], temp[i + 1]);
    
    for (let i = 0; i < n - r; i++) {
        temp[i].x = (1 - t) * temp[i].x + t * temp[i + 1].x;
        temp[i].y = (1 - t) * temp[i].y + t * temp[i + 1].y;
    }
    for (let i = 0; i < n - r; i++) {
      drawRecPoint(temp[i], r === n - 1 && i === 0)
    }
  }
  return temp[0].cpy();
}

function clear() {
  ctxCur.clearRect(0, 0, canvasMainCurve.width, canvasMainCurve.height);
}

function drawRecLine(sPoint, ePoint, act = false) {
  if (!act) {
    ctxCur.lineWidth = 1 * coefM;
    ctxCur.strokeStyle = colors.lineGridBold;
} else {
    ctxCur.lineWidth = 2 * coefM;
    ctxCur.strokeStyle = colors.tangentLine;
  }
  
  ctxCur.beginPath();
  ctxCur.moveTo(sPoint.x, sPoint.y);
  ctxCur.lineTo(ePoint.x, ePoint.y);
  ctxCur.stroke();
}

function drawRecPoint(point, act) {
  if (!act)
    ctxCur.fillStyle = colors.lineGridBold;
  else if (act === 1)
    ctxCur.fillStyle = colors.black;
  else 
    ctxCur.fillStyle = colors.tangentLine;

  ctxCur.beginPath();

  if (!act)
    ctxCur.arc(point.x, point.y, 2.5 * coefM, 0, Math.PI * 2);
  else 
    ctxCur.arc(point.x, point.y, 3.5 * coefM, 0, Math.PI * 2);
  ctxCur.fill();
}

// let p1 = segment.controls[0].cpy().coordsToPos();
//           let p2 = segment.controls[1].cpy().coordsToPos();

//           let vec = p2.subPO(p1);
//           let len = vec.len();
//           let minDist = minUseDist / 2 * 1.25;
//           let cnt = len / minDist + 1;
//           vec.mul(1 / len);
//           vec.mul(minDist);

//           let point = p1;

//           for (let i = 0; i < cnt; i++) {
//             let dist = curPosCursor.dist(point);
//             if (dist < minUseDist) {
//               // console.log("currentCurve: ", currentCurve);
//               // console.log("segment: ", segment);
//               // console.log("segment.curve: ", segment.curve);
//               if (!currentCurve || currentCurve === segment.curve) {
//                 minDistSegment = segment;
//                 break;
//               }
//             }
//             point.add(vec);
//           }

let currentSegment;
const deleteCurveButton = getElement("#control-button-delete");
deleteCurveButton.addEventListener("click", deleteCurrentCurve);

document.addEventListener("keydown", (event) => {
  if (event.key === "Delete") { 
    if (isCtrlPressed) {
      currentProject.curves = [];
      currentProject.segments = [];
      drawCurve();
    } else {
      deleteCurrentCurve();
    }
  }
});

function deleteCurrentCurve() {
  if (currentCurve) {
    pointPanel.innerHTML = "";
    for (let i = 0; i < currentCurve.length; i++) {
      if (currentCurve[i].isBase) {
        let index = currentProject.segments.indexOf(currentCurve[i].segment[0]);
        if (index !== -1) {
          currentProject.segments.splice(index, 1);
        }
      }
    }

    let index = currentProject.curves.indexOf(currentCurve);
    if (index !== -1) {
      currentProject.curves.splice(index, 1);
    }
    currentSegment = undefined;
    currentCurve = undefined;
    currentPoint = undefined;
    lastCurrentPoint = undefined;
    drawCurve();
  }
}

function updateCanvasSize() {
  sizeR = new Pair(
    canvasMain.offsetWidth, 
    canvasMain.offsetHeight
  );
  sizeM = sizeR.mulO(coefM);
  canvasMainCurve.width = sizeM.x;
  canvasMainCurve.height = sizeM.y;
  canvasMain.width = sizeM.x;
  canvasMain.height = sizeM.y;
}

window.addEventListener("load", () => {
  
  blockCanvas(true);
  // createProjectItem();
  // currentProject = projects[0];

  updateCanvasSize();
  // drawSystem(canvasMain, ctx);
  // drawCurve();
});


let sizeR;
let sizeM;

let maxDivsStep = 29 * coefM;
let minDivsStep = 14 * coefM;

let curDivsStep = (maxDivsStep + minDivsStep) / 2;

let curDivsNumbr = 0;
let curDivsValue = 1;

let dragOffset = new Pair(0, 0);


let midl;
let lineOffset;
let startNum;

const ctx = canvasMain?.getContext("2d");
const ctxCur = canvasMainCurve?.getContext("2d");

let isDragging = false; 
let isSpacePressed = false;  
let startDragCoords;  
let deltaDragCoords = new Pair(0, 0);

function drawPoint(p, o, isActivePoint = 1) {
  let point = (p instanceof Point) ? p.getPos() : p;

  if (o) {
    let other = (o instanceof Point) ? o.getPos() : o;
    let vec = other.subPO(point);

    let len = vec.len();
    let unitVec = vec.mulO(1 / len);

    if (isActivePoint) {
      drawDiamond(point, unitVec, 5, colors.controlPoint);

      if (isActivePoint === 1) {
        drawDiamond(point, unitVec, 3, colors.white);
      }
    } 
    // else {
    //   drawDiamond(point, unitVec, 3, colors.lineSystem);
    // }
  } else {
    if (isActivePoint) {
      ctxCur.fillStyle = colors.basePoint;
      ctxCur.beginPath();
      ctxCur.arc(point.x, point.y, 4 * coefM, 0, Math.PI * 2);
      ctxCur.fill();
 
      if (isActivePoint === 1) {
        ctxCur.fillStyle = colors.white;
        ctxCur.beginPath();
        ctxCur.arc(point.x, point.y, 2.5 * coefM, 0, Math.PI * 2);
        ctxCur.fill();
      }
    } 
    // else {
    //   ctxCur.fillStyle = colors.curve;
    //   ctxCur.beginPath();
    //   ctxCur.arc(point.x, point.y, 2.5 * coefM, 0, Math.PI * 2);
    //   ctxCur.fill();
    // }
  }
}

let currentPoint;

function drawDiamond(point, unitVec, len, color) {
  let vec = unitVec.mulO(coefM * len);
  let vecRot = vec.rotate90();
  ctxCur.fillStyle = color;

  ctxCur.beginPath();
  ctxCur.moveTo(point.x + vec.x, point.y + vec.y);
  ctxCur.lineTo(point.x + vecRot.x, point.y + vecRot.y);
  ctxCur.lineTo(point.x - vec.x, point.y - vec.y);
  ctxCur.lineTo(point.x - vecRot.x, point.y - vecRot.y);
  ctxCur.fill();

}

function drawLine(sP, eP, isTangent, isActiveCurve = true) {
  if (!isActiveCurve) return;

  let sPoint = (sP instanceof Point) ? sP.getPos() : sP;
  let ePoint = (eP instanceof Point) ? eP.getPos() : eP;

  ctxCur.lineWidth = 1 * coefM;

  if (isTangent === 1)
    ctxCur.strokeStyle = colors.tangentLine;
  else if (isTangent === 2) {
    ctxCur.lineWidth = 2 * coefM;
    ctxCur.strokeStyle = colors.curve;
  } else 
    ctxCur.strokeStyle = colors.nonTangentLine;


  ctxCur.beginPath();
  ctxCur.moveTo(sPoint.x, sPoint.y);
  ctxCur.lineTo(ePoint.x, ePoint.y);
  ctxCur.stroke();
  
}

document.addEventListener("keydown", (event) => {
  if (
    event.key === "c" || event.key === "C" || 
    event.key === "с" || event.key === "С"
  ) {
    if (canvasMainCurve.style.pointerEvents === "none") return;
    dragOffset = new Pair(0, 0);
    drawSystem(canvasMain, ctx);
    drawCurve();
  }
});

document.addEventListener("keydown", (event) => {
  if (
    event.key === "r" || event.key === "R" || 
    event.key === "к" || event.key === "К"
  ) {
    if (canvasMainCurve.style.pointerEvents === "none") return;

    dragOffset = new Pair(0, 0);  
    curDivsNumbr = 0;
    curDivsStep = (maxDivsStep + minDivsStep) / 2;
    curDivsValue = 1;
    drawSystem(canvasMain, ctx);
    drawCurve();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    if (canvasMainCurve.style.pointerEvents === "none") return;

      isSpacePressed = true;
      if (
        !isDragging &&
        canvasMainCurve.style.cursor !== "zoom-in" &&
        canvasMainCurve.style.cursor !== "zoom-out" 
      )
        canvasMainCurve.style.cursor = "grab";
      drawCurve();
    
  }
});
document.addEventListener("keyup", (event) => {
  if (event.code === "Space") {

    if (canvasMainCurve.style.pointerEvents === "none") return;


    isSpacePressed = false;
    canvasMainCurve.style.cursor = "default"; 

    if (lastPosPentool) {
      drawPreview(lastPosPentool);
    }
  } 
});

let startPosPentool;
let curPosPentool;


function drawCurve() {
  ctxCur.clearRect(0, 0, canvasMainCurve.width, canvasMainCurve.height);

  if (currentProject === undefined || !Array.isArray(currentProject.curves)) {
    return;
  }

  let sizeD = new Pair(
    sizeM.x / curDivsStep * curDivsValue / 300,
    sizeM.y / curDivsStep * curDivsValue / 300
  )
  Segment.maxDist = Math.min(sizeD.x, sizeD.y);

  let segments = currentProject.segments;
  segments.forEach((segment, index) => {
    let isActive = (currentSegment === segment);
    segment.draw(isActive);
  });

  let curves = currentProject.curves;
  curves.forEach((curve, index) => {
    if (Array.isArray(curve)) {
      if (curve !== currentCurve) {
        drawCurveOne(curve, 0);
      }
    }  
    
    drawCurveOne(currentCurve, 1);
  });


}

function drawCurveOne(curve, isActiveCurve) {
 
  if (!Array.isArray(curve)) return;

  for (let i = 0; i < curve.length - 1; i++) {
    let isTangent;

    if (
      curve[i].isBase && !curve[i + 1].isBase || 
      !curve[i].isBase && curve[i + 1].isBase
    ) {
      isTangent = 1;
    } else if (curve[i].isBase && curve[i + 1].isBase)
      isTangent = 2;
    
    if (!curve[i].isBase || !curve[i + 1].isBase)
    drawLine(curve[i], curve[i + 1], isTangent, isActiveCurve);
    if (!curve[i].isBase) {
      if (curve[i - 1].isBase) {
        drawPoint(curve[i], curve[i - 1], isActiveCurve);
      } else {
        drawPoint(curve[i], curve[i + 1], isActiveCurve);
      }
    } else {
      drawPoint(curve[i], undefined, isActiveCurve);
    }

    if (!curve[i + 1].isBase) {
      if (curve[i].isBase) {
        drawPoint(curve[i + 1], curve[i], isActiveCurve);
      } else {
        drawPoint(curve[i + 1], curve[i + 2], isActiveCurve);
      }
    } else {
      drawPoint(curve[i + 1], undefined, isActiveCurve);
    }
    
    if (curve.length === 1) {
      drawPoint(curve[0], undefined, isActiveCurve);
    }       

    if (currentPoint && curve === currentCurve) {
      curve.forEach((point, index) => {
        if (point === currentPoint) {
          if (point.isBase)
            drawPoint(curve[index], undefined, 2);
          else if (index !== 0 && curve[index - 1].isBase)
            drawPoint(curve[index], curve[index - 1], 2);
          else 
            drawPoint(curve[index], curve[index + 1], 2);
        }
      });
    }
    
  }
  if (curve.length === 1) {
    drawPoint(curve[0], undefined, 2);
  }
}

let minDistPoints;
let minDistCurves;

canvasMainCurve.addEventListener("mousedown", (event) => {
  if (isSpacePressed) {  
    canvasMainCurve.style.cursor = "grabbing";         
    startDragCoords = new Pair(
      event.clientX, 
      event.clientY
    ); 
  } else if (isCtrlPressed) {
    let curPosCursor = getCurPos(event);

    let curves = currentProject.curves;
    let isInCurCurve = false;
    minDistPoints = undefined;
    minDistCurves = undefined;
    if (currentCurve) {
      let minDist = Number.MAX_VALUE;
      if (Array.isArray(curves)) {
        curves.forEach((curve, index) => {
          if (Array.isArray(curve)) {
            for (let i = 0; i < curve.length; i++) {
              let dist = curPosCursor.dist(curve[i].getPos());
              if (dist < minDist) {
                minDist = dist;
                minDistPoints = [curve[i]];
                minDistCurves = [curve];
                if (currentCurve === curve)
                  isInCurCurve = true;
                else 
                  isInCurCurve = false;

              } else if (dist === minDist && minDistPoints[0].id === curve[i].id) {
                minDistPoints.push(curve[i]);
                minDistCurves.push(curve);
                if (currentCurve === curve)
                  isInCurCurve = true;
              }
            }       
          }    
        });
      }
      if (minDist > minUseDist || !isInCurCurve) {
        minDistPoints = undefined;
        minDistCurves = undefined;
      }
    }

    let minDistSegment = undefined;
    if (!currentCurve || !minDistPoints) {
      let segments = currentProject.segments;
      let maxDist = minUseDist / curDivsStep * curDivsValue / 2 * 1.25;

      for (let j = 0; j < segments.length; j++){
        let segment = segments[j];
        if (!segment.isLine) {
          let coef = segment.setMaxDist(maxDist);
          let points = segment.points;
  
          for (let i = 0; i < points.length; i += coef) {
            let dist = curPosCursor.dist(points[i].pair.coordsToPos());
            if (dist < minUseDist) {
              if (!currentCurve || currentCurve === segment.curve) {
                minDistSegment = segment;
                break;
              }
            }
          }
        } else {

          let p1 = segment.controls[0].cpy().coordsToPos();
          let p2 = segment.controls[1].cpy().coordsToPos();

          let vec = p2.subPO(p1);
          let len = vec.len();
          let minDist = minUseDist / 2 * 1.25;
          let cnt = len / minDist + 1;
          vec.mul(1 / len);
          vec.mul(minDist);

          let point = p1;

          for (let i = 0; i < cnt; i++) {
            let dist = curPosCursor.dist(point);
            if (dist < minUseDist) {
    
              if (!currentCurve || currentCurve === segment.curve) {
                minDistSegment = segment;
                break;
              }
            }
            point.add(vec);
          }
        }
        
        if (minDistSegment)
          break;
      }
    }

    
    currentSegment = undefined;
    if (minDistSegment) {
      if (currentCurve) {

        currentSegment = minDistSegment;
      } else {
        currentCurve = minDistSegment.curve;
        currentPoint = currentCurve.at(-1);
  
        lastPoint = currentCurve.at(-1);
        if (lastPoint.isSoft) {
          prevPoint = currentCurve.at(-2);
          let prevBase = currentCurve.at(-4);
          let vec = lastPoint.getPos().subPO(prevPoint.getPos());
  
          if (!prevBase.isSoft) {
            vec.mul(5/4);
          } 
          let point = lastPoint.getPos().addO(vec);
          addPointItem(point, false)
        }
  
        if (!lastCurrentPoint) 
          if (currentCurve.at(-1).isBase)
            lastCurrentPoint = currentCurve.at(-1);
          else 
            lastCurrentPoint = currentCurve.at(-2);

        pointPanel.innerHTML = "";
        currentCurve.forEach((curve) => {
          pointPanel.append(curve.item);
        });
      }
    } else if (minDistPoints) {
      oldPosPoint = getCurPos(event);

      for (let i = 0; i < minDistPoints.length; i++) {
        let index = currentCurve.indexOf(minDistPoints[i]);
        if (index !== -1) {
          currentPoint = minDistPoints[i];
        }
      }

      let lastPoint = currentCurve.at(-1);
      let prevPoint = currentCurve.at(-2);
      if (currentPoint === currentCurve[0]) {
        if (lastPoint.isBase && prevPoint.isBase) {
          currentCurve.reverse();
        } else  {
          if (currentCurve.length > 2) {
            if (!lastPoint.isBase) 
              currentCurve.pop();
            currentCurve.reverse();
          }
        }
      } 

      lastPoint = currentCurve.at(-1);
      if (lastPoint.isSoft) {
        prevPoint = currentCurve.at(-2);
        let prevBase = currentCurve.at(-4);
        let vec = lastPoint.getPos().subPO(prevPoint.getPos());

        if (!prevBase.isSoft) {
          vec.mul(5/4);
        } 
        let point = lastPoint.getPos().addO(vec);
        addPointItem(point, false)
      }

      if (!lastCurrentPoint) 
        if (currentCurve.at(-1).isBase)
          lastCurrentPoint = currentCurve.at(-1);
        else 
          lastCurrentPoint = currentCurve.at(-2);

          pointPanel.innerHTML = "";
          currentCurve.forEach((curve) => {
            pointPanel.append(curve.item);
          });

      isDraggingPoint = true;

    } else {

        if (clickOff) {
          if (Array.isArray(currentCurve)) {
            if (currentCurve.length <= 2) {
              if (currentCurve.length == 2 && currentCurve[0].isBase && currentCurve[1].isBase) {

              } else {
                let index = currentProject.curves.indexOf(currentCurve);
                if (index !== -1) {
                  currentProject.curves.splice(index, 1);
                }
              }
            } else {
              let lastPoint = currentCurve.at(-1);
              if (!lastPoint.isBase) 
                currentCurve.pop();
            }
          }
          pointPanel.innerHTML = "";
          currentCurve = undefined;
          currentSegment = undefined;
          currentPoint = undefined;
        } else {
          setTimeout(() => {
            clickOff = false;
          }, 300);
          clickOff = true;
        }
        lastCurrentPoint = undefined;

    }
      drawCurve();
  } else {

    if (
      !currentPoint ||
       currentCurve.at(-1).isBase && currentPoint === currentCurve.at(-1) ||
      !currentCurve.at(-1).isBase && currentPoint === currentCurve.at(-2) 
    ) {

      startPosPentool = getCurPos(event);
      curPosPentool = startPosPentool.cpy();
      drawPoint(startPosPentool);
    } else {
      if (!currentCurve.at(-1).isBase)
        currentCurve.pop();

      pointPanel.innerHTML = "";
      currentCurve = undefined;
      currentSegment = undefined;
      currentPoint = addPointItem(currentPoint.getPos(), true, false, currentPoint.id);

      startPosPentool = getCurPos(event);
      curPosPentool = startPosPentool.cpy();
      drawPoint(startPosPentool);

    }
  }
  
  isDragging = true;
});

let clickOff = false;

let isSoftPoint = false;
let lastPosPentool;
let oldPosPoint;

let lastCurrentPoint;
canvasMainCurve.addEventListener("mousemove", (event) => {
  if (isDragging) {   
    if (isSpacePressed) {
      deltaDragCoords = new Pair(
        event.clientX - startDragCoords.x,
        event.clientY - startDragCoords.y
      );
      deltaDragCoords.mul(coefM);
      dragOffset.add(deltaDragCoords);
  
      startDragCoords = new Pair(
        event.clientX, 
        event.clientY
      );
      drawSystem(canvasMain, ctx);
      drawCurve(); 

    } else if (!isCtrlPressed) {

      curPosPentool = getCurPos(event);

      drawCurve();
      drawLine(startPosPentool, curPosPentool, 1)
      
      let dist = startPosPentool.dist(curPosPentool);
      if (dist > 6 * coefM) {
      
        if (Array.isArray(currentCurve)) {
          let prev = currentCurve.at(-1);

          if (prev.isBase) {
            let vec = startPosPentool.subPO(curPosPentool);
            let point = vec.addO(startPosPentool);
      
            let vecPrev = point.subPO(prev.getPos());
            vecPrev.mul(1/3);
            let newPrev = vecPrev.addO(prev.getPos());
          
            vec.mul(4/5);
            point = vec.addO(startPosPentool);

            drawLine(prev, newPrev, 1);
            drawLine(newPrev, point);
            drawLine(startPosPentool, point, 1);
        

            let seg = new Segment ([
              prev.coords,
              newPrev.posToCoords(),
              point.posToCoords(),
              startPosPentool.posToCoords()
            ])
            seg.draw();

            drawPoint(newPrev, prev);
            drawPoint(point, startPosPentool);
            drawPoint(prev);

          } else {
            let vec = startPosPentool.subPO(curPosPentool);
            let point = vec.addO(startPosPentool);
            drawLine(startPosPentool, point, 1);  
            drawLine(prev, point);

            let prevPrev = currentCurve.at(-2);
            let seg = new Segment ([
              prevPrev.coords,
              prev.coords,
              point.posToCoords(),
              startPosPentool.posToCoords()
            ])
            seg.draw();
            drawPoint(prevPrev);
            drawPoint(point, startPosPentool);

          }
          // drawPoint(prev, prevPrev);

        }
        drawPoint(startPosPentool, undefined , true);
        drawPoint(curPosPentool, startPosPentool);
      }  else {
        if (Array.isArray(currentCurve)) {
          let prev = currentCurve.at(-1);
          if (prev.isBase) {
            drawLine(startPosPentool, prev, 2);
            drawPoint(prev);
          } else {
            let prevPrev = currentCurve.at(-2);
            drawLine(startPosPentool, prev);
            let seg = new Segment ([
              prevPrev.coords,
              prev.coords,
              startPosPentool.posToCoords(),
              startPosPentool.posToCoords()
            ])
            seg.draw();
          // drawPoint(startPosPentool, undefined , true);

          drawPoint(prevPrev);
            
          }
        }
        drawPoint(startPosPentool, undefined , true);
      }

      if (!isSoftPoint) {
        isSoftPoint = true; 

        if (Array.isArray(currentCurve))
        currentCurve.forEach((point, index) => {
          if (point === currentPoint) {
            if (!currentCurve[index].isBase) {
              if (currentCurve[index - 1].isBase) {
                drawPoint(currentCurve[index], currentCurve[index - 1]);
              } else {
                drawPoint(currentCurve[index], currentCurve[index + 1]);
              }
            } else {
              drawPoint(currentCurve[index]);
            }
          }
        });
        currentPoint = undefined;
      }
      
    } else if (isDraggingPoint) {
      let newPosPoint = getCurPos(event);
      let oldPosPointSave = currentPoint.getPos();

      for (let i = 0; i < minDistPoints.length; i++) {
        minDistPoints[i].setPos(newPosPoint);

        let prev;
        let next;
        let curIndex;
        minDistCurves[i].forEach((point, index) => {
          if (point ===  minDistPoints[i]) {
            curIndex = index;
            if (index === 0) {
              prev = undefined;
            } else {
              prev = minDistCurves[i][index - 1];
            }
            if (index === minDistCurves[i].length - 1) {
              next = undefined;
            } else {
              next = minDistCurves[i][index + 1];
            }
          }
        });
        
        if ( minDistPoints[i].isBase) {
          if (prev && !prev.isBase) {
            let vecPrev = prev.getPos().subPO(oldPosPointSave);
            prev.setPos(newPosPoint.addO(vecPrev));
          }
          if (next && !next.isBase) {
            let vecNext = next.getPos().subPO(oldPosPointSave);
            next.setPos(newPosPoint.addO(vecNext));
          }
        } else {
          if (prev && prev.isBase && prev.isSoft && curIndex > 1) {
            let prevPrev = minDistCurves[i][curIndex - 2];
            let prevBase = minDistCurves[i][curIndex - 4];
            let nextBase;
            if (curIndex !== minDistCurves[i].lengtn - 1) 
              nextBase = minDistCurves[i][curIndex + 2];
  
            let vec = prev.getPos().subPO(newPosPoint);

            if (prevBase.isSoft) {
              if (nextBase && !nextBase.isSoft) {
                vec.mul(5/4);

              }
            } else {
              if (!nextBase || nextBase.isSoft) {
                vec.mul(4/5);
              }
            }

  
            let point = prev.getPos().addO(vec);
            prevPrev.setPos(point);
  
          } else if (next && next.isBase && next.isSoft) {
            let nextNext = minDistCurves[i][curIndex + 2];
            let prevBase = minDistCurves[i][curIndex - 2];
            let nextBase;
            if (curIndex + 4 < minDistCurves[i].length)
              nextBase = minDistCurves[i][curIndex + 4];
  
            let vec = next.getPos().subPO(newPosPoint);
  
            if (!nextBase || nextBase.isSoft) {
              if (!prevBase.isSoft) {
                vec.mul(5/4);

              }
            } else {
              if (prevBase.isSoft) {
                vec.mul(4/5);
              }
            }

            
            let point = next.getPos().addO(vec);
            nextNext.setPos(point);
          }
        }
      }
      

      oldPosPoint = newPosPoint;
      drawCurve();
    }
  } else {


    if (!isSpacePressed && !isCtrlPressed) {
      if (currentCurve) {
        let curPosPentool = getCurPos(event);
        drawPreview(curPosPentool);
      } else {

        let curPosPentool = getCurPos(event);

        drawCurve();

        drawPoint(curPosPentool);
      }
    } 
 
  }
  lastPosPentool = getCurPos(event);
 
});

function drawPreview(curPosPentool) {
  drawCurve();
  let cC = currentCurve;
  if (currentCurve) {
    if (
      currentPoint !== currentCurve.at(-1) &&
      currentPoint !== currentCurve.at(-2)
    ) {
      cC = [currentPoint]
    } 
    let prev = cC.at(-1);
    if (Array.isArray(cC)) {
      if (prev.isBase){
        drawLine(curPosPentool, prev, 2);
        drawPoint(prev, undefined, 2);
      }
    else {
        let prevPrev = cC.at(-2);
        // drawLine(startPosPentool, prev);
        let seg = new Segment ([
          prevPrev.coords,
          prev.coords,
          curPosPentool.posToCoords(),
          curPosPentool.posToCoords()
        ])
        seg.draw();
        drawPoint(prevPrev, undefined, 2);
  
      }
    } 
  }
  
  drawPoint(curPosPentool);
}

let currentCurve;

function getCurPos(event) {
  const rect = canvasMain.getBoundingClientRect();
  let curPos = new Pair(
    event.clientX - rect.left, 
    event.clientY - rect.top
  );
  curPos.mul(coefM);

  return curPos;
}

function createSegment(curve) {
  if (curve.at(-1).isBase && curve.at(-2).isBase) {
    let seg = new Segment (
      [
        curve.at(-2).coords,
        curve.at(-1).coords
      ],
      currentCurve,
      true
    )
    currentProject.segments.push(seg)

    curve.at(-2).segment.push(seg);
    curve.at(-1).segment.push(seg);

    curve.at(-2).segPos.push(0)
    curve.at(-1).segPos.push(1)
  } else {
    let off = 0;
    if (!curve.at(-1).isBase) 
      off = -1;
    
    let seg = new Segment (
      [
        curve.at(-4 + off).coords,
        curve.at(-3 + off).coords,
        curve.at(-2 + off).coords,
        curve.at(-1 + off).coords
      ],
      currentCurve
    )
    currentProject.segments.push(seg)

    curve.at(-4 + off).segment.push(seg)
    curve.at(-3 + off).segment = seg;
    curve.at(-2 + off).segment = seg;
    curve.at(-1 + off).segment.push(seg)

    curve.at(-4 + off).segPos.push(0)
    curve.at(-3 + off).segPos = 1;
    curve.at(-2 + off).segPos = 2;
    curve.at(-1 + off).segPos.push(3)
  }
}

function addPoint() {
  let prev;
  if (currentCurve)
    prev = currentCurve.at(-1);
  else 
    prev = undefined;

  let dist = startPosPentool.dist(curPosPentool);
  if (isSoftPoint && dist > 6 * coefM) {

    if (prev && prev.isBase) {
    
      let vec = startPosPentool.subPO(curPosPentool);
      let point = vec.addO(startPosPentool);

      let vecPrev = point.subPO(prev.getPos());
      vecPrev.mul(1/3);
      let newPrev = vecPrev.addO(prev.getPos());
      addPointItem(newPrev, false);

      vec.mul(4/5);
      point = vec.addO(startPosPentool);

      addPointItem(point, false);
      
      currentPoint = addPointItem(startPosPentool, true, true);
      addPointItem(curPosPentool, false);
      createSegment(currentCurve);
      
    } else {
      if (Array.isArray(currentCurve)) {
        let vec = startPosPentool.subPO(curPosPentool);
        let point = vec.addO(startPosPentool);
        addPointItem(point, false);
      }
      currentPoint = addPointItem(startPosPentool, true, true);
      addPointItem(curPosPentool, false);

      if (currentCurve.length > 4) {
        createSegment(currentCurve);
      }
    }
    
  } else {

    if (!prev) {
      currentPoint = addPointItem(startPosPentool, true);

    } else if (prev && prev.isBase) {
      currentPoint = addPointItem(startPosPentool, true);
      createSegment(currentCurve);

    } else if (!prev.isBase) { 
      let vec = prev.getPos().subPO(startPosPentool);
      vec.mul(1/3);
      let point = vec.addO(startPosPentool);

      let preBase = currentCurve.at(currentCurve.length - 2);
      let newPrevVec = prev.getPos().subPO(preBase.getPos());
      newPrevVec.mul(4/5);
      prev.setPos(newPrevVec.addO(preBase.getPos()));

      addPointItem(point, false);
      currentPoint = addPointItem(startPosPentool, true);
      createSegment(currentCurve);
    }
  }
  drawCurve();
}

canvasMainCurve.addEventListener("mouseup", () => {
  if (!isSpacePressed && !isCtrlPressed ) {
    addPoint();
    isSoftPoint = false;
  }
  if (isCtrlPressed && currentPoint && !currentPoint.isBase ) {
    currentPoint = lastCurrentPoint;
    drawCurve();
  }

  isDraggingPoint = false;
  isDragging = false;
});
canvasMainCurve.addEventListener("mouseleave", () => {
  // if (isSpacePressed)
  isDragging = false;
  drawCurve();
});

let curPos;
let isDraggingPoint = false;
let isCtrlPressed = false;
let minUseDist = 6 * coefM;
document.addEventListener("keydown", (event) => {
  if (event.ctrlKey) {  
    if (canvasMainCurve.style.pointerEvents === "none") return;


    if (isCtrlPressed) return;

    isCtrlPressed = true;
    drawCurve();
  }
});

document.addEventListener("keyup", (event) => {
  if (event.code === "ControlLeft" || event.code === "ControlRight") {  
    if (canvasMainCurve.style.pointerEvents === "none") return;

    isCtrlPressed = false;
    isDraggingPoint = false;
      
    if (lastPosPentool && currentCurve) {
      drawPreview(lastPosPentool);
    } else {
      drawPoint(lastPosPentool);
    }
  }
});

const minDivsValue = 0.01;
const maxDivsValue = 100; 
canvasMainCurve.addEventListener("wheel", (event) => {
  event.preventDefault();

  const rect = canvasMain.getBoundingClientRect();

  if (event.deltaY < 0) {
  
    if (curDivsValue <= minDivsValue && curDivsStep === maxDivsStep) return;
    canvasMainCurve.style.cursor = "zoom-in";

    if (isCtrlPressed) {
      reSizeSystem(false, true);
    } else {

      curPos = new Pair(event.clientX - rect.left, event.clientY - rect.top);
      reSizeSystem(false);
    }

  } else {

    if (curDivsValue >= maxDivsValue && curDivsStep === minDivsStep) return;
    canvasMainCurve.style.cursor = "zoom-out";

    if (isCtrlPressed) {
      reSizeSystem(true, true);
    } else {

      curPos = new Pair(event.clientX - rect.left, event.clientY - rect.top);
      reSizeSystem(true);
    }

  }
  if (lastPosPentool && !isCtrlPressed && !isSpacePressed)
    drawPreview(lastPosPentool);

  setTimeout(() => {
    if (isSpacePressed)
      if (isDragging)
        canvasMainCurve.style.cursor = "grabbing";
      else
        canvasMainCurve.style.cursor = "grab";
      
    else
      canvasMainCurve.style.cursor = "default";
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
        if (mult === 2) {
          dragOffset.add(abs.mulO(0.5));
 

        } else if (mult === 2.5) {


          dragOffset.add(abs.mulO(0.6));
        }
      }  else {
        dragOffset.sub(abs.mulO((mult - 1) ));
      }
    }
  }
  
  drawSystem(canvasMain, ctx);
  drawCurve();
}

function calcCurNum(midlDrag, midl) {
  let num;
  if (midlDrag < 0) 
    num =  - Math.ceil(midlDrag / curDivsStep) % 4 + 1;
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

function drawSystem(canvas, ctx) {

  canvasBuffer.width = canvas.width;
  canvasBuffer.height = canvas.height;

  сtxBuffer.clearRect(0, 0, canvas.width, canvas.height);
  
  midl = new Pair(
    Math.floor(sizeM.x / 2),
    Math.floor(sizeM.y / 2)
  );  

  midlDrag = midl.addO(dragOffset);

  lineOffset = new Pair(
    calcCurOff(midlDrag.x),
    calcCurOff(midlDrag.y)
  );
  startNum = new Pair(
    calcCurNum(midlDrag.x, midl.x),
    calcCurNum(midlDrag.y, midl.y)
  );

  // Розмірна сітка
  сtxBuffer.lineWidth = 0.5 * coefM;
  сtxBuffer.strokeStyle = colors.lineGridNormal;

  for (
    let num = startNum.x, cur = lineOffset.x; 
    cur < sizeM.x; 
    (num++) % 4, cur += curDivsStep
  ) {
    let isDark = num % 4 === 0;
    сtxBuffer.strokeStyle = isDark ? colors.lineGridBold : colors.lineGridNormal;

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
    сtxBuffer.strokeStyle = isDark ? colors.lineGridBold : colors.lineGridNormal;

    сtxBuffer.beginPath();
    сtxBuffer.moveTo(0, cur);
    сtxBuffer.lineTo(sizeM.x, cur);
    сtxBuffer.stroke();
  }
  
  // Осі координат
  сtxBuffer.strokeStyle = colors.lineSystem;
  сtxBuffer.lineWidth = 2 * coefM;
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
  сtxBuffer.fillStyle  = colors.lineSystem;
  if (isLineOnSystem.x && isLineOnSystem.y) {
    сtxBuffer.beginPath();
    сtxBuffer.arc(midlDrag.x, midlDrag .y, 2.5 * coefM, 0, Math.PI * 2);
    сtxBuffer.fill();
  }

  // Підпис поділок додатнії осей
  сtxBuffer. Style  = colors.black;
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

  let cnt = Math.floor(-curDivsNumbr / 3) + 1; 
  let cntNum = Math.pow(10, cnt);
  let cnt2 = Math.floor((-curDivsNumbr - 1) / 3) + 1; 
  if (curDivsNumbr >= 0)
    cnt2 = 0; 

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

  сtxBuffer.strokeStyle = colors.lineSystem;
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

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(canvasBuffer, 0, 0);
}



function roundAfterPoint(num, cntNum) {
  if (curDivsNumbr < 0) 
    return Math.round(num * cntNum) / cntNum;
  else 
    return Math.floor(num);

}