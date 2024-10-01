const API_URLS = {
    LOCATION: 'https://ipapi.co/json/',
};

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
export async function getIPAndLocation(customIP) {
    const url = customIP ? `https://ipapi.co/${customIP}/json/` : API_URLS.LOCATION;
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