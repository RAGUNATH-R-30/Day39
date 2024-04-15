const express = require("express");
const app = express();
const { MongoClient, ObjectId } = require("mongodb");
const URL = process.env.DB;

app.use(express.json());
app.listen(3000);

//Initial route
app.get("/", (req, res) => {
  res.json({ message: "Api started successfully" });
});

//Route to get all students
app.get("/getstudents", async (req, res) => {
  try {
    const connection = await MongoClient.connect(URL);
    const db = connection.db("node_mongo");
    const collection = db.collection("students");
    const allstudents = await collection.find({}).toArray();
    await connection.close();
    res.json(allstudents);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something Went Wrong" });
  }
});

//Route to create student
app.post("/createstudent", async (req, res) => {
  try {
    const connection = await MongoClient.connect(URL);
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

//Route to create Mentor
app.post("/creatementor", async (req, res) => {
  try {
    const connection = await MongoClient.connect(URL);
    const db = connection.db("node_mongo");
    const collection = db.collection("mentors");
    await collection.insertOne(req.body);
    await connection.close();
    res.json({ Message: "Mentor created successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something Went Wrong" });
  }
});

//Route to get all mentors
app.get("/getmentors", async (req, res) => {
  try {
    const connection = await MongoClient.connect(URL);
    const db = connection.db("node_mongo");
    const collection = db.collection("mentors");
    const allmentors = await collection.find().toArray();
    await connection.close();
    res.json(allmentors);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something Went Wrong" });
  }
});

//route to assign mentor to a student
//student id comes from the request
app.put("/assignmentor", async (req, res) => {
  try {
    const connection = await MongoClient.connect(URL);
    const db = connection.db("node_mongo");
    const collection = db.collection("students");
    const mentorcollection = db.collection("mentors");
    let student_id = new ObjectId(req.body.student_id);
    let mentor_id = new ObjectId(req.body.mentor_id);

    const mentor = await mentorcollection.findOne({ _id: mentor_id });
    const student = await collection.findOne({ _id: student_id });
    const previous_mentor = student.mentor;
    await collection.updateOne(
      { _id: student_id },
      { $set: { previous_mentors: previous_mentor.name } }
    );
    await collection.updateOne(
      { _id: student_id },
      {
        $set: {
          mentor: {
            _id: mentor._id,
            name: mentor.name,
            age: mentor.age,
            Expertise: mentor.expertise,
          },
        },
      }
    );
    await mentorcollection.updateOne(
      { _id: mentor_id },
      { $push: { students: student } }
    );
    res.json({
      message: "mentor Assigned successfully",
      mentor_informations: mentor,
    });
    await connection.close();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something Went Wrong" });
  }
});

//route to assign multiple students to a mentor
//student ids comes from the request as a array
app.put("/assignmultiplestudents", async (req, res) => {
  try {
    const connection = await MongoClient.connect(URL);
    const db = connection.db("node_mongo");
    const collection = db.collection("students");
    const mentorcollection = db.collection("mentors");
    let mentor_id = new ObjectId(req.body.mentor_id);

    const mentor = await mentorcollection.findOne({ _id: mentor_id });
    let studentIds = req.body.students.map(
      (studentId) => new ObjectId(studentId)
    );

    for (const studentId of studentIds) {
      const student = await collection.findOne({ _id: studentId });
      const previous_mentor = student.mentor;
      await collection.updateOne(
        { _id: studentId },
        {
          $set: {
            previous_mentors: previous_mentor,
            mentor: {
              _id: mentor._id,
              name: mentor.name,
              age: mentor.age,
              Expertise: mentor.expertise,
            },
          },
        }
      );
      await mentorcollection.updateOne(
        { _id: mentor_id },
        { $push: { students: student } }
      );
    }
    await connection.close();
    res.json("success");
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something Went Wrong" });
  }
});

//Route to get all the students of the specific mentor
//mentor id comes from the request
app.get("/getmentorstudents", async (req, res) => {
  try {
    const mentor_id = new ObjectId(req.body.mentor_id);
    const connection = await MongoClient.connect(URL);
    const db = connection.db("node_mongo");
    const mentor_collection = db.collection("mentors");
    const student_collection = db.collection("students");
    const mentor = await mentor_collection.findOne({ _id: mentor_id });
    res.json({ mentorname: mentor.name, students: mentor.students });
    await connection.close();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something Went Wrong" });
  }
});

//route to get the previous mentor of the student.
//student id comes from the request
app.get("/previousmentors", async (req, res) => {
  try {
    const student_id = new ObjectId(req.body.student_id);
    const connection = await MongoClient.connect(URL);
    const db = connection.db("node_mongo");
    const mentor_collection = db.collection("mentors");
    const student_collection = db.collection("students");
    const student = await student_collection.findOne({ _id: student_id });
    res.json(student.previous_mentors);
    await connection.close();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something Went Wrong" });
  }
});

//route to get all the students without mentor
app.get("/nomentors", async (req, res) => {
  try {
    const connection = await MongoClient.connect(URL);
    const db = connection.db("node_mongo");
    const student_collection = db.collection("students");
    let nomentors = [];
    let allstudents = await student_collection.find().toArray();
    allstudents.map((student) => {
      student.mentor == "" && nomentors.push(student);
    });
    await connection.close();
    res.json({ message: "sucess", Nomentors: nomentors });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something Went Wrong" });
  }
});
