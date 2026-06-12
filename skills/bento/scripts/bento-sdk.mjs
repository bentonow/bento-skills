#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const SDKS = {
  mcp: {
    label: 'Bento MCP',
    reference: 'references/mcp.md',
    credentials: ['BENTO_SITE_UUID', 'BENTO_PUBLISHABLE_KEY', 'BENTO_SECRET_KEY'],
    install: [
      'npx -y @bentonow/bento-mcp setup',
      'npx -y @bentonow/bento-mcp --help'
    ],
    verify: [
      'npx -y @bentonow/bento-mcp --help',
      'npx -y @bentonow/bento-mcp setup --print'
    ]
  },
  cli: {
    label: 'Bento CLI',
    reference: 'references/cli.md',
    credentials: ['BENTO_SITE_UUID', 'BENTO_PUBLISHABLE_KEY', 'BENTO_SECRET_KEY'],
    install: [
      'npx @bentonow/bento-cli --help',
      'npm install -g @bentonow/bento-cli',
      'bun install -g @bentonow/bento-cli'
    ],
    verify: [
      'npx @bentonow/bento-cli --help',
      'bento auth status',
      'bento stats site --json'
    ]
  },
  node: {
    label: 'Bento Node SDK',
    reference: 'references/node.md',
    credentials: ['BENTO_SITE_UUID', 'BENTO_PUBLISHABLE_KEY', 'BENTO_SECRET_KEY'],
    install: ['npm install @bentonow/bento-node-sdk --save', 'bun add @bentonow/bento-node-sdk'],
    verify: ['bun test', 'npm test', 'npm run build']
  },
  laravel: {
    label: 'Bento Laravel SDK',
    reference: 'references/laravel.md',
    credentials: ['BENTO_SITE_UUID', 'BENTO_PUBLISHABLE_KEY', 'BENTO_SECRET_KEY'],
    install: ['composer require bentonow/bento-laravel-sdk', 'php artisan bento:install'],
    verify: ['php artisan bento:test', 'php artisan bento:validate', './vendor/bin/pest']
  },
  php: {
    label: 'Bento PHP SDK',
    reference: 'references/php.md',
    credentials: ['BENTO_SITE_UUID', 'BENTO_PUBLISHABLE_KEY', 'BENTO_SECRET_KEY'],
    install: ['composer require bentonow/bento-php-sdk'],
    verify: ['composer test', 'composer run-script test']
  },
  drupal: {
    label: 'Bento Drupal SDK',
    reference: 'references/drupal.md',
    credentials: ['BENTO_SITE_UUID', 'BENTO_PUBLISHABLE_KEY', 'BENTO_SECRET_KEY'],
    install: [
      'composer config repositories.bento-drupal-sdk vcs https://github.com/bentonow/bento-drupal-sdk',
      'composer require drupal/bento_sdk:dev-main',
      'drush en bento_sdk'
    ],
    verify: ['drush pm:list --status=enabled | grep bento_sdk', 'drush cron', 'php test_autoload.php']
  },
  go: {
    label: 'Bento Go SDK',
    reference: 'references/go.md',
    credentials: ['BENTO_SITE_UUID', 'BENTO_PUBLISHABLE_KEY', 'BENTO_SECRET_KEY'],
    install: ['go get github.com/bentonow/bento-golang-sdk'],
    verify: ['go test ./...', 'go test -race ./...']
  },
  dotnet: {
    label: 'Bento .NET SDK',
    reference: 'references/dotnet.md',
    credentials: ['BENTO_SITE_UUID', 'BENTO_PUBLISHABLE_KEY', 'BENTO_SECRET_KEY'],
    install: ['dotnet add package Bento.SDK'],
    verify: ['dotnet restore', 'dotnet build', 'dotnet test']
  },
  elixir: {
    label: 'Bento Elixir SDK',
    reference: 'references/elixir.md',
    credentials: ['BENTO_SITE_UUID', 'BENTO_USERNAME', 'BENTO_PASSWORD'],
    install: ['Add {:bento_sdk, "~> 0.1.1"} to deps in mix.exs', 'mix deps.get'],
    verify: ['mix test', 'mix format --check-formatted']
  },
  python: {
    label: 'Bento Python SDK',
    reference: 'references/python.md',
    credentials: ['BENTO_SITE_UUID', 'BENTO_PUBLISHABLE_KEY', 'BENTO_SECRET_KEY'],
    install: ['pip install git+https://github.com/bentonow/bento-python-sdk.git'],
    verify: ['python -c "from bento_api import BentoAPI; print(BentoAPI.__name__)"', 'python -m pytest']
  },
  ruby: {
    label: 'Bento Ruby SDK',
    reference: 'references/ruby.md',
    credentials: ['BENTO_SITE_UUID', 'BENTO_PUBLISHABLE_KEY', 'BENTO_SECRET_KEY'],
    install: ['Add gem "bento-sdk", github: "bentonow/bento-ruby-sdk", branch: "master" to Gemfile', 'bundle install'],
    verify: ['bundle exec rake', 'bundle exec rspec']
  },
  n8n: {
    label: 'Bento n8n Community Node',
    reference: 'references/n8n.md',
    credentials: ['Bento API credential in n8n: Publishable Key, Secret Key, Site UUID'],
    install: ['cd ~/.n8n', 'npm install n8n-nodes-bento', 'n8n start'],
    verify: ['npm list n8n-nodes-bento', 'Create Bento credential in n8n and click Test']
  }
};

const IGNORE_DIRS = new Set(['.git', 'node_modules', 'vendor', 'dist', 'build', '_build', 'deps', '.next', 'coverage']);

function usage(exitCode = 0) {
  const keys = Object.keys(SDKS).join('|');
  console.log(`Usage:
  bento-sdk.mjs list
  bento-sdk.mjs install <${keys}>
  bento-sdk.mjs detect [path]
  bento-sdk.mjs doctor [path]`);
  process.exit(exitCode);
}

function readText(file) {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch {
    return '';
  }
}

function readJson(file) {
  try {
    return JSON.parse(readText(file));
  } catch {
    return null;
  }
}

function walk(root, limit = 600) {
  const files = [];
  const stack = [root];
  while (stack.length && files.length < limit) {
    const current = stack.pop();
    let entries = [];
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (!IGNORE_DIRS.has(entry.name)) stack.push(full);
      } else if (entry.isFile()) {
        files.push(full);
      }
    }
  }
  return files;
}

function jsonHasPackage(json, name) {
  if (!json || typeof json !== 'object') return false;
  const buckets = ['dependencies', 'devDependencies', 'peerDependencies', 'require', 'require-dev'];
  return json.name === name || buckets.some((key) => json[key] && Object.hasOwn(json[key], name));
}

function scoreProject(root) {
  const files = walk(root);
  const byBase = new Map(files.map((file) => [path.relative(root, file).replaceAll(path.sep, '/'), file]));
  const packageJson = readJson(byBase.get('package.json') || '');
  const composerJson = readJson(byBase.get('composer.json') || '');
  const goMod = readText(byBase.get('go.mod') || '');
  const mixExs = readText(byBase.get('mix.exs') || '');
  const gemfile = readText(byBase.get('Gemfile') || '');
  const pyproject = readText(byBase.get('pyproject.toml') || '');
  const setupPy = readText(byBase.get('setup.py') || '');
  const allText = files
    .filter((file) => /\.(csproj|cs|ts|js|php|exs?|go|rb|py|yml|yaml|json|toml)$/.test(file))
    .slice(0, 120)
    .map(readText)
    .join('\n');
  const scores = Object.fromEntries(Object.keys(SDKS).map((key) => [key, 0]));

  if (packageJson?.name === '@bentonow/bento-cli' || packageJson?.bin?.bento) scores.cli += 10;
  if (allText.includes('@bentonow/bento-cli')) scores.cli += 4;

  if (packageJson?.name === '@bentonow/bento-mcp' || jsonHasPackage(packageJson, '@bentonow/bento-mcp')) scores.mcp += 10;
  if (allText.includes('@bentonow/bento-mcp') || allText.includes('bento-mcp')) scores.mcp += 4;

  if (jsonHasPackage(packageJson, '@bentonow/bento-node-sdk') || allText.includes('@bentonow/bento-node-sdk')) scores.node += 8;
  if (allText.includes('new Analytics(') && allText.includes('siteUuid')) scores.node += 3;

  if (packageJson?.name === 'n8n-nodes-bento' || packageJson?.n8n || jsonHasPackage(packageJson, 'n8n-nodes-bento')) scores.n8n += 10;
  if (allText.includes('BentoApi.credentials') || allText.includes('Bento.node')) scores.n8n += 4;

  if (jsonHasPackage(composerJson, 'bentonow/bento-laravel-sdk') || allText.includes('Bentonow\\BentoLaravel')) scores.laravel += 10;
  if (allText.includes('php artisan bento:') || allText.includes('Bento::importSubscribers')) scores.laravel += 3;

  if (jsonHasPackage(composerJson, 'bentonow/bento-php-sdk') || allText.includes('bentonow\\Bento\\BentoAnalytics')) scores.php += 9;
  if (allText.includes('V1->Batch') || allText.includes('new BentoAnalytics')) scores.php += 3;

  if (composerJson?.type === 'drupal-module' || jsonHasPackage(composerJson, 'drupal/bento_sdk')) scores.drupal += 8;
  if (byBase.has('bento_sdk.info.yml') || byBase.has('bento_sdk.module') || allText.includes("Drupal::service('bento.sdk')")) scores.drupal += 8;

  if (goMod.includes('github.com/bentonow/bento-golang-sdk') || allText.includes('github.com/bentonow/bento-golang-sdk')) scores.go += 10;
  if (allText.includes('bento.NewClient') || allText.includes('bento.Config')) scores.go += 3;

  if (allText.includes('PackageReference Include="Bento.SDK"') || allText.includes('using Bento.Extensions')) scores.dotnet += 10;
  if (allText.includes('AddBentoClient') || allText.includes('IBentoSubscriberService')) scores.dotnet += 4;

  if (mixExs.includes(':bento_sdk') || allText.includes('BentoSdk.')) scores.elixir += 10;
  if (allText.includes('config :bento_sdk')) scores.elixir += 3;

  if (pyproject.includes('bento-api') || setupPy.includes('bento-api') || allText.includes('from bento_api import BentoAPI')) scores.python += 10;
  if (allText.includes('batch_create_subscribers')) scores.python += 3;

  if (gemfile.includes('bento-sdk') || allText.includes('Bento::Subscribers') || allText.includes('require "bento-sdk"')) scores.ruby += 10;
  if (allText.includes('Bento.configure')) scores.ruby += 3;

  return Object.entries(scores)
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([key, score]) => ({ key, score, ...SDKS[key] }));
}

function printList() {
  for (const [key, sdk] of Object.entries(SDKS)) {
    console.log(`${key.padEnd(8)} ${sdk.label} -> ${sdk.reference}`);
  }
}

function printInstall(key) {
  const sdk = SDKS[key];
  if (!sdk) {
    console.error(`Unknown SDK: ${key}`);
    usage(1);
  }
  console.log(`# ${sdk.label}`);
  console.log(`# Reference: ${sdk.reference}`);
  for (const command of sdk.install) console.log(command);
}

function printDetect(root) {
  const matches = scoreProject(path.resolve(root));
  if (!matches.length) {
    console.log('No Bento SDK detected.');
    console.log('Run `node skills/bento/scripts/bento-sdk.mjs list` to see supported SDK keys.');
    return;
  }
  for (const match of matches) {
    console.log(`${match.key}\t(score ${match.score})\t${match.label}\t${match.reference}`);
  }
}

function printDoctor(root) {
  const target = path.resolve(root);
  const matches = scoreProject(target);
  console.log(`Project: ${target}`);
  if (!matches.length) {
    console.log('No Bento SDK detected. Choose an SDK with `list`, then print install steps with `install <sdk>`.');
    return;
  }
  const primary = matches[0];
  console.log(`Likely SDK: ${primary.key} (${primary.label})`);
  console.log(`Load: ${primary.reference}`);
  console.log('Credentials:');
  for (const credential of primary.credentials) console.log(`- ${credential}`);
  console.log('Install/setup if missing:');
  for (const command of primary.install) console.log(`- ${command}`);
  console.log('Verify:');
  for (const command of primary.verify) console.log(`- ${command}`);
  if (matches.length > 1) {
    console.log('Other possible matches:');
    for (const match of matches.slice(1, 5)) console.log(`- ${match.key} (${match.label}, score ${match.score})`);
  }
}

const [command, arg] = process.argv.slice(2);
if (!command || command === '--help' || command === '-h') usage(0);
if (command === 'list') printList();
else if (command === 'install') printInstall(arg);
else if (command === 'detect') printDetect(arg || '.');
else if (command === 'doctor') printDoctor(arg || '.');
else usage(1);
