from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from ..database import get_db
from ..models import Recipe, RecipeIngredient, Ingredient
from ..schemas import (
    RecipeCreate, RecipeUpdate, RecipeOut, RecipeListItem,
    RecipeIngredientIn, RecipeIngredientOut, NITable, NutrientRow,
)

router = APIRouter(prefix="/api/recipes", tags=["recipes"])

# (label, db_field, unit, section, is_sub_row)
# Core macros always appear; all others only appear when at least one
# ingredient has a non-None value for that field.
NUTRIENTS: List[tuple] = [
    # Energy
    ("Energy (kcal)",               "energy_kcal",      "kcal", "energy",          False),
    # Fats
    ("Fat",                         "fat",               "g",    "macros",          False),
    ("of which Saturates",          "sat_fat",           "g",    "macros",          True),
    ("of which Monounsaturates",    "mono_fat",          "g",    "macros",          True),
    ("of which Polyunsaturates",    "poly_fat",          "g",    "macros",          True),
    ("of which Trans Fat",          "trans_fat",         "g",    "macros",          True),
    ("Cholesterol",                 "cholesterol",       "mg",   "macros",          False),
    ("Omega-3 Fatty Acids",         "omega_3",           "mg",   "macros",          False),
    ("Omega-6 Fatty Acids",         "omega_6",           "mg",   "macros",          False),
    # Carbohydrates
    ("Carbohydrate",                "carbs",             "g",    "macros",          False),
    ("of which Sugars",             "sugars",            "g",    "macros",          True),
    ("of which Added Sugars",       "added_sugars",      "g",    "macros",          True),
    ("of which Starch",             "starch",            "g",    "macros",          True),
    # Other core
    ("Fibre",                       "fibre",             "g",    "macros",          False),
    ("Protein",                     "protein",           "g",    "macros",          False),
    ("Salt",                        "salt",              "g",    "macros",          False),
    ("Sodium",                      "sodium",            "mg",   "macros",          False),
    # Vitamins
    ("Vitamin A",                   "vit_a",             "mcg",  "vitamins",        False),
    ("Vitamin B1 (Thiamine)",       "vit_b1",            "mg",   "vitamins",        False),
    ("Vitamin B2 (Riboflavin)",     "vit_b2",            "mg",   "vitamins",        False),
    ("Vitamin B3 (Niacin)",         "vit_b3",            "mg",   "vitamins",        False),
    ("Vitamin B5 (Pantothenic Acid)","vit_b5",           "mg",   "vitamins",        False),
    ("Vitamin B6",                  "vit_b6",            "mg",   "vitamins",        False),
    ("Vitamin B7 (Biotin)",         "vit_b7",            "mcg",  "vitamins",        False),
    ("Vitamin B9 (Folate)",         "vit_b9",            "mcg",  "vitamins",        False),
    ("Vitamin B12",                 "vit_b12",           "mcg",  "vitamins",        False),
    ("Vitamin C",                   "vit_c",             "mg",   "vitamins",        False),
    ("Vitamin D",                   "vit_d",             "mcg",  "vitamins",        False),
    ("Vitamin E",                   "vit_e",             "mg",   "vitamins",        False),
    ("Vitamin K",                   "vit_k",             "mcg",  "vitamins",        False),
    # Minerals
    ("Calcium",                     "calcium",           "mg",   "minerals",        False),
    ("Chloride",                    "chloride",          "mg",   "minerals",        False),
    ("Chromium",                    "chromium",          "mcg",  "minerals",        False),
    ("Copper",                      "copper",            "mg",   "minerals",        False),
    ("Fluoride",                    "fluoride",          "mg",   "minerals",        False),
    ("Iodine",                      "iodine",            "mcg",  "minerals",        False),
    ("Iron",                        "iron",              "mg",   "minerals",        False),
    ("Magnesium",                   "magnesium",         "mg",   "minerals",        False),
    ("Manganese",                   "manganese",         "mg",   "minerals",        False),
    ("Molybdenum",                  "molybdenum",        "mcg",  "minerals",        False),
    ("Phosphorus",                  "phosphorus",        "mg",   "minerals",        False),
    ("Potassium",                   "potassium",         "mg",   "minerals",        False),
    ("Selenium",                    "selenium",          "mcg",  "minerals",        False),
    ("Zinc",                        "zinc",              "mg",   "minerals",        False),
    # Essential Amino Acids
    ("Histidine",                   "aa_histidine",      "g",    "amino_essential", False),
    ("Isoleucine",                  "aa_isoleucine",     "g",    "amino_essential", False),
    ("Leucine",                     "aa_leucine",        "g",    "amino_essential", False),
    ("Lysine",                      "aa_lysine",         "g",    "amino_essential", False),
    ("Methionine",                  "aa_methionine",     "g",    "amino_essential", False),
    ("Phenylalanine",               "aa_phenylalanine",  "g",    "amino_essential", False),
    ("Threonine",                   "aa_threonine",      "g",    "amino_essential", False),
    ("Tryptophan",                  "aa_tryptophan",     "g",    "amino_essential", False),
    ("Valine",                      "aa_valine",         "g",    "amino_essential", False),
    # Non-Essential Amino Acids
    ("Alanine",                     "aa_alanine",        "g",    "amino_ne",        False),
    ("Arginine",                    "aa_arginine",       "g",    "amino_ne",        False),
    ("Asparagine",                  "aa_asparagine",     "g",    "amino_ne",        False),
    ("Aspartic Acid",               "aa_aspartic_acid",  "g",    "amino_ne",        False),
    ("Cysteine",                    "aa_cysteine",       "g",    "amino_ne",        False),
    ("Glutamic Acid",               "aa_glutamic_acid",  "g",    "amino_ne",        False),
    ("Glutamine",                   "aa_glutamine",      "g",    "amino_ne",        False),
    ("Glycine",                     "aa_glycine",        "g",    "amino_ne",        False),
    ("Proline",                     "aa_proline",        "g",    "amino_ne",        False),
    ("Serine",                      "aa_serine",         "g",    "amino_ne",        False),
    ("Tyrosine",                    "aa_tyrosine",       "g",    "amino_ne",        False),
]

# Always shown regardless of whether data is present
CORE_KEYS = {"energy_kcal", "fat", "sat_fat", "carbs", "sugars", "fibre", "protein", "salt"}


def calc_ni(recipe: Recipe, recipe_ingredients: list) -> NITable:
    totals: dict[str, float] = {key: 0.0 for _, key, *_ in NUTRIENTS}
    has_data: dict[str, bool] = {key: False for _, key, *_ in NUTRIENTS}
    total_weight: float = 0.0

    for ri in recipe_ingredients:
        factor = ri.weight_g / 100.0
        for _, key, *_ in NUTRIENTS:
            val = getattr(ri.ingredient, key, None)
            if val is not None:
                totals[key] += val * factor
                has_data[key] = True
        total_weight += ri.weight_g

    servings = max(1, recipe.servings)
    rows: List[NutrientRow] = []

    for label, key, unit, section, is_sub in NUTRIENTS:
        if key not in CORE_KEYS and not has_data[key]:
            continue  # skip optional fields with no data from any ingredient
        per_100g = (totals[key] / total_weight * 100) if total_weight > 0 else 0.0
        per_serving = totals[key] / servings
        rows.append(NutrientRow(
            label=label,
            per_100g=round(per_100g, 3),
            per_serving=round(per_serving, 3),
            unit=unit,
            section=section,
            is_sub_row=is_sub,
        ))

    return NITable(
        total_weight_g=round(total_weight, 1),
        serving_weight_g=round(total_weight / servings, 1),
        servings=servings,
        rows=rows,
    )


@router.get("/", response_model=List[RecipeListItem])
def list_recipes(
    search: Optional[str] = None,
    db: Session = Depends(get_db),
) -> List[RecipeListItem]:
    query = db.query(Recipe)
    if search:
        query = query.filter(Recipe.name.ilike(f"%{search}%"))
    result = []
    for recipe in query.order_by(Recipe.name).all():
        total_kcal = sum(
            (ri.weight_g / 100.0) * ri.ingredient.energy_kcal
            for ri in recipe.recipe_ingredients
        )
        result.append(RecipeListItem(
            id=recipe.id,
            name=recipe.name,
            servings=recipe.servings,
            created_at=recipe.created_at,
            ingredient_count=len(recipe.recipe_ingredients),
            total_kcal=round(total_kcal, 1),
        ))
    return result


@router.post("/", response_model=RecipeOut, status_code=201)
def create_recipe(data: RecipeCreate, db: Session = Depends(get_db)) -> Recipe:
    recipe = Recipe(id=str(uuid.uuid4()), **data.model_dump())
    db.add(recipe)
    db.commit()
    db.refresh(recipe)
    return recipe


@router.get("/{recipe_id}", response_model=RecipeOut)
def get_recipe(recipe_id: str, db: Session = Depends(get_db)) -> Recipe:
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipe


@router.put("/{recipe_id}", response_model=RecipeOut)
def update_recipe(
    recipe_id: str, data: RecipeUpdate, db: Session = Depends(get_db)
) -> Recipe:
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(recipe, field, value)
    db.commit()
    db.refresh(recipe)
    return recipe


@router.delete("/{recipe_id}", status_code=204)
def delete_recipe(recipe_id: str, db: Session = Depends(get_db)) -> None:
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    db.delete(recipe)
    db.commit()


@router.post("/{recipe_id}/ingredients", response_model=RecipeIngredientOut, status_code=201)
def add_ingredient_to_recipe(
    recipe_id: str, data: RecipeIngredientIn, db: Session = Depends(get_db)
) -> RecipeIngredient:
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    ingredient = db.query(Ingredient).filter(Ingredient.id == data.ingredient_id).first()
    if not ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    ri = RecipeIngredient(
        id=str(uuid.uuid4()),
        recipe_id=recipe_id,
        ingredient_id=data.ingredient_id,
        weight_g=data.weight_g,
        order_idx=len(recipe.recipe_ingredients),
    )
    db.add(ri)
    db.commit()
    db.refresh(ri)
    return ri


@router.delete("/{recipe_id}/ingredients/{ri_id}", status_code=204)
def remove_ingredient_from_recipe(
    recipe_id: str, ri_id: str, db: Session = Depends(get_db)
) -> None:
    ri = db.query(RecipeIngredient).filter(
        RecipeIngredient.id == ri_id,
        RecipeIngredient.recipe_id == recipe_id,
    ).first()
    if not ri:
        raise HTTPException(status_code=404, detail="Recipe ingredient not found")
    db.delete(ri)
    db.commit()


@router.get("/{recipe_id}/ni-table", response_model=NITable)
def get_ni_table(recipe_id: str, db: Session = Depends(get_db)) -> NITable:
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return calc_ni(recipe, recipe.recipe_ingredients)
