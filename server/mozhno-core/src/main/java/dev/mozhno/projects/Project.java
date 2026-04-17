package dev.mozhno.projects;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.Instant;

/**
 * Top-level organizational unit. Contains flags, environments, segments, and settings.
 */
@Getter
@Setter
@NoArgsConstructor
public class Project {
    /** Unique identifier. */
    private Integer id;
    /** Project name. */
    private String name;
    /** Optional description. */
    private String description;
    /** Logo image filename stored on disk. */
    private String logo;
    /** Logo image binary data stored in DB. */
    private byte[] logoData;
    /** When the project was created. */
    private Instant createdAt;
}
