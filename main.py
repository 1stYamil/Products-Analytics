from flask import Flask, jsonify
from src.repository.json_repository import JsonRepository
from src.services.product_service import ProductService
from src.services.analytics_service import AnalyticsService
from src.controllers.product_controller import create_product_blueprint

app = Flask(__name__)

# Instanciar las capas de datos y servicios
repository = JsonRepository()
product_service = ProductService(repository=repository)
analytics_service = AnalyticsService(repository=repository) # Instancia de Pandas

# Registrar las rutas inyectando ambos servicios
app.register_blueprint(create_product_blueprint(product_service, analytics_service))

@app.route('/')
def health_check():
    return jsonify({
        "status": "online",
        "message": "API de Productos y Analítica corriendo correctamente"
    }), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)