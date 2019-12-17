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

## Release Notes

### 3.0.50 - 12/9/2019

* uses pvc that fixes generation of xml for epay

### 3.0.49 - 11/12/2019

* uses new release of pvd which finishes passing the state to callback function in http-get

### 3.0.48 - 11/12/2019

* uses new release of pvd which passes the state to callback function in http-get

### 3.0.47 - 11/8/2019

* adds back in polyline

### 3.0.46 - 10/22/2019

* uses pvc 1.0.46 which has more bugfixes for new date-fns

### 3.0.45 - 10/22/2019

* fixes bug with update to date-fns 2.6.0:
  * date transforms must have the following format:

    import { format, parseISO } from 'date-fns';
    ...

    ...
    date: {
      transform: function (value) {
        return format(parseISO(value), 'MM/dd/yyyy');
      },
    },

### 3.0.44 - 10/22/2019

* incorporates all pull requests created by dependabot

### 3.0.43 - 10/7/2019

* Uses new releases of @philly libraries which ran upgrades
  * Uses @philly/vue-comps 1.0.40
  * Uses @philly/vue-mapping 1.0.41
* Uses new restructured pvd (which also ran upgrades)
  * Uses @philly/vue-datafetch 0.0.26

### 3.0.42 - 9/24/2019

* Fixes icon issue with Cyclomedia 19.12

### 3.0.41 - 9/23/2019

* Uses Cyclomedia 19.12

### 3.0.40 - 9/20/2019

* Fixes for dor parcels that are listed with "pipes" in AIS, and for adding polylines in pvm

### 3.0.39 - 9/6/2019

* Uses new releases of @philly libraries which ran upgrades
  * Uses @philly/vue-comps 1.0.37
  * Uses @philly/vue-mapping 1.0.36
  * Uses @philly/vue-datafetch 0.0.24

### 3.0.38 - 8/9/2019

* Uses new releases of @philly libraries which ran upgrades
  * Uses @philly/vue-comps 1.0.36
  * Uses @philly/vue-mapping 1.0.35
  * Uses @philly/vue-datafetch 0.0.22
* Adds ids to Horizontal and Vertical table html
* Adds borders to Address Search bars
* Fixes css where very wide horizontal tables were going way behind the map

### 3.0.37 - 7/12/2019
* Uses new releases of @philly libraries which ran upgrades
  * Uses @philly/vue-comps 1.0.33
  * Uses @philly/vue-mapping 1.0.33
  * Uses @philly/vue-datafetch 0.0.21

### 3.0.36 - 7/11/2019
* Uses new releases of @philly libraries which ran upgrades
  * Uses @philly/vue-comps 1.0.33
  * Uses @philly/vue-mapping 1.0.33
  * Uses @philly/vue-datafetch 0.0.20

### 3.0.35 - 6/2/2019

* Uses new releases of @philly libraries which use axios 0.19.0:
  * Uses @philly/vue-comps 1.0.31
  * Uses @philly/vue-mapping 1.0.31
  * Uses @philly/vue-datafetch 0.0.18
* Fixes sources for images in the MapPanel

### 3.0.34 - 5/30/2019

* Uses @philly/vue-comps 1.0.29
* Uses @philly/vue-mapping 1.0.30
* Uses @philly/vue-datafetch 0.0.17
* Allows you to use a [footerContent](https://github.com/CityOfPhiladelphia/mapboard/wiki/footerContent) parameter in your config, which lets you include as many popoverLink and Anchor components in your footer as you need.
* Allows you to use a [customComps](https://github.com/CityOfPhiladelphia/mapboard/wiki/customComps) parameter in your config to include your own components in a project.
* Allows you to set up an [initialPopover](https://github.com/CityOfPhiladelphia/mapboard/wiki/initialPopover) to put an alert modal on your site when it loads.
