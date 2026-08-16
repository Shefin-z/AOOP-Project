package edu.uiu.aoop.careerforge.security;

import edu.uiu.aoop.careerforge.domain.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
  private final String secret; private final long expirationMinutes;
  public JwtService(@Value("${careerforge.jwt.secret}") String secret, @Value("${careerforge.jwt.expiration-minutes}") long expirationMinutes) { this.secret = secret; this.expirationMinutes = expirationMinutes; }
  private Key key() { return Keys.hmacShaKeyFor((secret + "00000000000000000000000000000000").substring(0, 32).getBytes(StandardCharsets.UTF_8)); }
  public String issue(User user) { Instant now=Instant.now(); return Jwts.builder().subject(user.getId().toString()).claim("role",user.getRole().name()).claim("name",user.getName()).issuedAt(Date.from(now)).expiration(Date.from(now.plus(expirationMinutes, ChronoUnit.MINUTES))).signWith(key()).compact(); }
  public AppPrincipal parse(String token) { var claims=Jwts.parser().verifyWith((javax.crypto.SecretKey) key()).build().parseSignedClaims(token).getPayload(); return new AppPrincipal(Long.valueOf(claims.getSubject()), claims.getSubject(), edu.uiu.aoop.careerforge.domain.Role.valueOf(claims.get("role",String.class)), claims.get("name",String.class)); }
}
