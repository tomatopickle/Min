let tabs = document.querySelector("x-doctabs");
const { ipcRenderer } = require("electron")
function selectTab(id, isNewTab) {
    document.querySelector("webview.open")?.classList.remove("open");
    const window = document.getElementById(`window${id}`);
    window?.classList.add("open");
    if (isNewTab) return
    document.getElementById("searchbar").value = window.src;
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
    if (!!document.querySelector("x-doctabs").childElementCount && !!document.querySelector("x-doctab[selected]")) {
        // Waiting for animation end and the next tab to be selected
        setTimeout(() => {
            selectTab(document.querySelector("x-doctab[selected]").id.replace("tab", ""));
        }, 50);
    } else if (document.querySelector("x-doctabs").childElementCount == 0) {
        openLink("./views/newtab/index.html");
    }
}
function openLink(url) {
    var id = Math.floor(100000 + Math.random() * 900000);
    var page = document.createElement("webview");
    page.id = `window${id}`;
    page.src = url;
    document.getElementById("windows").appendChild(page);
    let tab = document.createElement("x-doctab");
    if (document.querySelector("x-doctab[selected]")) {
        document.querySelector("x-doctab[selected]").selected = false;
    }
    tab.selected = true;
    tab.id = `tab${id}`;
    tab.innerHTML = `<x-throbber  type="spinner" size="small" computedSize="small"></x-throbber><x-label>${url}</x-label>`;
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
    page.addEventListener('did-start-navigation', function (e) {
        handleNavs(e);
    });
    tab.onclick = function (e) {
        selectTab(id);
    }
    page.addEventListener('did-stop-loading', (e) => {
        tab.innerHTML = `<img src="${getBase(e.target.src)}/favicon.ico" /><x-label>${page.getTitle().toString()}</x-label>`;
        if (e.target.classList.contains("open")) {
            document.getElementById("reloadBtn").innerHTML = `<x-icon size="small" iconset="fluent-outlined.svg" name="refresh"></x-icon> `;
        }
        var history = db.local.getJSON("history") || [];
        history.unshift(({ url: page.src, title: page.getTitle() }));
        db.local.setJSON("history", history);
    });
    tab.addEventListener("wheel", event => {
        tabs.closeTab(tab);
        closeWindow(page);
    });
    page.addEventListener('did-navigate', (e) => {
        const window = e.target;
        if (window.classList.contains("open")) {
            document.getElementById("searchbar").value = e.url;
            document.getElementById("backBtn").disabled = !window.canGoBack();
            document.getElementById("forwardBtn").disabled = !window.canGoForward();
        }
    });
    tabs.openTab(tab);
    selectTab(id, true);
}
tabs.addEventListener("open", (event) => {
    event.preventDefault();
    openLink("./views/newtab/index.html");
});
openLink("./views/newtab/index.html");
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
    tab.innerHTML = `<x-throbber  type="spinner" size="small" computedSize="small"></x-throbber><x-label>${e.target.src}</x-label>`;
    if (e.target.classList.contains("open")) {
        document.getElementById("searchbar").value = e.target.src;
        document.getElementById("reloadBtn").innerHTML = `<img src="./titleBar/winIcons/close-w-20.png"/>`;
    }
}
function handleNavs(e) {
    console.log(e);
    const url = e.url;
    const views = ["newtab"];
    if (url.includes("chrome://")) {
        e.preventDefault();
        let view = url.replace("chrome://", "");
        view = view.replaceAll("/","");
        console.log(view)
        if (views.includes(view)) {
            e.target.src = `./views/${view}/index.html`;
        }
    }
}