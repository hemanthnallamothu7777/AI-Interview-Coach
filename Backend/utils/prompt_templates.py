"""
Prompt templates for OpenAI API calls.
Centralizing prompts makes them easy to iterate and improve.
"""

from typing import List

from models.resume_models import Project


def get_question_generation_prompt(role: str, difficulty: str, num_questions: int = 5) -> str:
    """Generate a prompt for creating interview questions."""
    difficulty_context = {
        "Easy": "fundamentals, basic concepts, and entry-level knowledge",
        "Medium": "intermediate concepts, practical experience, and moderate problem-solving",
        "Hard": "advanced topics, system design, deep expertise, and complex problem-solving",
    }
    context = difficulty_context.get(difficulty, "intermediate topics")

    return f"""You are an expert technical interviewer hiring for a {role} position.

Generate exactly {num_questions} technical interview questions for a {difficulty} difficulty level.
The questions should focus on: {context}

Requirements:
- Questions must be specific and relevant to {role}
- Include a mix of: conceptual understanding, practical application, and problem-solving
- Each question should be clear, concise, and answerable in 2-5 minutes verbally
- For Hard difficulty, include at least one system design or architecture question
- Do NOT number the questions

Return ONLY a valid JSON object in this exact format (no other text):
{{"questions": ["Question 1?", "Question 2?", "Question 3?", "Question 4?", "Question 5?"]}}"""


def get_evaluation_prompt(question: str, answer: str, role: str) -> str:
    """Generate a prompt for evaluating a candidate's answer."""
    return f"""You are a senior technical interviewer evaluating a candidate for a {role} position.

Question asked: {question}

Candidate's answer: {answer}

Evaluate the answer objectively and provide:
1. A score from 1-10 (1=completely wrong, 5=adequate, 8=good, 10=exceptional)
2. Specific feedback on what was correct and what was missing or incorrect
3. A concrete improvement suggestion (mention specific concepts/terms they should have included)
4. One follow-up question to dig deeper into this topic

Return ONLY a valid JSON object in this exact format (no other text):
{{
    "score": <integer 1-10>,
    "feedback": "<2-3 sentences of specific feedback>",
    "improvement": "<specific improvement tip mentioning exact concepts/terms to study>",
    "follow_up": "<one follow-up question>"
}}"""


def get_final_report_prompt(role: str, questions_and_evaluations: list) -> str:
    """Generate a prompt for the comprehensive final interview report."""
    qa_text = "\n\n".join([
        f"Q{i+1}: {qa['question']}\n"
        f"Answer: {qa.get('answer', 'N/A')}\n"
        f"Score: {qa['score']}/10\n"
        f"Feedback: {qa['feedback']}"
        for i, qa in enumerate(questions_and_evaluations)
    ])

    avg_score = sum(qa['score'] for qa in questions_and_evaluations) / len(questions_and_evaluations)

    return f"""You are an expert technical interviewer. Analyze this complete interview for a {role} position and generate a comprehensive final report.

Interview Performance (Average: {avg_score:.1f}/10):
{qa_text}

Generate a final report that:
1. Accurately reflects the overall_score as the arithmetic average of all scores (should be ~{avg_score:.1f})
2. Lists 3-5 specific strengths demonstrated during the interview
3. Lists 2-4 specific weaknesses or knowledge gaps identified
4. Provides 3-5 actionable improvement items (specific resources, topics, or practices)
5. Writes a 2-3 sentence professional summary

Return ONLY a valid JSON object in this exact format (no other text):
{{
    "overall_score": {avg_score:.1f},
    "strengths": ["strength1", "strength2", "strength3"],
    "weaknesses": ["weakness1", "weakness2"],
    "improvement_plan": ["action item 1", "action item 2", "action item 3"],
    "summary": "<2-3 sentence professional summary of the candidate's performance>"
}}"""


# ─────────────────────────────────────────────────────────────────────────────
# Resume prompts
# ─────────────────────────────────────────────────────────────────────────────


def get_resume_analysis_prompt(resume_text: str) -> str:
    """Prompt for full resume analysis — returns structured JSON with score, skills, etc."""
    return f"""You are an expert technical recruiter and career coach with 10+ years of experience
evaluating software engineering resumes.

Analyze the following resume and provide a comprehensive evaluation.

RESUME TEXT:
---
{resume_text}
---

Evaluate and return a JSON object with these exact fields:

1. score (integer 0-100): Overall resume quality score based on:
   - Clarity and structure (20 pts)
   - Technical skills breadth and depth (30 pts)
   - Work experience relevance (30 pts)
   - Achievements/impact (20 pts)

2. skills (array of strings): ALL technical skills found — programming languages,
   frameworks, libraries, tools, platforms, databases, cloud services, methodologies.
   Include ONLY concrete technical items (not soft skills like "communication").
   Examples: "React", "Node.js", "Docker", "AWS", "PostgreSQL", "REST APIs", "Git"

3. experience_level (string): One of exactly: "Entry-level", "Mid-level", "Senior", "Lead/Principal"
   Infer from years of experience, seniority of roles, and complexity of projects.

4. strengths (array of 3-5 strings): Specific strengths observed in this resume.
   Be concrete, referencing actual content from the resume.

5. missing_skills (array of strings): Important skills commonly expected for this
   experience level/role that appear absent from the resume.

6. improvements (array of 3-5 strings): Specific, actionable suggestions to improve
   this resume. Reference actual gaps or issues found.
   
7. projects (array of objects): Extract ALL projects (both personal and professional work).

Include projects from:
Projects section
Work/Professional Experience
Internships
Treat real-world products, platforms, or systems (e.g., apps, tools, platforms) as projects even if not explicitly labeled
If a project name is not clearly mentioned, infer a meaningful name from the context
Avoid duplicates

Each project object must contain:

name (string): Project or system name
description (string): 1–2 concise lines describing what was built or achieved
technologies (array of strings): Tech stack used (if mentioned)

Return ONLY a valid JSON object (no other text):
{{
    "score": <integer 0-100>,
    "skills": ["skill1", "skill2", ...],
    "experience_level": "<Entry-level|Mid-level|Senior|Lead/Principal>",
    "strengths": ["strength1", "strength2", ...],
    "missing_skills": ["missing1", "missing2", ...],
    "improvements": ["improvement1", "improvement2", ...]
    "projects": [
        {{
            "name": "Project Name",
            "description": "Short description",
            "technologies": ["UsedTechnology1", "UsedTechnology2"]
        }}
    ]
}}"""


def get_skill_extraction_prompt(resume_text: str) -> str:
    """Prompt for fast, focused skill extraction only."""
    return f"""Extract all technical skills from the following resume text.

RESUME TEXT:
---
{resume_text}
---

Return ONLY technical skills: programming languages, frameworks, libraries, tools,
databases, cloud services, platforms, and methodologies.
Do NOT include soft skills, job titles, company names, or degree names.

Return ONLY a valid JSON object (no other text):
{{"skills": ["React", "Node.js", "Docker", ...]}}"""


def get_project_extraction_prompt(resume_text: str) -> str:
    """Improved prompt to extract ALL project-like work including professional projects."""
    return f"""Extract ALL projects from the following resume text.

RESUME TEXT:
---
{resume_text}
---

IMPORTANT:
Projects may appear under:
- Projects section
- Professional Experience
- Internships
- Work Experience

Also include real-world applications, products, or platforms the candidate has built or contributed to
(e.g., platforms, apps, systems like "Tallaint", "Admin Mobile Application", etc.)

For each project, extract:
- Project name (or infer a meaningful name if not explicitly given)
- Short description (1–2 lines)
- Technologies used (if available)

Ignore:
- Generic responsibilities
- Pure job descriptions without a clear product/system

Return ONLY a valid JSON object (no other text):
{{"projects": [
  {{
    "name": "Project Name",
    "description": "Short description",
    "technologies": ["React", "Node.js"]
  }}
]}}"""


def get_resume_questions_prompt(
    skills: List[str],
    experience_level: str,
    difficulty: str,
    num_questions: int = 5,
    projects: List[Project] = None
) -> str:
    skills_str = ", ".join(skills)
    if projects:
        projects_str = "\n".join([
            f"- {p.name}: {p.description} | Tech: {', '.join(p.technologies)}"
            for p in projects
        ])
    else:
        projects_str = "None"

    difficulty_context = {
        "Easy": "fundamental concepts and basic practical usage",
        "Medium": "intermediate concepts, trade-offs, real-world scenarios, and moderate problem-solving",
        "Hard": "advanced internals, system design, performance optimisation, and complex architecture decisions",
    }
    context = difficulty_context.get(difficulty, "intermediate topics")

    return f"""You are an expert technical interviewer.

Generate exactly {num_questions} interview questions tailored to the candidate.

Candidate Details:
- Skills: {skills_str}
- Experience Level: {experience_level}
- Difficulty: {difficulty}
- Projects: {projects_str}

Focus: {context}

IMPORTANT RULES:
- At least 40–60% of questions MUST be based on the candidate's PROJECTS
- Ask project-based questions like:
  - "In your project X, how did you handle Y?"
  - "What challenges did you face while building X?"
  - "How would you improve your project X?"
- Remaining questions should be based on skills
- Questions must reflect real-world scenarios and practical thinking
- Questions should be answerable in 2–5 minutes
- Do NOT include answers
- Do NOT number questions

Return ONLY a valid JSON object:
{{"questions": ["Question 1?", "Question 2?", "Question 3?", "Question 4?", "Question 5?"]}}"""
