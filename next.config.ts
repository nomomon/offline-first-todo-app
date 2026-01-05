import { spawnSync } from "node:child_process";
import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

// Using `git rev-parse HEAD` might not the most efficient
// way of determining a revision. You may prefer to use
// the hashes of every extra file you precache.
const revision =
	spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout ??
	crypto.randomUUID();

const withSerwist = withSerwistInit({
	additionalPrecacheEntries: [{ url: "/~offline", revision }],
	swSrc: "app/sw.ts",
	swDest: "public/sw.js",
});

const nextConfig: NextConfig = {
	output: "standalone",
};

export default withSerwist(nextConfig);
