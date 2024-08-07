const core = require("@actions/core");
const { execSync } = require('child_process');
const github = require('@actions/github');
const context = github.context;

async function release(tagName) {
  try {
    const myToken = core.getInput('token');

    const octokit = github.getOctokit(myToken)

    // Get owner and repo from context of payload that triggered the action
    const { owner: currentOwner, repo: currentRepo } = context.repo;

    const commitish = core.getInput('commitish', { required: false }) || context.sha;

    const owner = core.getInput('owner', { required: false }) || currentOwner;
    const repo = core.getInput('repo', { required: false }) || currentRepo;

    // get the latest release's sha value
    const { data: releases } = await octokit.rest.repos.listReleases({
      owner,
      repo
    });

    if (releases.length > 0) {
      // Assuming releases are sorted by date, get the latest release
      const latestRelease = releases[0];
      const latestReleaseSha = latestRelease.target_commitish;
      const headCommitSha = execSync('git rev-parse HEAD').toString().trim();

      // Compare latest release SHA with the current commitish to fetch commits
      const { data: commits } = await octokit.rest.repos.compareCommits({
        owner,
        repo,
        base: latestReleaseSha,
        head: headCommitSha
      });

      // List all commits in the comparison
      const commitList = await Promise.all(
        commits.commits.map(async commit => {
          const sha = commit.sha;
          const message = commit.commit.message;
          const author = commit.author.login;
          const date = commit.commit.author.date;

          // Get tags associated with the commit
          const { data: tags } = await octokit.rest.repos.listTags({
            owner,
            repo,
          });

          const commitTags = tags.filter(tag => tag.commit.sha === sha).map(tag => tag.name);

          return {
            sha,
            message,
            author,
            date,
            tags: commitTags,
          };
        })
      );

      // reverse sort
      commitList.sort((a, b) => (a.date < b.date ? 1 : -1));

      // Create a release body with commit messages and tags
      const releaseBody = commitList
        .map(commit => {
          const formattedTags = commit.tags.length > 0 ? `${commit.tags.join(', ')}` : '';
          const commitCaption = commit.message.split('\n')[0];
          const commitBody = commit.message
            .split('\n')
            .slice(1)
            .join('\n');
          const commitDate = commit.date.split('T')[0];
          const commitAuthor = commit.author;
          return `## ${formattedTags} ~ ${commit.sha} by ${commitAuthor} on ${commitDate}\n### ${commitCaption}\n${commitBody}`;
        })
        .join('\n');

      const createReleaseResponse = await octokit.rest.repos.createRelease({
        owner,
        repo,
        tag_name: tagName,
        name: 'Release ' + tagName,
        body: releaseBody,
        draft: false,
        prerelease: false,
        target_commitish: commitish
      });

      const {
        data: { id: releaseId, html_url: htmlUrl, upload_url: uploadUrl, tag_name: tag }
      } = createReleaseResponse;

      console.log("Tag: ", tag);
      console.log("Release ID: ", releaseId);
      console.log("HTML URL: ", htmlUrl);
      console.log("Upload URL: ", uploadUrl);

      if (createReleaseResponse.status !== 201) {
        core.setFailed(
          `Failed to create the release: ${createReleaseResponse.status} ${createReleaseResponse.statusText}`
        );
      } else {
        core.setOutput('id', releaseId);
        core.setOutput('html_url', htmlUrl);
        core.setOutput('upload_url', uploadUrl);
      }
    } else {
      // no release, create one
      const headCommitSha = execSync('git rev-parse HEAD').toString().trim();
      const initialCommitSha = execSync('git rev-list --max-parents=0 HEAD').toString().trim();

      // Compare latest release SHA with the current commitish to fetch commits
      const { data: commits } = await octokit.rest.repos.compareCommits({
        owner,
        repo,
        base: initialCommitSha,
        head: headCommitSha
      });

      // List all commits in the comparison
      const commitList = await Promise.all(
        commits.commits.map(async commit => {
          const sha = commit.sha;
          const message = commit.commit.message;
          const author = commit.author.login;
          const date = commit.commit.author.date;

          // Get tags associated with the commit
          const { data: tags } = await octokit.rest.repos.listTags({
            owner,
            repo,
          });

          const commitTags = tags.filter(tag => tag.commit.sha === sha).map(tag => tag.name);

          return {
            sha,
            message,
            author,
            date,
            tags: commitTags,
          };
        })
      );

      // reverse sort
      commitList.sort((a, b) => (a.date < b.date ? 1 : -1));

      // Create a release body with commit messages and tags
      const releaseBody = commitList
        .map(commit => {
          const formattedTags = commit.tags.length > 0 ? `${commit.tags.join(', ')}` : '';
          const commitCaption = commit.message.split('\n')[0];
          const commitBody = commit.message
            .split('\n')
            .slice(1)
            .join('\n');
          const commitDate = commit.date.split('T')[0];
          const commitAuthor = commit.author;
          return `## ${formattedTags} ~ ${commit.sha} by ${commitAuthor} on ${commitDate}\n### ${commitCaption}\n${commitBody}`;
        })
        .join('\n');

      const createReleaseResponse = await octokit.rest.repos.createRelease({
        owner,
        repo,
        tag_name: tagName,
        name: 'Release ' + tagName,
        body: releaseBody,
        draft: false,
        prerelease: false,
        target_commitish: commitish
      });

      const {
        data: { id: releaseId, html_url: htmlUrl, upload_url: uploadUrl, tag_name: tag }
      } = createReleaseResponse;

      console.log("Tag: ", tag);
      console.log("Release ID: ", releaseId);
      console.log("HTML URL: ", htmlUrl);
      console.log("Upload URL: ", uploadUrl);

      if (createReleaseResponse.status !== 201) {
        core.setFailed(
          `Failed to create the release: ${createReleaseResponse.status} ${createReleaseResponse.statusText}`
        );
      } else {
        core.setOutput('id', releaseId);
        core.setOutput('html_url', htmlUrl);
        core.setOutput('upload_url', uploadUrl);
      }
      console.error('No release found, created one');
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

module.exports = release;