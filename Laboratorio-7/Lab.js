// Constructor para Libro
function Libro(id, titulo, autor, ano) {
    this.id = id;
    this.titulo = titulo;
    this.autor = autor;
    this.ano = ano;
    this.disponible = true;
}

// Métodos para Libro
Libro.prototype.prestar = function() {
    if (this.disponible) {
        this.disponible = false;
        return true;
    }
    return false;
};

Libro.prototype.devolver = function() {
    this.disponible = true;
};

// Constructor para Usuario
function Usuario(id, nombre, email) {
    this.id = id;
    this.nombre = nombre;
    this.email = email;
    this.librosPrestados = [];
}

// Métodos para Usuario
Usuario.prototype.prestarLibro = function(libroId) {
    this.librosPrestados.push(libroId);
};

Usuario.prototype.devolverLibro = function(libroId) {
    const index = this.librosPrestados.indexOf(libroId);
    if (index !== -1) {
        this.librosPrestados.splice(index, 1);
        return true;
    }
    return false;
};

Usuario.prototype.tienePrestamos = function() {
    return this.librosPrestados.length > 0;
};

// Constructor para Prestamo
function Prestamo(id, libroId, usuarioId, fechaPrestamo) {
    this.id = id;
    this.libroId = libroId;
    this.usuarioId = usuarioId;
    this.fechaPrestamo = fechaPrestamo;
    this.fechaDevolucion = null;
    this.estado = "Prestado";
}

// Métodos para Prestamo
Prestamo.prototype.devolver = function() {
    this.fechaDevolucion = new Date();
    this.estado = "Devuelto";
};

// Arrays para almacenar los datos
const libros = [];
const usuarios = [];
const prestamos = [];

// Variables para los IDs
let nextLibroId = 1;
let nextUsuarioId = 1;
let nextPrestamoId = 1;

// Función para agregar un nuevo libro
function agregarNuevoLibro() {
    const titulo = document.getElementById('nuevoLibroTitulo').value.trim();
    const autor = document.getElementById('nuevoLibroAutor').value.trim();
    const ano = document.getElementById('nuevoLibroAno').value.trim();
    const errorElement = document.getElementById('libroError');
    
    // Validaciones
    if (!titulo || !autor || !ano) {
        errorElement.textContent = "Todos los campos son obligatorios";
        return;
    }
    
    if (isNaN(ano) || ano < 0 || ano > new Date().getFullYear()) {
        errorElement.textContent = "El año debe ser válido";
        return;
    }
    
    // Crear nuevo libro
    const nuevoLibro = new Libro(nextLibroId++, titulo, autor, parseInt(ano));
    libros.push(nuevoLibro);
    
    // Limpiar campos y errores
    document.getElementById('nuevoLibroTitulo').value = '';
    document.getElementById('nuevoLibroAutor').value = '';
    document.getElementById('nuevoLibroAno').value = '';
    errorElement.textContent = '';
    
    // Actualizar vistas
    renderLibros();
    actualizarSelectLibros();
}

// Función para eliminar un libro
function eliminarLibro(id) {
    const index = libros.findIndex(libro => libro.id === id);
    
    // Verificar si el libro está prestado
    const prestado = prestamos.some(p => p.libroId === id && p.estado === "Prestado");
    
    if (prestado) {
        alert("No se puede eliminar un libro que está prestado actualmente");
        return;
    }
    
    if (index !== -1) {
        libros.splice(index, 1);
        renderLibros();
        actualizarSelectLibros();
    }
}

// Función para agregar un nuevo usuario
function agregarNuevoUsuario() {
    const nombre = document.getElementById('nuevoUsuarioNombre').value.trim();
    const email = document.getElementById('nuevoUsuarioEmail').value.trim();
    const errorElement = document.getElementById('usuarioError');
    
    // Validaciones
    if (!nombre || !email) {
        errorElement.textContent = "Todos los campos son obligatorios";
        return;
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        errorElement.textContent = "El formato del email no es válido";
        return;
    }
    
    // Verificar duplicados
    if (usuarios.some(u => u.email === email)) {
        errorElement.textContent = "Este email ya está registrado";
        return;
    }
    
    // Crear nuevo usuario
    const nuevoUsuario = new Usuario(nextUsuarioId++, nombre, email);
    usuarios.push(nuevoUsuario);
    
    // Limpiar campos y errores
    document.getElementById('nuevoUsuarioNombre').value = '';
    document.getElementById('nuevoUsuarioEmail').value = '';
    errorElement.textContent = '';
    
    // Actualizar vistas
    renderUsuarios();
    actualizarSelectUsuarios();
}

// Función para eliminar un usuario
function eliminarUsuario(id) {
    const index = usuarios.findIndex(usuario => usuario.id === id);
    
    if (index !== -1) {
        // Verificar si el usuario tiene préstamos
        if (usuarios[index].tienePrestamos()) {
            alert("No se puede eliminar un usuario con libros prestados");
            return;
        }
        
        usuarios.splice(index, 1);
        renderUsuarios();
        actualizarSelectUsuarios();
    }
}

// Función para realizar un préstamo
function realizarPrestamo() {
    const libroId = parseInt(document.getElementById('prestamoLibro').value);
    const usuarioId = parseInt(document.getElementById('prestamoUsuario').value);
    const errorElement = document.getElementById('prestamoError');
    
    // Validaciones
    if (isNaN(libroId) || isNaN(usuarioId)) {
        errorElement.textContent = "Debes seleccionar un libro y un usuario";
        return;
    }
    
    const libro = libros.find(libro => libro.id === libroId);
    const usuario = usuarios.find(usuario => usuario.id === usuarioId);
    
    if (!libro || !usuario) {
        errorElement.textContent = "Libro o usuario no encontrado";
        return;
    }
    
    if (!libro.disponible) {
        errorElement.textContent = "Este libro no está disponible actualmente";
        return;
    }
    
    // Registrar préstamo
    const nuevoPrestamo = new Prestamo(
        nextPrestamoId++,
        libroId,
        usuarioId,
        new Date()
    );
    
    prestamos.push(nuevoPrestamo);
    
    // Actualizar estado del libro
    libro.prestar();
    
    // Actualizar usuario
    usuario.prestarLibro(libroId);
    
    // Limpiar campos y errores
    document.getElementById('prestamoLibro').value = '';
    document.getElementById('prestamoUsuario').value = '';
    errorElement.textContent = '';
    
    // Actualizar vistas
    renderLibros();
    renderUsuarios();
    renderPrestamos();
    actualizarSelectLibros();
}

// Función para devolver un libro
function devolverLibro(prestamoId) {
    const prestamo = prestamos.find(p => p.id === prestamoId);
    
    if (prestamo && prestamo.estado === "Prestado") {
        prestamo.devolver();
        
        // Actualizar libro
        const libro = libros.find(l => l.id === prestamo.libroId);
        if (libro) {
            libro.devolver();
        }
        
        // Actualizar usuario
        const usuario = usuarios.find(u => u.id === prestamo.usuarioId);
        if (usuario) {
            usuario.devolverLibro(prestamo.libroId);
        }
        
        // Actualizar vistas
        renderLibros();
        renderUsuarios();
        renderPrestamos();
        actualizarSelectLibros();
    }
}

// Función para renderizar la tabla de libros
function renderLibros() {
    const tbody = document.getElementById('listaLibros');
    tbody.innerHTML = '';
    
    libros.forEach(libro => {
        const row = document.createElement('tr');
        
        const idCell = document.createElement('td');
        idCell.textContent = libro.id;
        row.appendChild(idCell);
        
        const tituloCell = document.createElement('td');
        tituloCell.textContent = libro.titulo;
        row.appendChild(tituloCell);
        
        const autorCell = document.createElement('td');
        autorCell.textContent = libro.autor;
        row.appendChild(autorCell);
        
        const anoCell = document.createElement('td');
        anoCell.textContent = libro.ano;
        row.appendChild(anoCell);
        
        const disponibleCell = document.createElement('td');
        disponibleCell.textContent = libro.disponible ? "Sí" : "No";
        row.appendChild(disponibleCell);
        
        const accionesCell = document.createElement('td');
        const deleteButton = document.createElement('button');
        deleteButton.textContent = "Eliminar";
        deleteButton.className = "delete";
        deleteButton.onclick = () => eliminarLibro(libro.id);
        accionesCell.appendChild(deleteButton);
        row.appendChild(accionesCell);
        
        tbody.appendChild(row);
    });
}

// Función para renderizar la tabla de usuarios
function renderUsuarios() {
    const tbody = document.getElementById('listaUsuarios');
    tbody.innerHTML = '';
    
    usuarios.forEach(usuario => {
        const row = document.createElement('tr');
        
        const idCell = document.createElement('td');
        idCell.textContent = usuario.id;
        row.appendChild(idCell);
        
        const nombreCell = document.createElement('td');
        nombreCell.textContent = usuario.nombre;
        row.appendChild(nombreCell);
        
        const emailCell = document.createElement('td');
        emailCell.textContent = usuario.email;
        row.appendChild(emailCell);
        
        const prestadosCell = document.createElement('td');
        prestadosCell.textContent = usuario.librosPrestados.length;
        row.appendChild(prestadosCell);
        
        const accionesCell = document.createElement('td');
        const deleteButton = document.createElement('button');
        deleteButton.textContent = "Eliminar";
        deleteButton.className = "delete";
        deleteButton.onclick = () => eliminarUsuario(usuario.id);
        accionesCell.appendChild(deleteButton);
        row.appendChild(accionesCell);
        
        tbody.appendChild(row);
    });
}

// Función para renderizar la tabla de préstamos
function renderPrestamos() {
    const tbody = document.getElementById('listaPrestamos');
    tbody.innerHTML = '';
    
    prestamos.forEach(prestamo => {
        const row = document.createElement('tr');
        
        const idCell = document.createElement('td');
        idCell.textContent = prestamo.id;
        row.appendChild(idCell);
        
        const libroCell = document.createElement('td');
        const libro = libros.find(l => l.id === prestamo.libroId);
        libroCell.textContent = libro ? libro.titulo : "Desconocido";
        row.appendChild(libroCell);
        
        const usuarioCell = document.createElement('td');
        const usuario = usuarios.find(u => u.id === prestamo.usuarioId);
        usuarioCell.textContent = usuario ? usuario.nombre : "Desconocido";
        row.appendChild(usuarioCell);
        
        const fechaPrestamoCell = document.createElement('td');
        fechaPrestamoCell.textContent = formatDate(prestamo.fechaPrestamo);
        row.appendChild(fechaPrestamoCell);
        
        const fechaDevolucionCell = document.createElement('td');
        fechaDevolucionCell.textContent = prestamo.fechaDevolucion ? formatDate(prestamo.fechaDevolucion) : "Pendiente";
        row.appendChild(fechaDevolucionCell);
        
        const estadoCell = document.createElement('td');
        estadoCell.textContent = prestamo.estado;
        row.appendChild(estadoCell);
        
        const accionesCell = document.createElement('td');
        if (prestamo.estado === "Prestado") {
            const returnButton = document.createElement('button');
            returnButton.textContent = "Devolver";
            returnButton.className = "return";
            returnButton.onclick = () => devolverLibro(prestamo.id);
            accionesCell.appendChild(returnButton);
        }
        row.appendChild(accionesCell);
        
        tbody.appendChild(row);
    });
}

// Función para actualizar el select de libros disponibles
function actualizarSelectLibros() {
    const select = document.getElementById('prestamoLibro');
    select.innerHTML = '<option value="">Seleccionar Libro</option>';
    
    libros.filter(libro => libro.disponible).forEach(libro => {
        const option = document.createElement('option');
        option.value = libro.id;
        option.textContent = `${libro.titulo} (${libro.autor})`;
        select.appendChild(option);
    });
}

// Función para actualizar el select de usuarios
function actualizarSelectUsuarios() {
    const select = document.getElementById('prestamoUsuario');
    select.innerHTML = '<option value="">Seleccionar Usuario</option>';
    
    usuarios.forEach(usuario => {
        const option = document.createElement('option');
        option.value = usuario.id;
        option.textContent = `${usuario.nombre} (${usuario.email})`;
        select.appendChild(option);
    });
}

// Función auxiliar para formatear fechas
function formatDate(date) {
    if (!date) return "";
    return new Date(date).toLocaleDateString('es-ES');
}

// Cargar algunos datos de ejemplo
function cargarDatosEjemplo() {
    // Libros de ejemplo
    libros.push(new Libro(nextLibroId++, "Cien años de soledad", "Gabriel García Márquez", 1967));
    libros.push(new Libro(nextLibroId++, "El código Da Vinci", "Dan Brown", 2003));
    libros.push(new Libro(nextLibroId++, "Harry Potter y la piedra filosofal", "J.K. Rowling", 1997));
    
    // Usuarios de ejemplo
    usuarios.push(new Usuario(nextUsuarioId++, "Juan Pérez", "juan@example.com"));
    usuarios.push(new Usuario(nextUsuarioId++, "María González", "maria@example.com"));
    
    // Actualizar vistas
    renderLibros();
    renderUsuarios();
    renderPrestamos();
    actualizarSelectLibros();
    actualizarSelectUsuarios();
}

// Inicializar la aplicación
window.onload = function() {
    cargarDatosEjemplo();
};