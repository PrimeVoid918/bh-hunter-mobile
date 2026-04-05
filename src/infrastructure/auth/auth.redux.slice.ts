import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState} from "./auth.types";
import { UserRoleEnum } from "../user/user.types";

const initialState: AuthState = {
  userData: {
    id: null,
    username: "guest",
    email: "",
    role: UserRoleEnum.GUEST,
    isActive: false,
    isVerified: false,
  },
  token: null,
};

//* -- Slice --
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<AuthState>) => {
      state.token = action.payload.token;
      state.userData = action.payload.userData;
      // * normalize role casing
    },
    logout: (state) => {
      state.token = null;
      state.userData = null;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;

// * Combined Usage * in simple login
/*
 * import { useDispatch } from "react-redux";
 * import { login, logout } from "@/stores/auth/auth";
 * import { useLoginMutation } from "@/stores/auth/auth";
 *
 * // inside your component
 * const [triggerLogin, { isLoading, error }] = useLoginMutation();
 * const dispatch = useDispatch();
 *
 * const handleLogin = async (credentials) => {
 *   try {
 *     const { access_token, user } = await triggerLogin(credentials).unwrap();
 *     dispatch(login({
 *       token: access_token,
 *       userData: user
 *     }));
 *   } catch (err) {
 *     console.error("Login failed:", err);
 *   }
 * };
 */

// TODO SECTION
//* 🔐 Improve auth caching and cleanup strategy
/*
 * Currently, `login` sets token/userData in Redux, but on app reload or resume,
 * cached state may persist due to Redux-Persist or internal memory state.
 *
 * ✅ PROPOSALS:
 * 1. Add `isLoading` and `isAuthenticated` flags to track transitions clearly.
 * 2. Auto-clear all sensitive slices (e.g., tenant/owner/admin data) on logout.
 * 3. Use `secureStore` or encrypted storage (e.g., Expo SecureStore or react-native-keychain) for tokens.
 * 4. On logout or token expiry, call `resetApiState()` from RTK Query to fully purge cache:
 *    - dispatch(api.util.resetApiState());
 *    - Prevents stale or unauthorized fetches after logout.
 * 5. Consider storing the last login timestamp for session expiry or idle logout.
 * 6. Optionally throttle/suppress auto-login logic when app cold starts (e.g., debounce 500ms).
 * 7. Display a minimal loading screen while checking auth status before rendering sensitive UI.
 *
 * This ensures that sensitive data is:
 * - Fully cleared on logout
 * - Not cached beyond its session scope
 * - Safer on shared/public devices
 * - Compliant with best practices (esp. if handling personal or financial info)
 */
