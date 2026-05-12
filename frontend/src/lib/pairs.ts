const fallbackPairLabel = "STU-045 vs STU-067";

export const formatPairLabel = (pairId?: string) => {
  if (!pairId) {
    return fallbackPairLabel;
  }

  const normalized = pairId.replace(/_/g, "-");
  const parts = normalized.split("-");
  if (parts.length >= 4) {
    const left = `${parts[0]}-${parts[1]}`.toUpperCase();
    const right = `${parts[2]}-${parts[3]}`.toUpperCase();
    return `${left} vs ${right}`;
  }

  if (normalized.includes("vs")) {
    return normalized.replace(/-/g, " ").toUpperCase();
  }

  return normalized.toUpperCase();
};
