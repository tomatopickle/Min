let tabs = document.querySelector("x-doctabs");
const path = require("path");
const fs = require("fs");
const { ipcRenderer } = require("electron");
const { nativeTheme, dialog } = require('@electron/remote');
// Adding these first coz they're are needed to decide theme
document.getElementById("darkModeToggle").toggled = (db.local.get("settings.theme") == 'dark');
changeTheme();
document.getElementById("accentColorSelect").value = (db.local.get("settings.color") || 'blue');
changeColor();
function changeTheme() {
    const toggle = document.getElementById("darkModeToggle");
    const theme = toggle.toggled ? "dark" : "light";
    document.querySelector('meta[name="xel-theme"]').setAttribute("content", `./scripts/theme-${theme}.css`);
    nativeTheme.themeSource = theme;
    db.local.set("settings.theme", theme);
}
function changeColor() {
    const select = document.getElementById("accentColorSelect");
    const color = select.value;
    document.querySelector('meta[name="xel-accent-color"]').setAttribute("content", color);
    db.local.set("settings.color", color);
}
function selectTab(id, isNewTab) {
    document.querySelector("webview.open")?.classList.remove("open");
    const window = document.getElementById(`window${id}`);
    window?.classList.add("open");
    if (window.src.includes("views") && window.src.includes("newtab")) {
        document.getElementById("searchbar").focus();
    }
    if (isNewTab) return
    document.getElementById("searchbar").value = changeUrlName(window.src);
    document.getElementById("backBtn").disabled = !window.canGoBack();
    document.getElementById("forwardBtn").disabled = !window.canGoForward();
    if (!window.isLoading()) {
        document.getElementById("reloadBtn").innerHTML = `<x-icon size="small" iconset="fluent-outlined.svg" name="refresh"></x-icon> `;
    } else {
        document.getElementById("reloadBtn").innerHTML = `<img src="./titleBar/winIcons/close-w-20.png"/>`;
    }
}
function closeWindow(id) {
    document.getElementById(`window${id}`).remove();
    setTimeout(() => {
        // Waiting for animation end and the next tab to be selected
        if (!!document.querySelector("x-doctabs").childElementCount && !!document.querySelector("x-doctab[selected]")) {
            selectTab(document.querySelector("x-doctab[selected]").id.replace("tab", ""));
        } else if (document.querySelector("x-doctabs").childElementCount == 0) {
            openHome();
            document.getElementById("searchbar").focus();
        }
    }, 50);
}
function openLink(url) {
    var id = Math.floor(100000 + Math.random() * 900000);
    var page = document.createElement("webview");
    page.id = `window${id}`;
    page.src = url;
    page.webpreferences = "nativeWindowOpen=false"
    document.getElementById("windows").appendChild(page);
    let tab = document.createElement("x-doctab");
    if (document.querySelector("x-doctab[selected]")) {
        document.querySelector("x-doctab[selected]").selected = false;
    }
    if (url == "min://newtab") {
        console.log("New tab it ss")
        page.setAttribute("nodeIntegration", true);
        page.setAttribute("webpreferences", "contextIsolation=false");
        page.addEventListener("dom-ready", function () {
            page.send("bg", localStorage.getItem("settings.bg") || "defbg.svg");
        });
    }
    page.addEventListener('ipc-message', (event, s) => {
        if (event.channel == "settings") {
            document.getElementById("settingsBtn").click();
        }
    });
    tab.selected = true;
    tab.id = `tab${id}`;
    tab.innerHTML = `<x-throbber  type="spinner" size="small" computedSize="small"></x-throbber><x-label>${changeUrlName(url)}</x-label>`;
    page.addEventListener('did-start-loading', (e) => {
        startLoading(e);
    });
    page.addEventListener('close', (e) => {
        tabs.closeTab(document.getElementById(`tab${e.target.id.replace("window", "")}`))
        closeWindow(e.target.id.replace("window", ""));
    })
    page.addEventListener('new-window', (e) => {
        openLink(e.url);
    });
    page.addEventListener('did-get-redirect-request', (e) => {
        startLoading(e);
    });
    tab.onclick = function (e) {
        selectTab(id);
    }
    page.addEventListener('did-stop-loading', (e) => {
        tab.innerHTML = `<img src="${getBase(e.target.src)}/favicon.ico" /><x-label>${changeUrlName(page.getTitle().toString())}</x-label>`;
        tab.title = page.getTitle().toString();
        if (e.target.classList.contains("open")) {
            document.getElementById("reloadBtn").innerHTML = `<x-icon size="small" iconset="fluent-outlined.svg" name="refresh"></x-icon> `;
        }
        if (!page.src.includes("views") && !page.src.includes("newtab")) {
            var history = db.local.getJSON("history") || [];
            history.unshift(({ url: page.src, title: page.getTitle() }));
            db.local.setJSON("history", history);
        }
    });
    tab.addEventListener("wheel", event => {
        tabs.closeTab(tab);
        closeWindow(page);
    });
    page.addEventListener('did-navigate', (e) => {
        const window = e.target;
        if (window.classList.contains("open")) {
            document.getElementById("searchbar").value = changeUrlName(e.url);
            document.getElementById("backBtn").disabled = !window.canGoBack();
            document.getElementById("forwardBtn").disabled = !window.canGoForward();
        }
    });
    tabs.openTab(tab);
    selectTab(id, true);
}
tabs.addEventListener("open", (event) => {
    event.preventDefault();
    openHome();
    document.getElementById("searchbar").focus();
});
openHome();
document.getElementById("searchbar").focus();
tabs.addEventListener("select", (e) => {
    selectTab(e.detail.id.replace("tab", ""));
});
tabs.addEventListener("close", (e) => {
    console.log(e)
    closeWindow(e.detail.id.replace("tab", ""));
});
function getBase(url) {
    var pathArray = url.split('/');
    var protocol = pathArray[0];
    var host = pathArray[2];
    var url = protocol + '//' + host;
    return url
}
function validURL(str) {
    return str.includes(":");
}
function go(e) {
    const q = e.target.value;
    if (e.key == 'Enter') {
        if (validURL(q)) {
            document.querySelector("webview.open").src = q;
        } else {
            document.querySelector("webview.open").src = `https://www.google.com/search?q=${q.replaceAll(" ", "+")}`;
        }
    }
}
function reload(window) {
    if (!window) {
        const window = document.querySelector("webview.open");
        if (window.isLoading()) {
            window.stop();
        } else {
            window.reload();
        }
    }
}
function back(window) {
    if (!window) {
        const window = document.querySelector("webview.open");
        if (window.canGoBack()) {
            window.goBack();
        }
    }
}
function forward(window) {
    if (!window) {
        const window = document.querySelector("webview.open");
        if (window.canGoForward()) {
            window.goForward();
        }
    }
}
ipcRenderer.on("action", function (e, data) {
    console.log(data);
    if (data.type == "openLinkInNewTab") {
        openLink(data.value);
    }
});
function startLoading(e) {
    console.log(e.target.id.replace("window", ""))
    const tab = document.getElementById(`tab${e.target.id.replace("window", "")}`);
    tab.innerHTML = `<x-throbber  type="spinner" size="small" computedSize="small"></x-throbber><x-label>${changeUrlName(e.target.src)}</x-label>`;
    if (e.target.classList.contains("open")) {
        document.getElementById("searchbar").value = changeUrlName(e.target.src);
        document.getElementById("reloadBtn").innerHTML = `<img src="./titleBar/winIcons/close-w-20.png"/>`;
    }
}
function openHome() {
    openLink("min://newtab");
    document.getElementById("searchbar").focus();
}
function changeUrlName(url) {
    if (url.includes("min://")) {
        if (url.includes("newtab")) {
            return ""
        }
    } else {
        return url
    }
}
function changeSettingsPage(e) {
    document.querySelector(".setting.open").classList.remove("open");
    document.getElementById(e).classList.add("open");
}
var selectedBg = localStorage.getItem("settings.bg") || "defbg.svg";
const wallpapers = ["crystal.jpeg", "dark.jpg", "defbg.svg", "Float.jpg", "indeepspace1-tomanderswatkins.jpg", "indeepspace2-tomanderswatkins.jpg", "indeepspace5-tomanderswatkins.jpg", "infinity_gx.png", "Liquid-Metallic.jpg", "Mountain-Color.jpg", "pink.jpg", "reborn3_dark.svg", "reborn5_dark.png", "sunset.png"];
wallpapers.forEach(item => {
    var pics = document.getElementById("bgs");
    const img = document.createElement("img");
    if (wallpapers.includes(item)) {
        img.src = "./views/newtab/wallpapers/" + item;
    } else {
        img.src = item;
    }
    img.onclick = function (e) {
        document.querySelector("#bgs img.selected")?.classList.remove("selected");
        e.target.classList.add("selected");
        document.querySelectorAll("webview").forEach(el => {
            if (el.src == "min://newtab") {
                el.send("bg", item);
                localStorage.setItem("settings.bg", item);
            }
        });
    }
    if (item == selectedBg) {
        img.classList.add("selected");
    }
    pics.appendChild(img);
});
function uploadBgImage() {
    dialog.showOpenDialog({ properties: ['openFile'] }).then((data) => {
        console.log(data)
        const filePath = data.filePaths[0];
        const fs = require('fs');
        fs.copyFile(filePath, `${!isDev() ? process.resourcesPath : "./views/newtab/wallpapers"}/upload.jpg`, (err) => {
            if (err) throw err;
        });
        const img = document.createElement("img");
        document.querySelector("#bgs img.selected")?.classList.remove("selected");
        img.classList.add("selected");
        document.getElementById("bgs").appendChild(img);
        document.querySelectorAll("webview").forEach(el => {
            if (el.src == "min://newtab") {
                el.src = "min://newtab";
                el.send("bg", `${!isDev() ? process.resourcesPath : "./views/newtab/wallpapers"}/upload.jpg`);
                localStorage.setItem("settings.bg", "upload.jpg");
            }
        });
    })

}
function isDev() {
    return process.argv0.includes("tskbrorwidgettest");
}