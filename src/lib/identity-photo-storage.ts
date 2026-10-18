import { supabase } from "@/integrations/supabase/client";
import { validateImageFile } from "./validation";

const BUCKET = "link_identity_photos";

export async function uploadIdentityPhoto(username: string, file: File): Promise<string> {
  const validationError = validateImageFile(file);
  if (validationError) throw new Error(validationError);

  const extensionByType: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  const extension = extensionByType[file.type];
  if (!extension) throw new Error("Choose a JPG, PNG, or WebP image.");

  const path = `identity-links/${username}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;
  return `${BUCKET}/${path}`;
}
