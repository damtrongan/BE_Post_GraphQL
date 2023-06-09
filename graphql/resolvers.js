const bcrypt = require("bcryptjs");
const validator = require("validator");

const User = require("../models/user");
const { graphql } = require("graphql");

module.exports = {
  createUser: async function ({ userInput }, req) {
    //const email = args.userInput.email
    console.log(req.graphqlQuery);
    const errors = [];
    if (!validator.isEmail(userInput.email)) {
      errors.push({ message: "E-mail is invalid." });
    }
    if (
      (!validator.isEmail(userInput.password) ||
        validator.isLength(userInput.password),
      { min: 5 })
    ) {
      errors.push({ message: "Password too short"});
    }
    if (errors.length > 0) {
      const error = new Error('Invalid input.');
      error.data = errors;
      error.code = 422;
      throw error;
    }
    const existingUser = await User.findOne({ email: userInput.email });
    if (existingUser) {
      const error = new Error("User exists already");
      throw error;
    }
    const hashedPw = await bcrypt.hash(userInput.password, 12);
    const user = new User({
      email: userInput.email,
      name: userInput.name,
      password: hashedPw,
    });
    const createUser = await user.save();
    return { ...createUser._doc, _id: createUser._id.toString() };
  },
};
