/**
 * Pushes item to first place in the array and limits array length to limit.
 * When array length is equal to limit, last item is removed.
 * @param array Array to push item to.
 * @param item Item to push to array.
 * @param limit Maximum length of array.
 */
function unshiftItemToLimitedArray<T>(array: T[], item: T, limit: number) {
  if (array.length > limit) {
    throw new Error("Initial array length can't be more than limit");
  }

  const newArray = [item, ...array];

  if (newArray.length > limit) {
    newArray.pop();
  }

  return newArray;
}

export const logUtils = {
  unshiftItemToLimitedArray,
};
