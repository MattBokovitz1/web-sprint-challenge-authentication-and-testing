const User = require("../users/user-model");

const checkUsernameUnique = async (req, res, next) => {
  try {
    const rows = await User.findBy({ username: req.body.username });
    if (!rows.length) {
      next();
    } else {
      res.status(401).json("username is taken");
    }
  } catch (err) {
    res.status(500).json(err.message);
  }
};

module.exports = {
  checkUsernameUnique,
};
