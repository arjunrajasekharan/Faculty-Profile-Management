var mongoose =require("mongoose")

var publicationSchema = new mongoose.Schema({
	title:String,
	id:Number,
	year:String,
	type:String,
	content:String,
	isVerified:Number,
	author:{
		username:String,
		id:{
			type:mongoose.Schema.Types.ObjectId,
			ref:"User"
		}
	}
	
})

var Publication = mongoose.model("Publication",publicationSchema)

module.exports = Publication