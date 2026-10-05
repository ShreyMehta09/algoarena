/** Standard Elo rating calculation */

const K_FACTOR = 32;

/**
 * Calculate expected score for player A against player B
 */
export function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

/**
 * Calculate Elo changes after a match
 * @param winnerRating  - Current Elo of the winner
 * @param loserRating   - Current Elo of the loser
 * @returns { winnerDelta, loserDelta } — positive for winner, negative for loser
 */
export function calculateEloChange(
  winnerRating: number,
  loserRating: number,
  k: number = K_FACTOR
): { winnerDelta: number; loserDelta: number } {
  const expectedWin = expectedScore(winnerRating, loserRating);
  const expectedLoss = expectedScore(loserRating, winnerRating);

  const winnerDelta = Math.round(k * (1 - expectedWin));
  const loserDelta = Math.round(k * (0 - expectedLoss));

  return { winnerDelta, loserDelta };
}

/**
 * New ratings after a match
 */
export function applyEloChange(
  winnerRating: number,
  loserRating: number
): { newWinnerRating: number; newLoserRating: number; winnerDelta: number; loserDelta: number } {
  const { winnerDelta, loserDelta } = calculateEloChange(winnerRating, loserRating);
  return {
    newWinnerRating: Math.max(100, winnerRating + winnerDelta),
    newLoserRating: Math.max(100, loserRating + loserDelta),
    winnerDelta,
    loserDelta,
  };
}
