const { Resend } = require('resend');
const pool = require('../config/db');

const resend = new Resend(process.env.RESEND_API_KEY || '');
const FROM = process.env.RESEND_FROM || 'Tutor Aid <onboarding@resend.dev>';

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Tiny token renderer supporting {{name}} and any provided vars
function renderTemplate(str, vars = {}) {
  if (!str) return '';
  return String(str).replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, k) => {
    const v = vars[k];
    return v === undefined || v === null ? '' : String(v);
  });
}

// Public subscribe: store subscriber and send a thank-you email
exports.subscribe = async (req, res) => {
  try {
    const { email, name } = req.body || {};
    if (!isValidEmail(email)) return res.status(400).json({ error: 'Valid email required' });

    // Upsert subscriber (subscribe or re-subscribe if previously unsubscribed)
    await pool.query(
      `INSERT INTO newsletterSubscribers (name, email, status) VALUES (?, ?, 'subscribed')
       ON DUPLICATE KEY UPDATE name = VALUES(name), status = 'subscribed', unsubscribed_at = NULL`,
      [name || null, email.toLowerCase()]
    );

    if (!process.env.RESEND_API_KEY) {
      console.log('[newsletter] RESEND_API_KEY missing; accepted without send');
      return res.json({ ok: true, sent: false });
    }

    const displayName = (name || '').trim() || 'there';
    const subject = 'Thanks for subscribing to Tutor Aid';
    const text = `Hi ${displayName},

Thanks for subscribing to the Tutor Aid newsletter!

You’ll now receive occasional emails with:
- Study tips and learning strategies
- Updates on new subjects and tutors
- Exclusive student resources and features

If you ever change your mind, you can unsubscribe from any email.

Warm regards,
Tutor Aid Team`;
    const html = `
      <div style="font-family: Arial, sans-serif; line-height:1.6; color:#222">
        <h2 style="color:#2B5561; margin:0 0 8px">Thanks for subscribing, ${displayName}!</h2>
        <p>Welcome to Tutor Aid. You’ll now receive:</p>
        <ul>
          <li>Study tips and learning strategies</li>
          <li>Updates on new subjects and tutors</li>
          <li>Exclusive student resources and features</li>
        </ul>
        <p style="margin-top:12px">If you ever change your mind, you can unsubscribe from any email.</p>
        <p style="margin-top:16px">Warm regards,<br/>Tutor Aid Team</p>
        <p style="font-size:12px; color:#666; margin-top:12px">© ${new Date().getFullYear()} Tutor Aid</p>
      </div>
    `;

    const { error } = await resend.emails.send({ from: FROM, to: email, subject, text, html });
    if (error) {
      console.error('[newsletter] Resend error:', error);
      return res.json({ ok: true, sent: false });
    }

    return res.json({ ok: true, sent: true });
  } catch (err) {
    console.error('[newsletter] subscribe error:', err);
    return res.status(500).json({ error: 'Failed to process subscription' });
  }
};

// Admin: Subscribers
exports.listSubscribers = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, status, subscribed_at, unsubscribed_at FROM newsletterSubscribers ORDER BY subscribed_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error('[newsletter] listSubscribers error:', err);
    res.status(500).json({ error: 'Failed to fetch subscribers' });
  }
};

exports.deleteSubscriber = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM newsletterSubscribers WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('[newsletter] deleteSubscriber error:', err);
    res.status(500).json({ error: 'Failed to delete subscriber' });
  }
};

exports.unsubscribeByEmail = async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!isValidEmail(email)) return res.status(400).json({ error: 'Valid email required' });
    await pool.query(
      `UPDATE newsletterSubscribers
       SET status = 'unsubscribed', unsubscribed_at = CURRENT_TIMESTAMP
       WHERE email = ?`,
      [email.toLowerCase()]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('[newsletter] unsubscribe error:', err);
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
};

// Admin: Templates
exports.listTemplates = async (_req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, type, subject, content_html, content_text, updated_at FROM newsletterTemplates ORDER BY updated_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error('[newsletter] listTemplates error:', err);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
};

exports.createTemplate = async (req, res) => {
  try {
    const { name, type, subject, content_html, content_text } = req.body || {};
    if (!name || !type || !subject || !content_html) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const [r] = await pool.query(
      `INSERT INTO newsletterTemplates (name, type, subject, content_html, content_text)
       VALUES (?, ?, ?, ?, ?)`,
      [name, type, subject, content_html, content_text || null]
    );
    res.status(201).json({ id: r.insertId });
  } catch (err) {
    console.error('[newsletter] createTemplate error:', err);
    res.status(500).json({ error: 'Failed to create template' });
  }
};

exports.updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, subject, content_html, content_text } = req.body || {};
    await pool.query(
      `UPDATE newsletterTemplates
       SET name = COALESCE(?, name),
           type = COALESCE(?, type),
           subject = COALESCE(?, subject),
           content_html = COALESCE(?, content_html),
           content_text = COALESCE(?, content_text)
       WHERE id = ?`,
      [name ?? null, type ?? null, subject ?? null, content_html ?? null, content_text ?? null, id]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('[newsletter] updateTemplate error:', err);
    res.status(500).json({ error: 'Failed to update template' });
  }
};

exports.deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM newsletterTemplates WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('[newsletter] deleteTemplate error:', err);
    res.status(500).json({ error: 'Failed to delete template' });
  }
};

// Admin: Send (test or broadcast)
exports.send = async (req, res) => {
  try {
    const { templateId, testEmail, variables } = req.body || {};
    if (!templateId) return res.status(400).json({ error: 'templateId is required' });

    const [[tpl]] = await pool.query('SELECT * FROM newsletterTemplates WHERE id = ? LIMIT 1', [templateId]);
    if (!tpl) return res.status(404).json({ error: 'Template not found' });

    if (!process.env.RESEND_API_KEY) {
      console.warn('[newsletter] RESEND_API_KEY missing; simulating send');
      return res.json({ ok: true, sent: 0, simulated: true });
    }

    const vars = { name: 'there', year: new Date().getFullYear(), ...(variables || {}) };

    const normalizeHtml = (str) => {
      if (!str) return '';
      let html = renderTemplate(str, vars);
      const hasTags = /<\s*[a-z]/i.test(html);
      // Convert both real newlines and escaped "\n" if not already proper HTML
      if (!hasTags) {
        html = html.replace(/\r?\n/g, '<br/>').replace(/\\n/g, '<br/>');
      } else {
        // If someone pasted escaped "\n" into HTML, still clean them
        html = html.replace(/\\n/g, '<br/>');
      }
      return html;
    };

    const normalizeText = (str) => {
      if (!str) return undefined;
      // Render tokens and convert any escaped "\n" to real newlines
      let txt = renderTemplate(str, vars);
      return txt.replace(/\\n/g, '\n');
    };

    // If testEmail provided, send only to that email
    if (testEmail) {
      if (!isValidEmail(testEmail)) return res.status(400).json({ error: 'Valid testEmail required' });
      const html = normalizeHtml(tpl.content_html);
      const text = normalizeText(tpl.content_text);
      const { error } = await resend.emails.send({ from: FROM, to: testEmail, subject: renderTemplate(tpl.subject, vars), html, text });
      if (error) {
        console.error('[newsletter] Resend test error:', error);
        return res.status(500).json({ error: 'Failed to send test email' });
      }
      return res.json({ ok: true, sent: 1 });
    }

    // Broadcast
    const [subs] = await pool.query(`SELECT name, email FROM newsletterSubscribers WHERE status = 'subscribed'`);
    if (!subs.length) return res.json({ ok: true, sent: 0 });

    const chunkSize = 50;
    let sent = 0;
    for (let i = 0; i < subs.length; i += chunkSize) {
      const chunk = subs.slice(i, i + chunkSize);
      const sends = await Promise.allSettled(
        chunk.map(({ name, email }) => {
          const perVars = { ...vars, name: name || 'there' };
          const html = normalizeHtml(tpl.content_html);
          const text = normalizeText(tpl.content_text);
          const subject = renderTemplate(tpl.subject, perVars);
          return resend.emails.send({ from: FROM, to: email, subject, html, text });
        })
      );
      sent += sends.filter(s => s.status === 'fulfilled' && !s.value?.error).length;
    }

    return res.json({ ok: true, sent, total: subs.length });
  } catch (err) {
    console.error('[newsletter] send error:', err);
    res.status(500).json({ error: 'Failed to send newsletter' });
  }
};