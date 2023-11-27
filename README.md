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

The GitHub Actions script is designed to automatically create Git tags for every commit on the main branch. The semantic version tags are generated based on commit messages:
- If the commit message includes <b><i>minor</i></b> keyword, it means that the action should increment the semantic version by the Minor value. In semantic versioning (SemVer), versions are typically represented as MAJOR.MINOR.PATCH, where the MINOR version is bumped for backward-compatible new features. So, if a commit message contains the "minor" keyword, the action will increase the MINOR version of the semantic version.

- If the commit message includes <b><i>major</i></b> keyword, it indicates that the action should increment the semantic version by the Major value. In SemVer, the MAJOR version is bumped for incompatible API changes. If a commit message includes the "major" keyword, the action will increase the MAJOR version of the semantic version.

- If the commit message includes <b><i>release</i></b> keyword, the action will create a GitHub release. Additionally, it will read all the commits that occurred since the latest release. This information is then used to compose the release body, which is a description of the changes included in the release. The release body typically includes details such as the commit version, commit hash, commit owner, and commit date for each commit since the last release. This provides a summary of the changes made in the new release. 

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