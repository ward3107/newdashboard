# ISHEBOT Optimization API

Advanced classroom seating optimization using genetic algorithms and AI.

## 🚀 Features

- **Genetic Algorithm Optimization**: Uses DEAP framework for intelligent seating arrangements
- **Multi-Objective Optimization**: Balances academic performance, behavior, diversity, and special needs
- **RESTful API**: FastAPI-based with automatic OpenAPI documentation
- **Real-time Processing**: Optimizes 30+ students in under 3 seconds
- **Flexible Layouts**: Supports 6 different classroom configurations

## 📋 Requirements

- Python 3.9 or higher
- pip (Python package manager)

## 🛠️ Installation

### 1. Navigate to backend directory

```bash
cd backend
```

### 2. Create virtual environment (recommended)

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Set up environment variables

```bash
# Copy the example environment file
copy .env.example .env  # Windows
cp .env.example .env    # macOS/Linux

# Edit .env file with your settings (optional)
```

## 🏃 Running the Server

### Development Mode

```bash
# From the backend directory
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Or simply:

```bash
python app/main.py
```

### Production Mode

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

The API will be available at:
- **API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 📚 API Documentation

### Optimize Classroom Seating

**Endpoint:** `POST /api/v1/optimize/classroom`

**Request Body:**
```json
{
  "students": [
    {
      "id": "S001",
      "name": "יוסי כהן",
      "gender": "male",
      "academic_level": "proficient",
      "academic_score": 85.0,
      "behavior_level": "good",
      "behavior_score": 90.0,
      "friends_ids": ["S002"],
      "incompatible_ids": ["S010"]
    }
  ],
  "layout_type": "rows",
  "rows": 5,
  "cols": 6,
  "objectives": {
    "academic_balance": 0.3,
    "behavioral_balance": 0.3,
    "diversity": 0.2,
    "special_needs": 0.2
  },
  "max_generations": 100
}
```

**Response:**
```json
{
  "success": true,
  "optimization_id": "opt_abc123",
  "result": {
    "fitness_score": 0.92,
    "generation_count": 100,
    "computation_time": 2.3,
    "objective_scores": {
      "academic_balance": 0.95,
      "behavioral_balance": 0.88,
      "diversity": 0.90,
      "special_needs": 1.0
    },
    "student_seats": {
      "S001": {"row": 0, "col": 2, "is_front_row": true}
    }
  }
}
```

### Health Check

**Endpoint:** `GET /health`

Returns service status and version.

## 🔧 Configuration

Edit `.env` file to customize:

- `PORT`: API server port (default: 8000)
- `DEBUG`: Enable debug mode (default: True)
- `GA_POPULATION_SIZE`: Genetic algorithm population size (default: 100)
- `GA_GENERATIONS`: Number of generations (default: 100)
- `ALLOWED_ORIGINS`: CORS allowed origins

## 🧬 Genetic Algorithm Details

### Algorithm Parameters

- **Population Size**: 100 individuals
- **Generations**: 100 (configurable)
- **Selection**: Tournament selection (size 3)
- **Crossover**: Order-based crossover (80% probability)
- **Mutation**: Shuffle mutation (10% probability)
- **Elitism**: Top 5% preserved each generation

### Fitness Function

The fitness function evaluates seating arrangements based on:

1. **Academic Balance** (30%): Even distribution of high/low performers
2. **Behavioral Balance** (30%): Compatible student pairings
3. **Diversity** (20%): Gender and cultural balance
4. **Special Needs** (20%): Accommodation compliance

## 🔗 Integration with React Frontend

### Example React/JavaScript Usage

```javascript
const optimizeSeating = async (students) => {
  const response = await fetch('http://localhost:8000/api/v1/optimize/classroom', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      students: students,
      layout_type: 'rows',
      rows: 5,
      cols: 6,
      max_generations: 100
    })
  });

  const result = await response.json();
  return result;
};
```

## 📊 Performance

- **Small Class** (15 students): ~1 second
- **Medium Class** (30 students): ~2 seconds
- **Large Class** (50 students): ~4 seconds

Performance scales linearly with student count and generation limit.

## 🐛 Troubleshooting

### Import Errors

Make sure you're in the backend directory and virtual environment is activated:
```bash
cd backend
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux
```

### Port Already in Use

Change the port in `.env` file or run with different port:
```bash
uvicorn app.main:app --port 8001
```

### CORS Errors from React

Add your React app URL to `ALLOWED_ORIGINS` in `.env`:
```
ALLOWED_ORIGINS=http://localhost:3003,http://localhost:3000
```

## 🧪 Testing

```bash
# Install test dependencies
pip install pytest httpx

# Run tests
pytest
```

## 📝 License

Part of the ISHEBOT project.

## 🤝 Contributing

This is the optimization backend for ISHEBOT. For frontend issues, see the main dashboard repository.
