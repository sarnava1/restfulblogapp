var express=require("express");
var bodyParser=require('body-parser');
var app=express();
var mongoose=require("mongoose");
var methodOverride=require("method-override")
var expressSanitizer=require("express-sanitizer");

//connecting to mongodb
mongoose.connect("mongodb://localhost/blog_app");


app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
//the methodOverride should be after the bodyParser
app.use(methodOverride("_method"));
app.use(expressSanitizer());

//the schema for our db
var blogSchema=new mongoose.Schema({
   title:String,
   image:String,
   created:{type:Date,default:Date.now},
   body:String
});

//creating our db model
var Blog=mongoose.model("Blog",blogSchema);



//redirect to /blogs if we get request for /
app.get("/",function(req,res){
  res.redirect("/blogs");
});

//will render all info about the blogs
app.get("/blogs",function(req,res){
    Blog.find({},function(err,blogs){
        if(err){
            console.log(err);
        }else{
            res.render("index",{blogs:blogs});
        }
    });
 // res.render("index");
});

//the post route where data will be inserted into the db and we will be directed to a new page
app.post("/blogs",function(req,res){
    //will sanitize the body part of our blog from all js elements
    req.body.blog.body=req.sanitize(req.body.blog.body);
    //creates a new blog by passing the data 
    Blog.create(req.body.blog,function(err,newBlog){
        if(err){
            res.render("new");
        }else{
            res.redirect("/blogs");
        }
    });
});

//the new page will be rendered on going to the new route which will have the form
app.get("/blogs/new",function(req, res) {
    res.render("new");
});



//will display the details of a particular blog
app.get("/blogs/:id",function(req, res) {
  Blog.findById(req.params.id,function(err,foundBlog){
      if(err){
          res.redirect("/blogs");
      }else{
          res.render("show",{blog:foundBlog});
      }
  });
});

//will render the edit page when we put in a request for this route
app.get("/blogs/:id/edit",function(req, res) {
   Blog.findById(req.params.id,function(err,foundBlog){
       if(err){
           res.redirect("/blogs");
       }else{
           res.render("edit",{blog:foundBlog});
       }
   }); 
});

//will update a particular blog and redirect us to that page
app.put("/blogs/:id",function(req,res){
    req.body.blog.body=req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id,req.body.blog,function(err,updatedBlog){
        if(err){
            res.redirect("/blogs");
        }else{
            res.redirect("/blogs/"+req.params.id);
        }
    });
});

//will delete a particular blog
app.delete("/blogs/:id",function(req,res){
    Blog.findByIdAndRemove(req.params.id,function(err){
        if(err){
            res.redirect("/blogs");
        }else{
            res.redirect("/blogs");
        }
    });
});


//the app is listening to the server 
app.listen(process.env.PORT,process.env.IP,function(){
    console.log("blog app server has started");
});


