package edu.uiu.aoop.careerforge.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "learning_levels")
public class LearningLevel {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "path_id", nullable = false) private LearningPath path;
    @Column(name = "level_number", nullable = false) private int levelNumber;
    @Column(columnDefinition = "TEXT") private String questionSet;
    protected LearningLevel() { }
    public LearningLevel(LearningPath path, int levelNumber) { this.path = path; this.levelNumber = levelNumber; }
    public Long getId() { return id; } public LearningPath getPath() { return path; } public int getLevelNumber() { return levelNumber; } public String getQuestionSet() { return questionSet; }
    public void setQuestionSet(String questionSet) { this.questionSet = questionSet; }
}
