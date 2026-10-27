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

const searchBots = ["OAI-SearchBot", "ChatGPT-User", "PerplexityBot", "Claude-SearchBot", "Googlebot"];
const trainingBots = ["GPTBot", "CCBot", "Google-Extended"];
for (const bot of [...searchBots, ...trainingBots]) {
  const group = new RegExp(`User-agent:\\s*${bot}\\s+Allow:\\s*/`, "i");
  assert.ok(group.test(robots), `robots.txt must explicitly allow ${bot}`);
}
assert.ok(!/^\s*Disallow\s*:/im.test(robots), "robots.txt must not disallow any path");

const llmsPath = path.join(siteDir, "llms.txt");
assertFile(llmsPath, "llms.txt");
const llms = fs.readFileSync(llmsPath, "utf8");
assert.ok(!/<!doctype|<html/i.test(llms), "llms.txt must stay plain text");
for (const section of ["## Site", "## Posts", "## Prefer", "## Profiles"]) {
  assert.ok(llms.includes(section), `llms.txt must keep the ${section} section`);
}
assert.ok(llms.includes("[Home](https://www.ashishkumar.dev/)"), "llms.txt must keep the Home link");
assert.ok(llms.includes("[Posts](https://www.ashishkumar.dev/posts/)"), "llms.txt must keep the posts index link");
assert.ok(llms.includes("[Atom feed](https://www.ashishkumar.dev/feed/feed.xml)"), "llms.txt must keep the Atom feed link");
assert.ok(
  llms.includes(`[JSON feed](${metadata.jsonfeed.url})`) || llms.includes(metadata.jsonfeed.url),
  "llms.txt must link to the JSON feed"
);

const postsDir = path.join(__dirname, "..", "posts");
const postFiles = fs.readdirSync(postsDir).filter((name) => name.endsWith(".md"));
assert.ok(postFiles.length > 0, "expected posts to list in llms.txt");
for (const fileName of postFiles) {
  const source = fs.readFileSync(path.join(postsDir, fileName), "utf8");
  const title = source.match(/^title:\s*(.+)$/m)[1].trim();
  const description = source.match(/^description:\s*(.+)$/m)[1].trim();
  const published = source.match(/^date:\s*(\d{4}-\d{2}-\d{2})$/m)[1];
  const slug = fileName.replace(/\.md$/, "");
  const url = new URL(`posts/${slug}/`, canonicalRoot).href;
  assert.ok(llms.includes(`[${title}](${url})`), `llms.txt must list ${title}`);
  assert.ok(llms.includes(description), `llms.txt must include the description for ${title}`);
  assert.ok(llms.includes(`(${published})`), `llms.txt must include the date for ${title}`);
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(fullPath, files);
    else files.push(fullPath);
  }
  return files;
}

const personId = `${canonicalRoot}#person`;
const htmlFiles = walk(siteDir).filter((filePath) => filePath.endsWith(".html"));
assert.ok(htmlFiles.length > 0, "expected built HTML pages");

for (const filePath of htmlFiles) {
  const html = fs.readFileSync(filePath, "utf8");
  const rel = path.relative(siteDir, filePath);
  const titles = html.match(/<title\b/gi) || [];
  const viewports = html.match(/<meta\b[^>]*\bname=["']viewport["']/gi) || [];
  assert.strictEqual(titles.length, 1, `${rel} must have exactly one <title>`);
  assert.strictEqual(viewports.length, 1, `${rel} must have exactly one viewport meta`);

  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  assert.ok(blocks.length > 0, `${rel} must include JSON-LD`);
  const graphs = blocks.map((match) => JSON.parse(match[1]));
  const person = graphs.find((node) => node["@type"] === "Person");
  assert.ok(person, `${rel} must include Person JSON-LD`);
  assert.strictEqual(person["@id"], personId, `${rel} Person @id must match the site person`);
  assert.ok(typeof person.image === "string" && person.image.startsWith(canonicalRoot), `${rel} Person needs an absolute image`);
  assert.ok(person.description && person.description.length > 0, `${rel} Person needs a description`);
  assert.deepStrictEqual(person.knowsAbout, ["React Native", "JavaScript", "mobile performance", "web"]);

  const isPost = rel.startsWith(`posts${path.sep}`) && path.basename(filePath) === "index.html" && rel !== path.join("posts", "index.html");
  if (isPost) {
    const posting = graphs.find((node) => node["@type"] === "BlogPosting");
    assert.ok(posting, `${rel} must include BlogPosting JSON-LD`);
    assert.ok(posting.dateModified, `${rel} BlogPosting must include dateModified`);
    assert.strictEqual(posting.author["@id"], personId, `${rel} author must reference the Person @id`);
    const crumbs = graphs.find((node) => node["@type"] === "BreadcrumbList");
    assert.ok(crumbs, `${rel} must include BreadcrumbList JSON-LD`);
    assert.deepStrictEqual(
      crumbs.itemListElement.map((item) => item.name),
      ["Home", "Posts", posting.headline],
      `${rel} breadcrumbs must be Home > Posts > Post`
    );
    assert.ok(html.includes('class="quick-answer"'), `${rel} must render the quick answer`);
    assert.match(html, /Updated <time datetime="\d{4}-\d{2}-\d{2}">/, `${rel} quick answer must show Updated <date>`);
  }

  const tagMatch = rel.match(new RegExp(`^tags\\${path.sep}([^\\${path.sep}]+)\\${path.sep}index\\.html$`));
  if (tagMatch) {
    const expected = `Posts about ${tagMatch[1]} by Ashish Kumar`;
    assert.ok(html.includes(`content="${expected}"`), `${rel} must use the per-tag description`);
    assert.ok(!html.includes(`content="${metadata.description}"`), `${rel} must not keep the generic site description`);
  }
}

for (const feedName of ["feed.xml", "feed.json"]) {
  const feed = fs.readFileSync(path.join(siteDir, "feed", feedName), "utf8");
  assert.ok(!feed.includes("quick-answer"), `${feedName} must not include the quick-answer box`);
  assert.ok(!feed.includes("dateModified"), `${feedName} must not gain dateModified`);
}
assert.ok(!sitemap.includes("llms.txt"), "sitemap must not list llms.txt");
assert.ok(!sitemap.includes("robots.txt"), "sitemap must not list robots.txt");

console.log("SEO artifacts OK: sitemap.xml, _redirects, robots.txt, llms.txt, JSON-LD");
