import crypto from "crypto";

export function signBunnyVideo(videoId: string) {
  const securityKey = process.env.BUNNY_TOKEN_KEY?.trim();
  const libraryId =
    process.env.BUNNY_LIBRARY_ID?.trim() ||
    "a28938ec-e6a1-443f-ab56-4d846df5edeb";

  if (!securityKey) {
    console.error("❌ Bunny Security Key is missing in .env");
    return `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}`;
  }

  // مدة صلاحية الرابط (24 ساعة)
  const expires = Math.floor(Date.now() / 1000) + 24 * 60 * 60;

  // الخوارزمية: sha256(securityKey + videoID + expires)
  const input = securityKey + videoId + expires;
  const hash = crypto.createHash("sha256").update(input).digest("hex");

  return `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?token=${hash}&expires=${expires}`;
}
