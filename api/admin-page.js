export function renderAdminPage() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>AI Course Dashboard</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Arial, sans-serif; background: #f4f6f8; color: #111827; }
    header { padding: 16px 20px; background: #075e54; color: white; display: flex; justify-content: space-between; align-items: center; }
    header h1 { font-size: 20px; margin: 0; }
    header button { background: transparent; border: 1px solid rgba(255,255,255,.6); color: white; padding: 6px 12px; border-radius: 6px; cursor: pointer; }
    main { max-width: 1000px; margin: 0 auto; padding: 20px; }
    #loginBox { max-width: 340px; margin: 60px auto; background: white; padding: 24px; border-radius: 8px; border: 1px solid #e5e7eb; }
    #loginBox h2 { margin-top: 0; font-size: 18px; }
    #loginBox input { width: 100%; padding: 10px; margin: 8px 0; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 15px; }
    #loginBox button { width: 100%; padding: 10px; background: #128c7e; color: white; border: 0; border-radius: 6px; font-size: 15px; cursor: pointer; }
    #loginError { color: #b91c1c; font-size: 13px; min-height: 18px; }
    .tabs { display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: wrap; }
    .tabs button { padding: 8px 14px; border: 1px solid #cbd5e1; background: white; border-radius: 6px; cursor: pointer; font-size: 14px; }
    .tabs button.active { background: #075e54; color: white; border-color: #075e54; }
    .card { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
    .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; }
    .stat-grid .stat { background: #f9fafb; border-radius: 8px; padding: 12px; text-align: center; }
    .stat .value { font-size: 24px; font-weight: bold; color: #075e54; }
    .stat .label { font-size: 12px; color: #6b7280; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th, td { text-align: left; padding: 8px; border-bottom: 1px solid #eee; vertical-align: top; }
    th { color: #6b7280; font-weight: 600; }
    .pill { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 12px; background: #e5e7eb; }
    .pill.paid { background: #dcfce7; color: #166534; }
    .pill.pending { background: #fef9c3; color: #854d0e; }
    .pill.fallback { background: #fee2e2; color: #991b1b; }
    .row-actions button { margin-right: 6px; font-size: 12px; padding: 4px 8px; border-radius: 4px; border: 1px solid #cbd5e1; background: white; cursor: pointer; }
    label { display: block; font-size: 13px; color: #374151; margin: 10px 0 4px; }
    input, textarea, select { width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; font-family: inherit; }
    textarea { min-height: 70px; }
    .save-btn { margin-top: 14px; background: #128c7e; color: white; border: 0; padding: 10px 18px; border-radius: 6px; cursor: pointer; }
    .add-btn { background: #075e54; color: white; border: 0; padding: 8px 14px; border-radius: 6px; cursor: pointer; margin-bottom: 12px; }
    .status-msg { font-size: 13px; margin-top: 8px; }
    .hidden { display: none; }
    .subhead { font-size: 15px; margin: 18px 0 8px; color: #075e54; }
    .notice { background: #fef9c3; border: 1px solid #fde68a; color: #854d0e; border-radius: 8px; padding: 14px 16px; font-size: 14px; line-height: 1.5; }
    .notice code { background: rgba(0,0,0,.06); padding: 1px 5px; border-radius: 4px; }
    .notice.error { background: #fee2e2; border-color: #fecaca; color: #991b1b; }
    .muted { color: #6b7280; font-size: 12px; }
    .refresh-btn { background: white; border: 1px solid #cbd5e1; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 13px; float: right; }
  </style>
</head>
<body>
  <div id="loginBox">
    <h2>Admin Login</h2>
    <input id="loginPassword" type="password" placeholder="Admin password">
    <button id="loginBtn">Log In</button>
    <div id="loginError"></div>
  </div>

  <div id="dashboard" class="hidden">
    <header>
      <h1>AI Course Dashboard</h1>
      <button id="logoutBtn">Log Out</button>
    </header>
    <main>
      <div class="tabs">
        <button data-tab="analytics" class="active">Analytics</button>
        <button data-tab="marketing">Marketing</button>
        <button data-tab="conversations">Conversations</button>
        <button data-tab="students">Students</button>
        <button data-tab="content">Course Content</button>
      </div>

      <section id="tab-analytics"></section>
      <section id="tab-marketing" class="hidden"></section>
      <section id="tab-conversations" class="hidden"></section>
      <section id="tab-students" class="hidden"></section>
      <section id="tab-content" class="hidden"></section>
    </main>
  </div>

  <script>
    const loginBox = document.getElementById("loginBox");
    const dashboard = document.getElementById("dashboard");

    async function api(path, options) {
      const response = await fetch(path, {
        ...options,
        headers: { "Content-Type": "application/json", ...(options && options.headers) }
      });
      if (response.status === 401) {
        showLogin();
        throw new Error("Unauthorized");
      }
      return response.json();
    }

    function showLogin() {
      loginBox.classList.remove("hidden");
      dashboard.classList.add("hidden");
    }

    function showDashboard() {
      loginBox.classList.add("hidden");
      dashboard.classList.remove("hidden");
      loadActiveTab();
    }

    document.getElementById("loginBtn").addEventListener("click", async () => {
      const password = document.getElementById("loginPassword").value;
      const errorBox = document.getElementById("loginError");
      errorBox.textContent = "";
      const response = await fetch("/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      if (response.ok) {
        showDashboard();
      } else {
        errorBox.textContent = "Wrong password.";
      }
    });

    document.getElementById("logoutBtn").addEventListener("click", async () => {
      await fetch("/admin/logout", { method: "POST" });
      showLogin();
    });

    const tabButtons = document.querySelectorAll(".tabs button");
    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        tabButtons.forEach((b) => b.classList.remove("active"));
        button.classList.add("active");
        document.querySelectorAll("main section").forEach((s) => s.classList.add("hidden"));
        document.getElementById("tab-" + button.dataset.tab).classList.remove("hidden");
        loadTab(button.dataset.tab);
      });
    });

    function loadActiveTab() {
      const active = document.querySelector(".tabs button.active");
      loadTab(active.dataset.tab);
    }

    function loadTab(tab) {
      if (tab === "analytics") loadAnalytics();
      if (tab === "marketing") loadMarketing();
      if (tab === "conversations") loadConversations();
      if (tab === "students") loadStudents();
      if (tab === "content") loadContent();
    }

    function escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text == null ? "" : String(text);
      return div.innerHTML;
    }

    async function loadAnalytics() {
      const el = document.getElementById("tab-analytics");
      el.innerHTML = "Loading...";
      const stats = await api("/admin/api/stats");
      const topCategoriesRows = stats.topCategories
        .map((c) => \`<tr><td>\${escapeHtml(c.category)}</td><td>\${c.count}</td></tr>\`)
        .join("");
      el.innerHTML = \`
        <div class="card">
          <div class="stat-grid">
            <div class="stat"><div class="value">\${stats.totalMessages}</div><div class="label">Total Messages</div></div>
            <div class="stat"><div class="value">\${stats.messagesToday}</div><div class="label">Messages Today</div></div>
            <div class="stat"><div class="value">\${stats.uniqueContacts}</div><div class="label">Unique Contacts</div></div>
            <div class="stat"><div class="value">\${stats.fallbackRate}%</div><div class="label">Unanswered Rate</div></div>
            <div class="stat"><div class="value">\${stats.totalStudents}</div><div class="label">Registered Students</div></div>
          </div>
        </div>
        <div class="card">
          <div class="subhead">Most Asked Question Types</div>
          <table><thead><tr><th>Category</th><th>Count</th></tr></thead><tbody>\${topCategoriesRows || '<tr><td colspan="2">No data yet.</td></tr>'}</tbody></table>
        </div>
      \`;
    }

    function formatNumber(value) {
      return Number(value || 0).toLocaleString();
    }

    function formatMoney(value) {
      return value == null ? "—" : "PKR " + Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 });
    }

    async function loadMarketing(forceRefresh) {
      const el = document.getElementById("tab-marketing");
      el.innerHTML = "Loading...";
      const insights = await api("/admin/api/marketing" + (forceRefresh ? "?refresh=1" : ""));

      if (!insights.connected) {
        el.innerHTML = \`
          <div class="card">
            <div class="notice">
              <strong>Meta Ads isn't connected yet.</strong><br><br>
              To show live ad spend, leads, and results here, set these environment variables on your
              host and restart the server:<br><br>
              <code>META_ACCESS_TOKEN</code> — a Meta access token with <code>ads_read</code> permission
              (Meta Business Settings → System Users → generate token)<br>
              <code>META_AD_ACCOUNT_ID</code> — your ad account's numeric ID (without the "act_" prefix)
            </div>
          </div>
        \`;
        return;
      }

      if (insights.error) {
        el.innerHTML = \`
          <div class="card">
            <div class="notice error"><strong>Couldn't load Meta Ads data.</strong><br>\${escapeHtml(insights.error)}</div>
            <button class="refresh-btn" id="retryMarketing">Retry</button>
          </div>
        \`;
        document.getElementById("retryMarketing").addEventListener("click", () => loadMarketing(true));
        return;
      }

      const account = insights.account || {};
      const campaignRows = (insights.campaigns || [])
        .map(
          (c) => \`<tr>
            <td>\${escapeHtml(c.name)}</td>
            <td>\${formatMoney(c.spend)}</td>
            <td>\${formatNumber(c.impressions)}</td>
            <td>\${formatNumber(c.clicks)}</td>
            <td>\${formatNumber(c.leads)}</td>
            <td>\${formatMoney(c.costPerLead)}</td>
          </tr>\`
        )
        .join("");

      el.innerHTML = \`
        <div class="card">
          <button class="refresh-btn" id="refreshMarketing">Refresh</button>
          <div class="subhead">Last 30 Days — Ad Account Performance</div>
          <div class="stat-grid">
            <div class="stat"><div class="value">\${formatMoney(account.spend)}</div><div class="label">Amount Spent</div></div>
            <div class="stat"><div class="value">\${formatNumber(account.impressions)}</div><div class="label">Impressions</div></div>
            <div class="stat"><div class="value">\${formatNumber(account.clicks)}</div><div class="label">Clicks</div></div>
            <div class="stat"><div class="value">\${account.ctr != null ? account.ctr + "%" : "—"}</div><div class="label">CTR</div></div>
            <div class="stat"><div class="value">\${formatMoney(account.cpc)}</div><div class="label">Cost per Click</div></div>
            <div class="stat"><div class="value">\${formatNumber(account.leads)}</div><div class="label">Leads / Results</div></div>
            <div class="stat"><div class="value">\${formatMoney(account.costPerLead)}</div><div class="label">Cost per Lead</div></div>
            <div class="stat"><div class="value">\${formatMoney(insights.costPerRegisteredStudent)}</div><div class="label">Cost per Registered Student</div></div>
          </div>
          <p class="muted">\${insights.paidStudents} paid student(s) recorded in the Students tab. Cost per registered student = total ad spend ÷ paid students.</p>
        </div>
        <div class="card">
          <div class="subhead">Campaigns</div>
          <table>
            <thead><tr><th>Campaign</th><th>Spend</th><th>Impressions</th><th>Clicks</th><th>Leads</th><th>Cost / Lead</th></tr></thead>
            <tbody>\${campaignRows || '<tr><td colspan="6">No campaign data for this period.</td></tr>'}</tbody>
          </table>
        </div>
      \`;

      document.getElementById("refreshMarketing").addEventListener("click", () => loadMarketing(true));
    }

    async function loadConversations() {
      const el = document.getElementById("tab-conversations");
      el.innerHTML = "Loading...";
      const conversations = await api("/admin/api/conversations");
      const rows = conversations
        .slice()
        .reverse()
        .slice(0, 200)
        .map(
          (c) => \`<tr>
            <td>\${new Date(c.timestamp).toLocaleString()}</td>
            <td>\${escapeHtml(c.from)}</td>
            <td>\${escapeHtml(c.channel)}</td>
            <td>\${escapeHtml(c.text)}</td>
            <td>\${escapeHtml(c.reply)}</td>
            <td><span class="pill \${c.category === 'fallback' ? 'fallback' : ''}">\${escapeHtml(c.category)}</span></td>
          </tr>\`
        )
        .join("");
      el.innerHTML = \`
        <div class="card">
          <div class="subhead">Recent Conversations (latest 200)</div>
          <table>
            <thead><tr><th>Time</th><th>From</th><th>Channel</th><th>Message</th><th>Reply</th><th>Category</th></tr></thead>
            <tbody>\${rows || '<tr><td colspan="6">No conversations logged yet.</td></tr>'}</tbody>
          </table>
        </div>
      \`;
    }

    async function loadStudents() {
      const el = document.getElementById("tab-students");
      el.innerHTML = "Loading...";
      const students = await api("/admin/api/students");
      const rows = students
        .map(
          (s) => \`<tr data-id="\${s.id}">
            <td>\${escapeHtml(s.name)}</td>
            <td>\${escapeHtml(s.contact)}</td>
            <td><span class="pill \${s.paymentStatus}">\${escapeHtml(s.paymentStatus)}</span></td>
            <td>\${escapeHtml(s.notes)}</td>
            <td class="row-actions">
              <button class="toggle-payment">Toggle Paid</button>
              <button class="delete-student">Delete</button>
            </td>
          </tr>\`
        )
        .join("");
      el.innerHTML = \`
        <div class="card">
          <button class="add-btn" id="addStudentBtn">+ Add Student</button>
          <table>
            <thead><tr><th>Name</th><th>Contact</th><th>Payment</th><th>Notes</th><th></th></tr></thead>
            <tbody>\${rows || '<tr><td colspan="5">No students yet.</td></tr>'}</tbody>
          </table>
        </div>
      \`;

      document.getElementById("addStudentBtn").addEventListener("click", async () => {
        const name = prompt("Student name?");
        if (!name) return;
        const contact = prompt("Contact (phone/WhatsApp)?") || "";
        await api("/admin/api/students", { method: "POST", body: JSON.stringify({ name, contact }) });
        loadStudents();
      });

      el.querySelectorAll(".toggle-payment").forEach((btn) => {
        btn.addEventListener("click", async (event) => {
          const row = event.target.closest("tr");
          const id = row.dataset.id;
          const current = row.querySelector(".pill").textContent.trim();
          const next = current === "paid" ? "pending" : "paid";
          await api("/admin/api/students/" + id, { method: "PUT", body: JSON.stringify({ paymentStatus: next }) });
          loadStudents();
        });
      });

      el.querySelectorAll(".delete-student").forEach((btn) => {
        btn.addEventListener("click", async (event) => {
          const row = event.target.closest("tr");
          const id = row.dataset.id;
          if (!confirm("Delete this student?")) return;
          await api("/admin/api/students/" + id, { method: "DELETE" });
          loadStudents();
        });
      });
    }

    async function loadContent() {
      const el = document.getElementById("tab-content");
      el.innerHTML = "Loading...";
      const content = await api("/admin/api/content");
      el.innerHTML = \`
        <div class="card">
          <div class="subhead">Course Info</div>
          <label>Fee</label><input id="c-fee" value="\${escapeHtml(content.course.fee)}">
          <label>Class Days</label><input id="c-days" value="\${escapeHtml(content.course.days)}">
          <label>Class Time</label><input id="c-time" value="\${escapeHtml(content.course.time)}">
          <label>Duration</label><input id="c-duration" value="\${escapeHtml(content.course.duration)}">
          <label>Topics (one per line)</label>
          <textarea id="c-topics">\${escapeHtml((content.course.topics || []).join("\\n"))}</textarea>

          <div class="subhead">Bot Reply Text</div>
          <label>Fee reply</label><textarea id="r-fee">\${escapeHtml(content.replies.fee)}</textarea>
          <label>Timing reply</label><textarea id="r-timing">\${escapeHtml(content.replies.timing)}</textarea>
          <label>Payment reply</label><textarea id="r-payment">\${escapeHtml(content.replies.payment)}</textarea>
          <label>Registration reply</label><textarea id="r-registration">\${escapeHtml(content.replies.registration)}</textarea>
          <label>Recordings reply</label><textarea id="r-recordings">\${escapeHtml(content.replies.recordings)}</textarea>
          <label>Fallback reply (when bot doesn't understand)</label><textarea id="r-fallback">\${escapeHtml(content.replies.fallback)}</textarea>

          <button class="save-btn" id="saveContentBtn">Save Changes</button>
          <div class="status-msg" id="saveStatus"></div>
        </div>
      \`;

      document.getElementById("saveContentBtn").addEventListener("click", async () => {
        const payload = {
          course: {
            fee: document.getElementById("c-fee").value,
            days: document.getElementById("c-days").value,
            time: document.getElementById("c-time").value,
            duration: document.getElementById("c-duration").value,
            topics: document.getElementById("c-topics").value.split("\\n").map((t) => t.trim()).filter(Boolean)
          },
          replies: {
            fee: document.getElementById("r-fee").value,
            timing: document.getElementById("r-timing").value,
            payment: document.getElementById("r-payment").value,
            registration: document.getElementById("r-registration").value,
            recordings: document.getElementById("r-recordings").value,
            fallback: document.getElementById("r-fallback").value
          }
        };
        await api("/admin/api/content", { method: "PUT", body: JSON.stringify(payload) });
        document.getElementById("saveStatus").textContent = "Saved. Bot replies are updated live.";
      });
    }

    (async function init() {
      try {
        await api("/admin/api/stats");
        showDashboard();
      } catch {
        showLogin();
      }
    })();
  </script>
</body>
</html>`;
}
