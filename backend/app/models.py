from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base


class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)

    # ── Core Macros (required, default 0) ──────────────────────────────
    energy_kcal     = Column(Float, default=0.0)
    fat             = Column(Float, default=0.0)
    sat_fat         = Column(Float, default=0.0)
    carbs           = Column(Float, default=0.0)
    sugars          = Column(Float, default=0.0)
    fibre           = Column(Float, default=0.0)
    protein         = Column(Float, default=0.0)
    salt            = Column(Float, default=0.0)

    # ── Extended Macros (optional) ──────────────────────────────────────
    mono_fat        = Column(Float, nullable=True)   # Monounsaturated fat (g)
    poly_fat        = Column(Float, nullable=True)   # Polyunsaturated fat (g)
    trans_fat       = Column(Float, nullable=True)   # Trans fat (g)
    cholesterol     = Column(Float, nullable=True)   # Cholesterol (mg)
    sodium          = Column(Float, nullable=True)   # Sodium (mg)
    added_sugars    = Column(Float, nullable=True)   # Added sugars (g)
    starch          = Column(Float, nullable=True)   # Starch (g)
    omega_3         = Column(Float, nullable=True)   # Omega-3 fatty acids (mg)
    omega_6         = Column(Float, nullable=True)   # Omega-6 fatty acids (mg)

    # ── Vitamins (optional) ─────────────────────────────────────────────
    vit_a           = Column(Float, nullable=True)   # Vitamin A (mcg RAE)
    vit_b1          = Column(Float, nullable=True)   # Thiamine (mg)
    vit_b2          = Column(Float, nullable=True)   # Riboflavin (mg)
    vit_b3          = Column(Float, nullable=True)   # Niacin (mg)
    vit_b5          = Column(Float, nullable=True)   # Pantothenic Acid (mg)
    vit_b6          = Column(Float, nullable=True)   # Vitamin B6 (mg)
    vit_b7          = Column(Float, nullable=True)   # Biotin (mcg)
    vit_b9          = Column(Float, nullable=True)   # Folate (mcg)
    vit_b12         = Column(Float, nullable=True)   # Vitamin B12 (mcg)
    vit_c           = Column(Float, nullable=True)   # Vitamin C (mg)
    vit_d           = Column(Float, nullable=True)   # Vitamin D (mcg)
    vit_e           = Column(Float, nullable=True)   # Vitamin E (mg)
    vit_k           = Column(Float, nullable=True)   # Vitamin K (mcg)

    # ── Minerals (optional) ─────────────────────────────────────────────
    calcium         = Column(Float, nullable=True)   # mg
    chloride        = Column(Float, nullable=True)   # mg
    chromium        = Column(Float, nullable=True)   # mcg
    copper          = Column(Float, nullable=True)   # mg
    fluoride        = Column(Float, nullable=True)   # mg
    iodine          = Column(Float, nullable=True)   # mcg
    iron            = Column(Float, nullable=True)   # mg
    magnesium       = Column(Float, nullable=True)   # mg
    manganese       = Column(Float, nullable=True)   # mg
    molybdenum      = Column(Float, nullable=True)   # mcg
    phosphorus      = Column(Float, nullable=True)   # mg
    potassium       = Column(Float, nullable=True)   # mg
    selenium        = Column(Float, nullable=True)   # mcg
    zinc            = Column(Float, nullable=True)   # mg

    # ── Essential Amino Acids (optional, g per 100g) ────────────────────
    aa_histidine    = Column(Float, nullable=True)
    aa_isoleucine   = Column(Float, nullable=True)
    aa_leucine      = Column(Float, nullable=True)
    aa_lysine       = Column(Float, nullable=True)
    aa_methionine   = Column(Float, nullable=True)
    aa_phenylalanine = Column(Float, nullable=True)
    aa_threonine    = Column(Float, nullable=True)
    aa_tryptophan   = Column(Float, nullable=True)
    aa_valine       = Column(Float, nullable=True)

    # ── Non-Essential Amino Acids (optional, g per 100g) ────────────────
    aa_alanine      = Column(Float, nullable=True)
    aa_arginine     = Column(Float, nullable=True)
    aa_asparagine   = Column(Float, nullable=True)
    aa_aspartic_acid = Column(Float, nullable=True)
    aa_cysteine     = Column(Float, nullable=True)
    aa_glutamic_acid = Column(Float, nullable=True)
    aa_glutamine    = Column(Float, nullable=True)
    aa_glycine      = Column(Float, nullable=True)
    aa_proline      = Column(Float, nullable=True)
    aa_serine       = Column(Float, nullable=True)
    aa_tyrosine     = Column(Float, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    recipe_ingredients = relationship(
        "RecipeIngredient",
        back_populates="ingredient",
        cascade="all, delete-orphan",
    )


class Recipe(Base):
    __tablename__ = "recipes"

    id         = Column(String, primary_key=True, index=True)
    name       = Column(String, nullable=False, index=True)
    servings   = Column(Integer, default=4)
    created_at = Column(DateTime, default=datetime.utcnow)

    recipe_ingredients = relationship(
        "RecipeIngredient",
        back_populates="recipe",
        cascade="all, delete-orphan",
        order_by="RecipeIngredient.order_idx",
    )


class RecipeIngredient(Base):
    __tablename__ = "recipe_ingredients"

    id            = Column(String, primary_key=True, index=True)
    recipe_id     = Column(String, ForeignKey("recipes.id"), nullable=False)
    ingredient_id = Column(String, ForeignKey("ingredients.id"), nullable=False)
    weight_g      = Column(Float, nullable=False)
    order_idx     = Column(Integer, default=0)

    recipe     = relationship("Recipe", back_populates="recipe_ingredients")
    ingredient = relationship("Ingredient", back_populates="recipe_ingredients")
