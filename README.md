# MedConnect - A Doctor Appointment Website

A Python full stack application with Django backend and React frontend.

## Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- npm

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd Backend
```

2. Remove the existing virtual environment (if any):
```bash
# On Windows
rmdir /s .venv

# On macOS/Linux
rm -rf .venv
```

3. Create a new virtual environment:
```bash
python -m venv .venv
```

4. Activate the virtual environment:
```bash
# On Windows
.venv\Scripts\activate

# On macOS/Linux
source .venv/bin/activate
```

5. Install required dependencies:
```bash
pip install -r requirements.txt
```

6. Run database migrations:
```bash
python manage.py migrate
```

7. Start the backend server:
```bash
python manage.py runserver
```

The backend server should now be running on `http://localhost:8000`

### Frontend Setup

1. Open a new terminal or switch to a separate terminal window

2. Navigate to the frontend directory:
```bash
cd Frontend
```

3. Install dependencies:
```bash
npm install
```

4. Start the development server:
```bash
npm run dev
```

The frontend application should now be running (typically on `http://localhost:5173` for Vite or `http://localhost:3000` for Create React App)

## Running the Application

Make sure both servers are running simultaneously:
- **Backend**: `http://localhost:8000`
- **Frontend**: Check your terminal output for the exact URL

## Troubleshooting

- If you encounter permission errors when deleting `.venv`, make sure the virtual environment is deactivated first
- If `pip install` fails, try upgrading pip: `pip install --upgrade pip`
- If port 8000 or 3000/5173 is already in use, you can specify a different port
