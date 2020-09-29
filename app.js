var express=require("express")
var app=express()
var bodyParser=require("body-parser")
var mongoose=require("mongoose")
var methodOverride=require("method-override")
var passport=require("passport")
var localStrategy=require("passport-local")
var flash=require("connect-flash")


mongoose.connect("mongodb://localhost/dbms",{useNewUrlParser:true,useUnifiedTopology:true})

var Faculty = require("./models/faculty.js")
var Publication = require("./models/publication.js")
var User=require("./models/user.js")

app.use(methodOverride("_method"))
app.use(express.static(__dirname+"/public"))
app.use(bodyParser.urlencoded({extended:true}))
app.use(flash())

app.set("view engine","ejs")



app.use(require("express-session")({
	
	secret:"arsene",
	resave:false,
	saveUninitialized:false
}));

app.use(passport.initialize())
app.use(passport.session())

passport.use(new localStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())


app.use(function(req,res,next){
	
	res.locals.currentUser=req.user,
	res.locals.success=req.flash("success"),
	res.locals.error=req.flash("error"),
	next();
	
})


app.get("/",function(req,res){
	
	res.render("home")
})

app.get("/aboutus",function(req,res){
	res.render("aboutus")
})

app.get("/faculties",function(req,res){
	
	Faculty.find({},function(err,faculties){
		res.render("faculty/faculties",{faculties:faculties})
	})
	
})

app.get("/faculties/new",function(req,res){
	
	res.render("faculty/new")
})

app.post("/faculties",function(req,res){
	
	var newFaculty = req.body.faculty
	newFaculty.author = req.user
	
	Faculty.create(newFaculty,function(err,faculty){
		if(err){
			console.log(err)
		}else{
			console.log(faculty)
			res.redirect("/faculties")
		}
	})
})

app.get("/faculties/:id",function(req,res){
	
	Faculty.findById(req.params.id).populate("author").exec(function(err,faculty){
		
		res.render("faculty/show",{faculty:faculty})
	})
})

app.get("/faculties/:id/update",checkFacultyOwnership,function(req,res){
	
	Faculty.findById(req.params.id,function(err,faculty){
		res.render("faculty/update",{faculty:faculty})
	})
})

app.put("/faculties/:id",checkFacultyOwnership,function(req,res){
	
	Faculty.findByIdAndUpdate(req.params.id,req.body.faculty,function(err,faculty){
		if(err){
			console.log(err)
		}else{
			res.redirect("/faculties/"+req.params.id)
		}
	})
})
app.get("/faculties/:id/add/sponseredprojects",checkSRICC,function(req,res){
	
	Faculty.findById(req.params.id,function(err,faculty){
		res.render("faculty/add",{faculty:faculty,detail:"sponseredprojects"})
	})
})

app.get("/faculties/:id/add/:detail",checkFacultyOwnership,function(req,res){
	
	Faculty.findById(req.params.id,function(err,faculty){
		res.render("faculty/add",{faculty:faculty,detail:req.params.detail})
	})
})
app.put("/faculties/:id/add",function(req,res){
	
	
	
	Faculty.findById(req.params.id,function(err,faculty){
		if(err){
			console.log(err)
		}else{
			if(req.body.course != undefined){
				faculty.coursesTaught.push(req.body.course)
			}else if(req.body.award != undefined){
				faculty.awardsHonors.push(req.body.award)
			}else if(req.body.note!=undefined){
				faculty.courseNotes.push(req.body.note)
			}else{
				faculty.sponseredProjects.push(req.body.project)
			}
			
			faculty.save(function(err,faculty){
				if(err){
					console.log(err)
				}else{
					res.redirect("/faculties/"+req.params.id)
				}
			})
		}
	})
})


app.get("/faculties/:id/publications",function(req,res){
	
	Faculty.findById(req.params.id).populate("publications").exec(function(err,faculty){
		
		res.render("faculty/publications",{faculty:faculty})
	})
})


app.get("/faculties/:id/keypublications",function(req,res){
	
	Faculty.findById(req.params.id).populate("keypublications").exec(function(err,faculty){
		
		res.render("faculty/keypublications",{faculty:faculty})
	})
})




app.get("/faculties/:id/publications/new",checkPublicationOwnership,function(req,res){
	
	Faculty.findById(req.params.id,function(err,faculty){
		res.render("publication/new",{faculty:faculty})
	})
	
})

app.post("/faculties/:id/publications",checkPublicationOwnership,function(req,res){
	

	
	Faculty.findById(req.params.id,function(err,faculty){
		if(err){
			console.log(err)
		}else{
			var newPublication = req.body.publication
			newPublication.isVerified = 0;
			var author={
				username:faculty.name,
				id:req.user
			}
			newPublication.author = author
			
			if(req.body.key == "yes"){
				
				if(faculty.keycount == undefined || faculty.keycount<5){

					Publication.create(newPublication,function(err,publication){
						faculty.publications.push(publication)
						faculty.keypublications.push(publication)
						faculty.save()
						res.redirect("/faculties/"+req.params.id+"/publications")
					})
					
					if(faculty.keycount == undefined){
						faculty.keycount=1;
					}else{
						faculty.keycount=faculty.keycount+1;
					}
					
				}else{
					req.flash("error","No more key publications can be added !!")
					res.redirect("back")
				}
				
			}else{
					Publication.create(newPublication,function(err,publication){
						faculty.publications.push(publication)
						faculty.save()
						res.redirect("/faculties/"+req.params.id+"/publications")
					})
			}
			
			
			
			
		}
	})
})

app.get("/faculties/:id/publications/:pubid",function(req,res){
	
	Faculty.findById(req.params.id,function(err,faculty){
		if(err){
			console.log(err)
		}else{
			Publication.findById(req.params.pubid,function(err,publication){
				if(err){
					console.log(err)
				}else{
					res.render("publication/show",{faculty:faculty,publication:publication})
				}
			})
		}
	})
	
	
})
app.get("/faculties/:id/publications/:pubid/verify",checkLibrary,function(req,res){
	
	Faculty.findById(req.params.id,function(err,faculty){
		if(err){
			console.log(err)
		}else{
			Publication.findById(req.params.pubid,function(err,publication){
				publication.isVerified=1;
				publication.save()
				res.redirect("/faculties/"+req.params.id+"/publications")
			})
		}
	})
})
app.get("/faculties/:id/publications/:pubid/edit",checkPublicationOwnership,function(req,res){
	
	Faculty.findById(req.params.id,function(err,faculty){
		if(err){
			console.log(err)
		}else{
			Publication.findById(req.params.pubid,function(err,publication){
				res.render("publication/edit",{faculty:faculty,publication:publication})
			})
		}
	})
})

app.put("/faculties/:id/publications/:pubid",checkPublicationOwnership,function(req,res){
	
	Faculty.findById(req.params.id,function(err,faculty){
		if(err){
			console.log(err)
		}else{
			Publication.findByIdAndUpdate(req.params.pubid,req.body.publication,function(err,publication){
				if(err){
					console.log(err)
				}else{
					res.redirect("/faculties/"+req.params.id+"/publications/"+req.params.pubid)
				}
			})
		}
	})
})

app.delete("/faculties/:id/publications/:pubid",checkPublicationOwnership,function(req,res){
	
	Faculty.findById(req.params.id,function(err,faculty){
		if(err){
			console.log(err)
		}else{
			Publication.findByIdAndRemove(req.params.pubid,function(err,publication){
				if(err){
					console.log(err)
				}else{
					res.redirect("/faculties/"+req.params.id+"/publications")
				}
			})
		}
	})
})


app.delete("/faculties/:id",checkEstablishment,function(req,res){
	
	Faculty.findByIdAndRemove(req.params.id,function(err,faculty){
		if(err){
			console.log(err)
		}else{
			faculty.publications.forEach(function(publication){
				
				Publication.findByIdAndRemove(publication._id,function(err,pubdeleted){
					if(err){
						console.log(err)
					}else{
						console.log(pubdeleted)
					}
				})
			})
			res.redirect("/faculties")
		}
	})
	
})


app.get("/publications",function(req,res){
	
	Publication.find({},function(err,publications){
		if(err){
			console.log(err)
		}else{
			res.render("publication/publications",{publications:publications})
		}
		
	})
})

app.get("/publications/:pubid",function(req,res){
	
	Publication.findById(req.params.pubid,function(err,publication){
		if(err){
			console.log(err)
		}else{
			res.render("publication/show2.ejs",{publication:publication})
		}
	})
})



app.get("/register",checkEstablishment,function(req,res){
	res.render("index/register")
})

app.post("/register",function(req,res){
	
	User.register(new User({username:req.body.username}),req.body.password,function(err,user){
		if(err){
			req.flash("error",err.message)
			res.redirect("back")
		}else{
			passport.authenticate("local")(req,res,function(){
				res.redirect("/faculties/new")
			})
			
		}
	})
})

app.get("/login",function(req,res){
	res.render("index/login")
})
    
app.post("/login",passport.authenticate("local",{
	
	successRedirect:"/faculties",
	failureRedirect:"/login"
}),function(req,res){
		
})

app.get("/logout",function(req,res){
	req.logout();
	//req.flash("success","Successfully logged out ")
	res.redirect("/faculties")
})


function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
	   return next();
	   }
	req.flash("error","You need to login first !!")
	res.redirect("/login")
}

function checkEstablishment(req,res,next){
	if(req.isAuthenticated()){
		
		if(req.user.username == 'Establishment'){
			next();
		}else{
			req.flash("error","You don't have permission for that !!")
			res.redirect("back")
		}
		
	}else{
		req.flash("error","You need to login first !!")
		res.redirect("/login")
	}
}

function checkLibrary(req,res,next){
	if(req.isAuthenticated()){
		
		if(req.user.username == 'Library'){
			next();
		}else{
			req.flash("error","You don't have permission for that !!")
			res.redirect("back")
		}
		
	}else{
		req.flash("error","You need to login first !!")
		res.redirect("/login")
	}
}

function checkSRICC(req,res,next){
	if(req.isAuthenticated()){
		
		if(req.user.username == 'SRICC'){
			next();
		}else{
			req.flash("error","You don't have permission for that !!")
			res.redirect("back")
		}
		
	}else{
		req.flash("error","You need to login first !!")
		res.redirect("/login")
	}
}

function checkFacultyOwnership(req,res,next){
	
	if(req.isAuthenticated()){
		
		Faculty.findById(req.params.id,function(err,faculty){
			if(err){
				console.log(err)
			}else{
				
				if(req.user._id.equals(faculty.author._id)){
					next();
				}else{
				req.flash("error","You don't have permission for that !!")
				res.redirect("back")
				}
			}
		})
		
	}else{
		req.flash("error","You need to login first !!")
		res.redirect("/login")
	}
}

function checkPublicationOwnership(req,res,next){
	
	if(req.isAuthenticated()){
		
		Faculty.findById(req.params.id,function(err,faculty){
			if(err){
				console.log(err)
			}else{
				
				if(req.user._id.equals(faculty.author._id) || req.user.username == 'Library'){
					next();
				}else{
				req.flash("error","You don't have permission for that !!")
				res.redirect("back")
				}
			}
		})
		
	}else{
		req.flash("error","You need to login first !!")
		res.redirect("/login")
	}
}


app.listen(process.env.PORT||3000,process.env.IP,function(){
	
	console.log("Server up")
})