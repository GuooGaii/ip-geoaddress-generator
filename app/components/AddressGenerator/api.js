import { API_URLS, COUNTRY_CODES } from './constants';

export async function getRandomAddress(lat, lon) {
    const radius = 0.01;
    const randomLat = lat + (Math.random() - 0.5) * radius;
    const randomLon = lon + (Math.random() - 0.5) * radius;

    const url = `${API_URLS.NOMINATIM}?format=json&lat=${randomLat}&lon=${randomLon}&zoom=18&addressdetails=1&accept-language=en`;
    console.log("请求地址:", url);
    const response = await fetch(url);
    const data = await response.json();
    return data.address;
}

export async function getRandomUserData(country) {
    const countryCode = COUNTRY_CODES[country] || 'us'; // 默认使用美国
    const response = await fetch(`${API_URLS.RANDOM_USER}?nat=${countryCode}`);
    const data = await response.json();
    const user = data.results[0];
    console.log("获取随机用户数据:", data);
    return {
        firstName: user.name.first,
        lastName: user.name.last,
        phone: user.phone
    };
}