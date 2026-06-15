const { execSync } = require('child_process');
const readline = require('readline');

function run(cmd) {
  try {
    return execSync(cmd, { cwd: __dirname + '/..', encoding: 'utf8' }).trim();
  } catch (e) {
    console.error('Error:', e.stderr?.trim() || e.message);
    process.exit(1);
  }
}

function hasChanges() {
  const status = run('git status --porcelain');
  return status.length > 0;
}

async function askCommitMessage() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question('Commit message: ', (answer) => {
      rl.close();
      resolve(answer.trim() || 'Auto-sync');
    });
  });
}

async function main() {
  let stashed = false;
  if (hasChanges()) {
    console.log('Stashing local changes...');
    run('git stash --include-untracked');
    stashed = true;
  }

  console.log('Pulling latest changes...');
  run('git pull --rebase');

  if (stashed) {
    console.log('Restoring local changes...');
    run('git stash pop');
  }

  if (!hasChanges()) {
    console.log('No local changes. Already up to date.');
    return;
  }

  console.log('Local changes detected.\n');
  const status = run('git status --short');
  console.log(status + '\n');

  const commitMsg = process.argv[2] || await askCommitMessage();
  console.log(`\nCommit message: "${commitMsg}"`);

  run('git add -A');
  run(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`);
  run('git push');

  console.log('\nDone! Changes pushed successfully.');
}

main();
