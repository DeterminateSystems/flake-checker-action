# flake-checker-action

The `flake-checker-action` from [Determinate Systems][ds] performs health checks on your repos' [`flake.lock`][lock] files.
Specifically, it checks that your root [Nixpkgs] input:

* Was updated within the last 30 days
* Has the [`NixOS`][nixos-org] GitHub org as its owner
* Is from a supported Git branch

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
        uses: DeterminateSystems/flake-checker-action@v1 # This action
      - name: Install Nix
        uses: DeterminateSystems/nix-installer-action@v3
      - name: Build default package
        run: nix build
```

[ds]: https://determinate.systems
[lock]: https://zero-to-nix.com/concepts/flakes#lockfile
[nixos-org]: https://github.com/NixOS
[nixpkgs]: https://github.com/NixOS/nixpkgs
