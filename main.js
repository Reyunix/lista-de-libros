// Ver si ya hay un nombre guardado en localStorage
const savedName = localStorage.getItem('username');

if (savedName) {
  // Si hay nombre, mostrarlo en el saludo y ocultar el formulario
  document.getElementById('greeting').textContent = `¡Hola, ${savedName}!`;
  document.getElementById('usernameForm').style.display = 'none';
}

// Cuando el usuario envía el formulario
document.getElementById('usernameForm').addEventListener('submit', function (e) {
  e.preventDefault(); // Prevenir que recargue la página

  const inputName = document.getElementById('username').value;

  // Guardar en localStorage
  localStorage.setItem('username', inputName);

  // Mostrar saludo
  document.getElementById('greeting').textContent = `¡Hola, ${inputName}!`;

  // Ocultar formulario
  document.getElementById('usernameForm').style.display = 'none';
});


document.write()