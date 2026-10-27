import { QueryClient } from "@tanstack/react-query";
import { RouterProvider, createMemoryHistory, createRootRouteWithContext, createRoute, createRouter } from "@tanstack/react-router";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { setDevState } from "@/lib/devState";
import { Route as RootRoute } from "@/routes/__root";
import { Route as AdminLayout } from "@/routes/admin";
import { Route as Cost } from "@/routes/admin.cost";
import { Route as Disputes } from "@/routes/admin.disputes";
import { Route as Payouts } from "@/routes/admin.payouts";
import { Route as Reports } from "@/routes/admin.reports";
import { Route as Users } from "@/routes/admin.users";
import { Route as HelpArticle } from "@/routes/help.$slug";
import { Route as HelpIndex } from "@/routes/help.index";
import { Route as Maintenance } from "@/routes/maintenance";
import { Route as Listing } from "@/routes/marketplace.$id";
import * as api from "@/services/api";

vi.setConfig({ testTimeout: 20000 });

beforeAll(() => {
  globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} } as unknown as typeof ResizeObserver;
});
afterEach(() => { cleanup(); setDevState({ role: "admin", loggedIn: true }); });

type Page = { options: { component?: unknown } };
const comp = (r: Page) => r.options.component as never;

// The real root shell waits on a stylesheet link that jsdom never loads, so mount the real
// page components under a test router that reuses the real root layout and route ids.
async function visit(path: string, pages: { route: Page; path: string; admin?: boolean }[]) {
  const root = createRootRouteWithContext<{ queryClient: QueryClient }>()({ component: comp(RootRoute) });
  const admin = createRoute({ getParentRoute: () => root, path: "/admin", component: comp(AdminLayout) });
  const children = pages.map((p) => createRoute({ getParentRoute: () => (p.admin ? admin : root), path: p.path, component: comp(p.route) }));
  const routeTree = root.addChildren([admin.addChildren(children.filter((_, i) => pages[i]!.admin)), ...children.filter((_, i) => !pages[i]!.admin)]);
  const router = createRouter({ routeTree, history: createMemoryHistory({ initialEntries: [path] }), context: { queryClient: new QueryClient() } });
  await router.load();
  render(<RouterProvider router={router} />);
}
const adminPage = (route: Page, path: string) => ({ route, path, admin: true });
const T = { timeout: 5000 };
const rowOf = (name: RegExp) => screen.getByRole("row", { name });

describe("admin section", () => {
  it("blocks non-admins and lets the preview switch fix it", async () => {
    setDevState({ role: "buyer", loggedIn: true });
    await visit("/admin/users", [adminPage(Users, "users")]);
    await screen.findByText("Admin only", {}, T);
    fireEvent.click(screen.getByRole("button", { name: "Preview as admin" }));
    await screen.findByRole("heading", { name: "Users" }, T);
  });

  it("suspends a user after confirming", async () => {
    await visit("/admin/users", [adminPage(Users, "users")]);
    const sam = await screen.findByRole("row", { name: /Sam Reyes/ }, T);
    fireEvent.click(within(sam).getByRole("button", { name: "Suspend" }));
    fireEvent.click(await screen.findByRole("button", { name: "Suspend user" }, T));
    await waitFor(() => expect(within(rowOf(/Sam Reyes/)).getByText("Suspended")).toBeInTheDocument(), T);
  });

  it("filters users by search", async () => {
    await visit("/admin/users", [adminPage(Users, "users")]);
    await screen.findByRole("row", { name: /Jamie Doe/ }, T);
    fireEvent.change(screen.getByLabelText("Search users"), { target: { value: "lena" } });
    await waitFor(() => expect(screen.queryByRole("row", { name: /Jamie Doe/ })).toBeNull(), T);
    expect(screen.getByRole("row", { name: /Lena/ })).toBeInTheDocument();
  });

  it("resolves a report and refunds a dispute", async () => {
    await visit("/admin/reports", [adminPage(Reports, "reports")]);
    const r1 = await screen.findByRole("row", { name: /Gold Fade Overnight/ }, T);
    fireEvent.click(within(r1).getByRole("button", { name: "Resolve" }));
    await waitFor(() => expect(within(rowOf(/Gold Fade Overnight/)).getByText("Resolved")).toBeInTheDocument(), T);
    cleanup();

    await visit("/admin/disputes", [adminPage(Disputes, "disputes")]);
    const d1 = await screen.findByRole("row", { name: /Yen Carry Trend/ }, T);
    fireEvent.click(within(d1).getByRole("button", { name: "Approve refund" }));
    const dialog = await screen.findByRole("alertdialog", {}, T);
    fireEvent.click(within(dialog).getByRole("button", { name: "Approve refund" }));
    await waitFor(() => expect(within(rowOf(/Yen Carry Trend/)).getByText("Refunded")).toBeInTheDocument(), T);
  });

  it("only lets verified builders be approved for payout", async () => {
    await visit("/admin/payouts", [adminPage(Payouts, "payouts")]);
    const yuki = await screen.findByRole("row", { name: /Yuki Tanaka/ }, T);
    expect(within(yuki).getByRole("button", { name: "Approve" })).toBeDisabled();
    const lena = rowOf(/Lena/);
    fireEvent.click(within(lena).getByRole("button", { name: "Approve" }));
    await waitFor(() => expect(within(rowOf(/Lena/)).getByText("Approved")).toBeInTheDocument(), T);
  });

  it("pauses test runs from the cost monitor and disables buyer tests", async () => {
    await visit("/admin/cost", [adminPage(Cost, "cost")]);
    const sw = await screen.findByRole("switch", {}, T);
    fireEvent.click(sw);
    fireEvent.click(await screen.findByRole("button", { name: "Pause test runs" }, T));
    await waitFor(() => expect(api.areTrialRunsPaused()).toBe(true), T);
    cleanup();

    await visit("/marketplace/l1", [{ route: Listing, path: "/marketplace/$id" }]);
    expect(await screen.findByText(/temporarily paused/, {}, T)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Run backtest/ })).toBeDisabled();
    await api.setTrialRunsPaused(false);
  });
});

describe("help center and system pages", () => {
  it("filters by category, opens an article and records feedback", async () => {
    await visit("/help", [{ route: HelpIndex, path: "/help" }, { route: HelpArticle, path: "/help/$slug" }]);
    fireEvent.click(await screen.findByRole("button", { name: /^Selling/ }, T));
    expect(screen.queryByText("Build your first strategy")).toBeNull();
    fireEvent.click(screen.getByRole("link", { name: /How builders get paid/ }));
    await screen.findByRole("heading", { name: "How builders get paid" }, T);
    expect(screen.getByText("Example")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Yes/ }));
    expect(screen.getByText(/Glad it helped/)).toBeInTheDocument();
  });

  it("shows a friendly state for an unknown article", async () => {
    await visit("/help/does-not-exist", [{ route: HelpArticle, path: "/help/$slug" }]);
    await screen.findByText("We couldn't find that article", {}, T);
  });

  it("renders the maintenance page without the main navigation", async () => {
    await visit("/maintenance", [{ route: Maintenance, path: "/maintenance" }]);
    await screen.findByRole("heading", { name: "We'll be right back" }, T);
    expect(screen.queryByRole("link", { name: "Marketplace" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Check again" }));
    await screen.findByText(/Still down as of/, {}, T);
  });
});
