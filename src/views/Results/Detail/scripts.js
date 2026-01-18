// src/views/Products/Detail/scripts.js

// Exportamos una función para que se pueda importar y ejecutar solo en el cliente
export function initProductDetail() {
  // Manejo de imágenes que fallan al cargar
  document.querySelectorAll('.product-detail img').forEach(img => {
    if (!img.hasAttribute('onerror')) {
      img.addEventListener('error', function() {
        this.onerror = null;
        this.src = '/images/products/placeholder.jpg';
      });
    }
  });

  // Galería de imágenes simple
  const thumbnails = document.querySelectorAll('.product-gallery .grid img');
  const mainImage = document.querySelector('.product-gallery > div > img');
  
  if (thumbnails && mainImage) {
    thumbnails.forEach(thumb => {
      thumb.addEventListener('click', (e) => {
        e.preventDefault();
        const newSrc = thumb.getAttribute('src');
        mainImage.setAttribute('src', newSrc);
      });
    });
  }
}
