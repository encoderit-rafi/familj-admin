import {API_BASE_URL} from "../consts.ts";

export const imageLinkGenerator = (
  image?: string,
  placeholder: string | null = 'placeholder.jpg',
) => {
  if (!image && placeholder === null) return null;
  if (!image && placeholder === '') return '';
  if (!image) return `${API_BASE_URL}/public/assets/placeholders/${placeholder}`;

  // Check if the image is already a complete URL
  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }

  return `${API_BASE_URL}${image}`;
}
