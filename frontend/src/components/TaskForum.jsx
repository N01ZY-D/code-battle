import { useState, useEffect, useContext, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import Avatar from "../components/Avatar";
import {
  FiX,
  FiEdit,
  FiThumbsUp,
  FiThumbsDown,
  FiCornerDownRight,
} from "react-icons/fi";
import "./taskForum.css";
import ReportButton from "../components/ReportButton";

const TaskForum = ({
  taskId,
  defaultType = "public",
  showTabs = true,
  allowSolutionSelect = "true",
}) => {
  const [comments, setComments] = useState([]);
  const [type, setType] = useState(defaultType);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [userSolutions, setUserSolutions] = useState([]);
  const [selectedSolutionId, setSelectedSolutionId] = useState(null);
  const [selectedSolutionCode, setSelectedSolutionCode] = useState("");
  const [expandedComments, setExpandedComments] = useState(new Set());
  const { token, user } = useContext(AuthContext);
  const textareaRef = useRef(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedContent, setEditedContent] = useState("");
  const location = useLocation();
  const scrollHash = location.hash;
  const searchParams = new URLSearchParams(location.search);
  const scrollToCommentId = searchParams.get("commentId");

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

  const findParentChain = (commentsList, targetId, chain = []) => {
    for (const comment of commentsList) {
      if (comment._id === targetId) {
        return chain;
      }
      if (comment.replies && comment.replies.length > 0) {
        const res = findParentChain(comment.replies, targetId, [
          ...chain,
          comment._id,
        ]);
        if (res) return res;
      }
    }
    return null;
  };

  useEffect(() => {
    if (scrollHash.startsWith("#comment-")) {
      const commentId = scrollHash.replace("#comment-", "");

      // Найти цепочку родителей
      const parentsChain = findParentChain(comments, commentId);
      if (parentsChain) {
        // Раскрыть всех родителей, чтобы комментарий был видим
        setExpandedComments((prev) => {
          const newSet = new Set(prev);
          parentsChain.forEach((id) => newSet.add(id));
          return newSet;
        });
      }

      // Немного задержать прокрутку, чтобы React успел отрендерить раскрытые ответы
      setTimeout(() => {
        const el = document.getElementById(`comment-${commentId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          el.classList.add("highlight-comment");
          setTimeout(() => {
            el.classList.remove("highlight-comment");
          }, 10000);
        }
      }, 200); // задержка 200мс - можно регулировать, чтобы точно успело отрендериться
    }
  }, [comments, scrollHash]);

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
          entityType: "task",
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
      setSelectedSolutionCode("");
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

  const handleEdit = (comment) => {
    setEditingCommentId(comment._id);
    setEditedContent(comment.content);
  };

  const handleSaveEdit = async (id) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/comments/${id}`,
        { content: editedContent },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await fetchComments();
      setEditingCommentId(null);
      setEditedContent("");
    } catch (err) {
      alert("Ошибка при редактировании комментария");
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

  const toggleComment = (id) => {
    setExpandedComments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const isExpanded = (id) => expandedComments.has(id);

  const renderComments = (list, depth = 0) =>
    list.map((comment) => (
      <div
        key={comment._id}
        id={`comment-${comment._id}`}
        className="forum-comment"
        style={{
          ...(depth !== 0 && { marginLeft: 20 }),
          ...(depth !== 0 && { marginTop: 10 }),
        }}
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

          {user?._id === comment.userId._id && (
            <button
              className="edit-comment-btn"
              onClick={() => handleEdit(comment)}
              title="Редактировать"
            >
              <FiEdit />
            </button>
          )}
        </div>

        {comment.solutionCode && (
          <pre className="code-block">{comment.solutionCode}</pre>
        )}

        {editingCommentId === comment._id ? (
          <div className="edit-area">
            <textarea
              className="edit-textarea"
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
            />
            <div className="edit-buttons">
              <button onClick={() => handleSaveEdit(comment._id)}>
                Сохранить
              </button>
              <button onClick={() => setEditingCommentId(null)}>Отмена</button>
            </div>
          </div>
        ) : (
          <pre className="comment-content">{comment.content}</pre>
        )}

        <div className="comment-actions">
          <button onClick={() => setReplyTo(comment)} className="reply-btn">
            <FiCornerDownRight />
            <span className="reply-text">Ответить</span>
          </button>
          <button onClick={() => sendReaction(comment._id, "like")}>
            <FiThumbsUp /> {comment.likes?.length || 0}
          </button>
          <button onClick={() => sendReaction(comment._id, "dislike")}>
            <FiThumbsDown /> {comment.dislikes?.length || 0}
          </button>
          <ReportButton entityId={comment._id} entityType="comment" />
        </div>

        {comment.replies?.length > 0 && (
          <div className="toggle-replies">
            <button
              onClick={() => toggleComment(comment._id)}
              className="toggle-btn"
            >
              {isExpanded(comment._id)
                ? "Свернуть ответы"
                : `Показать ответы (${comment.replies.length})`}
            </button>
          </div>
        )}

        {comment.replies?.length > 0 &&
          isExpanded(comment._id) &&
          renderComments(comment.replies, depth + 1)}
      </div>
    ));

  const filteredComments = comments.filter((c) => c.type === type);
  const isSolutionDisabled = userSolutions.length === 0;

  return (
    <div className="forum-container">
      {showTabs && (
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
      )}

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

          {allowSolutionSelect && type === "solution" && (
            <div className="solution-select">
              <label htmlFor="solution-dropdown">Выберите решение:</label>
              <select
                id="solution-dropdown"
                value={selectedSolutionId || ""}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const solution = userSolutions.find(
                    (s) => s._id === selectedId
                  );
                  setSelectedSolutionId(selectedId);
                  setSelectedSolutionCode(solution?.code || "");
                }}
              >
                <option value="">-- выберите решение --</option>
                {userSolutions.map((solution) => (
                  <option key={solution._id} value={solution._id}>
                    {new Date(solution.createdAt).toLocaleString()}
                  </option>
                ))}
              </select>
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
