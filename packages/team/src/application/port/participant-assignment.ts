/**
 * 参加者のチーム割り当てパラメータです。
 */
export type AssignParticipantToTeamParams = {
  /**
   * 参加者の識別子です。
   */
  participantId: string;

  /**
   * 割り当てるチームの識別子です。
   */
  teamId: string;
};

/**
 * 参加者のチーム割り当てを行うポートのインターフェースです。
 */
export type ParticipantAssignment = {
  /**
   * 参加者をチームに割り当てます。
   *
   * @param params 割り当てに必要なパラメータです。
   * @throws {DomainError} 参加者が存在しない場合や割り当てできない状態の場合にスローされます。
   * @throws {InfrastructureError} 割り当てに失敗した場合にスローされます。
   */
  assignToTeam: (params: AssignParticipantToTeamParams) => Promise<void>;
};
