// server/services/matchingService.js

import axios from "axios";
import { Engine } from "json-rules-engine";
import logger from "../utils/logger.js";

const AI_SERVICE_URL = process.env.AI_MATCHING_SERVICE_URL || "http://localhost:5005/knn-search";
const DEFAULT_AI_WEIGHT = 0.7;
const DEFAULT_RULE_WEIGHT = 0.3;

export async function matchCandidates(requirement, candidates, options = {}) {
  if (!candidates || candidates.length === 0) {
    return [];
  }

  const requirementText = [
    `Job Title: ${requirement.title || ""}`, `Position: ${requirement.post || ""}`,
    `Role Type: ${requirement.teachingOrNonTeaching || ""}`, `Required Qualification: ${requirement.minQualification || ""}`,
    `Minimum Experience Required: ${requirement.minExperience || 0} years`,
  ].join(". ");
  
  const engine = new Engine();

  engine.addOperator('matchesLocation', (factValue, jsonValue) => {
    if (!factValue || factValue.length === 0) return true;
    if (!jsonValue) return true;
    return factValue.includes(jsonValue);
  });

  const rules = [{
    conditions: {
      all: [
        { fact: 'qualifications', operator: 'contains', value: requirement.minQualification },
        { fact: 'experienceYears', operator: 'greaterThanInclusive', value: requirement.minExperience || 0 },
        { fact: 'expectedSalary', operator: 'lessThanInclusive', value: requirement.maxSalary || 99999999 },
        { fact: 'preferredLocations', operator: 'matchesLocation', value: requirement.school?.location }
      ]
    },
    event: { type: 'isLogisticalMatch' }
  }];
  
  rules.forEach(rule => engine.addRule(rule));
  
  const passingCandidates = [];
  for (const c of candidates) {
    // Correctly calculate total experience in years from the full Mongoose document
    const experienceYears = (c.experience || []).reduce((sum, e) => {
        if (!e.from || !e.to) return sum;
        const from = new Date(e.from);
        const to = new Date(e.to);
        return sum + (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    }, 0);
    
    // Generate facts using the full Mongoose document
    const facts = {
      experienceYears,
      qualifications: (c.education || []).map(e => e.degree).filter(Boolean),
      expectedSalary: c.expectedSalary || 0,
      preferredLocations: c.preferredLocations || [],
    };

    const { events } = await engine.run(facts);
    if (events.length > 0) {
      passingCandidates.push(c);
    }
  }

  if (passingCandidates.length === 0) {
    logger.info(`[matchingService] No candidates passed the rule-based filter for requirement: ${requirement._id}`);
    return [];
  }

  const candidateIds = passingCandidates.map(c => String(c._id));
  let aiResults = [];
  try {
    const response = await axios.post(AI_SERVICE_URL, {
      requirement_text: requirementText,
      top_k: options.limit || 50,
      filter_ids: candidateIds
    });
    aiResults = response.data;
  } catch (err) {
    logger.error("[matchingService] AI service call failed:", err.message);
    return [];
  }

  const aiWeight = options.aiWeight || DEFAULT_AI_WEIGHT;
  const ruleWeight = options.ruleWeight || DEFAULT_RULE_WEIGHT;

  const finalResults = aiResults.map(({ candidate_id, score }) => {
    const candidate = passingCandidates.find(item => String(item._id) === candidate_id);
    return {
      candidate: candidate.toObject(),
      ruleScore: 1,
      aiScore: score,
      score: (ruleWeight * 1) + (aiWeight * score)
    };
  });
  
  return finalResults.sort((a, b) => b.score - a.score).slice(0, options.limit || 50);
}