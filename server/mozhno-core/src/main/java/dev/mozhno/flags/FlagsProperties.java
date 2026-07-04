package dev.mozhno.flags;

import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/**
 * Configuration properties for feature flag limits and pagination.
 * Bound to the {@code mozhno.flags} prefix.
 */
@Getter
@Setter
@Validated
@ConfigurationProperties(prefix = "mozhno.flags")
public class FlagsProperties {

    /** Maximum number of tags allowed per flag. */
    @Positive
    private int maxTagsPerFlag = 10;

    /** Default page size when listing flags. */
    @Positive
    private int defaultPageSize = 50;

    /** Maximum page size for the standard flag listing endpoint. */
    @Positive
    private int maxPageSize = 200;

    /** Maximum page size for the enriched dashboard listing endpoint. */
    @Positive
    private int enrichedMaxPageSize = 500;
}
