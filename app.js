var express = require("express"),
app = express(),
methodOverride = require('method-override'),
bodyParser = require("body-parser"),
morgan = require("morgan"),
db = require("./models"),
session = require("cookie-session"),
loginMiddleware = require("./middleware/loginHelper"),
routeMiddleware = require("./middleware/routeHelper");


app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(morgan('tiny'));

app.use(session({
  maxAge : 3600000,
  secret: 'illnevertell',
  name: 'chocolate chip'
}));

app.use(loginMiddleware);

app.get('/', routeMiddleware.ensureLoggedIn, function(req, res){
  res.redirect('/countries');
})

app.get('/signup', routeMiddleware.preventLoginSignup, function(req, res){
  res.render('users/signup');
})

app.post("/signup", function(req,res){
  var newUser = req.body.user;
  db.User.create(newUser, function(err, user){
      if(user){
        req.login(user);
        res.redirect("/countries")
      } else {
        console.log(err);
        res.render("users/signup")
      }
    }
  )
})

app.get("/login", routeMiddleware.preventLoginSignup, function(req,res){
  res.render("users/login");
})

app.post("/login", function(req,res){
  db.User.authenticate(req.body.user, function (err, user){
    if(!err && user !== null){
      req.login(user)
      res.redirect("/countries")
    } else {
      res.render("users/login")
    }
  })
})

// app.get('/', function(req,res){
//   res.redirect('/countries');
// });

// INDEX
app.get('/countries', routeMiddleware.ensureLoggedIn, function(req,res){
  db.Country.find({},function(err,countries){
    if (err) throw err;
    res.render("countries/index", {countries:countries});
  });
});

// NEW
app.get('/countries/new', routeMiddleware.ensureLoggedIn, function(req,res){
  res.render("countries/new");
});

// CREATE
app.post('/countries', routeMiddleware.ensureLoggedIn, function(req,res){
    var country = new db.Country(req.body.country);
    var cities = req.body.cities.split(", ");
    country.cities = cities;
    country.ownerId = req.session.id;
    country.save(function(err){
      if (err) throw err;
      res.redirect('/');
    });
});

// SHOW

app.get('/countries/:id', routeMiddleware.ensureLoggedIn, function(req,res){
  db.Country.findById(req.params.id,function(err,country){
    if (err) throw err;
    res.render("countries/show", {country:country});
  });
});

// EDIT

app.get('/countries/:id/edit', routeMiddleware.ensureLoggedIn, routeMiddleware.ensureCorrectUser, function(req,res){
  db.Country.findById(req.params.id,function(err,country){
    if (err) throw err;
    res.render("countries/edit", {country:country});
  });
});

// UPDATE
app.put('/countries/:id', routeMiddleware.ensureLoggedIn, routeMiddleware.ensureCorrectUser, function(req,res){
  db.Country.findByIdAndUpdate(req.params.id, req.body.country, function(err,country){
    // loop over all keys in object
    // for(var prop in req.body.country){
    //   country.prop = req.body.country[prop];
    // }
    // country.cities = req.body.cities.split(", ");
    // country.save(function(err,country){
      if (err) throw err;
      res.redirect('/');
    // });
  });
});

// DESTROY
app.delete('/countries/:id', routeMiddleware.ensureLoggedIn, routeMiddleware.ensureCorrectUser, function(req,res){
    db.Country.findByIdAndRemove(req.params.id, function(err,book){
      if (err) throw err;
      res.redirect('/');
    });
});

app.get("/logout", function(req,res){
  req.logout();
  res.redirect("/");
})

// CATCH ALL
app.get('*', function(req,res){
  res.render('404');
});

app.listen(3000, function(){
  "Server is listening on port 3000";
});
