from src.repository.json_repository import JsonRepository
from src.services.exceptions import ProductNotFoundError, DuplicateProductError

class ProductService:
    def __init__(self, repository: JsonRepository):
        self.repository = repository

    def create(self, product_data: dict) -> dict:
        """Crea un nuevo producto asegurando que el ID sea único."""
        products = self.repository.read_all()
        
        # Validar si el ID ya existe
        for p in products:
            if p['id'] == product_data['id']:
                raise DuplicateProductError(f"El producto con ID {product_data['id']} ya existe.")
        
        products.append(product_data)
        self.repository.save_all(products)
        return product_data

    def get_all(self) -> list:
        """Retorna todos los productos registrados."""
        return self.repository.read_all()

    def get_by_id(self, product_id: int) -> dict:
        """Busca un producto por su ID. Lanza error si no existe."""
        products = self.repository.read_all()
        for p in products:
            if p['id'] == product_id:
                return p
        raise ProductNotFoundError(f"Producto con ID {product_id} no encontrado.")

    def update(self, product_id: int, updated_data: dict) -> dict:
        """Actualiza un producto existente. Lanza error si no existe."""
        products = self.repository.read_all()
        
        for i, p in enumerate(products):
            if p['id'] == product_id:
                # Mantener el ID original intacto y actualizar el resto de campos
                updated_data['id'] = product_id
                products[i] = updated_data
                self.repository.save_all(products)
                return updated_data
                
        raise ProductNotFoundError(f"No se puede actualizar. Producto con ID {product_id} no encontrado.")

    def delete(self, product_id: int) -> bool:
        """Elimina un producto por su ID. Lanza error si no existe."""
        products = self.repository.read_all()
        
        for i, p in enumerate(products):
            if p['id'] == product_id:
                products.pop(i)
                self.repository.save_all(products)
                return True
                
        raise ProductNotFoundError(f"No se puede eliminar. Producto con ID {product_id} no encontrado.")