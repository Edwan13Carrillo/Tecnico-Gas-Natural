// ─────────────────────────────────────────────
//  vista.js  |  Visual / UI
//  Depende de: controlador.js (expone `calificacionSeleccionada`)
// ─────────────────────────────────────────────

$(document).ready(function () {

  // ── MODAL DE IMÁGENES ──
  const imagenModal = document.getElementById('imagenModal');
  document.querySelectorAll('.img-click').forEach(img => {
    img.addEventListener('click', () => {
      imagenModal.src = img.src;
      new bootstrap.Modal(document.getElementById('modalImagen')).show();
    });
  });

  // ── NAV TOGGLE ──
  $('#navToggle').on('click', function () {
    $(this).toggleClass('active');
    $('#navLinks').toggleClass('active');
  });

  $('.nav-links a').on('click', function () {
    $('#navToggle').removeClass('active');
    $('#navLinks').removeClass('active');
  });

  // ── CARRUSEL ──
  const $carrusel     = $('.carrusel');
  const $carruselDots = $('#carruselDots');

  const totalOriginalSlides = 6;
  const itemsPerView        = 3;
  let   currentSlide        = 3;
  let   autoplayInterval;

  function createDots() {
    for (let i = 0; i < totalOriginalSlides; i++) {
      const $dot = $('<div>').addClass('carrusel-dot');
      if (i === 0) $dot.addClass('active');
      $dot.on('click', () => goToSlide(i));
      $carruselDots.append($dot);
    }
  }

  function goToSlide(n) {
    currentSlide = n + 3;
    updateCarrusel();
    resetAutoplay();
  }

  function nextSlide() { currentSlide++; updateCarrusel(); }
  function prevSlide()  { currentSlide--; updateCarrusel(); }

  function updateCarrusel() {
    const slideWidth     = 100 / itemsPerView;
    const translateValue = currentSlide * slideWidth;

    $carrusel.css({
      transition: 'transform 0.6s ease-in-out',
      transform:  `translateX(-${translateValue}%)`
    });

    const originalIndex =
      ((currentSlide - 3) % totalOriginalSlides + totalOriginalSlides) % totalOriginalSlides;

    $('.carrusel-dot').each(function (index) {
      $(this).toggleClass('active', index === originalIndex);
    });

    setTimeout(() => {
      if (currentSlide >= 9) {
        $carrusel.css({ transition: 'none', transform: `translateX(-${3 * slideWidth}%)` });
        currentSlide = 3;
      } else if (currentSlide < 3) {
        $carrusel.css({ transition: 'none', transform: `translateX(-${9 * slideWidth}%)` });
        currentSlide = 9;
      }
    }, 600);
  }

  function startAutoplay()  { autoplayInterval = setInterval(nextSlide, 4000); }
  function resetAutoplay()  { clearInterval(autoplayInterval); startAutoplay(); }

  $('#carruselPrev').on('click', prevSlide);
  $('#carruselNext').on('click', nextSlide);

  createDots();
  updateCarrusel();
  startAutoplay();

  // ── ESTRELLAS INTERACTIVAS ──
  const $stars = $('#ratingInput .star');

  $stars.on('mouseover', function () {
    const hovered = $(this).data('value');
    $stars.each(function () {
      $(this).toggleClass('active', $(this).data('value') <= hovered);
    });
  });

  $('#ratingInput').on('mouseleave', function () {
    $stars.each(function () {
      $(this).toggleClass('active', $(this).data('value') <= calificacionSeleccionada);
    });
  });

  $stars.on('click', function () {
    calificacionSeleccionada = $(this).data('value'); // variable global de modelo.js
    $stars.each(function () {
      $(this).toggleClass('active', $(this).data('value') <= calificacionSeleccionada);
    });
  });

  // ── CONTADOR DE CARACTERES ──
  $('#comentario').on('input', function () {
    $('#charCount').text($(this).val().length + '/200 caracteres');
  });

});