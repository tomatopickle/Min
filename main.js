const { app, BrowserWindow, ipcMain, webContents } = require('electron');
const { download } = require('electron-dl');
var win, contextMenu;
function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            enableBlinkFeatures: "WebContentsForceDark",
            nodeIntegration: true,
            contextIsolation: false,
            webviewTag: true,
            enableRemoteModule: true
        },
        icon: __dirname + "/logo.ico",
        autoHideMenuBar: true,
        frame: false

    });
    win.loadFile('./index.html');
    contextMenu = require('electron-context-menu');
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
    if (process.platform !== 'darwin') app.quit()
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