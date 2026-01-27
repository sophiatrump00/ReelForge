from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel
from typing import List
import csv
import io
import os
from datetime import datetime

router = APIRouter()

class ReportRequest(BaseModel):
    date_range: List[str]
    content: List[str]
    format: str

@router.post("/generate")
def generate_report(request: ReportRequest):
    """
    Generate a report. Currently supports CSV/Excel of system files.
    """
    if request.format not in ['csv', 'xlsx']:
        # For simplify we treat xlsx as csv for now or just error
        # But let's return CSV content type effectively
        pass

    # Real data: Scan files
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['Filename', 'Type', 'Size', 'Path'])
    
    data_root = "/app/data"
    for root, dirs, files in os.walk(data_root):
        for name in files:
            path = os.path.join(root, name)
            size = os.path.getsize(path)
            writer.writerow([name, 'File', size, path])
            
    # Send as file download
    response = Response(content=output.getvalue(), media_type="text/csv")
    response.headers["Content-Disposition"] = f"attachment; filename=report_{datetime.now().strftime('%Y%m%d')}.csv"
    return response
