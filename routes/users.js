var express = require("express");
const userController = require("../controllers/userController");
const { ensureAuthenticated } = require("../config/auth");
const User = require("../models/users");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
var userRouter = express.Router();
userRouter.use(bodyParser.json());
userRouter.route("/").get(userController.index).post(userController.regist);
userRouter
  .route("/login")
  .get(userController.login)
  .post(userController.signin);
userRouter.route("/logout").get(userController.signout);
userRouter
  .route("/dashboard")
  .get(ensureAuthenticated, userController.dashboard);

userRouter.post("/api/login", async (req, res, next) => {
  const { username, password } = req.body;
  const user = await User.findOne({
    username: username,
  });
  if (!user) {
    return res.status(404).json({
      message: "user is not found",
    });
  }
  if (user) {
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const payload = {
        id: user.id,
        token_type: "access-token",
      };
      const accessToken = jwt.sign(payload, "secret", {
        expiresIn: "1h",
      });
      res.json({
        message: "Login successfully",
        accessToken,
      });
    } else {
      return res.status(400).json({
        message: "username or password is incorrect",
      });
    }
  }
});
module.exports = userRouter;
