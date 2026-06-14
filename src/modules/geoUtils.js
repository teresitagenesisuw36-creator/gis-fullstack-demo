/**
 * GIS 空间数据处理工具函数模块
 * 使用 ES6+ 语法：箭头函数、解构、展开运算符等
 */

/**
 * 计算两点之间的距离（Haversine公式）
 * @param {[number, number]} coord1 - [经度, 纬度]
 * @param {[number, number]} coord2 - [经度, 纬度]
 * @returns {number} 距离（公里）
 */
export const calcDistance = ([lon1, lat1], [lon2, lat2]) => {
  const R = 6371 // 地球半径（公里）
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/**
 * 坐标格式化：将经纬度数组转为度分秒格式
 * @param {[number, number]} coord - [经度, 纬度]
 * @returns {string} 格式化后的坐标字符串
 */
export const formatCoordinate = ([lon, lat]) => {
  const toDMS = (dd, pos, neg) => {
    const dir = dd >= 0 ? pos : neg
    const abs = Math.abs(dd)
    const d = Math.floor(abs)
    const m = Math.floor((abs - d) * 60)
    const s = ((abs - d - m / 60) * 3600).toFixed(1)
    return `${d}°${m}'${s}"${dir}`
  }
  return `${toDMS(lat, 'N', 'S')} ${toDMS(lon, 'E', 'W')}`
}

/**
 * 计算多边形面积（Shoelace公式，简化版）
 * @param {Array<[number, number]>} coords - 坐标点数组
 * @returns {number} 面积（平方公里，近似值）
 */
export const calcPolygonArea = (coords) => {
  if (coords.length < 3) return 0
  let area = 0
  for (let i = 0; i < coords.length; i++) {
    const [x1, y1] = coords[i]
    const [x2, y2] = coords[(i + 1) % coords.length]
    area += x1 * y2 - x2 * y1
  }
  // 近似转换为平方公里（赤道附近 1度≈111km）
  return Math.abs((area / 2) * 111 * 111 * Math.cos((coords[0][1] * Math.PI) / 180))
}

/**
 * 计算要素集合的边界框
 * @param {Array<{coordinates: [number, number]}>} features
 * @returns {{minLon: number, minLat: number, maxLon: number, maxLat: number}}
 */
export const calcBoundingBox = (features) => {
  const coords = features.map((f) => f.coordinates)
  const lons = coords.map(([lon]) => lon)
  const lats = coords.map(([, lat]) => lat)
  return {
    minLon: Math.min(...lons),
    minLat: Math.min(...lats),
    maxLon: Math.max(...lons),
    maxLat: Math.max(...lats)
  }
}

/**
 * 坐标转换：WGS84 转 Web Mercator（简化版）
 * @param {[number, number]} coord - [经度, 纬度]
 * @returns {[number, number]} [x, y]（米）
 */
export const wgs84ToMercator = ([lon, lat]) => {
  const x = (lon * 20037508.34) / 180
  let y = Math.log(Math.tan(((90 + lat) * Math.PI) / 360)) / (Math.PI / 180)
  y = (y * 20037508.34) / 180
  return [x, y]
}