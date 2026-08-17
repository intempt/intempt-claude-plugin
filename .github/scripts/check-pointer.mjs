// Asserts that the marketplace manifest in this repository actually points at a
// real, installable plugin package -- the one thing this repository is for.
//
// Every check here is against the PUBLISHED package, fetched from the registry,
// never against a local copy. There is no local copy to check.

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, existsSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

let failed = 0;

function ok(label, pass, detail = "") {
  console.log(`${pass ? "PASS " : "FAIL "} ${label}${detail ? `  -- ${detail}` : ""}`);
  if (!pass) failed++;
}

// `npm` is a .cmd shim on Windows, which Node refuses to spawn without a shell.
// CI runs on Linux, but keep this runnable locally so it can be tested by hand.
// Args are double-quoted for the Windows path because a version range like
// `^1.0.0` would otherwise be eaten by cmd.exe's escape character.
const WIN = process.platform === "win32";

function npm(args, cwd) {
  const cmd = WIN ? "npm.cmd" : "npm";
  const argv = WIN ? args.map((a) => `"${a}"`) : args;
  return execFileSync(cmd, argv, {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    shell: WIN,
  });
}

const manifest = JSON.parse(readFileSync(".claude-plugin/marketplace.json", "utf8"));
const entry = (manifest.plugins ?? []).find((p) => p?.name === "intempt");

ok("the manifest declares a plugin named `intempt`", !!entry);
if (!entry) process.exit(1);

const src = entry.source ?? {};
ok("its source type is `npm`", src.source === "npm", `got ${JSON.stringify(src.source)}`);
ok("it names a package", typeof src.package === "string" && src.package.length > 0);

const pkgName = src.package;

// 1. Does the declared package exist on the registry at all? This is the check
//    whose absence let `@intempt/mcp-server` ship in a .mcp.json for weeks.
let publishedVersion = "";
try {
  publishedVersion = npm(["view", pkgName, "version", "--prefer-online"]).trim();
} catch (err) {
  ok(`\`${pkgName}\` resolves on the npm registry`, false, String(err.stderr || err).split("\n")[0]);
  process.exit(1);
}
ok(`\`${pkgName}\` resolves on the npm registry`, !!publishedVersion, `version ${publishedVersion}`);

// If a version/range is pinned here, it must actually be satisfiable.
if (src.version) {
  let resolved = "";
  try {
    resolved = npm(["view", `${pkgName}@${src.version}`, "version", "--prefer-online"]).trim();
  } catch {
    /* handled by the assertion below */
  }
  ok(`the pinned range \`${src.version}\` matches a published version`, !!resolved, resolved);
}

// 2. Fetch the real tarball and check it is a usable plugin. `npm view` proves
//    the name resolves; only unpacking proves Claude Code will find a plugin.
const work = mkdtempSync(join(tmpdir(), "pointer-"));
npm(["pack", pkgName, "--prefer-online"], work);
const tgz = readdirSync(work).find((f) => f.endsWith(".tgz"));
ok("the package downloads as a tarball", !!tgz, tgz);
execFileSync("tar", ["-xzf", tgz, "-C", work], { cwd: work });

const root = join(work, "package");
const pluginJsonPath = join(root, ".claude-plugin", "plugin.json");

// This is the requirement that makes an npm source work at all: the package
// root must BE the plugin root. A package without it caches as version
// "unknown", which compares equal forever and never offers an update.
ok("the tarball has `.claude-plugin/plugin.json` at its root", existsSync(pluginJsonPath));
if (!existsSync(pluginJsonPath)) process.exit(1);

const pluginJson = JSON.parse(readFileSync(pluginJsonPath, "utf8"));

// 3. The manifest's plugin name and the package's own name must agree, or the
//    install resolves to a plugin id the user did not ask to install.
ok(
  "the package's plugin name matches the manifest's",
  pluginJson.name === entry.name,
  `manifest ${JSON.stringify(entry.name)} vs package ${JSON.stringify(pluginJson.name)}`,
);

// 4. plugin.json must declare a version -- that is the update signal.
ok("the package declares a plugin version", typeof pluginJson.version === "string" && !!pluginJson.version, pluginJson.version);

// 5. Two descriptions are user-visible on different surfaces (this one pre-install
//    in browse, the package's one post-install in details). They drifted once.
if (entry.description) {
  ok(
    "the manifest description matches the package's",
    entry.description === pluginJson.description,
    `manifest ${JSON.stringify(entry.description)} vs package ${JSON.stringify(pluginJson.description)}`,
  );
}

// 6. The README states a skill count. Keep it honest against the real tarball.
const skillsDir = join(root, "skills");
const shipped = existsSync(skillsDir)
  ? readdirSync(skillsDir).filter((d) => existsSync(join(skillsDir, d, "SKILL.md")))
  : [];
ok("the package ships at least one skill", shipped.length > 0, `${shipped.length} skills`);

const readme = readFileSync("README.md", "utf8");
const WORDS = { nine: 9, eight: 8, ten: 10, eleven: 11, twelve: 12 };
const claimed = readme.match(/\b(nine|eight|ten|eleven|twelve)\s+skills\b/i);
if (claimed) {
  const n = WORDS[claimed[1].toLowerCase()];
  ok(
    "the README's skill count matches the package",
    n === shipped.length,
    `README says ${claimed[1]} (${n}), package ships ${shipped.length}`,
  );
} else {
  // A pattern that matches nothing is a failure, not a skip -- otherwise this
  // check silently stops covering the claim the moment the wording changes.
  ok("the README states a skill count this job can check", false, "no '<word> skills' phrase found in README.md");
}

// 7. The plugin's .mcp.json is the highest-consequence string in the product:
//    it is the command that actually runs. Assert every server it registers
//    names a package that resolves.
const mcpPath = join(root, ".mcp.json");
if (existsSync(mcpPath)) {
  const servers = JSON.parse(readFileSync(mcpPath, "utf8")).mcpServers ?? {};
  for (const [name, cfg] of Object.entries(servers)) {
    const args = cfg.args ?? [];
    const spec = args.find((a) => typeof a === "string" && !a.startsWith("-"));
    if (!spec) {
      ok(`server \`${name}\` names a package in its args`, false, JSON.stringify(args));
      continue;
    }
    // strip a trailing @version/@range, keeping any leading scope
    const at = spec.lastIndexOf("@");
    const bare = at > 0 ? spec.slice(0, at) : spec;
    let v = "";
    try {
      v = npm(["view", spec, "version", "--prefer-online"]).trim().split("\n").pop() ?? "";
    } catch {
      /* handled below */
    }
    ok(`server \`${name}\` runs \`${bare}\`, which resolves on npm`, !!v, v || `${spec} does not resolve`);
  }
} else {
  ok("the package ships a .mcp.json", false, "expected .mcp.json at the tarball root");
}

console.log(`\n${failed === 0 ? "all pointer checks pass" : `${failed} pointer check(s) FAILED`}`);
process.exit(failed === 0 ? 0 : 1);
