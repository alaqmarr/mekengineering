import {
  getIntegrationCredentials,
  type R2ConnectionConfig,
} from "@/db/queries";
import {
  CLOUDFLARE_ONE_CLICK_TOKEN_URL,
  isR2SlotConfigured,
} from "@/lib/r2";

export const SECRET_MASK = "••••••••••••••••";

export function formatMaskedR2Slot(conn: R2ConnectionConfig) {
  const configured = Boolean(conn.verified && isR2SlotConfigured(conn));
  return {
    slot: conn.slot,
    enabled: conn.enabled,
    verified: conn.verified,
    accountId: conn.accountId,
    accountName: conn.accountName,
    accessKeyId: conn.accessKeyId,
    hasSecretAccessKey: Boolean(conn.secretAccessKey),
    secretAccessKeyMask: conn.secretAccessKey ? SECRET_MASK : "",
    hasApiToken: Boolean(conn.apiToken),
    apiTokenMask: conn.apiToken ? SECRET_MASK : "",
    bucketName: conn.bucketName,
    publicUrl: conn.publicUrl,
    configured,
  };
}

export async function buildMaskedIntegrationsResponse() {
  const creds = await getIntegrationCredentials();
  const slot1 = formatMaskedR2Slot(creds.r2Connections[0]);
  const slot2 = formatMaskedR2Slot(creds.r2Connections[1]);
  const activePoolCount = [slot1, slot2].filter(
    (s) => s.enabled && s.configured
  ).length;

  return {
    oneClickTokenUrl: CLOUDFLARE_ONE_CLICK_TOKEN_URL,
    activeR2PoolCount: activePoolCount,
    r2Connections: [slot1, slot2] as [typeof slot1, typeof slot2],
    r2: slot1,
    smtp: {
      host: creds.smtpHost,
      port: String(creds.smtpPort),
      secure: creds.smtpSecure,
      user: creds.smtpUser,
      hasPass: Boolean(creds.smtpPass),
      passMask: creds.smtpPass ? SECRET_MASK : "",
      fromName: creds.smtpFromName,
      fromEmail: creds.smtpFromEmail,
      adminEmail: creds.adminNotificationEmail,
      configured: Boolean(creds.smtpHost && creds.smtpUser && creds.smtpPass),
    },
  };
}
