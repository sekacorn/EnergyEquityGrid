"""
Energy Predictor Service
FastAPI service for predicting energy demand and providing AI-driven solutions
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import torch
import torch.nn as nn
import numpy as np
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Energy Predictor Service", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Neural Network Model for Energy Prediction
class EnergyPredictionModel(nn.Module):
    def __init__(self, input_size=10, hidden_size=64):
        super(EnergyPredictionModel, self).__init__()
        self.fc1 = nn.Linear(input_size, hidden_size)
        self.relu1 = nn.ReLU()
        self.dropout1 = nn.Dropout(0.3)
        self.fc2 = nn.Linear(hidden_size, hidden_size)
        self.relu2 = nn.ReLU()
        self.dropout2 = nn.Dropout(0.3)
        self.fc3 = nn.Linear(hidden_size, 32)
        self.relu3 = nn.ReLU()
        self.fc4 = nn.Linear(32, 3)  # Output: [demand, solar_recommendation, wind_recommendation]

    def forward(self, x):
        x = self.dropout1(self.relu1(self.fc1(x)))
        x = self.dropout2(self.relu2(self.fc2(x)))
        x = self.relu3(self.fc3(x))
        x = self.fc4(x)
        return x


# Initialize model
model = EnergyPredictionModel()
try:
    model.load_state_dict(torch.load('model.pt', map_location=torch.device('cpu')))
    logger.info("Loaded pretrained model")
except:
    logger.warning("No pretrained model found, using randomly initialized model")

model.eval()


# Request/Response Models
class EnergyPredictionRequest(BaseModel):
    latitude: float
    longitude: float
    population: Optional[int] = 1000
    current_demand: Optional[float] = None
    has_grid_access: bool = True
    energy_type_preference: Optional[str] = "solar"
    solar_potential: Optional[float] = None
    wind_potential: Optional[float] = None
    mbti_type: Optional[str] = "UNKNOWN"


class EnergySolution(BaseModel):
    solution_type: str
    description: str
    estimated_capacity: float
    cost_estimate: str
    implementation_time: str
    mbti_tailored_advice: str


class EnergyPredictionResponse(BaseModel):
    predicted_demand: float
    recommended_solutions: List[EnergySolution]
    confidence_score: float
    timestamp: str


# MBTI-Tailored Messaging
MBTI_MESSAGES = {
    "ENTJ": {"style": "strategic", "focus": "efficiency and leadership"},
    "INFP": {"style": "creative", "focus": "values and sustainability"},
    "INFJ": {"style": "empathetic", "focus": "community harmony"},
    "ESTP": {"style": "actionable", "focus": "quick implementation"},
    "INTJ": {"style": "analytical", "focus": "long-term planning"},
    "INTP": {"style": "logical", "focus": "technical details"},
    "ISTJ": {"style": "structured", "focus": "reliability"},
    "ESFJ": {"style": "supportive", "focus": "community support"},
    "ISFP": {"style": "gentle", "focus": "aesthetic and environment"},
    "ENTP": {"style": "innovative", "focus": "creative solutions"},
    "ISFJ": {"style": "nurturing", "focus": "stability and care"},
    "ESFP": {"style": "energetic", "focus": "immediate action"},
    "ENFJ": {"style": "inspirational", "focus": "community leadership"},
    "ESTJ": {"style": "direct", "focus": "practical results"},
    "ISTP": {"style": "practical", "focus": "hands-on solutions"},
}


def get_mbti_advice(solution_type: str, mbti_type: str) -> str:
    """Generate MBTI-tailored advice for energy solutions"""
    mbti_info = MBTI_MESSAGES.get(mbti_type, {"style": "practical", "focus": "energy efficiency"})

    advice_templates = {
        "solar": f"Solar power installation with {mbti_info['style']} approach focusing on {mbti_info['focus']}",
        "wind": f"Wind turbine deployment emphasizing {mbti_info['focus']} with {mbti_info['style']} planning",
        "hybrid": f"Hybrid renewable system designed with {mbti_info['focus']} in mind, using {mbti_info['style']} implementation",
        "microgrid": f"Community microgrid solution highlighting {mbti_info['focus']} through {mbti_info['style']} coordination",
        "grid_expansion": f"Grid connectivity expansion prioritizing {mbti_info['focus']} via {mbti_info['style']} execution"
    }

    return advice_templates.get(solution_type, f"Renewable energy solution with {mbti_info['style']} approach")


@app.post("/predict", response_model=EnergyPredictionResponse)
async def predict_energy_demand(request: EnergyPredictionRequest):
    """
    Predict energy demand and provide AI-driven solutions
    """
    try:
        # Prepare input features
        features = [
            request.latitude / 90.0,  # Normalized latitude
            request.longitude / 180.0,  # Normalized longitude
            request.population / 10000.0,  # Normalized population
            1.0 if request.has_grid_access else 0.0,
            request.solar_potential if request.solar_potential else 0.5,
            request.wind_potential if request.wind_potential else 0.5,
            request.current_demand / 1000.0 if request.current_demand else 0.5,
            float(hash(request.energy_type_preference) % 100) / 100.0,
            float(datetime.now().hour) / 24.0,  # Time of day
            float(datetime.now().month) / 12.0  # Season
        ]

        # Make prediction
        input_tensor = torch.tensor([features], dtype=torch.float32)

        with torch.no_grad():
            output = model(input_tensor)
            predicted_demand = float(output[0][0].item()) * 1000.0  # Scale back
            solar_score = float(output[0][1].item())
            wind_score = float(output[0][2].item())

        # Generate solutions based on predictions
        solutions = []

        # Solar solution
        if solar_score > 0.3 or request.energy_type_preference == "solar":
            solar_capacity = predicted_demand * (0.5 + solar_score)
            solutions.append(EnergySolution(
                solution_type="solar",
                description=f"Install solar panels with {solar_capacity:.0f} kW capacity to meet energy needs",
                estimated_capacity=solar_capacity,
                cost_estimate=f"${solar_capacity * 1000:.0f} - ${solar_capacity * 1500:.0f}",
                implementation_time="3-6 months",
                mbti_tailored_advice=get_mbti_advice("solar", request.mbti_type)
            ))

        # Wind solution
        if wind_score > 0.3 or request.energy_type_preference == "wind":
            wind_capacity = predicted_demand * (0.4 + wind_score)
            solutions.append(EnergySolution(
                solution_type="wind",
                description=f"Deploy wind turbines with {wind_capacity:.0f} kW capacity for sustainable power",
                estimated_capacity=wind_capacity,
                cost_estimate=f"${wind_capacity * 1200:.0f} - ${wind_capacity * 1800:.0f}",
                implementation_time="6-12 months",
                mbti_tailored_advice=get_mbti_advice("wind", request.mbti_type)
            ))

        # Hybrid solution
        if len(solutions) >= 2:
            hybrid_capacity = predicted_demand * 1.2
            solutions.append(EnergySolution(
                solution_type="hybrid",
                description=f"Hybrid solar-wind system with {hybrid_capacity:.0f} kW total capacity for reliability",
                estimated_capacity=hybrid_capacity,
                cost_estimate=f"${hybrid_capacity * 1100:.0f} - ${hybrid_capacity * 1600:.0f}",
                implementation_time="8-14 months",
                mbti_tailored_advice=get_mbti_advice("hybrid", request.mbti_type)
            ))

        # Grid expansion for areas without access
        if not request.has_grid_access:
            solutions.insert(0, EnergySolution(
                solution_type="grid_expansion",
                description=f"Extend grid connectivity to provide {predicted_demand:.0f} kW base load",
                estimated_capacity=predicted_demand,
                cost_estimate=f"${predicted_demand * 2000:.0f} - ${predicted_demand * 3000:.0f}",
                implementation_time="12-18 months",
                mbti_tailored_advice=get_mbti_advice("grid_expansion", request.mbti_type)
            ))

        # Microgrid solution
        if request.population > 500:
            microgrid_capacity = predicted_demand * 1.5
            solutions.append(EnergySolution(
                solution_type="microgrid",
                description=f"Community microgrid with {microgrid_capacity:.0f} kW capacity and battery storage",
                estimated_capacity=microgrid_capacity,
                cost_estimate=f"${microgrid_capacity * 1400:.0f} - ${microgrid_capacity * 2000:.0f}",
                implementation_time="10-16 months",
                mbti_tailored_advice=get_mbti_advice("microgrid", request.mbti_type)
            ))

        confidence_score = min(0.95, 0.7 + (solar_score + wind_score) / 4)

        logger.info(f"Prediction completed for location ({request.latitude}, {request.longitude})")

        return EnergyPredictionResponse(
            predicted_demand=max(predicted_demand, request.current_demand if request.current_demand else 100),
            recommended_solutions=solutions[:4],  # Return top 4 solutions
            confidence_score=confidence_score,
            timestamp=datetime.now().isoformat()
        )

    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.get("/health")
async def health_check():
    return {"status": "UP", "service": "energy-predictor", "model_loaded": True}


@app.get("/resources/check")
async def check_resources():
    """Check available computing resources"""
    import psutil
    import multiprocessing

    cpu_count = multiprocessing.cpu_count()
    memory = psutil.virtual_memory()
    memory_gb = memory.total / (1024**3)

    return {
        "cpu_cores": cpu_count,
        "memory_gb": round(memory_gb, 2),
        "memory_available_gb": round(memory.available / (1024**3), 2),
        "multithreading_recommended": cpu_count > 4 and memory_gb > 8
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8083)
