# mapboard ([@phila/mapboard](https://www.npmjs.com/package/@phila/mapboard) in [npmjs.com](https://npmjs.com))

Mapboard is a framework for building data-rich mapping applications for the City of Philadelphia.  It can be used as a template for creating any application which presents information about an address.  It *can* have either of the following two elements alone, or both side-by-side: the *map panel* and *topic panel*.

![Atlas](https://s3.amazonaws.com/mapboard-images/Mapboard4.jpg)
![RealEstate](https://s3.amazonaws.com/mapboard-images/RealEstate/mobile2.jpg)

Mapboard uses functions of the library [phila-vue-datafetch](https://github.com/CityOfPhiladelphia/phila-vue-datafetch) ([@phila/vue-datafetch](https://www.npmjs.com/package/@phila/vue-datafetch) in [npmjs.com](https://npmjs.com)), allowing it to return data based on any address.

A Map Panel uses [phila-vue-mapping](https://github.com/CityOfPhiladelphia/phila-vue-mapping) ([@phila/vue-mapping](https://www.npmjs.com/package/@phila/vue-mapping) in [npmjs.com](https://npmjs.com)), a library of Vue components for mapping such as [Maps](https://github.com/CityOfPhiladelphia/phila-vue-mapping/wiki/Map), [ESRI WebMaps](https://github.com/CityOfPhiladelphia/phila-vue-mapping/wiki/EsriWebMap), and [Cyclomedia Widgets](https://github.com/CityOfPhiladelphia/phila-vue-mapping/wiki/CyclomediaWidget), etc.

Data returned is presented in the Topic Panel of the application using components of the library [phila-vue-comps](https://github.com/CityOfPhiladelphia/phila-vue-comps) ([@phila/vue-comps](https://www.npmjs.com/package/@phila/vue-comps) in [npmjs.com](https://npmjs.com)), such as [Vertical Tables](https://github.com/CityOfPhiladelphia/phila-vue-comps/wiki/Vertical-Table) or [Horizontal Tables](https://github.com/CityOfPhiladelphia/phila-vue-comps/wiki/Horizontal-Table), etc.


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

### 4.4.23 - 12/8/2023

* fixes bug with previous release where packages were npm linked

### 4.4.22 - 12/7/2023

* incorporates all changes for adding new data to the nearby topic of atlas

### 4.4.21 - 11/10/2023

* fixes issue that causes non-effecting error in console from MapPanel.vue when searching an address with the L&I topic open

### 4.4.20 - 11/10/2023

* fixes bug in store.js

### 4.4.19 - 11/10/2023

* uses @phila/vue-mapping 3.1.20
* uses @phila/vue-comps 3.0.8
* uses @phila/vue-datafetch 2.2.15
* all changes for adding building certs to atlas

### 4.4.18 - 7/26/2023

* requests esri token on load
* uses @phila/vue-datafetch 2.2.14 which allows adding esri token

### 4.4.17 - 4/20/2023

* fixes bug with zoomToShape if the markerForTopic is missing

### 4.4.16 - 4/19/2023

* uses @phila/vue-comps 3.0.7 which fixes hard-coded bug with BadgeSet.vue

### 4.4.15 - 3/23/2023

* uses @phila/vue-datafetch that replaces geometry server

### 4.4.14 - 3/21/2023

* uses @phila/vue-mapping that uses maplibre 2.4.0 and turf 6.5.0

### 4.4.13 - 3/15/2023

* uses @phila/vue-mapping that fixes cyclomedia and pictometry popouts

### 4.4.12 - 3/15/2023

* changes for using cyclomedia 23.2

### 4.4.11 - 2/8/2023

* uses updated @phila/... packages
* ran package updates 

### 4.4.10 - 1/3/2023

* adds 2022 imagery and fixes bug with labels on imagery when it is switched

### 4.4.9 - 9/9/2022

* uses updated @phila/... packages
* ran package updates

### 4.4.8 - 8/3/2022

* uses pvc 3.0.4 with fix for translating subtitles of vertical tables

### 4.4.7 - 7/22/2022

* uses pvc 3.0.3, adds subtitle to vertical table

### 4.4.6 - 3/18/2022

* uses pvm 3.1.8 and pvc 3.0.2 which roll back to fontawesome 5.15.4 so that they are not ahead of @phila/phila-ui

### 4.4.5 - 3/10/2022

* uses pvm 3.1.7, pvc 3.0.1, and fontawesome 6.0.0
* uses fontawesome-svg-core 1.2.36, because 1.3.0 causes errors

### 4.4.4 - 3/2/2022

* uses pvd 2.2.7 which allows esri-client.js fetchBySpatialQuery to take a where clause

### 4.4.3 - 1/31/2022

* uses pvd 2.2.6 which fixes bug with using geocode of otherParcel if there is no geocode

### 4.4.2 - 1/31/2022

* uses pvd 2.2.5 which fixes bug with missing variable in console log

### 4.4.1 - 11/15/2021

* uses pvd 2.2.3 and pvm 3.1.0

### 4.4.0 - 11/15/2021

* deyarns

### 4.3.10 - 10/15/2021

* fixes typo

### 4.3.9 - 10/14/2021

* allows bypassing of errors for mapmarkers with missing data

### 4.3.8 - 11/12/2020

* uses pvc 2.1.22 which is removes code specific to real estate tax
* fixes on load css issue in real estate tax

### 4.3.7 - 10/29/2020

* uses pvd that fixes bugs related to routing

## 4.3.6 - 10/29/2020

* fixes bugs related to routing

### 4.3.5 - 10/29/2020

* fixes bug in real estate tax routing

### 4.3.4 - 10/29/2020

* fixes bug in real estate tax routing

### 4.3.3 - 10/28/2020

* fixes bug in real estate tax routing

### 4.3.2 - 10/28/2020

* uses new pvc and pvd for update to real estate tax

### 4.3.1 - 10/27/2020

* uses github actions to push to npmjs

### 4.3.0 - 10/22/2020

* uses vue-router and i18n

### 4.2.6 - 10/13/2020

* fixes geojsonForTopic issue for voting topic of atlas

### 4.2.5 - 10/7/2020

* uses upgraded vue libraries:
    * @phila/vue-mapping 2.2.9
    * @phila/vue-comps 2.1.15
    * @phila/vue-datafetch 1.4.3

### 4.2.4 - 10/5/2020

* uses pvm 2.2.8 fixing bug with cyclomedia and pictometry popout

### 4.2.3 - 9/15/2020

* fixes issue in real estate tax by allowing the app to use input in tips if geocode fails

### 4.2.2 - 9/15/2020

* fixes issue with map loading for the first time

### 4.2.1 - 9/4/2020

* uses updated pvc and pvm for WAVE

### 4.2.0 - 8/29/2020

* uses releases of pvd and pvm that remove imports of leaflet and esri-leaflet

### 4.1.10 - 8/11/2020

* adds the parcel overlay for imagery to the mapbox map

### 4.1.9 - 8/4/2020

* fixes small bug with cyclomedia circles when mapbox map is used

### 4.1.8 - 8/3/2020

* uses pvc with small fix to optional buttons in HorizontalTable.vue

### 4.1.7 - 7/31/2020

* converts measure tool area to square feet from square meters

### 4.1.6 - 7/30/2020

* allows moving legend to right side of map

### 4.1.5 - 7/30/2020

* uses @phila/vue-mapping that uses a version of mapbox-gl-draw that does not prevent clicks in mobile
* switches positions of the draw widget and the zoom and geolocate widgets, so that on mobile they do not overlap buttons if cyclomedia or pictometry is turned on

### 4.1.4 - 7/29/2020

* uses @phila/vue-mapping with small fix to year dropdown in mapbox

### 4.1.3 - 7/29/2020

* fixes to all libraries for final bugs in adding mapbox to mapboard

### 4.1.2 - 7/20/2020

* uses pvm 2.1.12 - includes updates for using mapbox in mapboard
* uses pvd 1.3.0 (updates unrelated to mapboard)

### 4.1.1 - 5/27/2020

* upgrades all packages

### 4.1.0 - 5/6/2020

* uses minor releases of libraries:
  * @phila/vue-comps 2.1.1
  * @phila/vue-mapping 2.1.1
  * @phila/vue-datafetch 1.2.0

### 4.0.8 - 3/2/2020

* allows a [header](https://github.com/CityOfPhiladelphia/mapboard/wiki/header), [alerts](https://github.com/CityOfPhiladelphia/mapboard/wiki/alerts), and [healthChecks](https://github.com/CityOfPhiladelphia/mapboard/wiki/healthChecks) to be include in a config file.

### 4.0.7 - 2/6/2020

* fixes bug with pictometry popout button

### 4.0.6 - 1/31/2020

* fixes map size on phone

### 4.0.5 - 1/31/2020

* pushes to @phila/mapboard instead of @philly/mapboard

### 4.0.4 - 1/30/2020

### 4.0.3 - 1/17/2020

* uses pvd 1.0.3 which fixes bug with handleMapClick in Atlas

### 4.0.2 - 1/14/2020

### 4.0.1 - 12/30/2019

### 4.0.0 - 12/17/2019

* Uses new major releases:
  * Uses @philly/vue-comps 2.0.0
  * Uses @philly/vue-mapping 2.0.0
  * Uses @philly/vue-datafetch 1.0.0

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
