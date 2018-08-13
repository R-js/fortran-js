'use strict'

function tokensLocation(file) {

	return function tokenLocation(begin, end /*inclusive */ ) {
		return {
			file,
			channel,
			/* tag marker */
			begin,
			/* context for rules */
			endInclusive,
			length() {
				return endInclusive - begin + 1
			}
		} //obj
	}
}


const defineToken = (matchers, tokenId) => (channel) => {

	return {
		//scan: returns --location, --tentative, --noMatch
		//    scan uses *cursor*, has global mode, has module accesses file(module)
		//    evaluates on character at a time,
		//    token keeps internal state
		//rstscan: continue scanning but reset internal state        

	}

}




//cursor implements iterator interface
function scan(cursor) {
	cursor.next()
}



module.exports = {
	tokensFrom,
}