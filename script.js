const express = require("express");
const app = express();
const { MongoClient , ObjectId } = require("mongodb");
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

app.put("/assignmentor",async(req,res)=>{
  try {
    const connection = await MongoClient.connect(URL);
    const db = connection.db("node_mongo");
    const collection = db.collection("students");
    const mentorcollection = db.collection("mentors")
    let student_id = new ObjectId(req.body.student_id)
    let mentor_id = new ObjectId(req.body.mentor_id)


    const mentor=await mentorcollection.findOne({_id:mentor_id})
    const student = await collection.findOne({_id:student_id})
    const previous_mentor = student.mentor
    await collection.updateOne({_id:student_id},{$set:{previous_mentors:previous_mentor.name}})
    await collection.updateOne({_id:student_id},{$set:{mentor:{"_id":mentor._id,"name":mentor.name,"age":mentor.age,"Expertise":mentor.expertise}}})
    await mentorcollection.updateOne({_id:mentor_id},{$push:{students:student}})
    res.json({
      "message":"mentor Assigned successfully",
      "mentor_informations":mentor,
    })
    await connection.close()
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something Went Wrong" });
  }
})

app.put("/assignmultiplestudents",async(req,res)=>{
  try {
    const connection = await MongoClient.connect(URL)
    const db = connection.db("node_mongo");
    const student_collection = db.collection("students")
    const mentor_collection = db.collection("mentors")
    let mentor_id = new ObjectId(req.body.mentor_id)
    let students = req.body.students



    await mentor_collection.updateOne({_id:mentor_id},{
      $push:{
        students:{$each:students}
      }
      // $set:{students:students}
    })
    await connection.close()
    res.json("success")
  } catch (error) {
    
    console.log(error);
    res.status(500).json({ message: "Something Went Wrong" });
  }
 
})

app.get("/getmentorstudents",async(req,res)=>{
 
  try {
    const mentor_id = new ObjectId(req.body.mentor_id)
    const connection = await MongoClient.connect(URL)
    const db = connection.db("node_mongo")
    const mentor_collection = db.collection("mentors")
    const student_collection = db.collection("students")
    const mentor = await mentor_collection.findOne({_id:mentor_id})

    console.log(mentor.name)
    res.json({"mentorname":mentor.name,"students":mentor.students})
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something Went Wrong" });   
  }

})

app.get("/previousmentors",async(req,res)=>{
  try {
    const student_id = new ObjectId(req.body.student_id)
    const connection = await MongoClient.connect(URL)
    const db = connection.db("node_mongo")
    const mentor_collection = db.collection("mentors")
    const student_collection = db.collection("students")
    const student = await student_collection.findOne({_id:student_id})
    console.log(student)
    res.json(student.previous_mentors)

  } catch (error) {
    
  }
})