import { api } from "@/lib/api";
import { getDashboard } from "./dashboard.api";

jest.mock("@/lib/api", () => ({ api: { get: jest.fn() } }));

describe("getDashboard", () => {
  it("maps real totals, dated activity, and recent users", async () => {
    jest.mocked(api.get).mockResolvedValue({
      data: {
        totals: {
          users: 4,
          active_users: 2,
          coaching_sessions: 8,
          documents: 3,
        },
        current_week: Array.from({ length: 7 }, (_, index) => ({
          date: `2026-09-${14 + index}`,
          active_users: index,
        })),
        previous_week: Array.from({ length: 7 }, (_, index) => ({
          date: `2026-09-0${7 + index}`,
          active_users: 1,
        })),
        recent_users: [
          {
            id: 7,
            email: "leader@example.com",
            full_name: "Test Leader",
            role: "user",
            registered_at: "2026-09-01T00:00:00Z",
            last_coaching_activity: null,
            is_enabled: true,
            session_count: 2,
            summary_count: 1,
          },
        ],
      },
    });

    const dashboard = await getDashboard();
    expect(dashboard.totals.activeUsers).toBe(2);
    expect(dashboard.currentWeek[0]).toEqual({
      date: "2026-09-14",
      activeUsers: 0,
    });
    expect(dashboard.recentUsers[0]).toMatchObject({
      lastActive: "Never",
      sessions: 2,
      summaryCount: 1,
    });
  });
});
