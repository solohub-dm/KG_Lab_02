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
        this.windowButton.onclick = this.openWindow.bind(this);
    }

    changeDisplay(isOn) {
        let displayDir = isOn ? "flex" : "none";
        let displayRev = isOn ? "none" : "flex";

        this.controlPanel.style.display = displayDir;
        if (!this.isMenuItem)
            this.windowButton.style.display = displayRev;
        if (this.controlButton) 
            this.controlButton.style.display = displayDir;
    }

    closeCurrentWindow() {
        this.changeDisplay(false);
    };
    
    openWindow() {
        currentWindow.closeCurrentWindow();
        if (this.isMenuItem)
            windows.menu.windowButton.classList.add("with-pentool");
        else 
            windows.menu.windowButton.classList.remove("with-pentool");
        
        
        currentWindow = this;
        this.changeDisplay(true);
    }
}

class Project {
    constructor(

    ) {

    };
};

const menuControlPanel = getElement("#control-main-menu");
const windows = {
    menu: new Window(
        menuControlPanel,
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
        menuControlPanel.children[0],
        getElement("#control-button-start"  )
    ),

    polynom: new Window(
        getElement("#control-main-polynom"),
        menuControlPanel.children[1],
    ),

    points: new Window(
        getElement("#control-main-points"),
        menuControlPanel.children[2],
    ),

    pallete: new Window(
        getElement("#control-main-pallete"),
        menuControlPanel.children[3],
        getElement("#control-button-reset")
    ),
}

let currentWindow = windows.menu;
let isOpened = false;
let projects = [];

let controlProjects =  getElement("#control-main-projects");
let buttonControlProject = getElement("#control-button-projects");
let iconButtonControlProject = getElement("#icon-button-projects");
let buttonCreateProject = getElement("#control-button-create");

buttonControlProject.addEventListener("click", openProjects);
function openProjects() {
    if (isOpened) {
        currentWindow.closeCurrentWindow();
        controlProjects.style.display = "flex";
        buttonControlProject.style.display = "flex";
        buttonCreateProject.style.display = "flex";
        iconButtonControlProject.src = "./img/back.png";
        windows.pentool.windowButton.style.display = "none";
        windows.menu.windowButton.style.display = "none";
        isOpened = false;
    } else {
        closeProjectsWindow();
        currentWindow.openWindow();
    }

}

function closeProjectsWindow() {
    controlProjects.style.display = "none";
    buttonControlProject.style.display = "flex";
    buttonCreateProject.style.display = "none";
    iconButtonControlProject.src = "./img/projects.png";
    windows.menu.windowButton.style.display = "flex";
    windows.pentool.windowButton.style.display = "flex";
    isOpened = true;
}

buttonCreateProject.addEventListener("click", createProject);
function createProject() {
    openProject()
}

function openProject() {
    closeProjectsWindow();
    windows.menu.openWindow();
}