# NutriLabel

A nutrition label application for building recipes and generating UK-style Nutrition Information (NI) panels.

## What it does

- **Ingredient Library** — Store nutritional facts per 100g (energy, fat, saturates, carbohydrate, sugars, fibre, protein, salt)
- **Recipe Builder** — Add ingredients with weights in grams; the app auto-calculates the NI table per 100g and per serving
- **NI Panel** — Renders a real-looking UK food label with per-100g and per-serving columns, including kJ conversion

Comes pre-seeded with 6 common ingredients (Whole Wheat Flour, Full Fat Milk, Chicken Breast, Cheddar Cheese, Olive Oil, Basmati Rice).

## Quick Start (local)

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API will be available at http://localhost:8000  
Interactive docs: http://localhost:8000/docs

### Frontend (new terminal)

```bash
cd frontend
npm install
npm run dev
```

The app will be available at http://localhost:5173

## Quick Start (Docker)

```bash
docker-compose up
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs

## Project Structure

```
nutrition-label-app/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app, startup seeding
│   │   ├── database.py      # SQLAlchemy + SQLite setup
│   │   ├── models.py        # Ingredient, Recipe, RecipeIngredient
│   │   ├── schemas.py       # Pydantic v2 schemas
│   │   └── routers/
│   │       ├── ingredients.py
│   │       └── recipes.py   # Includes NI calculation
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.js
│   │   ├── components/
│   │   │   ├── NITable.jsx       # UK-style nutrition label
│   │   │   └── IngredientForm.jsx
│   │   └── pages/
│   │       ├── IngredientsPage.jsx
│   │       └── RecipesPage.jsx
│   ├── package.json
│   └── vite.config.js
└── docker-compose.yml
```

## NI Calculation

For each ingredient:  
`contribution = (weight_g / 100) × nutrient_per_100g`

Sum all contributions.  
`per_100g = total / total_weight × 100`  
`per_serving = total / servings`
