import os = require('os');
import path = require('path');
import util = require('util');
import core = require('@actions/core');
import tc = require('@actions/tool-cache');

import * as github from './github';

const osPlat: string = os.platform();
const osArch: string = os.arch();

export async function getNotionBlog(version: string): Promise<string> {
  const release: github.GitHubRelease | null = await github.getRelease(version);
  if (!release) {
    throw new Error(`Cannot find NotionBlog ${version} release`);
  }
  const versionWithoutV = version

  core.info(`✅ NotionBlog version found: ${release.tag_name}`);
  const filename = getFilename();
  const downloadUrl = util.format(
    'https://github.com/ImSingee/NotionBlog/releases/download/%s/%s',
    release.tag_name,
    filename,
  );

  core.info(`⬇️ Downloading ${downloadUrl}...`);
  const downloadPath: string = await tc.downloadTool(downloadUrl);
  core.debug(`Downloaded to ${downloadPath}`);

  core.info('📦 Extracting NotionBlog...');
  let extPath: string;
  if (osPlat == 'win32') {
    extPath = await tc.extractZip(downloadPath);
  } else {
    extPath = await tc.extractTar(downloadPath);
  }
  core.debug(`Extracted to ${extPath}`);

  const cachePath: string = await tc.cacheDir(extPath, 'notion-blog-action', release.tag_name.replace(/^v/, ''));
  core.debug(`Cached to ${cachePath}`);

  const exePath: string = path.join(cachePath, osPlat == 'win32' ? 'goreleaser.exe' : 'goreleaser');
  core.debug(`Exe path is ${exePath}`);

  return exePath;
}

const getFilename = (): string => {
  const platform: string = osPlat == 'win32' ? 'Windows' : osPlat == 'darwin' ? 'Darwin' : 'Linux';
  const arch: string = osArch == 'x64' ? 'x86_64' : 'i386';
  const ext: string = osPlat == 'win32' ? 'zip' : 'tar.gz';
  return util.format('NotionBlog_%s_%s.%s', platform, arch, ext);
};