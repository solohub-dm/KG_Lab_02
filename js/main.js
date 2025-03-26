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
            ///////////////////////////////////////////////////////////////
            windows.menu.windowButton.classList.toggle("active");
            windows.menu.windowButton.style.pointerEvents = "auto";
            ///////////////////////////////////////////////////////////////

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
                preCurrentWindow = currentWindow;
            } else {
                buttonProjectIcon.src = "./img/projects.png";
                if (preCurrentWindow.isMenuItem) 
                    sidePanelMenu.style.display = "flex";
                preCurrentWindow.openWindow();
                return;
            }
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

    polynom: new Window(
        getElement("#control-main-polynom"),
        [
            getElement("#control-button-points"),
            menuControlBody.children[1]
        ],
        getElement("#control-button-polynom")
    ),

    points: new Window(
        getElement("#control-main-points"),
        [
            getElement("#control-button-polynom"),
            menuControlBody.children[2]
        ],
        getElement("#control-button-points")
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

let preCurrentWindow;
let currentWindow = windows.projects;
let currentProject = undefined;
let projects = [];

let controlBodyProjects =  getElement("#control-body-projects");
let buttonCreateProject = getElement("#control-button-create");
let buttonProjectIcon = getElement("#icon-button-projects");
let sidePanelMenu = getElement("#side-panel-menu");

buttonCreateProject.addEventListener("click", createProject);
function createProject() {
    let project = createProjectItem();
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
    

        this.points = [];
    }

    openProject() {
        if (this.deleteIcon.contains(event.target)) return;
        if (this.input.contains(event.target)) return;
        if (this.isInputFocused) return;

        windows.projects.windowButton.classList.remove("passive");
        windows.menu.windowButton.classList.remove("passive");
        windows.pentool.windowButton.classList.remove("passive");

        windows.menu.openWindow();
    }

    deleteProject() {
        const res = confirm(
            'Are you sure to delete project "' + this.name + '"?'
        );
        if (!res) return;

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

    return project;
}
