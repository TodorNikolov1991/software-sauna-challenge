/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    verbose: true,
    testPathIgnorePatterns: ['/node_modules/'],
}
