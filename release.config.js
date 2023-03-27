module.exports = {
    branches: ['master'],
    tagFormat: 'v${version}',
    repositoryUrl: 'https://github.com/mParticle/mparticle-web-media-sdk',
    plugins: [
        [
            '@semantic-release/commit-analyzer',
            {
                preset: 'angular',
                releaseRules: [
                    { type: 'feat', release: 'minor' },
                    { type: 'ci', release: 'patch' },
                    { type: 'fix', release: 'patch' },
                    { type: 'docs', release: 'patch' },
                    { type: 'test', release: 'patch' },
                    { type: 'refactor', release: 'patch' },
                    { type: 'style', release: 'patch' },
                    { type: 'build', release: 'patch' },
                    { type: 'chore', release: 'patch' },
                    { type: 'revert', release: 'patch' },
                ],
            },
        ],
        [
            '@semantic-release/release-notes-generator',
            {
                preset: 'angular',
            },
        ],
        [
            '@semantic-release/changelog',
            {
                changelogFile: 'CHANGELOG.md',
            },
        ],
        ['@semantic-release/npm'],
        [
            '@semantic-release/exec',
            {
                prepareCmd: 'sh ./scripts/release.sh',
            },
        ],
        [
            '@semantic-release/github',
            {
                assets: [
                    'dist/mparticle-media.common.js',
                    'dist/mparticle-media.iife.js',
                ],
            },
        ],
        [
            '@semantic-release/git',
            {
                assets: ['package.json', 'package-lock.json', 'CHANGELOG.md'],
                message:
                    'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
            },
        ],
    ],
};
