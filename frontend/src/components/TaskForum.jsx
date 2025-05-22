import { useState, useEffect, useContext } from "react";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import Avatar from "../components/Avatar";

const TaskForum = ({ taskId }) => {
  const [comments, setComments] = useState([]);
  const [type, setType] = useState("public"); // "public" | "solution"
  const [newComment, setNewComment] = useState("");
  const { token, user } = useContext(AuthContext);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
          }/api/comments/${taskId}`
        );
        setComments(response.data); // предполагаем, что сервер возвращает массив комментариев
      } catch (error) {
        console.error("Ошибка при загрузке комментариев:", error);
      }
    };

    fetchComments();
  }, [taskId]);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    try {
      const { data } = await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/api/comments/${taskId}`,
        { content: newComment, type },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments((prev) => [data, ...prev]);
      setNewComment("");
    } catch (err) {
      alert(err.response?.data?.message || "Ошибка");
    }
  };

  const filteredComments = comments.filter((c) => c.type === type);

  return (
    <div className="mt-6">
      <div className="flex gap-4 mb-4">
        <button
          className={type === "public" ? "font-bold underline" : ""}
          onClick={() => setType("public")}
        >
          Обсуждение задачи
        </button>
        <button
          className={type === "solution" ? "font-bold underline" : ""}
          onClick={() => setType("solution")}
        >
          Обсуждение решений
        </button>
      </div>

      {token && (
        <div className="mb-4">
          <textarea
            className="w-full border p-2 rounded"
            rows={3}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={
              type === "public" ? "Комментарий..." : "Ваш код/пояснение..."
            }
          />
          <button
            onClick={handleSubmit}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Отправить
          </button>
        </div>
      )}

      <div className="space-y-4">
        {filteredComments.map((comment) => (
          <div key={comment._id} className="border p-3 rounded bg-gray-50">
            <div className="flex items-center gap-2 mb-1">
              <Avatar
                matrix={comment.userId.avatarMatrix}
                color={comment.userId.avatarColor}
              />
              <span className="font-semibold">{comment.userId.nickname}</span>
              <span className="text-xs text-gray-500 ml-auto">
                {new Date(comment.createdAt).toLocaleString()}
              </span>
            </div>
            <pre className="whitespace-pre-wrap text-sm">{comment.content}</pre>
          </div>
        ))}
        {filteredComments.length === 0 && (
          <p className="text-sm text-gray-500">Нет комментариев.</p>
        )}
      </div>
    </div>
  );
};

export default TaskForum;
