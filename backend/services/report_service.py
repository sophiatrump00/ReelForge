import csv
import io
from typing import List, Dict
from datetime import datetime

class ReportService:
    def generate_csv_report(self, materials: List[Dict]) -> str:
        """
        Generate CSV string from materials data.
        """
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Header
        writer.writerow(['ID', 'Filename', 'Status', 'Score', 'Tags', 'Created At'])
        
        # Rows
        for m in materials:
            writer.writerow([
                m.get('id'),
                m.get('filename'),
                m.get('status'),
                m.get('ai_score'),
                ",".join(m.get('ai_tags', []) or []),
                m.get('created_at')
            ])
            
        return output.getvalue()
