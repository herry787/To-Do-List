//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose=require("mongoose");
const { json } = require("body-parser");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistdb",{useNewUrlParser:true},{ useUnifiedTopology: true });
//so in below line as you see we declare item schema which tells database on what structure
// did data has to be saved
const itemschema={name:String}

const customschema={name:String,
customitem:[itemschema]}
//so in below line as you see we create a model name Item with collections name
//item but remeber that mongoose autometically make it plurel means in database it seems  to be "items"

const Item=mongoose.model("item",itemschema);
const customList=mongoose.model("customlist",customschema);

//and in below we make objects in the model ans store as schema is derived

const item1=new Item({
  name:"Welcome to your To do list"})
const item2=new Item({
  name:"Hit the + button to add new item"})
const item3=new Item({
  name:"Hit these to delete The items"})
//this default item array is used to store items and basically we add some item  from starting 

const defaultitem=[item1,item2,item3];


app.get("/", function(req, res) {
  //this founditems is ussed to make sure if there is no element then default item to be showed 
  //otherwise it show item that are alreay there 
  //the founditem is is a variable that is doing these by find method of model
Item.find({},function(err,founditems){

if(founditems.length===0){
  
Item.insertMany(defaultitem,function(err){
  if(err)
  {
    console.log(err)
  }
  else
  {
  console.log("Succesfully inserted Default items")  
  }  
});
res.redirect("/");
}

else
{
  res.render("list", {listTitle: "Today", newListItems: founditems});
 
}

})
})

app.get("/:customname",function(req,res){
//console.log(req.params.customname);
const customname=_.capitalize(req.params.customname);

customList.findOne({name:customname},function(err,founditems){
if(!err){
  if(!founditems){
 //create new one
 const list=new customList({
  name:customname,
  customitem:defaultitem
})
list.save()
}
else
{
  res.render("list", {listTitle:customname, newListItems: founditems.customitem} );
}
}
})
})
//now in the list.ejs the website page when item is been added by submit button then post  "/" route is 
//activated  and by the help of input name we just add those item  to database and toshow 
//insnatly in the website we just redirect to "/"
//whatit does that when we go to "/" route it fetch all the items from database to show and all 
//the items that are default and we added update are display properly
app.post("/", function(req, res){
  const listname=req.body.list;
  const ln=listname.split(" ").join("")
  const itemName = req.body.newItem;
  const items=new Item({
    name:itemName
  })

 if(ln==="Today"){
  items.save()
  res.redirect("/")

 }
else{
  customList.findOne({name:ln},function(err,foundList){
    foundList.customitem.push(items);
    foundList.save()
    res.redirect("/"+ln)
  })
  
}
});

app.post("/delete",function(req,res){
  const  c=req.body.checkbox;//get the id 
  const k=req.body.lt;//get the name of list from which item has to be deleted
const s=k.split(" ").join("");
 
if(s === "Today") {
  Item.findByIdAndRemove(c, function (err) {
    if(!err)
 {
    console.log("Successful deletion");
    res.redirect("/")
  }
  });
}
else{
 customList.findOneAndUpdate({name: s},{$pull:{customitem: {_id: c}}},function(err,foundlist){
   if(!err)
   {
     //console.log(foundlist)
     res.redirect("/"+s)
   }

 });
}
})
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
