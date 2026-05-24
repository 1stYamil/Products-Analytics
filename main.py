from flask import Flask, render_template  # <-- Añadimos render_template aquí
from src.repository.json_repository import JsonRepository
from src.services.product_service import ProductService
from src.services.analytics_service import AnalyticsService
from src.controllers.product_controller import create_product_blueprint

app = Flask(__name__)

# Instanciar las capas de datos y servicios
repository = JsonRepository()
product_service = ProductService(repository=repository)
analytics_service = AnalyticsService(repository=repository)

# Registrar las rutas inyectando ambos servicios
app.register_blueprint(create_product_blueprint(product_service, analytics_service))

# Ruta principal para que renderice la vista web interactiva
@app.route('/')
def home():
    return render_template('index.html')  # <-- Devuelve la plantilla HTML

if __name__ == '__main__':
    app.run(debug=True, port=5000)