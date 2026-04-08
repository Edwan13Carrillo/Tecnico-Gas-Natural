// ─────────────────────────────────────────────
//  controlador.js  |  Lógica / Back
//  Expone: `calificacionSeleccionada` (global, usada también en vista.js)
// ─────────────────────────────────────────────

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbypkJwD0KbWyr2wYMBIDsFBlxbZ_GAjNR3MCCM8r__09GkozDtHWIWzG3JVIUgKWF2x3w/exec";

// Variable compartida con script.js para el rating seleccionado
let calificacionSeleccionada = 0;

$(document).ready(function() {
    $('#formularioResena')[0].reset();
    
    $('.star').removeClass('active');
});

// ── CARGAR RESEÑAS ──
function cargarResenas() {
  fetch(SCRIPT_URL, { redirect: "follow" })
    .then(res => res.json())
    .then(data => {
      if (!data.ok) {
        $("#contenedor-resenas").html("<p>No se pudieron cargar las reseñas.</p>");
        return;
      }

      const { resenas, total, promedio } = data;

      const contenedor = $("#contenedor-resenas");
      contenedor.empty();

      const estrellasLlenas = Math.round(promedio);
      $(".resenas-rating .estrellas").html(
        "★".repeat(estrellasLlenas) + "☆".repeat(5 - estrellasLlenas)
      );
      $(".rating-text").html(
        `${promedio.toFixed(1)} <span>(${total} reseña${total !== 1 ? "s" : ""})</span>`
      );

      if (total === 0) {
        contenedor.html("<p>Aún no hay reseñas. ¡Sé el primero!</p>");
        return;
      }

      resenas.forEach(resena => {
        const estrellas = "★".repeat(resena.calificacion) + "☆".repeat(5 - resena.calificacion);
        contenedor.append(`
          <div class="resena-card mb-2">
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

const Toast = Swal.mixin({
  toast: true,
  position: "bottom-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

// ── VALIDACIÓN ──
function validarAntesDeEnviar() {
  // Honeypot para bots
  if ($("#website").val()) {
  return false;
  }

  // Evitar envíos múltiples
  const ahora = Date.now();
  const ultimoEnvio = localStorage.getItem("ultimoEnvio");

  if (ultimoEnvio && (ahora - ultimoEnvio < 10000)) {
    Toast.fire({ icon: "warning", title: "Espera unos segundos antes de enviar otra reseña." });
    return false;
  }
  localStorage.setItem("ultimoEnvio", ahora);

  // Validaciones de campos
  const nombre     = $("#nombre").val().trim();
  const comentario = $("#comentario").val().trim();

  if (!nombre || nombre.length > 50 || !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre)) {
    Toast.fire({ icon: "warning", title: "El nombre es obligatorio y no puede exceder los 50 caracteres." });
    return false;
  }
  if (calificacionSeleccionada === 0) {
    Toast.fire({ icon: "warning", title: "Por favor selecciona una calificación." });
    return false;
  }
  if (!comentario || comentario.length > 200) {
    Toast.fire({ icon: "warning", title: "El comentario es obligatorio y no puede exceder los 200 caracteres." });
    return false;
  }
  if (
    /(https?:\/\/|www\.)\S+/.test(comentario) || 
    /[<>${}|\\^~\[\]`]/.test(comentario) || 
    /^[=+\-@]/.test(comentario)  || 
    /(.)\1{4,}/.test(comentario)
  ){
    Toast.fire({ icon: "warning", title: "El comentario no puede contener enlaces o spam." });
    return false;
  }

  if (!$("#aceptaTerminos").is(":checked")) {
    Toast.fire({ icon: "warning", title: "Debes aceptar los Términos y Condiciones y la Política de Privacidad." });
    return false;
  }
  return true;
}

// ── ENVÍO DEL FORMULARIO ──
$(document).ready(function () {
  cargarResenas();

  $("#formularioResena").on("submit", function (e) {
    e.preventDefault();

    if (!validarAntesDeEnviar()) return;

    const datos = {
      nombre:        $("#nombre").val().trim(),
      calificacion:  calificacionSeleccionada,
      comentario:    $("#comentario").val().trim()
    };

    const btn = $(".btn-submit");
    btn.text("Enviando...").prop("disabled", true);

    fetch(SCRIPT_URL, {
      method:   "POST",
      redirect: "follow",
      headers:  { "Content-Type": "application/x-www-form-urlencoded" },
      body:     new URLSearchParams(datos).toString()
    })
      .then(res => res.json())
      .then(data => {
        if (data.ok) {
          const mensaje = data.actualizado
            ? "Tu reseña ya existía y fue actualizada. ✏️"
            : "¡Gracias por tu reseña! Será publicada pronto. 🎉";
        
          Toast.fire({ icon: "success", title: mensaje });
          $("#formularioResena")[0].reset();
          calificacionSeleccionada = 0;
          $("#ratingInput .star").removeClass("active");
          $("#charCount").text("0/200 caracteres");
          cargarResenas();
        } else {

          alert(data.error || "Hubo un error al enviar. Intenta de nuevo.");
        }
      })
      .catch(() => {
        Toast.fire({ icon: "error",   title: "Hubo un error al enviar. Intenta de nuevo." });
      })
      .finally(() => {
        btn.text("Publicar Reseña").prop("disabled", false);
      });
  });
});