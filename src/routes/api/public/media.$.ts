import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

const SAFE_PATH = /^[A-Za-z0-9/_.-]+$/;

export const Route = createFileRoute("/api/public/media/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const raw = (params as { _splat?: string })._splat ?? "";
        const decodedPath = decodeURIComponent(raw);
        const photoBucketPrefix = "link_identity_photos/";
        const bucket = decodedPath.startsWith(photoBucketPrefix)
          ? "link_identity_photos"
          : "profile-media";
        const path =
          bucket === "link_identity_photos"
            ? decodedPath.slice(photoBucketPrefix.length)
            : decodedPath;
        if (!path || !SAFE_PATH.test(path) || path.includes("..")) {
          return new Response("Not found", { status: 404 });
        }

        const supabase = createClient(
          process.env["SUPABASE_URL"]!,
          process.env["SUPABASE_PUBLISHABLE_KEY"]!,
          { auth: { persistSession: false, autoRefreshToken: false } },
        );

        const { data, error } = await supabase.storage.from(bucket).download(path);
        if (error || !data) return new Response("Not found", { status: 404 });

        return new Response(await data.arrayBuffer(), {
          headers: {
            "content-type": data.type || "application/octet-stream",
            "cache-control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
