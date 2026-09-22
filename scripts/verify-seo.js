#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const siteDir = path.join(__dirname, "..", "_site");
const repoDir = path.join(__dirname, "..");
const postsDir = path.join(repoDir, "posts");
const metadataPath = path.join(repoDir, "_data", "metadata.json");
const canonicalHost = "https://ashishkumar.dev/";
const sitemapPath = path.join(siteDir, "sitemap.xml");
const redirectsPath = path.join(siteDir, "_redirects");
const robotsPath = path.join(siteDir, "robots.txt");
const atomFeedPath = path.join(siteDir, "feed", "feed.xml");
const jsonFeedPath = path.join(siteDir, "feed", "feed.json");
const llmsPath = path.join(siteDir, "llms.txt");

function assertFile(filePath, label) {
  assert.ok(fs.existsSync(filePath), `${label} is missing: ${filePath}`);
  assert.ok(fs.statSync(filePath).isFile(), `${label} must be a file, not a directory`);
}

assertFile(sitemapPath, "sitemap.xml");
assert.ok(!fs.existsSync(path.join(siteDir, "sitemap", "index.xml")), "do not emit sitemap/index.xml");
assertFile(redirectsPath, "_redirects");
const redirects = fs.readFileSync(redirectsPath, "utf8");
assert.ok(
  /\/sitemap\/index\.xml\s+\/sitemap\.xml\s+301!/.test(redirects),
  "_redirects must 301 /sitemap/index.xml to /sitemap.xml"
);
assert.ok(
  /\/sitemap\/index\.xml\/\s+\/sitemap\.xml\s+301!/.test(redirects),
  "_redirects must 301 /sitemap/index.xml/ to /sitemap.xml"
);
const sitemap = fs.readFileSync(sitemapPath, "utf8");
assert.ok(sitemap.startsWith("<?xml"), "sitemap must start with an XML declaration");
assert.ok(sitemap.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'), "sitemap must contain a urlset");
assert.ok(sitemap.includes("</urlset>"), "sitemap must close urlset");
assert.ok(/<loc>https:\/\/ashishkumar\.dev\/<\/loc>/.test(sitemap), "sitemap must include the site homepage");
assert.ok(!sitemap.includes("<loc></loc>"), "sitemap must not contain empty loc entries");
assert.ok(!sitemap.includes("www.ashishkumar.dev"), "sitemap must not include non-canonical www URLs");

assertFile(robotsPath, "robots.txt");
const robots = fs.readFileSync(robotsPath, "utf8");
assert.ok(/User-agent:\s*\*/i.test(robots), "robots.txt must allow a wildcard user-agent");
assert.ok(/Allow:\s*\//i.test(robots), "robots.txt must allow crawling");
assert.ok(
  robots.includes("Sitemap: https://ashishkumar.dev/sitemap.xml"),
  "robots.txt must point to https://ashishkumar.dev/sitemap.xml"
);

assertFile(atomFeedPath, "feed/feed.xml");
assertFile(jsonFeedPath, "feed/feed.json");
assertFile(llmsPath, "llms.txt");

const atomFeed = fs.readFileSync(atomFeedPath, "utf8");
const jsonFeed = fs.readFileSync(jsonFeedPath, "utf8");
const llms = fs.readFileSync(llmsPath, "utf8");

assert.ok(atomFeed.includes("<link href=\"https://ashishkumar.dev/\"/>"), "Atom feed must include canonical homepage URL");
assert.ok(jsonFeed.includes("\"home_page_url\": \"https://ashishkumar.dev/\""), "JSON feed must include canonical homepage URL");
assert.ok(llms.includes("Canonical host: https://ashishkumar.dev/"), "llms.txt must declare canonical host");
assert.ok(!atomFeed.includes("www.ashishkumar.dev"), "Atom feed must not use non-canonical www URLs");
assert.ok(!jsonFeed.includes("www.ashishkumar.dev"), "JSON feed must not use non-canonical www URLs");
assert.ok(!llms.includes("www.ashishkumar.dev"), "llms.txt must not use non-canonical www URLs");

const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
assert.strictEqual(metadata.url, canonicalHost, "metadata.url must use canonical host");

for (const filename of fs.readdirSync(postsDir)) {
  if (!filename.endsWith(".md")) {
    continue;
  }
  const content = fs.readFileSync(path.join(postsDir, filename), "utf8");
  assert.ok(/^description:\s+.+/m.test(content), `${filename} must include a description`);
  assert.ok(/^tags:\s*$/m.test(content), `${filename} must include tags`);
}

console.log("SEO artifacts OK: sitemap.xml, _redirects, robots.txt, feeds, llms, metadata, posts");
