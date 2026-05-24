# Products-Analytics 📊🚀

A digital platform built with **Python (Flask)**, **Pandas**, and **Docker** designed to manage an interactive product inventory with integrated real-time data analytics.

This project is fully containerized, features a comprehensive automated testing suite, and maintains clean code architecture certified by **SonarQube**.

---

## 🛠️ Tech Stack & Key Features

* **Backend Engine:** Python 3.x with Flask (RESTful Architecture).
* **Data Intelligence:** Pandas DataFrames for instant financial and inventory analytics recalculations.
* **Frontend SPA:** Single Page Application interface utilizing Bootstrap 5, async JavaScript (Fetch API), and **Chart.js** for real-time statistical graphics.
* **Automated Testing:** Suite of 8 robust unit tests managed with `pytest` and `pytest-cov`.
* **Code Quality & CI/CD:** Local deployment pipeline through **Docker** and **SonarQube** analysis.
* **API Documentation:** Included Postman Collection for quick endpoint importing and evaluation.

---

## 📂 Project Architecture

The repository follows a clean, decoupled design pattern:
```text
Products-Analytics/
├── data/                       # Local JSON database storage
│   └── productos.json
├── src/                        # Core Application Layer
│   ├── controllers/            # API Route definitions
│   ├── services/               # Business logic core
│   └── repository/             # Data access abstraction
├── static/                     # SPA Assets (Frontend JS & CSS)
├── templates/                  # Single Page View (HTML)
├── tests/                      # Automated suite (Pytest)
├── seed.py                     # E-commerce mock data generator
├── main.py                     # Application entry point
├── sonar-project.properties   # SonarQube Scanner matrix configuration

---------Local Deployment Setup

1. Environment & Dependencies Configuration

# Create a virtual environment
python -m venv .venv

# Activate the virtual environment (Windows Bash)
source .venv/Scripts/activate

# Install required dependencies (Flask, Pandas, Pytest, etc.)
pip install -r requirements.txt

2. Populate the Database
Run the seeding script to populate the local JSON database with 100 realistic e-commerce products ready for testing:
python seed.py

3. Start the Web App
python main.py

🧪 Running Automated Tests
The test suite covers 8 independent testing scenarios, thoroughly verifying successful flows ("happy paths") and error handlers (custom business exceptions like ProductNotFoundError or DuplicateProductError) for all CRUD modules.

To execute the unit tests and output verbose results, run:
python -m pytest -v

To re-generate the structural test coverage XML report for quality management tracking:
python -m pytest --cov=src --cov-report=xml