export function list_repositories(
  orgname: string,
  teamname: string,
  q = ""
): string {
  const graphql = `
    query($cursor:String) {
      organization(login: "${orgname}") {
        team(slug: "${teamname}") {
          name
          repositories(first: 100, query: "${q}", after: $cursor) {
            totalCount
            edges {
              node {
                name
                isArchived
                isFork
                isPrivate
                viewerCanAdminister
                branchProtectionRules(first: 100) {
                  nodes {
                    allowsDeletions,
                    allowsForcePushes,
                    dismissesStaleReviews,
                    isAdminEnforced,
                    pattern,
                    requireLastPushApproval,
                    requiredApprovingReviewCount,
                    requiredStatusCheckContexts,
                    requiresApprovingReviews,
                    requiresCodeOwnerReviews,
                    requiresStatusChecks,
                    requiresStrictStatusChecks,
                    restrictsPushes,
                    requiredApprovingReviewCount,
                  }
                }
              }
            }
            pageInfo {
                endCursor
                hasNextPage
            }
          }
        }
      }
    }
  `;

  return graphql;
}
