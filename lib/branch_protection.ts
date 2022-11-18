import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

export interface BranchProtectionRules {
  allowsDeletions: boolean;
  allowsForcePushes: boolean;
  dismissesStaleReviews: boolean;
  isAdminEnforced: boolean;
  pattern: string;
  requireLastPushApproval: boolean;
  requiredApprovingReviewCount: number;
  requiredStatusCheckContext?: string[];
  requiresApprovingReviews: boolean;
  requiresStatusChecks: boolean;
  requiresStrictStatusChecks: boolean;
  restrictsPushes: boolean;
  requiresCodeOwnerReviews: boolean;
}

const __dirname = dirname(fileURLToPath(import.meta.url));
export async function getReposToIgnore(): Promise<string[]> {
  try {
    const data = await readFile(join(__dirname, "..", "..", "ignore"), "utf-8");
    return data.split(/\n/).filter((repo) => repo && !repo.startsWith("#"));
  } catch (e) {
    return [];
  }
}

export function isBasicBranchProtectionEnough(
  rules: BranchProtectionRules
): boolean {
  const {
    allowsDeletions,
    allowsForcePushes,
    dismissesStaleReviews,
    // This probably should be on, but isn't on most of our repos
    isAdminEnforced,
    // this is new and none of our repos have this yet
    requireLastPushApproval,
    // ?
    // restrictsPushes
  } = rules;

  // console.log({
  //   allowsDeletions,
  //   allowsForcePushes,
  //   dismissesStaleReviews,
  //   isAdminEnforced,
  //   requireLastPushApproval,
  // });
  return (
    !allowsDeletions &&
    !allowsForcePushes &&
    dismissesStaleReviews &&
    isAdminEnforced &&
    requireLastPushApproval
  );
}

export function isSufficientStatusChecks(
  rules: BranchProtectionRules
): boolean {
  const {
    requiredStatusCheckContext,
    requiresStatusChecks,
    requiresStrictStatusChecks,
  } = rules;

  if (!requiresStatusChecks || !requiresStrictStatusChecks) {
    return false;
  }
  if (
    !requiredStatusCheckContext ||
    !Array.isArray(requiredStatusCheckContext)
  ) {
    return false;
  }

  return !!requiredStatusCheckContext.find((i) => /pr-(head|merge)$/.exec(i));
}

export function isSufficientReview(rules: BranchProtectionRules): boolean {
  const {
    requiredApprovingReviewCount,
    requiresApprovingReviews,
    requiresCodeOwnerReviews,
  } = rules;

  const sufficientReviewers =
    requiresApprovingReviews && requiredApprovingReviewCount > 1;

  const sufficientCodeownerReview =
    requiresApprovingReviews &&
    requiredApprovingReviewCount > 0 &&
    requiresCodeOwnerReviews;

  return sufficientReviewers || sufficientCodeownerReview;
}
