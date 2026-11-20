import "server-only";
import { cache } from "react";
import { getDb } from "@/lib/db";
import { publicSettingsFromJson } from "./rules";
export const getPublicSettings = cache(async () => {
  const record = await getDb().storeSettings.findUnique({
    where: { id: "store" },
    select: { contacts: true, socialLinks: true, version: true },
  });
  return {
    ...publicSettingsFromJson(record?.contacts, record?.socialLinks),
    version: record?.version ?? 0,
  };
});
