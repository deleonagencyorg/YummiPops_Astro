// Fix para las imágenes que no cargan
document.addEventListener('DOMContentLoaded', () => {
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    img.addEventListener('error', function() {
      this.src = '/images/products/placeholder.jpg';
    });
  });
  
  // Get category from URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const initialCategory = urlParams.get('category') || 'all';
  
  // Filtro de categorías
  const filterButtons = document.querySelectorAll('.tab-btn');
  const productCards = document.querySelectorAll('.product-card');
  
  // Set initial active button based on URL parameter
  filterButtons.forEach(button => {
    const category = button.getAttribute('data-category');
    if (category === initialCategory) {
      button.classList.remove('bg-[#FFF9E6]', 'text-gray-700');
      button.classList.add('bg-[#F9A825]', 'text-white', 'shadow-md');
    } else {
      button.classList.remove('bg-[#F9A825]', 'text-white', 'shadow-md');
      button.classList.add('bg-[#FFF9E6]', 'text-gray-700');
    }
  });
  
  // Apply initial filter
  productCards.forEach(card => {
    if (initialCategory === 'all' || card.getAttribute('data-category') === initialCategory) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
  
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Actualizar estado activo de los botones
      filterButtons.forEach(btn => {
        btn.classList.remove('bg-[#F9A825]', 'text-white', 'shadow-md');
        btn.classList.add('bg-[#FFF9E6]', 'text-gray-700');
      });
      button.classList.remove('bg-[#FFF9E6]', 'text-gray-700');
      button.classList.add('bg-[#F9A825]', 'text-white', 'shadow-md');
      
      const category = button.getAttribute('data-category');
      
      // Update URL without page reload
      const newUrl = new URL(window.location);
      if (category === 'all') {
        newUrl.searchParams.delete('category');
      } else {
        newUrl.searchParams.set('category', category);
      }
      window.history.replaceState({}, '', newUrl);
      
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
