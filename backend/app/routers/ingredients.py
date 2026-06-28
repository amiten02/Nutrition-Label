from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from ..database import get_db
from ..models import Ingredient
from ..schemas import IngredientCreate, IngredientUpdate, IngredientOut

router = APIRouter(prefix="/api/ingredients", tags=["ingredients"])


@router.get("/", response_model=List[IngredientOut])
def list_ingredients(
    search: Optional[str] = None,
    db: Session = Depends(get_db)
) -> List[Ingredient]:
    query = db.query(Ingredient)
    if search:
        query = query.filter(Ingredient.name.ilike(f"%{search}%"))
    return query.order_by(Ingredient.name).all()


@router.post("/", response_model=IngredientOut, status_code=201)
def create_ingredient(
    data: IngredientCreate,
    db: Session = Depends(get_db)
) -> Ingredient:
    ingredient = Ingredient(id=str(uuid.uuid4()), **data.model_dump())
    db.add(ingredient)
    db.commit()
    db.refresh(ingredient)
    return ingredient


@router.get("/{ingredient_id}", response_model=IngredientOut)
def get_ingredient(
    ingredient_id: str,
    db: Session = Depends(get_db)
) -> Ingredient:
    ingredient = db.query(Ingredient).filter(Ingredient.id == ingredient_id).first()
    if not ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    return ingredient


@router.put("/{ingredient_id}", response_model=IngredientOut)
def update_ingredient(
    ingredient_id: str,
    data: IngredientUpdate,
    db: Session = Depends(get_db)
) -> Ingredient:
    ingredient = db.query(Ingredient).filter(Ingredient.id == ingredient_id).first()
    if not ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(ingredient, field, value)
    db.commit()
    db.refresh(ingredient)
    return ingredient


@router.delete("/{ingredient_id}", status_code=204)
def delete_ingredient(
    ingredient_id: str,
    db: Session = Depends(get_db)
) -> None:
    ingredient = db.query(Ingredient).filter(Ingredient.id == ingredient_id).first()
    if not ingredient:
        raise HTTPException(status_code=404, detail="Ingredient not found")
    db.delete(ingredient)
    db.commit()
