define([
    'underscore',
    'jquery',
    'googleMapPlaceLibrary'
], function(_, $) {
    'use strict';

    var service = new google.maps.places.AutocompleteService();

    /**
     * @param {Object|null} configuration
     */
    return function(configuration) {
        return {
            configuration: $.extend(true, {}, window.googleMapPlaceServiceConfiguration || {}, configuration || {}),
            /**
             * @see https://developers.google.com/maps/documentation/javascript/reference/places-autocomplete-service#AutocompletionRequest-Properties
             * @param {string} input
             * @return {Promise}
             */
            getPlacePredictions: function(input) {
                return input ? service.getPlacePredictions(
                        _.extend(this.configuration.requestConfiguration || {}, {
                            input: input
                        }))
                    : $.Deferred();
            }
        };
    };
});
