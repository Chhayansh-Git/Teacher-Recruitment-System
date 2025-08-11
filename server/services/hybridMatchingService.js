// server/services/hybridMatchingService.js

import axios from "axios";
import { Engine } from "json-rules-engine";
import config from "../config";

// Python microservice config
const AI_SERVICE_URL = process.env.AI_MATCHING_SERVICE_URL || "http://localhost:5005/knn-search";

export async function hybridMatch(requirement, candidates, topK = 15) {
  // 1. Prepare business rules
  const rules = requirement.rules || config.defaultRules || [];
  const engine = new Engine(rules);

  // 2. Rule-based filtering (hard constraints)
  const rulePassIds = [];
  for (const cand of candidates) {
    try {
      const { events } = await engine.run(cand);
      if (events.length) rulePassIds.push(String(cand._id));
    } catch (err) {
      console.warn("Rule engine error", err, cand._id);
    }
  }
  if (rulePassIds.length === 0) return [];

  // 3. Prepare request for Python AI microservice
  const requirementText =
    requirement.post + " " +
    (requirement.subjects ? requirement.subjects.join(" ") : "") +
    " " + (requirement.teachingOrNonTeaching || "") +
    " " + (requirement.qualification || "") +
    " " + (requirement.skills || []).join(" ") +
    " " + (requirement.customDescription || "");

  let aiMatches = [];
  try {
    const response = await axios.post(AI_SERVICE_URL, {
      requirement_text: requirementText,
      top_k: topK,
      filter_ids: rulePassIds,
    });
    aiMatches = response.data;
  } catch (err) {
    console.error("[hybridMatchingService] AI service call failed:", err.message);
    // Return unsorted (only rule-matching) candidates as fallback:
    return candidates.filter(c => rulePassIds.includes(String(c._id)));
  }

  const ruleWeight = config.matching?.ruleWeight || 1.0;
  const aiWeight = config.matching?.aiWeight || 0.7;

  return aiMatches.map(({ candidate_id, score }) => {
    const candidate = candidates.find(cand => String(cand._id) === candidate_id);
    return {
      ...candidate?.toObject?.() || candidate,
      matchScore: aiWeight * score + ruleWeight,
      aiScore: score,
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
}
