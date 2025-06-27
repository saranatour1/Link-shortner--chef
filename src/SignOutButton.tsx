"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, Authenticated } from "convex/react";
import { Button } from '@/components/ui/button';

export function SignOutButton() {
  const { signOut } = useAuthActions();
  return (
		<Authenticated>
	    <Button
	      className="px-4 py-2 rounded bg-white border text-black border-gray-200 font-semibold hover:bg-gray-50 hover:text-secondary-hover transition-colors shadow-xs hover:shadow-sm"
	      onClick={() => void signOut()}
	    >
	      Sign out
	    </Button>
		</Authenticated>
  );
}
