const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to database");

    const users = await User.find();
    for (const user of users) {
      let updated = false;

      // Если у пользователя нет solvedTasksCount, добавляем
      if (user.solvedTasksCount === undefined) {
        user.solvedTasksCount = 0;
        updated = true;
      }

      // Если у пользователя нет solvedTasks, добавляем
      if (!Array.isArray(user.solvedTasks)) {
        user.solvedTasks = [];
        updated = true;
      }

      // Сохраняем изменения, если что-то обновилось
      if (updated) {
        await user.save();
        console.log(`Updated solvedTasks fields for ${user.email}`);
      }
    }

    console.log("All users updated");
    mongoose.disconnect();
  })
  .catch((err) => console.error(err));
