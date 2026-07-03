"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createH5Client } from "@/lib/http";
import { createRegisterApi } from "../api";
import { decodeRegisterAesParams, encryptRegisterPayload } from "../aes";
import type { RegisterAesParams, RegisterPlainPayload } from "../types";
import styles from "./RegisterScreen.module.css";

type RegisterForm = RegisterPlainPayload & {
  confirmPassword: string;
};

type RegisterField = keyof RegisterForm;

const initialForm: RegisterForm = {
  phone: "",
  code: "",
  inviter: "",
  nickname: "",
  password: "",
  confirmPassword: ""
};

const initialErrors: Record<RegisterField, string> = {
  phone: "",
  code: "",
  inviter: "",
  nickname: "",
  password: "",
  confirmPassword: ""
};

export function RegisterScreen() {
  const router = useRouter();
  const api = useMemo(() => createRegisterApi(createH5Client()), []);
  const [form, setForm] = useState<RegisterForm>(initialForm);
  const [errors, setErrors] = useState<Record<RegisterField, string>>(initialErrors);
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [aesParams, setAesParams] = useState<RegisterAesParams | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreementConfirmOpen, setAgreementConfirmOpen] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [toast, setToast] = useState("");
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isFormFilled = Boolean(
    form.phone && form.code && form.inviter && form.nickname && form.password && form.confirmPassword
  );

  const codeButtonText = sendingCode ? "发送中" : countdown > 0 ? `${countdown}秒` : "获取验证码";

  useEffect(() => {
    let cancelled = false;

    api.getAesKey().then(async (result) => {
      if (cancelled) return;
      if (!result.success) {
        setToast(result.message || "获取加密参数失败");
        return;
      }

      try {
        setAesParams(await decodeRegisterAesParams(result.data));
      } catch (error) {
        setToast(error instanceof Error ? error.message : "获取加密参数失败");
      }
    });

    return () => {
      cancelled = true;
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, [api]);

  function updateField(field: keyof RegisterForm, value: string) {
    const nextValue =
      field === "phone" ? value.replace(/\D/g, "").slice(0, 11) : field === "code" ? value.replace(/\D/g, "").slice(0, 6) : value;
    setForm((current) => ({ ...current, [field]: nextValue }));
    setErrors((current) => ({ ...current, [field]: "" }));
  }

  function validateField(field: RegisterField, nextForm = form) {
    switch (field) {
      case "phone":
        if (!nextForm.phone) return "请输入手机号";
        if (!/^1[3-9]\d{9}$/.test(nextForm.phone)) return "手机号格式不正确";
        return "";
      case "code":
        if (!nextForm.code) return "请输入验证码";
        if (!/^\d{4,6}$/.test(nextForm.code)) return "验证码长度为4-6位";
        return "";
      case "inviter":
        return nextForm.inviter.trim() ? "" : "请输入喵呜邀请码";
      case "nickname":
        if (!nextForm.nickname.trim()) return "请输入昵称";
        if (nextForm.nickname.trim().length > 20) return "昵称不能超过20个字符";
        return "";
      case "password":
        return validatePassword(nextForm.password);
      case "confirmPassword":
        if (!nextForm.confirmPassword) return "请再次输入密码";
        if (nextForm.confirmPassword !== nextForm.password) return "两次输入的密码不一致";
        return "";
    }
  }

  function commitFieldValidation(field: RegisterField) {
    const message = validateField(field);
    setErrors((current) => ({ ...current, [field]: message }));
    return !message;
  }

  function validateForm() {
    const fields: RegisterField[] = ["phone", "code", "inviter", "nickname", "password", "confirmPassword"];
    const nextErrors = fields.reduce<Record<RegisterField, string>>(
      (acc, field) => ({ ...acc, [field]: validateField(field) }),
      initialErrors
    );
    setErrors(nextErrors);
    return fields.every((field) => !nextErrors[field]);
  }

  async function handleGetCode() {
    if (!commitFieldValidation("phone") || countdown > 0 || sendingCode) return;

    setSendingCode(true);
    setToast("");
    const result = await api.sendSms(form.phone);
    setSendingCode(false);

    if (!result.success) {
      setErrors((current) => ({ ...current, phone: result.message || "发送验证码失败" }));
      return;
    }

    showToast("验证码已发送，请注意查收");
    startCountdown();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateForm()) return;
    if (!agreementChecked) {
      setAgreementConfirmOpen(true);
      return;
    }

    await submitRegister();
  }

  async function handleAgreementConfirm() {
    setAgreementConfirmOpen(false);
    setAgreementChecked(true);
    await submitRegister();
  }

  async function submitRegister() {
    setRegistering(true);
    setToast("");

    try {
      const currentAesParams = aesParams ?? (await loadAesParams());
      const payload: RegisterPlainPayload = {
        phone: form.phone.trim(),
        code: form.code.trim(),
        password: form.password,
        inviter: form.inviter.trim(),
        nickname: form.nickname.trim()
      };
      console.log("[register] plain payload before AES encrypt", payload);
      const data = await encryptRegisterPayload(JSON.stringify(payload), currentAesParams);
      const result = await api.register({ data });

      if (!result.success) {
        showToast(result.message || "注册失败");
        return;
      }

      showToast(result.data?.msg || "注册成功");
      const authToken = findAuthToken(result.data);
      const certificationHref = authToken
        ? `/register/certification?${new URLSearchParams({ token: authToken }).toString()}`
        : "/register/certification";
      setTimeout(() => router.replace(certificationHref), 900);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "注册失败");
    } finally {
      setRegistering(false);
    }
  }

  async function loadAesParams() {
    const result = await api.getAesKey();
    if (!result.success) {
      throw new Error(result.message || "获取加密参数失败");
    }
    const params = await decodeRegisterAesParams(result.data);
    setAesParams(params);
    return params;
  }

  function startCountdown() {
    setCountdown(60);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    countdownTimerRef.current = setInterval(() => {
      setCountdown((current) => {
        if (current <= 1) {
          if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
          countdownTimerRef.current = null;
          return 0;
        }
        return current - 1;
      });
    }, 1000);
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => {
      setToast((current) => (current === message ? "" : current));
    }, 2200);
  }

  return (
    <main className={styles.page}>
      <section className={styles.screen} aria-label="喵呜达人注册">
        <header className={styles.header}>
          <span className={styles.logoMark} aria-hidden="true" />
          <h1>喵呜达人注册</h1>
        </header>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.compactFields}>
            <FieldBlock error={errors.phone}>
              <label className={fieldCardClass(errors.phone)}>
                <span className={styles.fieldLabel}>手机号</span>
                <input
                  value={form.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  onBlur={() => commitFieldValidation("phone")}
                  className={`${styles.fieldInput} ${styles.alignRight}`}
                  type="tel"
                  inputMode="numeric"
                  maxLength={11}
                  placeholder="请输入手机号"
                  autoComplete="tel"
                />
              </label>
            </FieldBlock>

            <FieldBlock error={errors.code}>
              <label className={fieldCardClass(errors.code)}>
                <span className={styles.fieldLabel}>验证码</span>
                <span className={styles.codeControl}>
                  <input
                    value={form.code}
                    onChange={(event) => updateField("code", event.target.value)}
                    onBlur={() => commitFieldValidation("code")}
                    className={`${styles.fieldInput} ${styles.codeInput}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="请输入验证码"
                    autoComplete="one-time-code"
                  />
                  <button className={styles.codeButton} type="button" disabled={countdown > 0 || sendingCode} onClick={handleGetCode}>
                    {codeButtonText}
                  </button>
                </span>
              </label>
            </FieldBlock>

            <FieldBlock error={errors.inviter}>
              <label className={fieldCardClass(errors.inviter)}>
                <span className={styles.fieldLabel}>邀请码</span>
                <input
                  value={form.inviter}
                  onChange={(event) => updateField("inviter", event.target.value)}
                  onBlur={() => commitFieldValidation("inviter")}
                  className={`${styles.fieldInput} ${styles.alignRight}`}
                  type="text"
                  maxLength={32}
                  placeholder="请输入喵呜邀请码"
                  autoComplete="off"
                />
              </label>
            </FieldBlock>

            <FieldBlock error={errors.nickname}>
              <label className={fieldCardClass(errors.nickname)}>
                <span className={styles.fieldLabel}>昵称</span>
                <input
                  value={form.nickname}
                  onChange={(event) => updateField("nickname", event.target.value)}
                  onBlur={() => commitFieldValidation("nickname")}
                  className={`${styles.fieldInput} ${styles.alignRight}`}
                  type="text"
                  maxLength={20}
                  placeholder="请输入昵称"
                  autoComplete="nickname"
                />
              </label>
            </FieldBlock>
          </div>

          <div className={styles.passwordFields}>
            <PasswordField
              error={errors.password}
              label="密码"
              placeholder="请输入您的密码"
              value={form.password}
              visible={showPassword}
              onBlur={() => commitFieldValidation("password")}
              onChange={(value) => updateField("password", value)}
              onToggle={() => setShowPassword((current) => !current)}
            />
            <PasswordField
              error={errors.confirmPassword}
              label="确认密码"
              placeholder="请再次输入您的密码"
              value={form.confirmPassword}
              visible={showConfirmPassword}
              onBlur={() => commitFieldValidation("confirmPassword")}
              onChange={(value) => updateField("confirmPassword", value)}
              onToggle={() => setShowConfirmPassword((current) => !current)}
            />
          </div>

          <div className={styles.agreementBlock}>
            <label className={styles.agreementRow}>
              <input
                checked={agreementChecked}
                className={styles.agreementInput}
                type="checkbox"
                onChange={(event) => setAgreementChecked(event.target.checked)}
              />
              <span className={styles.agreementDot} aria-hidden="true" />
              <span>我已阅读并同意用户隐私和服务协议。</span>
            </label>
          </div>

          <button className={`${styles.submitButton} ${isFormFilled ? styles.submitReady : ""}`} type="submit" disabled={registering || !isFormFilled}>
            {registering ? "注册中..." : "立即注册"}
          </button>
        </form>

        {toast ? <div className={styles.toast}>{toast}</div> : null}
        {agreementConfirmOpen ? (
          <div className={styles.dialogOverlay} role="dialog" aria-modal="true" aria-labelledby="register-agreement-title">
            <div className={styles.dialogPanel}>
              <h2 id="register-agreement-title">是否同意用户隐私和服务协议？</h2>
              <p>同意后将继续提交注册信息。</p>
              <div className={styles.dialogActions}>
                <button className={styles.dialogCancelButton} type="button" onClick={() => setAgreementConfirmOpen(false)}>
                  否
                </button>
                <button className={styles.dialogConfirmButton} type="button" disabled={registering} onClick={handleAgreementConfirm}>
                  是
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}

function FieldBlock({ children, error }: { children: React.ReactNode; error: string }) {
  return (
    <div className={styles.fieldBlock}>
      {children}
      {error ? <p className={styles.fieldError}>{error}</p> : null}
    </div>
  );
}

function PasswordField({
  error,
  label,
  onBlur,
  onChange,
  onToggle,
  placeholder,
  value,
  visible
}: {
  error: string;
  label: string;
  onBlur: () => void;
  onChange: (value: string) => void;
  onToggle: () => void;
  placeholder: string;
  value: string;
  visible: boolean;
}) {
  return (
    <FieldBlock error={error}>
      <label className={styles.passwordLabel}>{label}</label>
      <div className={passwordCardClass(error)}>
        <span className={styles.lockIcon} aria-hidden="true" />
        <span className={styles.passwordDivider} />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          className={styles.passwordInput}
          type={visible ? "text" : "password"}
          maxLength={20}
          placeholder={placeholder}
          autoComplete="new-password"
        />
        <button className={styles.eyeButton} type="button" aria-label={visible ? "隐藏密码" : "显示密码"} onClick={onToggle}>
          <span className={visible ? styles.eyeOpen : styles.eyeClosed} aria-hidden="true" />
        </button>
      </div>
    </FieldBlock>
  );
}

function fieldCardClass(error: string) {
  return `${styles.fieldCard} ${error ? styles.isError : ""}`;
}

function passwordCardClass(error: string) {
  return `${styles.passwordCard} ${error ? styles.isError : ""}`;
}

function validatePassword(value: string) {
  const password = value.trim();
  if (!password) return "请输入密码";
  if (password.length < 8 || password.length > 20) return "密码长度需为8-20位";
  if (/\s/.test(password)) return "密码不能包含空格";

  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const categoryCount = [hasLetter, hasNumber, hasSpecial].filter(Boolean).length;

  if (categoryCount < 2 || /^[A-Za-z]+$/.test(password) || /^\d+$/.test(password)) {
    return "密码需包含字母、数字或特殊符号中的至少两类";
  }

  return "";
}

function findAuthToken(value: unknown): string | null {
  const tokenKeys = new Set(["token", "mallToken", "accessToken", "access_token", "authorization"]);
  const visited = new Set<unknown>();

  function visit(current: unknown, depth: number): string | null {
    if (depth > 4 || current === null || typeof current !== "object" || visited.has(current)) {
      return null;
    }
    visited.add(current);

    for (const [key, rawValue] of Object.entries(current)) {
      if (tokenKeys.has(key)) {
        const token = String(rawValue ?? "").trim();
        if (token) {
          return token;
        }
      }
      const nestedToken = visit(rawValue, depth + 1);
      if (nestedToken) {
        return nestedToken;
      }
    }

    return null;
  }

  return visit(value, 0);
}
