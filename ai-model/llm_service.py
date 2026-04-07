"""
LLM Service for natural language energy guidance.
"""
import logging
import os
from datetime import datetime
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

allowed_origins = os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000').split(',')

app = FastAPI(
    title='LLM Service',
    description='Provides natural language guidance for energy planning and troubleshooting.',
    version='1.1.0'
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in allowed_origins if origin.strip()],
    allow_credentials=True,
    allow_methods=['GET', 'POST', 'OPTIONS'],
    allow_headers=['Content-Type', 'Authorization'],
)


class QueryRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=5000, description='The user query text.')
    context: Optional[dict] = None
    user_role: Optional[str] = 'USER'


class QueryResponse(BaseModel):
    response: str
    suggestions: List[str]
    timestamp: str


ENERGY_KNOWLEDGE = {
    'solar': {
        'description': 'Solar energy harnesses sunlight using photovoltaic panels.',
        'benefits': ['Renewable', 'Low maintenance', 'Scalable', 'Silent operation'],
        'considerations': ['Weather dependent', 'Initial cost', 'Space requirements'],
        'best_for': 'Areas with high sunlight exposure.'
    },
    'wind': {
        'description': 'Wind energy converts wind kinetic energy into electricity.',
        'benefits': ['Renewable', 'Land efficient', 'Cost-effective at scale'],
        'considerations': ['Wind variability', 'Noise', 'Visual impact'],
        'best_for': 'Coastal and open areas with consistent wind.'
    },
    'microgrid': {
        'description': 'Microgrids are localized energy systems that can operate independently.',
        'benefits': ['Energy independence', 'Resilience', 'Community control'],
        'considerations': ['Initial setup cost', 'Management complexity'],
        'best_for': 'Communities seeking energy autonomy.'
    },
    'grid_expansion': {
        'description': 'Grid expansion extends existing power infrastructure into new areas.',
        'benefits': ['Reliable power', 'Established infrastructure', 'Grid stability'],
        'considerations': ['High cost', 'Long implementation', 'Dependency on central utilities'],
        'best_for': 'Areas near existing grid infrastructure.'
    }
}


def detect_topic(query: str) -> str:
    lowered = query.lower()
    if 'solar' in lowered:
        return 'solar'
    if 'wind' in lowered:
        return 'wind'
    if 'microgrid' in lowered:
        return 'microgrid'
    if 'grid' in lowered:
        return 'grid_expansion'
    return 'general'


def generate_response(query: str) -> tuple[str, list[str]]:
    topic = detect_topic(query)

    if topic in ENERGY_KNOWLEDGE:
        info = ENERGY_KNOWLEDGE[topic]
        response = (
            f"**Overview:** {info['description']} "
            f"Benefits include {', '.join(info['benefits'])}. "
            f"Key considerations are {', '.join(info['considerations'])}. "
            f"This option is usually best for {info['best_for']}"
        )
        suggestions = [
            'Compare site-specific costs and benefits',
            'Review local infrastructure constraints',
            'Plan a phased implementation approach'
        ]
        return response, suggestions

    response = (
        'EnergyEquityGrid helps teams upload data, explore energy opportunities in 3D, '
        'generate AI-assisted recommendations, and troubleshoot planning issues. '
        'Ask about solar, wind, microgrids, grid access, or data preparation for a more specific answer.'
    )
    suggestions = [
        'Ask about solar for a home or community',
        'Compare wind and microgrid options',
        'Request help with data uploads or prediction errors'
    ]
    return response, suggestions


@app.post('/query', response_model=QueryResponse)
async def process_query(request: QueryRequest):
    """Process a natural language query about energy planning."""
    try:
        logger.info('Processing query: %s', request.query[:50])
        response, suggestions = generate_response(request.query)
        return QueryResponse(
            response=response,
            suggestions=suggestions,
            timestamp=datetime.now().isoformat()
        )
    except Exception as exc:
        logger.error('Query processing error: %s', str(exc))
        raise HTTPException(status_code=500, detail='Query processing failed. Please try again later.')


@app.post('/troubleshoot')
async def troubleshoot(request: QueryRequest):
    """Provide troubleshooting assistance for common workflow issues."""
    try:
        query_lower = request.query.lower()

        if 'upload' in query_lower or 'import' in query_lower:
            issue_type = 'data_upload'
            solution = (
                '**Troubleshooting:** Ensure your file is CSV, JSON, or GeoJSON, includes required '
                'fields such as latitude and longitude where appropriate, and stays under the size limit.'
            )
        elif 'visualization' in query_lower or '3d' in query_lower or 'slow' in query_lower:
            issue_type = 'visualization'
            solution = (
                '**Troubleshooting:** Reduce the number of rendered points, close other heavy browser tabs, '
                'and verify that hardware acceleration is enabled for best WebGL performance.'
            )
        elif 'predict' in query_lower or 'ai' in query_lower:
            issue_type = 'prediction'
            solution = (
                '**Troubleshooting:** Check that latitude and longitude are valid, confirm the prediction '
                'service is running, and retry with a smaller, well-formed request body.'
            )
        else:
            issue_type = 'general'
            solution = (
                '**Troubleshooting:** Provide more detail about the step that failed, the data involved, '
                'and any visible error message so the issue can be narrowed down.'
            )

        return {
            'issue_type': issue_type,
            'solution': solution,
            'next_steps': [
                'Check application logs.',
                'Verify data format and required fields.',
                'Retry with a smaller dataset or simpler request.',
                'Contact support if the issue persists.'
            ],
            'timestamp': datetime.now().isoformat()
        }
    except Exception as exc:
        logger.error('Troubleshooting error: %s', str(exc))
        raise HTTPException(status_code=500, detail='Troubleshooting failed. Please try again later.')


@app.get('/health')
async def health_check():
    """Return service health status."""
    return {'status': 'UP', 'service': 'llm-service'}


if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8084)
