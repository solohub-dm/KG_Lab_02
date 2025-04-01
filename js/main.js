const getElement = document.querySelector.bind(document);


class Window {
    constructor(
        controlPanel,
        windowButton,
        controlButton = undefined,
        isMenuItem = true
    ) {
        this.controlPanel =  controlPanel;
        this.windowButton = windowButton;
        this.controlButton = controlButton;
        this.isMenuItem = isMenuItem;


        if (this.isMenuItem) {
            this.windowButton[0].onclick = this.openWindow.bind(this);
            this.windowButton[1].onclick = this.openWindow.bind(this);
        } else 
            this.windowButton.onclick = this.openWindow.bind(this);
    }

    changeDisplay(isOn) {
        let displayDir = isOn ? "flex" : "none";

        this.controlPanel.style.display = displayDir;
        if (this.isMenuItem) {
            this.windowButton[0].classList.toggle("active");
            //
            windows.menu.windowButton.classList.toggle("active");
            windows.menu.windowButton.style.pointerEvents = "auto";
            //

        } else if (this !== windows.projects)
            this.windowButton.classList.toggle("active");
    }

    closeCurrentWindow() {
        this.changeDisplay(false);
    };
    
    openWindow() {
        if (this === windows.projects) {
            if (currentWindow !== windows.projects) {
                buttonProjectIcon.src = "./img/back.png";
                windows.menu.windowButton.classList.add("passive");
                windows.pentool.windowButton.classList.add("passive");
                prevProj = currentProject;
                closeProject(currentProject);
                preCurrentWindow = currentWindow;
            } else {
                buttonProjectIcon.src = "./img/projects.png";
                if (preCurrentWindow.isMenuItem) 
                    sidePanelMenu.style.display = "flex";
                preCurrentWindow.openWindow();
            prevProj.openProject();

                return;
            }
        } else if (currentWindow === windows.projects) {
            buttonProjectIcon.src = "./img/projects.png";
            // prevProj.openProject();

        }
 
        if (this === windows.menu) {
            sidePanelMenu.style.display = "flex";
        } else if ((currentWindow === windows.menu || currentWindow.isMenuItem) && this.isMenuItem !== true) {
            sidePanelMenu.style.display = "none";
        }
    
        currentWindow.closeCurrentWindow();   
        currentWindow = this;
        this.changeDisplay(true);
    }
}
let prevProj = undefined; 

const menuControlBody = getElement("#control-body-menu");
const windows = {
    projects: new Window(
        getElement("#control-main-projects"),
        getElement("#control-button-projects"),
        getElement("#control-button-create"),
        false
    ),

    menu: new Window(
        getElement("#control-main-menu"),
        getElement("#control-button-menu"),
        undefined,
        false
    ),
    
    pentool: new Window(
        getElement("#control-main-pentool"  ),
        getElement("#control-button-pentool"),
        getElement("#control-button-delete" ),
        false
    ),

    recursive: new Window(
        getElement("#control-main-recursive"),
        [
            getElement("#control-button-recursive"),
            menuControlBody.children[0]
        ],
        getElement("#control-button-start")
    ),

    points: new Window(
        getElement("#control-main-points"),
        [
            getElement("#control-button-points"),
            menuControlBody.children[1]
        ],
        getElement("#control-button-points")
    ),

    polynom: new Window(
        getElement("#control-main-polynom"),
        [
            getElement("#control-button-polynom"),
            menuControlBody.children[2]
        ],
        getElement("#control-button-polynom")
    ),

    pallete: new Window(
        getElement("#control-main-pallete"),
        [
            getElement("#control-button-pallete"),
            menuControlBody.children[3]
        ],
        getElement("#control-button-reset")
    ),
}

const colorInputs = document.querySelectorAll('input[type="color"]');
colorInputs.forEach((input) => {
    input.addEventListener("input", () => {
        colors = getColors();
        drawCurve();
    });
    input.addEventListener("focus", () => {
        canvasMainCurve.style.pointerEvents = "none";
    });

    input.addEventListener("blur", () => {
        canvasMainCurve.style.pointerEvents = "auto";
    });
})
const buttonResetPallete = getElement("#control-button-reset");
buttonResetPallete.addEventListener("click", () => {
    resetColors();
    colors = getColors();
    drawCurve();
})

function getColors() {
    return {
        curve: colorInputs[0].value,
        basePoint: colorInputs[1].value,
        controlPoint: colorInputs[2].value,
        tangentLine: colorInputs[3].value,
        nonTangentLine: colorInputs[4].value,
        lineSystem: " #4f4d4d",
        lineGridBold: "#afafaf",
        lineGridNormal: "#dbdbdb",
        dark: "#222222",
        black: "#000000",
        white: "#ffffff"
    }
  }
  
  
  windows.pallete.controlButton.addEventListener("click", resetColors);
  
  function resetColors() {
    console.log("resetColors done");
    colorInputs[0].value = "#222222"; 
    colorInputs[1].value = "#67deff";
    colorInputs[2].value = "#51b1cc";
    colorInputs[3].value = "#51b1cc";
    colorInputs[4].value = "#dbdbdb"; 
  }
  
  resetColors();
  let colors = getColors();

let preCurrentWindow;
// let preCurrentWindow = windows.points;
// let currentWindow = windows.points;
let currentWindow = windows.projects;
let currentProject;
let projects = [];

let controlBodyProjects =  getElement("#control-body-projects");
let buttonCreateProject = getElement("#control-button-create");
let buttonProjectIcon = getElement("#icon-button-projects");
let sidePanelMenu = getElement("#side-panel-menu");

buttonCreateProject.addEventListener("click", createProject);
function createProject() {
    let project = createProjectItem();
}

function createProjectItem() {
    const container = controlBodyProjects;

    const menuItem = document.createElement("div");
    menuItem.classList.add("menu-item");
            
    const lineBlock = document.createElement("div");
    lineBlock.classList.add("line-block");

    const input = document.createElement("input");
    input.type = "text";
    input.classList.add("project-name");

    const deleteIcon = document.createElement("img");
    deleteIcon.src = "./img/delete.png";
    deleteIcon.alt = "delete project";
    deleteIcon.classList.add("project-icon");

    lineBlock.appendChild(input);
    lineBlock.appendChild(deleteIcon);

    const canvas = document.createElement("canvas");
    canvas.classList.add("canvas-preview");

    menuItem.appendChild(lineBlock);
    menuItem.appendChild(canvas);

    container.prepend(menuItem);

    let project = new Project (
        menuItem,
        input,
        deleteIcon,
        canvas
    )
    projects.push(project);

    
    menuItem.dataset.project = project;

    return project;
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
    
    draw(isActive = false, qwe = false) {

        if (!isActive)
            ctxCur.strokeStyle = colors.curve;
        else 
            ctxCur.strokeStyle = colors.tangentLine;

        if (!this.isLine) {
            let coef = this.setMaxDist(Segment.maxDist);        


            ctxCur.lineWidth = 2 * coefM;
            if (qwe) ctxCur.lineWidth = 6 * coefM;
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
            ctxCur.lineWidth = 2 * coefM;

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

    calcMap(xs, pres) {   

        this.xPres = pres;

        let mp = new Map();
        let i = 0;
        let len = this.points.length;
        let z = this.points[0].pair.x < this.points[1].pair.x;
        let nx = Math.floor(this.points[0].pair.x / xs) * xs;
        // if (z) nx += xs;

        while( i < len ) {

            if (z)
                nx += xs;
            else 
                nx -= xs;

            let pp = this.points[i];


            while( 
                i < len - 1 && 
                ((pp.pair.x < this.points[i + 1].pair.x) === z) &&
                ((this.points[i + 1].pair.x < nx) === z)
            ) {

                i++;
                pp = this.points[i];
            }


            if ( i < len - 1 && (pp.pair.x < this.points[i + 1].pair.x) !== z) {
                z = !z;
            } else {
                if (i === len) break;
               
    
                if (Math.abs(pp.pair.x - nx) < pres) {
                    if (!mp.has(nx.toFixed(4)))
                        mp.set(nx.toFixed(4), []);
                    let arr = mp.get(nx.toFixed(4));
                    arr.push(pp.pair);
                } else if (i === len - 1)  {
                    break;
                } else {
                    i++;
                    if (i === len) break;
                    
                    let p;
                    let np = this.points[i];
                    this.xFind = nx;
    
                    if (z)
                        p = this.calcRecXPres(pp, np);
                    else 
                        p = this.calcRecXPres(np, pp);
    
                        if (!mp.has(nx.toFixed(4)))
                            mp.set(nx.toFixed(4), []);
                        let arr = mp.get(nx.toFixed(4));
                    arr.push(p.pair);
                }
            }


        }
        return mp;
    }

    calcRecXPres (sp1, sp2) {
        recout++;
        // if (recout > 10) return;
        let tm = (sp1.t + sp2.t) / 2;
        let spm = this.calcSegPoint(tm);

        let s = Math.abs(spm.pair.x - this.xFind) < this.xPres;


        if (s) 
            return spm;
        else 
            if (spm.pair.x > this.xFind) 
                return this.calcRecXPres(sp1, spm);
            else 
                return this.calcRecXPres(spm, sp2);
    }

    // recursiveCalcMidl(sp1, sp2) {
    //     let tm = (sp1.t + sp2.t) / 2;
    //     let spm = this.calcSegPoint(tm);

    //     let d1 = spm.dist(sp1);
    //     let d2 = spm.dist(sp2);
    //     let angle = this.calcAngle(sp1, spm, sp2);

    //     let temp = [];
    //     if (d1 > this.curMaxDist || angle > this.maxAngle) 
    //         temp.push(...this.recursiveCalcMidl(sp1, spm));
    //     temp.push(spm);
    //     if (d2 > this.curMaxDist || angle > this.maxAngle) 
    //         temp.push(...this.recursiveCalcMidl(spm, sp2));

    //     return temp;
    // }


    // recursiveCalcMidl(sp1, sp2, tryEnd) {
    //     let tm = (sp1.t + sp2.t) / 2;
    //     let spm = this.calcSegPoint(tm);

    //     let d1 = spm.dist(sp1);
    //     let d2 = spm.dist(sp2);
    //     let angle = this.calcAngle(sp1, spm, sp2);
    //     let e1 = d1 < this.curMaxDist && angle < this.maxAngle;
    //     let e2 = d2 < this.curMaxDist && angle < this.maxAngle;

    //     if (tryEnd && e1 && e2)
    //         return []
    //     else {
    //         let temp = [];
     
    //         temp.push(...this.recursiveCalcMidl(sp1, spm, e1 && e2));
    //         temp.push(spm);
    //         temp.push(...this.recursiveCalcMidl(spm, sp2, e1 && e2));
    
    //         return temp;
    //     }
    // }
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

    calcAngle(sp1, spm, sp2) {
        let vec1 = spm.pair.subPO(sp1.pair);
        let vec2 = sp2.pair.subPO(spm.pair);

        let dot = vec1.x * vec2.x + vec1.y * vec2.y;
        let dist1 = vec1.len();
        let dist2 = vec2.len();

        return Math.acos(dot / (dist1 * dist2));
    }
}

class Project {
    static projectCounter = 0;
    constructor(
        menuItem, 
        input, 
        deleteIcon, 
        canvas
    ) {
        this.id = ++Project.projectCounter;
        this.name = "Project_" + this.id;

        this.menuItem = menuItem;
        this.menuItem.addEventListener("click", () => this.openProject());
        this.menuItem.addEventListener("mouseenter", () => {
            console.log("mouseenter");
            console.log("this: ", this);
            if (!this.isClear)
            this.drawThis();
        } );
        this.menuItem.addEventListener("mouseleave", () => {
            console.log("mouseenter");

            if (!currentProject || currentWindow === windows.projects)
                clearCanv();
        });

        this.input = input;
        this.isInputFocused = false;
        this.input.value = this.name;
        this.input.addEventListener("change", (event) => this.changeName(event));
        this.input.addEventListener("focus", () => this.isInputFocused = true);
        this.input.addEventListener("blur", () => {
            setTimeout(() => {
                this.isInputFocused = false
            }, 150);
        });

        this.deleteIcon = deleteIcon;
        this.deleteIcon.addEventListener("click", () => this.deleteProject());

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        let sizeR = new Pair(
            this.canvas.offsetWidth, 
            this.canvas.offsetHeight
        );
        let sizeP = sizeR.mulO(coefM);
        this.canvas.width = sizeP.x;
        this.canvas.height = sizeP.y;
    
        this.segments = [];
        this.curves = [];
        this.param = {
            maxDivsStep: 29 * coefM,
            minDivsStep: 14 * coefM,
            curDivsStep: (maxDivsStep + minDivsStep) / 2,
            curDivsNumbr: 0,
            curDivsValue: 1,
            dragOffset: new Pair(0, 0)
        }
        this.isClear = true;

    }

    drawThis() {
        currentProject = this;
        currentCurve = undefined;
        currentPoint = undefined;
        currentSegment = undefined;

        maxDivsStep = this.param.maxDivsStep;
        minDivsStep = this.param.minDivsStep;
        curDivsStep = this.param.curDivsStep;
        curDivsNumbr = this.param.curDivsNumbr;
        curDivsValue = this.param.curDivsValue;
        dragOffset = this.param.dragOffset;

        if (prevProj !== this) {
            pointPanel.innerHTML = "";
            tableBodyPoint.innerHTML = '';
            tableBody.innerHTML = '';
        }

        updateCanvasSize();
        drawSystem(canvasMain, ctx);
        drawCurve()
    }

    openProject() {
        if (this.deleteIcon.contains(event.target)) return;
        if (this.input.contains(event.target)) return;
        if (this.isInputFocused) return;
        this.isClear = false;
        windows.projects.windowButton.classList.remove("passive");
        windows.menu.windowButton.classList.remove("passive");
        windows.pentool.windowButton.classList.remove("passive");

        blockCanvas(false);
        windows.menu.openWindow();

        this.drawThis();
    }

    deleteProject() {
        const res = confirm(
            'Are you sure to delete project "' + this.name + '"?'
        );
        if (!res) return;

        if (currentProject === this) {
            windows.projects.windowButton.classList.add("passive");

        }

        const index = projects.findIndex(
            (project) => project.id === this.id
        );
        
        if (index !== -1) {
            projects.splice(index, 1);
            this.menuItem.remove();
        }

        if (currentProject === this) {
            currentProject = undefined;
            buttonControlProject.style.display = "none";
        }
    }

    changeName() {
        if (this.input.value.trim() !== "") {
            this.name = this.input.value;
        } else {
            this.input.value = this.name;
        }
    }
}

function clearCanv() {
    ctx.clearRect(0, 0, canvasMain.width, canvasMain.height);
    ctxCur.clearRect(0, 0, canvasMainCurve.width, canvasMainCurve.height);
}

function closeProject(project) {
    project.canvas.width = sizeM.x;
    project.canvas.height = sizeM.y;
    console.log(project);
    // console.log(canvasMain);
    console.log(project.cxt);
    currentCurve = undefined;
    drawCurve(true);
    // project.ctx.drawImage(canvasMain, 0, 0);
    project.ctx.drawImage(canvasMainCurve, 0, 0);

    blockCanvas(true);
    clearCanv();
    project.param = {
        maxDivsStep: maxDivsStep,
        minDivsStep: minDivsStep,
        curDivsStep: curDivsStep,
        curDivsNumbr: curDivsNumbr,
        curDivsValue: curDivsValue,
        dragOffset: dragOffset
    }
    currentProject = undefined;
}

function blockCanvas(isBlock) {
    if (isBlock) {
        canvasMainCurve.style.pointerEvents = "none";
    } else 
        canvasMainCurve.style.pointerEvents = "auto";

}
