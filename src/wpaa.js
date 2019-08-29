// export default function WPAA( action, options ){
// 	options = options || {}
//
// 	get()
// }
import axios from "axios"
import qs from 'qs'

export default {
	_get_ajaxurl(){
		if( ! ('ajaxurl' in this._options ) || this._options.ajaxurl.length < 1 ){
			this._options.ajaxurl = window.ajaxurl
		}

		return this._options.ajaxurl
	},
	_options: {
		ajaxurl: window.ajaxurl,
		axios: {}
	},
	_buildData: function( action, data, POST ){
		data = data || {}

		// If nonce is not defined in data, we assume the element to pull nonce from has the ID of the action
		if ( !('nonce' in data) ) {
			data.nonce = window.document.getElementById( action ).value
		}

		// If action is not set (really it shouldn't be), we set it from passed value
		if ( !('action' in data) ) {
			data.action = action
		}

		if( POST ){
			// /**
			//  * Convert JSON object data to FormData to work correctly with WordPress
			//  * @see https://wordpress.stackexchange.com/questions/282163/wordpress-ajax-with-axios
			//  * @type {FormData}
			//  */
			// let FormData = new FormData
			// Object.keys( data ).forEach( ( key ) => {
			// 	FormData.append( key, data[ key ] )
			// })
			// Decided to use QS library instead for both browser and Node support
			data = qs.stringify( data )
		}

		return data
	},
	_buildOptions: function( type, action, data, options ){

		data = this._buildData( action, data, type === 'POST' )

		let defaultOptions = {
			url    : this._get_ajaxurl(),
			method : type,
			headers: {
				"X-CSRF-TOKEN"    : data.nonce,
				"X-Requested-With": "XMLHttpRequest"
			}
		}

		// Merge any global axios options defined in setup into default options
		if( ( 'axios' in this._options ) && this._options.axios.length > 0 ){
			defaultOptions = Object.assign( defaultOptions, this._options.axios )
		}

		if( type === 'POST' ){
			defaultOptions.data = data
		} else {
			defaultOptions.params = data
		}

		console.log( this._options )

		defaultOptions.transformResponse = ( data ) => {
			const jsonDATA = JSON.parse( data )

			if ( this._options.returnData && jsonDATA && ('data' in jsonDATA) ) {
				console.log( 'jsonDATA', jsonDATA.data )
				return jsonDATA.data
			}

			return data
		}

		options = Object.assign( defaultOptions, options )
		return options
	},
	post: async function( action, data, options ){
		options = this._buildOptions('POST', action, data, options )
		return !this._options.returnOnlyData ? axios.request( options ) : this._data_only( options )
	},
	get: async function( action, data, options ){
		options = this._buildOptions( 'GET', action, data, options )
		return !this._options.returnOnlyData ? axios.request( options ) : this._data_only( options )
	},
	_data_only: async function( options ){
		try {
			const result = await axios.request( options )
			return result && ('data' in result) ? result.data : result;
		} catch ( error ) {
			throw new Error( error )
		}
	}
}