class ProductNotFoundError(Exception):
    """Excepción lanzada cuando un producto no existe en el sistema."""
    pass

class DuplicateProductError(Exception):
    """Excepción lanzada cuando se intenta crear un producto con un ID ya existente."""
    pass