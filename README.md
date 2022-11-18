# Exploring repositories using the GitHub API

## index.ts

List repos belonging to a team

```
node dist/branch_protection.js "org/team"
```

## branch_protection.ts

Explore branch protection rules on repos owned by a team

```
node dist/branch_protection.js "org/team"
```

### ignore file

Add new line separated repository names to ignore in a file called `ignore` in the root directory.
File will ignore `#` comments as first character.
