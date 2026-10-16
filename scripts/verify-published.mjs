// Fails unless every public workspace package's version is visible on npm.
// `changeset publish` reports success for a staged publish (npm staged
// publishing), which leaves the version invisible until a maintainer approves
// it with 2FA. The workspace list comes from the root package.json, and the
// registry is polled to ride out CDN lag.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ATTEMPTS = Number(process.env.VERIFY_ATTEMPTS ?? 10);
const DELAY_MS = Number(process.env.VERIFY_DELAY_MS ?? 30000);

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
const packages = readJson('package.json')
  .workspaces.map((dir) => readJson(join(dir, 'package.json')))
  .filter((pkg) => !pkg.private);

const visible = ({ name, version }) => {
  try {
    const out = execFileSync('npm', ['view', `${name}@${version}`, 'version', '--json'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      // npm is npm.cmd on Windows, which only runs through a shell.
      shell: process.platform === 'win32',
    });
    return JSON.parse(out) === version;
  } catch {
    return false;
  }
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let missing = packages;
for (let attempt = 1; attempt <= ATTEMPTS && missing.length > 0; attempt++) {
  if (attempt > 1) await sleep(DELAY_MS);
  missing = missing.filter((pkg) => !visible(pkg));
  console.log(`attempt ${attempt}: ${packages.length - missing.length}/${packages.length} visible`);
}

for (const { name, version } of missing) {
  console.log(
    `::error title=Not on npm::${name}@${version} is not visible on npm. It may be staged: approve it in the npmjs.com Staged Packages tab.`
  );
}
process.exit(missing.length > 0 ? 1 : 0);
