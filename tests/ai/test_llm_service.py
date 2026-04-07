"""
Test suite for LLM Service.
"""
from pathlib import Path
import sys

from fastapi.testclient import TestClient

sys.path.append(str(Path(__file__).resolve().parents[2] / 'ai-model'))

from llm_service import app  # noqa: E402

client = TestClient(app)


class TestLLMService:
    def test_health_check(self):
        response = client.get('/health')
        assert response.status_code == 200
        assert response.json()['status'] == 'UP'

    def test_query_solar(self):
        payload = {
            'query': 'How can I power my home with solar?'
        }

        response = client.post('/query', json=payload)
        assert response.status_code == 200

        data = response.json()
        assert 'response' in data
        assert 'suggestions' in data
        assert len(data['response']) > 0
        assert 'solar' in data['response'].lower()

    def test_query_microgrid(self):
        response = client.post('/query', json={'query': 'What is a microgrid?'})
        assert response.status_code == 200
        assert 'microgrid' in response.json()['response'].lower()

    def test_query_general(self):
        response = client.post('/query', json={'query': 'How does EnergyEquityGrid work?'})
        assert response.status_code == 200
        assert 'energyequitygrid' in response.json()['response'].lower()

    def test_query_provides_suggestions(self):
        response = client.post('/query', json={'query': 'I want to use solar power'})
        assert response.status_code == 200
        assert isinstance(response.json()['suggestions'], list)
        assert len(response.json()['suggestions']) > 0

    def test_troubleshoot_upload_error(self):
        payload = {'query': "I can't upload my CSV file"}

        response = client.post('/troubleshoot', json=payload)
        assert response.status_code == 200

        data = response.json()
        assert data['issue_type'] == 'data_upload'
        assert 'CSV' in data['solution'] or 'csv' in data['solution'].lower()
        assert len(data['next_steps']) > 0

    def test_troubleshoot_visualization_slow(self):
        payload = {'query': 'My 3D visualization is very slow'}

        response = client.post('/troubleshoot', json=payload)
        assert response.status_code == 200
        assert response.json()['issue_type'] == 'visualization'

    def test_troubleshoot_prediction_error(self):
        payload = {'query': 'AI predictions are not working'}

        response = client.post('/troubleshoot', json=payload)
        assert response.status_code == 200
        assert response.json()['issue_type'] == 'prediction'
