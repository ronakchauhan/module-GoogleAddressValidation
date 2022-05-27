## Y1 Google Address Validation Module

The module adds address autocomplete to the "Street Address" field on billing and shipping forms during the checkout.

It prepends the postal code, state, and country once the street has been selected.

A slight non-blocking warning will be shown if the user hadn't chosen the address from the list.

### Prerequisites

Since the module works using Google Maps autocomplete widget, a Google Maps API key is required.

How to get an API key:

https://developers.google.com/maps/documentation/javascript/get-api-key

Please make sure the billing account is linked with the Google project and Places API is enabled.

To enable the module, go to `System -> Stores -> Configuration -> Services -> Google Address Validation`

Select `Enable` the module, enter your `API Key`, and click `Save Config`.

---

### Validation

We validate the address using the following regex:

`/^(.+) +(\d.*)$/gm`

You can pass regex string as an option to the widget:

        {
            "*": {
                "googleAddressValidation": {
                    ...
                    "regex" : "^(.+) +(\d.*)$"
                }
            }
        }

---

#### Pricing (as per 01/01/2021):

Google gives free USD 200 every month for Maps requests.

One request within the user session costs USD 0.017.

One request is when a user started typing the street and then chosen the street name from the suggestion list.

200/0.017/30 = 392 free requests per day

Then, 0.017 per request.

You can also set up a billing limit, so you won't be extra charged after the free usage tier:

https://developers.google.com/maps/faq#usage_cap

Console:

https://console.cloud.google.com/google/maps-apis/apis/places-backend.googleapis.com/quotas

---

#### What happens when we reach the quota limit?

If there was set a daily limit for API requests in Google Console, API will throw an error in the browser console.

When we use an autocomplete widget, there is no possibility to catch the API errors (except auth), and quota error specifically.

This results in that we can not detect when the limit exceeded on the client-side and we keep show the warning message that's the input is invalid.

A possible solution to that is to make a test API call before adding an autocomplete instance to the input, e.g. by getting random prediction using AutocompleteService: https://developers.google.com/maps/documentation/javascript/reference/places-autocomplete-service

By doing that, we can check for `OVER_QUERY_LIMIT` status in the callback to remove our custom validation and stick to the default Magento validation of the address input.

The problem with this approach is that we're doing n+1 call to the API and spend more quota.

**(upd.)** We use a regular expression now to validate the address. It doesn't depend on Google autocomplete, and having the quota problem won't affect the customer experience.
