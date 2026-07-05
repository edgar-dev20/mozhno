package dev.mozhno.architecture;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Architecture guardrail: the server persists via Spring {@code JdbcTemplate} + raw SQL,
 * never JPA/Hibernate or Spring Data. This test fails if any forbidden persistence API leaks
 * into the server main sources. See {@code server/SKILL.md}.
 *
 * <p>Pure filesystem scan — no Spring context, no Testcontainers/Docker required.</p>
 */
class NoJpaUsageTest {

    private static final List<String> FORBIDDEN = List.of(
        "jakarta.persistence",
        "javax.persistence",
        "org.springframework.data.jpa",
        "JpaRepository"
    );

    @Test
    void serverMainSourcesDoNotUseJpaOrSpringData() throws IOException {
        // Gradle runs tests with the module dir as CWD (server/mozhno-core); scan all modules.
        Path serverRoot = Paths.get("").toAbsolutePath().getParent();
        List<String> violations = new ArrayList<>();

        try (Stream<Path> paths = Files.walk(serverRoot)) {
            List<Path> javaMainFiles = paths
                .filter(Files::isRegularFile)
                .filter(p -> p.toString().endsWith(".java"))
                .filter(p -> p.toString().replace('\\', '/').contains("/src/main/java/"))
                .toList();

            for (Path file : javaMainFiles) {
                String content = Files.readString(file);
                for (String token : FORBIDDEN) {
                    if (content.contains(token)) {
                        violations.add(file + "  ->  " + token);
                    }
                }
            }
        }

        assertTrue(violations.isEmpty(),
            "JPA/Hibernate/Spring Data is forbidden — use Spring JdbcTemplate + raw SQL (see server/SKILL.md). Found:\n"
                + String.join("\n", violations));
    }
}
