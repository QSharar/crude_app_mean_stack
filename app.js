var express = require("express");
var bp = require("body-parser");
var path = require("path");
var mongoose = require("mongoose");
var spawn = require("child_process").spawn;
var exphbs = require("express-handlebars");


var app = express();

app.use("/public" , express.static(path.join(__dirname, "public")));

app.engine("handlebars", exphbs());
app.set("view engine", 'handlebars')

mongoose.connect('mongodb://localhost/nodekb');
let db = mongoose.connection;

db.once("open" , () => {
    console.log("Connected to mongodb");
});

db.on("error", (err) => { 
    console.log(err);
});

let Article  = require("./models/article");

app.use(bp.urlencoded({extended: false}));
app.use(bp.json());

app.use((req, res, next) => {
    console.log(`${req.method} --> ${req.url}`);
    next();
});

app.get("/", (req, res) => {
    
    Article.find( {}, (err, articles) =>{ 
        if(err){
            console.log(err);
        }else{
            res.render("allarticles", {articles: articles}); 
        }
    });
});


app.get("/add", (req, res) => {
    res.render("add");
});

app.post("/add", (req, res) => {
    let article = new Article();
   
    setDBValues(article, req);

    article.save((err) => {
        if(err){
            console.log(err);
        }else{
            res.redirect("/");
        }
    });
});

app.get("/edit/:id", (req, res) => {
    Article.findById(req.params.id, (err, article) => {
         if(err){
            console.log(err);
        }else{
            res.render('edit', {article: article});
        }
    });
});


app.get("/article/:id", (req, res) => {
    Article.findById(req.params.id, (err, article) =>{
        if(err){
            console.log(err);
        }else{
            console.log(article);
            res.render('article', {article: article});
        }
    });
});

app.post("/edit/:id", (req, res) => {
    
    let article = {};

    setDBValues(article, req);

    let query = {_id: req.params.id};
    
    Article.update(query, article,  (err) => {
        if(err){
            console.log(err);
        }else{
     
            res.redirect("/");
        }
    });
});


app.post("/delete/:id", (req, res) => {
    let query = {_id: req.params.id};
    Article.remove(query, (err) => {
        if(err){
            console.log(err);
        }else{
            console.log("deleted");
            res.redirect("/");
        }
    });
});

function setDBValues(article, req){

    article.id=req.body._id;
    article.body = req.body.body;
    article.author = req.body.author;
    article.title = req.body.title;
}


app.listen(9000);

spawn("open", ["http://localhost:9000"]);