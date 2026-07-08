#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const skillDir = path.join(root, 'skills/bento');
const skillFile = path.join(skillDir, 'SKILL.md');
const helper = path.join(skillDir, 'scripts/bento-sdk.mjs');
const referencesDir = path.join(skillDir, 'references');
const agentsFile = path.join(skillDir, 'agents/openai.yaml');
const sdkKeys = ['mcp', 'cli', 'node', 'laravel', 'php', 'drupal', 'go', 'dotnet', 'elixir', 'python', 'ruby', 'n8n'];

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

function readRequired(file) {
  const text = fs.readFileSync(file, 'utf8');
  assert.ok(text.trim().length > 0, `${path.relative(root, file)} must not be empty`);
  return text;
}

function assertNoPlaceholder(file, text) {
  assert.doesNotMatch(text, /\b(?:TODO|FIXME|TBD|coming soon|placeholder)\b/i, `${path.relative(root, file)} contains placeholder copy`);
}

function assertLocalMarkdownLinks(file, text) {
  const links = [...text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)].map((match) => match[1]);
  for (const link of links) {
    if (/^(?:https?:|mailto:|#)/.test(link)) continue;
    const cleanLink = link.split('#')[0];
    if (!cleanLink) continue;
    const target = path.resolve(path.dirname(file), cleanLink);
    assert.ok(fs.existsSync(target), `broken local link in ${path.relative(root, file)}: ${link}`);
  }
}

const skill = fs.readFileSync(skillFile, 'utf8');
assert.match(skill, /^---\nname: bento\n/m);
assert.match(skill, /^description: .+Bento/m);
assertNoPlaceholder(skillFile, skill);

const refs = [...skill.matchAll(/`references\/([^`]+\.md)`/g)].map((match) => match[1]);
for (const ref of refs) {
  assert.ok(fs.existsSync(path.join(referencesDir, ref)), `missing reference ${ref}`);
}
for (const key of sdkKeys) {
  assert.ok(refs.includes(`${key}.md`), `SKILL.md must link references/${key}.md`);
}

const packageJson = JSON.parse(readRequired(path.join(root, 'package.json')));
assert.equal(packageJson.license, 'MIT');
assert.ok(packageJson.files?.includes('skills'), 'package.json files must include skills');
assert.ok(fs.existsSync(path.join(root, 'LICENSE')), 'LICENSE file is required');

const agentYaml = readRequired(agentsFile);
assert.match(agentYaml, /display_name:\s*".*Bento.*"/);
assert.match(agentYaml, /short_description:\s*".+"/);
assert.match(agentYaml, /default_prompt:\s*".*Bento.*"/);
assertNoPlaceholder(agentsFile, agentYaml);

const markdownFiles = [
  path.join(root, 'README.md'),
  skillFile,
  ...fs.readdirSync(referencesDir)
    .filter((file) => file.endsWith('.md'))
    .map((file) => path.join(referencesDir, file))
];
for (const file of markdownFiles) {
  const text = readRequired(file);
  assertNoPlaceholder(file, text);
  assertLocalMarkdownLinks(file, text);
}

const cliReference = readRequired(path.join(referencesDir, 'cli.md'));
const unsupportedCliExamples = [
  /bento\s+events\s+import\b/,
  /bento\s+events\s+purchase\b/,
  /bento\s+subscribers\s+upsert\b/,
  /bento\s+subscribers\s+field\s+update\b/,
  /bento\s+subscribers\s+field\s+set\b/
];
const cliWithoutNegatedExamples = cliReference
  .split('\n')
  .filter((line) => !/\bno\b.*subscribers upsert|subscribers upsert.*\bnot\b|has no per-subscriber upsert/i.test(line))
  .join('\n');
for (const pattern of unsupportedCliExamples) {
  assert.doesNotMatch(cliWithoutNegatedExamples, pattern, `cli.md documents unsupported CLI example: ${pattern}`);
}

const staleApiStrings = [
  { pattern: /blacklist\.json/i, label: 'blacklist.json path' },
  { pattern: /\bsubscribers upsert\b/i, label: 'subscribers upsert command' },
  { pattern: /sequence_abc123/i, label: 'sequence_abc123 placeholder id' },
  { pattern: /DELETE\s+\/fetch\/tags(?!\/:id)(?:[`'"\s]|$)/i, label: 'DELETE /fetch/tags without :id' }
];

for (const file of markdownFiles) {
  const text = fs.readFileSync(file, 'utf8');
  for (const { pattern, label } of staleApiStrings) {
    const lines = text.split('\n').filter((line) => pattern.test(line));
    const badLines = lines.filter((line) => !/\bnot\b|do not use|no `/i.test(line));
    assert.equal(badLines.length, 0, `${path.relative(root, file)} contains stale API string: ${label}`);
  }
  if (/blacklist/i.test(text) && /\bip_address\b/i.test(text)) {
    const badLines = text.split('\n').filter(
      (line) => /blacklist/i.test(line)
        && /\bip_address\b/i.test(line)
        && !/\bnot\b.*ip_address|ip_address.*\bnot\b|do not use/i.test(line)
    );
    assert.equal(badLines.length, 0, `${path.relative(root, file)} uses ip_address in blacklist context; use ip`);
  }
}

const list = run(['list']);
for (const key of sdkKeys) assert.match(list, new RegExp(`^${key}\\s`, 'm'));

for (const key of sdkKeys) {
  const output = run(['install', key]);
  assert.match(output, new RegExp(`# .*Bento`, 'i'));
}

const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'bento-skill-fixtures-'));
const fixtures = {
  mcp: { 'package.json': '{"dependencies":{"@bentonow/bento-mcp":"^1.0.0"}}' },
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
  const doctor = run(['doctor', dir]);
  assert.match(doctor, new RegExp(`Likely SDK: ${key} `), `doctor failed for ${key}: ${doctor}`);
  assert.match(doctor, new RegExp(`Load: references/${key}\\.md`), `doctor missing reference for ${key}: ${doctor}`);
  assert.match(doctor, /Credentials:\n- /, `doctor missing credentials for ${key}: ${doctor}`);
  assert.match(doctor, /Verify:\n- /, `doctor missing verification for ${key}: ${doctor}`);
}

console.log('Bento skill validation passed.');
