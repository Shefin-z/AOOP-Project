const { spawnSync } = require("node:child_process");

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit", shell: false });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}

// Production deployments prepare the database and private admin account once
// the Vercel environment variables are available. Preview builds only compile
// the app so they never mutate production data.
if (process.env.VERCEL_ENV === "production") {
  run(process.execPath, ["server/src/scripts/setup-database.js"]);
  run(process.execPath, ["server/src/scripts/create-admin.js"]);
}

run(process.execPath, ["node_modules/vite/bin/vite.js", "build"]);
