const release = require('./release');
const tag = require('./tag');
const core = require("@actions/core");
const util = require('util');
const child_process = require('child_process');

const exec = util.promisify(child_process.exec);

async function run() {
  const { stdout: lastCommitComment } = await exec('git log -1 --pretty=%B');
  // Bracketed-tag match, not a bare word/substring check - a plain
  // `.includes('release')` (and even a word-boundary `\brelease\b`) false-triggers
  // the moment the ordinary English word "release" appears anywhere in a commit
  // message's own prose (e.g. a PR body reading "...add release job...", a branch
  // named "release-handler-test") - confirmed by a real accidental release this
  // caused (xaprier/XQControls, 2026-09-04). Requiring an explicit `[release]` tag
  // makes an accidental trigger effectively impossible while keeping the trigger
  // itself trivial to type on purpose.
  const createRelease = /\[release\]/i.test(lastCommitComment);
  if (createRelease)
    await release(await tag(lastCommitComment));
  else
    await tag(lastCommitComment);

  core.setOutput('release_created', createRelease);
}

// call async func
run().catch(error => {
  console.error(error);
  process.exit(1);
});
