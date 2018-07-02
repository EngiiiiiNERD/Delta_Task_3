     var express               = require("express");
     var app                   = express();
     var mongoose              = require("mongoose");
     var bodyParser            = require("body-parser");
     var passport              = require("passport");
     var LocalStrategy         = require("passport-local");
     var passportLocalMongoose = require("passport-local-mongoose");
     var User                  = require("./models/user");
     var Info                  = require("./models/info");
     var Appointment           = require("./models/appointment");
     var CurrentUser;
     
mongoose.connect("mongodb://localhost/auth");
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended : true}));
app.use(require("express-session")({
    secret:"EngiiiiiNERD",
    resave: false,
    saveUninitialized: false
}));


app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//ROUTES
app.get("/",function(req,res){
   res.render("home");       
});

app.post("/secret",isLoggedIn,function(req,res){
   var direct = "/" + req.body.my_username + "/My_Calendar/"+req.body.my_input;
   res.redirect(direct);
});

app.post("/add_event",isLoggedIn,function(req,res){
         // var me =  req.body.user+"/My_Calendar/"+req.body.month+"/"+req.body.date+"/"+req.body.year+"/add_event";
        var newData = {
              user   : req.body.user,
              month  : req.body.month,
              date   : req.body.date,
              year   : req.body.year
            }
        res.render("newEvent",{newData : newData});
});



app.post("/:user/My_Calendar/:month/:date/:year",isLoggedIn,function(req,res){

        Info.find({ userinfo : req.params.user },function(err,rawData){
                  if(err){
                            console.log(err);
                  }else{
                         Appointment.create({
                                       unique_id   : req.params.user+"/"+req.params.month+"/"+req.params.date+"/"+req.params.year,           
                                       title       : req.body.title, 
                                       description : req.body.description,  
                                       start_time  : req.body.start_time,  
                                       end_time    : req.body.end_time    
                                            },function(err,registeredData){
                                        if(err){
                                                  console.log(err);
                                        }else{    
                                                  rawData[0].appointment.push(registeredData);
                                                  rawData[0].save();
                                                  var temp = "/"+req.params.user+"/My_Calendar/"+req.params.month+"/"+req.params.date+"/"+req.params.year;             
                                                  res.redirect(temp);                                             
                                    }
                           });    
                  }       
        });
});

//=============================================================================
app.get("/:user/My_Calendar/:month/:date/:year",isLoggedIn,function(req,res){

    Info.find({userinfo : req.params.user},function(err,foundUser){
        
         Info.findById(foundUser[0]._id).populate("appointment").exec(function(err,UpdatedData){
             
       var data = {
              user   : req.params.user,
              month  : req.params.month,
              date   : req.params.date,
              year   : req.params.year
            }   
                //REAL LOGIC
                var array = [];
                var secret = req.params.user+"/"+req.params.month+"/"+req.params.date+"/"+req.params.year;
                //console.log("SECRET :- "+ secret);
                UpdatedData.appointment.forEach(function(u){
                   if(u.unique_id == secret)
                   {
                       array.push(u);
                   }
                });
                console.log(array + " Is the array");
                console.log(array.length);
                
                res.render("events",{data : data , UpdatedData : array });             
         });
    });        

});


//SignUp form
app.get("/register",function(req,res){
   res.render("register");       
});

app.get("/:username/My_Calendar",isLoggedIn,function(req,res){
   res.render("calendar",{CurrentUser : CurrentUser}); 
});




//handeling user sign up
app.post("/register",function(req,res){
   req.body.username
   req.body.password
   User.register(new User({username : req.body.username}),req.body.password,function(err,user){
      if(err){
                console.log(err);
                return res.render("register");
      } 
          passport.authenticate("local")(req,res,function(){
          CurrentUser = req.body.username;
          Info.create({
              userinfo : CurrentUser
          });
          res.redirect("/"+req.body.username+"/My_Calendar");      
      });
   });
});

//LOGIN ROUTES
app.get("/login",function(req,res){
          res.render("login");    
});

//login logic

app.post("/login",passport.authenticate("local",{
          failureRedirect: "/login"
}),function(req,res){
          CurrentUser = req.body.username;
          res.redirect("/"+req.body.username+"/My_Calendar");
});


app.get("/logout",function(req,res){
   req.logout();
   res.redirect("/");
});

function isLoggedIn(req,res,next){
          if(req.isAuthenticated()){
                    return next();
          }
          res.redirect("/login");
}

app.listen(process.env.PORT,process.env.IP,function(){
          console.log("Server Is Ready");
});