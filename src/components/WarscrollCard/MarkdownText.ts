export type InlineStyle = "regular" | "bold" | "italic" | "bold-italic";

export interface InlineToken {
  text: string;
  style: InlineStyle;
  isLineBreak?: boolean;
}

export interface InlineLine {
  tokens: InlineToken[];
  width: number;
}

export interface DrawInlineParams {
  ctx: CanvasRenderingContext2D;
  tokens: InlineToken[];
  x: number;
  y: number;
  maxWidth: number;
  lineHeight: number;
  fontSize: number;
  fontColor: string;
  draw: boolean;
  alignment?: "left" | "center";
  prefix?: InlineToken[];
  wrapIndent?: number;
}

export interface DrawInlineResult {
  heightOffset: number;
  lineCount: number;
}

const combineStyle = (base: InlineStyle, boldToggle: boolean): InlineStyle => {
  if (!boldToggle) return base;
  if (base === "italic" || base === "bold-italic") return "bold-italic";
  return "bold";
};

const splitIntoWordTokens = (text: string, style: InlineStyle): InlineToken[] => {
  const result: InlineToken[] = [];
  if (!text) return result;
  const parts = text.split(/(\s+)/);
  for (const part of parts) {
    if (part.length === 0) continue;
    if (part.includes("\n")) {
      const segments = part.split(/(\n)/);
      for (const seg of segments) {
        if (seg.length === 0) continue;
        if (seg === "\n") {
          result.push({ text: "", style, isLineBreak: true });
        } else {
          result.push({ text: seg, style });
        }
      }
    } else {
      result.push({ text: part, style });
    }
  }
  return result;
};

export const tokenizeMarkdown = (raw: string, base: InlineStyle): InlineToken[] => {
  if (!raw) return [];
  const tokens: InlineToken[] = [];
  const regex = /\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(raw)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(...splitIntoWordTokens(raw.slice(lastIndex, match.index), base));
    }
    tokens.push(...splitIntoWordTokens(match[1], combineStyle(base, true)));
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < raw.length) {
    tokens.push(...splitIntoWordTokens(raw.slice(lastIndex), base));
  }
  return tokens;
};

export const fontFor = (style: InlineStyle, fontSize: number): string => {
  switch (style) {
    case "bold":
      return `bold ${fontSize}px "Minion Pro"`;
    case "italic":
      return `italic ${fontSize}px "Minion Pro"`;
    case "bold-italic":
      return `bold italic ${fontSize}px "Minion Pro"`;
    default:
      return `${fontSize}px "Minion Pro"`;
  }
};

const measureToken = (ctx: CanvasRenderingContext2D, token: InlineToken, fontSize: number): number => {
  if (token.isLineBreak) return 0;
  ctx.font = fontFor(token.style, fontSize);
  return ctx.measureText(token.text).width;
};

const layoutLines = (
  ctx: CanvasRenderingContext2D,
  tokens: InlineToken[],
  maxWidth: number,
  fontSize: number,
  wrapIndent: number
): InlineLine[] => {
  const lines: InlineLine[] = [];
  let currentTokens: InlineToken[] = [];
  let currentWidth = 0;
  let isFirstLine = true;

  const currentLineAvailableWidth = () => (isFirstLine ? maxWidth : maxWidth - wrapIndent);

  const pushLine = () => {
    lines.push({ tokens: currentTokens, width: currentWidth });
    currentTokens = [];
    currentWidth = 0;
    isFirstLine = false;
  };

  for (const token of tokens) {
    if (token.isLineBreak) {
      pushLine();
      continue;
    }
    const w = measureToken(ctx, token, fontSize);
    const isWhitespace = /^\s+$/.test(token.text);
    if (currentTokens.length === 0 && isWhitespace) {
      continue;
    }
    if (currentTokens.length > 0 && currentWidth + w > currentLineAvailableWidth()) {
      pushLine();
      if (isWhitespace) continue;
    }
    currentTokens.push(token);
    currentWidth += w;
  }
  if (currentTokens.length > 0 || lines.length === 0) {
    lines.push({ tokens: currentTokens, width: currentWidth });
  }
  return lines;
};

export const drawInlineTokens = (p: DrawInlineParams): DrawInlineResult => {
  const alignment = p.alignment ?? "left";
  const wrapIndent = p.wrapIndent ?? 0;
  const allTokens = p.prefix ? [...p.prefix, ...p.tokens] : p.tokens;
  const lines = layoutLines(p.ctx, allTokens, p.maxWidth, p.fontSize, wrapIndent);

  if (p.draw) {
    p.ctx.globalAlpha = 1;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineY = p.y + i * p.lineHeight;
      let startX: number;
      if (alignment === "center") {
        const centerX = p.x + p.maxWidth / 2;
        startX = centerX - line.width / 2;
      } else {
        startX = i === 0 ? p.x : p.x + wrapIndent;
      }
      let xOffset = startX;
      for (const token of line.tokens) {
        if (token.isLineBreak) continue;
        p.ctx.font = fontFor(token.style, p.fontSize);
        p.ctx.fillStyle = p.fontColor;
        p.ctx.textAlign = "left";
        p.ctx.fillText(token.text, xOffset, lineY);
        xOffset += p.ctx.measureText(token.text).width;
      }
    }
  }

  return {
    heightOffset: 7 + p.fontSize * lines.length,
    lineCount: lines.length,
  };
};
