const router = require("express").Router();
const bodyParser = require("body-parser");
const Course = require("../models/courses");
const jwt = require("jsonwebtoken");
router.use(bodyParser.json());

const verifyToken = (req, res, next) => {
  // Get auth header value
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader === "undefined") {
    return res.status(403).json({
      message: "Token is required",
    });
  }
  const bearer = bearerHeader.split(" ");
  try {
    console.log("token: ", bearer[1].trim());
    const decoded = jwt.verify(bearer[1].trim(), "secret");
    req.user = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({
      message: "Token is invalid",
    });
  }
};
router.post("/", verifyToken, async (req, res, next) => {
  const { courseName, courseDescription } = req.body;
  const course = new Course({
    courseName,
    courseDescription,
  });

  await course.save();
  res.json({
    message: "Course added successfully",
    course,
  });
});

//get all courses
router.get("/", verifyToken, async (req, res, next) => {
  const courses = await Course.find({});
  res.json({
    message: "Get All Course successfully",
    courses,
  });
});

//get course by id
router.get("/:id", verifyToken, async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    return res.json({
      message: "Get Course by id successfully",
      course,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Course not found",
    });
  }
});

//update course by id
router.put("/:id", verifyToken, async (req, res, next) => {
  try {
    const { courseName, courseDescription } = req.body;
    const course = await Course.findById(req.params.id);
    course.courseName = courseName ? courseName : course.courseName;
    course.courseDescription = courseDescription
      ? courseDescription
      : course.courseDescription;
    await course.save();
    res.json({
      message: "Course updated successfully",
      course,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Course not found",
    });
  }
});

//delete course by id
router.delete("/:id", verifyToken, async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    await course.deleteOne();
    res.json({
      message: "Course deleted successfully",
      id: req.params.id,
    });
  } catch (error) {
    return res.status(404).json({
      message: "Course not found",
    });
  }
});

module.exports = router;
