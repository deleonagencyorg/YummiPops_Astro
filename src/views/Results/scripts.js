// Fix para las imágenes que no cargan
document.addEventListener('DOMContentLoaded', () => {
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    img.addEventListener('error', function() {
      this.src = '/images/products/placeholder.jpg';
    });
  });
  
  // Filtro de categorías
  const filterButtons = document.querySelectorAll('.category-filter');
  const productCards = document.querySelectorAll('.product-card');
  
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Actualizar estado activo de los botones
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      const category = button.getAttribute('data-category');
      
      // Filtrar productos
      productCards.forEach(card => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
});
