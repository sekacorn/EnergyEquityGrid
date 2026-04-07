"""
End-to-end style tests for local service modules.
"""
import math
from pathlib import Path
import sys

import torch

sys.path.append(str(Path(__file__).resolve().parents[2] / 'ai-model'))

from energy_predictor import EnergyPredictionModel, encode_preference  # noqa: E402
from llm_service import ENERGY_KNOWLEDGE, generate_response  # noqa: E402


def test_ai_model_initialization():
    model = EnergyPredictionModel()
    assert model is not None


def test_ai_model_forward_pass():
    model = EnergyPredictionModel()
    model.eval()
    input_data = torch.randn(1, 10)

    with torch.no_grad():
        output = model(input_data)

    assert output.shape == (1, 3)


def test_energy_knowledge_topics_present():
    required_topics = ['solar', 'wind', 'microgrid', 'grid_expansion']
    for topic in required_topics:
        assert topic in ENERGY_KNOWLEDGE


def test_llm_response_generation():
    response, suggestions = generate_response('How can I use solar energy?')
    assert 'solar' in response.lower()
    assert isinstance(suggestions, list)
    assert len(suggestions) > 0


def test_end_to_end_prediction_flow():
    model = EnergyPredictionModel()
    model.eval()

    features = [
        40.7128 / 90.0,
        -74.0060 / 180.0,
        5000 / 10000.0,
        1.0,
        0.8,
        0.6,
        500 / 1000.0,
        encode_preference('solar'),
        12 / 24.0,
        6 / 12.0
    ]

    input_tensor = torch.tensor([features], dtype=torch.float32)

    with torch.no_grad():
        output = model(input_tensor)

    predicted_demand = float(output[0][0].item()) * 1000.0
    assert math.isfinite(predicted_demand), f'Expected finite predicted_demand, got {predicted_demand}'
    assert predicted_demand != 0, 'Predicted demand should not be exactly zero'
