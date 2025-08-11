// server/rules/requirementRules.js

/**
 * Example: Rule-based filtering for matching engine (json-rules-engine)
 */

export default [
  {
    conditions: {
      all: [
        {
          fact: 'qualification',
          operator: 'contains',
          value: 'B.Ed'
        },
        {
          fact: 'experience',
          operator: 'greaterThanInclusive',
          value: 2
        }
      ]
    },
    event: {
      type: 'qualified',
      params: {
        message: 'Meets minimum requirements'
      }
    }
  }
  // Add more rules as the business grows!
];
