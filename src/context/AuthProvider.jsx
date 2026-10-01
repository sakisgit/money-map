import { useCallback, useMemo, useState } from "react";
import { AuthContext } from "./AuthContext";
import {
  changePassword as changePasswordFor,
  deleteAccount as deleteAccountFor,
  restoreSession,
  signIn as signInWith,
  signOut as signOutNow,
  signUp as signUpWith,
  updateIdentity,
} from "../utils/auth";
import { readProfile, writeProfile } from "../utils/profile";

/** The profile's name/email are the account's sign-in name/email. */
const syncProfile = (account) => {
  if (!account) return;
  const profile = readProfile();
  if (profile.name !== account.name || profile.email !== account.email) {
    writeProfile({ ...profile, name: account.name, email: account.email });
  }
};

export const AuthProvider = ({ children }) => {
  // Runs once, before any page reads the stored data.
  const [account, setAccount] = useState(() => {
    const restored = restoreSession();
    syncProfile(restored);
    return restored;
  });

  const signIn = useCallback(async (details) => {
    const signedIn = await signInWith(details);
    syncProfile(signedIn);
    setAccount(signedIn);
    return signedIn;
  }, []);

  const signUp = useCallback(async (details) => {
    const result = await signUpWith(details);
    setAccount(result.account);
    return result;
  }, []);

  // Back to the no-account data. A full reload guarantees nothing of the
  // account stays in memory.
  const signOut = useCallback(() => {
    signOutNow();
    window.location.replace("/");
  }, []);

  const changePassword = useCallback(
    (current, next) => changePasswordFor(account?.id, current, next),
    [account]
  );

  const updateAccount = useCallback(
    (identity) => {
      const updated = updateIdentity(account?.id, identity);
      setAccount(updated);
      return updated;
    },
    [account]
  );

  const deleteAccount = useCallback(
    async (password) => {
      await deleteAccountFor(account?.id, password);
      window.location.replace("/");
    },
    [account]
  );

  const value = useMemo(
    () => ({ account, signIn, signUp, signOut, changePassword, updateAccount, deleteAccount }),
    [account, signIn, signUp, signOut, changePassword, updateAccount, deleteAccount]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
