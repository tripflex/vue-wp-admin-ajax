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

		// If nonce is not defined in data, try to pull from window object first, then try finding an HTML element
		if ( !('nonce' in data) ) {

			if( action in window ){
				data.nonce = window[ action ]
			} else {
				const element = window.document.getElementById( action )
				if( typeof( element ) !== 'undefined' && element !== null ){
					data.nonce = element.value
				}
			}
		}

		// TODO
		// if ( data.nonce.length < 1 ) {
		// 	throw new Error( 'You must specify an nonce to make an admin ajax call! This IS required!')
		// }

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
			if( ! data || data === -1 || data === 0 ){
				return data
			}
			console.log( 'TRANSFORM RESPONSE', data )
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
	post: function( action, data, options ){
		options = this._buildOptions('POST', action, data, options )
		return !this._options.returnOnlyData ? axios.request( options ) : this._data_only( options )
	},
	get: function( action, data, options ){
		options = this._buildOptions( 'GET', action, data, options )
		return !this._options.returnOnlyData ? axios.request( options ) : this._data_only( options )
	},
	_data_only: function( options ){
		return new Promise( function( resolve, reject ){

			axios.request( options ).then( function( result ){
				resolve( result && ('data' in result) ? result.data : result )
			}).catch( function( error ){
				reject( error )
			})

		})
	}
}