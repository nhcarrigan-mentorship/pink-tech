// @vitest-environment jsdom

import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

type ProfileRow = {
  id: string;
  display_name: string;
  username: string;
  featured: boolean;
  last_updated: string;
  content?: string;
};

type HookDeps = {
  listData?: ProfileRow[];
  listError?: unknown;
  fullProfileData?: ProfileRow | null;
  fullProfileError?: unknown;
};

type RealtimeHandler = (payload: unknown) => void;

afterEach(() => {
  cleanup();
  vi.resetModules();
  vi.clearAllMocks();
});

function createSupabaseMocks({
  listData = [],
  listError = null,
  fullProfileData = null,
  fullProfileError = null,
}: HookDeps = {}) {
  const abortSignal = vi.fn().mockResolvedValue({
    data: listData,
    error: listError,
  });

  const listSelect = vi.fn().mockReturnValue({
    abortSignal,
  });

  const single = vi.fn().mockResolvedValue({
    data: fullProfileData,
    error: fullProfileError,
  });

  const ilike = vi.fn().mockReturnValue({
    single,
  });

  const fullSelect = vi.fn().mockReturnValue({
    ilike,
  });

  const publicFrom = vi.fn().mockImplementation(() => ({
    select: vi.fn().mockImplementation((query: string) => {
      if (query === "*") return fullSelect();
      return listSelect();
    }),
  }));

  const realtimeHandlers: RealtimeHandler[] = [];
  const unsubscribe = vi.fn();
  const channel = {
    on: vi.fn((_event: string, _filter: unknown, handler: RealtimeHandler) => {
      realtimeHandlers.push(handler);
      return channel;
    }),
    subscribe: vi.fn(() => ({ unsubscribe })),
  };

  const realtimeSupabase = {
    channel: vi.fn(() => channel),
  };

  return {
    abortSignal,
    fullSelect,
    ilike,
    publicFrom,
    realtimeHandlers,
    realtimeSupabase,
    single,
    unsubscribe,
  };
}

async function loadHook(deps: HookDeps = {}) {
  const mocks = createSupabaseMocks(deps);

  vi.doMock("../config/supabaseClient", () => ({
    getPublicSupabase: vi.fn().mockResolvedValue({
      from: mocks.publicFrom,
    }),
    getSupabase: vi.fn().mockResolvedValue(mocks.realtimeSupabase),
  }));

  const mod = await import("./useProfiles");

  return {
    mocks,
    useProfiles: mod.default,
  };
}

describe("useProfiles", () => {
  it("loads profiles on mount", async () => {
    const { useProfiles, mocks } = await loadHook({
      listData: [
        {
          id: "1",
          display_name: "Alice Doe",
          username: "alice",
          featured: true,
          last_updated: "2026-04-27",
        },
      ],
    });

    const { result } = renderHook(() => useProfiles());

    await waitFor(() => {
      expect(result.current.profiles).toHaveLength(1);
    });

    expect(result.current.profiles[0]).toMatchObject({
      id: "1",
      displayName: "Alice Doe",
      username: "alice",
      featured: true,
      lastUpdated: "2026-04-27",
    });
    expect(mocks.publicFrom).toHaveBeenCalledWith("profiles");
    expect(mocks.abortSignal).toHaveBeenCalledTimes(1);
  });

  it("updates a profile locally", async () => {
    const { useProfiles } = await loadHook({
      listData: [
        {
          id: "1",
          display_name: "Alice Doe",
          username: "alice",
          featured: false,
          last_updated: "2026-04-27",
        },
      ],
    });

    const { result } = renderHook(() => useProfiles());

    await waitFor(() => {
      expect(result.current.profiles).toHaveLength(1);
    });

    act(() => {
      result.current.updateProfile({
        ...result.current.profiles[0],
        featured: true,
        bio: "Updated bio",
      });
    });

    expect(result.current.profiles[0]).toMatchObject({
      id: "1",
      featured: true,
      bio: "Updated bio",
    });
  });

  it("removes a profile locally", async () => {
    const { useProfiles } = await loadHook({
      listData: [
        {
          id: "1",
          display_name: "Alice Doe",
          username: "alice",
          featured: false,
          last_updated: "2026-04-27",
        },
        {
          id: "2",
          display_name: "Bob Roe",
          username: "bob",
          featured: false,
          last_updated: "2026-04-27",
        },
      ],
    });

    const { result } = renderHook(() => useProfiles());

    await waitFor(() => {
      expect(result.current.profiles).toHaveLength(2);
    });

    act(() => {
      result.current.removeProfile("1");
    });

    expect(result.current.profiles).toHaveLength(1);
    expect(result.current.profiles[0].id).toBe("2");
  });

  it("fetches a full profile and merges it into the cached list", async () => {
    const { useProfiles, mocks } = await loadHook({
      listData: [
        {
          id: "1",
          display_name: "Alice Doe",
          username: "alice",
          featured: false,
          last_updated: "2026-04-27",
        },
      ],
      fullProfileData: {
        id: "1",
        display_name: "Alice Doe",
        username: "alice",
        featured: false,
        last_updated: "2026-04-27",
        content: "Full markdown profile",
      },
    });

    const { result } = renderHook(() => useProfiles());

    await waitFor(() => {
      expect(result.current.profiles).toHaveLength(1);
    });

    await act(async () => {
      await result.current.fetchFullProfile("Alice");
    });

    expect(mocks.ilike).toHaveBeenCalledWith("username", "alice");
    expect(mocks.single).toHaveBeenCalledTimes(1);
    expect(result.current.profiles[0]).toMatchObject({
      id: "1",
      content: "Full markdown profile",
    });
  });

  it("applies realtime inserts to the current list", async () => {
    const { useProfiles, mocks } = await loadHook({
      listData: [],
    });

    const { result } = renderHook(() => useProfiles());

    await waitFor(() => {
      expect(mocks.realtimeHandlers).toHaveLength(3);
    });

    act(() => {
      mocks.realtimeHandlers[0]({
        new: {
          id: "9",
          display_name: "New Person",
          username: "newperson",
          featured: true,
          last_updated: "2026-04-27",
        },
      });
    });

    expect(result.current.profiles[0]).toMatchObject({
      id: "9",
      displayName: "New Person",
      username: "newperson",
    });
  });
});
