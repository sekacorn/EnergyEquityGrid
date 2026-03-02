"""
Test suite for Energy Predictor AI Service
Tests energy demand predictions and MBTI-tailored recommendations
"""
import pytest
from fastapi.testclient import TestClient
from ai_model.energy_predictor import app

client = TestClient(app)


class TestEnergyPredictor:
    """Test energy prediction functionality"""

    def test_health_check(self):
        """Test health endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "UP"
        assert response.json()["service"] == "energy-predictor"

    def test_predict_energy_demand_solar(self):
        """Test energy prediction for solar preference"""
        payload = {
            "latitude": 40.7128,
            "longitude": -74.0060,
            "population": 5000,
            "has_grid_access": True,
            "energy_type_preference": "solar",
            "mbti_type": "ENTJ"
        }

        response = client.post("/predict", json=payload)
        assert response.status_code == 200

        data = response.json()
        assert "predicted_demand" in data
        assert "recommended_solutions" in data
        assert "confidence_score" in data
        assert data["predicted_demand"] > 0
        assert len(data["recommended_solutions"]) > 0
        assert 0 < data["confidence_score"] <= 1

    def test_predict_energy_demand_wind(self):
        """Test energy prediction for wind preference"""
        payload = {
            "latitude": 51.5074,
            "longitude": -0.1278,
            "population": 10000,
            "has_grid_access": False,
            "energy_type_preference": "wind",
            "mbti_type": "INFP"
        }

        response = client.post("/predict", json=payload)
        assert response.status_code == 200

        data = response.json()
        assert "predicted_demand" in data
        assert "recommended_solutions" in data

        # Check for grid expansion recommendation when no grid access
        solutions = data["recommended_solutions"]
        solution_types = [s["solution_type"] for s in solutions]
        assert "grid_expansion" in solution_types or "microgrid" in solution_types

    def test_predict_mbti_tailored_advice(self):
        """Test that MBTI-tailored advice is included"""
        mbti_types = ["ENTJ", "INFP", "INFJ", "ESTP", "INTJ"]

        for mbti in mbti_types:
            payload = {
                "latitude": 35.6762,
                "longitude": 139.6503,
                "population": 1000,
                "has_grid_access": True,
                "energy_type_preference": "solar",
                "mbti_type": mbti
            }

            response = client.post("/predict", json=payload)
            assert response.status_code == 200

            data = response.json()
            solutions = data["recommended_solutions"]

            for solution in solutions:
                assert "mbti_tailored_advice" in solution
                assert mbti in solution["mbti_tailored_advice"] or \
                       mbti.lower() in solution["mbti_tailored_advice"].lower()

    def test_predict_large_population(self):
        """Test prediction for large population (should recommend microgrid)"""
        payload = {
            "latitude": 40.7128,
            "longitude": -74.0060,
            "population": 50000,
            "has_grid_access": True,
            "energy_type_preference": "hybrid",
            "mbti_type": "ENFJ"
        }

        response = client.post("/predict", json=payload)
        assert response.status_code == 200

        data = response.json()
        solutions = data["recommended_solutions"]
        solution_types = [s["solution_type"] for s in solutions]

        # Large population should get microgrid recommendation
        assert "microgrid" in solution_types

    def test_predict_missing_optional_fields(self):
        """Test prediction with only required fields"""
        payload = {
            "latitude": 34.0522,
            "longitude": -118.2437
        }

        response = client.post("/predict", json=payload)
        assert response.status_code == 200

        data = response.json()
        assert "predicted_demand" in data
        assert data["predicted_demand"] > 0

    def test_predict_invalid_coordinates(self):
        """Test prediction with invalid coordinates"""
        payload = {
            "latitude": 200.0,  # Invalid latitude
            "longitude": 300.0,  # Invalid longitude
            "population": 1000
        }

        response = client.post("/predict", json=payload)
        # Should still process but may give unexpected results
        # In production, validation should catch this
        assert response.status_code in [200, 422]

    def test_resources_check(self):
        """Test computing resources check endpoint"""
        response = client.get("/resources/check")
        assert response.status_code == 200

        data = response.json()
        assert "cpu_cores" in data
        assert "memory_gb" in data
        assert "memory_available_gb" in data
        assert "multithreading_recommended" in data
        assert isinstance(data["cpu_cores"], int)
        assert isinstance(data["memory_gb"], float)

    def test_solution_capacity_estimates(self):
        """Test that solution capacity estimates are reasonable"""
        payload = {
            "latitude": 40.7128,
            "longitude": -74.0060,
            "population": 5000,
            "current_demand": 1000,
            "energy_type_preference": "solar",
            "mbti_type": "ISTJ"
        }

        response = client.post("/predict", json=payload)
        assert response.status_code == 200

        data = response.json()
        predicted_demand = data["predicted_demand"]
        solutions = data["recommended_solutions"]

        for solution in solutions:
            # Capacity should be related to demand
            assert solution["estimated_capacity"] > 0
            # Cost estimates should exist
            assert "$" in solution["cost_estimate"]
            # Implementation time should be specified
            assert "month" in solution["implementation_time"].lower()


class TestMBTIPersonalization:
    """Test MBTI personality-based customization"""

    def test_entj_strategic_focus(self):
        """Test ENTJ gets strategic, results-focused advice"""
        payload = {
            "latitude": 40.7128,
            "longitude": -74.0060,
            "population": 1000,
            "mbti_type": "ENTJ"
        }

        response = client.post("/predict", json=payload)
        data = response.json()
        solutions = data["recommended_solutions"]

        # ENTJ advice should mention strategy, efficiency, or leadership
        for solution in solutions:
            advice = solution["mbti_tailored_advice"].lower()
            assert any(word in advice for word in ["strategic", "efficiency", "leadership", "results"])

    def test_infp_creative_focus(self):
        """Test INFP gets creative, values-driven advice"""
        payload = {
            "latitude": 40.7128,
            "longitude": -74.0060,
            "population": 1000,
            "mbti_type": "INFP"
        }

        response = client.post("/predict", json=payload)
        data = response.json()
        solutions = data["recommended_solutions"]

        # INFP advice should mention values, creativity, or sustainability
        for solution in solutions:
            advice = solution["mbti_tailored_advice"].lower()
            assert any(word in advice for word in ["values", "creative", "sustainability", "sustainable"])


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
