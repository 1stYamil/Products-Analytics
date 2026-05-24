from flask import Blueprint, request, jsonify
from src.services.exceptions import ProductNotFoundError, DuplicateProductError

def create_product_blueprint(product_service, analytics_service):
    """
    Fábrica de Blueprint para el módulo de productos.
    Inyecta las dependencias del servicio de negocio y el servicio analítico.
    """
    bp = Blueprint('products', __name__, url_prefix='/api/productos')

    @bp.route('', methods=['POST'])
    def create():
        """Registra un nuevo producto validando campos obligatorios y duplicados."""
        try:
            data = request.get_json()
            required = ['id', 'nombre', 'descripción', 'precio', 'cantidad']
            
            # Validación estructural del payload de entrada
            if not all(k in data for k in required):
                return jsonify({"error": "Faltan campos requeridos en el producto"}), 400
                
            result = product_service.create(data)
            return jsonify(result), 201
        except DuplicateProductError as e:
            return jsonify({"error": str(e)}), 409

    @bp.route('', methods=['GET'])
    def get_all():
        """Recupera el inventario completo de productos."""
        return jsonify(product_service.get_all()), 200

    @bp.route('/<int:product_id>', methods=['GET'])
    def get_by_id(product_id):
        """Busca y retorna un producto específico por su ID único."""
        try:
            product = product_service.get_by_id(product_id)
            return jsonify(product), 200
        except ProductNotFoundError as e:
            return jsonify({"error": str(e)}), 404

    @bp.route('/<int:product_id>', methods=['PUT'])
    def update(product_id):
        """Modifica los atributos de un producto existente."""
        try:
            data = request.get_json()
            result = product_service.update(product_id, data)
            return jsonify(result), 200
        except ProductNotFoundError as e:
            return jsonify({"error": str(e)}), 404

    @bp.route('/<int:product_id>', methods=['DELETE'])
    def delete(product_id):
        """Elimina físicamente un producto del sistema."""
        try:
            product_service.delete(product_id)
            return jsonify({"message": f"Producto {product_id} eliminado exitosamente"}), 200
        except ProductNotFoundError as e:
            return jsonify({"error": str(e)}), 404

    @bp.route('/estadisticas', methods=['GET'])
    def get_analytics():
        """
        Retorna las métricas analíticas avanzadas del inventario
        calculadas mediante procesamiento de datos con Pandas.
        """
        report = analytics_service.generate_inventory_report()
        return jsonify(report), 200

    return bp