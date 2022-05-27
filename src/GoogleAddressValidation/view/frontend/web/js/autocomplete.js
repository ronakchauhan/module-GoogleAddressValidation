/**
 * @category  Y1
 * @package   Y1_GoogleAddressValidation
 * @copyright Copyright (c) Y1 Digital AG (https://y1.de)
 * @contact   ronak.chauhan@y1.de
 */
define(
    [
        'jquery',
        'underscore',
        'mage/translate',
        'googleMapPlaceLibrary',
        'domReady!'
    ], function ($, _, $t) {
        'use strict';
        $.widget(
            'googleAddressValidation.register',
            {
                autocompletes: [],
                autocompleteInputName: 'street[0]',
                showWarning: true,
                addressRegExpString: '^(.+) +(\\d.*)$',
                addressRegExp: {},
                componentForm: {
                    route: '',
                    // eslint-disable-next-line camelcase
                    street_number: 'street_number',
                    locality: '[name="city"]',
                    // eslint-disable-next-line camelcase
                    administrative_area_level_1: '[name="state"]',
                    country: '[name="country_id"]',
                    // eslint-disable-next-line camelcase
                    postal_code: '[name="postcode"]'
                },

                /**
                 * @private
                 */
                _nodeObserver: function () {
                    let self = this;

                    return new MutationObserver(function (mutations) {
                        mutations.forEach(function (mutation) {
                            mutation.addedNodes.forEach(function (element) {
                                if (element.name === self.autocompleteInputName) {
                                    self._findFormAndInitAutocomplete(element);
                                }
                            });
                        });
                    });
                },

                _findFormAndInitAutocomplete: function (element) {
                    let $element = $(element).first();
                    if ($element.length === 0) {
                        return;
                    }
                    let $form = $element.closest('form');
                    if (!$form.attr('id')) {
                        $form.attr('id', _.uniqueId('form-'));
                    }
                    this._initAutocomplete($form, $element);
                },

                /**
                 * @private
                 */
                _initializeWidgetOptions: function () {
                    this.addressRegExpString = this.options.regex || this.addressRegExpString;
                    this.addressRegExp = new RegExp(this.addressRegExpString, 'gm');
                    this.autocompleteInputName = this.options.autocompleteInputName || this.autocompleteInputName;
                    this.componentForm.route = '[name="' + this.autocompleteInputName + '"]';
                    this.showWarning = this.options.showWarning || this.showWarning;
                    this.componentForm = $.extend(this.componentForm, this.options.componentForm || {});
                },

                /**
                 * @protected
                 */
                _create: function () {
                    this._initializeWidgetOptions();
                    this._findFormAndInitAutocomplete(this.componentForm.route);
                    this._nodeObserver().observe(document, {childList: true, subtree: true});
                },

                /**
                 * @param {jQuery} $form
                 * @private
                 */
                _fillInAddress: function ($form) {
                    let formId = $form.attr('id');
                    // Get the place details from the autocomplete object.
                    let place = this.autocompletes[formId].GAutocomplete.getPlace();
                    this._populateAddressForm($form, place);
                },

                /**
                 * @param {jQuery} $autocompleteInput
                 * @private
                 */
                _validateInput: function ($autocompleteInput) {
                    let self = this;
                    let showErrBoxIfNotValid = function () {
                        self._clearWarning($autocompleteInput);

                        // show standard magento error
                        if ($autocompleteInput.val() === '') {
                            return;
                        }

                        // js regexp is stateful, so we clear the last index
                        self.addressRegExp.lastIndex = 0;
                        if (self.addressRegExp.test($autocompleteInput.val())) {
                            return;
                        }

                        self._addWarning($autocompleteInput);
                    };

                    if (!this.showWarning) {
                        return;
                    }

                    _.debounce(showErrBoxIfNotValid(), 300);
                },

                /**
                 * @param {jQuery} $autocompleteInput
                 * @private
                 */
                _addWarning: function ($autocompleteInput) {
                    const t = $t('We are not sure if this is really a valid address. If the information is correct, just continue.');
                    $('<div class="field-error custom _warn"><span>' + t + '</span></div>').insertAfter($autocompleteInput);
                    $autocompleteInput.trigger('google-autocomplete-widget-after', [$autocompleteInput, false]);
                },

                /**
                 * @param {jQuery} $autocompleteInput
                 * @private
                 */
                _clearWarning: function ($autocompleteInput) {
                    $autocompleteInput.parent().find('.field-error.custom._warn').remove();
                    $autocompleteInput.trigger('google-autocomplete-widget-after', [$autocompleteInput, true]);
                },

                /**
                 * @param {jQuery} $form
                 * @param {Object} place
                 * @private
                 */
                _populateAddressForm: function ($form, place) {
                    let streetNumber = _.find(place.address_components, function (addressComponent) {
                        return addressComponent.types[0] === 'street_number';
                    });

                    // Get each component of the address from the place details
                    // and fill the corresponding field on the form.
                    for (let i = 0; i < place.address_components.length; i++) {
                        let addressComponent = place.address_components[i];
                        let addressType = addressComponent.types[0];
                        if (this.componentForm[addressType]) {
                            let val = addressComponent['long_name'];
                            let $input = $form.find(this.componentForm[addressType]).first();
                            if (addressType === 'country') {
                                val = addressComponent['short_name'];
                                val = val.toUpperCase();
                            }
                            if (addressType !== 'route') {
                                $input.val(val);
                                continue;
                            }
                            //addressType is street
                            if (
                                streetNumber //value exists from google
                                && !_.isUndefined(streetNumber.long_name) //is not undefined
                                && !$form.find(this.componentForm.street_number).length) //respective field was not filled up already
                            {
                                $input.val(val + ' ' + streetNumber.long_name);
                            } else {
                                $input.val(val);
                            }
                        }
                    }
                    //Triggers 'change' event onto mapped form fields
                    $form.find(_.values(this.componentForm).join(',')).trigger('change');

                    //Clear any left warning, since customer had just selected the address from the list
                    this._clearWarning(this.autocompletes[$form.attr('id')].input);
                },

                /**
                 * @param {jQuery} $form
                 * @param {jQuery} $streetField
                 * @private
                 */
                _initAutocomplete: function ($form, $streetField) {
                    let formId = $form.attr('id');

                    $streetField.attr('placeholder', '');

                    if (!_.isUndefined(this.autocompletes[formId])) {
                        return;
                    }

                    this.autocompletes[formId] = {};
                    // Cache element to reuse later
                    this.autocompletes[formId].input = $streetField;
                    // When we use .Autocomplete, this is called widget, and it generates session tokens automatically
                    this.autocompletes[formId].GAutocomplete = new google.maps.places.Autocomplete(
                        $streetField[0],
                        {types: ['address']}
                    );
                    // Define fields to return, more fields means more costs
                    this.autocompletes[formId].GAutocomplete.setFields(['address_components']);
                    this.autocompletes[formId].GAutocomplete.setComponentRestrictions({
                        country: this.options.allowedCountries
                    });

                    // When the user selects an address from the dropdown, populate the address
                    // fields in the form.
                    this.autocompletes[formId].GAutocomplete.addListener('place_changed', this._fillInAddress.bind(this, $form));


                    this._initInputListeners(this.autocompletes[formId].input);
                },

                /**
                 * @param {jQuery} $input
                 * @private
                 */
                _initInputListeners: function ($input) {
                    $input.on('input.y1_address_autocomplete', this._validateInput.bind(this, $input));
                }
            }
        );

        return $.googleAddressValidation.register;
    }
);
