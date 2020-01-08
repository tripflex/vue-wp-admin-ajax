/**
  * vue-wp-admin-ajax
  * (c) 2019 Myles McNamara
  * @license MIT
  */
import WPAA from './wpaa'
const WPAdminAjax = {}

/**
 * Plugin API
 */
WPAdminAjax.install = function (Vue, options) {

  const defaultOptions = {
    /**
     * wpReturnData tells this plugin to parse the response, which assumes that on the WordPress PHP side,
     * that you are using wp_send_json_error and wp_send_json_success, which wraps the response in an object like this:
     * { success: BOOLEAN, data: USERDATA }
     *
     * By leaving this set to `true`, this plugin will parse the response from WordPress, converting the value set in `data` to a JSON Object,
     * and setting that as the data (instead of the object with success and data in it)
     */
    wpReturnData: true,
    /**
     * axiosReturnData tells the plugin to only resolve/reject the promise and return the value for `data` in the axios response ... rather than returning
     * the entire response object
     */
    axiosReturnData: true
  }

  WPAA._options = Object.assign( defaultOptions, options || {} )
  Vue.$wpaa = WPAA
  Vue.prototype.$wpaa = WPAA

  const domReadyCallback = () => {
    console.log( 'document ready!', window.ajaxurl )

    // If ajaxurl was not specifically defined by passed options, define it on dom loaded
    if( ! ('ajaxurl' in WPAA._options ) || WPAA._options.ajaxurl.length < 1 ){
      WPAA._options.ajaxurl = window.ajaxurl
    }

    // Specify 'ready' function callback to call when dom is ready
    if( ( 'ready' in WPAA._options ) ){
      WPAA._options.ready( WPAA )
    }
  }

  if( window.addLoadEvent ){
    console.log( 'addLoadEvent' )
    window.addLoadEvent( domReadyCallback )

  } else {

    if ( document.readyState === "complete" || (document.readyState !== "loading" && !document.documentElement.doScroll) ) {
      console.log( 'document already ready' )
      domReadyCallback()
    } else {
      document.addEventListener( "DOMContentLoaded", domReadyCallback )
    }

  }

}

/**
 * Auto install
 */
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(WPAdminAjax)
}

export default WPAdminAjax
