export const formattedDate = (date: Date) => {
  return new Date(date).toLocaleString("fr-FR", {
    timeZone: "Europe/Paris",
  });
};

export const formatPrice = (value: number) =>
  Number(value).toLocaleString("en-US", {
    // notation: "compact",
    // style: "currency",
    currency: "XOF",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
