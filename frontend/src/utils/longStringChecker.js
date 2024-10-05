export const longStringChecker = (string) => {
  const regex = /(\w{30,})/g;
  return regex.test(string);
};
