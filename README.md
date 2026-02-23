Here's your **complete single-file README.md** - just copy everything below and paste it into your `README.md` file:

```markdown
# 🎓 StudySmart - Student Grade Tracker

![StudySmart Dashboard](https://via.placeholder.com/800x400/3b82f6/ffffff?text=StudySmart+Grade+Tracker)

**Live Site:** [study-smart-zeta.vercel.app](https://study-smart-zeta.vercel.app)

A comprehensive grade tracking application built for university students to manage courses, track assignments, and calculate GPA.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **📚 Course Management** | Add courses with custom names, codes, and credit hours |
| **✅ Assignment Tracking** | Track assignments, due dates, and points |
| **📊 GPA Calculator** | Automatic GPA calculation on a 4.0 scale, weighted by credits |
| **📈 Grade Visualization** | Beautiful bar charts and pie charts of your progress |
| **🎯 100-Point System** | Clear point allocation per course |
| **🔐 Secure & Private** | Supabase authentication with Row Level Security |

---

## 🛠️ Built With

| Technology | Purpose |
|------------|---------|
| **React** | Frontend UI library |
| **Vite** | Build tool and development server |
| **Tailwind CSS** | Styling and responsive design |
| **Supabase** | Backend database and authentication |
| **React Router** | Navigation and routing |
| **Recharts** | Data visualization charts |
| **Vercel** | Hosting and deployment |

---

## 🚀 Live Demo

Visit **[study-smart-zeta.vercel.app](https://study-smart-zeta.vercel.app)** to see the app in action!

- Sign up for a free account
- Add your courses
- Track assignments and grades
- Watch your GPA update in real-time

---

## 📋 Prerequisites

Before you begin, ensure you have installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**
- **Supabase account** (free at [supabase.com](https://supabase.com))

---

## 🏗️ Local Development

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/studysmart.git
cd studysmart
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Supabase
1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Run the SQL schema below in the SQL editor
4. Get your project URL and anon key from **Project Settings → API**

### 4. Configure environment variables
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Start the development server
```bash
npm run dev
```

### 6. Open your browser
Navigate to `http://localhost:5173`

---

## 📊 Database Schema

Run this SQL in your Supabase SQL editor:

```sql
-- Create courses table
CREATE TABLE courses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  code TEXT,
  credits INTEGER DEFAULT 3,
  semester TEXT,
  year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Create policies for courses
CREATE POLICY "Users can view their own courses"
  ON courses FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own courses"
  ON courses FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own courses"
  ON courses FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own courses"
  ON courses FOR DELETE USING (auth.uid() = user_id);

-- Create assignments table
CREATE TABLE assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  max_grade DECIMAL(5,2) DEFAULT 100,
  weight DECIMAL(5,2),
  due_date DATE,
  completed BOOLEAN DEFAULT FALSE,
  grade DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

-- Create policies for assignments
CREATE POLICY "Users can view their own assignments"
  ON assignments FOR SELECT
  USING (auth.uid() IN (SELECT user_id FROM courses WHERE id = course_id));

CREATE POLICY "Users can insert assignments"
  ON assignments FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT user_id FROM courses WHERE id = course_id));

CREATE POLICY "Users can update their own assignments"
  ON assignments FOR UPDATE
  USING (auth.uid() IN (SELECT user_id FROM courses WHERE id = course_id));

CREATE POLICY "Users can delete their own assignments"
  ON assignments FOR DELETE
  USING (auth.uid() IN (SELECT user_id FROM courses WHERE id = course_id));
```

---

## 📁 Project Structure

```
studysmart/
├── public/
├── src/
│   ├── components/
│   │   ├── AddAssignmentForm.jsx
│   │   ├── AddCourseForm.jsx
│   │   ├── AssignmentList.jsx
│   │   ├── CourseCard.jsx
│   │   ├── CourseDetailsModal.jsx
│   │   ├── GPASummary.jsx
│   │   ├── GradeCharts.jsx
│   │   └── ProtectedRoute.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── lib/
│   │   └── supabase.js
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   └── Signup.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env
├── .gitignore
├── index.html
├── package.json
├── README.md
├── tailwind.config.js
└── vite.config.js
```

---

## 📝 Grading Scale

| Percentage Range | Letter Grade | GPA Value |
|-----------------|--------------|-----------|
| 90-100% | A+ | 4.0 |
| 85-89% | A | 4.0 |
| 80-84% | A- | 3.75 |
| 75-79% | B+ | 3.5 |
| 70-74% | B | 3.0 |
| 65-69% | B- | 2.75 |
| 60-64% | C+ | 2.5 |
| 50-59% | C | 2.0 |
| 45-49% | C- | 1.75 |
| 40-44% | D | 1.0 |
| 0-39% | F | 0.0 |

---

## 🧪 Testing Checklist

- [ ] User signup with email/password
- [ ] User login
- [ ] Protected routes redirect to landing
- [ ] Sign out goes to landing page
- [ ] Add a new course
- [ ] Edit course details
- [ ] Delete a course
- [ ] Add assignments to a course
- [ ] Mark assignments complete
- [ ] Enter grades (validation prevents exceeding max points)
- [ ] Course grade updates in real-time
- [ ] Overall GPA calculates correctly
- [ ] Bar chart shows all courses
- [ ] Pie chart shows grade distribution
- [ ] Mobile responsive design works

---

## 🚢 Deployment

### Deploy to Vercel

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Go to [vercel.com](https://vercel.com)** and sign in with GitHub

3. **Import your repository**
   - Click "Add New Project"
   - Select your `studysmart` repository
   - Keep all default settings

4. **Add environment variables**
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key

5. **Click "Deploy"**

Your app will be live at `https://studysmart.vercel.app` within minutes!

### Automatic Updates
```bash
git add .
git commit -m "Updated feature"
git push
```

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| **Blank white screen** | Check environment variables in Vercel |
| **API errors** | Verify Supabase URL and anon key |
| **Routes not working** | Add `vercel.json` with rewrite rules |
| **Build fails** | Run `npm run build` locally first |

---

## 📧 Contact

- **GitHub:** [@yourusername](https://github.com/aman-thx)
- **Live App:** [study-smart-zeta.vercel.app](https://study-smart-zeta.vercel.app)

---

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) for the backend platform
- [Tailwind CSS](https://tailwindcss.com) for styling
- [Vercel](https://vercel.com) for hosting
- [Recharts](https://recharts.org) for charts
- [React](https://reactjs.org) for the UI library

---

## 📝 License

This project is licensed under the MIT License.

---

