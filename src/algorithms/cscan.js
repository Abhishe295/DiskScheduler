export function cscan(requests, head, diskSize = 200, direction = "right") {
  let seekTime = 0;
  let current = head;
  const sequence = [head];

  const left = requests.filter(r => r < head).sort((a, b) => a - b);
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

    seekTime += diskSize - 1;
    current = 0;
    if (left.length === 0 || left[0] !== 0) {
      sequence.push(current);
    }

    for (let r of left) {
      seekTime += Math.abs(r - current);
      current = r;
      sequence.push(r);
    }
  } else {
    const leftDescending = [...left].reverse();
    for (let r of leftDescending) {
      seekTime += Math.abs(r - current);
      current = r;
      sequence.push(r);
    }

    if (current !== 0) {
      seekTime += current;
      current = 0;
      sequence.push(current);
    }

    seekTime += diskSize - 1;
    current = diskSize - 1;
    const rightDescending = [...right].reverse();
    if (rightDescending.length === 0 || rightDescending[0] !== diskSize - 1) {
      sequence.push(current);
    }

    for (let r of rightDescending) {
      seekTime += Math.abs(r - current);
      current = r;
      sequence.push(r);
    }
  }

  return { sequence, seekTime };
}
