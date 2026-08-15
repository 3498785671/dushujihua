/**
 * localStorage 封装
 * 提供类型安全的本地存储读写能力
 */

const STORAGE_PREFIX = 'dushu_plan_';

export const storage = {
  /**
   * 读取数据
   * @param key 存储键名（不含前缀）
   * @param defaultValue 默认值（当键不存在或解析失败时返回）
   */
  get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(STORAGE_PREFIX + key);
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`[Storage] 读取失败 [${key}]:`, error);
      return defaultValue;
    }
  },

  /**
   * 写入数据
   * @param key 存储键名
   * @param value 要存储的值（会自动 JSON 序列化）
   */
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch (error) {
      console.error(`[Storage] 写入失败 [${key}]:`, error);
    }
  },

  /**
   * 移除指定键
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(STORAGE_PREFIX + key);
    } catch (error) {
      console.error(`[Storage] 删除失败 [${key}]:`, error);
    }
  },

  /**
   * 清除所有应用数据
   */
  clear(): void {
    try {
      Object.keys(localStorage)
        .filter((key) => key.startsWith(STORAGE_PREFIX))
        .forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      console.error('[Storage] 清除失败:', error);
    }
  },
};
