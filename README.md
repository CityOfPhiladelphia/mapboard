# mapboard

Mapboard is a framework for building data-rich mapping applications for the City of Philadelphia.

![Atlas](http://i.imgur.com/GcZpsgX.png)

## Usage
Check out [the wiki](https://github.com/CityOfPhiladelphia/mapboard/wiki) for usage documentation.

## Publishing

To publish a new version of Mapboard to NPM:

1. Commit your changes to `master`.
2. Bump the NPM version with `npm version major|minor|patch`.
3. Push with tags: `git push && git push --tags`.
4. Update wiki docs to reflect new version and/or dependency changes.

Travis will now run a build and publish to NPM.
