# The Determinate flake checker Action

Here's an example configuration:

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
        uses: DeterminateSystems/flake-checker-action@v1
      - name: Install Nix
        uses: DeterminateSystems/nix-installer-action@v3
      - name: Build default package
        run: |
          nix build
```
