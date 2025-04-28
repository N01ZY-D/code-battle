import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CreateTheoryPage from "./CreateTheoryPage";
import axios from "axios";

const EditTheoryPage = () => {
  const { slug } = useParams();
  const [theory, setTheory] = useState(null);

  useEffect(() => {
    axios
      .get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/theory/${slug}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      )
      .then((res) => setTheory(res.data))
      .catch(console.error);
  }, [slug]);

  if (!theory) return <div>Загрузка...</div>;

  return <CreateTheoryPage slug={slug} initialData={theory} />;
};

export default EditTheoryPage;
