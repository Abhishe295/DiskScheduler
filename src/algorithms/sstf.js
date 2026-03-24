export function sstf(requests, head) {
  let seekTime = 0;
  let current = head;
  const sequence = [head];
  let remaining = [...requests];

  while (remaining.length > 0) {
    let closestIndex = 0;
    let minDist = Math.abs(remaining[0] - current);

    for (let i = 1; i < remaining.length; i++) {
      let dist = Math.abs(remaining[i] - current);
      if (dist < minDist) {
        minDist = dist;
        closestIndex = i;
      }
    }

    const next = remaining.splice(closestIndex, 1)[0];
    seekTime += Math.abs(next - current);
    current = next;
    sequence.push(next);
  }

  return { sequence, seekTime };
}