import { initDb } from "../src/db/initDb.js";
import { pool } from "../src/db/pool.js";

const agents = [
  ["Avery Campbell", "avery.campbell@ticketnow.local", "Admin"],
  ["Noah Tremblay", "noah.tremblay@ticketnow.local", "Agent"],
  ["Olivia Chen", "olivia.chen@ticketnow.local", "Agent"],
  ["Liam O'Connor", "liam.oconnor@ticketnow.local", "Agent"]
];

const seedTickets = [
  ["Password reset for HR portal", "Unable to reset password using SSO self-service.", "Access", "High", "Open", "Emma Wilson", "emma.wilson@company.com", "HR"],
  ["VPN fails with timeout", "VPN client disconnects every 5 minutes while remote.", "Network", "Critical", "In Progress", "Jack Martin", "jack.martin@company.com", "Finance"],
  ["Billing system access denied", "Received access denied after role update.", "Access", "Critical", "Open", "Sophie Nguyen", "sophie.nguyen@company.com", "Billing"],
  ["Printer offline floor 3", "Finance printer remains offline after reboot.", "Hardware", "Medium", "Waiting on User", "Ethan Brown", "ethan.brown@company.com", "Finance"],
  ["CRM app crashes on report export", "Application closes when exporting monthly sales report.", "Software", "High", "Open", "Chloe Thompson", "chloe.thompson@company.com", "Sales"],
  ["Email not syncing on mobile", "Outlook mobile has not synced for two days.", "Software", "Low", "Resolved", "Lucas Anderson", "lucas.anderson@company.com", "Marketing"],
  ["Wi-Fi dead zone in conference room", "Signal drops during meetings in room B2.", "Network", "Medium", "Open", "Mia Patel", "mia.patel@company.com", "Operations"],
  ["New joiner laptop setup", "Need standard image and endpoint security tools.", "Hardware", "Low", "Closed", "Owen Smith", "owen.smith@company.com", "People Ops"],
  ["SSO MFA prompt loop", "MFA repeatedly prompts after successful approval.", "Access", "High", "In Progress", "Charlotte Johnson", "charlotte.johnson@company.com", "Engineering"],
  ["Desktop freezing randomly", "Device freezes with no error message 3-4 times daily.", "Hardware", "Medium", "Open", "Benjamin Lee", "benjamin.lee@company.com", "Support"],
  ["Project management tool slow", "Page load takes over 20 seconds during peak hours.", "Software", "High", "Open", "Amelia Davis", "amelia.davis@company.com", "Engineering"],
  ["Shared drive permission issue", "Cannot access shared \"Contracts\" folder.", "Access", "Medium", "Resolved", "Nathan Taylor", "nathan.taylor@company.com", "Legal"],
  ["Laptop camera not detected", "Camera is missing from device manager.", "Hardware", "Low", "Open", "Isla Moore", "isla.moore@company.com", "Customer Success"],
  ["VOIP calls dropping", "Internal calls disconnect after 30 seconds.", "Network", "High", "In Progress", "William Harris", "william.harris@company.com", "Support"],
  ["Timesheet app login error", "Users get HTTP 500 when submitting login form.", "Software", "Critical", "Open", "Ava Clark", "ava.clark@company.com", "Operations"],
  ["Payroll app role mismatch", "Manager role cannot approve payroll requests.", "Access", "High", "Waiting on User", "Henry Walker", "henry.walker@company.com", "Finance"],
  ["Monitor flickering", "Second monitor flickers after docking.", "Hardware", "Low", "Open", "Lily Hall", "lily.hall@company.com", "Sales"],
  ["VPN split tunnel issue", "Cannot access internal git while VPN connected.", "Network", "High", "Resolved", "Daniel Young", "daniel.young@company.com", "Engineering"],
  ["Expense app attachment upload failing", "PDF receipts fail at 80% upload.", "Software", "Medium", "Open", "Grace King", "grace.king@company.com", "Finance"],
  ["Admin panel forbidden error", "Admin users see 403 on user management route.", "Access", "Critical", "In Progress", "Matthew Wright", "matthew.wright@company.com", "IT"],
  ["Keyboard keys not responding", "Several keys stop responding intermittently.", "Hardware", "Medium", "Open", "Ella Scott", "ella.scott@company.com", "Legal"],
  ["DNS resolution delays", "Domain lookups delayed for internal applications.", "Network", "High", "Open", "Logan Green", "logan.green@company.com", "Engineering"],
  ["Inventory app 502 gateway", "Warehouse inventory app returns 502 after deploy.", "Software", "Critical", "Open", "Zoe Baker", "zoe.baker@company.com", "Supply Chain"],
  ["Password expired unexpectedly", "Password expired before policy threshold date.", "Access", "Medium", "Resolved", "Alexander Adams", "alexander.adams@company.com", "Marketing"],
  ["Docking station not detected", "Docking station HDMI ports not recognized.", "Hardware", "Low", "Open", "Harper Nelson", "harper.nelson@company.com", "Operations"],
  ["Firewall rule blocking API", "Service-to-service traffic blocked after rule update.", "Network", "Critical", "Open", "Samuel Carter", "samuel.carter@company.com", "Platform"],
  ["ERP invoice module bug", "Invoice approval button disabled for valid records.", "Software", "High", "In Progress", "Victoria Mitchell", "victoria.mitchell@company.com", "Billing"],
  ["Access to analytics dashboard revoked", "Executive dashboard access removed accidentally.", "Access", "High", "Open", "Michael Roberts", "michael.roberts@company.com", "Leadership"]
];

async function run() {
  await initDb();

  await pool.query("TRUNCATE ticket_status_history, ticket_notes, tickets, agents RESTART IDENTITY CASCADE");

  for (const [name, email, role] of agents) {
    await pool.query("INSERT INTO agents (name, email, role) VALUES ($1, $2, $3)", [name, email, role]);
  }

  for (const ticket of seedTickets) {
    const assignedTo = Math.random() > 0.35 ? Math.ceil(Math.random() * agents.length) : null;
    const createdAt = new Date(Date.now() - Math.floor(Math.random() * 120) * 3600000);
    const resolvedAt = ticket[4] === "Resolved" || ticket[4] === "Closed" ? new Date(createdAt.getTime() + Math.floor(Math.random() * 48 + 4) * 3600000) : null;

    const { rows } = await pool.query(
      `INSERT INTO tickets (
        title, description, category, priority, status, requester_name, requester_email, department,
        assigned_to, resolution_notes, escalation_notes, created_at, updated_at, resolved_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
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
        assignedTo,
        resolvedAt ? "Issue validated and service restored." : null,
        ticket[3] === "Critical" ? "Escalated to platform on-call." : null,
        createdAt,
        new Date(),
        resolvedAt
      ]
    );

    await pool.query(
      "INSERT INTO ticket_status_history (ticket_id, from_status, to_status, changed_by, changed_at) VALUES ($1, $2, $3, $4, $5)",
      [rows[0].id, null, rows[0].status, assignedTo, createdAt]
    );
  }

  console.log("Seed completed with", seedTickets.length, "tickets");
  await pool.end();
}

run().catch(async (err) => {
  console.error(err);
  await pool.end();
  process.exit(1);
});
