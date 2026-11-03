#!/usr/bin/env node
// Regression check for the "multi-line asset not visible under a secondary
// brand" bug (reported by Marta, pbserum — "Veluria Logos" not showing under
// VELURIA Global after being tagged with it in addition to VELURIA).
//
// Root cause: GET /api/assets and GET /api/public/assets filtered by
// `a.brand_id = ?` only (the legacy single-brand column), ignoring the
// asset_brands junction table used for multi-line assignment. An asset whose
// PRIMARY brand differs from the line being filtered on would be wrongly
// excluded even though it's correctly tagged with that line.
//
// This script covers the admin panel endpoint (GET /api/assets), which takes
// a plain `userId` query param with no session token. It finds any asset
// with 2+ brand lines, picks a non-primary line, and asserts the asset is
// returned when filtering by that secondary line.
//
// The public portal endpoint (GET /api/public/assets) has the identical fix
// applied, but requires a real logged-in session (Bearer token) to exercise
// end-to-end — this script intentionally does not mint one. Verify that side
// either by logging in as a real user in the browser, or by comparing the
// old/new WHERE-clause row counts directly in D1, e.g.:
//
//   SELECT COUNT(*) FROM assets a WHERE a.brand_id = <lineId> AND a.id = <assetId>;              -- old (buggy)
//   SELECT COUNT(*) FROM assets a WHERE (a.brand_id = <lineId>
//     OR EXISTS (SELECT 1 FROM asset_brands ab WHERE ab.asset_id = a.id AND ab.brand_id = <lineId>))
//     AND a.id = <assetId>;                                                                      -- new (fixed)
//
// Usage: node scripts/regression-multi-brand-filter.mjs [baseUrl]
// Defaults to production. Exits non-zero on failure (CI-friendly).

const baseUrl = process.argv[2] || 'https://brandcenter.pbserum.com'
const ADMIN_USER_ID = process.env.REGRESSION_ADMIN_USER_ID || '1' // an admin user, sees all brands/regions

async function getJSON(path) {
  const res = await fetch(`${baseUrl}${path}`)
  if (!res.ok) throw new Error(`${path} -> HTTP ${res.status}`)
  return res.json()
}

async function findMultiLineAsset() {
  // Pull a broad admin listing and find the first asset with >1 brand_ids.
  // (No search filter = full result set, capped at 200 per the API.)
  const data = await getJSON(`/api/assets?userId=${ADMIN_USER_ID}`)
  const assets = data.assets || []
  const candidate = assets.find(a => Array.isArray(a.brand_ids) && a.brand_ids.length >= 2)
  if (!candidate) {
    throw new Error('No multi-line asset found to test against — cannot run regression check')
  }
  return candidate
}

async function main() {
  console.log(`Target: ${baseUrl}`)
  const asset = await findMultiLineAsset()
  const secondaryBrandId = asset.brand_ids.find(id => id !== asset.brand_id)
  console.log(`Using asset #${asset.id} "${asset.title}" — primary brand ${asset.brand_id}, secondary brand ${secondaryBrandId}`)

  // Admin panel: filtering /api/assets by the secondary line must include it.
  const panelResult = await getJSON(`/api/assets?brand_id=${secondaryBrandId}&userId=${ADMIN_USER_ID}`)
  const inPanel = (panelResult.assets || []).some(a => a.id === asset.id)
  console.log(`[panel] GET /api/assets?brand_id=${secondaryBrandId} includes asset #${asset.id}: ${inPanel}`)

  if (!inPanel) {
    console.error('\n❌ REGRESSION: a multi-line asset is missing from the admin panel\'s secondary-line filter.')
    process.exit(1)
  }
  console.log('\n✅ Multi-line asset correctly appears under its secondary line in the admin panel.')
  console.log('   (Portal side shares the identical fix — see the header comment for how to verify it.)')
}

main().catch(err => {
  console.error('Regression check errored:', err.message)
  process.exit(1)
})
