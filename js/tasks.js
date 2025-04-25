const errorMessagePoint = getElement("#error-message-point");
const calcPointInput = getElement("#step-x-size-point");

const tableBodyPoint = getElement("#table-point-body");

let isErrorPoint = false;
let prevValuePoint = 0.1;
calcPointInput.value = prevValuePoint;

calcPointInput.addEventListener("input", () => {
    let value = calcPointInput.value;

  value = Number(value);
  let maxVal = Math.max(
    sizeCanvas.x / curGridSize * 4 * curDivsValue,
    sizeCanvas.y / curGridSize * 4 * curDivsValue
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

calcPointInput.addEventListener("change", () => {
    checkErrorTChange(calcPointInput, prevValuePoint, isErrorPoint);
});  
function checkErrorTChange(input, prevValue, isError) {
  if (isError) return;
  if (input.value.trim() === "") {
    input.value = prevValue;
  } else {
    prevValue = value;
  }
}

const calcPointButton = getElement("#control-button-calc-points");
calcPointButton.addEventListener("click", calcPoint);

function calcPoint() {

  if (isErrorPoint) return;
  if (canvasMainCurve.style.pointerEvents === "none") return;

  if ((!currentSegment || currentSegment.isLine) && !currentLineI) {
    if (!currentSegment && !currentLineI)
      errorMessagePoint.textContent = "Оберіть сегмент або відрізок ламаної для обчислення";
    else if (currentSegment.isLine)
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
  
  let xStep = Number(calcPointInput.value);
  let xMin = Number.MAX_VALUE;
  temp.forEach((point) => {
    if (point.x < xMin) 
        xMin = point.x;
  })

  let xMax = -Infinity;
  temp.forEach((point) => {    
    if (point.x > xMax) {
      xMax = point.x;
    }
  })

  let smallestDigit = getSmallestDigit(xStep);
  let start;


  do {
    start = Math.floor(xMin / smallestDigit) * smallestDigit;
    if (xMin < 0) start += smallestDigit;
    smallestDigit /= 10;
  } while (start > xMax)

  

  console.log("xMin: " + xMin);
  console.log("xMax: " + xMax);
  console.log("start: " + start);


  currentSegment.setMaxDist(xStep);
  let pres = xStep / 10;
  let prevStart = start;

  let mapSegm = currentSegment.calcMap(xStep, pres, prevStart);
  let mapLine = new Map();
  getLinePoints(temp[0], temp[1], xStep, mapLine, prevStart);
  getLinePoints(temp[1], temp[2], xStep, mapLine, prevStart);
  getLinePoints(temp[2], temp[3], xStep, mapLine, prevStart, true);

  let xStart = prevStart;
  

  let x = xStart;
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
    x += xStep;
  });

}

function getSmallestDigit(xStep) {
  if (!Number.isFinite(xStep) || xStep === 0) return 0;
  const str = xStep.toString();
  const decimalIndex = str.indexOf('.');
  if (decimalIndex === -1) {
      return 1;
  }
  const decimalPlaces = str.length - decimalIndex - 1;
  return Math.pow(10, -decimalPlaces);
}

function getLinePoints(po1, po2, xStep, map, prevStart = undefined, isE = false) {
  console.log("getLinePoints");
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

  let m = (p2.y - p1.y) / (p2.x - p1.x); 
  let b = p1.y - m * p1.x;
  
  let smallestDigit = getSmallestDigit(xStep);

  let start;

    if (prevStart === undefined) {
      start = Math.floor(min / smallestDigit) * smallestDigit;
      if (min < 0) start += smallestDigit;
    } else {
      start = prevStart;
      while (start < p1.x) start += xStep;
    } 


    if (start >= p1.x && start <= p2.x) {
      if (!isE) {
        for (let x = start; x < p2.x; x += xStep) {
          let y = m * x + b;
          if (!map.has(x.toFixed(4))) {
            map.set(x.toFixed(4), []);
          }
  
          map.get(x.toFixed(4)).push(new Pair(x, y));
        }
      } else {
  
        for (let x = start; x <= p2.x; x += xStep) {
          let y = m * x + b;
          if (!map.has(x.toFixed(4))) {
            map.set(x.toFixed(4), []);
          }
  
          map.get(x.toFixed(4)).push(new Pair(x, y));
        }
      }
    }

    console.log(map.size); 
    console.log("map line: ", map); 


  if (prevStart === undefined) {
    return start;
  }
}

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
  let value = input.value;
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
  lockImg.style.display = "block";
  calcPolynomButton.style.pointerEvents = "none";
  calcPolynomInput.style.pointerEvents = "none";

  let temp = [];

  currentSegment.controls.forEach((control) => {
    temp.push(control.cpy());
  });
  
  tableBody.innerHTML = '';
  inter = temp[0].addPO(temp[3]);
  inter.mulC(1 / 2);
  
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
        lockImg.style.display = "none";
        calcPolynomButton.style.pointerEvents = "auto";
        calcPolynomInput.style.pointerEvents = "auto";

        clear();
        for(let i = 0; i < points.length - 1; i++) {
          drawRecLine(points[i], points[i + 1], 2);
        }
        drawPolylineOne(curve, 1);
        drawCurve();
        return;
      }
      isEnd = true;
      t = 1;
    }

    clear();

    points.push(calcPolynomOne(vec, t).coordsToPos());  
    for(let i = 0; i < points.length - 1; i++) {
      drawRecLine(points[i], points[i + 1], 2);
    }

    drawPolylineOne(curve, 1);

    // drawPoint(temp[0]);
    // drawPoint(temp[1], temp[0]);
    // drawPoint(temp[2], temp[3]);
    // drawPoint(temp[3]);
  
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
    let vecCur = vec.mulCO(B[index])
    point.addP(vecCur);

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
  lockImg.style.display = "block";
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
        cnt && segments[cnt - 1] === 
        currentCurve[i].segment[0]) {

        segments.push(currentCurve[i].segment[1]);
      } else {
        segments.push(currentCurve[i].segment[0]);
      }
      cnt++;
    }
  }

  isRev = currentCurve[0].coords !== segments[0].controls[0];

  index = 0;
  t = 0;
  points = [];

  drawRecRec();  
}

let p;
let segments;
let index;
let ts;
let t;
let points;
let tm;
let isRev;

let progressTText = getElement("#text-cur-t-value");
let progressSText = getElement("#text-cur-segment");

let progressTBar = getElement("#progress-t");
let progressSBar = getElement("#progress-s");

function drawRecRec() {
  if (segments.length <= index) {
    canvasMainCurve.style.pointerEvents = "auto";
    lockImg.style.display = "none";
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
        drawPolylineOne(currentCurve, 1);

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
    if (isRev)
      temp.reverse();

    clear();

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

    drawPolylineOne(currentCurve, 1);

    progressTBar.style.width = (t * 100) + "%";
    progressSBar.style.width = ((index + 1) / segments.length * 100) + "%";

    progressTText.textContent = t.toFixed(2);
    progressSText.textContent = (index + 1) + "/" + segments.length;

    t += ts;
  }, tm);  
}

function buildRecurciveOne(controls, t, r = 1) {
  let temp = controls.map(control => control.cpy()); // Копіюємо контрольні точки
  let n = temp.length;

  if (n === 1) {
    drawRecPoint(temp[0], 1); 
    return temp[0].cpy();
  }

  for (let i = 0; i < n - 1; i++) {
    drawRecLine(temp[i], temp[i + 1]);
  }

  let nextLevel = [];
  for (let i = 0; i < n - 1; i++) {
    let newX = (1 - t) * temp[i].x + t * temp[i + 1].x;
    let newY = (1 - t) * temp[i].y + t * temp[i + 1].y;
    nextLevel.push(new Pair(newX, newY));
  }

  nextLevel.forEach((point, index) => {
    drawRecPoint(point, (r === controls.length - 1 && index === 0) ? 1 : 0);
  });

  return buildRecurciveOne(nextLevel, t, r + 1);
}

function clear() {
  ctxCur.clearRect(0, 0, canvasMainCurve.width, canvasMainCurve.height);
}

function drawRecLine(sPoint, ePoint, act = false) {
  if (!act) {
    ctxCur.lineWidth = 1 * coefC;
    ctxCur.strokeStyle = colors.nonActiveCurve;
  } else  {
    ctxCur.lineWidth = 2 * coefC;
    if (act == 1) {
      ctxCur.strokeStyle = colors.activeCurve;
    } else {
      ctxCur.strokeStyle = colors.activeSegment;
    }

  } 
  
  ctxCur.beginPath();
  ctxCur.moveTo(sPoint.x, sPoint.y);
  ctxCur.lineTo(ePoint.x, ePoint.y);
  ctxCur.stroke();
}

function drawRecPoint(point, act = 0) {
  if (act === 0)
    ctxCur.fillStyle = colors.nonActiveCurve;
  else if (act === 1)
    ctxCur.fillStyle = colors.activeCurve;
  else 
    ctxCur.fillStyle = colors.activeSegment;

  ctxCur.beginPath();

  if (!act)
    ctxCur.arc(point.x, point.y, 2.5 * coefC, 0, Math.PI * 2);
  else 
    ctxCur.arc(point.x, point.y, 3.5 * coefC, 0, Math.PI * 2);
  ctxCur.fill();
}