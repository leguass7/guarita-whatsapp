export function parseImageNameDto(imageName: string) {
  const [image, ext] = imageName.split('.');
  if (!image || !ext) return null;
  const [name, imageId] = image.split('_');
  return { imageId, name, image, ext };
}

export function setImageNameDto(imageName: string, imageId: string) {
  const [image, ext] = imageName.split('.');
  return `${image}_${imageId}.${ext}`;
}
