import { beforeEach, describe, expect, it, vi } from "vitest";
import getSupabase from "../config/supabaseClient";
import { getAvatarPublicUrl, removeAvatar, uploadAvatar } from "./avatarStorage";

vi.mock("../config/supabaseClient", () => ({
  default: vi.fn(),
}));

describe("avatarStorage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uploads an avatar and returns the generated path", async () => {
    const upload = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn().mockReturnValue({ upload });
    const supabase = {
      storage: { from },
    };

    vi.mocked(getSupabase).mockResolvedValue(supabase as any);
    vi.spyOn(Date, "now").mockReturnValue(1234567890);

    const file = new File(["avatar"], "me.png", { type: "image/png" });

    await expect(uploadAvatar(file, "profile-123")).resolves.toBe(
      "profiles/profile-123/1234567890.png",
    );

    expect(from).toHaveBeenCalledWith("avatars");
    expect(upload).toHaveBeenCalledWith(
      "profiles/profile-123/1234567890.png",
      file,
      { upsert: false },
    );
  });

  it("returns null for empty avatar paths", async () => {
    await expect(getAvatarPublicUrl(null)).resolves.toBeNull();
    expect(getSupabase).not.toHaveBeenCalled();
  });

  it("returns the original url when the avatar path is already public", async () => {
    const url = "https://cdn.example.com/avatar.png";

    await expect(getAvatarPublicUrl(url)).resolves.toBe(url);
    expect(getSupabase).not.toHaveBeenCalled();
  });

  it("gets a public url for a stored avatar path", async () => {
    const getPublicUrl = vi.fn().mockReturnValue({
      data: { publicUrl: "https://project.supabase.co/storage/v1/object/public/avatars/a.png" },
      error: null,
    });
    const from = vi.fn().mockReturnValue({ getPublicUrl });
    const supabase = {
      storage: { from },
    };

    vi.mocked(getSupabase).mockResolvedValue(supabase as any);

    await expect(getAvatarPublicUrl("profiles/1/a.png")).resolves.toBe(
      "https://project.supabase.co/storage/v1/object/public/avatars/a.png",
    );

    expect(from).toHaveBeenCalledWith("avatars");
    expect(getPublicUrl).toHaveBeenCalledWith("profiles/1/a.png");
  });

  it("logs and returns null when getPublicUrl reports an error", async () => {
    const error = new Error("storage error");
    const getPublicUrl = vi.fn().mockReturnValue({
      data: null,
      error,
    });
    const from = vi.fn().mockReturnValue({ getPublicUrl });
    const supabase = {
      storage: { from },
    };
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    vi.mocked(getSupabase).mockResolvedValue(supabase as any);

    await expect(getAvatarPublicUrl("profiles/1/a.png")).resolves.toBeNull();
    expect(consoleError).toHaveBeenCalledWith("getAvatarPublicUrl error:", error);
  });

  it("removes a stored avatar path", async () => {
    const remove = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn().mockReturnValue({ remove });
    const supabase = {
      storage: { from },
    };

    vi.mocked(getSupabase).mockResolvedValue(supabase as any);

    await removeAvatar("profiles/1/a.png");

    expect(from).toHaveBeenCalledWith("avatars");
    expect(remove).toHaveBeenCalledWith(["profiles/1/a.png"]);
  });

  it("skips removal for public urls", async () => {
    await removeAvatar("https://cdn.example.com/avatar.png");
    expect(getSupabase).not.toHaveBeenCalled();
  });
});
