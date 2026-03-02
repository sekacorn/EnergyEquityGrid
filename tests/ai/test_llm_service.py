"""
Test suite for LLM Service
Tests natural language queries and MBTI-tailored responses
"""
import pytest
from fastapi.testclient import TestClient
from ai_model.llm_service import app

client = TestClient(app)


class TestLLMService:
    """Test LLM query processing"""

    def test_health_check(self):
        """Test health endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "UP"

    def test_query_solar_entj(self):
        """Test solar energy query with ENTJ personality"""
        payload = {
            "query": "How can I power my home with solar?",
            "mbti_type": "ENTJ"
        }

        response = client.post("/query", json=payload)
        assert response.status_code == 200

        data = response.json()
        assert "response" in data
        assert "suggestions" in data
        assert data["mbti_tailored"] is True
        assert len(data["response"]) > 0
        assert "solar" in data["response"].lower()

    def test_query_wind_infp(self):
        """Test wind energy query with INFP personality"""
        payload = {
            "query": "Tell me about wind energy for my community",
            "mbti_type": "INFP"
        }

        response = client.post("/query", json=payload)
        assert response.status_code == 200

        data = response.json()
        assert "wind" in data["response"].lower()
        # INFP should get creative, value-driven response
        assert any(word in data["response"].lower() for word in ["creative", "values", "sustainable"])

    def test_query_microgrid(self):
        """Test microgrid query"""
        payload = {
            "query": "What is a microgrid?",
            "mbti_type": "INTJ"
        }

        response = client.post("/query", json=payload)
        assert response.status_code == 200

        data = response.json()
        assert "microgrid" in data["response"].lower()
        assert len(data["suggestions"]) > 0

    def test_query_general_unknown_mbti(self):
        """Test general query with unknown MBTI type"""
        payload = {
            "query": "How does EnergyEquityGrid work?",
            "mbti_type": "UNKNOWN"
        }

        response = client.post("/query", json=payload)
        assert response.status_code == 200

        data = response.json()
        assert "energyequitygrid" in data["response"].lower()
        assert "suggestions" in data

    def test_query_provides_suggestions(self):
        """Test that queries return actionable suggestions"""
        payload = {
            "query": "I want to use solar power",
            "mbti_type": "ESTP"
        }

        response = client.post("/query", json=payload)
        assert response.status_code == 200

        data = response.json()
        assert isinstance(data["suggestions"], list)
        assert len(data["suggestions"]) > 0

    def test_troubleshoot_upload_error(self):
        """Test troubleshooting for upload errors"""
        payload = {
            "query": "I can't upload my CSV file",
            "mbti_type": "ISTJ"
        }

        response = client.post("/troubleshoot", json=payload)
        assert response.status_code == 200

        data = response.json()
        assert data["issue_type"] == "data_upload"
        assert "CSV" in data["solution"] or "csv" in data["solution"].lower()
        assert "next_steps" in data
        assert len(data["next_steps"]) > 0

    def test_troubleshoot_visualization_slow(self):
        """Test troubleshooting for slow visualization"""
        payload = {
            "query": "My 3D visualization is very slow",
            "mbti_type": "ENTP"
        }

        response = client.post("/troubleshoot", json=payload)
        assert response.status_code == 200

        data = response.json()
        assert data["issue_type"] == "visualization"
        assert "performance" in data["solution"].lower() or "slow" in data["solution"].lower()

    def test_troubleshoot_prediction_error(self):
        """Test troubleshooting for prediction errors"""
        payload = {
            "query": "AI predictions are not working",
            "mbti_type": "ENFJ"
        }

        response = client.post("/troubleshoot", json=payload)
        assert response.status_code == 200

        data = response.json()
        assert data["issue_type"] == "prediction"
        assert len(data["next_steps"]) > 0


class TestMBTIResponseStyles:
    """Test MBTI-specific response styles"""

    def test_all_mbti_types(self):
        """Test that all 16 MBTI types get tailored responses"""
        mbti_types = [
            "ENTJ", "INFP", "INFJ", "ESTP", "INTJ", "INTP",
            "ISTJ", "ESFJ", "ISFP", "ENTP", "ISFJ", "ESFP",
            "ENFJ", "ESTJ", "ISTP"
        ]

        for mbti in mbti_types:
            payload = {
                "query": "Tell me about solar energy",
                "mbti_type": mbti
            }

            response = client.post("/query", json=payload)
            assert response.status_code == 200

            data = response.json()
            assert data["mbti_tailored"] is True
            assert len(data["response"]) > 0

    def test_estp_actionable_style(self):
        """Test ESTP gets actionable, concise responses"""
        payload = {
            "query": "Best way to implement solar?",
            "mbti_type": "ESTP"
        }

        response = client.post("/query", json=payload)
        data = response.json()

        # ESTP should get action-oriented language
        response_lower = data["response"].lower()
        assert any(word in response_lower for word in ["action", "quick", "now", "immediate"])

    def test_infj_empathetic_style(self):
        """Test INFJ gets empathetic, community-focused responses"""
        payload = {
            "query": "Solar for my community",
            "mbti_type": "INFJ"
        }

        response = client.post("/query", json=payload)
        data = response.json()

        # INFJ should get empathetic, community-focused language
        response_lower = data["response"].lower()
        assert any(word in response_lower for word in ["community", "harmony", "together", "wellbeing"])


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
