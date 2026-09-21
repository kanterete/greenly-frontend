export const formatDate = (value) => {
  if (!value) return "Brak danych";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Brak danych";
  return date.toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const formatDateTime = (value) => {
  if (!value) return "Brak danych";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Brak danych";
  return date.toLocaleString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getNextWatering = (plant) => {
  const schedule = plant?.schedules?.find((item) => item.taskType?.key === "water") || plant?.schedules?.[0];
  return schedule?.nextDueDate || null;
};

export const daysUntil = (value) => {
  if (!value) return null;
  const today = new Date();
  const target = new Date(value);
  if (Number.isNaN(target.getTime())) return null;
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
};

export const wateringStatus = (plant) => {
  const days = daysUntil(getNextWatering(plant));
  if (days === null) return { label: "Brak harmonogramu", className: "neutral" };
  if (days < 0) return { label: `Zaległe ${Math.abs(days)} dni`, className: "danger" };
  if (days === 0) return { label: "Dzisiaj", className: "warning" };
  if (days === 1) return { label: "Jutro", className: "warning" };
  return { label: `Za ${days} dni`, className: "success" };
};
