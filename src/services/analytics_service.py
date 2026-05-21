import pandas as pd
from src.repository.json_repository import JsonRepository

class AnalyticsService:
    def __init__(self, repository: JsonRepository):
        self.repository = repository

    def generate_inventory_report(self) -> dict:
        """Usa Pandas para procesar el JSON y generar métricas del inventario."""
        products = self.repository.read_all()
        
        # Si no hay productos, devolvemos un reporte vacío controlado
        if not products:
            return {
                "total_productos_unicos": 0,
                "valor_total_inventario": 0.0,
                "precio_promedio": 0.0,
                "producto_mayor_stock": "N/A",
                "producto_mas_caro": "N/A"
            }
        
        # Cargamos la lista de diccionarios en un DataFrame de Pandas
        df = pd.DataFrame(products)
        
        # 1. Asegurar tipos de datos numéricos para los cálculos
        df['precio'] = pd.to_numeric(df['precio'])
        df['cantidad'] = pd.to_numeric(df['cantidad'])
        
        # 2. Calcular el valor total por cada producto (Precio * Cantidad)
        df['valor_total_linea'] = df['precio'] * df['cantidad']
        
        # 3. Extraer las métricas con funciones nativas de Pandas
        total_unicos = int(df['id'].count())
        valor_inventario = float(df['valor_total_linea'].sum())
        precio_promedio = float(df['precio'].mean())
        
        # Encontrar el producto con mayor stock (cantidad)
        idx_max_stock = df['cantidad'].idxmax()
        mayor_stock_nombre = df.loc[idx_max_stock, 'nombre']
        mayor_stock_unidades = int(df.loc[idx_max_stock, 'cantidad'])
        
        # Encontrar el producto más costoso (precio)
        idx_max_precio = df['precio'].idxmax()
        mas_caro_nombre = df.loc[idx_max_precio, 'nombre']
        mas_caro_valor = float(df.loc[idx_max_precio, 'precio'])
        
        # Estructuramos el reporte ejecutivo que se enviará como JSON
        report = {
            "total_productos_unicos": total_unicos,
            "valor_total_inventario": valor_inventario,
            "precio_promedio_productos": round(precio_promedio, 2),
            "producto_con_mayor_stock": {
                "nombre": mayor_stock_nombre,
                "unidades": mayor_stock_unidades
            },
            "producto_mas_caro": {
                "nombre": mas_caro_nombre,
                "precio": mas_caro_valor
            }
        }
        
        return report