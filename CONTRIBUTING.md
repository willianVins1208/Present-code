# Contributing

## Team Workflow

Use the Git repository as the single source of truth for Postman resources.

- Clone the repository locally.
- Open Postman Desktop.
- Connect the repository root in `Local View`.
- Edit collections and environments only from `Local View`.
- Review changed files with `git status`.
- Run validation before pushing.

## Recommended Flow

```bash
git pull
npm test
npm run test:postman
git add .
git commit -m "Describe your change"
git push
```

## Postman Rules

- Treat `postman/collections/` and `postman/environments/` as shared team assets.
- Avoid editing the same collection file at the same time as another teammate.
- Keep shared environment values generic and safe to commit.
- Do not commit secrets such as API keys, access tokens, passwords, cookies, or private account details.
- If you need personal secrets, keep them in your local Postman app only.

## Git Rules

- Pull latest changes before editing Postman resources.
- Prefer short-lived feature branches for non-trivial changes.
- Keep one logical change per commit when possible.
- If a Postman collection changes, include the related API or test updates in the same branch.

## Validation

Run these commands before opening a pull request or pushing directly to `main`:

```bash
npm test
npm run test:postman
```
