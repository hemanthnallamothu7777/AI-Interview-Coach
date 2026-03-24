"""
Skill Extractor — lightweight helper to extract a clean deduplicated list of
technical skills from resume text. Used independently of the full analysis
when only skills are needed (e.g. for question generation).
"""

import json
from services.ai_service import client, MODEL
from utils.prompt_templates import get_skill_extraction_prompt
from utils.prompt_templates import get_project_extraction_prompt


async def extract_skills(text: str) -> list[str]:
    """
    Extract technical skills from resume text.

    Args:
        text: Plain text extracted from a resume

    Returns:
        Deduplicated list of technical skill strings
        e.g. ["React", "Node.js", "Docker", "AWS", "PostgreSQL"]
    """
    prompt = get_skill_extraction_prompt(text)

    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
        response_format={"type": "json_object"},
    )

    content = response.choices[0].message.content
    data = json.loads(content)

    skills = data.get("skills", [])
    if not isinstance(skills, list):
        return []

    # Deduplicate while preserving order, strip whitespace
    seen = set()
    clean = []
    for s in skills:
        normalized = s.strip()
        if normalized and normalized.lower() not in seen:
            seen.add(normalized.lower())
            clean.append(normalized)

    return clean



async def extract_projects(text: str) -> list[dict]:
    """
    Extract projects from resume text.

    Args:
        text: Plain text extracted from a resume

    Returns:
        List of project objects:
        [
          {
            "name": "Project Name",
            "description": "Short description",
            "technologies": ["React", "Node.js"]
          }
        ]
    """
    prompt = get_project_extraction_prompt(text)

    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
        response_format={"type": "json_object"},
    )

    content = response.choices[0].message.content
    data = json.loads(content)

    projects = data.get("projects", [])
    if not isinstance(projects, list):
        return []

    # Deduplicate based on project name, clean fields
    seen = set()
    clean_projects = []

    for proj in projects:
        if not isinstance(proj, dict):
            continue

        name = proj.get("name", "").strip()
        description = proj.get("description", "").strip()
        technologies = proj.get("technologies", [])

        if not name:
            continue

        key = name.lower()
        if key in seen:
            continue

        seen.add(key)

        # Clean technologies list
        if isinstance(technologies, list):
            tech_clean = []
            tech_seen = set()
            for t in technologies:
                if isinstance(t, str):
                    t_norm = t.strip()
                    if t_norm and t_norm.lower() not in tech_seen:
                        tech_seen.add(t_norm.lower())
                        tech_clean.append(t_norm)
            technologies = tech_clean
        else:
            technologies = []

        clean_projects.append({
            "name": name,
            "description": description,
            "technologies": technologies
        })

    return clean_projects