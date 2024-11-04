export const calculateTotalPrice = (dailyPrice, startDate, endDate) => {
  const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  return dailyPrice * days;
};
