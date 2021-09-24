const { ipcRenderer } = require("electron");
const path = require("path");
const wallpapers = ["crystal.jpeg", "dark.jpg", "defbg.svg", "Float.jpg", "indeepspace1-tomanderswatkins.jpg", "indeepspace2-tomanderswatkins.jpg", "indeepspace5-tomanderswatkins.jpg", "infinity_gx.png", "Liquid-Metallic.jpg", "Mountain-Color.jpg", "pink.jpg", "reborn3_dark.svg", "reborn5_dark.png", "sunset.png"];

function go(e) {
    console.log(e)
    const q = e.target.value;
    if (e.key == 'Enter') {
        if (q.includes(":")) {
            location.href = q;
        } else {
            location.href = `https://www.google.com/search?q=${q.replaceAll(" ", "+")}`;
        }
    }
}
// document.body.style.backgroundImage = "url(min://newtab/wallpapers/defbg.svg)";
ipcRenderer.on("bg", (e, data) => {
    console.log(e, data);
    window.srcImg = data;
    document.body.style.backgroundImage = `url(min://newtab/wallpapers/${data})`;
});
function opnSettings() {
    ipcRenderer.sendToHost("settings");
}