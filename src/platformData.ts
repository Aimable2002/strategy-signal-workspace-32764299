// Platform mock data (billing, account, notifications, help, admin). Re-exported from src/mockData.ts.
// All rates and numbers here are editable placeholders.

export const rateCard = [
  { id: "running", label: "Workspace running", unit: "per hour", rate: 0.12 },
  { id: "storage", label: "Workspace stopped storage", unit: "per GB per month", rate: 0.1 },
  { id: "archive", label: "Archived workspace", unit: "per GB per month", rate: 0.02 },
  { id: "backtest", label: "Backtest run", unit: "per run", rate: 0.02 },
  { id: "ai", label: "AI agent usage", unit: "per 1,000 messages", rate: 4.0 },
];

export const creditPacks = [10, 25, 50, 100];
export const SIGNUP_BONUS = 5;
export const FREE_TESTS_PER_DAY = 3;
export const TRIAL_RUN_COST = 0.02;
export const LOW_BALANCE_THRESHOLD = 2;
export const FILES_KEPT_DAYS = 30;
export const PAYMENT_FEE = { percent: 2.9, fixed: 0.3 }; // example processor fee; $50 → $1.75

export const usageByDay = Array.from({ length: 14 }, (_, i) => {
  const d = new Date(Date.UTC(2026, 9, 12 + i));
  const k = (i * 7) % 5;
  return {
    day: d.toISOString().slice(5, 10),
    running: +(0.6 + k * 0.18).toFixed(2),
    storage: 0.03,
    backtests: +(0.04 + (i % 4) * 0.02).toFixed(2),
    ai: +(0.2 + ((i * 3) % 4) * 0.1).toFixed(2),
  };
});

export const usageByWorkspace = [
  { workspace: "Main workspace", running: 9.84, storage: 0.4, backtests: 0.96, ai: 4.2 },
  { workspace: "Gold experiments", running: 2.16, storage: 0.3, backtests: 0.32, ai: 1.1 },
  { workspace: "Archive 2025", running: 0, storage: 0.08, backtests: 0, ai: 0 },
];

export const transactions = [
  { id: "t1", date: "2026-10-25", type: "Usage charge", description: "Workspace running · 6.2 h", amount: -0.74 },
  { id: "t2", date: "2026-10-24", type: "Usage charge", description: "Backtests · 14 runs", amount: -0.28 },
  { id: "t3", date: "2026-10-20", type: "Top-up", description: "Credit pack", amount: 25 },
  { id: "t4", date: "2026-10-18", type: "Refund", description: "Unused credits refund", amount: 4.5 },
  { id: "t5", date: "2026-10-15", type: "Usage charge", description: "AI agent usage", amount: -1.92 },
  { id: "t6", date: "2026-10-01", type: "Top-up", description: "Auto top-up", amount: 10 },
];

export const invoices = [
  { id: "INV-2026-010", date: "2026-10-01", amount: 10 },
  { id: "INV-2026-009", date: "2026-09-14", amount: 25 },
  { id: "INV-2026-008", date: "2026-08-30", amount: 50 },
];

export const orders = [
  { id: "ORD-1042", date: "2026-09-14", listingId: "l3", item: "Asian Range Reverter (.ex5 + .mq5)", amount: 189, processingFee: 5.78, method: "Visa •••• 4242" },
  { id: "ORD-0988", date: "2026-07-02", listingId: "l12", item: "Steady EMA Cross (.ex5)", amount: 99, processingFee: 3.17, method: "Visa •••• 4242" },
];

export const workspaces = [
  { id: "w1", name: "Main workspace", status: "Running" as const, costThisMonth: 15.4, storageGb: 4.2, lastActive: "Now" },
  { id: "w2", name: "Gold experiments", status: "Stopped" as const, costThisMonth: 3.88, storageGb: 3.1, lastActive: "2 days ago" },
  { id: "w3", name: "Archive 2025", status: "Archived" as const, costThisMonth: 0.08, storageGb: 3.9, lastActive: "Mar 2026" },
];

export type NotificationType = "sale" | "approved" | "rejected" | "connection" | "stopping" | "credit" | "refund" | "review" | "version";
export const notifications: { id: string; type: NotificationType; title: string; body: string; date: string; read: boolean; href?: string }[] = [
  { id: "n1", type: "sale", title: "Sale made", body: "Trend Rider EURUSD sold for $149.00.", date: "2026-10-26 01:12", read: false, href: "/sell" },
  { id: "n2", type: "stopping", title: "Workspace about to stop", body: "Main workspace stops in 15 minutes due to inactivity.", date: "2026-10-26 00:40", read: false, href: "/" },
  { id: "n3", type: "credit", title: "Low credit balance", body: "Your balance is below $2.00. Add credits to keep working.", date: "2026-10-25 21:05", read: false, href: "/billing" },
  { id: "n4", type: "approved", title: "Listing approved", body: "Momentum Gold H4 is now live.", date: "2026-10-25 14:30", read: true, href: "/marketplace" },
  { id: "n5", type: "rejected", title: "Listing rejected", body: "Range Breaker: results could not be reproduced on our backtest. Please check the inputs.", date: "2026-10-24 10:02", read: true, href: "/sell" },
  { id: "n6", type: "connection", title: "Demo account connection lost", body: "Daily Swing Majors: reconnect to keep test runs working.", date: "2026-10-23 08:44", read: true, href: "/sell" },
  { id: "n7", type: "refund", title: "Refund requested", body: "A buyer requested a refund for Yen Carry Trend.", date: "2026-10-22 19:20", read: true, href: "/sell/disputes" },
  { id: "n8", type: "review", title: "New review", body: "Sam R. left a 5-star review on Trend Rider EURUSD.", date: "2026-10-21 12:00", read: true, href: "/marketplace/l1" },
  { id: "n9", type: "version", title: "New version approved", body: "Steady EMA Cross v3 has been sent to existing buyers.", date: "2026-10-19 09:15", read: true, href: "/library" },
];

export const helpCategories = [
  { slug: "getting-started", title: "Getting started", blurb: "Create an account, add credits, open your workspace." },
  { slug: "workspace", title: "Workspace", blurb: "Start, stop and archive your private cloud workspace." },
  { slug: "backtesting", title: "Backtesting", blurb: "How the MT5 Strategy Tester runs your strategies." },
  { slug: "selling", title: "Selling", blurb: "Publish, price and update strategies." },
  { slug: "buying", title: "Buying", blurb: "Test before you buy, downloads and refunds." },
  { slug: "credits", title: "Credits and billing", blurb: "Rates, top-ups, spending limits and invoices." },
];

export type HelpSection = { h: string; p: string };
export const helpArticles: { slug: string; category: string; title: string; summary: string; body: HelpSection[] }[] = [
  { slug: "first-strategy", category: "getting-started", title: "Build your first strategy", summary: "Describe an idea and let the agent write, compile and backtest it.", body: [
    { h: "Describe the idea", p: "Open your workspace and tell the agent your entry, exit and risk rules in plain words. For example: buy when the 20 EMA crosses above the 50 EMA on EURUSD H1, stop loss 40 pips." },
    { h: "Let the agent build it", p: "The agent writes the .mq5 source, compiles it to an .ex5 file and runs the MT5 Strategy Tester. You can watch each step in the chat and the Terminal tab." },
    { h: "Read the results", p: "Open the Results tab for the equity curve and key numbers. Ask the agent to change a rule, add a stop loss or test another pair, then compare runs in the Runs tab." },
  ]},
  { slug: "credits-run-out", category: "credits", title: "What happens when credits run out", summary: "Your workspace stops and files are kept for 30 days.", body: [
    { h: "Low balance warning", p: "When your balance falls below $2.00 you see a banner in the workspace and a notification. Add credits any time from Billing." },
    { h: "At zero", p: "Your workspace stops and you cannot start a new one. Nothing is deleted: your files are kept for 30 days." },
    { h: "Getting back to work", p: "Add credits and start the workspace again. Turn on auto top-up in Billing if you never want to be interrupted." },
  ]},
  { slug: "stop-vs-archive", category: "workspace", title: "Stop vs. archive a workspace", summary: "Stopped workspaces still pay storage; archived ones pay less.", body: [
    { h: "Stopped", p: "A stopped workspace keeps its files and starts again quickly. You pay no running charge, only the storage rate shown on the Pricing page." },
    { h: "Archived", p: "An archived workspace is moved to cheaper storage. It costs less to keep, but takes longer to start again." },
    { h: "Deleted", p: "Deleting a workspace removes it and its files permanently, and stops all charges for it." },
  ]},
  { slug: "tester-settings", category: "backtesting", title: "Strategy Tester settings explained", summary: "Modelling quality, spreads, and date ranges.", body: [
    { h: "Modelling quality", p: "Every tick is the most detailed and the slowest. 1-minute OHLC is faster and close enough for most strategies. Open prices only is the quickest and suits strategies that act once per bar." },
    { h: "Spread and costs", p: "A low spread makes results look better than real trading. Use a realistic spread for the pair you are testing." },
    { h: "Date range", p: "Test across several years and market conditions. A short period that happens to suit the strategy tells you little." },
  ]},
  { slug: "publish-listing", category: "selling", title: "Publish a listing", summary: "Connect a demo account, set a price and submit for review.", body: [
    { h: "Pick a version", p: "Only versions with a passed, saved backtest can be published. The results on your listing come from that backtest. You cannot edit them." },
    { h: "Connect a demo account", p: "Buyers' test runs use your MT5 demo account. Use an investor (read-only) password. Your login is stored encrypted and is never shown to buyers." },
    { h: "Describe and price it", p: "Write a title and description, choose tags and set a price. Decide whether buyers get only the .ex5 or the .mq5 source too. Then submit for review." },
  ]},
  { slug: "test-before-buy", category: "buying", title: "Testing a strategy before you buy", summary: "Free daily test runs and what you can see.", body: [
    { h: "Run your own test", p: "On a strategy page, change the symbol, dates or deposit and run a backtest. Use Reproduce the listed result to check that the numbers match the listing." },
    { h: "What you see", p: "You see results only: the equity curve, key numbers and trades. The strategy files are available after you buy." },
    { h: "Cost", p: "You get a few free test runs each day. Extra runs cost a small amount from your credits, shown before you start." },
  ]},
  { slug: "refunds", category: "buying", title: "Requesting a refund", summary: "When refunds are possible and how disputes work.", body: [
    { h: "When you can get a refund", p: "You can request a full refund within 14 days if you have not downloaded the files. After a download, refunds are reviewed case by case." },
    { h: "How to ask", p: "Go to Orders, choose the purchase and select Request a refund. Tell us what went wrong." },
    { h: "What happens next", p: "The builder can respond, and our team reviews the case. You can follow its status on the same page." },
  ]},
  { slug: "no-commission", category: "selling", title: "How builders get paid", summary: "You keep 100% of the sale price minus payment processing fees.", body: [
    { h: "No commission", p: "The platform takes no commission on sales. You keep 100% of the sale price, minus the payment processing fee." },
    { h: "Example", p: "A $50.00 sale with a $1.75 processing fee pays you $48.25." },
    { h: "Payouts", p: "Set up your payout details and complete verification in Payout setup. Approved payouts are sent on the payout schedule." },
  ]},
];

export const adminUsers = [
  { id: "u1", name: "Jamie Doe", email: "jamie@example.com", role: "Builder", balance: 12.4, status: "Active", joined: "2026-01-04" },
  { id: "u2", name: "Lena Kovač", email: "lena@example.com", role: "Builder", balance: 48.1, status: "Active", joined: "2024-03-12" },
  { id: "u3", name: "Sam Reyes", email: "sam@example.com", role: "Buyer", balance: 3.2, status: "Active", joined: "2026-05-19" },
  { id: "u4", name: "Priya Nair", email: "priya@example.com", role: "Buyer", balance: 0, status: "Suspended", joined: "2026-06-02" },
  { id: "u5", name: "Diego Ferraz", email: "diego@example.com", role: "Builder", balance: 1.1, status: "Active", joined: "2025-05-08" },
  { id: "u6", name: "Admin", email: "admin@tickforge.dev", role: "Admin", balance: 0, status: "Active", joined: "2024-01-01" },
];

export const reports = [
  { id: "r1", listingId: "l9", listing: "Gold Fade Overnight", reason: "Suspicious results", details: "Equity curve looks too smooth for the stated drawdown.", reporter: "Sam Reyes", date: "2026-10-24", status: "Open" },
  { id: "r2", listingId: "l4", listing: "London Open Breakout", reason: "Misleading claims", details: "Description promises profit every month.", reporter: "Priya Nair", date: "2026-10-22", status: "Open" },
  { id: "r3", listingId: "l11", listing: "Euro Breakout H4", reason: "Copyright", details: "Looks copied from a free EA.", reporter: "Tom W.", date: "2026-10-18", status: "Resolved" },
];

export type DisputeStatus = "Open" | "Responded" | "Resolved" | "Refunded";
export const disputes: { id: string; orderId: string; listing: string; buyer: string; builder: string; amount: number; reason: string; message: string; response?: string; status: DisputeStatus; date: string }[] = [
  { id: "d1", orderId: "ORD-1101", listing: "Yen Carry Trend", buyer: "Sam Reyes", builder: "Lena Kovač", amount: 119, reason: "Doesn't match listed results", message: "My live demo run lost money for 3 weeks.", status: "Open", date: "2026-10-22" },
  { id: "d2", orderId: "ORD-1077", listing: "Trend Rider EURUSD", buyer: "Tom W.", builder: "Lena Kovač", amount: 149, reason: "Files don't work", message: "The .ex5 won't load in my terminal.", response: "Please update MT5 to build 4600+; I've sent v3 which fixes this.", status: "Responded", date: "2026-10-15" },
  { id: "d3", orderId: "ORD-1012", listing: "Gold Fade Overnight", buyer: "Priya Nair", builder: "Diego Ferraz", amount: 49, reason: "Bought by mistake", message: "Haven't downloaded the files.", status: "Refunded", date: "2026-10-02" },
];

export const pendingPayouts = [
  { id: "po1", builder: "Lena Kovač", amount: 2186.4, period: "Oct 2026", method: "Bank ••12", verified: true },
  { id: "po2", builder: "Marcus Oyelaran", amount: 1420.75, period: "Oct 2026", method: "Wise", verified: true },
  { id: "po3", builder: "Yuki Tanaka", amount: 312.1, period: "Oct 2026", method: "Bank ••88", verified: false },
];

export const costMonitor = {
  revenueVsCost: Array.from({ length: 14 }, (_, i) => ({ day: `10-${String(12 + i).padStart(2, "0")}`, revenue: 210 + ((i * 37) % 60), cost: 140 + ((i * 23) % 50) })),
  lowMarginUsers: [
    { name: "Priya Nair", revenue: 2.1, cost: 3.4 },
    { name: "Diego Ferraz", revenue: 4.8, cost: 5.2 },
    { name: "Sam Reyes", revenue: 6.2, cost: 5.9 },
    { name: "Tom W.", revenue: 3.0, cost: 2.6 },
    { name: "Aisha K.", revenue: 9.4, cost: 7.8 },
    { name: "Jonas B.", revenue: 5.5, cost: 4.4 },
    { name: "Marcus Oyelaran", revenue: 22.0, cost: 16.1 },
    { name: "Yuki Tanaka", revenue: 11.2, cost: 8.0 },
    { name: "Jamie Doe", revenue: 18.6, cost: 12.9 },
    { name: "Lena Kovač", revenue: 31.0, cost: 20.5 },
  ],
  recentTopUps: [
    { user: "Lena Kovač", amount: 50, date: "2026-10-25" },
    { user: "Jamie Doe", amount: 25, date: "2026-10-20" },
    { user: "Sam Reyes", amount: 10, date: "2026-10-19" },
    { user: "Aisha K.", amount: 100, date: "2026-10-18" },
  ],
  todaySpend: 168,
  dailyBudget: 200,
};

export const whatsAppSettings: Record<string, { number: string; enabled: boolean }> = {
  b1: { number: "+447700900123", enabled: true },
  b2: { number: "+2348031234567", enabled: true },
};

export const legalDocs: Record<string, { title: string; sections: { h: string; p: string }[] }> = {
  terms: { title: "Terms of Service", sections: [
    { h: "1. The service", p: "Tickforge provides private cloud workspaces to build and backtest MetaTrader 5 strategies, and a marketplace to buy and sell them. The platform never places real trades." },
    { h: "2. Accounts", p: "You are responsible for your account and for keeping your password secure." },
    { h: "3. Credits", p: "Infrastructure usage is paid from a prepaid credit balance at the rates shown on the Pricing page. There are no subscriptions." },
    { h: "4. Marketplace", p: "Builders keep 100% of their sale price minus payment processing fees. The platform takes no commission." },
  ]},
  privacy: { title: "Privacy Policy", sections: [
    { h: "What we collect", p: "Account details, usage data, and payment records needed to provide the service." },
    { h: "Demo account logins", p: "Builder MT5 demo logins are stored encrypted and are never shown to buyers." },
    { h: "Your rights", p: "You can export or delete your data from Account settings." },
  ]},
  risk: { title: "Risk Disclosure", sections: [
    { h: "Backtests are simulations", p: "All backtest results are historical simulations based on past data. They are not records of real trading." },
    { h: "Past performance", p: "Past performance does not guarantee future results. Strategies that performed well historically can lose money." },
    { h: "Not financial advice", p: "Nothing on this platform is financial, investment, or trading advice." },
    { h: "Test on a demo account", p: "Always test any strategy on a demo account before considering any real-money use, which is entirely at your own risk." },
  ]},
  refund: { title: "Refund Policy", sections: [
    { h: "Strategy purchases", p: "Full refund within 14 days if the files have not been downloaded. After download, refund requests are reviewed case by case through the dispute process." },
    { h: "Unused credits", p: "Unused prepaid credits can be refunded on request within 90 days of purchase, minus payment processing fees. Free bonus credits are not refundable." },
  ]},
  "builder-agreement": { title: "Builder Agreement", sections: [
    { h: "Ownership", p: "You keep ownership of your strategies and grant buyers a personal licence to use the files they buy." },
    { h: "Earnings", p: "You receive 100% of the sale price minus payment processing fees. No platform fee or commission." },
    { h: "Demo accounts", p: "Listings use a builder-provided MT5 demo account for buyer test runs. Never connect a real-money account." },
    { h: "Honest listings", p: "Results must be reproducible. Listings are reviewed before going live and may be removed after reports." },
  ]},
};
