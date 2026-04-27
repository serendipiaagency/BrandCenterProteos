#!/usr/bin/env node
// Downloads project config + static assets from Cloudflare Pages
// and generates wrangler.toml for the repository.

const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const PROJECT_NAME = 'brandcenter-pbserum';

function cfFetch(endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.cloudflare.com',
      path: `/client/v4${endpoint}`,
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    };
    let data = '';
    https.get(options, (res) => {
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`JSON parse error: ${data.slice(0, 200)}`)); }
      });
    }).on('error', reject);
  });
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
  console.log('  wrote', filePath);
}

async function main() {
  console.log(`\nFetching project: ${PROJECT_NAME}\n`);

  const { result: project } = await cfFetch(
    `/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}`
  );
  if (!project) throw new Error('Project not found — check CLOUDFLARE_ACCOUNT_ID and project name');

  console.log('Project domains:', project.domains?.join(', ') || '(none)');

  const { result: deployments } = await cfFetch(
    `/accounts/${ACCOUNT_ID}/pages/projects/${PROJECT_NAME}/deployments?per_page=1&sort_by=created_on&sort_order=desc&env=production`
  );
  const latest = Array.isArray(deployments) ? deployments[0] : null;
  const deploymentUrl = latest?.url;
  console.log('Latest deployment:', deploymentUrl || '(none found)');

  const buildConfig = project.build_config || {};
  const deployConfig = project.deployment_configs?.production || {};
  const d1 = deployConfig.d1_databases || {};
  const r2 = deployConfig.r2_buckets || {};
  const kvs = deployConfig.kv_namespaces || {};

  let toml = `name = "${PROJECT_NAME}"\npages_build_output_dir = "${buildConfig.destination_dir || 'dist'}"\ncompatibility_date = "${deployConfig.compatibility_date || new Date().toISOString().slice(0, 10)}"\n`;

  if (deployConfig.compatibility_flags?.length) {
    toml += `compatibility_flags = [${deployConfig.compatibility_flags.map((f) => `"${f}"`).join(', ')}]\n`;
  }

  for (const [binding, info] of Object.entries(d1)) {
    toml += `\n[[d1_databases]]\nbinding = "${binding}"\ndatabase_name = "${info.name || binding}"\ndatabase_id = "${info.id || ''}"\n`;
  }
  for (const [binding, info] of Object.entries(r2)) {
    toml += `\n[[r2_buckets]]\nbinding = "${binding}"\nbucket_name = "${info.name || binding}"\n`;
  }
  for (const [binding, info] of Object.entries(kvs)) {
    toml += `\n[[kv_namespaces]]\nbinding = "${binding}"\nid = "${info.namespace_id || ''}"\n`;
  }

  writeFile('wrangler.toml', toml);
  writeFile(
    '.cloudflare/project-snapshot.json',
    JSON.stringify({ name: project.name, domains: project.domains, deployment_configs: project.deployment_configs, build_config: project.build_config }, null, 2)
  );

  console.log('\nAttempting wrangler pages project download…');
  try {
    execSync(`wrangler pages project download ${PROJECT_NAME}`, { stdio: 'inherit', env: { ...process.env } });
    console.log('wrangler download succeeded.');
  } catch {
    console.log('wrangler pages download not available — skipping.');
  }

  if (deploymentUrl) {
    console.log(`\nMirroring static assets from ${deploymentUrl}…`);
    try {
      execSync(
        `wget --mirror --convert-links --no-host-directories --no-parent --reject="*.gz,*.br" --accept-regex ".*\\.(html|css|js|json|svg|png|jpg|jpeg|ico|woff|woff2|ttf)" -P public/ "${deploymentUrl}" 2>&1 | tail -5`,
        { stdio: 'inherit', shell: true }
      );
    } catch {
      console.log('wget mirror failed (site may require auth) — skipping.');
    }
  }

  console.log('\nDone. Check wrangler.toml and .cloudflare/project-snapshot.json');
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
