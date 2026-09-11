const normalizeList = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item || "").toLowerCase().trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.toLowerCase().trim())
      .filter(Boolean);
  }

  return [];
};

/**
 * Calculates mutual interest percentage and returns overlapping items.
 */
export const calculateInterestMatch = (
  currentUserInterests = [],
  targetUserInterests = []
) => {
  const normalizedCurrent = normalizeList(currentUserInterests);
  const normalizedTarget = normalizeList(targetUserInterests);

  if (!normalizedCurrent.length || !normalizedTarget.length) {
    return { score: 0, sharedInterests: [] };
  }

  const setA = new Set(normalizedCurrent);
  const setB = new Set(normalizedTarget);

  const sharedInterests = [...setA].filter((interest) => setB.has(interest));
  const unionSet = new Set([...setA, ...setB]);
  const score = unionSet.size
    ? Math.round((sharedInterests.length / unionSet.size) * 100)
    : 0;

  return {
    score,
    sharedInterests: sharedInterests.map(
      (interest) => interest.charAt(0).toUpperCase() + interest.slice(1)
    ),
  };
};

export const calculateSkillOverlap = (currentUserSkills = [], targetUserSkills = []) => {
  const normalizedCurrent = normalizeList(currentUserSkills);
  const normalizedTarget = normalizeList(targetUserSkills);

  if (!normalizedCurrent.length || !normalizedTarget.length) {
    return { score: 0, sharedSkills: [] };
  }

  const setA = new Set(normalizedCurrent);
  const setB = new Set(normalizedTarget);
  const sharedSkills = [...setA].filter((skill) => setB.has(skill));

  return {
    score: Math.round((sharedSkills.length / Math.max(setA.size, 1)) * 100),
    sharedSkills: sharedSkills.map(
      (skill) => skill.charAt(0).toUpperCase() + skill.slice(1)
    ),
  };
};
