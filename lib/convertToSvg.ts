import sharp from 'sharp';

interface ConversionOptions {
  maxSize: number;
  edgeLowerThreshold: number;
  edgeUpperThreshold: number;
  weakEdgeValue: number;
  strongEdgeValue: number;
  minPathLength: number;
  simplifyTolerance: number;
}

interface Point {
  x: number;
  y: number;
}

export async function convertToSvg(imageBuffer: Buffer, options: ConversionOptions): Promise<string> {
  const {
    maxSize,
    edgeLowerThreshold,
    edgeUpperThreshold,
    weakEdgeValue,
    strongEdgeValue,
    minPathLength,
    simplifyTolerance,
  } = options;

  // Resize image
  const { data, info } = await sharp(imageBuffer)
    .resize(maxSize, maxSize, { fit: 'inside', withoutEnlargement: true })
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;

  // Apply Sobel edge detection
  const sobelData = applySobel(data, width, height);

  // Generate edge intensity map
  const edges = getEdgeIntensityMap(sobelData, width, height, edgeLowerThreshold, edgeUpperThreshold, weakEdgeValue, strongEdgeValue);

  // Generate paths
  let paths = getPaths(edges, width, height);

  // Filter short paths
  paths = paths.filter(path => path.length > minPathLength);

  // Simplify and smooth paths
  paths = paths.map(path => simplifyPath(path, simplifyTolerance));
  paths = paths.map(smoothPath);

  // Generate SVG path data
  const d = paths
    .map(path => 'M' + path.map(p => `${p.x},${p.y}`).join('L'))
    .join('');

  // Create final SVG
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    <path d="${d}" fill="none" stroke="black" stroke-width="1" />
  </svg>`;

  return svg.trim();
}

function applySobel(data: Buffer, width: number, height: number): number[] {
  const sobelData = new Array(width * height).fill(0);
  const kernelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const kernelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let pixelX = 0;
      let pixelY = 0;

      for (let j = -1; j <= 1; j++) {
        for (let i = -1; i <= 1; i++) {
          const idx = ((y + j) * width + (x + i));
          const pixel = data[idx];
          pixelX += pixel * kernelX[(j + 1) * 3 + (i + 1)];
          pixelY += pixel * kernelY[(j + 1) * 3 + (i + 1)];
        }
      }

      const magnitude = Math.sqrt(pixelX * pixelX + pixelY * pixelY);
      sobelData[y * width + x] = magnitude;
    }
  }

  return sobelData;
}

function getEdgeIntensityMap(
  sobelData: number[],
  width: number,
  height: number,
  lowThreshold: number,
  highThreshold: number,
  weakEdgeValue: number,
  strongEdgeValue: number
): number[][] {
  const edges: number[][] = Array(height).fill(0).map(() => Array(width).fill(0));

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const magnitude = sobelData[y * width + x];

      if (magnitude > highThreshold) {
        edges[y][x] = strongEdgeValue;
      } else if (magnitude > lowThreshold) {
        edges[y][x] = weakEdgeValue;
      }
    }
  }

  return edges;
}

function getPaths(edges: number[][], width: number, height: number): Point[][] {
  const paths: Point[][] = [];
  const visited = new Set<string>();

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (edges[y][x] > 0 && !visited.has(`${x},${y}`)) {
        const path = tracePath(edges, width, height, x, y, visited);
        if (path.length > 1) {
          paths.push(path);
        }
      }
    }
  }

  return paths;
}

function tracePath(edges: number[][], width: number, height: number, startX: number, startY: number, visited: Set<string>): Point[] {
  const path: Point[] = [];
  let x = startX;
  let y = startY;

  const directions = [
    { dx: 1, dy: 0 },
    { dx: 1, dy: 1 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 1 },
    { dx: -1, dy: 0 },
    { dx: -1, dy: -1 },
    { dx: 0, dy: -1 },
    { dx: 1, dy: -1 },
  ];

  while (true) {
    path.push({ x, y });
    visited.add(`${x},${y}`);

    let found = false;
    for (const { dx, dy } of directions) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < width && ny >= 0 && ny < height && edges[ny][nx] > 0 && !visited.has(`${nx},${ny}`)) {
        x = nx;
        y = ny;
        found = true;
        break;
      }
    }

    if (!found) break;
  }

  return path;
}

function simplifyPath(path: Point[], tolerance: number): Point[] {
  if (path.length <= 2) return path;

  let maxDistance = 0;
  let index = 0;
  const end = path.length - 1;

  for (let i = 1; i < end; i++) {
    const distance = pointLineDistance(path[i], path[0], path[end]);
    if (distance > maxDistance) {
      maxDistance = distance;
      index = i;
    }
  }

  if (maxDistance > tolerance) {
    const results1 = simplifyPath(path.slice(0, index + 1), tolerance);
    const results2 = simplifyPath(path.slice(index), tolerance);
    return [...results1.slice(0, -1), ...results2];
  } else {
    return [path[0], path[end]];
  }
}

function pointLineDistance(point: Point, lineStart: Point, lineEnd: Point): number {
  const numerator = Math.abs(
    (lineEnd.y - lineStart.y) * point.x -
    (lineEnd.x - lineStart.x) * point.y +
    lineEnd.x * lineStart.y -
    lineEnd.y * lineStart.x
  );
  const denominator = Math.sqrt(
    Math.pow(lineEnd.y - lineStart.y, 2) +
    Math.pow(lineEnd.x - lineStart.x, 2)
  );
  return numerator / denominator;
}

function smoothPath(path: Point[]): Point[] {
  const smoothed: Point[] = [];
  for (let i = 0; i < path.length; i++) {
    const prev = path[i - 1] || path[i];
    const current = path[i];
    const next = path[i + 1] || path[i];
    smoothed.push({
      x: (prev.x + current.x + next.x) / 3,
      y: (prev.y + current.y + next.y) / 3
    });
  }
  return smoothed;
}