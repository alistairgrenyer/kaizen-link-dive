/**
 * Cache TTL Tests
 * Tests the in-memory caching system with TTL expiration
 */

import { cacheGet, cacheSet, cacheClear } from '../lib/cache';

describe('Cache TTL', () => {
  beforeEach(() => {
    // Clear the cache before each test
    cacheClear();
  });

  test('should store and retrieve data', () => {
    const key = 'test-key';
    const data = { test: 'data' };
    
    cacheSet(key, data, 60); // 60 second TTL
    
    const retrieved = cacheGet(key);
    expect(retrieved).toEqual(data);
  });
  
  test('should return undefined for non-existent keys (cache miss)', () => {
    const missing = cacheGet('non-existent-key');
    expect(missing).toBeUndefined();
  });

  test('should respect TTL and expire items', async () => {
    const key = 'expires-quickly';
    const data = { ephemeral: true };
    
    // Set with very short TTL (100ms)
    cacheSet(key, data, 0.1); 
    
    // Immediately after setting, the data should be available (cache hit)
    expect(cacheGet(key)).toEqual(data);
    
    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // After TTL expires, should be a cache miss
    expect(cacheGet(key)).toBeUndefined();
  });

  test('should keep data for full TTL duration', async () => {
    const key = 'not-expired';
    const data = { fresh: true };
    
    // Set with 200ms TTL
    cacheSet(key, data, 0.2);
    
    // Check after 100ms (half TTL) - should still be there
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(cacheGet(key)).toEqual(data);
  });

  test('should override previous values for same key', () => {
    const key = 'overridden';
    const originalData = { version: 1 };
    const newData = { version: 2 };
    
    cacheSet(key, originalData, 60);
    cacheSet(key, newData, 60);
    
    expect(cacheGet(key)).toEqual(newData);
  });
  
  test('should reset TTL when updating existing key', async () => {
    const key = 'extended';
    const originalData = { version: 1 };
    
    // Set original with very short TTL
    cacheSet(key, originalData, 0.1);
    
    // Wait a bit but not enough to expire
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Update with new TTL (extending lifetime)
    cacheSet(key, originalData, 0.2);
    
    // Wait for original TTL to expire
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Should still be in cache because TTL was reset/extended
    expect(cacheGet(key)).toEqual(originalData);
  });

  test('should handle undefined/null data', () => {
    cacheSet('null-data', null as any, 60);
    cacheSet('undefined-data', undefined as any, 60);
    
    expect(cacheGet('null-data')).toBeNull();
    expect(cacheGet('undefined-data')).toBeUndefined();
  });

  test('should handle multiple cache entries independently', async () => {
    // Set multiple entries with different TTLs
    cacheSet('short-lived', { ttl: 'short' }, 0.1);
    cacheSet('long-lived', { ttl: 'long' }, 0.3);
    
    // Initial state - both should be present
    expect(cacheGet('short-lived')).toEqual({ ttl: 'short' });
    expect(cacheGet('long-lived')).toEqual({ ttl: 'long' });
    
    // Wait for short TTL to expire
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // Short-lived should be gone, long-lived should remain
    expect(cacheGet('short-lived')).toBeUndefined();
    expect(cacheGet('long-lived')).toEqual({ ttl: 'long' });
    
    // Wait for long TTL to expire
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Both should now be gone
    expect(cacheGet('short-lived')).toBeUndefined();
    expect(cacheGet('long-lived')).toBeUndefined();
  });
});
