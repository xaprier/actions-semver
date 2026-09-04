const core = require("@actions/core");
const util = require('util');
const child_process = require('child_process');

const exec = util.promisify(child_process.exec);

async function tag(lastCommitComment) {
  /** Get last Commit Comment */
  // Bracketed-tag match, not a bare word/substring check - see the identical
  // fix in src/main.js for why (a plain `.includes()`, or even a word-boundary
  // `\bminor\b`, false-triggers the moment "minor"/"major" appears anywhere in
  // a commit message's own ordinary prose, not as a deliberate signal).
  const minor = /\[minor\]/i.test(lastCommitComment);
  const major = /\[major\]/i.test(lastCommitComment);

  const validTag = /^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/;

  await exec('git fetch --all --tags');

  let { stdout } = await exec('git tag');
  // remove the v character if exists
  stdout = stdout.replace(/v/g, '');

  // find the maximum version
  const maxVersion = stdout
    .split(/[\v\n]+/g)
    .filter(it => it.match(validTag))
    .map(it => {
      const [majorv, minorv, patchv] = it.split('.');
      return Number(majorv) * 1000000 + Number(minorv) * 1000 + Number(patchv);
    })
    .reduce((max, current) => (current > max ? current : max), 0);

  let targetVersion = 0;
  if (major) {
    targetVersion = maxVersion + 1000000 - (maxVersion % 1000000);
  } else if (minor) {
    targetVersion = maxVersion + 1000 - (maxVersion % 1000);
  } else {
    targetVersion = maxVersion + 1;
  }

  const include_v = core.getInput('include-letter-v', { required: false })

  var targetTag = `${Math.floor(targetVersion / 1000000)}.${Math.floor(targetVersion / 1000) %
    1000}.${targetVersion % 1000}`;

  if (include_v && (include_v === true || include_v === 'true')) 
    targetTag = `v${targetTag}`;

  await exec(`git tag ${targetTag}`);

  await exec(`git push origin ${targetTag}`);

  await core.setOutput('New created tag: ', targetTag);

  return targetTag;
}

module.exports = tag;