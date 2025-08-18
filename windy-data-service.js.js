// 移动端修复版 - 修复API参数问题
class ChinaCalibratedDataService {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 30 * 60 * 1000;
        this.enableChinaCalibration = true;
        this.windyApiKey = localStorage.getItem('windy_api_key') || this.getDefaultApiKey();
        this.useRealAPI = localStorage.getItem('use_real_api') === 'true';
    }

    async testWindyConnection() {
        if (!this.windyApiKey) {
            throw new Error('API密钥未配置');
        }
        
        const testCoords = { lat: 30.0444, lng: 122.1067 };
        const requestBody = {
            key: this.windyApiKey,
            lat: parseFloat(testCoords.lat.toFixed(4)),
            lon: parseFloat(testCoords.lng.toFixed(4)),
            model: 'gfs',
            parameters: ['wind'],
            levels: ['surface'],
            start: new Date().toISOString().split('T')[0] + 'T00:00:00.000Z',
            step: 3,
            limit: 1
        };
        
        console.log('📱 移动端API请求参数:', JSON.stringify(requestBody, null, 2));
        
        const response = await fetch('https://api.windy.com/api/point-forecast/v2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (compatible; SurfForecast/1.0)'
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('📱 移动端API错误响应:', errorText);
            throw new Error(`API请求失败: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        if (!data.ts || data.ts.length === 0) {
            throw new Error('未获取到有效数据');
        }
        
        return true;
    }

    async getWindyRealData(coordinates, date) {
        if (!this.windyApiKey) {
            throw new Error('API密钥未配置');
        }
        
        // 移动端优化的请求参数
        const requestBody = {
            key: this.windyApiKey,
            lat: parseFloat(coordinates.lat.toFixed(4)),
            lon: parseFloat(coordinates.lng.toFixed(4)),
            model: 'gfs',
            parameters: ['wind', 'waves', 'temp', 'rh', 'pressure'],
            levels: ['surface'],
            start: date.toISOString().split('T')[0] + 'T00:00:00.000Z',
            step: 3,
            limit: 8
        };
        
        console.log('📱 移动端获取数据请求:', JSON.stringify(requestBody, null, 2));
        
        const response = await fetch('https://api.windy.com/api/point-forecast/v2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (compatible; SurfForecast/1.0)'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('📱 移动端API详细错误:', {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries()),
                body: errorText
            });
            throw new Error(`API请求失败: ${response.status} - ${errorText}`);
        }

        const windyData = await response.json();
        if (!windyData.ts || windyData.ts.length === 0) {
            throw new Error('未获取到有效数据');
        }
        
        return this.convertWindyDataToFormat(windyData, coordinates, date);
    }

    toggleRealAPI(enabled) {
        this.useRealAPI = enabled;
        this.windyApiKey = localStorage.getItem('windy_api_key') || this.getDefaultApiKey();
        localStorage.setItem('use_real_api', enabled.toString());
        console.log(enabled ? '🌊 已启用Windy真实API' : '📊 已切换到模拟数据');
        this.cache.clear();
    }

    getDefaultApiKey() {
        return null;
    }
}