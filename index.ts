import chalk from "chalk";
import { Octokit } from "octokit";
import { getToken } from "./lib/token.js";
import { list_repositories } from "./lib/queries.js";
import type { Result } from "./types/github.js";

const octokit = new Octokit({ auth: await getToken() });

// matches a Repository github object
interface Repository {
  name: string;
  isArchived: boolean;
  isFork: boolean;
  isPrivate: boolean;
  viewerCanAdminister: boolean;
  // branchProtectionRules: Nodes<BranchProtectionRules>;
  // languages: unknown;
  // primaryLanguage: unknown;
}

// matches our search
interface OrganizationTeamRespositories {
  organization: {
    team: {
      name: string;
      repositories: Result<Repository>;
    };
  };
}

async function* paginate() {
  let hasMore = true;
  let cursor: string | undefined;

  const fullteam = process.argv[2];
  if (!fullteam) {
    throw new Error("Missing full team name");
  }
  const [orgname, teamname] = fullteam.split("/");
  if (!orgname || !teamname) {
    throw new Error("Invalid teamname. Should be org/team");
  }

  while (hasMore) {
    const res = await octokit.graphql<OrganizationTeamRespositories>(
      list_repositories(orgname, teamname),
      cursor ? { cursor } : {}
    );

    const {
      organization: {
        team: { repositories },
      },
    } = res;

    yield repositories.edges
      .filter(({ node }) => !node.isArchived && !node.isFork)
      .map((edge) => edge.node);

    hasMore = repositories.pageInfo.hasNextPage;
    cursor = repositories.pageInfo.endCursor;
  }
}

const paginator = paginate();
for await (const repos of paginator) {
  for (const repo of repos) {
    // ignore things we have write access to but can't admin
    // stuff like bbc/web or homepage-v5-lodash
    if (!repo.viewerCanAdminister) {
      continue;
      // console.error(`\t${chalk.red(repo.name)} no admin access`);
    }
    console.log(repo.name);
    if (!repo.isPrivate) {
      console.error(`\t${chalk.red(repo.name)} is public`);
    }
  }
}
