# Contributing to Soy

Looking to contribute something to Soy? **Here's how you can help.**

Please take a moment to review this document in order to make the contribution
process easy and effective for everyone involved.

Following these guidelines helps to communicate that you respect the time of the
developers managing and developing this open source project. In return, they
should reciprocate that respect in addressing your issue or assessing patches
and features.

## Setup Development Environment

Soy is a monorepo that uses [yarn](https://yarnpkg.com) and [lerna](https://lernajs.io/)
to manage dependencies during development.

If you haven't installed yarn already, yarn hosts great
[install instructions](https://yarnpkg.com/en/docs/install) for every major os.

Web3js also uses python, though it isn't a requirement, you can find instructions
to install it on [Python's website](https://www.python.org/downloads/).

To install dev dependencies, use yarn:

```bash
$ yarn install
```

## Testing and Linting

All code is linted (eslint, and solium), formatted (prettier), and tested
(jest, truffle). To run the full suite of tests:

```bash
$ yarn test
```

Every individual project can also run it's own tests individually with
`yarn test` in it's own directory as well.

## Pull Requests

Good pull requests—patches, improvements, new features—are a fantastic help.
They should remain focused in scope and avoid containing unrelated commits.
All pull requests should include tests and pass CI.

Please ask first before embarking on any significant pull request
(e.g. implementing features, refactoring code, porting to a different language),
otherwise you risk spending a lot of time working on something that the project's
developers might not want to merge into the project.

**IMPORTANT**: By submitting a patch, you agree to allow the project owners to
license your work under the terms of the
[Apache 2.0](https://github.com/ConsenSys/web3studio-soy/blob/master/packages/soy-core/LICENSE)
License.

## Releasing a New Version

Soy uses [Semver](https://semver.org/) for versioning. Based on the changes
since the last release, determine which type of release this is, `major`,
`minor`, or `patch`.

Use lerna to update all of the packages to the new version, and create a pull
request. Travis will handle publishing to npm.

For example, to release a new major version...

```bash
$ git checkout -b release/v1.0.0
$ yarn lerna:version major
$ git push origin release/v1.0.0 --follow-tags

# Open a pull request from `release/v1.0.0` => `master`
```
