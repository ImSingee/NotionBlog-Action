import core = require('@actions/core');
import exec = require('@actions/exec');
import { getNotionBlog } from './installer';

async function run(): Promise<void> {
  try {
    const version = core.getInput('version') || 'latest';
    const args = core.getInput('args', { required: true });
    const workdir = core.getInput('workdir') || '.';

    const nb = await getNotionBlog(version);

    if (workdir && workdir !== '.') {
      core.info(`📂 Using ${workdir} as working directory...`);
      process.chdir(workdir);
    }

    core.info('🏃 Running NotionBlog...');
    await exec.exec(`${nb} ${args}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();