const assignmentNames: Record<string, string> = {
  "lab-1": "Lab 1: Basics",
};

export const formatAssignmentName = (id: string) => {
  if (assignmentNames[id]) {
    return assignmentNames[id];
  }

  const cleaned = id.replace(/[-_]+/g, " ");
  return cleaned.replace(/\b\w/g, (char) => char.toUpperCase());
};
