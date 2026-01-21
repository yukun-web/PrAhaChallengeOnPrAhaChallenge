export { Team, TeamId, TeamName } from "./team";
export type {
  CreateTeamParams,
  ReconstructTeamParams,
  Team as TeamType,
  TeamId as TeamIdType,
  TeamName as TeamNameType,
} from "./team";

export { TeamCreated, TeamEventType } from "./events";
export type { TeamCreated as TeamCreatedType, TeamEvent } from "./events";

export {
  generateNextTeamName,
  selectTeamWithMinMembers,
  splitTeamMembers,
} from "./team-assignment.service";
export type {
  TeamMemberInfo,
  TeamSplitResult,
  TeamWithMemberCount,
} from "./team-assignment.service";

export { isTeamConsistencyOK } from "./team-consistency";
export type {
  NoMergeTarget,
  ParticipantInfo,
  TeamConsistencyCheckResult,
  TeamConsistencyOK,
  TeamNeedsMerge,
  TeamOverMaximum,
  TeamUnderMinimum,
} from "./team-consistency";
