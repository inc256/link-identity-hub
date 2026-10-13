import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getPublicIdentityProfile } from "@/lib/identity-links";
import type { ProfileBundle } from "@/lib/profile-types";
import { ProfileView } from "@/components/public/ProfileView";

export const Route = createFileRoute("/p/$username")({
  component: PublicProfile,
});

function PublicProfile() {
  const { username } = Route.useParams();
  const [bundle, setBundle] = useState<ProfileBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    getPublicIdentityProfile(username)
      .then((profile) => {
        if (active) setBundle(profile);
      })
      .catch((loadError: unknown) => {
        console.error(loadError);
        if (active) setError("This profile could not be loaded. Please try again later.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [username]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading profile…
      </main>
    );
  }

  if (error || !bundle) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5F4F0] px-5 text-[#1F2A44]">
        <div className="max-w-sm text-center">
          <h1 className="text-2xl font-semibold">
            {error ? "Profile unavailable" : "Link not found"}
          </h1>
          <p className="mt-2 text-sm text-[#667085]">
            {error || "This profile link may have been removed or entered incorrectly."}
          </p>
          <Link
            to="/"
            className="mt-5 inline-block text-sm font-semibold underline underline-offset-4"
          >
            Create your own link
          </Link>
        </div>
      </main>
    );
  }

  return <ProfileView bundle={bundle} />;
}
