import { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import Avatar from "../components/Avatar";
import {
  FiX,
  FiThumbsUp,
  FiThumbsDown,
  FiCornerDownRight,
} from "react-icons/fi";
import "./taskForum.css";

const TaskForum = ({ taskId }) => {
  const [comments, setComments] = useState([]);
  const [type, setType] = useState("public");
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [userSolutions, setUserSolutions] = useState([]);
  const [selectedSolutionId, setSelectedSolutionId] = useState(null);
  const [selectedSolutionCode, setSelectedSolutionCode] = useState("");
  const { token, user } = useContext(AuthContext);
  const textareaRef = useRef(null);

  const fetchComments = async () => {
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/api/comments/${taskId}`
      );
      setComments(res.data);
    } catch (err) {
      console.error("Ошибка при загрузке комментариев:", err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [taskId]);

  useEffect(() => {
    if (!user || !taskId) return;

    const fetchUserSolutions = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const relevant = (res.data.solutions || []).filter(
          (s) => s.taskId && s.taskId._id === taskId
        );
        setUserSolutions(relevant);
      } catch (err) {
        console.error("Ошибка при загрузке решений:", err);
      }
    };
    fetchUserSolutions();
  }, [user, taskId, token]);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${
        textareaRef.current.scrollHeight + 3
      }px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [newComment]);

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    if (!newComment.trim()) return;
    // Выбор решения обязателен только при **первичном** комментарии (не reply)
    if (type === "solution" && !selectedSolutionId && !replyTo) {
      alert("Выберите решение перед отправкой.");
      return;
    }

    try {
      const res = await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/api/comments/${taskId}`,
        {
          content: newComment,
          type,
          parentId: replyTo?._id || null,
          solutionId: type === "solution" ? selectedSolutionId : undefined,
          solutionCode: type === "solution" ? selectedSolutionCode : undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchComments();
      setNewComment("");
      setReplyTo(null);
      setSelectedSolutionId(null);
    } catch (err) {
      alert(err.response?.data?.message || "Ошибка при отправке");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Удалить комментарий?")) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/comments/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await fetchComments();
      //setComments((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      alert("Ошибка при удалении");
    }
  };

  const sendReaction = async (id, type) => {
    try {
      await axios.post(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/api/comments/${id}/${type}`,
        null,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const res = await axios.get(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/api/comments/${taskId}`
      );
      setComments(res.data);
    } catch (err) {
      console.error("Ошибка при реакции:", err);
    }
  };

  const renderComments = (list, depth = 0) =>
    list.map((comment) => (
      <div
        key={comment._id}
        className="forum-comment"
        style={{ marginLeft: depth * 20 }}
      >
        <div className="comment-header">
          <Avatar
            matrix={comment.userId.avatarMatrix}
            color={comment.userId.avatarColor}
          />
          <span className="comment-nickname">{comment.userId.nickname}</span>
          <span className="comment-date">
            {new Date(comment.createdAt).toLocaleString()}
          </span>
          {(user?._id === comment.userId._id || user?.role === "admin") && (
            <button
              className="delete-comment-btn"
              onClick={() => handleDelete(comment._id)}
              title="Удалить"
            >
              <FiX />
            </button>
          )}
        </div>

        <pre className="comment-content">{comment.content}</pre>
        {comment.solutionCode && (
          <pre className="code-block">{comment.solutionCode}</pre>
        )}

        <div className="comment-actions">
          <button onClick={() => setReplyTo(comment)} className="reply-btn">
            <FiCornerDownRight /> Ответить
          </button>
          <button onClick={() => sendReaction(comment._id, "like")}>
            <FiThumbsUp /> {comment.likes?.length || 0}
          </button>
          <button onClick={() => sendReaction(comment._id, "dislike")}>
            <FiThumbsDown /> {comment.dislikes?.length || 0}
          </button>
        </div>

        {comment.replies?.length > 0 &&
          renderComments(comment.replies, depth + 1)}
      </div>
    ));

  const filteredComments = comments.filter((c) => c.type === type);
  const isSolutionDisabled = userSolutions.length === 0;

  return (
    <div className="forum-container">
      <div className="forum-tabs">
        <button
          className={`forum-tab ${type === "public" ? "active" : ""}`}
          onClick={() => {
            setType("public");
            setReplyTo(null);
          }}
        >
          Обсуждение задачи
        </button>
        <button
          className={`forum-tab ${type === "solution" ? "active" : ""}`}
          onClick={() => {
            setType("solution");
            setReplyTo(null);
          }}
          disabled={isSolutionDisabled}
        >
          Обсуждение решений
        </button>
      </div>

      {token && (
        <div className="forum-form">
          {replyTo && (
            <div className="reply-indicator">
              Ответ на: <strong>{replyTo.userId.nickname}</strong> —{" "}
              {replyTo.content.slice(0, 50)}...
              <button
                onClick={() => setReplyTo(null)}
                className="cancel-reply-btn"
              >
                ✕
              </button>
            </div>
          )}

          {type === "solution" && (
            <div className="solution-select">
              <label>Выберите одно из своих решений:</label>
              <select
                value={selectedSolutionId || ""}
                onChange={(e) => {
                  const selected = e.target.value;
                  setSelectedSolutionId(selected);
                  const found = userSolutions.find((s) => s._id === selected);
                  setSelectedSolutionCode(found?.code || "");
                }}
              >
                <option value="">-- Выберите --</option>
                {userSolutions.map((s) => (
                  <option key={s._id} value={s._id}>
                    {new Date(s.createdAt).toLocaleString()}
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
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            className="forum-textarea"
            placeholder={
              type === "solution"
                ? "Комментарий к решению..."
                : "Комментарий..."
            }
          />
          <button
            onClick={handleSubmit}
            className="forum-submit"
            disabled={type === "solution" && !selectedSolutionId && !replyTo}
          >
            Отправить
          </button>
        </div>
      )}

      <div className="forum-comments">
        {filteredComments.length > 0 ? (
          renderComments(filteredComments)
        ) : (
          <p className="no-comments">Нет комментариев.</p>
        )}
      </div>
    </div>
  );
};

export default TaskForum;
