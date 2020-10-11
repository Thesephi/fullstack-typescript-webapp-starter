## [1.1.0] - 2020-10-11

### Changed
- server app is now built with webpack
- unit test to reflect client app picking up env var
- Updated README

### Added
- mechanism to share code between client app and server app (the `shared/` directory)
- env vars can now be injected into both client app and server app during build

### Removed
- `npm run build` is no longer auto-invoked after `npm install` (which causes Heroku to hang)

## [1.0.1] - 2020-24-09

### Changed
- `npm start` will now start the build under production mode, to make it seamlessly compatible with platforms such as Heroku
- metadata (updated repository keywords)
- README content
- Travis CI integration

### Added
- `npm run start-dev` will now behave as the old `npm start`
- this CHANGELOG

## [1.0.0] - 2020-23-09

### Added
- Initial release
