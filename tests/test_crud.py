import os
import pytest
from src.repository.json_repository import JsonRepository
from src.services.product_service import ProductService
from src.services.exceptions import ProductNotFoundError, DuplicateProductError

# Fixture para preparar un repositorio limpio antes de cada prueba
@pytest.fixture
def test_service():
    test_file = "data/test_database.json"
    # Aseguramos que empiece vacío
    if os.path.exists(test_file):
        os.remove(test_file)
        
    repo = JsonRepository(file_path=test_file)
    service = ProductService(repository=repo)
    yield service
    
    # Limpieza después de que terminen las pruebas
    if os.path.exists(test_file):
        os.remove(test_file)

# --- PRUEBAS DE CREAR (CREATE) ---
def test_create_product_success(test_service):
    product = {"id": 1, "nombre": "Teclado", "descripción": "Teclado mecánico", "precio": 150000.0, "cantidad": 10}
    result = test_service.create(product)
    assert result["id"] == 1
    assert len(test_service.get_all()) == 1

def test_create_product_duplicate_error(test_service):
    product = {"id": 1, "nombre": "Teclado", "descripción": "Teclado mecánico", "precio": 150000.0, "cantidad": 10}
    test_service.create(product)
    
    # Intentar crear otro con el mismo ID debe fallar
    with pytest.raises(DuplicateProductError):
        test_service.create(product)

# --- PRUEBAS DE LEER (READ) ---
def test_get_by_id_success(test_service):
    product = {"id": 2, "nombre": "Mouse", "descripción": "Mouse Gamer", "precio": 80000.0, "cantidad": 5}
    test_service.create(product)
    
    found = test_service.get_by_id(2)
    assert found["nombre"] == "Mouse"

def test_get_by_id_not_found_error(test_service):
    with pytest.raises(ProductNotFoundError):
        test_service.get_by_id(999) # No existe

# --- PRUEBAS DE ACTUALIZAR (UPDATE) ---
def test_update_product_success(test_service):
    product = {"id": 3, "nombre": "Monitor", "descripción": "Monitor 60Hz", "precio": 500000.0, "cantidad": 2}
    test_service.create(product)
    
    updated_data = {"nombre": "Monitor Gamer", "descripción": "Monitor 144Hz", "precio": 750000.0, "cantidad": 4}
    result = test_service.update(3, updated_data)
    
    assert result["nombre"] == "Monitor Gamer"
    assert test_service.get_by_id(3)["precio"] == 750000.0

def test_update_product_not_found_error(test_service):
    updated_data = {"nombre": "Inexistente", "descripción": "...", "precio": 0.0, "cantidad": 0}
    with pytest.raises(ProductNotFoundError):
        test_service.update(999, updated_data)

# --- PRUEBAS DE ELIMINAR (DELETE) ---
def test_delete_product_success(test_service):
    product = {"id": 4, "nombre": "Audífonos", "descripción": "Audífonos Bluetooth", "precio": 120000.0, "cantidad": 7}
    test_service.create(product)
    
    assert test_service.delete(4) is True
    assert len(test_service.get_all()) == 0

def test_delete_product_not_found_error(test_service):
    with pytest.raises(ProductNotFoundError):
        test_service.delete(999)