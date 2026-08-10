"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut();
      }}
    >
      <button
        type="submit"
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        Sign out
      </button>
    </form>
  );
}
