const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
});

function prefixed(type, id) {
  return `${type}:${id}`;
}

function listKey(type) {
  return `${type}:list`;
}

/* ─── Generic helpers ─── */

async function create(type, id, data) {
  const key = prefixed(type, id);
  const existing = await redis.get(key);
  if (existing) {
    const err = new Error(`${type} with id '${id}' already exists.`);
    err.status = 409;
    throw err;
  }
  await redis.set(key, JSON.stringify(data));
  await redis.sadd(listKey(type), id);
  return data;
}

async function get(type, id) {
  const raw = await redis.get(prefixed(type, id));
  if (!raw) return null;
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

async function update(type, id, data) {
  const existing = await get(type, id);
  if (!existing) {
    const err = new Error(`${type} not found.`);
    err.status = 404;
    throw err;
  }
  const merged = { ...existing, ...data, id };
  await redis.set(prefixed(type, id), JSON.stringify(merged));
  return merged;
}

async function remove(type, id) {
  const existing = await get(type, id);
  if (!existing) {
    const err = new Error(`${type} not found.`);
    err.status = 404;
    throw err;
  }
  await redis.del(prefixed(type, id));
  await redis.srem(listKey(type), id);
  return { success: true };
}

async function list(type) {
  const ids = await redis.smembers(listKey(type));
  if (!ids || ids.length === 0) return [];
  const items = [];
  for (const id of ids) {
    const item = await get(type, id);
    if (item) items.push(item);
  }
  return items;
}

function uid() {
  return crypto.randomUUID().split('-')[0];
}

module.exports = { create, get, update, remove, list, uid, redis };
