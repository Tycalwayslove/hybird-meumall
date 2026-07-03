"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { localAssetUrl } from "@/lib/assets/local-assets";
import { createH5Client } from "@/lib/http";
import { createHybridNavigator } from "@/lib/navigation/hybrid-navigation";
import { createCertificationApi } from "../api";
import type { CertificationMemberInfoData } from "../types";
import styles from "./CertificationScreens.module.css";

const successIcon = localAssetUrl("certification.result.success");
const failedIcon = localAssetUrl("certification.result.failed");

export function CertificationEntryScreen() {
  const router = useRouter();
  const token = useUrlToken();

  function handleStart() {
    router.push(withToken("/register/certification/name", token));
  }

  return (
    <main className={styles.page}>
      <section className={styles.screen} aria-label="喵呜达人认证">
        <header className={styles.header}>
          <span className={styles.logoMark} aria-hidden="true" />
          <h1>喵呜达人认证</h1>
        </header>

        <p className={styles.introText}>
          请及时完成：达人<span className={styles.accent}>实名认证</span>和<span className={styles.accent}>银行卡绑定</span>
        </p>

        <div className={styles.infoCard}>
          <InfoItem>由于电商经营合规性要求，实名认证过程中需要获取您的身份信息</InfoItem>
          <InfoItem>绑定的银行卡账号需与您的实名信息一致，后续收益可直接提现至绑定的银行卡</InfoItem>
          <InfoItem>在完成认证及银行卡绑定前，您将无法正常享受带货收益</InfoItem>
        </div>

        <div className={styles.bottomAction}>
          <button className={styles.primaryButton} type="button" onClick={handleStart}>
            实名认证
          </button>
        </div>
      </section>
    </main>
  );
}

export function CertificationNameScreen() {
  const router = useRouter();
  const token = useUrlToken();
  const api = useMemo(() => createCertificationApi(createH5Client()), []);
  const [realName, setRealName] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const canSubmit = Boolean(realName.trim()) && !submitting;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = validateRealName(realName);
    setError(message);
    if (message || submitting) return;

    setSubmitting(true);
    setToast("");

    const result = await api.getApplyUrl(realName.trim(), token);
    if (!result.success) {
      setSubmitting(false);
      setToast(result.message || "获取实名认证链接失败");
      return;
    }

    openApplyUrl(result.data.view.applyUrl, withToken("/register/certification/result", token));
  }

  function openApplyUrl(applyUrl: string, resultHref: string) {
    const navigator = createHybridNavigator();
    if (navigator.isNativeAvailable()) {
      navigator.openWebView({
        href: applyUrl,
        source: "register-certification",
        title: "实名认证",
        presentation: { style: "push", animated: true }
      });
      router.replace(resultHref);
      return;
    }

    window.location.href = applyUrl;
  }

  return (
    <main className={styles.page}>
      <section className={styles.screen} aria-label="输入真实姓名">
        <form className={styles.nameForm} onSubmit={handleSubmit} noValidate>
          <p className={styles.nameLead}>请输入您的真实姓名，并点击下一步</p>
          <input
            value={realName}
            className={styles.nameInput}
            type="text"
            maxLength={20}
            placeholder="真实姓名"
            autoComplete="name"
            onBlur={() => setError(validateRealName(realName))}
            onChange={(event) => {
              setRealName(event.target.value);
              setError("");
            }}
          />
          {error ? <p className={styles.fieldError}>{error}</p> : null}

          <section className={styles.tips} aria-label="温馨提示">
            <h2>温馨提示</h2>
            <ol>
              <li>
                <span className={styles.tipNumber}>1</span>
                <span>名称仅支持中文</span>
              </li>
              <li>
                <span className={styles.tipNumber}>2</span>
                <span>每个名称仅能注册三次</span>
              </li>
              <li>
                <span className={styles.tipNumber}>3</span>
                <span>名称注册后不支持更改，请您认真填写</span>
              </li>
            </ol>
          </section>

          <div className={styles.nameSubmit}>
            <button className={canSubmit ? styles.primaryButton : styles.secondaryButton} type="submit" disabled={!canSubmit}>
              {submitting ? "获取中..." : "下一步"}
            </button>
          </div>
        </form>

        {toast ? <div className={styles.toast}>{toast}</div> : null}
      </section>
    </main>
  );
}

export function CertificationResultScreen() {
  const router = useRouter();
  const token = useUrlToken();
  const api = useMemo(() => createCertificationApi(createH5Client()), []);
  const [result, setResult] = useState<CertificationMemberInfoData["view"] | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    api.getMemberInfo(token).then((response) => {
      if (cancelled) return;
      if (!response.success) {
        setResult({
          memberName: "喵呜达人",
          reason: response.message || "认证结果查询失败",
          success: false
        });
        setErrorMessage(response.message || "认证结果查询失败");
        return;
      }
      setResult(response.data.view);
    });

    return () => {
      cancelled = true;
    };
  }, [api, token]);

  function handlePrimaryAction() {
    if (!result?.success) {
      router.replace(withToken("/register/certification/name", token));
      return;
    }

    createHybridNavigator().switchTab("home", { closeCurrentWebView: true });
  }

  if (!result) {
    return (
      <main className={styles.page}>
        <section className={styles.screen} aria-label="认证结果确认中">
          <div className={styles.resultScreen}>
            <h1 className={styles.resultTitle}>认证结果确认中</h1>
            <p className={styles.loadingText}>正在查询您的实名认证结果...</p>
          </div>
        </section>
      </main>
    );
  }

  const isSuccess = result.success;
  const title = isSuccess ? "喵呜达人注册成功" : "喵呜达人注册失败";
  const message = isSuccess
    ? "恭喜您成功注册成为喵呜达人用户！您现在可以下载MeuMallAPP开始您的喵呜购物及带货旅程了!"
    : `注册失败原因：${result.reason || errorMessage || "认证状态未完成"}`;

  return (
    <main className={styles.page}>
      <section className={styles.screen} aria-label={title}>
        <div className={styles.resultScreen}>
          <h1 className={styles.resultTitle}>{title}</h1>
          <div className={styles.resultContent}>
            <span
              className={styles.resultIcon}
              role="img"
              aria-label={isSuccess ? "认证成功" : "认证失败"}
              style={{ backgroundImage: `url(${isSuccess ? successIcon : failedIcon})` }}
            />
            <p className={styles.memberName}>尊敬的{result.memberName || "喵呜达人"}</p>
            <p className={styles.resultMessage}>{message}</p>
          </div>
        </div>

        <div className={styles.bottomAction}>
          <button className={styles.primaryButton} type="button" onClick={handlePrimaryAction}>
            {isSuccess ? "打开喵呜商城APP" : "重新认证"}
          </button>
        </div>
      </section>
    </main>
  );
}

function InfoItem({ children }: { children: React.ReactNode }) {
  return (
    <p className={styles.infoItem}>
      <span className={styles.infoIcon} aria-hidden="true">
        i
      </span>
      <span>{children}</span>
    </p>
  );
}

function useUrlToken() {
  const searchParams = useSearchParams();
  return searchParams.get("token")?.trim() || null;
}

function withToken(path: string, token: string | null) {
  if (!token) {
    return path;
  }
  return `${path}?${new URLSearchParams({ token }).toString()}`;
}

function validateRealName(value: string) {
  const realName = value.trim();
  if (!realName) return "请输入真实姓名";
  if (!/^[\u4e00-\u9fa5·]{2,20}$/.test(realName)) return "真实姓名仅支持2-20个中文字符";
  return "";
}
