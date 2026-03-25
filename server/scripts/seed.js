import { initDb } from "../src/db/initDb.js";
import { pool } from "../src/db/pool.js";

const agents = [
  ["Avery Campbell", "avery.campbell@ticketnow.local", "Admin"],
  ["Noah Tremblay", "noah.tremblay@ticketnow.local", "Agent"],
  ["Olivia Chen", "olivia.chen@ticketnow.local", "Agent"],
  ["Liam O'Connor", "liam.oconnor@ticketnow.local", "Agent"]
];

const assets = [
  ["AB-LAP-1001", "Laptop", "Dell Latitude 7440", "DL7440-8842", "Emma Wilson", "HR", "Edmonton-ERDP", "In Use"],
  ["AB-LAP-1002", "Laptop", "Lenovo ThinkPad T14", "LVT14-1022", "Jack Martin", "Finance", "Edmonton-ERDP", "In Use"],
  ["AB-PRN-2001", "Printer", "HP LaserJet M507", "HPM507-1200", null, "Finance", "Floor 3", "Repair"],
  ["AB-MOB-3001", "Mobile", "iPhone 14", "IPH14-4490", "Chloe Thompson", "Sales", "Edmonton-ERDP", "In Use"],
  ["AB-NET-4001", "Network Device", "Cisco Meraki MX95", "MRK95-7788", null, "Platform", "Data Closet A", "In Use"],
  ["AB-LAP-1003", "Laptop", "Microsoft Surface Laptop 5", "MSL5-4431", null, "IT", "Asset Storage", "In Stock"]
];

const seedTickets = [
  ["Password reset for HR portal", "Unable to reset password using SSO self-service.", "Access", "High", "Open", "Emma Wilson", "emma.wilson@company.com", "HR", "High", "High", 1],
  ["VPN fails with timeout", "VPN client disconnects every 5 minutes while remote.", "Network", "Critical", "In Progress", "Jack Martin", "jack.martin@company.com", "Finance", "High", "High", 2],
  ["Billing system access denied", "Received access denied after role update.", "Access", "Critical", "Open", "Sophie Nguyen", "sophie.nguyen@company.com", "Billing", "High", "High", null],
  ["Printer offline floor 3", "Finance printer remains offline after reboot.", "Hardware", "Medium", "Waiting on User", "Ethan Brown", "ethan.brown@company.com", "Finance", "Medium", "Medium", 3],
  ["CRM app crashes on report export", "Application closes when exporting monthly sales report.", "Software", "High", "Open", "Chloe Thompson", "chloe.thompson@company.com", "Sales", "High", "Medium", 4],
  ["Email not syncing on mobile", "Outlook mobile has not synced for two days.", "Software", "Low", "Resolved", "Lucas Anderson", "lucas.anderson@company.com", "Marketing", "Low", "Low", 4],
  ["Wi-Fi dead zone in conference room", "Signal drops during meetings in room B2.", "Network", "Medium", "Open", "Mia Patel", "mia.patel@company.com", "Operations", "Medium", "Medium", null],
  ["New joiner laptop setup", "Need standard image and endpoint security tools.", "Hardware", "Low", "Closed", "Owen Smith", "owen.smith@company.com", "People Ops", "Low", "Low", 6],
  ["SSO MFA prompt loop", "MFA repeatedly prompts after successful approval.", "Access", "High", "In Progress", "Charlotte Johnson", "charlotte.johnson@company.com", "Engineering", "High", "Medium", null],
  ["Desktop freezing randomly", "Device freezes with no error message 3-4 times daily.", "Hardware", "Medium", "Open", "Benjamin Lee", "benjamin.lee@company.com", "Support", "Medium", "Low", 2],
  ["Project management tool slow", "Page load takes over 20 seconds during peak hours.", "Software", "High", "Open", "Amelia Davis", "amelia.davis@company.com", "Engineering", "High", "High", null],
  ["Shared drive permission issue", "Cannot access shared \"Contracts\" folder.", "Access", "Medium", "Resolved", "Nathan Taylor", "nathan.taylor@company.com", "Legal", "Medium", "Medium", null],
  ["Laptop camera not detected", "Camera is missing from device manager.", "Hardware", "Low", "Open", "Isla Moore", "isla.moore@company.com", "Customer Success", "Low", "Low", 2],
  ["VOIP calls dropping", "Internal calls disconnect after 30 seconds.", "Network", "High", "In Progress", "William Harris", "william.harris@company.com", "Support", "High", "High", null],
  ["Timesheet app login error", "Users get HTTP 500 when submitting login form.", "Software", "Critical", "Open", "Ava Clark", "ava.clark@company.com", "Operations", "High", "High", null],
  ["Payroll app role mismatch", "Manager role cannot approve payroll requests.", "Access", "High", "Waiting on User", "Henry Walker", "henry.walker@company.com", "Finance", "High", "Medium", null],
  ["Monitor flickering", "Second monitor flickers after docking.", "Hardware", "Low", "Open", "Lily Hall", "lily.hall@company.com", "Sales", "Low", "Low", 1],
  ["VPN split tunnel issue", "Cannot access internal git while VPN connected.", "Network", "High", "Resolved", "Daniel Young", "daniel.young@company.com", "Engineering", "High", "Medium", 2],
  ["Expense app attachment upload failing", "PDF receipts fail at 80% upload.", "Software", "Medium", "Open", "Grace King", "grace.king@company.com", "Finance", "Medium", "Medium", null],
  ["Admin panel forbidden error", "Admin users see 403 on user management route.", "Access", "Critical", "In Progress", "Matthew Wright", "matthew.wright@company.com", "IT", "High", "High", 6],
  ["Keyboard keys not responding", "Several keys stop responding intermittently.", "Hardware", "Medium", "Open", "Ella Scott", "ella.scott@company.com", "Legal", "Medium", "Low", 1],
  ["DNS resolution delays", "Domain lookups delayed for internal applications.", "Network", "High", "Open", "Logan Green", "logan.green@company.com", "Engineering", "High", "High", 5],
  ["Inventory app 502 gateway", "Warehouse inventory app returns 502 after deploy.", "Software", "Critical", "Open", "Zoe Baker", "zoe.baker@company.com", "Supply Chain", "High", "High", null],
  ["Password expired unexpectedly", "Password expired before policy threshold date.", "Access", "Medium", "Resolved", "Alexander Adams", "alexander.adams@company.com", "Marketing", "Medium", "Low", null],
  ["Docking station not detected", "Docking station HDMI ports not recognized.", "Hardware", "Low", "Open", "Harper Nelson", "harper.nelson@company.com", "Operations", "Low", "Low", 6],
  ["Firewall rule blocking API", "Service-to-service traffic blocked after rule update.", "Network", "Critical", "Open", "Samuel Carter", "samuel.carter@company.com", "Platform", "High", "High", 5],
  ["ERP invoice module bug", "Invoice approval button disabled for valid records.", "Software", "High", "In Progress", "Victoria Mitchell", "victoria.mitchell@company.com", "Billing", "High", "Medium", null],
  ["Access to analytics dashboard revoked", "Executive dashboard access removed accidentally.", "Access", "High", "Open", "Michael Roberts", "michael.roberts@company.com", "Leadership", "High", "High", null]
];

const kbArticles = [
  ["VPN Timeout Troubleshooting", "Network", ["vpn", "timeout", "remote"], "Validate client version, check split tunnel profile, then review firewall logs for user subnet."],
  ["Printer Offline Recovery (HP LaserJet)", "Hardware", ["printer", "offline", "hp"], "Confirm power/network, clear print queue, rebind static IP, reinstall universal print driver."],
  ["Password Reset and MFA Loop Resolution", "Access", ["password", "mfa", "sso"], "Force sign-out all sessions, reset credentials, clear authenticator token and re-enroll MFA."],
  ["Application Crash During Export", "Software", ["crash", "export", "report"], "Collect app logs, validate dependency package version, and patch export module."],
  ["Access Denied Role Sync", "Access", ["rbac", "access", "denied"], "Verify identity group mapping and trigger role sync job in IAM connector."],
  ["DNS Delay Diagnostics", "Network", ["dns", "latency"], "Check resolver health, cache hit rate, and outbound DNS firewall policies."],
  ["Laptop Camera Device Recovery", "Hardware", ["camera", "driver", "laptop"], "Remove hidden device entries, install OEM camera package, reboot and retest in Teams."],
  ["502 Gateway Post-Deploy Triage", "Software", ["502", "gateway", "deploy"], "Rollback recent release, inspect API upstream health, and validate ingress route settings."]
];

async function run() {
  await initDb();

  await pool.query(
    "TRUNCATE ticket_status_history, ticket_notes, knowledge_base_articles, tickets, assets, agents RESTART IDENTITY CASCADE"
  );

  for (const [name, email, role] of agents) {
    await pool.query("INSERT INTO agents (name, email, role) VALUES ($1, $2, $3)", [name, email, role]);
  }

  for (const asset of assets) {
    await pool.query(
      `INSERT INTO assets (
        asset_tag, asset_type, model, serial_number, assigned_to_name, department, location, status, last_check_in_at, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),NOW())`,
      asset
    );
  }

  for (const ticket of seedTickets) {
    const assignedTo = Math.random() > 0.35 ? Math.ceil(Math.random() * agents.length) : null;
    const createdAt = new Date(Date.now() - Math.floor(Math.random() * 120) * 3600000);
    const resolvedAt = ticket[4] === "Resolved" || ticket[4] === "Closed" ? new Date(createdAt.getTime() + Math.floor(Math.random() * 48 + 4) * 3600000) : null;
    const responseDueAt = new Date(createdAt.getTime() + 4 * 3600000);
    const resolutionDueAt = new Date(createdAt.getTime() + 24 * 3600000);

    const { rows } = await pool.query(
      `INSERT INTO tickets (
        title, description, category, priority, status, requester_name, requester_email, department,
        impact, urgency, asset_id, assigned_to, resolution_notes, escalation_notes,
        created_at, updated_at, response_due_at, resolution_due_at, first_responded_at, resolved_at, sla_breached
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
      RETURNING id, status`,
      [
        ticket[0],
        ticket[1],
        ticket[2],
        ticket[3],
        ticket[4],
        ticket[5],
        ticket[6],
        ticket[7],
        ticket[8],
        ticket[9],
        ticket[10],
        assignedTo,
        resolvedAt ? "Issue validated and service restored." : null,
        ticket[3] === "Critical" ? "Escalated to platform on-call." : null,
        createdAt,
        new Date(),
        responseDueAt,
        resolutionDueAt,
        assignedTo ? new Date(createdAt.getTime() + 2 * 3600000) : null,
        resolvedAt,
        !resolvedAt && Date.now() - resolutionDueAt.getTime() > 0
      ]
    );

    await pool.query(
      "INSERT INTO ticket_status_history (ticket_id, from_status, to_status, changed_by, changed_at) VALUES ($1, $2, $3, $4, $5)",
      [rows[0].id, null, rows[0].status, assignedTo, createdAt]
    );
  }

  for (const article of kbArticles) {
    await pool.query(
      `INSERT INTO knowledge_base_articles (title, category, tags, content, author_id, is_published)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [article[0], article[1], article[2], article[3], 1, true]
    );
  }

  console.log("Seed completed with", seedTickets.length, "tickets,", assets.length, "assets and", kbArticles.length, "KB articles");
  await pool.end();
}

run().catch(async (err) => {
  console.error(err);
  await pool.end();
  process.exit(1);
});
