/**
 * 存储管理器
 * 负责管理本地存储
 */

export class StorageManager {
  constructor() {
    this.prefix = '__mini_debug_'
  }

  /**
   * 设置存储项
   */
  set(key, value) {
    try {
      const fullKey = this.prefix + key
      localStorage.setItem(fullKey, JSON.stringify(value))
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * 获取存储项
   */
  get(key, defaultValue = null) {
    try {
      const fullKey = this.prefix + key
      const item = localStorage.getItem(fullKey)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      return defaultValue
    }
  }

  /**
   * 移除存储项
   */
  remove(key) {
    try {
      const fullKey = this.prefix + key
      localStorage.removeItem(fullKey)
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * 清空所有相关存储项
   */
  clear() {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key)
        }
      })
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * 获取所有相关存储项
   */
  getAll() {
    const items = {}
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          const shortKey = key.substring(this.prefix.length)
          items[shortKey] = this.get(shortKey)
        }
      })
    } catch (error) {
    }
    return items
  }

  /**
   * 检查存储项是否存在
   */
  has(key) {
    const fullKey = this.prefix + key
    return localStorage.getItem(fullKey) !== null
  }

  /**
   * 获取存储项数量
   */
  size() {
    let count = 0
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          count++
        }
      })
    } catch (error) {
    }
    return count
  }
}
