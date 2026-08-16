package edu.uiu.aoop.careerforge.web;
import edu.uiu.aoop.careerforge.security.AppPrincipal; import edu.uiu.aoop.careerforge.service.AuthService; import jakarta.validation.Valid; import jakarta.validation.constraints.*; import java.util.*; import org.springframework.beans.factory.annotation.Value; import org.springframework.http.*; import org.springframework.security.core.annotation.AuthenticationPrincipal; import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/auth") public class AuthController {
 private final AuthService auth; private final boolean registrationEnabled; public AuthController(AuthService auth,@Value("${careerforge.features.registration-enabled}") boolean registrationEnabled){this.auth=auth;this.registrationEnabled=registrationEnabled;}
 record Credentials(@NotBlank @Email String email,@NotBlank String password,String role){} record Registration(@NotBlank @Size(max=120) String name,@NotBlank @Email String email,@NotBlank @Size(min=8,max=128) String password){}
 @GetMapping("/config") Map<String,Object> config(){return Map.of("features",Map.of("registrationEnabled",registrationEnabled,"maintenanceMode",false,"coverLetterEnabled",true),"security",Map.of("minimumPasswordLength",8,"requireUppercase",false,"requireNumber",false));}
 @PostMapping("/register") ResponseEntity<?> register(@Valid @RequestBody Registration body){if(!registrationEnabled)throw new ApiException(HttpStatus.FORBIDDEN,"Student registration is currently disabled");return ResponseEntity.status(HttpStatus.CREATED).body(auth.register(body.name(),body.email(),body.password()));}
 @PostMapping("/login") Map<String,Object> login(@Valid @RequestBody Credentials body){return auth.login(body.email(),body.password(),body.role());}
 @GetMapping("/me") Map<String,Object> me(@AuthenticationPrincipal AppPrincipal p){return auth.profile(auth.require(p.id()));}
 @PatchMapping("/me") Map<String,Object> update(@AuthenticationPrincipal AppPrincipal p,@RequestBody Map<String,Object> body){return auth.updateProfile(p.id(),body);}
}
