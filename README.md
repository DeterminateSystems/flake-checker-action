# The Nix Flake Checker Action

This repo houses a [Github Action][action] from [Determinate Systems][detsys] that performs health checks on your repos' [`flake.lock`][lock] files.
Specifically, it wraps the [Nix Flake Checker][flake-checker] tool, which verifies that your root [Nixpkgs] inputs:

- Have been updated within the last 30 days
- Have the [`NixOS`][nixos-org] GitHub org as their owner
- Are from a supported Git branch

Here's an example configuration that uses `flake-checker-action` as part of a broader Actions workflow involving Nix.

```yaml
on:
  pull_request:
  push:
    branches: [main]

jobs:
  build:
    name: Build Nix targets
    runs-on: ubuntu-22.04
    steps:
      - uses: actions/checkout@v3
      - name: Check Nix flake inputs
        uses: DeterminateSystems/flake-checker-action@main # This action
      - name: Install Nix
        uses: DeterminateSystems/determinate-nix-action@v3
      - name: Build default package
        run: nix build
```

## Configuration

The Nix Flake Checker Action has a number of configuration parameters that you can set in the `with` block:

| Parameter                   | Description                                                                                                                                                                                                                                                                           | Default      |
| :-------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :----------- |
| `condition`                 | An optional Common Expression Language (CEL) condition expressing your flake policy. Supersedes all `check-*` parameters.                                                                                                                                                             |              |
| `flake-lock-path`           | The path to the `flake.lock` file you want to check.                                                                                                                                                                                                                                  | `flake.lock` |
| `check-outdated`            | Whether to check that the root Nixpkgs input is less than 30 days old.                                                                                                                                                                                                                | `true`       |
| `check-owner`               | Whether to check that the root Nixpkgs input has the `NixOS` GitHub org as its owner.                                                                                                                                                                                                 | `true`       |
| `check-supported`           | Whether to check that the root Nixpkgs input has a supported Git ref. Currently supported refs: `nixos-22.11`, `nixos-22.11-small`, `nixos-23.05`, `nixos-23.05-small`, `nixos-unstable`, `nixos-unstable-small`, `nixpkgs-22.11-darwin`, `nixpkgs-23.05-darwin`, `nixpkgs-unstable`. | `true`       |
| `nixpkgs-keys`              | The names of the Nixpkgs inputs you want to check. By default the checker only checks the `nixpkgs` but you can specify multiple names as a comma-separated list, such as `nixpkgs,nixpkgs-macos,nixpkgs-unstable`.                                                                   | `nixpkgs`    |
| `ignore-missing-flake-lock` | Whether to ignore a missing `flake.lock` file, where the path to the file is the value of `flake-lock-path` parameter. If set to `false` (the default is `true`), the Action throws an error and the job fails if the lockfile is missing.                                            | `true`       |
| `fail-mode`                 | Fail with an exit code of 1 if any issues are encountered.                                                                                                                                                                                                                            | `false`      |
| `send-statistics`           | Anonymously report the number of issues detected by the flake checker. This reporting helps measure the effectiveness of the flake checker. Set to `false` to disable.                                                                                                                | `true`       |

Here's an example non-default configuration:

```yaml
- name: Check Nix flake inputs
  uses: DeterminateSystems/flake-checker-action@v2
  with:
    flake-lock-path: ./nix/flake.lock
    check-owner: false
    ignore-missing-flake-lock: false
    fail-mode: true
```

[action]: https://github.com/features/actions
[detsys]: https://determinate.systems
[flake-checker]: https://github.com/DeterminateSystems/flake-checker
[lock]: https://zero-to-nix.com/concepts/flakes#lockfile
[nixos-org]: https://github.com/NixOS
[nixpkgs]: https://github.com/NixOS/nixpkgs
