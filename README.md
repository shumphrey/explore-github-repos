# Exploring repositories using the GitHub API

Install [tsx](https://www.npmjs.com/package/tsx) and the local dependencies

```
npm ci
```

List repos belonging to a team:

```
./index.ts "org/team"
```

Requires a modern node with type stripping support

# ignore file

Add new line separated repository names to ignore in a file called `ignore` in the root directory.
File will ignore `#` comments as first character.
