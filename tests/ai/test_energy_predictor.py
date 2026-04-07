"""
Test suite for Energy Predictor AI Service.
"""
from pathlib import Path
import sys

from fastapi.testclient import TestClient

sys.path.append(str(Path(__file__).resolve().parents[2] / 'ai-model'))

from energy_predictor import app  # noqa: E402

client = TestClient(app)


class TestEnergyPredictor:
    def test_health_check(self):
        response = client.get('/health')
        assert response.status_code == 200
        assert response.json()['status'] == 'UP'
        assert response.json()['service'] == 'energy-predictor'

    def test_predict_energy_demand_solar(self):
        payload = {
            'latitude': 40.7128,
            'longitude': -74.0060,
            'population': 5000,
            'has_grid_access': True,
            'energy_type_preference': 'solar'
        }

        response = client.post('/predict', json=payload)
        assert response.status_code == 200

        data = response.json()
        assert 'predicted_demand' in data
        assert 'recommended_solutions' in data
        assert 'confidence_score' in data
        assert data['predicted_demand'] > 0
        assert len(data['recommended_solutions']) > 0
        assert 0 < data['confidence_score'] <= 1

    def test_predict_energy_demand_wind_without_grid(self):
        payload = {
            'latitude': 51.5074,
            'longitude': -0.1278,
            'population': 10000,
            'has_grid_access': False,
            'energy_type_preference': 'wind'
        }

        response = client.post('/predict', json=payload)
        assert response.status_code == 200

        solution_types = [s['solution_type'] for s in response.json()['recommended_solutions']]
        assert 'grid_expansion' in solution_types or 'microgrid' in solution_types

    def test_predict_large_population_recommends_microgrid(self):
        payload = {
            'latitude': 40.7128,
            'longitude': -74.0060,
            'population': 50000,
            'has_grid_access': True,
            'energy_type_preference': 'hybrid'
        }

        response = client.post('/predict', json=payload)
        assert response.status_code == 200
        solution_types = [s['solution_type'] for s in response.json()['recommended_solutions']]
        assert 'microgrid' in solution_types

    def test_predict_invalid_coordinates_returns_422(self):
        payload = {
            'latitude': 200.0,
            'longitude': 300.0,
            'population': 1000
        }

        response = client.post('/predict', json=payload)
        assert response.status_code == 422

    def test_solution_capacity_estimates(self):
        payload = {
            'latitude': 40.7128,
            'longitude': -74.0060,
            'population': 5000,
            'current_demand': 1000,
            'energy_type_preference': 'solar'
        }

        response = client.post('/predict', json=payload)
        assert response.status_code == 200

        for solution in response.json()['recommended_solutions']:
            assert solution['estimated_capacity'] > 0
            assert '$' in solution['cost_estimate']
            assert 'month' in solution['implementation_time'].lower()
