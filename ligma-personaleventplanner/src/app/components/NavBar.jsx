"use client";

import { useState } from "react";

export default function NavBar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="nav container-fluid">
      <div className="brand">Ligma</div>

      <button
        className="menu-toggle"
        aria-label="Toggle menu"
        onClick={() => setOpen((s) => !s)}
      >
        {/* simple hamburger */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className={open ? "nav-collapsed" : "nav-collapsed"} style={{display: open ? 'flex' : undefined}}>
        <a href="/">Home</a>
        <a href="/calendar/view">Calendar</a>
        <a href="/auth/setup-2fa">Security</a>
        <a href="/auth/draft.html">Help</a>
      </div>
    </nav>
  );
}
