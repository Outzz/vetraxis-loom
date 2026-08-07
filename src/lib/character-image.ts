const MAX_PORTRAIT_BYTES = 900_000;

export async function prepareCharacterPortrait(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Escolha um arquivo de imagem.");
  }
  if (file.size > 10_000_000) {
    throw new Error("A imagem deve ter no máximo 10 MB.");
  }

  const source = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Não foi possível ler a imagem."));
    reader.readAsDataURL(file);
  });

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = () => reject(new Error("Formato de imagem inválido."));
    element.src = source;
  });

  const scale = Math.min(1, 720 / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Não foi possível preparar a imagem.");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  let quality = 0.82;
  let result = canvas.toDataURL("image/webp", quality);
  while (result.length > MAX_PORTRAIT_BYTES && quality > 0.42) {
    quality -= 0.1;
    result = canvas.toDataURL("image/webp", quality);
  }
  if (result.length > MAX_PORTRAIT_BYTES) {
    throw new Error("A imagem continua grande demais. Escolha uma imagem menor.");
  }
  return result;
}