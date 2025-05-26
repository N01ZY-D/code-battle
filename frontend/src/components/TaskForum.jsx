import { useState, useEffect, useContext, useRef, use } from "react";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import Avatar from "../components/Avatar";
import { FiX } from "react-icons/fi";
import "./taskForum.css"; // импорт стилей

const TaskForum = ({ taskId }) => {
  const [comments, setComments] = useState([]);
  const [type, setType] = useState("public");
  const [newComment, setNewComment] = useState("");
  const [userSolutions, setUserSolutions] = useState([]);
  const [selectedSolutionId, setSelectedSolutionId] = useState(null);
  const [selectedSolutionCode, setSelectedSolutionCode] = useState("");
  const { token, user } = useContext(AuthContext);
  const textareaRef = useRef(null);

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

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto"; // Сначала сбрасываем, чтобы пересчитать
      textarea.style.height = `${textarea.scrollHeight + 3}px`; // Устанавливаем нужную высоту
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [newComment]);

  useEffect(() => {
    const fetchUserSolutions = async () => {
      if (user && taskId) {
        try {
          const res = await axios.get(
            `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/profile`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const allSolutions = res.data.solutions || [];
          const relevantSolutions = allSolutions.filter(
            (sol) =>
              sol.taskId && sol.taskId._id?.toString() === taskId.toString()
          );
          setUserSolutions(relevantSolutions);
        } catch (err) {
          console.error("Ошибка при загрузке решений пользователя:", err);
          setUserSolutions([]);
        }
      }
    };
    fetchUserSolutions();
  }, [user, taskId, token]);

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

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Вы уверены, что хотите удалить комментарий?")) return;

    try {
      await axios.delete(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/api/comments/${commentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      console.error("Ошибка при удалении комментария:", err);
      alert("Ошибка при удалении комментария");
    }
  };

  const filteredComments = comments.filter((c) => c.type === type);
  let isDisabled = userSolutions.length === 0;
  console.log("isDisabled", isDisabled);

  return (
    <div className="forum-container">
      <div className="forum-tabs">
        <button
          className={`forum-tab ${type === "public" ? "active" : ""}`}
          onClick={() => setType("public")}
        >
          Обсуждение задачи
        </button>
        <button
          className={`forum-tab ${type === "solution" ? "active" : ""}`}
          onClick={() => setType("solution")}
          disabled={isDisabled}
        >
          Обсуждение решений
        </button>
      </div>

      {token && (
        <div className="forum-form">
          {type === "solution" && (
            <div className="solution-select">
              <label className="solution-label">
                Выберите одно из ваших решений:
              </label>
              <select
                className="solution-dropdown"
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
                <pre className="code-block">{selectedSolutionCode}</pre>
              )}
            </div>
          )}

          <textarea
            ref={textareaRef}
            className="forum-textarea"
            rows={3}
            value={newComment}
            onChange={(e) => {
              setNewComment(e.target.value);
              adjustTextareaHeight();
            }}
            placeholder={
              type === "public" ? "Комментарий..." : "Ваш код/пояснение..."
            }
          />
          <button
            onClick={handleSubmit}
            className="forum-submit"
            disabled={type === "solution" && !selectedSolutionId}
          >
            Отправить
          </button>
        </div>
      )}

      <div className="forum-comments">
        {filteredComments.map((comment) => (
          <div key={comment._id} className="forum-comment">
            <div className="comment-header">
              <Avatar
                matrix={comment.userId.avatarMatrix}
                color={comment.userId.avatarColor}
              />
              <span className="comment-nickname">
                {comment.userId.nickname}
              </span>
              <span className="comment-date">
                {new Date(comment.createdAt).toLocaleString()}
              </span>
              {console.log("Текущий пользователь:", user)}
              {console.log("Комментарий от:", comment.userId)}
              {console.log("user._id:", user?._id?.toString())}
              {console.log(
                "comment.userId._id:",
                comment.userId?._id?.toString()
              )}
              {(user?._id?.toString() === comment.userId._id?.toString() ||
                user?.role === "admin") && (
                <button
                  className="delete-comment-btn"
                  onClick={() => handleDeleteComment(comment._id)}
                  title="Удалить комментарий"
                >
                  <FiX size={24} />
                </button>
              )}
            </div>
            <pre className="comment-content">{comment.content}</pre>
            {comment.solutionCode && (
              <pre className="code-block">{comment.solutionCode}</pre>
            )}
          </div>
        ))}
        {filteredComments.length === 0 && (
          <p className="no-comments">Нет комментариев.</p>
        )}
      </div>
    </div>
  );
};

export default TaskForum;
