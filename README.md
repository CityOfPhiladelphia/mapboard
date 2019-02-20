# mapboard ([@philly/mapboard](https://www.npmjs.com/package/@philly/mapboard) in [npmjs.com](https://npmjs.com))

Mapboard is a framework for building data-rich mapping applications for the City of Philadelphia.  It can be used as a template for creating any application which presents information about an address.  It *can* have either of the following two elements alone, or both side-by-side: the *map panel* and *topic panel*.

![Atlas](https://s3.amazonaws.com/mapboard-images/Mapboard2.jpg)
![RealEstate](https://s3.amazonaws.com/mapboard-images/RealEstate/mobile.jpg)

Mapboard uses functions of the library [phila-vue-datafetch](https://github.com/CityOfPhiladelphia/phila-vue-datafetch) ([@philly/vue-datafetch](https://www.npmjs.com/package/@philly/vue-datafetch) in [npmjs.com](https://npmjs.com)), allowing it to return data based on any address.

A Map Panel uses [phila-vue-mapping](https://github.com/CityOfPhiladelphia/phila-vue-mapping) ([@philly/vue-mapping](https://www.npmjs.com/package/@philly/vue-mapping) in [npmjs.com](https://npmjs.com)), a library of Vue components for mapping such as [Maps](https://github.com/CityOfPhiladelphia/phila-vue-mapping/wiki/Map), [ESRI WebMaps](https://github.com/CityOfPhiladelphia/phila-vue-mapping/wiki/EsriWebMap), and [Cyclomedia Widgets](https://github.com/CityOfPhiladelphia/phila-vue-mapping/wiki/CyclomediaWidget), etc.

Data returned is presented in the Topic Panel of the application using components of the library [phila-vue-comps](https://github.com/CityOfPhiladelphia/phila-vue-comps) ([@philly/vue-comps](https://www.npmjs.com/package/@philly/vue-comps) in [npmjs.com](https://npmjs.com)), such as [Vertical Tables](https://github.com/CityOfPhiladelphia/phila-vue-comps/wiki/Vertical-Table) or [Horizontal Tables](https://github.com/CityOfPhiladelphia/phila-vue-comps/wiki/Horizontal-Table), etc.


## Usage
Check out [the wiki](https://github.com/CityOfPhiladelphia/mapboard/wiki) for usage documentation.

## Publishing

To publish a new version of Mapboard to NPM:

1. Commit your changes to `master`.
2. Bump the NPM version with `npm version major|minor|patch`.
3. Push with tags: `git push && git push --tags`.
4. Update wiki docs to reflect new version and/or dependency changes.

Travis will now run a build and publish to NPM.
