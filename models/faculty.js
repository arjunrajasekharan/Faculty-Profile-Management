var mongoose=require("mongoose")

var facultySchema = new mongoose.Schema({
	name:String,
	image:String,
	designation:String,
	yearOfJoining:String,
    highestDegree:String,
    affiliation:String,
    email:String,
    phone:Number,
    resume:String,
    biography:String,
    areaOfResearch:String,
    awardsHonors:[],
    coursesTaught:[],
    courseNotes:[],
	sponseredProjects:[],
	
	publications:[{
		type:mongoose.Schema.Types.ObjectId,
		ref:"Publication"
	}],
	keypublications:[{
		type:mongoose.Schema.Types.ObjectId,
		ref:"Publication"
	}],
	keycount:Number,
    

	author:{
		//username:String,
		
			type:mongoose.Schema.Types.ObjectId,
			ref:"User"
		
	}
})  

var Faculty = mongoose.model("Faculty",facultySchema)

module.exports=Faculty