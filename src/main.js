const release = require('./release');
const tag = require('./tag');
const core = require("@actions/core");
const util = require('util');
const child_process = require('child_process');

const exec = util.promisify(child_process.exec);

async function run() {
  const { stdout: lastCommitComment } = await exec('git log -1 --pretty=%B');
  const createRelease = lastCommitComment.toLocaleLowerCase().includes('release');
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
