import { API_URLS } from '../constants/apiUrls';
import { COUNTRY_CODES } from '../constants/countryCodes';

const LOCATION_API = 'https://ipapi.co/json/';

// 新增：通用的fetch函数，包含错误处理和超时
const fetchWithTimeout = async (url, options = {}, timeout = 5000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        clearTimeout(id);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error('请求超时');
        }
        throw error;
    }
};

export const addressService = {
    /**
     * 根据给定的经纬度获取随机地址
     * 
     * 该函数在给定经纬度的周围小范围内生成一个随机点，然后使用 Nominatim API 获取该点的地址信息。
     * 
     * @param {number} lat - 纬度
     * @param {number} lon - 经度
     * @returns {Promise<Object>} 包含地址详细信息的对象
     * @throws {Error} 如果 API 请求失败
     */
    async getRandomAddress(lat, lon) {
        const radius = 0.01;
        const randomLat = lat + (Math.random() - 0.5) * radius;
        const randomLon = lon + (Math.random() - 0.5) * radius;

        const url = `${API_URLS.NOMINATIM}?format=json&lat=${randomLat}&lon=${randomLon}&zoom=18&addressdetails=1&accept-language=en`;

        try {
            const data = await fetchWithTimeout(url);
            return data.address;
        } catch (error) {
            console.error('获取随机地址失败:', error);
            throw error;
        }
    },

    /**
     * 获取指定国家的随机用户数据
     * 
     * 使用 Random User API 获取指定国家的随机用户信息。如果未提供有效的国家代码，默认使用美国（'us'）。
     * 
     * @param {string} country - 国家名称或代码
     * @returns {Promise<Object>} 包含用户信息的对象，包括名字、姓氏、电话和社会安全号（如果可用）
     * @throws {Error} 如果 API 请求失败
     */
    async getRandomUserData(country) {
        const countryCode = COUNTRY_CODES[country] || 'us';
        const url = `${API_URLS.RANDOM_USER}?nat=${countryCode}`;

        try {
            const { results } = await fetchWithTimeout(url);
            const [user] = results;
            const { name: { first, last }, phone, id: { value: ssn = 'N/A' } } = user;

            return { firstName: first, lastName: last, phone, ssn };
        } catch (error) {
            console.error('获取随机用户数据失败:', error);
            throw error;
        }
    },

    /**
     * 获取 IP 地址和位置信息
     * 
     * 使用 ipapi.co API 获取 IP 地址的详细位置信息。可以提供自定义 IP 地址，否则获取当前用户的 IP 信息。
     * 
     * @param {string} [customIP] - 可选的自定义 IP 地址
     * @returns {Promise<Object>} 包含 IP 和位置信息的对象，包括 IP 地址、城市、地区、国家等详细信息
     * @throws {Error} 如果 API 请求失败
     */
    async getIPAndLocation(customIP) {
        const url = customIP ? `https://ipapi.co/${customIP}/json/` : LOCATION_API;

        try {
            return await fetchWithTimeout(url);
        } catch (error) {
            console.error("获取 IP 和位置信息失败:", error);
            throw error;
        }
    },

    /**
     * 根据国家和城市获取的经纬度
     * 
     * 使用 Nominatim API 根据提供的国家和城市名称获取一个的经纬度坐标。
     * 
     * @param {string} country - 国家名称
     * @param {string} city - 城市名称
     * @returns {Promise<Object>} 包含经纬度的对象 { latitude: number, longitude: number }
     * @throws {Error} 如果未找到匹配的地址或 API 请求失败
     */
    async getCityCenterCoordinates(country, city) {
        const url = `${API_URLS.NOMINATIM}?format=json&country=${encodeURIComponent(country)}&city=${encodeURIComponent(city)}&limit=1`;

        try {
            const data = await fetchWithTimeout(url);

            if (data.length === 0) {
                throw new Error('未找到匹配的地址');
            }

            const { lat, lon } = data[0];
            return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
        } catch (error) {
            console.error('获取城市中心坐标失败:', error);
            throw error;
        }
    },
};