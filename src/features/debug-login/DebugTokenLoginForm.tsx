"use client";

import { type FormEvent, useState } from "react";
import styles from "./DebugTokenLoginForm.module.css";

type DebugTokenLoginFormProps = {
  redirectTo: string;
};

const cookieMaxAgeSeconds = 60 * 60 * 24 * 7;

export function DebugTokenLoginForm({ redirectTo }: DebugTokenLoginFormProps) {
  const [javaToken, setJavaToken] = useState("");
  const [pythonToken, setPythonToken] = useState("");
  const [userInfo, setUserInfo] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextJavaToken = javaToken.trim();
    const nextPythonToken = pythonToken.trim();
    const nextUserInfo = buildDebugUserInfoCookieValue(userInfo);

    if (!nextJavaToken || !nextPythonToken) {
      setError("请同时填写 Java Token 和 Python Token。");
      return;
    }

    if (userInfo.trim() && !nextUserInfo) {
      setError("UserInfo 必须是合法 JSON 对象，且包含 phone。");
      return;
    }

    writeDebugCookie("mallToken", nextJavaToken);
    writeDebugCookie("pythonToken", nextPythonToken);
    if (nextUserInfo) {
      writeDebugCookie("userInfo", nextUserInfo);
    } else {
      clearDebugCookie("userInfo");
    }
    window.location.assign(resolveRedirectHref(redirectTo));
  }

  function handleClear() {
    clearDebugCookie("mallToken");
    clearDebugCookie("pythonToken");
    clearDebugCookie("userInfo");
    setJavaToken("");
    setPythonToken("");
    setUserInfo("");
    setError("");
  }

  return (
    <main className={styles.page}>
      <section className={styles.panel} aria-labelledby="debug-token-title">
        <p className={styles.kicker}>Standalone H5 Debug</p>
        <h1 id="debug-token-title" className={styles.title}>
          调试 Token 登录
        </h1>
        <p className={styles.description}>
          仅用于浏览器独立打开 H5 时写入 Java / Python 调试 token 和 userInfo。原生 App 环境不会展示此页面。
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>Java Token</span>
            <textarea
              value={javaToken}
              onChange={(event) => setJavaToken(event.target.value)}
              rows={4}
              autoComplete="off"
              spellCheck={false}
            />
          </label>

          <label className={styles.field}>
            <span>Python Token</span>
            <textarea
              value={pythonToken}
              onChange={(event) => setPythonToken(event.target.value)}
              rows={4}
              autoComplete="off"
              spellCheck={false}
            />
          </label>

          <label className={styles.field}>
            <span>UserInfo JSON</span>
            <textarea
              value={userInfo}
              onChange={(event) => setUserInfo(event.target.value)}
              rows={4}
              autoComplete="off"
              placeholder={'{\n  "phone": "37"\n}'}
              spellCheck={false}
            />
          </label>

          {error ? <p className={styles.error}>{error}</p> : null}

          <div className={styles.actions}>
            <button type="submit" className={styles.primary}>
              写入并进入 H5
            </button>
            <button type="button" className={styles.secondary} onClick={handleClear}>
              清空调试 Token
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export function buildDebugUserInfoCookieValue(value: string) {
  const text = value.trim();
  if (!text) {
    return null;
  }

  try {
    const parsed = JSON.parse(text) as unknown;
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }
    const phone = (parsed as { phone?: unknown }).phone;
    if (typeof phone !== "string" || !phone.trim()) {
      return null;
    }
    return JSON.stringify(parsed);
  } catch {
    return null;
  }
}

function writeDebugCookie(name: "mallToken" | "pythonToken" | "userInfo", value: string) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${cookieMaxAgeSeconds}; SameSite=Lax${secure}`;
}

function clearDebugCookie(name: "mallToken" | "pythonToken" | "userInfo") {
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

function resolveRedirectHref(redirectTo: string) {
  const basePath = process.env.NEXT_PUBLIC_H5_BASE_PATH || "";
  if (!redirectTo.startsWith("/") || redirectTo.startsWith("//")) {
    return `${basePath}/`;
  }
  if (basePath && redirectTo.startsWith(`${basePath}/`)) {
    return redirectTo;
  }
  return `${basePath}${redirectTo}`;
}
