import type { DatabaseClient } from "@skillsgate/database";

export interface UserWithGithubUsername {
  id: string;
  name: string;
  image: string | null;
  githubUsername: string | null;
}

/**
 * Find a user by their GitHub username.
 * Looks up the Account where providerId='github' and accountId matches the username.
 */
export async function findUserByGithubUsername(
  db: DatabaseClient,
  githubUsername: string,
): Promise<UserWithGithubUsername | null> {
  const account = await db.account.findFirst({
    where: {
      providerId: "github",
      accountId: githubUsername,
    },
    include: {
      user: true,
    },
  });

  if (!account) {
    return null;
  }

  return {
    id: account.user.id,
    name: account.user.name,
    image: account.user.image,
    githubUsername: account.accountId,
  };
}

/**
 * Batch-fetch GitHub usernames for a list of user IDs.
 * Returns a map of userId -> githubUsername.
 */
export async function enrichUsersWithGithubUsername(
  db: DatabaseClient,
  userIds: string[],
): Promise<Map<string, string>> {
  if (userIds.length === 0) {
    return new Map();
  }

  const accounts = await db.account.findMany({
    where: {
      providerId: "github",
      userId: { in: userIds },
    },
    select: {
      userId: true,
      accountId: true,
    },
  });

  const map = new Map<string, string>();
  for (const account of accounts) {
    map.set(account.userId, account.accountId);
  }
  return map;
}
