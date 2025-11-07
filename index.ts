#!/usr/bin/env node

import chalk from "chalk";
import { Octokit } from "octokit";
import { getToken } from "./lib/token.ts";
import { list_repositories } from "./lib/queries.ts";
import type { Result } from "./types/github.ts";

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

async function* paginate(fullteam: string) {
  let hasMore = true;
  let cursor: string | undefined;

  const [orgname, teamname] = fullteam.split("/");
  if (!orgname || !teamname) {
    throw new Error("Invalid teamname. Should be org/team");
  }

  while (hasMore) {
    const res = await octokit.graphql<OrganizationTeamRespositories>(
      list_repositories(orgname, teamname),
      cursor ? { cursor } : {},
    );

    const repositories = res.organization?.team?.repositories;
    if (!repositories) {
      console.error(res);
      throw new Error(`No repositories found for team ${fullteam}`);
    }

    yield repositories.edges
      .filter(({ node }) => !node.isArchived && !node.isFork)
      .map((edge) => edge.node);

    hasMore = repositories.pageInfo.hasNextPage;
    cursor = repositories.pageInfo.endCursor;
  }
}

const fullteams = process.argv.slice(2);
if (!fullteams.length) {
  throw new Error("Missing full team name");
}
for (const fullteam of fullteams) {
  const paginator = paginate(fullteam);
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
}
