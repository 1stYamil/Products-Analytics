let myChart = null; // Instancia global del gráfico

document.addEventListener("DOMContentLoaded", () => {
    // Cargar los datos e inicializar la vista al abrir la página
    loadAllData();
    
    // Capturar el envío del formulario para crear productos
    document.getElementById("productForm").addEventListener("submit", createProduct);
});

// Función principal para refrescar la interfaz completa
async function loadAllData() {
    await loadStats();
    await loadTableAndChart();
}

// 📊 Consumir el servicio analítico de Pandas
async function loadStats() {
    try {
        const res = await fetch("/api/productos/estadisticas");
        const stats = await res.json();
        
        // Formateador de moneda colombiana
        const formatter = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

        document.getElementById("stat-unicos").innerText = stats.total_productos_unicos;
        document.getElementById("stat-valor").innerText = formatter.format(stats.valor_total_inventario);
        document.getElementById("stat-promedio").innerText = formatter.format(stats.precio_promedio_productos);
        
        if (stats.producto_con_mayor_stock && stats.producto_con_mayor_stock.nombre !== "N/A") {
            document.getElementById("stat-stock").innerText = `${stats.producto_con_mayor_stock.nombre} (${stats.producto_con_mayor_stock.unidades} u.)`;
        } else {
            document.getElementById("stat-stock").innerText = "N/A";
        }
    } catch (err) {
        console.error("Error al cargar estadísticas de Pandas:", err);
    }
}

// 📋 Consumir el listado CRUD y armar el gráfico de barras
async function loadTableAndChart() {
    try {
        const res = await fetch("/api/productos");
        const products = await res.json();
        
        const tableBody = document.getElementById("productsTableBody");
        tableBody.innerHTML = ""; // Limpiar tabla anterior
        
        const formatter = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

        // 1. Renderizar filas en la tabla del CRUD
        products.forEach(p => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td><strong>#${p.id}</strong></td>
                <td>${p.nombre}</td>
                <td>${formatter.format(p.precio)}</td>
                <td><span class="badge ${p.cantidad < 10 ? 'bg-danger':'bg-secondary'}">${p.cantidad} unds</span></td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct(${p.id})">🗑️</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // 2. Usar los datos para armar el Gráfico de Barras con Chart.js
        // Ordenamos los productos de mayor a menor precio y tomamos el top 5
        const sortedProducts = [...products].sort((a, b) => b.precio - a.precio).slice(0, 5);
        
        const chartLabels = sortedProducts.map(p => p.nombre);
        const chartPrices = sortedProducts.map(p => p.precio);

        renderChart(chartLabels, chartPrices);

    } catch (err) {
        console.error("Error al procesar la lista de productos:", err);
    }
}

// 📉 Renderizar o actualizar el componente de Chart.js
function renderChart(labels, data) {
    const ctx = document.getElementById('analyticsChart').getContext('2d');
    
    // Si el gráfico ya existía, lo destruimos para poder pintar los nuevos datos limpios
    if (myChart) {
        myChart.destroy();
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

// 💾 Enviar un POST de forma asíncrona
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
            alert("✅ Producto agregado con éxito");
            document.getElementById("productForm").reset();
            loadAllData(); // Recarga métricas, tabla y gráfico en caliente
        } else {
            const errData = await res.json();
            alert(`❌ Error: ${errData.error}`);
        }
    } catch (err) {
        alert("❌ Error de red al intentar conectar con el servidor");
    }
}

// 🗑️ Enviar un DELETE de forma asíncrona
async function deleteProduct(id) {
    if (!confirm(`¿Estás seguro de que deseas eliminar el producto #${id}?`)) return;

    try {
        const res = await fetch(`/api/productos/${id}`, { method: "DELETE" });
        if (res.ok) {
            loadAllData(); // Recarga todo al instante
        } else {
            alert("❌ No se pudo eliminar el producto");
        }
    } catch (err) {
        console.error("Error al eliminar:", err);
    }
}