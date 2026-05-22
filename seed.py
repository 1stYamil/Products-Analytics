import requests
import json
import os

def seed_database():
    print("🚀 Conectando con la API externa para descargar productos...")
    
    # DummyJSON nos permite pedir hasta 100 productos de golpe en una sola petición
    # Para simular un volumen masivo y variado, pediremos el máximo permitido por lote
    url = "https://dummyjson.com/products?limit=100"
    
    try:
        response = requests.get(url)
        response.raise_for_status() # Lanza un error si la petición falla
        data = response.json()
        
        external_products = data.get("products", [])
        formatted_products = []
        
        print(f"📦 Se encontraron {len(external_products)} productos externos. Formateando datos...")
        
        # Mapeamos los datos de la API externa a la estructura exacta de nuestro proyecto
        for prod in external_products:
            formatted_product = {
                "id": int(prod.get("id")),
                "nombre": str(prod.get("title")),
                "descripción": str(prod.get("description")),
                "precio": float(prod.get("price")) * 4000, # Pasamos el precio de USD a Pesos Colombianos aprox.
                "cantidad": int((prod.get("id") * 7) % 45) + 5 # Genera un stock variado y realista entre 5 y 50
            }
            formatted_products.append(formatted_product)
            
        # Ruta de nuestra base de datos local
        db_path = "data/database.json"
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        
        # Guardamos la lista completa en nuestro archivo JSON estructurado
        with open(db_path, "w", encoding="utf-8") as f:
            json.dump(formatted_products, f, ensure_ascii=False, indent=4)
            
        print("✅ ¡Base de datos JSON cargada exitosamente con datos masivos reales!")
        print(f"📁 Ubicación: {db_path}")
        
    except requests.RequestException as e:
        print(f"❌ Error al consumir la API externa: {e}")

if __name__ == "__main__":
    seed_database()