const express = require("express");
const app = express();
const { MongoClient } = require("mongodb");
const URL = "mongodb+srv://ragunath3003:admin@cluster0.lmyxz0w.mongodb.net/";

app.use(express.json());
app.listen(3000);

app.get("/", (req, res) => {
  res.json({ message: "Api started successfully" });
});

app.get("/getstudents", async (req, res) => {
  try {
    const connection = await  MongoClient.connect(URL);
    const db = connection.db("node_mongo");
    const collection = db.collection("students");
    const allstudents = await collection.find({}).toArray();
    await connection.close()
    res.json( allstudents );
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something Went Wrong" });
  }
});

app.post("/createstudent", async (req, res) => {
  try {
    const connection = await  MongoClient.connect(URL);
    const db = connection.db("node_mongo");
    const collection = db.collection("students");
    await collection.insertOne(req.body);
    await connection.close();
    res.json({ message: "Student created" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something Went Wrong" });
  }
});

app.post("/creatementor",async(req,res)=>{
    try {
        const connection = await  MongoClient.connect(URL);
        const db = connection.db("node_mongo");
        const collection = db.collection("mentors");
        await collection.insertOne(req.body);
        await connection.close();
        res.json({"Message":"Mentor created successfully"});
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something Went Wrong" });
    }
})

app.get("/getmentors",async(req,res)=>{
    try {
        const connection = await  MongoClient.connect(URL);
        const db = connection.db("node_mongo");
        const collection = db.collection("mentors");
        const allmentors = await collection.find().toArray();
        await connection.close()
        res.json(allmentors)
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something Went Wrong" });
    }
})
