#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const skillDir = path.join(root, 'skills/bento');
const skillFile = path.join(skillDir, 'SKILL.md');
const helper = path.join(skillDir, 'scripts/bento-sdk.mjs');
const sdkKeys = ['cli', 'node', 'laravel', 'php', 'drupal', 'go', 'dotnet', 'elixir', 'python', 'ruby', 'n8n'];

function run(args, options = {}) {
  const result = spawnSync(process.execPath, [helper, ...args], {
    cwd: root,
    encoding: 'utf8',
    ...options
  });
  if (result.status !== 0) {
    throw new Error(`Command failed: ${args.join(' ')}\n${result.stderr}\n${result.stdout}`);
  }
  return result.stdout;
}

function writeFixture(dir, files) {
  for (const [relative, content] of Object.entries(files)) {
    const file = path.join(dir, relative);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
  }
}

const skill = fs.readFileSync(skillFile, 'utf8');
assert.match(skill, /^---\nname: bento\n/m);
assert.match(skill, /^description: .+Bento/m);
assert.doesNotMatch(skill, /\[TODO/);

const refs = [...skill.matchAll(/`references\/([^`]+\.md)`/g)].map((match) => match[1]);
for (const ref of refs) {
  assert.ok(fs.existsSync(path.join(skillDir, 'references', ref)), `missing reference ${ref}`);
}
for (const key of sdkKeys) {
  assert.ok(refs.includes(`${key}.md`), `SKILL.md must link references/${key}.md`);
}

const list = run(['list']);
for (const key of sdkKeys) assert.match(list, new RegExp(`^${key}\\s`, 'm'));

for (const key of sdkKeys) {
  const output = run(['install', key]);
  assert.match(output, new RegExp(`# .*Bento`, 'i'));
}

const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'bento-skill-fixtures-'));
const fixtures = {
  cli: { 'package.json': '{"name":"@bentonow/bento-cli","bin":{"bento":"./bin/bento"}}' },
  node: { 'package.json': '{"dependencies":{"@bentonow/bento-node-sdk":"^1.0.0"}}' },
  laravel: { 'composer.json': '{"require":{"bentonow/bento-laravel-sdk":"^1.0"}}' },
  php: { 'composer.json': '{"require":{"bentonow/bento-php-sdk":"^1.0"}}' },
  drupal: { 'bento_sdk.info.yml': 'name: Bento SDK\n', 'composer.json': '{"type":"drupal-module"}' },
  go: { 'go.mod': 'module example.com/app\nrequire github.com/bentonow/bento-golang-sdk v0.0.0\n' },
  dotnet: { 'App.csproj': '<Project><ItemGroup><PackageReference Include="Bento.SDK" Version="1.0.1"/></ItemGroup></Project>' },
  elixir: { 'mix.exs': 'defp deps do\n  [{:bento_sdk, "~> 0.1.1"}]\nend\n' },
  python: { 'app.py': 'from bento_api import BentoAPI\n' },
  ruby: { 'Gemfile': 'gem "bento-sdk", github: "bentonow/bento-ruby-sdk", branch: "master"\n' },
  n8n: { 'package.json': '{"name":"n8n-nodes-bento","n8n":{"nodes":["dist/nodes/Bento/Bento.node.js"]}}' }
};

for (const [key, files] of Object.entries(fixtures)) {
  const dir = path.join(fixtureRoot, key);
  writeFixture(dir, files);
  const output = run(['detect', dir]);
  assert.match(output, new RegExp(`^${key}\\t`, 'm'), `detect failed for ${key}: ${output}`);
}

console.log('Bento skill validation passed.');
