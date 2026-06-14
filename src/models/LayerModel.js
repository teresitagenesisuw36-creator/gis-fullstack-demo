/**
 * 图层数据模型（ES6 Class 封装）
 */
export class LayerModel {
  /**
   * @param {object} options
   * @param {string} options.id - 唯一标识
   * @param {string} options.name - 图层名称
   * @param {string} options.type - 图层类型（Point/LineString/Polygon）
   * @param {boolean} options.visible - 是否可见
   * @param {number} options.opacity - 透明度 0-1
   * @param {Array} options.features - 要素集合
   * @param {string} options.color - 图层颜色
   */
  constructor({ id, name, type, visible = true, opacity = 1, features = [], color = '#409eff' }) {
    this.id = id
    this.name = name
    this.type = type
    this.#visible = visible
    this.#opacity = opacity
    this.features = features
    this.color = color
  }

  // 私有字段：可见性
  #visible
  // 私有字段：透明度
  #opacity

  get visible() {
    return this.#visible
  }

  set visible(val) {
    this.#visible = val
  }

  get opacity() {
    return this.#opacity
  }

  set opacity(val) {
    this.#opacity = Math.max(0, Math.min(1, val))
  }

  /** 切换可见性 */
  toggle() {
    this.#visible = !this.#visible
  }

  /** 添加要素 */
  addFeature(feature) {
    this.features = [...this.features, feature]
  }

  /** 移除要素 */
  removeFeature(id) {
    this.features = this.features.filter((f) => f.id !== id)
  }

  /** 获取要素数量统计 */
  get featureCount() {
    return this.features.length
  }

  /** 序列化为普通对象（用于 Pinia 存储） */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      visible: this.#visible,
      opacity: this.#opacity,
      features: this.features,
      color: this.color
    }
  }
}

/**
 * 从普通对象恢复 LayerModel 实例
 */
export const fromJSON = (json) => new LayerModel(json)