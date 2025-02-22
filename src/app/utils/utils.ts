import {Game, Player, TokenType} from '../types';

export type RGB = { red: number; green: number; blue: number };

export function hexToRgb(hex?: string): RGB {
  if (!hex) return { red: 0, blue: 0, green: 0 };
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
      red: parseInt(result[1], 16),
      green: parseInt(result[2], 16),
      blue: parseInt(result[3], 16),
    }
    : { red: 0, blue: 0, green: 0 };
}

const getLightness = (r: number,g: number,b: number) => 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
const isDark = (r: number, g: number, b: number) => getLightness(r, g, b) < 90;
export const isLight = (hex: string) => {
  const {red,green,blue} = hexToRgb(hex)
  return getLightness(red, green, blue) > 150
}

export function getNbTokensByPlayersIds(game: Game, player: Player, type: TokenType): Map<number, number> {
  const tokensByPlayersIds = game.players.reduce((acc, player) => {
    acc.set(player.id, 0)
    return acc
  }, new Map<number, number>())
  player.playableTokens.filter(it => it.type === type).forEach(token => {
    const playerId = type === 'INFLUENCE' ? token.owner?.id : token.player.id;
    if (!playerId) return
    let nbTokens = tokensByPlayersIds.get(playerId) ?? 0
    nbTokens++
    tokensByPlayersIds.set(playerId, nbTokens)
  })
  return tokensByPlayersIds
}
