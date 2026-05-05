const BASE_URL = "https://whisperbox.koyeb.app";


export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  public_key: string;
  wrapped_private_key: string;
  pbkdf2_salt: string;
  created_at: string;
}

export interface AuthResponse extends AuthTokens {
  user: UserProfile;
}

export interface RegisterPayload {
  username: string;
  display_name: string;
  password: string;
  public_key: string;
  wrapped_private_key: string;
  pbkdf2_salt: string;
}

export interface SearchUser {
  id: string;
  username: string;
  display_name: string;
}

export interface Conversation {
  user_id: string;
  display_name: string;
  username: string;
  last_message_at: string;
}

export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  encryptedKey: string;
  encryptedKeyForSelf: string;
}

export interface Message {
  id: string;
  from_user_id: string;
  to_user_id: string;
  payload: EncryptedPayload;
  delivered: boolean;
  created_at: string;
}


async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...fetchOptions,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail ?? `Request failed: ${res.status}`);
  }

  if (res.status === 204) return undefined as T;

  return res.json();
}


export const authApi = {
  register: (payload: RegisterPayload): Promise<AuthResponse> =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  login: (
    username: string,
    password: string
  ): Promise<AuthResponse> =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  me: (token: string): Promise<UserProfile> =>
    request("/auth/me", { token }),

  refresh: (refreshToken: string): Promise<AuthTokens> =>
    request("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    }),

  logout: (token: string, refreshToken: string): Promise<void> =>
    request("/auth/logout", {
      method: "POST",
      token,
      body: JSON.stringify({ refresh_token: refreshToken }),
    }),
};


export const usersApi = {
  search: (query: string, token: string): Promise<SearchUser[]> =>
    request(`/users/search?q=${encodeURIComponent(query)}`, { token }),

  getPublicKey: (userId: string, token: string): Promise<{ public_key: string }> =>
    request(`/users/${userId}/public-key`, { token }),
};


export const conversationsApi = {
  list: (token: string): Promise<Conversation[]> =>
    request("/conversations", { token }),

  getMessages: (
    userId: string,
    token: string,
    limit = 50,
    before?: string
  ): Promise<Message[]> => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (before) params.set("before", before);
    return request(`/conversations/${userId}/messages?${params}`, { token });
  },
};


export const messagesApi = {
  send: (
    to: string,
    payload: EncryptedPayload,
    token: string
  ): Promise<Message> =>
    request("/messages", {
      method: "POST",
      token,
      body: JSON.stringify({ to, payload }),
    }),
};