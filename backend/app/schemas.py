from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime


class IngredientBase(BaseModel):
    name: str

    # ── Core Macros (always present, default 0) ─────────────────────────
    energy_kcal:    Optional[float] = 0.0
    fat:            Optional[float] = 0.0
    sat_fat:        Optional[float] = 0.0
    carbs:          Optional[float] = 0.0
    sugars:         Optional[float] = 0.0
    fibre:          Optional[float] = 0.0
    protein:        Optional[float] = 0.0
    salt:           Optional[float] = 0.0

    @field_validator('energy_kcal', 'fat', 'sat_fat', 'carbs', 'sugars', 'fibre', 'protein', 'salt', mode='before')
    @classmethod
    def core_none_to_zero(cls, v):
        return 0.0 if v is None else v

    # ── Extended Macros ─────────────────────────────────────────────────
    mono_fat:       Optional[float] = None
    poly_fat:       Optional[float] = None
    trans_fat:      Optional[float] = None
    cholesterol:    Optional[float] = None
    sodium:         Optional[float] = None
    added_sugars:   Optional[float] = None
    starch:         Optional[float] = None
    omega_3:        Optional[float] = None
    omega_6:        Optional[float] = None

    # ── Vitamins ─────────────────────────────────────────────────────────
    vit_a:          Optional[float] = None
    vit_b1:         Optional[float] = None
    vit_b2:         Optional[float] = None
    vit_b3:         Optional[float] = None
    vit_b5:         Optional[float] = None
    vit_b6:         Optional[float] = None
    vit_b7:         Optional[float] = None
    vit_b9:         Optional[float] = None
    vit_b12:        Optional[float] = None
    vit_c:          Optional[float] = None
    vit_d:          Optional[float] = None
    vit_e:          Optional[float] = None
    vit_k:          Optional[float] = None

    # ── Minerals ─────────────────────────────────────────────────────────
    calcium:        Optional[float] = None
    chloride:       Optional[float] = None
    chromium:       Optional[float] = None
    copper:         Optional[float] = None
    fluoride:       Optional[float] = None
    iodine:         Optional[float] = None
    iron:           Optional[float] = None
    magnesium:      Optional[float] = None
    manganese:      Optional[float] = None
    molybdenum:     Optional[float] = None
    phosphorus:     Optional[float] = None
    potassium:      Optional[float] = None
    selenium:       Optional[float] = None
    zinc:           Optional[float] = None

    # ── Essential Amino Acids ─────────────────────────────────────────────
    aa_histidine:       Optional[float] = None
    aa_isoleucine:      Optional[float] = None
    aa_leucine:         Optional[float] = None
    aa_lysine:          Optional[float] = None
    aa_methionine:      Optional[float] = None
    aa_phenylalanine:   Optional[float] = None
    aa_threonine:       Optional[float] = None
    aa_tryptophan:      Optional[float] = None
    aa_valine:          Optional[float] = None

    # ── Non-Essential Amino Acids ─────────────────────────────────────────
    aa_alanine:         Optional[float] = None
    aa_arginine:        Optional[float] = None
    aa_asparagine:      Optional[float] = None
    aa_aspartic_acid:   Optional[float] = None
    aa_cysteine:        Optional[float] = None
    aa_glutamic_acid:   Optional[float] = None
    aa_glutamine:       Optional[float] = None
    aa_glycine:         Optional[float] = None
    aa_proline:         Optional[float] = None
    aa_serine:          Optional[float] = None
    aa_tyrosine:        Optional[float] = None


class IngredientCreate(IngredientBase):
    pass


class IngredientUpdate(BaseModel):
    name:           Optional[str]   = None
    energy_kcal:    Optional[float] = None
    fat:            Optional[float] = None
    sat_fat:        Optional[float] = None
    carbs:          Optional[float] = None
    sugars:         Optional[float] = None
    fibre:          Optional[float] = None
    protein:        Optional[float] = None
    salt:           Optional[float] = None
    mono_fat:       Optional[float] = None
    poly_fat:       Optional[float] = None
    trans_fat:      Optional[float] = None
    cholesterol:    Optional[float] = None
    sodium:         Optional[float] = None
    added_sugars:   Optional[float] = None
    starch:         Optional[float] = None
    omega_3:        Optional[float] = None
    omega_6:        Optional[float] = None
    vit_a:          Optional[float] = None
    vit_b1:         Optional[float] = None
    vit_b2:         Optional[float] = None
    vit_b3:         Optional[float] = None
    vit_b5:         Optional[float] = None
    vit_b6:         Optional[float] = None
    vit_b7:         Optional[float] = None
    vit_b9:         Optional[float] = None
    vit_b12:        Optional[float] = None
    vit_c:          Optional[float] = None
    vit_d:          Optional[float] = None
    vit_e:          Optional[float] = None
    vit_k:          Optional[float] = None
    calcium:        Optional[float] = None
    chloride:       Optional[float] = None
    chromium:       Optional[float] = None
    copper:         Optional[float] = None
    fluoride:       Optional[float] = None
    iodine:         Optional[float] = None
    iron:           Optional[float] = None
    magnesium:      Optional[float] = None
    manganese:      Optional[float] = None
    molybdenum:     Optional[float] = None
    phosphorus:     Optional[float] = None
    potassium:      Optional[float] = None
    selenium:       Optional[float] = None
    zinc:           Optional[float] = None
    aa_histidine:       Optional[float] = None
    aa_isoleucine:      Optional[float] = None
    aa_leucine:         Optional[float] = None
    aa_lysine:          Optional[float] = None
    aa_methionine:      Optional[float] = None
    aa_phenylalanine:   Optional[float] = None
    aa_threonine:       Optional[float] = None
    aa_tryptophan:      Optional[float] = None
    aa_valine:          Optional[float] = None
    aa_alanine:         Optional[float] = None
    aa_arginine:        Optional[float] = None
    aa_asparagine:      Optional[float] = None
    aa_aspartic_acid:   Optional[float] = None
    aa_cysteine:        Optional[float] = None
    aa_glutamic_acid:   Optional[float] = None
    aa_glutamine:       Optional[float] = None
    aa_glycine:         Optional[float] = None
    aa_proline:         Optional[float] = None
    aa_serine:          Optional[float] = None
    aa_tyrosine:        Optional[float] = None


class IngredientOut(IngredientBase):
    id: str
    created_at: datetime

    model_config = {"from_attributes": True}


class RecipeIngredientIn(BaseModel):
    ingredient_id: str
    weight_g: float


class RecipeIngredientOut(BaseModel):
    id: str
    ingredient_id: str
    weight_g: float
    order_idx: int
    ingredient: IngredientOut

    model_config = {"from_attributes": True}


class RecipeBase(BaseModel):
    name: str
    servings: int = 4


class RecipeCreate(RecipeBase):
    pass


class RecipeUpdate(BaseModel):
    name:     Optional[str] = None
    servings: Optional[int] = None


class RecipeOut(RecipeBase):
    id: str
    created_at: datetime
    recipe_ingredients: List[RecipeIngredientOut] = []

    model_config = {"from_attributes": True}


class RecipeListItem(BaseModel):
    id: str
    name: str
    servings: int
    created_at: datetime
    ingredient_count: int
    total_kcal: float

    model_config = {"from_attributes": True}


class NutrientRow(BaseModel):
    label: str
    per_100g: float
    per_serving: float
    unit: str = "g"
    section: str = "macros"
    is_sub_row: bool = False


class NITable(BaseModel):
    total_weight_g: float
    serving_weight_g: float
    servings: int
    rows: List[NutrientRow]
