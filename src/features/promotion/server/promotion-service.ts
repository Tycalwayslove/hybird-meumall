import { promotionActivities } from "../mock/activities";
import { buildPromotionBenefits } from "../mock/benefits";
import { buildPromotionHome } from "../mock/home";
import { buildRanking, rankCenter } from "../mock/rankings";
import type { RankingPeriod, RankingType, TalentLevel } from "../types";

const talentLevelSet = new Set<TalentLevel>(["v1", "v2", "v3", "v4", "v5"]);
const rankingPeriodSet = new Set<RankingPeriod>(["day", "week", "month"]);

export function normalizeTalentLevel(level: string | null | undefined): TalentLevel {
  return talentLevelSet.has(level as TalentLevel) ? (level as TalentLevel) : "v1";
}

export function normalizeRankingPeriod(period: string | null | undefined): RankingPeriod {
  return rankingPeriodSet.has(period as RankingPeriod) ? (period as RankingPeriod) : "day";
}

export function getPromotionHome(level?: string | null) {
  return buildPromotionHome(normalizeTalentLevel(level ?? "v3"));
}

export function getPromotionActivities() {
  return promotionActivities;
}

export function getPromotionRankCenter() {
  return rankCenter;
}

export function getPromotionRanking(type: RankingType, period?: string | null) {
  return buildRanking(type, normalizeRankingPeriod(period));
}

export function getPromotionBenefits(level?: string | null) {
  return buildPromotionBenefits(normalizeTalentLevel(level ?? "v3"));
}

export function getAllPromotionBenefits() {
  return Array.from(talentLevelSet).map((level) => buildPromotionBenefits(level));
}

export function bffJson<T>(data: T, requestId: string) {
  return Response.json({
    success: true,
    data,
    requestId
  });
}

export function requestIdFrom(request: Request, fallback: string) {
  return request.headers.get("x-request-id") ?? fallback;
}
