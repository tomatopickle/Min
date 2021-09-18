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
document.body.style.backgroundImage = "url(./wallpapers/defbg.svg)";