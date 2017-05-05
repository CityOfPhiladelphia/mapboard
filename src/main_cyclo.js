StreetSmartApi.init({
  username: 'maps@phila.gov',
  password: 'mapscyc01',
  apiKey: 'GfElS3oRuroNivgtibsZqDkpCvItyPUNuv0NmXglen8puXoJanEVarsZyns9ynkJ',
  srs: "EPSG:4326",
  locale: 'nl',
  addressSettings: {
    locale: "nl",
    database: "CMDatabase"
  }
}).then (
  console.log('hello'),//app.didInitCyclo,
  function(err) {
    console.log('Api: init: failed. Error: ', err);
    alert('Api Init Failed!');
  }
);
