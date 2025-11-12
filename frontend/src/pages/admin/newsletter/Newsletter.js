import React, { useEffect, useMemo, useState } from "react";
import { api, endpoints } from "../../../api/client";

function Newsletter() {
  const [templates, setTemplates] = useState([]);
  const [subs, setSubs] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [tpl, setTpl] = useState({ name: "", type: "General", subject: "", content_html: "", content_text: "" });
  const [testEmail, setTestEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [msg, setMsg] = useState("");

  const previewHtml = useMemo(() => {
    let html = (tpl.content_html || '').replace(/\{\{\s*name\s*\}\}/g, 'there').replace(/\{\{\s*year\s*\}\}/g, String(new Date().getFullYear()));
    const hasTags = /<\s*[a-z]/i.test(html);
    if (!hasTags) {
      html = html.replace(/\r?\n/g, '<br/>').replace(/\\n/g, '<br/>');
    } else {
      html = html.replace(/\\n/g, '<br/>');
    }
    return html;
  }, [tpl]);

  const loadData = async () => {
    try {
      const [t, s] = await Promise.all([
        api.get(endpoints.newsletterTemplates()),
        api.get(endpoints.newsletterSubscribers()),
      ]);
      setTemplates(Array.isArray(t) ? t : []);
      setSubs(Array.isArray(s) ? s : []);
      if (!selectedId && t?.[0]?.id) {
        setSelectedId(t[0].id);
        setTpl({
          name: t[0].name,
          type: t[0].type,
          subject: t[0].subject,
          content_html: t[0].content_html || "",
          content_text: t[0].content_text || "",
        });
      }
    } catch (e) {
      console.error("Load newsletter data failed:", e);
    }
  };

  useEffect(() => { loadData(); }, []);

  const onSelect = (id) => {
    setSelectedId(id);
    const found = templates.find(x => x.id === id);
    if (found) {
      setTpl({
        name: found.name,
        type: found.type,
        subject: found.subject,
        content_html: found.content_html || "",
        content_text: found.content_text || "",
      });
    }
  };

  const onNew = () => {
    setSelectedId(null);
    setTpl({ name: "", type: "General", subject: "", content_html: "", content_text: "" });
  };

  const saveTemplate = async () => {
    setSaving(true); setMsg("");
    try {
      if (selectedId) {
        await api.put(endpoints.newsletterTemplateById(selectedId), tpl);
      } else {
        const r = await api.post(endpoints.newsletterTemplates(), tpl);
        setSelectedId(r?.id || null);
      }
      await loadData();
      setMsg("Template saved.");
    } catch (e) {
      setMsg(e.message || "Failed to save template");
    } finally { setSaving(false); }
  };

  const deleteTemplate = async () => {
    if (!selectedId) return;
    if (!window.confirm("Delete this template?")) return; 
    try {
      await api.delete(endpoints.newsletterTemplateById(selectedId));
      onNew();
      await loadData();
      setMsg("Template deleted.");
    } catch (e) {
      setMsg(e.message || "Failed to delete template");
    }
  };

  const sendTest = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail)) {
      setMsg("Enter a valid test email."); return;
    }
    setSending(true); setMsg("");
    try {
      await api.post(endpoints.newsletterSend(), { templateId: selectedId, testEmail });
      setMsg("Test email sent.");
    } catch (e) {
      setMsg(e.message || "Failed to send test email");
    } finally { setSending(false); }
  };

  const subscribedUsers = useMemo(
    () => subs.filter(s => String(s.status || '').toLowerCase() === 'subscribed'),
    [subs]
  );

  const sendAll = async () => {
    if (!selectedId) { setMsg("Select a template first."); return; }
    const total = subscribedUsers.length;
    if (!total) { setMsg("No subscribed users."); return; }
    if (!window.confirm(`Send to all ${total} subscribed users?`)) return;
    setSending(true); setMsg("");
    try {
      const r = await api.post(endpoints.newsletterSend(), {
        templateId: selectedId,
        onlySubscribed: true,
        // If backend needs explicit emails uncomment:
        // emails: subscribedUsers.map(u => u.email).filter(Boolean)
      });
      setMsg(`Newsletter sent to ${r.sent ?? total} of ${r.total ?? total}.`);
    } catch (e) {
      setMsg(e.message || "Failed to send newsletter");
    } finally { setSending(false); }
  };

  // INSERT: helper to append unsubscribe link/footer
  const insertUnsubscribeLink = () => {
    const footer = `
    <p style="margin-top:30px;"> Kind regards,<br/>The Tutor Aid Team <br/> Visit our website <a href="https://gabydv.xyz" target="_blank" rel="noopener noreferrer" style="color:#2B5561; text-decoration:underline;">here</a>.</p>
<hr style="border:none; border-top:1px solid #eee; margin:20px 0;" />
<p style="font-size:12px; color:#666;">
  You’re receiving this because you subscribed to Tutor Aid newsletters.
  If this isn’t for you, you can <a href="https://gabydv.xyz/unsubscribe" target="_blank" rel="noopener noreferrer" style="color:#2B5561; text-decoration:underline;">unsubscribe</a> anytime.
</p>
<p style="font-size:12px; color:#666;">© ${new Date().getFullYear()} Tutor Aid</p>`;
    setTpl(prev => ({ ...prev, content_html: (prev.content_html || '') + footer }));
  };

  return (
    <div className="blue-page-background p-24">
      <h1 className="blue-page-title mb-8">Newsletter</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sidebar: templates list */}
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold">Templates</h2>
            <button className="px-2 py-1 bg-[#2B5561] text-white rounded" onClick={onNew}>New</button>
          </div>
          <ul className="space-y-1 max-h-80 overflow-auto">
            {templates.map(t => (
              <li key={t.id}>
                <button
                  className={`w-full text-left px-2 py-1 rounded ${selectedId === t.id ? 'bg-[#2B5561] text-white' : 'hover:bg-gray-100'}`}
                  onClick={() => onSelect(t.id)}
                >
                  <div className="text-sm font-medium">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.type}</div>
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-4 text-sm text-gray-600">
            Subscribers: <strong>{subscribedUsers.length}</strong>
          </div>
        </div>

        {/* Editor */}
        <div className="bg-white rounded-lg shadow p-12 lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm">Name</label>
              <input className="w-full border rounded px-2 py-1" value={tpl.name} onChange={e => setTpl({ ...tpl, name: e.target.value })} />
            </div>
            <div>
              <label className="text-sm">Type</label>
              <select className="w-full border rounded px-2 py-1 bg-transparent" value={tpl.type} onChange={e => setTpl({ ...tpl, type: e.target.value })}>
                <option>General</option>
                <option>Monthly Update</option>
                <option>New Tutors</option>
                <option>Study Tips</option>
                <option>Exam Prep</option>
                <option>Holiday Notice</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm">Subject</label>
              <input className="w-full border rounded px-2 py-1" value={tpl.subject} onChange={e => setTpl({ ...tpl, subject: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm">HTML Content (supports {'{{name}}'})</label>
              <textarea
                className="w-full border rounded px-2 py-1 h-48"
                value={tpl.content_html}
                onChange={e => setTpl({ ...tpl, content_html: e.target.value })}
              />
              {/* INSERT: quick action to add unsubscribe link */}
              <div className="flex items-center justify-between mt-1">
                <small className="text-gray-500">Tip: include an unsubscribe link.</small>
                <button
                  type="button"
                  onClick={insertUnsubscribeLink}
                  className="px-2 py-1 rounded text-sm bg-gray-100 hover:bg-gray-200"
                >
                  Insert Unsubscribe Link
                </button>
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm">Plain Text (optional)</label>
              <textarea className="w-full border rounded px-2 py-1 h-24" value={tpl.content_text} onChange={e => setTpl({ ...tpl, content_text: e.target.value })} />
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <button className="px-3 py-2 bg-[#2B5561] text-white rounded" onClick={saveTemplate} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            {selectedId && (
              <button className="px-3 py-2 bg-red-600 text-white rounded" onClick={deleteTemplate}>
                Delete
              </button>
            )}
          </div>

          <hr className="my-4" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-1">Preview</h3>
              <div className="border rounded p-2 max-h-72 overflow-auto" dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Send</h3>
              <div className="flex gap-2 mb-2">
                <input
                  type="email"
                  placeholder="Test email"
                  className="border rounded px-2 py-1 flex-1"
                  value={testEmail}
                  onChange={e => setTestEmail(e.target.value)}
                />
                <button className="px-3 py-2 bg-gray-700 text-white rounded" onClick={sendTest} disabled={sending || !selectedId}>
                  Send Test
                </button>
              </div>
              <button className="px-3 py-2 bg-emerald-600 text-white rounded"
                onClick={sendAll}
                disabled={sending || !selectedId || subscribedUsers.length === 0}>
                Send to All Subscribed ({subscribedUsers.length})
              </button>
            </div>
          </div>

          {msg && <div className="mt-3 text-sm">{msg}</div>}
        </div>
      </div>
    </div>
  );
}

export default Newsletter;