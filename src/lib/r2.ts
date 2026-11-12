import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
} from "@aws-sdk/client-s3";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import {
  getIntegrationCredentials,
  type R2ConnectionConfig,
} from "@/db/queries";

export const CLOUDFLARE_ONE_CLICK_TOKEN_URL =
  "https://dash.cloudflare.com/profile/api-tokens?permissionGroupKeys=%5B%7B%22key%22%3A%22workers_r2%22%2C%22type%22%3A%22edit%22%7D%2C%7B%22key%22%3A%22account_settings%22%2C%22type%22%3A%22read%22%7D%5D&accountId=*&zoneId=all&name=Mek+Engineering+R2+Connect";

export interface UploadResult {
  url: string;
  key: string;
  provider: "cloudflare-r2" | "local-fallback";
  slot?: 1 | 2;
  bucketName?: string;
}

export interface DiscoveredR2Bucket {
  name: string;
  creationDate?: string;
  location?: string;
}

export interface OneClickR2Result {
  ok: boolean;
  needsBucketSelection?: boolean;
  needsAccountSelection?: boolean;
  accountId?: string;
  accountName?: string;
  accounts?: Array<{ id: string; name: string }>;
  bucketName?: string;
  availableBuckets?: DiscoveredR2Bucket[];
  accessKeyId?: string;
  secretAccessKey?: string;
  publicUrl?: string;
  message: string;
}

export function isR2SlotConfigured(conn: R2ConnectionConfig): boolean {
  return Boolean(
    conn.accountId &&
      conn.accessKeyId &&
      conn.secretAccessKey &&
      conn.bucketName
  );
}

function buildS3Client(conn: {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
}): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: `https://${conn.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: conn.accessKeyId,
      secretAccessKey: conn.secretAccessKey,
    },
  });
}

/**
 * Strictly verifies that the target R2 bucket ALREADY exists (pre-setup) and is active/reachable.
 * Never auto-creates buckets.
 */
export async function verifyActivePreSetupBucket(params: {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
}): Promise<{ ok: boolean; message: string }> {
  const accountId = params.accountId.trim();
  const accessKeyId = params.accessKeyId.trim();
  const secretAccessKey = params.secretAccessKey.trim();
  const bucketName = params.bucketName.trim();

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    return {
      ok: false,
      message:
        "Missing R2 Account ID, Access Key ID, Secret Access Key, or Pre-setup Bucket Name.",
    };
  }

  const client = buildS3Client({ accountId, accessKeyId, secretAccessKey });
  try {
    await client.send(new HeadBucketCommand({ Bucket: bucketName }));
    return {
      ok: true,
      message: `Active pre-setup bucket "${bucketName}" verified on Cloudflare R2.`,
    };
  } catch (err) {
    const errName = (err as { name?: string })?.name || "";
    const statusCode =
      (err as { $metadata?: { httpStatusCode?: number } })?.$metadata
        ?.httpStatusCode || 0;

    if (errName === "NotFound" || errName === "NoSuchBucket" || statusCode === 404) {
      return {
        ok: false,
        message: `Bucket "${bucketName}" does not exist or is not active. Please pre-create an active R2 bucket in Cloudflare Dashboard first.`,
      };
    }

    if (statusCode === 403 || errName === "Forbidden" || errName === "AccessDenied") {
      return {
        ok: false,
        message: `Access denied for bucket "${bucketName}". Ensure the bucket is pre-setup in account ${accountId} and your token has R2 Read & Write permission.`,
      };
    }

    const detail = err instanceof Error ? err.message : "Unknown R2 error";
    return {
      ok: false,
      message: `Could not verify active R2 bucket "${bucketName}": ${detail}`,
    };
  }
}

async function cfApiFetch<T>(
  endpointPath: string,
  apiToken: string
): Promise<{ ok: boolean; result?: T; errorMessage?: string }> {
  try {
    const res = await fetch(`https://api.cloudflare.com/client/v4${endpointPath}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const json = (await res.json()) as {
      success?: boolean;
      result?: T;
      errors?: Array<{ code?: number; message?: string }>;
    };

    if (!res.ok || !json.success) {
      const errMsg =
        json.errors?.map((e) => e.message).filter(Boolean).join("; ") ||
        `Cloudflare API HTTP ${res.status}`;
      return { ok: false, errorMessage: errMsg };
    }

    return { ok: true, result: json.result };
  } catch (err) {
    return {
      ok: false,
      errorMessage:
        err instanceof Error ? err.message : "Failed to contact Cloudflare API",
    };
  }
}

async function discoverBucketPublicUrl(
  accountId: string,
  bucketName: string,
  apiToken: string
): Promise<string> {
  // 1. Prefer an active Custom Domain attached to the bucket (e.g. https://cdn.mekengg.com)
  const customRes = await cfApiFetch<{
    domains?: Array<{ domain: string; enabled?: boolean }>;
  }>(`/accounts/${accountId}/r2/buckets/${bucketName}/domains/custom`, apiToken);

  if (customRes.ok && Array.isArray(customRes.result?.domains)) {
    const activeCustom = customRes.result.domains.find(
      (d) => d.enabled !== false && d.domain
    );
    if (activeCustom?.domain) {
      return `https://${activeCustom.domain.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;
    }
  }

  // 2. Fall back to enabled r2.dev managed public domain (e.g. https://pub-xxx.r2.dev)
  const managedRes = await cfApiFetch<{
    enabled?: boolean;
    domain?: string;
  }>(`/accounts/${accountId}/r2/buckets/${bucketName}/domains/managed`, apiToken);

  if (managedRes.ok && managedRes.result?.enabled && managedRes.result.domain) {
    return `https://${managedRes.result.domain.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;
  }

  return "";
}

/**
 * One-Click Cloudflare Connect:
 * - Verifies API Token and derives S3 AccessKeyId (token ID) + SecretAccessKey (SHA-256 of token).
 * - Auto-discovers Cloudflare Account & lists pre-setup active R2 buckets.
 * - Fails if the account does not already have an active pre-setup R2 bucket.
 * - Verifies S3 HeadBucket readiness & auto-detects custom/r2.dev public URL.
 */
export async function oneClickConnectCloudflareR2(params: {
  apiToken: string;
  accountId?: string;
  bucketName?: string;
  publicUrl?: string;
}): Promise<OneClickR2Result> {
  const apiToken = params.apiToken.trim();
  if (!apiToken) {
    return {
      ok: false,
      message: "Please paste your Cloudflare API Token to connect.",
    };
  }

  // Step 1: Discover Cloudflare Accounts first if needed (helps verify Account-scoped tokens too)
  let resolvedAccountId = (params.accountId || "").trim();
  let resolvedAccountName = "";

  const accountsRes = await cfApiFetch<Array<{ id: string; name: string }>>(
    "/accounts?per_page=25",
    apiToken
  );
  const discoveredAccounts =
    accountsRes.ok && Array.isArray(accountsRes.result) ? accountsRes.result : [];

  if (!resolvedAccountId && discoveredAccounts.length === 1) {
    resolvedAccountId = discoveredAccounts[0].id;
    resolvedAccountName = discoveredAccounts[0].name;
  }

  // Step 2: Verify Token & obtain Token ID (required for S3 Access Key ID)
  let tokenId = "";
  const userVerify = await cfApiFetch<{ id: string; status: string }>(
    "/user/tokens/verify",
    apiToken
  );

  if (userVerify.ok && userVerify.result?.id) {
    if (userVerify.result.status && userVerify.result.status !== "active") {
      return {
        ok: false,
        message: `Cloudflare token is not active (status: ${userVerify.result.status}).`,
      };
    }
    tokenId = userVerify.result.id;
  } else {
    // Try account-level token verification across candidate accounts
    const candidateAccountIds = resolvedAccountId
      ? [resolvedAccountId]
      : discoveredAccounts.map((a) => a.id);

    for (const accId of candidateAccountIds) {
      const accVerify = await cfApiFetch<{ id: string; status: string }>(
        `/accounts/${accId}/tokens/verify`,
        apiToken
      );
      if (accVerify.ok && accVerify.result?.id) {
        tokenId = accVerify.result.id;
        resolvedAccountId = accId;
        resolvedAccountName =
          discoveredAccounts.find((a) => a.id === accId)?.name || "";
        break;
      }
    }
  }

  if (!tokenId) {
    return {
      ok: false,
      message:
        userVerify.errorMessage ||
        "Invalid Cloudflare API Token. Use the One-Click Cloudflare Token button to generate a valid R2 token.",
    };
  }

  // Step 3: Resolve Account & Discover Active Pre-Setup Buckets
  if (!resolvedAccountId && discoveredAccounts.length > 1) {
    // Check which accounts actually have active R2 buckets
    const accountsWithBuckets: Array<{
      id: string;
      name: string;
      buckets: DiscoveredR2Bucket[];
    }> = [];

    for (const acc of discoveredAccounts) {
      const bRes = await cfApiFetch<{
        buckets?: Array<{ name: string; creation_date?: string; location?: string }>;
      }>(`/accounts/${acc.id}/r2/buckets`, apiToken);

      const list = (bRes.result?.buckets || []).map((b) => ({
        name: b.name,
        creationDate: b.creation_date,
        location: b.location,
      }));
      if (list.length > 0) {
        accountsWithBuckets.push({ id: acc.id, name: acc.name, buckets: list });
      }
    }

    if (accountsWithBuckets.length === 0) {
      return {
        ok: false,
        message:
          "Connection refused: None of your Cloudflare accounts have an active pre-setup R2 bucket. Please create a bucket in Cloudflare R2 first.",
      };
    }

    if (accountsWithBuckets.length === 1) {
      resolvedAccountId = accountsWithBuckets[0].id;
      resolvedAccountName = accountsWithBuckets[0].name;
    } else {
      return {
        ok: false,
        needsAccountSelection: true,
        accounts: accountsWithBuckets.map((a) => ({ id: a.id, name: a.name })),
        message:
          "Multiple Cloudflare accounts with active R2 buckets detected. Select an account below to continue.",
      };
    }
  }

  if (!resolvedAccountId) {
    return {
      ok: false,
      message:
        "Could not auto-detect Cloudflare Account ID. Ensure your token includes Account Settings: Read or enter your Account ID.",
    };
  }

  if (!resolvedAccountName) {
    resolvedAccountName =
      discoveredAccounts.find((a) => a.id === resolvedAccountId)?.name || "";
  }

  // Step 4: List pre-setup active R2 buckets in the resolved account
  const bucketsRes = await cfApiFetch<{
    buckets?: Array<{ name: string; creation_date?: string; location?: string }>;
  }>(`/accounts/${resolvedAccountId}/r2/buckets`, apiToken);

  if (!bucketsRes.ok) {
    return {
      ok: false,
      accountId: resolvedAccountId,
      accountName: resolvedAccountName,
      message: `Failed to list R2 buckets (${bucketsRes.errorMessage}). Ensure R2 is enabled on your Cloudflare account and the token has Workers R2 Storage: Edit permission.`,
    };
  }

  const availableBuckets: DiscoveredR2Bucket[] = (
    bucketsRes.result?.buckets || []
  ).map((b) => ({
    name: b.name,
    creationDate: b.creation_date,
    location: b.location,
  }));

  if (availableBuckets.length === 0) {
    return {
      ok: false,
      accountId: resolvedAccountId,
      accountName: resolvedAccountName,
      message: `Connection failed: No active R2 bucket found in Cloudflare account "${resolvedAccountName || resolvedAccountId}". You must pre-setup an active R2 bucket in Cloudflare Dashboard before connecting.`,
    };
  }

  const requestedBucket = (params.bucketName || "").trim();
  let chosenBucket = "";

  if (requestedBucket) {
    const match = availableBuckets.find((b) => b.name === requestedBucket);
    if (!match) {
      return {
        ok: false,
        needsBucketSelection: true,
        accountId: resolvedAccountId,
        accountName: resolvedAccountName,
        availableBuckets,
        message: `Bucket "${requestedBucket}" is not an active pre-setup bucket in this account. Select one of your active buckets below:`,
      };
    }
    chosenBucket = match.name;
  } else if (availableBuckets.length === 1) {
    chosenBucket = availableBuckets[0].name;
  } else {
    return {
      ok: false,
      needsBucketSelection: true,
      accountId: resolvedAccountId,
      accountName: resolvedAccountName,
      availableBuckets,
      message: `Found ${availableBuckets.length} active pre-setup R2 buckets! Click the bucket you want to bind to this connection:`,
    };
  }

  // Step 5: Derive S3 Access Key ID + Secret Access Key and verify live S3 HeadBucket access
  const accessKeyId = tokenId;
  const secretAccessKey = crypto
    .createHash("sha256")
    .update(apiToken)
    .digest("hex");

  const bucketCheck = await verifyActivePreSetupBucket({
    accountId: resolvedAccountId,
    accessKeyId,
    secretAccessKey,
    bucketName: chosenBucket,
  });

  if (!bucketCheck.ok) {
    return {
      ok: false,
      accountId: resolvedAccountId,
      accountName: resolvedAccountName,
      availableBuckets,
      message: bucketCheck.message,
    };
  }

  // Step 6: Auto-discover Public Domain (Custom Domain or enabled r2.dev) if not manually provided
  const discoveredPublicUrl =
    (params.publicUrl || "").trim().replace(/\/$/, "") ||
    (await discoverBucketPublicUrl(resolvedAccountId, chosenBucket, apiToken));

  return {
    ok: true,
    accountId: resolvedAccountId,
    accountName: resolvedAccountName,
    bucketName: chosenBucket,
    availableBuckets,
    accessKeyId,
    secretAccessKey,
    publicUrl: discoveredPublicUrl,
    message: discoveredPublicUrl
      ? `Connected! Active bucket "${chosenBucket}" verified with public URL ${discoveredPublicUrl}.`
      : `Connected! Active bucket "${chosenBucket}" verified. (Tip: Enable r2.dev or attach a custom domain on the bucket for public image delivery.)`,
  };
}

export async function testR2Connection(
  slot?: 1 | 2
): Promise<{ ok: boolean; message: string }> {
  const creds = await getIntegrationCredentials();

  if (slot === 1 || slot === 2) {
    const conn = creds.r2Connections[slot - 1];
    return verifyActivePreSetupBucket({
      accountId: conn.accountId,
      accessKeyId: conn.accessKeyId,
      secretAccessKey: conn.secretAccessKey,
      bucketName: conn.bucketName,
    });
  }

  const configured = creds.r2Connections.filter(
    (c) => c.enabled && isR2SlotConfigured(c)
  );
  if (configured.length === 0) {
    return {
      ok: false,
      message:
        "No active Cloudflare R2 connection is configured. Connect Connection #1 or #2 first.",
    };
  }

  const results = await Promise.all(
    configured.map(async (c) => {
      const check = await verifyActivePreSetupBucket(c);
      return { slot: c.slot, bucket: c.bucketName, ...check };
    })
  );

  const allOk = results.every((r) => r.ok);
  return {
    ok: allOk,
    message: results
      .map((r) => `Conn #${r.slot} (${r.bucket || "unset"}): ${r.message}`)
      .join(" | "),
  };
}

/**
 * Uploads a file buffer to Cloudflare R2.
 * When BOTH Connection #1 and Connection #2 have active, verified pre-setup buckets,
 * randomly chooses one of the two buckets for automatic load distribution.
 */
export async function uploadFileBuffer(params: {
  buffer: Buffer;
  originalName: string;
  contentType: string;
  folder?: string;
}): Promise<UploadResult> {
  const ext = path.extname(params.originalName || "").toLowerCase() || ".bin";
  const safeBase =
    path
      .basename(params.originalName || "asset", ext)
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "asset";

  const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
  const folder = (params.folder || "assets").replace(/[^a-z0-9_-]/gi, "");
  const fileName = `${safeBase}-${uniqueSuffix}${ext}`;
  const objectKey = `${folder}/${fileName}`;

  const creds = await getIntegrationCredentials();
  const activePool = creds.r2Connections.filter(
    (c) => c.enabled && c.verified && isR2SlotConfigured(c)
  );

  if (activePool.length > 0) {
    // Cryptographically unbiased random choice across active verified connections (1 or 2)
    const primaryPickIndex =
      activePool.length > 1 ? crypto.randomInt(0, activePool.length) : 0;

    const orderedCandidates =
      activePool.length > 1
        ? [activePool[primaryPickIndex], activePool[1 - primaryPickIndex]]
        : [activePool[0]];

    let lastErr: unknown = null;
    for (const chosen of orderedCandidates) {
      try {
        const client = buildS3Client(chosen);
        await client.send(
          new PutObjectCommand({
            Bucket: chosen.bucketName,
            Key: objectKey,
            Body: params.buffer,
            ContentType: params.contentType,
            CacheControl: "public, max-age=31536000, immutable",
          })
        );

        const publicBase =
          chosen.publicUrl ||
          `https://${chosen.bucketName}.${chosen.accountId}.r2.cloudflarestorage.com`;

        return {
          url: `${publicBase}/${objectKey}`,
          key: objectKey,
          provider: "cloudflare-r2",
          slot: chosen.slot,
          bucketName: chosen.bucketName,
        };
      } catch (err) {
        lastErr = err;
        console.error(
          `[R2 Upload] Connection #${chosen.slot} (${chosen.bucketName}) failed:`,
          err
        );
      }
    }

    if (lastErr) {
      throw lastErr;
    }
  }

  // Graceful local disk fallback when no R2 bucket is connected yet
  const uploadsDir = path.resolve(process.cwd(), "data", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });
  await fs.writeFile(path.join(uploadsDir, fileName), params.buffer);

  return {
    url: `/api/uploads/${fileName}`,
    key: fileName,
    provider: "local-fallback",
  };
}

export async function deleteStoredFile(keyOrUrl: string): Promise<void> {
  if (!keyOrUrl || keyOrUrl.startsWith("/api/uploads/")) {
    return;
  }

  const creds = await getIntegrationCredentials();
  const activePool = creds.r2Connections.filter((c) => isR2SlotConfigured(c));

  for (const conn of activePool) {
    const matchesPublic =
      conn.publicUrl && keyOrUrl.startsWith(conn.publicUrl);
    const fallbackHost = `https://${conn.bucketName}.${conn.accountId}.r2.cloudflarestorage.com`;
    const matchesFallback = keyOrUrl.startsWith(fallbackHost);

    if (matchesPublic || matchesFallback || activePool.length === 1) {
      let key = keyOrUrl;
      if (matchesPublic) {
        key = keyOrUrl.slice(conn.publicUrl.length).replace(/^\//, "");
      } else if (matchesFallback) {
        key = keyOrUrl.slice(fallbackHost.length).replace(/^\//, "");
      }

      try {
        const client = buildS3Client(conn);
        await client.send(
          new DeleteObjectCommand({
            Bucket: conn.bucketName,
            Key: key,
          })
        );
        return;
      } catch {
        // Ignore deletion failure if already removed
      }
    }
  }
}
