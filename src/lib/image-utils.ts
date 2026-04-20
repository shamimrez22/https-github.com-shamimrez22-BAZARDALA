/**
 * Hard resizes an image to exact dimensions using 'cover' strategy (center crop).
 * @param base64Str - The source image as a base64 string.
 * @param targetWidth - The target width.
 * @param targetHeight - The target height.
 * @param quality - Compression quality (0 to 1).
 * @returns Promise<string> - The resized and cropped image as a base64 string.
 */
export const hardResizeImage = (
  base64Str: string,
  targetWidth: number,
  targetHeight: number,
  quality = 0.8
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      const imgWidth = img.width;
      const imgHeight = img.height;
      const targetAspect = targetWidth / targetHeight;
      const imgAspect = imgWidth / imgHeight;

      let drawWidth, drawHeight, offsetX, offsetY;

      if (imgAspect > targetAspect) {
        // Image is wider than target aspect
        drawHeight = imgHeight;
        drawWidth = imgHeight * targetAspect;
        offsetX = (imgWidth - drawWidth) / 2;
        offsetY = 0;
      } else {
        // Image is taller than target aspect
        drawWidth = imgWidth;
        drawHeight = imgWidth / targetAspect;
        offsetX = 0;
        offsetY = (imgHeight - drawHeight) / 2;
      }

      ctx.drawImage(
        img,
        offsetX, offsetY, drawWidth, drawHeight, // Source
        0, 0, targetWidth, targetHeight         // Destination
      );
      
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = (err) => reject(err);
  });
};

/**
 * Convenience wrapper for slider banners (Exact 1920x800).
 */
export const optimizeSliderImage = (base64Str: string) => hardResizeImage(base64Str, 1920, 800, 0.75);

/**
 * Convenience wrapper for product images (Exact 1000x1000 Square).
 */
export const optimizeProductImage = (base64Str: string) => hardResizeImage(base64Str, 1000, 1000, 0.85);

/**
 * Convenience wrapper for profile photos (Exact 300x300 Square).
 */
export const optimizeProfileImage = (base64Str: string) => hardResizeImage(base64Str, 300, 300, 0.8);
