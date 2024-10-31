# Exploring repositories using the GitHub API

Install [tsx](https://www.npmjs.com/package/tsx) and the local dependencies

```
npm install -g tsx
npm ci
```

List repos belonging to a team:

```
tsx ./index.ts "org/team"
```

# ignore file

Add new line separated repository names to ignore in a file called `ignore` in the root directory.
File will ignore `#` comments as first character.
