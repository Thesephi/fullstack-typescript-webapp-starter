## [1.4.0] - 2022-07-13

### Changed
- overall library upgrades (2-year worth of upgrades!)

## [1.3.0] - 2020-12-13

### Changed
- `npm run start-dev` => `npm run dev`
- renamed, removed, and revamped other npm scripts
- the nature of the dev flow has changed substantially (client-side assets are now generated via `webpack` embedded into the server-side module)
- on production, everything should behave like before (no `webpack-dev-middleware`, no `react-refresh`)
- the template `index.html` now has its `title` injected by `webpack` using the build-time env var `APP_NAME`

### Added
- the use of `react-refresh` (via `webpack-dev-middleware` and `webpack-hot-middleware`) to support live-reload

## [1.2.0] - 2020-10-16

### Changed
- form can be submitted via `Enter` key as well as clicking on the Submit button
- Material-UI is now the default UI framework

### Added
- the use of SCSS

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
