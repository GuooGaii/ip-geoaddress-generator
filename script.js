const LOCATION_API_URL = 'https://ipapi.co/json/';
const NOMINATIM_API_URL = 'https://nominatim.openstreetmap.org/reverse';
const RANDOM_USER_API_URL = 'https://randomuser.me/api/';

async function getIPAndLocation(customIP) {
    if (customIP) {
        const response = await fetch(`${LOCATION_API_URL}${customIP}/json/`);
        const data = await response.json();
        return data;
    } else {
        const response = await fetch(LOCATION_API_URL);
        const data = await response.json();
        return data;
    }
}

async function getRandomAddress(lat, lon) {
    const radius = 0.01; // 约1km半径
    const randomLat = lat + (Math.random() - 0.5) * radius;
    const randomLon = lon + (Math.random() - 0.5) * radius;

    const response = await fetch(`${NOMINATIM_API_URL}?format=json&lat=${randomLat}&lon=${randomLon}&zoom=18&addressdetails=1&accept-language=en`);
    const data = await response.json();

    return data.address;
}

function formatName(firstName, lastName, countryCode) {
    const eastAsianCountries = ['CN', 'JP', 'KR', 'VN']; // 东亚国家列表
    if (eastAsianCountries.includes(countryCode.toUpperCase())) {
        return `${lastName}${firstName}`; // 东亚国家格式：姓名
    } else {
        return `${firstName} ${lastName}`; // 其他国家格式：名 姓
    }
}

async function getRandomNameAndPhone(countryCode) {
    const apiNat = convertCountryCodeToNat(countryCode);
    const response = await fetch(`${RANDOM_USER_API_URL}?nat=${apiNat}`);
    const data = await response.json();
    const user = data.results[0];
    return {
        name: formatName(user.name.first, user.name.last, countryCode),
        phone: user.phone
    };
}

function convertCountryCodeToNat(countryCode) {
    // 这里添加更多国家代码的映射
    const countryMapping = {
        'CN': 'CN',
        'US': 'US',
        'GB': 'GB',
        'FR': 'FR',
        'DE': 'DE',
        'AU': 'AU',
        // 添加更多国家...
    };
    return countryMapping[countryCode.toUpperCase()] || 'US'; // 默认使用美国
}

function updateMap(address) {
    const mapFrame = document.getElementById('map');
    const googleMapUrl = `https://www.google.com/maps?q=${encodeURIComponent(address)}&z=15&output=embed&t=k`;
    mapFrame.src = googleMapUrl;
}

async function generateAddress() {
    try {
        const customIP = document.getElementById('ip-input').value.trim();
        const locationData = await getIPAndLocation(customIP);
        const ip = locationData.ip;
        document.getElementById('ip').textContent = ip;

        const address = await getRandomAddress(locationData.latitude, locationData.longitude);
        const countryCode = address.country_code || locationData.country_code;
        const { name, phone } = await getRandomNameAndPhone(countryCode);

        updateTableCell('name', name);
        updateTableCell('phone', phone);

        const streetAddress = `${address.house_number ?? ''} ${address.road ?? ''}`.trim();
        updateTableCell('street', streetAddress || 'N/A');
        updateTableCell('city', address.city ?? address.town ?? 'N/A');
        updateTableCell('state', address.state ?? 'N/A');
        updateTableCell('postcode', address.postcode ?? 'N/A');
        updateTableCell('country', address.country_code?.toUpperCase() ?? 'N/A');

        const fullAddress = `${name}, ${phone}, ${streetAddress}, ${address.city || ''}, ${address.state || ''}, ${address.postcode || ''}, ${address.country || ''}`;

        const addressTable = document.querySelector('.address-table');
        addressTable.classList.remove('fade-in');
        void addressTable.offsetWidth;
        addressTable.classList.add('fade-in');

        updateMap(fullAddress);

    } catch (error) {
        console.error('生成地址时出错:', error);
        document.querySelectorAll('.address-table td').forEach(td => td.textContent = '无法获取信息');
    }
}

function copyToClipboard(text, element) {
    navigator.clipboard.writeText(text).then(() => {
        showTooltip(element);
    }, (err) => {
        console.error('无法复制文本: ', err);
        fallbackCopyTextToClipboard(text, element);
    });
}

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
}

function showMapPopup() {
    const mapPopup = document.getElementById('map-popup');
    mapPopup.style.display = 'block';
}

function hideMapPopup() {
    const mapPopup = document.getElementById('map-popup');
    mapPopup.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function () {
    generateAddress();

    const mapEmoji = document.querySelector('.map-emoji');
    const mapPopup = document.getElementById('map-popup');

    mapEmoji.addEventListener('mouseenter', showMapPopup);
    mapEmoji.addEventListener('mouseleave', hideMapPopup);
});