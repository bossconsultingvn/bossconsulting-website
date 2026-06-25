const fs = require("fs");
const path = require("path");

const INSIGHTS_DIR = path.join(__dirname, "content/insights");
const OUTPUT_FILE = path.join(__dirname, "posts.json");

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: content };

  const meta = {};
  match[1].split("\n").forEach((line) => {
    const [key, ...rest] = line.split(":");
    if (key && rest.length) {
      meta[key.trim()] = rest.join(":").trim().replace(/^["']|["']$/g, "");
    }
  });

  return { meta, body: match[2].trim() };
}

let posts = [];
let mdFiles = [];

if (fs.existsSync(INSIGHTS_DIR)) {
  mdFiles = fs.readdirSync(INSIGHTS_DIR).filter((f) => f.endsWith(".md"));

  mdFiles.forEach((filename) => {
    const filepath = path.join(INSIGHTS_DIR, filename);
    const raw = fs.readFileSync(filepath, "utf-8");
    const { meta, body } = parseFrontmatter(raw);

    posts.push({
      slug: filename.replace(".md", ""),
      title: meta.title || "Không có tiêu đề",
      category: meta.category || "boss-framework",
      excerpt: meta.excerpt || "",
      date: meta.date || "",
      body: body,
    });
  });

  posts.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Nếu không có .md files → giữ nguyên posts.json cũ (không ghi đè)
if (mdFiles.length === 0 && fs.existsSync(OUTPUT_FILE)) {
  const existing = fs.readFileSync(OUTPUT_FILE, "utf-8").trim();
  if (existing && existing !== "[]") {
    console.log("Không có .md files mới — giữ nguyên posts.json hiện tại.");
    process.exit(0);
  }
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(posts, null, 2), "utf-8");
console.log(`posts.json da tao — ${posts.length} bai viet`);
