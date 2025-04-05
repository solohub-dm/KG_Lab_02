







class Point {
    static counter = 0;
    constructor(
        item,
        spans,
        pair,
        isBase,
        isSoft = true,
        id = undefined
    ) {
        if (id)
            this.id = id;
        else 
            this.id = ++Point.counter;

        this.item = item,
        this.spans = spans,
        this.pair = pair;
        this.coords = pair.posToCoords();
        this.isBase = isBase;
        this.isSoft = isSoft;
        if (isBase) {
            this.segment = [];
            this.segPos = [];
        } else {
            this.segment = undefined;
            this.segPos = undefined;
        }

        this.item.addEventListener("mouseenter", () => this.dispay());
        this.item.addEventListener("mouseleave", () => drawCurve());
        this.item.addEventListener("click", () => this.choosePoint());
    }
    setSegment(segment) {
        this.segment = segment;
    }
    reCalcSegment() {
        if (this.segment) {
    
            if (this.isBase) {
                if (this.segment[0]) {
                    this.segment[0].controls[this.segPos[0]] = this.coords;
                    this.segment[0].reCalcPoints();
                }
                if (this.segment[1]) {
                    this.segment[1].controls[this.segPos[1]] = this.coords;
                    this.segment[1].reCalcPoints();
                }
            } else {
                if (this.segment) {
                    this.segment.controls[this.segPos] = this.coords;
                    this.segment.reCalcPoints();
                }
            }
   
        
        }
    }
    choosePoint() {
        if (!this.isBase) return;

        let index = currentCurve.indexOf(this);
        currentPoint = currentCurve[index];
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
        pointPanel.scrollTop = pointPanel.scrollHeight;

        drawCurve();

        this.dispay();
    }
    dispay() {

        let index = currentCurve.indexOf(this);
        
        let point = this.getPos();
        ctxCur.strokeStyle = colors.black;
        
        ctxCur.lineWidth = 2 * coefM;

        if (this.isBase) {
            ctxCur.beginPath();
            if (currentPoint !== currentCurve[index])
                ctxCur.arc(point.x, point.y, 3.5 * coefM, 0, Math.PI * 2);
            else
                ctxCur.arc(point.x, point.y, 4.5 * coefM, 0, Math.PI * 2);
            ctxCur.stroke();
        } else {
            let other;
            if (currentCurve[index - 1] && currentCurve[index - 1].isBase) 
                other = currentCurve[index - 1].getPos();
            else 
                other = currentCurve[index + 1].getPos();

            let vec = other.subPO(point);
            let len = vec.len();
            let unitVec = vec.mulO(1 / len);
            drawDiamond(point, unitVec, 5.5, colors.black);
            drawDiamond(point, unitVec, 3, colors.white);
        }
    
    }

    setPos(pair) {
        this.pair = pair;
        this.coords = pair.posToCoords();

        this.reCalcSegment();

        let coordsRounded = this.coords.cpy();
        coordsRounded.roundAfterPoint(2);
        this.spans.x.textContent =  coordsRounded.x;
        this.spans.y.textContent =  coordsRounded.y;
    }
    getPos() {
        this.pair = this.coords.coordsToPos();
        return this.pair;
    }

    isInSystem() {

    }
    

}


const pointPanel = getElement("#point-panel");
function addPointItem(pair, isBase, isSoft = false, id) {

    const pointItem = document.createElement("div");
    pointItem.classList.add("point-item");

    const img = document.createElement("img");
    if (isBase)
        if (isSoft)
            img.src = "./img/base.png";
        else 
            img.src = "./img/base_hard.png";
    else 
        img.src = "./img/control.png";

    img.alt = "base point";
    img.classList.add("icon-base");

    let curCoords = pair.posToCoords();
    curCoords.roundAfterPoint(2);

    const pX = document.createElement("p");
    pX.classList.add("text-item-info");
    const spanX = document.createElement("span");
    spanX.textContent = curCoords.x;
    pX.innerHTML = "X: ";
    pX.appendChild(spanX);

    const pY = document.createElement("p");
    pY.classList.add("text-item-info");
    const spanY = document.createElement("span");
    spanY.textContent = curCoords.y;
    pY.innerHTML = "Y: ";
    pY.appendChild(spanY);

    pointItem.appendChild(img);
    pointItem.appendChild(pX);
    pointItem.appendChild(pY);
    pointPanel.appendChild(pointItem);
    pointPanel.scrollTop = pointPanel.scrollHeight;

    let point = new Point (
        pointItem,
        new Pair (
            spanX,
            spanY
        ),
        pair,
        isBase,
        isSoft,
        id ? id : undefined
    )
    if (Array.isArray(currentCurve)) {
        currentCurve.push(point);
    } else {
        if (!Array.isArray(currentProject.curves)) {
            currentProject.curves = [];
        }
        currentCurve = [point]; 
        currentProject.curves.push(currentCurve);  
    }

    return point;
}