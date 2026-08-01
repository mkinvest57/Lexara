// Metro configuration for the pnpm monorepo.
//
// Two things are needed for @yapro/core to resolve: Metro must watch the repo
// root (the package lives outside this app), and it must follow the symlinked
// node_modules that pnpm creates.

const { getDefaultConfig } = require('expo/metro-config');
const path = require('node:path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// pnpm links workspace packages; Metro needs to walk into them.
config.resolver.unstable_enableSymlinks = true;
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
