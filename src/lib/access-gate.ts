export const ACCESS_COOKIE_NAME = "worldcup_access";

const encoder = new TextEncoder();

function getPassword() {
  return process.env.APP_PASSWORD?.trim() ?? "";
}

function getSecret() {
  return process.env.AUTH_SECRET?.trim() ?? "worldcup-value-dashboard";
}

export function isAccessGateEnabled() {
  return getPassword().length > 0;
}

export function isCorrectPassword(password: string) {
  return isAccessGateEnabled() && password === getPassword();
}

export async function createAccessToken() {
  const source = `${getSecret()}:${getPassword()}`;
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(source));

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function isValidAccessToken(token?: string) {
  if (!isAccessGateEnabled()) {
    return true;
  }

  if (!token) {
    return false;
  }

  return token === (await createAccessToken());
}
