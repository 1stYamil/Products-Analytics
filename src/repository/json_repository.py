import json
import os

class JsonRepository:
    def __init__(self, file_path="data/database.json"):
        self.file_path = file_path
        self._ensure_file_exists()

    def _ensure_file_exists(self):
        """Asegura que la carpeta data y el archivo JSON existan."""
        os.makedirs(os.path.dirname(self.file_path), exist_ok=True)
        if not os.path.exists(self.file_path):
            with open(self.file_path, 'w', encoding='utf-8') as f:
                json.dump([], f)

    def read_all(self) -> list:
        """Lee el archivo JSON y devuelve la lista de productos."""
        try:
            with open(self.file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except json.JSONDecodeError:
            return []

    def save_all(self, data: list) -> bool:
        """Guarda la lista completa de productos en el JSON."""
        try:
            with open(self.file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=4)
            return True
        except IOError:
            return False