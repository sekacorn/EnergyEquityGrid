"""
CORS integration tests for the AI FastAPI services.

These tests verify that:
- Allowed origins receive the correct CORS response headers.
- Origins not in the allowlist do not receive Access-Control-Allow-Origin.
"""
import os
from pathlib import Path
import sys

import pytest
from fastapi.testclient import TestClient

sys.path.append(str(Path(__file__).resolve().parents[2] / 'ai-model'))


@pytest.fixture(autouse=True)
def reset_allowed_origins(monkeypatch):
    """Set a controlled allowlist for every test, then restore env."""
    monkeypatch.setenv('ALLOWED_ORIGINS', 'http://allowed.example.com,http://also-allowed.example.com')
    # Re-import after env is set so the middleware picks up the new value.
    # TestClient fixtures below do this per-test via fresh imports.
    yield


# ---------------------------------------------------------------------------
# Energy Predictor CORS tests
# ---------------------------------------------------------------------------

class TestEnergyPredictorCors:
    def _make_client(self):
        # Force re-evaluation of the module with the current env.
        import importlib
        import energy_predictor
        importlib.reload(energy_predictor)
        return TestClient(energy_predictor.app)

    def test_allowed_origin_receives_acao_header(self):
        client = self._make_client()
        response = client.options(
            '/predict',
            headers={
                'Origin': 'http://allowed.example.com',
                'Access-Control-Request-Method': 'POST',
            }
        )
        assert response.headers.get('access-control-allow-origin') == 'http://allowed.example.com'

    def test_unlisted_origin_does_not_receive_acao_header(self):
        client = self._make_client()
        response = client.options(
            '/predict',
            headers={
                'Origin': 'http://evil.example.com',
                'Access-Control-Request-Method': 'POST',
            }
        )
        acao = response.headers.get('access-control-allow-origin', '')
        assert acao != 'http://evil.example.com'

    def test_second_allowed_origin_is_accepted(self):
        client = self._make_client()
        response = client.options(
            '/health',
            headers={
                'Origin': 'http://also-allowed.example.com',
                'Access-Control-Request-Method': 'GET',
            }
        )
        assert response.headers.get('access-control-allow-origin') == 'http://also-allowed.example.com'


# ---------------------------------------------------------------------------
# LLM Service CORS tests
# ---------------------------------------------------------------------------

class TestLlmServiceCors:
    def _make_client(self):
        import importlib
        import llm_service
        importlib.reload(llm_service)
        return TestClient(llm_service.app)

    def test_allowed_origin_receives_acao_header(self):
        client = self._make_client()
        response = client.options(
            '/query',
            headers={
                'Origin': 'http://allowed.example.com',
                'Access-Control-Request-Method': 'POST',
            }
        )
        assert response.headers.get('access-control-allow-origin') == 'http://allowed.example.com'

    def test_unlisted_origin_does_not_receive_acao_header(self):
        client = self._make_client()
        response = client.options(
            '/query',
            headers={
                'Origin': 'http://evil.example.com',
                'Access-Control-Request-Method': 'POST',
            }
        )
        acao = response.headers.get('access-control-allow-origin', '')
        assert acao != 'http://evil.example.com'
