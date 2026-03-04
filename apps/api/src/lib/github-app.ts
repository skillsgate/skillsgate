type InstallationRepo = {
  id: number;
  name: string;
  full_name: string;
  owner: { login: string };
  default_branch: string;
  private: boolean;
  description: string | null;
  html_url: string;
  updated_at: string;
};

const GITHUB_API = "https://api.github.com";

function base64UrlEncode(input: ArrayBuffer | string): string {
  const bytes =
    typeof input === "string" ? new TextEncoder().encode(input) : new Uint8Array(input);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const cleaned = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\n/g, "")
    .replace(/\r/g, "");
  const binary = atob(cleaned);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const keyData = pemToArrayBuffer(pem);
  return crypto.subtle.importKey(
    "pkcs8",
    keyData,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

export async function createGitHubAppJwt(appId: string, privateKey: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iat: now - 60,
    exp: now + 9 * 60,
    iss: appId,
  };
  const header = { alg: "RS256", typ: "JWT" };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const data = `${encodedHeader}.${encodedPayload}`;

  const normalizedKey = privateKey.includes("\\n")
    ? privateKey.replace(/\\n/g, "\n")
    : privateKey;
  const key = await importPrivateKey(normalizedKey);
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(data),
  );
  const encodedSignature = base64UrlEncode(signature);

  return `${data}.${encodedSignature}`;
}

async function fetchInstallationToken(appJwt: string, installationId: string): Promise<string> {
  const res = await fetch(
    `${GITHUB_API}/app/installations/${encodeURIComponent(installationId)}/access_tokens`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${appJwt}`,
        "User-Agent": "SkillsGate",
        Accept: "application/vnd.github+json",
      },
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub app token error ${res.status}: ${text}`);
  }

  const data = (await res.json()) as { token: string };
  return data.token;
}

async function listReposForToken(token: string, url: string): Promise<InstallationRepo[]> {
  const repos: InstallationRepo[] = [];
  let nextUrl: string | null = url;

  while (nextUrl) {
    const res: Response = await fetch(nextUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "User-Agent": "SkillsGate",
        Accept: "application/vnd.github+json",
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`GitHub repo list error ${res.status}: ${text}`);
    }

    const body = (await res.json()) as { repositories: InstallationRepo[] };
    repos.push(...body.repositories);

    const link: string | null = res.headers.get("link");
    nextUrl = null;
    if (link) {
      const match: RegExpMatchArray | null = link.match(
        /<([^>]+)>;\s*rel="next"/,
      );
      if (match) nextUrl = match[1];
    }
  }

  return repos;
}

export async function listInstallationRepos(
  appJwt: string,
  installationId: string,
): Promise<InstallationRepo[]> {
  const token = await fetchInstallationToken(appJwt, installationId);
  const url = `${GITHUB_API}/installation/repositories?per_page=100`;
  return listReposForToken(token, url);
}

export async function getInstallationToken(
  appJwt: string,
  installationId: string,
): Promise<string> {
  return fetchInstallationToken(appJwt, installationId);
}
