const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://naw284:5gAzyh7hx3ZEOPqk@cluster0.qn8iwpp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/todolistDB", {useNewUrlParser: true});

const itemsSchema = {
    name: String
};

const Item = mongoose.model ("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your todolist!"
});

const item2 = new Item({
    name: "Hit the + button to add a new item."
});

const item3 = new Item({
    name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

    Item.find({})
    .then(foundItems => {

        if (foundItems.length === 0) {
            Item.insertMany(defaultItems)
            .then(() => {
                console.log("Default items saved.");
            })
            .catch((err) => {
                console.log(err);
            });
            res.redirect("/");
        } else {
            res.render("list", {
                listTitle: "Today",
                newListItems: foundItems
            });
        }
    })
    .catch(err => {
        console.error(err);
    });

});

app.get("/:customListName", function(req, res) {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({ name: customListName })
    .then(foundList => {
        if (!foundList) {
            const list = new List({
                name: customListName,
                items: defaultItems
            });
        
            list.save();

            res.redirect("/" + customListName);
        } else {
            res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
        }
    })
    .catch(err => {
        console.error(err);
    });
});

app.post("/", function(req, res) {
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if (listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({ name: listName })
        .then(foundList => {
            if (foundList) {
                foundList.items.push(item);
                return foundList.save();
            } else {
                throw new Error("List not found");
            }
        })
        .then(() => {
            res.redirect("/" + listName);
        })
        .catch(err => {
            console.error(err);
        });

    }

});

app.post("/delete", function(req, res) {

    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        Item.findByIdAndDelete(checkedItemId)
        .then(() => {
            console.log("Successfully deleted checked item.");
            res.redirect("/");
        })
        .catch((err) => {
            console.log(err);
        });
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}})
        .then((foundList) => {
            res.redirect("/" + listName);
        })
        .catch((err) => {
            console.log(err);
        });
    }

});

app.post("/work", function(req, res) {
    let item = req.body.newItem;
    workItems.push(item);
    res.redirect("/work");
});

app.get("/about", function(req, res) {
    res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}

app.listen(port, function() {
    console.log("Server started successfully.");
});