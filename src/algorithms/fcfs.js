export function fcfs(requests, head) {
  let seekTime = 0;
  let current = head;
  const sequence = [head];

  for (let req of requests) {
    seekTime += Math.abs(req - current);
    current = req;
    sequence.push(req);
  }

  return { sequence, seekTime };
}