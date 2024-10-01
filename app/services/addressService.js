import { API_URLS, COUNTRY_CODES } from '../components/AddressGenerator/constants';

const LOCATION_API = 'https://ipapi.co/json/';

export const addressService = {
    async getRandomAddress(lat, lon) {
        const radius = 0.01;
        const randomLat = lat + (Math.random() - 0.5) * radius;
        const randomLon = lon + (Math.random() - 0.5) * radius;

        const url = `${API_URLS.NOMINATIM}?format=json&lat=${randomLat}&lon=${randomLon}&zoom=18&addressdetails=1&accept-language=en`;
        const response = await fetch(url);
        const data = await response.json();
        return data.address;
    },

    async getRandomUserData(country) {
        const countryCode = COUNTRY_CODES[country] || 'us';
        const url = `${API_URLS.RANDOM_USER}?nat=${countryCode}`;
        const response = await fetch(url);
        const data = await response.json();
        const user = data.results[0];
        return {
            firstName: user.name.first,
            lastName: user.name.last,
            phone: user.phone,
            ssn: user.id.value || 'N/A'
        };
    },

    /**
     * 获取IP地址和位置信息
     * @param {string} [customIP] - 可选的自定义IP地址
     * @returns {Promise<Object>} 包含IP和位置信息的对象，具体字段如下：
     *   - ip: {string} IP地址
     *   - city: {string} 城市名称
     *   - region: {string} 地区名称
     *   - region_code: {string} 地区代码
     *   - country: {string} 国家代码
     *   - country_name: {string} 国家名称
     *   - country_code: {string} 国家代码（与country相同）
     *   - country_capital: {string} 国家首都
     *   - postal: {string} 邮政编码
     *   - latitude: {number} 纬度
     *   - longitude: {number} 经度
     * @throws {Error} 如果API请求失败
     */
    async getIPAndLocation(customIP) {
        const url = customIP ? `https://ipapi.co/${customIP}/json/` : LOCATION_API;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error("获取IP和位置信息失败:", error);
            throw error;
        }
    }
};