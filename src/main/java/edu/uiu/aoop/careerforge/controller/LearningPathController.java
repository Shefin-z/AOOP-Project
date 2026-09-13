package edu.uiu.aoop.careerforge.controller;

import edu.uiu.aoop.careerforge.dto.LearningAttemptRequest;
import edu.uiu.aoop.careerforge.dto.LearningAttemptResponse;
import edu.uiu.aoop.careerforge.dto.LearningPathRequest;
import edu.uiu.aoop.careerforge.dto.LearningPathResponse;
import edu.uiu.aoop.careerforge.dto.LearningQuizResponse;
import edu.uiu.aoop.careerforge.dto.LearningRecommendationRequest;
import edu.uiu.aoop.careerforge.dto.LearningRecommendationResponse;
import edu.uiu.aoop.careerforge.service.LearningPathService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/learning-paths")
public class LearningPathController {
    private final LearningPathService learningPaths;
    public LearningPathController(LearningPathService learningPaths) { this.learningPaths = learningPaths; }
    @GetMapping public List<LearningPathResponse> list(@RequestHeader(name = "X-User-Id", required = false) Long userId) { return learningPaths.list(userId); }
    @PostMapping public LearningPathResponse create(@RequestHeader(name = "X-User-Id", required = false) Long userId, @Valid @RequestBody LearningPathRequest request) { return learningPaths.create(userId, request); }
    @DeleteMapping("/{pathId}") public void delete(@RequestHeader(name = "X-User-Id", required = false) Long userId, @PathVariable Long pathId) { learningPaths.delete(userId, pathId); }
    @PostMapping("/recommendation") public LearningRecommendationResponse recommend(@RequestHeader(name = "X-User-Id", required = false) Long userId, @Valid @RequestBody LearningRecommendationRequest request) { return learningPaths.recommend(userId, request.topic(), request.pathType()); }
    @GetMapping("/{pathId}") public LearningPathResponse get(@RequestHeader(name = "X-User-Id", required = false) Long userId, @PathVariable Long pathId) { return learningPaths.get(userId, pathId); }
    @GetMapping("/{pathId}/levels/{levelNumber}") public LearningQuizResponse quiz(@RequestHeader(name = "X-User-Id", required = false) Long userId, @PathVariable Long pathId, @PathVariable int levelNumber) { return learningPaths.quiz(userId, pathId, levelNumber); }
    @PostMapping("/{pathId}/levels/{levelNumber}/attempts") public LearningAttemptResponse submit(@RequestHeader(name = "X-User-Id", required = false) Long userId, @PathVariable Long pathId, @PathVariable int levelNumber, @Valid @RequestBody LearningAttemptRequest request) { return learningPaths.submit(userId, pathId, levelNumber, request); }
}
