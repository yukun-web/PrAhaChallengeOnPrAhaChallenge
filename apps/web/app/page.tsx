"use client";

import { useActionState } from "react";
import type { CSSProperties } from "react";

import {
  enrollParticipant,
  reactivateParticipantAction,
  suspendParticipantAction,
  withdrawParticipantAction,
} from "./actions/participants";

type ActionState = {
  ok: boolean;
  message: string;
};

type ActionKey = "enroll" | "suspend" | "reactivate" | "withdraw";

const initialState: ActionState = { ok: false, message: "" };

const actionStyles: Record<ActionKey, CSSProperties> = {
  enroll: { borderColor: "#94a3b8" },
  suspend: { borderColor: "#f59e0b" },
  reactivate: { borderColor: "#10b981" },
  withdraw: { borderColor: "#ef4444" },
};

const statusTextColor = (state: ActionState, pending: boolean) => {
  if (pending) return "#1d4ed8";
  if (state.message) {
    return state.ok ? "#047857" : "#b91c1c";
  }
  return "#64748b";
};

export default function HomePage() {
  const [enrollState, enrollAction, enrollPending] = useActionState(
    enrollParticipant,
    initialState,
  );
  const [suspendState, suspendAction, suspendPending] = useActionState(
    suspendParticipantAction,
    initialState,
  );
  const [reactivateState, reactivateAction, reactivatePending] = useActionState(
    reactivateParticipantAction,
    initialState,
  );
  const [withdrawState, withdrawAction, withdrawPending] = useActionState(
    withdrawParticipantAction,
    initialState,
  );

  return (
    <main style={{ padding: 32, display: "flex", flexDirection: "column", gap: 24 }}>
      <header style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <p style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, color: "#64748b" }}>
          Participant Console
        </p>
        <h1 style={{ fontSize: 28, margin: 0 }}>参加者の登録・休会・復帰・退会</h1>
        <p style={{ margin: 0, color: "#475569" }}>
          登録後に表示される参加者 ID を控えて、休会・復帰・退会に利用してください。
        </p>
      </header>

      <section
        style={{
          border: "1px solid #cbd5f5",
          borderRadius: 12,
          padding: 20,
          background: "#f8fafc",
          ...actionStyles.enroll,
        }}
      >
        <h2 style={{ marginTop: 0 }}>参加者登録</h2>
        <form action={enrollAction} style={{ display: "grid", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span>氏名</span>
            <input
              name="name"
              required
              placeholder="例: 山田太郎"
              style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }}
            />
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span>メールアドレス</span>
            <input
              type="email"
              name="email"
              required
              placeholder="example@example.com"
              style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }}
            />
          </label>
          <button
            type="submit"
            disabled={enrollPending}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              border: "none",
              background: "#0f172a",
              color: "white",
              cursor: "pointer",
            }}
          >
            登録する
          </button>
        </form>
        <p style={{ marginTop: 12, color: statusTextColor(enrollState, enrollPending) }}>
          {enrollPending ? "処理中..." : enrollState.message}
        </p>
      </section>

      <div
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        }}
      >
        <section
          style={{
            border: "1px solid #f1f5f9",
            borderRadius: 12,
            padding: 20,
            background: "#ffffff",
            ...actionStyles.suspend,
          }}
        >
          <h2 style={{ marginTop: 0 }}>休会</h2>
          <form action={suspendAction} style={{ display: "grid", gap: 12 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span>参加者 ID</span>
              <input
                name="participantId"
                required
                placeholder="UUID"
                style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }}
              />
            </label>
            <button
              type="submit"
              disabled={suspendPending}
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                border: "none",
                background: "#f59e0b",
                color: "white",
                cursor: "pointer",
              }}
            >
              休会にする
            </button>
          </form>
          <p style={{ marginTop: 12, color: statusTextColor(suspendState, suspendPending) }}>
            {suspendPending ? "処理中..." : suspendState.message}
          </p>
        </section>

        <section
          style={{
            border: "1px solid #f1f5f9",
            borderRadius: 12,
            padding: 20,
            background: "#ffffff",
            ...actionStyles.reactivate,
          }}
        >
          <h2 style={{ marginTop: 0 }}>復帰</h2>
          <form action={reactivateAction} style={{ display: "grid", gap: 12 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span>参加者 ID</span>
              <input
                name="participantId"
                required
                placeholder="UUID"
                style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }}
              />
            </label>
            <button
              type="submit"
              disabled={reactivatePending}
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                border: "none",
                background: "#10b981",
                color: "white",
                cursor: "pointer",
              }}
            >
              復帰させる
            </button>
          </form>
          <p style={{ marginTop: 12, color: statusTextColor(reactivateState, reactivatePending) }}>
            {reactivatePending ? "処理中..." : reactivateState.message}
          </p>
        </section>

        <section
          style={{
            border: "1px solid #fee2e2",
            borderRadius: 12,
            padding: 20,
            background: "#ffffff",
            ...actionStyles.withdraw,
          }}
        >
          <h2 style={{ marginTop: 0 }}>退会</h2>
          <form action={withdrawAction} style={{ display: "grid", gap: 12 }}>
            <label style={{ display: "grid", gap: 6 }}>
              <span>参加者 ID</span>
              <input
                name="participantId"
                required
                placeholder="UUID"
                style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }}
              />
            </label>
            <button
              type="submit"
              disabled={withdrawPending}
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                border: "none",
                background: "#ef4444",
                color: "white",
                cursor: "pointer",
              }}
            >
              退会にする
            </button>
          </form>
          <p style={{ marginTop: 12, color: statusTextColor(withdrawState, withdrawPending) }}>
            {withdrawPending ? "処理中..." : withdrawState.message}
          </p>
        </section>
      </div>
    </main>
  );
}
