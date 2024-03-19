const express = require("express");
const app = express();
const path = require("path");
const { MongoClient } = require("mongodb");
const bodyParser = require("body-parser");
const cookieparser = require("cookie-parser");
app.use(cookieparser());
const session = require("express-session");
const oneday = 1000 * 60 * 60 * 24;
app.use(
  session({
    saveUninitialized: true,
    resave: false,
    secret: "asd3454#$%$@#324",
    cookie: { maxAge: oneday },
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(__dirname));
app.use("/images", express.static(path.join(__dirname, "images")));
let useremail;
let profile;
let db;
let userscollection;
let collection;
let datacollection;
let ordercollection;
let homecollection;
let paymentcollection;
MongoClient.connect("mongodb://127.0.0.1:27017/")
  .then((client) => {
    console.log("Connected to the database");
    db = client.db("list");
    datacollection = db.collection("store");
    userscollection = db.collection("Users");
    ordercollection = db.collection("order");
    homecollection = db.collection("homePage");
    paymentcollection = db.collection("payment");
  })
  .catch((error) => {
    console.log("Error connecting to the database:", error);
  });

app.post("/log", (req, res) => {
  userscollection
    .find({
      email: req.body.email,
      password: req.body.password,
      username: req.body.username,
    })
    .toArray()
    .then((data) => {
      if (data.length > 0) {
        useremail = req.body.email;
        profile = req.body.username;
        res.sendFile(path.join(__dirname, "home.html"));
      } else {
        res.sendFile(path.join(__dirname, "login.html"));
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Internal Server Error");
    });
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "signUp.html"));
});

app.post("/sign", (req, res) => {
  userscollection
    .find({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
    })
    .toArray()
    .then((data) => {
      if (data.length > 0) {
        res.status(409).send("UserName already Exists");
      } else {
        let obj = {};
        obj.username = req.body.username;
        obj.password = req.body.password;
        obj.email = req.body.email;
        obj.number = req.body.number;
        profile = req.body.username;
        useremail = req.body.email;
        //obj.img = "images/profile.jpeg";
        userscollection.insertOne(obj).then(() => {
          res.sendFile(path.join(__dirname, "home.html"));
        });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Internal Server Error");
    });
});
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return console.log(err);
    }
    res.sendFile(path.join(__dirname, "index.html"));
  });
});

app.get("/product", (req, res) => {
  datacollection
    .find()
    .toArray()
    .then((result) => {
      res.json({ profile: profile, useremail: useremail, products: result });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send("Internal Server Error");
    });
});
app.get("/homeproduct", (req, res) => {
  homecollection
    .find()
    .toArray()
    .then((result) => {
      res.json({ profile: profile, useremail: useremail, products: result });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send("Internal Server Error");
    });
});

app.use(express.json());

app.post("/order", async (req, res) => {
  try {
    let obj = {
      Name: req.body.Name,
      price: req.body.price,
      img: req.body.img,
      trackingId: req.body.trackingId,
      orderdata: req.body.orderdata,
      email: req.body.email,
    };

    await ordercollection.insertOne(obj);

    res.status(200).send("Order placed successfully!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
app.post("/delete", async (req, res) => {
  try {
    let obj = {
      Name: req.body.Name,
      price: req.body.price,
      img: req.body.img,
    };

    await ordercollection.deleteOne(obj);

    res.status(200).send("Order placed successfully!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
app.get("/orderProduct", (req, res) => {
  ordercollection
    .find()
    .toArray()
    .then((result) => {
      res.json({ profile: profile, useremail: useremail, products: result });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send("Internal Server Error");
    });
});

app.get("/payment", (req, res) => {
  let obj = {};
  obj.name = profile;
  obj.email = useremail;
  paymentcollection.insertOne(obj);
  res.json(obj);
  
});

app.listen(5000, () => {
  console.log("Server Started");
});
