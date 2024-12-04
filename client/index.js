const client = require("./client");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

function formatDuration(duration) {
  const seconds = duration.seconds;

  return `${Math.floor(seconds / 3600)}ч ${Math.floor(
    (seconds % 3600) / 60
  )}мин`;
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp.seconds * 1000 + timestamp.nanos / 1e6);

  return date.toLocaleString();
}

app.get("/", (req, res) => {
  client.getAll(null, (err, data) => {
    if (err) {
      console.error(err);
    } else {
      const formattedTasks = data.tasks.map((task) => {
        // Format the duration field
        const formattedDuration = formatDuration(task.duration);

        // Format the creationDate field
        const formattedCreationDate = formatTimestamp(task.creationDate);

        return {
          ...task,
          duration: formattedDuration,
          creationDate: formattedCreationDate,
        };
      });
      res.render("tasks", {
        results: formattedTasks,
      });
    }
  });
});

function convertTimeToSeconds(timeString) {
  const [hours, minutes] = timeString.split(":");
  return parseInt(hours) * 3600 + parseInt(minutes) * 60;
}

app.post("/save", (req, res) => {
  const newTask = {
    task: req.body.task,
    theme: req.body.theme,
    duration: {
      seconds: convertTimeToSeconds(req.body.duration),
      nanos: 0,
    },
    creationDate: {
      seconds: Math.floor(Date.now() / 1000),
      nanos: 0,
    },
  };
  client.insert(newTask, (err, data) => {
    if (err) throw err;
    console.info("Задача создана", data);
    res.redirect("/");
  });
});
app.post("/update", (req, res) => {
  const updateTask = {
    id: req.body.id,
    task: req.body.task,
    theme: req.body.theme,
    duration: {
      seconds: convertTimeToSeconds(req.body.duration),
      nanos: 0,
    },
  };
  client.update(updateTask, (err, data) => {
    if (err) throw err;
    console.info("Задача обновлена", data);
    res.redirect("/");
  });
});
app.post("/remove", (req, res) => {
  client.remove({ id: req.body.task_id }, (err, _) => {
    if (err) throw err;
    console.info("Задача удалена");
    res.redirect("/");
  });
});
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.info("Сервер запущен на порту %d", PORT);
});
