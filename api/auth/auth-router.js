const router = require("express").Router();
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../../config/secret");

const User = require("../users/user-model");
const { isValid } = require("../users/user-service");
const { checkPayload } = require("../middleware/checkPayload");
const { checkUsernameUnique } = require("../middleware/checkUsernameUnique");

router.post("/register", checkPayload, checkUsernameUnique, (req, res) => {
  const credentials = req.body;

  if (isValid(credentials)) {
    const rounds = process.env.BCRYPT_ROUNDS || 8;
    const hash = bcryptjs.hashSync(credentials.password, rounds);
    credentials.password = hash;

    User.add(credentials)
      .then((user) => {
        res.status(201).json(user);
      })
      .catch((err) => {
        res.status(500).json(err.message);
      });
  } else {
    res.status(400).json("username and password required");
  }
});

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (isValid(req.body)) {
    User.findBy({ username: username })
      .then(([user]) => {
        if (user && bcryptjs.compareSync(password, user.password)) {
          const token = makeToken(user);
          res.status(200).json({ message: `/welcome/ `, token });
        } else {
          res.status(401).json("invalid credentials");
        }
      })
      .catch((err) => {
        res.status(500).json(err.message);
      });
  } else {
    res.status(400).json("username and password required");
  }
});

function makeToken(user) {
  const payload = {
    subject: user.id,
    username: user.username,
    role: user.role,
  };
  const options = {
    expiresIn: "3600s",
  };
  return jwt.sign(payload, jwtSecret, options);
}

module.exports = router;
