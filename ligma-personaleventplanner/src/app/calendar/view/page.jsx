"use client";

import { useContext, useEffect } from "react";
import { UserAuthContext } from "../../context/auth-context";
import { useRouter } from "next/navigation";

export default function CalendarViewPage() {
  const { user, signOut } = useContext(UserAuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  if (!user) return <div>Redirecting to login...</div>;

  return (
    <div style={{ padding: 24 }}>
      <h1>Calendar Dashboard</h1>
      <p>Welcome, {user.displayName || user.email}!</p>
      <div style={{ marginTop: 12 }}>
        <button onClick={signOut}>Sign Out</button>
      </div>
      <p style={{ marginTop: 12 }}>This is your protected calendar view. Add calendar components here.</p>
    </div>
  );
}
