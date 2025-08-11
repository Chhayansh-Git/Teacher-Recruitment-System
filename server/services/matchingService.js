// server/services/matchingService.js

import axios from "axios";
import { Engine } from "json-rules-engine";
// import { getQualificationLevel } from "../config/qualificationTiers.js"; // if needed

const AI_SERVICE_URL = process.env.AI_MATCHING_SERVICE_URL || "http://localhost:5005/knn-search";

const DEFAULT_RULES = [
  {
    conditions: {
      all: [
        { fact: "qualification", operator: "contains", value: "B.Ed" },
        { fact: "experience", operator: "greaterThanInclusive", value: 2 }
      ]
    },
    event: { type: "qualified" }
  }
];

const DEFAULT_RULE_WEIGHT = 1.0;
const DEFAULT_AI_WEIGHT = 0.7;

// Create a flat profile text for a candidate
function concatProfile(candidate) {
  const degree = candidate.education?.map(e => e.degree).join(" ") || "";
  const subjects = candidate.subjects?.join(" ") || "";
  const exp = candidate.experience
    ?.map(e => [e.designation, ...(e.subjects || [])].join(" "))
    .join(" ") || "";
  return [
    candidate.position,
    candidate.type,
    degree,
    candidate.skills?.join(" ") || "",
    exp,
    subjects,
    candidate.gender || "",
    candidate.address || "",
    candidate.languages?.join(" ") || "",
    candidate.extraResponsibilities?.join(" ") || ""
  ].join(" ");
}

export async function matchCandidates(requirement, candidates, options = {}) {
  // 1. Rule Engine (only pass candidates meeting hard constraints)
  const engine = new Engine(requirement.rules || DEFAULT_RULES);
  const passing = [];
  for (const c of candidates) {
    // Defensive: Check experience/education not undefined
    const experienceYears = (c.experience || []).reduce((sum, e) => {
      if (!e.fromPeriod) return sum;
      const from = new Date(e.fromPeriod);
      const to = e.toPeriod ? new Date(e.toPeriod) : new Date();
      return sum + (to - from) / (1000 * 60 * 60 * 24 * 365.25);
    }, 0);
    const facts = {
      experience: experienceYears,
      qualification: (c.education || []).map(e => e.degree)
    };
    const { events } = await engine.run(facts);
    if (events.length) passing.push(c);
  }
  if (!passing.length) return [];

  // 2. Prepare AI match request
  const requirementText = [
    requirement.post,
    (requirement.subjects || []).join(" "),
    requirement.teachingOrNonTeaching || "",
    requirement.qualification || "",
    (requirement.skills || []).join(" "),
    requirement.customDescription || ""
  ].join(" ");

  // Only match against passing candidate IDs
  const candidateIds = passing.map(c => String(c._id));

  let aiResults = [];
  try {
    const response = await axios.post(AI_SERVICE_URL, {
      requirement_text: requirementText,
      top_k: options.limit || 50,
      filter_ids: candidateIds
    });
    aiResults = response.data;
  } catch (err) {
    console.error("[matchingService] AI service call failed:", err.message);
    // Fallback: just return rule-passing candidates
    return passing;
  }

  // 3. Merge AI and rule scores
  const aiWeight = options.aiWeight || DEFAULT_AI_WEIGHT;
  const ruleWeight = options.ruleWeight || DEFAULT_RULE_WEIGHT;
  return aiResults.map(({ candidate_id, score }) => {
    const c = passing.find(item => String(item._id) === candidate_id);
    return {
      candidate: c,
      ruleScore: 1,
      aiScore: score,
      score: ruleWeight * 1 + aiWeight * score
    };
  })
    .sort((a, b) => b.score - a.score)
    .slice(0, options.limit || 50);
}
