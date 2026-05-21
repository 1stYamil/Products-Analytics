from flask import Flask, jsonify
from src.repository.json_repository import JsonRepository
from src.services.product_service import ProductService
from src.controllers.product_controller import create_product_blueprint

app = Flask(__name__)

# Instanciar las capas (Inyección de dependencias)
repository = JsonRepository()
product_service = ProductService(repository=repository)

# Registrar las rutas del controlador en la aplicación Flask
app.register_blueprint(create_product_blueprint(product_service))

@app.route('/')
def health_check():
    return jsonify({
        "status": "online",
        "message": "API de Productos y Analítica corriendo correctamente"
    }), 200

if __name__ == '__main__':
    # Ejecuta el servidor en modo desarrollo y en el puerto 5000
    app.run(debug=True, port=5000)