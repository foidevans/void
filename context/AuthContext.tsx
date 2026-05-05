"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

import { authApi, type UserProfile } from "@/lib/api";
import {
  generateSalt,
  deriveWrappingKey,
  generateKeyPair,
  unwrapPrivateKey,
} from "@/lib/crypto";
import { savePrivateKey, getPrivateKey, clearPrivateKey } from "@/lib/storage";


interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  privateKey: CryptoKey | null;
  isLoading: boolean;
}

export interface RegisterInput {
  username: string;
  displayName: string;
  password: string;
}

interface AuthContextValue extends AuthState {
  register: (input: RegisterInput) => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
}


const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}


function setSessionCookie() {
  document.cookie = "void-session=1; path=/; SameSite=Strict; max-age=86400";
}

function clearSessionCookie() {
  document.cookie = "void-session=; path=/; SameSite=Strict; max-age=0";
}


export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    privateKey: null,
    isLoading: true,
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    async function restoreSession() {
      try {
        const privateKey = await getPrivateKey();
        if (!privateKey) {
          setState((s) => ({ ...s, isLoading: false }));
          return;
        }
        const storedRefreshToken = sessionStorage.getItem("void-rt");
        if (storedRefreshToken) {
          try {
            const { access_token } = await authApi.refresh(storedRefreshToken);
            const user = await authApi.me(access_token);
            setState({
              user,
              accessToken: access_token,
              refreshToken: storedRefreshToken,
              privateKey,
              isLoading: false,
            });
            return;
          } catch {
            sessionStorage.removeItem("void-rt");
          }
        }

        setState((s) => ({ ...s, privateKey, isLoading: false }));
      } catch {
        setState((s) => ({ ...s, isLoading: false }));
      }
    }

    restoreSession();
  }, []);


  useEffect(() => {
    if (!state.refreshToken) return;

    const REFRESH_INTERVAL_MS = 13 * 60 * 1000;

    const timer = setInterval(async () => {
      try {
        const { access_token } = await authApi.refresh(
          stateRef.current.refreshToken!
        );
        setState((s) => ({ ...s, accessToken: access_token }));
      } catch {
        await performLogout();
      }
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [state.refreshToken]);


  async function register({ username, displayName, password }: RegisterInput) {
    const saltBase64 = generateSalt();
    const wrappingKey = await deriveWrappingKey(password, saltBase64);

    const { publicKeyBase64, wrappedPrivateKeyBase64, privateKey } =
      await generateKeyPair(wrappingKey);

    const { access_token, refresh_token, user } = await authApi.register({
      username,
      display_name: displayName,
      password,
      public_key: publicKeyBase64,
      wrapped_private_key: wrappedPrivateKeyBase64,
      pbkdf2_salt: saltBase64,
    });

    await savePrivateKey(privateKey);

    sessionStorage.setItem("void-rt", refresh_token);
    setSessionCookie();

    setState({
      user,
      accessToken: access_token,
      refreshToken: refresh_token,
      privateKey,
      isLoading: false,
    });

    router.push("/chat");
  }


  async function login(username: string, password: string) {
    const { access_token, refresh_token, user } = await authApi.login(
      username,
      password
    );

    const wrappingKey = await deriveWrappingKey(password, user.pbkdf2_salt);

    const privateKey = await unwrapPrivateKey(
      user.wrapped_private_key,
      wrappingKey
    );

    await savePrivateKey(privateKey);

    sessionStorage.setItem("void-rt", refresh_token);
    setSessionCookie();

    setState({
      user,
      accessToken: access_token,
      refreshToken: refresh_token,
      privateKey,
      isLoading: false,
    });

    router.push("/chat");
  }


  async function performLogout() {
    try {
      if (stateRef.current.accessToken && stateRef.current.refreshToken) {
        await authApi.logout(
          stateRef.current.accessToken,
          stateRef.current.refreshToken
        );
      }
    } catch {
    }

    await clearPrivateKey();
    sessionStorage.removeItem("void-rt");
    clearSessionCookie();

    setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      privateKey: null,
      isLoading: false,
    });

    router.push("/login");
  }


  async function getToken(): Promise<string | null> {
    const { accessToken, refreshToken } = stateRef.current;
    if (accessToken) return accessToken;
    if (!refreshToken) return null;

    try {
      const { access_token } = await authApi.refresh(refreshToken);
      setState((s) => ({ ...s, accessToken: access_token }));
      return access_token;
    } catch {
      return null;
    }
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        register,
        login,
        logout: performLogout,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}