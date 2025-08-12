// 数据校准助手 - 帮助调整浪高生成逻辑
class DataCalibrationHelper {
    constructor() {
        this.realWorldData = {
            // 基于真实冲浪预报网站的典型数据范围
            dongsha: {
                typical: { min: 0.5, max: 1.8, avg: 1.1 },
                seasonal: {
                    summer: { min: 0.3, max: 1.2, avg: 0.8 },
                    autumn: { min: 0.8, max: 2.5, avg: 1.5 },
                    winter: { min: 1.0, max: 3.0, avg: 1.8 },
                    spring: { min: 0.6, max: 1.8, avg: 1.2 }
                }
            },
            daishan: {
                typical: { min: 0.4, max: 1.6, avg: 1.0 },
                seasonal: {
                    summer: { min: 0.2, max: 1.0, avg: 0.6 },
                    autumn: { min: 0.6, max: 2.2, avg: 1.3 },
                    winter: { min: 0.8, max: 2.8, avg: 1.6 },
                    spring: { min: 0.5, max: 1.6, avg: 1.0 }
                }
            },
            qingdao: {
                typical: { min: 0.6, max: 2.0, avg: 1.3 },
                seasonal: {
                    summer: { min: 0.4, max: 1.5, avg: 0.9 },
                    autumn: { min: 0.8, max: 2.8, avg: 1.7 },
                    winter: { min: 1.2, max: 3.5, avg: 2.2 },
                    spring: { min: 0.7, max: 2.0, avg: 1.3 }
                }
            }
        };
    }

    // 获取更真实的浪高范围
    getRealisticWaveHeight(spotId, date = new Date()) {
        const month = date.getMonth();
        const season = this.getSeason(month);
        
        let spotData;
        switch(spotId) {
            case 1: // 东沙冲浪公园
                spotData = this.realWorldData.dongsha;
                break;
            case 2: // 岱山鹿栏
                spotData = this.realWorldData.daishan;
                break;
            case 3:
            case 4:
            case 5: // 青岛各点
                spotData = this.realWorldData.qingdao;
                break;
            default:
                spotData = this.realWorldData.dongsha;
        }
        
        const seasonalData = spotData.seasonal[season];
        
        // 生成更真实的浪高
        const baseHeight = seasonalData.min + Math.random() * (seasonalData.max - seasonalData.min);
        
        // 添加日内变化（潮汐影响）
        const hour = date.getHours();
        const tidalInfluence = Math.sin((hour + 6) * Math.PI / 12) * 0.2;
        
        // 添加天气影响（简化）
        const weatherFactor = 0.8 + Math.random() * 0.4; // 0.8-1.2倍
        
        const finalHeight = Math.max(0.1, (baseHeight + tidalInfluence) * weatherFactor);
        
        return Math.round(finalHeight * 10) / 10;
    }

    getSeason(month) {
        if (month >= 2 && month <= 4) return 'spring';
        if (month >= 5 && month <= 7) return 'summer';
        if (month >= 8 && month <= 10) return 'autumn';
        return 'winter';
    }

    // 生成校准后的模拟数据
    generateCalibratedMockData(coordinates, date, spotId) {
        const realisticWaveHeight = this.getRealisticWaveHeight(spotId, date);
        const season = this.getSeason(date.getMonth());
        
        // 根据季节调整风速
        const seasonalWindFactor = {
            spring: 0.9,
            summer: 0.7,
            autumn: 1.2,
            winter: 1.4
        };
        
        const baseWind = (6 + Math.random() * 8) * seasonalWindFactor[season];
        const baseTemp = this.getSeasonalTemperature(date.getMonth(), spotId);
        
        return {
            windy: {
                windSpeed: Math.round(baseWind * 10) / 10,
                windDirection: Math.round(Math.random() * 360),
                windGust: Math.round((baseWind * 1.3) * 10) / 10,
                waveHeight: realisticWaveHeight,
                wavePeriod: Math.round((6 + Math.random() * 8) * 10) / 10,
                waveDirection: Math.round(Math.random() * 360),
                swellHeight: Math.round((realisticWaveHeight * 0.6) * 10) / 10,
                swellPeriod: Math.round((8 + Math.random() * 6) * 10) / 10,
                swellDirection: Math.round(Math.random() * 360)
            },
            weather: {
                temperature: Math.round(baseTemp),
                humidity: Math.round(Math.random() * 40 + 40),
                pressure: Math.round(Math.random() * 30 + 1005),
                visibility: Math.round(Math.random() * 10 + 10),
                cloudCover: Math.round(Math.random() * 100),
                condition: this.getWeatherCondition(season),
                uvIndex: Math.round(Math.random() * 8 + 2)
            },
            ocean: {
                waterTemperature: Math.round((baseTemp - 2) * 10) / 10,
                tideHeight: Math.round((Math.random() * 3 + 1.5) * 10) / 10,
                tideLevel: ['低潮', '涨潮', '高潮', '落潮'][Math.floor(Math.random() * 4)],
                currentSpeed: Math.round((Math.random() * 1.5) * 10) / 10,
                currentDirection: Math.round(Math.random() * 360),
                seaState: Math.min(6, Math.floor(realisticWaveHeight * 2) + 1)
            },
            calibrationInfo: {
                method: 'realistic-seasonal',
                spotId: spotId,
                season: season,
                baseWaveHeight: realisticWaveHeight,
                appliedFactors: ['seasonal', 'tidal', 'weather']
            }
        };
    }

    getSeasonalTemperature(month, spotId) {
        // 基于地理位置的温度差异
        const latitudeFactor = spotId <= 2 ? 2 : -1; // 舟山比青岛稍暖
        
        const monthlyTemp = [
            8, 10, 15, 20, 25, 28, 30, 29, 26, 21, 16, 11
        ];
        
        return monthlyTemp[month] + latitudeFactor + (Math.random() - 0.5) * 4;
    }

    getWeatherCondition(season) {
        const conditions = {
            spring: ['多云', '晴朗', '小雨', '阴天'],
            summer: ['晴朗', '多云', '雷阵雨', '晴朗'],
            autumn: ['多云', '晴朗', '小雨', '阴天'],
            winter: ['阴天', '多云', '小雨', '晴朗']
        };
        
        const seasonConditions = conditions[season];
        return seasonConditions[Math.floor(Math.random() * seasonConditions.length)];
    }

    // 数据验证和建议
    validateAndSuggest(currentData, spotId, date) {
        const realistic = this.getRealisticWaveHeight(spotId, date);
        const current = currentData.windy.waveHeight;
        const difference = Math.abs(current - realistic);
        
        const suggestions = [];
        
        if (difference > 0.5) {
            suggestions.push({
                type: 'warning',
                message: `当前浪高 ${current}m 与真实范围差异较大 (建议: ${realistic}m)`
            });
        }
        
        if (current > 2.5) {
            suggestions.push({
                type: 'error',
                message: '浪高过高，中国近海很少超过2.5m的浪况'
            });
        }
        
        if (current < 0.3) {
            suggestions.push({
                type: 'warning',
                message: '浪高过低，可能不适合冲浪'
            });
        }
        
        // 季节性检查
        const season = this.getSeason(date.getMonth());
        const seasonalData = this.getSeasonalData(spotId, season);
        
        if (current < seasonalData.min || current > seasonalData.max) {
            suggestions.push({
                type: 'info',
                message: `${season}季节该地点浪高通常在 ${seasonalData.min}-${seasonalData.max}m 范围内`
            });
        }
        
        return {
            isRealistic: difference <= 0.3,
            difference: difference,
            suggestions: suggestions,
            recommendedHeight: realistic,
            seasonalRange: seasonalData
        };
    }

    getSeasonalData(spotId, season) {
        let spotData;
        switch(spotId) {
            case 1:
                spotData = this.realWorldData.dongsha;
                break;
            case 2:
                spotData = this.realWorldData.daishan;
                break;
            default:
                spotData = this.realWorldData.qingdao;
        }
        
        return spotData.seasonal[season];
    }

    // 生成校准建议报告
    generateCalibrationReport(allSpotsData) {
        const report = {
            timestamp: new Date().toLocaleString('zh-CN'),
            spots: [],
            overallScore: 0,
            recommendations: []
        };
        
        let totalScore = 0;
        
        allSpotsData.forEach((spotData, index) => {
            const spotId = index + 1;
            const validation = this.validateAndSuggest(spotData, spotId, new Date());
            
            const spotScore = validation.isRealistic ? 100 : Math.max(0, 100 - validation.difference * 50);
            totalScore += spotScore;
            
            report.spots.push({
                id: spotId,
                name: spotData.spotName || `浪点${spotId}`,
                currentHeight: spotData.windy.waveHeight,
                recommendedHeight: validation.recommendedHeight,
                score: Math.round(spotScore),
                suggestions: validation.suggestions
            });
        });
        
        report.overallScore = Math.round(totalScore / allSpotsData.length);
        
        // 生成总体建议
        if (report.overallScore < 60) {
            report.recommendations.push('建议重新校准数据生成算法');
            report.recommendations.push('考虑使用更真实的季节性数据');
        } else if (report.overallScore < 80) {
            report.recommendations.push('数据基本合理，可进行微调优化');
        } else {
            report.recommendations.push('数据校准良好，符合真实海况');
        }
        
        return report;
    }
}

// 导出校准助手
const calibrationHelper = new DataCalibrationHelper();