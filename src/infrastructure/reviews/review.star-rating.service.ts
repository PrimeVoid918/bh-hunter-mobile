export type StarFill = number; // 0–1

/**
 *
 * @param {float} rating - The rating value (e.g., 4.5).
 * @param {int} maxStars - Max Rating is 5
 * @returns
 */
export function computeStarFills(rating: number, maxStars = 5): StarFill[] {
  return Array.from({ length: maxStars }, (_, i) => {
    return Math.min(Math.max(rating - i, 0), 1);
  });
}

export type StarDistribution = {
  star: number; // 5, 4, 3...
  count: number; // how many reviews
  percentage: number; // 0–1
};

// exprotconst computedDistribution: StarDistribution[] = Object.entries(distribution)
//     .map(([star, countStr]) => {
//       const count = Number(countStr);
//       const percentage = total > 0 ? count / total : 0;
//       return { star: Number(star), count, percentage };
//     })
//     .sort((a, b) => b.star - a.star); // descending stars

// export function computeStarDistribution(
//   reviews: { rating: number }[],
//   maxStars = 5,
// ) {
//   const total = reviews.length;
//   const distribution: StarDistribution[] = [];

//   for (let star = maxStars; star >= 1; star--) {
//     const count = reviews.filter((r) => Math.round(r.rating) === star).length;
//     const percentage = total > 0 ? count / total : 0;
//     distribution.push({ star, count, percentage });
//   }

//   return distribution;
// }
