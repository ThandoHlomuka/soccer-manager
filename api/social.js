const db = require('../lib/db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { type, id } = req.query;
  try {
    /* ─── MESSAGES ─── */
    if (type === 'messages') {
      if (req.method === 'GET') {
        const messages = await db.list('message');
        messages.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        return res.json({ messages });
      }
      if (req.method === 'POST') {
        const { toId, subject, body } = req.body || {};
        if (!toId) return res.status(400).json({ error: 'toId is required.' });
        const msgId = db.uid();
        const message = { id: msgId, toId, subject: subject || '', body: body || '', fromId: 'manager', createdAt: Date.now() };
        await db.create('message', msgId, message);
        return res.status(201).json(message);
      }
    }

    /* ─── GROUPS ─── */
    if (type === 'groups') {
      if (req.method === 'GET') {
        const groups = await db.list('group');
        const enriched = groups.map(g => ({
          ...g,
          memberCount: (g.members || []).length,
        }));
        return res.json({ groups: enriched });
      }
      if (req.method === 'POST') {
        const { name, description, groupId, action } = req.body || {};
        if (groupId && action === 'join') {
          const group = await db.get('group', groupId);
          if (!group) return res.status(404).json({ error: 'Group not found.' });
          if (!group.members) group.members = [];
          if (!group.members.includes('manager')) group.members.push('manager');
          await db.update('group', groupId, group);
          return res.json(group);
        }
        if (!name) return res.status(400).json({ error: 'Group name is required.' });
        const gId = db.uid();
        const group = { id: gId, name, description: description || '', members: ['manager'], createdAt: Date.now() };
        await db.create('group', gId, group);
        return res.status(201).json(group);
      }
      if (req.method === 'PUT') {
        if (!id) return res.status(400).json({ error: 'Group ID required.' });
        const group = await db.get('group', id);
        if (!group) return res.status(404).json({ error: 'Group not found.' });
        const { name, description } = req.body || {};
        if (name) group.name = name;
        if (description !== undefined) group.description = description;
        await db.update('group', id, group);
        return res.json(group);
      }
    }

    /* ─── FOLLOWERS ─── */
    if (type === 'followers') {
      if (req.method === 'GET') {
        const followers = await db.list('follower');
        return res.json({ followers });
      }
      if (req.method === 'POST') {
        const { playerId, follow } = req.body || {};
        if (!playerId) return res.status(400).json({ error: 'playerId is required.' });
        if (follow === false) {
          const all = await db.list('follower');
          const existing = all.find(f => f.playerId === playerId && f.followerId === 'manager');
          if (existing) await db.remove('follower', existing.id);
          return res.json({ success: true, following: false });
        }
        const fId = db.uid();
        const rel = { id: fId, playerId, followerId: 'manager', following: true, timestamp: Date.now() };
        await db.create('follower', fId, rel);
        return res.status(201).json(rel);
      }
      if (req.method === 'DELETE') {
        if (!id) return res.status(400).json({ error: 'Follower ID required.' });
        await db.remove('follower', id);
        return res.json({ success: true });
      }
    }

    return res.status(400).json({ error: 'Invalid type. Use messages, groups, or followers.' });
  } catch (err) { return res.status(err.status || 500).json({ error: err.message }); }
};
