<h1 align="center">
  🚀 actions-semver
</h1>

<p align="center">
<a href="https://github.com/xaprier/actions-semver/blob/main/LICENSE" target="blank">
<img src="https://img.shields.io/github/license/xaprier/actions-semver" alt="license" />
</a>
</p>

actions-semver is an integrated tool with GitHub Actions that generates semantic version tags. It creates new versions based on commit messages, referencing previous versions and triggering based on specific events.

## 🛠️ Usage

Add the following example YAML file to your project to use actions-semver.

```yaml
on:
  push:
    branches: [main]

name: Create Release

jobs:
  build:
    name: Create Release
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v2
      - name: Create Release
        id: create_release
        uses: xaprier/actions-semver@latest
        with:
          draft: false
          prerelease: false
          include-letter-v: true
          token: ${{ secrets.GITHUB_TOKEN }}
```

This example YAML file demonstrates the basic usage of actions-semver. This action only tracks pushes to the main branch and creates a version. You can customize the parameters in the .yml file to fit the needs of your project.

## Release Body
When creating release using this project, you can fork and change release body for yourself. Default release body as

```
${commit_tag_version} ~ ${commit_hash} by ${commit_owner} on ${commit_date}
${commit_message}
```
Changing the release body will be added in the next feature.

## 📚 Libraries
- @actions/github
- @actions/core
- @actions/exec