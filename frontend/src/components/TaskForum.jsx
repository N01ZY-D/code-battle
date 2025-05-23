import { useState, useEffect, useContext } from "react";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import Avatar from "../components/Avatar";

const TaskForum = ({ taskId }) => {
  const [comments, setComments] = useState([]);
  const [type, setType] = useState("public"); // "public" | "solution"
  const [newComment, setNewComment] = useState("");
  const [userSolutions, setUserSolutions] = useState([]);
  const [selectedSolutionId, setSelectedSolutionId] = useState(null);
  const [selectedSolutionCode, setSelectedSolutionCode] = useState("");
  const { token, user } = useContext(AuthContext);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
          }/api/comments/${taskId}`
        );
        setComments(response.data);
      } catch (error) {
        console.error("Ошибка при загрузке комментариев:", error);
      }
    };

    fetchComments();
  }, [taskId]);

  useEffect(() => {
    const fetchUserSolutions = async () => {
      if (user && taskId && type === "solution") {
        try {
          const res = await axios.get(
            `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/profile`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          // Получаем решения пользователя
          const allSolutions = res.data.solutions || [];

          // Фильтруем решения только по текущей задаче
          const relevantSolutions = allSolutions.filter(
            (sol) => sol.taskId && sol.taskId._id === taskId
          );

          setUserSolutions(relevantSolutions);
        } catch (err) {
          console.error("Ошибка при загрузке решений пользователя:", err);
          setUserSolutions([]); // На всякий случай — очистка при ошибке
        }
      }
    };

    fetchUserSolutions();
  }, [user, taskId, type, token]);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    if (type === "solution" && !selectedSolutionId) {
      alert("Пожалуйста, выберите своё решение перед отправкой комментария.");
      return;
    }

    try {
      const { data } = await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/api/comments/${taskId}`,
        {
          content: newComment,
          type,
          solutionId: type === "solution" ? selectedSolutionId : undefined,
          solutionCode: type === "solution" ? selectedSolutionCode : undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments((prev) => [data, ...prev]);
      setNewComment("");
      setSelectedSolutionId(null);
    } catch (err) {
      alert(err.response?.data?.message || "Ошибка при отправке комментария");
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
          {type === "solution" && (
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">
                Выберите одно из ваших решений:
              </label>
              <select
                className="w-full border rounded px-3 py-2"
                value={selectedSolutionId || ""}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  setSelectedSolutionId(selectedId);

                  const selectedSolution = userSolutions.find(
                    (s) => s._id === selectedId
                  );
                  setSelectedSolutionCode(selectedSolution?.code || "");
                }}
              >
                <option value="">-- Выберите решение --</option>
                {userSolutions.map((sol) => (
                  <option key={sol._id} value={sol._id}>
                    {new Date(sol.createdAt).toLocaleString()}
                  </option>
                ))}
              </select>
              {selectedSolutionCode && (
                <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto mt-2">
                  {selectedSolutionCode}
                </pre>
              )}
            </div>
          )}
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
            disabled={type === "solution" && !selectedSolutionId}
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
            {comment.solutionCode && (
              <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto mt-2">
                {comment.solutionCode}
              </pre>
            )}
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
