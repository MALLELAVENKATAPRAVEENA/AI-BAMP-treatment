export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
};

export const formatPercentage = (val) => {
  if (val === undefined || val === null) return '0%';
  return `${Number(val).toFixed(1)}%`;
};
