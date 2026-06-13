package dev.mozhno.contexts;

import lombok.Builder;
import java.time.Instant;

@Builder
public record ContextValueResponse(
    Integer id,
    Integer contextDefinitionId,
    String values,
    Instant createdAt
) {}
