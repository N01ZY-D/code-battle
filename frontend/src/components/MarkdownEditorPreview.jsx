import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import "./markdownEditorPreview.css"; // Импортируем стили для редактора Markdown

const MarkdownEditorPreview = ({
  value,
  onChange,
  placeholder = "Введите Markdown...",
}) => {
  const [activeTab, setActiveTab] = useState("editor"); // 'editor' или 'preview'
  const textareaRef = useRef(null);
  const savedHeight = useRef("auto");

  // Авто-увеличение высоты при монтировании или изменении текста
  const handleTextareaInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      const scrollTopBefore = window.pageYOffset; // сохраняем позицию прокрутки
      const cursorPosition = textarea.selectionStart;

      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight + 2}px`;
      savedHeight.current = textarea.style.height;

      // возвращаем прокрутку обратно
      window.scrollTo({ top: scrollTopBefore });

      // сохраняем позицию курсора
      textarea.setSelectionRange(cursorPosition, cursorPosition);
    }
  };

  useEffect(() => {
    if (activeTab === "editor") {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = savedHeight.current || "auto";
        handleTextareaInput();
      }
    }
  }, [activeTab, value]);

  const handleInput = (e) => {
    const { value } = e.target;
    onChange(value);
  };

  return (
    <div className="markdown-editor-container">
      <div className="tabs">
        <button
          type="button"
          className={activeTab === "editor" ? "active" : ""}
          onClick={() => setActiveTab("editor")}
        >
          Редактор
        </button>
        <button
          type="button"
          className={activeTab === "preview" ? "active" : ""}
          onClick={() => setActiveTab("preview")}
        >
          Предпросмотр
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "editor" ? (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleInput}
            onInput={handleTextareaInput}
            placeholder={placeholder}
            className="markdown-textarea"
          />
        ) : (
          <div className="markdown-preview">
            <ReactMarkdown>{value || "*Пока что пусто...*"}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkdownEditorPreview;
