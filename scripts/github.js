const { execSync } = require('child_process');
const readline = require('readline');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function run(cmd, ignoreError) {
  try {
    return execSync(cmd, { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch (e) {
    if (ignoreError) return '';
    console.error('Error:', e.stderr?.trim() || e.message);
    process.exit(1);
  }
}

function hasRemote() {
  const remotes = run('git remote', true);
  return remotes.length > 0;
}

function hasChanges() {
  const status = run('git status --porcelain', true);
  return status.length > 0;
}

function getCurrentBranch() {
  return run('git rev-parse --abbrev-ref HEAD', true) || 'main';
}

async function askCommitMessage() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question('Commit message: ', (answer) => {
      rl.close();
      resolve(answer.trim() || 'Auto-sync');
    });
  });
}

async function main() {
  if (!hasRemote()) {
    console.log('No Git remote found. Use this instead:\n');
    console.log('  1. Create a repo on GitHub');
    console.log('  2. Run:\n');
    console.log(`     git remote add origin <url>`);
    console.log(`     git push -u origin ${getCurrentBranch()}\n`);
    console.log('Or use `gh repo create` to create one from CLI.\n');
    return;
  }

  let stashed = false;
  try {
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
      stashed = false;
    }

    if (!hasChanges()) {
      console.log('No local changes. Already up to date.');
      return;
    }

    console.log('Local changes detected.\n');
    const status = run('git status --short');
    console.log(status + '\n');

    const commitMsg = process.argv[2] || (await askCommitMessage());
    console.log(`\nCommit message: "${commitMsg}"`);

    run('git add -A');
    run(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`);
    run('git push');

    console.log('\nDone! Changes pushed successfully.');
  } catch (e) {
    if (stashed) {
      console.log('\nRestoring stashed changes after error...');
      run('git stash pop', true);
    }
    console.error('\nFailed:', e.message);
    process.exit(1);
  }
}

main();
