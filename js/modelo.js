const url = "https://script.google.com/macros/s/AKfycbypkJwD0KbWyr2wYMBIDsFBlxbZ_GAjNR3MCCM8r__09GkozDtHWIWzG3JVIUgKWF2x3w/exec"

$.get(url, function(data) {
    $("#descripcionH").text(data[0].descripcion);
}, "json");