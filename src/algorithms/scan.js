export function scan(requests, head, diskSize = 200, direction = "right") {
  let seekTime = 0;
  let current = head;
  const sequence = [head];

  const left = requests.filter(r => r < head).sort((a, b) => b - a);
  const right = requests.filter(r => r >= head).sort((a, b) => a - b);

  if (direction === "right") {
    for (let r of right) {
      seekTime += Math.abs(r - current);
      current = r;
      sequence.push(r);
    }

    if (current !== diskSize - 1) {
      seekTime += Math.abs(diskSize - 1 - current);
      current = diskSize - 1;
      sequence.push(current);
    }

    for (let r of left) {
      seekTime += Math.abs(r - current);
      current = r;
      sequence.push(r);
    }
  } else {
    for (let r of left) {
      seekTime += Math.abs(r - current);
      current = r;
      sequence.push(r);
    }

    if (current !== 0) {
      seekTime += Math.abs(current - 0);
      current = 0;
      sequence.push(current);
    }

    for (let r of right) {
      seekTime += Math.abs(r - current);
      current = r;
      sequence.push(r);
    }
  }

  return { sequence, seekTime };
}