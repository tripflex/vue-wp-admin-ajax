# vue-wp-admin-ajax

> WordPress admin ajax request plugin for Vue.js built on top of [Axios](https://github.com/axios/axios)

**THIS IS STILL IN DEVELOPMENT AND IS NOT YET AVAILABLE ON NPMJS.ORG**

This is a Vue.js plugin specifically for handling WordPress Admin Ajax (`admin-ajax.php`) calls, resolving a few compatibility issues when making ajax calls to WordPress.

## Features

- POST requests
- GET requests
- Response data parsing
- Promises and async/await support
- Automatically sets `action` and `nonce` if not manually defined
- Automatically sets `ajaxurl` if not manually defined (from `window.ajaxurl` )
- Optional callback on document ready
- Uses WordPress' `addLoadEvent` if available, otherwise checks document ready state or uses `DOMContentLoaded` if not ready when loaded

## Installation

```shell
npm install vue-wp-admin-ajax
```

## Setup

#### Standard

```vue
import WPAdminAjax from 'vue-wp-admin-ajax'
Vue.use(WPAdminAjax)
```

#### Custom Options

```vue
import WPAdminAjax from 'vue-wp-admin-ajax'
Vue.use(WPAdminAjax, { wpReturnData: true })
```

#### Options

- (boolean) `wpReturnData` - Default `true` - Whether or not to parse the response, which assumes that on the WordPress PHP side, that you are using `wp_send_json_error`
  and `wp_send_json_success`, which wraps the response in an object like `{ success: BOOLEAN, data: USERDATA }`

  When `true` (default), this plugin will parse the response from WordPress, converting the value set in `data` to a JSON Object, otherwise it will return the entire response. (
  this is specifically for the WordPress response)

- (boolean) `axiosReturnData` - Default `true` - By default in axios, the entire response object is returned, by leaving this setting to `true`, only the value found in the
  response `data` is returned. Set this to `false` to return the entire axios response object (this is specific to Axios)

- (function) `ready` - Use this to specify a custom callback function to be called when the document is in a ready state. Will be passed the instance of this plugin.

- (object) `axios` - Use this to specify any specific axios options to use for all requests. All available options can be found
  under [Request Config](https://github.com/axios/axios#request-config) in axios documentation. This can also be specified in each request (see below).

- (string) `nonce_key` - You can use this option to define the key in `window` object to use for the nonce (when one is not defined in `data` already). This is useful if you're
  going to use the same nonce for all ajax calls.  This value can be a string using dot notation to specify where in an object to find the nonce.

- (boolean) `successFalseReject` - Default `true` - When successFalseReject is set to true, this plugin will reject the request promise when the returned response from WordPress
  has `success` as `false`, ie: `{ success: false, data: XXX }`. This will be the case whenever you send JSON response with wp_send_json_error() function

#### `wpReturnData` vs `axiosReturnData`

The two options `wpReturnData` and `axiosReturnData` can be a bit confusing ...

To clarify, `axiosReturnData` is specifically for the axios response. When Axios returns a response, it is wrapped in schema that includes `status`, `data`, and a few other things,
see [https://github.com/axios/axios#response-schema](https://github.com/axios/axios#response-schema)

`wpReturnData` is specifically for the WordPress response if you're using `wp_send_json_error` or `wp_send_json_success`. If you are (and you should be), this would technically be
the response from axios (if both `wpReturnData` and `axiosReturnData` are set to `false`):

```javascript
{
    data: {
        success: true,
        data: {
            some: 'value'
        }
    },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {},
    request: {}
}
```

As you can see, this means the response from axios actually has `data` parameter twice. When `wpReturnData` and `axiosReturnData` are both `true` (they are by default), instead of
returning the response you see above, this will be returned:

```javascript
{
    some: 'value'
}
````

## Usage

After installing this plugin, you can access it using the Vue instance:

```
Vue.$wpaa
```

or when inside an actual Vue file:

```
this.$wpaa
```

### Available Methods

#### Parameters

Regardless of whether you are using a `GET` (`this.$wpaa.get`) or `POST` (`this.$wpaa.post`) request, the arguments/parameters are exactly the same:

- `action` (string) **required** - This should be the action as defined in WordPress that you are calling. In the example below, the action is `vuewpaa_demo`

```php
add_action( 'wp_ajax_vuewpaa_demo', 'vuewpaa_demo_response' );
```

- `data` (object) **optional** - This should be an object of data that you want to send to the server (if any). Even if using `GET` it should be an object which will be converted
  to parameters on the request.

- `options` (object) **optional** - Any custom axios configuration options you want to use for this request, all available options can be found
  under [Request Config](https://github.com/axios/axios#request-config) in axios documentation.  **These will take priority over any default or global options defined in plugin
  setup**

#### POST

```
this.$wpaa.post( action, data, options )
```

#### GET

```
this.$wpaa.get( action, data, options )
```

## Vuex

To access this plugin from within Vuex, you can access it using the `this._vm` which is a reference to the Vue instance, for example:

```
this._vm.$wpaa.post( 'some_action', {id: someID })
```

## Examples

#### PHP

Somewhere on the page you need to output the nonce to be used, for ease of use you should use the same name as the action itself.

This plugin will automatically attempt to get the nonce value based on the action, if you don't specify one in the `data` parameter.

It will first look for the value in the `window` object, based on the action name.

You can use `wp_localize_script` to output an nonce value on the `window` object (after calling `wp_register_script` and before calling `wp_enqueue_script`):

```php
wp_localize_script( 'YOUR-SCRIPT-HANDLE', 'vuewpaa_demo', array( 'nonce' => wp_create_nonce( 'vuewpaa_demo' ) ) );
```

If a value is not found on the window object, this plugin will check for an actual input HTML element to obtain the value from

To output an actual input with an nonce value using `wp_nonce_field` (this will create a `hidden` HTML `input` field):

```php
wp_nonce_field( 'vuewpaa_demo', 'vuewpaa_demo' );
```

If you don't use any of the methods above, you MUST specify the nonce in the `data` parameter (using the `nonce` key)

PHP AJAX Handling

```php
add_action( 'wp_ajax_vuewpaa_demo', 'vuewpaa_demo_response' );

function vuewpaa_demo_response(){
    
	// Plugin will always pass the nonce under the `nonce` parameter/name
    check_ajax_referer( 'vuewpaa_demo', 'nonce' );
    
    $post_id = absint( $_POST['id'] );

    if( empty( $post_id ) ){
        // We send with a 500 to trigger the promise rejection on call
        // wp_send_json_error also already handles calling die()
        wp_send_json_error( __( 'Post ID missing!' ), 500 );
    }
    
    $data = 'some response';
    // OR
    $data = array( 'some' => 'value' );
    
    wp_send_json_success( $data );
}
```

#### Vue.js

I strongly recommend using `async`/`await`:

```javascript
async sendRequest(){
    try {
        const result = await this.$wpaa.post( 'vuewpaa_demo', {id: this.id} );
        console.log( result );
    } catch( error ){
        if ( error.response ) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.log( error.response.data );
            console.log( error.response.status );
            console.log( error.response.headers );
        } else if ( error.request ) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            console.log( error.request );
        } else {
            // Something happened in setting up the request that triggered an Error
            console.log( 'Error', error.message );
        }
        console.log( error.config );
    }
}
```

But you can of course still use standard `.then` and `.catch`:

```javascript
sendRequest(){

    this.$wpaa.post( 'vuewpaa_demo', {id: this.id} ).then( function( result ){
    	
        console.log( result );
        
    }).catch( function( error ){
    	
        if ( error.response ) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.log( error.response.data );
            console.log( error.response.status );
            console.log( error.response.headers );
            
        } else if ( error.request ) {
        	
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            console.log( error.request );
        } else {
        	
            // Something happened in setting up the request that triggered an Error
            console.log( 'Error', error.message );
        }
        console.log( error.config );
        
    })
}
```

## Dependencies

- [Axios](https://github.com/axios/axios) - Promise based HTTP client for the browser and node.js
- [QS](https://github.com/ljharb/qs) - Used to stringify data before being sent

## Frontend Setup

If you plan to use this on the frontend of your site, `window.ajaxurl` is NOT set already, so you MUST localize it to be output or manually define it in the options (when
initializing this plugin, or making the call). To add in global options do it like this:

```javascript
Vue.use(WPAdminAjax, { ajaxurl: YOUR_AJAX_URL_VALUE })
````

The easier way would be to just localize the variable (after you call `wp_register_script` and before you call `wp_enqueue_script` ) in PHP (this will allow this plugin to
automatically detect the ajax url):

```PHP
wp_localize_script( 'YOUR-SCRIPT-HANDLE', 'ajaxurl', admin_url( 'admin-ajax.php' ) );
```

* in recent versions of WordPress this will throw a warning about localizing a string (thanks PHP8), so you should most likely due this another way but the method above will still work.

## Demo Setup

``` bash
# install deps
npm install

# serve demo at localhost:8080
npm run dev

# build library and demo
npm run build

# build library
npm run build:library

# build demo
npm run build:demo
```

## Changelog

- **1.0.1** (April 22, 2022)
  - Add support for nonce in nested object (dot notation in string)
  - Added `successFalseReject`

- **1.0.0** (August 29, 2019) - Initial Release

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2022 Myles McNamara