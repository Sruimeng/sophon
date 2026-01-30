/**
 * Utility Functions
 * Generic utilities for template use
 */

/**
 * Check if device is mobile based on user agent
 */
export function isMobileDevice(ua: string | null) {
  if (!ua) return false;
  if (/android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
    return true;
  } else {
    return false;
  }
}

/**
 * Sleep for specified milliseconds
 */
export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Create a promise with exposed resolve/reject functions
 */
export const pf = <T>() => {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });
  return { promise, resolve, reject };
};

/**
 * Open URL in new tab or current window
 */
export const jump = (url: string, blank = true) => {
  const a = document.createElement('a');
  a.href = url;
  if (blank) {
    a.target = '_blank';
  }
  a.click();
};

/**
 * Format file size to human readable string
 * @param bytes File size in bytes
 * @param decimals Number of decimal places
 * @returns Formatted file size string
 */
export const formatFileSize = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Copy text to clipboard using native API
 */
export const copy = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

/**
 * Extract Bilibili video BV ID from URL
 */
export const extractBVId = (url: string) => {
  const match = url.match(/\/video\/(BV[^/]+)/);
  return match ? match[1] : null;
};

/**
 * Extract YouTube video ID from URL
 */
export const extractVideoId = (url: string) => {
  const matchStandard = url.match(/[?&]v=([^&]+)/);
  if (matchStandard) {
    return matchStandard[1];
  }
  const matchShare = url.match(/youtu\.be\/([^?&]+)/);
  if (matchShare) {
    return matchShare[1];
  }
  const matchShorts = url.match(/youtube\.com\/shorts\/([^?&]+)/);
  if (matchShorts) {
    return matchShorts[1];
  }
  return null;
};

/**
 * Parse video URL and return platform-specific info
 */
export const videoUrlHandler = (url: string) => {
  // Reject URLs with Chinese characters
  const hasChinese = /[\u4e00-\u9fff]/.test(url);
  if (hasChinese) {
    return null;
  }
  const urlRegex = /https?:\/\/[^\s]+/g;
  const matches = url.match(urlRegex);

  if (!matches?.[0]) {
    return null;
  }

  const urlObj = new URL(matches[0]);

  // Check for Bilibili video - return bvid
  const bvid = extractBVId(urlObj.pathname);
  if (bvid) {
    return {
      type: 'bilibili',
      bvid: bvid,
    };
  }

  // Check for YouTube video
  const youtubeId = extractVideoId(urlObj.href);
  if (youtubeId) {
    return {
      type: 'youtube',
      src: `//www.youtube.com/embed/${youtubeId}`,
    };
  }

  return null;
};
