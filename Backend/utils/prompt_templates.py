"""
Prompt templates for OpenAI API calls.
Centralizing prompts makes them easy to iterate and improve.
"""


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
