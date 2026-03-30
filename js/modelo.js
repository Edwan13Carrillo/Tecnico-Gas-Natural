const url = "https://script.google.com/macros/s/AKfycbypkJwD0KbWyr2wYMBIDsFBlxbZ_GAjNR3MCCM8r__09GkozDtHWIWzG3JVIUgKWF2x3w/exec"

fetch(url)
    .then(res => res.json())
    .then(data => {
        $("#descripcionH").text(data[0].descripcion);
    })
    .catch(err => console.error("Error:", err));