package dev.mozhno.config;

import dev.mozhno.auth.User;
import dev.mozhno.auth.UserRepository;
import dev.mozhno.environments.Environment;
import dev.mozhno.environments.EnvironmentRepository;
import dev.mozhno.projects.Project;
import dev.mozhno.projects.ProjectRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
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
    private static final String DEFAULT_PROJECT_NAME = "My Project";

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final EnvironmentRepository environmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final org.springframework.core.env.Environment environment;

    public BootstrapRunner(UserRepository userRepository,
                           ProjectRepository projectRepository,
                           EnvironmentRepository environmentRepository,
                           PasswordEncoder passwordEncoder,
                           org.springframework.core.env.Environment environment) {
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.environmentRepository = environmentRepository;
        this.passwordEncoder = passwordEncoder;
        this.environment = environment;
    }

    @Override
    public void run(ApplicationArguments args) {
        Integer projectId = seedDefaultProject();
        seedAdminUser(projectId);
    }

    private void seedAdminUser(Integer projectId) {
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
        admin.setProjectId(projectId);
        userRepository.save(admin);
        log.warn(
            "Bootstrapped initial admin user: {}. Change the password immediately after first login!",
            email);
    }

    private Integer seedDefaultProject() {
        if (projectRepository.count() > 0) {
            return projectRepository.findAll().getFirst().getId();
        }
        Project project = new Project();
        project.setName(DEFAULT_PROJECT_NAME);
        project.setDescription("Auto-created default project");
        Project saved = projectRepository.save(project);
        log.info("Bootstrapped default project: {}", DEFAULT_PROJECT_NAME);

        Environment prod = new Environment();
        prod.setName("Production");
        prod.setProjectId(saved.getId());
        prod.setDescription("Live environment");
        prod.setColor("#2d9484");
        environmentRepository.save(prod);

        Environment staging = new Environment();
        staging.setName("Staging");
        staging.setProjectId(saved.getId());
        staging.setDescription("Pre-production testing");
        staging.setColor("#e67e22");
        environmentRepository.save(staging);

        Environment dev = new Environment();
        dev.setName("Development");
        dev.setProjectId(saved.getId());
        dev.setDescription("Local and shared development");
        dev.setColor("#3498db");
        environmentRepository.save(dev);

        log.info("Bootstrapped default environments: Production, Staging, Development");
        return saved.getId();
    }
}
