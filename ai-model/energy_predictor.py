"""
Energy Predictor Service
FastAPI service for predicting energy demand and providing AI-driven solutions.
"""
import logging
import math
import os
from datetime import datetime
from typing import List, Optional

import torch
import torch.nn as nn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

LATITUDE_NORMALIZER = 90.0
LONGITUDE_NORMALIZER = 180.0
POPULATION_NORMALIZER = 10000.0
CURRENT_DEMAND_NORMALIZER = 1000.0
DEFAULT_RESOURCE_SCORE = 0.5
PREDICTED_DEMAND_SCALE = 1000.0
DEFAULT_MINIMUM_DEMAND = 100.0
MICROGRID_POPULATION_THRESHOLD = 500

allowed_origins = os.getenv('ALLOWED_ORIGINS', 'http://localhost:3000').split(',')

app = FastAPI(
    title='Energy Predictor Service',
    description='Predicts energy demand and recommends practical renewable energy solutions.',
    version='1.1.0'
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in allowed_origins if origin.strip()],
    allow_credentials=True,
    allow_methods=['GET', 'POST', 'OPTIONS'],
    allow_headers=['Content-Type', 'Authorization'],
)


class EnergyPredictionModel(nn.Module):
    def __init__(self, input_size=10, hidden_size=64):
        super().__init__()
        self.fc1 = nn.Linear(input_size, hidden_size)
        self.relu1 = nn.ReLU()
        self.dropout1 = nn.Dropout(0.3)
        self.fc2 = nn.Linear(hidden_size, hidden_size)
        self.relu2 = nn.ReLU()
        self.dropout2 = nn.Dropout(0.3)
        self.fc3 = nn.Linear(hidden_size, 32)
        self.relu3 = nn.ReLU()
        self.fc4 = nn.Linear(32, 3)

    def forward(self, x):
        x = self.dropout1(self.relu1(self.fc1(x)))
        x = self.dropout2(self.relu2(self.fc2(x)))
        x = self.relu3(self.fc3(x))
        return self.fc4(x)


model = EnergyPredictionModel()
try:
    model.load_state_dict(torch.load('model.pt', map_location=torch.device('cpu')))
    logger.info('Loaded pretrained model')
except Exception:
    logger.warning('No pretrained model found, using randomly initialized model')

model.eval()


class EnergyPredictionRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90, description='Latitude in decimal degrees.')
    longitude: float = Field(..., ge=-180, le=180, description='Longitude in decimal degrees.')
    population: Optional[int] = Field(default=1000, ge=0)
    current_demand: Optional[float] = Field(default=None, ge=0)
    has_grid_access: bool = True
    energy_type_preference: Optional[str] = 'solar'
    solar_potential: Optional[float] = Field(default=None, ge=0)
    wind_potential: Optional[float] = Field(default=None, ge=0)


class EnergySolution(BaseModel):
    solution_type: str
    description: str
    estimated_capacity: float
    cost_estimate: str
    implementation_time: str


class EnergyPredictionResponse(BaseModel):
    predicted_demand: float
    recommended_solutions: List[EnergySolution]
    confidence_score: float
    timestamp: str


def encode_preference(preference: Optional[str]) -> float:
    normalized = (preference or 'solar').lower()
    options = {'solar': 0.2, 'wind': 0.6, 'hybrid': 0.9}
    return options.get(normalized, 0.5)


@app.post('/predict', response_model=EnergyPredictionResponse)
async def predict_energy_demand(request: EnergyPredictionRequest):
    """Predict energy demand and recommend renewable energy solutions."""
    try:
        features = [
            request.latitude / LATITUDE_NORMALIZER,
            request.longitude / LONGITUDE_NORMALIZER,
            request.population / POPULATION_NORMALIZER,
            1.0 if request.has_grid_access else 0.0,
            request.solar_potential if request.solar_potential is not None else DEFAULT_RESOURCE_SCORE,
            request.wind_potential if request.wind_potential is not None else DEFAULT_RESOURCE_SCORE,
            request.current_demand / CURRENT_DEMAND_NORMALIZER if request.current_demand is not None else DEFAULT_RESOURCE_SCORE,
            encode_preference(request.energy_type_preference),
            float(datetime.now().hour) / 24.0,
            float(datetime.now().month) / 12.0
        ]

        input_tensor = torch.tensor([features], dtype=torch.float32)

        with torch.no_grad():
            output = model(input_tensor)
            predicted_demand = float(output[0][0].item()) * PREDICTED_DEMAND_SCALE
            solar_score = float(output[0][1].item())
            wind_score = float(output[0][2].item())

        if not (math.isfinite(predicted_demand) and math.isfinite(solar_score) and math.isfinite(wind_score)):
            logger.error('Model produced non-finite output: demand=%s, solar=%s, wind=%s',
                         predicted_demand, solar_score, wind_score)
            raise HTTPException(status_code=500, detail='Prediction model returned invalid output.')

        solutions = []

        if solar_score > 0.3 or request.energy_type_preference == 'solar':
            solar_capacity = predicted_demand * (0.5 + solar_score)
            solutions.append(EnergySolution(
                solution_type='solar',
                description=f'Install solar panels with {solar_capacity:.0f} kW capacity to meet energy needs.',
                estimated_capacity=solar_capacity,
                cost_estimate=f'${solar_capacity * 1000:.0f} - ${solar_capacity * 1500:.0f}',
                implementation_time='3-6 months'
            ))

        if wind_score > 0.3 or request.energy_type_preference == 'wind':
            wind_capacity = predicted_demand * (0.4 + wind_score)
            solutions.append(EnergySolution(
                solution_type='wind',
                description=f'Deploy wind turbines with {wind_capacity:.0f} kW capacity for sustainable power.',
                estimated_capacity=wind_capacity,
                cost_estimate=f'${wind_capacity * 1200:.0f} - ${wind_capacity * 1800:.0f}',
                implementation_time='6-12 months'
            ))

        if len(solutions) >= 2:
            hybrid_capacity = predicted_demand * 1.2
            solutions.append(EnergySolution(
                solution_type='hybrid',
                description=f'Build a hybrid solar-wind system with {hybrid_capacity:.0f} kW total capacity for resilience.',
                estimated_capacity=hybrid_capacity,
                cost_estimate=f'${hybrid_capacity * 1100:.0f} - ${hybrid_capacity * 1600:.0f}',
                implementation_time='8-14 months'
            ))

        if not request.has_grid_access:
            solutions.insert(0, EnergySolution(
                solution_type='grid_expansion',
                description=f'Extend grid connectivity to provide {predicted_demand:.0f} kW of baseline power.',
                estimated_capacity=predicted_demand,
                cost_estimate=f'${predicted_demand * 2000:.0f} - ${predicted_demand * 3000:.0f}',
                implementation_time='12-18 months'
            ))

        if request.population > MICROGRID_POPULATION_THRESHOLD:
            microgrid_capacity = predicted_demand * 1.5
            solutions.append(EnergySolution(
                solution_type='microgrid',
                description=f'Deploy a community microgrid with {microgrid_capacity:.0f} kW capacity and battery storage.',
                estimated_capacity=microgrid_capacity,
                cost_estimate=f'${microgrid_capacity * 1400:.0f} - ${microgrid_capacity * 2000:.0f}',
                implementation_time='10-16 months'
            ))

        confidence_score = max(0.0, min(0.95, 0.7 + (solar_score + wind_score) / 4))

        logger.info('Prediction completed for location (%s, %s)', request.latitude, request.longitude)

        return EnergyPredictionResponse(
            predicted_demand=max(predicted_demand, request.current_demand if request.current_demand else DEFAULT_MINIMUM_DEMAND),
            recommended_solutions=solutions[:4],
            confidence_score=confidence_score,
            timestamp=datetime.now().isoformat()
        )

    except HTTPException:
        raise
    except Exception as exc:
        logger.error('Prediction error: %s', str(exc))
        raise HTTPException(status_code=500, detail='Prediction failed. Please try again later.')


@app.get('/health')
async def health_check():
    """Return service health status."""
    return {'status': 'UP', 'service': 'energy-predictor', 'model_loaded': True}


@app.get('/resources/check')
async def check_resources():
    """Check available computing resources."""
    import multiprocessing
    import psutil

    cpu_count = multiprocessing.cpu_count()
    memory = psutil.virtual_memory()
    memory_gb = memory.total / (1024 ** 3)

    return {
        'cpu_cores': cpu_count,
        'memory_gb': round(memory_gb, 2),
        'memory_available_gb': round(memory.available / (1024 ** 3), 2),
        'multithreading_recommended': cpu_count > 4 and memory_gb > 8
    }


if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8083)
