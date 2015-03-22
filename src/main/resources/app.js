// For any third party dependencies, like jQuery, place them in the lib folder.

// Configure loading modules from the lib directory,
// except for 'app' ones, which are in a sibling
// directory.
requirejs.config({
    baseUrl: 'scripts/lib',
    paths: {
        app: '../app'
    },
    shim: {

        'd3.chart': {
            //These script dependencies should be loaded before loading
            //backbone.js
            deps: ['d3'],
            //Once loaded, use the global 'Backbone' as the
            //module value.
            exports: 'd3.chart'
        }
    }
});

// Start loading the main app file. Put all of
// your application logic in there.
requirejs(['app/main']);