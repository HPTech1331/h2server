const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = __dirname;
process.chdir(root);

function run(cmd) {
  console.log(">", cmd);
  return execSync(cmd, { stdio: "inherit", shell: true });
}

function tryRun(cmd) {
  try {
    run(cmd);
    return true;
  } catch (e) {
    console.error("Failed:", cmd);
    return false;
  }
}

if (!fs.existsSync(path.join(root, ".git"))) {
  if (!tryRun("git init -b main")) process.exit(1);
} else {
  console.log("Git repo already exists.");
}

tryRun('git config user.email "h2server@local"');
tryRun('git config user.name "H2 Server"');
run("git add -A");

try {
  execSync("git commit -m \"Initial commit: H2 Server site\"", {
    stdio: "inherit",
    shell: true,
  });
} catch (e) {
  console.log("Commit skipped (maybe nothing new to commit).");
}

tryRun("git branch -M main");

const remoteFile = path.join(root, ".github-remote");
let remote = "";
if (fs.existsSync(remoteFile)) {
  remote = fs.readFileSync(remoteFile, "utf8").trim();
}

if (!remote) {
  console.log("");
  console.log("No remote URL yet.");
  console.log("Create a repo at https://github.com/new named h2server");
  console.log("Then put this line in .github-remote file:");
  console.log("https://github.com/YOUR_USERNAME/h2server.git");
  console.log("Then run: node setup-git.js");
  process.exit(0);
}

try {
  execSync("git remote remove origin", { stdio: "ignore", shell: true });
} catch (e) {}

if (!tryRun("git remote add origin " + remote)) process.exit(1);
if (!tryRun("git push -u origin main")) {
  console.log("Push failed. Login to GitHub in Git Credential Manager, then retry.");
  process.exit(1);
}

console.log("Done. Enable Pages: Settings -> Pages -> main / root");
