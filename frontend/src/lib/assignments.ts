export const formatAssignmentName = (id: string) => {
  if (id === "lab-1") {
    return "Lab 1: Basics";
  }

  const cleaned = id.replace(/[-_]+/g, " ");
  return cleaned.replace(/\b\w/g, (char) => char.toUpperCase());
};
