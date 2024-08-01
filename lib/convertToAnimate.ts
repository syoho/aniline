import { parseSync, stringify } from 'svgson';

interface AnimationOptions {
  type: 'delayed' | 'sync' | 'oneByOne' | 'scenario' | 'scenario-sync';
  duration: number;
  delay: number;
}

export function convertToAnimate(svgString: string, options: AnimationOptions): string {
  const { type, duration, delay } = options;
  const parsedSvg = parseSync(svgString);

  // Find all path elements
  const paths = findPaths(parsedSvg);

  // Add animation to paths
  addAnimationToPaths(paths, type, duration, delay);

  // Add CSS animation to SVG
  addCssAnimation(parsedSvg, type, duration, delay);

  // Convert back to SVG string
  return stringify(parsedSvg);
}

function findPaths(node: any): any[] {
  if (node.name === 'path') {
    return [node];
  }
  if (node.children) {
    return node.children.flatMap(findPaths);
  }
  return [];
}

function addAnimationToPaths(paths: any[], type: string, duration: number, delay: number) {
  const totalLength = paths.reduce((sum, path) => sum + getPathLength(path), 0);
  
  paths.forEach((path, index) => {
    const pathLength = getPathLength(path);
    path.attributes['stroke-dasharray'] = pathLength;
    path.attributes['stroke-dashoffset'] = pathLength;

    const pathDuration = type === 'oneByOne' ? duration : (pathLength / totalLength) * duration;
    const pathDelay = calculateDelay(index, paths.length, type, delay, duration);

    path.attributes['style'] = `animation: vivus ${pathDuration}s ${pathDelay}s linear forwards;`;
  });
}

function getPathLength(path: any): number {
  // In a real scenario, we should calculate the actual path length
  // For simplicity, we're using a placeholder value
  return 1000;
}

function calculateDelay(index: number, total: number, type: string, delay: number, duration: number): number {
  switch (type) {
    case 'delayed':
      return delay + (index * delay) / total;
    case 'sync':
      return delay;
    case 'oneByOne':
      return delay + (index * duration) / total;
    case 'scenario':
      return delay + index * 100;  // 100ms delay between each path
    case 'scenario-sync':
      return delay + index * (duration / total);
    default:
      return delay;
  }
}

function addCssAnimation(svg: any, type: string, duration: number, delay: number) {
  const style = `
    @keyframes vivus {
      0% {
        stroke-dashoffset: attr(stroke-dasharray);
      }
      100% {
        stroke-dashoffset: 0;
      }
    }
    path {
      stroke-dashoffset: attr(stroke-dasharray);
      animation: none;
    }
  `;

  const styleElement = {
    name: 'style',
    type: 'element',
    value: '',
    attributes: {},
    children: [{ type: 'text', value: style }]
  };

  svg.children.unshift(styleElement);
}