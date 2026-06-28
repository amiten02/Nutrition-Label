from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
import uuid

from .database import engine, SessionLocal, Base
from .models import Ingredient
from .routers import ingredients, recipes

app = FastAPI(title="NutriLabel API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ingredients.router)
app.include_router(recipes.router)

DEFAULT_INGREDIENTS = [
    {"name": "Whole Wheat Flour",    "energy_kcal": 340, "fat": 2.5,   "sat_fat": 0.4,  "carbs": 68.0, "sugars": 2.1, "fibre": 10.7, "protein": 13.2, "salt": 0.01},
    {"name": "Full Fat Milk",        "energy_kcal": 61,  "fat": 3.3,   "sat_fat": 2.1,  "carbs": 4.7,  "sugars": 4.7, "fibre": 0.0,  "protein": 3.2,  "salt": 0.10},
    {"name": "Chicken Breast (Raw)", "energy_kcal": 165, "fat": 3.6,   "sat_fat": 1.0,  "carbs": 0.0,  "sugars": 0.0, "fibre": 0.0,  "protein": 31.0, "salt": 0.08},
    {"name": "Cheddar Cheese",       "energy_kcal": 403, "fat": 33.3,  "sat_fat": 21.0, "carbs": 0.1,  "sugars": 0.1, "fibre": 0.0,  "protein": 24.9, "salt": 1.70},
    {"name": "Olive Oil",            "energy_kcal": 884, "fat": 100.0, "sat_fat": 14.3, "carbs": 0.0,  "sugars": 0.0, "fibre": 0.0,  "protein": 0.0,  "salt": 0.0},
    {"name": "Basmati Rice (Dry)",   "energy_kcal": 349, "fat": 0.9,   "sat_fat": 0.2,  "carbs": 77.7, "sugars": 0.1, "fibre": 1.3,  "protein": 7.3,  "salt": 0.01},
]

# All new optional columns added in v2 — idempotent ALTER TABLE for existing DBs
NEW_COLUMNS = [
    "mono_fat", "poly_fat", "trans_fat", "cholesterol", "sodium",
    "added_sugars", "starch", "omega_3", "omega_6",
    "vit_a", "vit_b1", "vit_b2", "vit_b3", "vit_b5", "vit_b6",
    "vit_b7", "vit_b9", "vit_b12", "vit_c", "vit_d", "vit_e", "vit_k",
    "calcium", "chloride", "chromium", "copper", "fluoride", "iodine",
    "iron", "magnesium", "manganese", "molybdenum", "phosphorus",
    "potassium", "selenium", "zinc",
    "aa_histidine", "aa_isoleucine", "aa_leucine", "aa_lysine",
    "aa_methionine", "aa_phenylalanine", "aa_threonine", "aa_tryptophan",
    "aa_valine", "aa_alanine", "aa_arginine", "aa_asparagine",
    "aa_aspartic_acid", "aa_cysteine", "aa_glutamic_acid", "aa_glutamine",
    "aa_glycine", "aa_proline", "aa_serine", "aa_tyrosine",
]


def _run_migrations() -> None:
    """Add new columns to an existing ingredients table without losing data."""
    with engine.connect() as conn:
        result = conn.execute(text("PRAGMA table_info(ingredients)"))
        existing = {row[1] for row in result.fetchall()}
        added = []
        for col in NEW_COLUMNS:
            if col not in existing:
                conn.execute(text(f"ALTER TABLE ingredients ADD COLUMN {col} FLOAT"))
                added.append(col)
        if added:
            conn.commit()


@app.on_event("startup")
async def startup() -> None:
    Base.metadata.create_all(bind=engine)
    _run_migrations()
    db = SessionLocal()
    try:
        if db.query(Ingredient).count() == 0:
            for data in DEFAULT_INGREDIENTS:
                db.add(Ingredient(id=str(uuid.uuid4()), **data))
            db.commit()
    finally:
        db.close()


@app.get("/")
def root() -> dict:
    return {"status": "ok", "message": "NutriLabel API v2"}
