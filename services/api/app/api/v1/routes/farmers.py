"""Farmer records (PRD F1).

Exists because the farm creation flow needs a real farmer to attach a farm to.
The previous client hardcoded a non-existent ObjectId on every farm it created
(audit B12).
"""

from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import require_database
from app.models.documents import Farmer
from app.schemas.farmers import FarmerCreate

router = APIRouter(dependencies=[Depends(require_database)])


@router.post("", status_code=201)
async def create_farmer(payload: FarmerCreate) -> Farmer:
    farmer = Farmer(**payload.model_dump())
    await farmer.insert()
    return farmer


@router.get("/{farmer_id}")
async def read_farmer(farmer_id: PydanticObjectId) -> Farmer:
    farmer = await Farmer.get(farmer_id)
    if farmer is None:
        raise HTTPException(404, "Farmer not found")
    return farmer


@router.get("/{farmer_id}/farms")
async def read_farmer_farms(farmer_id: PydanticObjectId) -> list:
    from app.models.documents import Farm

    return await Farm.find(Farm.farmer_id == str(farmer_id)).to_list()
