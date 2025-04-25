


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

  subP (pair) {
    this.x -= pair.x, 
    this.y -= pair.y
  }
  subPO (pair) {
    return new Pair(
      this.x - pair.x, 
      this.y - pair.y
    );
  }
  mulC (coef) {
    this.x *= coef, 
    this.y *= coef
  }
  mulCO (coef) {
  return new Pair(
      this.x * coef, 
      this.y * coef
  );
  }

  addP (pair) {
    this.x += pair.x, 
    this.y += pair.y
  }
  addPO (pair) {
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
      (this.x - midlDrag.x) / (curGridSize * 4) * curDivsValue,
      (midlDrag.y - this.y) / (curGridSize * 4) * curDivsValue
    )
  }
  coordsToPos() {
    let posX = midlDrag.x + (this.x * (curGridSize * 4)) / curDivsValue;
    let posY = midlDrag.y - (this.y * (curGridSize * 4)) / curDivsValue;
    return new Pair(posX, posY);
  }
}

const pointPanel = getElement("#point-panel");

class Point {
  static counter = 0;
  constructor(
    pair,
    isBase,
    isSoft = true,
    id = undefined
  ) {
    if (id) this.id = id;
    else this.id = ++Point.counter;

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

    this.createPointItem();
    this.item.addEventListener("mouseenter", () => this.dispayPoint());
    this.item.addEventListener("mouseleave", () => drawCurve());
    this.item.addEventListener("click", () => this.choosePoint());
  }

  createPointItem() {
    const pointItem = document.createElement("div");
    pointItem.classList.add("point-item");

    const img = document.createElement("img");
    if (this.isBase)
        if (this.isSoft)
            img.src = "./img/base.png";
        else 
            img.src = "./img/base_hard.png";
    else 
        img.src = "./img/control.png";

    img.alt = "base point";
    img.classList.add("icon-base");

    let curCoords = this.coords.cpy();
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

    this.item = pointItem;
    this.spans = new Pair (
      spanX,
      spanY
    );
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
        currentSegment = undefined;

        let index = currentCurve.indexOf(this);
        choosePoint(currentCurve[index])

        drawCurve();
        this.dispayPoint();
    }

    dispayPoint() {
        let index = currentCurve.indexOf(this);
        
        let point = this.getPos();
        ctxCur.strokeStyle = colors.black;
        
        ctxCur.lineWidth = 2 * coefC;

        if (this.isBase) {
            ctxCur.beginPath();
            if (currentPoint !== currentCurve[index])
                ctxCur.arc(point.x, point.y, 3.5 * coefC, 0, Math.PI * 2);
            else
                ctxCur.arc(point.x, point.y, 4.5 * coefC, 0, Math.PI * 2);
            ctxCur.stroke();
        } else {
            let other;
            if (currentCurve[index - 1] && currentCurve[index - 1].isBase) 
                other = currentCurve[index - 1].getPos();
            else 
                other = currentCurve[index + 1].getPos();

            let vec = other.subPO(point);
            let len = vec.len();
            let unitVec = vec.mulCO(1 / len);
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
}

function addPoint(pair, isBase, isSoft = false, id = undefined) {

    let point = new Point (
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

class SegPoint {
    constructor (
        pair,
        t
    ) {
        this.pair = pair;
        this.t = t;
    }
    dist(sp) {
        return this.pair.dist(sp.pair);
    }
}

class Segment {
    static maxDist = undefined;
    constructor(
        controls,
        curve,
        isLine = false
    ) {
        this.curve = curve;
        this.controls = controls;
        this.curMaxDist = Number.MAX_VALUE;
        this.isLine = isLine;
        if (!isLine) {
            this.points = [
                new SegPoint(controls[0], 0),
                this.calcSegPoint(0.5),
                new SegPoint(controls[3], 1)
            ];
            this.tms = Number.MAX_VALUE;
            this.maxAngle = Math.PI / 36;
            this.calcPoints();
            this.xPres = undefined;
            this.xFind = undefined;
        } 
    }
    
    draw(isActive = 0) {
        ctxCur.lineWidth = 2 * coefC;

        // if (isActive === 0) ctxCur.lineWidth = 2 * coefC;
        // else                ctxCur.lineWidth = 2.5 * coefC;
        
        if      (isActive === 0)  ctxCur.strokeStyle = colors.nonActiveCurve;
        else if (isActive === 1)  ctxCur.strokeStyle = colors.activeCurve; 
        else                      ctxCur.strokeStyle = colors.activeSegment;
            
        if (!this.isLine) {
            let coef = this.setMaxDist(Segment.maxDist);        

            ctxCur.beginPath();
            let points = this.points;

            let pos = points[0].pair.coordsToPos();
            ctxCur.moveTo(pos.x, pos.y);
            for (let i = 1; i < points.length - 1; i += coef) {
                pos = points[i].pair.coordsToPos();
                ctxCur.lineTo(pos.x, pos.y);
            }
            pos = points.at(-1).pair.coordsToPos();
            ctxCur.lineTo(pos.x, pos.y);
        } else {
            ctxCur.beginPath();
            ctxCur.moveTo(this.controls[0].coordsToPos().x, this.controls[0].coordsToPos().y);
            ctxCur.lineTo(this.controls[1].coordsToPos().x, this.controls[1].coordsToPos().y);
            ctxCur.stroke();
        }

        ctxCur.stroke();
    }

    setMaxDist(maxDist) {
        let coef = 1;
        if (maxDist < this.curMaxDist) {
            this.curMaxDist = maxDist;
            this.calcPoints();
        } else 
            coef = Math.floor(maxDist / this.curMaxDist);

        return coef;
    }

    reCalcPoints() {
        if (this.isLine) return;

        this.tms = Number.MAX_VALUE;  
        this.points = [
            new SegPoint(this.controls[0], 0),
            this.calcSegPoint(0.5),
            new SegPoint(this.controls[3], 1)
        ];
        this.curMaxDist = Segment.maxDist;  

        this.calcPoints();
    }

    calcPoints() {
        if (this.isLine) return;

        let points = this.points;
        for (let i = 0; i < points.length - 1; i++) {
            let dist = points[i].dist(points[i + 1]);
            if (dist > this.curMaxDist) {
                let temp = this.recursiveCalcMidlD(points[i], points[i + 1]);
                points.splice(i + 1, 0, ...temp); 
            }
        }
        for (let i = 0; i < points.length - 1; i++) {
            let td = points[i + 1].t - points[i].t;
            if (td > this.tms) {
                let temp = this.recursiveCalcMidlT(points[i], points[i + 1]);
                points.splice(i + 1, 0, ...temp); 
            }
        }
    }

    recursiveCalcMidlD(sp1, sp2) {
        let tm = (sp1.t + sp2.t) / 2;
        let spm = this.calcSegPoint(tm);

        let d1 = spm.dist(sp1) > this.curMaxDist;
        let d2 = spm.dist(sp2) > this.curMaxDist;

        let temp = [];
        if (d1) temp.push(...this.recursiveCalcMidlD(sp1, spm));
        temp.push(spm);
        if (d2) temp.push(...this.recursiveCalcMidlD(spm, sp2));

        if (!d1 && !d2) {
            let ts = tm - sp1.t;
            if (ts < this.tms) this.tms = ts;
        }
        return temp;
    }

    recursiveCalcMidlT(sp1, sp2) {
        
        let tm = (sp1.t + sp2.t) / 2;
        let spm = this.calcSegPoint(tm);

        let td = tm - sp1.t;
        if (td > this.tms) {
            let temp = [];
            temp.push(...this.recursiveCalcMidlT(sp1, spm));
            temp.push(spm);
            temp.push(...this.recursiveCalcMidlT(spm, sp2));
            return temp;
        } else return [spm];

    }

    calcMap(xStep, xPres, prevStart) {   
        console.log("calcMap");
        this.xPres = xPres;

        let map = new Map();
        let index = 0;
        let count = this.points.length;
        let xDir = this.points[0].pair.x < this.points[1].pair.x;

        let smallestDigit = getSmallestDigit(xStep);

        //
        let start = prevStart;
        while (start < this.points[0].pair.x) start += xStep;
        let xNext = start;
        // let xNext = Math.floor(this.points[0].pair.x / smallestDigit) * smallestDigit;
        

            if (xDir) xNext -= xStep;
            else      xNext += xStep;
            
            while( index < count ) {
                if (xDir) xNext += xStep;
                else      xNext -= xStep;

 
                // if (index === 0 ) {
                //     params.prevStart = xNext;
                // }

    


                let pp = this.points[index];

                while( 
                    index < count - 1 && 
                    ((pp.pair.x < this.points[index + 1].pair.x) === xDir) &&
                    ((this.points[index + 1].pair.x < xNext) === xDir)
                ) {
                    index++;
                    pp = this.points[index];
                }


                if ( index < count - 1 && (pp.pair.x < this.points[index + 1].pair.x) !== xDir) {
                    xDir = !xDir;
                } else {
                    if (index === count) break;
                
                    if (Math.abs(pp.pair.x - xNext) < xPres) {
                        if (!map.has(xNext.toFixed(4)))
                            map.set(xNext.toFixed(4), []);
                        let arr = map.get(xNext.toFixed(4));
                        arr.push(pp.pair);
                    } else if (index === count - 1)  {
                        break;
                    } else {
                        index++;
                        if (index === count) break;
                        
                        let p;
                        let np = this.points[index];
                        this.xFind = xNext;
                        recStat = 0;
                        if (xDir)
                            p = this.calcRecXPres(pp, np);
                        else 
                            p = this.calcRecXPres(np, pp);
        
                            if (!map.has(xNext.toFixed(4)))
                                map.set(xNext.toFixed(4), []);
                            let arr = map.get(xNext.toFixed(4));
                        arr.push(p.pair);
                    }
                }
            }

            


            smallestDigit /= 10;
            xNext = Math.floor(this.points[0].pair.x / smallestDigit) * smallestDigit;
            index = 0;
            xDir = this.points[0].pair.x < this.points[1].pair.x;

            console.log(map.size); 
        console.log("map curve", map); 

        return map;
    }

    // calcMap(xStep, xPres) {   

    //     this.xPres = xPres;

    //     let map = new Map();
    //     let index = 0;
    //     let count = this.points.length;
    //     let xDir = this.points[0].pair.x < this.points[1].pair.x;

        

    //     let xNext = Math.floor(this.points[0].pair.x / xStep) * xStep;

    //     while( index < count ) {
    //         if (xDir) xNext += xStep;
    //         else      xNext -= xStep;

    //         let pp = this.points[index];

    //         while( 
    //             index < count - 1 && 
    //             ((pp.pair.x < this.points[index + 1].pair.x) === xDir) &&
    //             ((this.points[index + 1].pair.x < xNext) === xDir)
    //         ) {
    //             index++;
    //             pp = this.points[index];
    //         }


    //         if ( index < count - 1 && (pp.pair.x < this.points[index + 1].pair.x) !== xDir) {
    //             xDir = !xDir;
    //         } else {
    //             if (index === count) break;
               
    //             if (Math.abs(pp.pair.x - xNext) < xPres) {
    //                 if (!map.has(xNext.toFixed(4)))
    //                     map.set(xNext.toFixed(4), []);
    //                 let arr = map.get(xNext.toFixed(4));
    //                 arr.push(pp.pair);
    //             } else if (index === count - 1)  {
    //                 break;
    //             } else {
    //                 index++;
    //                 if (index === count) break;
                    
    //                 let p;
    //                 let np = this.points[index];
    //                 this.xFind = xNext;
    //                 recStat = 0;
    //                 if (xDir)
    //                     p = this.calcRecXPres(pp, np);
    //                 else 
    //                     p = this.calcRecXPres(np, pp);
    
    //                     if (!map.has(xNext.toFixed(4)))
    //                         map.set(xNext.toFixed(4), []);
    //                     let arr = map.get(xNext.toFixed(4));
    //                 arr.push(p.pair);
    //             }
    //         }
    //     }
    //     return map;
    // }

    calcRecXPres (sp1, sp2) {
        recStat++;
        if (recStat > 20) return sp1;

        let tm = (sp1.t + sp2.t) / 2;
        let spm = this.calcSegPoint(tm);

        let s = Math.abs(spm.pair.x - this.xFind) < this.xPres;


        if (s) 
            return spm;
        else {
            if (spm.pair.x > this.xFind) 
                return this.calcRecXPres(sp1, spm);
            else 
                return this.calcRecXPres(spm, sp2);
        }

    }

    calcSegPoint(t) { 
        let [P0, P1, P2, P3] = this.controls;

        let point = new Pair(
            Math.pow(1 - t, 3) * P0.x +
            3 * Math.pow(1 - t, 2) * t * P1.x +
            3 * (1 - t) * Math.pow(t, 2) * P2.x +
            Math.pow(t, 3) * P3.x,

            Math.pow(1 - t, 3) * P0.y +
            3 * Math.pow(1 - t, 2) * t * P1.y +
            3 * (1 - t) * Math.pow(t, 2) * P2.y +
            Math.pow(t, 3) * P3.y
        );

        return new SegPoint(point, t);
    }
}

let recStat = 0;