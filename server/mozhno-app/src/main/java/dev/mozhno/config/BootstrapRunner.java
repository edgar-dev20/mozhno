package dev.mozhno.config;

import dev.mozhno.auth.User;
import dev.mozhno.auth.UserRepository;
import dev.mozhno.projects.Project;
import dev.mozhno.projects.ProjectRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds a default admin user and default project on first launch,
 * using credentials from Spring environment / configuration properties.
 *
 * <p>Set {@code MOZHNO_INIT_EMAIL} and {@code MOZHNO_INIT_PASSWORD}. If both are set
 * and the database has no users, a bootstrap admin is created.
 * If they are not set, no user is created — the database must be seeded
 * by other means (e.g. a future setup wizard).</p>
 */
@Component
public class BootstrapRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(BootstrapRunner.class);
    private static final String DEFAULT_PROJECT_NAME = "Default Project";

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final PasswordEncoder passwordEncoder;
    private final Environment environment;

    public BootstrapRunner(UserRepository userRepository,
                           ProjectRepository projectRepository,
                           PasswordEncoder passwordEncoder,
                           Environment environment) {
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.passwordEncoder = passwordEncoder;
        this.environment = environment;
    }

    @Override
    public void run(ApplicationArguments args) {
        seedDefaultProject();
        seedAdminUser();
    }

    private void seedAdminUser() {
        if (userRepository.count() > 0) {
            return;
        }
        String email = environment.getProperty("MOZHNO_INIT_EMAIL");
        String password = environment.getProperty("MOZHNO_INIT_PASSWORD");
        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            log.warn("No bootstrap admin created: set MOZHNO_INIT_EMAIL and MOZHNO_INIT_PASSWORD to seed initial user");
            return;
        }
        User admin = new User();
        admin.setEmail(email);
        admin.setPasswordHash(passwordEncoder.encode(password));
        admin.setName(email.contains("@") ? email.substring(0, email.indexOf('@')) : email);
        admin.setRole("admin");
        admin.setStatus("active");
        admin.setLocale("en");
        userRepository.save(admin);
        log.warn(
            "Bootstrapped initial admin user: {}. Change the password immediately after first login!",
            email);
    }

    private void seedDefaultProject() {
        if (projectRepository.count() > 0) {
            return;
        }
        Project project = new Project();
        project.setName(DEFAULT_PROJECT_NAME);
        project.setDescription("Auto-created default project");
        projectRepository.save(project);
        log.info("Bootstrapped default project: {}", DEFAULT_PROJECT_NAME);
    }
}
