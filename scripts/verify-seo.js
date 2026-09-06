#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const siteDir = path.join(__dirname, "..", "_site");
const sitemapPath = path.join(siteDir, "sitemap", "index.xml");
const redirectsPath = path.join(siteDir, "_redirects");
const robotsPath = path.join(siteDir, "robots.txt");

function assertFile(filePath, label) {
  assert.ok(fs.existsSync(filePath), `${label} is missing: ${filePath}`);
  assert.ok(fs.statSync(filePath).isFile(), `${label} must be a file, not a directory (Netlify 500s /sitemap.xml when it is a folder)`);
}

assertFile(sitemapPath, "sitemap/index.xml");
assert.ok(!fs.existsSync(path.join(siteDir, "sitemap.xml")), "do not emit a root sitemap.xml file (Netlify Pretty URLs 500s it)");
assertFile(redirectsPath, "_redirects");
const redirects = fs.readFileSync(redirectsPath, "utf8");
assert.ok(
  /\/sitemap\.xml\s+\/sitemap\/index\.xml\/\s+200!/.test(redirects),
  "_redirects must 200-rewrite /sitemap.xml to /sitemap/index.xml/"
);
const sitemap = fs.readFileSync(sitemapPath, "utf8");
assert.ok(sitemap.startsWith("<?xml"), "sitemap.xml must start with an XML declaration");
assert.ok(sitemap.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'), "sitemap.xml must contain a urlset");
assert.ok(sitemap.includes("</urlset>"), "sitemap.xml must close urlset");
assert.ok(/<loc>https:\/\/ashishkumar\.dev\/<\/loc>/.test(sitemap), "sitemap.xml must include the site homepage");
assert.ok(!sitemap.includes("<loc></loc>"), "sitemap.xml must not contain empty loc entries");

assertFile(robotsPath, "robots.txt");
const robots = fs.readFileSync(robotsPath, "utf8");
assert.ok(/User-agent:\s*\*/i.test(robots), "robots.txt must allow a wildcard user-agent");
assert.ok(/Allow:\s*\//i.test(robots), "robots.txt must allow crawling");
assert.ok(
  robots.includes("Sitemap: https://ashishkumar.dev/sitemap.xml"),
  "robots.txt must point to https://ashishkumar.dev/sitemap.xml"
);

console.log("SEO artifacts OK: _site/sitemap/index.xml, _site/_redirects, and _site/robots.txt");
