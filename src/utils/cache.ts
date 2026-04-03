/**
 * 缓存工具类
 * - localStorage: 歌手/专辑/歌曲数据
 * - IndexedDB: 播放列表歌词
 */

import { CACHE_CONFIG } from '@/config/cache.config'

// IndexedDB 配置
const DB_NAME = 'music_cache_db'
const DB_VERSION = 1
const LYRIC_STORE = 'lyrics'

let db: IDBDatabase | null = null

// ==================== localStorage 缓存 ====================

interface CacheItem<T> {
  data: T
  expireTime: number
  clickCount?: number  // 点击计数器（可选）
}

/**
 * 设置缓存
 */
function setCache<T>(key: string, data: T, expire: number): void {
  const item: CacheItem<T> = {
    data,
    expireTime: Date.now() + expire,
  }
  try {
    localStorage.setItem(key, JSON.stringify(item))
  } catch (e) {
    console.warn('缓存存储失败:', e)
    // 存储满了，清理过期缓存
    clearExpiredCache()
    try {
      localStorage.setItem(key, JSON.stringify(item))
    } catch (e2) {
      console.error('缓存存储仍失败:', e2)
    }
  }
}

/**
 * 获取缓存
 */
function getCache<T>(key: string): T | null {
  try {
    const str = localStorage.getItem(key)
    if (!str) return null

    const item: CacheItem<T> = JSON.parse(str)
    // -1 表示永久缓存
    if (item.expireTime !== -1 && Date.now() > item.expireTime) {
      localStorage.removeItem(key)
      return null
    }
    return item.data
  } catch (e) {
    console.warn('缓存读取失败:', e)
    return null
  }
}

/**
 * 清理所有过期缓存
 */
export function clearExpiredCache(): void {
  const keys = Object.keys(localStorage)
  keys.forEach(key => {
    if (key.startsWith('cache_')) {
      try {
        const str = localStorage.getItem(key)
        if (str) {
          const item = JSON.parse(str)
          // -1 是永久缓存，不清理
          if (item.expireTime !== -1 && Date.now() > item.expireTime) {
            localStorage.removeItem(key)
          }
        }
      } catch (e) {
        // 无效数据直接删除
        localStorage.removeItem(key)
      }
    }
  })
}

// ==================== IndexedDB 歌词缓存 ====================

/**
 * 初始化 IndexedDB
 */
function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db)
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)

    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result
      if (!database.objectStoreNames.contains(LYRIC_STORE)) {
        database.createObjectStore(LYRIC_STORE, { keyPath: 'songId' })
      }
    }
  })
}

/**
 * 获取歌词缓存
 */
export async function getLyricCache(songId: number): Promise<string | null> {
  try {
    const database = await initDB()
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([LYRIC_STORE], 'readonly')
      const store = transaction.objectStore(LYRIC_STORE)
      const request = store.get(songId)

      request.onsuccess = () => {
        const result = request.result
        resolve(result ? result.lyric : null)
      }
      request.onerror = () => reject(request.error)
    })
  } catch (e) {
    console.warn('歌词缓存读取失败:', e)
    return null
  }
}

/**
 * 设置歌词缓存
 */
export async function setLyricCache(songId: number, lyric: string): Promise<void> {
  try {
    const database = await initDB()
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([LYRIC_STORE], 'readwrite')
      const store = transaction.objectStore(LYRIC_STORE)
      const request = store.put({ songId, lyric, updateTime: Date.now() })

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  } catch (e) {
    console.warn('歌词缓存存储失败:', e)
  }
}

/**
 * 删除歌词缓存
 */
export async function deleteLyricCache(songId: number): Promise<void> {
  try {
    const database = await initDB()
    return new Promise((resolve, reject) => {
      const transaction = database.transaction([LYRIC_STORE], 'readwrite')
      const store = transaction.objectStore(LYRIC_STORE)
      const request = store.delete(songId)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  } catch (e) {
    console.warn('歌词缓存删除失败:', e)
  }
}

/**
 * 清理不在播放列表中的歌词
 */
export async function cleanLyricCache(playlistSongIds: number[]): Promise<void> {
  try {
    const database = await initDB()
    const transaction = database.transaction([LYRIC_STORE], 'readwrite')
    const store = transaction.objectStore(LYRIC_STORE)
    const request = store.getAllKeys()

    request.onsuccess = () => {
      const allKeys = request.result as number[]
      allKeys.forEach(key => {
        if (!playlistSongIds.includes(key)) {
          store.delete(key)
        }
      })
    }
  } catch (e) {
    console.warn('歌词缓存清理失败:', e)
  }
}

// ==================== 业务缓存方法 ====================

import { HttpManager } from '@/api'

/**
 * 获取歌手列表(带缓存)
 */
export async function getSingerList(): Promise<any[]> {
  const cacheKey = CACHE_CONFIG.SINGER_LIST.key
  const cached = getCache<any[]>(cacheKey)
  if (cached) return cached

  const result = await HttpManager.getAllSinger() as any
  if (result.success && result.data) {
    setCache(cacheKey, result.data, CACHE_CONFIG.SINGER_LIST.expire)
    return result.data
  }
  return []
}

/**
 * 获取歌手详情(带缓存)
 */
export async function getSingerDetail(singerId: number): Promise<any> {
  const cacheKey = `${CACHE_CONFIG.SINGER_DETAIL.key}_${singerId}`
  const cached = getCache<any>(cacheKey)
  if (cached) return cached

  const singers = await getSingerList()
  const singer = singers.find((s: any) => s.id === singerId)
  if (singer) {
    setCache(cacheKey, singer, CACHE_CONFIG.SINGER_DETAIL.expire)
  }
  return singer || null
}

/**
 * 获取歌手专辑列表(带缓存) - 新接口，只返回专辑信息
 * 缓存策略：时间 + 计数器（任一满足就后台更新）
 * 1. 无缓存 → 发请求
 * 2. 缓存过期 → 返回旧缓存 + 后台更新
 * 3. 点击计数达到阈值 → 返回旧缓存 + 后台更新
 */
export async function getSingerAlbums(singerId: number): Promise<any[]> {
  const cacheKey = `${CACHE_CONFIG.ALBUM_LIST.key}_${singerId}`
  const cached = getCacheWithMeta<any[]>(cacheKey)
  const config = CACHE_CONFIG.ALBUM_LIST
  const refreshCount = config.refreshCount || 10

  // 无缓存，直接请求
  if (!cached) {
    const result = await HttpManager.getSingerAlbums(singerId) as any
    if (result.success && result.data) {
      setCacheWithCount(cacheKey, result.data, config.expire, 1)
      return result.data
    }
    return []
  }

  const now = Date.now()
  const isExpired = now > cached.expireTime
  const currentCount = (cached.clickCount || 0) + 1
  const shouldRefresh = isExpired || currentCount >= refreshCount

  // 需要更新：后台静默更新（先返回旧缓存）
  if (shouldRefresh) {
    // 重置计数器
    setCacheWithCount(cacheKey, cached.data, config.expire, 0)

    // 后台请求更新（不阻塞返回）
    HttpManager.getSingerAlbums(singerId).then((result: any) => {
      if (result.success && result.data) {
        setCacheWithCount(cacheKey, result.data, config.expire, 0)
      }
    }).catch(e => console.warn('专辑列表后台更新失败:', e))
  } else {
    // 更新计数器
    setCacheWithCount(cacheKey, cached.data, config.expire, currentCount)
  }

  return cached.data
}

/**
 * 获取缓存（含元数据：过期时间、点击计数）
 */
function getCacheWithMeta<T>(key: string): CacheItem<T> | null {
  try {
    const str = localStorage.getItem(key)
    if (!str) return null
    return JSON.parse(str) as CacheItem<T>
  } catch (e) {
    console.warn('缓存读取失败:', e)
    return null
  }
}

/**
 * 设置缓存（带点击计数）
 */
function setCacheWithCount<T>(key: string, data: T, expire: number, clickCount: number): void {
  const item: CacheItem<T> = {
    data,
    expireTime: Date.now() + expire,
    clickCount,
  }
  try {
    localStorage.setItem(key, JSON.stringify(item))
  } catch (e) {
    console.warn('缓存存储失败:', e)
    clearExpiredCache()
    try {
      localStorage.setItem(key, JSON.stringify(item))
    } catch (e2) {
      console.error('缓存存储仍失败:', e2)
    }
  }
}

/**
 * 获取专辑详情(带缓存) - 新接口，返回专辑歌曲
 */
export async function getAlbumDetail(albumId: number): Promise<any> {
  const cacheKey = `${CACHE_CONFIG.ALBUM_DETAIL.key}_${albumId}`
  const cached = getCache<any>(cacheKey)
  if (cached) return cached

  const result = await HttpManager.getAlbumDetail(albumId) as any
  if (result.success && result.data) {
    setCache(cacheKey, result.data, CACHE_CONFIG.ALBUM_DETAIL.expire)
    return result.data
  }
  return null
}

/**
 * 获取歌手所有歌曲(带缓存)
 */
export async function getSingerSongs(singerId: number): Promise<any[]> {
  const cacheKey = `${CACHE_CONFIG.SONG_LIST.key}_${singerId}`
  const cached = getCache<any[]>(cacheKey)
  if (cached) return cached

  const result = await HttpManager.getSongOfSingerId(singerId) as any
  if (result.success && result.data) {
    // 永久缓存歌曲列表
    setCache(cacheKey, result.data, CACHE_CONFIG.SONG_LIST.expire)
    return result.data
  }
  return []
}