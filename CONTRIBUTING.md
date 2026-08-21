# Contributing to SpellBloc

Contributions should be focused, safe, and verifiable. Before opening a pull request:

1. Branch from the latest default branch and keep the change scoped to one concern.
2. Do not commit secrets, local environment files, dependencies, runtime user data, or generated Hardhat output.
3. Add or update tests whenever behavior changes.
4. Run `npm ci` and `npm run check` from the repository root.
5. Explain what changed, why it changed, and how it was tested in the pull request.

The `npm run check` command is the required local contribution gate. GitHub Actions runs the same gate for every pull request and for pushes to the default branch.

Pull requests are ready for review only when all checks pass and no unrelated generated files are included.
