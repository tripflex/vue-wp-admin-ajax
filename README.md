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
- Automatically sets `ajaxurl` if not manually defined
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
Vue.use(WPAdminAjax, { returnData: true })
```

#### Options

- (boolean) `returnData` - Default `true` - Whether or not to parse the response, which assumes that on the WordPress PHP side, that you are using `wp_send_json_error` and `wp_send_json_success`, which wraps the response in an object like `{ success: BOOLEAN, data: USERDATA }`

    When `true` (default), this plugin will parse the response from WordPress, converting the value set in `data` to a JSON Object, otherwise it will return the entire response.

- (boolean) `returnOnlyData` - Default `true` - By default in axios, the entire response object is returned, by leaving this setting to `true`, only the value found in the response `data` is returned.  Set this to `false` to return the entire axios response object.

- (function) `ready` - Use this to specify a custom callback function to be called when the document is in a ready state. Will be passed the instance of this plugin.

- (object) `axios` - Use this to specify any specific axios options to use for all requests. All available options can be found under [Request Config](https://github.com/axios/axios#request-config) in axios documentation.  This can also be specified in each request (see below).
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

- `data` (object) **optional** - This should be an object of data that you want to send to the server (if any).  Even if using `GET` it should be an object which will be converted to parameters on the request.

- `options` (object) **optional** - Any custom axios configuration options you want to use for this request, all available options can be found under [Request Config](https://github.com/axios/axios#request-config) in axios documentation.  **These will take priority over any default or global options defined in plugin setup**

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
Somewhere on the page you need to output the nonce to be used, for ease of use you should use the same name as the action itself.  This plugin will automatically attempt to get the nonce value based on the action, if you don't specify one in the `data` parameter.

```php
wp_nonce_field( 'vuewpaa_demo', 'vuewpaa_demo' );
```

AJAX Handling
```php
add_action( 'wp_ajax_vuewpaa_demo', 'vuewpaa_demo_response' );

function vuewpaa_demo_response(){

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

- **1.0.0** (August 29, 2019) - Initial Release

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2019 Myles McNamara
