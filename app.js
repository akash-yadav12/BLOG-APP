var  bodyParser = require("body-parser"),
mongoose        = require("mongoose"),
express         = require("express"),
expressSanitizer= require("express-sanitizer"),
methodOverride  = require("method-override"),
app             = express();


if (process.env.NODE_ENV !== "production"){
	require('dotenv').config()
}

const dbUrl = process.env.db_url || "mongodb://localhost/restful_blog_app"
//app config
// mongoose.set("useUnifiedTopology",true);
// mongoose.connect(,{useNewUrlParser:true});
mongoose.set('useUnifiedTopology',true);

mongoose.connect(dbUrl, {useNewUrlParser:true})
  .then(()=>{
    console.log('Connected to database')
  })
  .catch((err)=>{
    console.log('failed',err)
  })


app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));
// mongoose/model config
var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created:{type:Date , default: Date.now}
});

var Blog =mongoose.model("Blog",blogSchema);
// Blog.create({
// 	title:"test blog",
// 	image:"http://www.holifestival.org/images/holi-image-4-big.jpg",
// 	body:"hey its  a nice image"
// });

//restful routes
app.get("/",function(req,res){
	res.redirect("/blogs");
});

app.get("/blogs",function(req,res){
	Blog.find({}, function(err, blogs){
		if(err){
			console.log(err);
		}else{
			res.render("index", {blogs: blogs});
		}
	});
	// res.render("index");
});
//NEW ROUTE	
app.get("/blogs/new", function(req,res){
	res.render("new");
});
//CREATE ROUTE
app.post("/blogs", function(req,res){
	//create blogs
	console.log(req.body);
	req.body.blog.body = req.sanitize(req.body.blog.body);
	console.log("=======");
	console.log(req.body);
	Blog.create(req.body.blog, function(err, newBlog){
		if(err){
			res.render("new");
		}else{
			res.redirect("/blogs");
		}
	});
});

//Show ROUTE
app.get("/blogs/:id", function(req,res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect("/blogs");
		}else{
			res.render("show", {blog:foundBlog})
		}
	});
});

//EDIT ROUTE
app.get("/blogs/:id/edit", function(req,res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect("/blogs");
		}else{
			res.render("edit", {blog: foundBlog});
		}
	});
});

//UPDATE ROUTE
app.put("/blogs/:id", function(req,res){
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err , updatedBLog){
		if(err){
			res.redirect("/blogs");
		}
		else{
			res.redirect("/blogs/" +req.params.id);
		}
	});
});

//DELETE ROUTE
app.delete("/blogs/:id", function(req, res){
	//destroy blog
	Blog.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/blogs");
		}else{
			res.redirect("/blogs");
		}
	})
})


const port = process.env.PORT || 3000
app.listen(port, function(){
	console.log("SERVER IS RUNNING on "+port);
})