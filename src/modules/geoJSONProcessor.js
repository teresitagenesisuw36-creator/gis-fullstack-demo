/**
 * GeoJSON 处理模块
 * 使用 Promise/async-await 异步加载，ES6 模块化导出
 * 提供解析、过滤、统计等功能
 */

import { calcDistance, calcBoundingBox } from './geoUtils.js'

/**
 * 异步加载 GeoJSON 数据
 * @param {string} url - GeoJSON 文件路径
 * @returns {Promise<object>} GeoJSON 对象
 */
export const loadGeoJSON = async (url) => {
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    return parseGeoJSON(data)
  } catch (error) {
    console.error('加载 GeoJSON 失败:', error.message)
    return null
  }
}

/**
 * 解析 GeoJSON 数据，提取基本信息
 * @param {object} geojson - GeoJSON 对象
 * @returns {object} 解析结果
 */
const parseGeoJSON = (geojson) => {
  if (!geojson || geojson.type !== 'FeatureCollection') {
    console.warn('非标准 FeatureCollection')
    return { ...geojson, _parsed: false }
  }
  const features = geojson.features.map((f) => ({
    ...f,
    coordinates: extractCoordinates(f)
  }))
  return {
    ...geojson,
    features,
    _parsed: true,
    _stats: calcFeatureStats(features)
  }
}

/**
 * 提取要素坐标（处理 Point/LineString/Polygon）
 */
const extractCoordinates = (feature) => {
  const { geometry } = feature
  if (!geometry) return null
  switch (geometry.type) {
    case 'Point':
      return geometry.coordinates
    case 'MultiPoint':
      return geometry.coordinates[0]
    case 'LineString':
      return geometry.coordinates[0] // 取第一个点
    case 'Polygon':
      return geometry.coordinates[0]?.[0] // 外环第一个点
    default:
      return null
  }
}

/**
 * 计算要素集合统计信息
 */
const calcFeatureStats = (features) => {
  const points = features.filter((f) => f.coordinates)
  const bbox = calcBoundingBox(points)
  const types = {}
  features.forEach((f) => {
    types[f.geometry?.type] = (types[f.geometry?.type] || 0) + 1
  })
  return { total: features.length, types, bbox }
}

/**
 * 按属性过滤要素
 * @param {Array} features - 要素数组
 * @param {string} key - 属性名
 * @param {*} value - 属性值
 * @returns {Array} 过滤后的要素数组
 */
export const filterFeatures = (features, key, value) =>
  features.filter((f) => f.properties?.[key] === value)

/**
 * 按名称模糊搜索要素
 * @param {Array} features - 要素数组
 * @param {string} keyword - 搜索关键词
 * @returns {Array} 匹配的要素数组
 */
export const searchFeatures = (features, keyword) => {
  const kw = keyword.toLowerCase()
  return features.filter((f) => {
    const name = f.properties?.name?.toLowerCase() || ''
    const type = f.geometry?.type?.toLowerCase() || ''
    return name.includes(kw) || type.includes(kw)
  })
}

/**
 * 按类型统计要素数量
 * @param {Array} features - 要素数组
 * @returns {object} {Point: 5, LineString: 3, ...}
 */
export const countByType = (features) =>
  features.reduce((acc, f) => {
    const type = f.geometry?.type || 'Unknown'
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {})

/**
 * 计算所有点要素到指定位置的距离
 * @param {Array} features - 要素数组
 * @param {[number, number]} target - 目标坐标
 * @returns {Array} 包含距离信息的要素数组
 */
export const calcDistancesTo = (features, target) =>
  features
    .filter((f) => f.coordinates)
    .map((f) => ({
      ...f,
      _distance: calcDistance(f.coordinates, target)
    }))
    .sort((a, b) => a._distance - b._distance)