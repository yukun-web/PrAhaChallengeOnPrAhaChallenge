import type { EventBus } from "@ponp/event-bus";
import type { Database } from "@ponp/fundamental";

import {
  createEnrollUseCase,
  createReactivateUseCase,
  createSuspendUseCase,
  createWithdrawUseCase,
  type ExecuteEnrollUseCase,
  type ExecuteReactivateUseCase,
  type ExecuteSuspendUseCase,
  type ExecuteWithdrawUseCase,
} from "./application";
import type { EventPublisher } from "./application/port/event-publisher";
import type { ParticipantRepository } from "./application/port/participant.repository";
import { ParticipantDrizzleRepository, PonpEventBusEventPublisher } from "./infrastructure";

/**
 * 参加者モジュールの依存関係です。
 */
type ParticipantModuleDependencies = {
  /**
   * Drizzle の Database インスタンスです。
   */
  db: Database;

  /**
   * イベントバスのインスタンスです。
   */
  eventBus: EventBus;
};

/**
 * 参加者モジュールの操作関数をまとめた型です。
 */
export type ParticipantModule = {
  /**
   * 参加者を保存・取得するリポジトリです。
   */
  participantRepository: ParticipantRepository;

  /**
   * 参加者イベントを発行するパブリッシャーです。
   */
  eventPublisher: EventPublisher;
};

/**
 * 参加者モジュールを作成します。
 *
 * @param dependencies 依存関係を指定します。
 * @returns 参加者モジュールを返します。
 */
export const createParticipantModule = (
  dependencies: ParticipantModuleDependencies,
): ParticipantModule => {
  const { db, eventBus } = dependencies;
  const participantRepository = ParticipantDrizzleRepository({ db });
  const eventPublisher = PonpEventBusEventPublisher({ eventBus });

  return {
    participantRepository,
    eventPublisher,
  };
};

/**
 * 新しい参加者を入会状態で作成し、保存します。
 *
 * @param module 参加者モジュールを指定します。
 * @param params 入会に必要なパラメータを指定します。
 * @returns 入会処理の結果を返します。
 * @throws {ValidationError} 名前またはメールアドレスが不正な場合にスローされます。
 * @throws {InfrastructureError} 保存またはイベント発行に失敗した場合にスローされます。
 */
export const enrollNewParticipant = (
  module: ParticipantModule,
  params: Parameters<ExecuteEnrollUseCase>[0],
): ReturnType<ExecuteEnrollUseCase> => {
  const executeEnrollUseCase = createEnrollUseCase({
    participantRepository: module.participantRepository,
    eventPublisher: module.eventPublisher,
  });

  return executeEnrollUseCase(params);
};

/**
 * 参加者を休会状態に変更し、保存します。
 *
 * @param module 参加者モジュールを指定します。
 * @param params 休会に必要なパラメータを指定します。
 * @returns 休会処理の結果を返します。
 * @throws {ValidationError} 参加者 ID が不正な場合にスローされます。
 * @throws {DomainError} 参加者が存在しない場合や休会できない状態の場合にスローされます。
 * @throws {InfrastructureError} 取得・保存またはイベント発行に失敗した場合にスローされます。
 */
export const suspendParticipant = (
  module: ParticipantModule,
  params: Parameters<ExecuteSuspendUseCase>[0],
): ReturnType<ExecuteSuspendUseCase> => {
  const executeSuspendUseCase = createSuspendUseCase({
    participantRepository: module.participantRepository,
    eventPublisher: module.eventPublisher,
  });

  return executeSuspendUseCase(params);
};

/**
 * 休会中の参加者を復帰状態に変更し、保存します。
 *
 * @param module 参加者モジュールを指定します。
 * @param params 復帰に必要なパラメータを指定します。
 * @returns 復帰処理の結果を返します。
 * @throws {ValidationError} 参加者 ID が不正な場合にスローされます。
 * @throws {DomainError} 参加者が存在しない場合や復帰できない状態の場合にスローされます。
 * @throws {InfrastructureError} 取得・保存またはイベント発行に失敗した場合にスローされます。
 */
export const reactivateParticipant = (
  module: ParticipantModule,
  params: Parameters<ExecuteReactivateUseCase>[0],
): ReturnType<ExecuteReactivateUseCase> => {
  const executeReactivateUseCase = createReactivateUseCase({
    participantRepository: module.participantRepository,
    eventPublisher: module.eventPublisher,
  });

  return executeReactivateUseCase(params);
};

/**
 * 参加者を退会状態に変更し、保存します。
 *
 * @param module 参加者モジュールを指定します。
 * @param params 退会に必要なパラメータを指定します。
 * @returns 退会処理の結果を返します。
 * @throws {ValidationError} 参加者 ID が不正な場合にスローされます。
 * @throws {DomainError} 参加者が存在しない場合や退会できない状態の場合にスローされます。
 * @throws {InfrastructureError} 取得・保存またはイベント発行に失敗した場合にスローされます。
 */
export const withdrawParticipant = (
  module: ParticipantModule,
  params: Parameters<ExecuteWithdrawUseCase>[0],
): ReturnType<ExecuteWithdrawUseCase> => {
  const executeWithdrawUseCase = createWithdrawUseCase({
    participantRepository: module.participantRepository,
    eventPublisher: module.eventPublisher,
  });

  return executeWithdrawUseCase(params);
};
