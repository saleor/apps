function roundFloatToTwoDecimals(float: number): number {
  return Math.round(float * 100) / 100;
}

export const numbers = {
  roundFloatToTwoDecimals,
};
