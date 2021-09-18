const images = [
    {
        'name': 'ntp-2020/2021-1',
        'source': 'alex-plesovskich.avif',
        'author': 'Alex Plesovskich',
        'link': 'https://unsplash.com/@aples',
        'originalUrl': 'Contributor sent the hi-res version through email',
        'license': 'https://unsplash.com/photos/VPrTqd8B230'
    },
    {
        'name': 'ntp-2020/2021-2',
        'source': 'andre-benz.avif',
        'author': 'Andre Benz',
        'link': 'https://unsplash.com/@trapnation',
        'originalUrl': 'Contributor sent the hi-res version through email',
        'license': 'https://unsplash.com/photos/axQXVkrUASg'
    },
    {
        'name': 'ntp-2020/2021-3',
        'source': 'corwin-prescott_olympic.avif',
        'author': 'Corwin Prescott',
        'link': 'https://community.brave.com/',
        'originalUrl': 'Contributor sent the hi-res version through email',
        'license': 'used with permission'
    },
    {
        'name': 'ntp-2020/2021-4',
        'source': 'dylan-malval_alps.avif',
        'author': 'Dylan Malval',
        'link': 'https://www.instagram.com/vass_captures/',
        'originalUrl': 'Contributor sent the hi-res version through email',
        'license': 'used with permission'
    },
    {
        'name': 'ntp-2020/2021-6',
        'source': 'spencer-moore_lake.avif',
        'author': 'Spencer M. Moore',
        'link': 'https://www.smoorevisuals.com/landscapes',
        'originalUrl': 'Contributor sent the hi-res version through email',
        'license': 'used with permission'
    },
    {
        'name': 'ntp-2020/2021-7',
        'source': 'su-san-lee.avif',
        'author': 'Su San Lee',
        'link': 'https://unsplash.com/@blackodc',
        'originalUrl': 'Contributor sent the hi-res version through email',
        'license': 'https://unsplash.com/photos/E_eWwM29wfU'
    },
    {
        'name': 'ntp-2020/2021-8',
        'source': 'zane-lee.avif',
        'author': 'Zane Lee',
        'link': 'https://unsplash.com/@zane404',
        'originalUrl': 'Contributor sent the hi-res version through email',
        'license': 'https://unsplash.com/photos/ZiDa9i7dY1E'
    }
]
document.body.style.backgroundImage = `url(./backgrounds/${images[Math.floor(Math.random() * images.length)].source})`
function go(e) {
    console.log(e)
    const q = e.target.value;
    if (e.key == 'Enter') {
        if (validURL(q)) {
            location.href = q;
        } else {
            location.href = `https://www.google.com/search?q=${q.replaceAll(" ", "+")}`;
        }
    }
}