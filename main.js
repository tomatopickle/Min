const { app, BrowserWindow, nativeTheme, ipcMain, webContents } = require('electron');
const { download } = require('electron-dl');
const remoteMain = require("@electron/remote/main");
const protocols = require('electron-protocols');
const path = require('path');
remoteMain.initialize();
var win, contextMenu;
function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webviewTag: true,
            enableRemoteModule: true
        },
        icon: __dirname + "/logo.ico",
        autoHideMenuBar: true,
        frame: false

    });
    remoteMain.enable(win.webContents);
    win.loadFile('./index.html');
    contextMenu = require('electron-context-menu');
    win.maximize();
    win.show();
    setTimeout(() => {
        const { dialog } = require("electron");
        dialog.showMessageBox({ message: "An update was found and installed, restart now?", type: "info", buttons: ["Restart", "Cancel"] })
        .then((e) => {
            console.log(e);
            if (e.response == 0) {
                app.relaunch();
                app.exit();
                win = null;
                return
            }
        });
        const { autoUpdater } = require('electron-updater');
        autoUpdater.checkForUpdatesAndNotify();
    }, 5000);
}
app.whenReady().then(() => {
    var session = require('electron').session;
    session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
        details.requestHeaders["User-Agent"] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36 OPR/78.0.4093.184";
        callback({ cancel: false, requestHeaders: details.requestHeaders });
    });
    createWindow();
});
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        win = null;
        app.quit();
        return
    }
});
app.on("web-contents-created", (e, contents) => {
    if (contents.getType() == "webview") {
        contextMenu({
            window: contents,
            showSearchWithGoogle: true,
            labels: {
                cut: 'Cut',
                copy: 'Copy',
                paste: 'Paste',
                save: 'Save Image',
                saveImageAs: 'Save Image As…',
                copyLink: 'Copy Link',
                saveLinkAs: 'Save Link As…',
                inspect: 'Inspect Element'
            },
            prepend: (e, props) => [
                {
                    label: 'Back',
                    visible: contents.canGoBack(),
                    click: () => {
                        contents.goBack();
                    }
                },
                {
                    label: 'Forward',
                    visible: contents.canGoForward(),
                    click: () => {
                        contents.goForward();
                    }
                },
                {
                    label: 'Reload',
                    visible: !contents.isLoading(),
                    click: () => {
                        contents.reload();
                    }
                },
                {
                    label: 'Stop Loading',
                    visible: contents.isLoading(),
                    click: () => {
                        contents.stop();
                    }
                },
                {
                    label: "Open Link in New Tab",
                    visible: !!props.linkURL,
                    click: () => {
                        win.webContents.send('action', { type: "openLinkInNewTab", value: props.linkURL });
                    }
                },
                {
                    label: "Save Image as",
                    visible: props.mediaType === 'image',
                    click: () => {
                        download(win, props.srcURL);
                    }
                },
                {
                    label: "Save Link as",
                    visible: !!props.linkURL,
                    click: () => {
                        download(win, props.linkURL);
                    }
                }
            ],
            showCopyImageAddress: true,
            showInspectElement: true,
            showSaveLinkAs: true,
            cut: true,
            copy: true,
            paste: true,
            save: true,
            saveImageAs: true,
            copyLink: true,
            inspect: true
        });
    }
});
protocols.register('min', uri => {
    let base = app.getAppPath();
    if (uri.hostname == "newtab") {
        if (uri.path) {
            return path.join(base, `views/newtab/${uri.path}`);
        }
        return path.join(base, "views/newtab/index.html");
    } else {
        return path.join(base, `views/${uri.hostname}`, uri.path);
    }
});