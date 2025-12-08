const fs = require("fs");
const path = require("path");

const BUNDLE_SIZE_LIMITS = {
  "static/chunks/pages/_app.js": 400 * 1024, // 400KB
  "static/chunks/pages/index.js": 250 * 1024, // 250KB
  "static/chunks/main.js": 200 * 1024, // 200KB
};

console.log("📊 Checking bundle sizes...");

// Check if .next directory exists
if (!fs.existsSync(".next")) {
  console.error("❌ Build directory not found. Run npm run build first.");
  process.exit(1);
}

let hasViolations = false;

// Check each bundle against limits
Object.entries(BUNDLE_SIZE_LIMITS).forEach(([bundlePath, limit]) => {
  const fullPath = path.join(".next", bundlePath);

  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    const size = stats.size;
    const limitKB = Math.round(limit / 1024);
    const sizeKB = Math.round(size / 1024);

    if (size > limit) {
      console.error(
        `❌ ${bundlePath}: ${sizeKB}KB exceeds limit of ${limitKB}KB`,
      );
      hasViolations = true;
    } else {
      console.log(`✅ ${bundlePath}: ${sizeKB}KB (limit: ${limitKB}KB)`);
    }
  } else {
    console.warn(`⚠️  ${bundlePath}: File not found (may have different name)`);
  }
});

if (hasViolations) {
  console.error("\n❌ Bundle size violations detected!");
  console.log('💡 Run "npm run analyze" to analyze bundle composition');
  process.exit(1);
} else {
  console.log("\n✅ All bundles within size limits");
}
