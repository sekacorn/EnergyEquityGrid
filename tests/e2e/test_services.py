"""
End-to-End Test Suite for EnergyEquityGrid
Tests core functionality without requiring Docker
"""
import sys
sys.path.append('../../ai-model')

from energy_predictor import EnergyPredictionModel, get_mbti_advice, MBTI_MESSAGES
from llm_service import generate_mbti_response, MBTI_STYLES, ENERGY_KNOWLEDGE
import torch


def test_ai_model_initialization():
    """Test AI model can be initialized"""
    print("[PASS] Testing AI Model Initialization...")
    model = EnergyPredictionModel()
    assert model is not None
    print("  [PASS] AI Model initialized successfully")


def test_ai_model_forward_pass():
    """Test AI model forward pass"""
    print("[PASS] Testing AI Model Forward Pass...")
    model = EnergyPredictionModel()
    model.eval()

    # Create sample input
    input_data = torch.randn(1, 10)  # Batch size 1, 10 features

    with torch.no_grad():
        output = model(input_data)

    assert output is not None
    assert output.shape == (1, 3)  # 3 outputs
    print(f"  [PASS] Model produced output with shape {output.shape}")


def test_mbti_advice_generation():
    """Test MBTI-tailored advice generation"""
    print("[PASS] Testing MBTI Advice Generation...")

    mbti_types = ["ENTJ", "INFP", "INFJ", "ESTP", "INTJ"]
    solution_types = ["solar", "wind", "microgrid"]

    for mbti in mbti_types:
        for solution in solution_types:
            advice = get_mbti_advice(solution, mbti)
            assert advice is not None
            assert len(advice) > 0
            print(f"  [PASS] Generated advice for {mbti} + {solution}")


def test_mbti_messages_coverage():
    """Test that all MBTI types have message templates"""
    print("[PASS] Testing MBTI Message Coverage...")

    required_mbti_types = [
        "ENTJ", "INFP", "INFJ", "ESTP", "INTJ", "INTP",
        "ISTJ", "ESFJ", "ISFP", "ENTP", "ISFJ", "ESFP",
        "ENFJ", "ESTJ", "ISTP"
    ]

    for mbti in required_mbti_types:
        assert mbti in MBTI_MESSAGES, f"Missing MBTI message for {mbti}"
        assert "style" in MBTI_MESSAGES[mbti]
        assert "focus" in MBTI_MESSAGES[mbti]

    print(f"  [PASS] All {len(required_mbti_types)} MBTI types have message templates")


def test_llm_response_styles():
    """Test LLM response style templates"""
    print("[PASS] Testing LLM Response Styles...")

    for mbti, style in MBTI_STYLES.items():
        assert "tone" in style
        assert "focus" in style
        assert "response_style" in style
        print(f"  [PASS] {mbti}: {style['tone']}")


def test_llm_energy_knowledge():
    """Test LLM energy knowledge base"""
    print("[PASS] Testing LLM Energy Knowledge Base...")

    required_topics = ["solar", "wind", "microgrid", "grid_expansion"]

    for topic in required_topics:
        assert topic in ENERGY_KNOWLEDGE
        info = ENERGY_KNOWLEDGE[topic]
        assert "description" in info
        assert "benefits" in info
        assert "considerations" in info
        assert "best_for" in info
        print(f"  [PASS] Knowledge available for {topic}")


def test_llm_response_generation():
    """Test LLM response generation for different queries"""
    print("[PASS] Testing LLM Response Generation...")

    test_queries = [
        ("How can I use solar energy?", "ENTJ"),
        ("Tell me about wind power", "INFP"),
        ("What is a microgrid?", "INTJ"),
        ("Best energy solution for my community", "ENFJ")
    ]

    for query, mbti in test_queries:
        response, suggestions = generate_mbti_response(query, mbti)
        assert response is not None
        assert len(response) > 0
        assert isinstance(suggestions, list)
        assert len(suggestions) > 0
        print(f"  [PASS] Generated response for '{query[:30]}...' ({mbti})")


def test_end_to_end_prediction_flow():
    """Test complete prediction flow"""
    print("[PASS] Testing End-to-End Prediction Flow...")

    # Initialize model
    model = EnergyPredictionModel()
    model.eval()

    # Sample input data (normalized)
    features = [
        40.7128 / 90.0,  # Latitude
        -74.0060 / 180.0,  # Longitude
        5000 / 10000.0,  # Population
        1.0,  # Has grid access
        0.8,  # Solar potential
        0.6,  # Wind potential
        500 / 1000.0,  # Current demand
        0.5,  # Energy type preference
        12 / 24.0,  # Hour of day
        6 / 12.0  # Month
    ]

    input_tensor = torch.tensor([features], dtype=torch.float32)

    with torch.no_grad():
        output = model(input_tensor)
        predicted_demand = float(output[0][0].item()) * 1000.0
        solar_score = float(output[0][1].item())
        wind_score = float(output[0][2].item())

    assert predicted_demand > 0
    assert -10 < solar_score < 10  # Reasonable range
    assert -10 < wind_score < 10

    print(f"  [PASS] Predicted demand: {predicted_demand:.2f} kW")
    print(f"  [PASS] Solar score: {solar_score:.4f}")
    print(f"  [PASS] Wind score: {wind_score:.4f}")


def test_mbti_personalization_differences():
    """Test that different MBTI types get different responses"""
    print("[PASS] Testing MBTI Personalization Differences...")

    query = "How can I use solar energy?"
    responses = {}

    mbti_types = ["ENTJ", "INFP", "ESTP", "INTJ"]

    for mbti in mbti_types:
        response, _ = generate_mbti_response(query, mbti)
        responses[mbti] = response

    # Check that responses are different
    unique_responses = len(set(responses.values()))
    assert unique_responses > 1, "MBTI responses should be different"

    print(f"  [PASS] Generated {unique_responses} unique responses for {len(mbti_types)} MBTI types")


def run_all_tests():
    """Run all end-to-end tests"""
    print("\n" + "="*60)
    print("ENERGYEQUITYGRID END-TO-END TEST SUITE")
    print("="*60 + "\n")

    tests = [
        test_ai_model_initialization,
        test_ai_model_forward_pass,
        test_mbti_advice_generation,
        test_mbti_messages_coverage,
        test_llm_response_styles,
        test_llm_energy_knowledge,
        test_llm_response_generation,
        test_end_to_end_prediction_flow,
        test_mbti_personalization_differences
    ]

    passed = 0
    failed = 0

    for test in tests:
        try:
            test()
            passed += 1
        except Exception as e:
            print(f"  [FAIL] Test failed: {str(e)}")
            failed += 1

    print("\n" + "="*60)
    print(f"TEST RESULTS: {passed} PASSED, {failed} FAILED")
    print("="*60 + "\n")

    if failed == 0:
        print("[SUCCESS] ALL TESTS PASSED!")
        return True
    else:
        print(f"[FAILED] {failed} TESTS FAILED")
        return False


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
