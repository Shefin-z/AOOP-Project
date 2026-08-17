package edu.uiu.aoop.careerforge.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/** Lightweight fixed-window guard for credential attempts. */
@Component
public class LoginRateLimitFilter extends OncePerRequestFilter {
  private static final int LIMIT = 10;
  private static final Duration WINDOW = Duration.ofMinutes(15);
  private final ConcurrentHashMap<String, Window> attempts = new ConcurrentHashMap<>();

  @Override protected boolean shouldNotFilter(HttpServletRequest request) { return !("POST".equalsIgnoreCase(request.getMethod()) && "/auth/login".equals(request.getServletPath())); }
  @Override protected void doFilterInternal(HttpServletRequest request,HttpServletResponse response,FilterChain chain) throws ServletException, IOException {
    String key=request.getRemoteAddr(); Instant now=Instant.now(); Window window=attempts.compute(key,(ignored,current)->current==null||current.started().plus(WINDOW).isBefore(now)?new Window(now,1):new Window(current.started(),current.count()+1));
    if(window.count()>LIMIT){long retry=Math.max(1,Duration.between(now,window.started().plus(WINDOW)).toSeconds());response.setStatus(429);response.setContentType(MediaType.APPLICATION_JSON_VALUE);response.setHeader("Retry-After",String.valueOf(retry));response.getWriter().write("{\"error\":\"Too many sign-in attempts. Try again shortly.\",\"retryAfterSeconds\":"+retry+"}");return;} chain.doFilter(request,response);
  }
  private record Window(Instant started,int count) {}
}
