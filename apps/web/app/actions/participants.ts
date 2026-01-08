"use server";

import {
  enrollNewParticipant,
  reactivateParticipant,
  suspendParticipant,
  withdrawParticipant,
} from "@ponp/participant";

import { participantModule } from "../../bootstrap";

type ActionState = {
  ok: boolean;
  message: string;
};

const defaultErrorMessage = "不明なエラーが発生しました。";

const toErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return defaultErrorMessage;
};

const extractText = (value: FormDataEntryValue | null): string => {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
};

export const enrollParticipant = async (
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  const name = extractText(formData.get("name"));
  const email = extractText(formData.get("email"));

  if (!name || !email) {
    return { ok: false, message: "名前とメールアドレスを入力してください。" };
  }

  try {
    await enrollNewParticipant(participantModule, { name, email });
    return { ok: true, message: "参加者を登録しました。" };
  } catch (error) {
    console.error("参加者登録に失敗しました。", error);
    return { ok: false, message: toErrorMessage(error) };
  }
};

export const suspendParticipantAction = async (
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  const participantId = extractText(formData.get("participantId"));

  if (!participantId) {
    return { ok: false, message: "参加者 ID を入力してください。" };
  }

  try {
    await suspendParticipant(participantModule, { participantId });
    return { ok: true, message: "参加者を休会にしました。" };
  } catch (error) {
    console.error("参加者の休会に失敗しました。", error);
    return { ok: false, message: toErrorMessage(error) };
  }
};

export const reactivateParticipantAction = async (
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  const participantId = extractText(formData.get("participantId"));

  if (!participantId) {
    return { ok: false, message: "参加者 ID を入力してください。" };
  }

  try {
    await reactivateParticipant(participantModule, { participantId });
    return { ok: true, message: "参加者を復帰にしました。" };
  } catch (error) {
    console.error("参加者の復帰に失敗しました。", error);
    return { ok: false, message: toErrorMessage(error) };
  }
};

export const withdrawParticipantAction = async (
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  const participantId = extractText(formData.get("participantId"));

  if (!participantId) {
    return { ok: false, message: "参加者 ID を入力してください。" };
  }

  try {
    await withdrawParticipant(participantModule, { participantId });
    return { ok: true, message: "参加者を退会にしました。" };
  } catch (error) {
    console.error("参加者の退会に失敗しました。", error);
    return { ok: false, message: toErrorMessage(error) };
  }
};
