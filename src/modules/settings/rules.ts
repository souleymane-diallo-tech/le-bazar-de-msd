import { z } from "zod";

export const whatsappSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s()+-]/g, ""))
  .pipe(
    z.string().regex(/^(?:[1-9]\d{7,14})?$/, "Numéro international requis"),
  );
const socialHosts = {
  facebook: ["facebook.com", "www.facebook.com"],
  instagram: ["instagram.com", "www.instagram.com"],
  tiktok: ["tiktok.com", "www.tiktok.com"],
};
export type SocialNetwork = keyof typeof socialHosts;
function socialUrl(network: SocialNetwork) {
  return z
    .string()
    .trim()
    .max(300)
    .refine((value) => {
      if (!value) return true;
      try {
        const url = new URL(value);
        return (
          url.protocol === "https:" &&
          socialHosts[network].includes(url.hostname) &&
          !url.username &&
          !url.password &&
          !url.port &&
          !url.search &&
          !url.hash &&
          /^\/[\w.@/-]+$/.test(url.pathname) &&
          !["/l.php", "/login", "/login/"].includes(url.pathname)
        );
      } catch {
        return false;
      }
    }, "Lien HTTPS de profil requis, sans paramètres");
}
export const publicSettingsSchema = z.object({
  whatsapp: whatsappSchema,
  facebook: socialUrl("facebook"),
  instagram: socialUrl("instagram"),
  tiktok: socialUrl("tiktok"),
});
export const settingsInputSchema = publicSettingsSchema.extend({
  version: z.number().int().min(0),
});
export type PublicSettings = z.infer<typeof publicSettingsSchema>;
export const emptySettings: PublicSettings = {
  whatsapp: "",
  facebook: "",
  instagram: "",
  tiktok: "",
};
export function publicSettingsFromJson(
  contacts: unknown,
  socialLinks: unknown,
): PublicSettings {
  const contact = z
    .object({ whatsapp: whatsappSchema.optional() })
    .safeParse(contacts);
  const social = z
    .object({
      facebook: socialUrl("facebook").optional(),
      instagram: socialUrl("instagram").optional(),
      tiktok: socialUrl("tiktok").optional(),
    })
    .safeParse(socialLinks);
  return {
    ...emptySettings,
    ...(social.success ? social.data : {}),
    whatsapp: contact.success ? (contact.data.whatsapp ?? "") : "",
  };
}
export function whatsappLink(number: string, message: string) {
  const result = whatsappSchema.safeParse(number);
  return result.success && result.data
    ? `https://wa.me/${result.data}?text=${encodeURIComponent(message)}`
    : null;
}
