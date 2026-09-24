package edu.uiu.aoop.careerforge.dto;

import java.util.List;

public record LearningQuizResponse(int levelNumber, String title, String summary, List<Question> questions) {
    public record Question(int index, String type, String prompt, String codeSnippet, List<String> options, String answerHint) { }
}
