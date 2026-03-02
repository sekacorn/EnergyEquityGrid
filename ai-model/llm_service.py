"""
LLM Service for Natural Language Queries
Provides MBTI-tailored responses for energy-related questions
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="LLM Service", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response Models
class QueryRequest(BaseModel):
    query: str
    mbti_type: Optional[str] = "UNKNOWN"
    context: Optional[dict] = None
    user_role: Optional[str] = "USER"


class QueryResponse(BaseModel):
    response: str
    suggestions: List[str]
    mbti_tailored: bool
    timestamp: str


# MBTI Response Styles
MBTI_STYLES = {
    "ENTJ": {
        "tone": "strategic and commanding",
        "focus": "efficiency, results, and leadership",
        "response_style": "Direct, goal-oriented with clear action steps"
    },
    "INFP": {
        "tone": "empathetic and values-driven",
        "focus": "sustainability, creativity, and personal values",
        "response_style": "Narrative, inspiring with creative possibilities"
    },
    "INFJ": {
        "tone": "insightful and empathetic",
        "focus": "community harmony and long-term vision",
        "response_style": "Holistic, intuitive with community focus"
    },
    "ESTP": {
        "tone": "energetic and practical",
        "focus": "immediate action and tangible results",
        "response_style": "Concise, actionable with quick wins"
    },
    "INTJ": {
        "tone": "analytical and strategic",
        "focus": "long-term planning and system optimization",
        "response_style": "Detailed, logical with strategic framework"
    },
    "INTP": {
        "tone": "logical and theoretical",
        "focus": "technical understanding and innovation",
        "response_style": "In-depth, conceptual with technical details"
    },
    "ISTJ": {
        "tone": "reliable and structured",
        "focus": "proven methods and stability",
        "response_style": "Step-by-step, methodical with clear procedures"
    },
    "ESFJ": {
        "tone": "warm and supportive",
        "focus": "community support and harmony",
        "response_style": "Friendly, collaborative with group benefits"
    },
    "ISFP": {
        "tone": "gentle and aesthetic",
        "focus": "environmental beauty and present experience",
        "response_style": "Sensory-rich, encouraging with aesthetic appeal"
    },
    "ENTP": {
        "tone": "innovative and witty",
        "focus": "creative problem-solving and possibilities",
        "response_style": "Exploratory, idea-rich with innovative angles"
    },
    "ISFJ": {
        "tone": "nurturing and practical",
        "focus": "stability, care, and tradition",
        "response_style": "Supportive, detailed with practical guidance"
    },
    "ESFP": {
        "tone": "enthusiastic and spontaneous",
        "focus": "immediate action and enjoyment",
        "response_style": "Vibrant, energetic with exciting opportunities"
    },
    "ENFJ": {
        "tone": "inspirational and visionary",
        "focus": "community leadership and growth",
        "response_style": "Motivational, visionary with community empowerment"
    },
    "ESTJ": {
        "tone": "direct and organized",
        "focus": "efficiency, order, and results",
        "response_style": "Authoritative, structured with clear metrics"
    },
    "ISTP": {
        "tone": "practical and hands-on",
        "focus": "problem-solving and functionality",
        "response_style": "Concise, practical with technical solutions"
    },
}


# Knowledge Base
ENERGY_KNOWLEDGE = {
    "solar": {
        "description": "Solar energy harnesses sunlight using photovoltaic panels",
        "benefits": ["Renewable", "Low maintenance", "Scalable", "Silent operation"],
        "considerations": ["Weather dependent", "Initial cost", "Space requirements"],
        "best_for": "Areas with high sunlight exposure"
    },
    "wind": {
        "description": "Wind energy converts wind kinetic energy into electricity",
        "benefits": ["Renewable", "Land efficient", "Cost-effective at scale"],
        "considerations": ["Wind variability", "Noise", "Visual impact"],
        "best_for": "Coastal and open areas with consistent wind"
    },
    "microgrid": {
        "description": "Localized energy grids that can operate independently",
        "benefits": ["Energy independence", "Resilience", "Community control"],
        "considerations": ["Initial setup cost", "Management complexity"],
        "best_for": "Communities seeking energy autonomy"
    },
    "grid_expansion": {
        "description": "Extending existing power grid infrastructure",
        "benefits": ["Reliable power", "Established infrastructure", "Grid stability"],
        "considerations": ["High cost", "Long implementation", "Dependency"],
        "best_for": "Areas near existing grid infrastructure"
    }
}


def generate_mbti_response(query: str, mbti_type: str, context: dict = None) -> tuple:
    """Generate MBTI-tailored response to energy queries"""

    query_lower = query.lower()
    mbti_style = MBTI_STYLES.get(mbti_type, MBTI_STYLES["ISTJ"])

    # Detect query intent
    if "solar" in query_lower:
        energy_type = "solar"
    elif "wind" in query_lower:
        energy_type = "wind"
    elif "microgrid" in query_lower:
        energy_type = "microgrid"
    elif "grid" in query_lower:
        energy_type = "grid_expansion"
    else:
        energy_type = "general"

    # Generate response based on MBTI and query
    if energy_type in ENERGY_KNOWLEDGE:
        info = ENERGY_KNOWLEDGE[energy_type]

        if mbti_type == "ENTJ":
            response = f"**Strategic Energy Solution:** {info['description']}. "\
                      f"Key benefits for your leadership goals: {', '.join(info['benefits'][:3])}. "\
                      f"**Action Plan:** Assess site viability, secure funding, implement within 6-12 months. "\
                      f"Focus on {mbti_style['focus']}."
            suggestions = [
                "Analyze ROI and implementation timeline",
                "Develop strategic deployment plan",
                "Lead stakeholder engagement"
            ]

        elif mbti_type == "INFP":
            response = f"**Sustainable Energy Vision:** Imagine a future where {info['description'].lower()} "\
                      f"brings clean energy to your community. This aligns with values of sustainability and environmental care. "\
                      f"The beauty lies in {', '.join(info['benefits'][:2])}, creating harmony with nature. "\
                      f"Consider how this resonates with your {mbti_style['focus']}."
            suggestions = [
                "Explore creative implementation ideas",
                "Connect with community values",
                "Visualize environmental impact"
            ]

        elif mbti_type == "INFJ":
            response = f"**Holistic Energy Approach:** {info['description']}. This solution serves both individual "\
                      f"needs and community wellbeing. Benefits include {', '.join(info['benefits'][:3])}, "\
                      f"fostering {mbti_style['focus']}. Think about the long-term positive impact on future generations."
            suggestions = [
                "Consider community harmony aspects",
                "Plan for long-term sustainability",
                "Engage stakeholders empathetically"
            ]

        elif mbti_type == "ESTP":
            response = f"**Quick Win:** {info['description']}. Get started NOW! "\
                      f"Top 3 benefits: {', '.join(info['benefits'][:3])}. "\
                      f"**Action Items:** 1) Site assessment, 2) Get quotes, 3) Install. "\
                      f"Best for {info['best_for']}. Let's make it happen!"
            suggestions = [
                "Get immediate quotes from providers",
                "Start pilot project this quarter",
                "Implement quick win solutions"
            ]

        elif mbti_type == "INTJ":
            response = f"**Systematic Analysis:** {info['description']}. "\
                      f"Strategic advantages: {', '.join(info['benefits'])}. "\
                      f"Critical considerations: {', '.join(info['considerations'])}. "\
                      f"Optimal for {info['best_for']}. Develop a comprehensive 5-year implementation roadmap "\
                      f"focusing on {mbti_style['focus']}."
            suggestions = [
                "Create detailed technical specifications",
                "Develop long-term optimization strategy",
                "Analyze system dependencies"
            ]

        elif mbti_type == "ESFJ":
            response = f"**Community Energy Solution:** {info['description']}. "\
                      f"This brings wonderful benefits to everyone: {', '.join(info['benefits'][:3])}. "\
                      f"Let's work together to bring clean energy to our community! "\
                      f"Perfect for {info['best_for']}. We'll support each other through implementation."
            suggestions = [
                "Organize community meetings",
                "Build consensus and support",
                "Celebrate milestones together"
            ]

        elif mbti_type == "ENFJ":
            response = f"**Visionary Energy Future:** Together, we can transform our community with {info['description'].lower()}! "\
                      f"Imagine the possibilities: {', '.join(info['benefits'][:3])}. "\
                      f"As a leader, you can inspire others toward {mbti_style['focus']}. "\
                      f"This is ideal for {info['best_for']}. Let's build this future together!"
            suggestions = [
                "Inspire community participation",
                "Lead transformational change",
                "Mentor others in energy transition"
            ]

        else:  # Default practical response
            response = f"**Energy Solution Overview:** {info['description']}. "\
                      f"Benefits: {', '.join(info['benefits'])}. "\
                      f"Considerations: {', '.join(info['considerations'])}. "\
                      f"Best suited for {info['best_for']}. "\
                      f"Recommended for {mbti_style['focus']}."
            suggestions = [
                "Evaluate site-specific requirements",
                "Compare cost-benefit analysis",
                "Plan implementation phases"
            ]

    else:
        # General energy query
        if mbti_type == "ENTJ":
            response = "**Strategic Overview:** EnergyEquityGrid integrates renewable energy data, community needs, "\
                      "and infrastructure to provide optimized solutions. Focus on efficiency and results. "\
                      "Use the 3D visualization to identify high-impact opportunities."
            suggestions = [
                "Analyze energy access metrics",
                "Develop strategic implementation plan",
                "Optimize resource allocation"
            ]
        elif mbti_type == "INFP":
            response = "Welcome to EnergyEquityGrid - a platform built on values of sustainability and equity. "\
                      "Explore creative solutions that align with your vision for a better world. "\
                      "Use our tools to discover how renewable energy can bring positive change."
            suggestions = [
                "Explore sustainable energy options",
                "Connect with community initiatives",
                "Visualize environmental impact"
            ]
        else:
            response = "EnergyEquityGrid helps you discover renewable energy solutions tailored to your needs. "\
                      "Upload energy data, visualize in 3D, get AI predictions, and collaborate with your community. "\
                      "Ask specific questions about solar, wind, microgrids, or grid expansion."
            suggestions = [
                "Upload your energy data",
                "Explore 3D visualizations",
                "Get AI-powered predictions"
            ]

    return response, suggestions


@app.post("/query", response_model=QueryResponse)
async def process_query(request: QueryRequest):
    """Process natural language query with MBTI-tailored response"""
    try:
        logger.info(f"Processing query from {request.mbti_type}: {request.query[:50]}...")

        response, suggestions = generate_mbti_response(
            request.query,
            request.mbti_type,
            request.context
        )

        return QueryResponse(
            response=response,
            suggestions=suggestions,
            mbti_tailored=request.mbti_type in MBTI_STYLES,
            timestamp=datetime.now().isoformat()
        )

    except Exception as e:
        logger.error(f"Query processing error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Query processing failed: {str(e)}")


@app.post("/troubleshoot")
async def troubleshoot(request: QueryRequest):
    """Provide troubleshooting assistance"""
    try:
        query_lower = request.query.lower()

        # Detect issue type
        if "upload" in query_lower or "import" in query_lower:
            issue_type = "data_upload"
            solution = "Ensure your file is in CSV, JSON, or GeoJSON format. "\
                      "Check that required fields (latitude, longitude) are present. "\
                      "File size should be under 100MB."
        elif "visualization" in query_lower or "3d" in query_lower or "slow" in query_lower:
            issue_type = "visualization"
            solution = "For better performance: 1) Reduce data points by filtering, "\
                      "2) Close other browser tabs, 3) Use Chrome/Firefox for best WebGL support, "\
                      "4) Check if GPU acceleration is enabled in browser settings."
        elif "predict" in query_lower or "ai" in query_lower:
            issue_type = "prediction"
            solution = "AI predictions require: latitude, longitude, and optionally population data. "\
                      "Ensure location data is valid (lat: -90 to 90, lon: -180 to 180). "\
                      "Check network connection to AI service."
        else:
            issue_type = "general"
            solution = "Please provide more details about the issue. Common problems include: "\
                      "data upload errors, visualization performance, or AI prediction failures. "\
                      "Check browser console for error messages."

        mbti_style = MBTI_STYLES.get(request.mbti_type, {})
        tone = mbti_style.get("tone", "helpful")

        response = f"**Troubleshooting ({tone}):** {solution}"

        return {
            "issue_type": issue_type,
            "solution": response,
            "next_steps": [
                "Check application logs",
                "Verify data format",
                "Test with smaller dataset",
                "Contact support if issue persists"
            ],
            "timestamp": datetime.now().isoformat()
        }

    except Exception as e:
        logger.error(f"Troubleshooting error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health_check():
    return {"status": "UP", "service": "llm-service"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8084)
