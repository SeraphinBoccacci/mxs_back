# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- [#23] Add .env support and remove sensible datas in code
- [#23] Move all JWT related code to services/jwt
- [#23] Add a function to build mongodb uri (and obfuscate auth datas in logs)
- [#23] Throw an error if auth is not setted for MongoDB and Redis

### Fixed


### Wip

- [Caeb] Docker compose
- [Caeb] Subscribe a dedicated server for production
- [Caeb] Install server
- [Caeb] Commit hook from gitlab to update local repo and restart instances
