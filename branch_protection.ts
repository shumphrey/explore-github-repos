import chalk from "chalk";
import { Octokit } from "octokit";
import { getToken } from "./lib/token.js";
import { list_repositories } from "./lib/queries.js";
import {
  getReposToIgnore,
  isBasicBranchProtectionEnough,
  isSufficientReview,
  isSufficientStatusChecks,
  type BranchProtectionRules,
} from "./lib/branch_protection.js";
import type { Result, Nodes } from "./types/github.js";

const octokit = new Octokit({ auth: await getToken() });

const ignores = await getReposToIgnore();

// matches a Repository github object
interface Repository {
  name: string;
  isArchived: boolean;
  isFork: boolean;
  isPrivate: boolean;
  branchProtectionRules: Nodes<BranchProtectionRules>;
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
    throw new Error("node ./dist/branch_protection.js <fullteamname>");
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
    if (ignores.includes(repo.name)) {
      continue;
    }
    const rules_list = repo.branchProtectionRules.nodes;

    console.log(repo.name);
    if (!repo.isPrivate) {
      console.log(`\t${chalk.red(repo.name)} is public`);
      throw new Error("Public!");
    }

    const rules =
      rules_list.find((rule) => rule.pattern === "main") ||
      rules_list.find((rules) => rules.pattern === "master");

    if (!rules) {
      console.log(chalk.red(`\thas no branch protection rules!!`));
      continue;
    }

    const hasStatusChecks = isSufficientStatusChecks(rules);
    const hasBasicBranchProtection = isBasicBranchProtectionEnough(rules);
    const hasSufficientReview = isSufficientReview(rules);

    if (!hasBasicBranchProtection || !hasSufficientReview) {
      if (!hasStatusChecks) {
        console.log(chalk.grey(`\thas no status check rules`));
      }
      if (!hasBasicBranchProtection) {
        console.log(chalk.red(`\thas insufficient branch protection rules`));
      }
      if (!hasSufficientReview) {
        console.log(chalk.red(`\thas insufficient number of reviewers`));
      }
    } else {
      console.log(chalk.green("\tgood enough"));
    }
  }
}
