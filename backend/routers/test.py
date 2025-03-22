from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter()

@router.get('/test')
async def test_connection():
    return JSONResponse(
        status_code=200,
        content={"status": "alive", "message": "Backend service is running"}
    )