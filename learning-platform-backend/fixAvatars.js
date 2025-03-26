const mongoose = require("mongoose");
const User = require("./models/User");
const generateAvatarData = require("./utils/avatarGenerator");
require("dotenv").config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to database");

    const users = await User.find();
    for (const user of users) {
      if (!user.avatarMatrix || !user.avatarColor) {
        const { matrix, color } = generateAvatarData(user.nickname || "User");
        user.avatarMatrix = matrix;
        user.avatarColor = color;
        await user.save();
        console.log(`Updated avatar for ${user.email}`);
      }
    }

    console.log("All users updated");
    mongoose.disconnect();
  })
  .catch((err) => console.error(err));
