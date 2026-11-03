// Puts the newest Moxel blog posts into README.md between the BLOG markers.
import { readFile, writeFile } from "node:fs/promises";

const site = "https://www.getmoxel.com";
const count = 3;

const list = await (await fetch(`${site}/blog`)).text();
const slugs = [...new Set([...list.matchAll(/href="\/blog\/([^"#?]+)"/g)].map((m) => m[1]))].slice(0, count);

const decode = (s) =>
  s.replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");

const lines = [];
for (const slug of slugs) {
  const page = await (await fetch(`${site}/blog/${slug}`)).text();
  const title = decode(page.match(/property="og:title" content="([^"]*)"/)?.[1] ?? slug).replace(/\s*\|\s*Moxel$/, "");
  const date = page.match(/published_time" content="([^"]*)"/)?.[1];
  lines.push(`- [${title}](${site}/blog/${slug})${date ? ` <sub>${date}</sub>` : ""}`);
}
if (!lines.length) throw new Error("No blog posts found");

const readme = await readFile("README.md", "utf8");
const next = readme.replace(
  /(<!-- BLOG:START -->)[\s\S]*?(<!-- BLOG:END -->)/,
  `$1\n${lines.join("\n")}\n$2`,
);
await writeFile("README.md", next);
console.log(lines.join("\n"));
