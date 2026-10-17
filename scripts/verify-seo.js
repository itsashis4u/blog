#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const metadata = require("../_data/metadata.json");
const canonicalRoot = new URL(metadata.url).href;
const siteDir = path.join(__dirname, "..", "_site");
const sitemapPath = path.join(siteDir, "sitemap.xml");
const redirectsPath = path.join(siteDir, "_redirects");
const robotsPath = path.join(siteDir, "robots.txt");

function assertFile(filePath, label) {
  assert.ok(fs.existsSync(filePath), `${label} is missing: ${filePath}`);
  assert.ok(fs.statSync(filePath).isFile(), `${label} must be a file, not a directory`);
}

assertFile(sitemapPath, "sitemap.xml");
assert.ok(!fs.existsSync(path.join(siteDir, "sitemap", "index.xml")), "do not emit a duplicate sitemap/index.xml file");
assertFile(redirectsPath, "_redirects");
const redirects = fs.readFileSync(redirectsPath, "utf8");
assert.ok(
  /\/sitemap\/index\.xml\s+\/sitemap\.xml\s+200/.test(redirects),
  "_redirects must preserve the legacy sitemap/index.xml URL"
);
assert.ok(
  /^\/sitemap\/index\.xml\/\s+\/sitemap\.xml\s+200$/m.test(redirects),
  "_redirects must preserve the trailing-slash legacy sitemap URL"
);
assertFile(path.join(siteDir, "about", "index.html"), "About page");
assert.ok(
  !/^\/about\/?\s+\/\s+\d{3}!?\s*$/m.test(redirects),
  "the About page must not redirect to the homepage"
);
const sitemap = fs.readFileSync(sitemapPath, "utf8");
assert.ok(sitemap.startsWith("<?xml"), "sitemap must start with an XML declaration");
assert.ok(sitemap.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'), "sitemap must contain a urlset");
assert.ok(sitemap.includes("</urlset>"), "sitemap must close urlset");
assert.ok(sitemap.includes(`<loc>${canonicalRoot}</loc>`), "sitemap must include the canonical site homepage");
assert.ok(!sitemap.includes("<loc></loc>"), "sitemap must not contain empty loc entries");

assertFile(robotsPath, "robots.txt");
const robots = fs.readFileSync(robotsPath, "utf8");
assert.ok(/User-agent:\s*\*/i.test(robots), "robots.txt must allow a wildcard user-agent");
assert.ok(/Allow:\s*\//i.test(robots), "robots.txt must allow crawling");
assert.ok(
  robots.includes(`Sitemap: ${new URL("sitemap.xml", canonicalRoot).href}`),
  "robots.txt must point to the canonical sitemap.xml URL"
);

console.log("SEO artifacts OK: sitemap.xml, _redirects, robots.txt");
