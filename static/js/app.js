// --- VARIABLES GLOBALES ---
let myChart = null; // Instancia global para controlar el gráfico de barras
let editModal = null; // Instancia de Bootstrap para la ventana de edición
let viewModal = null; // Instancia de Bootstrap para la ventana de detalle

// --- INICIALIZACIÓN AL CARGAR LA PÁGINA ---
document.addEventListener("DOMContentLoaded", () => {
    // 1. Inicializar las instancias de los Modales de Bootstrap para poder abrirlos/cerrarlos vía JS
    editModal = new bootstrap.Modal(document.getElementById('editModal'));
    viewModal = new bootstrap.Modal(document.getElementById('viewModal'));

    // 2. Cargar los datos iniciales e inicializar la vista (Gráfico, Tabla y Métricas)
    loadAllData();
    
    // 3. CAPTURAR EVENTOS DE FORMULARIOS Y BÚSQUEDA
    // Crear producto (Formulario principal)
    document.getElementById("productForm").addEventListener("submit", createProduct);
    // Actualizar producto (Formulario Modal)
    document.getElementById("editProductForm").addEventListener("submit", updateProduct);
    // Filtrar tabla en tiempo real al escribir en el buscador
    document.getElementById("tableSearch").addEventListener("input", filterTableInRealTime);
});

// --- FUNCIÓN PRINCIPAL DE CARGA Y ACTUALIZACIÓN ---
async function loadAllData() {
    console.log("🔄 Recargando Ecosistema Visual (Pandas + CRUD)...");
    await loadStats(); // Carga métricas numéricas de Pandas
    await loadTableAndChart(); // Carga tabla interactiva y gráfico Chart.js
}

// 📊 1. Consumir el servicio analítico de Pandas
async function loadStats() {
    try {
        const res = await fetch("/api/productos/estadisticas");
        const stats = await res.json();
        
        // Formateador de moneda colombiana
        const formatter = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

        // Inyectar datos en las tarjetas del Dashboard
        document.getElementById("stat-unicos").innerText = stats.total_productos_unicos;
        document.getElementById("stat-valor").innerText = formatter.format(stats.valor_total_inventario);
        document.getElementById("stat-promedio").innerText = formatter.format(stats.precio_promedio_productos);
        
        // Manejar el caso controlado si no hay productos
        if (stats.producto_con_mayor_stock && stats.producto_con_mayor_stock.nombre !== "N/A") {
            document.getElementById("stat-stock").innerText = `${stats.producto_con_mayor_stock.nombre} (${stats.producto_con_mayor_stock.unidades} u.)`;
        } else {
            document.getElementById("stat-stock").innerText = "N/A";
        }
    } catch (err) {
        console.error("Error al cargar estadísticas de Pandas:", err);
    }
}

// 📋 2. Consumir el listado CRUD completo y armar el gráfico de barras
async function loadTableAndChart() {
    try {
        const res = await fetch("/api/productos");
        const products = await res.json();
        
        const tableBody = document.getElementById("productsTableBody");
        tableBody.innerHTML = ""; // Limpiar tabla anterior
        
        const formatter = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

        // --- RENDERIZAR TABLA INTERACTIVA ---
        products.forEach(p => {
            const row = document.createElement("tr");
            row.classList.add("product-row"); // Clase para el filtro en tiempo real
            row.innerHTML = `
                <td><strong>#${p.id}</strong></td>
                <td>${p.nombre}</td>
                <td>${formatter.format(p.precio)}</td>
                <td><span class="badge ${p.cantidad < 10 ? 'bg-danger':'bg-secondary'}">${p.cantidad} unds</span></td>
                <td class="text-center">
                    <div class="d-flex gap-1 justify-content-center">
                        <button class="btn btn-sm btn-outline-primary" onclick="openEditModal(${p.id})">✏️</button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct(${p.id})">🗑️</button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // --- RENDERIZAR O ACTUALIZAR GRÁFICO (CHART.JS) ---
        // Ordenamos los productos de mayor a menor precio y tomamos el top 5
        const sortedProducts = [...products].sort((a, b) => b.precio - a.precio).slice(0, 5);
        
        const chartLabels = sortedProducts.map(p => p.nombre);
        const chartPrices = sortedProducts.map(p => p.precio);

        renderChart(chartLabels, chartPrices);

    } catch (err) {
        console.error("Error al procesar la lista de productos:", err);
    }
}

// 📉 3. Renderizar o actualizar el componente de Chart.js
function renderChart(labels, data) {
    const ctx = document.getElementById('analyticsChart').getContext('2d');
    
    if (myChart) {
        myChart.destroy(); // Destruimos el anterior para evitar superposiciones
    }

    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Precio Comercial ($ COP)',
                data: data,
                backgroundColor: 'rgba(33, 37, 41, 0.75)',
                borderColor: 'rgba(33, 37, 41, 1)',
                borderWidth: 1,
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// --- CAPA 1: CREATE (POST) ---
async function createProduct(e) {
    e.preventDefault();
    
    const productData = {
        id: parseInt(document.getElementById("form-id").value),
        nombre: document.getElementById("form-nombre").value,
        descripción: document.getElementById("form-descripcion").value,
        precio: parseFloat(document.getElementById("form-precio").value),
        cantidad: parseInt(document.getElementById("form-cantidad").value)
    };

    try {
        const res = await fetch("/api/productos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(productData)
        });

        if (res.status === 201) {
            alert("✅ Producto agregado con éxito al sistema y analizado por Pandas");
            document.getElementById("productForm").reset();
            loadAllData(); // Recarga todo en caliente
        } else {
            const errData = await res.json();
            alert(`❌ Error al crear: ${errData.error}`);
        }
    } catch (err) {
        alert("❌ Error crítico de red al intentar conectar con el servidor de Flask");
    }
}

// --- CAPA 2: UPDATE (PUT + PRECARGA EN MODAL) ---

// 1. Función que se dispara al hundir el Lápiz (✏️): Carga datos y abre modal
async function openEditModal(id) {
    try {
        console.log(`✏️ Solicitando datos del producto #${id} para edición...`);
        const res = await fetch(`/api/productos/${id}`);
        
        if (!res.ok) throw new Error("Producto no encontrado");
        const p = await res.json();

        // Rellenar el formulario del Modal con los datos actuales
        document.getElementById("edit-form-id").value = p.id;
        document.getElementById("edit-form-nombre").value = p.nombre;
        document.getElementById("edit-form-descripcion").value = p.descripción;
        document.getElementById("edit-form-precio").value = p.precio;
        document.getElementById("edit-form-cantidad").value = p.cantidad;

        // Abrir la ventana modal de edición
        editModal.show();
    } catch (err) {
        alert(`❌ Error al precargar datos para editar: ${err.message}`);
    }
}

// 2. Función que se dispara al hundir "Actualizar Cambios" dentro del Modal
async function updateProduct(e) {
    e.preventDefault();
    
    const id = document.getElementById("edit-form-id").value;
    const updateData = {
        nombre: document.getElementById("edit-form-nombre").value,
        descripción: document.getElementById("edit-form-descripcion").value,
        precio: parseFloat(document.getElementById("edit-form-precio").value),
        cantidad: parseInt(document.getElementById("edit-form-cantidad").value)
    };

    try {
        console.log(`🔄 Enviando actualización PUT para producto #${id}...`);
        const res = await fetch(`/api/productos/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updateData)
        });

        if (res.ok) {
            alert("✅ Datos del producto actualizados exitosamente");
            editModal.hide(); // Cerrar modal
            loadAllData(); // Recarga métricas, tabla y gráfico en caliente
        } else {
            alert("❌ Error al intentar actualizar el producto en base de datos");
        }
    } catch (err) {
        console.error("Error crítico en UPDATE:", err);
    }
}

// --- CAPA 3: READ BY ID (BUSQUEDA Y MODAL DETALLE) ---

// Función disparada por el botón "🎯 Buscar ID"
function searchByIdPrompt() {
    const idStr = prompt("🔍 Por favor, ingresa el ID exacto del producto que deseas visualizar:");
    if (!idStr) return; // Cancelado por usuario

    const id = parseInt(idStr);
    if (isNaN(id)) {
        alert("⚠️ Por favor, ingresa un número de ID válido.");
        return;
    }

    openViewModal(id);
}

// Carga datos asíncronos y abre el modal de ficha técnica
async function openViewModal(id) {
    try {
        console.log(`🔍 Buscando ficha técnica del producto #${id}...`);
        const res = await fetch(`/api/productos/${id}`);
        
        if (!res.ok) throw new Error("Producto no encontrado en sistema");
        const p = await res.json();
        
        const formatter = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

        // Inyectar datos en la ficha técnica del Modal
        document.getElementById("view-id").innerText = p.id;
        document.getElementById("view-nombre").innerText = p.nombre;
        document.getElementById("view-descripcion").innerText = p.descripción;
        document.getElementById("view-precio").innerText = formatter.format(p.precio);
        document.getElementById("view-cantidad").innerText = `${p.cantidad} unidades`;

        // Abrir la ventana modal de vista
        viewModal.show();
    } catch (err) {
        alert(`❌ ${err.message}`);
    }
}

// --- CAPA 4: DELETE (PAPELERA) ---
async function deleteProduct(id) {
    // Confirmación de seguridad 
    if (!confirm(`⚠️ ¿Estás seguro de que deseas eliminar permanentemente el producto #${id}?`)) return;

    try {
        console.log(`🗑️ Enviando petición de eliminación para producto #${id}...`);
        const res = await fetch(`/api/productos/${id}`, { method: "DELETE" });
        if (res.ok) {
            loadAllData(); // Recarga todo al instante (métricas y gráfico se actualizan)
        } else {
            alert("❌ No se pudo eliminar el producto o no se encontró en base de datos");
        }
    } catch (err) {
        console.error("Error al eliminar:", err);
    }
}

// --- CAPA 5: UTILIDADES Y FILTRO EN TIEMPO REAL ---

// Solución al scroll: Filtra la tabla al instante al escribir en el buscador
function filterTableInRealTime() {
    const searchString = document.getElementById("tableSearch").value.toLowerCase();
    const rows = document.querySelectorAll("#productsTableBody tr.product-row");

    rows.forEach(row => {
        // Obtenemos el texto del ID (primera columna) y el Nombre (segunda columna)
        const idText = row.cells[0].innerText.toLowerCase();
        const nameText = row.cells[1].innerText.toLowerCase();

        // Si lo que escribiste coincide con el ID o el Nombre, mostramos la fila, sino la ocultamos
        if (idText.includes(searchString) || nameText.includes(searchString)) {
            row.style.display = ""; // Mostrar
        } else {
            row.style.display = "none"; // Ocultar
        }
    });
}