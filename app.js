
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose')
const _ = require("lodash")

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://admin-honey:MONGODBKAR-98KMAGNUM@mitsuxhoney.zhgrs7p.mongodb.net/todolistDB')

const itemSchema = mongoose.Schema({

  name: String

})

const Item = mongoose.model('item', itemSchema)

const item1 = new Item ({

  name: "<-- add "

})

const item2 = new Item ({

  name: " delete -->"

})

const item3 = new Item ({

  name: "<--using + or checkbox-->"

})

const defaultItems = [item1, item2, item3] 

const listSchema = mongoose.Schema({

  name: String,

  items: [itemSchema]

})

const List = mongoose.model('list', listSchema)

app.get("/", function(req, res) {

  Item.find( {} )

  .then ( (items) => {

    if (items.length === 0){

      Item.insertMany(defaultItems)

      .then ( () => {

        res.redirect('/')


      })

      .catch((err) => console.log(err)) 

    }

    else {

      res.render('list', { listTitle:"Today", newListItems:items  })

    }

  })

  .catch( (err) => console.log(err) )

});

app.post("/", function(req, res){

  const newItemName = req.body.newItem;

  const ListName = req.body.list

  const newItem = new Item({

    name: newItemName

  })

  if ( ListName === "Today" ) {

    newItem.save()

    res.redirect('/') 

  }

  else {

    List.findOne({name: ListName}) 
    
    .then ( (foundList) => {

      foundList.items.push(newItem)

      foundList.save()

      res.redirect("/" + ListName)


    })

    .catch ( (err) => console.log (err) )

  }
  
  
});

app.post('/delete', (req,res) => {

    const deleteItem = req.body.checkbox

    const listName = req.body.listName

    if (listName == "Today") {

      Item.findByIdAndRemove(deleteItem)

      .then ( () => {

      res.redirect('/')

    })

    .catch ( (err) => console.log(err) )

    }

    else {

      List.findOneAndUpdate( {name: listName}, {$pull: {items: {_id: deleteItem}} }  )

      .then ( () => {})

      .catch ( (err) => console.log(err) )

      res.redirect("/" + listName)

    }

})


app.get("/:customListName", function(req,res){

  const customListName = _.capitalize(req.params.customListName)

  List.findOne({name: customListName})

  .then ( (foundList) => {

      if (!foundList) {

        const list = new List({

          name: customListName, 
      
          items: defaultItems
      
        }) 
      
        list.save()

        res.redirect('/' + customListName)


      }

      else {

        if ( foundList.items.length === 0 ) {

          List.findOneAndUpdate({name: customListName}, {$addToSet: {items: defaultItems}}) 

          .then (() => {})

          .catch( (err) => console.log (err) )

          foundList.save()

          res.redirect("/" + foundList.name)

        }

        else

        res.render('list', {listTitle: foundList.name, newListItems: foundList.items})

      }

  })

  .catch ( (err) => console.log (err) )

});


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
