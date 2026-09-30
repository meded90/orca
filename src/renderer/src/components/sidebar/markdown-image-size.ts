export function markdownImageSize(width?: number | string, height?: number | string) {
  const percentWidth = typeof width === 'string' && /^\d+%$/.test(width) ? width : undefined
  const percentHeight = typeof height === 'string' && /^\d+%$/.test(height) ? height : undefined
  return {
    width: percentWidth ? undefined : width,
    height: percentHeight ? undefined : height,
    style: { width: percentWidth, height: percentHeight }
  }
}
