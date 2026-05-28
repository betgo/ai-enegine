import type { GameDefinition } from "@ai-enegine/schema";
import {
  createGameJsonDownload,
  parseImportedGameJson
} from "./game-file";

export function exportGameJson(
  game: GameDefinition,
  setError: (message: string | null) => void
): void {
  const download = createGameJsonDownload(game);

  if (!download.ok) {
    setError(download.error);
    return;
  }

  const blob = new Blob([download.contents], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = download.fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
  setError(null);
}

export async function importGameJson(
  file: File,
  setDraftGame: (game: GameDefinition) => void,
  setError: (message: string | null) => void
): Promise<void> {
  const result = parseImportedGameJson(await file.text());

  if (!result.ok) {
    setError(result.error);
    return;
  }

  setDraftGame(structuredClone(result.game));
  setError(null);
}
