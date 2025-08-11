// server/tests/hybridMatchingService.test.js

const { hybridMatch } = require("../services/hybridMatchingService");
const nock = require("nock");

describe("hybridMatch", () => {
  it("combines rule and AI scores", async () => {
    // Mock candidate array
    const candidates = [
      { _id: "1", experience: 5, qualification: ['B.Ed'] },
      { _id: "2", experience: 1, qualification: ['B.A.'] }
    ];
    // Mock rule returns (simulate one passes)
    // Mock Python microservice response
    nock("http://localhost:5005")
      .post("/knn-search")
      .reply(200,
        [{ candidate_id: "1", score: 0.85 }]
      );
    // Minimal requirement
    const requirement = { post: "Math Teacher", rules: require("../rules/requirementRules") };

    const results = await hybridMatch(requirement, candidates, 5);
    expect(results[0].aiScore).toBeGreaterThan(0.5);
    expect(results.length).toBe(1);
  });
});
