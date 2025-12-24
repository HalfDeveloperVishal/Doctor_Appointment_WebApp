# Backend Setup Guide (Step by Step)

Follow these steps to set up the backend for the project.

---

## 1. Navigate to the Backend Folder

Open your terminal and go to the backend directory:

```bash
cd Backend
2. Remove the Existing Virtual Environment
Make sure to delete the old virtual environment to start fresh.

Windows (PowerShell):

powershell
Copy code
Remove-Item -Recurse -Force .venv
Windows (CMD):

cmd
Copy code
rmdir /s /q .venv
macOS / Linux:

bash
Copy code
rm -rf .venv
3. Create a New Virtual Environment
Windows:

powershell
Copy code
python -m venv .venv
macOS / Linux:

bash
Copy code
python3 -m venv .venv
4. Activate the Virtual Environment
Windows (PowerShell):

powershell
Copy code
.\.venv\Scripts\Activate.ps1
Windows (CMD):

cmd
Copy code
.\.venv\Scripts\activate
macOS / Linux:

bash
Copy code
source .venv/bin/activate
After activation, your terminal prompt should show (.venv) at the start.

5. Install Dependencies
Install all required Python packages:

bash
Copy code
pip install -r requirements.txt
6. Run Database Migrations
Set up the database schema:

bash
Copy code
python manage.py migrate
7. Start the Backend Server
Run the development server:

bash
Copy code
python manage.py runserver
By default, the backend server runs at http://127.0.0.1:8000.
Keep this terminal open while the backend is running.
