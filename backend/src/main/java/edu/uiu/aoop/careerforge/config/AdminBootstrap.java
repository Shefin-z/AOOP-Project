package edu.uiu.aoop.careerforge.config;

import edu.uiu.aoop.careerforge.domain.Role;
import edu.uiu.aoop.careerforge.domain.User;
import edu.uiu.aoop.careerforge.repository.UserRepository;
import java.util.Locale;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** Creates the first private administrator only when all bootstrap values are supplied. */
@Component
public class AdminBootstrap implements ApplicationRunner {
  private final UserRepository users; private final PasswordEncoder passwords;
  private final String name,email,password;
  public AdminBootstrap(UserRepository users,PasswordEncoder passwords,@Value("${careerforge.admin.name:}") String name,@Value("${careerforge.admin.email:}") String email,@Value("${careerforge.admin.password:}") String password){this.users=users;this.passwords=passwords;this.name=name.trim();this.email=email.trim().toLowerCase(Locale.ROOT);this.password=password;}
  @Override @Transactional public void run(ApplicationArguments arguments) {
    if(name.isBlank()||email.isBlank()||password==null||password.length()<8||users.existsByEmailIgnoreCase(email)) return;
    users.save(new User(name,email,passwords.encode(password),Role.admin));
  }
}
