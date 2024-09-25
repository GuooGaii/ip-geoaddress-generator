let mapPopupTimer;
let mapPopupHideTimer;

const LOCATION_API_URL = 'https://ipapi.co/json/';
const NOMINATIM_API_URL = 'https://nominatim.openstreetmap.org/reverse';

async function getIPAndLocation() {
    const response = await fetch(LOCATION_API_URL);
    const data = await response.json();
    return data;
}

async function getRandomAddress(lat, lon) {
    const radius = 0.01; // 约1km半径
    const randomLat = lat + (Math.random() - 0.5) * radius;
    const randomLon = lon + (Math.random() - 0.5) * radius;

    const response = await fetch(`${NOMINATIM_API_URL}?format=json&lat=${randomLat}&lon=${randomLon}&zoom=18&addressdetails=1&accept-language=en`);
    const data = await response.json();

    return data.address;
}

function updateMap(address) {
    const mapFrame = document.getElementById('map');
    const googleMapUrl = `https://www.google.com/maps?q=${encodeURIComponent(address)}&z=15&output=embed&t=k`;
    mapFrame.src = googleMapUrl;
}

async function generateAddress() {
    try {
        const locationData = await getIPAndLocation();
        const ip = locationData.ip;
        document.getElementById('ip').textContent = ip;

        const address = await getRandomAddress(locationData.latitude, locationData.longitude);

        const streetAddress = `${address.house_number ?? ''} ${address.road ?? ''}`.trim();
        updateTableCell('street', streetAddress || 'N/A');
        updateTableCell('city', address.city ?? address.town ?? 'N/A');
        updateTableCell('state', address.state ?? 'N/A');
        updateTableCell('postcode', address.postcode ?? 'N/A');
        updateTableCell('country', address.country_code?.toUpperCase() ?? 'N/A');

        const cityAddress = `${address.city || address.town || ''}, ${address.state || ''}, ${address.country || ''}`;
        updateMap(cityAddress);

        const fullAddress = `${streetAddress}, ${address.city || ''}, ${address.state || ''}, ${address.postcode || ''}, ${address.country || ''}`;

        const addressTable = document.querySelector('.address-table');
        addressTable.classList.remove('fade-in');
        void addressTable.offsetWidth;
        addressTable.classList.add('fade-in');

        updateMap(fullAddress);

    } catch (error) {
        console.error('生成地址时出错:', error);
        document.querySelectorAll('.address-table td').forEach(td => td.textContent = '无法获取地址');
    }
}

function copyToClipboard(text, element) {
    navigator.clipboard.writeText(text).then(() => {
        showTooltip(element);
    }, (err) => {
        console.error('无法复制文本: ', err);
        // 添加一个回退方法，以防 Clipboard API 不可用
        fallbackCopyTextToClipboard(text, element);
    });
}

// 添加一个回退复制方法
function fallbackCopyTextToClipboard(text, element) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        showTooltip(element);
    } catch (err) {
        console.error('回退复制方法失败:', err);
    }
    document.body.removeChild(textArea);
}

function showTooltip(element) {
    const tooltip = element.querySelector('.tooltiptext');
    tooltip.textContent = '已复制!';
    tooltip.classList.add('show');
    setTimeout(() => {
        tooltip.classList.remove('show');
        tooltip.textContent = '点击复制';
    }, 1500);
}

function updateTableCell(id, text) {
    const cell = document.getElementById(id);
    const content = cell.querySelector('.content');
    content.textContent = text;
    cell.onclick = (event) => copyToClipboard(text, event.currentTarget);

    // 移除这部分代码
    // if (id === 'street') {
    //     cell.onmouseenter = showMapPopup;
    //     cell.onmouseleave = hideMapPopup;
    // }
}

function showMapPopup() {
    const mapPopup = document.getElementById('map-popup');
    mapPopup.style.display = 'block';
}

function hideMapPopup() {
    const mapPopup = document.getElementById('map-popup');
    mapPopup.style.display = 'none';
}

// 修改这部分代码
document.addEventListener('DOMContentLoaded', function () {
    generateAddress();

    // 移除这两行
    // const streetElement = document.getElementById('street');
    // streetElement.addEventListener('mouseenter', showMapPopup);
    // streetElement.addEventListener('mouseleave', hideMapPopup);

    // 添加地图emoji的事件监听器
    const mapEmoji = document.querySelector('.map-emoji');
    const mapPopup = document.getElementById('map-popup');

    mapEmoji.addEventListener('mouseenter', showMapPopup);
    mapEmoji.addEventListener('mouseleave', hideMapPopup);
});

// 移除这部分代码，因为我们已经在上面添加了事件监听器
// document.addEventListener('DOMContentLoaded', function () {
//     const mapEmoji = document.querySelector('.map-emoji');
//     const mapPopup = document.getElementById('map-popup');

//     mapEmoji.addEventListener('click', showMapPopup);
//     mapPopup.addEventListener('click', hideMapPopup);
// });