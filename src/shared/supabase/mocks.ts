/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi } from "vitest";

/**
 * Creates a mock Supabase client with Vitest spies.
 * This can be used to mock both browser and server clients.
 */
export function createMockSupabaseClient() {
  return {
    auth: {
      getUser: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockReturnThis(),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        download: vi.fn(),
        remove: vi.fn(),
        list: vi.fn(),
      })),
    },
  };
}

/**
 * Helper to mock a successful getUser call.
 */
export function mockSupabaseUser(client: any, user: any) {
  client.auth.getUser.mockResolvedValue({
    data: { user },
    error: null,
  });
}

/**
 * Helper to mock a failed getUser call (e.g., unauthenticated).
 */
export function mockSupabaseUnauthenticated(client: any) {
  client.auth.getUser.mockResolvedValue({
    data: { user: null },
    error: null,
  });
}
