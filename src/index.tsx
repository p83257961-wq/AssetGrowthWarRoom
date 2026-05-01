import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const PASSWORD = "1995840515";
const AUTH_KEY = "agwr_authed";

function PasswordGate(props) {
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  useEffect(function () {
    try {
      if (sessionStorage.getItem(AUTH_KEY) === "1") {
        setAuthed(true);
      }
    } catch (e) {}
  }, []);

  const handleSubmit = function (e) {
    e.preventDefault();
    if (input === PASSWORD) {
      try {
        sessionStorage.setItem(AUTH_KEY, "1");
      } catch (e) {}
      setAuthed(true);
      setError("");
    } else {
      setError("密碼錯誤，請重試");
    }
  };

  if (authed) return React.createElement(React.Fragment, null, props.children);

  return React.createElement(
    "div",
    {
      style: {
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        zIndex: 999999
      }
    },
    React.createElement(
      "form",
      {
        onSubmit: handleSubmit,
        style: {
          background: "#fff",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          width: "360px",
          maxWidth: "90vw"
        }
      },
      React.createElement("h2", { style: { margin: "0 0 8px", color: "#0f172a", fontSize: "22px" } }, "請輸入密碼"),
      React.createElement("p", { style: { margin: "0 0 20px", color: "#64748b", fontSize: "14px" } }, "此頁面受密碼保護"),
      React.createElement("input", {
        type: "password",
        value: input,
        onChange: function (e) { setInput(e.target.value); },
        placeholder: "密碼",
        autoFocus: true,
        style: {
          width: "100%",
          padding: "12px 14px",
          fontSize: "15px",
          border: "1px solid #cbd5e1",
          borderRadius: "8px",
          outline: "none",
          boxSizing: "border-box",
          marginBottom: "12px"
        }
      }),
      error && React.createElement("div", { style: { color: "#dc2626", fontSize: "13px", marginBottom: "12px" } }, error),
      React.createElement(
        "button",
        {
          type: "submit",
          style: {
            width: "100%",
            padding: "12px",
            fontSize: "15px",
            fontWeight: 600,
            color: "#fff",
            background: "#0f172a",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer"
          }
        },
        "進入"
      )
    )
  );
}

const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement);

root.render(
  React.createElement(
    React.StrictMode,
    null,
    React.createElement(PasswordGate, null, React.createElement(App, null))
  )
);
