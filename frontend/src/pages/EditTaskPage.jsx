// EditTaskPage.jsx
import React, { useEffect, useState } from "react";
import CreateTaskPage from "./CreateTaskPage";
import { useParams } from "react-router-dom";
import axios from "axios";

const EditTaskPage = () => {
  const { taskId } = useParams();
  const [task, setTask] = useState(null);

  useEffect(() => {
    axios
      .get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/tasks/${taskId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      )
      .then((res) => setTask(res.data))
      .catch(console.error);
  }, [taskId]);

  if (!task) return <div>Загрузка...</div>;

  return <CreateTaskPage mode="edit" initialData={task} />;
};

export default EditTaskPage;
