const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbypkJwD0KbWyr2wYMBIDsFBlxbZ_GAjNR3MCCM8r__09GkozDtHWIWzG3JVIUgKWF2x3w/exec";

function cargarResenas() {
  fetch(SCRIPT_URL, { redirect: "follow" })
    .then(res => res.json())
    .then(data => {
      const contenedor = $("#contenedor-resenas");
      contenedor.empty();

      if (data.length === 0) {
        contenedor.html("<p>Aún no hay reseñas. ¡Sé el primero!</p>");
        return;
      }

      data.forEach(resena => {
        const estrellas = "★".repeat(resena.calificacion) + "☆".repeat(5 - resena.calificacion);
        contenedor.append(`
          <div class="resena-card">
            <div class="resena-header">
              <strong>${resena.nombre}</strong>
              <span class="estrellas">${estrellas}</span>
            </div>
            <p class="resena-comentario">${resena.comentario}</p>
            <small class="resena-fecha">${new Date(resena.fecha).toLocaleDateString("es-CO")}</small>
          </div>
        `);
      });
    })
    .catch(err => {
      console.error("Error:", err);
      $("#contenedor-resenas").html("<p>No se pudieron cargar las reseñas.</p>");
    });
}

$(document).ready(function() {
  cargarResenas();
});

let calificacionSeleccionada = 0;

// --- Estrellas interactivas ---
$("#ratingInput .star").on("mouseover", function() {
  const val = $(this).data("value");
  $("#ratingInput .star").each(function() {
    $(this).toggleClass("activa", $(this).data("value") <= val);
  });
});

$("#ratingInput").on("mouseleave", function() {
  $("#ratingInput .star").each(function() {
    $(this).toggleClass("activa", $(this).data("value") <= calificacionSeleccionada);
  });
});

$("#ratingInput .star").on("click", function() {
  calificacionSeleccionada = $(this).data("value");
  $("#ratingInput .star").each(function() {
    $(this).toggleClass("activa", $(this).data("value") <= calificacionSeleccionada);
  });
});

// --- Contador de caracteres ---
$("#comentario").on("input", function() {
  $("#charCount").text($(this).val().length + "/200 caracteres");
});

// --- Envío del formulario ---
$("#formularioResena").on("submit", function(e) {
  e.preventDefault();

  if (calificacionSeleccionada === 0) {
    alert("Por favor selecciona una calificación.");
    return;
  }

  const datos = {
    nombre: $("#nombre").val().trim(),
    calificacion: calificacionSeleccionada,
    comentario: $("#comentario").val().trim()
  };

  const btn = $(".btn-submit");
  btn.text("Enviando...").prop("disabled", true);

  fetch(SCRIPT_URL, {
    method: "POST",
    redirect: "follow",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(datos).toString()
  })
  .then(res => res.json())
  .then(data => {
    if (data.ok) {
      alert("¡Gracias por tu reseña! Será publicada pronto.");
      $("#formularioResena")[0].reset();
      calificacionSeleccionada = 0;
      $("#ratingInput .star").removeClass("activa");
      $("#charCount").text("0/200 caracteres");
    }
  })
  .catch(() => {
    alert("Hubo un error al enviar. Intenta de nuevo.");
  })
  .finally(() => {
    btn.text("Publicar Reseña").prop("disabled", false);
  });
});
